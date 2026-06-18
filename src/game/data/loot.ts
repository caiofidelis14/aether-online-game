export type LootRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface LootItem {
  id: string;
  name: string;
  icon: string;
  type: 'material' | 'equippable' | 'consumable';
  slot?: string;
  rarity: LootRarity;
  orbColor: number;
  stats?: Record<string, number>;
  value: number; // sell price in gold
}

export interface DropEntry {
  item: LootItem;
  chance: number; // 0-1
}

export const RARITY_COLORS: Record<LootRarity, number> = {
  common:    0xaaaaaa,
  uncommon:  0x2ecc71,
  rare:      0x3498db,
  epic:      0x9b59b6,
  legendary: 0xf39c12,
};

export const LOOT_ITEMS: Record<string, LootItem> = {
  // ── Materials ───────────────────────────────────────────────────────────
  wolf_pelt:       { id: 'wolf_pelt',       name: 'Pele de Lobo',       icon: '🐾', type: 'material', rarity: 'common',    orbColor: 0xaaaaaa, value: 15 },
  goblin_ear:      { id: 'goblin_ear',      name: 'Orelha de Goblin',   icon: '👂', type: 'material', rarity: 'common',    orbColor: 0x2ecc71, value: 12 },
  spider_silk:     { id: 'spider_silk',     name: 'Seda de Aranha',     icon: '🕸️', type: 'material', rarity: 'uncommon',  orbColor: 0x9b59b6, value: 35 },
  bone_shard:      { id: 'bone_shard',      name: 'Fragmento de Osso',  icon: '🦴', type: 'material', rarity: 'common',    orbColor: 0xddddbb, value: 10 },
  fire_essence:    { id: 'fire_essence',    name: 'Essência de Fogo',   icon: '🔥', type: 'material', rarity: 'uncommon',  orbColor: 0xff8800, value: 50 },
  ice_crystal:     { id: 'ice_crystal',     name: 'Cristal de Gelo',    icon: '❄️', type: 'material', rarity: 'uncommon',  orbColor: 0x88ccff, value: 48 },
  shadow_dust:     { id: 'shadow_dust',     name: 'Pó de Sombra',       icon: '🌑', type: 'material', rarity: 'rare',      orbColor: 0x440088, value: 90 },
  dragon_scale:    { id: 'dragon_scale',    name: 'Escama de Dragão',   icon: '🐉', type: 'material', rarity: 'rare',      orbColor: 0x3498db, value: 200 },
  demon_horn:      { id: 'demon_horn',      name: 'Chifre de Demônio',  icon: '😈', type: 'material', rarity: 'epic',      orbColor: 0xff2200, value: 400 },
  ancient_rune:    { id: 'ancient_rune',    name: 'Runa Antiga',        icon: '🔮', type: 'material', rarity: 'epic',      orbColor: 0x9b59b6, value: 350 },
  phoenix_feather: { id: 'phoenix_feather', name: 'Pena de Fênix',      icon: '🦅', type: 'material', rarity: 'legendary', orbColor: 0xf39c12, value: 1000 },
  void_crystal:    { id: 'void_crystal',    name: 'Cristal do Vazio',   icon: '💎', type: 'material', rarity: 'legendary', orbColor: 0x0044ff, value: 1500 },

  // ── Consumables ──────────────────────────────────────────────────────────
  hp_potion_sm:  { id: 'hp_potion_sm',  name: 'Poção de HP',        icon: '🧪', type: 'consumable', rarity: 'common',   orbColor: 0xff4444, value: 20,  stats: { hp: 80 } },
  hp_potion_lg:  { id: 'hp_potion_lg',  name: 'Poção de HP Grande', icon: '🍷', type: 'consumable', rarity: 'uncommon', orbColor: 0xff0000, value: 60,  stats: { hp: 250 } },
  mp_potion:     { id: 'mp_potion',     name: 'Poção de MP',        icon: '💧', type: 'consumable', rarity: 'common',   orbColor: 0x4488ff, value: 25,  stats: { mp: 100 } },
  elixir:        { id: 'elixir',        name: 'Elixir Divino',      icon: '✨', type: 'consumable', rarity: 'rare',     orbColor: 0xffd700, value: 200, stats: { hp: 500, mp: 300 } },

  // ── Equippables (drops) ───────────────────────────────────────────────────
  iron_sword_drop:  { id: 'iron_sword_drop',  name: 'Espada de Ferro',   icon: '⚔️',  type: 'equippable', slot: 'weapon', rarity: 'common',    orbColor: 0xaaaaaa, value: 80,  stats: { atk: 12 } },
  steel_blade_drop: { id: 'steel_blade_drop', name: 'Lâmina de Aço',     icon: '🗡️',  type: 'equippable', slot: 'weapon', rarity: 'uncommon',  orbColor: 0x2ecc71, value: 180, stats: { atk: 22 } },
  magic_staff_drop: { id: 'magic_staff_drop', name: 'Cajado Mágico',     icon: '🪄',  type: 'equippable', slot: 'weapon', rarity: 'rare',      orbColor: 0x9b59b6, value: 350, stats: { atk: 35, mp: 80 } },
  leather_armor:    { id: 'leather_armor',    name: 'Armadura de Couro', icon: '🥋',  type: 'equippable', slot: 'armor',  rarity: 'common',    orbColor: 0x8B4513, value: 70,  stats: { def: 8 } },
  chain_mail:       { id: 'chain_mail',       name: 'Cota de Malha',     icon: '🛡️',  type: 'equippable', slot: 'armor',  rarity: 'uncommon',  orbColor: 0x888888, value: 200, stats: { def: 18 } },
  plate_armor:      { id: 'plate_armor',      name: 'Armadura de Placas','icon': '⚜️', type: 'equippable', slot: 'armor',  rarity: 'rare',      orbColor: 0x3498db, value: 500, stats: { def: 35, hp: 100 } },
  dragon_shield:    { id: 'dragon_shield',    name: 'Escudo Dracônico',  icon: '🛡️',  type: 'equippable', slot: 'shield', rarity: 'epic',      orbColor: 0x3498db, value: 900, stats: { def: 55, hp: 200 } },
  shadow_wings:     { id: 'shadow_wings',     name: 'Asas das Sombras',  icon: '🦇',  type: 'equippable', slot: 'wings',  rarity: 'epic',      orbColor: 0x440088, value: 1200,stats: { atk: 30, def: 20 } },
  angel_wings:      { id: 'angel_wings',      name: 'Asas de Anjo',      icon: '👼',  type: 'equippable', slot: 'wings',  rarity: 'legendary', orbColor: 0xffffff, value: 3000,stats: { atk: 50, def: 40, hp: 300 } },
};

