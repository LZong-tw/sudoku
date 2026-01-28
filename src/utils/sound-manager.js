/**
 * @fileoverview SoundManager - Manages game sound effects using Web Audio API
 * Provides sound effects for various game events with user-controllable settings
 */

import { EventBus } from './event-bus.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Sound types available in the game
 * @enum {string}
 */
export const SoundType = {
  INPUT: 'input',           // Valid number input
  ERROR: 'error',           // Invalid input or conflict
  COMPLETE: 'complete',     // Puzzle completion
  HINT: 'hint',            // Hint used
  UNDO: 'undo',            // Undo action
  ACHIEVEMENT: 'achievement' // Achievement unlocked
};

/**
 * SoundManager class - Manages game audio using Web Audio API
 * 
 * Features:
 * - Generates simple tones for game events
 * - User-controllable sound on/off
 * - Persistent sound preferences
 * - Lazy initialization of AudioContext
 * 
 * @class
 */
export class SoundManager {
  /**
   * Creates a new SoundManager instance
   * @param {Object} storageManager - Storage manager for persisting preferences
   * @param {EventBus} eventBus - Event bus instance
   */
  constructor(storageManager, eventBus) {
    this.storageManager = storageManager;
    this.eventBus = eventBus;
    this.audioContext = null;
    this.enabled = true;
    this.initialized = false;
    
    // Load saved preferences
    this.loadPreferences();
    
    // Subscribe to game events
    this.subscribeToEvents();
  }

  /**
   * Initializes the Web Audio API context
   * Lazy initialization to avoid autoplay restrictions
   * @private
   */
  initializeAudioContext() {
    if (this.initialized) return;
    
    try {
      // Create AudioContext (with vendor prefixes for compatibility)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        throw new Error('Web Audio API not supported');
      }
      
      this.audioContext = new AudioContext();
      this.initialized = true;
    } catch (error) {
      ErrorHandler.handle(error, 'SoundManager.initializeAudioContext');
      this.enabled = false; // Disable sounds if initialization fails
    }
  }

  /**
   * Loads sound preferences from storage
   * @private
   */
  loadPreferences() {
    try {
      const settings = this.storageManager.loadSettings();
      this.enabled = settings.soundEnabled !== false; // Default to true
    } catch (error) {
      ErrorHandler.handle(error, 'SoundManager.loadPreferences');
      this.enabled = true; // Default to enabled
    }
  }

  /**
   * Saves sound preferences to storage
   * @private
   */
  savePreferences() {
    try {
      const settings = this.storageManager.loadSettings();
      settings.soundEnabled = this.enabled;
      this.storageManager.saveSettings(settings);
    } catch (error) {
      ErrorHandler.handle(error, 'SoundManager.savePreferences');
    }
  }

  /**
   * Subscribes to game events to play appropriate sounds
   * @private
   */
  subscribeToEvents() {
    this.eventBus.on('cell:input', () => this.playSound(SoundType.INPUT));
    this.eventBus.on('cell:conflict', () => this.playSound(SoundType.ERROR));
    this.eventBus.on('game:complete', () => this.playSound(SoundType.COMPLETE));
    this.eventBus.on('hint:used', () => this.playSound(SoundType.HINT));
    this.eventBus.on('history:undo', () => this.playSound(SoundType.UNDO));
    this.eventBus.on('achievement:unlocked', () => this.playSound(SoundType.ACHIEVEMENT));
  }

  /**
   * Plays a sound effect for the given type
   * @param {SoundType} type - Type of sound to play
   */
  playSound(type) {
    if (!this.enabled) return;
    
    // Initialize audio context on first sound play (user interaction required)
    if (!this.initialized) {
      this.initializeAudioContext();
    }
    
    if (!this.audioContext) return;
    
    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Play the appropriate sound
      switch (type) {
        case SoundType.INPUT:
          this.playTone(800, 0.05, 'sine');
          break;
        case SoundType.ERROR:
          this.playTone(200, 0.15, 'sawtooth');
          break;
        case SoundType.COMPLETE:
          this.playMelody([
            { freq: 523, duration: 0.15 }, // C
            { freq: 659, duration: 0.15 }, // E
            { freq: 784, duration: 0.3 }   // G
          ]);
          break;
        case SoundType.HINT:
          this.playTone(1000, 0.1, 'triangle');
          break;
        case SoundType.UNDO:
          this.playTone(600, 0.05, 'sine');
          break;
        case SoundType.ACHIEVEMENT:
          this.playMelody([
            { freq: 659, duration: 0.1 },  // E
            { freq: 784, duration: 0.1 },  // G
            { freq: 1047, duration: 0.2 }  // C
          ]);
          break;
      }
    } catch (error) {
      ErrorHandler.handle(error, 'SoundManager.playSound');
    }
  }

  /**
   * Plays a simple tone
   * @private
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {OscillatorType} type - Oscillator type (sine, square, sawtooth, triangle)
   */
  playTone(frequency, duration, type = 'sine') {
    if (!this.audioContext) return;
    
    const currentTime = this.audioContext.currentTime;
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, currentTime);
    
    // Create gain node for volume control and envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Play
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);
  }

  /**
   * Plays a melody (sequence of tones)
   * @private
   * @param {Array<{freq: number, duration: number}>} notes - Array of notes to play
   */
  playMelody(notes) {
    if (!this.audioContext) return;
    
    let currentTime = this.audioContext.currentTime;
    
    notes.forEach(note => {
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.freq, currentTime);
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0.15, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);
      
      currentTime += note.duration;
    });
  }

  /**
   * Enables sound effects
   */
  enable() {
    this.enabled = true;
    this.savePreferences();
    EventBus.emit('sound:enabled');
  }

  /**
   * Disables sound effects
   */
  disable() {
    this.enabled = false;
    this.savePreferences();
    EventBus.emit('sound:disabled');
  }

  /**
   * Toggles sound effects on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  /**
   * Checks if sound is enabled
   * @returns {boolean} True if sound is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Cleans up resources
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.initialized = false;
  }
}
