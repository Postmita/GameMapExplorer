import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config.js';

// Player spritesheet frame indices (3 frames per direction row)
const FRAMES = {
  down:  [0, 1, 2],
  up:    [3, 4, 5],
  left:  [6, 7, 8],
  right: [9, 10, 11],
};

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMap' });
  }

  init(data) {
    this.mapDef = data.mapDef;
  }

  preload() {
    const { imageKey, imagePath } = this.mapDef.data;
    this._imageLoadFailed = false;
    if (!this.textures.exists(imageKey)) {
      this.load.on('loaderror', (file) => {
        if (file.key === imageKey) this._imageLoadFailed = true;
      });
      this.load.image(imageKey, imagePath);
    }
  }

  create() {
    const { imageKey, startX, startY, name, zoom = 2, imagePath } = this.mapDef.data;

    // ── Guard: show error screen if image failed to load ─────────────────────
    if (this._imageLoadFailed || !this.textures.exists(imageKey)) {
      this._showLoadError(imagePath ?? imageKey);
      return;
    }

    // ── Map image ────────────────────────────────────────────────────────────
    const mapImg = this.add.image(0, 0, imageKey).setOrigin(0, 0);
    const mapW = mapImg.width;
    const mapH = mapImg.height;

    // ── Player ───────────────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(startX, startY, 'player', 1);
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(18, 18, true);

    this._createAnimsIfNeeded();

    // ── Physics ──────────────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, mapW, mapH);

    // ── Camera ───────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(zoom);
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
  }

  // ─── Error screen ────────────────────────────────────────────────────────────

  _showLoadError(imagePath) {
    const { width, height } = this.scale;
    const fileName = String(imagePath).split('/').pop();

    this.add.rectangle(width / 2, height / 2, width - 40, 180, 0x1a1a2e, 0.95)
      .setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.add.text(width / 2, height / 2 - 55, '⚠  Map image not found', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff5555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    this.add.text(width / 2, height / 2 - 20, `Copy the PNG to:`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    this.add.text(width / 2, height / 2 + 5, `public/maps/${fileName}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffff88',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const back = this.add.text(width / 2, height / 2 + 52, '← Back to Menu', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffffff',
      backgroundColor: '#333355', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301)
      .setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setStyle({ backgroundColor: '#5555aa' }));
    back.on('pointerout',  () => back.setStyle({ backgroundColor: '#333355' }));
    back.on('pointerdown', () => this.scene.start('Menu'));
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
        this.anims.create({ key, frames: makeFrames(frames), frameRate: 8, repeat: -1 });
      }
    });
  }

  // ─── Mobile D-pad ────────────────────────────────────────────────────────────

  _buildDpad() {
    const { height } = this.scale;
    const btnR = 28;
    const pad  = 90;
    const cx   = pad + btnR * 2;
    const cy   = height - pad - btnR * 2 - 100;

    const dirs = [
      { dir: 'up',    ox: 0,             oy: -btnR * 2.2, label: '▲' },
      { dir: 'down',  ox: 0,             oy:  btnR * 2.2, label: '▼' },
      { dir: 'left',  ox: -btnR * 2.2,   oy: 0,           label: '◄' },
      { dir: 'right', ox:  btnR * 2.2,   oy: 0,           label: '►' },
    ];

    dirs.forEach(({ dir, ox, oy, label }) => {
      const bx = cx + ox;
      const by = cy + oy;

      const hitZone = this.add.rectangle(bx, by, btnR * 2, btnR * 2, 0x000000, 0)
        .setScrollFactor(0)
        .setDepth(202)
        .setInteractive({ useHandCursor: false });

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

    // Title banner (centred, pushed right of the back button)
    this.add.text(width / 2, 14, mapName, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(250);

    // Back button – depth 260 so it always sits above every world element
    const back = this.add.text(14, 14, '← Menu', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#333333cc',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(260).setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setStyle({ backgroundColor: '#555555cc' }));
    back.on('pointerout',  () => back.setStyle({ backgroundColor: '#333333cc' }));
    back.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0, false, (_cam, progress) => {
        if (progress === 1) this.scene.start('Menu');
      });
    });

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

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    player.setVelocity(vx, vy);

    const moving = vx !== 0 || vy !== 0;

    if (vx < 0)       this._facing = 'left';
    else if (vx > 0)  this._facing = 'right';
    else if (vy < 0)  this._facing = 'up';
    else if (vy > 0)  this._facing = 'down';

    if (moving) {
      player.anims.play(`walk-${this._facing}`, true);
    } else {
      player.anims.stop();
      player.setFrame(FRAMES[this._facing][1]);
    }
  }
}
