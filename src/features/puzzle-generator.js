/**
 * Puzzle Generator Module
 * 
 * Manages puzzle selection from the puzzle library with deduplication logic.
 * Tracks completed puzzles to avoid repetition in short term.
 * 
 * Requirement 12.2: Random puzzle selection from library
 * Requirement 12.4: Track completed puzzles to avoid short-term repetition
 * 
 * @module features/puzzle-generator
 */

import { getPuzzlesByDifficulty, getPuzzleById } from './puzzle-library.js';
import { StorageManager } from '../storage/storage-manager.js';

/**
 * PuzzleGenerator Class
 * 
 * Selects puzzles from the library and tracks completion to avoid repetition.
 * Validates: Requirements 12.2, 12.4
 */
export class PuzzleGenerator {
  /**
   * Creates a new PuzzleGenerator instance
   * @param {StorageManager} [storageManager] - Optional storage manager for persistence
   * @param {number} [recentHistorySize=10] - Number of recent puzzles to track for deduplication
   */
  constructor(storageManager = null, recentHistorySize = 10) {
    this.storage = storageManager;
    this.recentHistorySize = recentHistorySize;
    
    /**
     * Set of recently completed puzzle IDs (for deduplication)
     * @type {Set<string>}
     */
    this.recentlyCompleted = new Set();
    
    /**
     * Map of all completed puzzles by difficulty
     * @type {Map<string, Set<string>>}
     */
    this.completedPuzzles = new Map([
      ['easy', new Set()],
      ['medium', new Set()],
      ['hard', new Set()]
    ]);
    
    /**
     * Array to maintain order of recently completed puzzles
     * @type {Array<string>}
     */
    this.recentCompletionOrder = [];
    
    // Load saved data
    this.loadFromStorage();
  }

  /**
   * Get a random puzzle for the specified difficulty
   * Requirement 12.2: Random puzzle selection from library
   * Requirement 12.4: Avoid short-term repetition
   * @param {string} difficulty - Difficulty level ('easy'|'medium'|'hard')
   * @returns {Object} Puzzle data with puzzle and solution grids
   */
  getRandomPuzzle(difficulty) {
    const puzzles = getPuzzlesByDifficulty(difficulty);
    
    if (puzzles.length === 0) {
      throw new Error(`No puzzles available for difficulty: ${difficulty}`);
    }
    
    // Filter out recently completed puzzles
    const availablePuzzles = puzzles.filter(p => !this.recentlyCompleted.has(p.id));
    
    // If all puzzles have been recently completed, reset and use all puzzles
    const selectionPool = availablePuzzles.length > 0 ? availablePuzzles : puzzles;
    
    // Select random puzzle from available pool
    const randomIndex = Math.floor(Math.random() * selectionPool.length);
    const selectedPuzzle = selectionPool[randomIndex];
    
    // Return a deep copy to prevent modification of library data
    return {
      id: selectedPuzzle.id,
      difficulty: selectedPuzzle.difficulty,
      clues: selectedPuzzle.clues,
      puzzle: selectedPuzzle.puzzle.map(row => [...row]),
      solution: selectedPuzzle.solution.map(row => [...row])
    };
  }

  /**
   * Record puzzle completion
   * Requirement 12.4: Track completed puzzles
   * @param {string} puzzleId - ID of completed puzzle
   * @param {string} difficulty - Difficulty level
   * @returns {void}
   */
  recordCompletion(puzzleId, difficulty) {
    // Add to recently completed set
    this.recentlyCompleted.add(puzzleId);
    
    // Add to completion order array
    this.recentCompletionOrder.push(puzzleId);
    
    // Maintain recent history size limit
    if (this.recentCompletionOrder.length > this.recentHistorySize) {
      const oldestId = this.recentCompletionOrder.shift();
      this.recentlyCompleted.delete(oldestId);
    }
    
    // Add to all-time completed puzzles for the difficulty
    const difficultySet = this.completedPuzzles.get(difficulty.toLowerCase());
    if (difficultySet) {
      difficultySet.add(puzzleId);
    }
    
    // Save to storage
    this.saveToStorage();
  }

