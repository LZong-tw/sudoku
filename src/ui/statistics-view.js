/**
 * @fileoverview StatisticsView - UI component for displaying game statistics
 * @module ui/statistics-view
 */

/**
 * StatisticsView class manages the visual representation of game statistics
 * 
 * Responsibilities:
 * - Display total games, average time, best time, win rate
 * - Display statistics by difficulty level
 * - Implement statistics data updates
 * 
 * Requirements: 7.3
 * 
 * @class StatisticsView
 */
export class StatisticsView {
  /**
   * Creates a new StatisticsView instance
   * 
   * @param {HTMLElement} container - Container element for the statistics view
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
   * Initializes the statistics view component
   * @private
   */
  initialize() {
    // Component will be rendered when show() is called
  }

  /**
   * Shows the statistics view with current statistics data
   * 
   * @param {Object} stats - Statistics data from StatisticsTracker.getAllStats()
   * @param {Object} stats.easy - Easy difficulty statistics
   * @param {Object} stats.medium - Medium difficulty statistics
   * @param {Object} stats.hard - Hard difficulty statistics
   * @param {Object} stats.overall - Overall statistics across all difficulties
   * 
   * Requirement 7.3: Display statistics
   */
  show(stats) {
    if (!stats) {
      throw new Error('Statistics data is required');
    }

    this.isVisible = true;
    this.render(stats);
    this.attachEventListeners();
  }

  /**
   * Renders the statistics view HTML structure
   * 
   * @param {Object} stats - Statistics data
   * @private
   */
  render(stats) {
    // Clear container
    this.container.innerHTML = '';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'statistics-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'statistics-title');
    
    // Create view container
    this.viewElement = document.createElement('div');
    this.viewElement.className = 'statistics-view';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'statistics-header';
    
    const title = document.createElement('h2');
    title.id = 'statistics-title';
    title.className = 'statistics-title';
    title.textContent = '📊 遊戲統計';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'statistics-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close statistics');
    closeButton.setAttribute('tabindex', '0');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    this.viewElement.appendChild(header);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'statistics-content';
    
    // Overall statistics section (Requirement 7.3)
    content.appendChild(this.createOverallSection(stats.overall));
    
    // Difficulty-specific statistics sections (Requirement 7.3)
    content.appendChild(this.createDifficultySection('簡單', 'easy', stats.easy));
    content.appendChild(this.createDifficultySection('中等', 'medium', stats.medium));
    content.appendChild(this.createDifficultySection('困難', 'hard', stats.hard));
    
    this.viewElement.appendChild(content);
    
    // Create footer with close button
    const footer = document.createElement('div');
    footer.className = 'statistics-footer';
    
