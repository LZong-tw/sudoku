# Layout and Responsive Design Requirements

## Overview
Defines layout structure and responsive behavior for optimal UX on desktop and mobile.

## Requirements

### REQ-LAYOUT-001: Overall Structure
- **Description**: App should have clear visual hierarchy
- **Structure**:
  1. Header (title)
  2. Game container (info panel + grid side by side)
  3. Controls (difficulty, new game, check)
  4. Keypad (number input)
- **Acceptance Criteria**:
  - All elements visible without scrolling on desktop (768px+)
  - Logical top-to-bottom flow on mobile

### REQ-LAYOUT-002: Grid Dimensions
- **Description**: Sudoku grid sizing
- **Acceptance Criteria**:
  - Desktop: 340px width
  - Mobile: min(90vw, 360px)
  - Maintains 1:1 aspect ratio
  - 9x9 cells with 2px gap

### REQ-LAYOUT-003: Responsive Breakpoints
- **Description**: Layout adapts to screen size
- **Breakpoints**:
  - Desktop: >= 768px (side-by-side layout)
  - Mobile: < 600px (stacked layout)
- **Acceptance Criteria**:
  - Desktop: info panel and grid side by side
  - Mobile: info panel above grid, full width

### REQ-LAYOUT-004: Info Panel
- **Description**: Game status display
- **Items**: Difficulty, Time, Errors, Progress
- **Acceptance Criteria**:
  - Min width 200px
  - Label on left, value on right
  - Value in accent color (#4ecca3)

### REQ-LAYOUT-005: Keypad Layout
- **Description**: Number input and tool buttons
- **Acceptance Criteria**:
  - 14 buttons total: 1-9, ⌫, ↶, ↷, 💡, ✏️
  - Desktop (601px+): 9 buttons first row, 5 second row
  - Mobile (<600px): 7 buttons per row
  - Min touch target 40x40px

### REQ-LAYOUT-006: Cell States
- **Description**: Visual feedback for cell states
- **States**:
  - `.selected`: Green background (#4ecca3), scale 1.05
  - `.highlighted`: Light blue (#233554)
  - `.fixed`: Gray text (#888)
  - `.valid`: Pop animation
  - `.invalid`: Red background (#e94560), shake animation
  - `.complete`: Green background (#2d6a4f)

### REQ-LAYOUT-007: One-Screen Experience
- **Description**: All game elements visible without scrolling
- **Acceptance Criteria**:
  - Desktop (768px+): All elements in viewport
  - Compact spacing and sizing
  - No unnecessary whitespace
