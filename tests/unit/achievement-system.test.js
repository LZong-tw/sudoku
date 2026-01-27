/**
 * Unit tests for AchievementSystem
 * Tests achievement tracking, unlocking, and progress calculation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AchievementSystem } from '../../src/features/achievement-system.js';

describe('AchievementSystem', () => {
  let achievementSystem;

  beforeEach(() => {
    achievementSystem = new AchievementSystem();
  });

  describe('Initialization', () => {
    it('should initialize with at least 10 achievements', () => {
      expect(achievementSystem.achievements.size).toBeGreaterThanOrEqual(10);
    });

    it('should initialize with no unlocked achievements', () => {
      expect(achievementSystem.unlockedAchievements.size).toBe(0);
    });

    it('should initialize progress data with default values', () => {
      expect(achievementSystem.progressData.gamesCompleted).toBe(0);
      expect(achievementSystem.progressData.gamesPlayed).toBe(0);
      expect(achievementSystem.progressData.perfectGames).toBe(0);
      expect(achievementSystem.progressData.currentStreak).toBe(0);
    });

    it('should accept optional storage manager and event bus', () => {
      const mockStorage = { load: vi.fn(), save: vi.fn() };
      const mockEventBus = { emit: vi.fn() };
      
      const system = new AchievementSystem(mockStorage, mockEventBus);
      
      expect(system.storage).toBe(mockStorage);
      expect(system.eventBus).toBe(mockEventBus);
    });
  });

  describe('Achievement Definitions', () => {
    it('should have first_win achievement', () => {
      const achievement = achievementSystem.achievements.get('first_win');
      
      expect(achievement).toBeDefined();
      expect(achievement.title).toBeDefined();
      expect(achievement.description).toBeDefined();
      expect(achievement.icon).toBeDefined();
      expect(achievement.condition).toBeInstanceOf(Function);
    });

    it('should have perfect_game achievement', () => {
      const achievement = achievementSystem.achievements.get('perfect_game');
      expect(achievement).toBeDefined();
    });

    it('should have speed_demon achievement', () => {
      const achievement = achievementSystem.achievements.get('speed_demon');
      expect(achievement).toBeDefined();
    });

    it('should have master_solver achievement', () => {
      const achievement = achievementSystem.achievements.get('master_solver');
      expect(achievement).toBeDefined();
    });

    it('should have hidden achievements', () => {
      const hiddenAchievements = Array.from(achievementSystem.achievements.values())
        .filter(a => a.hidden);
      
      expect(hiddenAchievements.length).toBeGreaterThan(0);
    });

    it('should have all achievements with required properties', () => {
      for (const achievement of achievementSystem.achievements.values()) {
        expect(achievement.id).toBeDefined();
        expect(achievement.title).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(achievement.unlocked).toBe(false);
        expect(achievement.unlockedAt).toBeNull();
        expect(achievement.progress).toBe(0);
        expect(achievement.condition).toBeInstanceOf(Function);
      }
    });
  });

  describe('checkAchievements', () => {
    it('should unlock first_win achievement on first completion', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.length).toBeGreaterThan(0);
      expect(unlocked.some(a => a.id === 'first_win')).toBe(true);
      expect(achievementSystem.unlockedAchievements.has('first_win')).toBe(true);
    });

    it('should unlock perfect_game achievement when no errors or hints', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'perfect_game')).toBe(true);
    });

    it('should not unlock perfect_game when errors exist', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 1,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'perfect_game')).toBe(false);
    });

    it('should unlock speed_demon for medium game under 5 minutes', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'medium',
        time: 299 // Just under 5 minutes
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'speed_demon')).toBe(true);
    });

    it('should not unlock speed_demon for medium game over 5 minutes', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'medium',
        time: 301
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'speed_demon')).toBe(false);
    });

    it('should unlock lightning_fast for easy game under 3 minutes', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 179
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'lightning_fast')).toBe(true);
    });

    it('should not unlock already unlocked achievements', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      // First check
      const unlocked1 = achievementSystem.checkAchievements(gameData);
      expect(unlocked1.length).toBeGreaterThan(0);
      
      // Second check with same data
      const unlocked2 = achievementSystem.checkAchievements(gameData);
      expect(unlocked2.length).toBe(0);
    });

    it('should update progress data on each check', () => {
      const gameData = {
        gamesCompleted: 5,
        gamesPlayed: 10,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300,
        currentStreak: 3
      };
      
      achievementSystem.checkAchievements(gameData);
      
      expect(achievementSystem.progressData.gamesCompleted).toBe(5);
      expect(achievementSystem.progressData.gamesPlayed).toBe(10);
      expect(achievementSystem.progressData.currentStreak).toBe(3);
    });

    it('should handle errors in achievement conditions gracefully', () => {
      // Add a broken achievement
      achievementSystem.achievements.set('broken', {
        id: 'broken',
        title: 'Broken',
        description: 'Test',
        icon: '💥',
        unlocked: false,
        unlockedAt: null,
        progress: 0,
        condition: () => { throw new Error('Test error'); }
      });
      
      const gameData = { gamesCompleted: 1, gamesPlayed: 1 };
      
      expect(() => achievementSystem.checkAchievements(gameData)).not.toThrow();
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock achievement and set properties', () => {
      const result = achievementSystem.unlockAchievement('first_win');
      
      expect(result).toBe(true);
      expect(achievementSystem.unlockedAchievements.has('first_win')).toBe(true);
      
      const achievement = achievementSystem.achievements.get('first_win');
      expect(achievement.unlocked).toBe(true);
      expect(achievement.unlockedAt).toBeInstanceOf(Date);
      expect(achievement.progress).toBe(100);
    });

    it('should emit event when achievement unlocked', () => {
      const mockEventBus = { emit: vi.fn() };
      const system = new AchievementSystem(null, mockEventBus);
      
      system.unlockAchievement('first_win');
      
      expect(mockEventBus.emit).toHaveBeenCalledWith('achievement_unlocked', {
        achievement: expect.objectContaining({ id: 'first_win' })
      });
    });

    it('should return false when unlocking already unlocked achievement', () => {
      achievementSystem.unlockAchievement('first_win');
      const result = achievementSystem.unlockAchievement('first_win');
      
      expect(result).toBe(false);
    });

    it('should return false for non-existent achievement', () => {
      const result = achievementSystem.unlockAchievement('non_existent');
      expect(result).toBe(false);
    });

    it('should not emit event when achievement already unlocked', () => {
      const mockEventBus = { emit: vi.fn() };
      const system = new AchievementSystem(null, mockEventBus);
      
      system.unlockAchievement('first_win');
      mockEventBus.emit.mockClear();
      
      system.unlockAchievement('first_win');
      
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('getAllAchievements', () => {
    it('should return all achievements', () => {
      const achievements = achievementSystem.getAllAchievements();
      
      expect(achievements.length).toBe(achievementSystem.achievements.size);
    });

    it('should hide details of locked hidden achievements', () => {
      const achievements = achievementSystem.getAllAchievements();
      const hiddenLocked = achievements.find(a => {
        const original = achievementSystem.achievements.get(a.id);
        return original.hidden && !a.unlocked;
      });
      
      if (hiddenLocked) {
        expect(hiddenLocked.title).toBe('???');
        expect(hiddenLocked.description).toBe('隱藏成就');
        expect(hiddenLocked.icon).toBe('🔒');
      }
    });

    it('should show details of unlocked hidden achievements', () => {
      // Find a hidden achievement
      const hiddenAchievement = Array.from(achievementSystem.achievements.values())
        .find(a => a.hidden);
      
      if (hiddenAchievement) {
        achievementSystem.unlockAchievement(hiddenAchievement.id);
        
        const achievements = achievementSystem.getAllAchievements();
        const unlockedHidden = achievements.find(a => a.id === hiddenAchievement.id);
        
        expect(unlockedHidden.title).not.toBe('???');
        expect(unlockedHidden.description).not.toBe('隱藏成就');
      }
    });

    it('should return copies of achievements, not references', () => {
      const achievements = achievementSystem.getAllAchievements();
      achievements[0].unlocked = true;
      
      // Original should not be modified
      const original = Array.from(achievementSystem.achievements.values())[0];
      expect(original.unlocked).toBe(false);
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should return empty array when no achievements unlocked', () => {
      const unlocked = achievementSystem.getUnlockedAchievements();
      expect(unlocked).toEqual([]);
    });

    it('should return only unlocked achievements', () => {
      achievementSystem.unlockAchievement('first_win');
      achievementSystem.unlockAchievement('perfect_game');
      
      const unlocked = achievementSystem.getUnlockedAchievements();
      
      expect(unlocked.length).toBe(2);
      expect(unlocked.every(a => a.unlocked)).toBe(true);
    });
  });

  describe('getProgress', () => {
    it('should return progress for specific achievement', () => {
      const progress = achievementSystem.getProgress('first_win');
      expect(progress).toBe(0);
    });

    it('should return 100 for unlocked achievement', () => {
      achievementSystem.unlockAchievement('first_win');
      const progress = achievementSystem.getProgress('first_win');
      expect(progress).toBe(100);
    });

    it('should return -1 for non-existent achievement', () => {
      const progress = achievementSystem.getProgress('non_existent');
      expect(progress).toBe(-1);
    });
  });

  describe('getOverallProgress', () => {
    it('should return 0 when no achievements unlocked', () => {
      expect(achievementSystem.getOverallProgress()).toBe(0);
    });

    it('should calculate overall progress percentage', () => {
      const total = achievementSystem.achievements.size;
      
      achievementSystem.unlockAchievement('first_win');
      achievementSystem.unlockAchievement('perfect_game');
      
      const expected = Math.round((2 / total) * 100);
      expect(achievementSystem.getOverallProgress()).toBe(expected);
    });

    it('should return 100 when all achievements unlocked', () => {
      for (const id of achievementSystem.achievements.keys()) {
        achievementSystem.unlockAchievement(id);
      }
      
      expect(achievementSystem.getOverallProgress()).toBe(100);
    });
  });

  describe('Progress Tracking', () => {
    it('should track perfect games count', () => {
      const gameData1 = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      achievementSystem.checkAchievements(gameData1);
      expect(achievementSystem.progressData.perfectGames).toBe(1);
      
      const gameData2 = {
        gamesCompleted: 2,
        gamesPlayed: 2,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'medium',
        time: 400
      };
      
      achievementSystem.checkAchievements(gameData2);
      expect(achievementSystem.progressData.perfectGames).toBe(2);
    });

    it('should not increment perfect games when errors exist', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 1,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      achievementSystem.checkAchievements(gameData);
      expect(achievementSystem.progressData.perfectGames).toBe(0);
    });

    it('should track fastest times per difficulty', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 250
      };
      
      achievementSystem.checkAchievements(gameData);
      expect(achievementSystem.progressData.fastestEasy).toBe(250);
    });

    it('should update fastest time only when faster', () => {
      achievementSystem.checkAchievements({
        gamesCompleted: 1,
        gamesPlayed: 1,
        difficulty: 'medium',
        time: 400
      });
      
      achievementSystem.checkAchievements({
        gamesCompleted: 2,
        gamesPlayed: 2,
        difficulty: 'medium',
        time: 500
      });
      
      expect(achievementSystem.progressData.fastestMedium).toBe(400);
    });

    it('should accumulate total play time', () => {
      achievementSystem.checkAchievements({
        gamesCompleted: 1,
        gamesPlayed: 1,
        time: 300
      });
      
      achievementSystem.checkAchievements({
        gamesCompleted: 2,
        gamesPlayed: 2,
        time: 400
      });
      
      expect(achievementSystem.progressData.totalPlayTime).toBe(700);
    });

    it('should track no-hint streak', () => {
      achievementSystem.checkAchievements({
        gamesCompleted: 1,
        gamesPlayed: 1,
        hintsUsed: 0
      });
      
      expect(achievementSystem.progressData.noHintStreak).toBe(1);
      
      achievementSystem.checkAchievements({
        gamesCompleted: 2,
        gamesPlayed: 2,
        hintsUsed: 0
      });
      
      expect(achievementSystem.progressData.noHintStreak).toBe(2);
    });

    it('should reset no-hint streak when hints used', () => {
      achievementSystem.checkAchievements({
        gamesCompleted: 1,
        gamesPlayed: 1,
        hintsUsed: 0
      });
      
      achievementSystem.checkAchievements({
        gamesCompleted: 2,
        gamesPlayed: 2,
        hintsUsed: 1
      });
      
      expect(achievementSystem.progressData.noHintStreak).toBe(0);
    });
  });

  describe('Progressive Achievement Progress', () => {
    it('should update master_solver progress', () => {
      const gameData = {
        gamesCompleted: 25,
        gamesPlayed: 30
      };
      
      achievementSystem.checkAchievements(gameData);
      
      const achievement = achievementSystem.achievements.get('master_solver');
      expect(achievement.progress).toBe(50); // 25/50 = 50%
    });

    it('should cap progress at 100%', () => {
      const gameData = {
        gamesCompleted: 100,
        gamesPlayed: 100
      };
      
      achievementSystem.checkAchievements(gameData);
      
      const achievement = achievementSystem.achievements.get('master_solver');
      expect(achievement.progress).toBe(100);
    });

    it('should update win_streak progress', () => {
      const gameData = {
        gamesCompleted: 3,
        gamesPlayed: 3,
        currentStreak: 3
      };
      
      achievementSystem.checkAchievements(gameData);
      
      const achievement = achievementSystem.achievements.get('win_streak');
      expect(achievement.progress).toBe(60); // 3/5 = 60%
    });
  });

  describe('reset', () => {
    it('should clear all unlocked achievements', () => {
      achievementSystem.unlockAchievement('first_win');
      achievementSystem.unlockAchievement('perfect_game');
      
      achievementSystem.reset();
      
      expect(achievementSystem.unlockedAchievements.size).toBe(0);
    });

    it('should reset all progress data', () => {
      achievementSystem.progressData.gamesCompleted = 50;
      achievementSystem.progressData.perfectGames = 10;
      
      achievementSystem.reset();
      
      expect(achievementSystem.progressData.gamesCompleted).toBe(0);
      expect(achievementSystem.progressData.perfectGames).toBe(0);
    });

    it('should reset all achievement states', () => {
      achievementSystem.unlockAchievement('first_win');
      
      achievementSystem.reset();
      
      const achievement = achievementSystem.achievements.get('first_win');
      expect(achievement.unlocked).toBe(false);
      expect(achievement.unlockedAt).toBeNull();
      expect(achievement.progress).toBe(0);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      achievementSystem.unlockAchievement('first_win');
      achievementSystem.progressData.gamesCompleted = 10;
      
      const json = achievementSystem.toJSON();
      
      expect(json.unlockedAchievements).toContain('first_win');
      expect(json.progressData.gamesCompleted).toBe(10);
      expect(json.achievements).toBeInstanceOf(Array);
    });

    it('should restore from JSON correctly', () => {
      const json = {
        unlockedAchievements: ['first_win', 'perfect_game'],
        progressData: {
          gamesCompleted: 20,
          perfectGames: 5
        },
        achievements: [
          {
            id: 'first_win',
            unlocked: true,
            unlockedAt: '2024-01-15T12:00:00.000Z',
            progress: 100
          }
        ]
      };
      
      const restored = AchievementSystem.fromJSON(json);
      
      expect(restored.unlockedAchievements.has('first_win')).toBe(true);
      expect(restored.unlockedAchievements.has('perfect_game')).toBe(true);
      expect(restored.progressData.gamesCompleted).toBe(20);
      expect(restored.progressData.perfectGames).toBe(5);
      
      const achievement = restored.achievements.get('first_win');
      expect(achievement.unlocked).toBe(true);
      expect(achievement.unlockedAt).toBeInstanceOf(Date);
    });

    it('should handle empty JSON', () => {
      const restored = AchievementSystem.fromJSON({});
      expect(restored.unlockedAchievements.size).toBe(0);
    });

    it('should merge progress data with defaults', () => {
      const json = {
        progressData: {
          gamesCompleted: 10
          // Missing other fields
        }
      };
      
      const restored = AchievementSystem.fromJSON(json);
      
      expect(restored.progressData.gamesCompleted).toBe(10);
      expect(restored.progressData.gamesPlayed).toBe(0);
      expect(restored.progressData.perfectGames).toBe(0);
    });
  });

  describe('Storage Integration', () => {
    it('should save to storage when achievements unlocked', () => {
      const mockStorage = {
        save: vi.fn(),
        load: vi.fn(() => null)
      };
      
      const system = new AchievementSystem(mockStorage);
      
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 300
      };
      
      system.checkAchievements(gameData);
      
      expect(mockStorage.save).toHaveBeenCalledWith('achievements', expect.any(Object));
    });

    it('should save to storage when resetting', () => {
      const mockStorage = {
        save: vi.fn(),
        load: vi.fn(() => null)
      };
      
      const system = new AchievementSystem(mockStorage);
      system.reset();
      
      expect(mockStorage.save).toHaveBeenCalled();
    });

    it('should load from storage on initialization', () => {
      const mockStorage = {
        save: vi.fn(),
        load: vi.fn(() => ({
          unlockedAchievements: ['first_win'],
          progressData: { gamesCompleted: 5 },
          achievementStates: [
            {
              id: 'first_win',
              unlocked: true,
              unlockedAt: '2024-01-15T12:00:00.000Z',
              progress: 100
            }
          ]
        }))
      };
      
      const system = new AchievementSystem(mockStorage);
      
      expect(mockStorage.load).toHaveBeenCalledWith('achievements');
      expect(system.unlockedAchievements.has('first_win')).toBe(true);
      expect(system.progressData.gamesCompleted).toBe(5);
    });

    it('should handle missing storage gracefully', () => {
      const system = new AchievementSystem(null);
      
      expect(() => system.checkAchievements({ gamesCompleted: 1 })).not.toThrow();
      expect(() => system.reset()).not.toThrow();
    });
  });

  describe('Complex Achievement Scenarios', () => {
    it('should unlock multiple achievements in single check', () => {
      const gameData = {
        gamesCompleted: 1,
        gamesPlayed: 1,
        errors: 0,
        hintsUsed: 0,
        difficulty: 'easy',
        time: 170, // Under 3 minutes
        currentStreak: 1
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      // Should unlock: first_win, perfect_game, lightning_fast
      expect(unlocked.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle difficulty-specific achievements', () => {
      const gameData = {
        gamesCompleted: 10,
        gamesPlayed: 10,
        difficultyStats: {
          hard: { completed: 10 }
        }
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'hard_champion')).toBe(true);
    });

    it('should track daily challenge achievements', () => {
      const gameData = {
        gamesCompleted: 7,
        gamesPlayed: 7,
        dailyChallengesCompleted: 7
      };
      
      const unlocked = achievementSystem.checkAchievements(gameData);
      
      expect(unlocked.some(a => a.id === 'daily_dedication')).toBe(true);
    });
  });
});
