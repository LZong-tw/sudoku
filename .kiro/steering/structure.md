# Project Structure

## Root Directory

```
.
├── .git/                    # Git repository
├── .gitignore              # Git ignore patterns
├── .kiro/                   # Kiro configuration and specs
│   ├── hooks/              # Agent hooks
│   ├── specs/              # Feature specifications
│   │   └── sudoku-polish/  # Sudoku polishing spec
│   └── steering/           # Steering documents (this file)
├── src/                     # Source code (modular architecture)
│   ├── core/               # Core game logic modules
│   ├── features/           # Feature modules (statistics, achievements, etc.)
│   ├── storage/            # Data persistence modules
│   ├── ui/                 # UI component modules
│   └── utils/              # Utility modules (EventBus, ErrorHandler)
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   ├── property/           # Property-based tests
│   ├── integration/        # Integration tests
│   └── helpers/            # Test utilities and arbitraries
├── dist/                    # Build output (generated)
├── node_modules/           # Dependencies (generated)
├── sudoku/                  # Legacy subdirectory with nested git repo
├── package.json            # Project dependencies and scripts
├── vitest.config.js        # Test framework configuration
├── README.md               # Project documentation
└── sudoku.html             # Legacy single-file application
```

## File Organization

### Modular Architecture (New - sudoku-polish feature)

The enhanced application uses a modular architecture with ES6 modules:

**Source Structure:**
```
src/
├── core/                    # Core game logic
│   ├── grid-model.js       # Grid data structure and validation
│   ├── history-manager.js  # Undo/redo functionality
│   ├── hint-system.js      # Hint generation
│   ├── timer.js            # Game timer
│   └── validator.js        # Sudoku validation logic
├── features/                # Feature modules
│   ├── statistics-tracker.js    # Game statistics
│   ├── achievement-system.js    # Achievement tracking
│   ├── daily-challenge.js       # Daily challenge mode
│   └── puzzle-library.js        # Puzzle collection
├── storage/                 # Data persistence
│   ├── storage-manager.js  # localStorage wrapper
│   └── data-validator.js   # Data validation
├── ui/                      # UI components
│   ├── grid-view.js        # Grid rendering
│   ├── keypad-view.js      # Number pad
│   ├── settings-panel.js   # Settings UI
│   ├── victory-animation.js # Victory screen
│   └── theme-manager.js    # Theme switching
├── utils/                   # Utilities
│   ├── event-bus.js        # Pub/sub event system
│   ├── error-handler.js    # Error handling
│   └── sound-manager.js    # Sound effects (optional)
├── game-controller.js       # Main game controller
└── main.js                  # Application entry point
```

**Test Structure:**
```
tests/
├── unit/                    # Unit tests for specific modules
├── property/                # Property-based tests (fast-check)
├── integration/             # End-to-end integration tests
└── helpers/
    ├── arbitraries.js      # fast-check generators
    └── test-utils.js       # Test helper functions
```

### Legacy Single-File Architecture

The original `sudoku.html` contains:
- **HTML structure**: Grid container, info panel, controls, numpad
- **CSS styles**: Inline `<style>` block with component-based organization
- **JavaScript logic**: Inline `<script>` block with functional modules

## Conventions

### New Modular Code (src/)
- **ES6 Modules**: Use import/export for module dependencies
- **JSDoc Comments**: All public functions and classes documented
- **Class-based**: Object-oriented design with clear responsibilities
- **Type Safety**: JSDoc type annotations for better IDE support
- **Testing**: Comprehensive unit and property-based tests
- **Error Handling**: Graceful degradation with ErrorHandler
- **Event-Driven**: EventBus for decoupled module communication

### Legacy Code (sudoku.html)
- **No external files**: All assets inline
- **No dependencies**: Pure vanilla JavaScript
- **Functional style**: Functions are standalone, minimal global state
- **CSS naming**: Semantic class names (`.cell`, `.fixed`, `.selected`, etc.)
- **Data format**: Puzzles stored as 81-character strings (`.` for empty cells)
