import React, { useState } from 'react';
import { getCharacters } from '../game/systems/SaveSystem';
import { apiLogin, apiRegister, storeAuth, type AuthInfo } from '../api';

interface LoginScreenProps {
  onLogin: (auth: AuthInfo) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const localSaves = getCharacters();

  const handleLogin = async () => {
    if (!username.trim() || !password) return setError('Preencha todos os campos.');
    setLoading(true); setError('');
    try {
      const data = await apiLogin(username.trim(), password);
      const auth = { username: data.username, token: data.token };
      storeAuth(auth);
      onLogin(auth);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao entrar.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password) return setError('Preencha todos os campos.');
    if (password.length < 4) return setError('Senha precisa ter pelo menos 4 caracteres.');
    setLoading(true); setError('');
    try {
      const data = await apiRegister(username.trim(), password, localSaves);
      const auth = { username: data.username, token: data.token };
      storeAuth(auth);
      onLogin(auth);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao registrar.');
    } finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister();
  };

  const ready = !loading && username.trim() && password;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1a0040 0%, #08001a 40%, #020008 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      color: '#fff',
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Star field */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 120 }, (_, i) => {
          const size = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
          return <div key={i} style={{
            position: 'absolute', width: size, height: size,
            background: i % 8 === 0 ? '#aad4ff' : i % 6 === 0 ? '#ffddaa' : '#fff',
            borderRadius: '50%',
            left: `${(i * 137.508) % 100}%`, top: `${(i * 61.803) % 100}%`,
            opacity: 0.1 + (i % 7) * 0.08,
          }} />;
        })}
      </div>
      {/* Bottom glow */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(0deg, rgba(80,0,180,0.14) 0%, transparent 100%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: 10, background: 'linear-gradient(180deg, #ffffff 0%, #ffd700 40%, #ff8800 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>AETHER</div>
          <div style={{ fontSize: 13, fontWeight: 300, letterSpacing: 20, color: '#ffd70055', marginTop: -6, marginBottom: 10 }}>ONLINE</div>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)', margin: '0 20px' }} />
          <div style={{ fontSize: 9, color: '#4a3a6a', letterSpacing: 3, marginTop: 10, textTransform: 'uppercase' }}>Mundo Persistente · Multijogador</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.5) 100%)',
          border: '1px solid rgba(255,215,0,0.18)',
          borderRadius: 18,
          padding: '28px 30px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 80px rgba(120,0,255,0.1), 0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Card top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)' }} />

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 26, background: 'rgba(0,0,0,0.4)', borderRadius: 11, padding: 4 }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                flex: 1, padding: '10px 0',
                background: tab === t ? 'linear-gradient(135deg, #5a3000, #ffd700)' : 'transparent',
                border: 'none', borderRadius: 9,
                color: tab === t ? '#000' : '#555',
                fontSize: 11, fontWeight: 800, cursor: 'pointer',
                letterSpacing: 1.5, textTransform: 'uppercase',
                boxShadow: tab === t ? '0 2px 12px rgba(255,215,0,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                {t === 'login' ? '🔑 Entrar' : '✨ Registrar'}
              </button>
            ))}
          </div>

          {/* Username */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: '#4a3a5a', letterSpacing: 2.5, marginBottom: 7, textTransform: 'uppercase' }}>Nome de Usuário</div>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Seu usuário..."
              maxLength={50}
              autoFocus
              style={{
                width: '100%', padding: '12px 15px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${username.trim() ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 11, color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', transition: 'border 0.2s', letterSpacing: 0.3,
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, color: '#4a3a5a', letterSpacing: 2.5, marginBottom: 7, textTransform: 'uppercase' }}>Senha</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
              placeholder={tab === 'register' ? 'Mínimo 4 caracteres...' : 'Sua senha...'}
              style={{
                width: '100%', padding: '12px 15px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${password ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 11, color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', transition: 'border 0.2s',
              }}
            />
          </div>

          {/* Import notice */}
          {tab === 'register' && localSaves.length > 0 && (
            <div style={{ background: 'rgba(0,200,100,0.07)', border: '1px solid rgba(0,200,100,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#0c8' }}>
              ✅ {localSaves.length} personagen{localSaves.length !== 1 ? 's' : ''} local{localSaves.length !== 1 ? 'is serão importados' : ' será importado'} automaticamente.
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.28)', borderRadius: 9, padding: '9px 14px', marginBottom: 14, fontSize: 11, color: '#e74c3c' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={tab === 'login' ? handleLogin : handleRegister}
            disabled={!ready}
            style={{
              width: '100%', padding: 15,
              background: ready ? 'linear-gradient(135deg, #5a3000 0%, #ffd700 100%)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${ready ? 'rgba(255,215,0,0.4)' : 'transparent'}`,
              borderRadius: 12,
              color: ready ? '#000' : '#333',
              fontSize: 13, fontWeight: 800, cursor: loading ? 'wait' : ready ? 'pointer' : 'not-allowed',
              letterSpacing: 2, textTransform: 'uppercase',
              boxShadow: ready ? '0 6px 24px rgba(255,215,0,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Aguarde...' : tab === 'login' ? '⚔️  ENTRAR NO MUNDO' : '🌟  CRIAR CONTA E JOGAR'}
          </button>

          {tab === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: '#3a2a5a' }}>
              Não tem conta?{' '}
              <span onClick={() => { setTab('register'); setError(''); }} style={{ color: '#ffd70088', cursor: 'pointer' }}>
                Registre-se aqui
              </span>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 9, color: '#2a1a3a', letterSpacing: 2, textTransform: 'uppercase' }}>
          Aether Online · Salvar sempre · Jogar em qualquer lugar
        </div>
      </div>
    </div>
  );
}
