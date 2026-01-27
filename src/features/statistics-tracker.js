/**
 * Statistics Tracker Module
 * 
 * Tracks and manages game statistics across different difficulty levels.
 * Records game starts, completions, times, and calculates aggregate statistics
 * like average time, best time, and win rate.
 * 
 * @module features/statistics-tracker
 */

/**
 * Statistics data structure for a single difficulty level.
 * 
 * @typedef {Object} DifficultyStats
 * @property {number} played - Number of games started
 * @property {number} completed - Number of games completed
 * @property {number} totalTime - Total time spent in seconds
 * @property {number} bestTime - Best completion time in seconds (Infinity if none)
 */

/**
 * StatisticsTracker class for managing game statistics.
 * 
 * Maintains separate statistics for each difficulty level (easy, medium, hard).
 * Provides methods to record game events and retrieve statistical data.
 * Supports serialization for persistence.
 * 
 * @class StatisticsTracker
 */
export class StatisticsTracker {
  /**
   * Creates a new StatisticsTracker instance.
   * 
   * Initializes statistics for all difficulty levels with default values.
   * 
   * @constructor
   */
  constructor() {
    /**
     * Statistics organized by difficulty level
     * @type {Object.<string, DifficultyStats>}
     * @private
     */
    this.stats = {
      easy: {
        played: 0,
        completed: 0,
        totalTime: 0,
        bestTime: Infinity
      },
      medium: {
        played: 0,
        completed: 0,
        totalTime: 0,
        bestTime: Infinity
      },
      hard: {
        played: 0,
        completed: 0,
        totalTime: 0,
        bestTime: Infinity
      }
    };
  }

  /**
   * Records the start of a new game.
   * 
   * Increments the played count for the specified difficulty level.
   * 
   * @param {string} difficulty - Difficulty level ('easy', 'medium', or 'hard')
   * @returns {void}
   * @throws {Error} If difficulty is not valid
   */
  recordGameStart(difficulty) {
    if (!this.stats[difficulty]) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }

