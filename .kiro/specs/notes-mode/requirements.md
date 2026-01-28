# Notes Mode Requirements

## Overview
Defines requirements for the notes/pencil mark feature.

## Requirements

### REQ-NOTES-001: Notes Button
- **Description**: Toggle button to enable/disable notes mode
- **Acceptance Criteria**:
  - Button displays ✏️ icon
  - Tooltip: "筆記模式：標記候選數字"
  - Visual indicator when active (green background)

### REQ-NOTES-002: Notes Functionality
- **Description**: Mark candidate numbers in cells
- **Acceptance Criteria**:
  - When notes mode active, clicking number adds/removes note
  - Multiple notes can exist in one cell
  - Notes display as 3x3 grid of small numbers in cell
  - Notes cleared when actual value entered
  - noteMode state syncs between keypad and gameController
  - Cannot add notes to cell that already has a value

### REQ-NOTES-003: Mobile Guidance
- **Description**: Help text for mobile users (no hover tooltips)
- **Acceptance Criteria**:
  - Help text visible below keypad on mobile (<768px)
  - Text: "✏️ 筆記模式：點擊切換，可在格子標記多個候選數字"
  - Hidden on desktop (use tooltips instead)

### REQ-NOTES-004: Desktop Guidance
- **Description**: Tooltips for desktop users
- **Acceptance Criteria**:
  - All control buttons have title attribute
  - Tooltip appears on hover
  - Includes keyboard shortcut where applicable

### REQ-NOTES-005: Visual Feedback
- **Description**: Clear indication of notes mode state
- **Acceptance Criteria**:
  - Active: button background #4ecca3 (accent color)
  - Inactive: button background #16213e (dark)
  - Transition animation on state change
