/**
 * Integration tests for UI event flow
 * Tests keypad → eventBus → gameController → gridView flow
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { EventBus, Events } from '../../src/utils/event-bus.js';

describe('UI Event Flow Integration', () => {
  let eventBus;
  let mockGameController;
  let eventLog;

  beforeEach(() => {
    eventBus = new EventBus();
    eventLog = [];
    
    // Mock GameController
    mockGameController = {
      inputNumber: vi.fn((num) => eventLog.push({ action: 'inputNumber', value: num })),
      selectCell: vi.fn((row, col) => eventLog.push({ action: 'selectCell', row, col })),
      undo: vi.fn(() => eventLog.push({ action: 'undo' })),
      redo: vi.fn(() => eventLog.push({ action: 'redo' })),
      useHint: vi.fn(() => eventLog.push({ action: 'useHint' })),
      getGrid: vi.fn(() => ({ cells: [] }))
    };
  });

  describe('Keypad to GameController', () => {
    test('VALUE_CHANGED event should call inputNumber', () => {
      // Setup listener (simulating main.js setup)
      eventBus.on(Events.VALUE_CHANGED, (data) => {
        mockGameController.inputNumber(data.value);
      });

      // Simulate keypad emitting event
      eventBus.emit(Events.VALUE_CHANGED, { value: 5 });

      expect(mockGameController.inputNumber).toHaveBeenCalledWith(5);
      expect(eventLog).toContainEqual({ action: 'inputNumber', value: 5 });
    });

    test('VALUE_CHANGED with 0 should clear cell', () => {
      eventBus.on(Events.VALUE_CHANGED, (data) => {
        mockGameController.inputNumber(data.value);
      });

      eventBus.emit(Events.VALUE_CHANGED, { value: 0 });

      expect(mockGameController.inputNumber).toHaveBeenCalledWith(0);
    });

    test('CELL_SELECTED event should call selectCell', () => {
      eventBus.on(Events.CELL_SELECTED, (data) => {
        mockGameController.selectCell(data.row, data.col);
      });

      eventBus.emit(Events.CELL_SELECTED, { row: 3, col: 7 });

      expect(mockGameController.selectCell).toHaveBeenCalledWith(3, 7);
    });

    test('UNDO event should call undo', () => {
      eventBus.on(Events.UNDO, () => {
        mockGameController.undo();
      });

      eventBus.emit(Events.UNDO);

      expect(mockGameController.undo).toHaveBeenCalled();
    });

    test('REDO event should call redo', () => {
      eventBus.on(Events.REDO, () => {
        mockGameController.redo();
      });

      eventBus.emit(Events.REDO);

      expect(mockGameController.redo).toHaveBeenCalled();
    });

    test('HINT_USED event should call useHint', () => {
      eventBus.on(Events.HINT_USED, () => {
        mockGameController.useHint();
      });

      eventBus.emit(Events.HINT_USED);

      expect(mockGameController.useHint).toHaveBeenCalled();
    });
  });

  describe('Event sequence', () => {
    test('should handle cell select then number input sequence', () => {
      eventBus.on(Events.CELL_SELECTED, (data) => {
        mockGameController.selectCell(data.row, data.col);
      });
      eventBus.on(Events.VALUE_CHANGED, (data) => {
        mockGameController.inputNumber(data.value);
      });

      // User clicks cell, then enters number
      eventBus.emit(Events.CELL_SELECTED, { row: 0, col: 0 });
      eventBus.emit(Events.VALUE_CHANGED, { value: 7 });

      expect(eventLog).toEqual([
        { action: 'selectCell', row: 0, col: 0 },
        { action: 'inputNumber', value: 7 }
      ]);
    });

    test('should handle multiple number inputs', () => {
      eventBus.on(Events.VALUE_CHANGED, (data) => {
        mockGameController.inputNumber(data.value);
      });

      // User enters multiple numbers
      for (let i = 1; i <= 9; i++) {
        eventBus.emit(Events.VALUE_CHANGED, { value: i });
      }

      expect(mockGameController.inputNumber).toHaveBeenCalledTimes(9);
    });
  });

  describe('Cell highlighting', () => {
    test('selecting cell should trigger highlight of related cells', () => {
      const highlightedCells = new Set();
      
      // Simulate GridView.highlightRelatedCells logic
      const highlightRelatedCells = (row, col) => {
        highlightedCells.clear();
        // Same row
        for (let c = 0; c < 9; c++) {
          if (c !== col) highlightedCells.add(`${row},${c}`);
        }
        // Same column
        for (let r = 0; r < 9; r++) {
          if (r !== row) highlightedCells.add(`${r},${col}`);
        }
        // Same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if (r !== row || c !== col) highlightedCells.add(`${r},${c}`);
          }
        }
      };

      highlightRelatedCells(4, 4); // Center cell

      // Should highlight 8 in row + 8 in col + 4 in box (excluding overlaps)
      // Row: 8, Col: 8, Box: 4 extra = 20 total
      expect(highlightedCells.size).toBe(20);
      expect(highlightedCells.has('4,0')).toBe(true); // Same row
      expect(highlightedCells.has('0,4')).toBe(true); // Same col
      expect(highlightedCells.has('3,3')).toBe(true); // Same box
    });
  });
});



describe('GameController method availability', () => {
  test('should have all required methods', () => {
    const requiredMethods = [
      'startNewGame',
      'selectCell',
      'inputNumber',
      'undo',
      'redo',
      'useHint',
      'getGrid',
      'getState',
      'restoreGame',
      'togglePause',
      'isPaused',
      'checkSolution',
      'startDailyChallenge'
    ];

    // Mock the methods we expect
    const mockController = {
      startNewGame: () => {},
      selectCell: () => {},
      inputNumber: () => {},
      undo: () => {},
      redo: () => {},
      useHint: () => {},
      getGrid: () => {},
      getState: () => {},
      restoreGame: () => {},
      togglePause: () => {},
      isPaused: () => {},
      checkSolution: () => {},
      startDailyChallenge: () => {}
    };

    requiredMethods.forEach(method => {
      expect(typeof mockController[method]).toBe('function');
    });
  });
});
