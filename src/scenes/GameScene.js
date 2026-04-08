import Phaser from 'phaser';
import { TILE_SIZE, PLAYER_SPEED, BLOCKING_TILES } from '../config.js';

// Player spritesheet frame indices (3 frames per direction row)
const FRAMES = {
  down:  [0, 1, 2],
  up:    [3, 4, 5],
  left:  [6, 7, 8],
  right: [9, 10, 11],
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  init(data) {
    this.mapDef = data.mapDef;
  }

  create() {
    const { tiles, width, height, startX, startY, name } = this.mapDef.data;

    // ── Tilemap ──────────────────────────────────────────────────────────────
    const map = this.make.tilemap({ data: tiles, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);
    this.groundLayer = map.createLayer(0, tileset, 0, 0);

    // Set collision for blocking tile IDs
    this.groundLayer.setCollision(BLOCKING_TILES);

    // ── Player ───────────────────────────────────────────────────────────────
    const px = startX * TILE_SIZE + TILE_SIZE / 2;
    const py = startY * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.physics.add.sprite(px, py, 'player', 1);
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    // Use a smaller physics body so the player fits through 1-tile gaps
    this.player.setBodySize(18, 18, true);

    // Register walk animations (only once per game session)
    this._createAnimsIfNeeded();

    // ── Physics ──────────────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.player, this.groundLayer);

    // ── Camera ───────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.fadeIn(400);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // ── Mobile D-pad ─────────────────────────────────────────────────────────
    this.dpad = { up: false, down: false, left: false, right: false };
    this._buildDpad();

    // ── HUD ──────────────────────────────────────────────────────────────────
    this._buildHUD(name);

    // ── Facing state ─────────────────────────────────────────────────────────
    this._facing = 'down';
    this._moving = false;
  }

  // ─── Animations ─────────────────────────────────────────────────────────────

  _createAnimsIfNeeded() {
    const makeFrames = (indices) => indices.map(f => ({ key: 'player', frame: f }));

    const defs = [
      { key: 'walk-down',  frames: [0, 1, 2, 1] },
      { key: 'walk-up',    frames: [3, 4, 5, 4] },
      { key: 'walk-left',  frames: [6, 7, 8, 7] },
      { key: 'walk-right', frames: [9, 10, 11, 10] },
    ];

    defs.forEach(({ key, frames }) => {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: makeFrames(frames),
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  }

  // ─── Mobile D-pad ────────────────────────────────────────────────────────────

  _buildDpad() {
    const { height } = this.scale;
    const btnR = 28;       // button radius
    const pad  = 34;       // distance from bottom-left edge
    const cx   = pad + btnR * 2;           // D-pad centre X (screen space)
    const cy   = height - pad - btnR * 2;  // D-pad centre Y (screen space)

    const dirs = [
      { dir: 'up',    ox: 0,              oy: -btnR * 2.2, label: '▲' },
      { dir: 'down',  ox: 0,              oy:  btnR * 2.2, label: '▼' },
      { dir: 'left',  ox: -btnR * 2.2,   oy: 0,           label: '◄' },
      { dir: 'right', ox:  btnR * 2.2,   oy: 0,           label: '►' },
    ];

    dirs.forEach(({ dir, ox, oy, label }) => {
      const bx = cx + ox;
      const by = cy + oy;

      // Use a Rectangle zone as the hit area (circles have unreliable hit detection)
      const hitZone = this.add.rectangle(bx, by, btnR * 2, btnR * 2, 0x000000, 0)
        .setScrollFactor(0)
        .setDepth(202)
        .setInteractive({ useHandCursor: false });

      // Visual circle (non-interactive, purely graphical)
      const circle = this.add.graphics()
        .setScrollFactor(0)
        .setDepth(200);
      const drawCircle = (fill, alpha) => {
        circle.clear();
        circle.fillStyle(fill, alpha);
        circle.fillCircle(bx, by, btnR);
        circle.lineStyle(2, 0xffffff, 0.6);
        circle.strokeCircle(bx, by, btnR);
      };
      drawCircle(0x000000, 0.55);

      this.add.text(bx, by, label, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

      hitZone.on('pointerdown', () => { this.dpad[dir] = true;  drawCircle(0x555555, 0.85); });
      hitZone.on('pointerup',   () => { this.dpad[dir] = false; drawCircle(0x000000, 0.55); });
      hitZone.on('pointerout',  () => { this.dpad[dir] = false; drawCircle(0x000000, 0.55); });
    });
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────────

  _buildHUD(mapName) {
    const { width } = this.scale;

    // Map name banner
    this.add.text(width / 2, 14, mapName, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(200);

    // Back button
    const back = this.add.text(10, 10, '← Menu', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#333333cc',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setStyle({ backgroundColor: '#555555cc' }));
    back.on('pointerout',  () => back.setStyle({ backgroundColor: '#333333cc' }));
    back.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0, false, (_cam, progress) => {
        if (progress === 1) this.scene.start('Menu');
      });
    });

    // Controls hint (disappears after 4 s)
    const hint = this.add.text(width / 2, 50, 'WASD / Arrows to move', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffff88',
      backgroundColor: '#00000099',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(200);

    this.time.delayedCall(3500, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 500, onComplete: () => hint.destroy() });
    });
  }

  // ─── Update ──────────────────────────────────────────────────────────────────

  update() {
    const { cursors, wasd, dpad, player } = this;

    let vx = 0, vy = 0;

    if (cursors.left.isDown  || wasd.left.isDown  || dpad.left)  vx = -PLAYER_SPEED;
    if (cursors.right.isDown || wasd.right.isDown || dpad.right) vx =  PLAYER_SPEED;
    if (cursors.up.isDown    || wasd.up.isDown    || dpad.up)    vy = -PLAYER_SPEED;
    if (cursors.down.isDown  || wasd.down.isDown  || dpad.down)  vy =  PLAYER_SPEED;

    // Normalise diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    player.setVelocity(vx, vy);

    const moving = vx !== 0 || vy !== 0;

    // Determine facing direction (prefer axis with larger magnitude)
    if (vx < 0)       this._facing = 'left';
    else if (vx > 0)  this._facing = 'right';
    else if (vy < 0)  this._facing = 'up';
    else if (vy > 0)  this._facing = 'down';

    if (moving) {
      player.anims.play(`walk-${this._facing}`, true);
    } else {
      player.anims.stop();
      // Show idle frame (middle frame of current direction)
      player.setFrame(FRAMES[this._facing][1]);
    }

    this._moving = moving;
  }
}
