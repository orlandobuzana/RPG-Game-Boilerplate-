import { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { renderGame } from '../game/renderer';
import { GameState } from '../types';
import { RECIPES, ITEMS } from '../constants';
import { Package, Hammer, Compass, Sun, Moon, CloudRain, Zap, Ship, Users, Sword, Shield, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine] = useState(() => new GameEngine());
  const [uiState, setUiState] = useState({
    inventory: [] as any[],
    health: 100,
    stamina: 100,
    gameState: GameState.PLAYING,
    dayTime: 0,
    planetName: 'Home',
    weather: 'CLEAR' as any,
    log: [] as string[],
    level: 1,
    exp: 0,
    maxExp: 100,
    playerName: 'Explorer',
    showLeft: true,
    showRight: true
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lastTime = 0;

    let frameCount = 0;
    const loop = (time: number) => {
      const dt = lastTime ? (time - lastTime) / 16.66 : 1;
      lastTime = time;

      engine.update(dt);
      renderGame(ctx, engine);

      // Keyboard toggles
      if (engine.inputs.i) { engine.state = engine.state === GameState.INVENTORY ? GameState.PLAYING : GameState.INVENTORY; engine.inputs.i = false; }
      if (engine.inputs.c) { engine.state = engine.state === GameState.CRAFTING ? GameState.PLAYING : GameState.CRAFTING; engine.inputs.c = false; }
      if (engine.inputs.tab) {
          setUiState(p => ({ ...p, showLeft: !p.showLeft, showRight: !p.showLeft }));
          engine.inputs.tab = false;
      }

      // Sync state for UI every 5 frames
      frameCount++;
      if (frameCount % 5 === 0) {
          setUiState(prev => ({
              ...prev,
              inventory: [...engine.entities.player.inventory],
              health: engine.entities.player.health,
              stamina: engine.entities.player.stamina,
              gameState: engine.state,
              dayTime: engine.world.dayTime,
              planetName: engine.currentPlanet,
              weather: engine.world.weather,
              log: [...engine.actionLog],
              level: engine.entities.player.level,
              exp: engine.entities.player.experience,
              maxExp: engine.entities.player.maxExperience,
              playerName: engine.entities.player.name
          }));
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
            canvas.width = entry.contentRect.width;
            canvas.height = entry.contentRect.height;
        }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [engine]);

  const handleCraft = (recipeId: string) => {
      engine.craft(recipeId);
  };

  const launchSpaceShip = () => {
      const ship = engine.entities.player.inventory.find(i => i.id === 'SPACESHIP' && i.quantity > 0);
      if (ship) {
          engine.state = GameState.SPACE_FLIGHT;
          engine.spaceShipPos = { x: 0, y: 0 };
          engine.log("Engaging warp drive...");
      }
  };

  const formatTime = (pseudoMinutes: number) => {
      const hours = Math.floor(pseudoMinutes / 100);
      const mins = Math.floor(pseudoMinutes % 100);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const [charData, setCharData] = useState({ name: 'Vane', gender: 'male' as const });

  const startGame = () => {
      engine.entities.player.name = charData.name.trim() || 'Explorer';
      engine.entities.player.gender = charData.gender;
      engine.state = GameState.PLAYING;
      engine.log(`Welcome, ${engine.entities.player.name}. The stars await.`);
  };

  return (
    <div className={`grid h-screen w-full bg-bg-main text-white font-sans overflow-hidden transition-all duration-300 ${
        uiState.gameState === GameState.TITLE ? 'grid-cols-1' : (
            uiState.showLeft && uiState.showRight ? 'grid-cols-[260px_1fr_260px]' : 
            uiState.showLeft ? 'grid-cols-[260px_1fr_0px]' :
            uiState.showRight ? 'grid-cols-[0px_1fr_260px]' : 
            'grid-cols-[0px_1fr_0px]'
        )
    } grid-rows-[60px_1fr_180px]`}>
      
      {/* Title / Character Creation Overlay */}
      <AnimatePresence>
        {uiState.gameState === GameState.TITLE && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-bg-main flex items-center justify-center overflow-hidden"
            >
                {/* Background Starfield Effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute bg-white rounded-full animate-pulse" 
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                top: `${Math.random() * 100}%`, 
                                width: Math.random() * 2 + 'px', 
                                height: Math.random() * 2 + 'px',
                                animationDelay: `${Math.random() * 5}s`
                            }} 
                        />
                    ))}
                </div>

                <div className="relative z-10 w-full max-w-lg p-12 bg-bg-panel border border-border-subtle rounded-3xl shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-12">
                        <div className="text-[10px] uppercase tracking-[0.4em] text-blue-400 font-black mb-4">Project: Astra</div>
                        <h1 className="text-5xl font-light tracking-tighter mb-2 italic">ASTRAL FRONTIER</h1>
                        <p className="text-xs text-label uppercase tracking-widest">Construct. Survive. Transcend.</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-3 block">Explorer Designation</label>
                            <input 
                                type="text" 
                                value={charData.name}
                                onChange={(e) => setCharData(p => ({ ...p, name: e.target.value }))}
                                className="w-full bg-white/5 border border-border-subtle p-4 rounded-xl focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm tracking-widest"
                                placeholder="ENTER NAME..."
                                maxLength={16}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-3 block">Genetic Template</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setCharData(p => ({ ...p, gender: 'male' }))}
                                    className={`p-4 rounded-xl border transition-all text-sm tracking-widest uppercase font-bold flex items-center justify-center gap-2 ${charData.gender === 'male' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-white/5 border-border-subtle text-white/40'}`}
                                >
                                    <Users size={16} /> Male
                                </button>
                                <button 
                                    onClick={() => setCharData(p => ({ ...p, gender: 'female' }))}
                                    className={`p-4 rounded-xl border transition-all text-sm tracking-widest uppercase font-bold flex items-center justify-center gap-2 ${charData.gender === 'female' ? 'bg-pink-500/10 border-pink-500 text-pink-400' : 'bg-white/5 border-border-subtle text-white/40'}`}
                                >
                                    <Users size={16} /> Female
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={startGame}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs h-14 rounded-xl hover:bg-blue-400 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-white/5"
                            >
                                New Journey
                            </button>
                            <button 
                                onClick={() => {
                                    if (engine.loadGame()) {
                                        // Update UI state with loaded data
                                        setUiState(prev => ({
                                            ...prev,
                                            gameState: GameState.PLAYING,
                                            playerName: engine.entities.player.name,
                                            level: engine.entities.player.level
                                        }));
                                    } else {
                                        alert("No save data found.");
                                    }
                                }}
                                className="w-full py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-xs h-14 rounded-xl hover:bg-white/10 transition-all transform active:scale-95 shadow-lg"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Top HUD */}
      <header className="col-span-3 bg-bg-header/80 backdrop-blur-md border-b border-border-subtle flex items-center px-6 justify-between z-10">
          <div className="flex items-center gap-4 text-sm">
              <span className="font-medium tracking-widest">{formatTime(uiState.dayTime)}</span>
              <button 
                onClick={() => setUiState(p => ({ ...p, showLeft: !p.showLeft }))}
                className="p-1 px-2 border border-white/10 rounded hover:bg-white/5 text-[10px]"
              >
                  {uiState.showLeft ? 'HIDE LEFT' : 'SHOW LEFT'}
              </button>
              <button 
                onClick={() => setUiState(p => ({ ...p, showRight: !p.showRight }))}
                className="p-1 px-2 border border-white/10 rounded hover:bg-white/5 text-[10px]"
              >
                  {uiState.showRight ? 'HIDE RIGHT' : 'SHOW RIGHT'}
              </button>
          </div>

          <div className="flex gap-12 items-center">
              <div className="flex flex-col items-center mr-4">
                  <div className="text-[10px] uppercase text-blue-400 font-bold">Level {uiState.level}</div>
                  <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                      <div className="h-full bg-blue-400" style={{ width: `${(uiState.exp / uiState.maxExp) * 100}%` }} />
                  </div>
              </div>
              <div className="w-40">
                  <div className="text-[10px] uppercase tracking-widest text-label mb-1 font-bold">HP</div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, uiState.health)}%` }}
                        className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                      />
                  </div>
              </div>
              <div className="w-40">
                  <div className="text-[10px] uppercase tracking-widest text-label mb-1 font-bold">Energy</div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, uiState.stamina)}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                      />
                  </div>
              </div>
          </div>

          <div className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-3">
              <span className="text-blue-400/60 font-black">●</span>
              ASTRAL FRONTIER 
          </div>
      </header>

      {/* Left Sidebar */}
      <aside className={`border-r border-border-subtle p-5 bg-bg-panel flex flex-col gap-6 overflow-y-auto row-span-2 transition-all ${!uiState.showLeft ? 'opacity-0 pointer-events-none' : ''}`}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">Resources</div>
            <div className="space-y-1">
                {uiState.inventory.filter(i => i.type === 'resource').map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs py-2 border-b border-white/[0.03]">
                        <span className="text-white/80">{item.name}</span>
                        <span className="font-mono text-blue-400">{item.quantity}</span>
                    </div>
                ))}
                {uiState.inventory.filter(i => i.type === 'resource').length === 0 && (
                    <div className="text-[10px] text-label/60 py-4 italic">No raw materials gathered.</div>
                )}
            </div>
          </div>

          <div className="mt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">Fabrication</div>
              <div className="space-y-2">
                  {RECIPES.map(recipe => {
                      const canCraft = recipe.ingredients.every(ing => {
                          const i = uiState.inventory.find(inv => inv.id === ing.itemId);
                          return i && i.quantity >= ing.quantity;
                      });
                      return (
                          <button 
                            key={recipe.id}
                            disabled={!canCraft}
                            onClick={() => handleCraft(recipe.id)}
                            className={`w-full text-left p-3 rounded border transition-all text-xs flex flex-col gap-1 ${
                                canCraft 
                                ? 'bg-white/5 border-border-strong hover:bg-white/10 text-white' 
                                : 'bg-transparent border-border-subtle text-white/20'
                            }`}
                          >
                              <div className="flex justify-between items-center">
                                  <span>⚒ {recipe.name}</span>
                                  {!canCraft && <span className="text-[10px] text-red-500/50 italic">Missing parts</span>}
                              </div>
                              <div className="flex gap-2 opacity-40 text-[9px]">
                                  {recipe.ingredients.map(ing => (
                                      <span key={ing.itemId}>{ITEMS[ing.itemId]?.name} x{ing.quantity}</span>
                                  ))}
                              </div>
                          </button>
                      );
                  })}
              </div>
          </div>
      </aside>

      {/* World View (Canvas) */}
      <main ref={containerRef} className="relative bg-bg-world border border-border-subtle overflow-hidden">
          <canvas ref={canvasRef} className="block cursor-crosshair" />
          
          {/* Weather Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_50%_50%] from-blue-500/5 to-transparent shadow-inner" />

          {/* Construction Pad (Visible if ship is in inventory but not flying) */}
          {uiState.gameState === GameState.PLAYING && uiState.inventory.some(i => i.id === 'SPACESHIP') && (
              <button 
                onClick={launchSpaceShip}
                className="absolute bottom-8 right-8 w-24 h-24 border-2 border-dashed border-border-strong rounded-xl flex flex-col items-center justify-center gap-1 hover:border-blue-500/50 hover:bg-blue-500/5 group transition-all"
              >
                  <span className="text-[8px] uppercase tracking-widest text-label font-bold group-hover:text-blue-400">Launch Pad</span>
                  <Ship className="text-white/20 group-hover:text-blue-400 group-hover:animate-pulse" size={32} />
              </button>
          )}

          {/* Interaction Prompt (Mock) */}
          <div className="absolute bottom-4 left-4 bg-blue-900/20 border-t border-blue-800/40 px-4 py-2 flex items-center gap-3 backdrop-blur-sm rounded-lg opacity-80 pointer-events-none">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Warp Point detected</span>
              <span className="text-[10px] opacity-60">[E] Interact</span>
          </div>

          <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-xl text-[10px] space-y-1 border border-white/5 pointer-events-none opacity-40 uppercase tracking-widest">
              <p>WASD: Thrust</p>
              <p>SPACE: Combat</p>
              <p>E: Interact</p>
          </div>
      </main>

      {/* Right Sidebar: Character & Quests */}
      <aside className={`border-l border-border-subtle p-5 bg-bg-panel flex flex-col gap-8 row-span-2 overflow-y-auto transition-all ${!uiState.showRight ? 'opacity-0 pointer-events-none' : ''}`}>
          <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">Character</div>
              <div className="text-lg font-light mb-1">{uiState.playerName}</div>
              <div className="text-xs text-label mb-6 uppercase tracking-widest">{engine.entities.player.gender} · Level {uiState.level}</div>
              
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">Equipment</div>
              <div className="grid grid-cols-2 gap-2">
                   <div className="aspect-square bg-white/[0.03] border border-white/5 rounded-lg flex items-center justify-center"><Sword size={20} className="text-white/20" /></div>
                   <div className="aspect-square bg-white/[0.03] border border-white/5 rounded-lg flex items-center justify-center"><Shield size={20} className="text-white/20" /></div>
              </div>
          </div>

          <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">Active Quests</div>
              <div className="border-l-2 border-blue-500 pl-4 space-y-2">
                  <div className="text-xs font-bold">To the Stars</div>
                  <div className="text-[10px] text-label leading-relaxed">Gather enough Iron and Star Dust to build a warp-capable ship.</div>
              </div>
          </div>

          <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">Navigation Logs</div>
              <div className="space-y-3">
                  <div className="text-[10px] text-blue-400 flex items-center gap-2">
                      <MapPin size={10} /> Hidden Archive (Found)
                  </div>
                  <div className="text-[10px] text-red-500/70 flex items-center gap-2">
                      <Zap size={10} /> Void Gate (Detected)
                  </div>
              </div>
          </div>
      </aside>

      {/* Bottom Panel: Log & Navigation */}
      <footer className="col-start-2 bg-bg-panel border-t border-border-subtle p-5 grid grid-cols-2 gap-8 z-10">
          <div className="flex flex-col">
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-3">Diagnostic Log</div>
              <div className="flex-1 font-mono text-[11px] text-text-dim space-y-1.5">
                  {uiState.log.map((entry, i) => (
                      <div key={i} className={i === 0 ? "text-white/90" : "opacity-60"}>{entry}</div>
                  ))}
              </div>
          </div>

          <div className="flex flex-col items-end justify-center">
              <div className="text-[10px] uppercase tracking-[0.2em] text-label font-bold mb-4">System Navigation</div>
              <div className="flex gap-4">
                  {['Home', 'Vulcan', 'Frost', 'Neon'].map(planet => (
                      <div 
                        key={planet}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                            uiState.planetName === planet 
                            ? 'border-white bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
                            : 'border-border-strong bg-white/5 opacity-40'
                        }`}
                        title={planet}
                      >
                          <Globe size={18} />
                      </div>
                  ))}
              </div>
              <div className="text-[10px] text-label mt-4 font-bold uppercase tracking-wider">
                  Position: <span className="text-white ml-2">Sub-orbital {uiState.planetName}</span>
              </div>
          </div>
      </footer>

    </div>
  );
}
