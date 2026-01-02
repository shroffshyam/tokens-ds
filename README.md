# Design System Tokens

A scalable, cross-platform design system tokens project built with [Style Dictionary](https://amzn.github.io/style-dictionary/). This design system serves as the single source of truth for spacing guidelines, font sizing, and colors across iOS, Android, and Web platforms.

**✨ Features:**
- **Hierarchical Token Structure**: Raw Colors → Foundation → Components with CSS variable references
- **Semantic Token Architecture**: Industry-standard semantic naming with complete theme definitions
- **Component Override System**: Theme-specific component exceptions for brand customization
- **Theme-Variant Architecture**: Classic and Advance themes, each with light and dark variants
- **Cross-Platform Generation**: Web (CSS), iOS (Swift), Android (XML) outputs
- **Interactive Token Explorer**: Visual exploration of token relationships and hierarchies
- **Adobe Spectrum Standards**: Following industry best practices for design tokens

## 🏗️ Architecture

### Token Hierarchy

The token system follows a three-tier hierarchy that ensures consistency and maintainability:

1. **Raw Colors** (`tokens/color/rawColors.json`)
   - All color definitions at the root level
   - Complete color palette (blue, green, red, yellow, gray, black, white)
   - Color scales (50-900) for systematic color variations

2. **Foundation Tokens** (`tokens/foundation/`)
   - Core design system tokens using semantic naming
   - **Theme Architecture**: Complete theme definitions with semantic tokens
     - **Classic Theme**: Traditional design approach
       - `theme-classic-light.json` (light variant - complete theme)
       - `theme-classic-dark.json` (dark variant - complete theme)
     - **Advance Theme**: Modern design approach
       - `theme-advance-light.json` (light variant - complete theme)
       - `theme-advance-dark.json` (dark variant - complete theme)
   - **Semantic Categories**:
     - `color.*`: Background, text, border, interactive, semantic colors
     - `spacing.*`: Component and layout spacing scales
     - `typography.*`: Font families, sizes, weights, line heights
     - `border.*`: Border widths and border radius
     - `shadow.*`: Elevation and shadow definitions

3. **Component Tokens** (`tokens/components/`)
   - Component-specific tokens that reference foundation tokens
   - Examples: Button, Card, Input, Typography components
   - Maintains design consistency across all UI components

### Directory Structure

```
tokens-ds/
├── sd.config.js                # Style Dictionary configuration (JavaScript)
├── config.json                 # Legacy JSON config (deprecated, use sd.config.js)
├── package.json                # Project dependencies and scripts
├── token-explorer.html         # Interactive token explorer SPA
├── tokens/
│   ├── color/
│   │   └── rawColors.json      # All raw color definitions
│   ├── foundation/
│   │   ├── theme-classic-light.json      # Complete Classic light theme (semantic tokens)
│   │   ├── theme-classic-dark.json      # Complete Classic dark theme (semantic tokens)
│   │   ├── theme-advance-light.json     # Complete Advance light theme (semantic tokens)
│   │   └── theme-advance-dark.json      # Complete Advance dark theme (semantic tokens)
│   └── components/
│       ├── button.json         # Button component tokens
│       ├── card.json           # Card component tokens
│       ├── input.json          # Input component tokens
│       └── typography.json     # Typography component tokens
└── build/                      # Generated platform-specific outputs
    ├── web/                    # Web outputs (CSS, JSON)
    ├── ios/                    # iOS outputs (Swift)
    └── android/                # Android outputs (XML)
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build your design tokens
npm run build

# Explore your tokens interactively
npm run explorer
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

This installs Style Dictionary and the http-server for the Token Explorer.

### Building Tokens

Build tokens for all platforms:

```bash
npm run build
```

Build and clean previous outputs:

```bash
npm run build:clean
```

Watch mode for development (rebuilds automatically on file changes):

```bash
npm run watch
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build tokens for web, iOS, and Android |
| `npm run build:clean` | Clean build directory and rebuild |
| `npm run watch` | Watch for changes and rebuild automatically |
| `npm run explorer` | Start local server and open Token Explorer |

### Exploring Tokens

After building, explore your tokens interactively using the dedicated npm command:

```bash
npm run explorer
```

This starts a local development server at `http://localhost:3000` and automatically opens the Token Explorer in your browser.

**Alternative methods:**
```bash
# Direct file opening
open token-explorer.html

# Manual server start
npx http-server -p 3000 -c-1 --cors -o token-explorer.html
```

The Token Explorer provides:
- **Visual hierarchy**: See the relationship between Raw Colors → Foundation → Components
- **Component details**: Explore each component's token dependencies with color previews
- **Foundation table**: Browse all foundation tokens with advanced filtering by type and theme
- **Theme switching**: Toggle between Classic/Advance themes and their light/dark variants in real-time
- **Responsive design**: Works on desktop and mobile devices
- **Modular architecture**: Built with SOLID principles for maintainability

## 🖥️ Token Explorer

An interactive Single Page Application for exploring your design tokens:

```bash
# Quick start with npm
npm run explorer

# Or open manually
open token-explorer.html
```

**Features:**
- **Hierarchy Visualization**: See the complete token flow from Raw Colors → Foundation → Components
- **Component Relationships**: Explore each component's token dependencies with visual color previews
- **Foundation Tokens Table**: Browse all foundation tokens with advanced filtering by type and theme
- **Theme Switching**: Toggle between light and dark themes to see token variations
- **Token Details**: View token values, CSS variable references, and color previews
- **Responsive Design**: Works on desktop and mobile devices

The explorer automatically loads your generated tokens and provides an intuitive interface for understanding the design system architecture.

## 📦 Output Formats

### Web
- **CSS Variables** (`build/web/tokens.css`): Hierarchical CSS custom properties following [Adobe Spectrum Design Token Standards](https://spectrum.adobe.com/page/design-tokens/). Tokens are organized in three sections:
  - **Raw Colors**: Base color definitions (e.g., `--color-rawColors-blue-500`)
  - **Foundation Tokens**: Core design system tokens that reference raw colors using CSS variables
    - **Classic Theme**: Traditional design approach
      - Classic Light (default): Applied to `:root` and `[data-theme="classic-light"]`
      - Classic Dark: Applied to `[data-theme="classic-dark"]`
    - **Advance Theme**: Modern design approach
      - Advance Light: Applied to `[data-theme="advance-light"]`
      - Advance Dark: Applied to `[data-theme="advance-dark"]`
  - **Component Tokens**: Component-specific tokens that reference foundation tokens using CSS variables (e.g., `--color-component-button-primary-background-default: var(--color-foundation-primary-base)`)

  **Theme Architecture**: Complete theme definitions with semantic tokens and component overrides.

  #### **Semantic Token Categories**
  - `color.*`: Background, text, border, interactive, semantic colors
  - `spacing.*`: Component and layout spacing scales
  - `typography.*`: Font families, sizes, weights, line heights
  - `border.*`: Border widths and border radius
  - `shadow.*`: Elevation and shadow definitions

  #### **Component Overrides**
  Themes can include component-specific overrides to handle exceptions where specific components need different values than the foundation semantic tokens:

  ```json
  // Example: Advance theme button hover uses raw color instead of foundation
  {
    "component": {
      "button": {
        "primary": {
          "background": {
            "hover": { "value": "{color.rawColors.blue.300}" }
          }
        }
      }
    }
  }
  ```

  **CSS Cascade Behavior**: Component overrides in theme selectors take precedence over default component tokens, enabling theme-specific component customization while maintaining semantic consistency.

  This architecture ensures that:
  - Changes to raw colors automatically propagate through foundation and component tokens
  - The token hierarchy is maintained and clearly visible in the output
  - Tokens follow industry-standard naming conventions
  - **Theme Support**: Use `data-theme="classic-light"`, `data-theme="classic-dark"`, `data-theme="advance-light"`, or `data-theme="advance-dark"` on HTML element to switch themes
  - **Exception Handling**: Component-specific overrides allow themes to deviate from foundation tokens when needed
  
- **JSON** (`build/web/tokens.json`): Nested JSON format for JavaScript applications

> 📖 See [THEMES.md](./THEMES.md) for detailed theme usage guide

### iOS
- **Swift Class** (`build/ios/StyleDictionary.swift`): Swift class with all tokens
- **Swift Color Enum** (`build/ios/StyleDictionaryColor.swift`): Swift enum for color tokens

### Android
- **Colors XML** (`build/android/colors.xml`): Android color resources
- **Dimens XML** (`build/android/dimens.xml`): Android dimension resources
- **Font Dimens XML** (`build/android/font_dimens.xml`): Android font size resources
- **Strings XML** (`build/android/strings.xml`): Android string resources

## 🎨 Token Usage Examples

### Referencing Tokens

Tokens can reference other tokens using the `{token.path}` syntax:

```json
{
  "color": {
    "foundation": {
      "primary": {
        "base": { "value": "{color.rawColors.blue.500}" }
      }
    }
  }
}
```

### Component Tokens Reference Foundation

```json
{
  "color": {
    "component": {
      "button": {
        "primary": {
          "background": {
            "default": { "value": "{color.interactive.primary.default}" }
          }
        }
      }
    }
  }
}
```

### Component Overrides for Theme Exceptions

Themes can include component-specific overrides to handle cases where specific components need different values than the foundation semantic tokens:

```json
// Advance theme: Button hover uses raw color instead of foundation token
{
  "component": {
    "button": {
      "primary": {
        "background": {
          "hover": { "value": "{color.rawColors.blue.300}" }
        }
      }
    }
  }
}
```

**CSS Behavior**: Component overrides generate CSS variables in theme selectors that take precedence over default component tokens, enabling theme-specific component customization while maintaining semantic consistency.

## 🔧 Customization

### Adding New Raw Colors

Edit `tokens/color/rawColors.json` to add new color definitions:

```json
{
  "color": {
    "rawColors": {
      "purple": {
        "500": { "value": "#9C27B0" }
      }
    }
  }
}
```

### Adding New Foundation Tokens

Create or edit files in `tokens/foundation/` to add new foundation tokens. Remember to reference raw colors:

```json
{
  "color": {
    "foundation": {
      "accent": {
        "base": { "value": "{color.rawColors.purple.500}" }
      }
    }
  }
}
```

### Adding New Component Tokens

Create new files in `tokens/components/` for component-specific tokens. Always reference foundation tokens:

```json
{
  "color": {
    "component": {
      "badge": {
        "background": {
          "default": { "value": "{color.foundation.accent.base}" }
        }
      }
    }
  }
}
```

## 📐 Design Principles

1. **Single Source of Truth**: All design decisions are centralized in token files
2. **Hierarchical Structure**: Raw → Foundation → Component ensures consistency
3. **Platform Agnostic**: Tokens are platform-agnostic; Style Dictionary handles platform-specific transformations
4. **Maintainability**: Changes to foundation tokens automatically propagate to components
5. **Scalability**: Easy to add new tokens, colors, or components without breaking existing structure

## 🔄 Workflow

1. **Define Raw Colors**: Add all color definitions to `rawColors.json`
2. **Create Foundation Tokens**: Build semantic tokens that reference raw colors
3. **Build Component Tokens**: Create component-specific tokens referencing foundation
4. **Build Outputs**: Run `npm run build` to generate platform-specific files
5. **Integrate**: Import generated files into your iOS, Android, or Web projects

## 📚 Resources

- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [Design Tokens Community Group](https://www.designtokens.org/)
- [W3C Design Tokens Specification](https://tr.designtokens.org/format/)

## 📝 License

MIT

## Visualizser Ref
https://opensource.adobe.com/spectrum-design-data/visualizer/?filter=spectrum%2Clight%2Cdesktop