/**
 * @fileoverview fast-check arbitraries for property-based testing
 * @module tests/helpers/arbitraries
 */

import * as fc from 'fast-check';
import { GridModel } from '../../src/core/grid-model.js';

/**
 * Generate a valid Sudoku value (0-9)
 */
export const sudokuValue = () => fc.integer({ min: 0, max: 9 });

/**
 * Generate a valid Sudoku note number (1-9)
 */
export const sudokuNote = () => fc.integer({ min: 1, max: 9 });

/**
 * Generate a valid row or column index (0-8)
 */
export const gridIndex = () => fc.integer({ min: 0, max: 8 });

/**
 * Generate a valid cell position
 */
export const cellPosition = () => fc.record({
  row: gridIndex(),
  col: gridIndex()
});

/**
 * Generate a simple valid Sudoku puzzle (9x9 grid)
 * This creates a partially filled grid with some empty cells
 */
export const simplePuzzle = () => {
  return fc.constantFrom(
    // Simple test puzzle with known solution
    [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
  );
};

/**
 * Generate a simple valid Sudoku solution
 */
export const simpleSolution = () => {
  return fc.constantFrom(
    [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  );
};

/**
 * Generate a GridModel with a simple puzzle
 */
export const simpleGridModel = () => {
  return fc.tuple(simplePuzzle(), simpleSolution()).map(([puzzle, solution]) => {
    return new GridModel(puzzle, solution);
  });
};

/**
 * Generate an empty cell position (a cell that is 0 in the puzzle)
 * Returns a record with { grid, row, col } where the cell at (row, col) is empty
 */
export const emptyCellInGrid = () => {
  return simpleGridModel().chain(grid => {
    // Find all empty cells
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid.getValue(row, col) === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) {
      // If no empty cells, return a dummy position (shouldn't happen with our test puzzle)
      return fc.constant({ grid, row: 0, col: 2 });
    }
    
    // Pick a random empty cell
    return fc.constantFrom(...emptyCells).map(pos => ({
      grid,
      row: pos.row,
      col: pos.col
    }));
  });
};

/**
 * Generate a cell with notes
 * Returns a record with { grid, row, col } where the cell has at least one note
 */
export const cellWithNotes = () => {
  return emptyCellInGrid().chain(({ grid, row, col }) => {
    // Add some random notes to the cell (at least 1, up to 5)
    return fc.array(sudokuNote(), { minLength: 1, maxLength: 5 }).map(notes => {
      // Clone the grid to avoid mutation
      const clonedGrid = grid.clone();
      
      // Add notes to the cell (use Set to avoid duplicates)
      const uniqueNotes = [...new Set(notes)];
      uniqueNotes.forEach(note => {
        clonedGrid.toggleNote(row, col, note);
      });
      
      // Verify that notes were actually added
      const addedNotes = clonedGrid.getNotes(row, col);
      if (addedNotes.size === 0) {
        // Fallback: add at least one note
        clonedGrid.toggleNote(row, col, 1);
      }
      
      return { grid: clonedGrid, row, col };
    });
  });
};

/**
 * Generate a valid value for a specific cell position
 * Returns a record with { grid, row, col, value } where value is valid for that position
 */
export const validValueForCell = () => {
  return emptyCellInGrid().chain(({ grid, row, col }) => {
    // Get the correct solution value for this cell
    const correctValue = grid.solution[row][col];
    
    return fc.constant({
      grid,
      row,
      col,
      value: correctValue
    });
  });
};

/**
 * Generate a cell with a value (non-empty cell)
 * Returns a record with { grid, row, col } where the cell has a value (1-9)
 */
export const cellWithValue = () => {
  return emptyCellInGrid().chain(({ grid, row, col }) => {
    // Clone the grid to avoid mutation
    const clonedGrid = grid.clone();
    
    // Set a value in the cell (use the correct solution value)
    const value = clonedGrid.solution[row][col];
    clonedGrid.setValue(row, col, value);
    
    return fc.constant({ grid: clonedGrid, row, col });
  });
};

/**
 * Generate a grid with a conflicting value
 * Returns a record with { grid, row, col, value, hasConflict }
 * where value at (row, col) may or may not violate Sudoku rules
 */
export const gridWithPotentialConflict = () => {
  return emptyCellInGrid().chain(({ grid, row, col }) => {
    // Clone the grid to avoid mutation
    const clonedGrid = grid.clone();
    
    // Generate either a valid value or a conflicting value
    return fc.oneof(
      // Valid value (correct solution)
      fc.constant({
        grid: clonedGrid,
        row,
        col,
        value: clonedGrid.solution[row][col],
        hasConflict: false
      }),
      // Conflicting value (find a value that conflicts)
      fc.integer({ min: 1, max: 9 }).chain(value => {
        // Check if this value would create a conflict
        const hasConflict = !clonedGrid.isValid(row, col, value);
        return fc.constant({
          grid: clonedGrid,
          row,
          col,
          value,
          hasConflict
        });
      })
    );
  });
};

/**
 * Generate a grid with a value that definitely creates a conflict
 * Returns a record with { grid, row, col, value, conflictType }
 */
export const gridWithConflict = () => {
  return simpleGridModel().chain(grid => {
    // Find an empty cell
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid.getValue(row, col) === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) {
      return fc.constant(null);
    }
    
    return fc.constantFrom(...emptyCells).chain(({ row, col }) => {
      // Clone the grid
      const clonedGrid = grid.clone();
      
      // Find a value that creates a conflict
      // Try to find a value in the same row, column, or box
      const conflictingValues = [];
      
      // Check row for existing values
      for (let c = 0; c < 9; c++) {
        const val = clonedGrid.getValue(row, c);
        if (val !== 0) {
          conflictingValues.push({ value: val, type: 'row' });
        }
      }
      
      // Check column for existing values
      for (let r = 0; r < 9; r++) {
        const val = clonedGrid.getValue(r, col);
        if (val !== 0) {
          conflictingValues.push({ value: val, type: 'column' });
        }
      }
      
      // Check 3x3 box for existing values
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const val = clonedGrid.getValue(r, c);
          if (val !== 0) {
            conflictingValues.push({ value: val, type: 'box' });
          }
        }
      }
      
      if (conflictingValues.length === 0) {
        // No conflicts possible, use any value
        return fc.integer({ min: 1, max: 9 }).map(value => ({
          grid: clonedGrid,
          row,
          col,
          value,
          conflictType: 'none'
        }));
      }
      
      // Pick a conflicting value
      return fc.constantFrom(...conflictingValues).map(({ value, type }) => ({
        grid: clonedGrid,
        row,
        col,
        value,
        conflictType: type
      }));
    });
  }).filter(result => result !== null);
};
