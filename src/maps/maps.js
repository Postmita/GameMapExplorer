import { TILES, BLOCKING_TILES } from '../config.js';

export { BLOCKING_TILES };

const T = TILES;

// ─── Helper builders ────────────────────────────────────────────────────────

function emptyMap(w, h, fill = T.GRASS) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function rect(map, x1, y1, x2, y2, tile) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      if (map[y] && map[y][x] !== undefined) map[y][x] = tile;
}

function line_h(map, x1, x2, y, tile) {
  for (let x = x1; x <= x2; x++) if (map[y]?.[x] !== undefined) map[y][x] = tile;
}

function line_v(map, x, y1, y2, tile) {
  for (let y = y1; y <= y2; y++) if (map[y]?.[x] !== undefined) map[y][x] = tile;
}

// ─── Overworld (64 × 48) ────────────────────────────────────────────────────

function buildOverworld() {
  const W = 64, H = 48;
  const map = emptyMap(W, H, T.WATER);

  // ── Main continent ──
  rect(map, 3, 3, 58, 44, T.GRASS);

  // Northern mountains & snow
  rect(map, 3, 3, 58, 10, T.MOUNTAIN);
  rect(map, 6, 3, 22, 7, T.SNOW);
  rect(map, 40, 3, 56, 6, T.SNOW);

  // Western dark forest
  rect(map, 3, 11, 13, 38, T.DARK_FOREST);
  rect(map, 14, 11, 18, 32, T.FOREST);

  // Central & eastern grassland (already set)

  // Southern desert
  rect(map, 14, 36, 52, 44, T.SAND);

  // Eastern shallow coast
  rect(map, 52, 11, 58, 44, T.SHALLOW_WATER);
  rect(map, 56, 11, 63, 47, T.WATER);

  // Northern shallow coast
  rect(map, 3, 0, 63, 2, T.WATER);
  rect(map, 3, 3, 63, 5, T.SHALLOW_WATER);
  rect(map, 3, 3, 63, 3, T.WATER);

  // ── Lake (center-right) ──
  rect(map, 38, 18, 46, 26, T.SHALLOW_WATER);
  rect(map, 40, 19, 44, 25, T.WATER);

  // ── River flowing south from lake ──
  for (let y = 27; y <= 35; y++) { map[y][41] = T.WATER; map[y][42] = T.WATER; }
  for (let y = 27; y <= 35; y++) { map[y][40] = T.SHALLOW_WATER; map[y][43] = T.SHALLOW_WATER; }

  // ── Flowers ──
  [[22,13],[27,16],[33,13],[38,15],[44,17],[23,23],[32,21],[20,29],[36,30],[44,24],[48,20]].forEach(([x,y]) => {
    if (map[y]?.[x] === T.GRASS) map[y][x] = T.FLOWERS;
  });

  // ── Main paths ──
  // East–west road
  line_h(map, 14, 58, 28, T.PATH);
  // North–south road
  line_v(map, 28, 11, 35, T.PATH);
  line_v(map, 29, 11, 35, T.PATH);
  // Mountain pass (north road widened)
  line_v(map, 28, 8, 11, T.PATH);
  line_v(map, 29, 8, 11, T.PATH);
  // Road around lake
  line_h(map, 32, 39, 22, T.PATH);
  line_h(map, 44, 52, 28, T.PATH);

  // Bridge over river
  map[28][41] = T.BRIDGE; map[28][42] = T.BRIDGE;
  map[28][40] = T.PATH; map[28][43] = T.PATH;

  // ── Town (x=24-36, y=22-32) ──
  rect(map, 22, 21, 38, 33, T.FLOOR);
  // Main streets through town
  line_h(map, 22, 38, 28, T.PATH);
  line_v(map, 29, 21, 33, T.PATH);
  line_v(map, 30, 21, 33, T.PATH);

  // Buildings (4 corners of town)
  rect(map, 23, 22, 26, 25, T.BUILDING);
  rect(map, 23, 29, 26, 32, T.BUILDING);
  rect(map, 33, 22, 37, 25, T.BUILDING);
  rect(map, 33, 29, 37, 32, T.BUILDING);
  // Inn (south center)
  rect(map, 27, 30, 32, 33, T.BUILDING);
  // Inn doorway
  map[33][29] = T.FLOOR; map[33][30] = T.FLOOR;

  // ── Ice plateau (northeast mountains) ──
  rect(map, 42, 3, 56, 9, T.ICE);

  return { tiles: map, width: W, height: H, startX: 28, startY: 27, name: 'Overworld' };
}

