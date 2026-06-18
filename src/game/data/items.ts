export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'gloves' | 'ring' | 'amulet' | 'consumable' | 'material' | 'shield';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ClassReq = 'any' | 'mage' | 'archer' | 'priest' | 'ninja' | 'warrior' | 'paladin' | 'assassin';

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  classReq: ClassReq;
  levelReq: number;
  stats: Partial<{ atk: number; def: number; hp: number; mp: number; spd: number; crit: number; mana_regen: number; dodge: number }>;
  icon: string; // emoji for now
  sellPrice: number;
  craftable?: boolean;
  craftRecipe?: { itemId: number; qty: number }[];
  description: string;
}

export const ITEMS: Item[] = [
  // === WEAPONS ===
  { id: 1, name: 'Espada de Ferro', type: 'weapon', rarity: 'common', classReq: 'warrior', levelReq: 1, stats: { atk: 8 }, icon: '⚔️', sellPrice: 50, description: 'Lâmina básica de ferro.' },
  { id: 2, name: 'Arco de Madeira', type: 'weapon', rarity: 'common', classReq: 'archer', levelReq: 1, stats: { atk: 6, spd: 2 }, icon: '🏹', sellPrice: 45, description: 'Arco simples de madeira de carvalho.' },
  { id: 3, name: 'Cajado Arcano', type: 'weapon', rarity: 'common', classReq: 'mage', levelReq: 1, stats: { atk: 4, mp: 20 }, icon: '🪄', sellPrice: 60, description: 'Cajado com cristal fraco.' },
  { id: 4, name: 'Cetro Sagrado', type: 'weapon', rarity: 'common', classReq: 'priest', levelReq: 1, stats: { atk: 3, mana_regen: 2 }, icon: '✝️', sellPrice: 55, description: 'Bênção divina básica.' },
  { id: 5, name: 'Kunai', type: 'weapon', rarity: 'common', classReq: 'ninja', levelReq: 1, stats: { atk: 5, spd: 4, dodge: 2 }, icon: '🗡️', sellPrice: 40, description: 'Lâmina leve ninja.' },
  { id: 6, name: 'Espada de Aço', type: 'weapon', rarity: 'uncommon', classReq: 'warrior', levelReq: 10, stats: { atk: 18 }, icon: '⚔️', sellPrice: 200, craftable: true, craftRecipe: [{ itemId: 201, qty: 3 }, { itemId: 202, qty: 1 }], description: 'Aço forjado em forja nã.' },
  { id: 7, name: 'Arco Élfico', type: 'weapon', rarity: 'uncommon', classReq: 'archer', levelReq: 10, stats: { atk: 14, spd: 5, crit: 5 }, icon: '🏹', sellPrice: 220, description: 'Arco élfico de alta precisão.' },
  { id: 8, name: 'Cajado de Fogo', type: 'weapon', rarity: 'uncommon', classReq: 'mage', levelReq: 10, stats: { atk: 12, mp: 40 }, icon: '🔥', sellPrice: 250, description: 'Canaliza fogo arcano.' },
  { id: 9, name: 'Maça Divina', type: 'weapon', rarity: 'uncommon', classReq: 'priest', levelReq: 10, stats: { atk: 10, hp: 30, mana_regen: 5 }, icon: '🌟', sellPrice: 210, description: 'Maça abençoada pelo templo.' },
  { id: 10, name: 'Katana Sombria', type: 'weapon', rarity: 'uncommon', classReq: 'ninja', levelReq: 10, stats: { atk: 15, spd: 6, crit: 8 }, icon: '🗡️', sellPrice: 230, description: 'Katana forjada nas sombras.' },
  { id: 11, name: 'Espada Flamejante', type: 'weapon', rarity: 'rare', classReq: 'warrior', levelReq: 25, stats: { atk: 35, crit: 10 }, icon: '🔥', sellPrice: 800, description: 'Lâmina encantada com fogo eterno.' },
  { id: 12, name: 'Arco do Vento', type: 'weapon', rarity: 'rare', classReq: 'archer', levelReq: 25, stats: { atk: 28, spd: 12, crit: 15 }, icon: '💨', sellPrice: 900, description: 'Flecha segue o vento.' },
  { id: 13, name: 'Orbe do Caos', type: 'weapon', rarity: 'rare', classReq: 'mage', levelReq: 25, stats: { atk: 25, mp: 80, crit: 12 }, icon: '🌀', sellPrice: 950, description: 'Caos concentrado em cristal.' },
  { id: 14, name: 'Cajado da Vida', type: 'weapon', rarity: 'rare', classReq: 'priest', levelReq: 25, stats: { atk: 18, hp: 80, mana_regen: 12 }, icon: '💚', sellPrice: 850, description: 'Cura com cada toque.' },
  { id: 15, name: 'Ninjato Lunar', type: 'weapon', rarity: 'rare', classReq: 'ninja', levelReq: 25, stats: { atk: 30, spd: 18, dodge: 15, crit: 20 }, icon: '🌙', sellPrice: 920, description: 'Forjado à luz da lua cheia.' },
  { id: 16, name: 'Espadão do Dragão', type: 'weapon', rarity: 'epic', classReq: 'warrior', levelReq: 50, stats: { atk: 80, crit: 25, hp: 100 }, icon: '🐉', sellPrice: 5000, description: 'Forjada com escama de dragão.' },
  { id: 17, name: 'Arco Divino', type: 'weapon', rarity: 'epic', classReq: 'archer', levelReq: 50, stats: { atk: 65, spd: 25, crit: 35 }, icon: '✨', sellPrice: 5500, description: 'Concedido pelos deuses.' },
  { id: 18, name: 'Cajado do Arcano Supremo', type: 'weapon', rarity: 'epic', classReq: 'mage', levelReq: 50, stats: { atk: 60, mp: 200, crit: 30 }, icon: '💜', sellPrice: 6000, description: 'Poder arcano supremo.' },
  { id: 19, name: 'Lança Celestial', type: 'weapon', rarity: 'epic', classReq: 'priest', levelReq: 50, stats: { atk: 50, hp: 200, mana_regen: 30 }, icon: '⭐', sellPrice: 5200, description: 'Arma dos deuses curandeiros.' },
  { id: 20, name: 'Sombra Dupla', type: 'weapon', rarity: 'epic', classReq: 'ninja', levelReq: 50, stats: { atk: 70, spd: 40, dodge: 30, crit: 40 }, icon: '🌑', sellPrice: 5800, description: 'Dois gumes, uma alma.' },
  { id: 21, name: 'Excalibur', type: 'weapon', rarity: 'legendary', classReq: 'warrior', levelReq: 80, stats: { atk: 180, crit: 50, hp: 300 }, icon: '👑', sellPrice: 50000, description: 'A espada lendária do rei eterno.' },
  { id: 22, name: 'Arco do Fim dos Tempos', type: 'weapon', rarity: 'legendary', classReq: 'archer', levelReq: 80, stats: { atk: 150, spd: 60, crit: 70 }, icon: '💫', sellPrice: 55000, description: 'Uma flecha pode destruir um mundo.' },
  { id: 23, name: 'Cajado do Criador', type: 'weapon', rarity: 'legendary', classReq: 'mage', levelReq: 80, stats: { atk: 140, mp: 500, crit: 60 }, icon: '🔮', sellPrice: 60000, description: 'Criado pelo primeiro mago.' },
  { id: 24, name: 'Martelo Divino', type: 'weapon', rarity: 'legendary', classReq: 'priest', levelReq: 80, stats: { atk: 120, hp: 500, mana_regen: 80 }, icon: '⚡', sellPrice: 52000, description: 'O julgamento dos deuses.' },
  { id: 25, name: 'Void Blade', type: 'weapon', rarity: 'legendary', classReq: 'ninja', levelReq: 80, stats: { atk: 160, spd: 80, dodge: 60, crit: 80 }, icon: '🌌', sellPrice: 58000, description: 'Nascida no vazio entre mundos.' },

  // === ARMOR ===
  { id: 26, name: 'Túnica de Tecido', type: 'armor', rarity: 'common', classReq: 'any', levelReq: 1, stats: { def: 5 }, icon: '👘', sellPrice: 30, description: 'Proteção mínima.' },
  { id: 27, name: 'Armadura de Couro', type: 'armor', rarity: 'common', classReq: 'any', levelReq: 1, stats: { def: 10 }, icon: '🦺', sellPrice: 60, description: 'Couro curtido básico.' },
  { id: 28, name: 'Manto Arcano', type: 'armor', rarity: 'uncommon', classReq: 'mage', levelReq: 5, stats: { def: 8, mp: 30 }, icon: '🧥', sellPrice: 150, description: 'Manto com runas mágicas.' },
  { id: 29, name: 'Armadura de Cota de Malha', type: 'armor', rarity: 'uncommon', classReq: 'warrior', levelReq: 10, stats: { def: 22 }, icon: '🛡️', sellPrice: 300, description: 'Anéis de aço entrelaçados.' },
  { id: 30, name: 'Colete de Sombra', type: 'armor', rarity: 'uncommon', classReq: 'ninja', levelReq: 8, stats: { def: 12, dodge: 8 }, icon: '🕶️', sellPrice: 220, description: 'Colete feito de material sombrio.' },
  { id: 31, name: 'Vestimenta Sagrada', type: 'armor', rarity: 'uncommon', classReq: 'priest', levelReq: 8, stats: { def: 10, hp: 40, mana_regen: 3 }, icon: '✨', sellPrice: 250, description: 'Tecido abençoado.' },
  { id: 32, name: 'Jaqueta de Escamas', type: 'armor', rarity: 'uncommon', classReq: 'archer', levelReq: 8, stats: { def: 15, spd: 3 }, icon: '🦎', sellPrice: 230, description: 'Feita de escamas de lagarto.' },
  { id: 33, name: 'Armadura de Placa', type: 'armor', rarity: 'rare', classReq: 'warrior', levelReq: 20, stats: { def: 45, hp: 60 }, icon: '⚙️', sellPrice: 1000, description: 'Proteção total de placa de aço.' },
  { id: 34, name: 'Manto do Arquimago', type: 'armor', rarity: 'rare', classReq: 'mage', levelReq: 20, stats: { def: 20, mp: 100, crit: 8 }, icon: '💜', sellPrice: 1100, description: 'Usado pelos maiores magos.' },
  { id: 35, name: 'Armadura do Ninja Sombrio', type: 'armor', rarity: 'rare', classReq: 'ninja', levelReq: 20, stats: { def: 28, dodge: 20, spd: 10 }, icon: '🌑', sellPrice: 1050, description: 'Absorve a sombra ao redor.' },
  { id: 36, name: 'Vestes da Luz', type: 'armor', rarity: 'rare', classReq: 'priest', levelReq: 20, stats: { def: 22, hp: 100, mana_regen: 10 }, icon: '☀️', sellPrice: 980, description: 'Irradiam luz santa.' },
  { id: 37, name: 'Manto do Vento', type: 'armor', rarity: 'rare', classReq: 'archer', levelReq: 20, stats: { def: 30, spd: 15, crit: 10 }, icon: '💨', sellPrice: 1000, description: 'Leve como o vento.' },
  { id: 38, name: 'Armadura do Dragão Negro', type: 'armor', rarity: 'epic', classReq: 'warrior', levelReq: 45, stats: { def: 100, hp: 200, crit: 15 }, icon: '🐲', sellPrice: 8000, description: 'Forjada em escamas de dragão negro.' },
  { id: 39, name: 'Manto Eterno', type: 'armor', rarity: 'epic', classReq: 'mage', levelReq: 45, stats: { def: 55, mp: 250, crit: 20 }, icon: '🌌', sellPrice: 8500, description: 'Existe além do tempo.' },
  { id: 40, name: 'Armadura Lendária do Paladino', type: 'armor', rarity: 'legendary', classReq: 'paladin', levelReq: 70, stats: { def: 200, hp: 400, mana_regen: 20 }, icon: '👑', sellPrice: 40000, description: 'O paladino supremo.' },

  // === HELMET ===
  { id: 41, name: 'Capuz de Tecido', type: 'helmet', rarity: 'common', classReq: 'any', levelReq: 1, stats: { def: 3 }, icon: '🎩', sellPrice: 20, description: 'Capuz simples.' },
  { id: 42, name: 'Elmo de Ferro', type: 'helmet', rarity: 'common', classReq: 'warrior', levelReq: 5, stats: { def: 8 }, icon: '⛑️', sellPrice: 70, description: 'Elmo básico de ferro.' },
  { id: 43, name: 'Chapéu do Mago', type: 'helmet', rarity: 'uncommon', classReq: 'mage', levelReq: 5, stats: { def: 5, mp: 25 }, icon: '🎓', sellPrice: 120, description: 'Amplifica poder arcano.' },
  { id: 44, name: 'Capuz do Ninja', type: 'helmet', rarity: 'uncommon', classReq: 'ninja', levelReq: 5, stats: { def: 6, dodge: 5 }, icon: '🥷', sellPrice: 110, description: 'Esconde identidade.' },
  { id: 45, name: 'Tiara Sagrada', type: 'helmet', rarity: 'uncommon', classReq: 'priest', levelReq: 5, stats: { def: 4, mana_regen: 4 }, icon: '🌟', sellPrice: 130, description: 'Abençoada pelos anjos.' },
  { id: 46, name: 'Elmo de Aço', type: 'helmet', rarity: 'uncommon', classReq: 'warrior', levelReq: 15, stats: { def: 18, hp: 20 }, icon: '⛑️', sellPrice: 280, description: 'Proteção superior.' },
  { id: 47, name: 'Máscara Sombria', type: 'helmet', rarity: 'rare', classReq: 'ninja', levelReq: 20, stats: { def: 15, dodge: 18, crit: 10 }, icon: '😈', sellPrice: 800, description: 'Máscara que esconde a alma.' },
  { id: 48, name: 'Elmo do Dragão', type: 'helmet', rarity: 'epic', classReq: 'warrior', levelReq: 45, stats: { def: 80, hp: 150 }, icon: '🐉', sellPrice: 6000, description: 'Cabeça de dragão como elmo.' },
  { id: 49, name: 'Coroa Arcana', type: 'helmet', rarity: 'epic', classReq: 'mage', levelReq: 45, stats: { def: 40, mp: 200, crit: 25 }, icon: '👑', sellPrice: 7000, description: 'Coroa dos magos supremos.' },
  { id: 50, name: 'Elmo Celestial', type: 'helmet', rarity: 'legendary', classReq: 'any', levelReq: 75, stats: { def: 150, hp: 300, mp: 300 }, icon: '✨', sellPrice: 35000, description: 'Concedido pelos próprios deuses.' },

  // === BOOTS ===
  { id: 51, name: 'Sandálias Simples', type: 'boots', rarity: 'common', classReq: 'any', levelReq: 1, stats: { spd: 2 }, icon: '👟', sellPrice: 15, description: 'Sandálias básicas.' },
  { id: 52, name: 'Botas de Couro', type: 'boots', rarity: 'common', classReq: 'any', levelReq: 3, stats: { def: 4, spd: 3 }, icon: '👢', sellPrice: 50, description: 'Couro curtido nos pés.' },
  { id: 53, name: 'Botas do Vento', type: 'boots', rarity: 'uncommon', classReq: 'archer', levelReq: 8, stats: { spd: 10, dodge: 5 }, icon: '💨', sellPrice: 180, description: 'Correr como o vento.' },
  { id: 54, name: 'Sapatilhas do Ninja', type: 'boots', rarity: 'uncommon', classReq: 'ninja', levelReq: 8, stats: { spd: 12, dodge: 8 }, icon: '🥷', sellPrice: 200, description: 'Silenciosas como sombras.' },
  { id: 55, name: 'Botas Arcanas', type: 'boots', rarity: 'uncommon', classReq: 'mage', levelReq: 8, stats: { spd: 5, mp: 20 }, icon: '🌀', sellPrice: 160, description: 'Botas com runas.' },
  { id: 56, name: 'Grevas de Ferro', type: 'boots', rarity: 'uncommon', classReq: 'warrior', levelReq: 10, stats: { def: 12, spd: 4 }, icon: '🦶', sellPrice: 220, description: 'Proteção nos pés.' },
  { id: 57, name: 'Botas Sagradas', type: 'boots', rarity: 'rare', classReq: 'priest', levelReq: 20, stats: { def: 10, hp: 50, spd: 8 }, icon: '☀️', sellPrice: 700, description: 'Passos abençoados.' },
  { id: 58, name: 'Botas do Dragão', type: 'boots', rarity: 'epic', classReq: 'warrior', levelReq: 45, stats: { def: 60, spd: 20, hp: 100 }, icon: '🐲', sellPrice: 5500, description: 'Escamas de dragão nos pés.' },
  { id: 59, name: 'Botas da Sombra Eterna', type: 'boots', rarity: 'epic', classReq: 'ninja', levelReq: 45, stats: { spd: 50, dodge: 40 }, icon: '🌑', sellPrice: 6000, description: 'Desaparecer a cada passo.' },
  { id: 60, name: 'Sandálias Celestiais', type: 'boots', rarity: 'legendary', classReq: 'any', levelReq: 75, stats: { spd: 80, dodge: 50, def: 80 }, icon: '✨', sellPrice: 30000, description: 'Caminhar entre os céus.' },

  // === GLOVES ===
  { id: 61, name: 'Luvas de Tecido', type: 'gloves', rarity: 'common', classReq: 'any', levelReq: 1, stats: { atk: 1 }, icon: '🧤', sellPrice: 15, description: 'Luvas básicas.' },
  { id: 62, name: 'Manoplas de Couro', type: 'gloves', rarity: 'common', classReq: 'any', levelReq: 3, stats: { atk: 3, def: 3 }, icon: '🥊', sellPrice: 45, description: 'Couro nas mãos.' },
  { id: 63, name: 'Luvas do Arqueiro', type: 'gloves', rarity: 'uncommon', classReq: 'archer', levelReq: 8, stats: { atk: 8, crit: 8 }, icon: '🏹', sellPrice: 180, description: 'Precisão máxima no arco.' },
  { id: 64, name: 'Luvas do Ninja', type: 'gloves', rarity: 'uncommon', classReq: 'ninja', levelReq: 8, stats: { atk: 7, spd: 5, crit: 6 }, icon: '🥷', sellPrice: 190, description: 'Toque silencioso.' },
  { id: 65, name: 'Manoplas de Ferro', type: 'gloves', rarity: 'uncommon', classReq: 'warrior', levelReq: 10, stats: { atk: 10, def: 8 }, icon: '⚙️', sellPrice: 210, description: 'Golpes mais fortes.' },
  { id: 66, name: 'Luvas Arcanas', type: 'gloves', rarity: 'rare', classReq: 'mage', levelReq: 20, stats: { atk: 15, mp: 60, crit: 12 }, icon: '💜', sellPrice: 800, description: 'Canal de poder arcano.' },
  { id: 67, name: 'Luvas do Dragão', type: 'gloves', rarity: 'epic', classReq: 'warrior', levelReq: 45, stats: { atk: 60, def: 40, crit: 20 }, icon: '🐉', sellPrice: 5000, description: 'Garras de dragão.' },
  { id: 68, name: 'Luvas Celestiais', type: 'gloves', rarity: 'legendary', classReq: 'any', levelReq: 75, stats: { atk: 100, crit: 50, def: 60 }, icon: '✨', sellPrice: 28000, description: 'Toque dos deuses.' },

  // === SHIELDS ===
  { id: 69, name: 'Escudo de Madeira', type: 'shield', rarity: 'common', classReq: 'warrior', levelReq: 1, stats: { def: 12 }, icon: '🛡️', sellPrice: 40, description: 'Proteção básica de madeira.' },
  { id: 70, name: 'Escudo de Ferro', type: 'shield', rarity: 'uncommon', classReq: 'warrior', levelReq: 10, stats: { def: 28 }, icon: '🛡️', sellPrice: 250, description: 'Escudo sólido de ferro.' },
  { id: 71, name: 'Escudo Sagrado', type: 'shield', rarity: 'rare', classReq: 'paladin', levelReq: 20, stats: { def: 50, hp: 60 }, icon: '⭐', sellPrice: 900, description: 'Abençoado pelos deuses.' },
  { id: 72, name: 'Escudo do Dragão', type: 'shield', rarity: 'epic', classReq: 'warrior', levelReq: 45, stats: { def: 120, hp: 150 }, icon: '🐉', sellPrice: 7000, description: 'Escudo feito de escamas.' },
  { id: 73, name: 'Aegis Divina', type: 'shield', rarity: 'legendary', classReq: 'paladin', levelReq: 75, stats: { def: 250, hp: 400, mana_regen: 15 }, icon: '👑', sellPrice: 45000, description: 'Escudo dos deuses supremos.' },

  // === RINGS ===
  { id: 74, name: 'Anel de Cobre', type: 'ring', rarity: 'common', classReq: 'any', levelReq: 1, stats: { hp: 10 }, icon: '💍', sellPrice: 25, description: 'Anel simples.' },
  { id: 75, name: 'Anel de Prata', type: 'ring', rarity: 'uncommon', classReq: 'any', levelReq: 5, stats: { hp: 25, mp: 15 }, icon: '💍', sellPrice: 150, description: 'Anel de prata pura.' },
  { id: 76, name: 'Anel Arcano', type: 'ring', rarity: 'rare', classReq: 'mage', levelReq: 15, stats: { mp: 60, crit: 10 }, icon: '🌀', sellPrice: 600, description: 'Anel com gema arcana.' },
  { id: 77, name: 'Anel do Guerreiro', type: 'ring', rarity: 'rare', classReq: 'warrior', levelReq: 15, stats: { atk: 20, hp: 40 }, icon: '⚔️', sellPrice: 650, description: 'Força bruta concentrada.' },
  { id: 78, name: 'Anel da Sombra', type: 'ring', rarity: 'epic', classReq: 'ninja', levelReq: 40, stats: { crit: 30, dodge: 25 }, icon: '🌑', sellPrice: 5000, description: 'Anel forjado nas sombras.' },
  { id: 79, name: 'Anel do Dragão', type: 'ring', rarity: 'legendary', classReq: 'any', levelReq: 70, stats: { atk: 80, hp: 200, crit: 40 }, icon: '🐉', sellPrice: 30000, description: 'Escama de dragão moldada em anel.' },
  { id: 80, name: 'Anel Eterno', type: 'ring', rarity: 'legendary', classReq: 'any', levelReq: 80, stats: { hp: 500, mp: 500 }, icon: '💫', sellPrice: 50000, description: 'O anel que não tem fim.' },

  // === AMULETS ===
  { id: 81, name: 'Amuleto de Osso', type: 'amulet', rarity: 'common', classReq: 'any', levelReq: 1, stats: { hp: 15 }, icon: '🦴', sellPrice: 20, description: 'Amuleto primitivo.' },
  { id: 82, name: 'Amuleto de Cristal', type: 'amulet', rarity: 'uncommon', classReq: 'any', levelReq: 5, stats: { hp: 30, mp: 20 }, icon: '🔮', sellPrice: 130, description: 'Cristal mágico como amuleto.' },
  { id: 83, name: 'Amuleto do Fogo', type: 'amulet', rarity: 'rare', classReq: 'mage', levelReq: 15, stats: { atk: 15, crit: 12 }, icon: '🔥', sellPrice: 700, description: 'Resistência ao fogo.' },
  { id: 84, name: 'Amuleto da Vida', type: 'amulet', rarity: 'rare', classReq: 'priest', levelReq: 15, stats: { hp: 100, mana_regen: 8 }, icon: '💚', sellPrice: 650, description: 'Força vital amplificada.' },
  { id: 85, name: 'Amuleto do Tempo', type: 'amulet', rarity: 'epic', classReq: 'any', levelReq: 40, stats: { spd: 30, dodge: 20 }, icon: '⏰', sellPrice: 5500, description: 'Distorce o tempo ao redor.' },
  { id: 86, name: 'Amuleto do Criador', type: 'amulet', rarity: 'legendary', classReq: 'any', levelReq: 75, stats: { atk: 60, hp: 300, mp: 300, crit: 30 }, icon: '🌟', sellPrice: 40000, description: 'Criado no início dos tempos.' },

  // === CONSUMABLES ===
  { id: 87, name: 'Poção de Vida Pequena', type: 'consumable', rarity: 'common', classReq: 'any', levelReq: 1, stats: { hp: 50 }, icon: '🧪', sellPrice: 10, description: 'Restaura 50 HP.' },
  { id: 88, name: 'Poção de Mana Pequena', type: 'consumable', rarity: 'common', classReq: 'any', levelReq: 1, stats: { mp: 30 }, icon: '💧', sellPrice: 10, description: 'Restaura 30 MP.' },
  { id: 89, name: 'Poção de Vida Média', type: 'consumable', rarity: 'uncommon', classReq: 'any', levelReq: 10, stats: { hp: 150 }, icon: '🧪', sellPrice: 50, description: 'Restaura 150 HP.' },
  { id: 90, name: 'Poção de Mana Média', type: 'consumable', rarity: 'uncommon', classReq: 'any', levelReq: 10, stats: { mp: 100 }, icon: '💧', sellPrice: 50, description: 'Restaura 100 MP.' },
  { id: 91, name: 'Poção de Vida Grande', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 25, stats: { hp: 400 }, icon: '❤️', sellPrice: 200, description: 'Restaura 400 HP.' },
  { id: 92, name: 'Poção de Mana Grande', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 25, stats: { mp: 300 }, icon: '💙', sellPrice: 200, description: 'Restaura 300 MP.' },
  { id: 93, name: 'Elixir da Força', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 20, stats: { atk: 30 }, icon: '💪', sellPrice: 300, description: '+30 ATK por 60s.' },
  { id: 94, name: 'Elixir da Velocidade', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 20, stats: { spd: 20 }, icon: '⚡', sellPrice: 280, description: '+20 SPD por 60s.' },
  { id: 95, name: 'Poção Máxima de Vida', type: 'consumable', rarity: 'epic', classReq: 'any', levelReq: 50, stats: { hp: 1000 }, icon: '❤️‍🔥', sellPrice: 1000, description: 'Restaura 1000 HP.' },
  { id: 96, name: 'Elixir Divino', type: 'consumable', rarity: 'legendary', classReq: 'any', levelReq: 60, stats: { hp: 9999, mp: 9999 }, icon: '🌟', sellPrice: 10000, description: 'HP e MP máximos instantâneos.' },

  // === MATERIALS ===
  { id: 201, name: 'Minério de Ferro', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '⛏️', sellPrice: 5, description: 'Minério básico de ferro.' },
  { id: 202, name: 'Carvão', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🪨', sellPrice: 3, description: 'Combustível para forja.' },
  { id: 203, name: 'Minério de Aço', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '⛏️', sellPrice: 20, description: 'Minério refinado de aço.' },
  { id: 204, name: 'Cristal Mágico', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '💎', sellPrice: 30, description: 'Cristal com energia arcana.' },
  { id: 205, name: 'Escama de Lagarto', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🦎', sellPrice: 8, description: 'Drop de lagartos.' },
  { id: 206, name: 'Pena de Águia', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '🦅', sellPrice: 15, description: 'Pluma leve de águia.' },
  { id: 207, name: 'Escama de Dragão', type: 'material', rarity: 'epic', classReq: 'any', levelReq: 1, stats: {}, icon: '🐉', sellPrice: 500, description: 'Drop raro de dragões.' },
  { id: 208, name: 'Gema Celestial', type: 'material', rarity: 'legendary', classReq: 'any', levelReq: 1, stats: {}, icon: '💠', sellPrice: 2000, description: 'Drop dos chefes supremos.' },
  { id: 209, name: 'Tecido de Seda', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🧵', sellPrice: 6, description: 'Seda para armaduras leves.' },
  { id: 210, name: 'Osso de Monstro', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🦴', sellPrice: 4, description: 'Drop de monstros básicos.' },
  { id: 211, name: 'Essência de Fogo', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🔥', sellPrice: 80, description: 'Essência extraída de elementais de fogo.' },
  { id: 212, name: 'Essência de Gelo', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '❄️', sellPrice: 80, description: 'Essência de elementais de gelo.' },
  { id: 213, name: 'Essência de Trovão', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '⚡', sellPrice: 80, description: 'Essência de trovão.' },
  { id: 214, name: 'Couro de Lobo', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🐺', sellPrice: 10, description: 'Drop de lobos da floresta.' },
  { id: 215, name: 'Veneno de Aranha', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '🕷️', sellPrice: 25, description: 'Veneno das aranhas gigantes.' },

  // === MAIS ARMAS ===
  { id: 97, name: 'Espada Dupla', type: 'weapon', rarity: 'uncommon', classReq: 'warrior', levelReq: 15, stats: { atk: 22, spd: 5 }, icon: '⚔️', sellPrice: 400, description: 'Duas lâminas, dobro de cortes.' },
  { id: 98, name: 'Machado de Batalha', type: 'weapon', rarity: 'uncommon', classReq: 'warrior', levelReq: 12, stats: { atk: 28 }, icon: '🪓', sellPrice: 380, description: 'Machado pesado de batalha.' },
  { id: 99, name: 'Lança de Ferro', type: 'weapon', rarity: 'common', classReq: 'warrior', levelReq: 5, stats: { atk: 10, spd: 2 }, icon: '🔱', sellPrice: 80, description: 'Alcance maior.' },
  { id: 100, name: 'Arco Composto', type: 'weapon', rarity: 'rare', classReq: 'archer', levelReq: 18, stats: { atk: 30, crit: 18 }, icon: '🏹', sellPrice: 750, description: 'Arco de alta tensão.' },
  { id: 101, name: 'Besta de Ferro', type: 'weapon', rarity: 'uncommon', classReq: 'archer', levelReq: 12, stats: { atk: 20, crit: 8 }, icon: '🏹', sellPrice: 350, description: 'Besta mecânica.' },
  { id: 102, name: 'Cajado de Gelo', type: 'weapon', rarity: 'uncommon', classReq: 'mage', levelReq: 10, stats: { atk: 11, mp: 35 }, icon: '❄️', sellPrice: 240, description: 'Congela inimigos.' },
  { id: 103, name: 'Cajado de Raio', type: 'weapon', rarity: 'rare', classReq: 'mage', levelReq: 22, stats: { atk: 22, mp: 70, crit: 15 }, icon: '⚡', sellPrice: 800, description: 'Raios arcanos.' },
  { id: 104, name: 'Livro das Sombras', type: 'weapon', rarity: 'rare', classReq: 'mage', levelReq: 20, stats: { atk: 18, mp: 80 }, icon: '📕', sellPrice: 700, description: 'Feitiços proibidos.' },
  { id: 105, name: 'Maça de Ferro', type: 'weapon', rarity: 'common', classReq: 'priest', levelReq: 5, stats: { atk: 7, hp: 15 }, icon: '🔨', sellPrice: 65, description: 'Maça pesada de ferro.' },
  { id: 106, name: 'Cajado da Cura', type: 'weapon', rarity: 'rare', classReq: 'priest', levelReq: 20, stats: { atk: 12, hp: 60, mana_regen: 15 }, icon: '💚', sellPrice: 750, description: 'Especializado em cura.' },
  { id: 107, name: 'Shuriken de Aço', type: 'weapon', rarity: 'uncommon', classReq: 'ninja', levelReq: 8, stats: { atk: 12, crit: 10, spd: 3 }, icon: '⭐', sellPrice: 180, description: 'Estrelas de aço.' },
  { id: 108, name: 'Gancho do Ninja', type: 'weapon', rarity: 'rare', classReq: 'ninja', levelReq: 18, stats: { atk: 25, spd: 12, dodge: 8 }, icon: '🪝', sellPrice: 700, description: 'Gancho para escalar e atacar.' },
  { id: 109, name: 'Espada do Paladino', type: 'weapon', rarity: 'rare', classReq: 'paladin', levelReq: 20, stats: { atk: 30, def: 10, hp: 50 }, icon: '✝️', sellPrice: 850, description: 'Espada abençoada.' },
  { id: 110, name: 'Lança do Paladino', type: 'weapon', rarity: 'epic', classReq: 'paladin', levelReq: 45, stats: { atk: 75, def: 30, hp: 120 }, icon: '🌟', sellPrice: 6000, description: 'Lança sagrada dos paladinos.' },
  { id: 111, name: 'Punhal Envenenado', type: 'weapon', rarity: 'rare', classReq: 'assassin', levelReq: 20, stats: { atk: 28, crit: 25, dodge: 10 }, icon: '🗡️', sellPrice: 900, description: 'Veneno nas lâminas.' },
  { id: 112, name: 'Espadas Duplas do Assassino', type: 'weapon', rarity: 'epic', classReq: 'assassin', levelReq: 45, stats: { atk: 72, crit: 45, spd: 25 }, icon: '⚔️', sellPrice: 6200, description: 'Morte rápida garantida.' },

  // === MAIS ARMADURAS ===
  { id: 113, name: 'Armadura de Escamas', type: 'armor', rarity: 'uncommon', classReq: 'warrior', levelReq: 12, stats: { def: 25, spd: 2 }, icon: '🦎', sellPrice: 320, description: 'Escamas naturais.' },
  { id: 114, name: 'Manto do Assassino', type: 'armor', rarity: 'rare', classReq: 'assassin', levelReq: 20, stats: { def: 22, crit: 15, dodge: 15 }, icon: '🌑', sellPrice: 900, description: 'Manto para matar silenciosamente.' },
  { id: 115, name: 'Armadura do Paladino', type: 'armor', rarity: 'rare', classReq: 'paladin', levelReq: 20, stats: { def: 50, hp: 80 }, icon: '⭐', sellPrice: 1000, description: 'Armadura sagrada pesada.' },
  { id: 116, name: 'Manto do Sacerdote', type: 'armor', rarity: 'uncommon', classReq: 'priest', levelReq: 8, stats: { def: 10, hp: 35, mana_regen: 4 }, icon: '✝️', sellPrice: 260, description: 'Tecido sagrado.' },

  // === MAIS ELMOS ===
  { id: 117, name: 'Elmo do Paladino', type: 'helmet', rarity: 'rare', classReq: 'paladin', levelReq: 20, stats: { def: 35, hp: 60 }, icon: '⭐', sellPrice: 800, description: 'Elmo sagrado.' },
  { id: 118, name: 'Capuz do Assassino', type: 'helmet', rarity: 'rare', classReq: 'assassin', levelReq: 20, stats: { def: 12, crit: 15, dodge: 12 }, icon: '😈', sellPrice: 780, description: 'Capuz sombrio.' },
  { id: 119, name: 'Capacete do Arqueiro', type: 'helmet', rarity: 'uncommon', classReq: 'archer', levelReq: 8, stats: { def: 8, crit: 6 }, icon: '🎯', sellPrice: 120, description: 'Viseira de precisão.' },
  { id: 120, name: 'Elmo de Aço do Guerreiro', type: 'helmet', rarity: 'rare', classReq: 'warrior', levelReq: 18, stats: { def: 28, hp: 40 }, icon: '⛑️', sellPrice: 750, description: 'Proteção máxima.' },

  // === MAIS ANÉIS E AMULETOS ===
  { id: 121, name: 'Anel do Crítico', type: 'ring', rarity: 'rare', classReq: 'any', levelReq: 15, stats: { crit: 20 }, icon: '💥', sellPrice: 600, description: 'Críticos mais frequentes.' },
  { id: 122, name: 'Anel da Velocidade', type: 'ring', rarity: 'rare', classReq: 'any', levelReq: 15, stats: { spd: 18, dodge: 10 }, icon: '💨', sellPrice: 580, description: 'Mover mais rápido.' },
  { id: 123, name: 'Anel da Força', type: 'ring', rarity: 'rare', classReq: 'warrior', levelReq: 15, stats: { atk: 25, hp: 30 }, icon: '💪', sellPrice: 620, description: 'Força aumentada.' },
  { id: 124, name: 'Amuleto do Arqueiro', type: 'amulet', rarity: 'rare', classReq: 'archer', levelReq: 15, stats: { atk: 18, crit: 15 }, icon: '🎯', sellPrice: 680, description: 'Precisão de archer.' },
  { id: 125, name: 'Amuleto da Escuridão', type: 'amulet', rarity: 'epic', classReq: 'ninja', levelReq: 40, stats: { crit: 25, dodge: 30, spd: 20 }, icon: '🌑', sellPrice: 5200, description: 'Poder das sombras.' },
  { id: 126, name: 'Anel do Mago', type: 'ring', rarity: 'rare', classReq: 'mage', levelReq: 15, stats: { mp: 80, crit: 12 }, icon: '🔮', sellPrice: 700, description: 'Poder arcano.' },
  { id: 127, name: 'Amuleto do Guerreiro', type: 'amulet', rarity: 'uncommon', classReq: 'warrior', levelReq: 8, stats: { atk: 12, hp: 30 }, icon: '⚔️', sellPrice: 200, description: 'Bravura do guerreiro.' },
  { id: 128, name: 'Anel do Paladino', type: 'ring', rarity: 'rare', classReq: 'paladin', levelReq: 18, stats: { def: 20, hp: 60 }, icon: '✝️', sellPrice: 720, description: 'Proteção divina.' },
  { id: 129, name: 'Amuleto do Sacerdote', type: 'amulet', rarity: 'rare', classReq: 'priest', levelReq: 15, stats: { hp: 80, mana_regen: 12 }, icon: '💚', sellPrice: 660, description: 'Cura ampliada.' },
  { id: 130, name: 'Anel do Assassino', type: 'ring', rarity: 'epic', classReq: 'assassin', levelReq: 40, stats: { crit: 35, dodge: 20 }, icon: '🗡️', sellPrice: 5100, description: 'Morte instantânea.' },

  // === MAIS CONSUMIBLES & OUTROS ===
  { id: 131, name: 'Pergaminho de Teletransporte', type: 'consumable', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '📜', sellPrice: 100, description: 'Teleporta para cidade.' },
  { id: 132, name: 'Pergaminho de Identificação', type: 'consumable', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '📜', sellPrice: 20, description: 'Identifica itens.' },
  { id: 133, name: 'Antídoto', type: 'consumable', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '💊', sellPrice: 15, description: 'Cura veneno.' },
  { id: 134, name: 'Pedra de Afiação', type: 'consumable', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: { atk: 10 }, icon: '🪨', sellPrice: 80, description: '+10 ATK temporário.' },
  { id: 135, name: 'Bandagem', type: 'consumable', rarity: 'common', classReq: 'any', levelReq: 1, stats: { hp: 80 }, icon: '🩹', sellPrice: 20, description: 'Cura básica sem poção.' },
  { id: 136, name: 'Comida de Aventureiro', type: 'consumable', rarity: 'common', classReq: 'any', levelReq: 1, stats: { hp: 30, mp: 20 }, icon: '🍖', sellPrice: 8, description: 'Comida para aventureiros.' },
  { id: 137, name: 'Pergaminho de Fogo', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 10, stats: { atk: 50 }, icon: '🔥', sellPrice: 250, description: 'Lança bola de fogo.' },
  { id: 138, name: 'Pergaminho de Gelo', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 10, stats: {}, icon: '❄️', sellPrice: 250, description: 'Congela inimigos.' },

  // === MATERIAIS EXTRAS ===
  { id: 216, name: 'Fio de Ouro', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🥇', sellPrice: 100, description: 'Fio de ouro puro.' },
  { id: 217, name: 'Pó de Estrela', type: 'material', rarity: 'epic', classReq: 'any', levelReq: 1, stats: {}, icon: '✨', sellPrice: 800, description: 'Drop de criaturas celestiais.' },
  { id: 218, name: 'Sangue de Dragão', type: 'material', rarity: 'legendary', classReq: 'any', levelReq: 1, stats: {}, icon: '🩸', sellPrice: 5000, description: 'Sangue do dragão ancião.' },
  { id: 219, name: 'Fragmento de Alma', type: 'material', rarity: 'epic', classReq: 'any', levelReq: 1, stats: {}, icon: '👻', sellPrice: 400, description: 'Alma capturada de boss.' },
  { id: 220, name: 'Pedra da Mana', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '💠', sellPrice: 120, description: 'Cristal concentrado de mana.' },
  { id: 221, name: 'Dente de Lobo', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🦷', sellPrice: 5, description: 'Drop de lobos.' },
  { id: 222, name: 'Chifre de Touro', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '🐂', sellPrice: 30, description: 'Drop de touros selvagens.' },
  { id: 223, name: 'Garra de Grifo', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🦅', sellPrice: 150, description: 'Garra de grifo ancião.' },

  // === ITENS ESPECIAIS / SET ===
  { id: 139, name: 'Elmo do Set Fênix', type: 'helmet', rarity: 'legendary', classReq: 'warrior', levelReq: 60, stats: { def: 130, hp: 250, crit: 20 }, icon: '🔥', sellPrice: 25000, description: 'Parte do Set Fênix.' },
  { id: 140, name: 'Armadura do Set Fênix', type: 'armor', rarity: 'legendary', classReq: 'warrior', levelReq: 60, stats: { def: 180, hp: 350 }, icon: '🔥', sellPrice: 30000, description: 'Parte do Set Fênix.' },
  { id: 141, name: 'Luvas do Set Fênix', type: 'gloves', rarity: 'legendary', classReq: 'warrior', levelReq: 60, stats: { atk: 90, crit: 30 }, icon: '🔥', sellPrice: 22000, description: 'Parte do Set Fênix.' },
  { id: 142, name: 'Botas do Set Fênix', type: 'boots', rarity: 'legendary', classReq: 'warrior', levelReq: 60, stats: { def: 100, spd: 30 }, icon: '🔥', sellPrice: 22000, description: 'Parte do Set Fênix.' },
  { id: 143, name: 'Elmo do Set Arcano', type: 'helmet', rarity: 'legendary', classReq: 'mage', levelReq: 60, stats: { def: 80, mp: 400, crit: 35 }, icon: '💜', sellPrice: 25000, description: 'Parte do Set Arcano.' },
  { id: 144, name: 'Manto do Set Arcano', type: 'armor', rarity: 'legendary', classReq: 'mage', levelReq: 60, stats: { def: 60, mp: 600 }, icon: '💜', sellPrice: 30000, description: 'Parte do Set Arcano.' },
  { id: 145, name: 'Luvas do Set Arcano', type: 'gloves', rarity: 'legendary', classReq: 'mage', levelReq: 60, stats: { atk: 70, mp: 300, crit: 40 }, icon: '💜', sellPrice: 22000, description: 'Parte do Set Arcano.' },
  { id: 146, name: 'Cajado do Set Arcano', type: 'weapon', rarity: 'legendary', classReq: 'mage', levelReq: 60, stats: { atk: 130, mp: 800, crit: 50 }, icon: '💜', sellPrice: 55000, description: 'Cajado do Set Arcano.' },
  { id: 147, name: 'Elmo do Set Sombra', type: 'helmet', rarity: 'legendary', classReq: 'ninja', levelReq: 60, stats: { def: 70, dodge: 50, crit: 40 }, icon: '🌑', sellPrice: 24000, description: 'Parte do Set Sombra.' },
  { id: 148, name: 'Armadura do Set Sombra', type: 'armor', rarity: 'legendary', classReq: 'ninja', levelReq: 60, stats: { def: 90, dodge: 70, spd: 50 }, icon: '🌑', sellPrice: 29000, description: 'Parte do Set Sombra.' },
  { id: 149, name: 'Katana do Set Sombra', type: 'weapon', rarity: 'legendary', classReq: 'ninja', levelReq: 60, stats: { atk: 170, crit: 80, dodge: 60, spd: 70 }, icon: '🌑', sellPrice: 56000, description: 'Katana do Set Sombra.' },
  { id: 150, name: 'Elmo do Set Divino', type: 'helmet', rarity: 'legendary', classReq: 'priest', levelReq: 60, stats: { def: 85, hp: 300, mana_regen: 40 }, icon: '☀️', sellPrice: 24000, description: 'Parte do Set Divino.' },
  { id: 151, name: 'Vestes do Set Divino', type: 'armor', rarity: 'legendary', classReq: 'priest', levelReq: 60, stats: { def: 70, hp: 500, mana_regen: 60 }, icon: '☀️', sellPrice: 29000, description: 'Parte do Set Divino.' },
  { id: 152, name: 'Cajado do Set Divino', type: 'weapon', rarity: 'legendary', classReq: 'priest', levelReq: 60, stats: { atk: 110, hp: 600, mana_regen: 100 }, icon: '☀️', sellPrice: 53000, description: 'Cajado do Set Divino.' },

  // === MAIS ITENS VARIADOS ===
  { id: 153, name: 'Poção de XP', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '⭐', sellPrice: 500, description: '+50% XP por 30min.' },
  { id: 154, name: 'Tomo do Guerreiro', type: 'consumable', rarity: 'epic', classReq: 'warrior', levelReq: 30, stats: { atk: 5 }, icon: '📖', sellPrice: 2000, description: '+5 ATK permanente.' },
  { id: 155, name: 'Tomo do Mago', type: 'consumable', rarity: 'epic', classReq: 'mage', levelReq: 30, stats: { mp: 50 }, icon: '📖', sellPrice: 2000, description: '+50 MP permanente.' },
  { id: 156, name: 'Tomo do Arqueiro', type: 'consumable', rarity: 'epic', classReq: 'archer', levelReq: 30, stats: { crit: 5 }, icon: '📖', sellPrice: 2000, description: '+5 CRIT permanente.' },
  { id: 157, name: 'Tomo do Ninja', type: 'consumable', rarity: 'epic', classReq: 'ninja', levelReq: 30, stats: { spd: 10 }, icon: '📖', sellPrice: 2000, description: '+10 SPD permanente.' },
  { id: 158, name: 'Tomo do Sacerdote', type: 'consumable', rarity: 'epic', classReq: 'priest', levelReq: 30, stats: { mana_regen: 10 }, icon: '📖', sellPrice: 2000, description: '+10 MANA_REGEN permanente.' },

  // === ACESSÓRIOS EXTRAS ===
  { id: 159, name: 'Anel do Sangue', type: 'ring', rarity: 'epic', classReq: 'warrior', levelReq: 40, stats: { atk: 40, hp: 100 }, icon: '🩸', sellPrice: 4800, description: 'Cada golpe drena vida.' },
  { id: 160, name: 'Amuleto do Vento', type: 'amulet', rarity: 'epic', classReq: 'archer', levelReq: 40, stats: { spd: 35, crit: 25 }, icon: '💨', sellPrice: 5000, description: 'Velocidade extrema.' },
  { id: 161, name: 'Anel da Lua', type: 'ring', rarity: 'rare', classReq: 'ninja', levelReq: 20, stats: { dodge: 20, crit: 15 }, icon: '🌙', sellPrice: 750, description: 'Agilidade lunar.' },
  { id: 162, name: 'Amuleto do Sol', type: 'amulet', rarity: 'rare', classReq: 'priest', levelReq: 20, stats: { hp: 70, mana_regen: 10 }, icon: '☀️', sellPrice: 700, description: 'Poder do sol eterno.' },
  { id: 163, name: 'Anel de Mithril', type: 'ring', rarity: 'epic', classReq: 'any', levelReq: 45, stats: { def: 30, atk: 30, hp: 100 }, icon: '💎', sellPrice: 6000, description: 'Mithril puro.' },
  { id: 164, name: 'Amuleto de Mithril', type: 'amulet', rarity: 'epic', classReq: 'any', levelReq: 45, stats: { mp: 150, hp: 150 }, icon: '💎', sellPrice: 5800, description: 'Mithril arcano.' },

  // === MAIS MATERIAIS ===
  { id: 224, name: 'Olho de Basilisco', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '👁️', sellPrice: 200, description: 'Drop do basilisco.' },
  { id: 225, name: 'Cauda de Sereia', type: 'material', rarity: 'epic', classReq: 'any', levelReq: 1, stats: {}, icon: '🧜', sellPrice: 600, description: 'Drop de sereia abissal.' },
  { id: 226, name: 'Coração de Fênix', type: 'material', rarity: 'legendary', classReq: 'any', levelReq: 1, stats: {}, icon: '❤️‍🔥', sellPrice: 8000, description: 'Drop da fênix imortal.' },
  { id: 227, name: 'Cinza de Fênix', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🔥', sellPrice: 300, description: 'Cinza renascida.' },
  { id: 228, name: 'Pedra Elemental', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '🪨', sellPrice: 40, description: 'Usada em crafts arcanos.' },
  { id: 229, name: 'Teia de Aranha Gigante', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🕸️', sellPrice: 7, description: 'Material pegajoso.' },
  { id: 230, name: 'Alga Aquática', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🌿', sellPrice: 4, description: 'Colhida nos rios.' },

  // === EQUIPAMENTOS EXTRAS PARA COMPLETAR 300 ===
  { id: 165, name: 'Machado do Berserker', type: 'weapon', rarity: 'epic', classReq: 'warrior', levelReq: 42, stats: { atk: 90, crit: 20 }, icon: '🪓', sellPrice: 5500, description: 'Fúria pura.' },
  { id: 166, name: 'Arco da Sombra', type: 'weapon', rarity: 'epic', classReq: 'archer', levelReq: 42, stats: { atk: 70, crit: 40, dodge: 15 }, icon: '🏹', sellPrice: 5800, description: 'Flechas das sombras.' },
  { id: 167, name: 'Orbe da Morte', type: 'weapon', rarity: 'epic', classReq: 'mage', levelReq: 42, stats: { atk: 65, mp: 180, crit: 35 }, icon: '💀', sellPrice: 6100, description: 'Poder da morte.' },
  { id: 168, name: 'Báculo da Ressurreição', type: 'weapon', rarity: 'epic', classReq: 'priest', levelReq: 42, stats: { atk: 55, hp: 180, mana_regen: 35 }, icon: '🌿', sellPrice: 5700, description: 'Pode ressuscitar aliados.' },
  { id: 169, name: 'Tanto Envenenado', type: 'weapon', rarity: 'epic', classReq: 'assassin', levelReq: 42, stats: { atk: 75, crit: 50, dodge: 20 }, icon: '🗡️', sellPrice: 6300, description: 'Veneno de elite.' },
  { id: 170, name: 'Cetro do Paladino Supremo', type: 'weapon', rarity: 'epic', classReq: 'paladin', levelReq: 42, stats: { atk: 65, def: 40, hp: 150 }, icon: '✝️', sellPrice: 5900, description: 'Cetro sagrado de elite.' },
  { id: 171, name: 'Elmo do Berserker', type: 'helmet', rarity: 'epic', classReq: 'warrior', levelReq: 42, stats: { def: 75, atk: 30 }, icon: '😡', sellPrice: 5200, description: 'Raiva aumentada.' },
  { id: 172, name: 'Armadura do Berserker', type: 'armor', rarity: 'epic', classReq: 'warrior', levelReq: 42, stats: { def: 90, atk: 40, hp: 150 }, icon: '😡', sellPrice: 7500, description: 'Para os que vivem para lutar.' },
  { id: 173, name: 'Botas do Assassino Sombrio', type: 'boots', rarity: 'epic', classReq: 'assassin', levelReq: 42, stats: { spd: 45, dodge: 35 }, icon: '🌑', sellPrice: 5600, description: 'Passos da morte.' },
  { id: 174, name: 'Luvas do Assassino Sombrio', type: 'gloves', rarity: 'epic', classReq: 'assassin', levelReq: 42, stats: { atk: 55, crit: 40 }, icon: '🌑', sellPrice: 5000, description: 'Golpes mortais.' },
  { id: 175, name: 'Anel do Berserker', type: 'ring', rarity: 'epic', classReq: 'warrior', levelReq: 40, stats: { atk: 50, crit: 15 }, icon: '😡', sellPrice: 4900, description: 'Fúria canalizada em anel.' },
  { id: 176, name: 'Amuleto do Assassino', type: 'amulet', rarity: 'epic', classReq: 'assassin', levelReq: 40, stats: { crit: 30, dodge: 25 }, icon: '💀', sellPrice: 5100, description: 'A morte ao pescoço.' },
  { id: 177, name: 'Escudo Sagrado Supremo', type: 'shield', rarity: 'epic', classReq: 'paladin', levelReq: 45, stats: { def: 160, hp: 200 }, icon: '⭐', sellPrice: 7000, description: 'Escudo máximo.' },
  { id: 178, name: 'Escudo de Aço', type: 'shield', rarity: 'rare', classReq: 'warrior', levelReq: 20, stats: { def: 70, hp: 80 }, icon: '🛡️', sellPrice: 900, description: 'Escudo de aço puro.' },
  { id: 179, name: 'Elmo de Mithril', type: 'helmet', rarity: 'epic', classReq: 'any', levelReq: 45, stats: { def: 100, hp: 120 }, icon: '💎', sellPrice: 6500, description: 'Elmo de mithril puro.' },
  { id: 180, name: 'Armadura de Mithril', type: 'armor', rarity: 'epic', classReq: 'any', levelReq: 45, stats: { def: 140, hp: 180 }, icon: '💎', sellPrice: 9000, description: 'Armadura de mithril.' },
  { id: 181, name: 'Botas de Mithril', type: 'boots', rarity: 'epic', classReq: 'any', levelReq: 45, stats: { def: 70, spd: 25 }, icon: '💎', sellPrice: 5800, description: 'Botas de mithril.' },
  { id: 182, name: 'Luvas de Mithril', type: 'gloves', rarity: 'epic', classReq: 'any', levelReq: 45, stats: { atk: 50, def: 40 }, icon: '💎', sellPrice: 5500, description: 'Luvas de mithril.' },

  // Completando até ~300...
  { id: 183, name: 'Poção de Defesa', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 15, stats: { def: 30 }, icon: '🛡️', sellPrice: 220, description: '+30 DEF por 60s.' },
  { id: 184, name: 'Poção de Crítico', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 15, stats: { crit: 25 }, icon: '💥', sellPrice: 230, description: '+25 CRIT por 60s.' },
  { id: 185, name: 'Pergaminho de Ressurreição', type: 'consumable', rarity: 'epic', classReq: 'any', levelReq: 1, stats: { hp: 500 }, icon: '📜', sellPrice: 2000, description: 'Ressuscita no local.' },
  { id: 186, name: 'Mapa do Tesouro', type: 'consumable', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🗺️', sellPrice: 1000, description: 'Leva a tesouro escondido.' },
  { id: 187, name: 'Caixa Misteriosa', type: 'consumable', rarity: 'epic', classReq: 'any', levelReq: 1, stats: {}, icon: '📦', sellPrice: 500, description: 'Item aleatório no interior.' },
  { id: 231, name: 'Pele de Urso', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '🐻', sellPrice: 35, description: 'Drop de ursos.' },
  { id: 232, name: 'Carapaça de Tartaruga', type: 'material', rarity: 'uncommon', classReq: 'any', levelReq: 1, stats: {}, icon: '🐢', sellPrice: 28, description: 'Drop de tartarugas gigantes.' },
  { id: 233, name: 'Pluma de Corvo', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '🪶', sellPrice: 6, description: 'Drop de corvos das trevas.' },
  { id: 234, name: 'Presa de Vampiro', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🧛', sellPrice: 180, description: 'Drop de vampiros noturnos.' },
  { id: 235, name: 'Coração de Lich', type: 'material', rarity: 'legendary', classReq: 'any', levelReq: 1, stats: {}, icon: '💀', sellPrice: 10000, description: 'Drop do boss Lich Eterno.' },
  { id: 236, name: 'Fragmento de Mana', type: 'material', rarity: 'common', classReq: 'any', levelReq: 1, stats: {}, icon: '💧', sellPrice: 8, description: 'Mana cristalizada.' },
  { id: 237, name: 'Essência de Sombra', type: 'material', rarity: 'rare', classReq: 'any', levelReq: 1, stats: {}, icon: '🌑', sellPrice: 120, description: 'Extraída das trevas.' },
  { id: 238, name: 'Cristal de Tempo', type: 'material', rarity: 'epic', classReq: 'any', levelReq: 1, stats: {}, icon: '⏳', sellPrice: 1000, description: 'Fragmento do tempo congelado.' },
  { id: 188, name: 'Bastão do Caçador', type: 'weapon', rarity: 'uncommon', classReq: 'archer', levelReq: 6, stats: { atk: 9, spd: 3 }, icon: '🏹', sellPrice: 130, description: 'Arma básica de caçadores.' },
  { id: 189, name: 'Adaga Envenenada', type: 'weapon', rarity: 'uncommon', classReq: 'assassin', levelReq: 8, stats: { atk: 10, crit: 8 }, icon: '🗡️', sellPrice: 190, description: 'Veneno na lâmina.' },
  { id: 190, name: 'Livro de Feitiços', type: 'weapon', rarity: 'uncommon', classReq: 'mage', levelReq: 8, stats: { atk: 8, mp: 30 }, icon: '📗', sellPrice: 170, description: 'Feitiços básicos.' },
  { id: 191, name: 'Bíblia Sagrada', type: 'weapon', rarity: 'uncommon', classReq: 'priest', levelReq: 8, stats: { atk: 5, hp: 20, mana_regen: 3 }, icon: '📕', sellPrice: 160, description: 'Textos sagrados.' },
  { id: 192, name: 'Escudo de Bronze', type: 'shield', rarity: 'uncommon', classReq: 'warrior', levelReq: 8, stats: { def: 20 }, icon: '🛡️', sellPrice: 180, description: 'Bronze polido.' },
  { id: 193, name: 'Armadura de Bronze', type: 'armor', rarity: 'uncommon', classReq: 'warrior', levelReq: 8, stats: { def: 18 }, icon: '🥉', sellPrice: 240, description: 'Bronze como proteção.' },
  { id: 194, name: 'Elmo de Bronze', type: 'helmet', rarity: 'uncommon', classReq: 'warrior', levelReq: 8, stats: { def: 12 }, icon: '⛑️', sellPrice: 160, description: 'Proteção de bronze.' },
  { id: 195, name: 'Grevas de Bronze', type: 'boots', rarity: 'uncommon', classReq: 'warrior', levelReq: 8, stats: { def: 8, spd: 2 }, icon: '🦶', sellPrice: 140, description: 'Grevas de bronze.' },
  { id: 196, name: 'Manoplas de Bronze', type: 'gloves', rarity: 'uncommon', classReq: 'warrior', levelReq: 8, stats: { atk: 7, def: 5 }, icon: '🥊', sellPrice: 130, description: 'Punhos de bronze.' },
  { id: 197, name: 'Anel de Bronze', type: 'ring', rarity: 'common', classReq: 'any', levelReq: 3, stats: { hp: 15, def: 3 }, icon: '💍', sellPrice: 35, description: 'Anel de bronze simples.' },
  { id: 198, name: 'Amuleto de Ferro', type: 'amulet', rarity: 'common', classReq: 'any', levelReq: 3, stats: { hp: 20, atk: 3 }, icon: '🦴', sellPrice: 30, description: 'Amuleto rude de ferro.' },
  { id: 199, name: 'Poção de Resistência', type: 'consumable', rarity: 'uncommon', classReq: 'any', levelReq: 8, stats: { def: 15 }, icon: '🧪', sellPrice: 60, description: '+15 DEF temporário.' },
  { id: 200, name: 'Poção de Agilidade', type: 'consumable', rarity: 'uncommon', classReq: 'any', levelReq: 8, stats: { spd: 10, dodge: 8 }, icon: '⚡', sellPrice: 65, description: '+10 SPD +8 DODGE temporário.' },
];

export const getItemById = (id: number) => ITEMS.find(i => i.id === id);
export const getItemsByType = (type: ItemType) => ITEMS.filter(i => i.type === type);
export const getItemsByRarity = (rarity: ItemRarity) => ITEMS.filter(i => i.rarity === rarity);
