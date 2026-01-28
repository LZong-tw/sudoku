# Header Buttons Data Flow Requirements

## Overview
Defines data flow requirements for header button features.

## Requirements

### REQ-DATA-001: Daily Challenge Data
- **Description**: Data required for daily challenge view
- **Methods**:
  - getTodayChallenge(): returns { date, difficulty, completed, puzzle, solution }
  - getHistory(limit?): returns sorted array of completed challenges
  - getStatistics(): returns { totalCompleted, currentStreak, longestStreak, averageTime, bestTime, perfectDays }

### REQ-DATA-002: Achievement Data
- **Description**: Data required for achievement view
- **Methods**:
  - getAllAchievements(): returns array of achievement objects
- **Calculations**:
  - Progress = Math.round((unlocked / total) * 100)
  - Hidden achievements show '???' when locked

### REQ-DATA-003: Statistics Data
- **Description**: Data required for statistics view
- **Methods**:
  - getAllStats(): returns { easy, medium, hard, overall }
- **Each difficulty contains**:
  - played: number of games
  - completed: number of wins
  - totalTime: cumulative time
  - averageTime: totalTime / completed
  - winRate: (completed / played) * 100

### REQ-DATA-004: Settings Data
- **Description**: Data required for settings panel
- **Options**:
  - theme: 'light' | 'dark'
  - autoCheck: boolean
  - soundEnabled: boolean
  - highlightSameNumbers: boolean
  - showTimer: boolean
  - showErrors: boolean
