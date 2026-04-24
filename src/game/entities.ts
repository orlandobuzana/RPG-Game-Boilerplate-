import { Vector2, Player, InventoryItem, TILE_SIZE, WORLD_SIZE, DamageNumber } from '../types';
import { ITEMS } from '../constants';

export class EntityManager {
  player: Player;
  enemies: any[] = [];
  resources: any[] = [];
  damageNumbers: DamageNumber[] = [];
  fishingState: { active: boolean; progress: number; target: number } | null = null;
  attackCooldown: number = 0;

  constructor() {
    this.player = {
      id: 'player',
      type: 'player',
      name: 'Vane',
      gender: 'male',
      position: { x: TILE_SIZE * WORLD_SIZE / 2, y: TILE_SIZE * WORLD_SIZE / 2 },
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      level: 1,
      experience: 0,
      maxExperience: 100,
      inventory: [
        { id: 'WOOD', name: 'Wood', type: 'resource', quantity: 2 },
        { id: 'STONE', name: 'Stone', type: 'resource', quantity: 1 }
      ],
    };

    this.spawnInitialEnemies();
  }

  spawnInitialEnemies() {
    const types = ['slime', 'skeleton', 'robot'];
    for (let i = 0; i < 15; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        this.enemies.push({
            id: `enemy_${i}`,
            type,
            position: { 
                x: Math.random() * 2000, 
                y: Math.random() * 2000 
            },
            health: type === 'slime' ? 20 : type === 'skeleton' ? 40 : 100,
            maxHealth: type === 'slime' ? 20 : type === 'skeleton' ? 40 : 100,
            speed: type === 'slime' ? 0.5 : 0.8,
            aggroRange: 200,
            damage: type === 'slime' ? 2 : type === 'skeleton' ? 5 : 15
        });
    }
  }

  update(dt: number, inputs: any, world: any, engine: any) {
    this.handleMovement(inputs, world, dt);
    this.handleCombat(inputs, dt, engine);
    this.updateEnemies(dt, world);
    this.updateDamageNumbers(dt);
  }

  updateDamageNumbers(dt: number) {
    this.damageNumbers.forEach(dn => {
      dn.y -= 0.5 * dt;
      dn.life -= 0.02 * dt;
    });
    this.damageNumbers = this.damageNumbers.filter(dn => dn.life > 0);
  }

  handleMovement(inputs: any, world: any, dt: number) {
    const speed = 2.5;
    const move: Vector2 = { x: 0, y: 0 };
    if (inputs.w) move.y -= 1;
    if (inputs.s) move.y += 1;
    if (inputs.a) move.x -= 1;
    if (inputs.d) move.x += 1;

    if (move.x !== 0 || move.y !== 0) {
      const len = Math.sqrt(move.x * move.x + move.y * move.y);
      const nx = (move.x / len) * speed;
      const ny = (move.y / len) * speed;

      const nextX = this.player.position.x + nx;
      const nextY = this.player.position.y + ny;

      // Collision check
      if (world.isWalkable(nextX, this.player.position.y)) {
        this.player.position.x = nextX;
      }
      if (world.isWalkable(this.player.position.x, nextY)) {
        this.player.position.y = nextY;
      }
    }
  }

