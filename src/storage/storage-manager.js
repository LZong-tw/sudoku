/**
 * @fileoverview StorageManager - Handles all localStorage operations and data persistence
 * @module storage/storage-manager
 */

import { ErrorHandler } from '../utils/error-handler.js';

/**
 * StorageManager - Manages data persistence using localStorage
 * Provides methods for saving and loading game state, settings, and statistics
 * Handles localStorage availability detection and error handling
 * 
 * @class StorageManager
 * @example
 * const storage = new StorageManager();
 * storage.saveGameState({ grid: [...], timer: 120 });
 * const state = storage.loadGameState();
 */
export class StorageManager {
  /**
   * Create a StorageManager instance
   * Checks localStorage availability on initialization
   * 
   * @constructor
   * @example
   * const storage = new StorageManager();
   */
  constructor() {
    /**
     * Whether localStorage is available
     * @type {boolean}
     * @private
     */
    this.available = this.checkAvailability();
    
    /**
     * Prefix for all localStorage keys to avoid conflicts
     * @type {string}
     * @private
     */
    this.prefix = 'sudoku_';

    if (!this.available) {
      console.warn('localStorage is not available. Data will not be persisted.');
      ErrorHandler.showUserMessage('無法保存進度，但遊戲可以繼續。', 3000);
    }
  }

  /**
   * Check if localStorage is available and functional
   * Tests by attempting to write and read a test value
   * 
   * @returns {boolean} True if localStorage is available, false otherwise
   * @private
   * 
   * @example
   * const isAvailable = storage.checkAvailability();
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available:', e);
      return false;
    }
  }

  /**
   * Save data to localStorage with the configured prefix
   * 
   * @param {string} key - Storage key (will be prefixed)
   * @param {*} data - Data to save (will be JSON stringified)
   * @returns {boolean} True if save was successful, false otherwise
   * 
   * @example
   * storage.save('myKey', { value: 123 });
   */
  save(key, data) {
    if (!this.available) {
      console.warn('Cannot save: localStorage not available');
      return false;
    }

    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.prefix + key, serialized);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      
      // Handle quota exceeded error
      if (e.name === 'QuotaExceededError') {
        ErrorHandler.showUserMessage('存儲空間已滿，無法保存進度。');
      } else {
        ErrorHandler.showUserMessage('無法保存進度。');
      }
      
