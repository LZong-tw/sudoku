/**
 * Property-based tests for GridModel
 * 
 * These tests verify universal properties that should hold across all valid inputs
 * using fast-check for property-based testing.
 * 
 * @module tests/property/grid-properties
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { GridModel } from '../../src/core/grid-model.js';
import {
  cellWithNotes,
  validValueForCell,
  sudokuNote,
  cellWithValue,
  emptyCellInGrid,
  gridWithPotentialConflict,
  gridWithConflict,
  simplePuzzle,
  simpleSolution
} from '../helpers/arbitraries.js';

describe('GridModel - Property-Based Tests', () => {
  
  /**
   * Feature: sudoku-polish, Property 9: 填入答案清除筆記
   * **Validates: Requirements 3.3**
   * 
   * Property: For any cell with notes, when a value is set in normal mode,
   * all notes for that cell should be cleared.
   */
  describe('Property 9: Setting a value clears notes', () => {
    it('should clear all notes when a value is set in a cell', () => {
      fc.assert(
        fc.property(
          cellWithNotes(),
          validValueForCell(),
          ({ grid: gridWithNotes, row: noteRow, col: noteCol }, { value }) => {
            // Verify the cell has notes before setting value
            const notesBefore = gridWithNotes.getNotes(noteRow, noteCol);
            expect(notesBefore.size).toBeGreaterThan(0);
            
            // Set a value in the cell
            gridWithNotes.setValue(noteRow, noteCol, value);
            
            // Verify all notes are cleared
            const notesAfter = gridWithNotes.getNotes(noteRow, noteCol);
            expect(notesAfter.size).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should clear notes regardless of how many notes were present', () => {
      fc.assert(
        fc.property(
          cellWithNotes(),
          validValueForCell(),
          ({ grid: gridWithNotes, row: noteRow, col: noteCol }, { value }) => {
            // Record the number of notes before
            const noteCountBefore = gridWithNotes.getNotes(noteRow, noteCol).size;
            
            // Set a value
            gridWithNotes.setValue(noteRow, noteCol, value);
            
            // All notes should be cleared, regardless of how many there were
            const noteCountAfter = gridWithNotes.getNotes(noteRow, noteCol).size;
            expect(noteCountAfter).toBe(0);
            expect(noteCountBefore).toBeGreaterThan(0); // Ensure we had notes to begin with
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should clear notes when setting any valid value (1-9)', () => {
      fc.assert(
        fc.property(
          cellWithNotes(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid: gridWithNotes, row: noteRow, col: noteCol }, value) => {
            // Verify the cell has notes
            const notesBefore = gridWithNotes.getNotes(noteRow, noteCol);
            expect(notesBefore.size).toBeGreaterThan(0);
            
            // Set the value (may or may not be valid according to Sudoku rules)
            gridWithNotes.setValue(noteRow, noteCol, value);
            
            // Notes should be cleared regardless of whether the value is correct
            const notesAfter = gridWithNotes.getNotes(noteRow, noteCol);
            expect(notesAfter.size).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should not affect notes in other cells when setting a value', () => {
      fc.assert(
        fc.property(
          cellWithNotes(),
          validValueForCell(),
          ({ grid: gridWithNotes, row: noteRow, col: noteCol }, { value }) => {
            // Add notes to another empty cell
            let otherRow = -1, otherCol = -1;
            for (let r = 0; r < 9; r++) {
              for (let c = 0; c < 9; c++) {
                if ((r !== noteRow || c !== noteCol) && gridWithNotes.getValue(r, c) === 0) {
                  otherRow = r;
                  otherCol = c;
                  break;
                }
              }
              if (otherRow !== -1) break;
            }
            
            // If we found another empty cell, add notes to it
            if (otherRow !== -1) {
              gridWithNotes.toggleNote(otherRow, otherCol, 1);
              gridWithNotes.toggleNote(otherRow, otherCol, 2);
              
              const otherCellNotesBefore = gridWithNotes.getNotes(otherRow, otherCol);
              
              // Set value in the original cell
              gridWithNotes.setValue(noteRow, noteCol, value);
              
              // Notes in the other cell should remain unchanged
              const otherCellNotesAfter = gridWithNotes.getNotes(otherRow, otherCol);
              expect(otherCellNotesAfter.size).toBe(otherCellNotesBefore.size);
              expect(otherCellNotesAfter.has(1)).toBe(true);
              expect(otherCellNotesAfter.has(2)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should keep notes cleared even after setting value to 0 (clearing the cell)', () => {
      fc.assert(
        fc.property(
          cellWithNotes(),
          validValueForCell(),
          ({ grid: gridWithNotes, row: noteRow, col: noteCol }, { value }) => {
            // Set a value (clears notes)
            gridWithNotes.setValue(noteRow, noteCol, value);
            expect(gridWithNotes.getNotes(noteRow, noteCol).size).toBe(0);
            
            // Clear the cell by setting to 0
            gridWithNotes.setValue(noteRow, noteCol, 0);
            
            // Notes should still be empty (not restored)
            expect(gridWithNotes.getNotes(noteRow, noteCol).size).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: sudoku-polish, Property 10: 有答案的格子不允許筆記
   * **Validates: Requirements 3.4**
   * 
   * Property: For any cell with a value, attempting to add notes should be rejected
   * and the cell state should remain unchanged.
   */
  describe('Property 10: Cells with values should not allow notes', () => {
    it('should throw error when attempting to add notes to a cell with a value', () => {
      fc.assert(
        fc.property(
          cellWithValue(),
          sudokuNote(),
          ({ grid, row, col }, note) => {
            // Verify the cell has a value
            const cellValue = grid.getValue(row, col);
            expect(cellValue).toBeGreaterThan(0);
            expect(cellValue).toBeLessThanOrEqual(9);
            
            // Attempting to add a note should throw an error
            expect(() => {
              grid.toggleNote(row, col, note);
            }).toThrow('Cannot add notes to cell with value');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should not modify cell value when note addition is rejected', () => {
      fc.assert(
        fc.property(
          cellWithValue(),
          sudokuNote(),
          ({ grid, row, col }, note) => {
            // Record the cell value before attempting to add note
            const valueBefore = grid.getValue(row, col);
            expect(valueBefore).toBeGreaterThan(0);
            
            // Attempt to add a note (should fail)
            try {
              grid.toggleNote(row, col, note);
            } catch (error) {
              // Expected error
            }
            
            // Cell value should remain unchanged
            const valueAfter = grid.getValue(row, col);
            expect(valueAfter).toBe(valueBefore);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should reject notes for any note number (1-9) when cell has value', () => {
      fc.assert(
        fc.property(
          cellWithValue(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, note) => {
            // Verify the cell has a value
            expect(grid.getValue(row, col)).toBeGreaterThan(0);
            
            // All note numbers should be rejected
            expect(() => {
              grid.toggleNote(row, col, note);
            }).toThrow('Cannot add notes to cell with value');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should reject notes for fixed cells (initial puzzle cells)', () => {
      fc.assert(
        fc.property(
          simplePuzzle(),
          simpleSolution(),
          sudokuNote(),
          (puzzle, solution, note) => {
            const grid = new GridModel(puzzle, solution);
            
            // Find a fixed cell (cell with initial value)
            let fixedRow = -1, fixedCol = -1;
            for (let r = 0; r < 9; r++) {
              for (let c = 0; c < 9; c++) {
                if (grid.isFixed(r, c)) {
                  fixedRow = r;
                  fixedCol = c;
                  break;
                }
              }
              if (fixedRow !== -1) break;
            }
            
            // If we found a fixed cell, verify notes are rejected
            if (fixedRow !== -1) {
              expect(() => {
                grid.toggleNote(fixedRow, fixedCol, note);
              }).toThrow('Cannot add notes to cell with value');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should maintain notes state unchanged after failed note addition', () => {
      fc.assert(
        fc.property(
          cellWithValue(),
          sudokuNote(),
          ({ grid, row, col }, note) => {
            // Get notes before (should be empty for a cell with value)
            const notesBefore = grid.getNotes(row, col);
            expect(notesBefore.size).toBe(0);
            
            // Attempt to add a note (should fail)
            try {
              grid.toggleNote(row, col, note);
            } catch (error) {
              // Expected error
            }
            
            // Notes should still be empty
            const notesAfter = grid.getNotes(row, col);
            expect(notesAfter.size).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should reject notes even if the cell value matches the note number', () => {
      fc.assert(
        fc.property(
          cellWithValue(),
          ({ grid, row, col }) => {
            // Get the cell value
            const cellValue = grid.getValue(row, col);
            
            // Try to add a note with the same number as the cell value
            expect(() => {
              grid.toggleNote(row, col, cellValue);
            }).toThrow('Cannot add notes to cell with value');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: sudoku-polish, Property 11: 自動檢查驗證規則違反
   * **Validates: Requirements 4.1, 4.5**
   * 
   * Property: For any input, when auto-check is enabled, if input violates Sudoku rules
   * (row, column, or 3x3 box duplicates), it should be detected and marked as conflict.
   */
  describe('Property 11: Auto-check validates rule violations', () => {
    it('should detect conflicts when a value violates Sudoku rules', () => {
      fc.assert(
        fc.property(
          gridWithPotentialConflict(),
          ({ grid, row, col, value, hasConflict }) => {
            // Check if the value is valid according to Sudoku rules
            const isValid = grid.isValid(row, col, value);
            
            // The isValid result should match our expectation
            expect(isValid).toBe(!hasConflict);
            
            // If there's a conflict, isValid should return false
            if (hasConflict) {
              expect(isValid).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect row conflicts', () => {
      fc.assert(
        fc.property(
          gridWithConflict(),
          ({ grid, row, col, value, conflictType }) => {
            // If the conflict is in the row, isValid should return false
            if (conflictType === 'row') {
              expect(grid.isValid(row, col, value)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect column conflicts', () => {
      fc.assert(
        fc.property(
          gridWithConflict(),
          ({ grid, row, col, value, conflictType }) => {
            // If the conflict is in the column, isValid should return false
            if (conflictType === 'column') {
              expect(grid.isValid(row, col, value)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect 3x3 box conflicts', () => {
      fc.assert(
        fc.property(
          gridWithConflict(),
          ({ grid, row, col, value, conflictType }) => {
            // If the conflict is in the box, isValid should return false
            if (conflictType === 'box') {
              expect(grid.isValid(row, col, value)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should return true for valid placements with no conflicts', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          ({ grid, row, col }) => {
            // Use the correct solution value (should be valid)
            const correctValue = grid.solution[row][col];
            
            // This should be valid (no conflicts)
            expect(grid.isValid(row, col, correctValue)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should consistently detect the same conflict for the same input', () => {
      fc.assert(
        fc.property(
          gridWithPotentialConflict(),
          ({ grid, row, col, value }) => {
            // Check validity twice - should get the same result
            const firstCheck = grid.isValid(row, col, value);
            const secondCheck = grid.isValid(row, col, value);
            
            expect(firstCheck).toBe(secondCheck);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect conflicts for all invalid values (1-9)', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, value) => {
            const isValid = grid.isValid(row, col, value);
            
            // If invalid, there must be a conflict somewhere
            if (!isValid) {
              // Check that there's actually a duplicate in row, column, or box
              let foundConflict = false;
              
              // Check row
              for (let c = 0; c < 9; c++) {
                if (c !== col && grid.getValue(row, c) === value) {
                  foundConflict = true;
                  break;
                }
              }
              
              // Check column
              if (!foundConflict) {
                for (let r = 0; r < 9; r++) {
                  if (r !== row && grid.getValue(r, col) === value) {
                    foundConflict = true;
                    break;
                  }
                }
              }
              
              // Check 3x3 box
              if (!foundConflict) {
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;
                for (let r = boxRow; r < boxRow + 3; r++) {
                  for (let c = boxCol; c < boxCol + 3; c++) {
                    if ((r !== row || c !== col) && grid.getValue(r, c) === value) {
                      foundConflict = true;
                      break;
                    }
                  }
                  if (foundConflict) break;
                }
              }
              
              expect(foundConflict).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: sudoku-polish, Property 12: 衝突檢測的完整性
   * **Validates: Requirements 4.2**
   * 
   * Property: For any position and value, conflict detection should return all cells
   * that conflict with that value (same row, same column, same 3x3 box).
   */
  describe('Property 12: Conflict detection completeness', () => {
    it('should return all conflicting cells for a given value', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, value) => {
            const conflicts = grid.getConflicts(row, col, value);
            
            // Manually find all conflicts
            const expectedConflicts = [];
            
            // Check row
            for (let c = 0; c < 9; c++) {
              if (c !== col && grid.getValue(row, c) === value) {
                expectedConflicts.push({ row, col: c });
              }
            }
            
            // Check column
            for (let r = 0; r < 9; r++) {
              if (r !== row && grid.getValue(r, col) === value) {
                expectedConflicts.push({ row: r, col });
              }
            }
            
            // Check 3x3 box
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = boxRow; r < boxRow + 3; r++) {
              for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && grid.getValue(r, c) === value) {
                  // Avoid duplicates (already in row/col)
                  if (r !== row && c !== col) {
                    expectedConflicts.push({ row: r, col: c });
                  }
                }
              }
            }
            
            // The returned conflicts should match expected conflicts
            expect(conflicts.length).toBe(expectedConflicts.length);
            
            // Check that all expected conflicts are in the result
            for (const expected of expectedConflicts) {
              const found = conflicts.some(
                c => c.row === expected.row && c.col === expected.col
              );
              expect(found).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should return empty array when no conflicts exist', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          ({ grid, row, col }) => {
            // Use the correct solution value (should have no conflicts)
            const correctValue = grid.solution[row][col];
            const conflicts = grid.getConflicts(row, col, correctValue);
            
            expect(conflicts).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect all row conflicts', () => {
      fc.assert(
        fc.property(
          gridWithConflict(),
          ({ grid, row, col, value, conflictType }) => {
            if (conflictType === 'row') {
              const conflicts = grid.getConflicts(row, col, value);
              
              // Should have at least one conflict in the same row
              const rowConflicts = conflicts.filter(c => c.row === row);
              expect(rowConflicts.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect all column conflicts', () => {
      fc.assert(
        fc.property(
          gridWithConflict(),
          ({ grid, row, col, value, conflictType }) => {
            if (conflictType === 'column') {
              const conflicts = grid.getConflicts(row, col, value);
              
              // Should have at least one conflict in the same column
              const colConflicts = conflicts.filter(c => c.col === col);
              expect(colConflicts.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should detect all 3x3 box conflicts', () => {
      fc.assert(
        fc.property(
          gridWithConflict(),
          ({ grid, row, col, value, conflictType }) => {
            if (conflictType === 'box') {
              const conflicts = grid.getConflicts(row, col, value);
              
              // Should have at least one conflict in the same box
              const boxRow = Math.floor(row / 3) * 3;
              const boxCol = Math.floor(col / 3) * 3;
              
              const boxConflicts = conflicts.filter(c => {
                const cBoxRow = Math.floor(c.row / 3) * 3;
                const cBoxCol = Math.floor(c.col / 3) * 3;
                return cBoxRow === boxRow && cBoxCol === boxCol;
              });
              
              expect(boxConflicts.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should not include the target cell itself in conflicts', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, value) => {
            const conflicts = grid.getConflicts(row, col, value);
            
            // The target cell should not be in the conflicts list
            const selfConflict = conflicts.some(c => c.row === row && c.col === col);
            expect(selfConflict).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should return consistent results for the same input', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, value) => {
            const conflicts1 = grid.getConflicts(row, col, value);
            const conflicts2 = grid.getConflicts(row, col, value);
            
            // Should get the same conflicts both times
            expect(conflicts1.length).toBe(conflicts2.length);
            
            for (const c1 of conflicts1) {
              const found = conflicts2.some(c2 => c2.row === c1.row && c2.col === c1.col);
              expect(found).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should not return duplicate conflict positions', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, value) => {
            const conflicts = grid.getConflicts(row, col, value);
            
            // Check for duplicates
            const seen = new Set();
            for (const conflict of conflicts) {
              const key = `${conflict.row},${conflict.col}`;
              expect(seen.has(key)).toBe(false);
              seen.add(key);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should handle edge cases with multiple conflicts in different regions', () => {
      fc.assert(
        fc.property(
          emptyCellInGrid(),
          fc.integer({ min: 1, max: 9 }),
          ({ grid, row, col }, value) => {
            const conflicts = grid.getConflicts(row, col, value);
            
            // Count conflicts by region
            let rowConflicts = 0;
            let colConflicts = 0;
            let boxConflicts = 0;
            
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            
            for (const c of conflicts) {
              if (c.row === row) rowConflicts++;
              if (c.col === col) colConflicts++;
              
              const cBoxRow = Math.floor(c.row / 3) * 3;
              const cBoxCol = Math.floor(c.col / 3) * 3;
              if (cBoxRow === boxRow && cBoxCol === boxCol) {
                // Only count as box conflict if not already counted in row/col
                if (c.row !== row && c.col !== col) {
                  boxConflicts++;
                }
              }
            }
            
            // Total conflicts should equal sum of region conflicts
            expect(conflicts.length).toBe(rowConflicts + colConflicts + boxConflicts);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
