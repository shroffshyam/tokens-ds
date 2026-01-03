# Theme Support Guide

This design system supports **semantic tokens** with complete theme definitions and component overrides, following Adobe Spectrum Design Token Standards.

## 🎨 Theme Architecture

The token system uses a **semantic token architecture** with complete theme definitions that include component-specific overrides:

### Theme Structure

1. **Classic Theme** (Traditional design approach):
   - **Classic Light**: `tokens/foundation/theme-classic-light.json` - Complete semantic theme
   - **Classic Dark**: `tokens/foundation/theme-classic-dark.json` - Complete semantic theme

2. **Advance Theme** (Modern design approach):
   - **Advance Light**: `tokens/foundation/theme-advance-light.json` - Complete semantic theme
   - **Advance Dark**: `tokens/foundation/theme-advance-dark.json` - Complete semantic theme

### Semantic Categories
Each theme file contains complete semantic token definitions:
- **Colors**: `color.background.*`, `color.text.*`, `color.interactive.*`, `color.semantic.*`
- **Spacing**: `spacing.component.*`, `spacing.layout.*`, `spacing.scale.*`
- **Typography**: `typography.family.*`, `typography.size.*`, `typography.weight.*`
- **Borders**: `border.width.*`, `border.radius.*`
- **Shadows**: `shadow.elevation.*`, `shadow.color.*`

### Component Overrides
Themes can include component-specific overrides for exceptions where specific components need different values than foundation semantic tokens:

```json
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

**CSS Cascade**: Component overrides in theme selectors take precedence over default component tokens, enabling theme-specific component customization.

### Why Semantic Theme Architecture?

- **Complete Themes**: Each theme file contains all semantic tokens (colors, spacing, typography, etc.)
- **Component Overrides**: Theme-specific exceptions for brand or UX requirements
- **Design Approaches**: Different themes represent different design philosophies (Classic vs Advance)
- **Brightness Variants**: Each theme has consistent light/dark variants
- **Scalability**: Easy to add more themes or variants with full semantic coverage
- **Semantic Clarity**: Industry-standard naming with clear token purposes
- **Maintainability**: Themes evolve independently while maintaining semantic consistency
- **Exception Handling**: Component overrides provide flexibility without breaking semantic structure

Foundation tokens are theme-complete, and component tokens automatically adapt to the active theme with theme-specific overrides taking precedence.

## 🌐 Web Usage

### Basic Setup

Include the generated CSS file in your HTML:

```html
<link rel="stylesheet" href="build/web/tokens.css">
```

### Applying Themes

The default theme is **Classic Light**. To switch to other theme variants, add the `data-theme` attribute to your HTML element:

```html
<!-- Classic Light theme (default) -->
<html>
  <body>
    <!-- Your content -->
  </body>
</html>

<!-- Classic Dark theme -->
<html data-theme="classic-dark">
  <body>
    <!-- Your content -->
  </body>
</html>

<!-- Advance Light theme -->
<html data-theme="advance-light">
  <body>
    <!-- Your content -->
  </body>
</html>

<!-- Advance Dark theme -->
<html data-theme="advance-dark">
  <body>
    <!-- Your content -->
  </body>
</html>
```

### Dynamic Theme Switching

You can switch themes dynamically using JavaScript:

```javascript
// Switch to specific theme variants
document.documentElement.setAttribute('data-theme', 'classic-dark');
document.documentElement.setAttribute('data-theme', 'advance-light');
document.documentElement.setAttribute('data-theme', 'advance-dark');

// Switch to Classic Light theme
document.documentElement.setAttribute('data-theme', 'classic-light');

// Toggle theme (cycles through: classic-light → classic-dark → advance-light → advance-dark → classic-light)
const currentTheme = document.documentElement.getAttribute('data-theme') || 'classic-light';
let newTheme;
if (currentTheme === 'classic-light') newTheme = 'classic-dark';
else if (currentTheme === 'classic-dark') newTheme = 'advance-light';
else if (currentTheme === 'advance-light') newTheme = 'advance-dark';
else newTheme = 'classic-light';
document.documentElement.setAttribute('data-theme', newTheme);
```

### Using Tokens in CSS

Component tokens automatically adapt to the current theme:

```css
.button {
  background-color: var(--color-component-button-primary-background-default);
  color: var(--color-component-button-primary-text-default);
  padding: var(--size-component-button-padding-vertical-md) var(--size-component-button-padding-horizontal-md);
}

/* The button will automatically use dark theme colors when data-theme="dark" is set */
```

### Foundation Token Usage

Foundation tokens are theme-aware and change based on the `data-theme` attribute:

```css
.card {
  background-color: var(--color-foundation-neutral-background-primary);
  border: 1px solid var(--color-foundation-neutral-border-default);
  color: var(--color-foundation-neutral-text-primary);
}
```

## 📱 iOS Usage

For iOS, theme support is handled through the generated Swift files. You'll need to implement theme switching logic in your app:

```swift
// Example: Theme manager
class ThemeManager {
    static let shared = ThemeManager()
    
    var currentTheme: Theme = .light
    
    enum Theme {
        case light
        case dark
    }
    
