# UX Feedback Requirements

## Overview
Defines requirements for user experience feedback on game actions.

## Requirements

### REQ-UX-001: New Game Update
- **Description**: UI updates immediately after starting new game
- **Acceptance Criteria**:
  - Grid displays new puzzle
  - Info panel resets (timer, progress, errors)
  - No page refresh required

### REQ-UX-002: Check Solution Feedback
- **Description**: User receives feedback when checking solution
- **Acceptance Criteria**:
  - Shows count of correct cells
  - Shows count of wrong cells
  - Prompts if no cells filled
  - Wrong cells highlighted in grid

### REQ-UX-003: Game Complete Celebration
- **Description**: User receives celebration when puzzle completed
- **Acceptance Criteria**:
  - Modal shown with 🎉 emoji
  - Message in Chinese (恭喜)
  - Triggered by game_completed event
  - Dismissible by button or backdrop click
