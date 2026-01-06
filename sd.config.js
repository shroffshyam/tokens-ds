const StyleDictionary = require('style-dictionary');

// Helper function to get theme name from file path
function getThemeFromPath(filePath) {
  if (!filePath) return null;
  if (filePath.includes('theme-classic-light')) return 'classic-light';
  if (filePath.includes('theme-classic-dark')) return 'classic-dark';
  if (filePath.includes('theme-advance-light')) return 'advance-light';
  if (filePath.includes('theme-advance-dark')) return 'advance-dark';
  return null;
}

// Custom transform to add theme metadata to tokens
// Attribute transforms are applied automatically to all tokens
StyleDictionary.registerTransform({
  name: 'attribute/theme',
  type: 'attribute',
  transformer: function(token) {
    const theme = getThemeFromPath(token.filePath);
    return {
      theme: theme
    };
  }
});

// Custom formatter for hierarchical CSS variables with theme support
StyleDictionary.registerFormat({
  name: 'css/variables-hierarchical',
  formatter: function({ dictionary, options }) {
    const tokens = dictionary.allTokens;
    const targetTheme = options?.theme; // If processing a single theme
    const output = [];
    
    // Build a map of token paths to CSS variable names for reference resolution
    const tokenMap = new Map();
    tokens.forEach(token => {
      const path = token.path.join('.');
      const prefix = token.path[0] === 'theme' ? 'color' : // theme tokens use color prefix
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

      // For semantic tokens, use the path as-is (no theme prefix removal needed)
      const pathWithoutTheme = token.path;

      const name = pathWithoutTheme.slice(1).join('-');
      tokenMap.set(path, `--${prefix}-${name}`);
    });

    // Helper function to check if a value should reference another token
    function getReferenceValue(token) {
      // Check if original value was a reference
      if (token.original && token.original.value) {
        const originalValue = token.original.value;
        if (typeof originalValue === 'string' && originalValue.startsWith('{') && originalValue.endsWith('}')) {
          const refPath = originalValue.slice(1, -1);
          const cssVar = tokenMap.get(refPath);
          if (cssVar) {
            return `var(${cssVar})`;
          }
        }
      }
      return token.value;
    }

    // Group tokens by hierarchy
    const rawColors = tokens.filter(token => 
      token.path[0] === 'color' && token.path[1] === 'rawColors'
    ).sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
    });

    // If processing a single theme, filter tokens from that theme only
    // Otherwise, process all themes (for combined output)
    let foundationTokens = tokens;
    if (targetTheme) {
      // Single theme mode: get all tokens from the current build (which only includes one theme)
      // Exclude raw colors and components - they're theme-agnostic
      foundationTokens = tokens.filter(token => {
        return !(token.path[0] === 'color' && token.path[1] === 'rawColors') &&
               !(token.path[0] === 'color' && token.path[1] === 'component') &&
               !(token.path[0] === 'size' && token.path[1] === 'component') &&
               !(token.path[0] === 'fontSize' && token.path[1] === 'component');
      });
    } else {
      // Multi-theme mode: filter by filePath (may not work due to merging)
      foundationTokens = tokens;
    }
    
    // Group by theme for multi-theme output, or use all tokens for single-theme
    const foundationClassicLight = targetTheme === 'classic-light' ? foundationTokens : 
      tokens.filter(token => {
        const filePath = token.filePath || token.original?.filePath;
        const theme = token.attributes?.theme || getThemeFromPath(filePath);
        return theme === 'classic-light';
      });

    const foundationClassicDark = targetTheme === 'classic-dark' ? foundationTokens :
      tokens.filter(token => {
        const filePath = token.filePath || token.original?.filePath;
        const theme = token.attributes?.theme || getThemeFromPath(filePath);
        return theme === 'classic-dark';
      });

    const foundationAdvanceLight = targetTheme === 'advance-light' ? foundationTokens :
      tokens.filter(token => {
        const filePath = token.filePath || token.original?.filePath;
        const theme = token.attributes?.theme || getThemeFromPath(filePath);
        return theme === 'advance-light';
      });

    const foundationAdvanceDark = targetTheme === 'advance-dark' ? foundationTokens :
      tokens.filter(token => {
        const filePath = token.filePath || token.original?.filePath;
        const theme = token.attributes?.theme || getThemeFromPath(filePath);
        return theme === 'advance-dark';
      });


    // Component tokens (theme-agnostic, will reference theme-specific foundation)
    const components = tokens.filter(token => 
      (token.path[0] === 'color' && token.path[1] === 'component') ||
      (token.path[0] === 'size' && token.path[1] === 'component') ||
      (token.path[0] === 'fontSize' && token.path[1] === 'component') ||
      (token.path[0] === 'fontWeight' && token.path[1] === 'component') ||
      (token.path[0] === 'lineHeight' && token.path[1] === 'component')
    ).sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
    });

    // Single theme mode: output only the theme-specific tokens
    if (targetTheme) {
      const themeSelector = targetTheme === 'classic-light' 
        ? '[data-theme="classic-light"],\n:root'
        : `[data-theme="${targetTheme}"]`;
      
      output.push('/**');
      output.push(' * Do not edit directly');
      output.push(' * Generated on ' + new Date().toUTCString());
      output.push(' * Theme: ' + targetTheme);
      output.push(' */');
      output.push('');
      output.push(`${themeSelector} {`);
      
      // Include foundation tokens (color, spacing, typography, etc.) but exclude raw colors and components
      const themeFoundationTokens = tokens.filter(token => {
        const isRawColor = token.path[0] === 'color' && token.path[1] === 'rawColors';
        const isComponent = token.path[0] === 'color' && token.path[1] === 'component' ||
                           token.path[0] === 'size' && token.path[1] === 'component' ||
                           token.path[0] === 'fontSize' && token.path[1] === 'component';
        return !isRawColor && !isComponent;
      });
      
      themeFoundationTokens.forEach(token => {
        let prefix = token.path[0] === 'theme' ? 'color' :
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

        let pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
          : token.path;

        if (token.path[0] === 'component') {
          prefix = 'color';
          pathWithoutTheme = ['color'].concat(token.path);
        }

        const name = pathWithoutTheme.slice(1).join('-');
        const value = getReferenceValue(token);
        const comment = token.comment ? ` /* ${token.comment} */` : '';
        output.push(`  --${prefix}-${name}: ${value};${comment}`);
      });
      
      output.push('');
      output.push('}');
      return output.join('\n');
    }
    
    // Multi-theme mode: output all themes (for combined file)
    output.push('/**');
    output.push(' * Do not edit directly');
    output.push(' * Generated on ' + new Date().toUTCString());
    output.push(' * Following Adobe Spectrum Design Token Standards');
    output.push(' * https://spectrum.adobe.com/page/design-tokens/');
    output.push(' *');
    output.push(' * Theme Support: Use data-theme="classic-light", "classic-dark", "advance-light", "advance-dark" on html/body');
    output.push(' * Architecture: Semantic tokens with theme overrides');
    output.push(' * Default theme is classic-light. Classic=Traditional, Advance=Modern design approaches');
    output.push(' */');
    output.push('');
    
    // Raw Colors (theme-agnostic)
    output.push(':root {');
    if (rawColors.length > 0) {
      output.push('  /* ============================================');
      output.push('   * Raw Colors');
      output.push('   * Base color definitions - all colors in the system');
      output.push('   * ============================================ */');
      output.push('');
      
      rawColors.forEach(token => {
        const name = token.path.slice(1).join('-');
        output.push(`  --color-${name}: ${token.value};`);
      });
      output.push('');
    }
    output.push('}');
    output.push('');

    // Classic Light Theme (default)
    if (foundationClassicLight.length > 0) {
      output.push('[data-theme="classic-light"],');
      output.push(':root {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Classic Light Theme (Default)');
      output.push('   * Core design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationClassicLight.forEach(token => {
        let prefix = token.path[0] === 'theme' ? 'color' :
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

        // For theme tokens: theme.classic.variant.light.* → foundation.*
        let pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
          : token.path;

        // Handle component overrides (they use 'component' prefix)
        if (token.path[0] === 'component') {
          prefix = 'color'; // Component overrides are color-related
          // For component overrides, treat as ['color', 'component', ...] for consistent naming
          pathWithoutTheme = ['color'].concat(token.path);
        }

        const name = pathWithoutTheme.slice(1).join('-');
        const value = getReferenceValue(token);
        const comment = token.comment ? ` /* ${token.comment} */` : '';
        output.push(`  --${prefix}-${name}: ${value};${comment}`);
      });
      output.push('');
      output.push('}');
      output.push('');
    }

    // Classic Dark Theme
    if (foundationClassicDark.length > 0) {
      output.push('[data-theme="classic-dark"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Classic Dark Theme');
      output.push('   * Core design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationClassicDark.forEach(token => {
        let prefix = token.path[0] === 'theme' ? 'color' :
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

        // For theme tokens: theme.classic.variant.dark.* → foundation.*
        let pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
          : token.path;

        // Handle component overrides (they use 'component' prefix)
        if (token.path[0] === 'component') {
          prefix = 'color'; // Component overrides are color-related
          // For component overrides, treat as ['color', 'component', ...] for consistent naming
          pathWithoutTheme = ['color'].concat(token.path);
        }

        const name = pathWithoutTheme.slice(1).join('-');
        const value = getReferenceValue(token);
        const comment = token.comment ? ` /* ${token.comment} */` : '';
        output.push(`  --${prefix}-${name}: ${value};${comment}`);
      });
      output.push('');
      output.push('}');
      output.push('');
    }

    // Advance Light Theme
    if (foundationAdvanceLight.length > 0) {
      output.push('[data-theme="advance-light"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Advance Light Theme');
      output.push('   * Modern design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationAdvanceLight.forEach(token => {
        let prefix = token.path[0] === 'theme' ? 'color' :
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

        // For theme tokens: theme.advance.variant.light.* → foundation.*
        let pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
          : token.path;

        // Handle component overrides (they use 'component' prefix)
        if (token.path[0] === 'component') {
          prefix = 'color'; // Component overrides are color-related
          // For component overrides, treat as ['color', 'component', ...] for consistent naming
          pathWithoutTheme = ['color'].concat(token.path);
        }

        const name = pathWithoutTheme.slice(1).join('-');
        const value = getReferenceValue(token);
        const comment = token.comment ? ` /* ${token.comment} */` : '';
        output.push(`  --${prefix}-${name}: ${value};${comment}`);
      });
      output.push('');
      output.push('}');
      output.push('');
    }

    // Advance Dark Theme
    if (foundationAdvanceDark.length > 0) {
      output.push('[data-theme="advance-dark"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Advance Dark Theme');
      output.push('   * Modern design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationAdvanceDark.forEach(token => {
        let prefix = token.path[0] === 'theme' ? 'color' :
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

        // For theme tokens: theme.advance.variant.dark.* → foundation.*
        let pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
          : token.path;

        // Handle component overrides (they use 'component' prefix)
        if (token.path[0] === 'component') {
          prefix = 'color'; // Component overrides are color-related
          // For component overrides, treat as ['color', 'component', ...] for consistent naming
          pathWithoutTheme = ['color'].concat(token.path);
        }

        const name = pathWithoutTheme.slice(1).join('-');
        const value = getReferenceValue(token);
        const comment = token.comment ? ` /* ${token.comment} */` : '';
        output.push(`  --${prefix}-${name}: ${value};${comment}`);
      });
      output.push('');
      output.push('}');
      output.push('');
    }


    // Component Tokens (theme-agnostic, reference theme-specific foundation)
    if (components.length > 0) {
      output.push(':root {');
      output.push('  /* ============================================');
      output.push('   * Component Tokens');
      output.push('   * Component-specific tokens referencing foundation tokens');
      output.push('   * These automatically adapt to the current theme');
      output.push('   * ============================================ */');
      output.push('');
      
      components.forEach(token => {
        const prefix = token.path[0] === 'color' ? 'color' : 
                       token.path[0] === 'size' ? 'size' :
                       token.path[0] === 'fontSize' ? 'font-size' :
                       token.path[0] === 'fontWeight' ? 'font-weight' :
                       token.path[0] === 'lineHeight' ? 'line-height' :
                       token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
        const name = token.path.slice(1).join('-');
        const value = getReferenceValue(token);
        output.push(`  --${prefix}-${name}: ${value};`);
      });
      output.push('');
      output.push('}');
    }

    return output.join('\n');
  }
});

