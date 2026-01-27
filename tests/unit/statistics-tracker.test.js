/**
 * Unit tests for StatisticsTracker
 * Tests game statistics tracking, aggregation, and persistence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StatisticsTracker } from '../../src/features/statistics-tracker.js';

describe('StatisticsTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new StatisticsTracker();
  });

  describe('Initialization', () => {
    it('should initialize with zero statistics for all difficulties', () => {
      const easy = tracker.getStats('easy');
      const medium = tracker.getStats('medium');
      const hard = tracker.getStats('hard');

      expect(easy.played).toBe(0);
      expect(easy.completed).toBe(0);
      expect(easy.totalTime).toBe(0);
      expect(easy.bestTime).toBeNull();
      expect(easy.averageTime).toBe(0);
      expect(easy.winRate).toBe(0);

      expect(medium.played).toBe(0);
      expect(hard.played).toBe(0);
    });

    it('should have stats for easy, medium, and hard difficulties', () => {
      expect(tracker.stats.easy).toBeDefined();
      expect(tracker.stats.medium).toBeDefined();
      expect(tracker.stats.hard).toBeDefined();
    });
  });

  describe('recordGameStart', () => {
    it('should increment played count for specified difficulty', () => {
      tracker.recordGameStart('easy');
      expect(tracker.getStats('easy').played).toBe(1);
      expect(tracker.getStats('medium').played).toBe(0);
    });

    it('should handle multiple game starts', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameStart('easy');
      tracker.recordGameStart('medium');
      
      expect(tracker.getStats('easy').played).toBe(2);
      expect(tracker.getStats('medium').played).toBe(1);
    });

    it('should throw error for invalid difficulty', () => {
      expect(() => tracker.recordGameStart('invalid')).toThrow('Invalid difficulty');
    });
  });

  describe('recordGameComplete', () => {
    it('should increment completed count and update time', () => {
      tracker.recordGameComplete('easy', 300);
      
      const stats = tracker.getStats('easy');
      expect(stats.completed).toBe(1);
      expect(stats.totalTime).toBe(300);
      expect(stats.bestTime).toBe(300);
    });

    it('should update best time when new time is faster', () => {
      tracker.recordGameComplete('easy', 500);
      tracker.recordGameComplete('easy', 300);
      tracker.recordGameComplete('easy', 400);
      
      const stats = tracker.getStats('easy');
      expect(stats.bestTime).toBe(300);
      expect(stats.completed).toBe(3);
    });

    it('should not update best time when new time is slower', () => {
      tracker.recordGameComplete('medium', 200);
      tracker.recordGameComplete('medium', 300);
      
      expect(tracker.getStats('medium').bestTime).toBe(200);
    });

    it('should accumulate total time correctly', () => {
      tracker.recordGameComplete('hard', 100);
      tracker.recordGameComplete('hard', 200);
      tracker.recordGameComplete('hard', 300);
      
      expect(tracker.getStats('hard').totalTime).toBe(600);
    });

    it('should throw error for invalid difficulty', () => {
      expect(() => tracker.recordGameComplete('invalid', 100)).toThrow('Invalid difficulty');
    });

    it('should throw error for negative time', () => {
      expect(() => tracker.recordGameComplete('easy', -10)).toThrow('Invalid time');
    });

    it('should throw error for non-numeric time', () => {
      expect(() => tracker.recordGameComplete('easy', 'not a number')).toThrow('Invalid time');
    });

    it('should accept optional errors and hintsUsed parameters', () => {
      expect(() => tracker.recordGameComplete('easy', 100, 5, 3)).not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should calculate average time correctly', () => {
      tracker.recordGameComplete('easy', 300);
      tracker.recordGameComplete('easy', 500);
      tracker.recordGameComplete('easy', 400);
      
      const stats = tracker.getStats('easy');
      expect(stats.averageTime).toBe(400); // (300 + 500 + 400) / 3 = 400
    });

    it('should return 0 average time when no games completed', () => {
      expect(tracker.getStats('easy').averageTime).toBe(0);
    });

    it('should calculate win rate correctly', () => {
      tracker.recordGameStart('medium');
      tracker.recordGameStart('medium');
      tracker.recordGameStart('medium');
      tracker.recordGameStart('medium');
      tracker.recordGameComplete('medium', 100);
      tracker.recordGameComplete('medium', 200);
      
      const stats = tracker.getStats('medium');
      expect(stats.winRate).toBe(50); // 2 completed / 4 played = 50%
    });

    it('should return 0 win rate when no games played', () => {
      expect(tracker.getStats('easy').winRate).toBe(0);
    });

    it('should return null for bestTime when no games completed', () => {
      expect(tracker.getStats('easy').bestTime).toBeNull();
    });

    it('should throw error for invalid difficulty', () => {
      expect(() => tracker.getStats('invalid')).toThrow('Invalid difficulty');
    });

    it('should floor average time to integer', () => {
      tracker.recordGameComplete('easy', 100);
      tracker.recordGameComplete('easy', 101);
      
      const stats = tracker.getStats('easy');
      expect(stats.averageTime).toBe(100); // Floor of 100.5
    });

    it('should round win rate to 2 decimal places', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameStart('easy');
      tracker.recordGameStart('easy');
      tracker.recordGameComplete('easy', 100);
      
      const stats = tracker.getStats('easy');
      expect(stats.winRate).toBe(33.33); // 1/3 = 33.333... rounded to 33.33
    });
  });

  describe('getAllStats', () => {
    it('should return stats for all difficulties', () => {
      const allStats = tracker.getAllStats();
      
      expect(allStats.easy).toBeDefined();
      expect(allStats.medium).toBeDefined();
      expect(allStats.hard).toBeDefined();
      expect(allStats.overall).toBeDefined();
    });

    it('should calculate overall statistics correctly', () => {
      // Easy: 2 played, 1 completed, 300s
      tracker.recordGameStart('easy');
      tracker.recordGameStart('easy');
      tracker.recordGameComplete('easy', 300);
      
      // Medium: 3 played, 2 completed, 500s
      tracker.recordGameStart('medium');
      tracker.recordGameStart('medium');
      tracker.recordGameStart('medium');
      tracker.recordGameComplete('medium', 200);
      tracker.recordGameComplete('medium', 300);
      
      // Hard: 1 played, 1 completed, 400s
      tracker.recordGameStart('hard');
      tracker.recordGameComplete('hard', 400);
      
      const allStats = tracker.getAllStats();
      
      expect(allStats.overall.played).toBe(6);
      expect(allStats.overall.completed).toBe(4);
      expect(allStats.overall.totalTime).toBe(1200);
      expect(allStats.overall.averageTime).toBe(300); // 1200 / 4
      expect(allStats.overall.winRate).toBe(66.67); // 4/6 = 66.666... rounded
    });

    it('should return zero overall stats when no games played', () => {
      const allStats = tracker.getAllStats();
      
      expect(allStats.overall.played).toBe(0);
      expect(allStats.overall.completed).toBe(0);
      expect(allStats.overall.averageTime).toBe(0);
      expect(allStats.overall.winRate).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all statistics to initial state', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameComplete('easy', 100);
      tracker.recordGameStart('medium');
      tracker.recordGameComplete('medium', 200);
      
      tracker.reset();
      
      const easy = tracker.getStats('easy');
      const medium = tracker.getStats('medium');
      
      expect(easy.played).toBe(0);
      expect(easy.completed).toBe(0);
      expect(easy.totalTime).toBe(0);
      expect(easy.bestTime).toBeNull();
      expect(medium.played).toBe(0);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameComplete('easy', 300);
      tracker.recordGameComplete('medium', 500);
      
      const json = tracker.toJSON();
      
      expect(json.easy.played).toBe(1);
      expect(json.easy.completed).toBe(1);
      expect(json.easy.totalTime).toBe(300);
      expect(json.easy.bestTime).toBe(300);
      expect(json.medium.bestTime).toBe(500);
    });

    it('should convert Infinity to null in JSON', () => {
      const json = tracker.toJSON();
      
      expect(json.easy.bestTime).toBeNull();
      expect(json.medium.bestTime).toBeNull();
      expect(json.hard.bestTime).toBeNull();
    });

    it('should restore from JSON correctly', () => {
      const json = {
        easy: { played: 5, completed: 3, totalTime: 900, bestTime: 250 },
        medium: { played: 2, completed: 1, totalTime: 400, bestTime: 400 },
        hard: { played: 0, completed: 0, totalTime: 0, bestTime: null }
      };
      
      const restored = StatisticsTracker.fromJSON(json);
      
      expect(restored.getStats('easy').played).toBe(5);
      expect(restored.getStats('easy').completed).toBe(3);
      expect(restored.getStats('easy').bestTime).toBe(250);
      expect(restored.getStats('medium').bestTime).toBe(400);
      expect(restored.getStats('hard').bestTime).toBeNull();
    });

    it('should handle null or invalid JSON gracefully', () => {
      const restored1 = StatisticsTracker.fromJSON(null);
      const restored2 = StatisticsTracker.fromJSON({});
      const restored3 = StatisticsTracker.fromJSON('invalid');
      
      expect(restored1.getStats('easy').played).toBe(0);
      expect(restored2.getStats('easy').played).toBe(0);
      expect(restored3.getStats('easy').played).toBe(0);
    });

    it('should validate and sanitize restored data', () => {
      const json = {
        easy: { played: -5, completed: 'invalid', totalTime: -100, bestTime: -50 },
        medium: { played: 10, completed: 5, totalTime: 1000, bestTime: 200 }
      };
      
      const restored = StatisticsTracker.fromJSON(json);
      
      // Invalid values should be replaced with defaults
      expect(restored.getStats('easy').played).toBe(0);
      expect(restored.getStats('easy').completed).toBe(0);
      expect(restored.getStats('easy').totalTime).toBe(0);
      expect(restored.getStats('easy').bestTime).toBeNull();
      
      // Valid values should be preserved
      expect(restored.getStats('medium').played).toBe(10);
      expect(restored.getStats('medium').completed).toBe(5);
    });

    it('should handle partial JSON data', () => {
      const json = {
        easy: { played: 5, completed: 3 }
        // Missing totalTime and bestTime
      };
      
      const restored = StatisticsTracker.fromJSON(json);
      
      expect(restored.getStats('easy').played).toBe(5);
      expect(restored.getStats('easy').completed).toBe(3);
      expect(restored.getStats('easy').totalTime).toBe(0);
      expect(restored.getStats('easy').bestTime).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero completion time', () => {
      tracker.recordGameComplete('easy', 0);
      
      const stats = tracker.getStats('easy');
      expect(stats.bestTime).toBe(0);
      expect(stats.totalTime).toBe(0);
    });

    it('should handle very large time values', () => {
      const largeTime = 999999;
      tracker.recordGameComplete('easy', largeTime);
      
      expect(tracker.getStats('easy').bestTime).toBe(largeTime);
    });

    it('should maintain separate statistics per difficulty', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameComplete('easy', 100);
      
      tracker.recordGameStart('medium');
      tracker.recordGameComplete('medium', 200);
      
      tracker.recordGameStart('hard');
      tracker.recordGameComplete('hard', 300);
      
      expect(tracker.getStats('easy').bestTime).toBe(100);
      expect(tracker.getStats('medium').bestTime).toBe(200);
      expect(tracker.getStats('hard').bestTime).toBe(300);
    });

    it('should handle 100% win rate', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameComplete('easy', 100);
      
      expect(tracker.getStats('easy').winRate).toBe(100);
    });

    it('should handle 0% win rate', () => {
      tracker.recordGameStart('easy');
      tracker.recordGameStart('easy');
      tracker.recordGameStart('easy');
      
      expect(tracker.getStats('easy').winRate).toBe(0);
    });
  });
});
