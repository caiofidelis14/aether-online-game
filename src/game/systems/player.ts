import type { ClassName } from '../data/classes';
import { CLASSES } from '../data/classes';
import type { Item } from '../data/items';
import { ITEMS } from '../data/items';

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  helmet?: Item;
  boots?: Item;
  gloves?: Item;
  shield?: Item;
  ring1?: Item;
  ring2?: Item;
  amulet?: Item;
}

export interface Player {
  name: string;
  class: ClassName;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: { atk: number; def: number; spd: number; crit: number; dodge: number; mana_regen: number };
  equipment: Equipment;
  inventory: { item: Item; qty: number }[];
  rank: number;
  kills: number;
  deaths: number;
}

export const XP_TABLE = Array.from({ length: 100 }, (_, i) => Math.floor(100 * Math.pow(1.15, i)));

export function createPlayer(name: string, className: ClassName): Player {
  const cls = CLASSES[className];
  const b = cls.baseStats;
  return {
    name, class: className, level: 1, xp: 0, xpToNext: XP_TABLE[0],
    gold: 500, hp: b.hp, maxHp: b.hp, mp: b.mp, maxMp: b.mp,
    stats: { atk: b.atk, def: b.def, spd: b.spd, crit: b.crit, dodge: b.dodge, mana_regen: b.mana_regen },
    equipment: {}, inventory: [
      { item: ITEMS.find(i => i.id === 87)!, qty: 5 },
      { item: ITEMS.find(i => i.id === 88)!, qty: 5 },
    ],
    rank: 0, kills: 0, deaths: 0,
  };
}

export function getTotalStats(player: Player) {
  const cls = CLASSES[player.class];
  const base = cls.baseStats;
  const growth = cls.statGrowth;
  const lvl = player.level - 1;
  let atk = base.atk + growth.atk * lvl;
  let def = base.def + growth.def * lvl;
  let spd = base.spd + growth.spd * lvl;
  let crit = base.crit;
  let dodge = base.dodge;
  let mana_regen = base.mana_regen;
  let hp = base.hp + growth.hp * lvl;
  let mp = base.mp + growth.mp * lvl;

  const eq = player.equipment;
  for (const slot of Object.values(eq)) {
    if (!slot) continue;
    const s = slot.stats;
    if (s.atk) atk += s.atk;
    if (s.def) def += s.def;
    if (s.spd) spd += s.spd;
    if (s.crit) crit += s.crit;
    if (s.dodge) dodge += s.dodge;
    if (s.mana_regen) mana_regen += s.mana_regen;
    if (s.hp) hp += s.hp;
    if (s.mp) mp += s.mp;
  }
  return { atk, def, spd, crit, dodge, mana_regen, maxHp: hp, maxMp: mp };
}

export function addXP(player: Player, amount: number): { player: Player; leveledUp: boolean; newLevel: number } {
  let p = { ...player, xp: player.xp + amount };
  let leveledUp = false;
  while (p.xp >= p.xpToNext && p.level < 100) {
    p.xp -= p.xpToNext;
    p.level += 1;
    p.xpToNext = XP_TABLE[p.level - 1] ?? XP_TABLE[XP_TABLE.length - 1];
    leveledUp = true;
    const stats = getTotalStats(p);
    p.maxHp = stats.maxHp;
    p.maxMp = stats.maxMp;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
  }
  return { player: p, leveledUp, newLevel: p.level };
}

export function equipItem(player: Player, item: Item): Player {
  const slotMap: Record<string, keyof Equipment> = {
    weapon: 'weapon', armor: 'armor', helmet: 'helmet',
    boots: 'boots', gloves: 'gloves', shield: 'shield',
    amulet: 'amulet',
  };
  if (item.type === 'ring') {
    const slot = !player.equipment.ring1 ? 'ring1' : 'ring2';
    const eq = { ...player.equipment, [slot]: item };
    return { ...player, equipment: eq };
  }
  const slot = slotMap[item.type];
  if (!slot) return player;
  return { ...player, equipment: { ...player.equipment, [slot]: item } };
}

export function getRankTitle(kills: number): string {
  if (kills < 10) return 'Novato';
  if (kills < 50) return 'Aventureiro';
  if (kills < 150) return 'Veterano';
  if (kills < 400) return 'Elite';
  if (kills < 1000) return 'Mestre';
  if (kills < 3000) return 'Lendário';
  return 'Imortal';
}
