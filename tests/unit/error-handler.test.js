/**
 * @fileoverview Unit tests for ErrorHandler
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorHandler } from '../../src/utils/error-handler.js';

describe('ErrorHandler', () => {
  let originalConsoleError;
  let consoleErrorCalls;

  beforeEach(() => {
    // Mock console.error
    originalConsoleError = console.error;
    consoleErrorCalls = [];
    console.error = (...args) => consoleErrorCalls.push(args);
    
    // Clean up any existing notifications
    document.querySelectorAll('.error-notification').forEach(el => el.remove());
  });

  afterEach(() => {
    console.error = originalConsoleError;
    document.querySelectorAll('.error-notification').forEach(el => el.remove());
  });

  describe('showUserMessage()', () => {
    it('should create notification element', () => {
      ErrorHandler.showUserMessage('Test message');
      
      const notification = document.querySelector('.error-notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe('Test message');
    });

    it('should reuse existing notification element', () => {
      ErrorHandler.showUserMessage('Message 1');
      ErrorHandler.showUserMessage('Message 2');
      
      const notifications = document.querySelectorAll('.error-notification');
      expect(notifications.length).toBe(1);
      expect(notifications[0].textContent).toBe('Message 2');
    });

    it('should apply correct styles', () => {
      ErrorHandler.showUserMessage('Test');
      
      const notification = document.querySelector('.error-notification');
      expect(notification.style.position).toBe('fixed');
      expect(notification.style.zIndex).toBe('10000');
    });

    it('should add animation styles to document', () => {
      ErrorHandler.showUserMessage('Test');
      
      const styleElement = document.querySelector('#error-notification-styles');
      expect(styleElement).toBeTruthy();
      expect(styleElement.textContent).toContain('@keyframes slideDown');
      expect(styleElement.textContent).toContain('@keyframes slideUp');
    });
  });

  describe('logError()', () => {
    it('should log error with message and stack', () => {
      const error = new Error('Test error');
      ErrorHandler.logError(error);
      
      expect(consoleErrorCalls.length).toBeGreaterThan(0);
    });

    it('should handle string errors', () => {
      ErrorHandler.logError('String error');
      
      expect(consoleErrorCalls.length).toBeGreaterThan(0);
    });

    it('should include context information', () => {
      const error = new Error('Test error');
      const context = { userId: 123, action: 'test' };
      
      ErrorHandler.logError(error, context);
      
      expect(consoleErrorCalls.length).toBeGreaterThan(0);
    });
  });

  describe('handleStorageError()', () => {
    it('should handle QuotaExceededError', () => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      
      const result = ErrorHandler.handleStorageError(error);
      
      expect(result).toBe(false);
      const notification = document.querySelector('.error-notification');
      expect(notification.textContent).toContain('存儲空間已滿');
    });

    it('should handle generic storage errors', () => {
      const error = new Error('Storage error');
      
      const result = ErrorHandler.handleStorageError(error);
      
      expect(result).toBe(false);
      const notification = document.querySelector('.error-notification');
      expect(notification.textContent).toContain('無法保存進度');
    });
  });

  describe('wrap()', () => {
    it('should wrap function with error handling', () => {
      const fn = () => {
        throw new Error('Test error');
      };
      
      const wrapped = ErrorHandler.wrap(fn, 'Operation failed');
      const result = wrapped();
      
      expect(result).toBe(null);
      expect(consoleErrorCalls.length).toBeGreaterThan(0);
    });

    it('should return function result on success', () => {
      const fn = () => 42;
      
      const wrapped = ErrorHandler.wrap(fn);
      const result = wrapped();
      
      expect(result).toBe(42);
    });

    it('should pass arguments to wrapped function', () => {
      const fn = (a, b) => a + b;
      
      const wrapped = ErrorHandler.wrap(fn);
      const result = wrapped(10, 20);
      
      expect(result).toBe(30);
    });
  });

  describe('wrapAsync()', () => {
    it('should wrap async function with error handling', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };
      
      const wrapped = ErrorHandler.wrapAsync(fn, 'Async operation failed');
      const result = await wrapped();
      
      expect(result).toBe(null);
      expect(consoleErrorCalls.length).toBeGreaterThan(0);
    });

    it('should return async function result on success', async () => {
      const fn = async () => 42;
      
      const wrapped = ErrorHandler.wrapAsync(fn);
      const result = await wrapped();
      
      expect(result).toBe(42);
    });

    it('should pass arguments to wrapped async function', async () => {
      const fn = async (a, b) => a + b;
      
      const wrapped = ErrorHandler.wrapAsync(fn);
      const result = await wrapped(10, 20);
      
      expect(result).toBe(30);
    });
  });

  describe('init()', () => {
    it('should register global error handlers', () => {
      // This is difficult to test directly, but we can verify it doesn't throw
      expect(() => {
        ErrorHandler.init();
      }).not.toThrow();
    });
  });
});
