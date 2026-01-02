/**
 * Token Renderer - Responsible for rendering tokens to the DOM
 * Single Responsibility: Handle all token rendering operations
 */
class TokenRenderer {
    constructor() {
        this.dataService = null;
    }

    /**
     * Set data service reference
     * @param {TokenDataService} dataService - Token data service
     */
    setDataService(dataService) {
        this.dataService = dataService;
    }

    /**
     * Render overview stats
     */
    renderOverview() {
        const stats = this.dataService.getStats();

        DOMUtils.getElement(CONFIG.SELECTORS.TOTAL_TOKENS).textContent = stats.total;
        DOMUtils.getElement(CONFIG.SELECTORS.COLOR_TOKENS).textContent = stats.colors;
        DOMUtils.getElement(CONFIG.SELECTORS.COMPONENT_COUNT).textContent = stats.components;

        this.renderRecentTokens();
    }

    /**
     * Render recent tokens
     */
    renderRecentTokens() {
        const recentTokens = this.dataService.getRecentTokens();
        const container = DOMUtils.getElement(CONFIG.SELECTORS.RECENT_TOKENS);

        container.innerHTML = '';

        recentTokens.forEach(token => {
            const tokenItem = this.createTokenItem(token, true);
            container.appendChild(tokenItem);
        });
    }

    /**
     * Render color tokens grid
     */
    renderColorTokens(searchTerm = '') {
        const colors = this.dataService.getColorTokens();
        const filteredColors = searchTerm ?
            colors.filter(color => color.name.toLowerCase().includes(searchTerm.toLowerCase())) :
            colors;

        const container = DOMUtils.getElement(CONFIG.SELECTORS.COLOR_GRID);
        container.innerHTML = '';

        if (filteredColors.length === 0) {
            container.innerHTML = '<div class="no-results">No colors found matching your search.</div>';
            return;
        }

        filteredColors.forEach(color => {
            const colorCard = this.createColorCard(color);
            container.appendChild(colorCard);
        });
    }

    /**
     * Render spacing tokens grid
     */
    renderSpacingTokens(searchTerm = '') {
        const spacing = this.dataService.getSpacingTokens();
        const filteredSpacing = searchTerm ?
            spacing.filter(token => token.name.toLowerCase().includes(searchTerm.toLowerCase())) :
            spacing;

        const container = DOMUtils.getElement(CONFIG.SELECTORS.SPACING_GRID);
        container.innerHTML = '';

        if (filteredSpacing.length === 0) {
            container.innerHTML = '<div class="no-results">No spacing tokens found matching your search.</div>';
            return;
        }

        filteredSpacing.forEach(token => {
            const spacingCard = this.createSpacingCard(token);
            container.appendChild(spacingCard);
        });
    }

    /**
     * Render typography tokens grid
     */
    renderTypographyTokens(searchTerm = '') {
        const typography = this.dataService.getTypographyTokens();
        const filteredTypography = searchTerm ?
            typography.filter(token => token.name.toLowerCase().includes(searchTerm.toLowerCase())) :
            typography;

        const container = DOMUtils.getElement(CONFIG.SELECTORS.TYPOGRAPHY_GRID);
        container.innerHTML = '';

        if (filteredTypography.length === 0) {
            container.innerHTML = '<div class="no-results">No typography tokens found matching your search.</div>';
            return;
        }

        filteredTypography.forEach(token => {
            const typographyCard = this.createTypographyCard(token);
            container.appendChild(typographyCard);
        });
    }

