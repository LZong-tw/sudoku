/**
 * @fileoverview Unit tests for EventBus
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, Events } from '../../src/utils/event-bus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on() and emit()', () => {
    it('should subscribe to events and receive emitted data', () => {
      let receivedData = null;
      
      eventBus.on('test_event', (data) => {
        receivedData = data;
      });
      
      eventBus.emit('test_event', { value: 42 });
      
      expect(receivedData).toEqual({ value: 42 });
    });

    it('should support multiple listeners for the same event', () => {
      const results = [];
      
      eventBus.on('test_event', (data) => results.push(data + 1));
      eventBus.on('test_event', (data) => results.push(data + 2));
      
      eventBus.emit('test_event', 10);
      
      expect(results).toEqual([11, 12]);
    });

    it('should not throw if emitting event with no listeners', () => {
      expect(() => {
        eventBus.emit('nonexistent_event', {});
      }).not.toThrow();
    });

    it('should return unsubscribe function', () => {
      let callCount = 0;
      
      const unsubscribe = eventBus.on('test_event', () => {
        callCount++;
      });
      
      eventBus.emit('test_event');
      expect(callCount).toBe(1);
      
      unsubscribe();
      eventBus.emit('test_event');
      expect(callCount).toBe(1); // Should not increment
    });
  });

  describe('off()', () => {
    it('should unsubscribe from events', () => {
      let callCount = 0;
      const callback = () => { callCount++; };
      
      eventBus.on('test_event', callback);
      eventBus.emit('test_event');
      expect(callCount).toBe(1);
      
      eventBus.off('test_event', callback);
      eventBus.emit('test_event');
      expect(callCount).toBe(1); // Should not increment
    });

    it('should handle unsubscribing non-existent listener', () => {
      expect(() => {
        eventBus.off('test_event', () => {});
      }).not.toThrow();
    });

    it('should clean up empty listener arrays', () => {
      const callback = () => {};
      eventBus.on('test_event', callback);
      eventBus.off('test_event', callback);
      
      expect(eventBus.listenerCount('test_event')).toBe(0);
    });
  });

  describe('once()', () => {
    it('should execute listener only once', () => {
      let callCount = 0;
      
      eventBus.once('test_event', () => {
        callCount++;
      });
      
      eventBus.emit('test_event');
      eventBus.emit('test_event');
      eventBus.emit('test_event');
      
      expect(callCount).toBe(1);
    });

    it('should pass data to one-time listener', () => {
      let receivedData = null;
      
      eventBus.once('test_event', (data) => {
        receivedData = data;
      });
      
      eventBus.emit('test_event', { value: 'test' });
      
      expect(receivedData).toEqual({ value: 'test' });
    });
  });

  describe('clear()', () => {
    it('should clear all listeners for specific event', () => {
      eventBus.on('event1', () => {});
      eventBus.on('event1', () => {});
      eventBus.on('event2', () => {});
      
      eventBus.clear('event1');
      
      expect(eventBus.listenerCount('event1')).toBe(0);
      expect(eventBus.listenerCount('event2')).toBe(1);
    });

    it('should clear all listeners when no event specified', () => {
      eventBus.on('event1', () => {});
      eventBus.on('event2', () => {});
      
      eventBus.clear();
      
      expect(eventBus.listenerCount('event1')).toBe(0);
      expect(eventBus.listenerCount('event2')).toBe(0);
    });
  });

  describe('listenerCount()', () => {
    it('should return correct listener count', () => {
      expect(eventBus.listenerCount('test_event')).toBe(0);
      
      eventBus.on('test_event', () => {});
      expect(eventBus.listenerCount('test_event')).toBe(1);
      
      eventBus.on('test_event', () => {});
      expect(eventBus.listenerCount('test_event')).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should catch and log errors in listeners', () => {
      const consoleErrorSpy = [];
      const originalError = console.error;
      console.error = (...args) => consoleErrorSpy.push(args);
      
      eventBus.on('test_event', () => {
        throw new Error('Test error');
      });
      
      eventBus.on('test_event', () => {
        // This should still execute
      });
      
      expect(() => {
        eventBus.emit('test_event');
      }).not.toThrow();
      
      expect(consoleErrorSpy.length).toBeGreaterThan(0);
      
      console.error = originalError;
    });
  });

  describe('Events enum', () => {
    it('should define all required event types', () => {
      expect(Events.CELL_SELECTED).toBe('cell_selected');
      expect(Events.VALUE_CHANGED).toBe('value_changed');
      expect(Events.NOTE_TOGGLED).toBe('note_toggled');
      expect(Events.HINT_USED).toBe('hint_used');
      expect(Events.GAME_COMPLETED).toBe('game_completed');
      expect(Events.UNDO).toBe('undo');
      expect(Events.REDO).toBe('redo');
      expect(Events.THEME_CHANGED).toBe('theme_changed');
      expect(Events.SETTINGS_CHANGED).toBe('settings_changed');
      expect(Events.ACHIEVEMENT_UNLOCKED).toBe('achievement_unlocked');
    });
  });
});
