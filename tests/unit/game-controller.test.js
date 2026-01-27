/**
 * Unit tests for GameController
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameController, GameStatus, GameMode } from '../../src/game-controller.js';
import { StorageManager } from '../../src/storage/storage-manager.js';
import { EventBus } from '../../src/utils/event-bus.js';

describe('GameController', () => {
  let controller;
  let mockStorage;
  let eventBus;

  // Sample puzzle for testing
  const samplePuzzle = [
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

  const sampleSolution = [
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

  beforeEach(() => {
    // Mock storage to avoid localStorage issues in tests
    mockStorage = {
      save: vi.fn(),
      load: vi.fn(() => null),
      remove: vi.fn(),
      loadSettings: vi.fn(() => ({
        autoCheck: true,
        highlightSameNumbers: true
      })),
      saveSettings: vi.fn(),
      loadGameState: vi.fn(() => null),
      saveGameState: vi.fn(),
      saveStatistics: vi.fn()
    };

    eventBus = new EventBus();

    controller = new GameController({
      storageManager: mockStorage,
      eventBus
    });
  });

  describe('startNewGame', () => {
    it('should initialize a new game with correct state', () => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');

      const state = controller.getState();
      expect(state.difficulty).toBe('medium');
      expect(state.status).toBe(GameStatus.PLAYING);
      expect(state.errors).toBe(0);
      expect(state.hintsUsed).toBe(0);
      expect(controller.hasActiveGame()).toBe(true);
    });

    it('should emit game_started event', () => {
      const listener = vi.fn();
      eventBus.on('game_started', listener);

      controller.startNewGame(samplePuzzle, sampleSolution, 'easy');

      expect(listener).toHaveBeenCalledWith({
        difficulty: 'easy',
        mode: GameMode.NORMAL
      });
    });
  });


  describe('selectCell', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
    });

    it('should select a cell and emit event', () => {
      const listener = vi.fn();
      eventBus.on('cell_selected', listener);

      controller.selectCell(0, 2);

      const state = controller.getState();
      expect(state.selectedCell.row).toBe(0);
      expect(state.selectedCell.col).toBe(2);
      expect(listener).toHaveBeenCalled();
    });

    it('should highlight same numbers when cell has value', () => {
      // Select cell with value 5
      controller.selectCell(0, 0);

      const state = controller.getState();
      expect(state.highlightedCells.length).toBeGreaterThan(0);
    });

    it('should not highlight when cell is empty', () => {
      // Select empty cell
      controller.selectCell(0, 2);

      const state = controller.getState();
      expect(state.highlightedCells.length).toBe(0);
    });
  });

  describe('inputNumber', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
      controller.selectCell(0, 2); // Select empty cell
    });

    it('should set value in normal mode', () => {
      const listener = vi.fn();
      eventBus.on('value_changed', listener);

      controller.inputNumber(4);

      const grid = controller.getGrid();
      expect(grid.getValue(0, 2)).toBe(4);
      expect(listener).toHaveBeenCalled();
    });

    it('should toggle note in note mode', () => {
      controller.toggleNoteMode();
      const listener = vi.fn();
      eventBus.on('note_toggled', listener);

      controller.inputNumber(4);

      const grid = controller.getGrid();
      const notes = grid.getNotes(0, 2);
      expect(notes.has(4)).toBe(true);
      expect(listener).toHaveBeenCalled();
    });

    it('should not modify fixed cells', () => {
      controller.selectCell(0, 0); // Fixed cell with value 5
      controller.inputNumber(9);

      const grid = controller.getGrid();
      expect(grid.getValue(0, 0)).toBe(5); // Should remain unchanged
    });
  });

  describe('clearCell', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
      controller.selectCell(0, 2);
      controller.inputNumber(4);
    });

    it('should clear a cell value', () => {
      controller.clearCell();

      const grid = controller.getGrid();
      expect(grid.getValue(0, 2)).toBe(0);
    });

    it('should not clear fixed cells', () => {
      controller.selectCell(0, 0); // Fixed cell
      controller.clearCell();

      const grid = controller.getGrid();
      expect(grid.getValue(0, 0)).toBe(5); // Should remain unchanged
    });
  });


  describe('useHint', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
    });

    it('should fill a cell with correct value', () => {
      const listener = vi.fn();
      eventBus.on('hint_used', listener);

      controller.useHint();

      const state = controller.getState();
      expect(state.hintsUsed).toBe(1);
      expect(listener).toHaveBeenCalled();
    });

    it('should increment hints used counter', () => {
      controller.useHint();
      controller.useHint();

      const state = controller.getState();
      expect(state.hintsUsed).toBe(2);
    });
  });

  describe('undo and redo', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
      controller.selectCell(0, 2);
      controller.inputNumber(4);
    });

    it('should undo last action', () => {
      controller.undo();

      const grid = controller.getGrid();
      expect(grid.getValue(0, 2)).toBe(0);
    });

    it('should redo undone action', () => {
      controller.undo();
      controller.redo();

      const grid = controller.getGrid();
      expect(grid.getValue(0, 2)).toBe(4);
    });

    it('should update canUndo and canRedo state', () => {
      let state = controller.getState();
      expect(state.canUndo).toBe(true);
      expect(state.canRedo).toBe(false);

      controller.undo();
      state = controller.getState();
      expect(state.canUndo).toBe(false);
      expect(state.canRedo).toBe(true);
    });
  });

  describe('autoCheck mode', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
      controller.selectCell(0, 2);
    });

    it('should detect conflicts when enabled', () => {
      controller.inputNumber(5); // Conflicts with row

      const state = controller.getState();
      expect(state.conflictCells.length).toBeGreaterThan(0);
      expect(state.errors).toBeGreaterThan(0);
    });

    it('should not detect conflicts when disabled', () => {
      controller.updateSettings({ autoCheck: false });
      controller.inputNumber(5);

      const state = controller.getState();
      expect(state.conflictCells.length).toBe(0);
    });
  });

  describe('game completion', () => {
    it('should detect completion and emit event', () => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'easy');
      
      const listener = vi.fn();
      eventBus.on('game_completed', listener);

      // Fill in all empty cells with correct values
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (samplePuzzle[row][col] === 0) {
            controller.selectCell(row, col);
            controller.inputNumber(sampleSolution[row][col]);
          }
        }
      }

      expect(listener).toHaveBeenCalled();
      const state = controller.getState();
      expect(state.status).toBe(GameStatus.COMPLETED);
    });
  });

  describe('auto-save', () => {
    it('should schedule auto-save after actions', (done) => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
      controller.selectCell(0, 2);
      controller.inputNumber(4);

      // Wait for debounce delay
      setTimeout(() => {
        expect(mockStorage.saveGameState).toHaveBeenCalled();
        done();
      }, 350);
    });
  });

  describe('settings', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
    });

    it('should update autoCheck setting', () => {
      controller.updateSettings({ autoCheck: false });

      const state = controller.getState();
      expect(state.autoCheck).toBe(false);
    });

    it('should update highlightSameNumbers setting', () => {
      controller.updateSettings({ highlightSameNumbers: false });

      const state = controller.getState();
      expect(state.highlightSameNumbers).toBe(false);
    });
  });

  describe('pause and resume', () => {
    beforeEach(() => {
      controller.startNewGame(samplePuzzle, sampleSolution, 'medium');
    });

    it('should pause the game', () => {
      controller.pauseGame();

      const state = controller.getState();
      expect(state.status).toBe(GameStatus.PAUSED);
    });

    it('should resume the game', () => {
      controller.pauseGame();
      controller.resumeGame();

      const state = controller.getState();
      expect(state.status).toBe(GameStatus.PLAYING);
    });
  });
});
