import { GameEngine } from '../game/engine';
import { GameState, TILE_SIZE, WORLD_SIZE } from '../types';

export function renderGame(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  if (engine.state === GameState.PLAYING) {
    renderOverworld(ctx, engine);
  } else if (engine.state === GameState.SPACE_FLIGHT) {
    renderSpace(ctx, engine);
  }
}

function renderOverworld(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const { player } = engine.entities;
  const { width, height } = ctx.canvas;

  // Camera offset
  const offsetX = width / 2 - player.position.x;
  const offsetY = height / 2 - player.position.y;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // Render Tiles
  const startX = Math.max(0, Math.floor((player.position.x - width / 2) / TILE_SIZE));
  const endX = Math.min(WORLD_SIZE, Math.ceil((player.position.x + width / 2) / TILE_SIZE));
  const startY = Math.max(0, Math.floor((player.position.y - height / 2) / TILE_SIZE));
  const endY = Math.min(WORLD_SIZE, Math.ceil((player.position.y + height / 2) / TILE_SIZE));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const tile = engine.world.map[y][x];
      ctx.fillStyle = getTileColor(tile.type);
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE + 1, TILE_SIZE + 1);

      if (tile.resource) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, 5, 0, Math.PI*2);
          ctx.fill();
      }
    }
  }

  // Render Enemies
  engine.entities.enemies.forEach(enemy => {
      ctx.fillStyle = enemy.type === 'slime' ? '#4ade80' : enemy.type === 'skeleton' ? '#e2e8f0' : '#f87171';
      ctx.beginPath();
      ctx.arc(enemy.position.x, enemy.position.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar
      ctx.fillStyle = 'red';
      ctx.fillRect(enemy.position.x - 10, enemy.position.y - 15, 20, 3);
      ctx.fillStyle = 'green';
      ctx.fillRect(enemy.position.x - 10, enemy.position.y - 15, 20 * (enemy.health / enemy.maxHealth), 3);
  });

  // Render Player
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(player.position.x, player.position.y, 12, 0, Math.PI * 2);
  ctx.fill();

  // Attack visual
  if (engine.inputs.space) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      // Arc sweep for directional look (simplified)
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, 52, 0, Math.PI * 2);
      ctx.fill();
  }

  // Damage Numbers
  engine.entities.damageNumbers.forEach(dn => {
      ctx.fillStyle = `rgba(255, 255, 255, ${dn.life})`;
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(dn.value.toString(), dn.x, dn.y);
  });

  ctx.restore();

  // Day/Night filter
  const dayFactor = Math.sin((engine.world.dayTime / 2400) * Math.PI * 2);
  const darkness = Math.max(0, -dayFactor * 0.6);
  ctx.fillStyle = `rgba(0, 0, 20, ${darkness})`;
  ctx.fillRect(0, 0, width, height);

  // Weather effects
  if (engine.world.weather === 'RAIN' || engine.world.weather === 'STORM') {
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 50; i++) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 5, ry + 15);
          ctx.stroke();
      }
  }
}

function renderSpace(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    const { width, height } = ctx.canvas;
    const { spaceShipPos, spaceMap } = engine;
    
    const offsetX = width / 2 - spaceShipPos.x;
    const offsetY = height / 2 - spaceShipPos.y;

    // Background stars
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 200; i++) {
        // Pseudo-random stars based on fixed seed coords would be better
        // but for now just scattered
    }

    // Planets
    spaceMap.forEach(planet => {
        const gradient = ctx.createRadialGradient(planet.pos.x, planet.pos.y, 5, planet.pos.x, planet.pos.y, 40);
        gradient.addColorStop(0, planet.name === 'Vulcan' ? '#ef4444' : planet.name === 'Frost' ? '#60a5fa' : '#22c55e');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(planet.pos.x, planet.pos.y, 40, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, planet.pos.x, planet.pos.y + 60);
    });

    // Spaceship
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(spaceShipPos.x, spaceShipPos.y - 15);
    ctx.lineTo(spaceShipPos.x - 10, spaceShipPos.y + 10);
    ctx.lineTo(spaceShipPos.x + 10, spaceShipPos.y + 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function getTileColor(type: string): string {
  switch (type) {
    case 'grass': return '#166534';
    case 'water': return '#1d4ed8';
    case 'tree': return '#14532d';
    case 'rock': return '#57534e';
    case 'iron_vein': return '#451a03';
    case 'dungeon_entrance': return '#171717';
    default: return '#000';
  }
}
