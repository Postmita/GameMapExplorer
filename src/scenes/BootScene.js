import Phaser from 'phaser';
import { TILE_SIZE, TILES } from '../config.js';

/**
 * BootScene: creates every texture the game needs programmatically,
 * so no external image files are required.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    this._buildTilesetTexture();
    this._buildPlayerTexture();
    this.scene.start('Menu');
  }

  // ─── Tileset ──────────────────────────────────────────────────────────────

  _buildTilesetTexture() {
    const S = TILE_SIZE; // 32
    const numTiles = 16;

    const canvas = document.createElement('canvas');
    canvas.width = S * numTiles;
    canvas.height = S;
    const ctx = canvas.getContext('2d');

    const drawTile = (id, fn) => {
      ctx.save();
      ctx.translate(id * S, 0);
      fn(ctx, S);
      ctx.restore();
    };

    // 0 – Grass
    drawTile(TILES.GRASS, (c, s) => {
      c.fillStyle = '#4a8c14'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#5ca01a';
      [[4,6],[12,14],[20,8],[8,22],[24,18],[16,28],[6,28]].forEach(([x,y]) => c.fillRect(x,y,2,3));
    });

    // 1 – Deep Water
    drawTile(TILES.WATER, (c, s) => {
      c.fillStyle = '#1a4cc8'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#2a5cd8'; c.fillRect(4,8,24,3); c.fillRect(0,18,20,3); c.fillRect(10,26,22,3);
      c.fillStyle = '#3a6ce8'; c.fillRect(5,9,8,1); c.fillRect(1,19,6,1); c.fillRect(11,27,7,1);
    });

    // 2 – Forest
    drawTile(TILES.FOREST, (c, s) => {
      c.fillStyle = '#2d6012'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#5a3a1a'; c.fillRect(12, 22, 8, 10);
      c.fillStyle = '#1a4a08'; c.beginPath(); c.moveTo(16,2); c.lineTo(4,24); c.lineTo(28,24); c.closePath(); c.fill();
      c.fillStyle = '#2a5a10'; c.beginPath(); c.moveTo(16,6); c.lineTo(6,22); c.lineTo(26,22); c.closePath(); c.fill();
      c.fillStyle = '#3a7a1a'; c.beginPath(); c.moveTo(16,8); c.lineTo(10,20); c.lineTo(22,20); c.closePath(); c.fill();
    });

    // 3 – Dirt Path
    drawTile(TILES.PATH, (c, s) => {
      c.fillStyle = '#c08840'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#b07830';
      [[4,6],[12,14],[20,8],[8,22],[24,18],[16,28]].forEach(([x,y]) => c.fillRect(x,y,3,2));
    });

    // 4 – Stone Wall
    drawTile(TILES.WALL, (c, s) => {
      c.fillStyle = '#5a5a5a'; c.fillRect(0, 0, s, s);
      for (let row = 0; row < 4; row++) {
        const y = row * 8;
        const offset = (row % 2 === 0) ? 0 : 8;
        for (let col = -1; col < 3; col++) {
          c.fillStyle = '#6a6a6a';
          c.fillRect(col * 16 + offset, y, 14, 6);
        }
      }
      c.fillStyle = '#4a4a4a';
      for (let row = 0; row < 4; row++) c.fillRect(0, row * 8 + 6, s, 2);
    });

    // 5 – Stone Floor
    drawTile(TILES.FLOOR, (c, s) => {
      c.fillStyle = '#8a8a8a'; c.fillRect(0, 0, s, s);
      c.strokeStyle = '#7a7a7a'; c.lineWidth = 1;
      for (let x = 0; x <= s; x += 16) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,s); c.stroke(); }
      for (let y = 0; y <= s; y += 16) { c.beginPath(); c.moveTo(0,y); c.lineTo(s,y); c.stroke(); }
    });

    // 6 – Sand / Desert
    drawTile(TILES.SAND, (c, s) => {
      c.fillStyle = '#e8c870'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#d8b860';
      [[5,5],[15,12],[25,7],[9,20],[19,26],[3,28],[27,22]].forEach(([x,y]) => c.fillRect(x,y,2,2));
    });

    // 7 – Mountain
    drawTile(TILES.MOUNTAIN, (c, s) => {
      c.fillStyle = '#888888'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#6a6a6a'; c.beginPath(); c.moveTo(16,2); c.lineTo(2,30); c.lineTo(30,30); c.closePath(); c.fill();
      c.fillStyle = '#e0e8f8'; c.beginPath(); c.moveTo(16,2); c.lineTo(10,14); c.lineTo(22,14); c.closePath(); c.fill();
      c.fillStyle = '#c8d8e8'; c.beginPath(); c.moveTo(16,4); c.lineTo(12,14); c.lineTo(20,14); c.closePath(); c.fill();
    });

    // 8 – Snow
    drawTile(TILES.SNOW, (c, s) => {
      c.fillStyle = '#d8e8f0'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#ffffff';
      [[6,5],[16,11],[26,4],[8,22],[20,18],[4,28],[28,27]].forEach(([x,y]) => {
        c.fillRect(x,y,3,1); c.fillRect(x+1,y-1,1,3);
      });
    });

    // 9 – Flowers
    drawTile(TILES.FLOWERS, (c, s) => {
      c.fillStyle = '#5a9024'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#6aa030';
      [[3,4],[12,13],[22,7]].forEach(([x,y]) => c.fillRect(x,y,2,3));
      [['#ff6688',4,6],['#ff88aa',16,14],['#ffcc44',8,24],['#ff9966',22,8],['#cc66ff',26,22]].forEach(([col,x,y]) => {
        c.fillStyle = col; c.fillRect(x,y,4,4); c.fillStyle='#ffff88'; c.fillRect(x+1,y+1,2,2);
      });
    });

    // 10 – Shallow Water
    drawTile(TILES.SHALLOW_WATER, (c, s) => {
      c.fillStyle = '#4a7adc'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#6a9aec'; c.fillRect(4,8,20,2); c.fillRect(0,18,16,2); c.fillRect(8,26,20,2);
    });

    // 11 – Lava
    drawTile(TILES.LAVA, (c, s) => {
      c.fillStyle = '#cc3300'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#ee5500'; c.fillRect(4,8,24,4); c.fillRect(0,18,20,4); c.fillRect(10,26,22,4);
      c.fillStyle = '#ffaa00'; c.fillRect(6,9,8,2); c.fillRect(2,20,6,2); c.fillRect(12,27,7,2);
    });

    // 12 – Building
    drawTile(TILES.BUILDING, (c, s) => {
      c.fillStyle = '#8a5a3a'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#aa2222'; c.beginPath(); c.moveTo(16,0); c.lineTo(0,14); c.lineTo(32,14); c.closePath(); c.fill();
      c.fillStyle = '#cc9966'; c.fillRect(2,14,28,18);
      c.fillStyle = '#6a3a1a'; c.fillRect(11,20,10,12);
      c.fillStyle = '#ffffaa'; c.fillRect(4,16,6,6); c.fillRect(22,16,6,6);
    });

    // 13 – Bridge
    drawTile(TILES.BRIDGE, (c, s) => {
      c.fillStyle = '#4a7adc'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#a07040';
      for (let y = 6; y <= 24; y += 8) c.fillRect(0, y, s, 6);
      c.fillStyle = '#805020';
      for (let x = 0; x < s; x += 8) c.fillRect(x, 6, 2, 18);
    });

    // 14 – Ice
    drawTile(TILES.ICE, (c, s) => {
      c.fillStyle = '#b0d0f0'; c.fillRect(0, 0, s, s);
      c.strokeStyle = '#80b0d0'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0,8); c.lineTo(s,24); c.stroke();
      c.beginPath(); c.moveTo(0,20); c.lineTo(s,4); c.stroke();
      c.beginPath(); c.moveTo(8,0); c.lineTo(24,s); c.stroke();
    });

    // 15 – Dark Forest
    drawTile(TILES.DARK_FOREST, (c, s) => {
      c.fillStyle = '#0e2604'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#2a5c0a'; c.beginPath(); c.moveTo(16,2); c.lineTo(2,28); c.lineTo(30,28); c.closePath(); c.fill();
      c.fillStyle = '#1a4a06'; c.beginPath(); c.moveTo(16,6); c.lineTo(6,26); c.lineTo(26,26); c.closePath(); c.fill();
    });

    this.textures.addCanvas('tiles', canvas);
  }

  // ─── Player spritesheet ───────────────────────────────────────────────────
  // Layout: 3 columns (idle, step-L, step-R) × 4 rows (down, up, left, right)
  // Frame numbers: down=0-2, up=3-5, left=6-8, right=9-11

  _buildPlayerTexture() {
    const S = TILE_SIZE; // 32
    const canvas = document.createElement('canvas');
    canvas.width = S * 3;   // 3 walk frames
    canvas.height = S * 4;  // 4 directions
    const ctx = canvas.getContext('2d');

    const DIRS = ['down', 'up', 'left', 'right'];
    const FRAMES = [0, -3, 3]; // leg offsets for idle / step-left / step-right

    DIRS.forEach((dir, dirIdx) => {
      FRAMES.forEach((legOff, frameIdx) => {
        const X = frameIdx * S;
        const Y = dirIdx * S;
        this._drawCharFrame(ctx, X, Y, S, dir, legOff);
      });
    });

    this.textures.addCanvas('player', canvas);

    // Register integer frames so Phaser animations can reference them
    const tex = this.textures.get('player');
    let n = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        tex.add(n++, 0, col * S, row * S, S, S);
      }
    }
  }

  _drawCharFrame(ctx, X, Y, S, dir, legOff) {
    const lLegY = Y + 22 + (legOff < 0 ? legOff : 0);
    const rLegY = Y + 22 + (legOff > 0 ? legOff : 0);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(X + 16, Y + 31, 8, 3, 0, 0, Math.PI * 2); ctx.fill();

    // Legs
    ctx.fillStyle = '#2a2a8a';
    ctx.fillRect(X + 9, lLegY, 6, 8);
    ctx.fillRect(X + 17, rLegY, 6, 8);

    // Shoes
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(X + 8, lLegY + 6, 8, 3);
    ctx.fillRect(X + 16, rLegY + 6, 8, 3);

    // Body / shirt
    ctx.fillStyle = '#3a6cc8';
    ctx.fillRect(X + 8, Y + 14, 16, 10);

    // Belt
    ctx.fillStyle = '#4a3010';
    ctx.fillRect(X + 8, Y + 22, 16, 2);

    // Head
    ctx.fillStyle = '#f0c080';
    ctx.fillRect(X + 8, Y + 4, 16, 12);

    // Hair
    ctx.fillStyle = '#5a3a10';
    ctx.fillRect(X + 8, Y + 4, 16, 4);
    if (dir === 'up') ctx.fillRect(X + 8, Y + 4, 16, 8); // More hair visible from back

    // Ears (sides)
    ctx.fillStyle = '#f0c080';
    if (dir === 'left')  { ctx.fillRect(X + 6,  Y + 8, 3, 5); }
    if (dir === 'right') { ctx.fillRect(X + 23, Y + 8, 3, 5); }

    // Eyes & face details
    if (dir === 'down') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(X + 10, Y + 11, 3, 3);
      ctx.fillRect(X + 19, Y + 11, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(X + 11, Y + 11, 2, 2);
      ctx.fillRect(X + 20, Y + 11, 2, 2);
    } else if (dir === 'left') {
      ctx.fillStyle = '#000000'; ctx.fillRect(X + 9, Y + 11, 3, 3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(X + 10, Y + 11, 2, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#000000'; ctx.fillRect(X + 20, Y + 11, 3, 3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(X + 21, Y + 11, 2, 2);
    }
    // 'up' direction: no eyes visible

    // Arms
    ctx.fillStyle = '#3a6cc8';
    if (dir === 'left' || dir === 'right') {
      ctx.fillStyle = '#f0c080';
      ctx.fillRect(dir === 'left' ? X + 5 : X + 22, Y + 15, 4, 7);
    } else {
      ctx.fillRect(X + 5, Y + 15, 4, 7);
      ctx.fillRect(X + 23, Y + 15, 4, 7);
    }
  }
}