    /**
     * Render component tokens as rows
     */
    renderComponentTokens(searchTerm = '') {
        const components = this.dataService.getComponentTokens();
        const filteredComponents = searchTerm ?
            components.filter(component => component.name.toLowerCase().includes(searchTerm.toLowerCase())) :
            components;

        const container = DOMUtils.getElement(CONFIG.SELECTORS.COMPONENT_GRID);
        container.innerHTML = '';

        if (filteredComponents.length === 0) {
            container.innerHTML = '<div class="no-results">No components found matching your search.</div>';
            return;
        }

        // Create table structure
        const table = DOMUtils.createElement('table', 'component-table');
        const thead = DOMUtils.createElement('thead');
        const headerRow = DOMUtils.createElement('tr');

        const headers = ['Component', 'Tokens Used', 'Foundation Dependencies'];
        headers.forEach(headerText => {
            const th = DOMUtils.createElement('th', '', { textContent: headerText });
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = DOMUtils.createElement('tbody');

        filteredComponents.forEach(component => {
            const row = this.createComponentRow(component);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);
    }

    /**
     * Render component relationships visualization
     */
    renderComponentRelationships(searchTerm = '') {
        const components = this.dataService.getComponentTokens();
        const filteredComponents = searchTerm ?
            components.filter(component => component.name.toLowerCase().includes(searchTerm.toLowerCase())) :
            components;

        const container = DOMUtils.getElement(CONFIG.SELECTORS.RELATIONSHIP_GRAPH);
        container.innerHTML = '';

        if (filteredComponents.length === 0) {
            container.innerHTML = '<div class="no-results">No components found for relationship visualization.</div>';
            return;
        }

        // Create relationship visualization
        const visualization = DOMUtils.createElement('div', 'relationship-visualization');

        // Header
        const header = DOMUtils.createElement('div', 'relationship-header');
        header.innerHTML = `
            <h3>Component → Foundation Token Relationships</h3>
            <p>Visual representation of how components depend on foundation tokens</p>
        `;
        visualization.appendChild(header);

        // Relationship list
        const relationshipList = DOMUtils.createElement('div', 'relationship-list');

        filteredComponents.forEach(component => {
            const relationshipItem = this.createRelationshipItem(component);
            relationshipList.appendChild(relationshipItem);
        });

        visualization.appendChild(relationshipList);
        container.appendChild(visualization);
    }

    /**
     * Create component row for table display
     * @param {Object} component - Component data
     * @returns {HTMLElement} Table row
     */
    createComponentRow(component) {
        const row = DOMUtils.createElement('tr', 'component-row');

        // Component name cell
        const nameCell = DOMUtils.createElement('td', 'component-name-cell');
        const nameDiv = DOMUtils.createElement('div', 'component-name', { textContent: component.name });
        const tokenCount = DOMUtils.createElement('div', 'token-count', {
            textContent: `${component.tokens.length} tokens`
        });
        nameCell.appendChild(nameDiv);
        nameCell.appendChild(tokenCount);
        row.appendChild(nameCell);

        // Tokens used cell
        const tokensCell = DOMUtils.createElement('td', 'tokens-cell');
        const tokenList = DOMUtils.createElement('div', 'token-list-detailed');

        component.tokens.forEach(token => {
            const tokenItem = DOMUtils.createElement('div', 'token-item-detailed');

            const tokenName = DOMUtils.createElement('code', 'token-name-code', {
                textContent: token.name
            });

            const tokenValue = DOMUtils.createElement('span', 'token-value-text', {
                textContent: token.value
            });

            // Add color preview if it's a color token
            const colorValue = TokenUtils.getTokenColorValue(token);
            if (colorValue) {
                const colorPreview = TokenUtils.createColorPreview(colorValue, 'small');
                tokenItem.appendChild(colorPreview);
            }

            tokenItem.appendChild(tokenName);
            tokenItem.appendChild(document.createTextNode(' → '));
            tokenItem.appendChild(tokenValue);

            // Add copy button
            const copyBtn = DOMUtils.createElement('button', 'copy-btn-small', {
                textContent: '📋',
                title: 'Copy token name',
                onclick: () => this.copyToClipboard(token.name)
            });
            tokenItem.appendChild(copyBtn);

            tokenList.appendChild(tokenItem);
        });

        tokensCell.appendChild(tokenList);
        row.appendChild(tokensCell);

        // Foundation dependencies cell
        const dependenciesCell = DOMUtils.createElement('td', 'dependencies-cell');
        const dependencies = this.extractFoundationDependencies(component);
        const dependencyList = DOMUtils.createElement('div', 'dependency-list');

        dependencies.slice(0, 3).forEach(dep => {
            const depChip = DOMUtils.createElement('span', 'dependency-chip', {
                textContent: dep
            });
            dependencyList.appendChild(depChip);
        });

        if (dependencies.length > 3) {
            const moreChip = DOMUtils.createElement('span', 'dependency-chip more', {
                textContent: `+${dependencies.length - 3} more`
            });
            dependencyList.appendChild(moreChip);
        }

        dependenciesCell.appendChild(dependencyList);
        row.appendChild(dependenciesCell);

        return row;
    }

    /**
     * Create relationship visualization item
     * @param {Object} component - Component data
     * @returns {HTMLElement} Relationship item
     */
    createRelationshipItem(component) {
        const item = DOMUtils.createElement('div', 'relationship-item');

        // Component header
        const header = DOMUtils.createElement('div', 'relationship-component-header');
        const componentIcon = DOMUtils.createElement('span', 'component-icon', { textContent: '🧩' });
        const componentName = DOMUtils.createElement('h4', '', { textContent: component.name });
        header.appendChild(componentIcon);
        header.appendChild(componentName);
        item.appendChild(header);

        // Dependencies flow
        const flow = DOMUtils.createElement('div', 'dependency-flow');

        // Component box
        const componentBox = DOMUtils.createElement('div', 'flow-component');
        componentBox.textContent = component.name;
        flow.appendChild(componentBox);

        // Arrow
        const arrow = DOMUtils.createElement('div', 'flow-arrow', { textContent: '→' });
        flow.appendChild(arrow);

        // Foundation tokens
        const foundationBox = DOMUtils.createElement('div', 'flow-foundation');
        const dependencies = this.extractFoundationDependencies(component);

        dependencies.forEach(dep => {
            const depItem = DOMUtils.createElement('div', 'foundation-token', { textContent: dep });
            foundationBox.appendChild(depItem);
        });

        flow.appendChild(foundationBox);
        item.appendChild(flow);

        // Token relationship details
        const details = DOMUtils.createElement('div', 'relationship-details');
        component.tokens.forEach(token => {
            const relationshipChain = this.buildTokenRelationshipChain(token);
            const tokenDetail = this.createTokenRelationshipDetail(token, relationshipChain);
            details.appendChild(tokenDetail);
        });

        item.appendChild(details);

        return item;
    }

    /**
     * Extract foundation dependencies from component tokens
     * @param {Object} component - Component data
     * @returns {Array} Foundation dependency paths
     */
    extractFoundationDependencies(component) {
        const dependencies = new Set();

        component.tokens.forEach(token => {
            if (token.value && token.value.includes('{')) {
                // Extract references like {color.interactive.primary.default}
                const matches = token.value.match(/\{([^}]+)\}/g);
                if (matches) {
                    matches.forEach(match => {
                        const ref = match.slice(1, -1); // Remove { }
                        const parts = ref.split('.');
                        if (parts.length >= 2) {
                            // Group by category (color, spacing, typography)
                            dependencies.add(`${parts[0]}.${parts[1]}`);
                        }
                    });
                }
            }
        });

        return Array.from(dependencies).sort();
    }

    /**
     * Build complete token relationship chain: Component Token → Foundation Token → Raw Color
     * @param {Object} componentToken - Component token data
     * @returns {Object} Relationship chain data
     */
    buildTokenRelationshipChain(componentToken) {
        const chain = {
            componentToken: componentToken,
            foundationTokens: [],
            rawColors: []
        };

        // Parse the component token value for references
        if (componentToken.originalValue && componentToken.originalValue.includes('{')) {
            const matches = componentToken.originalValue.match(/\{([^}]+)\}/g);
            if (matches) {
                matches.forEach(match => {
                    const ref = match.slice(1, -1); // Remove { }
                    const foundationToken = this.findFoundationTokenByPath(ref);
                    if (foundationToken) {
                        chain.foundationTokens.push(foundationToken);

                        // Find raw colors referenced by this foundation token
                        const rawColors = this.findRawColorsInToken(foundationToken);
                        chain.rawColors.push(...rawColors);
                    }
                });
            }
        }
        return chain;
    }

    /**
     * Find foundation token by path
     * @param {string} path - Token path (e.g., "color.interactive.primary.default")
     * @returns {Object|null} Foundation token or null
     */
    findFoundationTokenByPath(path) {
        const allFoundationTokens = [
            ...this.dataService.getColorTokens(),
            ...this.dataService.getSpacingTokens(),
            ...this.dataService.getTypographyTokens()
        ];

        return allFoundationTokens.find(token => {
            const tokenPath = token.path || token.name;
            return tokenPath === path ||
                   token.name === path ||
                   tokenPath.replace(/\./g, '-') === path.replace(/\./g, '-');
        });
    }

    /**
     * Find raw colors referenced in a token
     * @param {Object} token - Token to analyze
     * @returns {Array} Raw color tokens
     */
    findRawColorsInToken(token) {
        const rawColors = [];

        if (token.value && token.value.includes('{')) {
            const matches = token.value.match(/\{([^}]+)\}/g);
            if (matches) {
                matches.forEach(match => {
                    const ref = match.slice(1, -1); // Remove { }
                    if (ref.startsWith('color.rawColors')) {
                        // This is a direct raw color reference
                        const rawColor = this.findRawColorByPath(ref);
                        if (rawColor) {
                            rawColors.push(rawColor);
                        }
                    } else {
                        // This might be another foundation token, recurse
                        const foundationToken = this.findFoundationTokenByPath(ref);
                        if (foundationToken) {
                            const nestedColors = this.findRawColorsInToken(foundationToken);
                            rawColors.push(...nestedColors);
                        }
                    }
                });
            }
        } else if (token.value && token.value.startsWith('#')) {
            // Direct color value
            rawColors.push({
                name: token.name,
                value: token.value,
                type: 'direct'
            });
        }

        return rawColors;
    }

