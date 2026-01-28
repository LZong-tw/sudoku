/**
 * @fileoverview SettingsPanel - UI component for rendering and managing the settings panel
 * @module ui/settings-panel
 */

import { Events } from '../utils/event-bus.js';

/**
 * SettingsPanel class manages the visual representation of the settings panel
 * 
 * Responsibilities:
 * - Render settings panel HTML structure
 * - Implement theme toggle control
 * - Implement auto-check toggle
 * - Implement sound toggle
 * - Implement other settings options (highlight same numbers, show timer, etc.)
 * - Implement reset statistics button
 * - Implement settings change event handling
 * - Implement immediate settings application
 * 
 * @class SettingsPanel
 */
export class SettingsPanel {
  /**
   * Creates a new SettingsPanel instance
   * 
   * @param {HTMLElement} container - Container element for the settings panel
   * @param {EventBus} eventBus - Event bus for communication
   * @param {Object} [initialSettings=null] - Initial settings values
   */
  constructor(container, eventBus, initialSettings = null) {
    if (!container) {
      throw new Error('Container element is required');
    }
    if (!eventBus) {
      throw new Error('EventBus is required');
    }

    this.container = container;
    this.eventBus = eventBus;
    this.panelElement = null;
    this.controls = {};
    
    // Current settings state (Requirement 9.1)
    this.settings = {
      theme: 'light',
      autoCheck: true,
      soundEnabled: false,
      highlightSameNumbers: true,
      showTimer: true,
      showErrors: true,
      ...initialSettings
    };
    
    this.isVisible = false;
    
    this.initialize();
  }

