/**
 * @fileoverview Test utilities and helper functions
 * @module tests/helpers/test-utils
 */

/**
 * Create a mock DOM element for testing
 * 
 * @param {string} tag - HTML tag name
 * @param {Object} [attributes] - Element attributes
 * @returns {HTMLElement} Mock DOM element
 */
export function createMockElement(tag, attributes = {}) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * Wait for a condition to be true
 * 
 * @param {Function} condition - Function that returns boolean
 * @param {number} [timeout=1000] - Maximum wait time in ms
 * @param {number} [interval=50] - Check interval in ms
 * @returns {Promise<void>}
 */
export async function waitFor(condition, timeout = 1000, interval = 50) {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Create a spy function for testing
 * 
 * @returns {Function & {calls: Array, callCount: number, reset: Function}}
 */
export function createSpy() {
  const spy = function(...args) {
    spy.calls.push(args);
    spy.callCount++;
    return spy.returnValue;
  };
  
  spy.calls = [];
  spy.callCount = 0;
  spy.returnValue = undefined;
  spy.reset = function() {
    spy.calls = [];
    spy.callCount = 0;
  };
  
  return spy;
}

/**
 * Deep clone an object
 * 
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Set) {
    return new Set([...obj].map(item => deepClone(item)));
  }
  
  if (obj instanceof Map) {
    return new Map([...obj].map(([key, value]) => [deepClone(key), deepClone(value)]));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Compare two objects for deep equality
 * 
 * @param {*} a - First object
 * @param {*} b - Second object
 * @returns {boolean} Whether objects are deeply equal
 */
export function deepEqual(a, b) {
  if (a === b) return true;
  
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }
  
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key))) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Mock localStorage for testing
 * 
 * @returns {Object} Mock localStorage object
 */
export function createMockLocalStorage() {
  let store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] || null
  };
}

/**
 * Setup mock localStorage for tests
 */
export function setupMockLocalStorage() {
  const mockLocalStorage = createMockLocalStorage();
  global.localStorage = mockLocalStorage;
  return mockLocalStorage;
}

/**
 * Cleanup mock localStorage after tests
 */
export function cleanupMockLocalStorage() {
  if (global.localStorage) {
    global.localStorage.clear();
  }
}
