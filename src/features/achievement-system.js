/**
 * Achievement System Module
 * 
 * Manages player achievements, tracking milestones and unlocking conditions.
 * Provides at least 10 different achievements with progress tracking and persistence.
 * 
 * @module features/achievement-system
 */

import { EventBus } from '../utils/event-bus.js';
import { StorageManager } from '../storage/storage-manager.js';

/**
 * Achievement definition structure
 * @typedef {Object} Achievement
 * @property {string} id - Unique achievement identifier
 * @property {string} title - Display title
 * @property {string} description - Achievement description
 * @property {string} icon - Icon identifier or emoji
 * @property {boolean} unlocked - Whether achievement is unlocked
 * @property {Date|null} unlockedAt - Timestamp when unlocked
 * @property {number} progress - Progress percentage (0-100)
 * @property {Function} condition - Function to check if achievement should unlock
 * @property {boolean} [hidden] - Whether achievement is hidden until unlocked
 */

/**
 * Game data structure passed to achievement checks
 * @typedef {Object} GameData
 * @property {number} gamesCompleted - Total games completed
 * @property {number} gamesPlayed - Total games started
 * @property {number} errors - Errors in current/last game
 * @property {number} hintsUsed - Hints used in current/last game
 * @property {string} difficulty - Game difficulty ('easy'|'medium'|'hard')
 * @property {number} time - Game completion time in seconds
 * @property {number} perfectGames - Games completed without errors or hints
 * @property {number} currentStreak - Current win streak
 * @property {number} longestStreak - Longest win streak
 * @property {Object} difficultyStats - Stats by difficulty level
 */

/**
 * AchievementSystem Class
 * 
 * Tracks player achievements and milestones throughout gameplay.
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5
 */
export class AchievementSystem {
  /**
   * Creates a new AchievementSystem instance
   * @param {StorageManager} [storageManager] - Optional storage manager for persistence
   * @param {EventBus} [eventBus] - Optional event bus for notifications
   */
  constructor(storageManager = null, eventBus = null) {
    this.storage = storageManager;
    this.eventBus = eventBus;
    
    /**
     * Map of all achievements by ID
     * @type {Map<string, Achievement>}
     */
    this.achievements = this.initializeAchievements();
    
    /**
     * Set of unlocked achievement IDs
     * @type {Set<string>}
     */
    this.unlockedAchievements = new Set();
    
    /**
     * Tracking data for progressive achievements
     * @type {Object}
     */
    this.progressData = {
      gamesCompleted: 0,
      gamesPlayed: 0,
      perfectGames: 0,
      currentStreak: 0,
      longestStreak: 0,
      fastestEasy: Infinity,
      fastestMedium: Infinity,
      fastestHard: Infinity,
      totalPlayTime: 0,
      hintsUsedTotal: 0,
      dailyChallengesCompleted: 0
    };
    
    // Load saved achievement data
    this.loadFromStorage();
  }

