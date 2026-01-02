/**
 * Utility classes for the Token Explorer
 */

/**
 * DOM manipulation utilities
 */
class DOMUtils {
    /**
     * Create an element with classes and attributes
     * @param {string} tag - HTML tag name
     * @param {string} className - CSS class name
     * @param {Object} attributes - Additional attributes
     * @returns {HTMLElement} Created element
     */
    static createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        return element;
    }

    /**
     * Get element by selector with error handling
     * @param {string} selector - CSS selector
     * @returns {HTMLElement} Element
     */
    static getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }
        return element;
    }

    /**
     * Get elements by selector
     * @param {string} selector - CSS selector
     * @returns {NodeList} Elements
     */
    static getElements(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Add event listener with error handling
     * @param {string} selector - CSS selector
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    static addEventListener(selector, event, handler) {
        const element = this.getElement(selector);
        element.addEventListener(event, handler);
    }
}

/**
 * CSS variable utilities
 */
class CSSUtils {
    /**
     * Get computed CSS variable value
     * @param {string} varName - CSS variable name (without --)
     * @returns {string} Computed value
     */
    static getCSSVariable(varName) {
        const testElement = DOMUtils.createElement('div');
        testElement.style.color = `var(--${varName})`;
        document.body.appendChild(testElement);
        const computedValue = getComputedStyle(testElement).color;
        document.body.removeChild(testElement);
        return computedValue;
    }

    /**
     * Resolve CSS variable reference to actual value
     * @param {string} value - Token value (may be CSS var reference)
     * @returns {string} Resolved value
     */
    static resolveCSSVariable(value) {
        if (value.startsWith('var(')) {
            const varName = value.slice(4, -1);
            return this.getCSSVariable(varName);
        }
        return value;
    }

    /**
     * Check if value is a color
     * @param {string} value - Value to check
     * @returns {boolean} True if color
     */
    static isColor(value) {
        return value.startsWith('#') ||
               value.startsWith('rgb') ||
               value.startsWith('hsl') ||
               value.startsWith('var(');
    }
}

/**
 * Token processing utilities
 */
class TokenUtils {
    /**
     * Flatten nested token object into array
     * @param {Object} obj - Token object
     * @param {string} path - Current path
     * @param {Array} result - Result array
     * @returns {Array} Flattened tokens
     */
    static flattenTokens(obj, path = '', result = []) {
        Object.keys(obj).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const value = obj[key];

            // Check if it's a Style Dictionary token format (has value property)
            if (typeof value === 'object' && value.value !== undefined) {
                result.push({
                    name: currentPath,
                    value: value.value,
                    path: currentPath.split('.'),
                    comment: value.comment
                });
            }
            // Check if it's a direct value (string/number)
            else if (typeof value === 'string' || typeof value === 'number') {
                result.push({
                    name: currentPath,
                    value: value,
                    path: currentPath.split('.')
                });
            }
            // If it's an object, recurse deeper
            else if (typeof value === 'object' && value !== null) {
                this.flattenTokens(value, currentPath, result);
            }
        });

        return result;
    }

    /**
     * Get token color value for display
     * @param {Object} token - Token object
     * @returns {string|null} Color value or null
     */
    static getTokenColorValue(token) {
        if (CSSUtils.isColor(token.value)) {
            return CSSUtils.resolveCSSVariable(token.value);
        }
        return null;
    }

    /**
     * Create color preview element
     * @param {string} colorValue - Color value
     * @returns {HTMLElement} Color preview element
     */
    static createColorPreview(colorValue, size = 'default') {
        const className = size === 'small' ? 'token-color-small' :
                         size === 'tiny' ? 'token-color-tiny' :
                         CONFIG.CLASSES.TOKEN_COLOR;

        return DOMUtils.createElement('div', className, {
            style: { backgroundColor: colorValue },
            title: colorValue
        });
    }

    /**
     * Create color placeholder for non-color tokens
     * @returns {HTMLElement} Placeholder element
     */
    static createColorPlaceholder() {
        return DOMUtils.createElement('div', CONFIG.CLASSES.TOKEN_COLOR, {
            style: {
                backgroundColor: 'transparent',
                border: '1px dashed var(--color-foundation-neutral-border-light)'
            }
        });
    }
}

/**
 * Local storage utilities
 */
class StorageUtils {
    /**
     * Get item from localStorage with fallback
     * @param {string} key - Storage key
     * @param {any} fallback - Fallback value
     * @returns {any} Stored value or fallback
     */
    static get(key, fallback = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch {
            return fallback;
        }
    }

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Silently fail if storage is not available
        }
    }
}