    const closeFooterButton = document.createElement('button');
    closeFooterButton.className = 'statistics-button';
    closeFooterButton.textContent = '關閉';
    closeFooterButton.setAttribute('aria-label', 'Close statistics');
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
   * Creates the overall statistics section
   * 
   * @param {Object} overall - Overall statistics data
   * @param {number} overall.played - Total games played
   * @param {number} overall.completed - Total games completed
   * @param {number} overall.averageTime - Average completion time in seconds
   * @param {number} overall.winRate - Win rate as percentage
   * @returns {HTMLElement} Overall statistics section element
   * @private
   */
  createOverallSection(overall) {
    const section = document.createElement('div');
    section.className = 'statistics-section statistics-overall';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', 'Overall statistics');
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'statistics-section-title';
    sectionTitle.textContent = '總體統計';
    section.appendChild(sectionTitle);
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'statistics-grid';
    
    // Total games played (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '🎮',
      '總遊戲數',
      overall.played.toString(),
      'total-games'
    ));
    
    // Total games completed (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '✅',
      '完成遊戲',
      overall.completed.toString(),
      'completed-games'
    ));
    
    // Average time (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '⏱️',
      '平均時間',
      this.formatTime(overall.averageTime),
      'average-time'
    ));
    
    // Win rate (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '🏆',
      '勝率',
      `${overall.winRate.toFixed(1)}%`,
      'win-rate'
    ));
    
    section.appendChild(statsGrid);
    
    return section;
  }

  /**
   * Creates a difficulty-specific statistics section
   * 
   * @param {string} label - Display label for the difficulty
   * @param {string} difficulty - Difficulty identifier ('easy', 'medium', 'hard')
   * @param {Object} stats - Statistics data for this difficulty
   * @param {number} stats.played - Games played
   * @param {number} stats.completed - Games completed
   * @param {number} stats.averageTime - Average completion time in seconds
   * @param {number|null} stats.bestTime - Best completion time in seconds (null if none)
   * @param {number} stats.winRate - Win rate as percentage
   * @returns {HTMLElement} Difficulty statistics section element
   * @private
   */
  createDifficultySection(label, difficulty, stats) {
    const section = document.createElement('div');
    section.className = `statistics-section statistics-difficulty statistics-${difficulty}`;
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', `${label} difficulty statistics`);
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'statistics-section-title';
    sectionTitle.textContent = `${label}難度`;
    section.appendChild(sectionTitle);
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'statistics-grid statistics-grid-compact';
    
    // Games played (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '🎮',
      '遊戲數',
      stats.played.toString(),
      `${difficulty}-played`,
      true
    ));
    
    // Games completed (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '✅',
      '完成',
      stats.completed.toString(),
      `${difficulty}-completed`,
      true
    ));
    
    // Average time (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '⏱️',
      '平均',
      stats.completed > 0 ? this.formatTime(stats.averageTime) : '--:--',
      `${difficulty}-average`,
      true
    ));
    
    // Best time (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '⭐',
      '最佳',
      stats.bestTime !== null ? this.formatTime(stats.bestTime) : '--:--',
      `${difficulty}-best`,
      true
    ));
    
    // Win rate (Requirement 7.3)
    statsGrid.appendChild(this.createStatCard(
      '🏆',
      '勝率',
      `${stats.winRate.toFixed(1)}%`,
      `${difficulty}-winrate`,
      true
    ));
    
    section.appendChild(statsGrid);
    
    return section;
  }

  /**
   * Creates a statistics card element
   * 
   * @param {string} icon - Icon/emoji for the stat
   * @param {string} label - Label text
   * @param {string} value - Value text
   * @param {string} id - Unique identifier for the card
   * @param {boolean} [compact=false] - Whether to use compact layout
   * @returns {HTMLElement} Stat card element
   * @private
   */
  createStatCard(icon, label, value, id, compact = false) {
    const card = document.createElement('div');
    card.className = `statistics-card${compact ? ' statistics-card-compact' : ''}`;
    card.dataset.statId = id;
    
    const iconElement = document.createElement('div');
    iconElement.className = 'statistics-card-icon';
    iconElement.textContent = icon;
    iconElement.setAttribute('aria-hidden', 'true');
    
    const contentElement = document.createElement('div');
    contentElement.className = 'statistics-card-content';
    
    const labelElement = document.createElement('div');
    labelElement.className = 'statistics-card-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'statistics-card-value';
    valueElement.textContent = value;
    
    contentElement.appendChild(labelElement);
    contentElement.appendChild(valueElement);
    
    card.appendChild(iconElement);
    card.appendChild(contentElement);
    
    return card;
  }

  /**
   * Attaches event listeners to the statistics view
   * @private
   */
  attachEventListeners() {
    // Close button in header
    const closeButton = this.viewElement.querySelector('.statistics-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
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
   * Updates the statistics view with new data
   * 
   * @param {Object} stats - Updated statistics data
   * 
   * Requirement 7.3: Implement statistics data updates
   */
  update(stats) {
    if (!stats) {
      throw new Error('Statistics data is required');
    }

    if (!this.isVisible) {
      return;
    }

    // Re-render with new data
    this.render(stats);
  }

  /**
   * Hides the statistics view
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
   * Traps focus within the statistics dialog for accessibility
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
   * Checks if the statistics view is currently visible
   * 
   * @returns {boolean} True if visible, false otherwise
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Destroys the statistics view and cleans up all resources
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
