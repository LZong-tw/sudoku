/**
 * @fileoverview KeypadView - UI component for rendering and managing the number keypad and control buttons
 * @module ui/keypad-view
 */

import { Events } from '../utils/event-bus.js';

/**
 * KeypadView class manages the visual representation of the number keypad and control buttons
 * 
 * Responsibilities:
 * - Render number keypad (1-9)
 * - Render control buttons (undo, redo, hint, notes mode, clear)
 * - Handle button click events
 * - Update button states (enabled/disabled)
 * - Touch optimization (minimum 44x44 pixels)
 * 
 * @class KeypadView
 */
export class KeypadView {
  /**
   * Creates a new KeypadView instance
   * 
   * @param {HTMLElement} container - Container element for the keypad
   * @param {EventBus} eventBus - Event bus for communication
   */
  constructor(container, eventBus) {
    if (!container) {
      throw new Error('Container element is required');
    }
    if (!eventBus) {
      throw new Error('EventBus is required');
    }

    this.container = container;
    this.eventBus = eventBus;
    this.keypadElement = null;
    this.numberButtons = [];
    this.controlButtons = {};
    
    // State
    this.noteMode = false;
    this.canUndo = false;
    this.canRedo = false;
    
    this.initialize();
  }

  /**
   * Initializes the keypad view
   * @private
   */
  initialize() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renders the keypad HTML structure
   * 
   * Creates number buttons (1-9) and control buttons
   * (undo, redo, hint, notes mode, clear)
   */
  render() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create keypad element
    this.keypadElement = document.createElement('div');
    this.keypadElement.className = 'keypad';
    this.keypadElement.setAttribute('role', 'toolbar');
    this.keypadElement.setAttribute('aria-label', 'Sudoku input keypad');
    
    // Create number buttons section
    const numberSection = document.createElement('div');
    numberSection.className = 'keypad-numbers';
    numberSection.setAttribute('role', 'group');
    numberSection.setAttribute('aria-label', 'Number buttons');
    
    // Create number buttons (1-9)
    this.numberButtons = [];
    for (let i = 1; i <= 9; i++) {
      const button = this.createNumberButton(i);
      this.numberButtons.push(button);
      numberSection.appendChild(button);
    }
    
    this.keypadElement.appendChild(numberSection);
    
    // Create control buttons section
    const controlSection = document.createElement('div');
    controlSection.className = 'keypad-controls';
    controlSection.setAttribute('role', 'group');
    controlSection.setAttribute('aria-label', 'Control buttons');
    
    // Create control buttons
    this.controlButtons = {
      undo: this.createControlButton('undo', 'Undo', '↶'),
      redo: this.createControlButton('redo', 'Redo', '↷'),
      hint: this.createControlButton('hint', 'Hint', '💡'),
      notes: this.createControlButton('notes', 'Notes Mode', '✏️'),
      clear: this.createControlButton('clear', 'Clear Cell', '×')
    };
    
    // Append control buttons
    Object.values(this.controlButtons).forEach(button => {
      controlSection.appendChild(button);
    });
    
    this.keypadElement.appendChild(controlSection);
    this.container.appendChild(this.keypadElement);
    
