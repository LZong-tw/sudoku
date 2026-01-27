/**
 * @fileoverview AchievementView - UI component for displaying achievements
 * @module ui/achievement-view
 */

/**
 * AchievementView class manages the visual representation of achievements
 * 
 * Responsibilities:
 * - Display all achievements (unlocked and locked)
 * - Display achievement progress
 * - Implement achievement unlock notification
 * 
 * Requirements: 14.2, 14.3
 * 
 * @class AchievementView
 */
export class AchievementView {
  /**
   * Creates a new AchievementView instance
   * 
   * @param {HTMLElement} container - Container element for the achievement view
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
    this.notificationTimeout = null;
    
    this.initialize();
  }

  /**
   * Initializes the achievement view component
   * @private
   */
  initialize() {
    // Subscribe to achievement unlock events
    this.eventBus.on('achievement_unlocked', (data) => {
      this.showUnlockNotification(data.achievement);
    });
  }

  /**
   * Shows the achievement view with current achievements data
   * 
   * @param {Array<Object>} achievements - Array of achievement objects from AchievementSystem.getAllAchievements()
   * @param {number} overallProgress - Overall completion percentage (0-100)
   * 
   * Requirement 14.3: Display all achievements (unlocked and locked)
   */
  show(achievements, overallProgress = 0) {
    if (!achievements || !Array.isArray(achievements)) {
      throw new Error('Achievements array is required');
    }

    this.isVisible = true;
    this.render(achievements, overallProgress);
    this.attachEventListeners();
  }

  /**
   * Renders the achievement view HTML structure
   * 
   * @param {Array<Object>} achievements - Array of achievement objects
   * @param {number} overallProgress - Overall completion percentage
   * @private
   */
  render(achievements, overallProgress) {
    // Clear container
    this.container.innerHTML = '';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'achievement-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'achievement-title');
    
    // Create view container
    this.viewElement = document.createElement('div');
    this.viewElement.className = 'achievement-view';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'achievement-header';
    
    const title = document.createElement('h2');
    title.id = 'achievement-title';
    title.className = 'achievement-title';
    title.textContent = '🏆 成就系統';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'achievement-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close achievements');
    closeButton.setAttribute('tabindex', '0');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    this.viewElement.appendChild(header);
    
    // Create overall progress section
    const progressSection = this.createOverallProgressSection(achievements, overallProgress);
    this.viewElement.appendChild(progressSection);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'achievement-content';
    
    // Separate unlocked and locked achievements
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    
    // Unlocked achievements section (Requirement 14.3)
    if (unlocked.length > 0) {
      content.appendChild(this.createAchievementSection('已解鎖', unlocked, true));
    }
    
    // Locked achievements section (Requirement 14.3)
    if (locked.length > 0) {
      content.appendChild(this.createAchievementSection('未解鎖', locked, false));
    }
    
    this.viewElement.appendChild(content);
    
    // Create footer with close button
    const footer = document.createElement('div');
    footer.className = 'achievement-footer';
    
    const closeFooterButton = document.createElement('button');
    closeFooterButton.className = 'achievement-button';
    closeFooterButton.textContent = '關閉';
    closeFooterButton.setAttribute('aria-label', 'Close achievements');
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
   * Creates the overall progress section
   * 
   * @param {Array<Object>} achievements - Array of all achievements
   * @param {number} overallProgress - Overall completion percentage
   * @returns {HTMLElement} Overall progress section element
   * @private
   */
  createOverallProgressSection(achievements, overallProgress) {
    const section = document.createElement('div');
    section.className = 'achievement-overall-progress';
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', 'Overall achievement progress');
    
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    
    const progressText = document.createElement('div');
    progressText.className = 'achievement-progress-text';
    progressText.textContent = `完成度：${unlockedCount} / ${totalCount} (${overallProgress}%)`;
    
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'achievement-progress-bar-container';
    progressBarContainer.setAttribute('role', 'progressbar');
    progressBarContainer.setAttribute('aria-valuenow', overallProgress);
    progressBarContainer.setAttribute('aria-valuemin', '0');
    progressBarContainer.setAttribute('aria-valuemax', '100');
    progressBarContainer.setAttribute('aria-label', `Achievement completion: ${overallProgress}%`);
    
    const progressBar = document.createElement('div');
    progressBar.className = 'achievement-progress-bar';
    progressBar.style.width = `${overallProgress}%`;
    
    progressBarContainer.appendChild(progressBar);
    
    section.appendChild(progressText);
    section.appendChild(progressBarContainer);
    
    return section;
  }

  /**
   * Creates an achievement section (unlocked or locked)
   * 
   * @param {string} sectionTitle - Title for the section
   * @param {Array<Object>} achievements - Array of achievements for this section
   * @param {boolean} isUnlocked - Whether this is the unlocked section
   * @returns {HTMLElement} Achievement section element
   * @private
   */
  createAchievementSection(sectionTitle, achievements, isUnlocked) {
    const section = document.createElement('div');
    section.className = `achievement-section achievement-section-${isUnlocked ? 'unlocked' : 'locked'}`;
    section.setAttribute('role', 'region');
    section.setAttribute('aria-label', `${sectionTitle} achievements`);
    
    const title = document.createElement('h3');
    title.className = 'achievement-section-title';
    title.textContent = `${sectionTitle} (${achievements.length})`;
    section.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'achievement-grid';
    
    // Create achievement cards (Requirement 14.3)
    for (const achievement of achievements) {
      grid.appendChild(this.createAchievementCard(achievement));
    }
    
    section.appendChild(grid);
    
    return section;
  }

