/**
 * GridModel - Core data structure for Sudoku grid
 * 
 * Manages the Sudoku grid state including:
 * - Initial puzzle and solution
 * - Current player state
 * - Notes (pencil marks)
 * - Fixed cells (initial puzzle cells)
 * - Validation and conflict detection
 * 
 * @module core/grid-model
 */

/**
 * GridModel class manages the 9x9 Sudoku grid data and validation logic
 */
export class GridModel {
  /**
   * Creates a new GridModel instance
   * 
   * @param {number[][]} puzzle - 9x9 array representing the initial puzzle (0 for empty cells)
   * @param {number[][]} solution - 9x9 array representing the correct solution
   * @throws {Error} If puzzle or solution are invalid
   */
  constructor(puzzle, solution) {
    this.validateGrid(puzzle, 'puzzle');
    this.validateGrid(solution, 'solution');
    
    this.puzzle = this.deepCopy(puzzle);
    this.solution = this.deepCopy(solution);
    this.current = this.deepCopy(puzzle);
    
    // Initialize notes as 9x9 array of Sets
    this.notes = Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => new Set())
    );
    
    // Compute fixed cells (cells with initial values)
    this.fixed = this.computeFixed();
  }

  /**
   * Validates that a grid is a proper 9x9 array
   * 
   * @param {number[][]} grid - Grid to validate
   * @param {string} name - Name for error messages
   * @throws {Error} If grid is invalid
   */
  validateGrid(grid, name) {
    if (!Array.isArray(grid) || grid.length !== 9) {
      throw new Error(`${name} must be a 9x9 array`);
    }
    
    for (let i = 0; i < 9; i++) {
      if (!Array.isArray(grid[i]) || grid[i].length !== 9) {
        throw new Error(`${name} row ${i} must have 9 elements`);
      }
      
      for (let j = 0; j < 9; j++) {
        const value = grid[i][j];
        if (typeof value !== 'number' || value < 0 || value > 9 || !Number.isInteger(value)) {
          throw new Error(`${name}[${i}][${j}] must be an integer between 0 and 9`);
        }
      }
    }
  }

  /**
   * Creates a deep copy of a 2D array
   * 
   * @param {number[][]} grid - Grid to copy
   * @returns {number[][]} Deep copy of the grid
   */
  deepCopy(grid) {
    return grid.map(row => [...row]);
  }

  /**
   * Computes the set of fixed cells (cells with initial values)
   * 
   * @returns {Set<string>} Set of "row,col" strings for fixed cells
   */
  computeFixed() {
    const fixed = new Set();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.puzzle[row][col] !== 0) {
          fixed.add(`${row},${col}`);
        }
      }
    }
    return fixed;
  }

  /**
   * Checks if a cell is fixed (part of the initial puzzle)
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @returns {boolean} True if the cell is fixed
   */
  isFixed(row, col) {
    return this.fixed.has(`${row},${col}`);
  }

  /**
   * Sets the value of a cell
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {number} value - Value to set (0-9, where 0 means empty)
   * @throws {Error} If trying to modify a fixed cell or if indices/value are invalid
   */
  setValue(row, col, value) {
    this.validateIndices(row, col);
    
    if (typeof value !== 'number' || value < 0 || value > 9 || !Number.isInteger(value)) {
      throw new Error(`Value must be an integer between 0 and 9`);
    }
    
    if (this.isFixed(row, col)) {
      throw new Error(`Cannot modify fixed cell at (${row}, ${col})`);
    }
    
    this.current[row][col] = value;
    
    // Clear notes when a value is set (Requirement 3.3)
    if (value !== 0) {
      this.notes[row][col].clear();
    }
  }

  /**
   * Gets the value of a cell
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @returns {number} Current value of the cell (0-9)
   */
  getValue(row, col) {
    this.validateIndices(row, col);
    return this.current[row][col];
  }

  /**
   * Toggles a note (pencil mark) in a cell
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {number} number - Number to toggle (1-9)
   * @throws {Error} If cell has a value or if indices/number are invalid
   */
  toggleNote(row, col, number) {
    this.validateIndices(row, col);
    
    if (typeof number !== 'number' || number < 1 || number > 9 || !Number.isInteger(number)) {
      throw new Error(`Note number must be an integer between 1 and 9`);
    }
    
    // Cannot add notes to cells with values (Requirement 3.4)
    if (this.current[row][col] !== 0) {
      throw new Error(`Cannot add notes to cell with value at (${row}, ${col})`);
    }
    
    const noteSet = this.notes[row][col];
    if (noteSet.has(number)) {
      noteSet.delete(number);
    } else {
      noteSet.add(number);
    }
  }

  /**
   * Gets the notes for a cell
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @returns {Set<number>} Set of note numbers (1-9)
   */
  getNotes(row, col) {
    this.validateIndices(row, col);
    return new Set(this.notes[row][col]); // Return a copy
  }

  /**
   * Validates row and column indices
   * 
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @throws {Error} If indices are invalid
   */
  validateIndices(row, col) {
    if (typeof row !== 'number' || row < 0 || row > 8 || !Number.isInteger(row)) {
      throw new Error(`Row must be an integer between 0 and 8`);
    }
    if (typeof col !== 'number' || col < 0 || col > 8 || !Number.isInteger(col)) {
      throw new Error(`Column must be an integer between 0 and 8`);
    }
  }

  /**
   * Checks if placing a value at a position is valid according to Sudoku rules
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {number} value - Value to check (1-9)
   * @returns {boolean} True if the placement is valid
   */
  isValid(row, col, value) {
    this.validateIndices(row, col);
    
    if (typeof value !== 'number' || value < 1 || value > 9 || !Number.isInteger(value)) {
      return false;
    }
    
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && this.current[row][c] === value) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && this.current[r][col] === value) {
        return false;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && this.current[r][c] === value) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Gets all cells that conflict with a value at a position
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {number} value - Value to check (1-9)
   * @returns {Array<{row: number, col: number}>} Array of conflicting cell positions
   */
  getConflicts(row, col, value) {
    this.validateIndices(row, col);
    
    if (typeof value !== 'number' || value < 1 || value > 9 || !Number.isInteger(value)) {
      return [];
    }
    
    const conflicts = [];
    
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && this.current[row][c] === value) {
        conflicts.push({ row, col: c });
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && this.current[r][col] === value) {
        conflicts.push({ row: r, col });
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && this.current[r][c] === value) {
          // Avoid duplicates (already added in row/col checks)
          if (r !== row && c !== col) {
            conflicts.push({ row: r, col: c });
          }
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Checks if the grid is completely filled
   * 
   * @returns {boolean} True if all cells have values
   */
  isComplete() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.current[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if the current grid matches the solution
   * 
   * @returns {boolean} True if the grid is correct
   */
  isCorrect() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.current[row][col] !== this.solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Creates a deep clone of the grid model
   * 
   * @returns {GridModel} A new GridModel instance with the same state
   */
  clone() {
    const cloned = new GridModel(this.puzzle, this.solution);
    cloned.current = this.deepCopy(this.current);
    
    // Deep copy notes
    cloned.notes = Array(9).fill(null).map((_, row) =>
      Array(9).fill(null).map((_, col) => new Set(this.notes[row][col]))
    );
    
    return cloned;
  }

  /**
   * Serializes the grid model to JSON
   * 
   * @returns {Object} JSON representation of the grid model
   */
  toJSON() {
    // Convert notes Sets to arrays for JSON serialization
    const notesArray = this.notes.map(row =>
      row.map(noteSet => Array.from(noteSet))
    );
    
    return {
      puzzle: this.puzzle,
      solution: this.solution,
      current: this.current,
      notes: notesArray
    };
  }

  /**
   * Creates a GridModel from JSON data
   * 
   * @param {Object} json - JSON representation of a grid model
   * @returns {GridModel} A new GridModel instance
   * @throws {Error} If JSON data is invalid
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON data');
    }
    
    if (!json.puzzle || !json.solution || !json.current) {
      throw new Error('Missing required fields in JSON data');
    }
    
    const grid = new GridModel(json.puzzle, json.solution);
    grid.current = grid.deepCopy(json.current);
    
    // Restore notes from arrays to Sets
    if (json.notes) {
      grid.notes = json.notes.map(row =>
        row.map(noteArray => new Set(noteArray))
      );
    }
    
    return grid;
  }
}
