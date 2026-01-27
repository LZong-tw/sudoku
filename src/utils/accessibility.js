/**
 * @fileoverview Accessibility utilities for screen reader support
 * @module utils/accessibility
 */

/**
 * Announces a message to screen readers using ARIA live regions
 * 
 * @param {string} message - Message to announce
 * @param {string} [priority='polite'] - Priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcer = document.getElementById('sr-announcements');
  if (!announcer) return;
  
  // Clear previous announcement
  announcer.textContent = '';
  
  // Set priority
  announcer.setAttribute('aria-live', priority);
  
  // Announce new message after a brief delay to ensure screen readers pick it up
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
  
  // Clear announcement after 3 seconds
  setTimeout(() => {
    announcer.textContent = '';
  }, 3100);
}

/**
 * Formats a cell position for screen reader announcement
 * 
 * @param {number} row - Row index (0-8)
 * @param {number} col - Column index (0-8)
 * @returns {string} Formatted position
 */
export function formatCellPosition(row, col) {
  return `row ${row + 1}, column ${col + 1}`;
}

/**
 * Formats a game state for screen reader announcement
 * 
 * @param {Object} state - Game state
 * @param {number} state.filled - Number of filled cells
 * @param {number} state.total - Total number of cells
 * @param {number} state.errors - Number of errors
 * @returns {string} Formatted state
 */
export function formatGameState(state) {
  const { filled, total, errors } = state;
  const percentage = Math.round((filled / total) * 100);
  return `${percentage}% complete, ${errors} error${errors !== 1 ? 's' : ''}`;
}

/**
 * Formats a validation result for screen reader announcement
 * 
 * @param {boolean} isValid - Whether the input is valid
 * @param {number} value - The value entered
 * @returns {string} Formatted result
 */
export function formatValidationResult(isValid, value) {
  if (isValid) {
    return `${value} is valid`;
  } else {
    return `${value} conflicts with existing numbers`;
  }
}

/**
 * Formats an achievement unlock for screen reader announcement
 * 
 * @param {string} achievementName - Name of the achievement
 * @returns {string} Formatted announcement
 */
export function formatAchievementUnlock(achievementName) {
  return `Achievement unlocked: ${achievementName}`;
}

/**
 * Formats a game completion for screen reader announcement
 * 
 * @param {Object} stats - Completion statistics
 * @param {number} stats.time - Time in seconds
 * @param {number} stats.errors - Number of errors
 * @param {boolean} stats.isNewRecord - Whether it's a new record
 * @returns {string} Formatted announcement
 */
export function formatGameCompletion(stats) {
  const { time, errors, isNewRecord } = stats;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeStr = `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
  
  let message = `Puzzle completed in ${timeStr} with ${errors} error${errors !== 1 ? 's' : ''}`;
  if (isNewRecord) {
    message += '. New record!';
  }
  
  return message;
}
