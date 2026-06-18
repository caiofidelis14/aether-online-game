import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, ZoneId } from '../game/engine/GameEngine';
import type { GameEngine } from '../game/engine/GameEngine';
import type { ClassName } from '../game/data/classes';
import { SKILL_TREES } from '../game/data/skills';
import type { Skill, SkillTree } from '../game/data/skills';
import { SUBCLASSES } from '../game/data/subclasses';
import { generateQuestBoard, type Quest, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../game/systems/QuestSystem';
import { QUESTS, type QuestProgress } from '../game/data/quests';
import { formatPlayTime, type CharacterSave } from '../game/systems/SaveSystem';
import { SKINS } from '../game/data/skins';

function skillsArray(tree: SkillTree): Skill[] { return Object.values(tree); }

// ── Skill Icon ──────────────────────────────────────────────────────────────
const CLASS_SKILL_THEMES: Record<ClassName, { bg: string; border: string; glow: string }> = {
  warrior: { bg: 'linear-gradient(135deg, #7a1a00, #c0392b, #7a1a00)', border: '#e74c3c', glow: '#e74c3c' },
  mage: { bg: 'linear-gradient(135deg, #2a005a, #9b59b6, #2a005a)', border: '#9b59b6', glow: '#cc44ff' },
  archer: { bg: 'linear-gradient(135deg, #005a10, #27ae60, #005a10)', border: '#27ae60', glow: '#44ff88' },
  priest: { bg: 'linear-gradient(135deg, #5a4a00, #f1c40f, #5a4a00)', border: '#f1c40f', glow: '#ffee44' },
  ninja: { bg: 'linear-gradient(135deg, #001a2a, #00d2ff, #001a2a)', border: '#00d2ff', glow: '#00ffff' },
  paladin: { bg: 'linear-gradient(135deg, #5a2a00, #e67e22, #5a2a00)', border: '#e67e22', glow: '#ffaa44' },
  assassin: { bg: 'linear-gradient(135deg, #2a0015, #e91e8c, #2a0015)', border: '#e91e8c', glow: '#ff44aa' },
};

function SkillIcon({ skill, size = 44, cls }: { skill: Skill; size?: number; cls: ClassName }) {
  const theme = CLASS_SKILL_THEMES[cls];
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, position: 'relative', overflow: 'hidden',
      background: theme.bg, border: `1.5px solid ${theme.border}`,
      boxShadow: `0 0 8px ${theme.glow}55, inset 0 0 10px rgba(0,0,0,0.6)`,
    }}>
      {/* Shine overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: '60%', bottom: '60%', background: 'rgba(255,255,255,0.15)', borderRadius: '0 0 100% 0' }} />
      {/* Rune pattern */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42 }}>{skill.icon}</div>
      {/* Bottom glow bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${theme.glow}, transparent)` }} />
    </div>
  );
}

// ── Bar Component ────────────────────────────────────────────────────────────
function Bar({ value, max, colors, label }: { value: number; max: number; colors: string[]; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#aaa', marginBottom: 2 }}>
        <span style={{ letterSpacing: 1 }}>{label}</span><span style={{ fontWeight: 600 }}>{Math.floor(value)}<span style={{ color: '#666' }}>/{Math.floor(max)}</span></span>
      </div>
      <div style={{ height: 7, background: 'rgba(0,0,0,0.6)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors[0]}, ${colors[1] ?? colors[0]})`, transition: 'width 0.3s', borderRadius: 4, boxShadow: `0 0 6px ${colors[0]}88` }} />
      </div>
    </div>
  );
}

const ZONE_ICONS: Record<ZoneId, string> = { city: '🏰', forest: '🌲', ice: '❄️', volcano: '🌋', desert: '🏜️', dungeon: '💀' };
const CLASS_ICONS: Record<ClassName, string> = { warrior: '⚔️', mage: '🔮', archer: '🏹', priest: '✝️', ninja: '🌀', paladin: '🛡️', assassin: '🗡️' };

// ── NPC Popup ────────────────────────────────────────────────────────────────
function NPCPopup({ type, label, onClose, onBuy }: { type: string; label: string; onClose: () => void; onBuy: (item: string, cost: number, icon: string, desc: string) => void }) {
  const [boughtFlash, setBoughtFlash] = React.useState<string | null>(null);
  // Shop: consumables + equippable gear
  const shopItems = [
    { name: 'Poção de Vida', icon: '🧪', cost: 50, desc: '+100 HP · Consumível', tag: '💊' },
    { name: 'Poção de Mana', icon: '💙', cost: 60, desc: '+100 MP · Consumível', tag: '💊' },
    { name: 'Poção de Vida Grande', icon: '🍶', cost: 120, desc: '+250 HP · Consumível', tag: '💊' },
    { name: 'Elixir Maior', icon: '⚗️', cost: 200, desc: '+300 HP +150 MP · Consumível', tag: '💊' },
    { name: 'Elixir de Batalha', icon: '🔥', cost: 350, desc: '+40 ATK por 30s', tag: '💊' },
    { name: 'Escudo de Pedra', icon: '🪨', cost: 280, desc: '+30 DEF por 30s', tag: '💊' },
    { name: 'Runa de XP', icon: '📖', cost: 400, desc: '+500 XP', tag: '💊' },
    { name: 'Pergaminho de XP', icon: '📜', cost: 900, desc: '+1500 XP', tag: '💊' },
    // Equippable weapons
    { name: 'Espada de Ferro', icon: '⚔️', cost: 400, desc: '+12 ATK · Equipável', tag: '⚔️' },
    { name: 'Espada de Aço', icon: '🗡️', cost: 1200, desc: '+22 ATK · Equipável', tag: '⚔️' },
    { name: 'Espada das Trevas', icon: '🌑', cost: 3000, desc: '+38 ATK · Equipável', tag: '⚔️' },
    { name: 'Espada Lendária', icon: '✨', cost: 8000, desc: '+60 ATK + brilho · Equipável', tag: '⚔️' },
    { name: 'Cajado Arcano', icon: '🔮', cost: 1000, desc: '+18 ATK mágico · Equipável', tag: '🔮' },
    { name: 'Arco Élfico', icon: '🏹', cost: 900, desc: '+16 ATK · Equipável', tag: '🏹' },
    // Armor
    { name: 'Armadura de Couro', icon: '🦺', cost: 350, desc: '+10 DEF · Equipável', tag: '🛡️' },
    { name: 'Armadura de Ferro', icon: '🛡️', cost: 1100, desc: '+20 DEF · Equipável', tag: '🛡️' },
    { name: 'Armadura de Dragão', icon: '🐲', cost: 4500, desc: '+38 DEF · Equipável', tag: '🛡️' },
    { name: 'Armadura Lendária', icon: '👑', cost: 9000, desc: '+55 DEF + aura · Equipável', tag: '🛡️' },
    // Boots
    { name: 'Bota Rápida', icon: '👢', cost: 300, desc: '+5 ATK +5 DEF · Equipável', tag: '👢' },
    { name: 'Bota do Vento', icon: '💨', cost: 800, desc: '+10 ATK +8 DEF · Equipável', tag: '👢' },
    { name: 'Bota do Fogo', icon: '🔥', cost: 2000, desc: '+14 ATK +12 DEF · Equipável', tag: '👢' },
    // Shields
    { name: 'Escudo de Ferro', icon: '🛡️', cost: 500, desc: '+15 DEF · Equipável', tag: '🛡️' },
    { name: 'Escudo Sagrado', icon: '✝️', cost: 2000, desc: '+28 DEF · Equipável', tag: '🛡️' },
    // Wings
    { name: 'Asas do Anjo', icon: '🕊️', cost: 5000, desc: '+5 DEF + asas visuais', tag: '🪽' },
    { name: 'Asas do Demônio', icon: '😈', cost: 5000, desc: '+8 ATK + asas sombrias', tag: '🪽' },
    { name: 'Asas do Dragão', icon: '🐉', cost: 12000, desc: '+10 ATK +10 DEF + asas épicas', tag: '🪽' },
  ];
  // Blacksmith: upgrades and enhancement only
  const smithItems = [
    { name: 'Aprimoramento +1', icon: '🔨', cost: 300, desc: '+5 ATK +5 DEF em qualquer item', tag: '⚒️' },
    { name: 'Aprimoramento +2', icon: '⚒️', cost: 800, desc: '+12 ATK +12 DEF', tag: '⚒️' },
    { name: 'Reforço de Arma', icon: '🗡️', cost: 1200, desc: '+20 ATK na arma equipada', tag: '⚒️' },
    { name: 'Tempero Rúnico', icon: '💎', cost: 2000, desc: '+30 ATK +30 DEF · Rúnico', tag: '⚒️' },
    { name: 'Capacete do Dragão', icon: '🐲', cost: 3500, desc: '+28 DEF · Elmo Equipável', tag: '🪖' },
    { name: 'Elmo de Ouro', icon: '👑', cost: 1500, desc: '+16 DEF · Elmo Equipável', tag: '🪖' },
    { name: 'Elmo de Ferro', icon: '⛑️', cost: 600, desc: '+8 DEF · Elmo Equipável', tag: '🪖' },
    { name: 'Escudo do Dragão', icon: '🔰', cost: 5000, desc: '+40 DEF · Escudo Épico', tag: '🛡️' },
  ];
  const items = type === 'shop' ? shopItems : type === 'blacksmith' ? smithItems : shopItems;
  const title = type === 'shop' ? '🏪 Mercador — Itens & Equipamentos' : type === 'blacksmith' ? '⚒️ Ferreiro — Aprimoramentos' : '📦 Baú de Inventário';
  const handleBuyWithFlash = (itemName: string, cost: number, icon: string, desc: string) => {
    setBoughtFlash(itemName);
    onBuy(itemName, cost, icon, desc);
    setTimeout(() => setBoughtFlash(null), 800);
  };

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 360, background: 'linear-gradient(135deg, rgba(8,4,20,0.97), rgba(15,8,35,0.97))', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 16, padding: 20, zIndex: 200, backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(155,89,182,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 16 }}>{title}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
      {type === 'chest' ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📦</div>
          <div style={{ color: '#aaa', fontSize: 13 }}>Baú pessoal em breve disponível.<br/>Pressione <b style={{ color: '#ffd700' }}>I</b> para abrir o inventário.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '60vh', overflowY: 'auto' }}>
          {boughtFlash && (
            <div style={{ textAlign: 'center', padding: '6px', background: 'rgba(0,255,100,0.15)', border: '1px solid rgba(0,255,100,0.4)', borderRadius: 8, color: '#00ff88', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              ✅ Comprado: {boughtFlash}!
            </div>
          )}
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: boughtFlash === item.name ? 'rgba(0,255,100,0.08)' : 'rgba(255,255,255,0.04)', borderRadius: 8, border: `1px solid ${boughtFlash === item.name ? 'rgba(0,255,100,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.3s' }}>
              <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{item.name}</span>
                  {'tag' in item && <span style={{ fontSize: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 4px', color: '#aaa' }}>{(item as {tag?: string}).tag}</span>}
                </div>
                <div style={{ color: '#888', fontSize: 9 }}>{item.desc}</div>
              </div>
              <button onClick={() => handleBuyWithFlash(item.name, item.cost, item.icon, item.desc)} style={{ padding: '4px 8px', background: 'linear-gradient(135deg, #ffd700, #f39c12)', border: 'none', borderRadius: 6, color: '#000', fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                💰 {item.cost}G
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quest Panel — drawer lateral com scroll ──────────────────────────────────
function QuestPanel({ quests, playerLevel, zone, onAccept, onAutoGo, onClose }: {
  quests: Quest[]; playerLevel: number; zone: ZoneId;
  onAccept: (q: Quest) => void; onAutoGo: (q: Quest) => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<'available' | 'active' | 'done'>('available');
  const available = quests.filter(q => !q.accepted && !q.completed);
  const active    = quests.filter(q => q.accepted && !q.completed);
  const done      = quests.filter(q => q.completed);
  const shown = tab === 'available' ? available : tab === 'active' ? active : done;

  return (
    <>
      {/* Overlay escuro atrás */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 148 }} />
      {/* Drawer lateral direita */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 340, height: '100vh',
        background: 'linear-gradient(180deg, rgba(5,2,18,0.99) 0%, rgba(10,5,28,0.99) 100%)',
        borderLeft: '1px solid rgba(255,215,0,0.2)', zIndex: 149,
        display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif",
        boxShadow: '-8px 0 32px rgba(0,0,0,0.7)',
      }}>
        {/* Header fixo */}
        <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>
              📜 MISSÕES {ZONE_ICONS[zone]}
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 12 }}>✕ ESC</button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {([['available','Disponíveis', available.length], ['active','Ativas', active.length], ['done','Concluídas', done.length]] as const).map(([t, label, cnt]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                background: tab === t ? '#ffd700' : 'rgba(255,255,255,0.06)',
                color: tab === t ? '#000' : '#888',
              }}>{label} {cnt > 0 && <span style={{ background: tab === t ? 'rgba(0,0,0,0.2)' : '#ffd70066', borderRadius: 8, padding: '0 4px' }}>{cnt}</span>}</button>
            ))}
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }} />
        </div>

        {/* Lista com scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 16px', scrollbarWidth: 'thin', scrollbarColor: '#ffd70033 transparent' }}>
          {shown.length === 0 && (
            <div style={{ textAlign: 'center', color: '#555', fontSize: 12, paddingTop: 40 }}>
              {tab === 'available' ? 'Nenhuma missão disponível aqui.' : tab === 'active' ? 'Nenhuma missão ativa.' : 'Nenhuma missão concluída ainda.'}
            </div>
          )}
          {shown.map(q => (
            <div key={q.id} style={{
              background: q.accepted ? 'rgba(155,89,182,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${DIFFICULTY_COLOR[q.difficulty]}${q.accepted ? '66' : '33'}`,
              borderRadius: 10, padding: '10px 12px', marginBottom: 8,
              borderLeft: `3px solid ${DIFFICULTY_COLOR[q.difficulty]}`,
            }}>
              {/* Título + badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: 0.5,
                  background: DIFFICULTY_COLOR[q.difficulty] + '22',
                  color: DIFFICULTY_COLOR[q.difficulty],
                  border: `1px solid ${DIFFICULTY_COLOR[q.difficulty]}44`,
                  borderRadius: 4, padding: '1px 5px', flexShrink: 0,
                }}>{DIFFICULTY_LABEL[q.difficulty].toUpperCase()}</span>
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{q.title}</span>
              </div>
              {/* Descrição */}
              <div style={{ color: '#888', fontSize: 10, marginBottom: 7, lineHeight: 1.4 }}>{q.description}</div>
              {/* Progresso (se ativa) */}
              {q.accepted && !q.completed && (
                <div style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666', marginBottom: 3 }}>
                    <span>Progresso</span><span style={{ color: DIFFICULTY_COLOR[q.difficulty] }}>{q.progress}/{q.targetCount}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (q.progress / q.targetCount) * 100)}%`, height: '100%', background: `linear-gradient(90deg, ${DIFFICULTY_COLOR[q.difficulty]}, ${DIFFICULTY_COLOR[q.difficulty]}88)`, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              {/* Recompensas */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: '#9b59b6', background: 'rgba(155,89,182,0.1)', padding: '2px 6px', borderRadius: 4 }}>+{q.reward.xp} XP</span>
                <span style={{ fontSize: 10, color: '#ffd700', background: 'rgba(255,215,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>+{q.reward.gold}G</span>
                {q.reward.itemName && <span style={{ fontSize: 10, color: '#e67e22', background: 'rgba(230,126,34,0.1)', padding: '2px 6px', borderRadius: 4 }}>🎁 {q.reward.itemName}</span>}
              </div>
              {/* Ações */}
              {q.completed ? (
                <div style={{ fontSize: 10, color: '#2ecc71', fontWeight: 700, padding: '4px 0' }}>✅ COMPLETA — Fale com um NPC para receber</div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  {!q.accepted && (
                    <button onClick={() => onAccept(q)} style={{ flex: 1, padding: '6px 0', background: 'linear-gradient(135deg, #27ae60, #1a8a48)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>
                      ✅ Aceitar Missão
                    </button>
                  )}
                  {q.accepted && (
                    <button onClick={() => onAutoGo(q)} style={{ flex: 1, padding: '6px 0', background: 'linear-gradient(135deg, #9b59b6, #6c3483)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>
                      🤖 Auto Completar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer fixo — gerar mais missões */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>
            [Q] fechar • Nível {playerLevel} • {ZONE_ICONS[zone]} {zone}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Profile Panel ────────────────────────────────────────────────────────────
function ProfilePanel({ state, save, onClose }: { state: GameState; save: CharacterSave | null; onClose: () => void }) {
  const cls = state.playerClass; const theme = CLASS_SKILL_THEMES[cls];
  const subCls = save?.subClass ? SUBCLASSES[cls].find(s => s.id === save.subClass) : null;
  const hoursPlayed = save ? save.hoursPlayed + (Date.now() - save.lastPlayed) / 3600000 : 0;

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 380, background: 'linear-gradient(135deg, rgba(8,4,20,0.97), rgba(15,8,35,0.97))', border: `1px solid ${theme.border}44`, borderRadius: 16, padding: 20, zIndex: 200, backdropFilter: 'blur(20px)', boxShadow: `0 0 40px ${theme.glow}33` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 15 }}>👤 PERFIL DO PERSONAGEM</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
      {/* Avatar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, background: theme.bg, border: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, boxShadow: `0 0 20px ${theme.glow}66` }}>{CLASS_ICONS[cls]}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{save?.name ?? 'Herói'}</div>
          <div style={{ fontSize: 11, color: theme.border, textTransform: 'capitalize' }}>{cls} {subCls ? `→ ${subCls.name}` : ''}</div>
          <div style={{ fontSize: 12, color: '#ffd700', marginTop: 4 }}>Nível {state.playerLevel}</div>
          {save && <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Criado em {new Date(save.createdAt).toLocaleDateString('pt-BR')}</div>}
        </div>
      </div>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          ['⚔️ ATK', state.playerMaxHp > 0 ? '—' : '—', '#e74c3c'],
          ['🛡️ DEF', '—', '#3498db'],
          ['☠️ Mortes', String(state.deaths ?? 0), '#e74c3c'],
          ['👹 Kills', String(state.playerKills), '#ffd700'],
          ['👑 Boss Kills', String(state.bossKills ?? 0), '#9b59b6'],
          ['📜 Missões', String(save?.questsDone ?? 0), '#27ae60'],
          ['⏱️ Jogado', formatPlayTime(hoursPlayed), '#3498db'],
          ['💰 Ouro', String(state.playerGold), '#ffd700'],
        ].map(([label, value, color]) => (
          <div key={label as string} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: '#666' }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: color as string }}>{value}</div>
          </div>
        ))}
      </div>
      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bar value={state.playerHp} max={state.playerMaxHp} colors={['#e74c3c', '#ff8844']} label="HP" />
        <Bar value={state.playerMp} max={state.playerMaxMp} colors={['#3498db', '#00d2ff']} label="MP" />
        <Bar value={state.playerXp} max={state.playerXpNext} colors={['#9b59b6', '#cc44ff']} label="XP" />
      </div>
      {/* Sub-class unlock */}
      {!subCls && state.playerLevel >= 20 && (
        <div style={{ marginTop: 14, padding: 10, background: 'rgba(155,89,182,0.1)', border: '1px solid #9b59b644', borderRadius: 8 }}>
          <div style={{ color: '#9b59b6', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🌟 Sub-classe disponível!</div>
          {SUBCLASSES[cls].map(sub => (
            <div key={sub.id} style={{ fontSize: 10, color: '#ccc', marginBottom: 3 }}>{sub.icon} <b>{sub.name}</b> — {sub.description}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Map Panel ────────────────────────────────────────────────────────────────
function MapPanel({ currentZone, onPortal, onClose }: { currentZone: ZoneId; onPortal: (z: ZoneId) => void; onClose: () => void }) {
  const zones: { id: ZoneId; name: string; icon: string; color: string; levels: string; x: number; y: number }[] = [
    { id: 'city', name: 'Prontera', icon: '🏰', color: '#9b59b6', levels: 'Cidade Central', x: 50, y: 50 },
    { id: 'forest', name: 'Floresta Sombria', icon: '🌲', color: '#27ae60', levels: 'Lv 5-25', x: 30, y: 25 },
    { id: 'ice', name: 'Tundra Glacial', icon: '❄️', color: '#00d2ff', levels: 'Lv 15-40', x: 70, y: 25 },
    { id: 'volcano', name: 'Caldeira Infernal', icon: '🌋', color: '#e74c3c', levels: 'Lv 20-55', x: 20, y: 65 },
    { id: 'desert', name: 'Deserto de Areia', icon: '🏜️', color: '#f39c12', levels: 'Lv 10-45', x: 80, y: 65 },
    { id: 'dungeon', name: 'Masmorra das Trevas', icon: '💀', color: '#8e44ad', levels: 'Lv 12-60', x: 50, y: 80 },
  ];

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 420, background: 'linear-gradient(135deg, rgba(8,4,20,0.97), rgba(15,8,35,0.97))', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 16, padding: 20, zIndex: 200, backdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 15 }}>🗺️ MAPA DO MUNDO</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
      {/* World map visualization */}
      <div style={{ position: 'relative', height: 240, background: 'radial-gradient(circle at 50% 50%, #1a0a3a, #050010)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12, overflow: 'hidden' }}>
        {/* Grid lines */}
        {[25, 50, 75].map(p => <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, borderLeft: '1px solid rgba(255,255,255,0.04)' }} />)}
        {[25, 50, 75].map(p => <div key={p} style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.04)' }} />)}
        {/* Connection lines from city to zones */}
        {zones.filter(z => z.id !== 'city').map(z => (
          <svg key={z.id} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="50%" y1="50%" x2={`${z.x}%`} y2={`${z.y}%`} stroke={z.color} strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
          </svg>
        ))}
        {/* Zone nodes */}
        {zones.map(z => (
          <button key={z.id} onClick={() => onPortal(z.id)} style={{ position: 'absolute', left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%, -50%)', background: currentZone === z.id ? z.color : `${z.color}22`, border: `2px solid ${z.color}`, borderRadius: 12, padding: '4px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, boxShadow: currentZone === z.id ? `0 0 15px ${z.color}` : 'none' }}>
            <span style={{ fontSize: 16 }}>{z.icon}</span>
            <span style={{ fontSize: 7, color: '#fff', whiteSpace: 'nowrap', fontWeight: 600 }}>{z.name}</span>
            <span style={{ fontSize: 6, color: '#aaa' }}>{z.levels}</span>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>Clique em uma zona para viajar instantaneamente</div>
    </div>
  );
}

// ── Main HUD ─────────────────────────────────────────────────────────────────
interface HUDProps {
  state: GameState; engine: GameEngine | null;
  save: CharacterSave | null; onBack: () => void;
}

// ── Real Quest Panel ───────────────────────────────────────────────────────────
function RealQuestPanel({ questProgress, onClaim, onClose }: {
  questProgress: QuestProgress[];
  onClaim: (id: string) => void;
  onClose: () => void;
}) {
  const active = questProgress.filter(q => !q.claimed);
  const done   = questProgress.filter(q => q.claimed);

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, maxHeight: '75vh', background: 'linear-gradient(160deg,rgba(5,2,20,0.98),rgba(15,5,35,0.98))', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 16, padding: 20, zIndex: 200, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 2, color: '#ffd700' }}>📜 MISSÕES</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.length === 0 && <div style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: 20 }}>Nenhuma missão ativa.</div>}
        {active.map(qp => {
          const q = QUESTS[qp.questId];
          if (!q) return null;
          const pct = Math.min(100, (qp.progress / q.targetCount) * 100);
          return (
            <div key={qp.questId} style={{ background: qp.completed ? 'rgba(46,204,113,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${qp.completed ? 'rgba(46,204,113,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{q.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: qp.completed ? '#2ecc71' : '#fff' }}>{q.title}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{q.description}</div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 6, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: qp.completed ? '#2ecc71' : '#ffd700', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{qp.progress}/{q.targetCount} {q.type === 'kill' ? 'mortes' : q.type === 'collect' ? 'itens' : 'concluído'}</div>
                  {/* Rewards */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
                    <span style={{ fontSize: 9, color: '#ffd700', background: 'rgba(255,215,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>+{q.reward.gold}G</span>
                    <span style={{ fontSize: 9, color: '#9b59b6', background: 'rgba(155,89,182,0.1)', padding: '2px 6px', borderRadius: 4 }}>+{q.reward.xp}XP</span>
                    {q.reward.itemId && <span style={{ fontSize: 9, color: '#2ecc71', background: 'rgba(46,204,113,0.1)', padding: '2px 6px', borderRadius: 4 }}>🎁 Item</span>}
                  </div>
                </div>
                {qp.completed && !qp.claimed && (
                  <button onClick={() => onClaim(qp.questId)} style={{ flexShrink: 0, padding: '6px 12px', background: 'linear-gradient(135deg,#1a7a30,#2ecc71)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    RESGATAR
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {done.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 9, color: '#2a4a2a', letterSpacing: 2, marginBottom: 6 }}>CONCLUÍDAS ({done.length})</div>
            {done.map(qp => {
              const q = QUESTS[qp.questId];
              if (!q) return null;
              return (
                <div key={qp.questId} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 14, opacity: 0.4 }}>{q.icon}</span>
                  <span style={{ fontSize: 10, color: '#2a4a2a', textDecoration: 'line-through' }}>{q.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, color: '#1a3a1a' }}>✓</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameHUD({ state, engine, save, onBack }: HUDProps) {
  const [showSkills, setShowSkills] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showNPC, setShowNPC] = useState<{ type: string; label: string } | null>(null);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [skillSP, setSkillSP] = useState(save?.sp ?? 3);
  const [quests, setQuests] = useState<Quest[]>(() => generateQuestBoard(state.playerLevel, state.zone));
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [tutorialDismissed, setTutorialDismissed] = useState(state.tutorialSeen);
  const [selectedInvItem, setSelectedInvItem] = useState<string | null>(null);
  const [showSkins, setShowSkins] = useState(false);
  const cls = state.playerClass;
  const skills = skillsArray(SKILL_TREES[cls]);
  const theme = CLASS_SKILL_THEMES[cls];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'i') { setShowInventory(p => !p); setShowMap(false); setShowProfile(false); setShowQuests(false); }
      if (k === 'm') { setShowMap(p => !p); setShowInventory(false); setShowProfile(false); setShowQuests(false); }
      if (k === 'p') { setShowProfile(p => !p); setShowMap(false); setShowInventory(false); setShowQuests(false); }
      // Q is now camera rotation — use J for quests
      if (k === 'j') { setShowQuests(p => !p); setShowMap(false); setShowInventory(false); setShowProfile(false); }
      if (k === 'k') setShowSkills(p => !p);
      if (k === 'escape') { setShowInventory(false); setShowMap(false); setShowProfile(false); setShowSkills(false); setShowNPC(null); setShowQuests(false); }
      if (k === 'e') engine?.attackNearMonster();
      if (k === 'r') engine?.toggleAutoPlay();
      const numIdx = ['1','2','3','4','5','6'].indexOf(k);
      if (numIdx >= 0 && engine) {
        const skillList = Object.values(skills);
        const sk = skillList[numIdx];
        if (sk) {
          const lvl = (skillLevels[sk.id] || 0);
          if (lvl > 0) engine.useSkill(sk.id, sk.mpCost);
          else engine.addLog(`🔒 Skill ${sk.name} não desbloqueada! Pressione K para abrir a árvore.`);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [engine]);

  useEffect(() => { setSkillSP(p => p + 1); }, [state.playerLevel]);

  // Open NPC popup when near interactable and F pressed
  useEffect(() => {
    if (state.nearInteractable && state.nearInteractable.type !== 'portal') {
      // show info but require F to open
    }
  }, [state.nearInteractable]);

  const handleNPCInteract = useCallback(() => {
    if (state.nearInteractable && state.nearInteractable.type !== 'portal') {
      setShowNPC({ type: state.nearInteractable.type, label: state.nearInteractable.label });
    }
  }, [state.nearInteractable]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'f') handleNPCInteract(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNPCInteract]);

  const upgradeSkill = (id: string) => {
    if (skillSP <= 0) return;
    const skill = skills.find(s => s.id === id); if (!skill) return;
    const cur = skillLevels[id] || 0; if (cur >= skill.maxLevel) return;
    setSkillLevels(p => ({ ...p, [id]: cur + 1 })); setSkillSP(p => p - 1);
  };

  const EQUIP_SLOTS: Record<string, string> = {
    'Espada': 'weapon', 'Blade': 'weapon', 'Cajado': 'weapon', 'Arco': 'weapon', 'Adaga': 'weapon', 'Lâmina': 'weapon',
    'Armadura': 'armor', 'Elmo': 'helmet', 'Capacete': 'helmet', 'Bota': 'boots', 'Sandália': 'boots',
    'Asa': 'wings', 'Asas': 'wings', 'Wing': 'wings',
    'Escudo': 'shield',
  };
  const EQUIP_STATS: Record<string, [string, number][]> = {
    'Espada de Ferro': [['atk', 12]], 'Espada de Aço': [['atk', 22]], 'Espada das Trevas': [['atk', 38]], 'Espada Lendária': [['atk', 60]],
    'Armadura de Couro': [['def', 10]], 'Armadura de Ferro': [['def', 20]], 'Armadura de Dragão': [['def', 38]], 'Armadura Lendária': [['def', 55]],
    'Elmo de Ferro': [['def', 8]], 'Elmo de Ouro': [['def', 16]], 'Capacete do Dragão': [['def', 28]],
    'Bota Rápida': [['atk', 5], ['def', 5]], 'Bota do Vento': [['atk', 10], ['def', 8]], 'Bota do Fogo': [['atk', 14], ['def', 12]],
    'Escudo de Ferro': [['def', 15]], 'Escudo Sagrado': [['def', 28]], 'Escudo do Dragão': [['def', 40]],
    'Asas do Anjo': [['def', 5]], 'Asas do Demônio': [['atk', 8]], 'Asas do Dragão': [['atk', 10], ['def', 10]],
  };

  const getEquipSlot = (name: string): string | null => {
    for (const [kw, slot] of Object.entries(EQUIP_SLOTS)) { if (name.includes(kw)) return slot; }
    return null;
  };

  const handleBuy = (itemName: string, cost: number, itemIcon: string, itemDesc: string) => {
    if (!engine) return;
    if (state.playerGold < cost) { engine.addLog('❌ Ouro insuficiente!'); return; }
    engine.playerStats.gold -= cost;
    const s = engine.playerStats;
    const slot = getEquipSlot(itemName);
    const isConsumable = itemName.includes('Poção') || itemName.includes('Elixir') || itemName.includes('XP') || itemName.includes('Pergaminho') || itemName.includes('Runa') || itemName.includes('Escudo de Pedra') || itemName.includes('Elixir de Batalha');

    if (isConsumable) {
      engine.addToInventory({ name: itemName, icon: itemIcon, type: 'consumable', desc: itemDesc });
      engine.addLog(`🎒 ${itemIcon} ${itemName} → Inventário!`);
    } else if (slot) {
      // Equipment — goes to inventory as equippable, auto-equip immediately
      const stats = EQUIP_STATS[itemName] ?? [];
      for (const [stat, val] of stats) { (s as unknown as Record<string, number>)[stat] = ((s as unknown as Record<string, number>)[stat] || 0) + val; }
      engine.addToInventory({ name: itemName, icon: itemIcon, type: 'equippable:' + slot, desc: itemDesc });
      engine.equipItem(itemName, itemIcon, slot);
    } else {
      // Upgrade materials / misc
      if (itemName.includes('Aprimoramento +1')) { s.atk += 5; s.def += 5; engine.addLog('🔨 ATK+5 DEF+5!'); }
      else if (itemName.includes('Aprimoramento +2')) { s.atk += 12; s.def += 12; }
      else if (itemName.includes('Reforço')) { s.atk += 20; }
      else if (itemName.includes('Tempero')) { s.atk += 30; s.def += 30; }
      engine.addToInventory({ name: itemName, icon: itemIcon, type: 'misc', desc: itemDesc });
      engine.addLog(`✅ ${itemIcon} ${itemName} adquirido!`);
    }
  };

  const acceptQuest = (q: Quest) => {
    const updated = { ...q, accepted: true };
    setActiveQuests(p => [...p, updated]);
    setQuests(p => p.map(qst => qst.id === q.id ? updated : qst));
    engine?.addLog(`📜 Missão aceita: ${q.title}`);
  };

  const autoGoQuest = (q: Quest) => {
    engine?.setQuestTarget(q.targetMonster ?? null, q.zone);
    setShowQuests(false);
  };

  const hpPct = state.playerHp / state.playerMaxHp;
  const hpColor = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
  const timeStr = (() => {
    const t = state.timeOfDay; let h = Math.floor(t * 24); const m = Math.floor((t * 24 - h) * 60);
    const p = h >= 12 ? 'PM' : 'AM'; if (h > 12) h -= 12; if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${p}`;
  })();
  const isNight = state.timeOfDay < 0.22 || state.timeOfDay > 0.78;

  const anyPanelOpen = showInventory || showMap || showProfile || showNPC !== null || showQuests;

  return (
    <>
      {/* TOP BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '6px 12px', background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 13, letterSpacing: 3, textShadow: '0 0 10px #ffd70088' }}>AETHER</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#ccc', alignItems: 'center' }}>
          <span>{isNight ? '🌙' : '☀️'} {timeStr}</span>
          <span style={{ color: '#ffd700', fontWeight: 700 }}>💰 {state.playerGold}G</span>
          <span style={{ color: '#aaa' }}>☠️ {state.playerKills}</span>
          <span style={{ color: theme.border }}>Lv.{state.playerLevel} {cls}</span>
          <span>{ZONE_ICONS[state.zone]} {state.zoneName}</span>
        </div>
      </div>

      {/* AUTO-PLAY indicator */}
      {state.autoPlay && (
        <div style={{ position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)', background: 'rgba(155,89,182,0.9)', border: '1px solid #9b59b6', borderRadius: 20, padding: '3px 14px', fontSize: 11, color: '#fff', fontWeight: 600, zIndex: 10 }}>
          🤖 AUTO — {state.activeQuestTarget ?? 'Combate'} <button onClick={() => engine?.toggleAutoPlay()} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>✕</button>
        </div>
      )}

      {/* BOTTOM-LEFT: Character panel */}
      <div style={{ position: 'absolute', bottom: 80, left: 10, width: 210, background: 'linear-gradient(135deg, rgba(5,2,15,0.92), rgba(10,5,25,0.92))', border: `1px solid ${theme.border}33`, borderRadius: 14, padding: 12, backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: theme.bg, border: `2px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 0 14px ${theme.glow}44`, cursor: 'pointer' }} onClick={() => setShowProfile(p => !p)}>{CLASS_ICONS[cls]}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{save?.name ?? 'Herói'}</div>
            <div style={{ fontSize: 10, color: theme.border, textTransform: 'capitalize' }}>{cls}</div>
            <div style={{ fontSize: 10, color: '#ffd700' }}>Lv.{state.playerLevel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Bar value={state.playerHp} max={state.playerMaxHp} colors={[hpColor, '#ff8844']} label="HP" />
          <Bar value={state.playerMp} max={state.playerMaxMp} colors={['#3498db', '#00d2ff']} label="MP" />
          <Bar value={state.playerXp} max={state.playerXpNext} colors={['#9b59b6', '#cc44ff']} label="XP" />
        </div>
      </div>

      {/* ACTIVE QUEST TRACKER */}
      {(() => {
        const activeQs = (state.questProgress ?? []).filter(q => !q.claimed).slice(0, 3);
        if (activeQs.length === 0) return null;
        return (
          <div style={{ position: 'absolute', top: 36, right: 10, width: 200, zIndex: 10, pointerEvents: 'none' }}>
            {activeQs.map(qp => {
              const q = QUESTS[qp.questId];
              if (!q) return null;
              const pct = Math.min(100, (qp.progress / q.targetCount) * 100);
              return (
                <div key={qp.questId} style={{ background: 'rgba(0,0,0,0.7)', borderLeft: `2px solid ${qp.completed ? '#2ecc71' : '#ffd700'}`, borderRadius: '0 8px 8px 0', padding: '5px 8px', marginBottom: 4 }}>
                  <div style={{ fontSize: 9, color: qp.completed ? '#2ecc71' : '#ffd700', fontWeight: 700 }}>{q.icon} {q.title}</div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: qp.completed ? '#2ecc71' : '#ffd700' }} />
                  </div>
                  <div style={{ fontSize: 8, color: '#555', marginTop: 2 }}>{qp.progress}/{q.targetCount}</div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* COMBAT LOG */}
      {state.combatLog.length > 0 && (
        <div style={{ position: 'absolute', bottom: 80, right: 10, width: 250, background: 'rgba(0,0,0,0.75)', borderRadius: 10, padding: '8px 10px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', zIndex: 10, pointerEvents: 'none' }}>
          {state.combatLog.slice(0, 5).map((log, i) => (
            <div key={i} style={{ fontSize: 10, color: i === 0 ? '#fff' : '#888', marginBottom: 2, opacity: 1 - i * 0.18 }}>{log}</div>
          ))}
        </div>
      )}

      {/* ZONE BANNER */}
      {state.zone !== 'city' && (
        <div style={{ position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 16px', fontSize: 11, color: '#ddd', letterSpacing: 2, zIndex: 10, pointerEvents: 'none' }}>
          {ZONE_ICONS[state.zone]} {state.zoneName}
        </div>
      )}

      {/* NEAR MONSTER — compact floating target bar, no button */}
      {state.nearMonster && !anyPanelOpen && (
        <div style={{ position: 'absolute', top: 44, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.82)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: 20, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 20, pointerEvents: 'none', backdropFilter: 'blur(8px)', minWidth: 200 }}>
          <span style={{ fontSize: 14 }}>{state.nearMonster.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#ff9999', fontWeight: 700 }}>{state.nearMonster.name} <span style={{ color: '#555', fontWeight: 400 }}>Lv.{state.nearMonster.level}</span></div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 3 }}>
              <div style={{ width: `${(state.nearMonster.hp / state.nearMonster.maxHp) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#c0392b,#e74c3c)', borderRadius: 2, transition: 'width 0.2s' }} />
            </div>
          </div>
          <span style={{ fontSize: 9, color: '#555' }}>E/clique</span>
        </div>
      )}

      {/* NEAR INTERACTABLE */}
      {state.nearInteractable && state.nearInteractable.type !== 'portal' && !showNPC && !anyPanelOpen && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -130px)', background: 'rgba(0,0,0,0.88)', border: '1px solid #ffd70044', borderRadius: 10, padding: '8px 16px', textAlign: 'center', zIndex: 20 }}>
          <div style={{ fontSize: 12, color: '#ffd700', marginBottom: 4 }}>{state.nearInteractable.label}</div>
          <button onClick={handleNPCInteract} style={{ padding: '4px 12px', background: '#ffd700', border: 'none', borderRadius: 6, color: '#000', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>[F] Interagir</button>
        </div>
      )}

      {/* DAMAGE NUMBERS */}
      {state.dmgNumbers.map(d => {
        const isHeal = d.color === '#2ecc71';
        const isXp = d.color === '#9b59b6';
        const isCrit = d.color === '#ffd700';
        const prefix = isHeal ? '+' : isXp ? '+' : '-';
        const suffix = isXp ? 'XP' : '';
        const sz = isCrit ? 26 : d.value > 200 ? 22 : d.value > 100 ? 19 : 15;
        return (
          <div key={d.id} style={{ position: 'absolute', left: d.x, top: d.y, transform: `translate(-50%, -50%) scale(${d.scale})`, color: d.color, fontWeight: 900, fontSize: sz, opacity: d.opacity, pointerEvents: 'none', textShadow: `0 0 12px ${d.color}aa, 0 2px 6px rgba(0,0,0,0.9)`, userSelect: 'none', zIndex: 30, letterSpacing: isCrit ? 1 : 0 }}>
            {isCrit && <span style={{ fontSize: sz * 0.55, display: 'block', textAlign: 'center', letterSpacing: 2, marginBottom: -4 }}>CRÍTICO!</span>}
            {prefix}{d.value}{suffix}
          </div>
        );
      })}

      {/* TUTORIAL (show once) */}
      {!tutorialDismissed && !state.tutorialSeen && (
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.92)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 14, padding: 18, textAlign: 'center', zIndex: 100, maxWidth: 320, backdropFilter: 'blur(12px)' }}>
          <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 15, marginBottom: 12 }}>⚔️ Bem-vindo ao Aether Online!</div>
          <div style={{ color: '#ccc', fontSize: 11, lineHeight: 1.7, marginBottom: 14 }}>
            <b style={{ color: '#fff' }}>WASD</b> ou <b style={{ color: '#fff' }}>clique</b> para mover<br/>
            <b style={{ color: '#fff' }}>Z/C</b> — girar câmera | <b style={{ color: '#fff' }}>Scroll</b> — zoom<br/>
            <b style={{ color: '#fff' }}>E</b> — atacar | <b style={{ color: '#fff' }}>F</b> — interagir com NPCs<br/>
            <b style={{ color: '#fff' }}>I</b> — inventário | <b style={{ color: '#fff' }}>M</b> — mapa<br/>
            <b style={{ color: '#fff' }}>K</b> — skills | <b style={{ color: '#fff' }}>P</b> — perfil<br/>
            <b style={{ color: '#fff' }}>R</b> — modo automático<br/>
            Entre nos <b style={{ color: '#ffd700' }}>portais</b> para explorar biomas!
          </div>
          <button onClick={() => { setTutorialDismissed(true); engine?.markTutorialSeen(); }} style={{ padding: '8px 24px', background: 'linear-gradient(135deg, #9b59b6, #6c3483)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Entendido! Vamos jogar!</button>
        </div>
      )}

      {/* SKILLS HOTBAR */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, alignItems: 'flex-end', zIndex: 10 }}>
        <button onClick={() => engine?.attackNearMonster()} title="Atacar [E]" style={{ width: 50, height: 50, background: 'rgba(231,76,60,0.25)', border: '2px solid #e74c3c', borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
          ⚔️<span style={{ fontSize: 7, color: '#e74c3c' }}>E</span>
        </button>
        {skills.slice(0, 6).map((skill, i) => {
          const lvl = skillLevels[skill.id] || 0; const mpOk = state.playerMp >= skill.mpCost;
          return (
            <div key={skill.id} style={{ position: 'relative' }} title={`${skill.name}\n${skill.description}\nMP: ${skill.mpCost} | Lv.${lvl}/${skill.maxLevel}`}>
              <button onClick={() => lvl > 0 && engine?.useSkill(skill.id, skill.mpCost)} style={{ width: 50, height: 50, background: 'transparent', border: 'none', padding: 0, cursor: lvl > 0 ? 'pointer' : 'default', opacity: lvl > 0 && mpOk ? 1 : 0.45, display: 'block' }}>
                <SkillIcon skill={skill} size={50} cls={cls} />
              </button>
              <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 7, color: '#fff', fontWeight: 700, textShadow: '0 0 4px #000' }}>{['1','2','3','4','5','6'][i]}</span>
              {lvl > 0 && <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, color: '#ffd700', fontWeight: 700, textShadow: '0 0 4px #000' }}>{lvl}</span>}
              {!lvl && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#333' }}>🔒</div>}
            </div>
          );
        })}
        {/* Panel buttons */}
        {([['K', '📋', () => setShowSkills(p => !p), showSkills], ['J', '📜', () => setShowQuests(p => !p), showQuests], ['I', '🎒', () => setShowInventory(p => !p), showInventory], ['M', '🗺️', () => setShowMap(p => !p), showMap], ['P', '👤', () => setShowProfile(p => !p), showProfile]] as [string, string, () => void, boolean][]).map(([key, icon, fn, active]) => (
          <button key={key} onClick={fn} style={{ width: 50, height: 50, background: active ? 'rgba(155,89,182,0.3)' : 'rgba(255,255,255,0.05)', border: `2px solid ${active ? '#9b59b6' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
            {icon}<span style={{ fontSize: 7, color: '#9b59b6' }}>{key}</span>
          </button>
        ))}
        <button onClick={() => setShowSkins(p => !p)} title="Loja de Skins" style={{ width: 50, height: 50, background: showSkins ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)', border: `2px solid ${showSkins ? '#ffd700' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
          🎨<span style={{ fontSize: 7, color: '#ffd700' }}>SKIN</span>
        </button>
        <button onClick={() => engine?.toggleAutoPlay()} title="Modo Automático [R]" style={{ width: 50, height: 50, background: state.autoPlay ? 'rgba(155,89,182,0.4)' : 'rgba(255,255,255,0.05)', border: `2px solid ${state.autoPlay ? '#9b59b6' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
          {state.autoPlay ? '🤖' : '🎮'}<span style={{ fontSize: 7, color: '#9b59b6' }}>R</span>
        </button>
      </div>

      {/* SKIN SHOP */}
      {showSkins && (
        <div style={{ position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)', width: 560, background: 'linear-gradient(135deg, rgba(5,2,15,0.97), rgba(10,5,25,0.97))', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 16, padding: 16, backdropFilter: 'blur(16px)', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 14 }}>🎨 LOJA DE SKINS</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {state.playerRole !== 'player' && <span style={{ color: '#ffd700', fontSize: 10, background: 'rgba(255,215,0,0.15)', border: '1px solid #ffd70066', borderRadius: 6, padding: '2px 8px' }}>👑 {state.playerRole?.toUpperCase()}</span>}
              <button onClick={() => setShowSkins(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: '50vh', overflowY: 'auto' }}>
            {SKINS.map(skin => {
              const owned = skin.cost === 0 || (engine?.currentSkin === skin.id);
              const canAfford = state.playerGold >= skin.cost;
              const isActive = engine?.currentSkin === skin.id;
              return (
                <div key={skin.id} style={{ background: isActive ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? '#ffd700' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: 8, textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    if (skin.cost === 0 || owned) { engine?.setSkin(skin.id); return; }
                    if (!canAfford) { engine?.addLog('❌ Ouro insuficiente!'); return; }
                    if (engine) { engine.playerStats.gold -= skin.cost; engine.setSkin(skin.id); engine.addLog(`🎨 Skin ${skin.name} equipada!`); }
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{skin.icon}</div>
                  <div style={{ color: '#fff', fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{skin.name}</div>
                  <div style={{ color: '#666', fontSize: 8, marginBottom: 4 }}>{skin.desc}</div>
                  {isActive ? <div style={{ color: '#ffd700', fontSize: 8, fontWeight: 700 }}>✓ ATIVA</div>
                    : skin.cost === 0 ? <div style={{ color: '#888', fontSize: 8 }}>Grátis</div>
                    : <div style={{ color: canAfford ? '#ffd700' : '#e74c3c', fontSize: 8, fontWeight: 700 }}>💰 {skin.cost.toLocaleString()}G</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SKILL TREE PANEL */}
      {showSkills && (
        <div style={{ position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)', width: 520, maxHeight: '60vh', overflowY: 'auto', background: 'linear-gradient(135deg, rgba(5,2,15,0.97), rgba(10,5,25,0.97))', border: `1px solid ${theme.border}44`, borderRadius: 16, padding: 16, backdropFilter: 'blur(16px)', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 13 }}>📋 SKILLS — {cls.toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ color: '#9b59b6', fontSize: 11 }}>SP: {skillSP}</span>
              <button onClick={() => setShowSkills(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {skills.map(skill => {
              const lvl = skillLevels[skill.id] || 0; const maxed = lvl >= skill.maxLevel;
              const reqMet = !skill.requiresSkill || (skillLevels[skill.requiresSkill] || 0) > 0;
              const lvlMet = state.playerLevel >= skill.levelReq;
              return (
                <div key={skill.id} style={{ background: lvl > 0 ? `${skill.color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${lvl > 0 ? skill.color + '44' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: 8, opacity: reqMet && lvlMet ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <SkillIcon skill={skill} size={42} cls={cls} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: skill.color, textAlign: 'center', marginBottom: 2 }}>{skill.name}</div>
                  <div style={{ fontSize: 8, color: '#777', textAlign: 'center', marginBottom: 4, lineHeight: 1.3 }}>{skill.description}</div>
                  <div style={{ fontSize: 8, color: '#555', textAlign: 'center', marginBottom: 5 }}>Lv{lvl}/{skill.maxLevel} • MP:{skill.mpCost}</div>
                  {skill.requiresSkill && <div style={{ fontSize: 7, color: '#555', textAlign: 'center', marginBottom: 4 }}>Req: {skills.find(s => s.id === skill.requiresSkill)?.name}</div>}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {!maxed && reqMet && lvlMet && skillSP > 0 && <button onClick={() => upgradeSkill(skill.id)} style={{ flex: 1, padding: '3px 0', background: skill.color, border: 'none', borderRadius: 4, color: '#fff', fontSize: 8, cursor: 'pointer', fontWeight: 600 }}>+</button>}
                    {lvl > 0 && <button onClick={() => engine?.useSkill(skill.id, skill.mpCost)} style={{ flex: 1, padding: '3px 0', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 4, color: '#ccc', fontSize: 8, cursor: 'pointer' }}>▶</button>}
                    {maxed && <div style={{ flex: 1, textAlign: 'center', fontSize: 8, color: '#ffd700' }}>MAX✨</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PANELS */}
      {showNPC && <NPCPopup type={showNPC.type} label={showNPC.label} onClose={() => setShowNPC(null)} onBuy={handleBuy} />}
      {showQuests && <RealQuestPanel questProgress={state.questProgress} onClaim={(id) => engine?.claimQuest(id)} onClose={() => setShowQuests(false)} />}
      {showProfile && <ProfilePanel state={state} save={save} onClose={() => setShowProfile(false)} />}
      {showMap && <MapPanel currentZone={state.zone} onPortal={(z) => { engine?.enterZone(z); setShowMap(false); }} onClose={() => setShowMap(false)} />}
      {showInventory && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 380, background: 'linear-gradient(135deg, rgba(8,4,20,0.98), rgba(15,8,35,0.98))', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 16, padding: 20, zIndex: 200, backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(155,89,182,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 14 }}>🎒 INVENTÁRIO <span style={{ color: '#555', fontWeight: 400, fontSize: 10 }}>{(state.inventory ?? []).length}/30</span></div>
            <button onClick={() => { setShowInventory(false); setSelectedInvItem(null); }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 14 }}>
            {Array.from({ length: 30 }, (_, i) => {
              const item = (state.inventory ?? [])[i];
              const isSel = item && selectedInvItem === item.name;
              return (
                <div key={i}
                  onClick={() => item && setSelectedInvItem(isSel ? null : item.name)}
                  style={{ width: '100%', aspectRatio: '1', background: isSel ? 'rgba(255,215,0,0.15)' : item ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSel ? 'rgba(255,215,0,0.5)' : item ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: item ? 'pointer' : 'default', position: 'relative', transition: 'all 0.15s' }}>
                  {item && <>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    {item.qty > 1 && <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 8, color: '#ffd700', fontWeight: 700 }}>{item.qty}</span>}
                  </>}
                </div>
              );
            })}
          </div>
          {selectedInvItem && (() => {
            const item = (state.inventory ?? []).find(i => i.name === selectedInvItem);
            if (!item) return null;
            return (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>{item.desc} · Qtd: {item.qty}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.type === 'consumable' && (
                    <button onClick={() => { engine?.useInventoryItem(item.name); }} style={{ flex: 1, padding: '6px', background: 'linear-gradient(135deg, #1a6a2a, #2ecc71)', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>✅ Usar</button>
                  )}
                  {item.type.startsWith('equippable:') && (
                    <button onClick={() => { const slot = item.type.split(':')[1]; engine?.equipItem(item.name, item.icon, slot); }} style={{ flex: 1, padding: '6px', background: 'linear-gradient(135deg, #1a3a8a, #3498db)', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>⚔️ Equipar</button>
                  )}
                  <div style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: 7, color: '#666', fontSize: 9, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{item.type.replace('equippable:', '')}</div>
                </div>
              </div>
            );
          })()}
          {(state.inventory ?? []).length === 0 && <div style={{ fontSize: 11, color: '#555', textAlign: 'center', padding: 10 }}>Inventário vazio — compre itens nas lojas [F]</div>}
          <div style={{ fontSize: 9, color: '#444', textAlign: 'center', letterSpacing: 1 }}>CLIQUE NO ITEM · [I] FECHAR</div>
        </div>
      )}

      {/* Back button */}
      <button onClick={onBack} style={{ position: 'absolute', bottom: 10, left: 10, padding: '5px 12px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#888', fontSize: 10, cursor: 'pointer', zIndex: 10 }}>← Sair</button>
    </>
  );
}
