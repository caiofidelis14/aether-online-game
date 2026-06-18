import type { ZoneId } from '../engine/GameEngine';

export type QuestType = 'kill' | 'collect' | 'boss' | 'explore';

export interface Quest {
  id: string; title: string; description: string; type: QuestType;
  zone: ZoneId; targetMonster?: string; targetCount: number; progress: number;
  reward: { xp: number; gold: number; itemName?: string }; difficulty: 'easy' | 'normal' | 'hard' | 'epic';
  completed: boolean; accepted: boolean;
}

const ZONE_MONSTERS: Record<ZoneId, string[]> = {
  city: ['Guarda', 'Ladrão'],
  forest: ['Lobo Cinzento', 'Goblin Floresta', 'Aranha Gigante', 'Centauro', 'Treant'],
  ice: ['Lobo Ártico', 'Golem de Gelo', 'Yeti', 'Fada de Gelo', 'Dragão de Gelo'],
  volcano: ['Salamandra', 'Demônio Fogo', 'Elemental Fogo', 'Golem de Lava', 'Dragão Infernal'],
  desert: ['Escorpião', 'Múmia', 'Anubis', 'Verme da Areia', 'Esfinge'],
  dungeon: ['Esqueleto', 'Vampiro', 'Lich', 'Criatura das Sombras', 'Senhor das Trevas'],
};

const QUEST_TEMPLATES = {
  kill: [
    (m: string, n: number) => ({ title: `Caçada: ${m}`, desc: `Elimine ${n} ${m} para limpar a área.` }),
    (m: string, n: number) => ({ title: `Extermínio de ${m}`, desc: `Os aldeões precisam que você mate ${n} ${m}.` }),
    (m: string, n: number) => ({ title: `Contrato de Caça`, desc: `Alvo: ${n} ${m}. Recompensa garantida.` }),
  ],
  collect: [
    (m: string, n: number) => ({ title: `Coleta de Materiais`, desc: `Obtenha ${n} itens de ${m}.` }),
    (m: string, n: number) => ({ title: `Pesquisa de Campo`, desc: `Colete amostras de ${n} ${m} derrotados.` }),
  ],
  boss: [
    (m: string) => ({ title: `Boss: ${m}`, desc: `Derrote o poderoso ${m}! Recompensa épica.` }),
  ],
  explore: [
    (_z: string) => ({ title: 'Exploração', desc: 'Explore a zona e retorne com informações.' }),
  ],
};

let questIdCounter = 1;

export function generateQuest(playerLevel: number, zone: ZoneId): Quest {
  const monsters = ZONE_MONSTERS[zone] || ZONE_MONSTERS.forest;
  const isBoss = Math.random() < 0.15;
  const type: QuestType = isBoss ? 'boss' : Math.random() < 0.7 ? 'kill' : 'collect';
  const difficulty = playerLevel < 10 ? 'easy' : playerLevel < 25 ? 'normal' : playerLevel < 50 ? 'hard' : 'epic';
  const diffMult = { easy: 1, normal: 1.5, hard: 2.5, epic: 4 }[difficulty];
  const monster = monsters[Math.floor(Math.random() * monsters.length)];
  const count = type === 'boss' ? 1 : Math.floor((3 + Math.random() * 7) * diffMult);
  const xpReward = Math.floor(playerLevel * 20 * diffMult * (type === 'boss' ? 5 : 1));
  const goldReward = Math.floor(playerLevel * 8 * diffMult * (type === 'boss' ? 4 : 1));
  const templates = QUEST_TEMPLATES[type];
  const tmpl = templates[Math.floor(Math.random() * templates.length)];
  const { title, desc } = (tmpl as Function)(monster, count);
  return {
    id: `q_${questIdCounter++}`, title, description: desc, type, zone,
    targetMonster: monster, targetCount: count, progress: 0,
    reward: { xp: xpReward, gold: goldReward, itemName: type === 'boss' || difficulty === 'epic' ? 'Item Raro' : undefined },
    difficulty, completed: false, accepted: false,
  };
}

export function generateQuestBoard(playerLevel: number, zone: ZoneId, count = 5): Quest[] {
  return Array.from({ length: count }, () => generateQuest(playerLevel, zone));
}

export function updateQuestProgress(quest: Quest, monsterKilled: string): Quest {
  if (quest.completed || !quest.accepted) return quest;
  if (quest.targetMonster && monsterKilled.includes(quest.targetMonster.split(' ')[0])) {
    const newProgress = quest.progress + 1;
    return { ...quest, progress: newProgress, completed: newProgress >= quest.targetCount };
  }
  return quest;
}

export const DIFFICULTY_COLOR = { easy: '#2ecc71', normal: '#3498db', hard: '#e67e22', epic: '#9b59b6' };
export const DIFFICULTY_LABEL = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil', epic: 'Épico' };