    /**
     * Find raw color by path
     * @param {string} path - Raw color path
     * @returns {Object|null} Raw color token or null
     */
    findRawColorByPath(path) {
        // Since rawColors are processed into the foundation tokens,
        // we need to look for tokens that have raw color references
        const allTokens = [
            ...this.dataService.getColorTokens(),
            ...this.dataService.getSpacingTokens(),
            ...this.dataService.getTypographyTokens()
        ];

        // Find a token that matches this raw color path
        for (const token of allTokens) {
            if (token.value && !token.value.includes('{') && (
                token.value.startsWith('#') ||
                token.value.startsWith('rgb') ||
                token.value.startsWith('hsl')
            )) {
                // Check if this could be the raw color we're looking for
                const pathParts = path.split('.');
                const colorName = pathParts[pathParts.length - 1];
                if (token.name.includes(colorName) || token.path.includes(colorName)) {
                    return {
                        name: path,
                        value: token.value,
                        type: 'raw'
                    };
                }
            }
        }

        // Fallback: try to find any token with a direct color value
        for (const token of allTokens) {
            if (token.value && !token.value.includes('{') &&
                (token.value.startsWith('#') || token.value.startsWith('rgb') || token.value.startsWith('hsl'))) {
                return {
                    name: path,
                    value: token.value,
                    type: 'resolved'
                };
            }
        }

        // Last resort: return a placeholder
        return {
            name: path.split('.').pop(),
            value: '#cccccc',
            type: 'placeholder'
        };
    }

