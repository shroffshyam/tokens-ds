const StyleDictionary = require('style-dictionary');
const fs = require('fs');
const path = require('path');

// Theme configurations
const themes = [
  { name: 'classic-light', themeFile: 'tokens/foundation/theme-classic-light.json', isDefault: true },
  { name: 'classic-dark', themeFile: 'tokens/foundation/theme-classic-dark.json', isDefault: false },
  { name: 'advance-light', themeFile: 'tokens/foundation/theme-advance-light.json', isDefault: false },
  { name: 'advance-dark', themeFile: 'tokens/foundation/theme-advance-dark.json', isDefault: false }
];

// Ensure build directories exist
['build/web', 'build/android', 'build/ios'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to convert hex to Android ARGB format
function hexToAndroidColor(hex) {
  if (!hex || typeof hex !== 'string') return hex;
  if (hex.startsWith('#')) {
    const color = hex.slice(1).toUpperCase();
    if (color.length === 6) return `#FF${color}`;
    if (color.length === 8) return `#${color}`;
    return hex;
  }
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(p => parseFloat(p.trim()));
      const r = Math.round(parts[0]).toString(16).padStart(2, '0');
      const g = Math.round(parts[1]).toString(16).padStart(2, '0');
      const b = Math.round(parts[2]).toString(16).padStart(2, '0');
      const a = parts.length > 3 ? Math.round(parts[3] * 255).toString(16).padStart(2, '0') : 'FF';
      return `#${a}${r}${g}${b}`.toUpperCase();
    }
  }
  return hex;
}

// Helper to convert hex to iOS UIColor format
function hexToUIColor(hex) {
  if (!hex || typeof hex !== 'string') return null;
  if (hex.startsWith('#')) {
    const color = hex.slice(1);
    const r = parseInt(color.slice(0, 2), 16) / 255;
    const g = parseInt(color.slice(2, 4), 16) / 255;
    const b = parseInt(color.slice(4, 6), 16) / 255;
    const a = color.length === 8 ? parseInt(color.slice(6, 8), 16) / 255 : 1;
    return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a.toFixed(3)})`;
  }
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(p => parseFloat(p.trim()));
      const r = parts[0] / 255;
      const g = parts[1] / 255;
      const b = parts[2] / 255;
      const a = parts.length > 3 ? parts[3] : 1;
      return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a.toFixed(3)})`;
    }
  }
  return null;
}

// Build CSS variables map for reference resolution
function buildCSSVarMap(tokens) {
  const map = new Map();
  tokens.forEach(token => {
    const tokenPath = token.path.join('.');
    const prefix = token.path[0] === 'color' ? 'color' :
                   token.path[0] === 'spacing' ? 'spacing' :
                   token.path[0] === 'typography' ? 'typography' :
                   token.path[0] === 'border' ? 'border' :
                   token.path[0] === 'shadow' ? 'shadow' : token.path[0];
    const name = token.path.slice(1).join('-');
    map.set(tokenPath, `--${prefix}-${name}`);
  });
  return map;
}

// Get CSS value with reference resolution
function getCSSValue(token, varMap) {
  if (token.original && token.original.value) {
    const originalValue = token.original.value;
    if (typeof originalValue === 'string' && originalValue.startsWith('{') && originalValue.endsWith('}')) {
      const refPath = originalValue.slice(1, -1);
      const cssVar = varMap.get(refPath);
      if (cssVar) {
        return `var(${cssVar})`;
      }
    }
  }
  return token.value;
}

