/**
 * Hierarchical Design Token Build Script
 * 
 * Builds design tokens for all 4 themes:
 * - classic-light
 * - classic-dark
 * - advance-light
 * - advance-dark
 * 
 * Generates outputs for Web (CSS), Android (XML), and iOS (Swift)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TOKENS_DIR = './tokens';
const BUILD_DIR = './build';
const THEMES = ['classic-light', 'classic-dark', 'advance-light', 'advance-dark'];

// Ensure build directories exist
['web', 'android', 'ios'].forEach(platform => {
  const dir = path.join(BUILD_DIR, platform);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Recursively load all JSON files from a directory
 */
function loadJsonFiles(dir) {
  let tokens = {};
  
  if (!fs.existsSync(dir)) return tokens;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      const subTokens = loadJsonFiles(fullPath);
      tokens = deepMerge(tokens, subTokens);
    } else if (item.name.endsWith('.json')) {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      tokens = deepMerge(tokens, content);
    }
  }
  
  return tokens;
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (source[key].value !== undefined) {
        // This is a token (has value property)
        result[key] = source[key];
      } else {
        // This is a nested object
        result[key] = deepMerge(result[key] || {}, source[key]);
      }
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Load tokens for a specific theme
 */
function loadThemeTokens(theme) {
  // Load shared tokens
  const rawColors = loadJsonFiles(path.join(TOKENS_DIR, 'color'));
  const spacing = loadJsonFiles(path.join(TOKENS_DIR, 'foundation'));
  const components = loadJsonFiles(path.join(TOKENS_DIR, 'components'));
  
  // Start with raw colors and spacing
  let tokens = deepMerge({}, rawColors);
  
  // Load spacing (but not theme files)
  const spacingFile = path.join(TOKENS_DIR, 'foundation', 'spacing.json');
  if (fs.existsSync(spacingFile)) {
    const spacingTokens = JSON.parse(fs.readFileSync(spacingFile, 'utf8'));
    tokens = deepMerge(tokens, spacingTokens);
  }
  
  // Load theme-specific tokens
  const themeFile = path.join(TOKENS_DIR, 'foundation', `theme-${theme}.json`);
  if (fs.existsSync(themeFile)) {
    const themeTokens = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
    tokens = deepMerge(tokens, themeTokens);
  }
  
  // Load component tokens
  tokens = deepMerge(tokens, components);
  
  return tokens;
}

/**
 * Flatten nested tokens into a flat map with dot-notation keys
 */
function flattenTokens(obj, prefix = '') {
  const result = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (value && typeof value === 'object') {
      if (value.value !== undefined) {
        // This is a token
        result[newKey] = value;
      } else {
        // This is a nested object
        Object.assign(result, flattenTokens(value, newKey));
      }
    }
  }
  
  return result;
}

/**
 * Resolve token references like {color.rawColors.blue.500} to final values
 */
function resolveReference(value, flatTokens, seen = new Set()) {
  if (typeof value !== 'string') return value;
  if (!value.includes('{')) return value;
  
  // Handle references like {color.rawColors.blue.500}
  return value.replace(/\{([^}]+)\}/g, (match, refPath) => {
    if (seen.has(refPath)) {
      console.warn(`Circular reference detected: ${refPath}`);
      return match;
    }
    
    const token = flatTokens[refPath];
    if (token && token.value !== undefined) {
      const newSeen = new Set(seen);
      newSeen.add(refPath);
      return resolveReference(token.value, flatTokens, newSeen);
    }
    
    // Return unresolved reference
    return match;
  });
}

/**
 * Convert token references to CSS variable references
 * e.g., {color.border.default} → var(--color-border-default)
 * Only converts the first level of reference (doesn't resolve the chain)
 */
function toCSSSyntax(value, flatTokens) {
  if (typeof value !== 'string') return value;
  if (!value.includes('{')) return value;
  
  return value.replace(/\{([^}]+)\}/g, (match, refPath) => {
    // Check if this reference exists
    const token = flatTokens[refPath];
    if (token) {
      // Convert to CSS var() syntax
      return `var(--${refPath.replace(/\./g, '-')})`;
    }
    // If reference doesn't exist, try to resolve it
    return resolveReference(match, flatTokens);
  });
}

/**
 * Resolve all token values
 */
function resolveTokens(flatTokens) {
  const resolved = {};
  
  for (const [key, token] of Object.entries(flatTokens)) {
    resolved[key] = {
      ...token,
      // CSS value preserves references as var()
      cssValue: toCSSSyntax(token.value, flatTokens),
      // Resolved value is the final computed value (for Android/iOS)
      resolvedValue: resolveReference(token.value, flatTokens)
    };
  }
  
  return resolved;
}

/**
 * Convert token path to CSS variable name
 */
function toCSSVarName(tokenPath) {
  return `--${tokenPath.replace(/\./g, '-')}`;
}

/**
 * Convert token path to Android resource name
 */
function toAndroidResourceName(tokenPath) {
  return tokenPath.replace(/\./g, '_');
}

