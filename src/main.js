/**
 * @fileoverview Main application entry point
 * @module main
 */

import { ErrorHandler } from './utils/error-handler.js';
import { EventBus, Events } from './utils/event-bus.js';
import { SoundManager } from './utils/sound-manager.js';
import { GameController } from './game-controller.js';
import { GridView } from './ui/grid-view.js';
import { KeypadView } from './ui/keypad-view.js';
import { SettingsPanel } from './ui/settings-panel.js';
import { VictoryAnimation } from './ui/victory-animation.js';
import { StatisticsView } from './ui/statistics-view.js';
import { AchievementView } from './ui/achievement-view.js';
import { DailyChallengeView } from './ui/daily-challenge-view.js';
import { ThemeManager } from './ui/theme-manager.js';

/**
 * Main application class
 */
class SudokuApp {
  constructor() {
    this.eventBus = null;
    this.gameController = null;
    this.themeManager = null;
    this.ui = {};
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Sudoku application...');
      
      // Initialize error handler first
      ErrorHandler.init();
      
      // Create global event bus
      this.eventBus = new EventBus();
      window.eventBus = this.eventBus;
      
      // Create UI structure
      this.createUIStructure();
      
      // Initialize theme manager
      this.themeManager = new ThemeManager(this.eventBus);
      
      // Initialize UI components
      this.initializeUIComponents();
      
      // Initialize game controller
      this.gameController = new GameController(this.eventBus);
      
      // Initialize sound manager (after game controller for storage access)
      this.soundManager = new SoundManager(this.gameController.storageManager, this.eventBus);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load saved game or start new game
      if (!this.gameController.restoreGame()) {
        this.gameController.startNewGame('easy');
      }
      
      // Update grid view with initial state
      this.updateGridView();
      
      // Start timer update interval
      this.timerInterval = setInterval(() => {
        this.updateInfoPanel();
      }, 1000);
      
      // Keyboard input
      document.addEventListener('keydown', (e) => this.handleKeyboard(e));
      
      // Mobile: scroll to grid after load
      if (window.innerWidth < 600) {
        setTimeout(() => {
          document.getElementById('grid-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      
      console.log('Sudoku application initialized successfully');
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to initialize application');
    }
  }

  /**
   * Creates the main UI structure
   */
  createUIStructure() {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App container not found');
    }

    app.innerHTML = `
      <div class="sudoku-app">
        <!-- Header -->
        <div class="app-header">
          <h1 class="app-title">數獨遊戲</h1>
          <div class="header-buttons">
            <button id="daily-challenge-btn" class="header-btn" title="每日挑戰">📅</button>
            <button id="achievements-btn" class="header-btn" title="成就">🏆</button>
            <button id="statistics-btn" class="header-btn" title="統計">📊</button>
            <button id="settings-btn" class="header-btn" title="設定">⚙️</button>
          </div>
        </div>
        
        <!-- Screen reader announcements -->
        <div id="sr-announcements" class="sr-only" role="status" aria-live="assertive" aria-atomic="true"></div>

        <!-- Container: Info + Grid side by side -->
        <div class="game-container">
          <!-- Game Info Panel -->
          <div class="game-info-panel" role="status" aria-live="polite">
            <div class="info-item">
              <span class="info-label">難度</span>
              <span id="difficulty-display" class="info-value">簡單</span>
            </div>
            <div class="info-item">
              <span class="info-label">時間</span>
              <span id="timer-display" class="info-value">00:00</span>
            </div>
            <div class="info-item">
              <span class="info-label">錯誤</span>
              <span id="errors-display" class="info-value">0</span>
            </div>
            <div class="info-item">
              <span class="info-label">進度</span>
              <span id="progress-display" class="info-value">0%</span>
            </div>
          </div>

          <!-- Grid Container -->
          <div id="grid-container" class="grid-container"></div>
        </div>

        <!-- Game Controls -->
        <div class="game-controls">
          <select id="difficulty-select" class="difficulty-select">
            <option value="easy">簡單</option>
            <option value="medium">中等</option>
            <option value="hard">困難</option>
          </select>
          <button id="new-game-btn" class="control-btn">新遊戲</button>
          <button id="check-btn" class="control-btn">檢查</button>
        </div>

        <!-- Keypad Container -->
        <div id="keypad-container" class="keypad-container"></div>

        <!-- Modal Containers -->
        <div id="settings-container"></div>
        <div id="victory-container"></div>
        <div id="statistics-container"></div>
        <div id="achievements-container"></div>
        <div id="daily-challenge-container"></div>
      </div>
    `;
  }

  /**
   * Initialize UI components
   */
  initializeUIComponents() {
    // Grid View
    const gridContainer = document.getElementById('grid-container');
    this.ui.gridView = new GridView(gridContainer, this.eventBus);

    // Keypad View
    const keypadContainer = document.getElementById('keypad-container');
    this.ui.keypadView = new KeypadView(keypadContainer, this.eventBus);

    // Settings Panel
    const settingsContainer = document.getElementById('settings-container');
    this.ui.settingsPanel = new SettingsPanel(settingsContainer, this.eventBus);

    // Victory Animation
    const victoryContainer = document.getElementById('victory-container');
    this.ui.victoryAnimation = new VictoryAnimation(victoryContainer, this.eventBus);

    // Statistics View
    const statisticsContainer = document.getElementById('statistics-container');
    this.ui.statisticsView = new StatisticsView(statisticsContainer, this.eventBus);

    // Achievement View
    const achievementsContainer = document.getElementById('achievements-container');
    this.ui.achievementView = new AchievementView(achievementsContainer, this.eventBus);

    // Daily Challenge View
    const dailyChallengeContainer = document.getElementById('daily-challenge-container');
    this.ui.dailyChallengeView = new DailyChallengeView(dailyChallengeContainer, this.eventBus);
  }

  /**
   * Set up event listeners for UI controls
   */
  setupEventListeners() {
    // Header buttons
    document.getElementById('daily-challenge-btn')?.addEventListener('click', () => {
      this.showDailyChallenge();
    });

    document.getElementById('achievements-btn')?.addEventListener('click', () => {
      this.showAchievements();
    });

    document.getElementById('statistics-btn')?.addEventListener('click', () => {
      this.showStatistics();
    });

    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.ui.settingsPanel.show();
    });

    // Game control buttons
    document.getElementById('new-game-btn')?.addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('check-btn')?.addEventListener('click', () => {
      this.checkSolution();
    });

    // Event bus listeners
    this.eventBus.on('new_game_requested', () => {
      this.startNewGame();
    });

    this.eventBus.on('game_started', () => {
      this.updateGridView();
      this.updateInfoPanel();
    });

    this.eventBus.on('view_statistics_requested', () => {
      this.showStatistics();
    });

    this.eventBus.on('daily_challenge_start', () => {
      this.startDailyChallenge();
    });

    // Game completed
    this.eventBus.on('game_completed', () => {
      this.updateGridView();
      setTimeout(() => {
        alert('🎉 恭喜！數獨完成！');
      }, 100);
    });

    // Keypad number input
    this.eventBus.on('keypad_input', (data) => {
      if (this.gameController) {
        this.gameController.inputNumber(data.value);
        this.updateGridView();
        this.updateInfoPanel();
      }
    });

    // Game state changed (from gameController)
    this.eventBus.on(Events.VALUE_CHANGED, () => {
      this.updateGridView();
      this.updateInfoPanel();
    });

    this.eventBus.on(Events.CELL_SELECTED, (data) => {
      if (this.gameController) {
        this.gameController.selectCell(data.row, data.col);
      }
    });

    this.eventBus.on(Events.UNDO, () => {
      if (this.gameController) {
        this.gameController.undo();
        this.updateGridView();
      }
    });

    this.eventBus.on(Events.REDO, () => {
      if (this.gameController) {
        this.gameController.redo();
        this.updateGridView();
      }
    });

    this.eventBus.on(Events.NOTE_TOGGLED, (data) => {
      if (this.gameController) {
        const { row, col } = this.gameController.state.selectedCell || {};
        if (row != null && col != null) {
          this.gameController.toggleNote(row, col, data.value);
          this.updateGridView();
        }
      }
    });

    this.eventBus.on(Events.HINT_USED, () => {
      if (this.gameController) {
        this.gameController.useHint();
        this.updateGridView();
      }
    });
  }

