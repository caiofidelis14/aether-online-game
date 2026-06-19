import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, createHmac, randomBytes } from 'crypto';
import pg from 'pg';

const __dir = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dir, '../dist');

// ── Persistent data dir (fallback file storage) ───────────────────────────────
const DATA_DIR = existsSync('/data') ? '/data' : resolve(__dir, '../data');
try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}
const ACCOUNTS_FILE = resolve(DATA_DIR, 'accounts.json');

// ── PostgreSQL pool (optional — set DATABASE_URL env var) ─────────────────────
const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 5 })
  : null;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4', '.webp': 'image/webp', '.gz': 'application/gzip',
};

// ── Admin / VIP config ────────────────────────────────────────────────────────
const VIP = {
  'nOx':         { gold: 99999, role: 'admin' },
  'joaozinho':   { gold: 99999, role: 'gm'    },
  'meupauteama': { gold: 99999, role: 'admin' },
};
const ADMINS = new Set(['nOx', 'joaozinho', 'meupauteama']);
const GMS    = new Set(['joaozinho']);

// ── Auth helpers ──────────────────────────────────────────────────────────────
const PASS_SECRET = process.env.PASS_SECRET || 'aether_online_2024_secret_salt';
const JWT_SECRET  = process.env.JWT_SECRET  || 'aether_jwt_2024_' + PASS_SECRET;
const TOKEN_TTL   = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashPassword(password, salt) {
  return createHash('sha256').update(salt + password + PASS_SECRET).digest('hex');
}

// Stateless HMAC tokens — survive server restarts / redeploys
function createToken(accountKey) {
  const payload = Buffer.from(JSON.stringify({ sub: accountKey, iat: Date.now() })).toString('base64url');
  const sig = createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig     = token.slice(dot + 1);
  const expected = createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const { sub, iat } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!sub || Date.now() - iat > TOKEN_TTL) return null;
    return sub;
  } catch { return null; }
}

function getAuthUser(req) {
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  return verifyToken(auth);
}

// Backward-compat alias (used in login/register)
const createSession = createToken;

// ── Account storage (in-memory cache + optional PostgreSQL) ──────────────────
let _accountsCache = null;

