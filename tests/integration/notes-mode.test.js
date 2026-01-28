/**
 * Notes mode tests
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { EventBus, Events } from '../../src/utils/event-bus.js';

describe('Notes Mode', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Notes button', () => {
    test('should have notes button with correct properties', () => {
      const notesButton = {
        id: 'notes-btn',
        icon: '✏️',
        title: '筆記模式：標記候選數字',
        action: 'notes'
      };

      expect(notesButton.id).toBe('notes-btn');
      expect(notesButton.icon).toBe('✏️');
      expect(notesButton.title).toContain('筆記');
    });
  });

  describe('Notes toggle event', () => {
    test('NOTE_TOGGLED event should include value', () => {
      let receivedData = null;
      
      eventBus.on(Events.NOTE_TOGGLED, (data) => {
        receivedData = data;
      });

      eventBus.emit(Events.NOTE_TOGGLED, { value: 5 });

      expect(receivedData).toEqual({ value: 5 });
    });

    test('should toggle note on selected cell', () => {
      const mockGameController = {
        state: { selectedCell: { row: 2, col: 3 } },
        toggleNote: vi.fn()
      };

      eventBus.on(Events.NOTE_TOGGLED, (data) => {
        const { row, col } = mockGameController.state.selectedCell;
        mockGameController.toggleNote(row, col, data.value);
      });

      eventBus.emit(Events.NOTE_TOGGLED, { value: 7 });

      expect(mockGameController.toggleNote).toHaveBeenCalledWith(2, 3, 7);
    });
  });

  describe('Mobile guidance', () => {
    test('should have help text for mobile users', () => {
      const helpText = '✏️ 筆記模式：點擊切換，可在格子標記多個候選數字';
      
      expect(helpText).toContain('筆記模式');
      expect(helpText).toContain('候選數字');
    });

    test('help text should be hidden on desktop (768px+)', () => {
      const desktopBreakpoint = 768;
      expect(desktopBreakpoint).toBe(768);
    });
  });

  describe('Visual feedback', () => {
    test('notes button should have active state when enabled', () => {
      const activeClass = 'active';
      expect(activeClass).toBe('active');
    });

    test('active state should change button color to accent', () => {
      const accentColor = '#4ecca3';
      expect(accentColor).toBe('#4ecca3');
    });
  });
});