// Custom Android formatter for theme-specific colors
StyleDictionary.registerFormat({
  name: 'android/colors-theme',
  formatter: function({ dictionary, options }) {
    const theme = options.theme || 'classic-light';
    // Since we're processing each theme separately, all tokens in this build are from the target theme
    // Filter for color tokens (excluding raw colors and components which are in separate files)
    const tokens = dictionary.allTokens.filter(token => {
      // Include color tokens from foundation (theme-specific)
      const isColor = token.attributes?.category === 'color' || 
                     (token.path[0] === 'color' && token.path[1] !== 'rawColors' && token.path[1] !== 'component');
      return isColor;
    });

    const output = [];
    output.push('<?xml version="1.0" encoding="UTF-8"?>');
    output.push('');
    output.push('<!--');
    output.push('  Do not edit directly');
    output.push('  Generated on ' + new Date().toUTCString());
    output.push('  Theme: ' + theme);
    output.push('-->');
    output.push('<resources>');
    
    tokens.forEach(token => {
      // Use transformed value if available (Style Dictionary transforms hex to Android format)
      let value = token.value;
      // Style Dictionary's android transform should have already converted the value
      // but if not, ensure it's in the right format
      if (typeof value === 'string' && value.startsWith('#')) {
        // Android expects #AARRGGBB or #RRGGBB format
        value = value;
      }
      
      const name = token.path.map(p => p.toLowerCase()).join('_');
      output.push(`  <color name="${name}">${value}</color>`);
    });
    
    output.push('');
    output.push('</resources>');
    return output.join('\n');
  }
});

