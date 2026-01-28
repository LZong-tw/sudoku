/**
 * @fileoverview GridView - UI component for rendering and managing the Sudoku grid
 * @module ui/grid-view
 */

import { Events } from '../utils/event-bus.js';

/**
 * GridView class manages the visual representation of the Sudoku grid
 * 
 * Responsibilities:
 * - Render 9x9 grid HTML structure
 * - Handle cell selection and highlighting
 * - Display numbers (fixed, user input, hints)
 * - Display notes (pencil marks)
 * - Highlight conflicts (red)
 * - Highlight same numbers
 * - Handle touch and keyboard events
 * - Responsive layout for mobile devices
 * 
 * @class GridView
 */
export class GridView {
  /**
   * Creates a new GridView instance
   * 
   * @param {HTMLElement} container - Container element for the grid
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
    this.gridElement = null;
    this.cells = [];
    
    // State
    this.selectedCell = null; // { row, col }
    this.highlightedCells = new Set(); // Set of "row,col" strings
    this.conflictCells = new Set(); // Set of "row,col" strings
    this.sameNumberCells = new Set(); // Set of "row,col" strings
    
    this.initialize();
  }

  /**
   * Initializes the grid view
   * @private
   */
  initialize() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renders the 9x9 grid HTML structure
   * 
   * Creates a grid with 81 cells, each with appropriate data attributes
   * and ARIA labels for accessibility
   */
  render() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create grid element
    this.gridElement = document.createElement('div');
    this.gridElement.className = 'sudoku-grid';
    this.gridElement.setAttribute('role', 'grid');
    this.gridElement.setAttribute('aria-label', 'Sudoku puzzle grid');
    