  /**
   * Check if a puzzle has been completed
   * @param {string} puzzleId - Puzzle ID to check
   * @returns {boolean} True if puzzle has been completed
   */
  isCompleted(puzzleId) {
    for (const completedSet of this.completedPuzzles.values()) {
      if (completedSet.has(puzzleId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a puzzle was recently completed
   * @param {string} puzzleId - Puzzle ID to check
   * @returns {boolean} True if puzzle was recently completed
   */
  isRecentlyCompleted(puzzleId) {
    return this.recentlyCompleted.has(puzzleId);
  }

  /**
   * Get completion statistics
   * @returns {Object} Statistics about completed puzzles
   */
  getStatistics() {
    return {
      easy: this.completedPuzzles.get('easy').size,
      medium: this.completedPuzzles.get('medium').size,
      hard: this.completedPuzzles.get('hard').size,
      total: Array.from(this.completedPuzzles.values())
        .reduce((sum, set) => sum + set.size, 0),
      recentlyCompleted: this.recentlyCompleted.size
    };
  }

  /**
   * Get list of completed puzzle IDs for a difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {Array<string>} Array of completed puzzle IDs
   */
  getCompletedPuzzles(difficulty) {
    const completedSet = this.completedPuzzles.get(difficulty.toLowerCase());
    return completedSet ? Array.from(completedSet) : [];
  }

  /**
   * Validate a puzzle has a unique solution
   * Requirement 12.3: Verify puzzles have unique solutions
   * @param {Array<Array<number>>} puzzle - Puzzle grid
   * @param {Array<Array<number>>} solution - Solution grid
   * @returns {boolean} True if puzzle is valid
   */
  validatePuzzle(puzzle, solution) {
    // Check dimensions
    if (!puzzle || !solution || puzzle.length !== 9 || solution.length !== 9) {
      return false;
    }
    
    // Check each row has 9 cells
    for (let i = 0; i < 9; i++) {
      if (puzzle[i].length !== 9 || solution[i].length !== 9) {
        return false;
      }
    }
    
    // Verify solution is valid Sudoku
    if (!this.isValidSudoku(solution)) {
      return false;
    }
    
    // Verify puzzle clues match solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row][col] !== 0) {
          if (puzzle[row][col] !== solution[row][col]) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  /**
   * Check if a completed grid is a valid Sudoku solution
   * @param {Array<Array<number>>} grid - 9x9 grid to validate
   * @returns {boolean} True if valid Sudoku
   * @private
   */
  isValidSudoku(grid) {
    // Check all rows
    for (let row = 0; row < 9; row++) {
      const seen = new Set();
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value < 1 || value > 9 || seen.has(value)) {
          return false;
        }
        seen.add(value);
      }
    }
    
    // Check all columns
    for (let col = 0; col < 9; col++) {
      const seen = new Set();
      for (let row = 0; row < 9; row++) {
        const value = grid[row][col];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
      }
    }
    
    // Check all 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;
            const value = grid[row][col];
            if (seen.has(value)) {
              return false;
            }
            seen.add(value);
          }
        }
      }
    }
    
    return true;
  }

  /**
   * Reset completion history
   * @param {string} [difficulty] - Optional difficulty to reset, or all if not specified
   * @returns {void}
   */
  reset(difficulty = null) {
    if (difficulty) {
      const difficultySet = this.completedPuzzles.get(difficulty.toLowerCase());
      if (difficultySet) {
        difficultySet.clear();
      }
    } else {
      // Reset all
      this.recentlyCompleted.clear();
      this.recentCompletionOrder = [];
      for (const completedSet of this.completedPuzzles.values()) {
        completedSet.clear();
      }
    }
    
    this.saveToStorage();
  }

  /**
   * Save puzzle generator state to storage
   * @private
   */
  saveToStorage() {
    if (!this.storage) return;
    
    const data = {
      recentCompletionOrder: this.recentCompletionOrder,
      completedPuzzles: {
        easy: Array.from(this.completedPuzzles.get('easy')),
        medium: Array.from(this.completedPuzzles.get('medium')),
        hard: Array.from(this.completedPuzzles.get('hard'))
      }
    };
    
    this.storage.save('puzzle_generator', data);
  }

  /**
   * Load puzzle generator state from storage
   * @private
   */
  loadFromStorage() {
    if (!this.storage) return;
    
    const data = this.storage.load('puzzle_generator');
    if (!data) return;
    
    // Restore recent completion order
    if (Array.isArray(data.recentCompletionOrder)) {
      this.recentCompletionOrder = data.recentCompletionOrder;
      this.recentlyCompleted = new Set(
        this.recentCompletionOrder.slice(-this.recentHistorySize)
      );
    }
    
    // Restore completed puzzles
    if (data.completedPuzzles) {
      if (Array.isArray(data.completedPuzzles.easy)) {
        this.completedPuzzles.set('easy', new Set(data.completedPuzzles.easy));
      }
      if (Array.isArray(data.completedPuzzles.medium)) {
        this.completedPuzzles.set('medium', new Set(data.completedPuzzles.medium));
      }
      if (Array.isArray(data.completedPuzzles.hard)) {
        this.completedPuzzles.set('hard', new Set(data.completedPuzzles.hard));
      }
    }
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      recentCompletionOrder: this.recentCompletionOrder,
      completedPuzzles: {
        easy: Array.from(this.completedPuzzles.get('easy')),
        medium: Array.from(this.completedPuzzles.get('medium')),
        hard: Array.from(this.completedPuzzles.get('hard'))
      },
      recentHistorySize: this.recentHistorySize
    };
  }

  /**
   * Restore from JSON
   * @param {Object} json - JSON data
   * @param {StorageManager} [storageManager] - Storage manager instance
   * @returns {PuzzleGenerator} Restored puzzle generator
   */
  static fromJSON(json, storageManager = null) {
    const generator = new PuzzleGenerator(
      storageManager,
      json.recentHistorySize || 10
    );
    
    if (json.recentCompletionOrder) {
      generator.recentCompletionOrder = json.recentCompletionOrder;
      generator.recentlyCompleted = new Set(
        json.recentCompletionOrder.slice(-generator.recentHistorySize)
      );
    }
    
    if (json.completedPuzzles) {
      if (json.completedPuzzles.easy) {
        generator.completedPuzzles.set('easy', new Set(json.completedPuzzles.easy));
      }
      if (json.completedPuzzles.medium) {
        generator.completedPuzzles.set('medium', new Set(json.completedPuzzles.medium));
      }
      if (json.completedPuzzles.hard) {
        generator.completedPuzzles.set('hard', new Set(json.completedPuzzles.hard));
      }
    }
    
    return generator;
  }
}
