/**
 * @fileoverview DataValidator - Validates data loaded from localStorage
 * @module storage/data-validator
 */

/**
 * DataValidator - Validates and sanitizes data loaded from localStorage
 * Ensures data integrity and provides default values for invalid or corrupted data
 * 
 * @class DataValidator
 * @example
 * const gameState = DataValidator.validateGameState(loadedData);
 * const settings = DataValidator.validateSettings(loadedData);
 * const statistics = DataValidator.validateStatistics(loadedData);
 */
export class DataValidator {
  /**
   * Validate game state data loaded from localStorage
   * Returns null if data is invalid or corrupted beyond repair
   * 
   * @static
   * @param {Object} data - Game state data to validate
   * @returns {Object|null} Validated game state or null if invalid
   * 
   * @example
   * const gameState = DataValidator.validateGameState({
   *   current: [[1,2,3,...], ...],
   *   puzzle: [[1,0,3,...], ...],
   *   errors: 2,
   *   hintsUsed: 1
   * });
   */
  static validateGameState(data) {
    // Check if data exists and is an object
    if (!data || typeof data !== 'object') {
      return null;
    }
    
    // Validate required array fields
    if (!Array.isArray(data.current) || data.current.length !== 9) {
      return null;
    }
    
    if (!Array.isArray(data.puzzle) || data.puzzle.length !== 9) {
      return null;
    }
    
    // Validate that each row in current is an array of length 9
    for (let i = 0; i < 9; i++) {
      if (!Array.isArray(data.current[i]) || data.current[i].length !== 9) {
        return null;
      }
      if (!Array.isArray(data.puzzle[i]) || data.puzzle[i].length !== 9) {
        return null;
      }
    }
    
    // Validate solution if present
    if (data.solution !== undefined) {
      if (!Array.isArray(data.solution) || data.solution.length !== 9) {
        return null;
      }
      for (let i = 0; i < 9; i++) {
        if (!Array.isArray(data.solution[i]) || data.solution[i].length !== 9) {
          return null;
        }
      }
    }
    
    // Validate numeric fields
    if (typeof data.errors !== 'number' || data.errors < 0 || !Number.isInteger(data.errors)) {
      return null;
    }
    
    if (typeof data.hintsUsed !== 'number' || data.hintsUsed < 0 || !Number.isInteger(data.hintsUsed)) {
      return null;
    }
    
    // Validate notes if present
    if (data.notes !== undefined) {
      if (!Array.isArray(data.notes) || data.notes.length !== 9) {
        return null;
      }
      for (let i = 0; i < 9; i++) {
        if (!Array.isArray(data.notes[i]) || data.notes[i].length !== 9) {
          return null;
        }
      }
    }
    
    // Validate timer data if present
    if (data.timer !== undefined) {
      if (typeof data.timer !== 'object') {
        return null;
      }
      if (data.timer.elapsedTime !== undefined && 
          (typeof data.timer.elapsedTime !== 'number' || data.timer.elapsedTime < 0)) {
        return null;
      }
    }
    
    // Validate difficulty if present
    if (data.difficulty !== undefined) {
      if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
        return null;
      }
    }
    
    // Validate mode if present
    if (data.mode !== undefined) {
      if (!['normal', 'daily_challenge'].includes(data.mode)) {
        return null;
      }
    }
    
