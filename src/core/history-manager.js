/**
 * HistoryManager - Manages undo/redo functionality for game actions
 * 
 * Maintains a history stack of all reversible operations including:
 * - Setting cell values
 * - Toggling notes
 * - Clearing cells
 * - Using hints
 * 
 * Supports undo/redo operations with proper state management.
 * 
 * @module core/history-manager
 */

/**
 * Action types that can be recorded in history
 * @enum {string}
 */
export const ActionType = {
  SET_VALUE: 'SET_VALUE',
  TOGGLE_NOTE: 'TOGGLE_NOTE',
  CLEAR_CELL: 'CLEAR_CELL',
  HINT_USED: 'HINT_USED'
};

/**
 * HistoryManager class manages undo/redo functionality
 * 
 * Maintains a stack of actions with a current index pointer.
 * When a new action is pushed, any redo history is cleared.
 * 
 * @example
 * const history = new HistoryManager();
 * history.push({
 *   type: ActionType.SET_VALUE,
 *   row: 0,
 *   col: 0,
 *   oldValue: 0,
 *   newValue: 5
 * });
 * 
 * if (history.canUndo()) {
 *   const action = history.undo();
 *   // Apply reverse of action
 * }
 */
export class HistoryManager {
  /**
   * Creates a new HistoryManager instance
   * 
   * @param {number} [maxSize=100] - Maximum number of actions to store in history
   * @throws {Error} If maxSize is not a positive integer
   */
  constructor(maxSize = 100) {
    if (typeof maxSize !== 'number' || maxSize <= 0 || !Number.isInteger(maxSize)) {
      throw new Error('maxSize must be a positive integer');
    }
    
    /**
     * Stack of recorded actions
     * @type {Array<Object>}
     */
    this.history = [];
    
    /**
     * Current position in the history stack
     * -1 means no actions in history
     * @type {number}
     */
    this.currentIndex = -1;
    
    /**
     * Maximum number of actions to store
     * @type {number}
     */
    this.maxSize = maxSize;
  }

  /**
   * Records a new action in the history
   * 
   * When a new action is pushed:
   * - Any redo history (actions after currentIndex) is cleared
   * - The action is added to the history stack
   * - If history exceeds maxSize, oldest actions are removed
   * 
   * @param {Object} action - The action to record
   * @param {string} action.type - Action type (from ActionType enum)
   * @param {number} action.row - Row index (0-8)
   * @param {number} action.col - Column index (0-8)
   * @param {*} action.oldValue - Previous value/state
   * @param {*} action.newValue - New value/state
   * @throws {Error} If action is invalid or missing required fields
   * 
   * @example
   * // Record setting a cell value
   * history.push({
   *   type: ActionType.SET_VALUE,
   *   row: 0,
   *   col: 0,
   *   oldValue: 0,
   *   newValue: 5
   * });
   * 
   * @example
   * // Record toggling a note
   * history.push({
   *   type: ActionType.TOGGLE_NOTE,
   *   row: 1,
   *   col: 1,
   *   oldValue: new Set([1, 2]),
   *   newValue: new Set([1, 2, 3])
   * });
   */
  push(action) {
    this.validateAction(action);
    
    // Clear redo history (Requirement 2.5)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new action
    this.history.push(action);
    this.currentIndex++;
    
    // Enforce max size limit
    if (this.history.length > this.maxSize) {
      const removeCount = this.history.length - this.maxSize;
      this.history = this.history.slice(removeCount);
      this.currentIndex -= removeCount;
    }
  }

  /**
   * Validates an action object
   * 
   * @param {Object} action - Action to validate
   * @throws {Error} If action is invalid
   * @private
   */
  validateAction(action) {
    if (!action || typeof action !== 'object') {
      throw new Error('Action must be an object');
    }
    
    if (!Object.values(ActionType).includes(action.type)) {
      throw new Error(`Invalid action type: ${action.type}`);
    }
    
    if (typeof action.row !== 'number' || action.row < 0 || action.row > 8 || !Number.isInteger(action.row)) {
      throw new Error('Action row must be an integer between 0 and 8');
    }
    
    if (typeof action.col !== 'number' || action.col < 0 || action.col > 8 || !Number.isInteger(action.col)) {
      throw new Error('Action col must be an integer between 0 and 8');
    }
    
    if (!('oldValue' in action)) {
      throw new Error('Action must have oldValue property');
    }
    
    if (!('newValue' in action)) {
      throw new Error('Action must have newValue property');
    }
  }

