export enum GameState {
  TITLE,
  PLAYING,
  INVENTORY,
  CRAFTING,
  FISHING,
  SPACE_FLIGHT,
  PLANET_TRANSITION,
}

export enum WeatherType {
  CLEAR,
  RAIN,
  STORM,
  SNOW,
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: string;
  position: Vector2;
  health: number;
  maxHealth: number;
  sprite?: string;
}

export interface Player extends Entity {
  name: string;
  gender: 'male' | 'female';
  inventory: InventoryItem[];
  equippedWeapon?: string;
  equippedArmor?: string;
  stamina: number;
  maxStamina: number;
  level: number;
  experience: number;
  maxExperience: number;
}

export interface DamageNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  life: number;
  color: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'resource' | 'weapon' | 'armor' | 'potion' | 'tool';
  quantity: number;
  stats?: any;
}

export interface Tile {
  type: string;
  walkable: boolean;
  resource?: string;
}

export const TILE_SIZE = 32;
export const WORLD_SIZE = 64; // cells
