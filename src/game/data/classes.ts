export type ClassName = 'warrior' | 'mage' | 'archer' | 'priest' | 'ninja' | 'paladin' | 'assassin';

export interface ClassDef {
  id: ClassName;
  name: string;
  icon: string;
  color: string;
  description: string;
  baseStats: { hp: number; mp: number; atk: number; def: number; spd: number; crit: number; dodge: number; mana_regen: number };
  statGrowth: { hp: number; mp: number; atk: number; def: number; spd: number };
  skills: { name: string; icon: string; desc: string; mpCost: number; cooldown: number }[];
}

export const CLASSES: Record<ClassName, ClassDef> = {
  warrior: {
    id: 'warrior', name: 'Guerreiro', icon: '⚔️', color: '#e74c3c',
    description: 'Tanque forte, alta DEF e HP. Linha de frente do grupo.',
    baseStats: { hp: 200, mp: 50, atk: 15, def: 20, spd: 8, crit: 5, dodge: 3, mana_regen: 1 },
    statGrowth: { hp: 25, mp: 5, atk: 3, def: 4, spd: 1 },
    skills: [
      { name: 'Golpe Brutal', icon: '💥', desc: 'Dano físico alto', mpCost: 10, cooldown: 2 },
      { name: 'Escudo', icon: '🛡️', desc: '+50% DEF por 5s', mpCost: 20, cooldown: 10 },
      { name: 'Grito de Guerra', icon: '😤', desc: '+ATK grupo por 10s', mpCost: 30, cooldown: 20 },
      { name: 'Fúria Berserker', icon: '😡', desc: '+100% ATK -50% DEF', mpCost: 40, cooldown: 30 },
    ],
  },
  mage: {
    id: 'mage', name: 'Mago', icon: '🔮', color: '#9b59b6',
    description: 'Dano mágico devastador. Alto MP, baixa DEF.',
    baseStats: { hp: 100, mp: 200, atk: 20, def: 5, spd: 9, crit: 15, dodge: 5, mana_regen: 8 },
    statGrowth: { hp: 10, mp: 20, atk: 4, def: 1, spd: 1 },
    skills: [
      { name: 'Bola de Fogo', icon: '🔥', desc: 'Dano mágico de fogo', mpCost: 15, cooldown: 2 },
      { name: 'Míssil Arcano', icon: '💜', desc: 'Projétil arcano rápido', mpCost: 8, cooldown: 1 },
      { name: 'Nevasca', icon: '❄️', desc: 'Congela inimigos em área', mpCost: 35, cooldown: 15 },
      { name: 'Meteor', icon: '☄️', desc: 'Dano massivo em área', mpCost: 80, cooldown: 45 },
    ],
  },
  archer: {
    id: 'archer', name: 'Arqueiro', icon: '🏹', color: '#27ae60',
    description: 'Alta velocidade e críticos. Ataque à distância.',
    baseStats: { hp: 130, mp: 80, atk: 18, def: 8, spd: 15, crit: 20, dodge: 12, mana_regen: 3 },
    statGrowth: { hp: 12, mp: 8, atk: 3, def: 2, spd: 2 },
    skills: [
      { name: 'Flecha Rápida', icon: '🏹', desc: 'Ataque rápido, baixo dano', mpCost: 5, cooldown: 1 },
      { name: 'Flecha Perfurante', icon: '💘', desc: 'Ignora DEF do inimigo', mpCost: 20, cooldown: 8 },
      { name: 'Chuva de Flechas', icon: '🌧️', desc: 'Área de flechas', mpCost: 35, cooldown: 18 },
      { name: 'Flecha Explosiva', icon: '💥', desc: 'Explode ao acertar', mpCost: 50, cooldown: 25 },
    ],
  },
  priest: {
    id: 'priest', name: 'Sacerdote', icon: '✝️', color: '#f1c40f',
    description: 'Cura e suporte. Essencial em grupos.',
    baseStats: { hp: 120, mp: 180, atk: 8, def: 10, spd: 9, crit: 5, dodge: 6, mana_regen: 12 },
    statGrowth: { hp: 15, mp: 18, atk: 1, def: 2, spd: 1 },
    skills: [
      { name: 'Cura', icon: '💚', desc: 'Restaura HP do alvo', mpCost: 20, cooldown: 3 },
      { name: 'Escudo Divino', icon: '✨', desc: 'Escudo mágico por 5s', mpCost: 30, cooldown: 12 },
      { name: 'Bênção em Área', icon: '🌟', desc: 'Cura todo o grupo', mpCost: 60, cooldown: 20 },
      { name: 'Ressurreição', icon: '💫', desc: 'Revive aliado caído', mpCost: 100, cooldown: 60 },
    ],
  },
  ninja: {
    id: 'ninja', name: 'Ninja', icon: '🥷', color: '#2c3e50',
    description: 'Velocidade extrema, alto dodge e crítico.',
    baseStats: { hp: 110, mp: 100, atk: 16, def: 6, spd: 20, crit: 25, dodge: 20, mana_regen: 4 },
    statGrowth: { hp: 10, mp: 10, atk: 3, def: 1, spd: 3 },
    skills: [
      { name: 'Sombra Veloz', icon: '💨', desc: 'Teletransporte + ataque', mpCost: 15, cooldown: 5 },
      { name: 'Shuriken', icon: '⭐', desc: 'Projétil múltiplo', mpCost: 10, cooldown: 3 },
      { name: 'Assassinato', icon: '🗡️', desc: 'Dano crítico garantido', mpCost: 40, cooldown: 20 },
      { name: 'Invisibilidade', icon: '👻', desc: 'Invisível por 5s', mpCost: 50, cooldown: 30 },
    ],
  },
  paladin: {
    id: 'paladin', name: 'Paladino', icon: '⭐', color: '#e67e22',
    description: 'Mistura de tank e suporte. Muito resistente.',
    baseStats: { hp: 180, mp: 120, atk: 12, def: 25, spd: 7, crit: 8, dodge: 5, mana_regen: 6 },
    statGrowth: { hp: 22, mp: 12, atk: 2, def: 5, spd: 1 },
    skills: [
      { name: 'Golpe Sagrado', icon: '✝️', desc: 'Dano sagrado', mpCost: 15, cooldown: 3 },
      { name: 'Aura Divina', icon: '🌟', desc: '+DEF todos aliados', mpCost: 30, cooldown: 15 },
      { name: 'Punição', icon: '⚡', desc: 'Dano sagrado em área', mpCost: 50, cooldown: 20 },
      { name: 'Sacrifício', icon: '💞', desc: 'Absorve dano dos aliados', mpCost: 80, cooldown: 40 },
    ],
  },
  assassin: {
    id: 'assassin', name: 'Assassino', icon: '🗡️', color: '#1a1a2e',
    description: 'Máximo dano single-target. Mata rápido ou morre.',
    baseStats: { hp: 100, mp: 90, atk: 22, def: 5, spd: 18, crit: 30, dodge: 18, mana_regen: 3 },
    statGrowth: { hp: 8, mp: 9, atk: 4, def: 1, spd: 2 },
    skills: [
      { name: 'Golpe Letal', icon: '💀', desc: 'Dano crítico alto', mpCost: 20, cooldown: 4 },
      { name: 'Veneno', icon: '🐍', desc: 'Dano ao longo do tempo', mpCost: 15, cooldown: 6 },
      { name: 'Evisceração', icon: '🩸', desc: 'Dano massivo + sangramento', mpCost: 45, cooldown: 18 },
      { name: 'Execução', icon: '⚰️', desc: 'Mata instantâneo <20% HP', mpCost: 60, cooldown: 30 },
    ],
  },
};
