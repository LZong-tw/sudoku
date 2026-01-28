/**
 * zh-TW localization tests
 */

import { describe, test, expect } from 'vitest';

describe('zh-TW Localization', () => {
  const zhTW = {
    settings: '設定',
    statistics: '統計資料',
    undo: '復原',
    redo: '重做',
    hint: '提示',
    notes: '筆記',
    difficulty: { easy: '簡單', medium: '中等', hard: '困難' }
  };

  const zhCN = {
    settings: '設置',
    statistics: '統計數據'
  };

  test('should use 設定 not 設置', () => {
    expect(zhTW.settings).toBe('設定');
    expect(zhTW.settings).not.toBe(zhCN.settings);
  });

  test('should use 統計資料 not 統計數據', () => {
    expect(zhTW.statistics).toBe('統計資料');
    expect(zhTW.statistics).not.toBe(zhCN.statistics);
  });

  test('should use 復原 for undo', () => {
    expect(zhTW.undo).toBe('復原');
  });

  test('should use 重做 for redo', () => {
    expect(zhTW.redo).toBe('重做');
  });

  test('difficulty labels should be zh-TW', () => {
    expect(zhTW.difficulty.easy).toBe('簡單');
    expect(zhTW.difficulty.medium).toBe('中等');
    expect(zhTW.difficulty.hard).toBe('困難');
  });
});