/**
 * Convert token path to Swift property name
 */
function toSwiftPropertyName(tokenPath) {
  return tokenPath
    .split('.')
    .map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Check if value is a color
 */
function isColor(value) {
  if (typeof value !== 'string') return false;
  return value.startsWith('#') || value.startsWith('rgb') || value === 'transparent';
}

/**
 * Convert hex to Android ARGB format
 */
function hexToAndroidColor(hex) {
  if (hex === 'transparent') return '#00000000';
  if (!hex || typeof hex !== 'string') return null;
  
  if (hex.startsWith('#')) {
    const color = hex.slice(1).toUpperCase();
    if (color.length === 6) return `#FF${color}`;
    if (color.length === 8) return `#${color}`;
    return hex.toUpperCase();
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
  
  return null;
}

/**
 * Convert hex to iOS UIColor format
 */
function hexToUIColor(hex) {
  if (hex === 'transparent') {
    return 'UIColor.clear';
  }
  
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

/**
 * Generate CSS for a theme
 * Uses cssValue which preserves references as var() for component tokens
 */
function generateThemeCSS(resolvedTokens, theme, isDefault = false) {
  const lines = [];
  const selector = isDefault 
    ? `:root, [data-theme="${theme}"]`
    : `[data-theme="${theme}"]`;
  
  lines.push(`${selector} {`);
  
  // Sort by token path
  const sorted = Object.entries(resolvedTokens).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [path, token] of sorted) {
    // Use cssValue for CSS output (preserves var() references)
    const value = token.cssValue;
    if (value && typeof value === 'string') {
      lines.push(`  ${toCSSVarName(path)}: ${value};`);
    }
  }
  
  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate Android colors.xml for a theme
 */
function generateAndroidColors(resolvedTokens, theme) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('');
  lines.push('<!--');
  lines.push(`  Design Tokens - ${theme} theme`);
  lines.push(`  Generated on ${new Date().toUTCString()}`);
  lines.push('-->');
  lines.push('<resources>');
  
  const sorted = Object.entries(resolvedTokens).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [path, token] of sorted) {
    const value = token.resolvedValue;
    if (isColor(value)) {
      const androidColor = hexToAndroidColor(value);
      if (androidColor) {
        const resourceName = toAndroidResourceName(path);
        lines.push(`  <color name="${resourceName}">${androidColor}</color>`);
      }
    }
  }
  
  lines.push('</resources>');
  return lines.join('\n');
}

/**
 * Generate Android dimens.xml (shared across themes)
 */
function generateAndroidDimens(resolvedTokens) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('');
  lines.push('<!--');
  lines.push('  Design Tokens - Dimensions');
  lines.push(`  Generated on ${new Date().toUTCString()}`);
  lines.push('-->');
  lines.push('<resources>');
  
  const sorted = Object.entries(resolvedTokens).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [path, token] of sorted) {
    const value = token.resolvedValue;
    if (typeof value === 'string' && value.endsWith('px')) {
      const resourceName = toAndroidResourceName(path);
      const dpValue = value.replace('px', 'dp');
      lines.push(`  <dimen name="${resourceName}">${dpValue}</dimen>`);
    }
  }
  
  lines.push('</resources>');
  return lines.join('\n');
}

/**
 * Generate Android font dimens (shared across themes)
 */
function generateAndroidFontDimens(resolvedTokens) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('');
  lines.push('<!--');
  lines.push('  Design Tokens - Font Dimensions');
  lines.push(`  Generated on ${new Date().toUTCString()}`);
  lines.push('-->');
  lines.push('<resources>');
  
  const sorted = Object.entries(resolvedTokens).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [path, token] of sorted) {
    const value = token.resolvedValue;
    if (path.includes('fontSize') && typeof value === 'string' && value.endsWith('px')) {
      const resourceName = toAndroidResourceName(path);
      const spValue = value.replace('px', 'sp');
      lines.push(`  <dimen name="${resourceName}">${spValue}</dimen>`);
    }
  }
  
  lines.push('</resources>');
  return lines.join('\n');
}

/**
 * Generate iOS Swift file for a theme
 */
function generateSwiftColors(resolvedTokens, theme) {
  const className = `StyleDictionaryColor${theme.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}`;
  const lines = [];
  
  lines.push('//');
  lines.push(`// ${className}.swift`);
  lines.push('//');
  lines.push('');
  lines.push('// Design Tokens - Color definitions');
  lines.push(`// Theme: ${theme}`);
  lines.push(`// Generated on ${new Date().toUTCString()}`);
  lines.push('');
  lines.push('import UIKit');
  lines.push('');
  lines.push(`public class ${className} {`);
  
  const sorted = Object.entries(resolvedTokens).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [path, token] of sorted) {
    const value = token.resolvedValue;
    if (isColor(value)) {
      const uiColor = hexToUIColor(value);
      if (uiColor) {
        const propertyName = toSwiftPropertyName(path);
        lines.push(`    public static let ${propertyName} = ${uiColor}`);
      }
    }
  }
  
  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate shared iOS Swift file
 */
