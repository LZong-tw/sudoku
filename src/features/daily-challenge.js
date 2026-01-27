/**
 * Daily Challenge Module
 * 
 * Generates deterministic daily challenge puzzles based on date.
 * Tracks completion history and provides consistent puzzles for each day.
 * 
 * Requirement 13.1: Provide fixed puzzle each day
 * Requirement 13.2: Display today's challenge
 * Requirement 13.3: Record completion time and hints used
 * Requirement 13.4: Deterministic puzzle generation based on date
 * Requirement 13.5: Display daily challenge history
 * 
 * @module features/daily-challenge
 */

import { getPuzzlesByDifficulty } from './puzzle-library.js';
import { StorageManager } from '../storage/storage-manager.js';

/**
 * Daily challenge completion record
 * @typedef {Object} ChallengeCompletion
 * @property {string} date - Date string (YYYY-MM-DD)
 * @property {number} time - Completion time in seconds
 * @property {number} hintsUsed - Number of hints used
 * @property {string} difficulty - Puzzle difficulty
 * @property {string} puzzleId - ID of the puzzle
 * @property {Date} completedAt - Timestamp of completion
 */

/**
 * DailyChallenge Class
 * 
 * Manages daily challenge puzzles with deterministic generation.
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5
 */
export class DailyChallenge {
  /**
   * Creates a new DailyChallenge instance
   * @param {StorageManager} [storageManager] - Optional storage manager for persistence
   */
  constructor(storageManager = null) {
    this.storage = storageManager;
    
    /**
     * Map of completed challenges by date (YYYY-MM-DD)
     * @type {Map<string, ChallengeCompletion>}
     */
    this.completedChallenges = new Map();
    
    /**
     * Difficulty rotation pattern (7-day cycle)
     * @type {Array<string>}
     */
    this.difficultyRotation = [
      'easy',    // Monday
      'easy',    // Tuesday
      'medium',  // Wednesday
      'medium',  // Thursday
      'hard',    // Friday
      'medium',  // Saturday
      'easy'     // Sunday
    ];
    
    // Load saved data
    this.loadFromStorage();
  }

  /**
   * Get today's challenge puzzle
   * Requirement 13.1: Fixed puzzle each day
   * Requirement 13.2: Display today's challenge
   * Requirement 13.4: Deterministic generation
   * @returns {Object} Today's challenge puzzle with metadata
   */
  getTodayChallenge() {
    const today = this.getTodayDateString();
    return this.getChallengeForDate(today);
  }

  /**
   * Get challenge puzzle for a specific date
   * Requirement 13.4: Deterministic puzzle generation based on date
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {Object} Challenge puzzle with metadata
   */
  getChallengeForDate(dateString) {
    // Parse date to get day of year for seed
    const date = new Date(dateString);
    const seed = this.getDateSeed(date);
    
    // Determine difficulty based on day of week
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const rotationIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
    const difficulty = this.difficultyRotation[rotationIndex];
    
    // Get puzzle library for difficulty
    const puzzles = getPuzzlesByDifficulty(difficulty);
    
    // Select puzzle deterministically based on seed
    const puzzleIndex = seed % puzzles.length;
    const selectedPuzzle = puzzles[puzzleIndex];
    
    // Check if already completed
    const completion = this.completedChallenges.get(dateString);
    
    return {
      date: dateString,
      difficulty,
      puzzle: selectedPuzzle.puzzle.map(row => [...row]),
      solution: selectedPuzzle.solution.map(row => [...row]),
      puzzleId: selectedPuzzle.id,
      clues: selectedPuzzle.clues,
      completed: !!completion,
      completion: completion || null
    };
  }

  /**
   * Generate a deterministic seed from a date
   * @param {Date} date - Date object
   * @returns {number} Seed value
   * @private
   */
  getDateSeed(date) {
    // Use year, month, and day to create a deterministic seed
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simple hash function for deterministic seed
    // Same date will always produce same seed
    return (year * 10000 + month * 100 + day) % 1000000;
  }

  /**
   * Record completion of daily challenge
   * Requirement 13.3: Record completion time and hints used
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @param {number} time - Completion time in seconds
   * @param {number} hintsUsed - Number of hints used
   * @returns {void}
   */
  recordCompletion(dateString, time, hintsUsed) {
    const challenge = this.getChallengeForDate(dateString);
    
    const completion = {
      date: dateString,
      time,
      hintsUsed,
      difficulty: challenge.difficulty,
      puzzleId: challenge.puzzleId,
      completedAt: new Date()
    };
    
    this.completedChallenges.set(dateString, completion);
    this.saveToStorage();
  }

