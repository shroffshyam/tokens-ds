# Migration Example: Phase 1 - Raw Colors

This document shows a concrete example of migrating raw colors from hierarchical to flat structure.

## Before (Hierarchical)

**File:** `tokens/color/rawColors.json`

```json
{
  "color": {
    "rawColors": {
      "white": { "value": "#FFFFFF" },
      "black": { "value": "#000000" },
      "gray": {
        "50": { "value": "#FAFAFA" },
        "100": { "value": "#F5F5F5" },
        "500": { "value": "#9E9E9E" },
        "900": { "value": "#212121" }
      },
      "blue": {
        "50": { "value": "#E3F2FD" },
        "500": { "value": "#2196F3" },
        "600": { "value": "#1E88E5" }
      }
    }
  }
}
```

## After (Flat)

**File:** `tokens-flat/color.json`

```json
{
  "white": {
    "value": "#FFFFFF",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000001"
  },
  "black": {
    "value": "#000000",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000002"
  },
  "gray-50": {
    "value": "#FAFAFA",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000010"
  },
  "gray-100": {
    "value": "#F5F5F5",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000011"
  },
  "gray-500": {
    "value": "#9E9E9E",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000015"
  },
  "gray-900": {
    "value": "#212121",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000019"
  },
  "blue-50": {
    "value": "#E3F2FD",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000020"
  },
  "blue-500": {
    "value": "#2196F3",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000025"
  },
  "blue-600": {
    "value": "#1E88E5",
    "$schema": "https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json",
    "uuid": "a1b2c3d4-0001-4000-8000-000000000026"
  }
}
```

## Reference Updates

### Before (Hierarchical References)

```json
{
  "color": {
    "accent": {
      "primary": { "value": "{color.rawColors.blue.500}" }
    }
  }
}
```

### After (Flat References)

**During Migration (Dual Support):**
```json
{
  "accent-primary": {
    "value": "{blue-500}",
    "sets": {
      "classic-light": { "value": "{blue-500}" },
      "classic-dark": { "value": "{blue-400}" }
    }
  }
}
```

**Build Script Handles Both:**
```javascript
// Build script resolves both formats during migration
resolveReference("{color.rawColors.blue.500}") // → "#2196F3"
resolveReference("{blue-500}")                  // → "#2196F3"
```

## CSS Output Comparison

### Before (Hierarchical)
```css
:root {
  --color-rawColors-blue-500: #2196F3;
  --color-accent-primary: var(--color-rawColors-blue-500);
}
```

### After (Flat)
```css
:root {
  --blue-500: #2196F3;
  --accent-primary: var(--blue-500);
}
```

**Note:** Values are identical, only variable names change.

## Migration Script Example

```javascript
const { convertToFlat, loadHierarchicalTokens } = require('./scripts/migration-helper');

// Load hierarchical tokens
const hierarchical = loadHierarchicalTokens('./tokens/color');

// Convert to flat
const flatTokens = {};
for (const [path, token] of Object.entries(hierarchical)) {
  const { name, token: flatToken } = convertToFlat(path, token);
  flatTokens[name] = flatToken;
}

// Write flat tokens
fs.writeFileSync(
  './tokens-flat/color.json',
  JSON.stringify(flatTokens, null, 2)
);
```

## Validation

After migration, verify:

1. **Count Check:**
   ```bash
   # Count tokens in hierarchical
   jq '[.. | select(.value?)] | length' tokens/color/rawColors.json
   
   # Count tokens in flat
   jq 'length' tokens-flat/color.json
   
   # Should match
   ```

2. **Value Check:**
   ```bash
   # Extract all values and compare
   jq -r '.. | select(.value?) | .value' tokens/color/rawColors.json | sort > hierarchical-values.txt
   jq -r '.[] | .value' tokens-flat/color.json | sort > flat-values.txt
   diff hierarchical-values.txt flat-values.txt
   # Should be empty
   ```

3. **Reference Check:**
   ```bash
   # Check that references resolve correctly
   npm run build
   # Compare build/web/tokens.css outputs
   ```

## Next Steps

After Phase 1 is complete:
1. Update semantic tokens to reference flat color names
2. Test all 4 themes
3. Proceed to Phase 2 (Foundation tokens)

