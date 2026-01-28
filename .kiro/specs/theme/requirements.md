# Theme Toggle Requirements

## Overview
Defines requirements for the theme toggle feature.

## Requirements

### REQ-THEME-001: CSS Variables
- **Description**: Theme uses CSS custom properties
- **Variables**:
  - --bg-color: page background
  - --text-color: text color
  - --cell-bg: grid cell background
  - --cell-selected: selected cell color
  - --cell-highlighted: highlighted cell color
  - --cell-error: error cell color
  - --panel-bg: panel background
  - --border-color: border color
  - --accent-color: accent color
  - --btn-bg: button background
  - --btn-text: button text color
  - --btn-secondary-bg: secondary button background
  - --btn-secondary-text: secondary button text
  - --grid-bg: grid background
  - --modal-bg: modal background
  - --text-muted: muted text color

### REQ-THEME-002: Theme Definitions
- **Description**: Light and dark themes defined
- **Light theme**: 
  - --bg-color: #ffffff
  - --text-color: #333333
  - --accent-color: #4a90e2
  - --cell-selected: #bbdefb
  - --cell-highlighted: #e3f2fd
- **Dark theme**: 
  - --bg-color: #1a1a2e
  - --text-color: #eee
  - --accent-color: #4ecca3
  - --cell-selected: #4ecca3
  - --cell-highlighted: #233554

### REQ-THEME-003: Theme Change Event
- **Description**: Settings panel emits THEME_CHANGED
- **Acceptance Criteria**:
  - Event includes { theme: 'light' | 'dark' }
  - main.js listens and calls themeManager.setTheme()
  - Theme applies immediately via CSS variables

### REQ-THEME-004: Theme Persistence
- **Description**: Theme preference saved to storage
- **Acceptance Criteria**:
  - Theme saved on change
  - Theme restored on page load

### REQ-THEME-005: Settings Panel Sync
- **Description**: Settings panel shows current theme
- **Acceptance Criteria**:
  - Get current theme from themeManager before showing
  - Update settings panel with current theme
  - Select dropdown reflects actual theme

### REQ-THEME-006: Complete Light Theme
- **Description**: Light theme fully styled
- **Acceptance Criteria**:
  - All UI elements use CSS variables
  - No hardcoded dark theme colors in styles.css
  - Light theme provides good contrast and readability
  - Buttons, modals, panels all respond to theme change