  /**
   * Creates an achievement card element
   * 
   * @param {Object} achievement - Achievement object
   * @param {string} achievement.id - Achievement ID
   * @param {string} achievement.title - Achievement title
   * @param {string} achievement.description - Achievement description
   * @param {string} achievement.icon - Achievement icon/emoji
   * @param {boolean} achievement.unlocked - Whether achievement is unlocked
   * @param {Date|null} achievement.unlockedAt - When achievement was unlocked
   * @param {number} achievement.progress - Progress percentage (0-100)
   * @returns {HTMLElement} Achievement card element
   * @private
   */
  createAchievementCard(achievement) {
    const card = document.createElement('div');
    card.className = `achievement-card${achievement.unlocked ? ' achievement-card-unlocked' : ' achievement-card-locked'}`;
    card.dataset.achievementId = achievement.id;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${achievement.title}: ${achievement.description}`);
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'achievement-card-icon';
    icon.textContent = achievement.icon;
    icon.setAttribute('aria-hidden', 'true');
    
    // Content
    const content = document.createElement('div');
    content.className = 'achievement-card-content';
    
    // Title
    const title = document.createElement('div');
    title.className = 'achievement-card-title';
    title.textContent = achievement.title;
    
    // Description
    const description = document.createElement('div');
    description.className = 'achievement-card-description';
    description.textContent = achievement.description;
    
    content.appendChild(title);
    content.appendChild(description);
    
    // Progress bar for locked achievements (Requirement 14.3: Display achievement progress)
    if (!achievement.unlocked && achievement.progress > 0) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'achievement-card-progress-container';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'achievement-card-progress-bar';
      progressBar.style.width = `${achievement.progress}%`;
      
      const progressText = document.createElement('div');
      progressText.className = 'achievement-card-progress-text';
      progressText.textContent = `${Math.round(achievement.progress)}%`;
      
      progressContainer.appendChild(progressBar);
      content.appendChild(progressContainer);
      content.appendChild(progressText);
    }
    
    // Unlock date for unlocked achievements
    if (achievement.unlocked && achievement.unlockedAt) {
      const unlockDate = document.createElement('div');
      unlockDate.className = 'achievement-card-unlock-date';
      unlockDate.textContent = `解鎖於：${this.formatDate(achievement.unlockedAt)}`;
      content.appendChild(unlockDate);
    }
    
    card.appendChild(icon);
    card.appendChild(content);
    
    return card;
  }

  /**
   * Shows an achievement unlock notification
   * 
   * @param {Object} achievement - Unlocked achievement object
   * 
   * Requirement 14.2: Display notification when achievement unlocked
   */
  showUnlockNotification(achievement) {
    if (!achievement) return;
    
    // Clear any existing notification
    this.hideUnlockNotification();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'achievement-notification-icon';
    icon.textContent = achievement.icon;
    icon.setAttribute('aria-hidden', 'true');
    
    // Content
    const content = document.createElement('div');
    content.className = 'achievement-notification-content';
    
    const header = document.createElement('div');
    header.className = 'achievement-notification-header';
    header.textContent = '🎉 成就解鎖！';
    
    const title = document.createElement('div');
    title.className = 'achievement-notification-title';
    title.textContent = achievement.title;
    
    const description = document.createElement('div');
    description.className = 'achievement-notification-description';
    description.textContent = achievement.description;
    
    content.appendChild(header);
    content.appendChild(title);
    content.appendChild(description);
    
    notification.appendChild(icon);
    notification.appendChild(content);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('achievement-notification-show');
    }, 10);
    
    // Store reference
    this.currentNotification = notification;
    
    // Auto-hide after 5 seconds
    this.notificationTimeout = setTimeout(() => {
      this.hideUnlockNotification();
    }, 5000);
    
    // Allow manual dismiss by clicking
    notification.addEventListener('click', () => {
      this.hideUnlockNotification();
    });
  }

  /**
   * Hides the current achievement unlock notification
   * @private
   */
  hideUnlockNotification() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
    
    if (this.currentNotification) {
      this.currentNotification.classList.remove('achievement-notification-show');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (this.currentNotification && this.currentNotification.parentNode) {
          this.currentNotification.parentNode.removeChild(this.currentNotification);
        }
        this.currentNotification = null;
      }, 300);
    }
  }

  /**
   * Attaches event listeners to the achievement view
   * @private
   */
  attachEventListeners() {
    // Close button in header
    const closeButton = this.viewElement.querySelector('.achievement-close');
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
   * Updates the achievement view with new data
   * 
   * @param {Array<Object>} achievements - Updated achievements array
   * @param {number} overallProgress - Updated overall progress percentage
   */
  update(achievements, overallProgress = 0) {
    if (!achievements || !Array.isArray(achievements)) {
      throw new Error('Achievements array is required');
    }

    if (!this.isVisible) {
      return;
    }

    // Re-render with new data
    this.render(achievements, overallProgress);
  }

  /**
   * Hides the achievement view
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
   * Formats a date object to a readable string
   * 
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   * @private
   */
  formatDate(date) {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Traps focus within the achievement dialog for accessibility
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
   * Checks if the achievement view is currently visible
   * 
   * @returns {boolean} True if visible, false otherwise
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Destroys the achievement view and cleans up all resources
   */
  destroy() {
    this.cleanup();
    this.hideUnlockNotification();
    
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
