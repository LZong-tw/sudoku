/**
 * Theme Manager Module
 * 
 * Manages application theme switching between light and dark modes.
 * Applies CSS custom properties (variables) to implement themes and
 * persists user theme preferences.
 * 
 * @module ui/theme-manager
 */

/**
 * Theme definition with CSS custom properties.
 * 
 * @typedef {Object} Theme
 * @property {string} --bg-color - Background color
 * @property {string} --text-color - Text color
 * @property {string} --grid-border - Grid border color
 * @property {string} --cell-bg - Cell background color
 * @property {string} --cell-hover - Cell hover color
 * @property {string} --cell-selected - Selected cell color
 * @property {string} --cell-fixed - Fixed cell background color
 * @property {string} --cell-error - Error cell color
 * @property {string} --cell-hint - Hint cell color
 * @property {string} --cell-same-number - Same number highlight color
 * @property {string} --button-bg - Button background color
 * @property {string} --button-hover - Button hover color
 * @property {string} --button-active - Button active color
 * @property {string} --panel-bg - Panel background color
 * @property {string} --border-color - General border color
 * @property {string} --shadow-color - Shadow color
 */

/**
 * ThemeManager class for managing application themes.
 * 
 * Provides light and dark theme definitions and methods to switch between them.
 * Automatically applies themes by updating CSS custom properties on the document root.
 * Integrates with StorageManager for theme preference persistence.
 * 
 * @class ThemeManager
 */
export class ThemeManager {
  /**
   * Creates a new ThemeManager instance.
   * 
   * Initializes theme definitions and sets the default theme to light.
   * Does not automatically apply the theme - call setTheme() or loadTheme() to apply.
   * 
   * @constructor
   * @param {Object} [storageManager=null] - Optional StorageManager instance for persistence
   */
  constructor(storageManager = null) {
    /**
     * Current active theme name
     * @type {string}
     * @private
     */
    this.currentTheme = 'light';

    /**
     * Storage manager for persisting theme preferences
     * @type {Object|null}
     * @private
     */
    this.storageManager = storageManager;

    /**
     * Theme definitions with CSS custom properties
     * @type {Object.<string, Theme>}
     * @private
     */
    this.themes = {
      light: {
        '--bg-color': '#f5f5f5',
        '--text-color': '#1a1a2e',
        '--cell-bg': '#ffffff',
        '--cell-selected': '#4ecca3',
        '--cell-highlighted': '#e8f5e9',
        '--cell-error': '#e94560',
        '--panel-bg': '#ffffff',
        '--border-color': '#ddd',
        '--accent-color': '#4ecca3'
      },
      dark: {
        '--bg-color': '#1a1a2e',
        '--text-color': '#eee',
        '--cell-bg': '#16213e',
        '--cell-selected': '#4ecca3',
        '--cell-highlighted': '#233554',
        '--cell-error': '#e94560',
        '--panel-bg': '#0f3460',
        '--border-color': '#233554',
        '--accent-color': '#4ecca3'
      }
    };
  }

  /**
   * Sets and applies a theme.
   * 
   * Changes the current theme to the specified theme name and applies it
   * by updating CSS custom properties. Persists the theme preference if
   * a storage manager is available.
   * 
   * @param {string} themeName - Name of the theme to apply ('light' or 'dark')
   * @returns {boolean} True if theme was applied successfully, false otherwise
   * @throws {Error} If theme name is not valid
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      throw new Error(`Invalid theme: ${themeName}. Available themes: ${Object.keys(this.themes).join(', ')}`);
    }

    this.currentTheme = themeName;
    this.applyTheme(this.themes[themeName]);

    // Persist theme preference if storage is available
    if (this.storageManager) {
      try {
        const settings = this.storageManager.loadSettings() || {};
        settings.theme = themeName;
        this.storageManager.saveSettings(settings);
      } catch (error) {
        console.warn('Failed to save theme preference:', error);
      }
    }

    return true;
  }

  /**
   * Applies theme CSS custom properties to the document root.
   * 
   * Updates all CSS variables defined in the theme object on the :root element.
   * This immediately affects all elements using these CSS variables.
   * 
   * @param {Theme} theme - Theme object with CSS custom properties
   * @returns {void}
   */
  applyTheme(theme) {
    const root = document.documentElement;

    // Apply each CSS custom property to the root element
    for (const [property, value] of Object.entries(theme)) {
      root.style.setProperty(property, value);
    }
  }

  /**
   * Gets the name of the current active theme.
   * 
   * @returns {string} Current theme name ('light' or 'dark')
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Gets the theme definition for a specific theme name.
   * 
   * @param {string} themeName - Name of the theme ('light' or 'dark')
   * @returns {Theme|null} Theme object or null if theme doesn't exist
   */
  getTheme(themeName) {
    return this.themes[themeName] || null;
  }

  /**
   * Gets all available theme names.
   * 
   * @returns {string[]} Array of theme names
   */
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Toggles between light and dark themes.
   * 
   * Switches to the opposite theme of the current one.
   * 
   * @returns {string} The new current theme name
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Loads and applies the saved theme preference.
   * 
   * Retrieves the theme preference from storage (if available) and applies it.
   * Falls back to the default 'light' theme if no preference is saved or
   * if the saved theme is invalid.
   * 
   * @returns {string} The loaded theme name
   */
  loadTheme() {
    let themeName = 'light'; // Default theme

    if (this.storageManager) {
      try {
        const settings = this.storageManager.loadSettings();
        if (settings && settings.theme && this.themes[settings.theme]) {
          themeName = settings.theme;
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    }

    this.setTheme(themeName);
    return themeName;
  }

  /**
   * Detects the user's system theme preference.
   * 
   * Uses the prefers-color-scheme media query to detect if the user
   * prefers dark mode at the system level.
   * 
   * @returns {string} 'dark' if user prefers dark mode, 'light' otherwise
   */
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Applies the system theme preference.
   * 
   * Detects and applies the user's system theme preference.
   * Useful for initial theme setup before user explicitly chooses a theme.
   * 
   * @returns {string} The applied theme name
   */
  applySystemTheme() {
    const systemTheme = this.detectSystemTheme();
    this.setTheme(systemTheme);
    return systemTheme;
  }

  /**
   * Adds a listener for system theme changes.
   * 
   * Automatically updates the application theme when the user changes
   * their system theme preference.
   * 
   * @param {Function} [callback=null] - Optional callback to invoke on theme change
   * @returns {Function} Function to remove the listener
   */
  watchSystemTheme(callback = null) {
    if (!window.matchMedia) {
      return () => {}; // No-op if matchMedia not supported
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      this.setTheme(newTheme);
      
      if (callback && typeof callback === 'function') {
        callback(newTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }

    return () => {}; // No-op if neither method is supported
  }
}
