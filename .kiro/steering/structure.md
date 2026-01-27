# Project Structure

## Root Directory

```
.
├── .git/                    # Git repository
├── .kiro/                   # Kiro configuration and specs
│   ├── hooks/              # Agent hooks
│   ├── specs/              # Feature specifications
│   │   └── sudoku-polish/  # Sudoku polishing spec
│   └── steering/           # Steering documents (this file)
├── sudoku/                  # Subdirectory with nested git repo
├── README.md               # Project documentation
└── sudoku.html             # Main application file
```

## File Organization

### Single-File Architecture

The entire application is contained in `sudoku.html`:
- **HTML structure**: Grid container, info panel, controls, numpad
- **CSS styles**: Inline `<style>` block with component-based organization
- **JavaScript logic**: Inline `<script>` block with functional modules

### Code Sections in sudoku.html

1. **Styles** (top to bottom):
   - Reset and base styles
   - Layout containers (body, container, grid)
   - Cell styling and states (selected, highlight, fixed, valid, invalid, complete)
   - Animations (pop, shake)
   - Controls (buttons, select, numpad)

2. **Markup**:
   - Header (h1)
   - Info panel (difficulty, timer, mistakes, progress)
   - Grid container (populated by JavaScript)
   - Controls (difficulty selector, action buttons)
   - Numpad (1-9 and delete)

3. **JavaScript** (functional organization):
   - Data: `puzzles` object, game state variables
   - Grid management: `createGrid()`, `selectCell()`
   - Game logic: `newGame()`, `enterNum()`, `checkSolution()`, `checkComplete()`
   - Solver: `solveSudoku()` (backtracking algorithm)
   - UI updates: `updateProgress()`
   - Event handlers: keyboard navigation and input

## Conventions

- **No external files**: All assets inline (no CSS/JS files, no images)
- **No dependencies**: Pure vanilla JavaScript, no frameworks or libraries
- **Functional style**: Functions are standalone, minimal global state
- **CSS naming**: Semantic class names (`.cell`, `.fixed`, `.selected`, etc.)
- **Data format**: Puzzles stored as 81-character strings (`.` for empty cells)
