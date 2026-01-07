# Phased Migration Plan: Hierarchical → Flat Token Structure

## 📋 Overview

This document outlines a phased approach to migrate from hierarchical token structure (`color.rawColors.blue.500`) to flat token structure (`blue-500`), following Adobe Spectrum Design Token Standards.

**Current Structure (Hierarchical):**
```json
{
  "color": {
    "rawColors": {
      "blue": { "500": { "value": "#2196F3" } }
    },
    "accent": {
      "primary": { "value": "{color.rawColors.blue.500}" }
    }
  },
  "component": {
    "button": {
      "primary": {
        "background": { "value": "{color.accent.primary}" }
      }
    }
  }
}
```

**Target Structure (Flat):**
```json
{
  "blue-500": {
    "value": "#2196F3",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "..."
  },
  "accent-primary": {
    "value": "{blue-500}",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/alias.json",
    "uuid": "..."
  },
  "button-primary-background": {
    "value": "{accent-primary}",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/alias.json",
    "uuid": "..."
  }
}
```

---

## 🎯 Migration Goals

1. **Zero Downtime**: Maintain backward compatibility during migration
2. **Incremental**: Migrate one category at a time
3. **Testable**: Verify outputs at each phase
4. **Reversible**: Ability to rollback if issues arise
5. **Documented**: Clear tracking of progress

---

## 📊 Phase Breakdown

### **Phase 0: Preparation & Setup** ⏱️ 1-2 days

**Goal**: Set up infrastructure to support both structures simultaneously

**Tasks:**
- [ ] Create new `tokens-flat/` directory structure
- [ ] Update `build-themes.js` to support dual-mode (hierarchical + flat)
- [ ] Add flat token naming utility functions
- [ ] Create migration validation script
- [ ] Set up comparison tool to verify outputs match
- [ ] Create backup of current structure

**Directory Structure:**
```
tokens-ds/
├── tokens/              # Current hierarchical (keep during migration)
├── tokens-flat/         # New flat structure (build alongside)
│   ├── color.json
│   ├── semantic.json
│   ├── component.json
│   └── spacing.json
└── build/
    ├── web/
    │   ├── tokens.css          # From hierarchical
    │   └── tokens-flat.css     # From flat (for comparison)
```

**Deliverables:**
- Dual-mode build script
- Comparison tool
- Migration checklist

**Success Criteria:**
- ✅ Build script generates both outputs
- ✅ Outputs are identical (after mapping)
- ✅ No breaking changes to existing consumers

---

### **Phase 1: Raw Colors Migration** ⏱️ 2-3 days

**Goal**: Migrate raw colors to flat structure

**Current:**
```json
{
  "color": {
    "rawColors": {
      "blue": { "500": { "value": "#2196F3" } }
    }
  }
}
```

**Target:**
```json
{
  "blue-50": { "value": "#E3F2FD", "$schema": "...", "uuid": "..." },
  "blue-100": { "value": "#BBDEFB", "$schema": "...", "uuid": "..." },
  "blue-500": { "value": "#2196F3", "$schema": "...", "uuid": "..." }
}
```

**Tasks:**
- [ ] Create `tokens-flat/color.json` with all raw colors
- [ ] Generate UUIDs for each color token
- [ ] Add `$schema` references
- [ ] Update build script to read from flat colors
- [ ] Update reference resolution to handle both `{color.rawColors.blue.500}` and `{blue-500}`
- [ ] Test: Verify CSS outputs match
- [ ] Test: Verify Android/iOS outputs match
- [ ] Update documentation

**Naming Convention:**
- `{colorName}-{scale}` → `blue-500`, `gray-900`, `white`

**Validation:**
```bash
# Compare outputs
diff build/web/tokens.css build/web/tokens-flat.css
# Should show only variable name differences, not value differences
```

**Rollback Plan:**
- Keep `tokens/color/rawColors.json` until Phase 1 verified
- Build script falls back to hierarchical if flat missing

