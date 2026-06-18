export type QuestType = 'kill' | 'collect' | 'reach' | 'talk';

export interface QuestReward {
  gold: number;
  xp: number;
  itemId?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: QuestType;
  target: string;       // monster name fragment | item id | zone id | npc label
  targetCount: number;
  zone?: string;        // where to do it (optional hint)
  reward: QuestReward;
  nextQuest?: string;   // chain to next quest id
}

export const QUESTS: Record<string, Quest> = {
  // ── Tutorial chain ───────────────────────────────────────────────────────
  q_first_blood: {
    id: 'q_first_blood',
    title: 'Primeiro Sangue',
    description: 'Mate 3 monstros na Floresta.',
    icon: '⚔️',
    type: 'kill',
    target: '',
    targetCount: 3,
    zone: 'forest',
    reward: { gold: 200, xp: 150 },
    nextQuest: 'q_wolf_hunter',
  },
  q_wolf_hunter: {
    id: 'q_wolf_hunter',
    title: 'Caçador de Lobos',
    description: 'Mate 5 Lobos Cinzentos na Floresta.',
    icon: '🐺',
    type: 'kill',
    target: 'Lobo',
    targetCount: 5,
    zone: 'forest',
    reward: { gold: 350, xp: 300, itemId: 'hp_potion_lg' },
    nextQuest: 'q_spider_silk',
  },
  q_spider_silk: {
    id: 'q_spider_silk',
    title: 'Tecedor de Seda',
    description: 'Colete 3 Sedas de Aranha na Floresta.',
    icon: '🕸️',
    type: 'collect',
    target: 'spider_silk',
    targetCount: 3,
    zone: 'forest',
    reward: { gold: 500, xp: 400 },
    nextQuest: 'q_explorer',
  },

  // ── Explorer chain ────────────────────────────────────────────────────────
  q_explorer: {
    id: 'q_explorer',
    title: 'Explorador',
    description: 'Chegue à Tundra Gelada.',
    icon: '🗺️',
    type: 'reach',
    target: 'ice',
    targetCount: 1,
    reward: { gold: 600, xp: 500 },
    nextQuest: 'q_ice_hunter',
  },
  q_ice_hunter: {
    id: 'q_ice_hunter',
    title: 'Caçador do Gelo',
    description: 'Mate 8 monstros na Tundra Gelada.',
    icon: '❄️',
    type: 'kill',
    target: '',
    targetCount: 8,
    zone: 'ice',
    reward: { gold: 800, xp: 700 },
    nextQuest: 'q_crystal_harvest',
  },
  q_crystal_harvest: {
    id: 'q_crystal_harvest',
    title: 'Colheita de Cristais',
    description: 'Colete 5 Cristais de Gelo.',
    icon: '💎',
    type: 'collect',
    target: 'ice_crystal',
    targetCount: 5,
    zone: 'ice',
    reward: { gold: 1000, xp: 900, itemId: 'chain_mail' },
    nextQuest: 'q_volcano_explorer',
  },

  // ── Volcano chain ─────────────────────────────────────────────────────────
  q_volcano_explorer: {
    id: 'q_volcano_explorer',
    title: 'Coração do Vulcão',
    description: 'Chegue ao Vulcão Infernal.',
    icon: '🌋',
    type: 'reach',
    target: 'volcano',
    targetCount: 1,
    reward: { gold: 1200, xp: 1000 },
    nextQuest: 'q_demon_slayer',
  },
  q_demon_slayer: {
    id: 'q_demon_slayer',
    title: 'Matador de Demônios',
    description: 'Mate 10 monstros no Vulcão.',
    icon: '😈',
    type: 'kill',
    target: '',
    targetCount: 10,
    zone: 'volcano',
    reward: { gold: 1500, xp: 1400 },
    nextQuest: 'q_fire_essence',
  },
  q_fire_essence: {
    id: 'q_fire_essence',
    title: 'Essência do Fogo',
    description: 'Colete 5 Essências de Fogo.',
    icon: '🔥',
    type: 'collect',
    target: 'fire_essence',
    targetCount: 5,
    zone: 'volcano',
    reward: { gold: 2000, xp: 1800, itemId: 'plate_armor' },
    nextQuest: 'q_dungeon_caller',
  },

  // ── Dungeon chain ─────────────────────────────────────────────────────────
  q_dungeon_caller: {
    id: 'q_dungeon_caller',
    title: 'Chamado das Sombras',
    description: 'Entre na Dungeon das Sombras.',
    icon: '🏰',
    type: 'reach',
    target: 'dungeon',
    targetCount: 1,
    reward: { gold: 2500, xp: 2000 },
    nextQuest: 'q_shadow_hunter',
  },
  q_shadow_hunter: {
    id: 'q_shadow_hunter',
    title: 'Caçador das Sombras',
    description: 'Mate 15 monstros na Dungeon.',
    icon: '💀',
    type: 'kill',
    target: '',
    targetCount: 15,
    zone: 'dungeon',
    reward: { gold: 3000, xp: 3000, itemId: 'shadow_wings' },
    nextQuest: 'q_void_crystal',
  },
  q_void_crystal: {
    id: 'q_void_crystal',
    title: 'Fragmento do Vazio',
    description: 'Colete 3 Cristais do Vazio na Dungeon.',
    icon: '🔮',
    type: 'collect',
    target: 'void_crystal',
    targetCount: 3,
    zone: 'dungeon',
    reward: { gold: 5000, xp: 5000, itemId: 'angel_wings' },
  },

  // ── Kill count quests (repeatable concept) ────────────────────────────────
  q_kill_100: {
    id: 'q_kill_100',
    title: 'Centurião',
    description: 'Mate 100 monstros no total.',
    icon: '💯',
    type: 'kill',
    target: '',
    targetCount: 100,
    reward: { gold: 2000, xp: 2000 },
  },
  q_kill_500: {
    id: 'q_kill_500',
    title: 'Lenda de Guerra',
    description: 'Mate 500 monstros no total.',
    icon: '👑',
    type: 'kill',
    target: '',
    targetCount: 500,
    reward: { gold: 8000, xp: 8000, itemId: 'dragon_shield' },
  },
};

export const QUEST_ORDER = [
  'q_first_blood', 'q_wolf_hunter', 'q_spider_silk',
  'q_explorer', 'q_ice_hunter', 'q_crystal_harvest',
  'q_volcano_explorer', 'q_demon_slayer', 'q_fire_essence',
  'q_dungeon_caller', 'q_shadow_hunter', 'q_void_crystal',
  'q_kill_100', 'q_kill_500',
];

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}