// Flatten nested token object to array of tokens
function flattenTokens(obj, path = []) {
  let tokens = [];
  for (const key in obj) {
    if (obj[key] && obj[key].value !== undefined) {
      tokens.push({ 
        path: [...path, key], 
        value: obj[key].value, 
        original: obj[key].original || obj[key]
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      tokens = tokens.concat(flattenTokens(obj[key], [...path, key]));
    }
  }
  return tokens;
}

// Process each theme
const cssOutputs = [];
const androidOutputs = {};
const iosOutputs = {};

themes.forEach(theme => {
  console.log(`\nProcessing theme: ${theme.name}`);
  
  // Create Style Dictionary instance for this theme
  const SD = StyleDictionary.extend({
    source: [
      'tokens/color/rawColors.json',
      'tokens/foundation/spacing.json',
      theme.themeFile,
      'tokens/components/**/*.json'
    ],
    platforms: {
      temp: {
        transformGroup: 'css',
        buildPath: 'build/temp/',
        files: []
      }
    }
  });

  // Get all tokens for this theme - exportPlatform returns nested object, need to flatten
  const tokenDict = SD.exportPlatform('temp');
  const allTokens = flattenTokens(tokenDict);
  
  console.log(`  Found ${allTokens.length} tokens`);
  
  // Build CSS var map
  const varMap = buildCSSVarMap(allTokens);
  
  // Filter tokens by category
  const rawColors = allTokens.filter(t => t.path[0] === 'color' && t.path[1] === 'rawColors');
  const foundationTokens = allTokens.filter(t => {
    return !(t.path[0] === 'color' && t.path[1] === 'rawColors') &&
           !(t.path[0] === 'color' && t.path[1] === 'component') &&
           !(t.path[0] === 'spacing' && t.path[1] === 'component');
  });
  const componentTokens = allTokens.filter(t => 
    (t.path[0] === 'color' && t.path[1] === 'component') ||
    (t.path[0] === 'spacing' && t.path[1] === 'component')
  );
  const colorTokens = allTokens.filter(t => t.path[0] === 'color');
  
  console.log(`  Raw colors: ${rawColors.length}, Foundation: ${foundationTokens.length}, Components: ${componentTokens.length}`);

  // Generate CSS for this theme
  const cssLines = [];
  const selector = theme.isDefault ? '[data-theme="classic-light"],\n:root' : `[data-theme="${theme.name}"]`;
  
  cssLines.push(`${selector} {`);
  cssLines.push(`  /* ============================================`);
  cssLines.push(`   * ${theme.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Theme`);
  cssLines.push(`   * ============================================ */`);
  cssLines.push('');
  
  // Add raw colors (only for first/default theme)
  if (theme.isDefault) {
    rawColors.sort((a, b) => a.path.join('.').localeCompare(b.path.join('.'))).forEach(token => {
      const name = token.path.slice(1).join('-');
      cssLines.push(`  --color-${name}: ${token.value};`);
    });
    cssLines.push('');
  }
  
  // Add foundation tokens
  foundationTokens.sort((a, b) => a.path.join('.').localeCompare(b.path.join('.'))).forEach(token => {
    const prefix = token.path[0];
    const name = token.path.slice(1).join('-');
    const value = getCSSValue(token, varMap);
    cssLines.push(`  --${prefix}-${name}: ${value};`);
  });
  
  // Add component tokens (only for first/default theme since they reference foundation)
  if (theme.isDefault && componentTokens.length > 0) {
    cssLines.push('');
    cssLines.push('  /* Component Tokens */');
    componentTokens.sort((a, b) => a.path.join('.').localeCompare(b.path.join('.'))).forEach(token => {
      const prefix = token.path[0];
      const name = token.path.slice(1).join('-');
      const value = getCSSValue(token, varMap);
      cssLines.push(`  --${prefix}-${name}: ${value};`);
    });
  }
  
  cssLines.push('}');
  cssLines.push('');
  
  cssOutputs.push(cssLines.join('\n'));

  // Generate Android colors.xml for this theme
  const androidLines = [];
  androidLines.push('<?xml version="1.0" encoding="UTF-8"?>');
  androidLines.push('');
  androidLines.push('<!--');
  androidLines.push('  Do not edit directly');
  androidLines.push(`  Generated on ${new Date().toUTCString()}`);
  androidLines.push(`  Theme: ${theme.name}`);
  androidLines.push('-->');
  androidLines.push('<resources>');
  
  colorTokens.forEach(token => {
    const name = token.path.join('_').toLowerCase().replace(/-/g, '_');
    const value = hexToAndroidColor(token.value);
    if (value && !value.includes('var(') && !value.includes('rgba')) {
      androidLines.push(`  <color name="${name}">${value}</color>`);
    }
  });
  
  androidLines.push('</resources>');
  androidOutputs[theme.name] = androidLines.join('\n');

  // Generate iOS Swift for this theme
  const iosLines = [];
  const className = 'StyleDictionaryColor' + theme.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  
  iosLines.push('//');
  iosLines.push(`// ${className}.swift`);
  iosLines.push('//');
  iosLines.push('');
  iosLines.push('// Do not edit directly');
  iosLines.push(`// Generated on ${new Date().toUTCString()}`);
  iosLines.push(`// Theme: ${theme.name}`);
  iosLines.push('');
  iosLines.push('import UIKit');
  iosLines.push('');
  iosLines.push(`public class ${className} {`);
  
  colorTokens.forEach(token => {
    const name = token.path.map((p, i) => i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)).join('');
    const value = hexToUIColor(token.value);
    if (value) {
      iosLines.push(`    public static let ${name} = ${value}`);
    }
  });
  
  iosLines.push('}');
  iosOutputs[theme.name] = iosLines.join('\n');
});

// Write combined CSS file
const cssHeader = `/**
 * Do not edit directly
 * Generated on ${new Date().toUTCString()}
 * 
 * Theme Support: Use data-theme="classic-light", "classic-dark", "advance-light", "advance-dark" on html/body
 * Default theme is classic-light
 */

`;

fs.writeFileSync('build/web/tokens.css', cssHeader + cssOutputs.join('\n'), 'utf8');
console.log('\n✓ Generated build/web/tokens.css');

// Write Android files
Object.entries(androidOutputs).forEach(([themeName, content]) => {
  const filename = themeName === 'classic-light' ? 'colors.xml' : `colors-${themeName}.xml`;
  fs.writeFileSync(`build/android/${filename}`, content, 'utf8');
  console.log(`✓ Generated build/android/${filename}`);
});

// Write iOS files
Object.entries(iosOutputs).forEach(([themeName, content]) => {
  const className = 'StyleDictionaryColor' + themeName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const filename = `${className}.swift`;
  fs.writeFileSync(`build/ios/${filename}`, content, 'utf8');
  console.log(`✓ Generated build/ios/${filename}`);
});

// Generate a combined JSON file
const SD = StyleDictionary.extend({
  source: ['tokens/**/*.json'],
  platforms: {
    json: {
      transformGroup: 'js',
      buildPath: 'build/web/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }]
    }
  }
});
SD.buildPlatform('json');
console.log('✓ Generated build/web/tokens.json');

console.log('\n✅ Build complete!');

