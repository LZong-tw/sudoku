/**
 * @fileoverview Performance optimization utilities
 * @module utils/performance
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * Useful for: auto-save, search input, window resize
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} [immediate=false] - If true, trigger the function on the leading edge instead of trailing
 * @returns {Function} Debounced function
 * 
 * @example
 * const saveGame = debounce(() => {
 *   storageManager.saveGameState(gameState);
 * }, 1000);
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * 
 * Useful for: scroll events, mouse move, window resize
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle invocations to
 * @param {Object} [options] - Options object
 * @param {boolean} [options.leading=true] - Invoke on the leading edge of the timeout
 * @param {boolean} [options.trailing=true] - Invoke on the trailing edge of the timeout
 * @returns {Function} Throttled function
 * 
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scrolled!');
 * }, 200);
 */
export function throttle(func, wait, options = {}) {
  let timeout;
  let previous = 0;
  const { leading = true, trailing = true } = options;
  
  return function executedFunction(...args) {
    const context = this;
    const now = Date.now();
    
    if (!previous && !leading) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}

/**
 * Schedules a function to run on the next animation frame
 * 
 * Useful for: DOM updates, animations
 * 
 * @param {Function} func - The function to schedule
 * @returns {Function} Function that schedules the callback
 * 
 * @example
 * const updateUI = requestAnimationFrame(() => {
 *   element.style.transform = 'translateX(100px)';
 * });
 */
export function scheduleAnimationFrame(func) {
  let rafId = null;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      func.apply(context, args);
      rafId = null;
    });
  };
}

/**
 * Creates a function that batches multiple calls into a single execution
 * 
 * Useful for: batch DOM updates, batch API calls
 * 
 * @param {Function} func - The function to batch
 * @param {number} [wait=0] - The number of milliseconds to wait before executing
 * @returns {Function} Batched function
 * 
 * @example
 * const batchUpdate = batch((items) => {
 *   items.forEach(item => updateDOM(item));
 * });
 */
export function batch(func, wait = 0) {
  let timeout;
  let queue = [];
  
  return function executedFunction(item) {
    queue.push(item);
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      const items = queue.slice();
      queue = [];
      func(items);
      timeout = null;
    }, wait);
  };
}

/**
 * Memoizes a function to cache results for the same inputs
 * 
 * Useful for: expensive calculations, pure functions
 * 
 * @param {Function} func - The function to memoize
 * @param {Function} [resolver] - Function to resolve cache key from arguments
 * @returns {Function} Memoized function
 * 
 * @example
 * const expensiveCalculation = memoize((n) => {
 *   return fibonacci(n);
 * });
 */
export function memoize(func, resolver) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Creates a function that is limited to executing once
 * 
 * Useful for: initialization, one-time setup
 * 
 * @param {Function} func - The function to restrict
 * @returns {Function} Restricted function
 * 
 * @example
 * const initialize = once(() => {
 *   console.log('Initialized!');
 * });
 */
export function once(func) {
  let called = false;
  let result;
  
  return function executedFunction(...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  };
}

/**
 * Lazy loads a module or resource
 * 
 * Useful for: code splitting, lazy loading images/audio
 * 
 * @param {Function} loader - Function that returns a Promise
 * @returns {Function} Function that returns cached Promise
 * 
 * @example
 * const loadAudio = lazy(() => import('./audio-manager.js'));
 */
export function lazy(loader) {
  let promise = null;
  
  return function load() {
    if (!promise) {
      promise = loader();
    }
    return promise;
  };
}

/**
 * Creates a DocumentFragment for batch DOM operations
 * 
 * Useful for: creating multiple elements efficiently
 * 
 * @returns {DocumentFragment} Document fragment
 * 
 * @example
 * const fragment = createFragment();
 * for (let i = 0; i < 100; i++) {
 *   const div = document.createElement('div');
 *   fragment.appendChild(div);
 * }
 * container.appendChild(fragment);
 */
export function createFragment() {
  return document.createDocumentFragment();
}

/**
 * Measures the execution time of a function
 * 
 * Useful for: performance profiling, debugging
 * 
 * @param {Function} func - The function to measure
 * @param {string} [label] - Label for the measurement
 * @returns {Function} Wrapped function that logs execution time
 * 
 * @example
 * const slowFunction = measurePerformance(() => {
 *   // expensive operation
 * }, 'Slow Function');
 */
export function measurePerformance(func, label = 'Function') {
  return function measured(...args) {
    const start = performance.now();
    const result = func.apply(this, args);
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

/**
 * Checks if the browser supports a feature
 * 
 * @param {string} feature - Feature to check
 * @returns {boolean} Whether the feature is supported
 * 
 * @example
 * if (supportsFeature('localStorage')) {
 *   // use localStorage
 * }
 */
export function supportsFeature(feature) {
  switch (feature) {
    case 'localStorage':
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    
    case 'webAudio':
      return 'AudioContext' in window || 'webkitAudioContext' in window;
    
    case 'requestAnimationFrame':
      return 'requestAnimationFrame' in window;
    
    case 'intersectionObserver':
      return 'IntersectionObserver' in window;
    
    default:
      return false;
  }
}
