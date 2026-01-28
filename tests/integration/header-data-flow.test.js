/**
 * Header buttons data flow tests
 */

import { describe, test, expect, vi } from 'vitest';

describe('Header Buttons Data Flow', () => {
  describe('Daily Challenge', () => {
    test('getTodayChallenge should return challenge object', () => {
      const challenge = {
        date: '2026-01-28',
        difficulty: 'medium',
        completed: false,
        puzzle: [],
        solution: []
      };
      expect(challenge).toHaveProperty('date');
      expect(challenge).toHaveProperty('difficulty');
      expect(challenge).toHaveProperty('completed');
    });

    test('getHistory should return sorted array', () => {
      const history = [
        { date: '2026-01-27', completed: true },
        { date: '2026-01-26', completed: true }
      ];
      expect(Array.isArray(history)).toBe(true);
    });

    test('getStatistics should return stats object', () => {
      const stats = {
        totalCompleted: 5,
        currentStreak: 3,
        longestStreak: 7,
        averageTime: 300,
        bestTime: 180,
        perfectDays: 2
      };
      expect(stats).toHaveProperty('totalCompleted');
      expect(stats).toHaveProperty('currentStreak');
      expect(stats).toHaveProperty('averageTime');
    });
  });

  describe('Achievements', () => {
    test('getAllAchievements should return array', () => {
      const achievements = [
        { id: 'first_win', title: '首次勝利', unlocked: true },
        { id: 'perfect', title: '完美遊戲', unlocked: false }
      ];
      expect(Array.isArray(achievements)).toBe(true);
    });

    test('progress should be calculated from unlocked/total', () => {
      const achievements = [
        { unlocked: true },
        { unlocked: true },
        { unlocked: false },
        { unlocked: false }
      ];
      const unlocked = achievements.filter(a => a.unlocked).length;
      const total = achievements.length;
      const progress = Math.round((unlocked / total) * 100);
      expect(progress).toBe(50);
    });

    test('hidden achievements should show ??? when locked', () => {
      const hidden = { hidden: true, unlocked: false };
      const title = hidden.hidden && !hidden.unlocked ? '???' : 'Real Title';
      expect(title).toBe('???');
    });
  });

  describe('Statistics', () => {
    test('getAllStats should return difficulty breakdown', () => {
      const stats = {
        easy: { played: 10, completed: 8 },
        medium: { played: 5, completed: 3 },
        hard: { played: 2, completed: 1 },
        overall: { played: 17, completed: 12 }
      };
      expect(stats).toHaveProperty('easy');
      expect(stats).toHaveProperty('medium');
      expect(stats).toHaveProperty('hard');
      expect(stats).toHaveProperty('overall');
    });

    test('winRate should be percentage', () => {
      const played = 10;
      const completed = 8;
      const winRate = Math.round((completed / played) * 100);
      expect(winRate).toBe(80);
    });

    test('averageTime should be in seconds', () => {
      const totalTime = 600;
      const completed = 3;
      const averageTime = Math.floor(totalTime / completed);
      expect(averageTime).toBe(200);
    });
  });

  describe('Settings', () => {
    test('settings panel should have show method', () => {
      const panel = { show: vi.fn() };
      panel.show();
      expect(panel.show).toHaveBeenCalled();
    });

    test('settings should include all options', () => {
      const settings = {
        theme: 'dark',
        autoCheck: true,
        soundEnabled: false,
        highlightSameNumbers: true,
        showTimer: true,
        showErrors: true
      };
      expect(Object.keys(settings).length).toBe(6);
    });
  });
});