// Drop table per zone
export const ZONE_DROP_TABLES: Record<string, DropEntry[]> = {
  forest: [
    { item: LOOT_ITEMS.wolf_pelt,      chance: 0.55 },
    { item: LOOT_ITEMS.goblin_ear,     chance: 0.45 },
    { item: LOOT_ITEMS.spider_silk,    chance: 0.20 },
    { item: LOOT_ITEMS.hp_potion_sm,   chance: 0.18 },
    { item: LOOT_ITEMS.iron_sword_drop,chance: 0.08 },
    { item: LOOT_ITEMS.leather_armor,  chance: 0.07 },
    { item: LOOT_ITEMS.steel_blade_drop,chance: 0.04 },
    { item: LOOT_ITEMS.chain_mail,     chance: 0.03 },
    { item: LOOT_ITEMS.mp_potion,      chance: 0.12 },
  ],
  ice: [
    { item: LOOT_ITEMS.ice_crystal,    chance: 0.50 },
    { item: LOOT_ITEMS.hp_potion_sm,   chance: 0.22 },
    { item: LOOT_ITEMS.hp_potion_lg,   chance: 0.10 },
    { item: LOOT_ITEMS.chain_mail,     chance: 0.08 },
    { item: LOOT_ITEMS.steel_blade_drop,chance: 0.06 },
    { item: LOOT_ITEMS.plate_armor,    chance: 0.03 },
    { item: LOOT_ITEMS.magic_staff_drop,chance: 0.04 },
    { item: LOOT_ITEMS.mp_potion,      chance: 0.15 },
  ],
  volcano: [
    { item: LOOT_ITEMS.fire_essence,   chance: 0.55 },
    { item: LOOT_ITEMS.demon_horn,     chance: 0.12 },
    { item: LOOT_ITEMS.hp_potion_lg,   chance: 0.18 },
    { item: LOOT_ITEMS.plate_armor,    chance: 0.07 },
    { item: LOOT_ITEMS.steel_blade_drop,chance: 0.06 },
    { item: LOOT_ITEMS.dragon_scale,   chance: 0.08 },
    { item: LOOT_ITEMS.magic_staff_drop,chance: 0.05 },
    { item: LOOT_ITEMS.elixir,         chance: 0.03 },
  ],
  desert: [
    { item: LOOT_ITEMS.bone_shard,     chance: 0.55 },
    { item: LOOT_ITEMS.ancient_rune,   chance: 0.10 },
    { item: LOOT_ITEMS.hp_potion_sm,   chance: 0.25 },
    { item: LOOT_ITEMS.hp_potion_lg,   chance: 0.12 },
    { item: LOOT_ITEMS.chain_mail,     chance: 0.07 },
    { item: LOOT_ITEMS.plate_armor,    chance: 0.04 },
    { item: LOOT_ITEMS.elixir,         chance: 0.04 },
  ],
  dungeon: [
    { item: LOOT_ITEMS.shadow_dust,    chance: 0.45 },
    { item: LOOT_ITEMS.dragon_scale,   chance: 0.20 },
    { item: LOOT_ITEMS.ancient_rune,   chance: 0.18 },
    { item: LOOT_ITEMS.demon_horn,     chance: 0.15 },
    { item: LOOT_ITEMS.elixir,         chance: 0.10 },
    { item: LOOT_ITEMS.dragon_shield,  chance: 0.06 },
    { item: LOOT_ITEMS.shadow_wings,   chance: 0.04 },
    { item: LOOT_ITEMS.magic_staff_drop,chance: 0.08 },
    { item: LOOT_ITEMS.void_crystal,   chance: 0.03 },
  ],
};

// Boss bonus drops (guaranteed on boss kill)
export const BOSS_DROPS: Record<string, LootItem> = {
  forest: LOOT_ITEMS.dragon_scale,
  ice:    LOOT_ITEMS.ice_crystal,
  volcano:LOOT_ITEMS.demon_horn,
  desert: LOOT_ITEMS.ancient_rune,
  dungeon:LOOT_ITEMS.void_crystal,
};

export function rollDrops(zone: string, isBoss: boolean): LootItem[] {
  const table = ZONE_DROP_TABLES[zone] ?? ZONE_DROP_TABLES.forest;
  const drops: LootItem[] = [];
  for (const entry of table) {
    if (Math.random() < entry.chance) drops.push(entry.item);
  }
  if (isBoss && BOSS_DROPS[zone]) drops.push(BOSS_DROPS[zone]);
  return drops;
}