    // Initialize button states
    this.updateButtonStates();
  }

  /**
   * Creates a number button element
   * 
   * @param {number} number - Number (1-9)
   * @returns {HTMLElement} Button element
   * @private
   */
  createNumberButton(number) {
    const button = document.createElement('button');
    button.className = 'keypad-button keypad-number';
    button.dataset.number = number;
    button.textContent = number;
    
    // ARIA attributes for accessibility (Requirement 17.1)
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Number ${number}`);
    button.setAttribute('tabindex', '0');
    
    // Touch optimization - minimum 44x44 pixels (Requirement 10.1)
    button.style.minWidth = '44px';
    button.style.minHeight = '44px';
    
    return button;
  }

  /**
   * Creates a control button element
   * 
   * @param {string} action - Button action identifier
   * @param {string} label - Accessible label
   * @param {string} content - Button display content
   * @returns {HTMLElement} Button element
   * @private
   */
  createControlButton(action, label, content) {
    const button = document.createElement('button');
    button.className = 'keypad-button keypad-control';
    button.dataset.action = action;
    button.innerHTML = content;
    
    // ARIA attributes for accessibility (Requirement 17.1)
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', label);
    button.setAttribute('tabindex', '0');
    
    // Notes button is a toggle button
    if (action === 'notes') {
      button.setAttribute('aria-pressed', 'false');
    }
    
    // Touch optimization - minimum 44x44 pixels (Requirement 10.1)
    button.style.minWidth = '44px';
    button.style.minHeight = '44px';
    
    return button;
  }

  /**
   * Attaches event listeners to the keypad
   * Uses event delegation for efficiency (Requirement 19.3)
   * @private
   */
  attachEventListeners() {
    // Click/touch events for buttons
    this.keypadElement.addEventListener('click', this.handleButtonClick.bind(this));
    
    // Touch events for mobile optimization (Requirement 10.3)
    this.keypadElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    
    // Prevent double-tap zoom on mobile (Requirement 10.4)
    this.keypadElement.addEventListener('touchend', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Handles button click events
   * 
   * @param {MouseEvent} event - Click event
   * @private
   */
  handleButtonClick(event) {
    const button = event.target.closest('.keypad-button');
    if (!button || button.disabled) return;
    
    // Handle number button
    if (button.classList.contains('keypad-number')) {
      const number = parseInt(button.dataset.number);
      this.handleNumberInput(number);
      return;
    }
    
    // Handle control button
    if (button.classList.contains('keypad-control')) {
      const action = button.dataset.action;
      this.handleControlAction(action);
      return;
    }
  }

  /**
   * Handles touch start events for mobile
   * 
   * @param {TouchEvent} event - Touch event
   * @private
   */
  handleTouchStart(event) {
    const touch = event.touches[0];
    const button = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.keypad-button');
    
    if (!button || button.disabled) return;
    
    // Add visual feedback for touch
    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 100);
  }

  /**
   * Handles number input
   * 
   * @param {number} number - Number (1-9)
   * @private
   */
  handleNumberInput(number) {
    if (this.noteMode) {
      // Emit note toggle event (Requirement 3.2)
      this.eventBus.emit(Events.NOTE_TOGGLED, { value: number });
    } else {
      // Emit value change event
      this.eventBus.emit(Events.VALUE_CHANGED, { value: number });
    }
  }

  /**
   * Handles control button actions
   * 
   * @param {string} action - Action identifier
   * @private
   */
  handleControlAction(action) {
    switch (action) {
      case 'undo':
        // Emit undo event (Requirement 2.3)
        this.eventBus.emit(Events.UNDO);
        break;
      
      case 'redo':
        // Emit redo event (Requirement 2.4)
        this.eventBus.emit(Events.REDO);
        break;
      
      case 'hint':
        // Emit hint event
        this.eventBus.emit(Events.HINT_USED);
        break;
      
      case 'notes':
        // Toggle notes mode
        this.noteMode = !this.noteMode;
        this.updateNotesButton();
        // Emit settings changed event
        this.eventBus.emit(Events.SETTINGS_CHANGED, { noteMode: this.noteMode });
        break;
      
      case 'clear':
        // Emit clear cell event (value 0)
        this.eventBus.emit(Events.VALUE_CHANGED, { value: 0 });
        break;
    }
  }

  /**
   * Updates the notes button visual state
   * @private
   */
  updateNotesButton() {
    const notesButton = this.controlButtons.notes;
    if (!notesButton) return;
    
    notesButton.classList.toggle('active', this.noteMode);
    notesButton.setAttribute('aria-pressed', this.noteMode ? 'true' : 'false');
  }

  /**
   * Updates button states (enabled/disabled)
   * 
   * @param {Object} [state] - Optional state object
   * @param {boolean} [state.canUndo] - Whether undo is available
   * @param {boolean} [state.canRedo] - Whether redo is available
   * @param {boolean} [state.noteMode] - Whether notes mode is active
   * @param {boolean} [state.hasSelection] - Whether a cell is selected
   */
  updateButtonStates(state = {}) {
    // Update internal state
    if (state.canUndo !== undefined) {
      this.canUndo = state.canUndo;
    }
    if (state.canRedo !== undefined) {
      this.canRedo = state.canRedo;
    }
    if (state.noteMode !== undefined) {
      this.noteMode = state.noteMode;
    }
    
    // Update undo button (Requirement 2.3)
    if (this.controlButtons.undo) {
      this.controlButtons.undo.disabled = !this.canUndo;
      this.controlButtons.undo.setAttribute('aria-disabled', !this.canUndo ? 'true' : 'false');
    }
    
    // Update redo button (Requirement 2.4)
    if (this.controlButtons.redo) {
      this.controlButtons.redo.disabled = !this.canRedo;
      this.controlButtons.redo.setAttribute('aria-disabled', !this.canRedo ? 'true' : 'false');
    }
    
    // Update notes button
    this.updateNotesButton();
    
    // Update number and clear buttons based on selection
    const hasSelection = state.hasSelection !== undefined ? state.hasSelection : true;
    
    this.numberButtons.forEach(button => {
      button.disabled = !hasSelection;
      button.setAttribute('aria-disabled', !hasSelection ? 'true' : 'false');
    });
    
    if (this.controlButtons.clear) {
      this.controlButtons.clear.disabled = !hasSelection;
      this.controlButtons.clear.setAttribute('aria-disabled', !hasSelection ? 'true' : 'false');
    }
  }

  /**
   * Sets the notes mode state
   * 
   * @param {boolean} enabled - Whether notes mode is enabled
   */
  setNoteMode(enabled) {
    this.noteMode = enabled;
    this.updateNotesButton();
  }

  /**
   * Gets the current notes mode state
   * 
   * @returns {boolean} Whether notes mode is enabled
   */
  getNoteMode() {
    return this.noteMode;
  }

  /**
   * Enables or disables a specific button
   * 
   * @param {string} buttonId - Button identifier ('undo', 'redo', 'hint', 'notes', 'clear', or number 1-9)
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setButtonEnabled(buttonId, enabled) {
    let button;
    
    // Check if it's a number button
    if (typeof buttonId === 'number' || !isNaN(buttonId)) {
      const number = parseInt(buttonId);
      if (number >= 1 && number <= 9) {
        button = this.numberButtons[number - 1];
      }
    } else {
      // Control button
      button = this.controlButtons[buttonId];
    }
    
    if (button) {
      button.disabled = !enabled;
      button.setAttribute('aria-disabled', !enabled ? 'true' : 'false');
    }
  }

  /**
   * Highlights a number button (e.g., to show count)
   * 
   * @param {number} number - Number (1-9)
   * @param {boolean} highlight - Whether to highlight
   */
  highlightNumber(number, highlight) {
    if (number < 1 || number > 9) return;
    
    const button = this.numberButtons[number - 1];
    if (button) {
      button.classList.toggle('highlight', highlight);
    }
  }

  /**
   * Shows a count badge on a number button
   * 
   * @param {number} number - Number (1-9)
   * @param {number} count - Count to display
   */
  showNumberCount(number, count) {
    if (number < 1 || number > 9) return;
    
    const button = this.numberButtons[number - 1];
    if (!button) return;
    
    // Remove existing badge
    const existingBadge = button.querySelector('.count-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Add new badge if count > 0
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'count-badge';
      badge.textContent = count;
      badge.setAttribute('aria-label', `${count} remaining`);
      button.appendChild(badge);
    }
  }

  /**
   * Clears all number count badges
   */
  clearNumberCounts() {
    this.numberButtons.forEach(button => {
      const badge = button.querySelector('.count-badge');
      if (badge) {
        badge.remove();
      }
    });
  }

  /**
   * Destroys the keypad view and cleans up event listeners
   */
  destroy() {
    if (this.keypadElement) {
      this.keypadElement.removeEventListener('click', this.handleButtonClick);
      this.keypadElement.removeEventListener('touchstart', this.handleTouchStart);
    }
    
    this.container.innerHTML = '';
    this.numberButtons = [];
    this.controlButtons = {};
  }
}
