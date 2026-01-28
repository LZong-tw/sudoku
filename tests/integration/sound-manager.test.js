/**
 * SoundManager tests
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SoundManager } from '../../src/utils/sound-manager.js';

describe('SoundManager', () => {
  let soundManager;
  let mockEventBus;
  let mockStorage;

  beforeEach(() => {
    mockEventBus = { emit: vi.fn(), on: vi.fn() };
    mockStorage = { load: vi.fn(() => null), save: vi.fn() };
    soundManager = new SoundManager(mockStorage, mockEventBus);
  });

  describe('enable/disable', () => {
    test('enable should use instance eventBus', () => {
      soundManager.enable();
      expect(mockEventBus.emit).toHaveBeenCalledWith('sound:enabled');
    });

    test('disable should use instance eventBus', () => {
      soundManager.disable();
      expect(mockEventBus.emit).toHaveBeenCalledWith('sound:disabled');
    });

    test('enable should set enabled to true', () => {
      soundManager.disable();
      soundManager.enable();
      expect(soundManager.isEnabled()).toBe(true);
    });

    test('disable should set enabled to false', () => {
      soundManager.enable();
      soundManager.disable();
      expect(soundManager.isEnabled()).toBe(false);
    });
  });

  describe('toggle', () => {
    test('toggle should switch state', () => {
      soundManager.enable();
      soundManager.toggle();
      expect(soundManager.isEnabled()).toBe(false);
    });
  });
});
