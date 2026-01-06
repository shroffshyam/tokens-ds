const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build/web');
const outputFile = path.join(buildDir, 'tokens.css');

// Read the separate theme files
const files = [
  { name: 'tokens-classic-light.css', theme: 'classic-light', isDefault: true },
  { name: 'tokens-classic-dark.css', theme: 'classic-dark', isDefault: false },
  { name: 'tokens-advance-light.css', theme: 'advance-light', isDefault: false },
  { name: 'tokens-advance-dark.css', theme: 'advance-dark', isDefault: false }
];

let combined = [];
let rawColors = '';
let components = '';

// Header
combined.push('/**');
combined.push(' * Do not edit directly');
combined.push(' * Generated on ' + new Date().toUTCString());
combined.push(' * Following Adobe Spectrum Design Token Standards');
combined.push(' * https://spectrum.adobe.com/page/design-tokens/');
combined.push(' *');
combined.push(' * Theme Support: Use data-theme="classic-light", "classic-dark", "advance-light", "advance-dark" on html/body');
combined.push(' * Architecture: Semantic tokens with theme overrides');
combined.push(' * Default theme is classic-light. Classic=Traditional, Advance=Modern design approaches');
combined.push(' */');
combined.push('');

// Process each theme file
files.forEach((fileInfo, index) => {
  const filePath = path.join(buildDir, fileInfo.name);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${fileInfo.name} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract raw colors from classic-light (first file)
  if (index === 0 && content.includes(':root {')) {
    const rawColorsMatch = content.match(/:root \{([\s\S]*?)\}/);
    if (rawColorsMatch) {
      rawColors = rawColorsMatch[1].trim();
    }
  }
  
  // Extract theme-specific content (everything after the header comment)
  // Look for the theme selector and extract all content until the closing brace
  const themeSelectorPattern = new RegExp(`\\[data-theme="${fileInfo.theme}"\\][\\s\\S]*?\\n\\}`, 'g');
  const themeMatch = content.match(themeSelectorPattern);
  
  if (themeMatch) {
    let themeContent = themeMatch[0];
    
    // For classic-light, also add :root selector
    if (fileInfo.isDefault) {
      themeContent = themeContent.replace(
        /\[data-theme="classic-light"\]/,
        '[data-theme="classic-light"],\n:root'
      );
    }
    
    // Add theme comment header
    const themeName = fileInfo.theme.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    combined.push(`[data-theme="${fileInfo.theme}"] {`);
    combined.push(`  /* ============================================`);
    combined.push(`   * Foundation Tokens - ${themeName} Theme`);
    combined.push(`   * ${fileInfo.theme.includes('classic') ? 'Traditional' : 'Modern'} design system tokens referencing raw colors`);
    combined.push(`   * ============================================ */`);
    combined.push(``);
    
    // Extract the actual CSS variables (content between braces)
    const varsMatch = themeContent.match(/\{([\s\S]*)\}/);
    if (varsMatch) {
      const variables = varsMatch[1].trim();
      if (variables) {
        // Ensure proper indentation (2 spaces)
        const indentedVars = variables.split('\n').map(line => {
          // Remove existing indentation and add 2 spaces
          const trimmed = line.trim();
          return trimmed ? '  ' + trimmed : '';
        }).join('\n');
        combined.push(indentedVars);
      }
    }
    
    combined.push(``);
    combined.push(`}`);
    combined.push(``);
  } else {
    // Fallback: try to extract content differently
    const fallbackMatch = content.match(/\{([\s\S]*)\}/);
    if (fallbackMatch && fallbackMatch[1].trim()) {
      combined.push(`[data-theme="${fileInfo.theme}"] {`);
      if (fileInfo.isDefault) {
        combined[combined.length - 1] = '[data-theme="classic-light"],\n:root {';
      }
      combined.push(`  /* Foundation Tokens - ${fileInfo.theme} */`);
      combined.push(``);
      // Ensure proper indentation
      const indentedVars = fallbackMatch[1].trim().split('\n').map(line => {
        const trimmed = line.trim();
        return trimmed ? '  ' + trimmed : '';
      }).join('\n');
      combined.push(indentedVars);
      combined.push(``);
      combined.push(`}`);
      combined.push(``);
    }
  }
});

// Add raw colors at the beginning
if (rawColors) {
  combined.unshift(':root {');
  combined.unshift('  /* ============================================');
  combined.unshift('   * Raw Colors');
  combined.unshift('   * Base color definitions - all colors in the system');
  combined.unshift('   * ============================================ */');
  combined.unshift('');
  combined.unshift('');
  combined.unshift('}');
  combined.unshift('');
  
  // Insert raw colors content
  const rawColorsLines = rawColors.split('\n').map(line => '  ' + line);
  combined.splice(7, 0, ...rawColorsLines);
}

// Write combined file
fs.writeFileSync(outputFile, combined.join('\n'), 'utf8');
console.log('✓ Combined CSS themes into tokens.css');

// Clean up individual theme files (comment out to debug)
files.forEach(fileInfo => {
  const filePath = path.join(buildDir, fileInfo.name);
  if (fs.existsSync(filePath)) {
    // Keep files for now to debug - uncomment to delete
    // fs.unlinkSync(filePath);
  }
});