    // Data is valid
    return data;
  }

  /**
   * Validate settings data loaded from localStorage
   * Returns default settings for invalid data
   * 
   * @static
   * @param {Object} data - Settings data to validate
   * @returns {Object} Validated settings with defaults for invalid values
   * 
   * @example
   * const settings = DataValidator.validateSettings({
   *   theme: 'dark',
   *   autoCheck: true,
   *   soundEnabled: false
   * });
   */
  static validateSettings(data) {
    // Default settings
    const defaults = {
      theme: 'light',
      autoCheck: true,
      soundEnabled: false,
      highlightSameNumbers: true,
      showTimer: true,
      showErrors: true
    };
    
    // If data is invalid, return defaults
    if (!data || typeof data !== 'object') {
      return defaults;
    }
    
    // Validate and sanitize each setting
    return {
      theme: ['light', 'dark'].includes(data.theme) ? data.theme : defaults.theme,
      autoCheck: typeof data.autoCheck === 'boolean' ? data.autoCheck : defaults.autoCheck,
      soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : defaults.soundEnabled,
      highlightSameNumbers: typeof data.highlightSameNumbers === 'boolean' ? data.highlightSameNumbers : defaults.highlightSameNumbers,
      showTimer: typeof data.showTimer === 'boolean' ? data.showTimer : defaults.showTimer,
      showErrors: typeof data.showErrors === 'boolean' ? data.showErrors : defaults.showErrors
    };
  }

  /**
   * Validate statistics data loaded from localStorage
   * Returns default statistics for invalid data
   * 
   * @static
   * @param {Object} data - Statistics data to validate
   * @returns {Object} Validated statistics with defaults for invalid values
   * 
   * @example
   * const stats = DataValidator.validateStatistics({
   *   easy: { played: 5, completed: 4, totalTime: 1200, bestTime: 180 },
   *   medium: { played: 3, completed: 2, totalTime: 900, bestTime: 300 },
   *   hard: { played: 1, completed: 0, totalTime: 0, bestTime: Infinity }
   * });
   */
  static validateStatistics(data) {
    // Default statistics structure
    const defaults = {
      easy: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
      medium: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
      hard: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity }
    };
    
    // If data is invalid, return defaults
    if (!data || typeof data !== 'object') {
      return defaults;
    }
    
    // Validate each difficulty level
    const difficulties = ['easy', 'medium', 'hard'];
    const result = {};
    
    for (const difficulty of difficulties) {
      // Check if difficulty data exists and is valid
      if (data[difficulty] && typeof data[difficulty] === 'object') {
        const diffData = data[difficulty];
        
        // Validate and sanitize each field
        result[difficulty] = {
          played: DataValidator._validateNonNegativeInteger(diffData.played, 0),
          completed: DataValidator._validateNonNegativeInteger(diffData.completed, 0),
          totalTime: DataValidator._validateNonNegativeNumber(diffData.totalTime, 0),
          bestTime: DataValidator._validatePositiveNumber(diffData.bestTime, Infinity)
        };
        
        // Ensure completed <= played
        if (result[difficulty].completed > result[difficulty].played) {
          result[difficulty].completed = result[difficulty].played;
        }
      } else {
        // Use default for this difficulty
        result[difficulty] = { ...defaults[difficulty] };
      }
    }
    
    return result;
  }

  /**
   * Validate that a value is a non-negative integer
   * 
   * @private
   * @static
   * @param {*} value - Value to validate
   * @param {number} defaultValue - Default value if validation fails
   * @returns {number} Validated non-negative integer
   */
  static _validateNonNegativeInteger(value, defaultValue) {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
      return value;
    }
    return defaultValue;
  }

  /**
   * Validate that a value is a non-negative number
   * 
   * @private
   * @static
   * @param {*} value - Value to validate
   * @param {number} defaultValue - Default value if validation fails
   * @returns {number} Validated non-negative number
   */
  static _validateNonNegativeNumber(value, defaultValue) {
    if (typeof value === 'number' && !isNaN(value) && value >= 0) {
      return value;
    }
    return defaultValue;
  }

  /**
   * Validate that a value is a positive number (including Infinity)
   * 
   * @private
   * @static
   * @param {*} value - Value to validate
   * @param {number} defaultValue - Default value if validation fails
   * @returns {number} Validated positive number
   */
  static _validatePositiveNumber(value, defaultValue) {
    if (typeof value === 'number' && !isNaN(value) && value > 0) {
      return value;
    }
    // Special case: Infinity is valid for bestTime
    if (value === Infinity) {
      return Infinity;
    }
    return defaultValue;
  }

  /**
   * Validate achievement data loaded from localStorage
   * Returns default achievement data for invalid data
   * 
   * @static
   * @param {Object} data - Achievement data to validate
   * @returns {Object} Validated achievement data
   * 
   * @example
   * const achievements = DataValidator.validateAchievements({
   *   unlockedAchievements: ['first_win', 'perfect_game'],
   *   progress: { speed_demon: 0.5 }
   * });
   */
  static validateAchievements(data) {
    const defaults = {
      unlockedAchievements: [],
      progress: {}
    };
    
    if (!data || typeof data !== 'object') {
      return defaults;
    }
    
    // Validate unlockedAchievements
    let unlockedAchievements = defaults.unlockedAchievements;
    if (Array.isArray(data.unlockedAchievements)) {
      // Filter to only include strings
      unlockedAchievements = data.unlockedAchievements.filter(
        item => typeof item === 'string'
      );
    }
    
    // Validate progress
    let progress = defaults.progress;
    if (data.progress && typeof data.progress === 'object') {
      progress = {};
      for (const [key, value] of Object.entries(data.progress)) {
        if (typeof key === 'string' && typeof value === 'number' && value >= 0 && value <= 1) {
          progress[key] = value;
        }
      }
    }
    
    return {
      unlockedAchievements,
      progress
    };
  }

  /**
   * Validate daily challenge data loaded from localStorage
   * Returns default daily challenge data for invalid data
   * 
   * @static
   * @param {Object} data - Daily challenge data to validate
   * @returns {Object} Validated daily challenge data
   * 
   * @example
   * const dailyData = DataValidator.validateDailyChallenge({
   *   completedChallenges: {
   *     '2024-01-15': { time: 300, hintsUsed: 1 }
   *   }
   * });
   */
  static validateDailyChallenge(data) {
    const defaults = {
      completedChallenges: {}
    };
    
    if (!data || typeof data !== 'object') {
      return defaults;
    }
    
    // Validate completedChallenges
    let completedChallenges = defaults.completedChallenges;
    if (data.completedChallenges && typeof data.completedChallenges === 'object') {
      completedChallenges = {};
      for (const [date, result] of Object.entries(data.completedChallenges)) {
        // Validate date format (YYYY-MM-DD)
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          // Validate result object
          if (result && typeof result === 'object') {
            const time = DataValidator._validateNonNegativeNumber(result.time, null);
            const hintsUsed = DataValidator._validateNonNegativeInteger(result.hintsUsed, null);
            
            if (time !== null && hintsUsed !== null) {
              completedChallenges[date] = { time, hintsUsed };
            }
          }
        }
      }
    }
    
    return {
      completedChallenges
    };
  }
}