  /**
   * Initializes the settings panel
   * @private
   */
  initialize() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renders the settings panel HTML structure (Requirement 9.1)
   * 
   * Creates a modal-style settings panel with all configurable options
   */
  render() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create panel overlay
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.style.display = 'none';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'settings-title');
    
    // Create panel element
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'settings-panel';
    
    // Create panel header
    const header = document.createElement('div');
    header.className = 'settings-header';
    
    const title = document.createElement('h2');
    title.id = 'settings-title';
    title.textContent = '設定';
    title.className = 'settings-title';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'settings-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close settings');
    closeButton.setAttribute('tabindex', '0');
    
    header.appendChild(title);
    header.appendChild(closeButton);
    this.panelElement.appendChild(header);
    
    // Create panel content
    const content = document.createElement('div');
    content.className = 'settings-content';
    
    // Theme toggle (Requirement 9.2)
    content.appendChild(this.createThemeControl());
    
    // Auto-check toggle (Requirement 9.2)
    content.appendChild(this.createToggleControl(
      'autoCheck',
      '自動檢查',
      'Automatically check for rule violations',
      this.settings.autoCheck
    ));
    
    // Sound toggle (Requirement 9.2)
    content.appendChild(this.createToggleControl(
      'soundEnabled',
      '音效',
      'Enable sound effects',
      this.settings.soundEnabled
    ));
    
    // Highlight same numbers toggle (Requirement 9.2)
    content.appendChild(this.createToggleControl(
      'highlightSameNumbers',
      '標示相同數字',
      'Highlight cells with the same number',
      this.settings.highlightSameNumbers
    ));
    
    // Show timer toggle (Requirement 9.2)
    content.appendChild(this.createToggleControl(
      'showTimer',
      '顯示計時器',
      'Show game timer',
      this.settings.showTimer
    ));
    
    // Show errors toggle (Requirement 9.2)
    content.appendChild(this.createToggleControl(
      'showErrors',
      '顯示錯誤計數',
      'Show error count',
      this.settings.showErrors
    ));
    
    this.panelElement.appendChild(content);
    
    // Create panel footer with reset button (Requirement 9.5)
    const footer = document.createElement('div');
    footer.className = 'settings-footer';
    
    const resetButton = document.createElement('button');
    resetButton.className = 'settings-reset-button';
    resetButton.textContent = '重置統計資料';
    resetButton.setAttribute('aria-label', 'Reset all statistics');
    resetButton.setAttribute('tabindex', '0');
    this.controls.resetButton = resetButton;
    
    footer.appendChild(resetButton);
    this.panelElement.appendChild(footer);
    
    overlay.appendChild(this.panelElement);
    this.container.appendChild(overlay);
    
    this.overlay = overlay;
  }

  /**
   * Creates a theme toggle control (Requirement 9.2)
   * 
   * @returns {HTMLElement} Theme control element
   * @private
   */
  createThemeControl() {
    const control = document.createElement('div');
    control.className = 'settings-control';
    
    const label = document.createElement('label');
    label.className = 'settings-label';
    label.textContent = '主題';
    label.setAttribute('for', 'theme-select');
    
    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'settings-select-wrapper';
    
    const select = document.createElement('select');
    select.id = 'theme-select';
    select.className = 'settings-select';
    select.setAttribute('aria-label', 'Select theme');
    
    const lightOption = document.createElement('option');
    lightOption.value = 'light';
    lightOption.textContent = '亮色';
    
    const darkOption = document.createElement('option');
    darkOption.value = 'dark';
    darkOption.textContent = '暗色';
    
    select.appendChild(lightOption);
    select.appendChild(darkOption);
    select.value = this.settings.theme;
    
    selectWrapper.appendChild(select);
    
    control.appendChild(label);
    control.appendChild(selectWrapper);
    
    this.controls.theme = select;
    
    return control;
  }

  /**
   * Creates a toggle control (switch) for a boolean setting
   * 
   * @param {string} id - Setting identifier
   * @param {string} labelText - Label text
   * @param {string} ariaLabel - Accessible label
   * @param {boolean} checked - Initial checked state
   * @returns {HTMLElement} Toggle control element
   * @private
   */
  createToggleControl(id, labelText, ariaLabel, checked) {
    const control = document.createElement('div');
    control.className = 'settings-control';
    
    const label = document.createElement('label');
    label.className = 'settings-label';
    label.textContent = labelText;
    label.setAttribute('for', `setting-${id}`);
    
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'settings-toggle-wrapper';
    
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = `setting-${id}`;
    toggle.className = 'settings-toggle';
    toggle.checked = checked;
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-label', ariaLabel);
    toggle.setAttribute('aria-checked', checked ? 'true' : 'false');
    toggle.dataset.setting = id;
    
    const slider = document.createElement('span');
    slider.className = 'settings-toggle-slider';
    
    toggleWrapper.appendChild(toggle);
    toggleWrapper.appendChild(slider);
    
    control.appendChild(label);
    control.appendChild(toggleWrapper);
    
    this.controls[id] = toggle;
    
    return control;
  }

  /**
   * Attaches event listeners to the settings panel
   * @private
   */
  attachEventListeners() {
    // Close button
    const closeButton = this.panelElement.querySelector('.settings-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
    }
    
    // Overlay click to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // Theme select change (Requirement 9.3)
    if (this.controls.theme) {
      this.controls.theme.addEventListener('change', (e) => {
        this.handleThemeChange(e.target.value);
      });
    }
    
    // Toggle controls change (Requirement 9.3)
    Object.keys(this.controls).forEach(key => {
      if (key !== 'theme' && key !== 'resetButton') {
        const control = this.controls[key];
        control.addEventListener('change', (e) => {
          this.handleToggleChange(key, e.target.checked);
        });
      }
    });
    
    // Reset button (Requirement 9.5)
    if (this.controls.resetButton) {
      this.controls.resetButton.addEventListener('click', () => {
        this.handleResetStatistics();
      });
    }
    
    // Keyboard navigation - Escape to close
    this.overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });
  }

  /**
   * Handles theme change (Requirement 9.3)
   * Immediately applies the theme and emits event
   * 
   * @param {string} theme - New theme value ('light' or 'dark')
   * @private
   */
  handleThemeChange(theme) {
    this.settings.theme = theme;
    
    // Emit theme changed event (Requirement 9.3)
    this.eventBus.emit(Events.THEME_CHANGED, { theme });
    
    // Emit settings changed event (Requirement 9.4)
    this.eventBus.emit(Events.SETTINGS_CHANGED, { 
      ...this.settings 
    });
  }

  /**
   * Handles toggle control change (Requirement 9.3)
   * Immediately applies the setting and emits event
   * 
   * @param {string} setting - Setting identifier
   * @param {boolean} value - New value
   * @private
   */
  handleToggleChange(setting, value) {
    this.settings[setting] = value;
    
    // Update aria-checked attribute
    const control = this.controls[setting];
    if (control) {
      control.setAttribute('aria-checked', value ? 'true' : 'false');
    }
    
    // Emit settings changed event (Requirement 9.3, 9.4)
    this.eventBus.emit(Events.SETTINGS_CHANGED, { 
      ...this.settings 
    });
  }

  /**
   * Handles reset statistics button click (Requirement 9.5)
   * Shows confirmation dialog before resetting
   * 
   * @private
   */
  handleResetStatistics() {
    // Show confirmation dialog
    const confirmed = confirm('確定要重置所有統計資料嗎？此操作無法撤銷。');
    
    if (confirmed) {
      // Emit reset statistics event
      this.eventBus.emit('reset_statistics');
      
      // Show success message
      this.showMessage('統計資料已重置');
    }
  }

  /**
   * Shows the settings panel (Requirement 9.1)
   */
  show() {
    this.isVisible = true;
    this.overlay.style.display = 'flex';
    
    // Focus the first focusable element
    const firstFocusable = this.panelElement.querySelector('button, input, select');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // Trap focus within the panel
    this.trapFocus();
  }

  /**
   * Hides the settings panel (Requirement 9.4)
   * Settings are automatically saved via events
   */
  hide() {
    this.isVisible = false;
    this.overlay.style.display = 'none';
    
    // Remove focus trap
    this.removeFocusTrap();
  }

  /**
   * Toggles the settings panel visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Updates the settings panel with new settings values
   * 
   * @param {Object} settings - Settings object
   * @param {string} [settings.theme] - Theme name
   * @param {boolean} [settings.autoCheck] - Auto-check enabled
   * @param {boolean} [settings.soundEnabled] - Sound enabled
   * @param {boolean} [settings.highlightSameNumbers] - Highlight same numbers
   * @param {boolean} [settings.showTimer] - Show timer
   * @param {boolean} [settings.showErrors] - Show errors
   */
  updateSettings(settings) {
    // Update internal state
    this.settings = {
      ...this.settings,
      ...settings
    };
    
    // Update controls
    if (settings.theme !== undefined && this.controls.theme) {
      this.controls.theme.value = settings.theme;
    }
    
    Object.keys(settings).forEach(key => {
      if (key !== 'theme' && this.controls[key]) {
        const control = this.controls[key];
        control.checked = settings[key];
        control.setAttribute('aria-checked', settings[key] ? 'true' : 'false');
      }
    });
  }

  /**
   * Gets the current settings
   * 
   * @returns {Object} Current settings object
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Shows a temporary message in the settings panel
   * 
   * @param {string} message - Message to display
   * @param {number} [duration=3000] - Duration in milliseconds
   * @private
   */
  showMessage(message, duration = 3000) {
    // Remove existing message
    const existingMessage = this.panelElement.querySelector('.settings-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'settings-message';
    messageElement.textContent = message;
    messageElement.setAttribute('role', 'status');
    messageElement.setAttribute('aria-live', 'polite');
    
    // Insert before footer
    const footer = this.panelElement.querySelector('.settings-footer');
    if (footer) {
      this.panelElement.insertBefore(messageElement, footer);
    } else {
      this.panelElement.appendChild(messageElement);
    }
    
    // Remove after duration
    setTimeout(() => {
      messageElement.remove();
    }, duration);
  }

  /**
   * Traps focus within the settings panel for accessibility
   * @private
   */
  trapFocus() {
    const focusableElements = this.panelElement.querySelectorAll(
      'button, input, select, [tabindex]:not([tabindex="-1"])'
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
    
    this.panelElement.addEventListener('keydown', this.focusTrapHandler);
  }

  /**
   * Removes focus trap
   * @private
   */
  removeFocusTrap() {
    if (this.focusTrapHandler) {
      this.panelElement.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }

  /**
   * Checks if the settings panel is currently visible
   * 
   * @returns {boolean} True if visible, false otherwise
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Destroys the settings panel and cleans up event listeners
   */
  destroy() {
    this.removeFocusTrap();
    
    if (this.overlay) {
      // Remove all event listeners by cloning and replacing
      const newOverlay = this.overlay.cloneNode(true);
      this.overlay.parentNode.replaceChild(newOverlay, this.overlay);
    }
    
    this.container.innerHTML = '';
    this.controls = {};
    this.panelElement = null;
    this.overlay = null;
  }
}
