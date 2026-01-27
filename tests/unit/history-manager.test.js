/**
 * @fileoverview Unit tests for HistoryManager
 * @module tests/unit/history-manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager, ActionType } from '../../src/core/history-manager.js';

describe('HistoryManager', () => {
  let history;

  beforeEach(() => {
    history = new HistoryManager();
  });

  describe('constructor', () => {
    it('should initialize with empty history', () => {
      expect(history.history.length).toBe(0);
      expect(history.currentIndex).toBe(-1);
    });

    it('should set default maxSize to 100', () => {
      expect(history.maxSize).toBe(100);
    });

    it('should accept custom maxSize', () => {
      const customHistory = new HistoryManager(50);
      expect(customHistory.maxSize).toBe(50);
    });

    it('should throw error for invalid maxSize', () => {
      expect(() => new HistoryManager(0)).toThrow();
      expect(() => new HistoryManager(-1)).toThrow();
      expect(() => new HistoryManager(1.5)).toThrow();
      expect(() => new HistoryManager('invalid')).toThrow();
    });
  });

  describe('push', () => {
    it('should add action to history', () => {
      const action = {
        type: ActionType.SET_VALUE,
        row: 0,
        col: 0,
        oldValue: 0,
        newValue: 5
      };

      history.push(action);

      expect(history.history.length).toBe(1);
      expect(history.currentIndex).toBe(0);
      expect(history.history[0]).toEqual(action);
    });

    it('should clear redo history when pushing new action', () => {
      // Push 3 actions
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 1, oldValue: 0, newValue: 2 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 2, oldValue: 0, newValue: 3 });

      // Undo twice
      history.undo();
      history.undo();

      expect(history.currentIndex).toBe(0);
      expect(history.history.length).toBe(3);

      // Push new action - should clear redo history
      history.push({ type: ActionType.SET_VALUE, row: 1, col: 0, oldValue: 0, newValue: 4 });

      expect(history.currentIndex).toBe(1);
      expect(history.history.length).toBe(2);
      expect(history.canRedo()).toBe(false);
    });

    it('should maintain maxSize limit', () => {
      const smallHistory = new HistoryManager(3);

      // Push 5 actions
      for (let i = 0; i < 5; i++) {
        smallHistory.push({
          type: ActionType.SET_VALUE,
          row: 0,
          col: i,
          oldValue: 0,
          newValue: i + 1
        });
      }

      // Should only keep last 3
      expect(smallHistory.history.length).toBe(3);
      expect(smallHistory.currentIndex).toBe(2);
      expect(smallHistory.history[0].newValue).toBe(3); // First action should be the 3rd one pushed
    });

    it('should throw error for invalid action', () => {
      expect(() => history.push(null)).toThrow();
      expect(() => history.push(undefined)).toThrow();
      expect(() => history.push('invalid')).toThrow();
    });

    it('should throw error for action missing required fields', () => {
      expect(() => history.push({ type: ActionType.SET_VALUE })).toThrow();
      expect(() => history.push({ row: 0, col: 0 })).toThrow();
    });

    it('should validate row and col are within bounds', () => {
      expect(() => history.push({
        type: ActionType.SET_VALUE,
        row: -1,
        col: 0,
        oldValue: 0,
        newValue: 1
      })).toThrow();

      expect(() => history.push({
        type: ActionType.SET_VALUE,
        row: 0,
        col: 9,
        oldValue: 0,
        newValue: 1
      })).toThrow();
    });
  });

  describe('undo', () => {
    it('should return null when no actions to undo', () => {
      expect(history.undo()).toBeNull();
    });

    it('should return last action and decrement index', () => {
      const action = {
        type: ActionType.SET_VALUE,
        row: 0,
        col: 0,
        oldValue: 0,
        newValue: 5
      };

      history.push(action);
      const undoneAction = history.undo();

      expect(undoneAction).toEqual(action);
      expect(history.currentIndex).toBe(-1);
    });

    it('should allow multiple undos', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 1, oldValue: 0, newValue: 2 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 2, oldValue: 0, newValue: 3 });

      const action3 = history.undo();
      const action2 = history.undo();
      const action1 = history.undo();

      expect(action3.newValue).toBe(3);
      expect(action2.newValue).toBe(2);
      expect(action1.newValue).toBe(1);
      expect(history.currentIndex).toBe(-1);
    });

    it('should return null when trying to undo beyond history', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.undo();

      expect(history.undo()).toBeNull();
    });
  });

  describe('redo', () => {
    it('should return null when no actions to redo', () => {
      expect(history.redo()).toBeNull();
    });

    it('should return null when at end of history', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      expect(history.redo()).toBeNull();
    });

    it('should redo undone action', () => {
      const action = {
        type: ActionType.SET_VALUE,
        row: 0,
        col: 0,
        oldValue: 0,
        newValue: 5
      };

      history.push(action);
      history.undo();

      const redoneAction = history.redo();

      expect(redoneAction).toEqual(action);
      expect(history.currentIndex).toBe(0);
    });

    it('should allow multiple redos', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 1, oldValue: 0, newValue: 2 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 2, oldValue: 0, newValue: 3 });

      history.undo();
      history.undo();
      history.undo();

      const action1 = history.redo();
      const action2 = history.redo();
      const action3 = history.redo();

      expect(action1.newValue).toBe(1);
      expect(action2.newValue).toBe(2);
      expect(action3.newValue).toBe(3);
      expect(history.currentIndex).toBe(2);
    });
  });

  describe('canUndo', () => {
    it('should return false for empty history', () => {
      expect(history.canUndo()).toBe(false);
    });

    it('should return true when actions can be undone', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      expect(history.canUndo()).toBe(true);
    });

    it('should return false after undoing all actions', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.undo();
      expect(history.canUndo()).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('should return false for empty history', () => {
      expect(history.canRedo()).toBe(false);
    });

    it('should return false when at end of history', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      expect(history.canRedo()).toBe(false);
    });

    it('should return true after undo', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.undo();
      expect(history.canRedo()).toBe(true);
    });

    it('should return false after pushing new action', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.undo();
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 1, oldValue: 0, newValue: 2 });
      expect(history.canRedo()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 });
      history.push({ type: ActionType.SET_VALUE, row: 0, col: 1, oldValue: 0, newValue: 2 });

      history.clear();

      expect(history.history.length).toBe(0);
      expect(history.currentIndex).toBe(-1);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  describe('action types', () => {
    it('should support SET_VALUE action type', () => {
      history.push({
        type: ActionType.SET_VALUE,
        row: 0,
        col: 0,
        oldValue: 0,
        newValue: 5
      });

      expect(history.history[0].type).toBe(ActionType.SET_VALUE);
    });

    it('should support TOGGLE_NOTE action type', () => {
      history.push({
        type: ActionType.TOGGLE_NOTE,
        row: 0,
        col: 0,
        oldValue: new Set(),
        newValue: new Set([1, 2, 3])
      });

      expect(history.history[0].type).toBe(ActionType.TOGGLE_NOTE);
    });

    it('should support CLEAR_CELL action type', () => {
      history.push({
        type: ActionType.CLEAR_CELL,
        row: 0,
        col: 0,
        oldValue: 5,
        newValue: 0
      });

      expect(history.history[0].type).toBe(ActionType.CLEAR_CELL);
    });

    it('should support HINT_USED action type', () => {
      history.push({
        type: ActionType.HINT_USED,
        row: 0,
        col: 0,
        oldValue: 0,
        newValue: 5
      });

      expect(history.history[0].type).toBe(ActionType.HINT_USED);
    });
  });

  describe('undo/redo round-trip', () => {
    it('should maintain state consistency through undo/redo cycles', () => {
      const actions = [
        { type: ActionType.SET_VALUE, row: 0, col: 0, oldValue: 0, newValue: 1 },
        { type: ActionType.SET_VALUE, row: 0, col: 1, oldValue: 0, newValue: 2 },
        { type: ActionType.SET_VALUE, row: 0, col: 2, oldValue: 0, newValue: 3 }
      ];

      // Push all actions
      actions.forEach(action => history.push(action));

      // Undo all
      history.undo();
      history.undo();
      history.undo();

      // Redo all
      const redone1 = history.redo();
      const redone2 = history.redo();
      const redone3 = history.redo();

      // Should match original actions
      expect(redone1).toEqual(actions[0]);
      expect(redone2).toEqual(actions[1]);
      expect(redone3).toEqual(actions[2]);
      expect(history.currentIndex).toBe(2);
    });
  });
});