    /**
     * Create detailed token relationship visualization
     * @param {Object} componentToken - Component token
     * @param {Object} chain - Relationship chain data
     * @returns {HTMLElement} Relationship detail element
     */
    createTokenRelationshipDetail(componentToken, chain) {
        const container = DOMUtils.createElement('div', 'token-relationship-chain');

        // Component token
        const componentBox = DOMUtils.createElement('div', 'chain-component-token');
        const componentName = DOMUtils.createElement('code', 'chain-token-name', {
            textContent: componentToken.name
        });
        const componentValue = DOMUtils.createElement('span', 'chain-token-value', {
            textContent: componentToken.value
        });

        // Add color preview if applicable
        const colorValue = TokenUtils.getTokenColorValue(componentToken);
        if (colorValue) {
            const colorPreview = TokenUtils.createColorPreview(colorValue, 'tiny');
            componentBox.appendChild(colorPreview);
        }

        componentBox.appendChild(componentName);
        componentBox.appendChild(document.createTextNode(' = '));
        componentBox.appendChild(componentValue);

        container.appendChild(componentBox);

        // Foundation tokens
        if (chain.foundationTokens.length > 0) {
            const arrow1 = DOMUtils.createElement('span', 'chain-arrow', { textContent: '→' });
            container.appendChild(arrow1);

            const foundationContainer = DOMUtils.createElement('div', 'chain-foundation-tokens');
            chain.foundationTokens.forEach(foundationToken => {
                const foundationBox = DOMUtils.createElement('div', 'chain-foundation-token');

                const foundationName = DOMUtils.createElement('code', 'chain-token-name', {
                    textContent: foundationToken.name
                });
                const foundationValue = DOMUtils.createElement('span', 'chain-token-value', {
                    textContent: foundationToken.value
                });

                foundationBox.appendChild(foundationName);
                foundationBox.appendChild(document.createTextNode(' = '));
                foundationBox.appendChild(foundationValue);

                foundationContainer.appendChild(foundationBox);
            });
            container.appendChild(foundationContainer);
        }

        // Raw colors
        if (chain.rawColors.length > 0) {
            const arrow2 = DOMUtils.createElement('span', 'chain-arrow', { textContent: '→' });
            container.appendChild(arrow2);

            const rawColorsContainer = DOMUtils.createElement('div', 'chain-raw-colors');
            chain.rawColors.forEach(rawColor => {
                const rawColorBox = DOMUtils.createElement('div', 'chain-raw-color');

                const rawColorName = DOMUtils.createElement('code', 'chain-token-name', {
                    textContent: rawColor.name
                });
                const rawColorValue = DOMUtils.createElement('span', 'chain-token-value', {
                    textContent: rawColor.value
                });

                // Add color preview for raw colors
                if (rawColor.value && rawColor.value.startsWith('#')) {
                    const colorPreview = TokenUtils.createColorPreview(rawColor.value, 'tiny');
                    rawColorBox.appendChild(colorPreview);
                }

                rawColorBox.appendChild(rawColorName);
                rawColorBox.appendChild(document.createTextNode(' = '));
                rawColorBox.appendChild(rawColorValue);

                rawColorsContainer.appendChild(rawColorBox);
            });
            container.appendChild(rawColorsContainer);
        }

        return container;
    }

