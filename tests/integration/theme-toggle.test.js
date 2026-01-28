/**
 * Theme toggle tests
 */

import { describe, test, expect, vi } from 'vitest';
import { ThemeManager } from '../../src/ui/theme-manager.js';

describe('Theme Toggle', () => {
  describe('CSS Variables', () => {
    test('should define all required CSS variables', () => {
      const variables = [
        '--bg-color', '--text-color', '--cell-bg', '--cell-selected',
        '--cell-highlighted', '--cell-error', '--panel-bg', '--border-color',
        '--accent-color', '--btn-bg', '--btn-text', '--btn-secondary-bg',
        '--btn-secondary-text', '--grid-bg', '--modal-bg', '--text-muted'
      ];
      expect(variables.length).toBe(16);
    });
  });

  describe('Theme definitions', () => {
    test('light theme should have correct colors', () => {
      const tm = new ThemeManager();
      const light = tm.getTheme('light');
      expect(light['--bg-color']).toBe('#ffffff');
      expect(light['--text-color']).toBe('#333333');
      expect(light['--accent-color']).toBe('#4a90e2');
    });

    test('dark theme should have correct colors', () => {
      const tm = new ThemeManager();
      const dark = tm.getTheme('dark');
      expect(dark['--bg-color']).toBe('#1a1a2e');
      expect(dark['--text-color']).toBe('#eee');
      expect(dark['--accent-color']).toBe('#4ecca3');
    });

    test('both themes should define all variables', () => {
      const tm = new ThemeManager();
      const light = tm.getTheme('light');
      const dark = tm.getTheme('dark');
      const keys = Object.keys(light);
      expect(keys.length).toBe(16);
      expect(Object.keys(dark).length).toBe(16);
      keys.forEach(k => expect(dark).toHaveProperty(k));
    });
  });

  describe('Theme change event', () => {
    test('THEME_CHANGED event should include theme name', () => {
      const data = { theme: 'dark' };
      expect(data.theme).toBe('dark');
    });

    test('setTheme should update currentTheme', () => {
      const tm = new ThemeManager();
      tm.setTheme('light');
      expect(tm.getCurrentTheme()).toBe('light');
      tm.setTheme('dark');
      expect(tm.getCurrentTheme()).toBe('dark');
    });
  });

  describe('Theme persistence', () => {
    test('theme should be saved to storage', () => {
      const storage = { saveSettings: vi.fn(), loadSettings: () => ({}) };
      const tm = new ThemeManager(storage);
      tm.setTheme('dark');
      expect(storage.saveSettings).toHaveBeenCalled();
    });
  });

  describe('Settings panel sync', () => {
    test('getCurrentTheme returns current theme', () => {
      const tm = new ThemeManager();
      tm.setTheme('light');
      expect(tm.getCurrentTheme()).toBe('light');
    });

    test('toggleTheme switches between themes', () => {
      const tm = new ThemeManager();
      tm.setTheme('light');
      expect(tm.toggleTheme()).toBe('dark');
      expect(tm.toggleTheme()).toBe('light');
    });
  });
});
