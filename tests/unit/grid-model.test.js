/**
 * Unit tests for GridModel
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GridModel } from '../../src/core/grid-model.js';

describe('GridModel', () => {
  let puzzle, solution, grid;

  beforeEach(() => {
    // Simple test puzzle
    puzzle = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    solution = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];

    grid = new GridModel(puzzle, solution);
  });

  describe('constructor', () => {
    it('should create a grid with correct initial state', () => {
      expect(grid.puzzle).toEqual(puzzle);
      expect(grid.solution).toEqual(solution);
      expect(grid.current).toEqual(puzzle);
    });

    it('should initialize notes as empty sets', () => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(grid.notes[row][col]).toBeInstanceOf(Set);
          expect(grid.notes[row][col].size).toBe(0);
        }
      }
    });

    it('should compute fixed cells correctly', () => {
      expect(grid.isFixed(0, 0)).toBe(true); // 5
      expect(grid.isFixed(0, 2)).toBe(false); // 0 (empty)
      expect(grid.isFixed(1, 0)).toBe(true); // 6
    });

    it('should throw error for invalid puzzle', () => {
      expect(() => new GridModel(null, solution)).toThrow();
      expect(() => new GridModel([[1, 2, 3]], solution)).toThrow();
      expect(() => new GridModel([...puzzle, [1, 2, 3, 4, 5, 6, 7, 8, 9]], solution)).toThrow();
    });

    it('should throw error for invalid solution', () => {
      expect(() => new GridModel(puzzle, null)).toThrow();
      expect(() => new GridModel(puzzle, [[1, 2, 3]])).toThrow();
    });

    it('should throw error for invalid cell values', () => {
      const invalidPuzzle = puzzle.map(row => [...row]);
      invalidPuzzle[0][0] = 10;
      expect(() => new GridModel(invalidPuzzle, solution)).toThrow();

      invalidPuzzle[0][0] = -1;
      expect(() => new GridModel(invalidPuzzle, solution)).toThrow();

      invalidPuzzle[0][0] = 1.5;
      expect(() => new GridModel(invalidPuzzle, solution)).toThrow();
    });
  });

  describe('setValue', () => {
    it('should set value in empty cell', () => {
      grid.setValue(0, 2, 4);
      expect(grid.getValue(0, 2)).toBe(4);
    });

    it('should clear value when setting to 0', () => {
      grid.setValue(0, 2, 4);
      grid.setValue(0, 2, 0);
      expect(grid.getValue(0, 2)).toBe(0);
    });

    it('should throw error when modifying fixed cell', () => {
      expect(() => grid.setValue(0, 0, 1)).toThrow('Cannot modify fixed cell');
    });

    it('should throw error for invalid indices', () => {
      expect(() => grid.setValue(-1, 0, 1)).toThrow();
      expect(() => grid.setValue(0, 9, 1)).toThrow();
      expect(() => grid.setValue(1.5, 0, 1)).toThrow();
    });

    it('should throw error for invalid value', () => {
      expect(() => grid.setValue(0, 2, 10)).toThrow();
      expect(() => grid.setValue(0, 2, -1)).toThrow();
      expect(() => grid.setValue(0, 2, 1.5)).toThrow();
    });

    it('should clear notes when setting a value (Requirement 3.3)', () => {
      grid.toggleNote(0, 2, 1);
      grid.toggleNote(0, 2, 2);
      expect(grid.getNotes(0, 2).size).toBe(2);

      grid.setValue(0, 2, 4);
      expect(grid.getNotes(0, 2).size).toBe(0);
    });
  });

  describe('getValue', () => {
    it('should get value from cell', () => {
      expect(grid.getValue(0, 0)).toBe(5);
      expect(grid.getValue(0, 2)).toBe(0);
    });

    it('should throw error for invalid indices', () => {
      expect(() => grid.getValue(-1, 0)).toThrow();
      expect(() => grid.getValue(0, 9)).toThrow();
    });
  });

  describe('toggleNote', () => {
    it('should add note to empty cell', () => {
      grid.toggleNote(0, 2, 1);
      expect(grid.getNotes(0, 2).has(1)).toBe(true);
    });

    it('should remove note when toggled again (Requirement 3.2)', () => {
      grid.toggleNote(0, 2, 1);
      expect(grid.getNotes(0, 2).has(1)).toBe(true);
      
      grid.toggleNote(0, 2, 1);
      expect(grid.getNotes(0, 2).has(1)).toBe(false);
    });

    it('should allow multiple notes in same cell (Requirement 3.1)', () => {
      grid.toggleNote(0, 2, 1);
      grid.toggleNote(0, 2, 2);
      grid.toggleNote(0, 2, 3);
      
      const notes = grid.getNotes(0, 2);
      expect(notes.has(1)).toBe(true);
      expect(notes.has(2)).toBe(true);
      expect(notes.has(3)).toBe(true);
      expect(notes.size).toBe(3);
    });

    it('should throw error when cell has value (Requirement 3.4)', () => {
      expect(() => grid.toggleNote(0, 0, 1)).toThrow('Cannot add notes to cell with value');
    });

    it('should throw error for invalid note number', () => {
      expect(() => grid.toggleNote(0, 2, 0)).toThrow();
      expect(() => grid.toggleNote(0, 2, 10)).toThrow();
      expect(() => grid.toggleNote(0, 2, 1.5)).toThrow();
    });

    it('should throw error for invalid indices', () => {
      expect(() => grid.toggleNote(-1, 0, 1)).toThrow();
      expect(() => grid.toggleNote(0, 9, 1)).toThrow();
    });
  });

  describe('getNotes', () => {
    it('should return empty set for cell without notes', () => {
      const notes = grid.getNotes(0, 2);
      expect(notes).toBeInstanceOf(Set);
      expect(notes.size).toBe(0);
    });

    it('should return copy of notes set', () => {
      grid.toggleNote(0, 2, 1);
      const notes = grid.getNotes(0, 2);
      
      // Modifying returned set should not affect original
      notes.add(2);
      expect(grid.getNotes(0, 2).has(2)).toBe(false);
    });

    it('should throw error for invalid indices', () => {
      expect(() => grid.getNotes(-1, 0)).toThrow();
      expect(() => grid.getNotes(0, 9)).toThrow();
    });
  });

  describe('isValid', () => {
    it('should return true for valid placement', () => {
      expect(grid.isValid(0, 2, 4)).toBe(true);
    });

    it('should return false for row conflict', () => {
      expect(grid.isValid(0, 2, 5)).toBe(false); // 5 already in row
    });

    it('should return false for column conflict', () => {
      expect(grid.isValid(0, 2, 8)).toBe(false); // 8 already in column
    });

    it('should return false for box conflict', () => {
      grid.setValue(0, 2, 4);
      expect(grid.isValid(1, 2, 4)).toBe(false); // 4 already in box
    });

    it('should return false for invalid value', () => {
      expect(grid.isValid(0, 2, 0)).toBe(false);
      expect(grid.isValid(0, 2, 10)).toBe(false);
      expect(grid.isValid(0, 2, -1)).toBe(false);
    });

    it('should allow same value in same cell', () => {
      grid.setValue(0, 2, 4);
      expect(grid.isValid(0, 2, 4)).toBe(true);
    });
  });

  describe('getConflicts', () => {
    it('should return empty array for valid placement', () => {
      const conflicts = grid.getConflicts(0, 2, 4);
      expect(conflicts).toEqual([]);
    });

    it('should detect row conflicts', () => {
      const conflicts = grid.getConflicts(0, 2, 5);
      expect(conflicts).toContainEqual({ row: 0, col: 0 });
    });

    it('should detect column conflicts', () => {
      const conflicts = grid.getConflicts(0, 2, 8);
      expect(conflicts.some(c => c.row === 2 && c.col === 2)).toBe(true);
    });

    it('should detect box conflicts', () => {
      grid.setValue(1, 2, 4);
      const conflicts = grid.getConflicts(0, 2, 4);
      expect(conflicts).toContainEqual({ row: 1, col: 2 });
    });

    it('should detect all conflicts (Requirement 4.2)', () => {
      // Place 5 in multiple conflicting positions
      grid.setValue(0, 2, 5); // Same row as (0,0) which has 5
      grid.setValue(2, 0, 5); // Same column as (0,0) which has 5
      
      const conflicts = grid.getConflicts(0, 0, 5);
      
      // Should find conflicts in row and column
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.row === 0 && c.col === 2)).toBe(true);
      expect(conflicts.some(c => c.row === 2 && c.col === 0)).toBe(true);
    });

    it('should return empty array for invalid value', () => {
      expect(grid.getConflicts(0, 2, 0)).toEqual([]);
      expect(grid.getConflicts(0, 2, 10)).toEqual([]);
    });
  });

  describe('isComplete', () => {
    it('should return false for incomplete grid', () => {
      expect(grid.isComplete()).toBe(false);
    });

    it('should return true for complete grid', () => {
      // Fill all empty cells
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid.getValue(row, col) === 0) {
            grid.setValue(row, col, solution[row][col]);
          }
        }
      }
      expect(grid.isComplete()).toBe(true);
    });
  });

  describe('isCorrect', () => {
    it('should return false for incorrect grid', () => {
      expect(grid.isCorrect()).toBe(false);
    });

    it('should return true for correct grid', () => {
      // Fill all empty cells with correct values
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid.getValue(row, col) === 0) {
            grid.setValue(row, col, solution[row][col]);
          }
        }
      }
      expect(grid.isCorrect()).toBe(true);
    });

    it('should return false for complete but incorrect grid', () => {
      // Fill with wrong values
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid.getValue(row, col) === 0) {
            grid.setValue(row, col, 1); // Wrong value
          }
        }
      }
      expect(grid.isComplete()).toBe(true);
      expect(grid.isCorrect()).toBe(false);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = grid.clone();
      
      // Modify original
      grid.setValue(0, 2, 4);
      grid.toggleNote(1, 2, 1);
      
      // Cloned should be unchanged
      expect(cloned.getValue(0, 2)).toBe(0);
      expect(cloned.getNotes(1, 2).size).toBe(0);
    });

    it('should copy all state correctly', () => {
      grid.setValue(0, 2, 4);
      grid.toggleNote(1, 2, 1);
      grid.toggleNote(1, 2, 2);
      
      const cloned = grid.clone();
      
      expect(cloned.getValue(0, 2)).toBe(4);
      expect(cloned.getNotes(1, 2).has(1)).toBe(true);
      expect(cloned.getNotes(1, 2).has(2)).toBe(true);
      expect(cloned.puzzle).toEqual(grid.puzzle);
      expect(cloned.solution).toEqual(grid.solution);
    });
  });

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      grid.setValue(0, 2, 4);
      grid.toggleNote(1, 2, 1);
      grid.toggleNote(1, 2, 2);
      
      const json = grid.toJSON();
      const restored = GridModel.fromJSON(json);
      
      expect(restored.getValue(0, 2)).toBe(4);
      expect(restored.getNotes(1, 2).has(1)).toBe(true);
      expect(restored.getNotes(1, 2).has(2)).toBe(true);
      expect(restored.puzzle).toEqual(grid.puzzle);
      expect(restored.solution).toEqual(grid.solution);
    });

    it('should handle empty notes', () => {
      const json = grid.toJSON();
      const restored = GridModel.fromJSON(json);
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(restored.getNotes(row, col).size).toBe(0);
        }
      }
    });

    it('should throw error for invalid JSON', () => {
      expect(() => GridModel.fromJSON(null)).toThrow();
      expect(() => GridModel.fromJSON({})).toThrow();
      expect(() => GridModel.fromJSON({ puzzle: puzzle })).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle all cells being fixed', () => {
      const fullGrid = new GridModel(solution, solution);
      expect(fullGrid.isComplete()).toBe(true);
      expect(fullGrid.isCorrect()).toBe(true);
      
      // All cells should be fixed
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(fullGrid.isFixed(row, col)).toBe(true);
        }
      }
    });

    it('should handle empty grid', () => {
      const emptyPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      const emptyGrid = new GridModel(emptyPuzzle, solution);
      
      expect(emptyGrid.isComplete()).toBe(false);
      expect(emptyGrid.fixed.size).toBe(0);
    });

    it('should handle notes in all empty cells', () => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid.getValue(row, col) === 0) {
            grid.toggleNote(row, col, 1);
          }
        }
      }
      
      // Verify notes were added
      let noteCount = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid.getValue(row, col) === 0) {
            expect(grid.getNotes(row, col).has(1)).toBe(true);
            noteCount++;
          }
        }
      }
      expect(noteCount).toBeGreaterThan(0);
    });
  });
});
