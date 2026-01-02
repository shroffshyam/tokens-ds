# Token Structure Reference

## Quick Reference Guide

### Token Hierarchy Flow

```
rawColors (All Colors)
    ↓
foundation (Core Design System)
├── theme.classic.variant.* (Classic Theme: light/dark color variants)
├── theme.advance.variant.* (Advance Theme: light/dark color variants)
├── color.foundation.* (Foundation color interface)
├── size.spacing.* (Shared spacing scale)
├── fontSize.foundation.* (Shared typography scale)
├── fontWeight.foundation.* (Shared font weights)
├── lineHeight.foundation.* (Shared line heights)
└── fontFamily.foundation.* (Shared font families)
    ↓
components (UI Components - Theme-aware)
```

### Theme Architecture

The token system uses a **hybrid Theme-Variant structure**:

- **Theme-Specific Colors** (unique per theme):
  - **Classic Theme**: Traditional color palette
    - `theme.classic.variant.light.*`
    - `theme.classic.variant.dark.*`
  - **Advance Theme**: Modern color palette
    - `theme.advance.variant.light.*`
    - `theme.advance.variant.dark.*`

- **Shared Design Tokens** (consistent across themes):
  - `color.foundation.*`: Interface for component references
  - `size.spacing.*`: Universal spacing scale
  - `fontSize.foundation.*`: Universal typography scale
  - `fontWeight.foundation.*`: Universal font weights
  - `lineHeight.foundation.*`: Universal line heights
  - `fontFamily.foundation.*`: Universal font families

### Token Path Examples

#### Raw Colors
- `{color.rawColors.blue.500}` → Primary blue color
- `{color.rawColors.gray.900}` → Dark gray text color
- `{color.rawColors.white.value}` → White color

#### Foundation Colors (Theme Variants)
- `{theme.classic.variant.light.primary.base}` → Classic light theme primary color
- `{theme.classic.variant.dark.primary.base}` → Classic dark theme primary color
- `{theme.advance.variant.light.primary.base}` → Advance light theme primary color
- `{theme.advance.variant.dark.primary.base}` → Advance dark theme primary color

#### Foundation Colors (Resolved)
- `{color.foundation.primary.base}` → Primary brand color (theme-aware)
- `{color.foundation.semantic.error.base}` → Error state color (theme-aware)
- `{color.foundation.neutral.text.primary}` → Primary text color (theme-aware)

#### Foundation Spacing
- `{size.spacing.xs}` → 4px spacing
- `{size.spacing.md}` → 16px spacing
- `{size.spacing.lg}` → 24px spacing

#### Foundation Typography
- `{fontSize.foundation.base}` → 16px base font size
- `{fontWeight.foundation.bold}` → 700 font weight
- `{lineHeight.foundation.normal}` → 1.5 line height

#### Component Tokens
- `{color.component.button.primary.background.default}` → Button primary background
- `{size.component.button.padding.horizontal.md}` → Button horizontal padding
- `{fontSize.component.text.heading.h1}` → H1 heading font size

## Adding New Tokens

### Step 1: Add Raw Color (if needed)
```json
// tokens/color/rawColors.json
{
  "color": {
    "rawColors": {
      "orange": {
        "500": { "value": "#FF9800" }
      }
    }
  }
}
```

### Step 2: Add Foundation Token
```json
// tokens/foundation/colors-classic-light.json
{
  "theme": {
    "classic": {
      "variant": {
        "light": {
          "accent": {
            "base": { "value": "{color.rawColors.orange.500}" }
          }
        }
      }
    }
  }
}
```

### Step 3: Use in Component
```json
// tokens/components/alert.json
{
  "color": {
    "component": {
      "alert": {
        "warning": {
          "background": { "value": "{color.foundation.accent.base}" }
        }
      }
    }
  }
}
```

## Best Practices

1. **Always reference, never duplicate**: Use token references (`{token.path}`) instead of hardcoding values
2. **Start from raw colors**: All colors should originate from `rawColors.json`
3. **Build semantic foundation**: Create meaningful foundation tokens (primary, secondary, semantic)
4. **Component-specific tokens**: Only create component tokens when they add component-specific meaning
5. **Maintain hierarchy**: Raw → Foundation → Component

## Platform Outputs

After running `npm run build`, tokens are transformed for each platform:

- **Web**: CSS variables (`var(--color-foundation-primary-base)`)
- **iOS**: Swift properties (`StyleDictionary.color.foundation.primary.base`)
- **Android**: XML resources (`@color/foundation_primary_base`)