**Success Criteria:**
- ✅ All raw colors migrated
- ✅ All platforms generate identical values
- ✅ No breaking changes
- ✅ Reference resolution works for both formats

---

### **Phase 2: Foundation Tokens (Spacing, Typography, etc.)** ⏱️ 3-4 days

**Goal**: Migrate non-color foundation tokens to flat structure

**Current:**
```json
{
  "spacing": {
    "sm": { "value": "8px" },
    "md": { "value": "16px" }
  },
  "borderRadius": {
    "md": { "value": "4px" }
  }
}
```

**Target:**
```json
{
  "spacing-sm": { "value": "8px", "$schema": "...", "uuid": "..." },
  "spacing-md": { "value": "16px", "$schema": "...", "uuid": "..." },
  "border-radius-md": { "value": "4px", "$schema": "...", "uuid": "..." }
}
```

**Tasks:**
- [ ] Create `tokens-flat/spacing.json` (includes spacing, borderRadius, borderWidth, shadow)
- [ ] Migrate typography tokens to flat structure
- [ ] Update build script to read flat foundation tokens
- [ ] Update reference resolution
- [ ] Test: Verify all platforms
- [ ] Update component references to use flat names
- [ ] Update documentation

**Naming Convention:**
- `{category}-{name}` → `spacing-md`, `border-radius-lg`, `font-size-base`

**Validation:**
- Compare dimension outputs
- Verify component tokens still resolve correctly

**Success Criteria:**
- ✅ All foundation tokens migrated
- ✅ Component tokens can reference flat foundation tokens
- ✅ All platforms generate correctly

---

### **Phase 3: Semantic Color Tokens** ⏱️ 4-5 days

**Goal**: Migrate semantic color tokens (the most complex phase)

**Current:**
```json
{
  "color": {
    "background": {
      "base": { "value": "{color.rawColors.white}" }
    },
    "accent": {
      "primary": { "value": "{color.rawColors.blue.500}" }
    }
  }
}
```

**Target:**
```json
{
  "background-base": {
    "value": "{white}",
    "sets": {
      "classic-light": { "value": "{white}" },
      "classic-dark": { "value": "{gray-900}" },
      "advance-light": { "value": "{white}" },
      "advance-dark": { "value": "{slate-900}" }
    },
    "$schema": "...",
    "uuid": "..."
  },
  "accent-primary": {
    "value": "{blue-500}",
    "sets": {
      "classic-light": { "value": "{blue-500}" },
      "classic-dark": { "value": "{blue-400}" },
      "advance-light": { "value": "{indigo-500}" },
      "advance-dark": { "value": "{indigo-400}" }
    },
    "$schema": "...",
    "uuid": "..."
  }
}
```

**Tasks:**
- [ ] Create `tokens-flat/semantic.json`
- [ ] Migrate all semantic color tokens from 4 theme files
- [ ] Use `sets` for theme variants (Adobe Spectrum pattern)
- [ ] Update build script to resolve theme sets
- [ ] Test: Verify all 4 themes generate correctly
- [ ] Test: Verify theme switching works
- [ ] Update component references
- [ ] Update documentation

**Naming Convention:**
- `{category}-{name}` → `background-base`, `accent-primary`, `text-primary`
- Use kebab-case throughout

**Theme Sets Pattern:**
```json
{
  "token-name": {
    "value": "{default-reference}",
    "sets": {
      "classic-light": { "value": "{reference}" },
      "classic-dark": { "value": "{reference}" },
      "advance-light": { "value": "{reference}" },
      "advance-dark": { "value": "{reference}" }
    }
  }
}
```

**Validation:**
- Test all 4 themes in CSS
- Verify Android/iOS theme files
- Check component token resolution

**Success Criteria:**
- ✅ All semantic tokens migrated
- ✅ All 4 themes work correctly
- ✅ Theme switching works
- ✅ Component tokens resolve correctly

---

### **Phase 4: Component Tokens** ⏱️ 3-4 days

