import { TILE_SIZE, WORLD_SIZE, Tile, Vector2 } from '../types';

export class WorldManager {
  map: Tile[][] = [];
  dayTime: number = 0; // 0 to 2400 (pseudo minutes)
  weather: 'CLEAR' | 'RAIN' | 'STORM' = 'CLEAR';
  weatherTimer: number = 0;

  constructor() {
    this.generateMap();
  }

  generateMap() {
    this.map = [];
    for (let y = 0; y < WORLD_SIZE; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < WORLD_SIZE; x++) {
        // Simple noise-like generation based on distance from center
        const dx = x - WORLD_SIZE / 2;
        const dy = y - WORLD_SIZE / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let type = 'grass';
        let walkable = true;
        let resource: string | undefined;

        if (dist > WORLD_SIZE * 0.4) {
          type = 'water';
          walkable = false;
        } else if (Math.random() > 0.95) {
          type = 'rock';
          resource = 'STONE';
          walkable = false;
        } else if (Math.random() > 0.9) {
          type = 'tree';
          resource = 'WOOD';
          walkable = false;
        } else if (Math.random() > 0.98) {
          type = 'iron_vein';
          resource = 'IRON';
          walkable = false;
        }

        // Secret areas: distant islands or specific clusters
        if (x === 5 && y === 5) {
          type = 'dungeon_entrance';
          walkable = true;
        }

        row.push({ type, walkable, resource });
      }
      this.map.push(row);
    }
  }

  getTile(x: number, y: number): Tile | null {
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    if (tx < 0 || tx >= WORLD_SIZE || ty < 0 || ty >= WORLD_SIZE) return null;
    return this.map[ty][tx];
  }

  update(dt: number) {
    // Progress day/night cycle (2400 units per cycle)
    this.dayTime = (this.dayTime + dt * 0.1) % 2400;

    // Weather logic
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      const rand = Math.random();
      if (rand > 0.8) this.weather = 'RAIN';
      else if (rand > 0.95) this.weather = 'STORM';
      else this.weather = 'CLEAR';
      this.weatherTimer = 10000 + Math.random() * 20000;
    }
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile ? tile.walkable : false;
  }
}