      ErrorHandler.logError(e, { key, operation: 'save' });
      return false;
    }
  }

  /**
   * Load data from localStorage
   * 
   * @param {string} key - Storage key (will be prefixed)
   * @param {*} [defaultValue=null] - Default value if key doesn't exist or parsing fails
   * @returns {*} Parsed data or default value
   * 
   * @example
   * const data = storage.load('myKey', { value: 0 });
   */
  load(key, defaultValue = null) {
    if (!this.available) {
      console.warn('Cannot load: localStorage not available');
      return defaultValue;
    }

    try {
      const serialized = localStorage.getItem(this.prefix + key);
      
      if (serialized === null) {
        return defaultValue;
      }
      
      return JSON.parse(serialized);
    } catch (e) {
      console.error('Load failed:', e);
      ErrorHandler.logError(e, { key, operation: 'load' });
      return defaultValue;
    }
  }

  /**
   * Remove a specific key from localStorage
   * 
   * @param {string} key - Storage key to remove (will be prefixed)
   * @returns {boolean} True if removal was successful, false otherwise
   * 
   * @example
   * storage.remove('myKey');
   */
  remove(key) {
    if (!this.available) {
      console.warn('Cannot remove: localStorage not available');
      return false;
    }

    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (e) {
      console.error('Remove failed:', e);
      ErrorHandler.logError(e, { key, operation: 'remove' });
      return false;
    }
  }

  /**
   * Clear all data with the configured prefix from localStorage
   * 
   * @returns {boolean} True if clear was successful, false otherwise
   * 
   * @example
   * storage.clear();
   */
  clear() {
    if (!this.available) {
      console.warn('Cannot clear: localStorage not available');
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
      
      prefixedKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (e) {
      console.error('Clear failed:', e);
      ErrorHandler.logError(e, { operation: 'clear' });
      return false;
    }
  }

  /**
   * Save game state to localStorage
   * Includes grid data, timer, errors, hints used, and notes
   * 
   * @param {Object} state - Game state object
   * @param {Array<Array<number>>} state.puzzle - Initial puzzle grid (9x9)
   * @param {Array<Array<number>>} state.solution - Solution grid (9x9)
   * @param {Array<Array<number>>} state.current - Current grid state (9x9)
   * @param {Array<Array<Set<number>>>} state.notes - Notes for each cell (9x9 array of Sets)
   * @param {Set<string>} state.fixed - Set of fixed cell coordinates ("row,col")
   * @param {number} state.elapsedTime - Elapsed time in seconds
   * @param {number} state.errors - Number of errors made
   * @param {number} state.hintsUsed - Number of hints used
   * @param {string} state.difficulty - Difficulty level ('easy', 'medium', 'hard')
   * @param {boolean} [state.noteMode] - Whether note mode is active
   * @param {Object} [state.selectedCell] - Currently selected cell {row, col}
   * @returns {boolean} True if save was successful, false otherwise
   * 
   * @example
   * storage.saveGameState({
   *   puzzle: [[5,3,0,...], ...],
   *   solution: [[5,3,4,...], ...],
   *   current: [[5,3,0,...], ...],
   *   notes: [[new Set(), ...], ...],
   *   fixed: new Set(['0,0', '0,1']),
   *   elapsedTime: 120,
   *   errors: 2,
   *   hintsUsed: 1,
   *   difficulty: 'medium'
   * });
   */
  saveGameState(state) {
    try {
      // Convert Sets to Arrays for JSON serialization
      const serializable = {
        puzzle: state.puzzle,
        solution: state.solution,
        current: state.current,
        notes: state.notes.map(row => 
          row.map(noteSet => Array.from(noteSet))
        ),
        fixed: Array.from(state.fixed),
        elapsedTime: state.elapsedTime,
        errors: state.errors,
        hintsUsed: state.hintsUsed,
        difficulty: state.difficulty,
        noteMode: state.noteMode,
        selectedCell: state.selectedCell,
        timestamp: Date.now()
      };

      return this.save('gameState', serializable);
    } catch (e) {
      console.error('Failed to save game state:', e);
      ErrorHandler.logError(e, { operation: 'saveGameState' });
      return false;
    }
  }

  /**
   * Load game state from localStorage
   * Converts serialized data back to proper format (Arrays to Sets)
   * 
   * @returns {Object|null} Game state object or null if not found/invalid
   * @property {Array<Array<number>>} puzzle - Initial puzzle grid (9x9)
   * @property {Array<Array<number>>} solution - Solution grid (9x9)
   * @property {Array<Array<number>>} current - Current grid state (9x9)
   * @property {Array<Array<Set<number>>>} notes - Notes for each cell (9x9 array of Sets)
   * @property {Set<string>} fixed - Set of fixed cell coordinates ("row,col")
   * @property {number} elapsedTime - Elapsed time in seconds
   * @property {number} errors - Number of errors made
   * @property {number} hintsUsed - Number of hints used
   * @property {string} difficulty - Difficulty level
   * @property {boolean} noteMode - Whether note mode is active
   * @property {Object} selectedCell - Currently selected cell {row, col}
   * @property {number} timestamp - When the state was saved
   * 
   * @example
   * const state = storage.loadGameState();
   * if (state) {
   *   console.log('Loaded game from', new Date(state.timestamp));
   * }
   */
  loadGameState() {
    try {
      const data = this.load('gameState', null);
      
      if (!data) {
        return null;
      }

      // Convert Arrays back to Sets
      return {
        puzzle: data.puzzle,
        solution: data.solution,
        current: data.current,
        notes: data.notes.map(row => 
          row.map(noteArray => new Set(noteArray))
        ),
        fixed: new Set(data.fixed),
        elapsedTime: data.elapsedTime,
        errors: data.errors,
        hintsUsed: data.hintsUsed,
        difficulty: data.difficulty,
        noteMode: data.noteMode,
        selectedCell: data.selectedCell,
        timestamp: data.timestamp
      };
    } catch (e) {
      console.error('Failed to load game state:', e);
      ErrorHandler.logError(e, { operation: 'loadGameState' });
      return null;
    }
  }

  /**
   * Save user settings to localStorage
   * 
   * @param {Object} settings - Settings object
   * @param {string} settings.theme - Theme name ('light' or 'dark')
   * @param {boolean} settings.autoCheck - Whether auto-check mode is enabled
   * @param {boolean} settings.soundEnabled - Whether sound effects are enabled
   * @param {boolean} settings.highlightSameNumbers - Whether to highlight same numbers
   * @param {boolean} settings.showTimer - Whether to show the timer
   * @param {boolean} settings.showErrors - Whether to show error count
   * @returns {boolean} True if save was successful, false otherwise
   * 
   * @example
   * storage.saveSettings({
   *   theme: 'dark',
   *   autoCheck: true,
   *   soundEnabled: false,
   *   highlightSameNumbers: true,
   *   showTimer: true,
   *   showErrors: true
   * });
   */
  saveSettings(settings) {
    try {
      return this.save('settings', settings);
    } catch (e) {
      console.error('Failed to save settings:', e);
      ErrorHandler.logError(e, { operation: 'saveSettings' });
      return false;
    }
  }

  /**
   * Load user settings from localStorage
   * Returns default settings if not found
   * 
   * @returns {Object} Settings object with default values if not found
   * @property {string} theme - Theme name ('light' or 'dark')
   * @property {boolean} autoCheck - Whether auto-check mode is enabled
   * @property {boolean} soundEnabled - Whether sound effects are enabled
   * @property {boolean} highlightSameNumbers - Whether to highlight same numbers
   * @property {boolean} showTimer - Whether to show the timer
   * @property {boolean} showErrors - Whether to show error count
   * 
   * @example
   * const settings = storage.loadSettings();
   * console.log('Current theme:', settings.theme);
   */
  loadSettings() {
    const defaults = {
      theme: 'light',
      autoCheck: true,
      soundEnabled: false,
      highlightSameNumbers: true,
      showTimer: true,
      showErrors: true
    };

    try {
      const settings = this.load('settings', defaults);
      
      // Ensure all required fields exist with defaults
      return {
        theme: settings.theme || defaults.theme,
        autoCheck: settings.autoCheck !== undefined ? settings.autoCheck : defaults.autoCheck,
        soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : defaults.soundEnabled,
        highlightSameNumbers: settings.highlightSameNumbers !== undefined ? settings.highlightSameNumbers : defaults.highlightSameNumbers,
        showTimer: settings.showTimer !== undefined ? settings.showTimer : defaults.showTimer,
        showErrors: settings.showErrors !== undefined ? settings.showErrors : defaults.showErrors
      };
    } catch (e) {
      console.error('Failed to load settings:', e);
      ErrorHandler.logError(e, { operation: 'loadSettings' });
      return defaults;
    }
  }

  /**
   * Save statistics to localStorage
   * 
   * @param {Object} statistics - Statistics object
   * @param {Object} statistics.easy - Easy difficulty stats
   * @param {number} statistics.easy.played - Games played
   * @param {number} statistics.easy.completed - Games completed
   * @param {number} statistics.easy.totalTime - Total time in seconds
   * @param {number} statistics.easy.bestTime - Best time in seconds
   * @param {Object} statistics.medium - Medium difficulty stats
   * @param {number} statistics.medium.played - Games played
   * @param {number} statistics.medium.completed - Games completed
   * @param {number} statistics.medium.totalTime - Total time in seconds
   * @param {number} statistics.medium.bestTime - Best time in seconds
   * @param {Object} statistics.hard - Hard difficulty stats
   * @param {number} statistics.hard.played - Games played
   * @param {number} statistics.hard.completed - Games completed
   * @param {number} statistics.hard.totalTime - Total time in seconds
   * @param {number} statistics.hard.bestTime - Best time in seconds
   * @returns {boolean} True if save was successful, false otherwise
   * 
   * @example
   * storage.saveStatistics({
   *   easy: { played: 10, completed: 8, totalTime: 3600, bestTime: 180 },
   *   medium: { played: 5, completed: 3, totalTime: 2400, bestTime: 300 },
   *   hard: { played: 2, completed: 1, totalTime: 1800, bestTime: 900 }
   * });
   */
  saveStatistics(statistics) {
    try {
      return this.save('statistics', statistics);
    } catch (e) {
      console.error('Failed to save statistics:', e);
      ErrorHandler.logError(e, { operation: 'saveStatistics' });
      return false;
    }
  }

  /**
   * Load statistics from localStorage
   * Returns default statistics if not found
   * 
   * @returns {Object} Statistics object with default values if not found
   * @property {Object} easy - Easy difficulty stats
   * @property {Object} medium - Medium difficulty stats
   * @property {Object} hard - Hard difficulty stats
   * 
   * @example
   * const stats = storage.loadStatistics();
   * console.log('Easy games completed:', stats.easy.completed);
   */
  loadStatistics() {
    const defaults = {
      easy: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
      medium: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
      hard: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity }
    };

    try {
      const stats = this.load('statistics', defaults);
      
      // Ensure all required fields exist with defaults
      return {
        easy: { ...defaults.easy, ...stats.easy },
        medium: { ...defaults.medium, ...stats.medium },
        hard: { ...defaults.hard, ...stats.hard }
      };
    } catch (e) {
      console.error('Failed to load statistics:', e);
      ErrorHandler.logError(e, { operation: 'loadStatistics' });
      return defaults;
    }
  }

  /**
   * Check if localStorage is currently available
   * 
   * @returns {boolean} True if localStorage is available, false otherwise
   * 
   * @example
   * if (storage.isAvailable()) {
   *   console.log('Can save data');
   * }
   */
  isAvailable() {
    return this.available;
  }

  /**
   * Get the storage prefix used for all keys
   * 
   * @returns {string} Storage prefix
   * 
   * @example
   * console.log('Using prefix:', storage.getPrefix());
   */
  getPrefix() {
    return this.prefix;
  }
}