**Goal**: Migrate component tokens to flat structure

**Current:**
```json
{
  "component": {
    "button": {
      "primary": {
        "background": { "value": "{color.accent.primary}" }
      }
    }
  }
}
```

**Target:**
```json
{
  "button-primary-background": {
    "value": "{accent-primary}",
    "$schema": "...",
    "uuid": "..."
  },
  "button-primary-text": {
    "value": "{text-inverse}",
    "$schema": "...",
    "uuid": "..."
  }
}
```

**Tasks:**
- [ ] Create `tokens-flat/component.json`
- [ ] Migrate all component tokens (button, card, input, typography)
- [ ] Update references to use flat semantic tokens
- [ ] Update build script
- [ ] Test: Verify all components
- [ ] Update documentation
- [ ] Update token explorer if needed

**Naming Convention:**
- `{component}-{variant}-{property}` → `button-primary-background`
- `{component}-{variant}-{property}-{state}` → `button-primary-background-hover`

**Validation:**
- Test all component tokens resolve
- Verify CSS outputs
- Check Android/iOS outputs

**Success Criteria:**
- ✅ All component tokens migrated
- ✅ All references resolve correctly
- ✅ All platforms generate correctly

---

### **Phase 5: Build Script Migration** ⏱️ 2-3 days

**Goal**: Update build script to only use flat structure

**Tasks:**
- [ ] Remove hierarchical token loading
- [ ] Simplify build script (no more deep merging)
- [ ] Update reference resolution for flat tokens only
- [ ] Remove dual-mode support
- [ ] Optimize build performance
- [ ] Update error messages
- [ ] Test: Full build verification

**Success Criteria:**
- ✅ Build script only uses flat structure
- ✅ Build time improved (if applicable)
- ✅ All outputs correct

---

### **Phase 6: Cleanup & Documentation** ⏱️ 2-3 days

**Goal**: Remove old structure and finalize migration

**Tasks:**
- [ ] Delete `tokens/` directory (hierarchical)
- [ ] Rename `tokens-flat/` → `tokens/`
- [ ] Update all documentation
- [ ] Update README.md
- [ ] Update THEMES.md
- [ ] Update TOKEN_STRUCTURE.md
- [ ] Update token explorer if needed
- [ ] Create migration summary document
- [ ] Archive old structure (git tag)

**Success Criteria:**
- ✅ Old structure removed
- ✅ All documentation updated
- ✅ Project structure clean
- ✅ Migration complete

---

## 🔄 Reference Resolution Mapping

### During Migration (Dual Support)

**Hierarchical → Flat Mapping:**
```javascript
const referenceMap = {
  // Raw colors
  '{color.rawColors.blue.500}': '{blue-500}',
  '{color.rawColors.gray.900}': '{gray-900}',
  
  // Semantic colors
  '{color.accent.primary}': '{accent-primary}',
  '{color.background.base}': '{background-base}',
  '{color.text.primary}': '{text-primary}',
  
  // Foundation
  '{spacing.md}': '{spacing-md}',
  '{borderRadius.md}': '{border-radius-md}',
  
  // Components
  '{component.button.primary.background}': '{button-primary-background}'
};
```

**Build Script Logic:**
```javascript
function resolveReference(value, flatTokens, hierarchicalTokens) {
  // Try flat first
  if (value.startsWith('{') && value.endsWith('}')) {
    const flatRef = value.slice(1, -1);
    if (flatTokens[flatRef]) {
      return resolveReference(flatTokens[flatRef].value, flatTokens, hierarchicalTokens);
    }
    
    // Fallback to hierarchical
    const hierarchicalRef = convertToHierarchical(flatRef);
    if (hierarchicalTokens[hierarchicalRef]) {
      return resolveReference(hierarchicalTokens[hierarchicalRef].value, flatTokens, hierarchicalTokens);
    }
  }
  return value;
}
```

---

## 📝 Migration Checklist Template

For each phase, use this checklist:

