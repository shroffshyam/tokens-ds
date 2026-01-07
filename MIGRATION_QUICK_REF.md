# Flat Token Migration - Quick Reference

## 📊 Phase Overview

```
Phase 0: Setup          → Dual-mode build script
Phase 1: Raw Colors     → blue-500, gray-900, etc.
Phase 2: Foundation     → spacing-md, border-radius-lg
Phase 3: Semantic       → background-base, accent-primary (with sets)
Phase 4: Components     → button-primary-background
Phase 5: Build Script   → Remove hierarchical support
Phase 6: Cleanup         → Delete old structure
```

## 🔄 Naming Conversion

| Hierarchical | Flat |
|--------------|------|
| `color.rawColors.blue.500` | `blue-500` |
| `color.accent.primary` | `accent-primary` |
| `color.background.base` | `background-base` |
| `spacing.md` | `spacing-md` |
| `borderRadius.md` | `border-radius-md` |
| `component.button.primary.background` | `button-primary-background` |

## 📁 File Structure Changes

### Before (Hierarchical)
```
tokens/
├── color/rawColors.json
├── foundation/
│   ├── spacing.json
│   ├── theme-classic-light.json
│   └── ...
└── components/button.json
```

### After (Flat)
```
tokens/
├── color.json          # All raw colors
├── semantic.json        # Semantic tokens with sets
├── component.json       # Component tokens
└── spacing.json         # Spacing, borders, shadows
```

## 🎯 Theme Sets Pattern

```json
{
  "accent-primary": {
    "value": "{blue-500}",
    "sets": {
      "classic-light": { "value": "{blue-500}" },
      "classic-dark": { "value": "{blue-400}" },
      "advance-light": { "value": "{indigo-500}" },
      "advance-dark": { "value": "{indigo-400}" }
    }
  }
}
```

## ✅ Phase Checklist

### Phase 1: Raw Colors
- [ ] Create `tokens-flat/color.json`
- [ ] Add UUIDs and $schema
- [ ] Update build script
- [ ] Test outputs match

### Phase 2: Foundation
- [ ] Create `tokens-flat/spacing.json`
- [ ] Migrate typography
- [ ] Update references
- [ ] Test outputs

### Phase 3: Semantic Colors
- [ ] Create `tokens-flat/semantic.json`
- [ ] Use sets for themes
- [ ] Test all 4 themes
- [ ] Verify theme switching

### Phase 4: Components
- [ ] Create `tokens-flat/component.json`
- [ ] Update references
- [ ] Test all components

### Phase 5: Build Script
- [ ] Remove hierarchical code
- [ ] Simplify logic
- [ ] Test full build

### Phase 6: Cleanup
- [ ] Delete old structure
- [ ] Update docs
- [ ] Final verification

## 🚨 Quick Rollback

```bash
# Revert to hierarchical
git checkout main
git branch -D feature/flat-tokens-phase-X
```

## 📝 Key Decisions

1. **Naming**: kebab-case (`blue-500`, not `blue500`)
2. **Theme Sets**: Use `sets` object for theme variants
3. **Schema**: Add `$schema` and `uuid` to all tokens
4. **Migration**: Incremental, one phase at a time
5. **Testing**: Compare outputs at each phase

