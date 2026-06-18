import { useState } from 'react';
import type { Player } from './game/systems/player';
import { createPlayer, getTotalStats, equipItem, getRankTitle } from './game/systems/player';
import { simulateCombat } from './game/systems/combat';
import type { CombatResult } from './game/systems/combat';
import { CLASSES } from './game/data/classes';
import type { ClassName } from './game/data/classes';
import { MONSTERS } from './game/data/monsters';
import type { Monster } from './game/data/monsters';
import { ITEMS } from './game/data/items';
import type { Item, ItemRarity } from './game/data/items';
import { CharacterSelect, Game3DView } from './Game3D';
import MainMenu from './components/MainMenu';
import LoginScreen from './components/LoginScreen';
import type { CharacterSave } from './game/systems/SaveSystem';
import { getStoredAuth, clearAuth, type AuthInfo } from './api';
import './App.css';

type Screen = 'login' | 'menu' | 'charCreate' | 'game' | 'combat' | 'inventory' | 'shop' | 'ranking' | '3d-select' | '3d-world';

const RARITY_COLOR: Record<ItemRarity, string> = {
  common: '#aaa', uncommon: '#2ecc71', rare: '#3498db', epic: '#9b59b6', legendary: '#f39c12',
};

export default function App() {
  const [auth, setAuth] = useState<AuthInfo | null>(() => getStoredAuth());
  const [screen, setScreen] = useState<Screen>(() => getStoredAuth() ? 'menu' : 'login');
  const [player, setPlayer] = useState<Player | null>(null);
  const [charName, setCharName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName>('warrior');
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [fightingMonster, setFightingMonster] = useState<Monster | null>(null);
  const [logIndex, setLogIndex] = useState(0);
  const [notification, setNotification] = useState('');
  const [activeTab, setActiveTab] = useState<'equip' | 'bag' | 'craft'>('equip');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [world3dSave, setWorld3dSave] = useState<CharacterSave | null>(null);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }

  function startGame() {
    if (!charName.trim()) return notify('Digite um nome!');
    setPlayer(createPlayer(charName.trim(), selectedClass));
    setScreen('game');
  }

  function fight(monster: Monster) {
    if (!player) return;
    setFightingMonster(monster);
    const result = simulateCombat(player, monster);
    setCombatResult(result);
    setLogIndex(0);
    setScreen('combat');
  }

  function finishCombat() {
    if (!combatResult) return;
    setPlayer(combatResult.player);
    if (combatResult.leveledUp) notify(`🎉 Level Up! Agora level ${combatResult.newLevel}!`);
    setScreen('game');
  }

  function equipFromInventory(item: Item) {
    if (!player) return;
    if (item.type === 'consumable' || item.type === 'material') return notify('Não equipável.');
    if (item.levelReq > player.level) return notify(`Requer nível ${item.levelReq}!`);
    if (item.classReq !== 'any' && item.classReq !== player.class) return notify(`Apenas ${item.classReq} pode usar!`);
    const updated = equipItem(player, item);
    setPlayer(updated);
    notify(`${item.icon} ${item.name} equipado!`);
  }

  function sellItem(item: Item, qty: number) {
    if (!player) return;
    const inv = player.inventory.map(i => i.item.id === item.id ? { ...i, qty: i.qty - qty } : i).filter(i => i.qty > 0);
    setPlayer({ ...player, inventory: inv, gold: player.gold + item.sellPrice * qty });
    notify(`Vendido: ${item.icon} ${item.name} por ${item.sellPrice * qty}g`);
  }

  function buyItem(item: Item) {
    if (!player) return;
    const price = Math.floor(item.sellPrice * 2.5);
    if (player.gold < price) return notify('Ouro insuficiente!');
    const inv = [...player.inventory];
    const ex = inv.find(i => i.item.id === item.id);
    if (ex) ex.qty++; else inv.push({ item, qty: 1 });
    setPlayer({ ...player, gold: player.gold - price, inventory: inv });
    notify(`Comprado: ${item.icon} ${item.name}`);
  }

  if (screen === 'login') return (
    <LoginScreen onLogin={(a) => { setAuth(a); setScreen('menu'); }} />
  );

  if (screen === '3d-select') return (
    <CharacterSelect
      auth={auth}
      onStart={(save) => { setWorld3dSave(save); setScreen('3d-world'); }}
      onSessionExpired={() => { clearAuth(); setAuth(null); setScreen('login'); }}
    />
  );

  if (screen === '3d-world' && world3dSave) return (
    <Game3DView
      save={world3dSave}
      auth={auth}
      onBack={() => setScreen('3d-select')}
    />
  );

  if (screen === 'menu') return (
    <MainMenu
      onPlay={() => setScreen('3d-select')}
      onLogout={() => { clearAuth(); setAuth(null); setScreen('login'); }}
      username={auth?.username}
    />
  );

  if (screen === 'charCreate') return (
    <div className="screen char-screen">
      <h2>✨ Criar Personagem</h2>
      <input className="name-input" placeholder="Nome do herói..." value={charName} onChange={e => setCharName(e.target.value)} maxLength={20} />
      <div className="class-grid">
        {Object.values(CLASSES).map(cls => (
          <div key={cls.id} className={`class-card ${selectedClass === cls.id ? 'selected' : ''}`} onClick={() => setSelectedClass(cls.id)} style={{ borderColor: selectedClass === cls.id ? cls.color : '#333' }}>
            <div className="class-icon">{cls.icon}</div>
            <div className="class-name" style={{ color: cls.color }}>{cls.name}</div>
            <div className="class-desc">{cls.description}</div>
            <div className="class-stats-mini">
              <span>HP:{cls.baseStats.hp}</span>
              <span>ATK:{cls.baseStats.atk}</span>
              <span>SPD:{cls.baseStats.spd}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="char-actions">
        <button className="btn-main" onClick={startGame}>⚔️ Entrar no Mundo</button>
        <button className="btn-sec" onClick={() => setScreen('menu')}>← Voltar</button>
      </div>
    </div>
  );

  if (screen === 'ranking') return (
    <div className="screen rank-screen">
      <h2>🏆 Ranking Global</h2>
      <div className="rank-list">
        {[
          { name: 'ShadowKiller', cls: 'ninja', kills: 9842, level: 99 },
          { name: 'HolyPriest', cls: 'priest', kills: 7231, level: 95 },
          { name: 'FireMage', cls: 'mage', kills: 6550, level: 93 },
          { name: 'IronWarrior', cls: 'warrior', kills: 5890, level: 91 },
          { name: 'WindArcher', cls: 'archer', kills: 4320, level: 88 },
          { name: 'DarkAssassin', cls: 'assassin', kills: 3980, level: 86 },
          { name: 'HolyPaladin', cls: 'paladin', kills: 3210, level: 84 },
          ...(player ? [{ name: player.name, cls: player.class, kills: player.kills, level: player.level }] : []),
        ].sort((a, b) => b.kills - a.kills).slice(0, 10).map((r, i) => (
          <div key={i} className={`rank-row ${r.name === player?.name ? 'rank-me' : ''}`}>
            <span className="rank-pos">#{i + 1}</span>
            <span className="rank-icon">{CLASSES[r.cls as ClassName]?.icon}</span>
            <span className="rank-name">{r.name}</span>
            <span className="rank-class">{CLASSES[r.cls as ClassName]?.name}</span>
            <span className="rank-level">Lv.{r.level}</span>
            <span className="rank-kills">⚔️ {r.kills}</span>
            <span className="rank-title">{getRankTitle(r.kills)}</span>
          </div>
        ))}
      </div>
      <button className="btn-sec" onClick={() => setScreen(player ? 'game' : 'menu')}>← Voltar</button>
    </div>
  );

  if (!player) return null;

  const stats = getTotalStats(player);
  const xpPct = Math.floor((player.xp / player.xpToNext) * 100);

  if (screen === 'combat' && combatResult && fightingMonster) {
    const log = combatResult.logs[logIndex];
    const maxLog = combatResult.logs.length - 1;
    return (
      <div className="screen combat-screen">
        <div className="combat-header">
          <div className="combatant player-side">
            <div className="combat-sprite">{CLASSES[player.class].icon}</div>
            <div className="combat-name">{player.name}</div>
            <div className="combat-hp-bar"><div style={{ width: `${Math.max(0, (combatResult.logs[logIndex]?.playerHp ?? player.hp) / stats.maxHp * 100)}%` }} /></div>
            <div className="combat-hp-text">{combatResult.logs[logIndex]?.playerHp ?? player.hp}/{stats.maxHp}</div>
          </div>
          <div className="vs-text">VS</div>
          <div className="combatant monster-side">
            <div className="combat-sprite boss-sprite">{fightingMonster.icon}</div>
            <div className="combat-name">{fightingMonster.name}</div>
            <div className="combat-hp-bar monster-bar"><div style={{ width: `${Math.max(0, (combatResult.logs[logIndex]?.monsterHp ?? fightingMonster.hp) / fightingMonster.hp * 100)}%`, background: '#e74c3c' }} /></div>
            <div className="combat-hp-text">{combatResult.logs[logIndex]?.monsterHp ?? fightingMonster.hp}/{fightingMonster.hp}</div>
          </div>
        </div>
        {log && (
          <div className={`combat-log-box ${log.actor === 'player' ? 'log-player' : 'log-monster'}`}>
            <span className="log-turn">Turn {log.turn}</span>
            <span className="log-actor">{log.actor === 'player' ? `${CLASSES[player.class].icon} ${player.name}` : `${fightingMonster.icon} ${fightingMonster.name}`}</span>
            <span className="log-action">{log.action}</span>
            {log.damage > 0 && <span className={`log-dmg ${log.isCrit ? 'crit' : ''}`}>-{log.damage}{log.isCrit ? ' CRÍTICO!' : ''}</span>}
          </div>
        )}
        <div className="combat-nav">
          <button className="btn-sec" disabled={logIndex <= 0} onClick={() => setLogIndex(i => i - 1)}>◀</button>
          <span>{logIndex + 1}/{combatResult.logs.length}</span>
          <button className="btn-sec" disabled={logIndex >= maxLog} onClick={() => setLogIndex(i => i + 1)}>▶</button>
          <button className="btn-sec" onClick={() => setLogIndex(maxLog)}>⏭ Final</button>
        </div>
        {logIndex >= maxLog && (
          <div className="combat-result">
            <div className={`result-title ${combatResult.won ? 'won' : 'lost'}`}>
              {combatResult.won ? '🏆 VITÓRIA!' : '💀 DERROTA'}
            </div>
            {combatResult.won && (
              <div className="rewards">
                <div>⭐ +{combatResult.xpGained} XP</div>
                <div>💰 +{combatResult.goldGained} Gold</div>
                {combatResult.drops.map((d, i) => <div key={i}>{d.item.icon} {d.item.name} x{d.qty}</div>)}
                {combatResult.leveledUp && <div className="levelup-text">🎉 LEVEL UP → {combatResult.newLevel}!</div>}
              </div>
            )}
            <button className="btn-main" onClick={finishCombat}>Continuar</button>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'inventory') {
    const eq = player.equipment;
    const craftable = ITEMS.filter(i => i.craftable && i.craftRecipe);
    return (
      <div className="screen inv-screen">
        <div className="inv-tabs">
          <button className={activeTab === 'equip' ? 'tab active' : 'tab'} onClick={() => setActiveTab('equip')}>🛡️ Equipamento</button>
          <button className={activeTab === 'bag' ? 'tab active' : 'tab'} onClick={() => setActiveTab('bag')}>🎒 Inventário</button>
          <button className={activeTab === 'craft' ? 'tab active' : 'tab'} onClick={() => setActiveTab('craft')}>⚒️ Craft</button>
        </div>
        {activeTab === 'equip' && (
          <div className="equip-layout">
            <div className="equip-slots">
              {(['helmet','armor','weapon','shield','gloves','boots','ring1','ring2','amulet'] as const).map(slot => {
                const item = eq[slot];
                return (
                  <div key={slot} className="equip-slot" title={slot}>
                    <div className="slot-label">{slot}</div>
                    <div className="slot-item" style={{ borderColor: item ? RARITY_COLOR[item.rarity] : '#333' }}>
                      {item ? <>{item.icon}<span style={{ color: RARITY_COLOR[item.rarity], fontSize: 10 }}>{item.name}</span></> : <span style={{ color: '#444' }}>—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="stats-panel">
              <div className="stat-row">❤️ HP: {stats.maxHp}</div>
              <div className="stat-row">💧 MP: {stats.maxMp}</div>
              <div className="stat-row">⚔️ ATK: {stats.atk}</div>
              <div className="stat-row">🛡️ DEF: {stats.def}</div>
              <div className="stat-row">💨 SPD: {stats.spd}</div>
              <div className="stat-row">💥 CRIT: {stats.crit}%</div>
              <div className="stat-row">🌀 DODGE: {stats.dodge}%</div>
              <div className="stat-row">🔮 MANA REG: {stats.mana_regen}</div>
            </div>
          </div>
        )}
        {activeTab === 'bag' && (
          <div className="bag-grid">
            {player.inventory.length === 0 && <div style={{ color: '#666' }}>Inventário vazio</div>}
            {player.inventory.map((slot, i) => (
              <div key={i} className="bag-item" style={{ borderColor: RARITY_COLOR[slot.item.rarity] }} onClick={() => setSelectedItem(selectedItem?.id === slot.item.id ? null : slot.item)}>
                <div className="bag-icon">{slot.item.icon}</div>
                <div className="bag-name" style={{ color: RARITY_COLOR[slot.item.rarity] }}>{slot.item.name}</div>
                <div className="bag-qty">x{slot.qty}</div>
                {selectedItem?.id === slot.item.id && (
                  <div className="item-actions">
                    {slot.item.type !== 'consumable' && slot.item.type !== 'material' && <button onClick={() => equipFromInventory(slot.item)}>Equipar</button>}
                    <button onClick={() => sellItem(slot.item, 1)}>Vender {slot.item.sellPrice}g</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'craft' && (
          <div className="craft-list">
            {craftable.map(item => {
              const canCraft = item.craftRecipe!.every(req => {
                const inv = player.inventory.find(i => i.item.id === req.itemId);
                return inv && inv.qty >= req.qty;
              });
              return (
                <div key={item.id} className={`craft-row ${canCraft ? 'can-craft' : ''}`}>
                  <span style={{ color: RARITY_COLOR[item.rarity] }}>{item.icon} {item.name}</span>
                  <div className="craft-recipe">
                    {item.craftRecipe!.map((r, i) => {
                      const mat = ITEMS.find(it => it.id === r.itemId);
                      const have = player.inventory.find(it => it.item.id === r.itemId)?.qty ?? 0;
                      return <span key={i} style={{ color: have >= r.qty ? '#2ecc71' : '#e74c3c' }}>{mat?.icon}{mat?.name} {have}/{r.qty}</span>;
                    })}
                  </div>
                  <button disabled={!canCraft} onClick={() => {
                    if (!canCraft) return;
                    let inv = [...player.inventory];
                    for (const req of item.craftRecipe!) {
                      inv = inv.map(i => i.item.id === req.itemId ? { ...i, qty: i.qty - req.qty } : i).filter(i => i.qty > 0);
                    }
                    const ex = inv.find(i => i.item.id === item.id);
                    if (ex) ex.qty++; else inv.push({ item, qty: 1 });
                    setPlayer({ ...player, inventory: inv });
                    notify(`⚒️ Craftado: ${item.name}!`);
                  }}>⚒️ Craftar</button>
                </div>
              );
            })}
          </div>
        )}
        <button className="btn-sec back-btn" onClick={() => setScreen('game')}>← Voltar</button>
      </div>
    );
  }

  if (screen === 'shop') {
    const shopItems = ITEMS.filter(i => i.type !== 'material' && i.levelReq <= player.level + 5).slice(0, 60);
    return (
      <div className="screen shop-screen">
        <h2>🏪 Loja — 💰 {player.gold}g</h2>
        <div className="shop-grid">
          {shopItems.map(item => (
            <div key={item.id} className="shop-item" style={{ borderColor: RARITY_COLOR[item.rarity] }}>
              <div className="shop-icon">{item.icon}</div>
              <div className="shop-name" style={{ color: RARITY_COLOR[item.rarity] }}>{item.name}</div>
              <div className="shop-type">{item.type} | Lv.{item.levelReq}</div>
              <div className="shop-price">💰 {Math.floor(item.sellPrice * 2.5)}g</div>
              <button className="btn-buy" onClick={() => buyItem(item)}>Comprar</button>
            </div>
          ))}
        </div>
        <button className="btn-sec back-btn" onClick={() => setScreen('game')}>← Voltar</button>
      </div>
    );
  }

  const availableMonsters = MONSTERS.filter(m => Math.abs(m.level - player.level) <= 10).sort((a, b) => a.level - b.level);

  return (
    <div className="screen game-screen">
      {notification && <div className="notification">{notification}</div>}
      <div className="game-header">
        <div className="player-info">
          <span className="p-icon">{CLASSES[player.class].icon}</span>
          <div className="p-details">
            <div className="p-name">{player.name} <span style={{ color: CLASSES[player.class].color }}>[{CLASSES[player.class].name}]</span></div>
            <div className="p-rank">🏅 {getRankTitle(player.kills)} | ⚔️ {player.kills} kills</div>
          </div>
          <div className="p-level">Lv.{player.level}</div>
          <div className="p-gold">💰 {player.gold}g</div>
        </div>
        <div className="bars">
          <div className="bar-row">
            <span>HP</span>
            <div className="bar hp-bar"><div style={{ width: `${(player.hp / stats.maxHp) * 100}%` }} /></div>
            <span>{player.hp}/{stats.maxHp}</span>
          </div>
          <div className="bar-row">
            <span>MP</span>
            <div className="bar mp-bar"><div style={{ width: `${(player.mp / stats.maxMp) * 100}%` }} /></div>
            <span>{player.mp}/{stats.maxMp}</span>
          </div>
          <div className="bar-row">
            <span>XP</span>
            <div className="bar xp-bar"><div style={{ width: `${xpPct}%` }} /></div>
            <span>{xpPct}%</span>
          </div>
        </div>
        <div className="nav-buttons">
          <button onClick={() => setScreen('inventory')}>🎒 Inv</button>
          <button onClick={() => setScreen('shop')}>🏪 Loja</button>
          <button onClick={() => setScreen('ranking')}>🏆 Rank</button>
          <button onClick={() => setPlayer(p => p ? { ...p, hp: Math.min(stats.maxHp, p.hp + 50), mp: Math.min(stats.maxMp, p.mp + 30) } : p)}>💤 Descansar</button>
        </div>
      </div>
      <div className="game-world">
        <div className="world-map">
          <div className="map-title">🗺️ Floresta das Sombras — Lv.{player.level}</div>
          <div className="monsters-grid">
            {availableMonsters.map(m => (
              <div key={m.id} className={`monster-card ${m.isBoss ? 'boss-card' : ''}`} onClick={() => fight(m)}>
                <div className="m-sprite" style={{ fontSize: m.isBoss ? 40 : 28 }}>{m.icon}</div>
                <div className="m-name" style={{ color: m.isBoss ? '#f39c12' : '#fff' }}>{m.isBoss ? '👑 ' : ''}{m.name}</div>
                <div className="m-level" style={{ color: m.level > player.level ? '#e74c3c' : m.level < player.level - 3 ? '#666' : '#2ecc71' }}>Lv.{m.level}</div>
                <div className="m-stats">❤️{m.hp} ⚔️{m.atk} ⭐{m.xp}xp</div>
                {m.isBoss && <div className="boss-tag">BOSS</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="skills-panel">
          <div className="skills-title">⚡ Skills</div>
          {CLASSES[player.class].skills.map((sk, i) => (
            <div key={i} className="skill-row" title={sk.desc}>
              <span className="sk-icon">{sk.icon}</span>
              <div>
                <div className="sk-name">{sk.name}</div>
                <div className="sk-desc">{sk.desc}</div>
              </div>
              <span className="sk-mp">{sk.mpCost}mp</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