    this.stats[difficulty].played++;
  }

  /**
   * Records the completion of a game.
   * 
   * Updates completion count, total time, and best time for the specified difficulty.
   * If the completion time is better than the current best time, updates the record.
   * 
   * @param {string} difficulty - Difficulty level ('easy', 'medium', or 'hard')
   * @param {number} time - Completion time in seconds
   * @param {number} [errors=0] - Number of errors made (optional, for future use)
   * @param {number} [hintsUsed=0] - Number of hints used (optional, for future use)
   * @returns {void}
   * @throws {Error} If difficulty is not valid or time is negative
   */
  recordGameComplete(difficulty, time, errors = 0, hintsUsed = 0) {
    if (!this.stats[difficulty]) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }

    if (typeof time !== 'number' || time < 0) {
      throw new Error(`Invalid time: ${time}`);
    }

    const diffStats = this.stats[difficulty];
    
    diffStats.completed++;
    diffStats.totalTime += time;
    
    // Update best time if this is a new record
    if (time < diffStats.bestTime) {
      diffStats.bestTime = time;
    }
  }

  /**
   * Gets statistics for a specific difficulty level.
   * 
   * Returns the raw statistics along with calculated metrics like average time and win rate.
   * 
   * @param {string} difficulty - Difficulty level ('easy', 'medium', or 'hard')
   * @returns {Object} Statistics object with calculated metrics
   * @returns {number} return.played - Number of games started
   * @returns {number} return.completed - Number of games completed
   * @returns {number} return.totalTime - Total time spent in seconds
   * @returns {number} return.bestTime - Best completion time in seconds (Infinity if none)
   * @returns {number} return.averageTime - Average completion time in seconds (0 if no completions)
   * @returns {number} return.winRate - Win rate as percentage (0-100)
   * @throws {Error} If difficulty is not valid
   */
  getStats(difficulty) {
    if (!this.stats[difficulty]) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }

    const diffStats = this.stats[difficulty];
    
    // Calculate average time (0 if no completed games)
    const averageTime = diffStats.completed > 0 
      ? diffStats.totalTime / diffStats.completed 
      : 0;
    
    // Calculate win rate as percentage (0 if no games played)
    const winRate = diffStats.played > 0 
      ? (diffStats.completed / diffStats.played) * 100 
      : 0;

    return {
      played: diffStats.played,
      completed: diffStats.completed,
      totalTime: diffStats.totalTime,
      bestTime: diffStats.bestTime === Infinity ? null : diffStats.bestTime,
      averageTime: Math.floor(averageTime),
      winRate: Math.round(winRate * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Gets statistics for all difficulty levels.
   * 
   * Returns a comprehensive view of statistics across all difficulties.
   * 
   * @returns {Object} Statistics for all difficulty levels
   * @returns {Object} return.easy - Statistics for easy difficulty
   * @returns {Object} return.medium - Statistics for medium difficulty
   * @returns {Object} return.hard - Statistics for hard difficulty
   * @returns {Object} return.overall - Aggregate statistics across all difficulties
   */
  getAllStats() {
    const easy = this.getStats('easy');
    const medium = this.getStats('medium');
    const hard = this.getStats('hard');

    // Calculate overall statistics
    const totalPlayed = easy.played + medium.played + hard.played;
    const totalCompleted = easy.completed + medium.completed + hard.completed;
    const totalTime = easy.totalTime + medium.totalTime + hard.totalTime;
    
    const overallAverageTime = totalCompleted > 0 
      ? Math.floor(totalTime / totalCompleted) 
      : 0;
    
    const overallWinRate = totalPlayed > 0 
      ? Math.round((totalCompleted / totalPlayed) * 10000) / 100 
      : 0;

    return {
      easy,
      medium,
      hard,
      overall: {
        played: totalPlayed,
        completed: totalCompleted,
        totalTime: totalTime,
        averageTime: overallAverageTime,
        winRate: overallWinRate
      }
    };
  }

  /**
   * Resets all statistics to default values.
   * 
   * Clears all recorded data for all difficulty levels.
   * This operation cannot be undone.
   * 
   * @returns {void}
   */
  reset() {
    this.stats = {
      easy: {
        played: 0,
        completed: 0,
        totalTime: 0,
        bestTime: Infinity
      },
      medium: {
        played: 0,
        completed: 0,
        totalTime: 0,
        bestTime: Infinity
      },
      hard: {
        played: 0,
        completed: 0,
        totalTime: 0,
        bestTime: Infinity
      }
    };
  }

  /**
   * Serializes statistics to JSON format.
   * 
   * Converts the statistics data to a plain object suitable for storage.
   * Handles Infinity values by converting them to null.
   * 
   * @returns {Object} JSON representation of statistics
   */
  toJSON() {
    const json = {};
    
    for (const [difficulty, stats] of Object.entries(this.stats)) {
      json[difficulty] = {
        played: stats.played,
        completed: stats.completed,
        totalTime: stats.totalTime,
        bestTime: stats.bestTime === Infinity ? null : stats.bestTime
      };
    }
    
    return json;
  }

  /**
   * Restores statistics from JSON format.
   * 
   * Creates a new StatisticsTracker instance with data from a JSON object.
   * Validates the data and uses default values for missing or invalid fields.
   * 
   * @param {Object} json - JSON representation of statistics
   * @returns {StatisticsTracker} New StatisticsTracker instance with restored data
   */
  static fromJSON(json) {
    const tracker = new StatisticsTracker();
    
    if (!json || typeof json !== 'object') {
      return tracker;
    }

    // Restore statistics for each difficulty level
    for (const difficulty of ['easy', 'medium', 'hard']) {
      if (json[difficulty] && typeof json[difficulty] === 'object') {
        const data = json[difficulty];
        
        // Validate and restore each field
        tracker.stats[difficulty] = {
          played: typeof data.played === 'number' && data.played >= 0 
            ? data.played 
            : 0,
          completed: typeof data.completed === 'number' && data.completed >= 0 
            ? data.completed 
            : 0,
          totalTime: typeof data.totalTime === 'number' && data.totalTime >= 0 
            ? data.totalTime 
            : 0,
          bestTime: typeof data.bestTime === 'number' && data.bestTime > 0 
            ? data.bestTime 
            : Infinity
        };
      }
    }
    
    return tracker;
  }
}
