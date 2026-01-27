/**
 * GameController - Main game controller coordinating all modules
 * 
 * Manages the complete game state and coordinates between:
 * - GridModel: Grid data and validation
 * - HistoryManager: Undo/redo functionality
 * - HintSystem: Hint generation
 * - Timer: Game timing
 * - StatisticsTracker: Game statistics
 * - AchievementSystem: Achievement tracking
 * - StorageManager: Data persistence
 * - EventBus: Module communication
 * 
 * Handles user operations including:
 * - Cell selection
 * - Number input
 * - Note mode toggle
 * - Auto-check mode
 * - Highlight same numbers
 * - Game completion detection
 * - Auto-save with debouncing
 * 
 * Validates: Requirements 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1, 11.2, 11.3, 19.4
 * 
 * @module game-controller
 */

import { GridModel } from './core/grid-model.js';
import { HistoryManager, ActionType } from './core/history-manager.js';
import { HintSystem } from './core/hint-system.js';
import { debounce } from './utils/performance.js';
import { Timer } from './core/timer.js';
import { StatisticsTracker } from './features/statistics-tracker.js';
import { AchievementSystem } from './features/achievement-system.js';
import { PuzzleGenerator } from './features/puzzle-generator.js';
import { DailyChallenge } from './features/daily-challenge.js';
import { StorageManager } from './storage/storage-manager.js';
import { EventBus, Events } from './utils/event-bus.js';
import { ErrorHandler } from './utils/error-handler.js';

/**
 * Game status enumeration
 * @enum {string}
 */
export const GameStatus = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

/**
 * Game mode enumeration
 * @enum {string}
 */
export const GameMode = {
  NORMAL: 'normal',
  DAILY_CHALLENGE: 'daily_challenge'
};

/**
 * GameController class - Main game controller
 * 
 * Coordinates all game modules and manages the complete game state.
 * Implements auto-save with debouncing (300ms) and emits events for UI updates.
 */
export class GameController {
  /**
   * Creates a new GameController instance
   * 
   * @param {Object} options - Configuration options
   * @param {StorageManager} [options.storageManager] - Storage manager instance
   * @param {EventBus} [options.eventBus] - Event bus instance
   * @param {StatisticsTracker} [options.statisticsTracker] - Statistics tracker instance
   * @param {AchievementSystem} [options.achievementSystem] - Achievement system instance
   */
  constructor(options = {}) {
    // Initialize core services
    this.storageManager = options.storageManager || new StorageManager();
    this.eventBus = options.eventBus || new EventBus();
    this.statisticsTracker = options.statisticsTracker || new StatisticsTracker();
    this.achievementSystem = options.achievementSystem || new AchievementSystem(this.storageManager, this.eventBus);
    this.puzzleGenerator = options.puzzleGenerator || new PuzzleGenerator(this.storageManager);
    this.dailyChallenge = options.dailyChallenge || new DailyChallenge(this.storageManager);
    
    // Initialize game state
    this.state = {
      mode: GameMode.NORMAL,
      difficulty: 'medium',
      grid: null,
      history: null,
      hintSystem: null,
      timer: null,
      selectedCell: { row: null, col: null },
      status: GameStatus.PLAYING,
      errors: 0,
      hintsUsed: 0,
      noteMode: false,
      autoCheck: true,
      highlightSameNumbers: true,
      conflictCells: new Set(),
      highlightedCells: new Set()
    };
    
    // Auto-save with debouncing (Requirement 19.4)
    this.debouncedSave = debounce(() => this.saveGame(), 300);
    
    // Load settings
    this.loadSettings();
    
    // Try to restore saved game
    this.restoreGame();
  }

