# UI Event Flow Requirements

## Overview
Defines requirements for event-driven communication between UI components and game logic.

## Requirements

### REQ-UI-001: Keypad Number Input
- **Description**: When user clicks a number button (1-9), the selected cell should update with that number
- **Event Flow**: KeypadView → VALUE_CHANGED event → GameController.inputNumber() → GridView.updateGrid()
- **Acceptance Criteria**:
  - Clicking number button emits VALUE_CHANGED event with correct value
  - GameController receives and processes the input
  - Grid view updates to show the new number

### REQ-UI-002: Cell Selection
- **Description**: When user clicks a grid cell, it should become selected and highlighted
- **Event Flow**: GridView → CELL_SELECTED event → GameController.selectCell()
- **Acceptance Criteria**:
  - Clicking cell emits CELL_SELECTED event with row/col
  - Selected cell has visual highlight (background color change)
  - Related cells (same row/col/box) have secondary highlight

### REQ-UI-003: Undo/Redo Actions
- **Description**: Undo and redo buttons should revert/replay user actions
- **Event Flow**: KeypadView → UNDO/REDO event → GameController.undo()/redo() → GridView.updateGrid()
- **Acceptance Criteria**:
  - Undo button emits UNDO event
  - Redo button emits REDO event
  - Grid updates after undo/redo

### REQ-UI-004: Hint System
- **Description**: Hint button should reveal a correct number for the selected cell
- **Event Flow**: KeypadView → HINT_USED event → GameController.useHint() → GridView.updateGrid()
- **Acceptance Criteria**:
  - Hint button emits HINT_USED event
  - Hint counter increments
  - Correct value appears in selected cell

### REQ-UI-005: CSS Class Consistency
- **Description**: CSS class names must match between JS and CSS files
- **Acceptance Criteria**:
  - Grid cells use `.sudoku-cell` class (not `.cell`)
  - Grid container uses `.sudoku-grid` class
  - Keypad buttons use `.keypad-btn` class

### REQ-UI-006: Grid Layout
- **Description**: Grid should be centered and properly sized
- **Acceptance Criteria**:
  - Grid is horizontally centered
  - Grid width is responsive: `min(90vw, 400px)`
  - Grid maintains 1:1 aspect ratio
  - 3x3 box borders are visible
