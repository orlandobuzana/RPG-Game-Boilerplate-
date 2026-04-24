import { InventoryItem } from './types';

export interface Recipe {
  id: string;
  name: string;
  result: string;
  ingredients: { itemId: string; quantity: number }[];
  type: 'weapon' | 'armor' | 'potion' | 'ship';
}

export const ITEMS: Record<string, Partial<InventoryItem>> = {
  WOOD: { name: 'Wood', type: 'resource' },
  STONE: { name: 'Stone', type: 'resource' },
  IRON: { name: 'Iron Ore', type: 'resource' },
  FIBER: { name: 'Fiber', type: 'resource' },
  FISH_RAW: { name: 'Raw Fish', type: 'resource' },
  STAR_DUST: { name: 'Star Dust', type: 'resource' },

  IRON_INGOT: { name: 'Iron Ingot', type: 'resource' },

  WOODEN_SWORD: { name: 'Wooden Sword', type: 'weapon', stats: { damage: 5 } },
  IRON_SWORD: { name: 'Iron Sword', type: 'weapon', stats: { damage: 12 } },
  STAR_BLADE: { name: 'Star Blade', type: 'weapon', stats: { damage: 30 } },

  LEATHER_ARMOR: { name: 'Leather Armor', type: 'armor', stats: { defense: 2 } },
  IRON_ARMOR: { name: 'Iron Armor', type: 'armor', stats: { defense: 8 } },

  HEALTH_POTION: { name: 'Health Potion', type: 'potion', stats: { heal: 20 } },

  SPACE_CHASSIS: { name: 'Space Chassis', type: 'resource' },
  WARP_CORE: { name: 'Warp Core', type: 'resource' },
  SPACESHIP: { name: 'Mark I Spaceship', type: 'tool' }, // Technically a vehicle
};

export const RECIPES: Recipe[] = [
  {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    result: 'WOODEN_SWORD',
    ingredients: [{ itemId: 'WOOD', quantity: 3 }],
    type: 'weapon',
  },
  {
    id: 'iron_ingot',
    name: 'Smelt Iron',
    result: 'IRON_INGOT',
    ingredients: [{ itemId: 'IRON', quantity: 2 }, { itemId: 'WOOD', quantity: 1 }],
    type: 'potion', // Using potion category for processing for now
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    result: 'IRON_SWORD',
    ingredients: [{ itemId: 'IRON_INGOT', quantity: 3 }, { itemId: 'WOOD', quantity: 1 }],
    type: 'weapon',
  },
  {
    id: 'health_potion',
    name: 'Health Potion',
    result: 'HEALTH_POTION',
    ingredients: [{ itemId: 'FIBER', quantity: 2 }, { itemId: 'FISH_RAW', quantity: 1 }],
    type: 'potion',
  },
  {
    id: 'spaceship',
    name: 'Construct Spaceship',
    result: 'SPACESHIP',
    ingredients: [
      { itemId: 'IRON_INGOT', quantity: 10 },
      { itemId: 'STAR_DUST', quantity: 5 }
    ],
    type: 'ship',
  }
];
