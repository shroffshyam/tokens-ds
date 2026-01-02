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
      const prefix = token.path[0] === 'theme' ? 'color' : // theme tokens use color prefix
                     token.path[0] === 'size' ? 'size' :
                     token.path[0] === 'fontSize' ? 'font-size' :
                     token.path[0] === 'fontWeight' ? 'font-weight' :
                     token.path[0] === 'lineHeight' ? 'line-height' :
                     token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];

      // Remove theme prefix from path for CSS variable name
      let pathWithoutTheme;
      if (token.path[0] === 'theme') {
        // Theme tokens: theme.{themeName}.variant.{variantName}.* → color.foundation.*
        pathWithoutTheme = ['color', 'foundation', ...token.path.slice(4)];
      } else {
        pathWithoutTheme = token.path;
      }

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

    // Separate foundation tokens by theme and variant
    // Theme-Variant structure: theme.{themeName}.variant.{variantName}.*
    const foundationClassicLight = tokens.filter(token =>
      token.path[0] === 'theme' && token.path[1] === 'classic' &&
      token.path[2] === 'variant' && token.path[3] === 'light'
    );

    const foundationClassicDark = tokens.filter(token =>
      token.path[0] === 'theme' && token.path[1] === 'classic' &&
      token.path[2] === 'variant' && token.path[3] === 'dark'
    );

    const foundationAdvanceLight = tokens.filter(token =>
      token.path[0] === 'theme' && token.path[1] === 'advance' &&
      token.path[2] === 'variant' && token.path[3] === 'light'
    );

    const foundationAdvanceDark = tokens.filter(token =>
      token.path[0] === 'theme' && token.path[1] === 'advance' &&
      token.path[2] === 'variant' && token.path[3] === 'dark'
    );

    // Common foundation tokens (spacing, typography - shared across themes)
    const foundationCommon = tokens.filter(token =>
      (token.path[0] === 'size' && token.path[1] === 'spacing') ||
      (token.path[0] === 'fontSize' && token.path[1] === 'foundation') ||
      (token.path[0] === 'fontWeight' && token.path[1] === 'foundation') ||
      (token.path[0] === 'lineHeight' && token.path[1] === 'foundation') ||
      (token.path[0] === 'fontFamily' && token.path[1] === 'foundation')
    );

    // Combine theme colors with common foundation tokens
    const foundationClassicLightCombined = [...foundationClassicLight, ...foundationCommon].sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
    });

    const foundationClassicDarkCombined = [...foundationClassicDark, ...foundationCommon].sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
    });

    const foundationAdvanceLightCombined = [...foundationAdvanceLight, ...foundationCommon].sort((a, b) => {
      const aPath = a.path.join('-');
      const bPath = b.path.join('-');
      return aPath.localeCompare(bPath);
    });

    const foundationAdvanceDarkCombined = [...foundationAdvanceDark, ...foundationCommon].sort((a, b) => {
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
    output.push(' * Theme Support: Use data-theme="classic-light", "classic-dark", "advance-light", "advance-dark" on html/body');
    output.push(' * Architecture: theme.{themeName}.variant.{variantName}.* structure');
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
    if (foundationClassicLightCombined.length > 0) {
      output.push('[data-theme="classic-light"],');
      output.push(':root {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Classic Light Theme (Default)');
      output.push('   * Core design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationClassicLightCombined.forEach(token => {
        const prefix = token.path[0] === 'theme' ? 'color' :
                       token.path[0] === 'size' ? 'size' :
                       token.path[0] === 'fontSize' ? 'font-size' :
                       token.path[0] === 'fontWeight' ? 'font-weight' :
                       token.path[0] === 'lineHeight' ? 'line-height' :
                       token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
        // For theme tokens: theme.classic.variant.light.* → foundation.*
        const pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
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

    // Classic Dark Theme
    if (foundationClassicDarkCombined.length > 0) {
      output.push('[data-theme="classic-dark"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Classic Dark Theme');
      output.push('   * Core design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationClassicDarkCombined.forEach(token => {
        const prefix = token.path[0] === 'theme' ? 'color' :
                       token.path[0] === 'size' ? 'size' :
                       token.path[0] === 'fontSize' ? 'font-size' :
                       token.path[0] === 'fontWeight' ? 'font-weight' :
                       token.path[0] === 'lineHeight' ? 'line-height' :
                       token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
        // For theme tokens: theme.classic.variant.dark.* → foundation.*
        const pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
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

    // Advance Light Theme
    if (foundationAdvanceLight.length > 0) {
      output.push('[data-theme="advance-light"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Advance Light Theme');
      output.push('   * Modern design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationAdvanceLightCombined.forEach(token => {
        const prefix = token.path[0] === 'theme' ? 'color' :
                       token.path[0] === 'size' ? 'size' :
                       token.path[0] === 'fontSize' ? 'font-size' :
                       token.path[0] === 'fontWeight' ? 'font-weight' :
                       token.path[0] === 'lineHeight' ? 'line-height' :
                       token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
        // For theme tokens: theme.advance.variant.light.* → foundation.*
        const pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
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

    // Advance Dark Theme
    if (foundationAdvanceDarkCombined.length > 0) {
      output.push('[data-theme="advance-dark"] {');
      output.push('  /* ============================================');
      output.push('   * Foundation Tokens - Advance Dark Theme');
      output.push('   * Modern design system tokens referencing raw colors');
      output.push('   * ============================================ */');
      output.push('');

      foundationAdvanceDarkCombined.forEach(token => {
        const prefix = token.path[0] === 'theme' ? 'color' :
                       token.path[0] === 'size' ? 'size' :
                       token.path[0] === 'fontSize' ? 'font-size' :
                       token.path[0] === 'fontWeight' ? 'font-weight' :
                       token.path[0] === 'lineHeight' ? 'line-height' :
                       token.path[0] === 'fontFamily' ? 'font-family' : token.path[0];
        // For theme tokens: theme.advance.variant.dark.* → foundation.*
        const pathWithoutTheme = (token.path[0] === 'theme')
          ? ['color', 'foundation', ...token.path.slice(4)]
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
    'tokens/**/*.json'
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