  /**
   * Undoes the last action
   * 
   * Moves the current index back by one and returns the action to undo.
   * The caller is responsible for applying the reverse of the action.
   * 
   * @returns {Object|null} The action to undo, or null if no actions to undo
   * 
   * @example
   * const action = history.undo();
   * if (action) {
   *   if (action.type === ActionType.SET_VALUE) {
   *     grid.setValue(action.row, action.col, action.oldValue);
   *   }
   * }
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }
    
    const action = this.history[this.currentIndex];
    this.currentIndex--;
    
    return action;
  }

  /**
   * Redoes the next action
   * 
   * Moves the current index forward by one and returns the action to redo.
   * The caller is responsible for applying the action.
   * 
   * @returns {Object|null} The action to redo, or null if no actions to redo
   * 
   * @example
   * const action = history.redo();
   * if (action) {
   *   if (action.type === ActionType.SET_VALUE) {
   *     grid.setValue(action.row, action.col, action.newValue);
   *   }
   * }
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }
    
    this.currentIndex++;
    const action = this.history[this.currentIndex];
    
    return action;
  }

  /**
   * Checks if undo is available
   * 
   * @returns {boolean} True if there are actions to undo
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * Checks if redo is available
   * 
   * @returns {boolean} True if there are actions to redo
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clears all history
   * 
   * Resets the history stack and current index to initial state.
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Gets the current state information
   * 
   * @returns {Object} Object containing history length and current index
   * 
   * @example
   * const state = history.getCurrentState();
   * console.log(`History: ${state.currentIndex + 1}/${state.length}`);
   */
  getCurrentState() {
    return {
      length: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Gets the number of actions in history
   * 
   * @returns {number} Total number of actions stored
   */
  getHistoryLength() {
    return this.history.length;
  }

  /**
   * Gets the number of actions that can be undone
   * 
   * @returns {number} Number of actions available for undo
   */
  getUndoCount() {
    return this.currentIndex + 1;
  }

  /**
   * Gets the number of actions that can be redone
   * 
   * @returns {number} Number of actions available for redo
   */
  getRedoCount() {
    return this.history.length - this.currentIndex - 1;
  }

  /**
   * Serializes the history manager to JSON
   * 
   * Note: Actions containing Sets or other non-JSON types need special handling
   * 
   * @returns {Object} JSON representation of the history manager
   */
  toJSON() {
    return {
      history: this.history.map(action => this.serializeAction(action)),
      currentIndex: this.currentIndex,
      maxSize: this.maxSize
    };
  }

  /**
   * Serializes an action for JSON storage
   * 
   * Converts Sets to arrays for JSON compatibility
   * 
   * @param {Object} action - Action to serialize
   * @returns {Object} Serialized action
   * @private
   */
  serializeAction(action) {
    const serialized = { ...action };
    
    // Convert Sets to arrays
    if (action.oldValue instanceof Set) {
      serialized.oldValue = Array.from(action.oldValue);
    }
    if (action.newValue instanceof Set) {
      serialized.newValue = Array.from(action.newValue);
    }
    
    return serialized;
  }

  /**
   * Creates a HistoryManager from JSON data
   * 
   * @param {Object} json - JSON representation of a history manager
   * @returns {HistoryManager} A new HistoryManager instance
   * @throws {Error} If JSON data is invalid
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON data');
    }
    
    const maxSize = json.maxSize || 100;
    const manager = new HistoryManager(maxSize);
    
    if (Array.isArray(json.history)) {
      manager.history = json.history.map(action => manager.deserializeAction(action));
    }
    
    if (typeof json.currentIndex === 'number') {
      manager.currentIndex = json.currentIndex;
    }
    
    return manager;
  }

  /**
   * Deserializes an action from JSON storage
   * 
   * Converts arrays back to Sets for note actions
   * 
   * @param {Object} action - Serialized action
   * @returns {Object} Deserialized action
   * @private
   */
  deserializeAction(action) {
    const deserialized = { ...action };
    
    // Convert arrays back to Sets for TOGGLE_NOTE actions
    if (action.type === ActionType.TOGGLE_NOTE) {
      if (Array.isArray(action.oldValue)) {
        deserialized.oldValue = new Set(action.oldValue);
      }
      if (Array.isArray(action.newValue)) {
        deserialized.newValue = new Set(action.newValue);
      }
    }
    
    return deserialized;
  }
}
