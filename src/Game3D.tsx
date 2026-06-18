import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, type GameState } from './game/engine/GameEngine';
import type { ClassName } from './game/data/classes';
import { SKILL_TREES } from './game/data/skills';
import type { SkillTree, Skill } from './game/data/skills';
import GameHUD from './components/GameHUD';
import { getCharacters, saveCharacter, createNewCharacter, deleteCharacter, type CharacterSave } from './game/systems/SaveSystem';
import { apiLoadCharacters, apiSaveCharacter, apiDeleteCharacter, type AuthInfo } from './api';

function skillsArray(tree: SkillTree): Skill[] { return Object.values(tree); }

// ── Class Info ─────────────────────────────────────────────────────────────
const CLASS_INFO: Record<ClassName, { icon: string; color: string; desc: string; role: string }> = {
  warrior: { icon: '⚔️', color: '#e74c3c', desc: 'Alto HP, defesa robusta, combate corpo a corpo.', role: 'Tank/DPS' },
  mage: { icon: '🔮', color: '#9b59b6', desc: 'Magia devastadora, baixa defesa, altíssimo dano.', role: 'Mago' },
  archer: { icon: '🏹', color: '#27ae60', desc: 'Dano à distância, alta velocidade e evasão.', role: 'DPS' },
  priest: { icon: '✝️', color: '#f1c40f', desc: 'Cura e bênçãos, suporte essencial do grupo.', role: 'Suporte' },
  ninja: { icon: '🌀', color: '#00d2ff', desc: 'Velocidade extrema, ataques rápidos e furtivos.', role: 'Assassino' },
  paladin: { icon: '🛡️', color: '#e67e22', desc: 'Cavaleiro sagrado, defesa divina e magia de luz.', role: 'Tank' },
  assassin: { icon: '🗡️', color: '#e91e8c', desc: 'Críticos letais, especialista em eliminar alvos.', role: 'Burst DPS' },
};

// ── Character Select Screen ────────────────────────────────────────────────
interface CharSelectProps { onStart: (save: CharacterSave) => void; auth: AuthInfo | null; onSessionExpired?: () => void }

