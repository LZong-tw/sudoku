/**
 * @fileoverview DailyChallengeView - UI component for displaying daily challenges
 * @module ui/daily-challenge-view
 */

/**
 * DailyChallengeView class manages the visual representation of daily challenges
 * 
 * Responsibilities:
 * - Display today's challenge puzzle
 * - Display daily challenge history/calendar
 * - Implement challenge completion marking
 * 
 * Requirements: 13.2, 13.5
 * 
 * @class DailyChallengeView
 */
export class DailyChallengeView {
  /**
   * Creates a new DailyChallengeView instance
   * 
   * @param {HTMLElement} container - Container element for the daily challenge view
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
    this.viewElement = null;
    this.isVisible = false;
    
    this.initialize();
  }

  /**
   * Initializes the daily challenge view component
   * @private
   */
  initialize() {
    // Component will be rendered when show() is called
  }

  /**
   * Shows the daily challenge view with current challenge data
   * 
   * @param {Object} todayChallenge - Today's challenge data from DailyChallenge.getTodayChallenge()
   * @param {Array<Object>} history - Challenge history from DailyChallenge.getHistory()
   * @param {Object} statistics - Challenge statistics from DailyChallenge.getStatistics()
   * 
   * Requirement 13.2: Display today's challenge
   * Requirement 13.5: Display daily challenge history
   */
  show(todayChallenge, history = [], statistics = null) {
    if (!todayChallenge) {
      throw new Error('Today\'s challenge data is required');
    }

    this.isVisible = true;
    this.render(todayChallenge, history, statistics);
    this.attachEventListeners();
  }

  /**
   * Renders the daily challenge view HTML structure
   * 
   * @param {Object} todayChallenge - Today's challenge data
   * @param {Array<Object>} history - Challenge history
   * @param {Object} statistics - Challenge statistics
   * @private
   */
  render(todayChallenge, history, statistics) {
    // Clear container
    this.container.innerHTML = '';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'daily-challenge-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'daily-challenge-title');
    
    // Create view container
    this.viewElement = document.createElement('div');
    this.viewElement.className = 'daily-challenge-view';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'daily-challenge-header';
    
    const title = document.createElement('h2');
    title.id = 'daily-challenge-title';
    title.className = 'daily-challenge-title';
    title.textContent = '📅 每日挑戰';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'daily-challenge-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close daily challenge');
    closeButton.setAttribute('tabindex', '0');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    this.viewElement.appendChild(header);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'daily-challenge-content';
    
    // Today's challenge section (Requirement 13.2)
    content.appendChild(this.createTodayChallengeSection(todayChallenge));
    
    // Statistics section
    if (statistics) {
      content.appendChild(this.createStatisticsSection(statistics));
    }
    
    // History/Calendar section (Requirement 13.5)
    if (history && history.length > 0) {
      content.appendChild(this.createHistorySection(history));
    }
    
    this.viewElement.appendChild(content);
    
    // Create footer with buttons
    const footer = document.createElement('div');
    footer.className = 'daily-challenge-footer';
    
    // Play today's challenge button (if not completed)
    if (!todayChallenge.completed) {
      const playButton = document.createElement('button');
      playButton.className = 'daily-challenge-button daily-challenge-button-primary';
      playButton.textContent = '開始今日挑戰';
      playButton.setAttribute('aria-label', 'Start today\'s challenge');
      playButton.setAttribute('tabindex', '0');
      playButton.dataset.action = 'play';
      footer.appendChild(playButton);
    }
    
    const closeFooterButton = document.createElement('button');
    closeFooterButton.className = 'daily-challenge-button';
    closeFooterButton.textContent = '關閉';
    closeFooterButton.setAttribute('aria-label', 'Close daily challenge');
    closeFooterButton.setAttribute('tabindex', '0');
    closeFooterButton.dataset.action = 'close';
    
    footer.appendChild(closeFooterButton);
    this.viewElement.appendChild(footer);
    
    // Assemble the structure
    overlay.appendChild(this.viewElement);
    this.container.appendChild(overlay);
    
    this.overlay = overlay;
    
    // Show overlay
    this.overlay.style.display = 'flex';
    
