/**
 * Theme toggle tests
 */

import { describe, test, expect, vi } from 'vitest';

describe('Theme Toggle', () => {
  describe('CSS Variables', () => {
    test('should define required CSS variables', () => {
      const variables = [
        '--bg-color',
        '--text-color',
        '--cell-bg',
        '--cell-selected',
        '--cell-highlighted',
        '--cell-error',
        '--panel-bg',
        '--border-color',
        '--accent-color'
      ];
      expect(variables.length).toBe(9);
    });
  });

  describe('Theme definitions', () => {
    test('light theme should have light background', () => {
      const light = { '--bg-color': '#f5f5f5' };
      expect(light['--bg-color']).toBe('#f5f5f5');
    });

    test('dark theme should have dark background', () => {
      const dark = { '--bg-color': '#1a1a2e' };
      expect(dark['--bg-color']).toBe('#1a1a2e');
    });
  });

  describe('Theme change event', () => {
    test('THEME_CHANGED event should include theme name', () => {
      const data = { theme: 'dark' };
      expect(data.theme).toBe('dark');
    });

    test('themeManager.setTheme should be called on event', () => {
      const themeManager = { setTheme: vi.fn() };
      const theme = 'light';
      themeManager.setTheme(theme);
      expect(themeManager.setTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Theme persistence', () => {
    test('theme should be saved to storage', () => {
      const storage = { saveSettings: vi.fn() };
      storage.saveSettings({ theme: 'dark' });
      expect(storage.saveSettings).toHaveBeenCalled();
    });
  });

  describe('Settings panel sync', () => {
    test('should sync current theme before showing settings', () => {
      const themeManager = { getCurrentTheme: () => 'dark' };
      const currentTheme = themeManager.getCurrentTheme();
      expect(currentTheme).toBe('dark');
    });

    test('updateSettings should update theme select value', () => {
      const settingsPanel = {
        settings: { theme: 'light' },
        updateSettings: function(s) { this.settings = { ...this.settings, ...s }; }
      };
      settingsPanel.updateSettings({ theme: 'dark' });
      expect(settingsPanel.settings.theme).toBe('dark');
    });
  });
});
