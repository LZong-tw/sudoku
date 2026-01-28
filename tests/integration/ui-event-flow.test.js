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
  });
});