    func applyTheme(_ theme: Theme) {
        currentTheme = theme
        // Apply theme-specific colors
        // Use StyleDictionary.color.foundation.light.* or .dark.*
    }
}
```

## 🤖 Android Usage

For Android, theme support is handled through resource qualifiers or programmatic theme switching:

```xml
<!-- res/values/colors.xml (light theme) -->
<color name="foundation_primary_base">#2196F3</color>

<!-- res/values-night/colors.xml (dark theme) -->
<color name="foundation_primary_base">#42A5F5</color>
```

Or use Android's built-in theme system with `AppCompatDelegate`:

```kotlin
AppCompatDelegate.setDefaultNightMode(
    if (isDarkTheme) {
        AppCompatDelegate.MODE_NIGHT_YES
    } else {
        AppCompatDelegate.MODE_NIGHT_NO
    }
)
```

## 🎯 Theme Token Hierarchy

```
Raw Colors (theme-agnostic)
    ↓
Foundation Tokens (theme-specific: light/dark)
    ↓
Component Tokens (theme-agnostic, reference foundation)
```

### How It Works

1. **Raw Colors**: Defined once, used by all themes
2. **Foundation Tokens**:
   - **Theme-Specific Semantic Tokens**: Complete theme definitions in dedicated theme files
     - Classic: `theme-classic-light.json` and `theme-classic-dark.json`
     - Advance: `theme-advance-light.json` and `theme-advance-dark.json`
   - **Shared Design Tokens**: Spacing scale shared across all themes
     - `spacing.json`: Consistent spacing scale for all themes
   - Each theme file contains complete semantic token definitions (colors, typography, borders, shadows)
   - CSS outputs all variants with appropriate `[data-theme="*"]` selectors
3. **Component Tokens**: Reference foundation tokens, automatically adapt to active theme

## 🔧 Customizing Themes

### Adding New Theme Colors

Edit the appropriate theme file to add new semantic color tokens. Each theme file contains complete semantic token definitions:

**Classic Light** (`tokens/foundation/theme-classic-light.json`):
```json
{
  "color": {
    "interactive": {
      "accent": {
        "default": { "value": "{color.rawColors.blue.600}" },
        "hover": { "value": "{color.rawColors.blue.700}" }
      }
    }
  }
}
```

**Classic Dark** (`tokens/foundation/theme-classic-dark.json`):
```json
{
  "color": {
    "interactive": {
      "accent": {
        "default": { "value": "{color.rawColors.blue.400}" },
        "hover": { "value": "{color.rawColors.blue.500}" }
      }
    }
  }
}
```

**Advance Light** (`tokens/foundation/theme-advance-light.json`):
```json
{
  "color": {
    "interactive": {
      "accent": {
        "default": { "value": "{color.rawColors.blue.500}" },
        "hover": { "value": "{color.rawColors.blue.600}" }
      }
    }
  }
}
```

**Advance Dark** (`tokens/foundation/theme-advance-dark.json`):
```json
{
  "color": {
    "interactive": {
      "accent": {
        "default": { "value": "{color.rawColors.blue.400}" },
        "hover": { "value": "{color.rawColors.blue.500}" }
      }
    }
  }
}
```

### Best Practices

1. **Theme Identity**: Each theme (Classic/Advance) should have a clear design philosophy and visual identity
2. **Shared Design Tokens**: Spacing and typography are shared across themes for consistency
3. **Theme-Specific Colors**: Only colors vary between themes; spacing/typography remain consistent
4. **Variant Consistency**: Light/dark variants within a theme should maintain the theme's core identity
5. **Maintain Contrast**: Ensure all theme variants have sufficient contrast ratios (WCAG AA compliance)
6. **Consistent Naming**: Use the same token names across all theme variants
7. **Reference Raw Colors**: Always reference raw colors, never hardcode hex values in foundation tokens
8. **Test All Variants**: Always test components in all four theme variants
9. **Semantic Color Usage**: Colors should serve the same semantic purpose across all themes

## 📚 Examples

### React Component with Theme Support

```jsx
import './tokens.css';

function Button({ children, variant = 'primary' }) {
  return (
    <button 
      className={`button button--${variant}`}
      style={{
        backgroundColor: 'var(--color-component-button-primary-background-default)',
        color: 'var(--color-component-button-primary-text-default)',
        padding: 'var(--size-component-button-padding-vertical-md) var(--size-component-button-padding-horizontal-md)'
      }}
    >
      {children}
    </button>
  );
}
```

### CSS with Theme-Aware Styles

```css
/* Automatically adapts to light/dark theme */
.container {
  background: var(--color-foundation-neutral-background-primary);
  color: var(--color-foundation-neutral-text-primary);
  border: 1px solid var(--color-foundation-neutral-border-default);
}

/* Theme-specific overrides if needed */
[data-theme="dark"] .container {
  /* Additional dark theme specific styles */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

## 🐛 Troubleshooting

### Theme Not Switching

- Ensure `data-theme` attribute is set on `<html>` or `<body>`
- Check that both light and dark foundation tokens are defined
- Verify CSS file is loaded correctly

### Colors Not Updating

- Component tokens reference foundation tokens - ensure foundation tokens are theme-specific
- Check browser DevTools to see which CSS variables are active
- Verify no CSS specificity issues overriding theme variables

## 📖 References

- [Adobe Spectrum Design Tokens](https://spectrum.adobe.com/page/design-tokens/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)

