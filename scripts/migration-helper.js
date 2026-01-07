/**
 * Migration Helper Script
 * 
 * Utilities for migrating from hierarchical to flat token structure
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Convert hierarchical token path to flat kebab-case name
 * 
 * @param {string} hierarchicalPath - e.g., "color.rawColors.blue.500"
 * @returns {string} - e.g., "blue-500"
 */
function toFlatName(hierarchicalPath) {
  const parts = hierarchicalPath.split('.');
  
  // Remove common prefixes
  if (parts[0] === 'color' && parts[1] === 'rawColors') {
    // color.rawColors.blue.500 -> blue-500
    return parts.slice(2).join('-');
  }
  
  if (parts[0] === 'color') {
    // color.accent.primary -> accent-primary
    return parts.slice(1).join('-');
  }
  
  if (parts[0] === 'component') {
    // component.button.primary.background -> button-primary-background
    return parts.slice(1).join('-');
  }
  
  if (parts[0] === 'spacing') {
    // spacing.md -> spacing-md
    return parts.join('-');
  }
  
  if (parts[0] === 'borderRadius') {
    // borderRadius.md -> border-radius-md
    return 'border-radius-' + parts.slice(1).join('-');
  }
  
  // Default: join all parts with hyphens
  return parts.join('-');
}

/**
 * Convert flat token reference to hierarchical path
 * 
 * @param {string} flatRef - e.g., "blue-500"
 * @returns {string} - e.g., "color.rawColors.blue.500"
 */
function toHierarchicalPath(flatRef) {
  // This is a reverse mapping - may need manual updates
  // For now, try common patterns
  
  // Raw colors: blue-500 -> color.rawColors.blue.500
  const colorMatch = flatRef.match(/^([a-z]+)-(\d+)$/);
  if (colorMatch) {
    return `color.rawColors.${colorMatch[1]}.${colorMatch[2]}`;
  }
  
  // Semantic: accent-primary -> color.accent.primary
  if (flatRef.includes('-')) {
    const parts = flatRef.split('-');
    if (parts[0] === 'accent' || parts[0] === 'background' || parts[0] === 'text' || parts[0] === 'border') {
      return `color.${parts.join('.')}`;
    }
  }
  
  // Default: assume it's already hierarchical or needs manual mapping
  return flatRef;
}

/**
 * Generate UUID for a token
 */
function generateUUID() {
  return uuidv4();
}

/**
 * Get schema URL for token type
 * 
 * @param {string} tokenType - "color", "dimension", "alias", etc.
 * @returns {string} - Schema URL
 */
function getSchemaURL(tokenType) {
  const schemas = {
    color: 'https://opensource.adobe.com/spectrum-design-data/schemas/token-types/color.json',
    dimension: 'https://opensource.adobe.com/spectrum-design-data/schemas/token-types/dimension.json',
    alias: 'https://opensource.adobe.com/spectrum-design-data/schemas/token-types/alias.json',
    typography: 'https://opensource.adobe.com/spectrum-design-data/schemas/token-types/typography.json'
  };
  
  return schemas[tokenType] || schemas.alias;
}

/**
 * Detect token type from value
 */
function detectTokenType(value) {
  if (typeof value === 'string') {
    if (value.startsWith('#') || value.startsWith('rgb')) {
      return 'color';
    }
    if (value.endsWith('px') || value.endsWith('dp') || value.endsWith('sp')) {
      return 'dimension';
    }
    if (value.includes('{')) {
      return 'alias';
    }
  }
  return 'alias';
}

/**
 * Convert hierarchical token to flat format
 * 
 * @param {string} path - Token path
 * @param {object} token - Token object with value
 * @param {string} theme - Theme name (for semantic tokens)
 * @returns {object} - Flat token format
 */
function convertToFlat(path, token, theme = null) {
  const flatName = toFlatName(path);
  const tokenType = detectTokenType(token.value);
  
  const flatToken = {
    value: token.value,
    $schema: getSchemaURL(tokenType),
    uuid: generateUUID()
  };
  
  // For semantic tokens with theme variants, add sets
  if (theme && tokenType === 'alias') {
    flatToken.sets = {
      [theme]: { value: token.value }
    };
  }
  
  return { name: flatName, token: flatToken };
}

/**
 * Load hierarchical tokens from directory
 */
function loadHierarchicalTokens(dir) {
  const tokens = {};
  
  function walkDir(currentDir, prefix = '') {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      const newPrefix = prefix ? `${prefix}.${item.name}` : item.name;
      
      if (item.isDirectory()) {
        walkDir(fullPath, newPrefix);
      } else if (item.name.endsWith('.json')) {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        flattenObject(content, tokens, newPrefix.replace('.json', ''));
      }
    }
  }
  
  function flattenObject(obj, result, prefix) {
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (value && typeof value === 'object') {
        if (value.value !== undefined) {
          result[newKey] = value;
        } else {
          flattenObject(value, result, newKey);
        }
      }
    }
  }
  
  walkDir(dir);
  return tokens;
}

/**
 * Compare outputs from hierarchical vs flat
 */
function compareOutputs(hierarchicalOutput, flatOutput) {
  const differences = [];
  
  // Extract variable names and values
  const hierarchicalVars = extractCSSVariables(hierarchicalOutput);
  const flatVars = extractCSSVariables(flatOutput);
  
  // Compare values (ignore variable names)
  for (const [name, value] of Object.entries(hierarchicalVars)) {
    const flatValue = Object.values(flatVars).find(v => v === value);
    if (!flatValue) {
      differences.push({
        type: 'missing',
        hierarchical: name,
        value: value
      });
    }
  }
  
  return differences;
}

function extractCSSVariables(css) {
  const vars = {};
  const regex = /--([^:]+):\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(css)) !== null) {
    vars[match[1].trim()] = match[2].trim();
  }
  
  return vars;
}

module.exports = {
  toFlatName,
  toHierarchicalPath,
  generateUUID,
  getSchemaURL,
  detectTokenType,
  convertToFlat,
  loadHierarchicalTokens,
  compareOutputs
};