export function CharacterSelect({ onStart, auth, onSessionExpired }: CharSelectProps) {
  const [saves, setSaves] = useState<CharacterSave[]>([]);
  const [loadingChars, setLoadingChars] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [cls, setCls] = useState<ClassName>('warrior');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    async function loadSaves() {
      setLoadingChars(true);
      try {
        if (auth) {
          const serverChars = await apiLoadCharacters(auth.token);
          setSaves(serverChars);
          setCreating(serverChars.length === 0);
        } else {
          const local = getCharacters();
          setSaves(local);
          setCreating(local.length === 0);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'SESSION_EXPIRED') {
          onSessionExpired?.();
          return;
        }
        const local = getCharacters();
        setSaves(local);
        setCreating(local.length === 0);
      } finally { setLoadingChars(false); }
    }
    loadSaves();
  }, [auth?.token]);

  const classes = Object.keys(CLASS_INFO) as ClassName[];
  const info = CLASS_INFO[cls];

  const handleCreate = async () => {
    if (!name.trim()) return;
    const newSave = createNewCharacter(name.trim(), cls);
    if (auth) {
      try { await apiSaveCharacter(auth.token, newSave); } catch { saveCharacter(newSave); }
    } else { saveCharacter(newSave); }
    setSaves(prev => [...prev, newSave]);
    onStart(newSave);
  };

  const handleDelete = async (id: string) => {
    if (auth) {
      try { await apiDeleteCharacter(auth.token, id); } catch { deleteCharacter(id); }
    } else { deleteCharacter(id); }
    const list = saves.filter(c => c.id !== id);
    setSaves(list);
    setDeleteConfirm(null);
    if (list.length === 0) setCreating(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #1a0040 0%, #08001a 40%, #020008 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', padding: '24px 16px', overflowY: 'auto', position: 'relative' }}>
      {/* Animated star field */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 120 }, (_, i) => {
          const size = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
          return <div key={i} style={{ position: 'absolute', width: size, height: size, background: i % 8 === 0 ? '#aad4ff' : i % 6 === 0 ? '#ffddaa' : '#fff', borderRadius: '50%', left: `${(i * 137.508) % 100}%`, top: `${(i * 61.803) % 100}%`, opacity: 0.1 + (i % 7) * 0.08, boxShadow: size > 1 ? `0 0 ${size * 2}px currentColor` : 'none' }} />;
        })}
      </div>
      {/* Bottom purple fog */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(0deg, rgba(100,0,200,0.12) 0%, transparent 100%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Logo */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
            <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 8, background: 'linear-gradient(180deg, #ffffff 0%, #ffd700 40%, #ff8800 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AETHER</div>
            <div style={{ fontSize: 14, fontWeight: 300, letterSpacing: 18, color: '#ffd70066', marginTop: -8 }}>ONLINE</div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)', margin: '8px 0 14px' }} />
          <div style={{ color: '#66508a', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' }}>Selecionar Personagem</div>
          {auth && <div style={{ color: '#ffd700aa', fontSize: 11, marginTop: 8, background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 20, padding: '3px 14px', display: 'inline-block' }}>👤 {auth.username}</div>}
        </div>

        {loadingChars && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666', fontSize: 13 }}>
            ⏳ Carregando personagens...
          </div>
        )}
        {!loadingChars && (<>

        {/* Saved Characters */}
        {!creating && saves.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#ffd700aa', fontSize: 9, letterSpacing: 3, marginBottom: 14, textAlign: 'center', textTransform: 'uppercase' }}>— Personagens Salvos —</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {saves.map(s => {
                const ci = CLASS_INFO[s.class];
                const daysAgo = Math.floor((Date.now() - s.lastPlayed) / 86400000);
                const lvlPct = Math.min(100, ((s.xp ?? 0) / Math.max(1, (s.xpNext ?? 200))) * 100);
                return (
                  <div key={s.id} style={{ background: `linear-gradient(135deg, ${ci.color}12 0%, rgba(0,0,0,0.4) 100%)`, border: `1px solid ${ci.color}44`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
                    {/* Glow accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, transparent, ${ci.color}88, transparent)` }} />
                    {/* Class avatar */}
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: `radial-gradient(circle at 40% 35%, ${ci.color}33, ${ci.color}11)`, border: `2px solid ${ci.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: `0 0 20px ${ci.color}33` }}>{ci.icon}</div>
                    {/* Stats */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: ci.color, textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 }}>{s.class} <span style={{ color: '#ffffff55' }}>· Nível {s.level}</span></div>
                      {/* XP bar */}
                      <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${lvlPct}%`, background: `linear-gradient(90deg, ${ci.color}88, ${ci.color})`, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 9, color: '#444', marginTop: 3, display: 'flex', gap: 10 }}>
                        <span>⚔️ {s.kills} kills</span>
                        <span>🕐 {Math.floor(s.hoursPlayed)}h</span>
                        <span>{daysAgo === 0 ? '🟢 Online hoje' : `${daysAgo}d atrás`}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                      {deleteConfirm === s.id ? (
                        <>
                          <button onClick={() => handleDelete(s.id)} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #8b0000, #c0392b)', border: 'none', borderRadius: 7, color: '#fff', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>Confirmar</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#888', fontSize: 10, cursor: 'pointer' }}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => onStart(s)} style={{ padding: '8px 20px', background: `linear-gradient(135deg, ${ci.color}cc, ${ci.color}66)`, border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 800, letterSpacing: 0.5, boxShadow: `0 4px 16px ${ci.color}44` }}>JOGAR →</button>
                          <button onClick={() => setDeleteConfirm(s.id)} style={{ padding: '4px 8px', background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.18)', borderRadius: 7, color: '#e74c3c88', fontSize: 9, cursor: 'pointer', textAlign: 'center' }}>🗑️ deletar</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setCreating(true)} style={{ width: '100%', marginTop: 12, padding: '11px', background: 'rgba(255,215,0,0.04)', border: '1px dashed rgba(255,215,0,0.2)', borderRadius: 11, color: '#ffd70077', fontSize: 11, cursor: 'pointer', letterSpacing: 1, fontWeight: 600 }}>＋ CRIAR NOVO PERSONAGEM</button>
          </div>
        )}

        {/* Create Character */}
        {creating && (
          <div>
            <div style={{ color: '#ffd700aa', fontSize: 9, letterSpacing: 3, marginBottom: 14, textAlign: 'center', textTransform: 'uppercase' }}>— Criar Personagem —</div>
            {/* Name input */}
            <div style={{ marginBottom: 18, position: 'relative' }}>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Nome do herói..." maxLength={20}
                style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,215,0,0.05)', border: `1px solid ${name.trim() ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box', letterSpacing: 0.5, transition: 'border 0.2s' }} autoFocus />
              {name.trim() && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#ffd70066', fontSize: 18 }}>✓</div>}
            </div>
            {/* Class grid */}
            <div style={{ fontSize: 9, color: '#666', letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' }}>Escolher Classe</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 16 }}>
              {classes.map(c => {
                const selected = cls === c;
                return (
                  <button key={c} onClick={() => setCls(c)} style={{ padding: '10px 4px', background: selected ? `radial-gradient(circle at 50% 40%, ${CLASS_INFO[c].color}30, ${CLASS_INFO[c].color}10)` : 'rgba(255,255,255,0.03)', border: `2px solid ${selected ? CLASS_INFO[c].color : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, cursor: 'pointer', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s', boxShadow: selected ? `0 0 20px ${CLASS_INFO[c].color}44` : 'none' }}>
                    <span style={{ fontSize: 22, filter: selected ? `drop-shadow(0 0 8px ${CLASS_INFO[c].color})` : 'none' }}>{CLASS_INFO[c].icon}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, color: selected ? CLASS_INFO[c].color : '#444', textTransform: 'uppercase', letterSpacing: 0.3 }}>{c}</span>
                  </button>
                );
              })}
            </div>
            {/* Class info panel */}
            <div style={{ background: `linear-gradient(135deg, ${info.color}12, rgba(0,0,0,0.4))`, border: `1px solid ${info.color}44`, borderRadius: 12, padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 16, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `radial-gradient(circle at 100% 50%, ${info.color}08, transparent)` }} />
              <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, filter: `drop-shadow(0 0 12px ${info.color}88)` }}>{info.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: info.color, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{cls}</div>
                <div style={{ color: '#ffffff66', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>{info.role}</div>
                <div style={{ color: '#aaa', fontSize: 11, lineHeight: 1.5 }}>{info.desc}</div>
              </div>
            </div>
            {/* Skills preview */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
              <div style={{ color: '#ffffff33', fontSize: 8, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Skills Iniciais</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {skillsArray(SKILL_TREES[cls]).slice(0, 6).map(sk => (
                  <div key={sk.id} style={{ background: `${sk.color}14`, border: `1px solid ${sk.color}33`, borderRadius: 6, padding: '3px 8px', fontSize: 9, color: sk.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span>{sk.icon}</span> {sk.name}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {saves.length > 0 && (
                <button onClick={() => setCreating(false)} style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: '#666', fontSize: 13, cursor: 'pointer' }}>←</button>
              )}
              <button onClick={handleCreate} disabled={!name.trim()} style={{ flex: 1, padding: 15, background: name.trim() ? `linear-gradient(135deg, ${info.color}dd, ${info.color}88)` : 'rgba(255,255,255,0.05)', border: `1px solid ${name.trim() ? info.color + '66' : 'transparent'}`, borderRadius: 11, color: name.trim() ? '#fff' : '#444', fontSize: 14, fontWeight: 800, cursor: name.trim() ? 'pointer' : 'not-allowed', letterSpacing: 1.5, boxShadow: name.trim() ? `0 6px 24px ${info.color}44` : 'none', transition: 'all 0.2s' }}>
                {name.trim() ? `⚔️  CRIAR  ${name.toUpperCase()}` : 'INSIRA UM NOME'}
              </button>
            </div>
          </div>
        )}
        </>)}
      </div>
    </div>
  );
}

// ── Multiplayer Panel ──────────────────────────────────────────────────────
function MultiplayerPanel({ engine, state }: { engine: GameEngine | null; state: GameState | null }) {
  const [open, setOpen] = useState(false);
  const defaultUrl = (() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev (localhost:5175) use local WS server; in prod use same host
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `${proto}//localhost:3001`;
    }
    return `${proto}//${host}`;
  })();
  const [serverUrl, setServerUrl] = useState(defaultUrl);
  const [chatMsg, setChatMsg] = useState('');
  const connected = state?.multiConnected ?? false;

  const connect = () => { engine?.connectMultiplayer(serverUrl, engine.playerStats.className); };
  const disconnect = () => { engine?.disconnectMultiplayer(); };
  const sendChat = () => { if (!chatMsg.trim()) return; engine?.sendChat(chatMsg.trim()); setChatMsg(''); };

  return (
    <div style={{ position: 'absolute', bottom: 80, right: 170, zIndex: 120 }}>
      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)} style={{ background: connected ? 'rgba(0,200,100,0.2)' : 'rgba(0,0,0,0.6)', border: `1px solid ${connected ? '#00cc66' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, color: connected ? '#00cc66' : '#aaa', padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
        {connected ? `🌐 ${(state?.onlinePlayers?.length ?? 0) + 1} online` : '🌐 MULTI'}
      </button>

      {open && (
        <div style={{ position: 'absolute', bottom: 36, left: 0, width: 280, background: 'rgba(5,0,15,0.95)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: 12, padding: 14, backdropFilter: 'blur(16px)' }}>
          <div style={{ color: '#ffd700', fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>MULTIPLAYER</div>

          {!connected ? (
            <>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 6 }}>URL do servidor WebSocket:</div>
              <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && connect()}
                style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#fff', fontSize: 11, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
              <button onClick={connect} style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #005a20, #00aa44)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Conectar</button>
              <div style={{ marginTop: 10, color: '#444', fontSize: 9, lineHeight: 1.5 }}>
                • Local: ws://localhost:3001<br/>
                • Internet: URL auto-preenchida ✓
              </div>
            </>
          ) : (
            <>
              <div style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                <div style={{ color: '#00cc66', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Jogadores Online</div>
                {(state?.onlinePlayers ?? []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12 }}>{CLASS_INFO[p.cls as keyof typeof CLASS_INFO]?.icon ?? '⚔️'}</span>
                    <span style={{ color: '#ccc', fontSize: 10 }}>{p.name}</span>
                    <span style={{ color: '#555', fontSize: 9, marginLeft: 'auto' }}>{p.zone}</span>
                  </div>
                ))}
                {(state?.onlinePlayers?.length ?? 0) === 0 && <div style={{ color: '#444', fontSize: 9 }}>Nenhum outro jogador</div>}
              </div>
              {/* Chat */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Chat..." maxLength={100}
                  style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 11, outline: 'none' }} />
                <button onClick={sendChat} style={{ padding: '6px 10px', background: 'rgba(0,150,60,0.3)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: 6, color: '#0f6', fontSize: 12, cursor: 'pointer' }}>▶</button>
              </div>
              <button onClick={disconnect} style={{ width: '100%', marginTop: 8, padding: '6px', background: 'rgba(200,50,50,0.15)', border: '1px solid rgba(200,50,50,0.3)', borderRadius: 7, color: '#e74c3c', fontSize: 11, cursor: 'pointer' }}>Desconectar</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Clan Panel ─────────────────────────────────────────────────────────────
function ClanPanel({ save, onSaveClan }: { save: import('./game/systems/SaveSystem').CharacterSave; onSaveClan: (clan: string) => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const clan = save.clan ?? '';
  const join = () => { const c = input.trim().slice(0, 16); if (c) { onSaveClan(c); setInput(''); setOpen(false); } };
  const leave = () => { onSaveClan(''); };
  return (
    <div style={{ position: 'absolute', bottom: 80, right: 10, zIndex: 120 }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: clan ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.6)', border: `1px solid ${clan ? '#ffd700' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, color: clan ? '#ffd700' : '#888', padding: '6px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
        {clan ? `⚔️ [${clan}]` : '⚔️ CLÃ'}
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: 36, right: 0, width: 220, background: 'rgba(5,0,15,0.95)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 12, padding: 14, backdropFilter: 'blur(16px)' }}>
          <div style={{ color: '#ffd700', fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>CLÃ / GUILD</div>
          {clan ? (
            <>
              <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 8 }}>[{clan}]</div>
              <div style={{ color: '#888', fontSize: 10, marginBottom: 10, textAlign: 'center' }}>Seu clã atual</div>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Novo nome de clã..." maxLength={16}
                style={{ width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
              <button onClick={join} disabled={!input.trim()} style={{ width: '100%', padding: '6px', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 6, color: '#ffd700', fontSize: 10, cursor: 'pointer', marginBottom: 4 }}>Mudar Clã</button>
              <button onClick={leave} style={{ width: '100%', padding: '6px', background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.3)', borderRadius: 6, color: '#e74c3c', fontSize: 10, cursor: 'pointer' }}>Sair do Clã</button>
            </>
          ) : (
            <>
              <div style={{ color: '#666', fontSize: 10, marginBottom: 8 }}>Digite o nome do clã para entrar ou criar:</div>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && join()} placeholder="Nome do clã..." maxLength={16}
                style={{ width: '100%', padding: '7px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#fff', fontSize: 11, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
              <button onClick={join} disabled={!input.trim()} style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #7a5c00, #ffd700)', border: 'none', borderRadius: 8, color: '#000', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Entrar / Criar Clã</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main 3D Game View ──────────────────────────────────────────────────────
interface Game3DProps { save: CharacterSave; onBack: () => void; auth: AuthInfo | null }

export function Game3DView({ save, onBack, auth }: Game3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentSave, setCurrentSave] = useState<CharacterSave>(save);
  const [screenFlash, setScreenFlash] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !minimapRef.current) return;

    const engine = new GameEngine(canvasRef.current, minimapRef.current, save.class, (state) => setGameState({ ...state }));

    // Load save data into engine (including name for multiplayer)
    engine.loadFromSave({ ...save, name: save.name });

    engine.onSave = (stats) => {
      const updated: CharacterSave = {
        ...save,
        level: stats.level,
        xp: stats.xp,
        xpNext: engine.playerStats.xpNext,
        gold: stats.gold,
        kills: stats.kills,
        hp: engine.playerStats.hp,
        maxHp: engine.playerStats.maxHp,
        mp: engine.playerStats.mp,
        maxMp: engine.playerStats.maxMp,
        atk: engine.playerStats.atk,
        def: engine.playerStats.def,
        bossKills: stats.bossKills,
        deaths: stats.deaths,
        lastPlayed: Date.now(),
        tutorialSeen: engine.tutorialSeen,
        zone: stats.zone,
        questProgress: engine.saveQuestProgress(),
        inventory: [...engine.inventory],
      };
      // Save to server if authenticated, always keep localStorage as backup
      if (auth) {
        apiSaveCharacter(auth.token, updated).catch(() => saveCharacter(updated));
      } else {
        saveCharacter(updated);
      }
      setCurrentSave(updated);
    };

    engine.onKill = (monsterName: string) => {
      console.log(`Killed: ${monsterName}`);
    };

    engine.onCameraShake = () => {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 120);
    };

    engine.init();
    engineRef.current = engine;

    // Auto-connect multiplayer
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = (host.includes('localhost') || host.includes('127.0.0.1'))
      ? 'ws://localhost:3001'
      : `${proto}//${host}`;
    setTimeout(() => engine.connectMultiplayer(wsUrl, save.name), 1500);

    setTimeout(() => setLoaded(true), 600);

    return () => { engine.dispose(); };
  }, [save.id]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Loading */}
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #050010, #0d0030)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{CLASS_INFO[save.class].icon}</div>
          <div style={{ color: '#ffd700', fontSize: 22, fontWeight: 900, letterSpacing: 4, marginBottom: 8 }}>AETHER ONLINE</div>
          <div style={{ color: '#888', fontSize: 12, letterSpacing: 2, marginBottom: 24 }}>Carregando {save.name}...</div>
          <div style={{ width: 220, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', background: `linear-gradient(90deg, ${CLASS_INFO[save.class].color}, #ffd700)`, borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Zone transition */}
      {gameState?.transitioning && (
        <div style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 50, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#ffd700', fontSize: 16, fontWeight: 700, letterSpacing: 4 }}>🌀 Viajando...</div>
        </div>
      )}

      {/* Damage screen flash */}
      {screenFlash && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,30,30,0.18)', pointerEvents: 'none', zIndex: 45, transition: 'opacity 0.12s' }} />
      )}

      {/* HUD */}
      {loaded && gameState && (
        <GameHUD state={gameState} engine={engineRef.current} save={currentSave} onBack={onBack} />
      )}

      {/* Multiplayer Panel */}
      {loaded && (
        <MultiplayerPanel engine={engineRef.current} state={gameState} />
      )}

      {/* Clan Panel */}
      {loaded && (
        <ClanPanel save={currentSave} onSaveClan={(clan) => {
          const updated = { ...currentSave, clan };
          saveCharacter(updated);
          setCurrentSave(updated);
        }} />
      )}

      {/* MINIMAP */}
      <div style={{ position: 'absolute', top: 44, right: 10, width: 150, height: 150 }}>
        <canvas ref={minimapRef} width={150} height={150} style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 0 16px rgba(0,0,0,0.8), 0 0 8px rgba(155,89,182,0.3)' }} />
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', color: '#ffd700', fontSize: 8, fontWeight: 700, letterSpacing: 1, textShadow: '0 0 8px #000' }}>MINIMAP</div>
      </div>

      <style>{`@keyframes pulse { from { opacity: 0.6 } to { opacity: 1 } }`}</style>
    </div>
  );
}
