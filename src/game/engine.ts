import { WorldManager } from './world';
import { EntityManager } from './entities';
import { GameState, Vector2, TILE_SIZE } from '../types';
import { RECIPES, ITEMS } from '../constants';

export class GameEngine {
  world: WorldManager;
  entities: EntityManager;
  state: GameState = GameState.TITLE;
  inputs: Record<string, boolean> = {};
  
  // Space system
  currentPlanet: string = 'Home';
  discoveredPlanets: string[] = ['Home', 'Vulcan', 'Frost', 'Neon'];
  spaceMap: { name: string, pos: Vector2 }[] = [
    { name: 'Home', pos: { x: 0, y: 0 } },
    { name: 'Vulcan', pos: { x: 500, y: 200 } },
    { name: 'Frost', pos: { x: -300, y: 400 } },
    { name: 'Neon', pos: { x: 800, y: -300 } },
  ];
  spaceShipPos: Vector2 = { x: 0, y: 0 };

  actionLog: string[] = ["[16:00] System initialized", "[16:01] Welcome to Astra"];

  constructor() {
    this.world = new WorldManager();
    this.entities = new EntityManager();
    this.setupListeners();
  }

  log(msg: string) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.actionLog.unshift(`[${time}] ${msg}`);
      if (this.actionLog.length > 5) this.actionLog.pop();
  }

  setupListeners() {
    window.addEventListener('keydown', e => this.inputs[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.inputs[e.key.toLowerCase()] = false);
  }

  update(dt: number) {
    if (this.state === GameState.PLAYING) {
      this.world.update(dt);
      this.entities.update(dt, this.inputs, this.world, this);
      
      // Interaction checks
      if (this.inputs.e) {
          const tile = this.world.getTile(this.entities.player.position.x, this.entities.player.position.y);
          if (tile?.type === 'dungeon_entrance') {
              this.enterDungeon();
          } else if (tile?.type === 'water') {
              this.fish();
          } else {
              this.entities.harvest(this.world);
          }
      }
    } else if (this.state === GameState.SPACE_FLIGHT) {
        this.updateSpaceFlight(dt);
    }
  }

  enterDungeon() {
      this.log("Entering Hidden Archive...");
      // Create a small, cramped world for the dungeon
      this.world = new WorldManager();
      this.world.map.forEach(row => row.forEach(tile => {
          if (Math.random() > 0.4) {
              tile.type = 'rock';
              tile.walkable = false;
          } else {
              tile.type = 'grass'; // Floor
              tile.walkable = true;
          }
      }));
      this.entities.player.position = { x: TILE_SIZE * 5, y: TILE_SIZE * 5 };
      // Spawn extra skeletons
      for(let i=0; i<10; i++) {
          this.entities.enemies.push({
              id: `skeleton_dungeon_${i}`,
              type: 'skeleton',
              position: { x: Math.random() * 500, y: Math.random() * 500 },
              health: 50, maxHealth: 50, speed: 0.9, aggroRange: 300, damage: 10
          });
      }
  }

  fish() {
      // Simple chance to get fish
      if (Math.random() > 0.8) {
          this.entities.addToInventory('FISH_RAW', 1);
      }
  }

  updateSpaceFlight(dt: number) {
      const speed = 2;
      if (this.inputs.w) this.spaceShipPos.y -= speed;
      if (this.inputs.s) this.spaceShipPos.y += speed;
      if (this.inputs.a) this.spaceShipPos.x -= speed;
      if (this.inputs.d) this.spaceShipPos.x += speed;

      // Check for landing
      for (const p of this.spaceMap) {
          const dx = p.pos.x - this.spaceShipPos.x;
          const dy = p.pos.y - this.spaceShipPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) {
              if (p.name !== this.currentPlanet) {
                  this.landOnPlanet(p.name);
              }
          }
      }
  }

  landOnPlanet(planetName: string) {
      this.log(`Landing on ${planetName}...`);
      this.currentPlanet = planetName;
      this.world = new WorldManager(); // Regenerate for the new planet
      // Maybe different themes based on planetName
      this.state = GameState.PLAYING;
      this.entities.player.position = { x: 1000, y: 1000 };
  }

  craft(recipeId: string) {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return false;

    // Check ingredients
    for (const ing of recipe.ingredients) {
      const invItem = this.entities.player.inventory.find(i => i.id === ing.itemId);
      if (!invItem || invItem.quantity < ing.quantity) return false;
    }

    // Consume
    for (const ing of recipe.ingredients) {
      const invItem = this.entities.player.inventory.find(i => i.id === ing.itemId);
      invItem!.quantity -= ing.quantity;
    }

    // Add result
    this.entities.addToInventory(recipe.result, 1);

    if (recipe.result === 'SPACESHIP') {
        this.log("Spaceship constructed! Launch capability UNLOCKED.");
    } else {
        const itemData = ITEMS[recipe.result];
        if (itemData?.type === 'weapon') {
            this.entities.player.equippedWeapon = recipe.result;
            this.log(`Crafted and equipped ${recipe.name}`);
        } else {
            this.log(`Crafted ${recipe.name}`);
        }
    }

    return true;
  }

  startFishing() {
      if (this.world.getTile(this.entities.player.position.x, this.entities.player.position.y)?.type === 'water') {
          this.state = GameState.FISHING;
          // Fishing logic handled in UI/Specific system
      }
  }
}
