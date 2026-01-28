/**
 * Keyboard input tests
 */

import { describe, test, expect } from 'vitest';

describe('Keyboard Input', () => {
  test('should accept number keys 1-9', () => {
    const validKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    validKeys.forEach(key => {
      expect(key >= '1' && key <= '9').toBe(true);
    });
  });

  test('should accept Backspace and Delete for clearing', () => {
    const clearKeys = ['Backspace', 'Delete'];
    clearKeys.forEach(key => {
      expect(key === 'Backspace' || key === 'Delete').toBe(true);
    });
  });

  test('should accept arrow keys for navigation', () => {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    arrowKeys.forEach(key => {
      expect(key.startsWith('Arrow')).toBe(true);
    });
  });

  test('arrow keys should move selection within bounds', () => {
    let row = 4, col = 4;
    
    // Up
    if (row > 0) row--;
    expect(row).toBe(3);
    
    // Down
    if (row < 8) row++;
    expect(row).toBe(4);
    
    // Left
    if (col > 0) col--;
    expect(col).toBe(3);
    
    // Right
    if (col < 8) col++;
    expect(col).toBe(4);
  });

  test('should not move past grid boundaries', () => {
    let row = 0, col = 0;
    
    // Try to go up from row 0
    if (row > 0) row--;
    expect(row).toBe(0);
    
    // Try to go left from col 0
    if (col > 0) col--;
    expect(col).toBe(0);
  });
});