async function initStorage() {
  if (pool) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS accounts (key TEXT PRIMARY KEY, data JSONB NOT NULL)`);
      const { rows } = await pool.query('SELECT key, data FROM accounts');
      _accountsCache = Object.fromEntries(rows.map(r => [r.key, r.data]));
      console.log(`[DB] PostgreSQL: loaded ${rows.length} accounts`);
    } catch (e) {
      console.error('[DB] PostgreSQL init failed, falling back to file:', e.message);
      _accountsCache = null;
    }
  }
  if (_accountsCache === null) {
    try { _accountsCache = JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')); }
    catch { _accountsCache = {}; }
    console.log(`[DB] File storage: ${Object.keys(_accountsCache).length} accounts`);
  }
}

function loadAccounts() {
  return _accountsCache || {};
}

function saveAccounts(accounts) {
  _accountsCache = accounts;
  if (pool) {
    pool.connect().then(async client => {
      try {
        await client.query('BEGIN');
        for (const [key, data] of Object.entries(accounts)) {
          await client.query(
            'INSERT INTO accounts (key,data) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET data=$2',
            [key, JSON.stringify(data)]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('[DB] Save error:', e.message);
      } finally { client.release(); }
    }).catch(e => console.error('[DB] Connect error:', e.message));
  } else {
    writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts));
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
async function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString(); if (data.length > 200000) data = data.slice(0, 200000); });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

function jsonRes(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify(data));
}

// ── Tunnel URL tracker ────────────────────────────────────────────────────────
function getTunnelUrl() {
  try {
    const log = readFileSync('/tmp/aether-tunnel.log', 'utf8');
    const matches = log.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g);
    if (matches) return matches[matches.length - 1];
  } catch {}
  return null;
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const httpServer = createServer(async (req, res) => {
  const path = (req.url || '/').split('?')[0];

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // ── POST /api/register ───────────────────────────────────────────────────
  if (req.method === 'POST' && path === '/api/register') {
    const body = await readBody(req);
    const username = String(body.username || '').trim().slice(0, 50);
    const password = String(body.password || '');
    const importSaves = Array.isArray(body.importSaves) ? body.importSaves.slice(0, 10) : [];

    if (!username || !password) return jsonRes(res, 400, { error: 'Nome de usuário e senha obrigatórios.' });
    if (password.length < 4) return jsonRes(res, 400, { error: 'Senha deve ter pelo menos 4 caracteres.' });

    const accounts = loadAccounts();
    const key = username.toLowerCase();
    if (accounts[key]) return jsonRes(res, 409, { error: 'Usuário já existe. Faça login.' });

    const salt = randomBytes(16).toString('hex');
    accounts[key] = {
      username,
      passwordHash: hashPassword(password, salt),
      salt,
      characters: importSaves,
      createdAt: Date.now(),
    };
    saveAccounts(accounts);

    const token = createSession(key);
    console.log(`[AUTH] Registered: ${username} (${importSaves.length} saves imported)`);
    return jsonRes(res, 201, { username, token });
  }

  // ── POST /api/login ──────────────────────────────────────────────────────
  if (req.method === 'POST' && path === '/api/login') {
    const body = await readBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) return jsonRes(res, 400, { error: 'Preencha todos os campos.' });

    const accounts = loadAccounts();
    const key = username.toLowerCase();
    const account = accounts[key];
    if (!account) return jsonRes(res, 401, { error: 'Usuário não encontrado. Registre-se primeiro.' });

    if (hashPassword(password, account.salt) !== account.passwordHash)
      return jsonRes(res, 401, { error: 'Senha incorreta.' });

    const token = createSession(key);
    console.log(`[AUTH] Login: ${account.username}`);
    return jsonRes(res, 200, { username: account.username, token });
  }

  // ── GET /api/me ──────────────────────────────────────────────────────────
  if (req.method === 'GET' && path === '/api/me') {
    const user = getAuthUser(req);
    if (!user) return jsonRes(res, 401, { error: 'Não autenticado.' });
    const accounts = loadAccounts();
    const account = accounts[user];
    if (!account) return jsonRes(res, 401, { error: 'Conta não encontrada.' });
    return jsonRes(res, 200, { username: account.username });
  }

  // ── GET /api/characters ──────────────────────────────────────────────────
  if (req.method === 'GET' && path === '/api/characters') {
    const user = getAuthUser(req);
    if (!user) return jsonRes(res, 401, { error: 'Não autenticado.' });
    const accounts = loadAccounts();
    const account = accounts[user];
    if (!account) return jsonRes(res, 401, { error: 'Conta não encontrada.' });
    return jsonRes(res, 200, { characters: account.characters || [] });
  }

  // ── POST /api/characters/save ────────────────────────────────────────────
  if (req.method === 'POST' && path === '/api/characters/save') {
    const user = getAuthUser(req);
    if (!user) return jsonRes(res, 401, { error: 'Não autenticado.' });
    const body = await readBody(req);
    const char = body.character;
    if (!char || !char.id) return jsonRes(res, 400, { error: 'Personagem inválido.' });

    const accounts = loadAccounts();
    const account = accounts[user];
    if (!account) return jsonRes(res, 401, { error: 'Conta não encontrada.' });

    if (!account.characters) account.characters = [];
    const idx = account.characters.findIndex(c => c.id === char.id);
    if (idx >= 0) account.characters[idx] = char;
    else if (account.characters.length < 10) account.characters.push(char);
    else return jsonRes(res, 400, { error: 'Limite de personagens atingido (10).' });

    saveAccounts(accounts);
    return jsonRes(res, 200, { ok: true });
  }

  // ── DELETE /api/characters/:id ───────────────────────────────────────────
  if (req.method === 'DELETE' && path.startsWith('/api/characters/')) {
    const user = getAuthUser(req);
    if (!user) return jsonRes(res, 401, { error: 'Não autenticado.' });
    const charId = path.slice('/api/characters/'.length);
    const accounts = loadAccounts();
    const account = accounts[user];
    if (!account) return jsonRes(res, 401, { error: 'Conta não encontrada.' });

    account.characters = (account.characters || []).filter(c => c.id !== charId);
    saveAccounts(accounts);
    return jsonRes(res, 200, { ok: true });
  }

  // ── GET /api/url ─────────────────────────────────────────────────────────
  if (path === '/api/url' || path === '/url') {
    const url = getTunnelUrl();
    res.writeHead(200, { 'Content-Type': 'text/html', ...CORS });
    res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Aether Online</title>
<style>body{background:#111;color:#fff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px}
a{color:#4af;font-size:1.4em}button{padding:8px 24px;font-size:1em;cursor:pointer}</style></head>
<body><h2>🎮 Aether Online</h2>
${url ? `<p>URL atual:</p><a href="${url}" target="_blank">${url}</a>
<br><button onclick="navigator.clipboard.writeText('${url}').then(()=>alert('Copiado!'))">📋 Copiar</button>`
: '<p>Tunnel offline — reinicia o servidor</p>'}
</body></html>`);
    return;
  }

  // ── GET /api/status ──────────────────────────────────────────────────────
  if (path === '/api/status') {
    const url = getTunnelUrl();
    res.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
    res.end(JSON.stringify({ players: players.size, server: 'Aether Online', version: '1.0', tunnelUrl: url }));
    return;
  }

  // ── Static files ─────────────────────────────────────────────────────────
  let filePath = resolve(DIST, '.' + path);
  if (!existsSync(filePath) || filePath === DIST) filePath = resolve(DIST, 'index.html');
  try {
    const ext = extname(filePath);
    const content = readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
      ...CORS,
      'ngrok-skip-browser-warning': 'true',
    });
    res.end(content);
  } catch {
    res.writeHead(200, { 'Content-Type': 'text/html', ...CORS, 'ngrok-skip-browser-warning': 'true' });
    res.end(readFileSync(resolve(DIST, 'index.html')));
  }
});