### Pre-Migration
- [ ] Backup current structure
- [ ] Create feature branch
- [ ] Review phase tasks
- [ ] Set up testing environment

### During Migration
- [ ] Create flat token files
- [ ] Update build script
- [ ] Test build outputs
- [ ] Compare outputs (hierarchical vs flat)
- [ ] Fix any discrepancies
- [ ] Update references

### Post-Migration
- [ ] Verify all platforms
- [ ] Test theme switching
- [ ] Update documentation
- [ ] Code review
- [ ] Merge to main
- [ ] Tag release

---

## 🧪 Testing Strategy

### Automated Testing

**Comparison Script:**
```javascript
// scripts/compare-outputs.js
// Compare hierarchical vs flat outputs
// Should only differ in variable names, not values
```

**Validation Script:**
```javascript
// scripts/validate-flat-tokens.js
// - Check all tokens have UUIDs
// - Check all tokens have $schema
// - Check all references resolve
// - Check no circular references
```

### Manual Testing

1. **Web CSS:**
   - [ ] All themes load correctly
   - [ ] Theme switching works
   - [ ] All variables resolve
   - [ ] No broken references

2. **Android XML:**
   - [ ] All color files generated
   - [ ] All dimens files generated
   - [ ] Values are correct
   - [ ] Resource names valid

3. **iOS Swift:**
   - [ ] All Swift files compile
   - [ ] All properties accessible
   - [ ] Values are correct
   - [ ] No syntax errors

---

## 🚨 Risk Mitigation

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing consumers | High | Maintain dual-mode support during migration |
| Reference resolution errors | High | Comprehensive testing at each phase |
| Theme switching breaks | Medium | Test theme switching after each phase |
| Build script complexity | Medium | Incremental updates, test thoroughly |
| Token naming conflicts | Low | Use consistent naming convention |
| Missing tokens | Medium | Comparison tool to catch missing tokens |

### Rollback Plan

**If issues arise:**
1. Revert to previous phase
2. Keep both structures until stable
3. Fix issues in feature branch
4. Re-test before proceeding

**Rollback Commands:**
```bash
# Revert to hierarchical
git checkout main
git branch -D feature/flat-tokens-phase-X

# Or keep both
# Build script falls back to hierarchical if flat fails
```

---

## 📅 Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0: Preparation | 1-2 days | None |
| Phase 1: Raw Colors | 2-3 days | Phase 0 |
| Phase 2: Foundation | 3-4 days | Phase 1 |
| Phase 3: Semantic Colors | 4-5 days | Phase 1, 2 |
| Phase 4: Components | 3-4 days | Phase 3 |
| Phase 5: Build Script | 2-3 days | Phase 4 |
| Phase 6: Cleanup | 2-3 days | Phase 5 |
| **Total** | **17-24 days** | |

**With Buffer:** ~4-6 weeks

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ All tokens migrated
- ✅ Zero breaking changes
- ✅ Build time maintained or improved
- ✅ Output file sizes similar
- ✅ All platforms generate correctly

### Quality Metrics
- ✅ All tests pass
- ✅ No broken references
- ✅ Theme switching works
- ✅ Documentation complete
- ✅ Code review approved

---

## 📚 Resources

### Adobe Spectrum References
- [Spectrum Design Data](https://github.com/adobe/spectrum-design-data)
- [Token Naming Conventions](https://github.com/adobe/spectrum-design-data/blob/main/packages/tokens/README.md)
- [Token Schema](https://opensource.adobe.com/spectrum-design-data/schemas/)

### Tools
- UUID Generator: `uuid` npm package
- JSON Schema Validator: `ajv` npm package
- Comparison Tool: Custom script

---

## 📋 Next Steps

1. **Review this plan** with team
2. **Set up Phase 0** infrastructure
3. **Create feature branch**: `feature/flat-tokens-migration`
4. **Begin Phase 1** with raw colors
5. **Track progress** using checklists

---

**Last Updated:** [Date]
**Status:** Planning
**Owner:** [Your Name]

