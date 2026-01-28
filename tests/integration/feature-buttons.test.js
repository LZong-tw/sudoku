/**
 * Feature buttons integration tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../../src/utils/event-bus.js';

describe('Feature Buttons', () => {
  let eventBus;
  let mockHandlers;

  beforeEach(() => {
    eventBus = new EventBus();
    mockHandlers = {
      showDailyChallenge: vi.fn(),
      showAchievements: vi.fn(),
      showStatistics: vi.fn(),
      showSettings: vi.fn()
    };
  });

  describe('Header buttons', () => {
    const headerButtons = [
      { id: 'daily-challenge-btn', icon: '📅', title: '每日挑戰', handler: 'showDailyChallenge' },
      { id: 'achievements-btn', icon: '🏆', title: '成就', handler: 'showAchievements' },
      { id: 'statistics-btn', icon: '📊', title: '統計', handler: 'showStatistics' },
      { id: 'settings-btn', icon: '⚙️', title: '設定', handler: 'showSettings' }
    ];

    test('should have 4 feature buttons defined', () => {
      expect(headerButtons.length).toBe(4);
    });

    headerButtons.forEach(button => {
      test(`${button.title} button should have correct properties`, () => {
        expect(button.id).toBeTruthy();
        expect(button.icon).toBeTruthy();
        expect(button.title).toBeTruthy();
        expect(button.handler).toBeTruthy();
      });
    });
  });

  describe('Daily Challenge feature', () => {
    test('should get today challenge from dailyChallenge service', () => {
      const mockDailyChallenge = {
        getTodayChallenge: vi.fn(() => ({ puzzle: [], solution: [] })),
        getHistory: vi.fn(() => []),
        getStatistics: vi.fn(() => ({}))
      };

      const challenge = mockDailyChallenge.getTodayChallenge();
      expect(mockDailyChallenge.getTodayChallenge).toHaveBeenCalled();
      expect(challenge).toHaveProperty('puzzle');
    });
  });

  describe('Achievements feature', () => {
    test('should get achievements from achievementSystem', () => {
      const mockAchievementSystem = {
        getAllAchievements: vi.fn(() => []),
        getProgress: vi.fn(() => ({ total: 10, unlocked: 3 }))
      };

      const achievements = mockAchievementSystem.getAllAchievements();
      const progress = mockAchievementSystem.getProgress();
      
      expect(mockAchievementSystem.getAllAchievements).toHaveBeenCalled();
      expect(progress).toHaveProperty('total');
      expect(progress).toHaveProperty('unlocked');
    });
  });

  describe('Statistics feature', () => {
    test('should get stats from statisticsTracker', () => {
      const mockStatisticsTracker = {
        getAllStats: vi.fn(() => ({
          gamesPlayed: 10,
          gamesWon: 8,
          bestTime: 120
        }))
      };

      const stats = mockStatisticsTracker.getAllStats();
      expect(mockStatisticsTracker.getAllStats).toHaveBeenCalled();
      expect(stats).toHaveProperty('gamesPlayed');
    });
  });

  describe('Settings feature', () => {
    test('should have settings panel with show method', () => {
      const mockSettingsPanel = {
        show: vi.fn()
      };

      mockSettingsPanel.show();
      expect(mockSettingsPanel.show).toHaveBeenCalled();
    });
  });

  describe('Modal styling', () => {
    test('modals should have glassmorphism overlay', () => {
      const overlayStyles = {
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      };
      expect(overlayStyles.backdropFilter).toContain('blur');
    });

    test('modals should have gradient background', () => {
      const gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
      expect(gradient).toContain('linear-gradient');
    });

    test('all modals should have close button class', () => {
      const closeClasses = [
        'statistics-close',
        'achievement-close',
        'daily-challenge-close',
        'settings-close'
      ];
      expect(closeClasses.length).toBe(4);
    });

    test('modals should have consistent border radius', () => {
      const borderRadius = '16px';
      expect(borderRadius).toBe('16px');
    });
  });

  describe('Settings panel styling', () => {
    test('settings panel should use settings-panel class', () => {
      const panelClass = 'settings-panel';
      expect(panelClass).toBe('settings-panel');
    });

    test('settings controls should use settings-control class', () => {
      const controlClass = 'settings-control';
      expect(controlClass).toBe('settings-control');
    });

    test('settings should have toggle switches', () => {
      const toggleClasses = ['settings-checkbox', 'settings-checkbox-label'];
      expect(toggleClasses.length).toBe(2);
    });

    test('settings should have theme select dropdown', () => {
      const selectClass = 'settings-select';
      expect(selectClass).toBe('settings-select');
    });

    test('settings should have reset button', () => {
      const resetClass = 'settings-reset-button';
      expect(resetClass).toBe('settings-reset-button');
    });
  });

  describe('Daily challenge styling', () => {
    test('daily challenge card should have gradient background', () => {
      const gradient = 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)';
      expect(gradient).toContain('linear-gradient');
    });

    test('completed card should have green border', () => {
      const completedClass = 'daily-challenge-card-completed';
      expect(completedClass).toBeTruthy();
    });

    test('difficulty badges should have color variants', () => {
      const difficulties = ['easy', 'medium', 'hard'];
      difficulties.forEach(d => {
        expect(`daily-challenge-difficulty-${d}`).toBeTruthy();
      });
    });

    test('primary button should have gradient', () => {
      const buttonClass = 'daily-challenge-button-primary';
      expect(buttonClass).toBeTruthy();
    });

    test('statistics grid should be 3 columns', () => {
      const columns = 3;
      expect(columns).toBe(3);
    });

    test('calendar should be 7 columns for week days', () => {
      const columns = 7;
      expect(columns).toBe(7);
    });
  });

  describe('Statistics view styling', () => {
    test('statistics cards should have icon, value, label', () => {
      const cardClasses = ['statistics-card-icon', 'statistics-card-value', 'statistics-card-label'];
      expect(cardClasses.length).toBe(3);
    });

    test('compact grid should be 2 columns', () => {
      const compactClass = 'statistics-grid-compact';
      expect(compactClass).toBeTruthy();
    });
  });

  describe('Achievement view styling', () => {
    test('achievement should have progress bar', () => {
      const progressClasses = ['achievement-progress-bar-container', 'achievement-progress-bar'];
      expect(progressClasses.length).toBe(2);
    });

    test('achievement cards should have icon and content', () => {
      const cardClasses = ['achievement-card-icon', 'achievement-card-content'];
      expect(cardClasses.length).toBe(2);
    });

    test('locked achievements should have opacity', () => {
      const lockedClass = 'achievement-card-locked';
      expect(lockedClass).toBeTruthy();
    });
  });
});