  /**
   * Initialize all achievement definitions
   * Requirement 14.4: At least 10 different achievements
   * @returns {Map<string, Achievement>} Map of achievement definitions
   */
  initializeAchievements() {
    const achievements = new Map();
    
    // Achievement 1: First Win
    achievements.set('first_win', {
      id: 'first_win',
      title: '首次勝利',
      description: '完成第一個數獨遊戲',
      icon: '🎉',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.gamesCompleted >= 1
    });
    
    // Achievement 2: Perfect Game
    achievements.set('perfect_game', {
      id: 'perfect_game',
      title: '完美遊戲',
      description: '無錯誤無提示完成遊戲',
      icon: '💎',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.errors === 0 && data.hintsUsed === 0 && data.gamesCompleted > 0
    });
    
    // Achievement 3: Speed Demon (Medium)
    achievements.set('speed_demon', {
      id: 'speed_demon',
      title: '速度惡魔',
      description: '在 5 分鐘內完成中等難度',
      icon: '⚡',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.difficulty === 'medium' && data.time < 300
    });
    
    // Achievement 4: Master Solver
    achievements.set('master_solver', {
      id: 'master_solver',
      title: '解謎大師',
      description: '完成 50 個遊戲',
      icon: '🏆',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.gamesCompleted >= 50
    });
    
    // Achievement 5: No Hints Needed
    achievements.set('no_hints', {
      id: 'no_hints',
      title: '無需提示',
      description: '連續完成 10 個遊戲不使用提示',
      icon: '🧠',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.noHintStreak >= 10,
      hidden: true
    });
    
    // Achievement 6: Hard Mode Champion
    achievements.set('hard_champion', {
      id: 'hard_champion',
      title: '困難模式冠軍',
      description: '完成 10 個困難難度遊戲',
      icon: '👑',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.difficultyStats?.hard?.completed >= 10
    });
    
    // Achievement 7: Lightning Fast
    achievements.set('lightning_fast', {
      id: 'lightning_fast',
      title: '閃電俠',
      description: '在 3 分鐘內完成簡單難度',
      icon: '⚡️',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.difficulty === 'easy' && data.time < 180
    });
    
    // Achievement 8: Perfectionist
    achievements.set('perfectionist', {
      id: 'perfectionist',
      title: '完美主義者',
      description: '完成 10 個完美遊戲（無錯誤無提示）',
      icon: '✨',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.perfectGames >= 10
    });
    
    // Achievement 9: Win Streak
    achievements.set('win_streak', {
      id: 'win_streak',
      title: '連勝王',
      description: '連續完成 5 個遊戲',
      icon: '🔥',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.currentStreak >= 5
    });
    
    // Achievement 10: Daily Dedication
    achievements.set('daily_dedication', {
      id: 'daily_dedication',
      title: '每日奉獻',
      description: '完成 7 個每日挑戰',
      icon: '📅',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.dailyChallengesCompleted >= 7
    });
    
    // Achievement 11: Marathon Runner
    achievements.set('marathon', {
      id: 'marathon',
      title: '馬拉松選手',
      description: '累計遊戲時間達到 10 小時',
      icon: '🏃',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.totalPlayTime >= 36000 // 10 hours in seconds
    });
    
    // Achievement 12: Ultimate Champion
    achievements.set('ultimate_champion', {
      id: 'ultimate_champion',
      title: '終極冠軍',
      description: '在困難難度下 15 分鐘內完成遊戲',
      icon: '🌟',
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      condition: (data) => data.difficulty === 'hard' && data.time < 900,
      hidden: true
    });
    
    return achievements;
  }

  /**
   * Check achievements against current game data and unlock if conditions met
   * Requirement 14.1: Track game milestones
   * Requirement 14.2: Unlock achievements when conditions met
   * @param {GameData} gameData - Current game data to check against
   * @returns {Array<Achievement>} Array of newly unlocked achievements
   */
  checkAchievements(gameData) {
    const newlyUnlocked = [];
    
    // Update progress data
    this.updateProgressData(gameData);
    
    // Merge progress data with game data for condition checking
    const fullData = { ...gameData, ...this.progressData };
    
    // Check each achievement
    for (const [id, achievement] of this.achievements) {
      // Skip if already unlocked
      if (this.unlockedAchievements.has(id)) {
        continue;
      }
      
      // Check if condition is met
      try {
        if (achievement.condition(fullData)) {
          this.unlockAchievement(id);
          newlyUnlocked.push(achievement);
        } else {
          // Update progress for progressive achievements
          this.updateAchievementProgress(id, fullData);
        }
      } catch (error) {
        console.error(`Error checking achievement ${id}:`, error);
      }
    }
    
    // Save to storage if any achievements unlocked
    if (newlyUnlocked.length > 0) {
      this.saveToStorage();
    }
    
    return newlyUnlocked;
  }

