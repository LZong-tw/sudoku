/**
 * @fileoverview VictoryAnimation - UI component for displaying victory celebration
 * @module ui/victory-animation
 */

import { Events } from '../utils/event-bus.js';

/**
 * VictoryAnimation class manages the victory celebration display
 * 
 * Responsibilities:
 * - Display victory animation effect (CSS animation or JavaScript animation)
 * - Show completion time, error count, hints used
 * - Show new record notation (if applicable)
 * - Provide start new game button
 * - Provide view statistics button
 * - Allow closing/skipping animation
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 * 
 * @class VictoryAnimation
 */
export class VictoryAnimation {
  /**
   * Creates a new VictoryAnimation instance
   * 
   * @param {HTMLElement} container - Container element for the victory animation
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
    this.animationElement = null;
    this.isVisible = false;
    this.animationTimeout = null;
    
    this.initialize();
  }

  /**
   * Initializes the victory animation component
   * @private
   */
  initialize() {
    // Component will be rendered when show() is called
  }

  /**
   * Shows the victory animation with game completion data
   * 
   * @param {Object} data - Game completion data
   * @param {number} data.time - Completion time in seconds
   * @param {number} data.errors - Number of errors made
   * @param {number} data.hintsUsed - Number of hints used
   * @param {string} data.difficulty - Difficulty level
   * @param {boolean} [data.isNewRecord=false] - Whether this is a new record
   * @param {number} [data.previousBest=null] - Previous best time (if applicable)
   * 
   * Requirement 11.1: Display victory animation
   * Requirement 11.2: Display completion time, error count, hints used
   * Requirement 11.3: Display new record notation
   */
  show(data) {
    if (!data) {
      throw new Error('Game completion data is required');
    }

    this.isVisible = true;
    this.render(data);
    this.attachEventListeners();
    this.startAnimation();
  }

  /**
   * Renders the victory animation HTML structure
   * 
   * @param {Object} data - Game completion data
   * @private
   */
  render(data) {
    // Clear container
    this.container.innerHTML = '';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'victory-title');
    
    // Create animation container
    this.animationElement = document.createElement('div');
    this.animationElement.className = 'victory-animation';
    
    // Create confetti/celebration effect container
    const celebrationContainer = document.createElement('div');
    celebrationContainer.className = 'victory-celebration';
    celebrationContainer.setAttribute('aria-hidden', 'true');
    this.createConfettiEffect(celebrationContainer);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'victory-content';
    
    // Title
    const title = document.createElement('h1');
    title.id = 'victory-title';
    title.className = 'victory-title';
    title.textContent = '🎉 恭喜完成！';
    content.appendChild(title);
    
    // New record badge (Requirement 11.3)
    if (data.isNewRecord) {
      const recordBadge = document.createElement('div');
      recordBadge.className = 'victory-record-badge';
      recordBadge.innerHTML = '⭐ 新記錄！⭐';
      recordBadge.setAttribute('role', 'status');
      recordBadge.setAttribute('aria-live', 'polite');
      content.appendChild(recordBadge);
    }
    
    // Stats container (Requirement 11.2)
    const statsContainer = document.createElement('div');
    statsContainer.className = 'victory-stats';
    statsContainer.setAttribute('role', 'region');
    statsContainer.setAttribute('aria-label', 'Game statistics');
    
    // Time stat
    statsContainer.appendChild(this.createStatItem(
      '⏱️',
      '完成時間',
      this.formatTime(data.time),
      data.isNewRecord ? 'record' : ''
    ));
    
    // Errors stat
    statsContainer.appendChild(this.createStatItem(
      '❌',
      '錯誤次數',
      data.errors.toString(),
      data.errors === 0 ? 'perfect' : ''
    ));
    
    // Hints stat
    statsContainer.appendChild(this.createStatItem(
      '💡',
      '使用提示',
      data.hintsUsed.toString(),
      data.hintsUsed === 0 ? 'perfect' : ''
    ));
    
    content.appendChild(statsContainer);
    
    // Previous best time (if new record)
    if (data.isNewRecord && data.previousBest !== null && data.previousBest !== Infinity) {
      const improvement = document.createElement('div');
      improvement.className = 'victory-improvement';
      improvement.textContent = `比上次快了 ${this.formatTime(data.previousBest - data.time)}！`;
      content.appendChild(improvement);
    }
    
    // Perfect game message
    if (data.errors === 0 && data.hintsUsed === 0) {
      const perfectMessage = document.createElement('div');
      perfectMessage.className = 'victory-perfect-message';
      perfectMessage.textContent = '✨ 完美遊戲！無錯誤無提示！✨';
      content.appendChild(perfectMessage);
    }
    
    // Buttons container (Requirement 11.4, 11.5)
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'victory-buttons';
    
    // New game button (Requirement 11.4)
    const newGameButton = document.createElement('button');
    newGameButton.className = 'victory-button victory-button-primary';
    newGameButton.textContent = '開始新遊戲';
    newGameButton.setAttribute('aria-label', 'Start a new game');
    newGameButton.setAttribute('tabindex', '0');
    newGameButton.dataset.action = 'new-game';
    
    // View statistics button (Requirement 11.4)
    const statsButton = document.createElement('button');
    statsButton.className = 'victory-button victory-button-secondary';
    statsButton.textContent = '查看統計';
    statsButton.setAttribute('aria-label', 'View game statistics');
    statsButton.setAttribute('tabindex', '0');
    statsButton.dataset.action = 'view-stats';
    
