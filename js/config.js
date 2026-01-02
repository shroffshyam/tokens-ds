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
        COMPONENT_GRID: '#componentGrid',
        FOUNDATION_TABLE_BODY: '#foundationTableBody',
        TOKEN_TYPE_FILTER: '#tokenType',
        THEME_FILTER: '#themeFilter'
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
        LIGHT: 'light',
        DARK: 'dark',
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