    /**
     * Create color card element
     * @param {Object} color - Color token data
     * @returns {HTMLElement} Color card
     */
    createColorCard(color) {
        const card = DOMUtils.createElement('div', 'color-card');

        const colorPreview = DOMUtils.createElement('div', 'color-preview-large');
        colorPreview.style.backgroundColor = color.value;

        const colorInfo = DOMUtils.createElement('div', 'color-info');
        const colorName = DOMUtils.createElement('div', 'color-name', {
            textContent: color.name
        });
        const colorValue = DOMUtils.createElement('div', 'color-value', {
            textContent: color.value
        });

        const actions = DOMUtils.createElement('div', 'token-actions');
        const copyBtn = DOMUtils.createElement('button', 'copy-btn', {
            textContent: 'Copy',
            onclick: () => this.copyToClipboard(color.name)
        });

        colorInfo.appendChild(colorName);
        colorInfo.appendChild(colorValue);
        actions.appendChild(copyBtn);

        card.appendChild(colorPreview);
        card.appendChild(colorInfo);
        card.appendChild(actions);

        return card;
    }

    /**
     * Create spacing card element
     * @param {Object} token - Spacing token data
     * @returns {HTMLElement} Spacing card
     */
    createSpacingCard(token) {
        const card = DOMUtils.createElement('div', 'spacing-card');

        const visual = DOMUtils.createElement('div', 'spacing-visual');
        visual.style.width = token.value;
        visual.style.height = '20px';
        visual.style.backgroundColor = 'var(--color-interactive-primary-default)';

        const info = DOMUtils.createElement('div', 'spacing-info');
        const name = DOMUtils.createElement('div', 'token-name', {
            textContent: token.name
        });
        const value = DOMUtils.createElement('div', 'token-value', {
            textContent: token.value
        });

        const actions = DOMUtils.createElement('div', 'token-actions');
        const copyBtn = DOMUtils.createElement('button', 'copy-btn', {
            textContent: 'Copy',
            onclick: () => this.copyToClipboard(token.name)
        });

        info.appendChild(name);
        info.appendChild(value);
        actions.appendChild(copyBtn);

        card.appendChild(visual);
        card.appendChild(info);
        card.appendChild(actions);

        return card;
    }

    /**
     * Create typography card element
     * @param {Object} token - Typography token data
     * @returns {HTMLElement} Typography card
     */
    createTypographyCard(token) {
        const card = DOMUtils.createElement('div', 'typography-card');

        const preview = DOMUtils.createElement('div', 'typography-preview', {
            textContent: 'The quick brown fox jumps over the lazy dog'
        });

        // Apply typography styles
        if (token.name.includes('size')) {
            preview.style.fontSize = token.value;
        } else if (token.name.includes('weight')) {
            preview.style.fontWeight = token.value;
        } else if (token.name.includes('family')) {
            preview.style.fontFamily = token.value;
        } else if (token.name.includes('height')) {
            preview.style.lineHeight = token.value;
        }

        const info = DOMUtils.createElement('div', 'typography-info');
        const name = DOMUtils.createElement('div', 'token-name', {
            textContent: token.name
        });
        const value = DOMUtils.createElement('div', 'token-value', {
            textContent: token.value
        });

        const actions = DOMUtils.createElement('div', 'token-actions');
        const copyBtn = DOMUtils.createElement('button', 'copy-btn', {
            textContent: 'Copy',
            onclick: () => this.copyToClipboard(token.name)
        });

        info.appendChild(name);
        info.appendChild(value);
        actions.appendChild(copyBtn);

        card.appendChild(preview);
        card.appendChild(info);
        card.appendChild(actions);

        return card;
    }

