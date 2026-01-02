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
     * Render component tokens
     */
    renderComponentTokens() {
        const components = this.dataService.getComponentTokens();
        const container = DOMUtils.getElement(CONFIG.SELECTORS.COMPONENT_GRID);

        container.innerHTML = '';

        components.forEach(component => {
            const card = this.createComponentCard(component);
            container.appendChild(card);
        });
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
    createTokenItem(token) {
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

        const value = DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_VALUE, {
            textContent: token.value
        });
        info.appendChild(value);

        item.appendChild(info);
        return item;
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
