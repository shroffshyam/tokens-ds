# Theme Support Guide

This design system supports both **light** and **dark** themes following Adobe Spectrum Design Token Standards.

## 🎨 Theme Structure

The token system is organized with theme-specific foundation tokens:

- **Light Theme**: `tokens/foundation/colors-light.json`
- **Dark Theme**: `tokens/foundation/colors-dark.json`

Foundation tokens are theme-specific, while component tokens automatically adapt to the active theme.

## 🌐 Web Usage

### Basic Setup

Include the generated CSS file in your HTML:

```html
<link rel="stylesheet" href="build/web/tokens.css">
```

### Applying Themes

The default theme is **light**. To switch to dark theme, add the `data-theme` attribute to your HTML element:

```html
<!-- Light theme (default) -->
<html>
  <body>
    <!-- Your content -->
  </body>
</html>

<!-- Dark theme -->
<html data-theme="dark">
  <body>
    <!-- Your content -->
  </body>
</html>
```

### Dynamic Theme Switching

You can switch themes dynamically using JavaScript:

```javascript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light');

// Toggle theme
const currentTheme = document.documentElement.getAttribute('data-theme');
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
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

1. **Raw Colors**: Defined once, used by both themes
2. **Foundation Tokens**: 
   - Light theme tokens are defined in `colors-light.json`
   - Dark theme tokens are defined in `colors-dark.json`
   - CSS outputs both with `[data-theme="light"]` and `[data-theme="dark"]` selectors
3. **Component Tokens**: Reference foundation tokens, automatically adapt to active theme

## 🔧 Customizing Themes

### Adding New Theme Colors

Edit the theme-specific foundation color files:

**Light Theme** (`tokens/foundation/colors-light.json`):
```json
{
  "color": {
    "foundation": {
      "light": {
        "primary": {
          "base": { "value": "{color.rawColors.blue.500}" }
        }
      }
    }
  }
}
```

**Dark Theme** (`tokens/foundation/colors-dark.json`):
```json
{
  "color": {
    "foundation": {
      "dark": {
        "primary": {
          "base": { "value": "{color.rawColors.blue.400}" }
        }
      }
    }
  }
}
```

### Best Practices

1. **Maintain Contrast**: Ensure dark theme has sufficient contrast ratios
2. **Consistent Naming**: Use the same token names in both light and dark themes
3. **Reference Raw Colors**: Always reference raw colors, never hardcode hex values in foundation tokens
4. **Test Both Themes**: Always test your components in both light and dark themes

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