    /**
     * Create component card element
     * @param {Object} component - Component data
     * @returns {HTMLElement} Component card
     */
    createComponentCard(component) {
        const card = DOMUtils.createElement('div', CONFIG.CLASSES.COMPONENT_CARD);

        const title = DOMUtils.createElement('h3', CONFIG.CLASSES.COMPONENT_NAME, {
            textContent: component.name
        });
        card.appendChild(title);

        const tokenList = DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_LIST);
        component.tokens.forEach(token => {
            const tokenItem = this.createTokenItem(token);
            tokenList.appendChild(tokenItem);
        });
        card.appendChild(tokenList);

        return card;
    }

    /**
     * Create token item element
     * @param {Object} token - Token data
     * @returns {HTMLElement} Token item
     */
    createTokenItem(token, compact = false) {
        const item = DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_ITEM);

        // Add color preview or placeholder
        const colorValue = TokenUtils.getTokenColorValue(token);
        if (colorValue) {
            const colorPreview = TokenUtils.createColorPreview(colorValue);
            item.appendChild(colorPreview);
        } else {
            const placeholder = TokenUtils.createColorPlaceholder();
            item.appendChild(placeholder);
        }

        // Add token info
        const info = DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_INFO);

        const name = DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_NAME, {
            textContent: token.name
        });
        info.appendChild(name);

        if (!compact) {
            const value = DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_VALUE, {
                textContent: token.value
            });
            info.appendChild(value);
        }

        item.appendChild(info);

        // Add actions
        const actions = DOMUtils.createElement('div', 'token-actions');
        const copyBtn = DOMUtils.createElement('button', 'copy-btn', {
            textContent: 'Copy',
            onclick: () => this.copyToClipboard(token.name)
        });
        actions.appendChild(copyBtn);
        item.appendChild(actions);

        return item;
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            // Show visual feedback
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                const btn = event.target;
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed: ', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    }

    /**
     * Render foundation tokens table
     * @param {Array} tokens - Tokens to render
     */
    renderFoundationTokens(tokens) {
        const tableBody = DOMUtils.getElement(CONFIG.SELECTORS.FOUNDATION_TABLE_BODY);

        if (tokens.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="${CONFIG.CLASSES.NO_RESULTS}">No tokens match the current filters.</td></tr>`;
            return;
        }

        tableBody.innerHTML = '';

        tokens.forEach(token => {
            const row = this.createFoundationTokenRow(token);
            tableBody.appendChild(row);
        });
    }

    /**
     * Create foundation token table row
     * @param {Object} token - Token data
     * @returns {HTMLElement} Table row
     */
    createFoundationTokenRow(token) {
        const row = DOMUtils.createElement('tr');

        // Token name cell
        const nameCell = DOMUtils.createElement('td', CONFIG.CLASSES.TOKEN_NAME_CELL);

        // Add color preview for color tokens
        if (token.type === CONFIG.TOKEN_TYPES.COLOR && token.value.startsWith('#')) {
            const colorPreview = DOMUtils.createElement('span', CONFIG.CLASSES.COLOR_PREVIEW, {
                style: { backgroundColor: token.value }
            });
            nameCell.appendChild(colorPreview);
        }

        nameCell.appendChild(document.createTextNode(token.name));
        row.appendChild(nameCell);

        // Token value cell
        const valueCell = DOMUtils.createElement('td', CONFIG.CLASSES.TOKEN_VALUE_CELL, {
            textContent: token.value
        });
        row.appendChild(valueCell);

        // Theme cell
        const themeCell = DOMUtils.createElement('td');
        const themeIndicator = DOMUtils.createElement('span',
            `${CONFIG.CLASSES.THEME_INDICATOR} ${CONFIG.CLASSES.THEME_PREFIX}${token.theme}`,
            { textContent: token.theme }
        );
        themeCell.appendChild(themeIndicator);
        row.appendChild(themeCell);

        // Type cell
        const typeCell = DOMUtils.createElement('td', '', {
            textContent: token.type
        });
        row.appendChild(typeCell);

        return row;
    }
}

/**
 * Theme Manager - Handles theme switching and persistence
 * Single Responsibility: Manage theme state and switching
 */
class ThemeManager {
    constructor() {
        this.currentTheme = CONFIG.THEMES.CLASSIC_LIGHT;
        this.init();
    }

    /**
     * Initialize theme from storage
     */
    init() {
        const savedTheme = StorageUtils.get(CONFIG.STORAGE_KEYS.THEME, CONFIG.THEMES.CLASSIC_LIGHT);
        this.setTheme(savedTheme);
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Set theme
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        StorageUtils.set(CONFIG.STORAGE_KEYS.THEME, theme);
    }

    /**
     * Toggle between classic-light, classic-dark, advance-light, advance-dark themes
     */
    toggleTheme() {
        let newTheme;
        if (this.currentTheme === CONFIG.THEMES.CLASSIC_LIGHT) {
            newTheme = CONFIG.THEMES.CLASSIC_DARK;
        } else if (this.currentTheme === CONFIG.THEMES.CLASSIC_DARK) {
            newTheme = CONFIG.THEMES.ADVANCE_LIGHT;
        } else if (this.currentTheme === CONFIG.THEMES.ADVANCE_LIGHT) {
            newTheme = CONFIG.THEMES.ADVANCE_DARK;
        } else {
            newTheme = CONFIG.THEMES.CLASSIC_LIGHT;
        }
        this.setTheme(newTheme);
    }
}

/**
 * UI Manager - Handles UI interactions and state
 * Single Responsibility: Manage UI interactions and coordinate components
 */
class UIManager {
    constructor(tokenRenderer, tokenDataService, themeManager) {
        this.renderer = tokenRenderer;
        this.dataService = tokenDataService;
        this.themeManager = themeManager;
        this.currentTab = 'hierarchy';
    }

    /**
     * Initialize UI event listeners
     */
    init() {
        this.setupTabSwitching();
        this.setupThemeToggle();
        this.setupFilters();
        this.setupSearch();
        this.setupClearButtons();
    }

    /**
     * Setup tab switching
     */
    setupTabSwitching() {
        DOMUtils.getElements(CONFIG.SELECTORS.TAB).forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    /**
     * Switch to specific tab
     * @param {string} tabName - Tab name
     */
    switchTab(tabName) {
        // Update tab buttons
        DOMUtils.getElements(CONFIG.SELECTORS.TAB).forEach(tab => {
            tab.classList.remove(CONFIG.CLASSES.ACTIVE);
        });
        DOMUtils.getElements(CONFIG.SELECTORS.TAB_CONTENT).forEach(content => {
            content.classList.remove(CONFIG.CLASSES.ACTIVE);
        });

        // Activate selected tab
        event.target.classList.add(CONFIG.CLASSES.ACTIVE);
        DOMUtils.getElement(`#${tabName}`).classList.add(CONFIG.CLASSES.ACTIVE);

        this.currentTab = tabName;

        // Render content for specific tabs
        this.renderTabContent(tabName);
    }

    /**
     * Render content for specific tab
     * @param {string} tabName - Tab name
     */
    renderTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.renderer.renderOverview();
                break;
            case 'colors':
                this.renderer.renderColorTokens();
                break;
            case 'spacing':
                this.renderer.renderSpacingTokens();
                break;
            case 'typography':
                this.renderer.renderTypographyTokens();
                break;
            case 'components':
                this.renderer.renderComponentTokens();
                break;
            case 'relationships':
                this.renderer.renderComponentRelationships();
                break;
        }
    }

    /**
     * Setup theme toggle
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Update button text based on current theme
            const updateButtonText = () => {
                const currentTheme = this.themeManager.getCurrentTheme();
                let nextTheme;
                if (currentTheme === CONFIG.THEMES.CLASSIC_LIGHT) {
                    nextTheme = 'Classic Dark';
                } else if (currentTheme === CONFIG.THEMES.CLASSIC_DARK) {
                    nextTheme = 'Advance Light';
                } else if (currentTheme === CONFIG.THEMES.ADVANCE_LIGHT) {
                    nextTheme = 'Advance Dark';
                } else {
                    nextTheme = 'Classic Light';
                }
                themeToggle.textContent = `Switch to ${nextTheme} Theme`;
            };

            updateButtonText();

            themeToggle.addEventListener('click', () => {
                this.themeManager.toggleTheme();
                updateButtonText();
            });
        }
    }

    /**
     * Setup filter controls
     */
    setupFilters() {
        DOMUtils.addEventListener(CONFIG.SELECTORS.TOKEN_TYPE_FILTER, 'change', () => {
            this.applyFilters();
        });

        DOMUtils.addEventListener(CONFIG.SELECTORS.THEME_FILTER, 'change', () => {
            this.applyFilters();
        });
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        // Color search
        DOMUtils.addEventListener(CONFIG.SELECTORS.COLOR_SEARCH, 'input', (e) => {
            this.renderer.renderColorTokens(e.target.value);
        });

        // Spacing search
        DOMUtils.addEventListener(CONFIG.SELECTORS.SPACING_SEARCH, 'input', (e) => {
            this.renderer.renderSpacingTokens(e.target.value);
        });

        // Typography search
        DOMUtils.addEventListener(CONFIG.SELECTORS.TYPOGRAPHY_SEARCH, 'input', (e) => {
            this.renderer.renderTypographyTokens(e.target.value);
        });

        // Component search
        DOMUtils.addEventListener(CONFIG.SELECTORS.COMPONENT_SEARCH, 'input', (e) => {
            this.renderer.renderComponentTokens(e.target.value);
        });

        // Relationship search
        DOMUtils.addEventListener(CONFIG.SELECTORS.RELATIONSHIP_SEARCH, 'input', (e) => {
            this.renderer.renderComponentRelationships(e.target.value);
        });
    }

    /**
     * Setup clear search buttons
     */
    setupClearButtons() {
        // Clear color search
        DOMUtils.addEventListener(CONFIG.SELECTORS.CLEAR_COLOR_SEARCH, 'click', () => {
            DOMUtils.getElement(CONFIG.SELECTORS.COLOR_SEARCH).value = '';
            this.renderer.renderColorTokens();
        });

        // Clear spacing search
        DOMUtils.addEventListener(CONFIG.SELECTORS.CLEAR_SPACING_SEARCH, 'click', () => {
            DOMUtils.getElement(CONFIG.SELECTORS.SPACING_SEARCH).value = '';
            this.renderer.renderSpacingTokens();
        });

        // Clear typography search
        DOMUtils.addEventListener(CONFIG.SELECTORS.CLEAR_TYPOGRAPHY_SEARCH, 'click', () => {
            DOMUtils.getElement(CONFIG.SELECTORS.TYPOGRAPHY_SEARCH).value = '';
            this.renderer.renderTypographyTokens();
        });

        // Clear component search
        DOMUtils.addEventListener(CONFIG.SELECTORS.CLEAR_COMPONENT_SEARCH, 'click', () => {
            DOMUtils.getElement(CONFIG.SELECTORS.COMPONENT_SEARCH).value = '';
            this.renderer.renderComponentTokens();
        });

        // Clear relationship search
        DOMUtils.addEventListener(CONFIG.SELECTORS.CLEAR_RELATIONSHIP_SEARCH, 'click', () => {
            DOMUtils.getElement(CONFIG.SELECTORS.RELATIONSHIP_SEARCH).value = '';
            this.renderer.renderComponentRelationships();
        });
    }

    /**
     * Apply current filters to foundation tokens
     */
    applyFilters() {
        const typeFilter = DOMUtils.getElement(CONFIG.SELECTORS.TOKEN_TYPE_FILTER).value;
        const themeFilter = DOMUtils.getElement(CONFIG.SELECTORS.THEME_FILTER).value;

        const filteredTokens = this.dataService.filterFoundationTokens(typeFilter, themeFilter);
        this.renderer.renderFoundationTokens(filteredTokens);
    }

    /**
     * Populate filter options
     */
    populateFilters() {
        this.populateTokenTypeFilter();
        this.populateThemeFilter();
    }

    /**
     * Populate token type filter
     */
    populateTokenTypeFilter() {
        const select = DOMUtils.getElement(CONFIG.SELECTORS.TOKEN_TYPE_FILTER);
        const types = this.dataService.getTokenTypes();

        // Clear existing options except "All"
        select.innerHTML = `<option value="${CONFIG.FILTERS.ALL}">All Types</option>`;

        types.forEach(type => {
            const option = DOMUtils.createElement('option', '', {
                value: type,
                textContent: type
            });
            select.appendChild(option);
        });
    }

    /**
     * Populate theme filter
     */
    populateThemeFilter() {
        const select = DOMUtils.getElement(CONFIG.SELECTORS.THEME_FILTER);
        const themes = this.dataService.getThemes();

        // Clear existing options except "All"
        select.innerHTML = `<option value="${CONFIG.FILTERS.ALL}">All Themes</option>`;

        // Add themes in specific order
        const orderedThemes = ['classic-light', 'classic-dark', 'advance-light', 'advance-dark'];
        orderedThemes.forEach(theme => {
            if (themes.includes(theme)) {
                const displayName = theme.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                const option = DOMUtils.createElement('option', '', {
                    value: theme,
                    textContent: displayName
                });
                select.appendChild(option);
            }
        });
    }
}
