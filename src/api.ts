import type { CharacterSave } from './game/systems/SaveSystem';

function getApiBase(): string {
  const host = window.location.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:3001';
  }
  return window.location.origin;
}

const AUTH_KEY = 'aether_auth';

export interface AuthInfo {
  username: string;
  token: string;
}

export function getStoredAuth(): AuthInfo | null {
  try {
    const s = localStorage.getItem(AUTH_KEY);
    if (!s) return null;
    return JSON.parse(s);
  } catch { return null; }
}

export function storeAuth(info: AuthInfo): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(info));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

function authHeaders(token: string): Record<string, string> {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

export async function apiRegister(
  username: string,
  password: string,
  importSaves: CharacterSave[] = []
): Promise<{ username: string; token: string }> {
  const res = await fetch(`${getApiBase()}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, importSaves }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao registrar.');
  return data;
}

export async function apiLogin(
  username: string,
  password: string
): Promise<{ username: string; token: string }> {
  const res = await fetch(`${getApiBase()}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao entrar.');
  return data;
}

export async function apiLoadCharacters(token: string): Promise<CharacterSave[]> {
  const res = await fetch(`${getApiBase()}/api/characters`, {
    headers: authHeaders(token),
  });
  if (res.status === 401) {
    clearAuth();
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) throw new Error('Erro ao carregar personagens.');
  const data = await res.json();
  return data.characters || [];
}

export async function apiSaveCharacter(token: string, character: CharacterSave): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/characters/save`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ character }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao salvar personagem.');
  }
}

export async function apiDeleteCharacter(token: string, charId: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/characters/${charId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Erro ao deletar personagem.');
}