  /**
   * Get completion history
   * Requirement 13.5: Display daily challenge history
   * @param {number} [limit] - Optional limit on number of records to return
   * @returns {Array<ChallengeCompletion>} Array of completion records, newest first
   */
  getHistory(limit = null) {
    const history = Array.from(this.completedChallenges.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Check if today's challenge is completed
   * @returns {boolean} True if today's challenge is completed
   */
  isTodayCompleted() {
    const today = this.getTodayDateString();
    return this.completedChallenges.has(today);
  }

  /**
   * Check if a specific date's challenge is completed
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {boolean} True if challenge is completed
   */
  isDateCompleted(dateString) {
    return this.completedChallenges.has(dateString);
  }

  /**
   * Get completion record for a specific date
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {ChallengeCompletion|null} Completion record or null
   */
  getCompletion(dateString) {
    return this.completedChallenges.get(dateString) || null;
  }

  /**
   * Get today's completion record
   * @returns {ChallengeCompletion|null} Today's completion record or null
   */
  getTodayCompletion() {
    const today = this.getTodayDateString();
    return this.getCompletion(today);
  }

  /**
   * Get statistics about daily challenges
   * @returns {Object} Statistics
   */
  getStatistics() {
    const completions = Array.from(this.completedChallenges.values());
    
    if (completions.length === 0) {
      return {
        totalCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageTime: 0,
        bestTime: Infinity,
        perfectDays: 0
      };
    }
    
    const totalTime = completions.reduce((sum, c) => sum + c.time, 0);
    const bestTime = Math.min(...completions.map(c => c.time));
    const perfectDays = completions.filter(c => c.hintsUsed === 0).length;
    
    return {
      totalCompleted: completions.length,
      currentStreak: this.calculateCurrentStreak(),
      longestStreak: this.calculateLongestStreak(),
      averageTime: totalTime / completions.length,
      bestTime,
      perfectDays
    };
  }

  /**
   * Calculate current consecutive day streak
   * @returns {number} Current streak count
   * @private
   */
  calculateCurrentStreak() {
    let streak = 0;
    let currentDate = new Date();
    
    // Check backwards from today
    while (true) {
      const dateString = this.formatDate(currentDate);
      if (this.completedChallenges.has(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Calculate longest consecutive day streak
   * @returns {number} Longest streak count
   * @private
   */
  calculateLongestStreak() {
    if (this.completedChallenges.size === 0) return 0;
    
    // Get all completion dates sorted
    const dates = Array.from(this.completedChallenges.keys())
      .map(d => new Date(d))
      .sort((a, b) => a - b);
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1];
      const currDate = dates[i];
      
      // Check if dates are consecutive (1 day apart)
      const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  }

  /**
   * Get today's date as YYYY-MM-DD string
   * @returns {string} Date string
   * @private
   */
  getTodayDateString() {
    return this.formatDate(new Date());
  }

  /**
   * Format date as YYYY-MM-DD string
   * @param {Date} date - Date object
   * @returns {string} Formatted date string
   * @private
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Reset all completion history
   * @returns {void}
   */
  reset() {
    this.completedChallenges.clear();
    this.saveToStorage();
  }

  /**
   * Save daily challenge state to storage
   * @private
   */
  saveToStorage() {
    if (!this.storage) return;
    
    const data = {
      completedChallenges: Array.from(this.completedChallenges.entries()).map(([date, completion]) => ({
        date,
        ...completion,
        completedAt: completion.completedAt.toISOString()
      }))
    };
    
    this.storage.save('daily_challenge', data);
  }

  /**
   * Load daily challenge state from storage
   * @private
   */
  loadFromStorage() {
    if (!this.storage) return;
    
    const data = this.storage.load('daily_challenge');
    if (!data || !Array.isArray(data.completedChallenges)) return;
    
    // Restore completed challenges
    for (const completion of data.completedChallenges) {
      this.completedChallenges.set(completion.date, {
        ...completion,
        completedAt: new Date(completion.completedAt)
      });
    }
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      completedChallenges: Array.from(this.completedChallenges.entries()).map(([date, completion]) => ({
        date,
        ...completion,
        completedAt: completion.completedAt.toISOString()
      }))
    };
  }

  /**
   * Restore from JSON
   * @param {Object} json - JSON data
   * @param {StorageManager} [storageManager] - Storage manager instance
   * @returns {DailyChallenge} Restored daily challenge
   */
  static fromJSON(json, storageManager = null) {
    const dailyChallenge = new DailyChallenge(storageManager);
    
    if (json.completedChallenges && Array.isArray(json.completedChallenges)) {
      for (const completion of json.completedChallenges) {
        dailyChallenge.completedChallenges.set(completion.date, {
          ...completion,
          completedAt: new Date(completion.completedAt)
        });
      }
    }
    
    return dailyChallenge;
  }
}