  /**
   * Update progress data based on game completion
   * @param {GameData} gameData - Game data from completed game
   * @private
   */
  updateProgressData(gameData) {
    // Update games completed
    if (gameData.gamesCompleted !== undefined) {
      this.progressData.gamesCompleted = gameData.gamesCompleted;
    }
    
    // Update games played
    if (gameData.gamesPlayed !== undefined) {
      this.progressData.gamesPlayed = gameData.gamesPlayed;
    }
    
    // Update perfect games
    if (gameData.errors === 0 && gameData.hintsUsed === 0) {
      this.progressData.perfectGames++;
    }
    
    // Update streaks
    if (gameData.currentStreak !== undefined) {
      this.progressData.currentStreak = gameData.currentStreak;
      this.progressData.longestStreak = Math.max(
        this.progressData.longestStreak,
        gameData.currentStreak
      );
    }
    
    // Update fastest times
    if (gameData.time !== undefined && gameData.difficulty) {
      const timeKey = `fastest${gameData.difficulty.charAt(0).toUpperCase() + gameData.difficulty.slice(1)}`;
      if (this.progressData[timeKey] !== undefined) {
        this.progressData[timeKey] = Math.min(this.progressData[timeKey], gameData.time);
      }
    }
    
    // Update total play time
    if (gameData.time !== undefined) {
      this.progressData.totalPlayTime += gameData.time;
    }
    
    // Update hints used
    if (gameData.hintsUsed !== undefined) {
      this.progressData.hintsUsedTotal += gameData.hintsUsed;
    }
    
    // Update daily challenges
    if (gameData.dailyChallengesCompleted !== undefined) {
      this.progressData.dailyChallengesCompleted = gameData.dailyChallengesCompleted;
    }
    
    // Track no-hint streak
    if (gameData.hintsUsed === 0) {
      this.progressData.noHintStreak = (this.progressData.noHintStreak || 0) + 1;
    } else {
      this.progressData.noHintStreak = 0;
    }
    
    // Store difficulty stats
    if (gameData.difficultyStats) {
      this.progressData.difficultyStats = gameData.difficultyStats;
    }
  }

  /**
   * Update progress percentage for progressive achievements
   * @param {string} achievementId - Achievement ID
   * @param {GameData} data - Current game data
   * @private
   */
  updateAchievementProgress(achievementId, data) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;
    
