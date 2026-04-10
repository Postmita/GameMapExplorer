import Phaser from 'phaser';
import { MAPS } from '../maps/maps.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create() {
    const { width, height } = this.scale;

    // ── Background ──────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    // Gradient-style sky-to-ground
    bg.fillGradientStyle(0x0a1a3a, 0x0a1a3a, 0x1a3a0a, 0x1a3a0a, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative stars
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height * 0.5);
      const s = Phaser.Math.Between(1, 3);
      bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1.0));
      bg.fillRect(x, y, s, s);
    }

    // ── Title ────────────────────────────────────────────────────────────────
    this.add.text(width / 2, 60, '🗺  Game Map Explorer', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 100, 'Choose a map and explore!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#aaccff',
    }).setOrigin(0.5);

    // ── Controls hint ────────────────────────────────────────────────────────
    this.add.text(width / 2, height - 30, 'WASD / Arrow keys to move  •  On mobile use the D-pad buttons', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // ── Map cards ────────────────────────────────────────────────────────────
    const cardW = 200;
    const cardH = 140;
    const gap = 30;
    const totalW = MAPS.length * cardW + (MAPS.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const cardY = height / 2 - cardH / 2 + 20;

    MAPS.forEach((mapDef, i) => {
      const cx = startX + i * (cardW + gap);
      this._createCard(cx, cardY, cardW, cardH, mapDef);
    });
  }

  _createCard(x, y, w, h, mapDef) {
    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x1a2a3a, 0.9);
    card.fillRoundedRect(x, y, w, h, 10);
    card.lineStyle(2, mapDef.color, 1);
    card.strokeRoundedRect(x, y, w, h, 10);

    // Colour swatch
    const swatch = this.add.graphics();
    swatch.fillStyle(mapDef.color, 1);
    swatch.fillRoundedRect(x + 10, y + 10, w - 20, 50, 6);
    // Simple terrain preview dots
    for (let di = 0; di < 12; di++) {
      swatch.fillStyle(Phaser.Math.Between(0, 1) ? 0xffffff : 0x000000, 0.15);
      swatch.fillCircle(
        x + 20 + (di % 6) * 27,
        y + 28 + Math.floor(di / 6) * 14,
        5,
      );
    }

    // Map name
    this.add.text(x + w / 2, y + 72, mapDef.name, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Description
    this.add.text(x + w / 2, y + 92, mapDef.description, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
      wordWrap: { width: w - 16 },
      align: 'center',
    }).setOrigin(0.5, 0);

    // Play button
    const btnY = y + h - 26;
    const btn = this.add.graphics();
    btn.fillStyle(mapDef.color, 1);
    btn.fillRoundedRect(x + 10, btnY, w - 20, 22, 5);

    const btnLabel = this.add.text(x + w / 2, btnY + 11, '▶  Explore', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Invisible hit area
    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      card.clear();
      card.fillStyle(0x2a3a4a, 0.95);
      card.fillRoundedRect(x, y, w, h, 10);
      card.lineStyle(3, 0xffffff, 1);
      card.strokeRoundedRect(x, y, w, h, 10);
    });

    zone.on('pointerout', () => {
      card.clear();
      card.fillStyle(0x1a2a3a, 0.9);
      card.fillRoundedRect(x, y, w, h, 10);
      card.lineStyle(2, mapDef.color, 1);
      card.strokeRoundedRect(x, y, w, h, 10);
    });

    zone.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0, false, (_cam, progress) => {
        if (progress === 1) {
          this.scene.start(mapDef.sceneKey ?? 'Game', { mapDef });
        }
      });
    });

    return zone;
  }
}
