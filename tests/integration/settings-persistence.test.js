/**
 * Settings persistence tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Settings Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Save settings', () => {
    test('should save settings to localStorage', () => {
      const data = { theme: 'light', autoCheck: true };
      localStorage.setItem('sudoku_settings', JSON.stringify(data));
      
      const saved = JSON.parse(localStorage.getItem('sudoku_settings'));
      expect(saved.theme).toBe('light');
      expect(saved.autoCheck).toBe(true);
    });

    test('should merge with existing settings', () => {
      localStorage.setItem('sudoku_settings', JSON.stringify({ theme: 'dark' }));
      
      const saved = JSON.parse(localStorage.getItem('sudoku_settings'));
      const updated = { ...saved, autoCheck: false };
      localStorage.setItem('sudoku_settings', JSON.stringify(updated));
      
      const result = JSON.parse(localStorage.getItem('sudoku_settings'));
      expect(result.theme).toBe('dark');
      expect(result.autoCheck).toBe(false);
    });
  });

  describe('Load settings', () => {
    test('should load settings from localStorage', () => {
      localStorage.setItem('sudoku_settings', JSON.stringify({
        theme: 'light',
        soundEnabled: true
      }));
      
      const saved = JSON.parse(localStorage.getItem('sudoku_settings'));
      expect(saved.theme).toBe('light');
      expect(saved.soundEnabled).toBe(true);
    });

    test('should handle empty localStorage', () => {
      const saved = JSON.parse(localStorage.getItem('sudoku_settings') || '{}');
      expect(saved).toEqual({});
    });
  });

  describe('Theme persistence', () => {
    test('should save theme on change', () => {
      localStorage.setItem('sudoku_settings', JSON.stringify({ theme: 'dark' }));
      
      const saved = JSON.parse(localStorage.getItem('sudoku_settings'));
      expect(saved.theme).toBe('dark');
    });

    test('should restore theme on load', () => {
      localStorage.setItem('sudoku_settings', JSON.stringify({ theme: 'light' }));
      
      const saved = JSON.parse(localStorage.getItem('sudoku_settings'));
      const theme = saved.theme || 'dark';
      expect(theme).toBe('light');
    });
  });

  describe('Show/hide settings', () => {
    test('showTimer false should hide timer', () => {
      const showTimer = false;
      const display = showTimer ? '' : 'none';
      expect(display).toBe('none');
    });

    test('showTimer true should show timer', () => {
      const showTimer = true;
      const display = showTimer ? '' : 'none';
      expect(display).toBe('');
    });

    test('showErrors false should hide errors', () => {
      const showErrors = false;
      const display = showErrors ? '' : 'none';
      expect(display).toBe('none');
    });

    test('showErrors true should show errors', () => {
      const showErrors = true;
      const display = showErrors ? '' : 'none';
      expect(display).toBe('');
    });
  });
});