    // Calculate progress based on achievement type
    switch (achievementId) {
      case 'master_solver':
        achievement.progress = Math.min(100, (data.gamesCompleted / 50) * 100);
        break;
      case 'no_hints':
        achievement.progress = Math.min(100, ((data.noHintStreak || 0) / 10) * 100);
        break;
      case 'hard_champion':
        achievement.progress = Math.min(100, ((data.difficultyStats?.hard?.completed || 0) / 10) * 100);
        break;
      case 'perfectionist':
        achievement.progress = Math.min(100, (data.perfectGames / 10) * 100);
        break;
      case 'win_streak':
        achievement.progress = Math.min(100, (data.currentStreak / 5) * 100);
        break;
      case 'daily_dedication':
        achievement.progress = Math.min(100, (data.dailyChallengesCompleted / 7) * 100);
        break;
      case 'marathon':
        achievement.progress = Math.min(100, (data.totalPlayTime / 36000) * 100);
        break;
      default:
        // Binary achievements (0% or 100%)
        achievement.progress = 0;
    }
  }

  /**
   * Unlock a specific achievement
   * Requirement 14.2: Display notification when achievement unlocked
   * @param {string} achievementId - ID of achievement to unlock
   * @returns {boolean} True if achievement was unlocked, false if already unlocked or not found
   */
  unlockAchievement(achievementId) {
    // Check if achievement exists
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      console.warn(`Achievement ${achievementId} not found`);
      return false;
    }
    
    // Check if already unlocked
    if (this.unlockedAchievements.has(achievementId)) {
      return false;
    }
    
    // Unlock the achievement
    this.unlockedAchievements.add(achievementId);
    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    achievement.progress = 100;
    
    // Emit event for notification
    if (this.eventBus) {
      this.eventBus.emit('achievement_unlocked', {
        achievement: { ...achievement }
      });
    }
    
    console.log(`Achievement unlocked: ${achievement.title}`);
    
    return true;
  }

  /**
   * Get all achievements
   * Requirement 14.3: Provide achievement list interface
   * @returns {Array<Achievement>} Array of all achievements
   */
  getAllAchievements() {
    return Array.from(this.achievements.values()).map(achievement => ({
      ...achievement,
      // Hide details of hidden achievements if not unlocked
      title: achievement.hidden && !achievement.unlocked ? '???' : achievement.title,
      description: achievement.hidden && !achievement.unlocked ? '隱藏成就' : achievement.description,
      icon: achievement.hidden && !achievement.unlocked ? '🔒' : achievement.icon
    }));
  }

  /**
   * Get unlocked achievements only
   * @returns {Array<Achievement>} Array of unlocked achievements
   */
  getUnlockedAchievements() {
    return this.getAllAchievements().filter(a => a.unlocked);
  }

  /**
   * Get progress for a specific achievement
   * @param {string} achievementId - Achievement ID
   * @returns {number} Progress percentage (0-100), or -1 if not found
   */
  getProgress(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      return -1;
    }
    return achievement.progress;
  }

  /**
   * Get overall achievement completion percentage
   * @returns {number} Percentage of achievements unlocked (0-100)
   */
  getOverallProgress() {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    return total > 0 ? Math.round((unlocked / total) * 100) : 0;
  }

  /**
   * Reset all achievements (for testing or user request)
   * @returns {void}
   */
  reset() {
    this.unlockedAchievements.clear();
    this.progressData = {
      gamesCompleted: 0,
      gamesPlayed: 0,
      perfectGames: 0,
      currentStreak: 0,
      longestStreak: 0,
      fastestEasy: Infinity,
      fastestMedium: Infinity,
      fastestHard: Infinity,
      totalPlayTime: 0,
      hintsUsedTotal: 0,
      dailyChallengesCompleted: 0,
      noHintStreak: 0
    };
    
    // Reset all achievement states
    for (const achievement of this.achievements.values()) {
      achievement.unlocked = false;
      achievement.unlockedAt = null;
      achievement.progress = 0;
    }
    
    this.saveToStorage();
  }

  /**
   * Save achievement data to storage
   * Requirement 14.5: Save achievement progress to localStorage
   * @private
   */
  saveToStorage() {
    if (!this.storage) return;
    
    const data = {
      unlockedAchievements: Array.from(this.unlockedAchievements),
      progressData: this.progressData,
      achievementStates: Array.from(this.achievements.entries()).map(([id, achievement]) => ({
        id,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt,
        progress: achievement.progress
      }))
    };
    
    this.storage.save('achievements', data);
  }

  /**
   * Load achievement data from storage
   * Requirement 14.5: Load achievement progress from localStorage
   * @private
   */
  loadFromStorage() {
    if (!this.storage) return;
    
    const data = this.storage.load('achievements');
    if (!data) return;
    
    // Restore unlocked achievements
    if (Array.isArray(data.unlockedAchievements)) {
      this.unlockedAchievements = new Set(data.unlockedAchievements);
    }
    
    // Restore progress data
    if (data.progressData) {
      this.progressData = { ...this.progressData, ...data.progressData };
    }
    
    // Restore achievement states
    if (Array.isArray(data.achievementStates)) {
      for (const state of data.achievementStates) {
        const achievement = this.achievements.get(state.id);
        if (achievement) {
          achievement.unlocked = state.unlocked;
          achievement.unlockedAt = state.unlockedAt ? new Date(state.unlockedAt) : null;
          achievement.progress = state.progress || 0;
        }
      }
    }
  }

  /**
   * Serialize achievement system to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      unlockedAchievements: Array.from(this.unlockedAchievements),
      progressData: this.progressData,
      achievements: Array.from(this.achievements.values())
    };
  }

  /**
   * Restore achievement system from JSON
   * @param {Object} json - JSON data
   * @param {StorageManager} [storageManager] - Storage manager instance
   * @param {EventBus} [eventBus] - Event bus instance
   * @returns {AchievementSystem} Restored achievement system
   */
  static fromJSON(json, storageManager = null, eventBus = null) {
    const system = new AchievementSystem(storageManager, eventBus);
    
    if (json.unlockedAchievements) {
      system.unlockedAchievements = new Set(json.unlockedAchievements);
    }
    
    if (json.progressData) {
      system.progressData = { ...system.progressData, ...json.progressData };
    }
    
    if (json.achievements) {
      for (const achievementData of json.achievements) {
        const achievement = system.achievements.get(achievementData.id);
        if (achievement) {
          achievement.unlocked = achievementData.unlocked;
          achievement.unlockedAt = achievementData.unlockedAt ? new Date(achievementData.unlockedAt) : null;
          achievement.progress = achievementData.progress || 0;
        }
      }
    }
    
    return system;
  }
}