    // Close button (Requirement 11.5)
    const closeButton = document.createElement('button');
    closeButton.className = 'victory-button victory-button-text';
    closeButton.textContent = '關閉';
    closeButton.setAttribute('aria-label', 'Close victory screen');
    closeButton.setAttribute('tabindex', '0');
    closeButton.dataset.action = 'close';
    
    buttonsContainer.appendChild(newGameButton);
    buttonsContainer.appendChild(statsButton);
    buttonsContainer.appendChild(closeButton);
    
    content.appendChild(buttonsContainer);
    
    // Skip animation hint
    const skipHint = document.createElement('div');
    skipHint.className = 'victory-skip-hint';
    skipHint.textContent = '按 ESC 鍵跳過動畫';
    skipHint.setAttribute('aria-live', 'polite');
    content.appendChild(skipHint);
    
    // Assemble the structure
    this.animationElement.appendChild(celebrationContainer);
    this.animationElement.appendChild(content);
    overlay.appendChild(this.animationElement);
    this.container.appendChild(overlay);
    
    this.overlay = overlay;
  }

  /**
   * Creates a stat item element
   * 
   * @param {string} icon - Icon/emoji for the stat
   * @param {string} label - Label text
   * @param {string} value - Value text
   * @param {string} [modifier=''] - Optional CSS modifier class
   * @returns {HTMLElement} Stat item element
   * @private
   */
  createStatItem(icon, label, value, modifier = '') {
    const item = document.createElement('div');
    item.className = `victory-stat-item${modifier ? ' victory-stat-' + modifier : ''}`;
    
    const iconElement = document.createElement('span');
    iconElement.className = 'victory-stat-icon';
    iconElement.textContent = icon;
    iconElement.setAttribute('aria-hidden', 'true');
    
    const labelElement = document.createElement('span');
    labelElement.className = 'victory-stat-label';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('span');
    valueElement.className = 'victory-stat-value';
    valueElement.textContent = value;
    
    item.appendChild(iconElement);
    item.appendChild(labelElement);
    item.appendChild(valueElement);
    
    return item;
  }

  /**
   * Creates confetti/celebration visual effect
   * 
   * @param {HTMLElement} container - Container for confetti elements
   * @private
   */
  createConfettiEffect(container) {
    // Create multiple confetti pieces with random properties
    const confettiCount = 50;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random properties for variety
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 3;
      const animationDuration = 2 + Math.random() * 2;
      const size = 5 + Math.random() * 10;
      
      confetti.style.cssText = `
        left: ${left}%;
        background-color: ${color};
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        width: ${size}px;
        height: ${size}px;
      `;
      
      container.appendChild(confetti);
    }
  }

  /**
   * Starts the victory animation sequence
   * 
   * Requirement 11.1: Victory animation effect
   * @private
   */
  startAnimation() {
    // Show overlay with fade-in
    this.overlay.style.display = 'flex';
    
    // Trigger animation by adding class after a brief delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.overlay.classList.add('visible');
        this.animationElement.classList.add('animate');
      });
    });
    
    // Focus the first button for accessibility
    setTimeout(() => {
      const firstButton = this.animationElement.querySelector('.victory-button-primary');
      if (firstButton) {
        firstButton.focus();
      }
    }, 500);
    
    // Trap focus within the dialog
    this.trapFocus();
  }

  /**
   * Attaches event listeners to the victory animation
   * @private
   */
  attachEventListeners() {
    // Button clicks
    const buttons = this.animationElement.querySelectorAll('.victory-button');
    buttons.forEach(button => {
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });
    
    // Keyboard events (Requirement 11.5: ESC to skip)
    this.keydownHandler = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.keydownHandler);
    
    // Overlay click to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  }

  /**
   * Handles button click events
   * 
   * @param {MouseEvent} event - Click event
   * @private
   */
  handleButtonClick(event) {
    const button = event.target.closest('.victory-button');
    if (!button) return;
    
    const action = button.dataset.action;
    
    switch (action) {
      case 'new-game':
        // Emit new game event (Requirement 11.4)
        this.eventBus.emit('new_game_requested');
        this.hide();
        break;
      
      case 'view-stats':
        // Emit view statistics event (Requirement 11.4)
        this.eventBus.emit('view_statistics_requested');
        this.hide();
        break;
      
      case 'close':
        // Close the victory screen (Requirement 11.5)
        this.hide();
        break;
    }
  }

  /**
   * Handles keyboard events
   * 
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  handleKeyDown(event) {
    if (!this.isVisible) return;
    
    // ESC to skip/close animation (Requirement 11.5)
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
    }
  }

  /**
   * Hides the victory animation
   * 
   * Requirement 11.5: Close/skip animation functionality
   */
  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    
    // Remove animation classes
    if (this.overlay) {
      this.overlay.classList.remove('visible');
      this.animationElement.classList.remove('animate');
    }
    
    // Hide after animation completes
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      this.cleanup();
    }, 300);
  }

  /**
   * Cleans up event listeners and timers
   * @private
   */
  cleanup() {
    // Remove keyboard event listener
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    
    // Clear animation timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
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
    if (seconds < 0) {
      return '00:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Traps focus within the victory dialog for accessibility
   * @private
   */
  trapFocus() {
    const focusableElements = this.animationElement.querySelectorAll(
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
    
    this.animationElement.addEventListener('keydown', this.focusTrapHandler);
  }

  /**
   * Removes focus trap
   * @private
   */
  removeFocusTrap() {
    if (this.focusTrapHandler && this.animationElement) {
      this.animationElement.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }

  /**
   * Checks if the victory animation is currently visible
   * 
   * @returns {boolean} True if visible, false otherwise
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Destroys the victory animation and cleans up all resources
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
    this.animationElement = null;
    this.overlay = null;
  }
}
