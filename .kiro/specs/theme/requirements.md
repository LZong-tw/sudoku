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

### REQ-THEME-002: Theme Definitions
- **Description**: Light and dark themes defined
- **Light theme**: light backgrounds, dark text
- **Dark theme**: dark backgrounds, light text

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