    // Create 81 cells
    this.cells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = this.createCell(row, col);
        this.cells.push(cell);
        this.gridElement.appendChild(cell);
      }
    }
    
    this.container.appendChild(this.gridElement);
  }

  /**
   * Creates a single cell element
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @returns {HTMLElement} Cell element
   * @private
   */
  createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'sudoku-cell';
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.dataset.index = row * 9 + col;
    
    // ARIA attributes for accessibility (Requirement 17.1)
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}`);
    cell.setAttribute('aria-selected', 'false');
    cell.setAttribute('tabindex', row === 0 && col === 0 ? '0' : '-1');
    
    // Create container for cell content
    const valueContainer = document.createElement('div');
    valueContainer.className = 'cell-value';
    cell.appendChild(valueContainer);
    
    // Create container for notes
    const notesContainer = document.createElement('div');
    notesContainer.className = 'cell-notes';
    cell.appendChild(notesContainer);
    
    return cell;
  }

  /**
   * Attaches event listeners to the grid
   * Uses event delegation for efficiency (Requirement 19.3)
   * @private
   */
  attachEventListeners() {
    // Click/touch events for cell selection
    this.gridElement.addEventListener('click', this.handleCellClick.bind(this));
    
    // Touch events for mobile optimization (Requirement 10.3)
    this.gridElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    
    // Keyboard navigation (Requirement 17.2)
    this.gridElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Prevent double-tap zoom on mobile (Requirement 10.4)
    this.gridElement.addEventListener('touchend', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Handles cell click events
   * 
   * @param {MouseEvent} event - Click event
   * @private
   */
  handleCellClick(event) {
    const cell = event.target.closest('.sudoku-cell');
    if (!cell) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    this.selectCell(row, col);
  }

  /**
   * Handles touch start events for mobile
   * 
   * @param {TouchEvent} event - Touch event
   * @private
   */
  handleTouchStart(event) {
    const touch = event.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.sudoku-cell');
    
    if (!cell) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    this.selectCell(row, col);
  }

  /**
   * Handles keyboard navigation
   * Supports arrow keys, Tab, Enter, Space, and number keys (Requirement 17.2)
   * 
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  handleKeyDown(event) {
    if (!this.selectedCell) {
      // If no cell selected, select first cell
      if (event.key.startsWith('Arrow') || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.selectCell(0, 0);
      }
      return;
    }
    
    const { row, col } = this.selectedCell;
    let newRow = row;
    let newCol = col;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newRow = Math.min(8, row + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newCol = Math.min(8, col + 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Re-select current cell (can be used to confirm selection)
        this.selectCell(row, col);
        return;
      case 'Tab':
        // Allow default Tab behavior for accessibility
        return;
      default:
        // Check for number keys (1-9) or backspace/delete
        if (event.key >= '1' && event.key <= '9') {
          event.preventDefault();
          this.eventBus.emit(Events.VALUE_CHANGED, {
            row,
            col,
            value: parseInt(event.key)
          });
        } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
          event.preventDefault();
          this.eventBus.emit(Events.VALUE_CHANGED, {
            row,
            col,
            value: 0
          });
        }
        return;
    }
    
    // Select new cell if position changed
    if (newRow !== row || newCol !== col) {
      this.selectCell(newRow, newCol);
    }
  }

  /**
   * Selects a cell and emits selection event
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   */
  selectCell(row, col) {
    if (row < 0 || row > 8 || col < 0 || col > 8) {
      return;
    }
    
    this.selectedCell = { row, col };
    this.updateSelection();
    this.highlightRelatedCells(row, col);
    
    // Emit selection event
    this.eventBus.emit(Events.CELL_SELECTED, { row, col });
  }

  /**
   * Clears cell selection
   */
  clearSelection() {
    this.selectedCell = null;
    this.updateSelection();
  }

  /**
   * Updates the visual selection state of cells
   * @private
   */
  updateSelection() {
    this.cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const isSelected = this.selectedCell && 
                        this.selectedCell.row === row && 
                        this.selectedCell.col === col;
      
      cell.classList.toggle('selected', isSelected);
      cell.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      cell.setAttribute('tabindex', isSelected ? '0' : '-1');
      
      // Focus selected cell for keyboard navigation
      if (isSelected) {
        cell.focus();
      }
    });
  }

  /**
   * Updates the grid display with current game state
   * 
   * @param {Object} gridData - Grid data object
   * @param {number[][]} gridData.current - Current grid values
   * @param {Set<string>} gridData.fixed - Set of fixed cell positions
   * @param {Array<Array<Set<number>>>} gridData.notes - Notes for each cell
   * @param {Set<string>} [gridData.hints] - Set of hint cell positions
   */
  updateGrid(gridData) {
    const { current, fixed, notes, hints = new Set() } = gridData;
    
    this.cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const value = current[row][col];
      const cellKey = `${row},${col}`;
      const isFixed = fixed.has(cellKey);
      const isHint = hints.has(cellKey);
      const cellNotes = notes[row][col];
      
      // Update cell classes
      cell.classList.toggle('fixed', isFixed);
      cell.classList.toggle('hint', isHint);
      
      // Update cell value or notes
      const valueContainer = cell.querySelector('.cell-value');
      const notesContainer = cell.querySelector('.cell-notes');
      
      if (value !== 0) {
        // Display value
        valueContainer.textContent = value;
        notesContainer.innerHTML = '';
        cell.setAttribute('aria-label', 
          `Cell row ${row + 1} column ${col + 1}, value ${value}${isFixed ? ' fixed' : ''}${isHint ? ' hint' : ''}`
        );
      } else if (cellNotes && cellNotes.size > 0) {
        // Display notes (Requirement 3.5)
        valueContainer.textContent = '';
        this.renderNotes(notesContainer, cellNotes);
        cell.setAttribute('aria-label', 
          `Cell row ${row + 1} column ${col + 1}, notes ${Array.from(cellNotes).sort().join(' ')}`
        );
      } else {
        // Empty cell
        valueContainer.textContent = '';
        notesContainer.innerHTML = '';
        cell.setAttribute('aria-label', `Cell row ${row + 1} column ${col + 1}, empty`);
      }
    });
  }

  /**
   * Renders notes (pencil marks) in a cell
   * 
   * @param {HTMLElement} container - Notes container element
   * @param {Set<number>} notes - Set of note numbers (1-9)
   * @private
   */
  renderNotes(container, notes) {
    container.innerHTML = '';
    
    // Create a 3x3 grid for notes
    for (let i = 1; i <= 9; i++) {
      const noteElement = document.createElement('span');
      noteElement.className = 'note';
      noteElement.textContent = notes.has(i) ? i : '';
      container.appendChild(noteElement);
    }
  }

  /**
   * Highlights cells related to the selected cell
   * Highlights same row, column, and 3x3 box (Requirement 5.4)
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   */
  highlightRelatedCells(row, col) {
    this.highlightedCells.clear();
    
    if (row < 0 || row > 8 || col < 0 || col > 8) {
      this.updateHighlights();
      return;
    }
    
    // Highlight same row
    for (let c = 0; c < 9; c++) {
      if (c !== col) {
        this.highlightedCells.add(`${row},${c}`);
      }
    }
    
    // Highlight same column
    for (let r = 0; r < 9; r++) {
      if (r !== row) {
        this.highlightedCells.add(`${r},${col}`);
      }
    }
    
    // Highlight same 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row || c !== col) {
          this.highlightedCells.add(`${r},${c}`);
        }
      }
    }
    
    this.updateHighlights();
  }

  /**
   * Clears all cell highlights
   */
  clearHighlights() {
    this.highlightedCells.clear();
    this.updateHighlights();
  }

  /**
   * Highlights cells with the same number as the selected cell (Requirement 5.1)
   * 
   * @param {number[][]} grid - Current grid values
   * @param {number} value - Value to highlight
   */
  highlightSameNumbers(grid, value) {
    this.sameNumberCells.clear();
    
    if (!value || value === 0) {
      this.updateHighlights();
      return;
    }
    
    // Find all cells with the same value
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === value) {
          this.sameNumberCells.add(`${row},${col}`);
        }
      }
    }
    
    this.updateHighlights();
  }

  /**
   * Clears same number highlights
   */
  clearSameNumberHighlights() {
    this.sameNumberCells.clear();
    this.updateHighlights();
  }

  /**
   * Highlights cells with conflicts (Requirement 4.2)
   * 
   * @param {Array<{row: number, col: number}>} conflicts - Array of conflict positions
   */
  highlightConflicts(conflicts) {
    this.conflictCells.clear();
    
    conflicts.forEach(({ row, col }) => {
      this.conflictCells.add(`${row},${col}`);
    });
    
    this.updateHighlights();
  }

  /**
   * Clears conflict highlights
   */
  clearConflicts() {
    this.conflictCells.clear();
    this.updateHighlights();
  }

  /**
   * Updates all highlight classes on cells
   * @private
   */
  updateHighlights() {
    this.cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const cellKey = `${row},${col}`;
      
      const isHighlighted = this.highlightedCells.has(cellKey);
      const isConflict = this.conflictCells.has(cellKey);
      const isSameNumber = this.sameNumberCells.has(cellKey);
      
      cell.classList.toggle('highlight', isHighlighted);
      cell.classList.toggle('conflict', isConflict);
      cell.classList.toggle('same-number', isSameNumber);
    });
  }

  /**
   * Shows a visual animation for a cell (e.g., valid/invalid input)
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {string} animationType - Type of animation ('valid', 'invalid', 'complete')
   */
  animateCell(row, col, animationType) {
    const cell = this.cells[row * 9 + col];
    if (!cell) return;
    
    // Remove existing animation classes
    cell.classList.remove('valid', 'invalid', 'complete');
    
    // Trigger reflow to restart animation
    void cell.offsetWidth;
    
    // Add animation class
    cell.classList.add(animationType);
    
    // Remove animation class after animation completes
    setTimeout(() => {
      cell.classList.remove(animationType);
    }, 300);
  }

  /**
   * Shows completion animation for all cells
   */
  showCompletionAnimation() {
    this.cells.forEach((cell, index) => {
      setTimeout(() => {
        cell.classList.add('complete');
      }, index * 10); // Stagger animation
    });
  }

  /**
   * Gets the cell element at a specific position
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @returns {HTMLElement|null} Cell element or null if not found
   */
  getCell(row, col) {
    if (row < 0 || row > 8 || col < 0 || col > 8) {
      return null;
    }
    return this.cells[row * 9 + col];
  }

  /**
   * Destroys the grid view and cleans up event listeners
   */
  destroy() {
    if (this.gridElement) {
      this.gridElement.removeEventListener('click', this.handleCellClick);
      this.gridElement.removeEventListener('touchstart', this.handleTouchStart);
      this.gridElement.removeEventListener('keydown', this.handleKeyDown);
    }
    
    this.container.innerHTML = '';
    this.cells = [];
    this.selectedCell = null;
    this.highlightedCells.clear();
    this.conflictCells.clear();
    this.sameNumberCells.clear();
  }
}
