const StyleDictionary = require('style-dictionary');

// Custom formatter for hierarchical CSS variables with theme support
StyleDictionary.registerFormat({
  name: 'css/variables-hierarchical',
  formatter: function({ dictionary, options }) {
    const tokens = dictionary.allTokens;
    const output = [];
    
    // Build a map of token paths to CSS variable names for reference resolution
    const tokenMap = new Map();
    tokens.forEach(token => {
      const path = token.path.join('.');
      const prefix = token.path[0] === 'color' ? 'color' : 
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
      // Remove theme prefix (light/dark) from path for CSS variable name only if it's a color foundation token
      const pathWithoutTheme = (token.path[0] === 'color' && token.path[1] === 'foundation' && (token.path[2] === 'light' || token.path[2] === 'dark'))
        ? token.path.filter((p, i) => !(i === 2 && (p === 'light' || p === 'dark')))
        : token.path;
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

    // Separate foundation tokens by theme and non-theme
    const foundationLightColors = tokens.filter(token =>
      token.path[0] === 'color' && token.path[1] === 'foundation' && token.path[2] === 'light'
    );

    const foundationDarkColors = tokens.filter(token =>
      token.path[0] === 'color' && token.path[1] === 'foundation' && token.path[2] === 'dark'
    );

    const foundationCommon = tokens.filter(token =>
      (token.path[0] === 'size' && token.path[1] === 'spacing') ||
      (token.path[0] === 'fontSize' && token.path[1] === 'foundation') ||
      (token.path[0] === 'fontWeight' && token.path[1] === 'foundation') ||
      (token.path[0] === 'lineHeight' && token.path[1] === 'foundation') ||
      (token.path[0] === 'fontFamily' && token.path[1] === 'foundation')
    );

    const foundationLight = [...foundationLightColors, ...foundationCommon].sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
    });

    const foundationDark = foundationDarkColors.sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
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

    output.push('/**');
    output.push(' * Do not edit directly');
    output.push(' * Generated on ' + new Date().toUTCString());
    output.push(' * Following Adobe Spectrum Design Token Standards');
    output.push(' * https://spectrum.adobe.com/page/design-tokens/');
    output.push(' *');
    output.push(' * Theme Support: Use data-theme="light" or data-theme="dark" on html/body');
    output.push(' * Default theme is light. Add data-theme="dark" to enable dark theme.');
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

    // Light Theme Foundation Tokens (default)
    if (foundationLight.length > 0) {
      output.push('[data-theme="light"],');
      output.push(':root {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Light Theme (Default)');
      output.push('   * Core design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');
      
      foundationLight.forEach(token => {
        const prefix = token.path[0] === 'color' ? 'color' :
                       token.path[0] === 'size' ? 'size' :
                       token.path[0] === 'fontSize' ? 'font-size' :
                       token.path[0] === 'fontWeight' ? 'font-weight' :
                       token.path[0] === 'lineHeight' ? 'line-height' :
                       token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
        // Remove 'light' from path for CSS variable name only for color foundation tokens
        const pathWithoutTheme = (token.path[0] === 'color' && token.path[1] === 'foundation' && token.path[2] === 'light')
          ? token.path.filter((p, i) => !(i === 2 && p === 'light'))
          : token.path;
        const name = pathWithoutTheme.slice(1).join('-');
        const value = getReferenceValue(token);
        const comment = token.comment ? ` /* ${token.comment} */` : '';
        output.push(`  --${prefix}-${name}: ${value};${comment}`);
      });
      output.push('');
      output.push('}');
      output.push('');
    }

    // Dark Theme Foundation Tokens
    if (foundationDark.length > 0) {
      output.push('[data-theme="dark"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Dark Theme');
      output.push('   * Core design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');
      
      foundationDark.forEach(token => {
        const prefix = 'color';
        // Remove 'dark' from path for CSS variable name
        const pathWithoutTheme = token.path.filter((p, i) => !(i === 2 && p === 'dark'));
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

module.exports = {
  source: [
    'tokens/**/*.json',
    '!tokens/foundation/colors.json' // Exclude old non-theme colors.json
  ],
  platforms: {
    web: {
      transformGroup: 'css',
      buildPath: 'build/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables-hierarchical'
        },
        {
          destination: 'tokens.json',
          format: 'json/nested'
        }
      ]
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'StyleDictionary.swift',
          format: 'ios-swift/class.swift',
          className: 'StyleDictionary'
        },
        {
          destination: 'StyleDictionaryColor.swift',
          format: 'ios-swift/enum.swift',
          className: 'StyleDictionaryColor',
          filter: {
            attributes: {
              category: 'color'
            }
          }
        }
      ]
    },
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/colors',
          filter: {
            attributes: {
              category: 'color'
            }
          }
        },
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
    }
  }
};