  /**
   * Show daily challenge view
   */
  showDailyChallenge() {
    if (this.gameController) {
      const todayChallenge = this.gameController.dailyChallenge.getTodayChallenge();
      const history = this.gameController.dailyChallenge.getHistory();
      const statistics = this.gameController.dailyChallenge.getStatistics();
      
      this.ui.dailyChallengeView.show(todayChallenge, history, statistics);
    }
  }

  /**
   * Show achievements view
   */
  showAchievements() {
    if (this.gameController) {
      const achievements = this.gameController.achievementSystem.getAllAchievements();
      const progress = this.gameController.achievementSystem.getProgress();
      
      this.ui.achievementView.show(achievements, progress);
    }
  }

  /**
   * Show statistics view
   */
  showStatistics() {
    if (this.gameController) {
      const stats = this.gameController.statisticsTracker.getAllStats();
      this.ui.statisticsView.show(stats);
    }
  }

  /**
   * Start a new game
   */
  startNewGame() {
    if (this.gameController) {
      const select = document.getElementById('difficulty-select');
      const difficulty = select ? select.value : 'easy';
      this.gameController.startNewGame(difficulty);
      this.updateGridView();
      this.updateInfoPanel();
    }
  }

  /**
   * Update grid view with current game state
   */
  updateGridView() {
    if (this.gameController && this.ui.gridView) {
      const grid = this.gameController.getGrid();
      if (grid) {
        // Build grid data with validation
        const current = [];
        const fixed = new Set();
        const notes = [];
        const errors = new Set();
        
        for (let r = 0; r < 9; r++) {
          current[r] = [];
          notes[r] = [];
          for (let c = 0; c < 9; c++) {
            const value = grid.getValue(r, c);
            current[r][c] = value;
            notes[r][c] = grid.getNotes(r, c);
            if (grid.isFixed(r, c)) {
              fixed.add(`${r},${c}`);
            }
            // Check if value is wrong
            if (value && !grid.isFixed(r, c) && grid.solution && value !== grid.solution[r][c]) {
              errors.add(`${r},${c}`);
            }
          }
        }
        
        this.ui.gridView.updateGrid({ current, fixed, notes, errors });
      }
    }
  }

