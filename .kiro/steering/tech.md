# Technology Stack

## Architecture

Single-page application using vanilla JavaScript, HTML5, and CSS3. No build system, bundlers, or external dependencies required.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Markup**: HTML5
- **Styling**: CSS3 with CSS Grid and Flexbox
- **Deployment**: Static file (can be opened directly in browser)

## Code Organization

All code is contained in a single `sudoku.html` file with inline styles and scripts:
- CSS in `<style>` tag (scoped styling with BEM-like conventions)
- JavaScript in `<script>` tag (functional programming style)
- No external dependencies or imports

## Common Commands

Since this is a static HTML application, there are no build or compilation steps:

```bash
# Run the application
open sudoku.html  # macOS
# or simply open the file in any web browser

# No installation required
# No build process
# No package manager
```

## Browser Compatibility

Targets modern browsers with support for:
- CSS Grid and Flexbox
- ES6+ JavaScript features (arrow functions, template literals, destructuring)
- CSS animations and transitions
