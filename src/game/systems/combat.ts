import type { Player } from './player';
import { getTotalStats, addXP } from './player';
import type { Monster } from '../data/monsters';
import { ITEMS } from '../data/items';

export interface CombatLog {
  turn: number;
  actor: 'player' | 'monster';
  action: string;
  damage: number;
  isCrit: boolean;
  playerHp: number;
  monsterHp: number;
}

export interface CombatResult {
  won: boolean;
  logs: CombatLog[];
  xpGained: number;
  goldGained: number;
  drops: { item: typeof ITEMS[0]; qty: number }[];
  player: Player;
  leveledUp: boolean;
  newLevel: number;
}

export function simulateCombat(player: Player, monster: Monster): CombatResult {
  const stats = getTotalStats(player);
  let pHp = player.hp;
  let mHp = monster.hp;
  const logs: CombatLog[] = [];
  let turn = 0;
  const maxTurns = 50;

  while (pHp > 0 && mHp > 0 && turn < maxTurns) {
    turn++;
    // Player attacks
    const isCrit = Math.random() * 100 < stats.crit;
    let dmg = Math.max(1, stats.atk - monster.def + Math.floor(Math.random() * 5));
    if (isCrit) dmg = Math.floor(dmg * 1.8);
    mHp = Math.max(0, mHp - dmg);
    logs.push({ turn, actor: 'player', action: isCrit ? 'Crítico!' : 'Ataque', damage: dmg, isCrit, playerHp: pHp, monsterHp: mHp });
    if (mHp <= 0) break;

    // Monster attacks
    const dodged = Math.random() * 100 < stats.dodge;
    if (dodged) {
      logs.push({ turn, actor: 'monster', action: 'Desviou!', damage: 0, isCrit: false, playerHp: pHp, monsterHp: mHp });
    } else {
      const mDmg = Math.max(1, monster.atk - stats.def + Math.floor(Math.random() * 4));
      pHp = Math.max(0, pHp - mDmg);
      logs.push({ turn, actor: 'monster', action: 'Ataque', damage: mDmg, isCrit: false, playerHp: pHp, monsterHp: mHp });
    }
  }

  const won = mHp <= 0;
  let xpGained = 0;
  let goldGained = 0;
  const drops: { item: typeof ITEMS[0]; qty: number }[] = [];

  if (won) {
    xpGained = monster.xp;
    goldGained = monster.gold + Math.floor(Math.random() * monster.gold * 0.3);
    for (const drop of monster.drops) {
      if (Math.random() < drop.chance) {
        const item = ITEMS.find(i => i.id === drop.itemId);
        if (item) drops.push({ item, qty: 1 });
      }
    }
  }

  const { player: updatedPlayer, leveledUp, newLevel } = addXP(
    { ...player, hp: pHp, gold: player.gold + goldGained, kills: player.kills + (won ? 1 : 0), deaths: player.deaths + (won ? 0 : 1) },
    xpGained
  );

  const finalPlayer = { ...updatedPlayer, inventory: addDropsToInventory(updatedPlayer, drops) };

  return { won, logs, xpGained, goldGained, drops, player: finalPlayer, leveledUp, newLevel };
}

function addDropsToInventory(player: Player, drops: { item: typeof ITEMS[0]; qty: number }[]): Player['inventory'] {
  const inv = [...player.inventory];
  for (const drop of drops) {
    const existing = inv.find(i => i.item.id === drop.item.id);
    if (existing) existing.qty += drop.qty;
    else inv.push({ item: drop.item, qty: drop.qty });
  }
  return inv;
}
