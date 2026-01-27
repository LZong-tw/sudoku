/**
 * @fileoverview Main application entry point
 * @module main
 */

import { ErrorHandler } from './utils/error-handler.js';
import { EventBus } from './utils/event-bus.js';
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
      this.soundManager = new SoundManager(this.gameController.storageManager);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load saved game or start new game
      await this.gameController.initialize();
      
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
        <header class="app-header">
          <h1 class="app-title">數獨遊戲</h1>
          <div class="app-header-controls">
            <button id="daily-challenge-btn" class="header-btn" aria-label="Daily Challenge">
              📅
            </button>
            <button id="achievements-btn" class="header-btn" aria-label="Achievements">
              🏆
            </button>
            <button id="statistics-btn" class="header-btn" aria-label="Statistics">
              📊
            </button>
            <button id="settings-btn" class="header-btn" aria-label="Settings">
              ⚙️
            </button>
          </div>
        </header>

        <!-- Game Info Panel -->
        <div class="game-info-panel" role="status" aria-live="polite">
          <div class="info-item">
            <span class="info-label">難度：</span>
            <span id="difficulty-display" class="info-value" aria-label="Difficulty">中等</span>
          </div>
          <div class="info-item">
            <span class="info-label">時間：</span>
            <span id="timer-display" class="info-value" aria-label="Time elapsed">00:00</span>
          </div>
          <div class="info-item">
            <span class="info-label">錯誤：</span>
            <span id="errors-display" class="info-value" aria-label="Errors">0</span>
          </div>
          <div class="info-item">
            <span class="info-label">提示：</span>
            <span id="hints-display" class="info-value" aria-label="Hints used">0</span>
          </div>
        </div>
        
        <!-- Screen reader announcements (Requirement 17.3, 17.4) -->
        <div id="sr-announcements" class="sr-only" role="status" aria-live="assertive" aria-atomic="true"></div>

        <!-- Main Game Area -->
        <main class="game-main">
          <!-- Grid Container -->
          <div id="grid-container" class="grid-container"></div>

          <!-- Keypad Container -->
          <div id="keypad-container" class="keypad-container"></div>
        </main>

        <!-- Game Controls -->
        <div class="game-controls">
          <button id="new-game-btn" class="control-btn">
            新遊戲
          </button>
          <button id="pause-btn" class="control-btn">
            暫停
          </button>
          <button id="check-btn" class="control-btn">
            檢查
          </button>
        </div>

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

    document.getElementById('pause-btn')?.addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('check-btn')?.addEventListener('click', () => {
      this.checkSolution();
    });

    // Event bus listeners
    this.eventBus.on('new_game_requested', () => {
      this.startNewGame();
    });

    this.eventBus.on('view_statistics_requested', () => {
      this.showStatistics();
    });

    this.eventBus.on('daily_challenge_start', () => {
      this.startDailyChallenge();
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
      // Show difficulty selection dialog
      const difficulty = prompt('選擇難度 (easy/medium/hard):', 'medium');
      if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
        this.gameController.startNewGame(difficulty);
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
      this.gameController.checkSolution();
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