// Custom iOS formatter for theme-specific colors
StyleDictionary.registerFormat({
  name: 'ios-swift/colors-theme',
  formatter: function({ dictionary, options }) {
    const theme = options.theme || 'classic-light';
    const className = options.className || 'StyleDictionaryColor';
    // Since we're processing each theme separately, all tokens in this build are from the target theme
    // Filter for color tokens (excluding raw colors and components which are in separate files)
    const tokens = dictionary.allTokens.filter(token => {
      // Include color tokens from foundation (theme-specific)
      const isColor = token.attributes?.category === 'color' || 
                     (token.path[0] === 'color' && token.path[1] !== 'rawColors' && token.path[1] !== 'component');
      return isColor;
    });

    const output = [];
    output.push('');
    output.push('//');
    output.push('// ' + className + '.swift');
    output.push('//');
    output.push('');
    output.push('// Do not edit directly');
    output.push('// Generated on ' + new Date().toUTCString());
    output.push('// Theme: ' + theme);
    output.push('');
    output.push('');
    output.push('import UIKit');
    output.push('');
    output.push(`public enum ${className} {`);
    
    tokens.forEach(token => {
      // Use Style Dictionary's transform to get the proper Swift UIColor format
      const transformedValue = dictionary.tokens[token.path.join('.')];
      let value = token.value;
      
      // If the token has been transformed, use the transformed value
      // Otherwise, try to convert hex/rgba to UIColor format
      if (typeof value === 'string') {
        if (value.startsWith('#')) {
          const hex = value.slice(1);
          const r = parseInt(hex.slice(0, 2), 16) / 255;
          const g = parseInt(hex.slice(2, 4), 16) / 255;
          const b = parseInt(hex.slice(4, 6), 16) / 255;
          const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
          value = `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a})`;
        } else if (value.startsWith('rgba')) {
          // Handle rgba() format
          const match = value.match(/rgba?\(([^)]+)\)/);
          if (match) {
            const parts = match[1].split(',').map(p => p.trim());
            const r = parseFloat(parts[0]) / 255;
            const g = parseFloat(parts[1]) / 255;
            const b = parseFloat(parts[2]) / 255;
            const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
            value = `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a})`;
          }
        }
      }
      
      // Convert path to camelCase property name
      const name = token.path.map((p, i) => 
        i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)
      ).join('');
      
      output.push(`    public static let ${name} = ${value}`);
    });
    
    output.push('}');
    return output.join('\n');
  }
});

