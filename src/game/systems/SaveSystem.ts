import type { ClassName } from '../data/classes';
import type { ZoneId } from '../engine/GameEngine';
import type { QuestProgress } from '../data/quests';

export interface CharacterSave {
  id: string; name: string; class: ClassName; subClass: string | null;
  level: number; xp: number; xpNext: number; gold: number;
  kills: number; deaths: number; bossKills: number; questsDone: number;
  totalXp: number; hoursPlayed: number; lastPlayed: number; createdAt: number;
  hp: number; maxHp: number; mp: number; maxMp: number; atk: number; def: number;
  skills: Record<string, number>; sp: number; zone: ZoneId;
  tutorialSeen: boolean;
  clan?: string;
  questProgress?: QuestProgress[];
  inventory?: { name: string; icon: string; qty: number; type: string; desc: string }[];
}

const SAVE_KEY = 'aether_online_saves';
const PLAY_TIME_KEY = 'aether_play_times';

export function getCharacters(): CharacterSave[] {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) ?? '[]'); } catch { return []; }
}

export function saveCharacter(char: CharacterSave): void {
  const list = getCharacters(); const idx = list.findIndex(c => c.id === char.id);
  if (idx >= 0) list[idx] = char; else list.push(char);
  localStorage.setItem(SAVE_KEY, JSON.stringify(list));
}

export function deleteCharacter(id: string): void {
  const list = getCharacters().filter(c => c.id !== id);
  localStorage.setItem(SAVE_KEY, JSON.stringify(list));
}

export function createNewCharacter(name: string, cls: ClassName): CharacterSave {
  const classBaseStats: Record<ClassName, { hp: number; mp: number; atk: number; def: number }> = {
    warrior: { hp: 320, mp: 60, atk: 22, def: 20 }, mage: { hp: 140, mp: 260, atk: 32, def: 6 },
    archer: { hp: 185, mp: 125, atk: 26, def: 10 }, priest: { hp: 165, mp: 240, atk: 12, def: 13 },
    ninja: { hp: 165, mp: 140, atk: 30, def: 8 }, paladin: { hp: 280, mp: 160, atk: 18, def: 26 },
    assassin: { hp: 155, mp: 130, atk: 34, def: 7 },
  };
  const s = classBaseStats[cls];
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2)}`, name, class: cls, subClass: null,
    level: 1, xp: 0, xpNext: 100, gold: 500, kills: 0, deaths: 0, bossKills: 0, questsDone: 0,
    totalXp: 0, hoursPlayed: 0, lastPlayed: Date.now(), createdAt: Date.now(),
    hp: s.hp, maxHp: s.hp, mp: s.mp, maxMp: s.mp, atk: s.atk, def: s.def,
    skills: {}, sp: 3, zone: 'city', tutorialSeen: false,
  };
}

export function updatePlayTime(id: string, secondsToAdd: number): void {
  const chars = getCharacters(); const char = chars.find(c => c.id === id);
  if (char) { char.hoursPlayed += secondsToAdd / 3600; char.lastPlayed = Date.now(); saveCharacter(char); }
}

export function formatPlayTime(hours: number): string {
  const h = Math.floor(hours); const m = Math.floor((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
