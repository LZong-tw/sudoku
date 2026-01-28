# Real-time Validation and Info Panel Requirements

## Overview
Defines requirements for real-time answer validation and game info display.

## Requirements

### REQ-VAL-001: Real-time Validation
- **Description**: Validate user input immediately against solution
- **Acceptance Criteria**:
  - Wrong answers show red background (#e94560)
  - Correct answers show normal background
  - Fixed cells are not validated
  - Validation happens on every input

### REQ-VAL-002: Error Counter
- **Description**: Track number of wrong answers
- **Acceptance Criteria**:
  - Errors count displayed in info panel
  - Increments when wrong answer entered
  - Persists across session

### REQ-INFO-001: Timer Display
- **Description**: Show elapsed game time
- **Acceptance Criteria**:
  - Format: MM:SS
  - Updates every second
  - Pauses when game paused
  - Resets on new game
  - Starts on first input (not on new game)

### REQ-INFO-002: Progress Display
- **Description**: Show completion percentage
- **Acceptance Criteria**:
  - Format: X%
  - Calculates filled cells / 81
  - Updates on every input
  - 100% when all cells filled

### REQ-INFO-003: Difficulty Display
- **Description**: Show current difficulty level
- **Acceptance Criteria**:
  - Maps to Chinese: easy→簡單, medium→中等, hard→困難
  - Updates on new game

### REQ-EVENT-001: Event Separation
- **Description**: Separate keypad input from game state changes
- **Acceptance Criteria**:
  - keypad_input: user presses number button
  - VALUE_CHANGED: game state updated
  - Prevents event loops
