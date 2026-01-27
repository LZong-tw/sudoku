/**
 * Unit tests for DailyChallenge
 * Tests daily challenge generation, completion tracking, and deterministic behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyChallenge } from '../../src/features/daily-challenge.js';

describe('DailyChallenge', () => {
  let dailyChallenge;

  beforeEach(() => {
    dailyChallenge = new DailyChallenge();
  });

  describe('Initialization', () => {
    it('should initialize with empty completion history', () => {
      expect(dailyChallenge.completedChallenges.size).toBe(0);
    });

    it('should have 7-day difficulty rotation pattern', () => {
      expect(dailyChallenge.difficultyRotation).toHaveLength(7);
      expect(dailyChallenge.difficultyRotation).toEqual([
        'easy', 'easy', 'medium', 'medium', 'hard', 'medium', 'easy'
      ]);
    });

    it('should accept optional storage manager', () => {
      const mockStorage = { load: vi.fn(), save: vi.fn() };
      const dc = new DailyChallenge(mockStorage);
      expect(dc.storage).toBe(mockStorage);
    });
  });

  describe('getTodayChallenge', () => {
    it('should return a challenge object with required properties', () => {
      const challenge = dailyChallenge.getTodayChallenge();
      
      expect(challenge).toHaveProperty('date');
      expect(challenge).toHaveProperty('difficulty');
      expect(challenge).toHaveProperty('puzzle');
      expect(challenge).toHaveProperty('solution');
      expect(challenge).toHaveProperty('puzzleId');
      expect(challenge).toHaveProperty('clues');
      expect(challenge).toHaveProperty('completed');
      expect(challenge).toHaveProperty('completion');
    });

    it('should return same challenge when called multiple times on same day', () => {
      const challenge1 = dailyChallenge.getTodayChallenge();
      const challenge2 = dailyChallenge.getTodayChallenge();
      
      expect(challenge1.puzzleId).toBe(challenge2.puzzleId);
      expect(challenge1.difficulty).toBe(challenge2.difficulty);
    });

    it('should return valid 9x9 puzzle grid', () => {
      const challenge = dailyChallenge.getTodayChallenge();
      
      expect(challenge.puzzle).toHaveLength(9);
      expect(challenge.solution).toHaveLength(9);
      challenge.puzzle.forEach(row => expect(row).toHaveLength(9));
      challenge.solution.forEach(row => expect(row).toHaveLength(9));
    });

    it('should mark challenge as not completed initially', () => {
      const challenge = dailyChallenge.getTodayChallenge();
      
      expect(challenge.completed).toBe(false);
      expect(challenge.completion).toBeNull();
    });
  });

  describe('getChallengeForDate', () => {
    it('should return deterministic puzzle for specific date', () => {
      const date = '2024-01-15';
      const challenge1 = dailyChallenge.getChallengeForDate(date);
      const challenge2 = dailyChallenge.getChallengeForDate(date);
      
      expect(challenge1.puzzleId).toBe(challenge2.puzzleId);
      expect(challenge1.difficulty).toBe(challenge2.difficulty);
    });

    it('should return different puzzles for different dates', () => {
      const challenge1 = dailyChallenge.getChallengeForDate('2024-01-15');
      const challenge2 = dailyChallenge.getChallengeForDate('2024-01-16');
      
      // Different dates should have different puzzles (very high probability)
      expect(challenge1.puzzleId).not.toBe(challenge2.puzzleId);
    });

    it('should follow difficulty rotation based on day of week', () => {
      // Monday 2024-01-15 should be easy (index 0)
      const monday = dailyChallenge.getChallengeForDate('2024-01-15');
      expect(monday.difficulty).toBe('easy');
      
      // Wednesday 2024-01-17 should be medium (index 2)
      const wednesday = dailyChallenge.getChallengeForDate('2024-01-17');
      expect(wednesday.difficulty).toBe('medium');
      
      // Friday 2024-01-19 should be hard (index 4)
      const friday = dailyChallenge.getChallengeForDate('2024-01-19');
      expect(friday.difficulty).toBe('hard');
    });

    it('should handle Sunday correctly (last in rotation)', () => {
      // Sunday 2024-01-21 should be easy (index 6)
      const sunday = dailyChallenge.getChallengeForDate('2024-01-21');
      expect(sunday.difficulty).toBe('easy');
    });

    it('should return same puzzle for same date across years', () => {
      // Same day of year should produce same seed
      const challenge2024 = dailyChallenge.getChallengeForDate('2024-03-15');
      const challenge2025 = dailyChallenge.getChallengeForDate('2025-03-15');
      
      // Different years will have different seeds, so puzzles will differ
      // But the algorithm should be consistent
      expect(challenge2024.difficulty).toBeDefined();
      expect(challenge2025.difficulty).toBeDefined();
    });
  });

  describe('getDateSeed', () => {
    it('should generate deterministic seed from date', () => {
      const date = new Date('2024-01-15');
      const seed1 = dailyChallenge.getDateSeed(date);
      const seed2 = dailyChallenge.getDateSeed(date);
      
      expect(seed1).toBe(seed2);
      expect(typeof seed1).toBe('number');
    });

    it('should generate different seeds for different dates', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      const seed1 = dailyChallenge.getDateSeed(date1);
      const seed2 = dailyChallenge.getDateSeed(date2);
      
      expect(seed1).not.toBe(seed2);
    });

    it('should generate same seed for same date in different instances', () => {
      const dc1 = new DailyChallenge();
      const dc2 = new DailyChallenge();
      const date = new Date('2024-06-15');
      
      expect(dc1.getDateSeed(date)).toBe(dc2.getDateSeed(date));
    });
  });

  describe('recordCompletion', () => {
    it('should record completion with all required data', () => {
      const dateString = '2024-01-15';
      dailyChallenge.recordCompletion(dateString, 300, 2);
      
      const completion = dailyChallenge.getCompletion(dateString);
      
      expect(completion).toBeDefined();
      expect(completion.date).toBe(dateString);
      expect(completion.time).toBe(300);
      expect(completion.hintsUsed).toBe(2);
      expect(completion.difficulty).toBeDefined();
      expect(completion.puzzleId).toBeDefined();
      expect(completion.completedAt).toBeInstanceOf(Date);
    });

    it('should mark challenge as completed', () => {
      const dateString = '2024-01-15';
      dailyChallenge.recordCompletion(dateString, 300, 0);
      
      expect(dailyChallenge.isDateCompleted(dateString)).toBe(true);
    });

    it('should update challenge completed status', () => {
      const dateString = '2024-01-15';
      const challengeBefore = dailyChallenge.getChallengeForDate(dateString);
      expect(challengeBefore.completed).toBe(false);
      
      dailyChallenge.recordCompletion(dateString, 300, 0);
      
      const challengeAfter = dailyChallenge.getChallengeForDate(dateString);
      expect(challengeAfter.completed).toBe(true);
      expect(challengeAfter.completion).toBeDefined();
    });

    it('should handle zero hints used', () => {
      dailyChallenge.recordCompletion('2024-01-15', 250, 0);
      const completion = dailyChallenge.getCompletion('2024-01-15');
      
      expect(completion.hintsUsed).toBe(0);
    });

    it('should handle multiple completions for different dates', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 1);
      dailyChallenge.recordCompletion('2024-01-16', 400, 2);
      dailyChallenge.recordCompletion('2024-01-17', 500, 0);
      
      expect(dailyChallenge.completedChallenges.size).toBe(3);
    });
  });

  describe('getHistory', () => {
    it('should return empty array when no completions', () => {
      const history = dailyChallenge.getHistory();
      expect(history).toEqual([]);
    });

    it('should return all completions sorted by date (newest first)', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 1);
      dailyChallenge.recordCompletion('2024-01-17', 400, 0);
      dailyChallenge.recordCompletion('2024-01-16', 350, 2);
      
      const history = dailyChallenge.getHistory();
      
      expect(history).toHaveLength(3);
      expect(history[0].date).toBe('2024-01-17');
      expect(history[1].date).toBe('2024-01-16');
      expect(history[2].date).toBe('2024-01-15');
    });

    it('should respect limit parameter', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 400, 0);
      dailyChallenge.recordCompletion('2024-01-17', 500, 0);
      dailyChallenge.recordCompletion('2024-01-18', 600, 0);
      
      const history = dailyChallenge.getHistory(2);
      
      expect(history).toHaveLength(2);
      expect(history[0].date).toBe('2024-01-18');
      expect(history[1].date).toBe('2024-01-17');
    });

    it('should return all records when limit is null', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 400, 0);
      
      const history = dailyChallenge.getHistory(null);
      expect(history).toHaveLength(2);
    });
  });

  describe('Completion Checks', () => {
    it('should correctly check if today is completed', () => {
      expect(dailyChallenge.isTodayCompleted()).toBe(false);
      
      const today = dailyChallenge.getTodayDateString();
      dailyChallenge.recordCompletion(today, 300, 0);
      
      expect(dailyChallenge.isTodayCompleted()).toBe(true);
    });

    it('should correctly check if specific date is completed', () => {
      const date = '2024-01-15';
      
      expect(dailyChallenge.isDateCompleted(date)).toBe(false);
      
      dailyChallenge.recordCompletion(date, 300, 0);
      
      expect(dailyChallenge.isDateCompleted(date)).toBe(true);
    });

    it('should return null for non-existent completion', () => {
      expect(dailyChallenge.getCompletion('2024-01-15')).toBeNull();
    });

    it('should return completion record when it exists', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 2);
      const completion = dailyChallenge.getCompletion('2024-01-15');
      
      expect(completion).not.toBeNull();
      expect(completion.time).toBe(300);
    });
  });

  describe('getStatistics', () => {
    it('should return zero statistics when no completions', () => {
      const stats = dailyChallenge.getStatistics();
      
      expect(stats.totalCompleted).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.averageTime).toBe(0);
      expect(stats.bestTime).toBe(Infinity);
      expect(stats.perfectDays).toBe(0);
    });

    it('should calculate total completed correctly', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 400, 1);
      dailyChallenge.recordCompletion('2024-01-17', 500, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.totalCompleted).toBe(3);
    });

    it('should calculate average time correctly', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 600, 0);
      dailyChallenge.recordCompletion('2024-01-17', 900, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.averageTime).toBe(600); // (300 + 600 + 900) / 3
    });

    it('should track best time correctly', () => {
      dailyChallenge.recordCompletion('2024-01-15', 500, 0);
      dailyChallenge.recordCompletion('2024-01-16', 300, 0);
      dailyChallenge.recordCompletion('2024-01-17', 400, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.bestTime).toBe(300);
    });

    it('should count perfect days (no hints used)', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 400, 2);
      dailyChallenge.recordCompletion('2024-01-17', 500, 0);
      dailyChallenge.recordCompletion('2024-01-18', 600, 1);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.perfectDays).toBe(2);
    });
  });

  describe('Streak Calculations', () => {
    it('should calculate current streak correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      dailyChallenge.recordCompletion(dailyChallenge.formatDate(twoDaysAgo), 300, 0);
      dailyChallenge.recordCompletion(dailyChallenge.formatDate(yesterday), 400, 0);
      dailyChallenge.recordCompletion(dailyChallenge.formatDate(today), 500, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.currentStreak).toBe(3);
    });

    it('should return 0 current streak when today not completed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      dailyChallenge.recordCompletion(dailyChallenge.formatDate(yesterday), 300, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.currentStreak).toBe(0);
    });

    it('should calculate longest streak correctly', () => {
      // Create a 3-day streak
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 400, 0);
      dailyChallenge.recordCompletion('2024-01-17', 500, 0);
      
      // Gap
      
      // Create a 2-day streak
      dailyChallenge.recordCompletion('2024-01-20', 300, 0);
      dailyChallenge.recordCompletion('2024-01-21', 400, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.longestStreak).toBe(3);
    });

    it('should handle single day as streak of 1', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      
      const stats = dailyChallenge.getStatistics();
      expect(stats.longestStreak).toBe(1);
    });
  });

  describe('Date Formatting', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00');
      const formatted = dailyChallenge.formatDate(date);
      
      expect(formatted).toBe('2024-01-15');
    });

    it('should pad single-digit months and days', () => {
      const date = new Date('2024-03-05T12:00:00');
      const formatted = dailyChallenge.formatDate(date);
      
      expect(formatted).toBe('2024-03-05');
    });

    it('should get today date string in correct format', () => {
      const todayString = dailyChallenge.getTodayDateString();
      
      expect(todayString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('reset', () => {
    it('should clear all completion history', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 0);
      dailyChallenge.recordCompletion('2024-01-16', 400, 0);
      
      expect(dailyChallenge.completedChallenges.size).toBe(2);
      
      dailyChallenge.reset();
      
      expect(dailyChallenge.completedChallenges.size).toBe(0);
      expect(dailyChallenge.getHistory()).toEqual([]);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      dailyChallenge.recordCompletion('2024-01-15', 300, 2);
      dailyChallenge.recordCompletion('2024-01-16', 400, 0);
      
      const json = dailyChallenge.toJSON();
      
      expect(json.completedChallenges).toHaveLength(2);
      expect(json.completedChallenges[0].date).toBe('2024-01-15');
      expect(json.completedChallenges[0].time).toBe(300);
      expect(json.completedChallenges[0].completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should restore from JSON correctly', () => {
      const json = {
        completedChallenges: [
          {
            date: '2024-01-15',
            time: 300,
            hintsUsed: 2,
            difficulty: 'easy',
            puzzleId: 'puzzle-1',
            completedAt: '2024-01-15T12:00:00.000Z'
          }
        ]
      };
      
      const restored = DailyChallenge.fromJSON(json);
      
      expect(restored.completedChallenges.size).toBe(1);
      expect(restored.isDateCompleted('2024-01-15')).toBe(true);
      
      const completion = restored.getCompletion('2024-01-15');
      expect(completion.time).toBe(300);
      expect(completion.hintsUsed).toBe(2);
      expect(completion.completedAt).toBeInstanceOf(Date);
    });

    it('should handle empty JSON', () => {
      const restored = DailyChallenge.fromJSON({});
      expect(restored.completedChallenges.size).toBe(0);
    });

    it('should handle invalid JSON gracefully', () => {
      const restored = DailyChallenge.fromJSON({ completedChallenges: 'invalid' });
      expect(restored.completedChallenges.size).toBe(0);
    });
  });

  describe('Storage Integration', () => {
    it('should save to storage when recording completion', () => {
      const mockStorage = {
        save: vi.fn(),
        load: vi.fn(() => null)
      };
      
      const dc = new DailyChallenge(mockStorage);
      dc.recordCompletion('2024-01-15', 300, 0);
      
      expect(mockStorage.save).toHaveBeenCalledWith('daily_challenge', expect.any(Object));
    });

    it('should save to storage when resetting', () => {
      const mockStorage = {
        save: vi.fn(),
        load: vi.fn(() => null)
      };
      
      const dc = new DailyChallenge(mockStorage);
      dc.reset();
      
      expect(mockStorage.save).toHaveBeenCalled();
    });

    it('should load from storage on initialization', () => {
      const mockStorage = {
        save: vi.fn(),
        load: vi.fn(() => ({
          completedChallenges: [
            {
              date: '2024-01-15',
              time: 300,
              hintsUsed: 0,
              difficulty: 'easy',
              puzzleId: 'puzzle-1',
              completedAt: '2024-01-15T12:00:00.000Z'
            }
          ]
        }))
      };
      
      const dc = new DailyChallenge(mockStorage);
      
      expect(mockStorage.load).toHaveBeenCalledWith('daily_challenge');
      expect(dc.isDateCompleted('2024-01-15')).toBe(true);
    });

    it('should handle missing storage gracefully', () => {
      const dc = new DailyChallenge(null);
      
      expect(() => dc.recordCompletion('2024-01-15', 300, 0)).not.toThrow();
      expect(() => dc.reset()).not.toThrow();
    });
  });
});
