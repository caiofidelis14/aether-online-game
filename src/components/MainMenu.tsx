import React, { useEffect, useRef, useState } from 'react';
import type { ClassName } from '../game/data/classes';

interface Props { onPlay: () => void; onLogout?: () => void; username?: string }

const CLASS_SHOWCASE = [
  { cls: 'warrior' as ClassName, icon: '⚔️', color: '#e74c3c', name: 'Warrior', x: 15, y: 30 },
  { cls: 'mage' as ClassName, icon: '🔮', color: '#9b59b6', name: 'Mage', x: 82, y: 18 },
  { cls: 'archer' as ClassName, icon: '🏹', color: '#27ae60', name: 'Archer', x: 8, y: 65 },
  { cls: 'priest' as ClassName, icon: '✝️', color: '#f1c40f', name: 'Priest', x: 88, y: 72 },
  { cls: 'ninja' as ClassName, icon: '🌀', color: '#00d2ff', name: 'Ninja', x: 50, y: 12 },
  { cls: 'paladin' as ClassName, icon: '🛡️', color: '#e67e22', name: 'Paladin', x: 22, y: 85 },
  { cls: 'assassin' as ClassName, icon: '🗡️', color: '#e91e8c', name: 'Assassin', x: 75, y: 88 },
];

const FEATURES = [
  { icon: '🌍', text: '6 Biomas' },
  { icon: '👹', text: '50+ Monstros' },
  { icon: '⚔️', text: '7 Classes' },
  { icon: '🎒', text: '300+ Itens' },
  { icon: '🔮', text: 'Skills Únicas' },
  { icon: '🏰', text: 'Cidade Central' },
];

