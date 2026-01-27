/**
 * @fileoverview ErrorHandler - Global error handling and user-friendly error messages
 * @module utils/error-handler
 */

/**
 * ErrorHandler - Centralized error handling for the application
 * Catches and logs errors, displays user-friendly messages, and ensures graceful degradation
 * 
 * @class ErrorHandler
 * @example
 * ErrorHandler.init();
 * ErrorHandler.showUserMessage('An error occurred');
 */
export class ErrorHandler {
  /**
   * Initialize global error handlers
   * Should be called once at application startup
   * 
   * @static
   * @example
   * ErrorHandler.init();
   */
  static init() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      ErrorHandler.logError(event.error);
      ErrorHandler.showUserMessage('發生了一個錯誤，但遊戲可以繼續。');
      
      // Prevent default browser error handling
      event.preventDefault();
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      ErrorHandler.logError(event.reason);
      ErrorHandler.showUserMessage('操作失敗，請重試。');
      
      // Prevent default browser error handling
      event.preventDefault();
    });

    console.log('ErrorHandler initialized');
  }

  /**
   * Log error details for debugging
   * 
   * @static
   * @param {Error|string} error - Error object or message
   * @param {Object} [context] - Additional context information
   * 
   * @example
   * ErrorHandler.logError(new Error('Something went wrong'), { userId: 123 });
   */
  static logError(error, context = {}) {
    const errorInfo = {
      message: error?.message || String(error),
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      context
    };

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error logged:', errorInfo);
    }

    // In production, this could send to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  /**
   * Display a user-friendly error message
   * Creates a temporary notification that auto-dismisses
   * 
   * @static
   * @param {string} message - User-friendly error message
   * @param {number} [duration=5000] - Duration in milliseconds before auto-dismiss
   * 
   * @example
   * ErrorHandler.showUserMessage('無法保存遊戲進度');
   */
  static showUserMessage(message, duration = 5000) {
    // Check if notification already exists
    let notification = document.querySelector('.error-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'error-notification';
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #e94560;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-size: 16px;
      max-width: 90%;
      text-align: center;
      animation: slideDown 0.3s ease-out;
    `;

    // Add animation keyframes if not already present
    if (!document.querySelector('#error-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'error-notification-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Clear any existing timeout
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }

    // Auto-dismiss after duration
    notification.timeoutId = setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  /**
   * Handle localStorage errors gracefully
   * 
   * @static
   * @param {Error} error - localStorage error
   * @returns {boolean} Whether localStorage is available
   * 
   * @example
   * try {
   *   localStorage.setItem('key', 'value');
   * } catch (error) {
   *   ErrorHandler.handleStorageError(error);
   * }
   */
  static handleStorageError(error) {
    console.warn('localStorage error:', error);
    
    if (error.name === 'QuotaExceededError') {
      ErrorHandler.showUserMessage('存儲空間已滿，無法保存進度。');
    } else {
      ErrorHandler.showUserMessage('無法保存進度，但遊戲可以繼續。');
    }
    
    return false;
  }

  /**
   * Wrap a function with error handling
   * 
   * @static
   * @param {Function} fn - Function to wrap
   * @param {string} [errorMessage] - Custom error message
   * @returns {Function} Wrapped function
   * 
   * @example
   * const safeFunction = ErrorHandler.wrap(() => {
   *   // potentially dangerous code
   * }, 'Operation failed');
   */
  static wrap(fn, errorMessage) {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        ErrorHandler.logError(error);
        if (errorMessage) {
          ErrorHandler.showUserMessage(errorMessage);
        }
        return null;
      }
    };
  }

  /**
   * Wrap an async function with error handling
   * 
   * @static
   * @param {Function} fn - Async function to wrap
   * @param {string} [errorMessage] - Custom error message
   * @returns {Function} Wrapped async function
   * 
   * @example
   * const safeAsyncFunction = ErrorHandler.wrapAsync(async () => {
   *   // potentially dangerous async code
   * }, 'Async operation failed');
   */
  static wrapAsync(fn, errorMessage) {
    return async function(...args) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        ErrorHandler.logError(error);
        if (errorMessage) {
          ErrorHandler.showUserMessage(errorMessage);
        }
        return null;
      }
    };
  }
}
