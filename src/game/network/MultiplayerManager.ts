import type { ClassName } from '../data/classes';
import type { ZoneId } from '../engine/GameEngine';

export interface RemotePlayer {
  id: string;
  name: string;
  cls: ClassName;
  level: number;
  x: number;
  z: number;
  dir: number;
  zone: ZoneId;
  hp: number;
  maxHp: number;
}

export type MultiplayerEvent =
  | { type: 'connected'; myId: string }
  | { type: 'disconnected' }
  | { type: 'player_join'; player: RemotePlayer }
  | { type: 'player_leave'; id: string; name: string }
  | { type: 'player_move'; id: string; x: number; z: number; dir: number; zone: ZoneId }
  | { type: 'player_zone'; id: string; zone: ZoneId }
  | { type: 'player_attack'; id: string; name: string; target: string }
  | { type: 'player_hp'; id: string; hp: number; maxHp: number }
  | { type: 'chat'; id: string; name: string; cls: string; msg: string };

export class MultiplayerManager {
  private ws: WebSocket | null = null;
  myId = '';
  connected = false;
  players: Map<string, RemotePlayer> = new Map();
  onEvent: ((e: MultiplayerEvent) => void) | null = null;
  private pingTimer = 0;

  connect(url: string, myInfo: { name: string; cls: ClassName; level: number; x: number; z: number; zone: ZoneId; hp: number; maxHp: number }) {
    if (this.ws) this.disconnect();

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.onEvent?.({ type: 'disconnected' });
      return;
    }

    this.ws.onopen = () => {
      this.connected = true;
      this.ws!.send(JSON.stringify({ type: 'join', ...myInfo }));
    };

    this.ws.onmessage = (e: MessageEvent) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(e.data as string); } catch { return; }

      switch (msg.type) {
        case 'init': {
          this.myId = msg.myId as string;
          const plist = msg.players as RemotePlayer[];
          for (const p of plist) this.players.set(p.id, p);
          this.onEvent?.({ type: 'connected', myId: this.myId });
          break;
        }
        case 'player_join': {
          const p = msg.player as RemotePlayer;
          this.players.set(p.id, p);
          this.onEvent?.({ type: 'player_join', player: p });
          break;
        }
        case 'player_leave': {
          this.players.delete(msg.id as string);
          this.onEvent?.({ type: 'player_leave', id: msg.id as string, name: msg.name as string });
          break;
        }
        case 'player_move': {
          const p = this.players.get(msg.id as string);
          if (p) { p.x = msg.x as number; p.z = msg.z as number; p.dir = msg.dir as number; if (msg.zone) p.zone = msg.zone as ZoneId; }
          this.onEvent?.({ type: 'player_move', id: msg.id as string, x: msg.x as number, z: msg.z as number, dir: msg.dir as number, zone: (msg.zone as ZoneId) || 'city' });
          break;
        }
        case 'player_zone': {
          const p = this.players.get(msg.id as string);
          if (p) p.zone = msg.zone as ZoneId;
          this.onEvent?.({ type: 'player_zone', id: msg.id as string, zone: msg.zone as ZoneId });
          break;
        }
        case 'player_attack':
          this.onEvent?.({ type: 'player_attack', id: msg.id as string, name: msg.name as string, target: msg.target as string });
          break;
        case 'player_hp': {
          const p = this.players.get(msg.id as string);
          if (p) { p.hp = msg.hp as number; p.maxHp = msg.maxHp as number; }
          this.onEvent?.({ type: 'player_hp', id: msg.id as string, hp: msg.hp as number, maxHp: msg.maxHp as number });
          break;
        }
        case 'chat':
          this.onEvent?.({ type: 'chat', id: msg.id as string, name: msg.name as string, cls: msg.cls as string, msg: msg.msg as string });
          break;
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.players.clear();
      this.myId = '';
      this.onEvent?.({ type: 'disconnected' });
    };

    this.ws.onerror = () => {
      this.connected = false;
    };
  }

  sendMove(x: number, z: number, dir: number, zone: ZoneId) {
    this.send({ type: 'move', x, z, dir, zone });
  }

  sendHp(hp: number, maxHp: number) {
    this.send({ type: 'hp', hp, maxHp });
  }

  sendZone(zone: ZoneId) {
    this.send({ type: 'zone', zone });
  }

  sendAttack(target: string) {
    this.send({ type: 'attack', target });
  }

  sendChat(msg: string) {
    this.send({ type: 'chat', msg });
  }

  tick(dt: number) {
    this.pingTimer += dt;
    if (this.connected && this.pingTimer > 25) {
      this.pingTimer = 0;
      this.send({ type: 'ping' });
    }
  }

  private send(data: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.players.clear();
    this.myId = '';
  }
}
