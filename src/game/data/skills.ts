import type { ClassName } from './classes';

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  levelReq: number;
  spCost: number; // SP per level
  mpCost: number;
  cooldown: number; // seconds
  damage: (level: number, atk: number) => number;
  effect: string;
  color: string;
  requiresSkill?: string;
}

export interface SkillTree {
  [skillId: string]: Skill;
}

export const SKILL_TREES: Record<ClassName, SkillTree> = {
  warrior: {
    slash: {
      id: 'slash', name: 'Slash', icon: '⚔️', description: 'Golpe básico com espada.',
      maxLevel: 5, levelReq: 1, spCost: 1, mpCost: 8, cooldown: 1.5,
      damage: (l, a) => a * (0.8 + l * 0.4), effect: 'Dano físico', color: '#e74c3c',
    },
    bash: {
      id: 'bash', name: 'Bash', icon: '💥', description: 'Golpe esmagador que atordoa.',
      maxLevel: 5, levelReq: 3, spCost: 2, mpCost: 15, cooldown: 4,
      damage: (l, a) => a * (1.2 + l * 0.5), effect: 'Atordoa 1s', color: '#e67e22',
      requiresSkill: 'slash',
    },
    warcry: {
      id: 'warcry', name: 'Grito de Guerra', icon: '😤', description: '+ATK para o grupo.',
      maxLevel: 5, levelReq: 5, spCost: 2, mpCost: 20, cooldown: 30,
      damage: (l, _a) => l * 10, effect: `+ATK grupo por ${10}s`, color: '#f39c12',
      requiresSkill: 'bash',
    },
    berserk: {
      id: 'berserk', name: 'Fúria Berserker', icon: '😡', description: 'Dobra ATK, reduz DEF.',
      maxLevel: 5, levelReq: 10, spCost: 3, mpCost: 40, cooldown: 60,
      damage: (l, a) => a * (2 + l * 0.5), effect: '+100%ATK -50%DEF', color: '#c0392b',
      requiresSkill: 'warcry',
    },
    heavystrike: {
      id: 'heavystrike', name: 'Golpe Pesado', icon: '🪨', description: 'Golpe lento com dano massivo.',
      maxLevel: 5, levelReq: 7, spCost: 2, mpCost: 25, cooldown: 6,
      damage: (l, a) => a * (2.5 + l * 0.8), effect: 'Dano massivo', color: '#95a5a6',
      requiresSkill: 'bash',
    },
    shield_bash: {
      id: 'shield_bash', name: 'Shield Bash', icon: '🛡️', description: 'Golpe com escudo que empurra.',
      maxLevel: 5, levelReq: 8, spCost: 2, mpCost: 18, cooldown: 5,
      damage: (l, a) => a * (1 + l * 0.3), effect: 'Knockback', color: '#3498db',
      requiresSkill: 'bash',
    },
    provoke: {
      id: 'provoke', name: 'Provocar', icon: '🎯', description: 'Força inimigos a te atacar.',
      maxLevel: 3, levelReq: 4, spCost: 1, mpCost: 10, cooldown: 20,
      damage: (_l, _a) => 0, effect: 'Aggro todos', color: '#e74c3c',
    },
    aura: {
      id: 'aura', name: 'Aura do Guerreiro', icon: '✨', description: 'Aura passiva que aumenta DEF.',
      maxLevel: 10, levelReq: 15, spCost: 2, mpCost: 0, cooldown: 0,
      damage: (l, _a) => l * 5, effect: '+DEF passivo', color: '#f1c40f',
      requiresSkill: 'berserk',
    },
  },
  mage: {
    firebolt: {
      id: 'firebolt', name: 'Fire Bolt', icon: '🔥', description: 'Lança mísseis de fogo.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 12, cooldown: 1,
      damage: (l, a) => a * (0.5 + l * 0.6), effect: `${1} míssil(+1/lv)`, color: '#e74c3c',
    },
    icebolt: {
      id: 'icebolt', name: 'Ice Bolt', icon: '❄️', description: 'Congela o inimigo.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 12, cooldown: 1.5,
      damage: (l, a) => a * (0.5 + l * 0.5), effect: 'Congela 2s', color: '#3498db',
    },
    thunderstorm: {
      id: 'thunderstorm', name: 'Thunder Storm', icon: '⚡', description: 'Raios em área.',
      maxLevel: 10, levelReq: 5, spCost: 2, mpCost: 35, cooldown: 5,
      damage: (l, a) => a * (1.5 + l * 0.8), effect: 'AoE raio', color: '#f39c12',
      requiresSkill: 'firebolt',
    },
    meteor: {
      id: 'meteor', name: 'Meteor Storm', icon: '☄️', description: 'Meteoros em área enorme.',
      maxLevel: 10, levelReq: 20, spCost: 3, mpCost: 80, cooldown: 15,
      damage: (l, a) => a * (3 + l * 1.2), effect: '7x Meteoro', color: '#9b59b6',
      requiresSkill: 'thunderstorm',
    },
    firewall: {
      id: 'firewall', name: 'Fire Wall', icon: '🌋', description: 'Parede de fogo no chão.',
      maxLevel: 10, levelReq: 8, spCost: 2, mpCost: 40, cooldown: 8,
      damage: (l, a) => a * (0.3 + l * 0.3), effect: 'DoT 5s', color: '#e67e22',
      requiresSkill: 'firebolt',
    },
    sight: {
      id: 'sight', name: 'Sight', icon: '👁️', description: 'Revela inimigos invisíveis.',
      maxLevel: 1, levelReq: 1, spCost: 1, mpCost: 5, cooldown: 30,
      damage: (_l, _a) => 0, effect: 'Revela área', color: '#f1c40f',
    },
    energy_coat: {
      id: 'energy_coat', name: 'Energy Coat', icon: '💜', description: 'Escudo de energia que absorve dano.',
      maxLevel: 5, levelReq: 10, spCost: 2, mpCost: 30, cooldown: 20,
      damage: (l, _a) => l * 50, effect: 'Absorve dano', color: '#8e44ad',
    },
    storm_gust: {
      id: 'storm_gust', name: 'Storm Gust', icon: '🌀', description: 'Vendaval de gelo em área.',
      maxLevel: 10, levelReq: 25, spCost: 3, mpCost: 70, cooldown: 12,
      damage: (l, a) => a * (2 + l * 1.0), effect: 'Congela área', color: '#5dade2',
      requiresSkill: 'icebolt',
    },
  },
  archer: {
    arrow_shot: {
      id: 'arrow_shot', name: 'Arrow Shot', icon: '🏹', description: 'Flechada precisa.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 5, cooldown: 1,
      damage: (l, a) => a * (0.7 + l * 0.4), effect: 'Dano físico', color: '#27ae60',
    },
    double_strafe: {
      id: 'double_strafe', name: 'Double Strafe', icon: '💘', description: 'Dispara duas flechas.',
      maxLevel: 10, levelReq: 3, spCost: 2, mpCost: 12, cooldown: 2,
      damage: (l, a) => a * (1.4 + l * 0.6), effect: '2x Flecha', color: '#2ecc71',
      requiresSkill: 'arrow_shot',
    },
    arrow_rain: {
      id: 'arrow_rain', name: 'Arrow Rain', icon: '🌧️', description: 'Chuva de flechas em área.',
      maxLevel: 10, levelReq: 10, spCost: 2, mpCost: 30, cooldown: 8,
      damage: (l, a) => a * (0.8 + l * 0.5), effect: 'AoE flechas', color: '#16a085',
      requiresSkill: 'double_strafe',
    },
    sharp_shoot: {
      id: 'sharp_shoot', name: 'Sharp Shoot', icon: '🎯', description: 'Crítico garantido.',
      maxLevel: 5, levelReq: 15, spCost: 3, mpCost: 25, cooldown: 6,
      damage: (l, a) => a * (2 + l * 0.8), effect: 'Crit 100%', color: '#1abc9c',
      requiresSkill: 'double_strafe',
    },
    blitz_beat: {
      id: 'blitz_beat', name: 'Blitz Beat', icon: '⚡', description: 'Ataque rápido múltiplo.',
      maxLevel: 5, levelReq: 5, spCost: 2, mpCost: 20, cooldown: 5,
      damage: (l, a) => a * (0.3 + l * 0.3) * 5, effect: '5x rápido', color: '#f39c12',
    },
    falcon_assault: {
      id: 'falcon_assault', name: 'Falcon Assault', icon: '🦅', description: 'Falcão ataca o alvo.',
      maxLevel: 5, levelReq: 20, spCost: 3, mpCost: 50, cooldown: 15,
      damage: (l, a) => a * (3 + l * 1.0), effect: 'Dano maciço', color: '#e67e22',
      requiresSkill: 'sharp_shoot',
    },
    ankle_snare: {
      id: 'ankle_snare', name: 'Ankle Snare', icon: '🪤', description: 'Armadilha que prende inimigo.',
      maxLevel: 5, levelReq: 8, spCost: 2, mpCost: 15, cooldown: 10,
      damage: (_l, _a) => 0, effect: 'Prende 5s', color: '#8e44ad',
    },
    charge_arrow: {
      id: 'charge_arrow', name: 'Charge Arrow', icon: '💨', description: 'Flecha de alto impacto.',
      maxLevel: 5, levelReq: 6, spCost: 2, mpCost: 18, cooldown: 4,
      damage: (l, a) => a * (1.5 + l * 0.6), effect: 'Knockback', color: '#27ae60',
    },
  },
  priest: {
    heal: {
      id: 'heal', name: 'Heal', icon: '💚', description: 'Restaura HP do alvo.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 15, cooldown: 2,
      damage: (l, a) => a * (0.5 + l * 0.8), effect: 'Restaura HP', color: '#27ae60',
    },
    holy_light: {
      id: 'holy_light', name: 'Holy Light', icon: '✨', description: 'Luz sagrada que causa dano.',
      maxLevel: 10, levelReq: 3, spCost: 1, mpCost: 12, cooldown: 1.5,
      damage: (l, a) => a * (0.6 + l * 0.5), effect: 'Dano sagrado', color: '#f1c40f',
    },
    blessing: {
      id: 'blessing', name: 'Blessing', icon: '🌟', description: '+ATK,DEF,SP a todos.',
      maxLevel: 10, levelReq: 5, spCost: 2, mpCost: 30, cooldown: 120,
      damage: (l, _a) => l * 5, effect: `+${5}ATK/DEF`, color: '#f39c12',
      requiresSkill: 'heal',
    },
    resurrection: {
      id: 'resurrection', name: 'Resurrection', icon: '💫', description: 'Revive aliado caído.',
      maxLevel: 5, levelReq: 20, spCost: 3, mpCost: 100, cooldown: 300,
      damage: (_l, _a) => 0, effect: 'Revive aliado', color: '#9b59b6',
      requiresSkill: 'blessing',
    },
    sanctuary: {
      id: 'sanctuary', name: 'Sanctuary', icon: '🕍', description: 'Área sagrada que cura continuamente.',
      maxLevel: 10, levelReq: 10, spCost: 2, mpCost: 40, cooldown: 20,
      damage: (l, a) => a * (0.2 + l * 0.3), effect: 'AoE cura 10s', color: '#2ecc71',
      requiresSkill: 'heal',
    },
    magnus: {
      id: 'magnus', name: 'Magnus Exorcismus', icon: '✝️', description: 'Grande área sagrada.',
      maxLevel: 10, levelReq: 25, spCost: 3, mpCost: 60, cooldown: 15,
      damage: (l, a) => a * (1.5 + l * 0.8), effect: 'AoE sagrado', color: '#f1c40f',
      requiresSkill: 'sanctuary',
    },
    kyrie: {
      id: 'kyrie', name: 'Kyrie Eleison', icon: '🛡️', description: 'Escudo sagrado que absorve hits.',
      maxLevel: 10, levelReq: 8, spCost: 2, mpCost: 25, cooldown: 30,
      damage: (l, _a) => l * 30, effect: 'Absorve hits', color: '#3498db',
    },
    turn_undead: {
      id: 'turn_undead', name: 'Turn Undead', icon: '💀', description: 'Destrói mortos-vivos.',
      maxLevel: 10, levelReq: 15, spCost: 2, mpCost: 35, cooldown: 5,
      damage: (l, a) => a * (2 + l * 1.0), effect: 'x2 vs undead', color: '#e74c3c',
    },
  },
  ninja: {
    throwing_star: {
      id: 'throwing_star', name: 'Throwing Star', icon: '⭐', description: 'Lança shuriken.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 8, cooldown: 1,
      damage: (l, a) => a * (0.6 + l * 0.4), effect: 'Projétil', color: '#2c3e50',
    },
    shadow_jump: {
      id: 'shadow_jump', name: 'Shadow Jump', icon: '💨', description: 'Teletransporte para sombra.',
      maxLevel: 5, levelReq: 3, spCost: 2, mpCost: 15, cooldown: 5,
      damage: (_l, _a) => 0, effect: 'Teleporte', color: '#8e44ad',
    },
    ambush: {
      id: 'ambush', name: 'Ambush', icon: '🗡️', description: 'Ataque de trás com dano crítico.',
      maxLevel: 10, levelReq: 5, spCost: 2, mpCost: 20, cooldown: 6,
      damage: (l, a) => a * (2 + l * 0.8), effect: 'Crit + backstab', color: '#e74c3c',
      requiresSkill: 'shadow_jump',
    },
    shadow_form: {
      id: 'shadow_form', name: 'Shadow Form', icon: '👻', description: 'Invisível e +DODGE.',
      maxLevel: 5, levelReq: 10, spCost: 3, mpCost: 40, cooldown: 30,
      damage: (_l, _a) => 0, effect: 'Invisível 5s', color: '#2c3e50',
      requiresSkill: 'shadow_jump',
    },
    kunai_throw: {
      id: 'kunai_throw', name: 'Kunai Throw', icon: '🗡️', description: 'Múltiplos kunais.',
      maxLevel: 10, levelReq: 7, spCost: 2, mpCost: 18, cooldown: 3,
      damage: (l, a) => a * (0.4 + l * 0.3) * 3, effect: '3x Kunai', color: '#7f8c8d',
    },
    dragon_tail: {
      id: 'dragon_tail', name: 'Dragon Tail', icon: '🐉', description: 'Chute giratório poderoso.',
      maxLevel: 10, levelReq: 12, spCost: 2, mpCost: 30, cooldown: 8,
      damage: (l, a) => a * (1.8 + l * 0.7), effect: 'AoE físico', color: '#e67e22',
    },
    soul_destroyer: {
      id: 'soul_destroyer', name: 'Soul Destroyer', icon: '💀', description: 'Destrói a alma do alvo.',
      maxLevel: 10, levelReq: 20, spCost: 3, mpCost: 60, cooldown: 15,
      damage: (l, a) => a * (3 + l * 1.2), effect: 'Ignora DEF', color: '#8e44ad',
      requiresSkill: 'ambush',
    },
    smoke_bomb: {
      id: 'smoke_bomb', name: 'Smoke Bomb', icon: '💨', description: 'Bomba de fumaça que cega.',
      maxLevel: 5, levelReq: 6, spCost: 1, mpCost: 12, cooldown: 10,
      damage: (_l, _a) => 0, effect: 'Cega 3s', color: '#95a5a6',
    },
  },
  paladin: {
    holy_cross: {
      id: 'holy_cross', name: 'Holy Cross', icon: '✝️', description: 'Cruz sagrada.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 15, cooldown: 2,
      damage: (l, a) => a * (0.8 + l * 0.5), effect: 'Sagrado', color: '#f1c40f',
    },
    shield_chain: {
      id: 'shield_chain', name: 'Shield Chain', icon: '⛓️', description: 'Corrente de escudo.',
      maxLevel: 5, levelReq: 5, spCost: 2, mpCost: 20, cooldown: 4,
      damage: (l, a) => a * (1.5 + l * 0.6), effect: 'DEF→ATK', color: '#3498db',
    },
    devotion: {
      id: 'devotion', name: 'Devotion', icon: '💞', description: 'Absorve dano de aliado.',
      maxLevel: 5, levelReq: 10, spCost: 3, mpCost: 30, cooldown: 30,
      damage: (_l, _a) => 0, effect: 'Absorve dano', color: '#e74c3c',
    },
    sacrifice: {
      id: 'sacrifice', name: 'Sacrifice', icon: '🌟', description: 'Sacrifica HP por dano.',
      maxLevel: 5, levelReq: 15, spCost: 3, mpCost: 0, cooldown: 10,
      damage: (l, a) => a * (4 + l * 1.0), effect: '-20%HP → dano', color: '#9b59b6',
    },
    reflect_shield: {
      id: 'reflect_shield', name: 'Reflect Shield', icon: '🛡️', description: 'Reflete dano recebido.',
      maxLevel: 10, levelReq: 8, spCost: 2, mpCost: 25, cooldown: 20,
      damage: (l, _a) => l * 15, effect: 'Reflete dano', color: '#2ecc71',
    },
    odin_power: {
      id: 'odin_power', name: 'Odin\'s Power', icon: '⚡', description: 'Poder divino supremo.',
      maxLevel: 5, levelReq: 25, spCost: 4, mpCost: 80, cooldown: 60,
      damage: (l, a) => a * (5 + l * 2.0), effect: 'Dano divino', color: '#f39c12',
      requiresSkill: 'holy_cross',
    },
    grand_cross: {
      id: 'grand_cross', name: 'Grand Cross', icon: '✨', description: 'Cruz gigante em área.',
      maxLevel: 10, levelReq: 20, spCost: 3, mpCost: 60, cooldown: 15,
      damage: (l, a) => a * (2 + l * 0.9), effect: 'AoE sagrado', color: '#f1c40f',
      requiresSkill: 'holy_cross',
    },
    aura_blade: {
      id: 'aura_blade', name: 'Aura Blade', icon: '💫', description: 'Lâmina de aura sagrada.',
      maxLevel: 5, levelReq: 12, spCost: 2, mpCost: 35, cooldown: 30,
      damage: (l, a) => l * a * 0.2, effect: '+ATK passivo', color: '#e67e22',
    },
  },
  assassin: {
    double_attack: {
      id: 'double_attack', name: 'Double Attack', icon: '⚔️', description: 'Ataca duas vezes.',
      maxLevel: 10, levelReq: 1, spCost: 1, mpCost: 10, cooldown: 1.5,
      damage: (l, a) => a * (0.6 + l * 0.3) * 2, effect: '2x ataque', color: '#e74c3c',
    },
    envenom: {
      id: 'envenom', name: 'Envenom', icon: '🐍', description: 'Venena o inimigo.',
      maxLevel: 10, levelReq: 3, spCost: 1, mpCost: 12, cooldown: 3,
      damage: (l, _a) => 20 + l * 15, effect: 'DoT veneno', color: '#27ae60',
    },
    cloaking: {
      id: 'cloaking', name: 'Cloaking', icon: '👁️', description: 'Fica invisível enquanto anda.',
      maxLevel: 10, levelReq: 5, spCost: 2, mpCost: 25, cooldown: 10,
      damage: (_l, _a) => 0, effect: 'Invisível', color: '#2c3e50',
      requiresSkill: 'envenom',
    },
    sonic_blow: {
      id: 'sonic_blow', name: 'Sonic Blow', icon: '💨', description: '8 golpes em 1 segundo.',
      maxLevel: 10, levelReq: 10, spCost: 3, mpCost: 35, cooldown: 8,
      damage: (l, a) => a * (0.5 + l * 0.3) * 8, effect: '8x golpes', color: '#e74c3c',
      requiresSkill: 'double_attack',
    },
    grimtooth: {
      id: 'grimtooth', name: 'Grimtooth', icon: '🦷', description: 'Ataque de dentro da invisibilidade.',
      maxLevel: 5, levelReq: 8, spCost: 2, mpCost: 20, cooldown: 5,
      damage: (l, a) => a * (1.8 + l * 0.7), effect: 'De invis', color: '#8e44ad',
      requiresSkill: 'cloaking',
    },
    guillotine_cross: {
      id: 'guillotine_cross', name: 'Guillotine Cross', icon: '💀', description: 'Cruz mortal.',
      maxLevel: 10, levelReq: 20, spCost: 3, mpCost: 50, cooldown: 12,
      damage: (l, a) => a * (3 + l * 1.0), effect: 'Dano letal', color: '#c0392b',
      requiresSkill: 'sonic_blow',
    },
    meteor_assault: {
      id: 'meteor_assault', name: 'Meteor Assault', icon: '☄️', description: 'Ataca todos ao redor.',
      maxLevel: 10, levelReq: 15, spCost: 3, mpCost: 40, cooldown: 10,
      damage: (l, a) => a * (1.2 + l * 0.6), effect: 'AoE melee', color: '#e67e22',
    },
    venom_dust: {
      id: 'venom_dust', name: 'Venom Dust', icon: '💀', description: 'Poça de veneno no chão.',
      maxLevel: 10, levelReq: 12, spCost: 2, mpCost: 30, cooldown: 8,
      damage: (l, _a) => 30 + l * 20, effect: 'AoE veneno', color: '#27ae60',
      requiresSkill: 'envenom',
    },
  },
};

export interface PlayerSkillState {
  [skillId: string]: { level: number; equipped: boolean };
}
