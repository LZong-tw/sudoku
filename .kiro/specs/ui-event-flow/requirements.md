# UI Event Flow Requirements

## Overview
Defines requirements for event-driven communication between UI components and game logic, matching the design of sudoku.html.

## Requirements

### REQ-UI-001: Keypad Number Input
- **Description**: When user clicks a number button (1-9), the selected cell should update with that number
- **Event Flow**: KeypadView → VALUE_CHANGED event → GameController.inputNumber() → GridView.updateGrid()
- **Acceptance Criteria**:
  - Clicking number button emits VALUE_CHANGED event with correct value
  - GameController receives and processes the input
  - Grid view updates to show the new number
  - Delete button (⌫) clears the cell

### REQ-UI-002: Cell Selection with Visual Feedback
- **Description**: When user clicks a grid cell, it should become selected with visual highlighting
- **Event Flow**: GridView → CELL_SELECTED event → GameController.selectCell()
- **Acceptance Criteria**:
  - Selected cell has green background (#4ecca3) and scale(1.05)
  - Related cells (same row/col/box) have highlight background (#233554)
  - Fixed cells (preset numbers) cannot be selected for editing

### REQ-UI-003: Input Validation Feedback
- **Description**: Immediate visual feedback when entering numbers
- **Acceptance Criteria**:
  - Correct input: pop animation
  - Wrong input: red background (#e94560) + shake animation + error count increment

### REQ-UI-004: Game Info Panel
- **Description**: Display game status information
- **Acceptance Criteria**:
  - Shows: Difficulty, Time, Errors, Progress
  - Timer updates every second
  - Progress shows percentage of filled cells

### REQ-UI-005: Layout Structure
- **Description**: UI layout matching sudoku.html
- **Acceptance Criteria**:
  - Title at top
  - Info panel and grid side by side (flex wrap)
  - Controls below (difficulty select, new game, check)
  - Numpad at bottom (5 columns: 1-5, 6-9, ⌫)

### REQ-UI-006: CSS Class Consistency
- **Description**: CSS class names must match between JS and CSS files
- **Acceptance Criteria**:
  - Grid cells use `.sudoku-cell` class
  - States: `.selected`, `.highlighted`, `.fixed`, `.valid`, `.invalid`, `.complete`