  handleCombat(inputs: any, dt: number, engine: any) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt * 16.66;
    }

    if (inputs.space && this.player.stamina > 5 && this.attackCooldown <= 0) {
      this.player.stamina -= 5;
      this.attackCooldown = 300; 

      let weaponBonus = 0;
      if (this.player.equippedWeapon) {
        const weapon = this.player.inventory.find(i => i.id === this.player.equippedWeapon);
        if (weapon?.stats?.damage) {
          weaponBonus = weapon.stats.damage;
        }
      }

      const attackRange = 75;
      const damage = 10 + (this.player.level * 3) + weaponBonus;
      
      this.enemies.forEach(enemy => {
          const dx = enemy.position.x - this.player.position.x;
          const dy = enemy.position.y - this.player.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < attackRange) {
              enemy.health -= damage;
              const kb = 45;
              enemy.position.x += (dx / dist) * kb;
              enemy.position.y += (dy / dist) * kb;
              
              this.damageNumbers.push({
                id: Math.random().toString(),
                value: Math.floor(damage),
                x: enemy.position.x,
                y: enemy.position.y - 20,
                life: 1,
                color: weaponBonus > 0 ? '#60a5fa' : 'white'
              });

              if (enemy.health <= 0) {
                const exp = enemy.type === 'robot' ? 60 : (enemy.type === 'skeleton' ? 30 : 15);
                this.gainExp(exp, engine);
                engine.log(`Eliminated ${enemy.type}. +${exp} EXP`);
              }
          }
      });
    }
    
    this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 0.15 * dt);
  }

  gainExp(amount: number, engine: any) {
    this.player.experience += amount;
    if (this.player.experience >= this.player.maxExperience) {
      this.player.level++;
      this.player.experience -= this.player.maxExperience;
      this.player.maxExperience = Math.floor(this.player.maxExperience * 1.5);
      this.player.health = this.player.maxHealth;
      engine.log(`LEVEL UP! Now Level ${this.player.level}`);
    }
  }

  updateEnemies(dt: number, world: any) {
      this.enemies = this.enemies.filter(e => e.health > 0);
      
      // Rare Respawn
      if (this.enemies.length < 15 && Math.random() > 0.998) {
        const types = ['slime', 'skeleton', 'robot'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.enemies.push({
            id: `enemy_respawn_${Date.now()}`,
            type,
            position: { 
                x: this.player.position.x + (Math.random() - 0.5) * 1500, 
                y: this.player.position.y + (Math.random() - 0.5) * 1500 
            },
            health: type === 'slime' ? 20 : type === 'skeleton' ? 40 : 100,
            maxHealth: type === 'slime' ? 20 : type === 'skeleton' ? 40 : 100,
            speed: type === 'slime' ? 0.6 : 0.9,
            aggroRange: 250,
            damage: type === 'slime' ? 3 : type === 'skeleton' ? 8 : 20
        });
      }

      this.enemies.forEach(enemy => {
          const dx = this.player.position.x - enemy.position.x;
          const dy = this.player.position.y - enemy.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < enemy.aggroRange && dist > 10) {
              const nx = (dx / dist) * enemy.speed;
              const ny = (dy / dist) * enemy.speed;
              
              const nextX = enemy.position.x + nx;
              const nextY = enemy.position.y + ny;

              if (world.isWalkable(nextX, nextY)) {
                  enemy.position.x = nextX;
                  enemy.position.y = nextY;
              }
          }

          if (dist < 20) {
              const dmg = enemy.damage / 60;
              this.player.health -= dmg;
              // Enemies back off slightly after "hitting"
              enemy.position.x -= (dx / dist) * 15;
              enemy.position.y -= (dy / dist) * 15;
          }
      });
  }

  addToInventory(itemId: string, qty: number = 1) {
    const existing = this.player.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.quantity += qty;
    } else {
      const itemData = ITEMS[itemId];
      if (itemData) {
        this.player.inventory.push({
          id: itemId,
          name: itemData.name!,
          type: itemData.type!,
          quantity: qty,
          stats: itemData.stats
        });
      }
    }
  }

  harvest(world: any) {
      const playerTile = world.getTile(this.player.position.x, this.player.position.y);
      // Check neighbors
      const neighbors = [
          { x: 0, y: 0 }, { x: TILE_SIZE, y: 0 }, { x: -TILE_SIZE, y: 0 },
          { x: 0, y: TILE_SIZE }, { x: 0, y: -TILE_SIZE }
      ];

      for (const n of neighbors) {
          const tile = world.getTile(this.player.position.x + n.x, this.player.position.y + n.y);
          if (tile && tile.resource) {
              this.addToInventory(tile.resource, 1);
              return true;
          }
          if (tile && tile.type === 'dungeon_entrance') {
              // Extract stardust from ancient archives
              if (Math.random() > 0.7) {
                this.addToInventory('STAR_DUST', 1);
                return true;
              }
          }
      }
      return false;
  }
}