export default function MainMenu({ onPlay, onLogout, username }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 100);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0; let t = 0;
    const W = canvas.width = window.innerWidth; const H = canvas.height = window.innerHeight;

    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2, speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2, brightness: Math.random(),
    }));
    // Nebula orbs
    const orbs = CLASS_SHOWCASE.map((c, i) => ({
      x: (c.x / 100) * W, y: (c.y / 100) * H,
      r: 60 + Math.random() * 40, color: c.color,
      phase: (i / CLASS_SHOWCASE.length) * Math.PI * 2, speed: 0.3 + Math.random() * 0.3,
    }));
    // Meteors
    const meteors: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];
    let meteorTimer = 0;

    function addMeteor() {
      meteors.push({ x: Math.random() * W, y: -10, vx: 2 + Math.random() * 3, vy: 3 + Math.random() * 4, life: 1, maxLife: 1 });
    }

    function draw() {
      t += 0.008; meteorTimer += 0.016;
      if (meteorTimer > 3) { addMeteor(); meteorTimer = 0; }

      // Deep space bg
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#04001a');
      grad.addColorStop(0.3, '#080030');
      grad.addColorStop(0.7, '#0d0040');
      grad.addColorStop(1, '#02001a');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      // Nebula / orbs
      for (const orb of orbs) {
        const ox = orb.x + Math.sin(t * orb.speed + orb.phase) * 30;
        const oy = orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 20;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        const hex = orb.color; const opacity = 0.12 + Math.sin(t + orb.phase) * 0.04;
        g.addColorStop(0, hex + Math.round(opacity * 255).toString(16).padStart(2, '0'));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, orb.r, 0, Math.PI * 2); ctx.fill();
      }

      // Stars
      for (const s of stars) {
        const bright = s.brightness * (0.7 + 0.3 * Math.sin(t * 2 + s.twinkle));
        ctx.fillStyle = `rgba(255,255,255,${bright})`; ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }

      // Meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]; m.x += m.vx; m.y += m.vy; m.life -= 0.02;
        if (m.life <= 0 || m.y > H) { meteors.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(255,255,200,${m.life * 0.8})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8); ctx.stroke();
      }

      // Ground glow (horizon)
      const hGrad = ctx.createLinearGradient(0, H * 0.7, 0, H);
      hGrad.addColorStop(0, 'transparent');
      hGrad.addColorStop(1, '#1a008844');
      ctx.fillStyle = hGrad; ctx.fillRect(0, H * 0.7, W, H * 0.3);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: "'Segoe UI', 'Arial', sans-serif" }}>
      {/* Canvas bg */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Floating class icons */}
      {CLASS_SHOWCASE.map((c, i) => (
        <div key={c.cls} style={{
          position: 'absolute', left: `${c.x}%`, top: `${c.y}%`,
          transform: 'translate(-50%, -50%)',
          animation: `float-${i % 3} ${3 + i * 0.4}s ease-in-out infinite`,
          opacity: ready ? 0.85 : 0, transition: `opacity 1s ${i * 0.15}s`,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${c.color}44, ${c.color}11)`,
            border: `1.5px solid ${c.color}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, backdropFilter: 'blur(4px)',
            boxShadow: `0 0 20px ${c.color}44, inset 0 0 10px ${c.color}22`,
          }}>{c.icon}</div>
          <div style={{ textAlign: 'center', fontSize: 9, color: c.color, marginTop: 4, letterSpacing: 1, fontWeight: 600 }}>{c.name}</div>
        </div>
      ))}

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 0,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40, opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(-30px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
          {/* Game icon */}
          <div style={{ fontSize: 64, marginBottom: 12, filter: 'drop-shadow(0 0 30px #ffd70088)', animation: 'logo-float 3s ease-in-out infinite' }}>⚔️</div>
          <div style={{
            fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 900, letterSpacing: 8,
            background: 'linear-gradient(180deg, #ffffff 0%, #ffd700 40%, #ff8800 70%, #ff4400 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px #ffd70066)',
            textShadow: 'none', lineHeight: 1,
          }}>AETHER</div>
          <div style={{
            fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: 300, letterSpacing: 16,
            color: '#88aaff', marginTop: 4, marginBottom: 8,
          }}>O N L I N E</div>
          <div style={{ width: 120, height: 1, background: 'linear-gradient(90deg, transparent, #ffd700, transparent)', margin: '0 auto', marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: '#6677aa', letterSpacing: 4, fontWeight: 300 }}>O MUNDO DOS IMORTAIS</div>
        </div>

        {/* Features row */}
        <div style={{
          display: 'flex', gap: 20, marginBottom: 44, flexWrap: 'wrap', justifyContent: 'center',
          opacity: ready ? 1 : 0, transition: 'opacity 1.2s 0.3s',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aabbcc',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '5px 12px', backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 14 }}>{f.icon}</span> {f.text}
            </div>
          ))}
        </div>

        {/* Play button */}
        <button
          onClick={onPlay}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            padding: '18px 64px', fontSize: 20, fontWeight: 800, letterSpacing: 4,
            color: '#fff', border: 'none', borderRadius: 60, cursor: 'pointer',
            background: hovered
              ? 'linear-gradient(135deg, #ff8800, #ffd700, #ff4400)'
              : 'linear-gradient(135deg, #9b30e0, #5500cc, #3300aa)',
            boxShadow: hovered
              ? '0 0 60px #ffd70088, 0 0 120px #ff880044, 0 8px 32px rgba(0,0,0,0.5)'
              : '0 0 40px #9b30e055, 0 8px 32px rgba(0,0,0,0.5)',
            transform: hovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            opacity: ready ? 1 : 0,
          }}
        >
          {hovered ? '🌟 ENTRAR NO MUNDO' : '⚔️ JOGAR AGORA'}
        </button>

        {/* Sub text */}
        <div style={{ marginTop: 20, fontSize: 11, color: '#445566', letterSpacing: 2, opacity: ready ? 1 : 0, transition: 'opacity 1.5s 0.5s' }}>
          Pressione ENTER ou clique para começar
        </div>

        {/* User info + logout */}
        {username && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, opacity: ready ? 1 : 0, transition: 'opacity 1s 0.8s' }}>
            <span style={{ fontSize: 11, color: '#ffd70088', letterSpacing: 1 }}>👤 {username}</span>
            {onLogout && (
              <button onClick={onLogout} style={{
                padding: '4px 12px', fontSize: 10, background: 'rgba(200,50,50,0.15)',
                border: '1px solid rgba(200,50,50,0.3)', borderRadius: 6,
                color: '#e74c3c', cursor: 'pointer', letterSpacing: 1,
              }}>
                Sair
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-0 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-12px)} }
        @keyframes float-1 { 0%,100%{transform:translate(-50%,-50%) translateY(-6px)} 50%{transform:translate(-50%,-50%) translateY(8px)} }
        @keyframes float-2 { 0%,100%{transform:translate(-50%,-50%) translateY(4px)} 50%{transform:translate(-50%,-50%) translateY(-10px)} }
        @keyframes logo-float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
      `}</style>
    </div>
  );
}
