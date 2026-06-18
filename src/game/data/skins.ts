export interface Skin {
  id: string;
  name: string;
  icon: string;
  cost: number;
  primaryColor: number | null;
  secondaryColor: number | null;
  emissive: number | null;
  emissiveIntensity: number;
  desc: string;
}

export const SKINS: Skin[] = [
  { id: 'default',  name: 'Padrão',      icon: '⚪', cost: 0,      primaryColor: null,       secondaryColor: null,       emissive: null,     emissiveIntensity: 0,   desc: 'Visual padrão da classe' },
  { id: 'shadow',   name: 'Sombra',       icon: '⚫', cost: 5000,   primaryColor: 0x1a1a2e,   secondaryColor: 0x0d0d1a,   emissive: 0x220044, emissiveIntensity: 0.3, desc: 'Das trevas emergiu' },
  { id: 'gold',     name: 'Dourado',      icon: '🟡', cost: 10000,  primaryColor: 0xffd700,   secondaryColor: 0xb8860b,   emissive: 0xff8800, emissiveIntensity: 0.2, desc: 'Brilha como o sol' },
  { id: 'crimson',  name: 'Carmesim',     icon: '🔴', cost: 8000,   primaryColor: 0x8b0000,   secondaryColor: 0x4a0000,   emissive: 0xff0000, emissiveIntensity: 0.15, desc: 'Vermelho sangue' },
  { id: 'frost',    name: 'Gelo Eterno',  icon: '🔵', cost: 7000,   primaryColor: 0x4488cc,   secondaryColor: 0x224466,   emissive: 0x00aaff, emissiveIntensity: 0.2, desc: 'Congelado mas letal' },
  { id: 'emerald',  name: 'Esmeralda',    icon: '💚', cost: 9000,   primaryColor: 0x00aa44,   secondaryColor: 0x005522,   emissive: 0x00ff88, emissiveIntensity: 0.15, desc: 'Floresta eterna' },
  { id: 'void',     name: 'Vazio',        icon: '🌑', cost: 15000,  primaryColor: 0x110011,   secondaryColor: 0x000000,   emissive: 0x8800ff, emissiveIntensity: 0.4, desc: 'Além do espaço' },
  { id: 'lava',     name: 'Magma',        icon: '🔥', cost: 12000,  primaryColor: 0xff4400,   secondaryColor: 0x441100,   emissive: 0xff8800, emissiveIntensity: 0.35, desc: 'Nascido do vulcão' },
  { id: 'divine',   name: 'Divino',       icon: '✨', cost: 20000,  primaryColor: 0xffffff,   secondaryColor: 0xccddff,   emissive: 0xffffff, emissiveIntensity: 0.5, desc: 'Abençoado pelos deuses' },
  { id: 'abyss',    name: 'Abissal',      icon: '🌊', cost: 18000,  primaryColor: 0x002244,   secondaryColor: 0x001122,   emissive: 0x0044aa, emissiveIntensity: 0.3, desc: 'Profundezas do oceano' },
  { id: 'nature',   name: 'Natureza',     icon: '🌿', cost: 6000,   primaryColor: 0x2d5a1b,   secondaryColor: 0x1a3a0d,   emissive: 0x44aa22, emissiveIntensity: 0.1, desc: 'Um com a floresta' },
  { id: 'neon',     name: 'Neon',         icon: '💜', cost: 14000,  primaryColor: 0x220033,   secondaryColor: 0x110022,   emissive: 0xee00ff, emissiveIntensity: 0.6, desc: 'Futuro distópico' },
];
