# Token Structure Reference

## Quick Reference Guide

### Token Hierarchy Flow

```
rawColors (All Colors)
    ↓
foundation (Core Design System)
    ↓
components (UI Components)
```

### Token Path Examples

#### Raw Colors
- `{color.rawColors.blue.500}` → Primary blue color
- `{color.rawColors.gray.900}` → Dark gray text color
- `{color.rawColors.white.value}` → White color

#### Foundation Colors
- `{color.foundation.primary.base}` → Primary brand color
- `{color.foundation.semantic.error.base}` → Error state color
- `{color.foundation.neutral.text.primary}` → Primary text color

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
// tokens/foundation/colors.json
{
  "color": {
    "foundation": {
      "accent": {
        "base": { "value": "{color.rawColors.orange.500}" }
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

