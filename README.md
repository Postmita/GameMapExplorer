# Game Map Explorer

A Phaser 3 browser game that lets you walk around hand-crafted maps inspired by classic video games. Supports full keyboard controls and a mobile on-screen D-pad.

## Features

- **Three explorable maps** built with a pixel-art tile system:
  - **Overworld** – vast lands with forests, mountains, towns and an ocean
  - **Underground Dungeon** – dark corridors, rooms and lava pits
  - **Ancient Town** – walled town with buildings, markets and a garden
- **Keyboard controls** — WASD or Arrow keys
- **Mobile D-pad** — four on-screen buttons for touch devices
- **Player character** with directional walk animations
- **Tilemap collision** — water, walls, forests and lava block movement
- Smooth camera follow with fade transitions between menu and maps
- No external assets required — all graphics are generated programmatically

## Getting Started

### Prerequisites

- Node.js 18+

### Install & run

```bash
npm install
npm run dev        # starts the Vite dev server at http://localhost:5173
```

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move   | WASD or Arrow Keys | D-pad buttons (▲▼◄►) |
| Menu   | — | Tap **← Menu** in-game |

## Project Structure

```
src/
├── main.js                 – Phaser game configuration
├── config.js               – Tile IDs, blocking tiles, player speed
├── scenes/
│   ├── BootScene.js        – Generates tileset & player textures at startup
│   ├── MenuScene.js        – Map selection screen
│   └── GameScene.js        – Tilemap, player movement, camera, D-pad HUD
└── maps/
    └── maps.js             – All three map definitions (data + start positions)
```