    // Focus the close button for accessibility
    setTimeout(() => {
      closeButton.focus();
    }, 100);
    
    // Trap focus within the dialog
    this.trapFocus();
  }

  /**
   * Creates the today's challenge section
   * 
   * @param {Object} todayChallenge - Today's challenge data
   * @param {string} todayChallenge.date - Date string (YYYY-MM-DD)
   * @param {string} todayChallenge.difficulty - Difficulty level
   * @param {boolean} todayChallenge.completed - Whether completed
   * @param {Object|null} todayChallenge.completion - Completion data if completed
   * @returns {HTMLElement} Today's challenge section element
   * @private
   * 
   * Requirement 13.2: Display today's challenge puzzle
   */
  createTodayChallengeSection(todayChallenge) {
    const section = document.createElement('div');
    section.className = 'daily-challenge-section daily-challenge-today';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', 'Today\'s challenge');
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'daily-challenge-section-title';
    sectionTitle.textContent = '今日挑戰';
    section.appendChild(sectionTitle);
    
    // Challenge card
    const card = document.createElement('div');
    card.className = `daily-challenge-card${todayChallenge.completed ? ' daily-challenge-card-completed' : ''}`;
    
    // Date display
    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'daily-challenge-date';
    dateDisplay.textContent = this.formatDateDisplay(todayChallenge.date);
    card.appendChild(dateDisplay);
    
    // Difficulty badge
    const difficultyBadge = document.createElement('div');
    difficultyBadge.className = `daily-challenge-difficulty daily-challenge-difficulty-${todayChallenge.difficulty}`;
    difficultyBadge.textContent = this.getDifficultyLabel(todayChallenge.difficulty);
    card.appendChild(difficultyBadge);
    
    // Status
    const status = document.createElement('div');
    status.className = 'daily-challenge-status';
    
    if (todayChallenge.completed) {
      // Completed status (Requirement 13.5: Challenge completion marking)
      status.innerHTML = '✅ <strong>已完成</strong>';
      
      // Completion details
      if (todayChallenge.completion) {
        const details = document.createElement('div');
        details.className = 'daily-challenge-completion-details';
        
        const time = document.createElement('div');
        time.className = 'daily-challenge-detail';
        time.innerHTML = `⏱️ 時間：<strong>${this.formatTime(todayChallenge.completion.time)}</strong>`;
        details.appendChild(time);
        
        const hints = document.createElement('div');
        hints.className = 'daily-challenge-detail';
        hints.innerHTML = `💡 提示：<strong>${todayChallenge.completion.hintsUsed}</strong>`;
        details.appendChild(hints);
        
        card.appendChild(details);
      }
    } else {
      // Not completed status
      status.innerHTML = '⏳ <strong>待完成</strong>';
      
      const description = document.createElement('div');
      description.className = 'daily-challenge-description';
      description.textContent = '挑戰今日的數獨謎題，與全球玩家一較高下！';
      card.appendChild(description);
    }
    
    card.appendChild(status);
    section.appendChild(card);
    
    return section;
  }

  /**
   * Creates the statistics section
   * 
   * @param {Object} statistics - Challenge statistics
   * @param {number} statistics.totalCompleted - Total challenges completed
   * @param {number} statistics.currentStreak - Current consecutive day streak
   * @param {number} statistics.longestStreak - Longest consecutive day streak
   * @param {number} statistics.averageTime - Average completion time
   * @param {number} statistics.bestTime - Best completion time
   * @param {number} statistics.perfectDays - Days completed without hints
   * @returns {HTMLElement} Statistics section element
   * @private
   */
  createStatisticsSection(statistics) {
    const section = document.createElement('div');
    section.className = 'daily-challenge-section daily-challenge-statistics';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', 'Challenge statistics');
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'daily-challenge-section-title';
    sectionTitle.textContent = '挑戰統計';
    section.appendChild(sectionTitle);
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'daily-challenge-stats-grid';
    
    // Total completed
    statsGrid.appendChild(this.createStatCard(
      '✅',
      '完成總數',
      statistics.totalCompleted.toString(),
      'total-completed'
    ));
    
    // Current streak
    statsGrid.appendChild(this.createStatCard(
      '🔥',
      '當前連勝',
      `${statistics.currentStreak} 天`,
      'current-streak'
    ));
    
    // Longest streak
    statsGrid.appendChild(this.createStatCard(
      '🏆',
      '最長連勝',
      `${statistics.longestStreak} 天`,
      'longest-streak'
    ));
    
    // Average time
    if (statistics.totalCompleted > 0) {
      statsGrid.appendChild(this.createStatCard(
        '⏱️',
        '平均時間',
        this.formatTime(statistics.averageTime),
        'average-time'
      ));
    }
    
    // Best time
    if (statistics.bestTime !== Infinity) {
      statsGrid.appendChild(this.createStatCard(
        '⭐',
        '最佳時間',
        this.formatTime(statistics.bestTime),
        'best-time'
      ));
    }
    
    // Perfect days
    if (statistics.perfectDays > 0) {
      statsGrid.appendChild(this.createStatCard(
        '💯',
        '完美挑戰',
        `${statistics.perfectDays} 天`,
        'perfect-days'
      ));
    }
    
    section.appendChild(statsGrid);
    
    return section;
  }

  /**
   * Creates the history/calendar section
   * 
   * @param {Array<Object>} history - Array of completion records
   * @returns {HTMLElement} History section element
   * @private
   * 
   * Requirement 13.5: Display daily challenge history/calendar
   */
  createHistorySection(history) {
    const section = document.createElement('div');
    section.className = 'daily-challenge-section daily-challenge-history';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', 'Challenge history');
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'daily-challenge-section-title';
    sectionTitle.textContent = '挑戰歷史';
    section.appendChild(sectionTitle);
    
    // Create calendar/history list
    const historyList = document.createElement('div');
    historyList.className = 'daily-challenge-history-list';
    
    // Show recent history (last 30 days or all if less)
    const recentHistory = history.slice(0, 30);
    
    for (const record of recentHistory) {
      historyList.appendChild(this.createHistoryCard(record));
    }
    
    section.appendChild(historyList);
    
    return section;
  }

  /**
   * Creates a history card for a completed challenge
   * 
   * @param {Object} record - Completion record
   * @param {string} record.date - Date string (YYYY-MM-DD)
   * @param {string} record.difficulty - Difficulty level
   * @param {number} record.time - Completion time in seconds
   * @param {number} record.hintsUsed - Number of hints used
   * @returns {HTMLElement} History card element
   * @private
   * 
   * Requirement 13.5: Display daily challenge history with completion marking
   */
  createHistoryCard(record) {
    const card = document.createElement('div');
    card.className = 'daily-challenge-history-card';
    card.dataset.date = record.date;
    
    // Date
    const date = document.createElement('div');
    date.className = 'daily-challenge-history-date';
    date.textContent = this.formatDateDisplay(record.date);
    card.appendChild(date);
    
    // Difficulty badge
    const difficulty = document.createElement('div');
    difficulty.className = `daily-challenge-history-difficulty daily-challenge-difficulty-${record.difficulty}`;
    difficulty.textContent = this.getDifficultyLabel(record.difficulty);
    card.appendChild(difficulty);
    
    // Details
    const details = document.createElement('div');
    details.className = 'daily-challenge-history-details';
    
    const time = document.createElement('span');
    time.className = 'daily-challenge-history-time';
    time.textContent = `⏱️ ${this.formatTime(record.time)}`;
    details.appendChild(time);
    
    const hints = document.createElement('span');
    hints.className = 'daily-challenge-history-hints';
    hints.textContent = `💡 ${record.hintsUsed}`;
    details.appendChild(hints);
    
    // Perfect badge if no hints used
    if (record.hintsUsed === 0) {
      const perfect = document.createElement('span');
      perfect.className = 'daily-challenge-history-perfect';
      perfect.textContent = '💯';
      perfect.setAttribute('title', '完美完成');
      details.appendChild(perfect);
    }
    
    card.appendChild(details);
    
    return card;
  }

  /**
   * Creates a statistics card element
   * 
   * @param {string} icon - Icon/emoji for the stat
   * @param {string} label - Label text
   * @param {string} value - Value text
   * @param {string} id - Unique identifier for the card
   * @returns {HTMLElement} Stat card element
   * @private
   */
  createStatCard(icon, label, value, id) {
    const card = document.createElement('div');
    card.className = 'daily-challenge-stat-card';
    card.dataset.statId = id;
    
    const iconElement = document.createElement('div');
    iconElement.className = 'daily-challenge-stat-icon';
    iconElement.textContent = icon;
    iconElement.setAttribute('aria-hidden', 'true');
    
    const contentElement = document.createElement('div');
    contentElement.className = 'daily-challenge-stat-content';
    
    const labelElement = document.createElement('div');
    labelElement.className = 'daily-challenge-stat-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'daily-challenge-stat-value';
    valueElement.textContent = value;
    
    contentElement.appendChild(labelElement);
    contentElement.appendChild(valueElement);
    
    card.appendChild(iconElement);
    card.appendChild(contentElement);
    
    return card;
  }

  /**
   * Attaches event listeners to the daily challenge view
   * @private
   */
  attachEventListeners() {
    // Close button in header
    const closeButton = this.viewElement.querySelector('.daily-challenge-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
    }
    
    // Play button
    const playButton = this.viewElement.querySelector('[data-action="play"]');
    if (playButton) {
      playButton.addEventListener('click', () => {
        this.eventBus.emit('daily_challenge_start');
        this.hide();
      });
    }
    
    // Close button in footer
    const footerButton = this.viewElement.querySelector('[data-action="close"]');
    if (footerButton) {
      footerButton.addEventListener('click', () => this.hide());
    }
    
    // Overlay click to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // Keyboard events - Escape to close
    this.keydownHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        e.preventDefault();
        this.hide();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Updates the daily challenge view with new data
   * 
   * @param {Object} todayChallenge - Updated today's challenge data
   * @param {Array<Object>} history - Updated challenge history
   * @param {Object} statistics - Updated challenge statistics
   */
  update(todayChallenge, history = [], statistics = null) {
    if (!todayChallenge) {
      throw new Error('Today\'s challenge data is required');
    }

    if (!this.isVisible) {
      return;
    }

    // Re-render with new data
    this.render(todayChallenge, history, statistics);
  }

  /**
   * Hides the daily challenge view
   */
  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    
    // Hide overlay
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    
    this.cleanup();
  }

  /**
   * Cleans up event listeners
   * @private
   */
  cleanup() {
    // Remove keyboard event listener
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    
    // Remove focus trap
    this.removeFocusTrap();
  }

  /**
   * Formats time in seconds to MM:SS format
   * 
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   * @private
   */
  formatTime(seconds) {
    if (seconds < 0 || !isFinite(seconds)) {
      return '00:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Formats a date string for display
   * 
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {string} Formatted date string
   * @private
   */
  formatDateDisplay(dateString) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Get day of week
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const dayOfWeek = dayNames[date.getDay()];
    
    return `${year}年${month}月${day}日 ${dayOfWeek}`;
  }

  /**
   * Gets the display label for a difficulty level
   * 
   * @param {string} difficulty - Difficulty identifier
   * @returns {string} Display label
   * @private
   */
  getDifficultyLabel(difficulty) {
    const labels = {
      'easy': '簡單',
      'medium': '中等',
      'hard': '困難'
    };
    
    return labels[difficulty] || difficulty;
  }

  /**
   * Traps focus within the daily challenge dialog for accessibility
   * @private
   */
  trapFocus() {
    const focusableElements = this.viewElement.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    this.viewElement.addEventListener('keydown', this.focusTrapHandler);
  }

  /**
   * Removes focus trap
   * @private
   */
  removeFocusTrap() {
    if (this.focusTrapHandler && this.viewElement) {
      this.viewElement.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }

  /**
   * Checks if the daily challenge view is currently visible
   * 
   * @returns {boolean} True if visible, false otherwise
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Destroys the daily challenge view and cleans up all resources
   */
  destroy() {
    this.cleanup();
    
    if (this.overlay) {
      // Remove all event listeners by cloning and replacing
      const newOverlay = this.overlay.cloneNode(true);
      if (this.overlay.parentNode) {
        this.overlay.parentNode.replaceChild(newOverlay, this.overlay);
      }
    }
    
    this.container.innerHTML = '';
    this.viewElement = null;
    this.overlay = null;
  }
}
