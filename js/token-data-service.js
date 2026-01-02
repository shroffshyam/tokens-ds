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
            await this.processTokens();
        } catch (error) {
            console.error('Error loading tokens:', error);
            throw error;
        }
    }

    /**
     * Process loaded tokens into component and foundation arrays
     */
    async processTokens() {
        await this.processComponentTokens();
        this.processFoundationTokens();
    }

    /**
     * Process component tokens
     */
    async processComponentTokens() {
        this.componentTokens = [];

        // Load component token files directly to get original references
        const componentFiles = [
            'tokens/components/button.json',
            'tokens/components/card.json',
            'tokens/components/input.json',
            'tokens/components/typography.json'
        ];

        for (const filePath of componentFiles) {
            try {
                const response = await fetch(filePath);
                if (response.ok) {
                    const componentData = await response.json();
                    const componentName = filePath.split('/').pop().replace('.json', '');
                    const tokens = this.extractOriginalComponentTokens(componentData, componentName);

                    if (tokens.length > 0) {
                        this.componentTokens.push({
                            name: componentName,
                            tokens: tokens
                        });
                    }
                }
            } catch (error) {
                console.warn(`Could not load component file ${filePath}:`, error);
            }
        }

        // Fallback: use processed tokens if direct loading fails
        if (this.componentTokens.length === 0) {
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
    }

    /**
     * Extract original component tokens with references intact
     * @param {Object} componentData - Raw component data from JSON file
     * @param {string} componentName - Name of the component
     * @returns {Array} Array of token objects with original references
     */
    extractOriginalComponentTokens(componentData, componentName) {
        const tokens = [];

        const flattenObject = (obj, path = []) => {
            Object.keys(obj).forEach(key => {
                const currentPath = [...path, key];
                const value = obj[key];

                if (value && typeof value === 'object') {
                    if (value.value !== undefined) {
                        // This is a token definition
                        tokens.push({
                            name: `color.component.${componentName}.${currentPath.slice(1).join('.')}`,
                            value: value.value, // Original reference like {color.interactive.primary.default}
                            originalValue: value.value,
                            path: `color.component.${componentName}.${currentPath.slice(1).join('.')}`,
                            type: 'component'
                        });
                    } else {
                        // Continue recursing
                        flattenObject(value, currentPath);
                    }
                }
            });
        };

        flattenObject(componentData);
        return tokens;
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

    /**
     * Get color tokens
     * @returns {Array} Color tokens
     */
    getColorTokens() {
        return this.foundationTokens.filter(token =>
            token.path.startsWith('color.') &&
            !token.path.includes('component')
        );
    }

    /**
     * Get spacing tokens
     * @returns {Array} Spacing tokens
     */
    getSpacingTokens() {
        return this.foundationTokens.filter(token =>
            token.path.startsWith('spacing.')
        );
    }

    /**
     * Get typography tokens
     * @returns {Array} Typography tokens
     */
    getTypographyTokens() {
        return this.foundationTokens.filter(token =>
            token.path.startsWith('typography.')
        );
    }

    /**
     * Get stats about tokens
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            total: this.foundationTokens.length + this.componentTokens.reduce((sum, comp) => sum + comp.tokens.length, 0),
            colors: this.getColorTokens().length,
            components: this.componentTokens.length,
            spacing: this.getSpacingTokens().length,
            typography: this.getTypographyTokens().length
        };
    }

    /**
     * Get recent tokens (for overview)
     * @returns {Array} Recent tokens
     */
    getRecentTokens() {
        // Return first 6 tokens from each category for demo
        const recent = [];
        const colors = this.getColorTokens().slice(0, 2);
        const spacing = this.getSpacingTokens().slice(0, 2);
        const typography = this.getTypographyTokens().slice(0, 2);

        return [...colors, ...spacing, ...typography];
    }
}