// ─── Dungeon (48 × 36) ──────────────────────────────────────────────────────

function buildDungeon() {
  const W = 48, H = 36;
  const map = emptyMap(W, H, T.WALL);

  const room = (x1, y1, x2, y2) => rect(map, x1, y1, x2, y2, T.FLOOR);
  const ch   = (x1, x2, y)      => line_h(map, x1, x2, y, T.FLOOR);
  const cv   = (x, y1, y2)      => line_v(map, x, y1, y2, T.FLOOR);

  // Entry room
  room(2, 2, 11, 9);
  // Northwest room
  room(2, 13, 12, 21);
  // Central large room
  room(16, 10, 30, 27);
  // Northeast room
  room(34, 2, 46, 12);
  // East room
  room(33, 16, 46, 27);
  // Southeast lava room
  room(26, 30, 46, 34);
  // Southwest room
  room(2, 25, 13, 34);

  // Corridors
  cv(7, 10, 13);          // Entry → NW room
  ch(13, 16, 16);         // NW room → Central
  ch(12, 34, 6);          // Entry → NE room
  ch(31, 34, 20);         // Central → East room
  cv(36, 28, 30);         // East room → SE lava room
  ch(14, 26, 30);         // SW room → SE lava room (bottom)
  cv(8, 22, 25);          // NW room → SW room

  // Lava hazard (filling most of SE room)
  rect(map, 27, 31, 45, 33, T.LAVA);
  // Safe walkway through lava room
  line_h(map, 26, 46, 30, T.FLOOR);
  line_v(map, 36, 30, 34, T.FLOOR);
  line_v(map, 37, 30, 34, T.FLOOR);

  return { tiles: map, width: W, height: H, startX: 5, startY: 5, name: 'Underground Dungeon' };
}

// ─── Town (40 × 32) ─────────────────────────────────────────────────────────

