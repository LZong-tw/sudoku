/**
 * Timer Module
 * 
 * Manages game timing functionality including start, pause, resume, and stop operations.
 * Tracks elapsed time and maintains timer state throughout the game session.
 * 
 * @module core/timer
 */

/**
 * Timer class for managing game time tracking.
 * 
 * Provides precise time tracking with support for pause/resume functionality.
 * Uses high-resolution timestamps for accurate elapsed time calculation.
 * 
 * @class Timer
 */
export class Timer {
  /**
   * Creates a new Timer instance.
   * 
   * @constructor
   */
  constructor() {
    /**
     * Timestamp when the timer was started (milliseconds since epoch)
     * @type {number|null}
     * @private
     */
    this.startTime = null;

    /**
     * Total elapsed time in seconds
     * @type {number}
     * @private
     */
    this.elapsedTime = 0;

    /**
     * Whether the timer is currently running
     * @type {boolean}
     * @private
     */
    this.isRunning = false;

    /**
     * Timestamp when the timer was paused (milliseconds since epoch)
     * @type {number|null}
     * @private
     */
    this.pauseTime = null;
  }

  /**
   * Starts the timer from zero.
   * 
   * Resets any previous elapsed time and begins tracking from the current moment.
   * If the timer is already running, this method has no effect.
   * 
   * @returns {void}
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.isRunning = true;
    this.pauseTime = null;
  }

  /**
   * Pauses the timer.
   * 
   * Stops time tracking and preserves the current elapsed time.
   * Can be resumed later with resume() to continue from the paused point.
   * If the timer is not running, this method has no effect.
   * 
   * @returns {void}
   */
  pause() {
    if (!this.isRunning) {
      return;
    }

    this.pauseTime = Date.now();
    this.elapsedTime = this.getElapsedTime();
    this.isRunning = false;
  }

  /**
   * Resumes the timer after being paused.
   * 
   * Continues time tracking from the point where it was paused.
   * If the timer is already running or was never started, this method has no effect.
   * 
   * @returns {void}
   */
  resume() {
    if (this.isRunning || this.startTime === null) {
      return;
    }

    // Adjust start time to account for the paused duration
    const pausedDuration = this.pauseTime ? Date.now() - this.pauseTime : 0;
    this.startTime = Date.now() - (this.elapsedTime * 1000);
    this.isRunning = true;
    this.pauseTime = null;
  }

  /**
   * Stops the timer and resets all state.
   * 
   * Halts time tracking and clears all timing data.
   * After stopping, the timer can be started again with start().
   * 
   * @returns {void}
   */
  stop() {
    this.startTime = null;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.pauseTime = null;
  }

  /**
   * Gets the current elapsed time in seconds.
   * 
   * If the timer is running, calculates the time from start to now.
   * If the timer is paused, returns the elapsed time at the pause moment.
   * If the timer was never started, returns 0.
   * 
   * @returns {number} Elapsed time in seconds (rounded to nearest integer)
   */
  getElapsedTime() {
    if (this.startTime === null) {
      return 0;
    }

    if (this.isRunning) {
      const now = Date.now();
      const elapsed = (now - this.startTime) / 1000;
      return Math.floor(elapsed);
    }

    return Math.floor(this.elapsedTime);
  }

  /**
   * Checks if the timer is currently running.
   * 
   * @returns {boolean} True if the timer is running, false otherwise
   */
  getIsRunning() {
    return this.isRunning;
  }

  /**
   * Serializes the timer state to JSON.
   * 
   * Captures the current state including elapsed time and running status.
   * Can be used for persistence or state transfer.
   * 
   * @returns {Object} JSON representation of timer state
   * @returns {number} return.elapsedTime - Elapsed time in seconds
   * @returns {boolean} return.isRunning - Whether timer is running
   */
  toJSON() {
    return {
      elapsedTime: this.getElapsedTime(),
      isRunning: this.isRunning
    };
  }

  /**
   * Restores timer state from JSON.
   * 
   * Reconstructs a timer with the given elapsed time.
   * If the timer was running when serialized, it will be paused after restoration.
   * 
   * @param {Object} json - JSON representation of timer state
   * @param {number} json.elapsedTime - Elapsed time in seconds
   * @param {boolean} json.isRunning - Whether timer was running
   * @returns {Timer} New Timer instance with restored state
   */
  static fromJSON(json) {
    const timer = new Timer();
    
    if (json && typeof json.elapsedTime === 'number') {
      timer.elapsedTime = json.elapsedTime;
      timer.startTime = Date.now() - (json.elapsedTime * 1000);
      
      // If it was running, we restore it as paused to avoid time drift
      // The caller can resume() if needed
      if (json.isRunning) {
        timer.pauseTime = Date.now();
      }
    }
    
    return timer;
  }
}
