/**
 * @fileoverview EventBus - Publish/Subscribe event system for module communication
 * @module utils/event-bus
 */

/**
 * Event types used throughout the application
 * @enum {string}
 */
export const Events = {
  CELL_SELECTED: 'cell_selected',
  VALUE_CHANGED: 'value_changed',
  NOTE_TOGGLED: 'note_toggled',
  HINT_USED: 'hint_used',
  GAME_COMPLETED: 'game_completed',
  UNDO: 'undo',
  REDO: 'redo',
  THEME_CHANGED: 'theme_changed',
  SETTINGS_CHANGED: 'settings_changed',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked'
};

/**
 * EventBus - Publish/Subscribe pattern implementation for decoupled module communication
 * 
 * @class EventBus
 * @example
 * const eventBus = new EventBus();
 * eventBus.on('cell_selected', (data) => console.log(data));
 * eventBus.emit('cell_selected', { row: 0, col: 0 });
 */
export class EventBus {
  /**
   * Creates a new EventBus instance
   */
  constructor() {
    /**
     * Map of event names to arrays of callback functions
     * @type {Map<string, Function[]>}
     * @private
     */
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * 
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   * 
   * @example
   * const unsubscribe = eventBus.on('cell_selected', (data) => {
   *   console.log('Cell selected:', data);
   * });
   * // Later: unsubscribe();
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * 
   * @param {string} event - Event name to stop listening to
   * @param {Function} callback - Callback function to remove
   * 
   * @example
   * eventBus.off('cell_selected', myCallback);
   */
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event to all subscribers
   * 
   * @param {string} event - Event name to emit
   * @param {*} data - Data to pass to event listeners
   * 
   * @example
   * eventBus.emit('cell_selected', { row: 0, col: 0 });
   */
  emit(event, data) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);
    // Create a copy to avoid issues if listeners modify the array
    [...callbacks].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * Subscribe to an event for one-time execution
   * The listener will be automatically removed after first execution
   * 
   * @param {string} event - Event name to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   * 
   * @example
   * eventBus.once('game_completed', (data) => {
   *   console.log('Game completed once:', data);
   * });
   */
  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Remove all listeners for a specific event or all events
   * 
   * @param {string} [event] - Optional event name. If omitted, clears all listeners
   * 
   * @example
   * eventBus.clear('cell_selected'); // Clear specific event
   * eventBus.clear(); // Clear all events
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   * 
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   * 
   * @example
   * const count = eventBus.listenerCount('cell_selected');
   */
  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).length : 0;
  }
}