module.exports = {
  // No global source - each platform specifies its own sources
  platforms: {
    'web-classic-light': {
      transformGroup: 'css',
      buildPath: 'build/web/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-classic-light.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'tokens-classic-light.css',
          format: 'css/variables-hierarchical',
          options: { theme: 'classic-light' }
        }
      ]
    },
    'web-classic-dark': {
      transformGroup: 'css',
      buildPath: 'build/web/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-classic-dark.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'tokens-classic-dark.css',
          format: 'css/variables-hierarchical',
          options: { theme: 'classic-dark' }
        }
      ]
    },
    'web-advance-light': {
      transformGroup: 'css',
      buildPath: 'build/web/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-advance-light.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'tokens-advance-light.css',
          format: 'css/variables-hierarchical',
          options: { theme: 'advance-light' }
        }
      ]
    },
    'web-advance-dark': {
      transformGroup: 'css',
      buildPath: 'build/web/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-advance-dark.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'tokens-advance-dark.css',
          format: 'css/variables-hierarchical',
          options: { theme: 'advance-dark' }
        }
      ]
    },
    web: {
      transformGroup: 'css',
      buildPath: 'build/web/',
      source: [
        'tokens/**/*.json'
      ],
      files: [
        {
          destination: 'tokens.json',
          format: 'json/nested'
        }
      ]
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      source: [
        'tokens/**/*.json'
      ],
      files: [
        {
          destination: 'StyleDictionary.swift',
          format: 'ios-swift/class.swift',
          className: 'StyleDictionary'
        }
      ]
    },
    'android-classic-light': {
      transformGroup: 'android',
      buildPath: 'build/android/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-classic-light.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'colors.xml',
          format: 'android/colors-theme',
          options: { theme: 'classic-light' }
        }
      ]
    },
    'android-classic-dark': {
      transformGroup: 'android',
      buildPath: 'build/android/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-classic-dark.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'colors-classic-dark.xml',
          format: 'android/colors-theme',
          options: { theme: 'classic-dark' }
        }
      ]
    },
    'android-advance-light': {
      transformGroup: 'android',
      buildPath: 'build/android/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-advance-light.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'colors-advance-light.xml',
          format: 'android/colors-theme',
          options: { theme: 'advance-light' }
        }
      ]
    },
    'android-advance-dark': {
      transformGroup: 'android',
      buildPath: 'build/android/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-advance-dark.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'colors-advance-dark.xml',
          format: 'android/colors-theme',
          options: { theme: 'advance-dark' }
        }
      ]
    },
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      source: [
        'tokens/**/*.json'
      ],
      files: [
        {
          destination: 'dimens.xml',
          format: 'android/dimens',
          filter: {
            attributes: {
              category: 'size'
            }
          }
        },
        {
          destination: 'font_dimens.xml',
          format: 'android/fontDimens',
          filter: {
            attributes: {
              category: 'fontSize'
            }
          }
        },
        {
          destination: 'strings.xml',
          format: 'android/strings',
          filter: {
            attributes: {
              category: 'content'
            }
          }
        }
      ]
    },
    'ios-classic-light': {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-classic-light.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'StyleDictionaryColor-ClassicLight.swift',
          format: 'ios-swift/colors-theme',
          className: 'StyleDictionaryColorClassicLight',
          options: { theme: 'classic-light' }
        }
      ]
    },
    'ios-classic-dark': {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-classic-dark.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'StyleDictionaryColor-ClassicDark.swift',
          format: 'ios-swift/colors-theme',
          className: 'StyleDictionaryColorClassicDark',
          options: { theme: 'classic-dark' }
        }
      ]
    },
    'ios-advance-light': {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-advance-light.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'StyleDictionaryColor-AdvanceLight.swift',
          format: 'ios-swift/colors-theme',
          className: 'StyleDictionaryColorAdvanceLight',
          options: { theme: 'advance-light' }
        }
      ]
    },
    'ios-advance-dark': {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      source: [
        'tokens/color/rawColors.json',
        'tokens/foundation/spacing.json',
        'tokens/foundation/theme-advance-dark.json',
        'tokens/components/**/*.json'
      ],
      files: [
        {
          destination: 'StyleDictionaryColor-AdvanceDark.swift',
          format: 'ios-swift/colors-theme',
          className: 'StyleDictionaryColorAdvanceDark',
          options: { theme: 'advance-dark' }
        }
      ]
    }
  }
};