// ── Zone monster HP tracking for shared combat ────────────────────────────────
const zoneMonsters = new Map(); // zoneId -> Map<monsterId, monster state>

function getMonsterState(zoneId, monsterId, maxHp = 100) {
  if (!zoneMonsters.has(zoneId)) zoneMonsters.set(zoneId, new Map());
  const zone = zoneMonsters.get(zoneId);
  if (!zone.has(monsterId)) {
    zone.set(monsterId, { hp: maxHp, maxHp, dead: false, killers: new Set(), respawnAt: 0 });
  }
  return zone.get(monsterId);
}

function broadcastToZone(zoneId, msg, excludeWs = null) {
  const json = JSON.stringify(msg);
  for (const [, p] of players) {
    if (p.ws !== excludeWs && p.ws.readyState === WebSocket.OPEN && p.zone === zoneId) {
      p.ws.send(json);
    }
  }
}

// ── WebSocket Server ──────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer, path: undefined });

const players = new Map();
let nextId = 1;

function broadcast(data, exclude = null) {
  const str = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  }
}

function broadcastAll(data) {
  broadcast(data, null);
}

wss.on('connection', (ws, req) => {
  const id = String(nextId++);
  ws.playerId = id;

  console.log(`[+] Client connected id=${id} ip=${req.socket.remoteAddress}`);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {
      case 'join': {
        const player = {
          id,
          ws,
          name: String(msg.name || 'Herói').slice(0, 24),
          cls: msg.cls || 'warrior',
          level: msg.level || 1,
          x: msg.x || 0,
          z: msg.z || 0,
          dir: msg.dir || 0,
          zone: msg.zone || 'city',
          hp: msg.hp || 200,
          maxHp: msg.maxHp || 200,
        };
        players.set(id, player);

        const vip = VIP[player.name];
        const role = vip?.role ?? (ADMINS.has(player.name) ? 'admin' : GMS.has(player.name) ? 'gm' : null);
        if (vip) {
          ws.send(JSON.stringify({ type: 'gm_give', gold: vip.gold, role, msg: `👑 Bem-vindo ${role.toUpperCase()} ${player.name}! +${vip.gold} Gold!` }));
          console.log(`  ★ VIP join: ${player.name} (${role}) +${vip.gold}G`);
        }

        ws.send(JSON.stringify({
          type: 'init',
          myId: id,
          players: [...players.values()].filter(p => p.id !== id).map(({ ws: _ws, ...rest }) => rest),
          role: role ?? 'player',
        }));

        broadcast({ type: 'player_join', player: { ...player, ws: undefined, role: role ?? 'player' } }, ws);
        console.log(`  → ${player.name} (${player.cls}) joined. Total: ${players.size}`);
        break;
      }

      case 'move': {
        const p = players.get(id);
        if (!p) break;
        p.x = msg.x ?? p.x;
        p.z = msg.z ?? p.z;
        p.dir = msg.dir ?? p.dir;
        if (msg.zone) p.zone = msg.zone;
        broadcast({ type: 'player_move', id, x: p.x, z: p.z, dir: p.dir, zone: p.zone }, ws);
        break;
      }

      case 'attack': {
        const p = players.get(id);
        if (!p) break;
        broadcast({ type: 'player_attack', id, name: p.name, target: msg.target || '' }, ws);
        break;
      }

      case 'hp': {
        const p = players.get(id);
        if (!p) break;
        p.hp = msg.hp; p.maxHp = msg.maxHp;
        broadcast({ type: 'player_hp', id, hp: p.hp, maxHp: p.maxHp }, ws);
        break;
      }

      case 'zone': {
        const p = players.get(id);
        if (!p) break;
        p.zone = msg.zone;
        broadcast({ type: 'player_zone', id, zone: p.zone }, ws);
        break;
      }

      case 'skin': {
        const p = players.get(id);
        if (!p) break;
        p.skin = msg.skin;
        broadcast({ type: 'player_skin', id, skin: msg.skin }, ws);
        break;
      }

      case 'gm_cmd': {
        const p = players.get(id);
        if (!p || !ADMINS.has(p.name)) break;
        const cmd = String(msg.cmd || '');
        if (cmd === 'give_all_gold') {
          const amount = Math.min(Number(msg.amount) || 10000, 999999);
          broadcastAll({ type: 'gm_give', gold: amount, msg: `💰 GM ${p.name} deu ${amount}G para todos!` });
          console.log(`  [GM] ${p.name} gave ${amount}G to all`);
        } else if (cmd === 'give_gold' && msg.target) {
          for (const [tid, tw] of [...wss.clients].map(c => [c.playerId, c])) {
            const tp = players.get(tid);
            if (tp && tp.name === msg.target) {
              tw.send(JSON.stringify({ type: 'gm_give', gold: Number(msg.amount) || 10000, msg: `💰 GM ${p.name} deu ${msg.amount}G para você!` }));
            }
          }
        }
        break;
      }

      case 'chat': {
        const p = players.get(id);
        if (!p) break;
        const rawText = String(msg.msg || '').slice(0, 200);
        if (rawText.startsWith('/') && ADMINS.has(p.name)) {
          const parts = rawText.slice(1).split(' ');
          if (parts[0] === 'give') {
            const amount = Math.min(Number(parts[parts.length - 1]) || 10000, 999999);
            broadcastAll({ type: 'gm_give', gold: amount, msg: `💰 GM ${p.name}: +${amount}G para todos!` });
          }
          break;
        }
        const text = rawText;
        if (!text.trim()) break;
        broadcastAll({ type: 'chat', id, name: p.name, cls: p.cls, msg: text });
        console.log(`  [chat] ${p.name}: ${text}`);
        break;
      }

      case 'monster_hit': {
        const { zone, monsterId, damage = 10, maxHp = 100 } = msg;
        if (!zone || monsterId === undefined) break;
        const m = getMonsterState(zone, monsterId, maxHp);
        if (m.dead) {
          ws.send(JSON.stringify({ type: 'monster_hp', monsterId, hp: 0, dead: true }));
          break;
        }
        m.hp = Math.max(0, m.hp - damage);
        const p = players.get(id);
        if (p?.name) m.killers.add(p.name);

        // Broadcast HP update to all others in zone
        broadcastToZone(zone, { type: 'monster_hp', monsterId, hp: m.hp, maxHp: m.maxHp }, ws);

        if (m.hp <= 0 && !m.dead) {
          m.dead = true;
          m.respawnAt = Date.now() + 30000;
          const xp = Math.max(5, Math.floor(maxHp * 0.8));
          const splitXp = Math.max(1, Math.floor(xp / Math.max(1, m.killers.size)));
          broadcastToZone(zone, { type: 'monster_dead', monsterId, xp: splitXp }, null);
        }
        break;
      }

      case 'clan_chat': {
        const p = players.get(id);
        if (!p) break;
        const accounts = loadAccounts();
        const accountKey = p.name.toLowerCase();
        const account = accounts[accountKey];
        if (!account?.clan) break;
        const clanName = account.clan.name;
        const clanMsg = JSON.stringify({ type: 'clan_chat', from: account.username || p.name, text: (msg.text || '').slice(0, 200), ts: Date.now() });
        for (const [, pl] of players) {
          if (pl.ws.readyState !== WebSocket.OPEN) continue;
          const pAcc = accounts[pl.name.toLowerCase()];
          if (pAcc?.clan?.name === clanName) pl.ws.send(clanMsg);
        }
        break;
      }

      case 'clan_invite': {
        const p = players.get(id);
        if (!p) break;
        const accounts = loadAccounts();
        const inviter = accounts[p.name.toLowerCase()];
        if (!inviter?.clan) { ws.send(JSON.stringify({ type: 'clan_error', msg: 'Você não tem um clã.' })); break; }
        const targetName = msg.target;
        const targetKey = targetName?.toLowerCase();
        const targetAcc = targetKey ? accounts[targetKey] : null;
        if (!targetAcc) { ws.send(JSON.stringify({ type: 'clan_error', msg: 'Jogador não encontrado.' })); break; }
        if (!inviter.clan.members) inviter.clan.members = [];
        if (!inviter.clan.members.includes(targetAcc.username || targetName)) {
          inviter.clan.members.push(targetAcc.username || targetName);
        }
        targetAcc.clan = { name: inviter.clan.name, leader: inviter.clan.leader, members: [...inviter.clan.members] };
        saveAccounts(accounts);
        ws.send(JSON.stringify({ type: 'clan_update', clan: inviter.clan }));
        // Notify target if online
        for (const [, pl] of players) {
          if (pl.ws.readyState === WebSocket.OPEN && pl.name.toLowerCase() === targetKey) {
            pl.ws.send(JSON.stringify({ type: 'clan_invited', clan: targetAcc.clan }));
          }
        }
        break;
      }

      case 'clan_kick': {
        const p = players.get(id);
        if (!p) break;
        const accounts = loadAccounts();
        const kicker = accounts[p.name.toLowerCase()];
        if (!kicker?.clan || kicker.clan.leader !== (kicker.username || p.name)) {
          ws.send(JSON.stringify({ type: 'clan_error', msg: 'Sem permissão.' })); break;
        }
        const target = msg.target;
        kicker.clan.members = (kicker.clan.members || []).filter(m => m !== target);
        for (const [, acc] of Object.entries(accounts)) {
          if ((acc.username === target || acc.username === target) && acc.clan?.name === kicker.clan.name) {
            acc.clan = null; break;
          }
        }
        saveAccounts(accounts);
        ws.send(JSON.stringify({ type: 'clan_update', clan: kicker.clan }));
        break;
      }

      case 'clan_leave': {
        const p = players.get(id);
        if (!p) break;
        const accounts = loadAccounts();
        const acc = accounts[p.name.toLowerCase()];
        if (!acc?.clan) break;
        const clanName = acc.clan.name;
        const isLeader = acc.clan.leader === (acc.username || p.name);
        if (isLeader) {
          for (const [, a] of Object.entries(accounts)) { if (a.clan?.name === clanName) a.clan = null; }
        } else {
          for (const [, a] of Object.entries(accounts)) {
            if ((a.username || '') !== (acc.username || p.name) && a.clan?.name === clanName && a.clan.members) {
              a.clan.members = a.clan.members.filter(m => m !== (acc.username || p.name));
            }
          }
          acc.clan = null;
        }
        saveAccounts(accounts);
        ws.send(JSON.stringify({ type: 'clan_update', clan: null }));
        break;
      }

      case 'clan_members_request': {
        const p = players.get(id);
        if (!p) break;
        const accounts = loadAccounts();
        const acc = accounts[p.name.toLowerCase()];
        if (!acc?.clan) break;
        const members = acc.clan.members || [];
        const onlineSet = new Set();
        for (const [, pl] of players) {
          if (pl.ws.readyState === WebSocket.OPEN && members.includes(pl.name)) {
            onlineSet.add(pl.name);
          }
        }
        ws.send(JSON.stringify({
          type: 'clan_members',
          members: members.map(n => ({ name: n, online: onlineSet.has(n) })),
          clanName: acc.clan.name,
          leader: acc.clan.leader,
        }));
        break;
      }

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  });

  ws.on('close', () => {
    const p = players.get(id);
    players.delete(id);
    broadcast({ type: 'player_leave', id, name: p?.name || '?' });
    console.log(`[-] ${p?.name || id} disconnected. Total: ${players.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[!] WS error id=${id}:`, err.message);
  });
});

// ── Monster respawn ticker ────────────────────────────────────────────────────
setInterval(() => {
  for (const [zoneId, zone] of zoneMonsters) {
    for (const [monsterId, m] of zone) {
      if (m.dead && m.respawnAt && Date.now() > m.respawnAt) {
        m.hp = m.maxHp; m.dead = false; m.killers.clear(); m.respawnAt = 0;
        broadcastToZone(zoneId, { type: 'monster_respawn', monsterId }, null);
      }
    }
  }
}, 5000);

initStorage().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║    Aether Online Multiplayer Server    ║`);
    console.log(`╠════════════════════════════════════════╣`);
    console.log(`║  HTTP  : http://localhost:${PORT}          ║`);
    console.log(`║  Store : ${(pool ? 'PostgreSQL' : DATA_DIR).slice(0, 30).padEnd(30)} ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
  });
});
