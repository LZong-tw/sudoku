# Settings Persistence Requirements

## Overview
Defines requirements for settings persistence.

## Requirements

### REQ-PERSIST-001: Save Settings
- **Description**: Save settings to localStorage
- **Acceptance Criteria**:
  - Save on every settings change
  - Merge with existing settings
  - Key: sudoku_settings

### REQ-PERSIST-002: Load Settings
- **Description**: Load settings on app init
- **Acceptance Criteria**:
  - Load from localStorage on startup
  - Apply theme immediately
  - Apply other settings to gameController
  - Handle empty/missing localStorage

### REQ-PERSIST-003: Theme Persistence
- **Description**: Theme persists across sessions
- **Acceptance Criteria**:
  - Save theme on THEME_CHANGED event
  - Restore theme on app load
  - Settings panel shows correct theme