  /**
   * Update info panel with current game state
   */
  updateInfoPanel() {
    if (this.gameController) {
      const state = this.gameController.getState();
      const difficultyMap = { easy: '簡單', medium: '中等', hard: '困難' };
      
      const diffDisplay = document.getElementById('difficulty-display');
      if (diffDisplay) diffDisplay.textContent = difficultyMap[state.difficulty] || state.difficulty;
      
      const errorsDisplay = document.getElementById('errors-display');
      if (errorsDisplay) errorsDisplay.textContent = state.errors || 0;
      
      // Update timer
      const timerDisplay = document.getElementById('timer-display');
      if (timerDisplay) {
        const seconds = state.elapsedTime || 0;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      
      // Update progress
      const progressDisplay = document.getElementById('progress-display');
      if (progressDisplay && this.gameController.getGrid()) {
        const grid = this.gameController.getGrid();
        let filled = 0;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (grid.getValue(r, c)) filled++;
          }
        }
        progressDisplay.textContent = Math.round(filled / 81 * 100) + '%';
      }
    }
  }

  /**
   * Start daily challenge
   */
  startDailyChallenge() {
    if (this.gameController) {
      this.gameController.startDailyChallenge();
    }
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.gameController) {
      this.gameController.togglePause();
      const pauseBtn = document.getElementById('pause-btn');
      if (pauseBtn) {
        pauseBtn.textContent = this.gameController.isPaused() ? '繼續' : '暫停';
      }
    }
  }

  /**
   * Check solution
   */
  checkSolution() {
    if (this.gameController) {
      const results = this.gameController.checkSolution();
      this.updateGridView();
      
      // Show feedback
      if (results && results.length > 0) {
        const correct = results.filter(r => r.isCorrect).length;
        const wrong = results.filter(r => !r.isCorrect).length;
        if (wrong === 0) {
          alert(`✅ 全部正確！(${correct} 格)`);
        } else {
          alert(`❌ 有 ${wrong} 格錯誤`);
        }
      } else {
        alert('請先填入一些數字');
      }
    }
  }

  /**
   * Handle keyboard input
   */
  handleKeyboard(e) {
    if (!this.gameController) return;
    
    // Numbers 1-9
    if (e.key >= '1' && e.key <= '9') {
      this.gameController.inputNumber(parseInt(e.key));
      this.updateGridView();
      this.updateInfoPanel();
    }
    // Delete/Backspace
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      this.gameController.inputNumber(0);
      this.updateGridView();
      this.updateInfoPanel();
    }
    // Arrow keys
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const state = this.gameController.getState();
      let { row, col } = state.selectedCell;
      if (e.key === 'ArrowUp' && row > 0) row--;
      else if (e.key === 'ArrowDown' && row < 8) row++;
      else if (e.key === 'ArrowLeft' && col > 0) col--;
      else if (e.key === 'ArrowRight' && col < 8) col++;
      this.gameController.selectCell(row, col);
      this.updateGridView();
    }
  }
}

/**
 * Initialize the application when DOM is ready
 */
function init() {
  const app = new SudokuApp();
  app.init();
  
  // Make app globally accessible for debugging
  window.sudokuApp = app;
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
