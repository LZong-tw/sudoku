/**
 * Puzzle library tests
 */

import { describe, test, expect } from 'vitest';
import { EASY_PUZZLES, MEDIUM_PUZZLES, HARD_PUZZLES } from '../../src/features/puzzle-library.js';

function countClues(puzzle) {
  let count = 0;
  puzzle.forEach(row => row.forEach(cell => { if (cell !== 0) count++; }));
  return count;
}

describe('Puzzle Library', () => {
  describe('Easy puzzles', () => {
    test('should have 10 puzzles', () => {
      expect(EASY_PUZZLES.length).toBe(10);
    });

    test('should have 38-45 clues each', () => {
      EASY_PUZZLES.forEach(p => {
        const clues = countClues(p.puzzle);
        expect(clues).toBeGreaterThanOrEqual(38);
        expect(clues).toBeLessThanOrEqual(45);
      });
    });
  });

  describe('Medium puzzles', () => {
    test('should have 10 puzzles', () => {
      expect(MEDIUM_PUZZLES.length).toBe(10);
    });

    test('should have 28-34 clues each', () => {
      MEDIUM_PUZZLES.forEach(p => {
        const clues = countClues(p.puzzle);
        expect(clues).toBeGreaterThanOrEqual(28);
        expect(clues).toBeLessThanOrEqual(34);
      });
    });
  });

  describe('Hard puzzles', () => {
    test('should have 10 puzzles', () => {
      expect(HARD_PUZZLES.length).toBe(10);
    });

    test('should have 22-27 clues each', () => {
      HARD_PUZZLES.forEach(p => {
        const clues = countClues(p.puzzle);
        expect(clues).toBeGreaterThanOrEqual(22);
        expect(clues).toBeLessThanOrEqual(27);
      });
    });
  });
});
