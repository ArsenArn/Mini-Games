# Worm Sort

Static browser game. Open `index.html` directly or through the root `../worm_sort.html` redirect.

## File Map

- `index.html` - DOM structure and script order.
- `styles.css` - all layout, theme, and responsive styles.
- `src/config.js` - constants, colors, directions, animation/input tuning.
- `src/save.js` - localStorage campaign progress.
- `src/utils.js` - RNG, shared helpers, board validation and board queries.
- `src/rules.js` - container actions, worm movement, standard/growing rule behavior.
- `src/levels.js` - campaign settings and procedural level generation.
- `src/renderer.js` - canvas layout and drawing.
- `src/game.js` - UI bindings, input handling, game loop, import/export, screen state.
- `src/main.js` - startup.

Campaign starts in `growing worm` mode by default from the menu. Standard mode is still available in the campaign rules selector.