  /**
   * Start a new game
   * 
   * @param {string|number[][]} difficultyOrPuzzle - Difficulty level ('easy', 'medium', 'hard') or puzzle grid
   * @param {number[][]} [solution] - Solution grid (required if first param is puzzle)
   * @param {string} [difficulty] - Difficulty level (required if first param is puzzle)
   * @param {string} [mode=GameMode.NORMAL] - Game mode
   */
  startNewGame(difficultyOrPuzzle, solution, difficulty, mode = GameMode.NORMAL) {
    try {
      let puzzle, sol, diff;
      
      // Handle different parameter formats
      if (typeof difficultyOrPuzzle === 'string') {
        // Called with difficulty string: startNewGame('easy')
        diff = difficultyOrPuzzle;
        const puzzleData = this.puzzleGenerator.getRandomPuzzle(diff);
        puzzle = puzzleData.puzzle;
        sol = puzzleData.solution;
      } else {
        // Called with puzzle array: startNewGame(puzzle, solution, 'easy')
        puzzle = difficultyOrPuzzle;
        sol = solution;
        diff = difficulty || 'medium';
      }
      
      // Create new grid model
      this.state.grid = new GridModel(puzzle, sol);
      this.grid = this.state.grid; // Alias for easier access
      
      // Initialize history manager
      this.state.history = new HistoryManager();
      
      // Initialize hint system
      this.state.hintSystem = new HintSystem(this.state.grid);
      
      // Initialize timer
      this.state.timer = new Timer();
      this.state.timer.start();
      
      // Reset game state
      this.state.mode = mode;
      this.state.difficulty = diff;
      this.state.selectedCell = { row: null, col: null };
      this.state.status = GameStatus.PLAYING;
      this.state.errors = 0;
      this.state.hintsUsed = 0;
      this.state.conflictCells = new Set();
      this.state.highlightedCells = new Set();
      
      // Record game start in statistics
      this.statisticsTracker.recordGameStart(diff);
      
      // Clear any saved game state
      this.storageManager.remove('gameState');
      
      // Emit event
      this.eventBus.emit('game_started', {
        difficulty,
        mode
      });
      
      console.log(`New game started: ${diff} (${mode})`);
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'startNewGame' });
      ErrorHandler.showUserMessage('無法開始新遊戲');
      throw error;
    }
  }
  
  /**
   * Start a daily challenge game
   */
  startDailyChallenge() {
    try {
      const challenge = this.dailyChallenge.getTodayChallenge();
      this.startNewGame(challenge.puzzle, challenge.solution, challenge.difficulty, GameMode.DAILY_CHALLENGE);
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'startDailyChallenge' });
      ErrorHandler.showUserMessage('無法開始每日挑戰');
      throw error;
    }
  }

  /**
   * Select a cell in the grid
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   */
  selectCell(row, col) {
    if (!this.state.grid || this.state.status !== GameStatus.PLAYING) {
      return;
    }
    
    try {
      // Validate indices
      if (row < 0 || row > 8 || col < 0 || col > 8) {
        return;
      }
      
      // Update selected cell
      this.state.selectedCell = { row, col };
      
      // Update highlighted cells if highlightSameNumbers is enabled (Requirement 5.1)
      this.updateHighlightedCells();
      
      // Emit event
      this.eventBus.emit(Events.CELL_SELECTED, {
        row,
        col,
        value: this.state.grid.getValue(row, col),
        isFixed: this.state.grid.isFixed(row, col),
        highlightedCells: Array.from(this.state.highlightedCells)
      });
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'selectCell', row, col });
    }
  }
  
  /**
   * Deselect the current cell
   */
  deselectCell() {
    this.state.selectedCell = { row: null, col: null };
    this.state.highlightedCells.clear();
    
    this.eventBus.emit(Events.CELL_SELECTED, {
      row: null,
      col: null,
      highlightedCells: []
    });
  }

  /**
   * Input a number into the selected cell
   * Handles both normal mode and note mode (Requirement 3.1, 3.2)
   * 
   * @param {number} number - Number to input (1-9)
   */
  inputNumber(number) {
    if (!this.state.grid || this.state.status !== GameStatus.PLAYING) {
      return;
    }
    
    const { row, col } = this.state.selectedCell;
    
    // Check if a cell is selected
    if (row === null || col === null) {
      return;
    }
    
    // Check if cell is fixed
    if (this.state.grid.isFixed(row, col)) {
      return;
    }
    
    try {
      if (this.state.noteMode) {
        // Note mode: toggle note (Requirement 3.1, 3.2)
        this.toggleNote(row, col, number);
      } else {
        // Normal mode: set value
        this.setValue(row, col, number);
      }
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'inputNumber', row, col, number });
    }
  }
  
  /**
   * Set a value in a cell (normal mode)
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {number} value - Value to set (1-9, or 0 to clear)
   * @private
   */
  setValue(row, col, value) {
    const oldValue = this.state.grid.getValue(row, col);
    const oldNotes = new Set(this.state.grid.getNotes(row, col));
    
    // Set the value
    this.state.grid.setValue(row, col, value);
    
    // Record in history
    this.state.history.push({
      type: ActionType.SET_VALUE,
      row,
      col,
      oldValue,
      newValue: value,
      oldNotes // Save notes in case of undo
    });
    
    // Check for conflicts if auto-check is enabled (Requirement 4.1, 4.2)
    if (this.state.autoCheck && value !== 0) {
      this.checkConflicts(row, col, value);
    } else {
      this.state.conflictCells.clear();
    }
    
    // Check if game is complete
    if (this.state.grid.isComplete()) {
      this.handleGameCompletion();
    }
    
    // Emit event
    this.eventBus.emit(Events.VALUE_CHANGED, {
      row,
      col,
      value,
      oldValue,
      conflicts: Array.from(this.state.conflictCells)
    });
    
    // Update highlighted cells
    this.updateHighlightedCells();
    
    // Trigger auto-save
    this.scheduleAutoSave();
  }

  /**
   * Toggle a note in a cell (note mode)
   * 
   * @param {number} row - Row index (0-8)
   * @param {number} col - Column index (0-8)
   * @param {number} number - Note number to toggle (1-9)
   * @private
   */
  toggleNote(row, col, number) {
    const oldNotes = new Set(this.state.grid.getNotes(row, col));
    
    // Toggle the note
    this.state.grid.toggleNote(row, col, number);
    
    const newNotes = new Set(this.state.grid.getNotes(row, col));
    
    // Record in history
    this.state.history.push({
      type: ActionType.TOGGLE_NOTE,
      row,
      col,
      oldValue: oldNotes,
      newValue: newNotes
    });
    
    // Emit event
    this.eventBus.emit(Events.NOTE_TOGGLED, {
      row,
      col,
      notes: Array.from(newNotes)
    });
    
    // Trigger auto-save
    this.scheduleAutoSave();
  }
  
  /**
   * Clear the selected cell
   */
  clearCell() {
    if (!this.state.grid || this.state.status !== GameStatus.PLAYING) {
      return;
    }
    
    const { row, col } = this.state.selectedCell;
    
    if (row === null || col === null) {
      return;
    }
    
    if (this.state.grid.isFixed(row, col)) {
      return;
    }
    
    try {
      const oldValue = this.state.grid.getValue(row, col);
      const oldNotes = new Set(this.state.grid.getNotes(row, col));
      
      // Clear the cell
      this.state.grid.setValue(row, col, 0);
      
      // Record in history
      this.state.history.push({
        type: ActionType.CLEAR_CELL,
        row,
        col,
        oldValue,
        newValue: 0,
        oldNotes
      });
      
      // Clear conflicts
      this.state.conflictCells.clear();
      
      // Emit event
      this.eventBus.emit(Events.VALUE_CHANGED, {
        row,
        col,
        value: 0,
        oldValue,
        conflicts: []
      });
      
      // Update highlighted cells
      this.updateHighlightedCells();
      
      // Trigger auto-save
      this.scheduleAutoSave();
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'clearCell', row, col });
    }
  }

  /**
   * Toggle note mode on/off
   */
  toggleNoteMode() {
    this.state.noteMode = !this.state.noteMode;
    
    this.eventBus.emit('note_mode_changed', {
      noteMode: this.state.noteMode
    });
  }
  
  /**
   * Use a hint (Requirement 1.1, 1.2, 1.4)
   */
  useHint() {
    if (!this.state.grid || !this.state.hintSystem || this.state.status !== GameStatus.PLAYING) {
      return;
    }
    
    try {
      const hint = this.state.hintSystem.getHint();
      
      if (!hint) {
        ErrorHandler.showUserMessage('沒有可用的提示');
        return;
      }
      
      const { row, col, value } = hint;
      const oldValue = this.state.grid.getValue(row, col);
      const oldNotes = new Set(this.state.grid.getNotes(row, col));
      
      // Set the hint value
      this.state.grid.setValue(row, col, value);
      
      // Increment hints used counter
      this.state.hintsUsed++;
      
      // Record in history
      this.state.history.push({
        type: ActionType.HINT_USED,
        row,
        col,
        oldValue,
        newValue: value,
        oldNotes
      });
      
      // Clear conflicts for this cell
      this.state.conflictCells.clear();
      
      // Check if game is complete
      if (this.state.grid.isComplete()) {
        this.handleGameCompletion();
      }
      
      // Emit event
      this.eventBus.emit(Events.HINT_USED, {
        row,
        col,
        value,
        hintsUsed: this.state.hintsUsed
      });
      
      // Update highlighted cells
      this.updateHighlightedCells();
      
      // Trigger auto-save
      this.scheduleAutoSave();
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'useHint' });
      ErrorHandler.showUserMessage('無法使用提示');
    }
  }

  /**
   * Undo the last action (Requirement 2.1)
   */
  undo() {
    if (!this.state.history || !this.state.history.canUndo()) {
      return;
    }
    
    try {
      const action = this.state.history.undo();
      
      if (!action) {
        return;
      }
      
      // Apply the reverse of the action
      this.applyReverseAction(action);
      
      // Clear conflicts
      this.state.conflictCells.clear();
      
      // Emit event
      this.eventBus.emit(Events.UNDO, {
        action,
        canUndo: this.state.history.canUndo(),
        canRedo: this.state.history.canRedo()
      });
      
      // Update highlighted cells
      this.updateHighlightedCells();
      
      // Trigger auto-save
      this.scheduleAutoSave();
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'undo' });
    }
  }
  
  /**
   * Redo the next action (Requirement 2.2)
   */
  redo() {
    if (!this.state.history || !this.state.history.canRedo()) {
      return;
    }
    
    try {
      const action = this.state.history.redo();
      
      if (!action) {
        return;
      }
      
      // Apply the action
      this.applyAction(action);
      
      // Clear conflicts
      this.state.conflictCells.clear();
      
      // Emit event
      this.eventBus.emit(Events.REDO, {
        action,
        canUndo: this.state.history.canUndo(),
        canRedo: this.state.history.canRedo()
      });
      
      // Update highlighted cells
      this.updateHighlightedCells();
      
      // Trigger auto-save
      this.scheduleAutoSave();
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'redo' });
    }
  }

  /**
   * Apply an action (for redo)
   * 
   * @param {Object} action - Action to apply
   * @private
   */
  applyAction(action) {
    const { row, col, newValue } = action;
    
    switch (action.type) {
      case ActionType.SET_VALUE:
      case ActionType.CLEAR_CELL:
      case ActionType.HINT_USED:
        this.state.grid.setValue(row, col, newValue);
        if (action.type === ActionType.HINT_USED) {
          this.state.hintsUsed++;
        }
        break;
        
      case ActionType.TOGGLE_NOTE:
        // Restore the new notes state
        this.state.grid.notes[row][col] = new Set(newValue);
        break;
    }
  }
  
  /**
   * Apply the reverse of an action (for undo)
   * 
   * @param {Object} action - Action to reverse
   * @private
   */
  applyReverseAction(action) {
    const { row, col, oldValue, oldNotes } = action;
    
    switch (action.type) {
      case ActionType.SET_VALUE:
      case ActionType.CLEAR_CELL:
        this.state.grid.setValue(row, col, oldValue);
        // Restore old notes if they existed
        if (oldNotes) {
          this.state.grid.notes[row][col] = new Set(oldNotes);
        }
        break;
        
      case ActionType.HINT_USED:
        this.state.grid.setValue(row, col, oldValue);
        this.state.hintsUsed--;
        // Restore old notes if they existed
        if (oldNotes) {
          this.state.grid.notes[row][col] = new Set(oldNotes);
        }
        break;
        
      case ActionType.TOGGLE_NOTE:
        // Restore the old notes state
        this.state.grid.notes[row][col] = new Set(oldValue);
        break;
    }
  }

  /**
   * Check for conflicts when auto-check is enabled (Requirement 4.1, 4.2)
   * 
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {number} value - Value to check
   * @private
   */
  checkConflicts(row, col, value) {
    this.state.conflictCells.clear();
    
    if (!this.state.grid.isValid(row, col, value)) {
      // Get all conflicting cells
      const conflicts = this.state.grid.getConflicts(row, col, value);
      
      // Add the current cell and all conflicts to the set
      this.state.conflictCells.add(`${row},${col}`);
      conflicts.forEach(cell => {
        this.state.conflictCells.add(`${cell.row},${cell.col}`);
      });
      
      // Increment error count
      this.state.errors++;
    }
  }
  
  /**
   * Update highlighted cells based on selected cell (Requirement 5.1)
   * 
   * @private
   */
  updateHighlightedCells() {
    this.state.highlightedCells.clear();
    
    if (!this.state.highlightSameNumbers) {
      return;
    }
    
    const { row, col } = this.state.selectedCell;
    
    if (row === null || col === null) {
      return;
    }
    
    const value = this.state.grid.getValue(row, col);
    
    // Only highlight if cell has a value (Requirement 5.1)
    if (value === 0) {
      return;
    }
    
    // Find all cells with the same value
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.state.grid.getValue(r, c) === value) {
          this.state.highlightedCells.add(`${r},${c}`);
        }
      }
    }
  }

  /**
   * Handle game completion (Requirement 11.2, 11.3)
   * 
   * @private
   */
  handleGameCompletion() {
    // Check if the solution is correct
    if (!this.state.grid.isCorrect()) {
      return;
    }
    
    // Stop the timer
    this.state.timer.pause();
    const completionTime = this.state.timer.getElapsedTime();
    
    // Update status
    this.state.status = GameStatus.COMPLETED;
    
    // Record statistics
    this.statisticsTracker.recordGameComplete(
      this.state.difficulty,
      completionTime,
      this.state.errors,
      this.state.hintsUsed
    );
    
    // Check for new record (Requirement 11.3)
    const stats = this.statisticsTracker.getStats(this.state.difficulty);
    const isNewRecord = stats.bestTime === completionTime;
    
    // Check achievements
    const gameData = {
      gamesCompleted: stats.completed,
      gamesPlayed: stats.played,
      errors: this.state.errors,
      hintsUsed: this.state.hintsUsed,
      difficulty: this.state.difficulty,
      time: completionTime,
      perfectGames: this.state.errors === 0 && this.state.hintsUsed === 0 ? 1 : 0,
      currentStreak: 1, // This should be tracked separately
      difficultyStats: this.statisticsTracker.getAllStats()
    };
    
    const newAchievements = this.achievementSystem.checkAchievements(gameData);
    
    // Save statistics
    this.storageManager.saveStatistics(this.statisticsTracker.toJSON());
    
    // Mark daily challenge as completed if in daily challenge mode
    if (this.state.mode === GameMode.DAILY_CHALLENGE) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      this.dailyChallenge.recordCompletion(today, completionTime, this.state.hintsUsed);
    }
    
    // Clear saved game state (Requirement 6.3)
    this.storageManager.remove('gameState');
    
    // Emit completion event (Requirement 11.2)
    this.eventBus.emit(Events.GAME_COMPLETED, {
      difficulty: this.state.difficulty,
      time: completionTime,
      errors: this.state.errors,
      hintsUsed: this.state.hintsUsed,
      isNewRecord,
      newAchievements
    });
    
    console.log(`Game completed in ${completionTime}s (${this.state.difficulty})`);
  }

  /**
   * Schedule auto-save with debouncing (Requirement 19.4)
   * 
   * @private
   */
  scheduleAutoSave() {
    this.debouncedSave();
  }
  
  /**
   * Save the current game state (Requirement 6.1)
   */
  saveGame() {
    if (!this.state.grid || this.state.status === GameStatus.COMPLETED) {
      return;
    }
    
    try {
      const gameState = {
        puzzle: this.state.grid.puzzle,
        solution: this.state.grid.solution,
        current: this.state.grid.current,
        notes: this.state.grid.notes,
        fixed: this.state.grid.fixed,
        elapsedTime: this.state.timer.getElapsedTime(),
        errors: this.state.errors,
        hintsUsed: this.state.hintsUsed,
        difficulty: this.state.difficulty,
        noteMode: this.state.noteMode,
        selectedCell: this.state.selectedCell
      };
      
      this.storageManager.saveGameState(gameState);
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'saveGame' });
    }
  }
  
  /**
   * Restore a saved game (Requirement 6.2)
   * 
   * @private
   */
  restoreGame() {
    try {
      const savedState = this.storageManager.loadGameState();
      
      if (!savedState) {
        return false;
      }
      
      // Restore grid
      this.state.grid = GridModel.fromJSON({
        puzzle: savedState.puzzle,
        solution: savedState.solution,
        current: savedState.current,
        notes: savedState.notes
      });
      this.grid = this.state.grid; // Alias for easier access
      
      // Restore history (empty for now, could be saved in future)
      this.state.history = new HistoryManager();
      
      // Restore hint system
      this.state.hintSystem = new HintSystem(this.state.grid);
      this.state.hintSystem.hintsUsed = savedState.hintsUsed;
      
      // Restore timer
      this.state.timer = Timer.fromJSON({
        elapsedTime: savedState.elapsedTime,
        isRunning: false
      });
      
      // Restore game state
      this.state.difficulty = savedState.difficulty;
      this.state.errors = savedState.errors;
      this.state.hintsUsed = savedState.hintsUsed;
      this.state.noteMode = savedState.noteMode || false;
      this.state.selectedCell = savedState.selectedCell || { row: null, col: null };
      this.state.status = GameStatus.PLAYING;
      
      console.log('Game restored from saved state');
      
      return true;
    } catch (error) {
      ErrorHandler.logError(error, { operation: 'restoreGame' });
      return false;
    }
  }

  /**
   * Load settings from storage
   * 
   * @private
   */
  loadSettings() {
    const settings = this.storageManager.loadSettings();
    
    this.state.autoCheck = settings.autoCheck;
    this.state.highlightSameNumbers = settings.highlightSameNumbers;
  }
  
  /**
   * Update settings
   * 
   * @param {Object} settings - Settings to update
   */
  updateSettings(settings) {
    if (settings.autoCheck !== undefined) {
      this.state.autoCheck = settings.autoCheck;
    }
    
    if (settings.highlightSameNumbers !== undefined) {
      this.state.highlightSameNumbers = settings.highlightSameNumbers;
      this.updateHighlightedCells();
    }
    
    // Save settings
    this.storageManager.saveSettings({
      ...this.storageManager.loadSettings(),
      ...settings
    });
    
    this.eventBus.emit(Events.SETTINGS_CHANGED, settings);
  }
  
  /**
   * Pause the game
   */
  pauseGame() {
    if (this.state.timer && this.state.status === GameStatus.PLAYING) {
      this.state.timer.pause();
      this.state.status = GameStatus.PAUSED;
      
      this.eventBus.emit('game_paused', {});
    }
  }
  
  /**
   * Resume the game
   */
  resumeGame() {
    if (this.state.timer && this.state.status === GameStatus.PAUSED) {
      this.state.timer.resume();
      this.state.status = GameStatus.PLAYING;
      
      this.eventBus.emit('game_resumed', {});
    }
  }
  
  /**
   * Get current game state
   * 
   * @returns {Object} Current game state
   */
  getGameState() {
    return {
      mode: this.state.mode,
      difficulty: this.state.difficulty,
      status: this.state.status,
      errors: this.state.errors,
      hintsUsed: this.state.hintsUsed,
      noteMode: this.state.noteMode,
      autoCheck: this.state.autoCheck,
      highlightSameNumbers: this.state.highlightSameNumbers,
      selectedCell: { ...this.state.selectedCell },
      elapsedTime: this.state.timer ? this.state.timer.getElapsedTime() : 0,
      canUndo: this.state.history ? this.state.history.canUndo() : false,
      canRedo: this.state.history ? this.state.history.canRedo() : false,
      hasActiveGame: this.hasActiveGame()
    };
  }

  /**
   * Get the current game state
   * 
   * @returns {Object} Current game state
   */
  getState() {
    return {
      mode: this.state.mode,
      difficulty: this.state.difficulty,
      status: this.state.status,
      selectedCell: { ...this.state.selectedCell },
      errors: this.state.errors,
      hintsUsed: this.state.hintsUsed,
      noteMode: this.state.noteMode,
      autoCheck: this.state.autoCheck,
      highlightSameNumbers: this.state.highlightSameNumbers,
      elapsedTime: this.state.timer ? this.state.timer.getElapsedTime() : 0,
      isComplete: this.state.grid ? this.state.grid.isComplete() : false,
      canUndo: this.state.history ? this.state.history.canUndo() : false,
      canRedo: this.state.history ? this.state.history.canRedo() : false,
      conflictCells: Array.from(this.state.conflictCells),
      highlightedCells: Array.from(this.state.highlightedCells)
    };
  }
  
  /**
   * Get the grid model
   * 
   * @returns {GridModel|null} Grid model instance
   */
  getGrid() {
    return this.state.grid;
  }
  
  /**
   * Get the statistics tracker
   * 
   * @returns {StatisticsTracker} Statistics tracker instance
   */
  getStatistics() {
    return this.statistics;
  }
  
  /**
   * Get the achievement system
   * 
   * @returns {AchievementSystem} Achievement system instance
   */
  getAchievements() {
    return this.achievements;
  }
  
  /**
   * Get the event bus
   * 
   * @returns {EventBus} Event bus instance
   */
  getEventBus() {
    return this.eventBus;
  }
  
  /**
   * Check if a game is currently active
   * 
   * @returns {boolean} True if a game is active
   */
  hasActiveGame() {
    return this.state.grid !== null && this.state.status !== GameStatus.COMPLETED;
  }
  
  /**
   * Destroy the controller and clean up resources
   */
  destroy() {
    // Save current game if active
    if (this.hasActiveGame()) {
      this.saveGame();
    }
    
    // Clear event listeners
    this.eventBus.clear();
    
    console.log('GameController destroyed');
  }
}
