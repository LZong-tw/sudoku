/**
 * HintSystem - Intelligent hint system for Sudoku game
 * 
 * Provides smart hints to players by:
 * - Selecting empty cells strategically
 * - Filling in correct answers from the solution
 * - Using heuristic algorithms to choose the most helpful cells
 * - Tracking hint usage count
 * 
 * @module core/hint-system
 */

/**
 * HintSystem class provides intelligent hints for Sudoku puzzles
 */
export class HintSystem {
  /**
   * Creates a new HintSystem instance
   * 
   * @param {import('./grid-model.js').GridModel} gridModel - The grid model to provide hints for
   * @throws {Error} If gridModel is not provided or invalid
   */
  constructor(gridModel) {
    if (!gridModel) {
      throw new Error('GridModel is required');
    }
    
    this.grid = gridModel;
    this.hintsUsed = 0;
  }

  /**
   * Gets a hint for the current puzzle state
   * 
   * Selects the best cell to fill using a heuristic algorithm and returns
   * the correct value from the solution. Increments the hint usage count.
   * 
   * @returns {{row: number, col: number, value: number} | null} 
   *   Hint object with row, col, and value, or null if no empty cells exist
   * 
   * @example
   * const hint = hintSystem.getHint();
   * if (hint) {
   *   console.log(`Fill cell (${hint.row}, ${hint.col}) with ${hint.value}`);
   * }
   */
  getHint() {
    // Find the best cell to hint
    const cell = this.selectBestHintCell();
    
    // No empty cells available
    if (!cell) {
      return null;
    }
    
    // Get the correct value from the solution
    const value = this.grid.solution[cell.row][cell.col];
    
    // Increment hint usage count (Requirement 1.2)
    this.hintsUsed++;
    
    return {
      row: cell.row,
      col: cell.col,
      value: value
    };
  }

  /**
   * Selects the best cell to provide a hint for using heuristic algorithm
   * 
   * The heuristic prioritizes cells that:
   * 1. Have the highest difficulty score (most constrained)
   * 2. Are most helpful for solving the puzzle
   * 
   * This implements Requirement 1.5: prioritize cells most helpful for solving.
   * 
   * @returns {{row: number, col: number} | null} 
   *   Cell position {row, col} or null if no empty cells
   * 
   * @private
   */
  selectBestHintCell() {
    const emptyCells = [];
    
    // Find all empty cells
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid.getValue(row, col) === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    // No empty cells
    if (emptyCells.length === 0) {
      return null;
    }
    
    // Calculate difficulty score for each empty cell
    let bestCell = null;
    let highestDifficulty = -1;
    
    for (const cell of emptyCells) {
      const difficulty = this.calculateCellDifficulty(cell.row, cell.col);
      
      if (difficulty > highestDifficulty) {
        highestDifficulty = difficulty;
        bestCell = cell;
      }
    }
    
    return bestCell;
  }

  /**
   * Calculates the difficulty score for a cell
   * 
   * The difficulty score is based on:
   * - Number of filled cells in the same row
   * - Number of filled cells in the same column
   * - Number of filled cells in the same 3x3 box
   * 
   * Higher scores indicate more constrained cells (more helpful hints).
   * This heuristic helps players by filling cells that provide the most
   * information for solving the puzzle.
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @returns {number} Difficulty score (higher = more constrained/helpful)
   * 
   * @private
   */
  calculateCellDifficulty(row, col) {
    let score = 0;
    
    // Count filled cells in the same row
    for (let c = 0; c < 9; c++) {
      if (this.grid.getValue(row, c) !== 0) {
        score++;
      }
    }
    
    // Count filled cells in the same column
    for (let r = 0; r < 9; r++) {
      if (this.grid.getValue(r, col) !== 0) {
        score++;
      }
    }
    
    // Count filled cells in the same 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (this.grid.getValue(r, c) !== 0) {
          score++;
        }
      }
    }
    
    // Note: We count the cell at (row, col) multiple times if it's in
    // the intersection of row, column, and box, but since we're comparing
    // relative scores, this is fine and actually helps prioritize cells
    // at intersections of more filled areas.
    
    return score;
  }

  /**
   * Gets the current hint usage count
   * 
   * @returns {number} Number of hints used
   */
  getHintsUsed() {
    return this.hintsUsed;
  }

  /**
   * Resets the hint usage count to zero
   * 
   * Typically called when starting a new game.
   */
  reset() {
    this.hintsUsed = 0;
  }

  /**
   * Serializes the hint system state to JSON
   * 
   * @returns {Object} JSON representation with hintsUsed count
   */
  toJSON() {
    return {
      hintsUsed: this.hintsUsed
    };
  }

  /**
   * Restores hint system state from JSON
   * 
   * @param {Object} json - JSON representation of hint system state
   * @param {import('./grid-model.js').GridModel} gridModel - The grid model to use
   * @returns {HintSystem} A new HintSystem instance with restored state
   * @throws {Error} If JSON data is invalid
   */
  static fromJSON(json, gridModel) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON data');
    }
    
    if (!gridModel) {
      throw new Error('GridModel is required');
    }
    
    const hintSystem = new HintSystem(gridModel);
    
    if (typeof json.hintsUsed === 'number' && json.hintsUsed >= 0) {
      hintSystem.hintsUsed = json.hintsUsed;
    }
    
    return hintSystem;
  }
}
