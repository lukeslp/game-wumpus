# Hunt the Wumpus

A modern take on Gregory Yob's 1973 cave adventure. Navigate a dodecahedron of 20 rooms, read sensory clues, and shoot the Wumpus before it finds you.

Play it: [dr.eamer.dev/games/wumpus/](https://dr.eamer.dev/games/wumpus/)

## How It Works

The cave is a dodecahedron -- 20 rooms, each connected to exactly three neighbors, rendered as a Schlegel diagram. You start in a random room. Somewhere in the dark: one Wumpus, two bottomless pits, and two colonies of super bats.

### Clues

Adjacent hazards produce sensory warnings:

- **Stench** (skull) -- the Wumpus is next door
- **Breeze** (wave) -- a pit is nearby
- **Flutter** (bat) -- bats are close

### Moving

Click an adjacent room on the cave map, or press **W**, **A**, or **S** to move to the first, second, or third neighbor. Toggle to **Aim** mode to plan a shot instead.

### Shooting

Switch to Aim mode, click up to five rooms to plot an arrow path, then fire. If a target room isn't adjacent to the arrow's current position, the arrow ricochets into a random neighbor. Hit the Wumpus and you win. Miss, and the Wumpus might relocate. You get five arrows.

## Technical Details

- Vanilla JavaScript, no build step, no framework
- Dodecahedron graph with Schlegel diagram visualization
- Dark gaming theme with CSS custom properties and design tokens
- Semantic HTML5 with ARIA live regions
- Responsive down to 320px
- Keyboard and mouse/touch support
- `prefers-reduced-motion` respected
- Save/load via localStorage

## Credits

Original game design by Gregory Yob (1973).

## License

MIT -- see [LICENSE](LICENSE)

## Author

**Luke Steuber**
[lukesteuber.com](https://lukesteuber.com) | [@lukeslp](https://github.com/lukeslp) | [@lukesteuber.com on Bluesky](https://bsky.app/profile/lukesteuber.com)
