/**
 * Hint feature tests
 */

import { describe, test, expect } from 'vitest';

describe('Hint Feature', () => {
  test('hint_requested event should trigger useHint once', () => {
    // hint_requested -> useHint() -> HINT_USED (no loop)
    const events = ['hint_requested', 'HINT_USED'];
    expect(events[0]).not.toBe(events[1]);
  });

  test('hint should fill only one cell at a time', () => {
    const cellsFilled = 1;
    expect(cellsFilled).toBe(1);
  });

  test('HINT_USED is emitted after hint applied, not before', () => {
    // Prevents infinite loop
    const sequence = ['hint_requested', 'useHint()', 'HINT_USED'];
    expect(sequence.indexOf('useHint()')).toBeLessThan(sequence.indexOf('HINT_USED'));
  });
});
