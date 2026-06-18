export interface Monster {
  id: number;
  name: string;
  icon: string;
  level: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  xp: number;
  gold: number;
  drops: { itemId: number; chance: number }[];
  color: string;
  isBoss?: boolean;
}

export const MONSTERS: Monster[] = [
  // === NÍVEL 1-10 ===
  { id: 1, name: 'Slime Verde', icon: '🟢', level: 1, hp: 30, atk: 3, def: 1, spd: 3, xp: 8, gold: 3, drops: [{ itemId: 87, chance: 0.5 }], color: '#2ecc71' },
  { id: 2, name: 'Lobo da Floresta', icon: '🐺', level: 2, hp: 50, atk: 6, def: 2, spd: 8, xp: 15, gold: 5, drops: [{ itemId: 214, chance: 0.4 }, { itemId: 87, chance: 0.3 }], color: '#7f8c8d' },
  { id: 3, name: 'Goblin', icon: '👺', level: 3, hp: 45, atk: 8, def: 3, spd: 7, xp: 18, gold: 8, drops: [{ itemId: 201, chance: 0.3 }], color: '#27ae60' },
  { id: 4, name: 'Aranha Gigante', icon: '🕷️', level: 4, hp: 60, atk: 10, def: 4, spd: 10, xp: 22, gold: 10, drops: [{ itemId: 215, chance: 0.4 }, { itemId: 229, chance: 0.5 }], color: '#8e44ad' },
  { id: 5, name: 'Esqueleto', icon: '💀', level: 5, hp: 80, atk: 12, def: 8, spd: 5, xp: 28, gold: 12, drops: [{ itemId: 210, chance: 0.4 }], color: '#ecf0f1' },
  { id: 6, name: 'Orc', icon: '👹', level: 6, hp: 100, atk: 15, def: 10, spd: 6, xp: 35, gold: 15, drops: [{ itemId: 201, chance: 0.4 }, { itemId: 202, chance: 0.3 }], color: '#e74c3c' },
  { id: 7, name: 'Lagarto Venenoso', icon: '🦎', level: 7, hp: 90, atk: 14, def: 7, spd: 12, xp: 32, gold: 14, drops: [{ itemId: 205, chance: 0.5 }], color: '#16a085' },
  { id: 8, name: 'Bandido', icon: '🦹', level: 8, hp: 110, atk: 18, def: 9, spd: 11, xp: 40, gold: 20, drops: [{ itemId: 87, chance: 0.4 }, { itemId: 132, chance: 0.2 }], color: '#e67e22' },
  { id: 9, name: 'Slime Vermelho', icon: '🔴', level: 9, hp: 130, atk: 20, def: 12, spd: 5, xp: 48, gold: 18, drops: [{ itemId: 211, chance: 0.3 }], color: '#c0392b' },
  { id: 10, name: 'Chefe Goblin', icon: '👺', level: 10, hp: 400, atk: 28, def: 15, spd: 8, xp: 150, gold: 80, drops: [{ itemId: 6, chance: 0.1 }, { itemId: 203, chance: 0.4 }], color: '#27ae60', isBoss: true },
  // === NÍVEL 11-25 ===
  { id: 11, name: 'Lobo Ancião', icon: '🐺', level: 12, hp: 180, atk: 25, def: 18, spd: 14, xp: 60, gold: 25, drops: [{ itemId: 214, chance: 0.5 }], color: '#2c3e50' },
  { id: 12, name: 'Troll', icon: '🧌', level: 14, hp: 250, atk: 32, def: 22, spd: 6, xp: 80, gold: 35, drops: [{ itemId: 231, chance: 0.4 }], color: '#1abc9c' },
  { id: 13, name: 'Harpia', icon: '🦅', level: 16, hp: 200, atk: 30, def: 15, spd: 20, xp: 90, gold: 40, drops: [{ itemId: 206, chance: 0.5 }, { itemId: 223, chance: 0.2 }], color: '#f39c12' },
  { id: 14, name: 'Zumbi', icon: '🧟', level: 18, hp: 280, atk: 28, def: 25, spd: 4, xp: 100, gold: 38, drops: [{ itemId: 210, chance: 0.5 }, { itemId: 236, chance: 0.3 }], color: '#95a5a6' },
  { id: 15, name: 'Mago das Trevas', icon: '🧙', level: 20, hp: 220, atk: 40, def: 12, spd: 12, xp: 120, gold: 50, drops: [{ itemId: 204, chance: 0.3 }, { itemId: 237, chance: 0.2 }], color: '#8e44ad' },
  { id: 16, name: 'Basilisco', icon: '🐍', level: 22, hp: 320, atk: 38, def: 28, spd: 15, xp: 140, gold: 60, drops: [{ itemId: 224, chance: 0.25 }], color: '#16a085' },
  { id: 17, name: 'Elemental de Fogo', icon: '🔥', level: 24, hp: 280, atk: 45, def: 20, spd: 16, xp: 160, gold: 65, drops: [{ itemId: 211, chance: 0.5 }, { itemId: 228, chance: 0.3 }], color: '#e74c3c' },
  { id: 18, name: 'Boss: Ogre Rei', icon: '👹', level: 25, hp: 1500, atk: 60, def: 40, spd: 8, xp: 600, gold: 300, drops: [{ itemId: 11, chance: 0.05 }, { itemId: 203, chance: 0.5 }], color: '#c0392b', isBoss: true },
  // === NÍVEL 26-50 ===
  { id: 19, name: 'Golem de Pedra', icon: '🪨', level: 28, hp: 500, atk: 50, def: 50, spd: 4, xp: 200, gold: 80, drops: [{ itemId: 228, chance: 0.4 }], color: '#7f8c8d' },
  { id: 20, name: 'Vampiro', icon: '🧛', level: 30, hp: 400, atk: 55, def: 30, spd: 20, xp: 220, gold: 90, drops: [{ itemId: 234, chance: 0.3 }], color: '#6c3483' },
  { id: 21, name: 'Wyvern', icon: '🐲', level: 35, hp: 600, atk: 70, def: 45, spd: 25, xp: 300, gold: 120, drops: [{ itemId: 207, chance: 0.1 }, { itemId: 227, chance: 0.3 }], color: '#1a5276' },
  { id: 22, name: 'Elemental de Gelo', icon: '❄️', level: 38, hp: 550, atk: 65, def: 40, spd: 18, xp: 280, gold: 110, drops: [{ itemId: 212, chance: 0.5 }], color: '#aed6f1' },
  { id: 23, name: 'Lich', icon: '💀', level: 42, hp: 700, atk: 80, def: 35, spd: 16, xp: 380, gold: 150, drops: [{ itemId: 219, chance: 0.2 }, { itemId: 237, chance: 0.4 }], color: '#7d3c98' },
  { id: 24, name: 'Boss: Dragão Negro', icon: '🐉', level: 50, hp: 5000, atk: 120, def: 80, spd: 20, xp: 2000, gold: 1000, drops: [{ itemId: 207, chance: 0.3 }, { itemId: 16, chance: 0.05 }], color: '#1a1a1a', isBoss: true },
  // === NÍVEL 51-80 ===
  { id: 25, name: 'Grifo', icon: '🦁', level: 55, hp: 900, atk: 100, def: 70, spd: 30, xp: 500, gold: 200, drops: [{ itemId: 223, chance: 0.4 }], color: '#d4ac0d' },
  { id: 26, name: 'Titã de Pedra', icon: '🗿', level: 60, hp: 1500, atk: 130, def: 100, spd: 6, xp: 700, gold: 280, drops: [{ itemId: 228, chance: 0.5 }], color: '#626567' },
  { id: 27, name: 'Fênix', icon: '🔥', level: 65, hp: 1200, atk: 140, def: 80, spd: 35, xp: 850, gold: 350, drops: [{ itemId: 226, chance: 0.05 }, { itemId: 227, chance: 0.4 }], color: '#e74c3c' },
  { id: 28, name: 'Leviatã', icon: '🌊', level: 70, hp: 2000, atk: 160, def: 110, spd: 25, xp: 1100, gold: 450, drops: [{ itemId: 225, chance: 0.15 }], color: '#1a5276' },
  { id: 29, name: 'Boss: Lich Eterno', icon: '💀', level: 75, hp: 10000, atk: 200, def: 140, spd: 22, xp: 5000, gold: 2500, drops: [{ itemId: 235, chance: 0.1 }, { itemId: 217, chance: 0.3 }], color: '#4a235a', isBoss: true },
  // === NÍVEL 80+ ENDGAME ===
  { id: 30, name: 'Demônio Supremo', icon: '😈', level: 85, hp: 3000, atk: 220, def: 160, spd: 28, xp: 1800, gold: 700, drops: [{ itemId: 217, chance: 0.2 }], color: '#922b21' },
  { id: 31, name: 'Anjo Caído', icon: '😇', level: 88, hp: 2800, atk: 230, def: 150, spd: 32, xp: 1900, gold: 750, drops: [{ itemId: 217, chance: 0.2 }], color: '#f8c471' },
  { id: 32, name: 'Boss Final: Deus das Trevas', icon: '🌑', level: 100, hp: 50000, atk: 500, def: 300, spd: 40, xp: 20000, gold: 10000, drops: [{ itemId: 218, chance: 0.15 }, { itemId: 208, chance: 0.5 }], color: '#0d0d0d', isBoss: true },
];
