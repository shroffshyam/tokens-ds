# Token Structure Reference

## Quick Reference Guide

### Token Hierarchy Flow

```
rawColors (All Colors)
    ↓
foundation (Complete Theme Definitions)
├── theme-classic-light.json (Complete Classic Light Theme)
├── theme-classic-dark.json (Complete Classic Dark Theme)
├── theme-advance-light.json (Complete Advance Light Theme)
└── theme-advance-dark.json (Complete Advance Dark Theme)
    ↓
components (UI Components - Reference semantic tokens)
```

### Semantic Token Architecture

Each theme file contains complete semantic token definitions:

- **Colors**: `color.background.*`, `color.text.*`, `color.interactive.*`, `color.semantic.*`
- **Spacing**: `spacing.component.*`, `spacing.layout.*`, `spacing.scale.*`
- **Typography**: `typography.family.*`, `typography.size.*`, `typography.weight.*`
- **Borders**: `border.width.*`, `border.radius.*`
- **Shadows**: `shadow.elevation.*`, `shadow.color.*`

### Component Overrides

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

**CSS Behavior**: Component overrides generate CSS variables in theme selectors that take precedence over default component tokens, enabling theme-specific customization while maintaining semantic consistency.

### Theme Differences

- **Classic Theme**: Traditional, conservative design
  - Smaller spacing scale, standard typography weights
  - Traditional color relationships

- **Advance Theme**: Modern, spacious design
  - Larger spacing scale, extended typography weights
  - Contemporary color relationships and larger border radius
  - Component overrides for specific UX requirements (e.g., custom button hover colors)

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

