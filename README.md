# Sudoku Game - Enhanced Edition

A browser-based Sudoku game with a clean, modern interface and comprehensive features including hints, undo/redo, statistics tracking, achievements, and more.

## Features

- 🎮 Three difficulty levels (Easy, Medium, Hard)
- 💡 Smart hint system
- ↩️ Undo/redo functionality
- 📝 Note-taking mode
- ✅ Auto-check mode with real-time validation
- 📊 Statistics tracking and best times
- 🏆 Achievement system
- 📅 Daily challenge mode
- 🎨 Light/dark theme support
- ♿ Full accessibility support (ARIA, keyboard navigation)
- 📱 Mobile-optimized responsive design

## Project Structure

```
.
├── src/
│   ├── core/           # Core game logic modules
│   ├── features/       # Feature modules (statistics, achievements, etc.)
│   ├── storage/        # Data persistence layer
│   ├── ui/             # UI components
│   └── utils/          # Utility modules (EventBus, ErrorHandler)
├── tests/
│   ├── unit/           # Unit tests
│   ├── property/       # Property-based tests
│   ├── integration/    # Integration tests
│   └── helpers/        # Test utilities
├── package.json
├── vitest.config.js
└── README.md
```

## Development

### Prerequisites

- Node.js 18+ (for development and testing)
- Modern web browser

### Installation

```bash
# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Development Server

```bash
# Start development server
npm run dev
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **EventBus**: Publish/subscribe system for decoupled module communication
- **ErrorHandler**: Global error handling with graceful degradation
- **Core Modules**: GridModel, HistoryManager, HintSystem, Timer
- **Feature Modules**: StatisticsTracker, AchievementSystem, DailyChallenge
- **Storage Layer**: StorageManager with localStorage persistence
- **UI Layer**: Separate view components for grid, controls, settings, etc.

## Testing Strategy

The project uses a dual testing approach:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across all inputs using fast-check

All property-based tests run with a minimum of 100 iterations to ensure comprehensive coverage.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.

```bash
npm test
```
