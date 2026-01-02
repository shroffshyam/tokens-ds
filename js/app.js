/**
 * Main Application Class - Coordinates all components
 * Single Responsibility: Initialize and coordinate the application
 */
class TokenExplorerApp {
    constructor() {
        this.dataService = new TokenDataService();
        this.renderer = new TokenRenderer();
        this.themeManager = new ThemeManager();
        this.uiManager = new UIManager(this.renderer, this.dataService, this.themeManager);

        this.renderer.setDataService(this.dataService);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load token data
            await this.dataService.loadTokens();

            // Initialize UI
            this.uiManager.init();
            this.uiManager.populateFilters();

            // Render initial content
            this.renderer.renderComponentTokens();
            this.renderer.renderFoundationTokens(this.dataService.getFoundationTokens());

            console.log('Token Explorer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Token Explorer:', error);
            this.showError('Failed to load token data. Please check the console for details.');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const container = DOMUtils.getElement(CONFIG.SELECTORS.COMPONENT_GRID);
        container.innerHTML = `<div style="color: var(--color-foundation-semantic-error-base); padding: var(--size-spacing-lg); text-align: center;">${message}</div>`;
    }
}

/**
 * Application Bootstrap
 * Dependency Inversion: Main function depends on abstractions
 */
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TokenExplorerApp();
    await app.init();
});

// Export for potential testing or external usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TokenExplorerApp,
        TokenDataService,
        TokenRenderer,
        ThemeManager,
        UIManager,
        DOMUtils,
        CSSUtils,
        TokenUtils,
        StorageUtils
    };
}
