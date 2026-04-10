/** Size (px) of a single map tile */
export const TILE_SIZE = 32;

/** Pixel speed of the player character */
export const PLAYER_SPEED = 160;

/** Tile ID constants – must match BootScene's tileset column order */
export const TILES = {
  GRASS: 0,
  WATER: 1,
  FOREST: 2,
  PATH: 3,
  WALL: 4,
  FLOOR: 5,
  SAND: 6,
  MOUNTAIN: 7,
  SNOW: 8,
  FLOWERS: 9,
  SHALLOW_WATER: 10,
  LAVA: 11,
  BUILDING: 12,
  BRIDGE: 13,
  ICE: 14,
  DARK_FOREST: 15,
};

/** IDs that should block player movement */
export const BLOCKING_TILES = [
  TILES.WATER,
  TILES.FOREST,
  TILES.WALL,
  TILES.MOUNTAIN,
  TILES.LAVA,
  TILES.BUILDING,
  TILES.DARK_FOREST,
];
