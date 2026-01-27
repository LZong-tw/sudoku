/**
 * @fileoverview Unit tests for DataValidator
 * @module tests/unit/data-validator
 */

import { describe, it, expect } from 'vitest';
import { DataValidator } from '../../src/storage/data-validator.js';

describe('DataValidator', () => {
  describe('validateGameState', () => {
    it('should return null for null or undefined data', () => {
      expect(DataValidator.validateGameState(null)).toBeNull();
      expect(DataValidator.validateGameState(undefined)).toBeNull();
    });

    it('should return null for non-object data', () => {
      expect(DataValidator.validateGameState('string')).toBeNull();
      expect(DataValidator.validateGameState(123)).toBeNull();
      expect(DataValidator.validateGameState(true)).toBeNull();
    });

    it('should return null if current is not a 9x9 array', () => {
      expect(DataValidator.validateGameState({ current: [] })).toBeNull();
      expect(DataValidator.validateGameState({ current: [[1, 2, 3]] })).toBeNull();
      expect(DataValidator.validateGameState({ 
        current: Array(9).fill([1, 2, 3]) 
      })).toBeNull();
    });

    it('should return null if puzzle is not a 9x9 array', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      expect(DataValidator.validateGameState({ 
        current: validCurrent,
        puzzle: []
      })).toBeNull();
    });

    it('should return null for invalid errors field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        errors: -1,
        hintsUsed: 0
      })).toBeNull();
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        errors: 1.5,
        hintsUsed: 0
      })).toBeNull();
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        errors: 'invalid',
        hintsUsed: 0
      })).toBeNull();
    });

    it('should return null for invalid hintsUsed field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        errors: 0,
        hintsUsed: -1
      })).toBeNull();
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        errors: 0,
        hintsUsed: 2.5
      })).toBeNull();
    });

    it('should validate valid game state', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      const gameState = {
        current: validCurrent,
        puzzle: validPuzzle,
        errors: 2,
        hintsUsed: 1
      };
      
      expect(DataValidator.validateGameState(gameState)).toEqual(gameState);
    });

    it('should validate game state with optional solution field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      const validSolution = Array(9).fill(null).map(() => Array(9).fill(1));
      
      const gameState = {
        current: validCurrent,
        puzzle: validPuzzle,
        solution: validSolution,
        errors: 0,
        hintsUsed: 0
      };
      
      expect(DataValidator.validateGameState(gameState)).toEqual(gameState);
    });

    it('should return null for invalid solution field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        solution: [[1, 2, 3]],
        errors: 0,
        hintsUsed: 0
      })).toBeNull();
    });

    it('should validate game state with optional notes field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      const validNotes = Array(9).fill(null).map(() => Array(9).fill([]));
      
      const gameState = {
        current: validCurrent,
        puzzle: validPuzzle,
        notes: validNotes,
        errors: 0,
        hintsUsed: 0
      };
      
      expect(DataValidator.validateGameState(gameState)).toEqual(gameState);
    });

    it('should validate game state with optional difficulty field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      const gameState = {
        current: validCurrent,
        puzzle: validPuzzle,
        difficulty: 'easy',
        errors: 0,
        hintsUsed: 0
      };
      
      expect(DataValidator.validateGameState(gameState)).toEqual(gameState);
    });

    it('should return null for invalid difficulty field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      expect(DataValidator.validateGameState({
        current: validCurrent,
        puzzle: validPuzzle,
        difficulty: 'invalid',
        errors: 0,
        hintsUsed: 0
      })).toBeNull();
    });

    it('should validate game state with optional mode field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      const gameState = {
        current: validCurrent,
        puzzle: validPuzzle,
        mode: 'daily_challenge',
        errors: 0,
        hintsUsed: 0
      };
      
      expect(DataValidator.validateGameState(gameState)).toEqual(gameState);
    });

    it('should validate game state with optional timer field', () => {
      const validCurrent = Array(9).fill(null).map(() => Array(9).fill(0));
      const validPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      
      const gameState = {
        current: validCurrent,
        puzzle: validPuzzle,
        timer: { elapsedTime: 120 },
        errors: 0,
        hintsUsed: 0
      };
      
      expect(DataValidator.validateGameState(gameState)).toEqual(gameState);
    });
  });

  describe('validateSettings', () => {
    it('should return defaults for null or undefined data', () => {
      const defaults = {
        theme: 'light',
        autoCheck: true,
        soundEnabled: false,
        highlightSameNumbers: true,
        showTimer: true,
        showErrors: true
      };
      
      expect(DataValidator.validateSettings(null)).toEqual(defaults);
      expect(DataValidator.validateSettings(undefined)).toEqual(defaults);
    });

    it('should return defaults for non-object data', () => {
      const defaults = {
        theme: 'light',
        autoCheck: true,
        soundEnabled: false,
        highlightSameNumbers: true,
        showTimer: true,
        showErrors: true
      };
      
      expect(DataValidator.validateSettings('string')).toEqual(defaults);
      expect(DataValidator.validateSettings(123)).toEqual(defaults);
    });

    it('should validate valid settings', () => {
      const settings = {
        theme: 'dark',
        autoCheck: false,
        soundEnabled: true,
        highlightSameNumbers: false,
        showTimer: false,
        showErrors: false
      };
      
      expect(DataValidator.validateSettings(settings)).toEqual(settings);
    });

    it('should use defaults for invalid theme', () => {
      const result = DataValidator.validateSettings({ theme: 'invalid' });
      expect(result.theme).toBe('light');
    });

    it('should use defaults for invalid boolean fields', () => {
      const result = DataValidator.validateSettings({
        autoCheck: 'true',
        soundEnabled: 1,
        highlightSameNumbers: null
      });
      
      expect(result.autoCheck).toBe(true);
      expect(result.soundEnabled).toBe(false);
      expect(result.highlightSameNumbers).toBe(true);
    });

    it('should merge partial settings with defaults', () => {
      const result = DataValidator.validateSettings({
        theme: 'dark',
        autoCheck: false
      });
      
      expect(result.theme).toBe('dark');
      expect(result.autoCheck).toBe(false);
      expect(result.soundEnabled).toBe(false); // default
      expect(result.highlightSameNumbers).toBe(true); // default
    });
  });

  describe('validateStatistics', () => {
    it('should return defaults for null or undefined data', () => {
      const defaults = {
        easy: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
        medium: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity },
        hard: { played: 0, completed: 0, totalTime: 0, bestTime: Infinity }
      };
      
      expect(DataValidator.validateStatistics(null)).toEqual(defaults);
      expect(DataValidator.validateStatistics(undefined)).toEqual(defaults);
    });

    it('should validate valid statistics', () => {
      const stats = {
        easy: { played: 5, completed: 4, totalTime: 1200, bestTime: 180 },
        medium: { played: 3, completed: 2, totalTime: 900, bestTime: 300 },
        hard: { played: 1, completed: 0, totalTime: 0, bestTime: Infinity }
      };
      
      expect(DataValidator.validateStatistics(stats)).toEqual(stats);
    });

    it('should use defaults for missing difficulty levels', () => {
      const stats = {
        easy: { played: 5, completed: 4, totalTime: 1200, bestTime: 180 }
      };
      
      const result = DataValidator.validateStatistics(stats);
      
      expect(result.easy).toEqual(stats.easy);
      expect(result.medium).toEqual({ played: 0, completed: 0, totalTime: 0, bestTime: Infinity });
      expect(result.hard).toEqual({ played: 0, completed: 0, totalTime: 0, bestTime: Infinity });
    });

    it('should sanitize invalid numeric fields', () => {
      const stats = {
        easy: { played: -1, completed: 'invalid', totalTime: -100, bestTime: -50 },
        medium: { played: 1.5, completed: 2.5, totalTime: NaN, bestTime: 0 },
        hard: { played: null, completed: undefined, totalTime: 'string', bestTime: null }
      };
      
      const result = DataValidator.validateStatistics(stats);
      
      expect(result.easy.played).toBe(0);
      expect(result.easy.completed).toBe(0);
      expect(result.easy.totalTime).toBe(0);
      expect(result.easy.bestTime).toBe(Infinity);
      
      expect(result.medium.played).toBe(0);
      expect(result.medium.completed).toBe(0);
      expect(result.medium.totalTime).toBe(0);
      expect(result.medium.bestTime).toBe(Infinity);
    });

    it('should ensure completed <= played', () => {
      const stats = {
        easy: { played: 3, completed: 5, totalTime: 1000, bestTime: 200 },
        medium: { played: 2, completed: 10, totalTime: 500, bestTime: 150 },
        hard: { played: 1, completed: 1, totalTime: 300, bestTime: 300 }
      };
      
      const result = DataValidator.validateStatistics(stats);
      
      expect(result.easy.completed).toBe(3); // capped to played
      expect(result.medium.completed).toBe(2); // capped to played
      expect(result.hard.completed).toBe(1); // valid
    });
  });

  describe('validateAchievements', () => {
    it('should return defaults for null or undefined data', () => {
      const defaults = {
        unlockedAchievements: [],
        progress: {}
      };
      
      expect(DataValidator.validateAchievements(null)).toEqual(defaults);
      expect(DataValidator.validateAchievements(undefined)).toEqual(defaults);
    });

    it('should validate valid achievement data', () => {
      const achievements = {
        unlockedAchievements: ['first_win', 'perfect_game'],
        progress: { speed_demon: 0.5, master: 0.75 }
      };
      
      expect(DataValidator.validateAchievements(achievements)).toEqual(achievements);
    });

    it('should filter non-string items from unlockedAchievements', () => {
      const achievements = {
        unlockedAchievements: ['first_win', 123, null, 'perfect_game', undefined],
        progress: {}
      };
      
      const result = DataValidator.validateAchievements(achievements);
      expect(result.unlockedAchievements).toEqual(['first_win', 'perfect_game']);
    });

    it('should filter invalid progress values', () => {
      const achievements = {
        unlockedAchievements: [],
        progress: {
          valid1: 0.5,
          invalid1: -0.1,
          invalid2: 1.5,
          invalid3: 'string',
          valid2: 0,
          valid3: 1
        }
      };
      
      const result = DataValidator.validateAchievements(achievements);
      expect(result.progress).toEqual({
        valid1: 0.5,
        valid2: 0,
        valid3: 1
      });
    });

    it('should handle non-array unlockedAchievements', () => {
      const result = DataValidator.validateAchievements({
        unlockedAchievements: 'not an array',
        progress: {}
      });
      
      expect(result.unlockedAchievements).toEqual([]);
    });

    it('should handle non-object progress', () => {
      const result = DataValidator.validateAchievements({
        unlockedAchievements: [],
        progress: 'not an object'
      });
      
      expect(result.progress).toEqual({});
    });
  });

  describe('validateDailyChallenge', () => {
    it('should return defaults for null or undefined data', () => {
      const defaults = {
        completedChallenges: {}
      };
      
      expect(DataValidator.validateDailyChallenge(null)).toEqual(defaults);
      expect(DataValidator.validateDailyChallenge(undefined)).toEqual(defaults);
    });

    it('should validate valid daily challenge data', () => {
      const dailyData = {
        completedChallenges: {
          '2024-01-15': { time: 300, hintsUsed: 1 },
          '2024-01-16': { time: 250, hintsUsed: 0 }
        }
      };
      
      expect(DataValidator.validateDailyChallenge(dailyData)).toEqual(dailyData);
    });

    it('should filter invalid date formats', () => {
      const dailyData = {
        completedChallenges: {
          '2024-01-15': { time: 300, hintsUsed: 1 },
          'invalid-date': { time: 250, hintsUsed: 0 },
          '2024/01/16': { time: 200, hintsUsed: 2 },
          '2024-1-5': { time: 180, hintsUsed: 1 }
        }
      };
      
      const result = DataValidator.validateDailyChallenge(dailyData);
      expect(result.completedChallenges).toEqual({
        '2024-01-15': { time: 300, hintsUsed: 1 }
      });
    });

    it('should filter invalid result objects', () => {
      const dailyData = {
        completedChallenges: {
          '2024-01-15': { time: 300, hintsUsed: 1 },
          '2024-01-16': { time: -100, hintsUsed: 0 },
          '2024-01-17': { time: 250, hintsUsed: -1 },
          '2024-01-18': { time: 'invalid', hintsUsed: 1 },
          '2024-01-19': { time: 200, hintsUsed: 1.5 }
        }
      };
      
      const result = DataValidator.validateDailyChallenge(dailyData);
      expect(result.completedChallenges).toEqual({
        '2024-01-15': { time: 300, hintsUsed: 1 }
      });
    });

    it('should handle non-object completedChallenges', () => {
      const result = DataValidator.validateDailyChallenge({
        completedChallenges: 'not an object'
      });
      
      expect(result.completedChallenges).toEqual({});
    });
  });
});
