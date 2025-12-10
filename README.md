# Hunt the Wumpus

A modern, minimalist remake of the classic 1973 text adventure game. Navigate through dangerous caverns, avoid hazards, and hunt down the fearsome Wumpus using logic and deduction.

## About

Hunt the Wumpus was one of the earliest computer games, created by Gregory Yob in 1973. This version features:

- **Neumorphic design** - Soft, tactile interface with gentle shadows
- **Grid-based gameplay** - 5×5 cave system with procedurally generated hazards
- **Sensory clues** - Detect nearby dangers through stenches, breezes, and sounds
- **Strategic shooting** - Limited arrows that travel in straight lines
- **Full accessibility** - Keyboard navigation and screen reader support

## How to Play

### Objective
Find and shoot the Wumpus before running out of arrows or falling into a hazard.

### Controls

**Mouse/Touch:**
- Click directional buttons (▲▼◀▶) to move or shoot
- Toggle between Move/Shoot modes using the action buttons
- Click "New Cavern" to restart with a fresh cave layout

**Keyboard:**
- Arrow keys or WASD to move/shoot in a direction
- Currently selected mode (Move or Shoot) determines the action
- Click mode buttons to switch between movement and shooting

### Hazards

- **Wumpus (W)** - The creature you're hunting. If you enter its room, game over!
- **Bottomless Pits (⚠)** - Fall in and you're lost forever
- **Super Bats (🦇)** - Grab you and drop you in a random room

### Clues

- **Stench (💀)** - The Wumpus is in an adjacent room
- **Breeze (〰)** - A pit is nearby
- **Fluttering (🦇)** - Bats are in a neighboring room

### Strategy Tips

1. **Map as you go** - Keep track of which rooms you've visited and what clues you found
2. **Use logic** - If you smell a stench from two different rooms, the Wumpus is where they overlap
3. **Conserve arrows** - You only have 5 shots. Don't waste them!
4. **Watch for movement** - The Wumpus sometimes moves after missed shots
5. **Plan your path** - Avoid cornering yourself near known hazards

### Game Stats

- **Arrows** - Remaining shots (starts at 5)
- **Turns** - Number of moves you've made
- **State** - Current game status (Exploring/Victory/Doomed)

## Technical Details

**Built with:**
- Vanilla JavaScript (no frameworks)
- CSS Grid and custom properties
- Semantic HTML5
- ARIA live regions for accessibility

**Features:**
- Fully responsive design (mobile-friendly)
- Keyboard and mouse/touch support
- Procedural cave generation
- Neumorphic UI with Google Fonts (Outfit)

## Accessibility

This game is designed to be accessible to all players:

- Full keyboard navigation
- ARIA labels and live regions for screen readers
- High contrast focus indicators
- Semantic HTML structure
- Responsive text sizing with `clamp()`

## Browser Support

Works in all modern browsers:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

Original game design by Gregory Yob (1973)

## License

MIT License - see [LICENSE](LICENSE) file

## Author

**Luke Steuber**

- Website: [lukesteuber.com](https://lukesteuber.com)
- GitHub: [@lukeslp](https://github.com/lukeslp)
- Bluesky: [@lukesteuber.com](https://bsky.app/profile/lukesteuber.com)