function buildTown() {
  const W = 40, H = 32;
  const map = emptyMap(W, H, T.GRASS);

  // Town interior (stone floor)
  rect(map, 2, 2, 37, 29, T.FLOOR);

  // Outer wall
  line_h(map, 2, 37, 2, T.WALL);
  line_h(map, 2, 37, 29, T.WALL);
  line_v(map, 2, 2, 29, T.WALL);
  line_v(map, 37, 2, 29, T.WALL);

  // Gates (openings in wall)
  [19, 20, 21].forEach(x => { map[2][x] = T.FLOOR; map[29][x] = T.FLOOR; });
  [14, 15, 16].forEach(y => { map[y][2] = T.FLOOR; map[y][37] = T.FLOOR; });

  // Main streets
  line_h(map, 3, 36, 15, T.PATH);   // East–west
  line_v(map, 20, 3, 28, T.PATH);   // North–south
  line_v(map, 21, 3, 28, T.PATH);

  // ── Buildings ──
  // Town hall (west of center)
  rect(map, 6, 10, 16, 13, T.BUILDING);
  map[13][11] = T.FLOOR; map[13][12] = T.FLOOR;

  // Church / temple (east of center)
  rect(map, 24, 10, 34, 13, T.BUILDING);
  // Bell tower
  rect(map, 28, 7, 30, 9, T.BUILDING);
  map[13][27] = T.FLOOR; map[13][28] = T.FLOOR;

  // Inn (NW)
  rect(map, 3, 3, 11, 8, T.BUILDING);
  map[8][7] = T.FLOOR; map[8][8] = T.FLOOR;

  // Shop (NE)
  rect(map, 13, 3, 19, 8, T.BUILDING);
  map[8][15] = T.FLOOR; map[8][16] = T.FLOOR;

  // Houses (SW)
  rect(map, 3, 17, 9, 21, T.BUILDING);  map[21][6] = T.FLOOR; map[21][7] = T.FLOOR;
  rect(map, 3, 23, 9, 27, T.BUILDING);  map[27][6] = T.FLOOR; map[27][7] = T.FLOOR;

  // Market stalls (SE)
  rect(map, 24, 17, 29, 20, T.BUILDING); map[20][26] = T.FLOOR;
  rect(map, 31, 17, 36, 20, T.BUILDING); map[20][33] = T.FLOOR;
  rect(map, 24, 22, 29, 26, T.BUILDING); map[26][26] = T.FLOOR;
  rect(map, 31, 22, 36, 26, T.BUILDING); map[26][33] = T.FLOOR;

  // ── Garden (NE corner inside walls) ──
  rect(map, 24, 3, 36, 9, T.GRASS);
  // Fence around garden
  line_h(map, 23, 36, 3, T.WALL);
  line_h(map, 23, 36, 9, T.WALL);
  line_v(map, 23, 3, 9, T.WALL);
  line_v(map, 36, 3, 9, T.WALL);
  map[3][29] = T.FLOOR; map[3][30] = T.FLOOR; // Gate into garden
  // Trees & flowers in garden
  [[25,4],[28,4],[31,4],[34,4],[25,7],[28,7],[31,7],[34,7]].forEach(([x,y]) => map[y][x] = T.FOREST);
  [[26,5],[27,6],[29,5],[30,6],[32,5],[33,6],[35,5],[26,7],[29,7],[32,7],[35,7]].forEach(([x,y]) => map[y][x] = T.FLOWERS);

  // ── Fountain (center crossroads) ──
  map[15][20] = T.SHALLOW_WATER; map[15][21] = T.SHALLOW_WATER;

  // ── Flower borders along main streets ──
  [[18,14],[18,16],[22,14],[22,16],[19,13],[20,13],[19,17],[20,17]].forEach(([x,y]) => {
    if (map[y][x] === T.FLOOR) map[y][x] = T.FLOWERS;
  });

  // ── Outer trees (grass perimeter) ──
  [[0,0],[1,3],[0,8],[1,13],[0,18],[1,24],[0,28]].forEach(([x,y]) => map[y][x] = T.FOREST);
  [[39,2],[38,7],[39,12],[38,19],[39,25],[38,30]].forEach(([x,y]) => map[y][x] = T.FOREST);
  [[6,0],[12,0],[17,0],[25,0],[31,0],[37,0]].forEach(([x,y]) => map[y][x] = T.FOREST);
  [[6,31],[12,31],[17,31],[25,31],[31,31],[37,31]].forEach(([x,y]) => map[y][x] = T.FOREST);

  return { tiles: map, width: W, height: H, startX: 20, startY: 15, name: 'Ancient Town' };
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const MAPS = [
  {
    id: 'overworld',
    name: 'Overworld',
    description: 'A vast land with forests, mountains, and ocean',
    color: 0x4a8c14,
    data: buildOverworld(),
  },
  {
    id: 'dungeon',
    name: 'Underground Dungeon',
    description: 'Dark corridors, mysterious chambers and lava pits',
    color: 0x5a5a5a,
    data: buildDungeon(),
  },
  {
    id: 'town',
    name: 'Ancient Town',
    description: 'A peaceful walled town with gardens and markets',
    color: 0x8a8a8a,
    data: buildTown(),
  },
];
