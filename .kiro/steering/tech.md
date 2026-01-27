# Technology Stack

## Architecture

The project consists of two versions:
1. **Legacy**: Single-file `sudoku.html` (original implementation)
2. **Enhanced**: Modular architecture with build system (sudoku-polish feature)

## Tech Stack

### Enhanced Version (sudoku-polish)

- **Frontend**: Vanilla JavaScript (ES6+ modules)
- **Markup**: HTML5
- **Styling**: CSS3 with CSS Grid, Flexbox, and CSS Variables
- **Build Tool**: Vite (development server and bundler)
- **Testing**: Vitest + fast-check (property-based testing)
- **Storage**: localStorage API
- **Audio**: Web Audio API (optional, for sound effects)

### Legacy Version (sudoku.html)

- **Frontend**: Vanilla JavaScript (ES6+)
- **Markup**: HTML5
- **Styling**: CSS3 with CSS Grid and Flexbox
- **Deployment**: Static file (can be opened directly in browser)

## Code Organization

### Enhanced Version (src/)

Modular architecture with ES6 modules:
- **Core modules**: Grid logic, history, hints, timer
- **Feature modules**: Statistics, achievements, daily challenges
- **Storage modules**: Data persistence and validation
- **UI modules**: Views, panels, animations
- **Utility modules**: EventBus, ErrorHandler, SoundManager
- **Testing**: Comprehensive unit and property-based tests

### Legacy Version (sudoku.html)

All code in a single file:
- CSS in `<style>` tag (scoped styling with BEM-like conventions)
- JavaScript in `<script>` tag (functional programming style)
- No external dependencies or imports

## Common Commands

### Enhanced Version

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

### Legacy Version

```bash
# Run the application
open sudoku.html  # macOS
# or simply open the file in any web browser

# No installation required
# No build process
# No package manager
```

## Browser Compatibility

### Enhanced Version
- Modern browsers with ES6 module support
- Chrome 61+, Firefox 60+, Safari 11+, Edge 79+
- Requires JavaScript enabled
- localStorage support recommended

### Legacy Version
- Modern browsers with ES6+ support
- CSS Grid and Flexbox
- ES6+ JavaScript features (arrow functions, template literals, destructuring)
- CSS animations and transitions

## Development Workflow

1. **Development**: Use `npm run dev` to start Vite dev server with hot reload
2. **Testing**: Use `npm test` to run unit and property-based tests
3. **Building**: Use `npm run build` to create optimized production bundle
4. **Deployment**: Deploy the `dist/` folder to any static hosting service
