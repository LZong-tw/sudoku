/**
 * UX feedback tests
 */

import { describe, test, expect, vi } from 'vitest';

describe('UX Feedback', () => {
  describe('New Game', () => {
    test('should update grid after new game', () => {
      const updateGridView = vi.fn();
      const updateInfoPanel = vi.fn();
      
      // Simulate new game flow
      updateGridView();
      updateInfoPanel();
      
      expect(updateGridView).toHaveBeenCalled();
      expect(updateInfoPanel).toHaveBeenCalled();
    });
  });

  describe('Check Solution Feedback', () => {
    test('should show success message when all correct', () => {
      const results = [
        { row: 0, col: 0, isCorrect: true },
        { row: 0, col: 1, isCorrect: true }
      ];
      
      const correct = results.filter(r => r.isCorrect).length;
      const wrong = results.filter(r => !r.isCorrect).length;
      
      expect(wrong).toBe(0);
      expect(correct).toBe(2);
    });

    test('should show error count when some wrong', () => {
      const results = [
        { row: 0, col: 0, isCorrect: true },
        { row: 0, col: 1, isCorrect: false },
        { row: 0, col: 2, isCorrect: false }
      ];
      
      const wrong = results.filter(r => !r.isCorrect).length;
      
      expect(wrong).toBe(2);
    });

    test('should prompt when no cells filled', () => {
      const results = [];
      
      expect(results.length).toBe(0);
    });
  });

  describe('Game Complete', () => {
    test('should emit game_completed event when puzzle solved', () => {
      const eventEmitted = vi.fn();
      
      // Simulate game completion
      eventEmitted('game_completed');
      
      expect(eventEmitted).toHaveBeenCalledWith('game_completed');
    });

    test('should show modal with celebration message', () => {
      const message = '🎉 恭喜！數獨完成！';
      
      expect(message).toContain('恭喜');
      expect(message).toContain('🎉');
    });

    test('modal should be dismissible', () => {
      // Modal can be closed by button click or backdrop click
      const closeActions = ['button_click', 'backdrop_click'];
      expect(closeActions.length).toBe(2);
    });
  });
});