function generateSwiftShared(resolvedTokens) {
  const lines = [];
  
  lines.push('//');
  lines.push('// StyleDictionary.swift');
  lines.push('//');
  lines.push('');
  lines.push('// Design Tokens - Shared values');
  lines.push(`// Generated on ${new Date().toUTCString()}`);
  lines.push('');
  lines.push('import CoreGraphics');
  lines.push('');
  lines.push('public class StyleDictionary {');
  
  const sorted = Object.entries(resolvedTokens).sort(([a], [b]) => a.localeCompare(b));
  
  // Dimensions
  for (const [path, token] of sorted) {
    const value = token.resolvedValue;
    if (typeof value === 'string' && value.endsWith('px') && !path.includes('fontSize')) {
      const propertyName = toSwiftPropertyName(path);
      const numValue = parseFloat(value);
      lines.push(`    public static let ${propertyName}: CGFloat = ${numValue}`);
    }
  }
  
  lines.push('}');
  return lines.join('\n');
}

/**
 * Main build function
 */
function build() {
  console.log('🎨 Building Hierarchical Design Tokens...\n');
  console.log(`📦 Themes: ${THEMES.join(', ')}\n`);
  
  // Build each theme
  const themeOutputs = {};
  
  for (const theme of THEMES) {
    console.log(`\n🔧 Processing ${theme}...`);
    
    const tokens = loadThemeTokens(theme);
    const flatTokens = flattenTokens(tokens);
    const resolvedTokens = resolveTokens(flatTokens);
    
    themeOutputs[theme] = resolvedTokens;
    
    console.log(`   Found ${Object.keys(resolvedTokens).length} tokens`);
  }
  
  // Generate Web CSS
  console.log('\n📄 Generating Web (CSS)...');
  const cssLines = [];
  
  cssLines.push(`/**
 * Design Tokens
 * Generated on ${new Date().toUTCString()}
 * 
 * Themes: ${THEMES.join(', ')}
 */
`);
  
  THEMES.forEach((theme, index) => {
    const isDefault = index === 0; // classic-light is default
    cssLines.push(generateThemeCSS(themeOutputs[theme], theme, isDefault));
    cssLines.push('');
  });
  
  fs.writeFileSync(path.join(BUILD_DIR, 'web', 'tokens.css'), cssLines.join('\n'), 'utf8');
  console.log('  ✓ build/web/tokens.css');
  
  // Generate JSON
  const jsonOutput = {};
  for (const theme of THEMES) {
    jsonOutput[theme] = {};
    for (const [path, token] of Object.entries(themeOutputs[theme])) {
      jsonOutput[theme][path] = {
        value: token.value,
        resolvedValue: token.resolvedValue
      };
    }
  }
  fs.writeFileSync(path.join(BUILD_DIR, 'web', 'tokens.json'), JSON.stringify(jsonOutput, null, 2), 'utf8');
  console.log('  ✓ build/web/tokens.json');
  
  // Generate Android files
  console.log('\n📱 Generating Android (XML)...');
  
  THEMES.forEach(theme => {
    const filename = theme === 'classic-light' ? 'colors.xml' : `colors-${theme}.xml`;
    fs.writeFileSync(
      path.join(BUILD_DIR, 'android', filename),
      generateAndroidColors(themeOutputs[theme], theme),
      'utf8'
    );
    console.log(`  ✓ build/android/${filename}`);
  });
  
  // Generate shared dimens (from classic-light as base)
  fs.writeFileSync(
    path.join(BUILD_DIR, 'android', 'dimens.xml'),
    generateAndroidDimens(themeOutputs['classic-light']),
    'utf8'
  );
  console.log('  ✓ build/android/dimens.xml');
  
  fs.writeFileSync(
    path.join(BUILD_DIR, 'android', 'font_dimens.xml'),
    generateAndroidFontDimens(themeOutputs['classic-light']),
    'utf8'
  );
  console.log('  ✓ build/android/font_dimens.xml');
  
  // Generate iOS files
  console.log('\n🍎 Generating iOS (Swift)...');
  
  THEMES.forEach(theme => {
    const className = `StyleDictionaryColor${theme.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}`;
    fs.writeFileSync(
      path.join(BUILD_DIR, 'ios', `${className}.swift`),
      generateSwiftColors(themeOutputs[theme], theme),
      'utf8'
    );
    console.log(`  ✓ build/ios/${className}.swift`);
  });
  
  fs.writeFileSync(
    path.join(BUILD_DIR, 'ios', 'StyleDictionary.swift'),
    generateSwiftShared(themeOutputs['classic-light']),
    'utf8'
  );
  console.log('  ✓ build/ios/StyleDictionary.swift');
  
  console.log('\n✅ Build complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Themes built: ${THEMES.length}`);
  console.log(`   Tokens per theme: ~${Object.keys(themeOutputs['classic-light']).length}`);
}

// Run build
build();
