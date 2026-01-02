/**
 * Configuration constants for the Token Explorer
 */
const CONFIG = {
    // API endpoints
    TOKENS_JSON_PATH: 'build/web/tokens.json',

    // DOM selectors
    SELECTORS: {
        THEME_TOGGLE: '#themeToggle',
        TAB: '.tab',
        TAB_CONTENT: '.tab-content',
        COMPONENT_GRID: '#component-grid',
        FOUNDATION_TABLE_BODY: '#foundationTableBody',
        TOKEN_TYPE_FILTER: '#tokenType',
        THEME_FILTER: '#themeFilter',
        // Stats
        TOTAL_TOKENS: '#total-tokens',
        COLOR_TOKENS: '#color-tokens',
        COMPONENT_COUNT: '#component-count',
        RECENT_TOKENS: '#recent-tokens-list',
        // Search inputs
        COLOR_SEARCH: '#color-search',
        SPACING_SEARCH: '#spacing-search',
        TYPOGRAPHY_SEARCH: '#typography-search',
        COMPONENT_SEARCH: '#component-search',
        RELATIONSHIP_SEARCH: '#relationship-search',
        // Clear buttons
        CLEAR_COLOR_SEARCH: '#clear-color-search',
        CLEAR_SPACING_SEARCH: '#clear-spacing-search',
        CLEAR_TYPOGRAPHY_SEARCH: '#clear-typography-search',
        CLEAR_COMPONENT_SEARCH: '#clear-component-search',
        CLEAR_RELATIONSHIP_SEARCH: '#clear-relationship-search',
        // Grids
        COLOR_GRID: '#color-grid',
        SPACING_GRID: '#spacing-grid',
        TYPOGRAPHY_GRID: '#typography-grid',
        RELATIONSHIP_GRAPH: '#relationship-graph'
    },

    // CSS classes
    CLASSES: {
        ACTIVE: 'active',
        TOKEN_ITEM: 'token-item',
        TOKEN_COLOR: 'token-color',
        TOKEN_INFO: 'token-info',
        TOKEN_NAME: 'token-name',
        TOKEN_VALUE: 'token-value',
        COMPONENT_CARD: 'component-card',
        COMPONENT_NAME: 'component-name',
        TOKEN_LIST: 'token-list',
        TOKEN_NAME_CELL: 'token-name-cell',
        TOKEN_VALUE_CELL: 'token-value-cell',
        THEME_INDICATOR: 'theme-indicator',
        THEME_PREFIX: 'theme-',
        COLOR_PREVIEW: 'color-preview',
        NO_RESULTS: 'no-results'
    },

    // Token types
    TOKEN_TYPES: {
        COLOR: 'color',
        SIZE: 'size',
        FONT_SIZE: 'fontSize',
        FONT_WEIGHT: 'fontWeight',
        LINE_HEIGHT: 'lineHeight',
        FONT_FAMILY: 'fontFamily'
    },

    // Theme names
    THEMES: {
        CLASSIC_LIGHT: 'classic-light',
        CLASSIC_DARK: 'classic-dark',
        ADVANCE_LIGHT: 'advance-light',
        ADVANCE_DARK: 'advance-dark',
        COMMON: 'common',
        ALL: 'all'
    },

    // Filter options
    FILTERS: {
        ALL: 'all'
    },

    // Local storage keys
    STORAGE_KEYS: {
        THEME: 'theme'
    },

    // Token processing
    TOKEN_PROCESSING: {
        FOUNDATION_TYPES: ['size', 'fontSize', 'fontWeight', 'lineHeight', 'fontFamily'],
        FOUNDATION_PATHS: ['foundation', 'spacing']
    }
};

Object.freeze(CONFIG);
