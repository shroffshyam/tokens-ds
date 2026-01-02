/**
 * Token Data Service - Responsible for loading and managing token data
 * Single Responsibility: Handle all token data operations
 */
class TokenDataService {
    constructor() {
        this.tokens = null;
        this.componentTokens = [];
        this.foundationTokens = [];
    }

    /**
     * Load tokens from JSON file
     * @returns {Promise<void>}
     */
    async loadTokens() {
        try {
            const response = await fetch(CONFIG.TOKENS_JSON_PATH);
            if (!response.ok) {
                throw new Error(`Failed to load tokens: ${response.status}`);
            }

            this.tokens = await response.json();
            this.processTokens();
        } catch (error) {
            console.error('Error loading tokens:', error);
            throw error;
        }
    }

    /**
     * Process loaded tokens into component and foundation arrays
     */
    processTokens() {
        this.processComponentTokens();
        this.processFoundationTokens();
    }

    /**
     * Process component tokens
     */
    processComponentTokens() {
        this.componentTokens = [];

        const components = this.tokens?.color?.component || {};

        Object.keys(components).forEach(componentName => {
            const componentData = components[componentName];
            const tokens = TokenUtils.flattenTokens(componentData, componentName);

            this.componentTokens.push({
                name: componentName,
                tokens: tokens
            });
        });
    }

    /**
     * Process foundation tokens
     */
    processFoundationTokens() {
        this.foundationTokens = [];

        // Process color foundation tokens (light/dark themes)
        if (this.tokens?.color?.foundation) {
            Object.keys(this.tokens.color.foundation).forEach(themeKey => {
                const themeData = this.tokens.color.foundation[themeKey];
                const tokens = TokenUtils.flattenTokens(themeData, `color.foundation.${themeKey}`);

                tokens.forEach(token => {
                    this.foundationTokens.push({
                        ...token,
                        theme: themeKey,
                        type: CONFIG.TOKEN_TYPES.COLOR
                    });
                });
            });
        }

        // Process other foundation tokens (size, fontSize, etc.)
        CONFIG.TOKEN_PROCESSING.FOUNDATION_TYPES.forEach(tokenType => {
            const typeData = this.tokens?.[tokenType]?.foundation || this.tokens?.[tokenType]?.spacing;
            if (typeData) {
                const tokens = TokenUtils.flattenTokens(typeData, `${tokenType}.foundation`);
                tokens.forEach(token => {
                    this.foundationTokens.push({
                        ...token,
                        theme: CONFIG.THEMES.COMMON,
                        type: tokenType
                    });
                });
            }
        });
    }

    /**
     * Get component tokens
     * @returns {Array} Component tokens
     */
    getComponentTokens() {
        return this.componentTokens;
    }

    /**
     * Get foundation tokens
     * @returns {Array} Foundation tokens
     */
    getFoundationTokens() {
        return this.foundationTokens;
    }

    /**
     * Filter foundation tokens
     * @param {string} typeFilter - Type filter
     * @param {string} themeFilter - Theme filter
     * @returns {Array} Filtered tokens
     */
    filterFoundationTokens(typeFilter, themeFilter) {
        return this.foundationTokens.filter(token => {
            const typeMatch = typeFilter === CONFIG.FILTERS.ALL || token.type === typeFilter;
            const themeMatch = themeFilter === CONFIG.FILTERS.ALL || token.theme === themeFilter;
            return typeMatch && themeMatch;
        });
    }

    /**
     * Get available token types
     * @returns {Array} Token types
     */
    getTokenTypes() {
        const types = new Set(this.foundationTokens.map(token => token.type));
        return Array.from(types).sort();
    }

    /**
     * Get available themes
     * @returns {Array} Themes
     */
    getThemes() {
        const themes = new Set(this.foundationTokens.map(token => token.theme));
        return Array.from(themes).sort();
    }
}
