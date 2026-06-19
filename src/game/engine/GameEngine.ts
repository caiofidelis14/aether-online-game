import * as THREE from 'three';
import type { ClassName } from '../data/classes';
import { rollDrops, type LootItem, RARITY_COLORS } from '../data/loot';
import { QUESTS, QUEST_ORDER, type QuestProgress } from '../data/quests';

// ── Types ──────────────────────────────────────────────────────────────────
export type ZoneId = 'city' | 'forest' | 'ice' | 'volcano' | 'desert' | 'dungeon';

export interface Monster3D {
  id: string; name: string; icon: string; hp: number; maxHp: number;
  xp: number; gold: number; level: number; mesh: THREE.Group;
  pos: THREE.Vector3; speed: number; atk: number; def: number;
  aggroed: boolean; attackTimer: number; state: 'idle' | 'chase' | 'attack' | 'dead';
  hitFlashTimer: number; deathTimer: number; chaseTimer: number;
}

export interface DmgNumber {
  id: number; x: number; y: number; value: number; color: string; age: number; opacity: number; scale: number;
}

export interface InteractableInfo {
  type: 'shop' | 'chest' | 'blacksmith' | 'portal'; label: string; zone?: ZoneId;
}

export interface GameState {
  playerHp: number; playerMaxHp: number; playerMp: number; playerMaxMp: number;
  playerXp: number; playerXpNext: number; playerLevel: number;
  playerGold: number; playerKills: number; playerClass: ClassName;
  timeOfDay: number; combatLog: string[];
  nearMonster: Monster3D | null; nearInteractable: InteractableInfo | null;
  zone: ZoneId; zoneName: string; dmgNumbers: DmgNumber[];
  position: { x: number; z: number }; transitioning: boolean;
  autoPlay: boolean; activeQuestTarget: string | null; tutorialSeen: boolean;
  bossKills: number; deaths: number;
  multiConnected: boolean;
  onlinePlayers: { name: string; cls: string; zone: ZoneId }[];
  playerRole: string;
  inventory: { name: string; icon: string; qty: number; type: string; desc: string }[];
  questProgress: QuestProgress[];
  lootCount: number;
}

// ── Zone Definitions ───────────────────────────────────────────────────────
const ZONES: Record<ZoneId, {
  name: string; icon: string; portalColor: number; fogColor: number; fogDensity: number;
  groundColor: number; skyTop: number; skyBottom: number;
  ambientColor: number; sunColor: number;
  monsters: { name: string; icon: string; level: number; hp: number; atk: number; def: number; xp: number; gold: number; color: number; shape: string }[];
  treeCount: number; treeColor: number; treeStyle: 'pine' | 'round' | 'dead' | 'palm';
}> = {
  city: {
    name: 'Prontera', icon: '🏰', portalColor: 0x8800ff, fogColor: 0x0a0520, fogDensity: 0.01,
    groundColor: 0x3a7d44, skyTop: 0x000510, skyBottom: 0x0a0520,
    ambientColor: 0x404090, sunColor: 0xfff0cc,
    monsters: [], treeCount: 0, treeColor: 0x2d7a2d, treeStyle: 'round',
  },
  forest: {
    name: 'Floresta Sombria', icon: '🌲', portalColor: 0x00cc44, fogColor: 0x0a1a08, fogDensity: 0.018,
    groundColor: 0x1a4a15, skyTop: 0x010a01, skyBottom: 0x0a1a05,
    ambientColor: 0x1a5015, sunColor: 0x88ff66,
    monsters: [
      { name: 'Lobo Cinzento', icon: '🐺', level: 5, hp: 120, atk: 18, def: 8, xp: 25, gold: 12, color: 0x7f8c8d, shape: 'quad' },
      { name: 'Goblin Floresta', icon: '👺', level: 8, hp: 160, atk: 22, def: 10, xp: 40, gold: 18, color: 0x2ecc71, shape: 'humanoid' },
      { name: 'Aranha Gigante', icon: '🕷️', level: 12, hp: 200, atk: 28, def: 12, xp: 60, gold: 25, color: 0x2c1a2c, shape: 'sphere' },
      { name: 'Centauro', icon: '🐴', level: 18, hp: 320, atk: 38, def: 20, xp: 90, gold: 40, color: 0x8B4513, shape: 'quad' },
      { name: 'Treant', icon: '🌳', level: 25, hp: 500, atk: 45, def: 30, xp: 140, gold: 60, color: 0x3a5a1a, shape: 'boss' },
      { name: 'Guardião Florestal', icon: '🧌', level: 45, hp: 900, atk: 78, def: 50, xp: 260, gold: 120, color: 0x1a3a00, shape: 'boss' },
      { name: 'Espírito da Floresta', icon: '🌿', level: 65, hp: 1800, atk: 115, def: 75, xp: 480, gold: 220, color: 0x006600, shape: 'boss' },
    ],
    treeCount: 80, treeColor: 0x1a5a0a, treeStyle: 'pine',
  },
  ice: {
    name: 'Tundra Glacial', icon: '❄️', portalColor: 0x00ddff, fogColor: 0x0a1a2a, fogDensity: 0.022,
    groundColor: 0x8ab0cc, skyTop: 0x000815, skyBottom: 0x040d1a,
    ambientColor: 0x2a5070, sunColor: 0xaaddff,
    monsters: [
      { name: 'Lobo Ártico', icon: '🐺', level: 15, hp: 200, atk: 30, def: 15, xp: 55, gold: 22, color: 0xddeeff, shape: 'quad' },
      { name: 'Golem de Gelo', icon: '🧊', level: 22, hp: 400, atk: 38, def: 35, xp: 100, gold: 45, color: 0x66aadd, shape: 'boss' },
      { name: 'Yeti', icon: '🦣', level: 28, hp: 500, atk: 50, def: 28, xp: 130, gold: 58, color: 0xeeeeff, shape: 'boss' },
      { name: 'Fada de Gelo', icon: '🧚', level: 18, hp: 180, atk: 42, def: 10, xp: 80, gold: 35, color: 0x88ccff, shape: 'sphere' },
      { name: 'Dragão de Gelo', icon: '🐉', level: 40, hp: 1200, atk: 80, def: 55, xp: 300, gold: 150, color: 0x4488cc, shape: 'boss' },
      { name: 'Lich Glacial', icon: '💎', level: 60, hp: 2200, atk: 120, def: 80, xp: 520, gold: 260, color: 0x0044aa, shape: 'boss' },
      { name: 'Titã Congelado', icon: '🧊', level: 80, hp: 4000, atk: 170, def: 110, xp: 900, gold: 440, color: 0x88ccff, shape: 'boss' },
    ],
    treeCount: 40, treeColor: 0xaaccdd, treeStyle: 'pine',
  },
  volcano: {
    name: 'Caldeira Infernal', icon: '🌋', portalColor: 0xff4400, fogColor: 0x1a0500, fogDensity: 0.02,
    groundColor: 0x2a0d00, skyTop: 0x0f0000, skyBottom: 0x1a0500,
    ambientColor: 0x602015, sunColor: 0xff6633,
    monsters: [
      { name: 'Salamandra', icon: '🦎', level: 20, hp: 280, atk: 40, def: 18, xp: 70, gold: 30, color: 0xff4400, shape: 'quad' },
      { name: 'Demônio Fogo', icon: '😈', level: 28, hp: 420, atk: 55, def: 22, xp: 110, gold: 50, color: 0xcc2200, shape: 'humanoid' },
      { name: 'Elemental Fogo', icon: '🔥', level: 32, hp: 380, atk: 65, def: 15, xp: 130, gold: 55, color: 0xff8800, shape: 'sphere' },
      { name: 'Golem de Lava', icon: '🗿', level: 38, hp: 700, atk: 70, def: 45, xp: 180, gold: 80, color: 0x880000, shape: 'boss' },
      { name: 'Dragão Infernal', icon: '🐲', level: 55, hp: 2000, atk: 120, def: 70, xp: 500, gold: 250, color: 0xff2200, shape: 'boss' },
      { name: 'Fênix Infernal', icon: '🦅', level: 72, hp: 3200, atk: 155, def: 95, xp: 700, gold: 350, color: 0xff6600, shape: 'boss' },
      { name: 'Lorde do Inferno', icon: '😈', level: 90, hp: 5500, atk: 200, def: 130, xp: 1200, gold: 600, color: 0xaa0000, shape: 'boss' },
    ],
    treeCount: 10, treeColor: 0x3a1a00, treeStyle: 'dead',
  },
  desert: {
    name: 'Deserto de Areia', icon: '🏜️', portalColor: 0xffaa00, fogColor: 0x1a1000, fogDensity: 0.012,
    groundColor: 0xc4a35a, skyTop: 0x060300, skyBottom: 0x180c00,
    ambientColor: 0x503825, sunColor: 0xffcc44,
    monsters: [
      { name: 'Escorpião', icon: '🦂', level: 10, hp: 150, atk: 25, def: 12, xp: 35, gold: 15, color: 0xcc8800, shape: 'quad' },
      { name: 'Múmia', icon: '🧟', level: 16, hp: 240, atk: 32, def: 18, xp: 60, gold: 28, color: 0xc8a870, shape: 'humanoid' },
      { name: 'Anubis', icon: '🐺', level: 24, hp: 380, atk: 50, def: 30, xp: 100, gold: 48, color: 0x1a1a00, shape: 'humanoid' },
      { name: 'Verme da Areia', icon: '🐛', level: 30, hp: 600, atk: 60, def: 35, xp: 150, gold: 70, color: 0xaa6600, shape: 'boss' },
      { name: 'Esfinge', icon: '🦁', level: 45, hp: 1500, atk: 95, def: 60, xp: 380, gold: 200, color: 0xddaa44, shape: 'boss' },
      { name: 'Faraó Maldito', icon: '👑', level: 68, hp: 2800, atk: 140, def: 90, xp: 650, gold: 320, color: 0xcc8800, shape: 'boss' },
      { name: 'Titã da Areia', icon: '🏺', level: 88, hp: 5000, atk: 185, def: 125, xp: 1100, gold: 550, color: 0xddaa00, shape: 'boss' },
    ],
    treeCount: 12, treeColor: 0x886600, treeStyle: 'palm',
  },
  dungeon: {
    name: 'Masmorra das Trevas', icon: '💀', portalColor: 0x6600aa, fogColor: 0x050010, fogDensity: 0.03,
    groundColor: 0x1a1520, skyTop: 0x020005, skyBottom: 0x050010,
    ambientColor: 0x200040, sunColor: 0xaa55ff,
    monsters: [
      { name: 'Esqueleto', icon: '💀', level: 12, hp: 180, atk: 28, def: 10, xp: 45, gold: 20, color: 0xddddbb, shape: 'humanoid' },
      { name: 'Vampiro', icon: '🧛', level: 20, hp: 300, atk: 45, def: 20, xp: 85, gold: 38, color: 0x660033, shape: 'humanoid' },
      { name: 'Lich', icon: '💀', level: 35, hp: 600, atk: 75, def: 30, xp: 200, gold: 100, color: 0x440088, shape: 'humanoid' },
      { name: 'Criatura das Sombras', icon: '👤', level: 28, hp: 420, atk: 58, def: 25, xp: 120, gold: 55, color: 0x110022, shape: 'sphere' },
      { name: 'Senhor das Trevas', icon: '😈', level: 60, hp: 3000, atk: 150, def: 90, xp: 800, gold: 400, color: 0x330066, shape: 'boss' },
      { name: 'Dragão Sombrio', icon: '🐉', level: 75, hp: 4500, atk: 180, def: 115, xp: 1100, gold: 550, color: 0x110033, shape: 'boss' },
      { name: 'Deus das Trevas', icon: '💀', level: 95, hp: 8000, atk: 230, def: 150, xp: 2000, gold: 1000, color: 0x000022, shape: 'boss' },
      { name: 'OMEGA', icon: '⚫', level: 100, hp: 12000, atk: 280, def: 180, xp: 3500, gold: 2000, color: 0x000000, shape: 'boss' },
    ],
    treeCount: 0, treeColor: 0x110011, treeStyle: 'dead',
  },
};

const ZONE_ORDER: ZoneId[] = ['forest', 'ice', 'volcano', 'desert', 'dungeon'];
const PORTAL_POSITIONS: [number, number][] = [[-30, -25], [-15, -28], [0, -30], [15, -28], [30, -25]];

const CLASS_COLORS: Record<ClassName, number> = {
  warrior: 0xe74c3c, mage: 0x9b59b6, archer: 0x27ae60, priest: 0xf1c40f,
  ninja: 0x00d2ff, paladin: 0xe67e22, assassin: 0xe91e8c,
};
const PLAYER_SPEED = 9; const CAM_HEIGHT = 22;
const CAM_DIST_MIN = 14; const CAM_DIST_MAX = 42; const CAM_DIST_DEFAULT = 24;
let dmgIdCounter = 0;

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}
function zoneRng(zoneId: string) {
  let h = 5381;
  for (let i = 0; i < zoneId.length; i++) h = (Math.imul(h, 31) + zoneId.charCodeAt(i)) >>> 0;
  return seededRng(h);
}

function makeNameSprite(name: string, cls: string, isLocal = false): THREE.Sprite {
  const W = 320; const H = 56;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  const clsColors: Record<string, string> = { warrior:'#e74c3c', mage:'#9b59b6', archer:'#27ae60', priest:'#f1c40f', ninja:'#00d2ff', paladin:'#e67e22', assassin:'#e91e8c' };
  const col = clsColors[cls] ?? '#ffffff';
  // Background pill
  ctx.fillStyle = isLocal ? 'rgba(255,215,0,0.18)' : 'rgba(0,0,0,0.72)';
  const rx = 10;
  ctx.beginPath(); ctx.roundRect(2, 6, W - 4, H - 10, rx); ctx.fill();
  // Border
  ctx.strokeStyle = isLocal ? 'rgba(255,215,0,0.7)' : col + 'aa';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(2, 6, W - 4, H - 10, rx); ctx.stroke();
  // Text shadow
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.font = 'bold 22px "Segoe UI", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name.slice(0, 16), W / 2 + 1, H / 2 + 5);
  // Text
  ctx.fillStyle = isLocal ? '#ffd700' : '#ffffff';
  ctx.fillText(name.slice(0, 16), W / 2, H / 2 + 4);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.0, 0.85, 1);
  sprite.position.y = 4.2;
  sprite.name = 'nameSprite';
  return sprite;
}

export class GameEngine {
  canvas: HTMLCanvasElement; minimapCanvas: HTMLCanvasElement;
  renderer!: THREE.WebGLRenderer; scene!: THREE.Scene; camera!: THREE.PerspectiveCamera;
  clock = new THREE.Clock(); sun!: THREE.DirectionalLight;
  ambient!: THREE.AmbientLight; hemi!: THREE.HemisphereLight;
  streetLights: THREE.PointLight[] = []; playerLight!: THREE.PointLight;
  cityGroup!: THREE.Group;
  playerSkills: Record<string, number> = {}; playerSP = 3;
  playerMesh!: THREE.Group; playerPos = new THREE.Vector3(0, 0, 0);
  playerTarget = new THREE.Vector3(0, 0, 0); playerMoving = false;
  playerDir = new THREE.Vector3(0, 0, -1); animTime = 0;
  keys = new Set<string>(); raycaster = new THREE.Raycaster();
  groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  timeOfDay = 0.28; monsters: Monster3D[] = [];
  particleSystems: THREE.Points[] = []; waterMesh!: THREE.Mesh;
  waterTime = 0; buildings: THREE.Object3D[] = []; terrain!: THREE.Mesh;
  onState!: (s: GameState) => void; combatLog: string[] = [];
  dmgNumbers: DmgNumber[] = []; zoneObjects: THREE.Object3D[] = [];
  autoPlay = false; activeQuestTarget: string | null = null;
  tutorialSeen = false; autoPlayTimer = 0; autoPlayAttackTimer = 0;
  bossKills = 0; deaths = 0; sessionStart = Date.now(); saveTimer = 0;
  onKill: ((monsterName: string) => void) | null = null;
  onSave: ((stats: { kills: number; bossKills: number; deaths: number; xp: number; level: number; gold: number; zone: ZoneId }) => void) | null = null;
  currentZone: ZoneId = 'city'; transitioning = false; transitionAlpha = 0;
  transitionDir = 0; pendingZone: ZoneId | null = null;
  fogParticles!: THREE.Points; stars!: THREE.Points;
  clickIndicator!: THREE.Mesh; mousePos = new THREE.Vector2();
  attackAnim = 0; attacking = false; attackTarget: THREE.Vector3 | null = null;
  slashMeshes: { mesh: THREE.Mesh; age: number }[] = [];
  disposed = false; animFrame = 0;
  interactables: { pos: THREE.Vector3; type: InteractableInfo['type']; label: string; zone?: ZoneId; mesh: THREE.Object3D }[] = [];
  cityInteractables: { pos: THREE.Vector3; type: InteractableInfo['type']; label: string; zone?: ZoneId; mesh: THREE.Object3D }[] = [];
  zoneInteractables: { pos: THREE.Vector3; type: InteractableInfo['type']; label: string; zone?: ZoneId; mesh: THREE.Object3D }[] = [];
  colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  cityColliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  inventory: { name: string; icon: string; qty: number; type: string; desc: string }[] = [];
  portalCooldown = 0;
  autoPlayStuckTimer = 0; autoPlayLastPos = new THREE.Vector3(9999, 0, 9999);
  portalMeshes: { mesh: THREE.Group; time: number; color: number }[] = [];
  lavaParticles: THREE.Points | null = null;
  snowParticles: THREE.Points | null = null;
  rainParticles: THREE.Points | null = null;
  sandParticles: THREE.Points | null = null;

  regenTimer = 0;
  walkCycle = 0;
  projectiles: Array<{mesh: THREE.Mesh; target: any; speed: number; dmg: number}> = [];

  // Camera
  camDist = CAM_DIST_DEFAULT;
  camAngle = Math.PI / 4;
  camShakeX = 0; camShakeY = 0; camShakeMag = 0;
  camShakeDecay = 0;

  // Player velocity (for smooth acceleration)
  playerVelX = 0; playerVelZ = 0;

  // Walking NPCs
  npcWalkers: { mesh: THREE.Group; pos: THREE.Vector3; target: THREE.Vector3; speed: number; waitTimer: number; walkAnim: number; homeX: number; homeZ: number; range: number }[] = [];

  // Sky reference for dynamic updates
  skyMat: THREE.ShaderMaterial | null = null;

  // Callbacks
  onCameraShake: (() => void) | null = null;

  // Equipment slots
  equippedItems: Record<string, { name: string; icon: string; slot: string }> = {};
  equipmentMeshes: Record<string, THREE.Object3D> = {};

  // Loot drops on ground
  lootDrops: { item: LootItem; mesh: THREE.Group; pos: THREE.Vector3; age: number }[] = [];

  // Quest system
  questProgress: QuestProgress[] = [];
  onQuestUpdate: ((quests: QuestProgress[]) => void) | null = null;

  // Multiplayer
  remotePlayers: Map<string, { mesh: THREE.Group; pos: THREE.Vector3; targetPos: THREE.Vector3; name: string; cls: ClassName; zone: ZoneId }> = new Map();
  multiWs: WebSocket | null = null;
  multiSendTimer = 0;
  multiConnected = false;
  multiChatQueue: string[] = [];
  playerRole = 'player';
  currentSkin = 'default';

  // Callbacks for chat and clan events
  onChat?: (from: string, text: string) => void;
  onClanChat?: (from: string, text: string) => void;
  onClanUpdate?: (clan: any) => void;
  onClanMembers?: (members: any[]) => void;
  onStatsUpdate?: (stats: { hp: number; maxHp: number; mp: number; maxMp: number; xp: number; xpNext: number; level: number; gold: number; kills: number; totalXp: number; atk: number; def: number; className: ClassName; name: string }) => void;
  onMonsterDead?: (m: any) => void;

  playerStats = {
    hp: 200, maxHp: 200, mp: 100, maxMp: 100, xp: 0, xpNext: 100,
    level: 1, gold: 500, kills: 0, totalXp: 0, atk: 15, def: 10, className: 'warrior' as ClassName,
    name: 'Herói',
  };

  constructor(canvas: HTMLCanvasElement, minimap: HTMLCanvasElement, cls: ClassName, onState: (s: GameState) => void) {
    this.canvas = canvas; this.minimapCanvas = minimap; this.onState = onState;
    const classStats: Record<ClassName, { hp: number; mp: number; atk: number; def: number }> = {
      warrior: { hp: 320, mp: 60, atk: 22, def: 20 }, mage: { hp: 140, mp: 260, atk: 32, def: 6 },
      archer: { hp: 185, mp: 125, atk: 26, def: 10 }, priest: { hp: 165, mp: 240, atk: 12, def: 13 },
      ninja: { hp: 165, mp: 140, atk: 30, def: 8 }, paladin: { hp: 280, mp: 160, atk: 18, def: 26 },
      assassin: { hp: 155, mp: 130, atk: 34, def: 7 },
    };
    const s = classStats[cls];
    Object.assign(this.playerStats, { ...s, maxHp: s.hp, maxMp: s.mp, hp: s.hp, mp: s.mp, className: cls });
  }

  buildState(): GameState {
    const s = this.playerStats;
    return {
      playerHp: s.hp, playerMaxHp: s.maxHp, playerMp: s.mp, playerMaxMp: s.maxMp,
      playerXp: s.xp, playerXpNext: s.xpNext, playerLevel: s.level,
      playerGold: s.gold, playerKills: s.kills, playerClass: s.className,
      timeOfDay: this.timeOfDay, combatLog: [...this.combatLog],
      nearMonster: this.getNearMonster(), nearInteractable: this.getNearInteractable(),
      zone: this.currentZone, zoneName: ZONES[this.currentZone].name,
      dmgNumbers: [...this.dmgNumbers], position: { x: Math.round(this.playerPos.x), z: Math.round(this.playerPos.z) },
      transitioning: this.transitioning, autoPlay: this.autoPlay,
      activeQuestTarget: this.activeQuestTarget, tutorialSeen: this.tutorialSeen,
      bossKills: this.bossKills, deaths: this.deaths,
      multiConnected: this.multiConnected,
      onlinePlayers: this.getOnlinePlayers(),
      playerRole: this.playerRole,
      inventory: [...this.inventory],
      questProgress: [...this.questProgress],
      lootCount: this.lootDrops.length,
    };
  }

  getNearMonster(): Monster3D | null {
    let best: Monster3D | null = null; let bestDist = 5.5;
    for (const m of this.monsters) { if (m.state === 'dead') continue; const d = m.pos.distanceTo(this.playerPos); if (d < bestDist) { best = m; bestDist = d; } }
    return best;
  }

  getNearInteractable(): InteractableInfo | null {
    for (const obj of this.interactables) {
      if (obj.pos.distanceTo(this.playerPos) < 4) return { type: obj.type, label: obj.label, zone: obj.zone };
    }
    return null;
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0520, 0.01);
    this.scene.background = new THREE.Color(0x0a0520);

    this.camera = new THREE.PerspectiveCamera(48, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 600);
    this.setCamPos();

    // Lighting
    this.ambient = new THREE.AmbientLight(0x404090, 0.9); this.scene.add(this.ambient);
    this.hemi = new THREE.HemisphereLight(0x87ceeb, 0x5a3a10, 0.6); this.scene.add(this.hemi);
    this.playerLight = new THREE.PointLight(0xffeedd, 1.2, 10); this.playerLight.position.set(0, 3, 0); this.scene.add(this.playerLight);
    this.sun = new THREE.DirectionalLight(0xfff0cc, 1.8);
    this.sun.position.set(30, 50, 20); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -70; this.sun.shadow.camera.right = 70;
    this.sun.shadow.camera.top = 70; this.sun.shadow.camera.bottom = -70;
    this.sun.shadow.camera.far = 250; this.sun.shadow.bias = -0.001;
    this.scene.add(this.sun);

    this.buildCity();
    this.playerMesh = this.createPlayerMesh(this.playerStats.className);
    this.scene.add(this.playerMesh);
    // Name sprite above local player (updated when name is known)
    const localSprite = makeNameSprite(this.playerStats.name, this.playerStats.className, true);
    this.playerMesh.add(localSprite);

    // Click indicator ring
    const ciMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    this.clickIndicator = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.45, 20), ciMat);
    this.clickIndicator.rotation.x = -Math.PI / 2; this.clickIndicator.visible = false;
    this.scene.add(this.clickIndicator);

    this.buildStars(); this.buildFireflies(); this.bindInput(); this.loop();
  }

  setCamPos() {
    this.camera.position.set(this.playerPos.x + Math.sin(this.camAngle) * this.camDist, CAM_HEIGHT, this.playerPos.z + Math.cos(this.camAngle) * this.camDist);
    this.camera.lookAt(this.playerPos.x, 0, this.playerPos.z);
  }

  // ── CITY ──────────────────────────────────────────────────────────────────
  buildCity() {
    this.cityGroup = new THREE.Group(); this.scene.add(this.cityGroup);
    // Ground
    const tGeo = new THREE.PlaneGeometry(320, 320, 64, 64); tGeo.rotateX(-Math.PI / 2);
    const vPos = tGeo.attributes.position;
    for (let i = 0; i < vPos.count; i++) {
      const x = vPos.getX(i); const z = vPos.getZ(i); const d = Math.sqrt(x * x + z * z);
      if (d > 80) vPos.setY(i, Math.sin(d * 0.04) * 1.5 + d * 0.015);
    }
    vPos.needsUpdate = true; tGeo.computeVertexNormals();
    this.terrain = new THREE.Mesh(tGeo, new THREE.MeshLambertMaterial({ color: 0x3a7d44 }));
    this.terrain.receiveShadow = true; this.scene.add(this.terrain);

    // City plaza
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshLambertMaterial({ color: 0xb8a888 }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.01; plaza.receiveShadow = true; this.cityGroup.add(plaza);

    // Stone paths
    [[0, 0, 80, 3.5, true], [0, 0, 80, 3.5, false]].forEach(([ox, oz, len, w, h]) => {
      const g = h ? new THREE.PlaneGeometry(len as number, w as number) : new THREE.PlaneGeometry(w as number, len as number);
      g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x9e8866 }));
      m.position.set(ox as number, 0.02, oz as number); m.receiveShadow = true; this.cityGroup.add(m);
    });

    // Water
    const wGeo = new THREE.PlaneGeometry(24, 10, 12, 12); wGeo.rotateX(-Math.PI / 2);
    const wMat = new THREE.MeshPhongMaterial({ color: 0x1a6fa8, transparent: true, opacity: 0.78, shininess: 120, specular: 0x5ab5f0 });
    this.waterMesh = new THREE.Mesh(wGeo, wMat); this.waterMesh.position.set(32, -0.1, -18);
    this.waterMesh.receiveShadow = true; this.scene.add(this.waterMesh);

    this.buildCityBuildings();
    this.buildCityPortals();
    this.buildCityNPCs();
    this.buildNatureTrees(0, 0, 50, 130, 70, 0x2d7a2d, 'round', this.cityGroup);

    // Scatter rocks around city perimeter for a more natural world feel
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 35 + (i % 3) * 8;
      const rx = Math.cos(angle) * r;
      const rz = Math.sin(angle) * r;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.4 + (i % 3) * 0.3, 0),
        new THREE.MeshPhongMaterial({ color: 0x666655 + (i * 0x010101 % 0x0f0f0f) })
      );
      rock.position.set(rx, 0.2, rz);
      rock.rotation.set((i * 0.3) % 0.5, (i * 1.1) % Math.PI, (i * 0.7) % 0.5);
      rock.castShadow = true;
      this.cityGroup.add(rock);
    }

    this.buildMountains();
    this.buildSky();
    this.initQuests();
  }

  buildCityBuildings() {
    // ── Castle (North) ───────────────────────────────────────────────────────
    this.addBuilding(0, -26, 10, 13, 10, 0x8a7a6a, 'castle');
    [[-6,-30,2.8,16],[6,-30,2.8,16],[-6,-22,2.8,16],[6,-22,2.8,16]].forEach(([x,z,r,h]) => this.addTower(x as number,z as number,r as number,h as number,0x7a6a5a));

    // ── City walls ────────────────────────────────────────────────────────────
    [[0,-32,64,1.5,4],[0,32,64,1.5,4],[-32,0,1.5,64,4],[32,0,1.5,64,4]].forEach(([x,z,w,d,h]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({ color:0x6a5a4a }));
      m.position.set(x,h/2,z); m.castShadow=true; m.receiveShadow=true; this.cityGroup.add(m);
      const c = { minX:(x as number)-(w as number)/2, maxX:(x as number)+(w as number)/2, minZ:(z as number)-(d as number)/2, maxZ:(z as number)+(d as number)/2 };
      this.colliders.push(c); this.cityColliders.push(c);
    });
    // Wall corner towers
    [[-31,-31,1.8,5],[31,-31,1.8,5],[-31,31,1.8,5],[31,31,1.8,5]].forEach(([x,z,r,h]) => this.addTower(x as number,z as number,r as number,h as number,0x5a4a3a));

    // ── Fountain Plaza ────────────────────────────────────────────────────────
    this.addFountain(0, 0);
    // Extra decorative plaza stones
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2; const r = 5.5;
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.6, 6), new THREE.MeshLambertMaterial({ color: 0xb0a090 }));
      stone.position.set(Math.cos(a)*r, 0.3, Math.sin(a)*r); this.cityGroup.add(stone);
    }

    // ── Named Buildings ───────────────────────────────────────────────────────
    // Taverna (SW) — warm amber glow
    this.addBuilding(-18, 14, 7, 7, 6, 0xa0600a, 'tavern');
    const tavSign = new THREE.Mesh(new THREE.BoxGeometry(4, 0.8, 0.1), new THREE.MeshLambertMaterial({ color: 0xcc8822, emissive: 0x884400, emissiveIntensity: 0.5 }));
    tavSign.position.set(-18, 8, 11.1); this.cityGroup.add(tavSign);
    const tavLight = new THREE.PointLight(0xffaa44, 2, 10); tavLight.position.set(-18, 5, 11); this.cityGroup.add(tavLight); this.streetLights.push(tavLight);

    // Banco/Guild (SE) — stone blue
    this.addBuilding(18, 14, 7, 7, 6, 0x4a5a8a, 'bank');
    const bankLight = new THREE.PointLight(0x4488ff, 1.5, 8); bankLight.position.set(18, 5, 11); this.cityGroup.add(bankLight); this.streetLights.push(bankLight);

    // Arena (NE) — coliseum style
    this.addArena(20, -16);

    // Mage Tower (NW)
    this.addTower(-22, -18, 3, 16, 0x4a2a8a);
    const towerOrb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), new THREE.MeshLambertMaterial({ color: 0x9b59b6, emissive: 0x9b59b6, emissiveIntensity: 1.2 }));
    towerOrb.position.set(-22, 17, -18); this.cityGroup.add(towerOrb);
    const towerLight = new THREE.PointLight(0x9b59b6, 2.5, 12); towerLight.position.set(-22, 17, -18); this.cityGroup.add(towerLight); this.streetLights.push(towerLight);

    // Houses
    [
      [-10,-18,5,4,4,0xc0803a],[10,-18,5,4,4,0x9a7a4a],[- 8,18,5,4,4,0x708050],[8,18,5,4,4,0x806040],
      [-24,6,5,4,4,0xaa6030],[24,6,5,4,4,0x5a7a4a],
    ].forEach(([x,z,h,w,d,c]) => this.addBuilding(x,z,h,w,d,c,'building'));

    // ── Market Stalls ─────────────────────────────────────────────────────────
    for (let i = -2; i <= 2; i++) {
      this.addStall(i * 5.5, -10, [0xe74c3c,0x27ae60,0x3498db,0xf39c12,0x9b59b6][i+2]);
      this.addStall(i * 5.5, 10, [0xe67e22,0x1abc9c,0xe91e8c,0x00bcd4,0xff5722][i+2]);
    }

    // ── Building Badge Labels ─────────────────────────────────────────────────
    if (typeof document !== 'undefined') {
      const addBadge = (label: string, x: number, y: number, z: number, color: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 192; canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, 192, 64);
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}cc`;
        ctx.beginPath();
        if (ctx.roundRect) { ctx.roundRect(4, 4, 184, 56, 10); } else { ctx.rect(4, 4, 184, 56); }
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, 96, 32);
        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(x, y, z);
        sprite.scale.set(4, 1.4, 1);
        this.cityGroup.add(sprite);
      };
      addBadge('BANCO', 18, 10.5, 11, 0x1a5276);
      addBadge('TAVERNA', -18, 10.5, 17, 0x6e2f0a);
      addBadge('MAGIA', -22, 20, -18, 0x4a0080);
      addBadge('ARENA', 20, 8, -16, 0x4a4a4a);
      addBadge('MERCADO', 0, 5, -7, 0x1a6b1a);
    }

    // ── Street Lamps ──────────────────────────────────────────────────────────
    [[-7,-7],[7,-7],[-7,7],[7,7],[-7,-18],[7,-18],[-7,18],[7,18],[-16,0],[16,0],[-14,-14],[14,-14],[-14,14],[14,14]].forEach(([x,z]) => this.addLamp(x as number,z as number));

    // ── Trees lining the roads ────────────────────────────────────────────────
    for (let i = -3; i <= 3; i++) {
      this.buildTree(i * 5.5 + 2.5, -13.5, 0.55, 0x2a6a18, 'round', this.cityGroup);
      this.buildTree(i * 5.5 + 2.5, 13.5, 0.55, 0x2a6a18, 'round', this.cityGroup);
      if (i !== 0) { this.buildTree(-14, i * 6, 0.5, 0x2a6a18, 'round', this.cityGroup); this.buildTree(14, i * 6, 0.5, 0x2a6a18, 'round', this.cityGroup); }
    }
  }

  addArena(x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x9a8870 });
    // Outer ring
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2; const r = 5;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 4.5, 6), mat);
      pillar.position.set(x + Math.cos(a)*r, 2.25, z + Math.sin(a)*r);
      pillar.castShadow = true; this.cityGroup.add(pillar);
    }
    // Arena floor
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.5, 24), new THREE.MeshLambertMaterial({ color: 0xd4b880 }));
    floor.rotation.x = -Math.PI/2; floor.position.set(x, 0.02, z); floor.receiveShadow = true; this.cityGroup.add(floor);
    // Roof ring beam
    const roof = new THREE.Mesh(new THREE.TorusGeometry(5, 0.3, 6, 24), mat);
    roof.position.set(x, 4.6, z); this.cityGroup.add(roof);
    // Center torch
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.5, 6), new THREE.MeshLambertMaterial({ color: 0x5a3000 }));
    torch.position.set(x, 0.75, z); this.cityGroup.add(torch);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshLambertMaterial({ color: 0xff8800, emissive: 0xff4400, emissiveIntensity: 1.5 }));
    flame.position.set(x, 1.7, z); this.cityGroup.add(flame);
    const arenaLight = new THREE.PointLight(0xff8800, 3, 12); arenaLight.position.set(x, 2, z); this.cityGroup.add(arenaLight); this.streetLights.push(arenaLight);
    // Collider
    const bc = { minX: x-5.5, maxX: x+5.5, minZ: z-5.5, maxZ: z+5.5 };
    this.colliders.push(bc); this.cityColliders.push(bc);
  }

  buildCityPortals() {
    ZONE_ORDER.forEach((zoneId, i) => {
      if (i >= PORTAL_POSITIONS.length) return;
      const [x, z] = PORTAL_POSITIONS[i];
      const zoneDef = ZONES[zoneId];
      const col = zoneDef.portalColor;
      const group = new THREE.Group();

      // ── Plataforma no chão — visível de cima (isométrico) ──
      // Disco base externo (pentagrama de luz)
      const baseDisk = new THREE.Mesh(
        new THREE.CircleGeometry(3.6, 32),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
      );
      baseDisk.rotation.x = -Math.PI / 2; baseDisk.position.y = 0.02; group.add(baseDisk);

      // Anel duplo no chão
      const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.0, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
      ring1.rotation.x = -Math.PI / 2; ring1.position.y = 0.03; group.add(ring1);
      const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.8, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.04; ring2.name = 'particleRing'; group.add(ring2);

      // Raios do anel ao centro
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const ray = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 2.4), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
        ray.rotation.x = -Math.PI / 2; ray.rotation.z = a; ray.position.set(Math.cos(a) * 1.2, 0.05, Math.sin(a) * 1.2); group.add(ray);
      }

      // Partículas ascendentes do chão (visíveis do isométrico)
      const sparkGeo = new THREE.BufferGeometry(); const sparkCount = 32; const sparkPos = new Float32Array(sparkCount * 3);
      for (let k = 0; k < sparkCount; k++) {
        const a2 = Math.random() * Math.PI * 2; const r = 0.5 + Math.random() * 2.5;
        sparkPos[k * 3] = Math.cos(a2) * r; sparkPos[k * 3 + 1] = Math.random() * 5; sparkPos[k * 3 + 2] = Math.sin(a2) * r;
      }
      sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
      group.add(new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: col, size: 0.22, transparent: true, opacity: 0.85 })));

      // ── Arco de pedra ──
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0x4a4055, emissive: col, emissiveIntensity: 0.5 });
      const left = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6.5, 0.7), stoneMat); left.position.set(-2.4, 3.25, 0); left.castShadow = true; group.add(left);
      const right = left.clone(); right.position.x = 2.4; group.add(right);
      const top = new THREE.Mesh(new THREE.BoxGeometry(6, 0.7, 0.7), stoneMat); top.position.set(0, 6.85, 0); top.castShadow = true; group.add(top);

      // Cristais nas pontas do arco
      for (const [cx2, cy, cz2] of [[-2.4, 7.3, 0], [2.4, 7.3, 0], [0, 7.3, 0]]) {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 1.2 }));
        crystal.position.set(cx2, cy, cz2); group.add(crystal);
      }

      // ── Fill do portal (plano vertical + horizontal cruzados para ver de qualquer ângulo) ──
      const fillMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const fillV = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 6), fillMat.clone());
      fillV.position.set(0, 3.35, 0); fillV.name = 'portalFill'; group.add(fillV);
      // Plano horizontal no meio do portal (visível de cima!)
      const fillH = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
      fillH.rotation.x = -Math.PI / 2; fillH.position.set(0, 2.5, 0); group.add(fillH);

      // Glow branco central
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      glow.position.set(0, 3.35, 0.05); group.add(glow);

      // ── Luz ──
      const pl = new THREE.PointLight(col, 4, 16); pl.position.set(0, 2, 0); pl.name = 'portalLight'; group.add(pl);
      this.streetLights.push(pl);
      // Segunda luz baixa para iluminar o chão ao redor
      const pl2 = new THREE.PointLight(col, 2, 8); pl2.position.set(0, 0.5, 0); group.add(pl2);

      // Label flutuante (nome da zona)
      const labelGeo = new THREE.PlaneGeometry(4, 0.6);
      const labelMesh = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
      labelMesh.position.set(0, 7.8, 0); group.add(labelMesh);

      group.position.set(x, 0, z);
      this.cityGroup.add(group); this.buildings.push(group);
      this.portalMeshes.push({ mesh: group, time: i * 0.7, color: col });

      const entry = { pos: new THREE.Vector3(x, 0, z), type: 'portal' as const, label: `⚡ Portal: ${zoneDef.name} — Pressione F`, zone: zoneId, mesh: group };
      this.interactables.push(entry); this.cityInteractables.push(entry);
    });
  }

  buildCityNPCs() {
    // Interactive NPCs
    const shopMesh = this.buildNPCMesh(0xf4c2a0, 0x3498db); shopMesh.position.set(-15, 0, -15);
    this.cityGroup.add(shopMesh);
    const shopEntry = { pos: new THREE.Vector3(-15, 0, -15), type: 'shop' as const, label: '🏪 Loja do Mercador', mesh: shopMesh };
    this.interactables.push(shopEntry); this.cityInteractables.push(shopEntry);

    const chest = this.buildChestMesh(); chest.position.set(15, 0, -15);
    this.cityGroup.add(chest);
    const chestEntry = { pos: new THREE.Vector3(15, 0, -15), type: 'chest' as const, label: '📦 Baú de Inventário', mesh: chest };
    this.interactables.push(chestEntry); this.cityInteractables.push(chestEntry);

    const blacksmith = this.buildNPCMesh(0xcc9966, 0xe74c3c); blacksmith.position.set(15, 0, 15);
    this.cityGroup.add(blacksmith);
    const smithEntry = { pos: new THREE.Vector3(15, 0, 15), type: 'blacksmith' as const, label: '⚒️ Ferreiro', mesh: blacksmith };
    this.interactables.push(smithEntry); this.cityInteractables.push(smithEntry);

    // Walking citizens — give the city life
    const citizenDefs = [
      { skin: 0xf4c2a0, cloth: 0xe74c3c, hx: 5, hz: 5, range: 8 },
      { skin: 0xd4a574, cloth: 0x27ae60, hx: -8, hz: 3, range: 6 },
      { skin: 0xe8c49e, cloth: 0x9b59b6, hx: 10, hz: -5, range: 7 },
      { skin: 0xc08050, cloth: 0x3498db, hx: -5, hz: -8, range: 5 },
      { skin: 0xf0c8a0, cloth: 0xf39c12, hx: 12, hz: 8, range: 6 },
      { skin: 0xd8b080, cloth: 0xe91e8c, hx: -12, hz: -3, range: 7 },
      { skin: 0xf4d0b0, cloth: 0x1abc9c, hx: 0, hz: 12, range: 5 },
      { skin: 0xe0a870, cloth: 0xff5722, hx: -7, hz: 10, range: 6 },
      { skin: 0xf8c8a8, cloth: 0x607d8b, hx: 7, hz: -10, range: 5 },
      { skin: 0xd0a060, cloth: 0x795548, hx: -10, hz: 8, range: 7 },
      // Guards near portals
      { skin: 0xe0c0a0, cloth: 0x888888, hx: -20, hz: -22, range: 3 },
      { skin: 0xe0c0a0, cloth: 0x888888, hx: 20, hz: -22, range: 3 },
      { skin: 0xe0c0a0, cloth: 0x888888, hx: -22, hz: 2, range: 3 },
    ];
    for (const def of citizenDefs) {
      const mesh = this.buildNPCMesh(def.skin, def.cloth);
      const pos = new THREE.Vector3(def.hx, 0, def.hz);
      mesh.position.copy(pos);
      this.cityGroup.add(mesh);
      const target = new THREE.Vector3(def.hx + (Math.random() - 0.5) * def.range, 0, def.hz + (Math.random() - 0.5) * def.range);
      this.npcWalkers.push({ mesh, pos: pos.clone(), target, speed: 1.2 + Math.random() * 0.8, waitTimer: Math.random() * 3, walkAnim: 0, homeX: def.hx, homeZ: def.hz, range: def.range });
    }
  }

  updateNPCWalkers(dt: number) {
    for (const npc of this.npcWalkers) {
      if (npc.waitTimer > 0) {
        npc.waitTimer -= dt;
        // Idle breathing
        npc.mesh.scale.y = 1 + Math.sin(this.animTime * 1.5 + npc.homeX) * 0.01;
        continue;
      }
      const dist = npc.pos.distanceTo(npc.target);
      if (dist < 0.3) {
        // Arrived — pick new target, wait a bit
        npc.waitTimer = 1.5 + Math.random() * 4;
        npc.target.set(
          npc.homeX + (Math.random() - 0.5) * npc.range * 2,
          0,
          npc.homeZ + (Math.random() - 0.5) * npc.range * 2
        );
        continue;
      }
      // Walk toward target
      const dir = npc.target.clone().sub(npc.pos).normalize();
      npc.pos.addScaledVector(dir, npc.speed * dt);
      npc.mesh.position.copy(npc.pos);
      npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      // Walk animation
      npc.walkAnim += dt * 8;
      const swing = Math.sin(npc.walkAnim) * 0.4;
      const armL = npc.mesh.children[3]; const armR = npc.mesh.children[4];
      if (armL) armL.rotation.x = swing;
      if (armR) armR.rotation.x = -swing;
      npc.mesh.position.y = Math.abs(Math.sin(npc.walkAnim)) * 0.05;
    }
  }

  buildNPCMesh(skinColor: number, clothColor: number): THREE.Group {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: skinColor });
    const cloth = new THREE.MeshLambertMaterial({ color: clothColor });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skin); head.position.y = 1.65; head.castShadow = true; g.add(head);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.38), cloth); body.position.y = 1.02; body.castShadow = true; g.add(body);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), cloth); legL.position.set(-0.18, 0.38, 0); g.add(legL);
    const legR = legL.clone(); legR.position.x = 0.18; g.add(legR);
    // Glow ring
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.7, 20), new THREE.MeshBasicMaterial({ color: clothColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; g.add(ring);
    const pl = new THREE.PointLight(clothColor, 0.8, 6); pl.position.y = 1; g.add(pl);
    return g;
  }

  buildChestMesh(): THREE.Group {
    const g = new THREE.Group();
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.3 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.9), baseMat); base.position.y = 0.35; base.castShadow = true; g.add(base);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.9), new THREE.MeshLambertMaterial({ color: 0x6B3010 })); lid.position.y = 0.87; lid.castShadow = true; g.add(lid);
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), goldMat); lock.position.set(0, 0.7, 0.46); g.add(lock);
    // Strips
    for (const y of [0.15, 0.55, 0.8]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.06, 0.92), goldMat); strip.position.y = y; g.add(strip);
    }
    const glow = new THREE.PointLight(0xffd700, 0.6, 5); glow.position.y = 1; g.add(glow);
    return g;
  }

  addBuilding(x: number, z: number, h: number, w: number, d: number, color: number, _t: string) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color });
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); base.position.y = h / 2; base.castShadow = true; base.receiveShadow = true; g.add(base);
    const roofMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.55).getHex() });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.77, h * 0.55, 4), roofMat);
    roof.position.y = h + h * 0.27; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x3d1c00 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.26, h * 0.46, 0.1), doorMat); door.position.set(0, h * 0.23, d / 2 + 0.05); g.add(door);
    const winMat = new THREE.MeshLambertMaterial({ color: 0xffffcc, emissive: 0xffee88, emissiveIntensity: 0.35 });
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, h * 0.22, 0.1), winMat); win1.position.set(-w * 0.27, h * 0.6, d / 2 + 0.05); g.add(win1);
    const win2 = win1.clone(); win2.position.x = w * 0.27; g.add(win2);
    g.position.set(x, 0, z); this.cityGroup.add(g); this.buildings.push(g);
    const bc = { minX: x - w / 2 - 0.5, maxX: x + w / 2 + 0.5, minZ: z - d / 2 - 0.5, maxZ: z + d / 2 + 0.5 };
    this.colliders.push(bc); this.cityColliders.push(bc);
  }

  addTower(x: number, z: number, r: number, h: number, color: number) {
    const mat = new THREE.MeshLambertMaterial({ color });
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.25, h, 8), mat); cyl.position.set(x, h / 2, z); cyl.castShadow = true; cyl.receiveShadow = true; this.cityGroup.add(cyl);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 1.2, h * 0.45, 8), new THREE.MeshLambertMaterial({ color: 0x8b0000 })); cap.position.set(x, h + h * 0.22, z); cap.castShadow = true; this.cityGroup.add(cap);
  }

  addFountain(x: number, z: number) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xc8c0b0 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.5, 18), mat); base.position.set(x, 0.25, z); base.castShadow = true; this.cityGroup.add(base);
    const wm = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.22, 18), new THREE.MeshPhongMaterial({ color: 0x3399ff, transparent: true, opacity: 0.72 }));
    wm.position.set(x, 0.61, z); this.cityGroup.add(wm);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.8, 8), mat); pole.position.set(x, 1.9, z); this.cityGroup.add(pole);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.5 })); top.position.set(x, 3.4, z); this.cityGroup.add(top);
    const pl = new THREE.PointLight(0x44aaff, 1.8, 12); pl.position.set(x, 2.5, z); this.cityGroup.add(pl); this.streetLights.push(pl);
  }

  addLamp(x: number, z: number) {
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 3.2, 6), poleMat); pole.position.set(x, 1.6, z); pole.castShadow = true; this.cityGroup.add(pole);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffeeaa, emissiveIntensity: 1.2 })); globe.position.set(x, 3.3, z); this.cityGroup.add(globe);
    const pl = new THREE.PointLight(0xffdd88, 1.4, 9); pl.position.set(x, 3.1, z); this.cityGroup.add(pl); this.streetLights.push(pl);
  }

  addStall(x: number, z: number, color: number) {
    const wood = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.6), wood); table.position.set(x, 0.7, z); table.castShadow = true; this.cityGroup.add(table);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 1.9), new THREE.MeshLambertMaterial({ color })); roof.position.set(x, 2.1, z); this.cityGroup.add(roof);
    for (const dx of [-1.45, 1.45]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.1, 4), wood); p.position.set(x + dx, 1.05, z - 0.85); this.cityGroup.add(p);
    }

    // Merchant NPC behind the stall
    const npcGroup = new THREE.Group();
    npcGroup.position.set(x, 0, z + 0.8);
    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 0.7, 8),
      new THREE.MeshPhongMaterial({ color })
    );
    body.position.y = 0.55; npcGroup.add(body);
    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshPhongMaterial({ color: 0xf5cba7 })
    );
    head.position.y = 1.1; npcGroup.add(head);
    // Hat (small cone in stall color)
    const hat = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.3, 8),
      new THREE.MeshPhongMaterial({ color })
    );
    hat.position.y = 1.4; npcGroup.add(hat);
    npcGroup.name = 'merchantNPC';
    this.cityGroup.add(npcGroup);
  }

  // ── ZONES ────────────────────────────────────────────────────────────────
  enterZone(zoneId: ZoneId) {
    if (this.currentZone === zoneId || this.transitioning) return;
    this.transitioning = true; this.transitionDir = 1; this.transitionAlpha = 0; this.pendingZone = zoneId;
    this.addLog(`🌀 Entrando em ${ZONES[zoneId].name}...`);
  }

  executeZoneTransition(zoneId: ZoneId) {
    // Remove previous zone-specific objects
    for (const obj of this.zoneObjects) { this.scene.remove(obj); }
    this.zoneObjects = [];
    // Remove zone-specific interactables (return portals etc.)
    for (const i of this.zoneInteractables) { this.scene.remove(i.mesh); }
    this.zoneInteractables = [];
    // Rebuild master interactables from city ones only
    this.interactables = [...this.cityInteractables];
    // Remove monsters
    for (const m of this.monsters) { this.scene.remove(m.mesh); }
    this.monsters = [];
    // Remove atmosphere particles
    if (this.lavaParticles) { this.scene.remove(this.lavaParticles); this.lavaParticles = null; }
    if (this.snowParticles) { this.scene.remove(this.snowParticles); this.snowParticles = null; }
    if (this.rainParticles) { this.scene.remove(this.rainParticles); this.rainParticles = null; }
    if (this.sandParticles) { this.scene.remove(this.sandParticles); this.sandParticles = null; }
    // Reset portal cooldown so player doesn't immediately re-enter
    this.portalCooldown = 4;
    this.currentZone = zoneId;
    const def = ZONES[zoneId];
    (this.scene.fog as THREE.FogExp2).color.set(def.fogColor);
    (this.scene.fog as THREE.FogExp2).density = def.fogDensity;
    this.scene.background = new THREE.Color(def.skyBottom);
    this.ambient.color.set(def.ambientColor);
    this.sun.color.set(def.sunColor);
    if (zoneId === 'city') {
      this.playerPos.set(0, 0, 10);
      this.cityGroup.visible = true;
      for (const i of this.cityInteractables) i.mesh.visible = true;
      this.waterMesh.visible = true; this.terrain.visible = true;
      this.colliders = [...this.cityColliders]; // restore city walls
    } else {
      this.cityGroup.visible = false;
      for (const i of this.cityInteractables) i.mesh.visible = false;
      this.waterMesh.visible = false;
      this.colliders = []; // no invisible walls in zones
      this.playerPos.set(0, 0, 8);
      this.buildZoneTerrain(def);
      this.spawnZoneMonsters(def, zoneId);
      this.buildReturnPortal();
      if (zoneId === 'volcano') this.buildLavaParticles();
      if (zoneId === 'ice') this.buildSnowParticles();
      if (zoneId === 'forest') this.buildRainParticles();
      if (zoneId === 'desert') this.buildSandParticles();
    }
    this.playerMesh.position.copy(this.playerPos);
    this.playerTarget.copy(this.playerPos);
    this.playerMoving = false;

    // Quest: reaching a new zone
    if (zoneId !== 'city') this.updateReachQuest(zoneId);
  }

  buildZoneTerrain(def: (typeof ZONES)[ZoneId]) {
    const geo = new THREE.PlaneGeometry(320, 320, 80, 80); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i); const z = pos.getZ(i);
      pos.setY(i, Math.sin(x * 0.03 + z * 0.02) * 1.5 + Math.cos(x * 0.05) * 1);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ color: def.groundColor });
    const mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = true;
    this.scene.add(mesh); this.zoneObjects.push(mesh);
    // Trees
    if (def.treeCount > 0) this.buildNatureTrees(0, 0, 15, 120, def.treeCount, def.treeColor, def.treeStyle);
    // Rocks
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2; const d = 15 + Math.random() * 60;
      const rx = Math.cos(a) * d; const rz = Math.sin(a) * d;
      const rGeo = new THREE.DodecahedronGeometry(1 + Math.random() * 3, 0);
      const rMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(def.groundColor).multiplyScalar(0.6).getHex() });
      const rock = new THREE.Mesh(rGeo, rMat); rock.position.set(rx, 0, rz); rock.rotation.y = Math.random() * Math.PI;
      rock.castShadow = true; this.scene.add(rock); this.zoneObjects.push(rock);
    }
  }

  buildReturnPortal() {
    const color = 0x8844ff;
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x5a5060, emissive: color, emissiveIntensity: 0.2 });
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.75, 6, 0.75), mat); left.position.set(-2.2, 3, 0); left.castShadow = true; g.add(left);
    const right = left.clone(); right.position.x = 2.2; g.add(right);
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.75, 0.75), mat); top.position.set(0, 6.38, 0); g.add(top);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 5.5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    fill.name = 'portalFill'; fill.position.set(0, 3.1, 0.05); g.add(fill);
    const groundRing = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.6, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    groundRing.rotation.x = -Math.PI / 2; groundRing.position.y = 0.03; g.add(groundRing);
    const ringGeo = new THREE.BufferGeometry(); const ringCount = 24; const ringPos = new Float32Array(ringCount * 3);
    for (let k = 0; k < ringCount; k++) { const a = (k / ringCount) * Math.PI * 2; ringPos[k * 3] = Math.cos(a) * 2.4; ringPos[k * 3 + 1] = 3.1 + Math.sin(a) * 2.8; ringPos[k * 3 + 2] = 0.1; }
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
    const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({ color, size: 0.18, transparent: true, opacity: 0.9 }));
    ring.name = 'particleRing'; g.add(ring);
    const pl = new THREE.PointLight(color, 2.5, 12); pl.position.set(0, 3, 0); pl.name = 'portalLight'; g.add(pl);
    this.portalMeshes.push({ mesh: g, time: 0, color });
    g.position.set(0, 0, 25); this.scene.add(g); this.zoneObjects.push(g);
    const retEntry = { pos: new THREE.Vector3(0, 0, 25), type: 'portal' as const, label: '🏰 Voltar a Prontera', zone: 'city' as ZoneId, mesh: g };
    this.interactables.push(retEntry);
    this.zoneInteractables.push(retEntry);
  }

  buildLavaParticles() {
    const geo = new THREE.BufferGeometry(); const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100; pos[i * 3 + 1] = Math.random() * 3; pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.lavaParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xff4400, size: 0.3, transparent: true, opacity: 0.8 }));
    this.scene.add(this.lavaParticles);
  }

  buildSnowParticles() {
    const geo = new THREE.BufferGeometry(); const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120; pos[i * 3 + 1] = Math.random() * 20 + 2; pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.snowParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xeeeeff, size: 0.2, transparent: true, opacity: 0.7 }));
    this.scene.add(this.snowParticles);
  }

  buildRainParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 500;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-0.5)*80;
      pos[i*3+1] = Math.random()*30;
      pos[i*3+2] = (Math.random()-0.5)*80;
      vel[i] = 8 + Math.random()*6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    (geo as any).userData = { vel };
    this.rainParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xaaddff, size: 0.12, transparent: true, opacity: 0.6 }));
    this.scene.add(this.rainParticles);
    this.zoneObjects.push(this.rainParticles);
  }

  buildSandParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-0.5)*100;
      pos[i*3+1] = Math.random()*8;
      pos[i*3+2] = (Math.random()-0.5)*100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.sandParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xddaa44, size: 0.2, transparent: true, opacity: 0.5 }));
    this.scene.add(this.sandParticles);
    this.zoneObjects.push(this.sandParticles);
  }

  spawnZoneMonsters(def: (typeof ZONES)[ZoneId], zoneId: ZoneId) {
    if (!def.monsters.length) return;
    const rng = zoneRng(zoneId);
    const count = 45 + Math.floor(rng() * 15);
    for (let i = 0; i < count; i++) {
      const md = def.monsters[i % def.monsters.length];
      const a = rng() * Math.PI * 2; const dist = 12 + rng() * 55;
      const x = Math.cos(a) * dist; const z = Math.sin(a) * dist;
      const scale = 0.9 + rng() * 0.4;
      const mesh = this.createMonsterMesh(md.color, md.shape, scale);
      mesh.position.set(x, 0, z); this.scene.add(mesh); this.zoneObjects.push(mesh);
      this.monsters.push({
        id: `${zoneId}_m${i}`, name: md.name, icon: md.icon,
        hp: md.hp * scale, maxHp: md.hp * scale,
        xp: md.xp, gold: md.gold, level: md.level, mesh,
        pos: new THREE.Vector3(x, 0, z), speed: 2.5 + rng() * 1.5,
        atk: md.atk, def: md.def, aggroed: false, attackTimer: 0, state: 'idle',
        hitFlashTimer: 0, deathTimer: 0, chaseTimer: 0,
      });
    }
    // Spawn 3 boss variants of the zone's strongest monster
    if (def.monsters.length > 0) {
      const bossMd = def.monsters[def.monsters.length - 1];
      for (let b = 0; b < 3; b++) {
        const a = rng() * Math.PI * 2; const dist = 40 + rng() * 30;
        const x = Math.cos(a) * dist; const z = Math.sin(a) * dist;
        const bossScale = 1.8;
        const mesh = this.createMonsterMesh(
          new THREE.Color(bossMd.color).lerp(new THREE.Color(0xff0000), 0.3).getHex(),
          'boss', bossScale
        );
        mesh.position.set(x, 0, z); this.scene.add(mesh); this.zoneObjects.push(mesh);
        this.monsters.push({
          id: `${zoneId}_boss${b}`, name: `[BOSS] ${bossMd.name}`, icon: '👑',
          hp: bossMd.hp * 5, maxHp: bossMd.hp * 5,
          xp: bossMd.xp * 8, gold: bossMd.gold * 6, level: bossMd.level + 5, mesh,
          pos: new THREE.Vector3(x, 0, z), speed: 3.5,
          atk: bossMd.atk * 2, def: bossMd.def * 2, aggroed: false, attackTimer: 0, state: 'idle',
          hitFlashTimer: 0, deathTimer: 0, chaseTimer: 0,
        });
      }
    }
  }

  buildNatureTrees(ox: number, oz: number, minDist: number, maxDist: number, count: number, color: number, style: string, parent?: THREE.Object3D) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2; const d = minDist + Math.random() * (maxDist - minDist);
      const x = ox + Math.cos(a) * d; const z = oz + Math.sin(a) * d;
      const tree = this.buildTree(x, z, 0.6 + Math.random() * 0.9, color, style, parent);
      if (!parent) this.zoneObjects.push(tree);
    }
  }

  buildTree(x: number, z: number, scale: number, color: number, style: string, parent?: THREE.Object3D): THREE.Group {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 1.6 * scale, 6), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
    trunk.position.y = 0.8 * scale; trunk.castShadow = true; g.add(trunk);
    if (style === 'dead') {
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 4), new THREE.MeshLambertMaterial({ color: 0x3a2a1a })); b1.position.set(0.4, 1.8, 0); b1.rotation.z = -0.6; g.add(b1);
      const b2 = b1.clone(); b2.position.set(-0.35, 2, 0); b2.rotation.z = 0.5; g.add(b2);
    } else if (style === 'palm') {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 3.5, 6), new THREE.MeshLambertMaterial({ color: 0x8B6914 })); stem.position.y = 1.75; stem.castShadow = true; g.add(stem);
      for (let k = 0; k < 6; k++) {
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.6, 2.5, 6), new THREE.MeshLambertMaterial({ color })); leaf.position.set(0, 3.7, 0); leaf.rotation.z = 0.9; leaf.rotation.y = (k / 6) * Math.PI * 2; leaf.castShadow = true; g.add(leaf);
      }
    } else if (style === 'pine') {
      for (let k = 0; k < 4; k++) {
        const r = (1.4 - k * 0.25) * scale; const h = (1.8 - k * 0.15) * scale;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.8 + k * 0.1).getHex() }));
        leaf.position.y = (1.6 + k * 0.85) * scale; leaf.castShadow = true; g.add(leaf);
      }
    } else {
      const colors = [color, new THREE.Color(color).multiplyScalar(1.2).getHex(), new THREE.Color(color).multiplyScalar(0.7).getHex()];
      for (let k = 0; k < 3; k++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry((1.1 - k * 0.15) * scale, 7, 7), new THREE.MeshLambertMaterial({ color: colors[k] }));
        leaf.position.set(k === 1 ? -0.3 * scale : k === 2 ? 0.3 * scale : 0, (1.5 + k * 0.7) * scale, k === 1 ? 0.2 * scale : k === 2 ? -0.2 * scale : 0);
        leaf.castShadow = true; g.add(leaf);
      }
    }
    g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2; (parent ?? this.scene).add(g); return g;
  }

  buildMountains() {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2; const d = 115 + Math.random() * 35;
      const x = Math.cos(a) * d; const z = Math.sin(a) * d; const h = 26 + Math.random() * 22; const r = 18 + Math.random() * 14;
      const geo = new THREE.ConeGeometry(r, h, 8 + Math.floor(Math.random() * 3));
      const g = 0.28 + Math.random() * 0.18;
      const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(g, g * 0.93, g).getHex() });
      const m = new THREE.Mesh(geo, mat); m.position.set(x, h / 2, z); m.rotation.y = Math.random() * Math.PI; this.cityGroup.add(m);
    }
  }

  buildSky() {
    const geo = new THREE.SphereGeometry(350, 32, 16);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { topColor: { value: new THREE.Color(0x000510) }, bottomColor: { value: new THREE.Color(0x0a0520) } },
      vertexShader: `varying vec3 vWP; void main(){ vWP=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 topColor,bottomColor; varying vec3 vWP; void main(){ float h=normalize(vWP).y*.5+.5; gl_FragColor=vec4(mix(bottomColor,topColor,h),1.);}`,
      side: THREE.BackSide,
    });
    this.cityGroup.add(new THREE.Mesh(geo, this.skyMat));
  }

  buildStars() {
    const geo = new THREE.BufferGeometry(); const count = 2500; const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2; const p = Math.acos(2 * Math.random() - 1); const r = 260 + Math.random() * 30;
      pos[i * 3] = r * Math.sin(p) * Math.cos(t); pos[i * 3 + 1] = Math.abs(r * Math.cos(p)) + 5; pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0 }));
    this.scene.add(this.stars);
  }

  buildFireflies() {
    const geo = new THREE.BufferGeometry(); const count = 100; const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - 0.5) * 80; pos[i * 3 + 1] = 0.5 + Math.random() * 3.5; pos[i * 3 + 2] = (Math.random() - 0.5) * 80; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.fogParticles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x88ff44, size: 0.22, transparent: true, opacity: 0.7 }));
    this.fogParticles.visible = false; this.scene.add(this.fogParticles);
  }

  // ── PLAYER MESH ────────────────────────────────────────────────────────────
  createPlayerMesh(cls: ClassName): THREE.Group {
    const g = new THREE.Group();
    const c = CLASS_COLORS[cls];
    const mk = (color: number, emissiveInt = 0) => new THREE.MeshLambertMaterial({ color, emissive: emissiveInt > 0 ? color : 0, emissiveIntensity: emissiveInt });
    const skin = 0xf4c2a0;
    const dark = new THREE.Color(c).multiplyScalar(0.45).getHex();
    const light = Math.min(0xffffff, new THREE.Color(c).addScalar(0.18).getHex());

    // ── HEAD ────────────────────────────────────────────────────────────────
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), mk(skin));
    head.position.y = 1.65; head.castShadow = true; g.add(head);
    // Eyes
    const eGeo = new THREE.BoxGeometry(0.1, 0.07, 0.06);
    [-0.14, 0.14].forEach(x => { const e = new THREE.Mesh(eGeo, mk(0x111111)); e.position.set(x, 1.68, 0.29); g.add(e); });
    // Mouth
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.06), mk(0x442222));
    mouth.position.set(0, 1.6, 0.29); g.add(mouth);

    // ── TORSO ───────────────────────────────────────────────────────────────
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.95, 0.44), mk(c));
    torso.position.y = 0.99; torso.castShadow = true; g.add(torso);
    // Center line
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.7, 0.46), mk(dark));
    line.position.set(0, 0.95, 0); g.add(line);
    // Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.11, 0.46), mk(dark));
    belt.position.y = 0.54; g.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.48), mk(0xddbb44));
    buckle.position.set(0, 0.54, 0); g.add(buckle);

    // ── ARMS ────────────────────────────────────────────────────────────────
    const makeArm = (side: number, name: string) => {
      const grp = new THREE.Group(); grp.position.set(side * 0.5, 1.25, 0); grp.name = name;
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.24), mk(c)); upper.position.y = -0.22; upper.castShadow = true; grp.add(upper);
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.2), mk(skin)); lower.position.y = -0.61; grp.add(lower);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), mk(skin)); hand.position.y = -0.85; grp.add(hand);
      return grp;
    };
    g.add(makeArm(-1, 'armL')); g.add(makeArm(1, 'armR'));

    // ── LEGS ────────────────────────────────────────────────────────────────
    const makeLeg = (side: number, name: string) => {
      const grp = new THREE.Group(); grp.position.set(side * 0.2, 0.66, 0); grp.name = name;
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.46, 0.3), mk(dark)); upper.position.y = -0.23; upper.castShadow = true; grp.add(upper);
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.26), mk(dark)); lower.position.y = -0.64; grp.add(lower);
      return grp;
    };
    g.add(makeLeg(-1, 'legL')); g.add(makeLeg(1, 'legR'));
    // Boots
    const bootDark = new THREE.Color(dark).multiplyScalar(0.6).getHex();
    [-0.2, 0.2].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.46), mk(bootDark)); b.position.set(x, 0.09, 0.07); g.add(b); });

    // ── SHOULDER PADS (heavy classes) ────────────────────────────────────────
    if (cls === 'warrior' || cls === 'paladin') {
      [-0.54, 0.54].forEach(x => {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.38), mk(light));
        pad.position.set(x, 1.3, 0); g.add(pad);
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), mk(dark));
        spike.position.set(x, 1.43, 0); g.add(spike);
      });
    }

    // ── CAPE ────────────────────────────────────────────────────────────────
    if (cls === 'warrior' || cls === 'paladin' || cls === 'priest') {
      const capeBar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.1), mk(dark));
      capeBar.position.set(0, 1.4, -0.24); g.add(capeBar);
      const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.1), mk(dark));
      cape.position.set(0, 0.86, -0.24); cape.rotation.x = 0.1; cape.castShadow = true; g.add(cape);
    }

    // ── MAGE ROBE EXTENSION ──────────────────────────────────────────────────
    if (cls === 'mage') {
      const robe = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.52, 0.46), mk(c)); robe.position.y = 0.27; g.add(robe);
      const robeBot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.42), mk(dark)); robeBot.position.y = 0.04; g.add(robeBot);
      // Rune stars on chest
      [[-0.22, 0.85, 0.23], [0.22, 1.1, 0.23]].forEach(([rx, ry, rz]) => {
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), mk(0xffffff, 0.6));
        star.position.set(rx, ry, rz); g.add(star);
      });
    }

    // ── NINJA/ASSASSIN BODY DETAIL ────────────────────────────────────────────
    if (cls === 'ninja' || cls === 'assassin') {
      const wraps = mk(new THREE.Color(c).multiplyScalar(0.7).getHex());
      // Bandage wraps on arms effect via thin layers
      const wrap = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.26), wraps);
      wrap.position.set(0.5, 0.88, 0); g.add(wrap);
      const wrapL = wrap.clone(); wrapL.position.x = -0.5; g.add(wrapL);
    }

    // ── ARCHER QUIVER ────────────────────────────────────────────────────────
    if (cls === 'archer') {
      const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.55, 8), mk(0x8B4513));
      quiver.position.set(-0.42, 1.02, -0.18); quiver.rotation.z = 0.2; g.add(quiver);
      for (let i = 0; i < 3; i++) {
        const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), mk(0xddcc88));
        arrow.position.set(-0.43 + i * 0.03, 1.3 + i * 0.03, -0.18); arrow.rotation.z = 0.18; g.add(arrow);
      }
    }

    // ── HEADGEAR (class-specific) ────────────────────────────────────────────
    this.addHeadgear(g, cls);

    // ── WEAPON ──────────────────────────────────────────────────────────────
    this.addWeaponToMesh(g, cls);

    // ── SHADOW ──────────────────────────────────────────────────────────────
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; g.add(shadow);

    return g;
  }

  addHeadgear(g: THREE.Group, cls: ClassName) {
    const c = CLASS_COLORS[cls];
    const mk = (color: number, emissiveInt = 0) => new THREE.MeshLambertMaterial({ color, emissive: emissiveInt > 0 ? color : 0, emissiveIntensity: emissiveInt });
    const dark = new THREE.Color(c).multiplyScalar(0.45).getHex();

    switch (cls) {
      case 'warrior': {
        // Iron horned helmet
        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.44, 0.67), mk(0x888888)); helm.position.y = 1.9; g.add(helm);
        const noseG = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.08), mk(0x888888)); noseG.position.set(0, 1.72, 0.36); g.add(noseG);
        const hornGeo = new THREE.ConeGeometry(0.09, 0.42, 6);
        [-0.26, 0.26].forEach((x, i) => { const h = new THREE.Mesh(hornGeo, mk(0xbbbbbb)); h.position.set(x, 2.22, 0); h.rotation.z = i === 0 ? -0.3 : 0.3; g.add(h); });
        break;
      }
      case 'mage': {
        // Wizard hat
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 16), mk(dark)); brim.position.y = 1.96; g.add(brim);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.88, 16), mk(c)); cone.position.y = 2.4; g.add(cone);
        // Star on tip
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), mk(0xffd700, 0.9)); star.position.set(0, 2.88, 0); g.add(star);
        // Star glow
        const glow = new THREE.PointLight(0xffd700, 0.6, 3); glow.position.set(0, 2.88, 0); g.add(glow);
        break;
      }
      case 'archer': {
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.67), mk(dark)); hood.position.y = 1.88; g.add(hood);
        const feather = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.04), mk(0xeeddbb)); feather.position.set(0.22, 2.1, -0.06); feather.rotation.z = 0.28; g.add(feather);
        break;
      }
      case 'priest': {
        // Golden halo
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.055, 8, 24), mk(0xffd700, 0.9)); halo.position.y = 2.2; halo.rotation.x = 0.18; g.add(halo);
        const haloGlow = new THREE.PointLight(0xffd700, 0.5, 3); haloGlow.position.set(0, 2.2, 0); g.add(haloGlow);
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.28, 0.65), mk(dark)); hood.position.y = 1.9; g.add(hood);
        break;
      }
      case 'ninja': {
        const mask = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.31, 0.63), mk(0x0a0a1a)); mask.position.y = 1.57; g.add(mask);
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.67), mk(c)); band.position.y = 1.82; g.add(band);
        const knot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.09), mk(c)); knot.position.set(0, 1.74, -0.36); g.add(knot);
        break;
      }
      case 'paladin': {
        // Full visor helmet
        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.67, 0.5, 0.69), mk(dark)); helm.position.y = 1.9; g.add(helm);
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.16, 0.08), mk(0xffd700, 0.5)); visor.position.set(0, 1.9, 0.36); g.add(visor);
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), mk(0xdd2222)); plume.position.set(0, 2.18, 0); g.add(plume);
        const plumeTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.3), mk(0xdd2222)); plumeTop.position.set(0, 2.45, -0.06); g.add(plumeTop);
        break;
      }
      case 'assassin': {
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.67, 0.48, 0.69), mk(0x110811)); hood.position.y = 1.9; g.add(hood);
        // Glowing eyes replace normal ones
        const glowEye = mk(c, 1.2);
        [-0.13, 0.13].forEach(x => { const eye = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.06), glowEye); eye.position.set(x, 1.7, 0.3); g.add(eye); });
        // Eye glow light
        const eyeLight = new THREE.PointLight(c, 0.4, 2); eyeLight.position.set(0, 1.7, 0.4); g.add(eyeLight);
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.28, 0.06), mk(0x080408)); cloth.position.set(0, 1.57, 0.3); g.add(cloth);
        break;
      }
    }
  }

  addWeaponToMesh(g: THREE.Group, cls: ClassName) {
    const c = CLASS_COLORS[cls];
    const mk = (color: number, emissiveInt = 0) => new THREE.MeshLambertMaterial({ color, emissive: emissiveInt > 0 ? color : 0, emissiveIntensity: emissiveInt });
    const dark = new THREE.Color(c).multiplyScalar(0.45).getHex();

    if (cls === 'warrior') {
      // Greatsword
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.09), mk(0x4a3010)); grip.position.set(0.8, 1.02, 0); g.add(grip);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.09), mk(0x999999)); guard.position.set(0.8, 1.2, 0); g.add(guard);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.35, 0.06), mk(0xdddddd)); blade.position.set(0.8, 1.93, 0); blade.name = 'weapon'; g.add(blade);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), mk(0xcccccc)); tip.position.set(0.8, 2.67, 0); g.add(tip);
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.08), mk(c, 0.7)); rune.position.set(0.8, 1.9, 0); g.add(rune);
    } else if (cls === 'paladin') {
      // Holy longsword
      const grip2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.09), mk(0xddaa44)); grip2.position.set(0.8, 1.15, 0); g.add(grip2);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.09), mk(0xffd700)); crossH.position.set(0.8, 1.3, 0); g.add(crossH);
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.2, 0.06), mk(0xeeeeff)); blade2.position.set(0.8, 1.95, 0); g.add(blade2);
      const holyGlow = new THREE.PointLight(0xffffaa, 0.8, 3); holyGlow.position.set(0.8, 1.9, 0); g.add(holyGlow);
      // Big kite shield
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.9, 0.1), mk(c)); shield.position.set(-0.8, 0.98, 0); g.add(shield);
      const shCH = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.12), mk(0xffd700)); shCH.position.set(-0.8, 0.98, 0.06); g.add(shCH);
      const shCV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.12), mk(0xffd700)); shCV.position.set(-0.8, 0.98, 0.06); g.add(shCV);
    } else if (cls === 'mage') {
      // Magic staff
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.052, 1.9, 7), mk(0x5c2e00)); staff.position.set(0.8, 1.45, 0); g.add(staff);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), mk(c, 0.9)); orb.position.set(0.8, 2.42, 0); orb.name = 'orb'; g.add(orb);
      const orbLight = new THREE.PointLight(c, 1.5, 5); orbLight.position.set(0.8, 2.42, 0); g.add(orbLight);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const spine = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), mk(c, 0.5));
        spine.position.set(0.8 + Math.cos(a) * 0.28, 2.42, Math.sin(a) * 0.28); g.add(spine);
      }
    } else if (cls === 'archer') {
      // Elven bow
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.055, 7, 22, Math.PI), mk(0x6B4C11));
      bow.position.set(0.8, 1.2, 0); bow.rotation.z = Math.PI / 2; g.add(bow);
      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 4), mk(0xdddddd)); string.position.set(0.8, 1.2, 0); g.add(string);
    } else if (cls === 'ninja') {
      // Dual short swords with glow
      [-0.8, 0.8].forEach((x, i) => {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.04), mk(0xcccccc)); blade.position.set(x, 1.05, 0.05 * (i === 0 ? 1 : -1)); g.add(blade);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.07), mk(0x444444)); guard.position.set(x, 0.68, 0); g.add(guard);
        const glint = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.06), mk(c, 0.6)); glint.position.set(x, 1.0, 0); g.add(glint);
      });
    } else if (cls === 'priest') {
      // Blessed staff
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.65, 8), mk(0xddcc88)); staff.position.set(0.8, 1.33, 0); g.add(staff);
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.06), mk(0xffd700)); crossV.position.set(0.8, 2.24, 0); g.add(crossV);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.07), mk(0xffd700)); crossH.position.set(0.8, 2.1, 0); g.add(crossH);
      const holyGlow2 = new THREE.PointLight(0xffffa0, 0.8, 4); holyGlow2.position.set(0.8, 2.2, 0); g.add(holyGlow2);
    } else if (cls === 'assassin') {
      // Dual poison daggers
      [[-0.8, 0.95, -0.05], [0.8, 1.05, 0.05]].forEach(([x, y, z]) => {
        const dBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.04), mk(0xaaaaaa)); dBlade.position.set(x, y, z); g.add(dBlade);
        const dTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), mk(0xaaaaaa)); dTip.position.set(x, y + 0.43, z); g.add(dTip);
        const poison = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.06), mk(dark, 0.5)); poison.position.set(x, y + 0.1, z); g.add(poison);
      });
    }
  }

  // ── MONSTER MESH ──────────────────────────────────────────────────────────
  createMonsterMesh(color: number, shape: string, scale: number): THREE.Group {
    const g = new THREE.Group(); const mat = new THREE.MeshLambertMaterial({ color });
    const darkMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.5).getHex() });
    if (shape === 'sphere') {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.55 * scale, 10, 8), mat); body.position.y = 0.55 * scale; body.castShadow = true; g.add(body);
      const eGeo = new THREE.SphereGeometry(0.09, 6, 6); const eMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      for (const dx of [-0.2, 0.2]) { const e = new THREE.Mesh(eGeo, eMat); e.position.set(dx * scale, 0.7 * scale, 0.5 * scale); g.add(e); }
    } else if (shape === 'humanoid') {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.52 * scale, 0.52 * scale, 0.52 * scale), mat); head.position.y = 1.55 * scale; head.castShadow = true; g.add(head);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.64 * scale, 0.85 * scale, 0.38 * scale), mat); body.position.y = 0.98 * scale; body.castShadow = true; g.add(body);
      const lL = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.7 * scale, 0.25 * scale), darkMat); lL.position.set(-0.18 * scale, 0.37 * scale, 0); g.add(lL);
      const lR = lL.clone(); lR.position.x = 0.18 * scale; g.add(lR);
    } else if (shape === 'quad') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9 * scale, 0.65 * scale, 1.2 * scale), mat); body.position.y = 0.6 * scale; body.castShadow = true; g.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55 * scale, 0.5 * scale, 0.6 * scale), new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.75).getHex() })); head.position.set(0, 0.9 * scale, 0.55 * scale); head.castShadow = true; g.add(head);
      for (const [lx, lz] of [[-0.3, -0.45], [0.3, -0.45], [-0.3, 0.35], [0.3, 0.35]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18 * scale, 0.55 * scale, 0.18 * scale), darkMat); leg.position.set(lx * scale, 0.22 * scale, lz * scale); g.add(leg);
      }
    } else { // boss
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.1 * scale, 1.3 * scale, 0.7 * scale), mat); body.position.y = 0.85 * scale; body.castShadow = true; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.5 * scale, 8, 8), new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(1.3).getHex() })); head.position.y = 1.85 * scale; head.castShadow = true; g.add(head);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.3 * scale, 6, 6), mat);
      const sL = shoulder.clone(); sL.position.set(-0.75 * scale, 1.3 * scale, 0); g.add(sL);
      const sR = shoulder.clone(); sR.position.set(0.75 * scale, 1.3 * scale, 0); g.add(sR);
      // Boss glow aura
      const aura = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
      aura.rotation.x = -Math.PI / 2; aura.position.y = 0.02; g.add(aura);
      const bossLight = new THREE.PointLight(color, 1.5, 8); bossLight.position.y = 1; g.add(bossLight);
    }
    // HP bar
    const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide }));
    hpBg.position.set(0, (shape === 'boss' ? 2.5 : 2.0) * scale, 0); hpBg.renderOrder = 1; hpBg.name = 'hpbg'; g.add(hpBg);
    const hpFg = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x00ff44, side: THREE.DoubleSide }));
    hpFg.position.set(0, (shape === 'boss' ? 2.5 : 2.0) * scale, 0.01); hpFg.name = 'hpbar'; g.add(hpFg);
    return g;
  }

  // ── INPUT ────────────────────────────────────────────────────────────────
  bindInput() {
    window.addEventListener('keydown', e => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    this.canvas.addEventListener('mousemove', e => {
      const r = this.canvas.getBoundingClientRect();
      this.mousePos.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    });
    // Zoom with scroll wheel
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.camDist = THREE.MathUtils.clamp(this.camDist + e.deltaY * 0.03, CAM_DIST_MIN, CAM_DIST_MAX);
    }, { passive: false });
    // Right-mouse drag = rotate camera
    let rmbDown = false; let rmbLastX = 0;
    this.canvas.addEventListener('mousedown', e => { if (e.button === 2) { rmbDown = true; rmbLastX = e.clientX; } });
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('mouseup', e => { if (e.button === 2) rmbDown = false; });
    window.addEventListener('mousemove', e => { if (rmbDown) { this.camAngle += (e.clientX - rmbLastX) * 0.008; rmbLastX = e.clientX; } });
    // Left-click on monster = attack
    this.canvas.addEventListener('click', e => {
      this.raycaster.setFromCamera(this.mousePos, this.camera);
      for (const m of this.monsters) {
        if (m.state === 'dead') continue;
        const hits = this.raycaster.intersectObject(m.mesh, true);
        if (hits.length > 0) { this.attackNearMonster(); return; }
      }
      this.handleClick();
    });
    window.addEventListener('resize', () => { const w = this.canvas.clientWidth; const h = this.canvas.clientHeight; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h); });
  }

  handleClick() {
    // Check interactables first
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const target = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, target)) {
      this.playerTarget.copy(target); this.playerTarget.y = 0; this.playerMoving = true;
      this.clickIndicator.position.copy(target); this.clickIndicator.position.y = 0.06; this.clickIndicator.visible = true;
      setTimeout(() => { this.clickIndicator.visible = false; }, 700);
    }
  }

  // ── GAME LOOP ─────────────────────────────────────────────────────────────
  loop() {
    if (this.disposed) return;
    this.animFrame = requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.drawMinimap();
  }

  update(dt: number) {
    this.animTime += dt; this.waterTime += dt;
    this.updateTransition(dt);
    this.updateTimeOfDay(dt);
    this.updatePlayerMovement(dt);
    this.updatePlayerAnimation(dt);
    this.updateAttackAnimation(dt);
    this.updateMonsters(dt);
    this.updateSlashEffects(dt);
    this.updateDmgNumbers(dt);
    this.updateAtmosphere(dt);
    this.updateNPCWalkers(dt);
    // Animate merchant NPCs (gentle bob + sway)
    if (this.cityGroup.visible) {
      const t = this.animTime;
      this.cityGroup.traverse(child => {
        if (child.name === 'merchantNPC') {
          child.position.y = Math.sin(t * 1.2 + child.position.x) * 0.04;
          child.rotation.y = Math.sin(t * 0.5 + child.position.z * 0.3) * 0.3;
        }
      });
    }
    this.updateLootDrops(dt);
    // Projectile updates
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.target.state === 'dead') { this.scene.remove(p.mesh); this.projectiles.splice(i, 1); continue; }
      const tPos = p.target.pos.clone().setY(1.5);
      const dir = tPos.clone().sub(p.mesh.position).normalize();
      p.mesh.position.addScaledVector(dir, p.speed * dt);
      if (p.mesh.position.distanceTo(tPos) < 0.7) {
        this.dealDamageToMonster(p.target, p.dmg);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
    this.smoothCamera();
    this.updateAutoPlay(dt);
    this.updatePortalAnimations(dt);
    if (this.portalCooldown > 0) this.portalCooldown -= dt;
    // Auto-save every 30s
    this.saveTimer += dt;
    if (this.saveTimer >= 30) { this.saveTimer = 0; this.triggerSave(); }
    if (this.keys.has('h')) { this.keys.delete('h'); this.heal(50); }
    if (this.keys.has('f')) { this.keys.delete('f'); this.interactNearest(); }
    // Multiplayer: send position every 100ms
    this.multiSendTimer += dt;
    if (this.multiConnected && this.multiWs && this.multiWs.readyState === 1 && this.multiSendTimer > 0.1) {
      this.multiSendTimer = 0;
      this.multiWs.send(JSON.stringify({ type: 'move', x: +this.playerPos.x.toFixed(2), z: +this.playerPos.z.toFixed(2), dir: +Math.atan2(this.playerDir.x, this.playerDir.z).toFixed(3), zone: this.currentZone }));
    }
    // HP/MP regen
    this.regenTimer += dt;
    if (this.regenTimer >= 3) {
      this.regenTimer = 0;
      if (this.playerStats.hp < this.playerStats.maxHp) {
        this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + Math.max(1, Math.floor(this.playerStats.maxHp * 0.015)));
      }
      if (this.playerStats.mp < this.playerStats.maxMp) {
        this.playerStats.mp = Math.min(this.playerStats.maxMp, this.playerStats.mp + Math.max(1, Math.floor(this.playerStats.maxMp * 0.025)));
      }
      this.onStatsUpdate?.(this.playerStats);
    }

    // Interpolate remote players
    for (const rp of this.remotePlayers.values()) {
      rp.pos.lerp(rp.targetPos, Math.min(1, dt * 10));
      rp.mesh.position.copy(rp.pos);
      rp.mesh.visible = rp.zone === this.currentZone;
    }
    this.onState(this.buildState());
  }

  updateAutoPlay(dt: number) {
    if (!this.autoPlay) return;
    this.autoPlayTimer += dt; this.autoPlayAttackTimer += dt;

    // Stuck detection: if hasn't moved 0.5u in 2.5s, unstuck
    const movedDist = this.playerPos.distanceTo(this.autoPlayLastPos);
    if (movedDist > 0.5) {
      this.autoPlayLastPos.copy(this.playerPos);
      this.autoPlayStuckTimer = 0;
    } else {
      this.autoPlayStuckTimer += dt;
      if (this.autoPlayStuckTimer > 2.5) {
        // Teleport away from obstacle
        const angle = Math.random() * Math.PI * 2;
        this.playerPos.x += Math.cos(angle) * 5;
        this.playerPos.z += Math.sin(angle) * 5;
        this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -120, 120);
        this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -120, 120);
        this.autoPlayStuckTimer = 0;
        this.autoPlayLastPos.copy(this.playerPos);
        return;
      }
    }

    const near = this.getNearMonster();
    if (near) {
      const dist = near.pos.distanceTo(this.playerPos);
      if (dist > 2.2) {
        const dir = near.pos.clone().sub(this.playerPos).normalize();
        this.playerPos.add(dir.multiplyScalar(PLAYER_SPEED * dt * 0.9));
        this.playerDir.copy(dir); this.playerMoving = true;
      } else if (this.autoPlayAttackTimer > 0.85) {
        this.autoPlayAttackTimer = 0; this.attackNearMonster();
      }
    } else {
      // No monster near — search wider area (spiral outward from center)
      const angle = this.autoPlayTimer * 0.8;
      const radius = 15 + (this.autoPlayTimer % 10) * 4;
      const tx = Math.cos(angle) * Math.min(radius, 80);
      const tz = Math.sin(angle) * Math.min(radius, 80);
      const dir = new THREE.Vector3(tx - this.playerPos.x, 0, tz - this.playerPos.z);
      if (dir.length() > 2) {
        dir.normalize().multiplyScalar(PLAYER_SPEED * dt * 0.8);
        this.playerPos.add(dir); this.playerDir.copy(dir.normalize()); this.playerMoving = true;
      }
    }
  }

  triggerSave() {
    if (this.onSave) this.onSave({ kills: this.playerStats.kills, bossKills: this.bossKills, deaths: this.deaths, xp: this.playerStats.xp, level: this.playerStats.level, gold: this.playerStats.gold, zone: this.currentZone });
  }

  updateTransition(dt: number) {
    if (!this.transitioning) return;
    this.transitionAlpha += dt * 2.5 * this.transitionDir;
    if (this.transitionDir === 1 && this.transitionAlpha >= 1) {
      this.transitionAlpha = 1;
      if (this.pendingZone) { this.executeZoneTransition(this.pendingZone); this.pendingZone = null; }
      this.transitionDir = -1;
    } else if (this.transitionDir === -1 && this.transitionAlpha <= 0) {
      this.transitionAlpha = 0; this.transitioning = false;
    }
    this.renderer.setClearColor(0x000000, this.transitionAlpha);
  }

  updateTimeOfDay(dt: number) {
    this.timeOfDay = (this.timeOfDay + dt * 0.00028) % 1; // ~4h real time from day to night
    const t = this.timeOfDay;
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    this.sun.position.set(Math.cos(sunAngle) * 80, Math.sin(sunAngle) * 80, 20);
    let sCol: THREE.Color; let aInt: number; let sInt: number;
    // Night minimum is 0.45 so you can always see — never pitch black
    if (t < 0.25) { const p = t / 0.25; sCol = new THREE.Color().lerpColors(new THREE.Color(0x2a2050), new THREE.Color(0xff9955), p); aInt = 0.45 + p * 0.15; sInt = p * 1.4; }
    else if (t < 0.5) { const p = (t - 0.25) / 0.25; sCol = new THREE.Color().lerpColors(new THREE.Color(0xff9955), new THREE.Color(0xfff8e0), p); aInt = 0.6 + p * 0.4; sInt = 1.4 + p * 0.8; }
    else if (t < 0.75) { const p = (t - 0.5) / 0.25; sCol = new THREE.Color().lerpColors(new THREE.Color(0xfff8e0), new THREE.Color(0xff7733), p); aInt = 1.0 - p * 0.35; sInt = 2.2 - p * 1.5; }
    else { const p = (t - 0.75) / 0.25; sCol = new THREE.Color().lerpColors(new THREE.Color(0xff7733), new THREE.Color(0x2a2050), p); aInt = 0.65 - p * 0.2; sInt = 0.7 - p * 0.7; }
    this.sun.color.copy(sCol); this.sun.intensity = Math.max(0, sInt); this.ambient.intensity = Math.max(0.45, aInt);
    // Update sky dome
    if (this.skyMat) {
      let skyTop: THREE.Color; let skyBot: THREE.Color;
      if (t < 0.25) { const p = t / 0.25; skyTop = new THREE.Color().lerpColors(new THREE.Color(0x000205), new THREE.Color(0x0a1a4a), p); skyBot = new THREE.Color().lerpColors(new THREE.Color(0x0a0520), new THREE.Color(0xff6622), p); }
      else if (t < 0.5) { const p = (t - 0.25) / 0.25; skyTop = new THREE.Color().lerpColors(new THREE.Color(0x0a1a4a), new THREE.Color(0x1a6acc), p); skyBot = new THREE.Color().lerpColors(new THREE.Color(0xff6622), new THREE.Color(0x88ccff), p); }
      else if (t < 0.75) { const p = (t - 0.5) / 0.25; skyTop = new THREE.Color().lerpColors(new THREE.Color(0x1a6acc), new THREE.Color(0x0f3366), p); skyBot = new THREE.Color().lerpColors(new THREE.Color(0x88ccff), new THREE.Color(0xff8844), p); }
      else { const p = (t - 0.75) / 0.25; skyTop = new THREE.Color().lerpColors(new THREE.Color(0x0f3366), new THREE.Color(0x000205), p); skyBot = new THREE.Color().lerpColors(new THREE.Color(0xff8844), new THREE.Color(0x0a0520), p); }
      (this.skyMat.uniforms.topColor.value as THREE.Color).copy(skyTop);
      (this.skyMat.uniforms.bottomColor.value as THREE.Color).copy(skyBot);
      this.skyMat.uniformsNeedUpdate = true;
      this.scene.background = skyBot;
    }
    const isNight = t < 0.22 || t > 0.78;
    if (this.fogParticles) this.fogParticles.visible = isNight && this.currentZone === 'city';
    if (this.stars) (this.stars.material as THREE.PointsMaterial).opacity = isNight ? 0.85 : 0;
    // Night: lamps bright, but scene always readable
    const lampInt = isNight ? 2.5 : 0.2;
    for (const l of this.streetLights) l.intensity = lampInt;
    const baseFog = ZONES[this.currentZone].fogDensity;
    (this.scene.fog as THREE.FogExp2).density = isNight ? baseFog * 1.2 : baseFog * 0.8;
    this.hemi.intensity = isNight ? 0.35 : 0.5;
    // Night ambient color — blue-purple tint instead of black
    this.ambient.color.set(isNight ? 0x1a1a4a : 0x303060);
  }

  updatePlayerMovement(dt: number) {
    // Camera rotation with Z/C (Z=left, C=right) — E is attack, Q is reserved
    const rotSpeed = 1.6 * dt;
    if (this.keys.has('z')) this.camAngle -= rotSpeed;
    if (this.keys.has('c')) this.camAngle += rotSpeed;

    let dx = 0; let dz = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) dz -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dz += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1;
    if (dx !== 0 || dz !== 0) {
      const camDir = new THREE.Vector3(); this.camera.getWorldDirection(camDir); camDir.y = 0; camDir.normalize();
      const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0));
      const move = camDir.clone().multiplyScalar(-dz).add(camRight.clone().multiplyScalar(dx));
      move.normalize();
      // Smooth acceleration
      const accel = 22 * dt;
      this.playerVelX += (move.x * PLAYER_SPEED - this.playerVelX) * accel;
      this.playerVelZ += (move.z * PLAYER_SPEED - this.playerVelZ) * accel;
      this.playerPos.x += this.playerVelX * dt;
      this.playerPos.z += this.playerVelZ * dt;
      if (move.length() > 0.001) this.playerDir.set(this.playerVelX, 0, this.playerVelZ).normalize();
      this.playerMoving = true; this.playerTarget.copy(this.playerPos);
    } else if (this.playerMoving && this.playerTarget.distanceTo(this.playerPos) > 0.12) {
      const dir = this.playerTarget.clone().sub(this.playerPos).normalize();
      const step = dir.multiplyScalar(PLAYER_SPEED * dt);
      if (step.length() >= this.playerTarget.distanceTo(this.playerPos)) {
        this.playerPos.copy(this.playerTarget); this.playerMoving = false;
      } else { this.playerPos.add(step); this.playerDir.copy(dir); }
      // Decelerate velocity
      this.playerVelX *= Math.pow(0.1, dt);
      this.playerVelZ *= Math.pow(0.1, dt);
    } else {
      this.playerMoving = false;
      // Decelerate
      this.playerVelX *= Math.pow(0.05, dt);
      this.playerVelZ *= Math.pow(0.05, dt);
    }
    // Clamp only in city; zones are open world
    if (this.currentZone === 'city') {
      this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -150, 150);
      this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -150, 150);
    } else {
      this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -140, 140);
      this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -140, 140);
    }
    // AABB collision against registered colliders
    for (const box of this.colliders) {
      const margin = 0.4;
      if (this.playerPos.x > box.minX - margin && this.playerPos.x < box.maxX + margin &&
          this.playerPos.z > box.minZ - margin && this.playerPos.z < box.maxZ + margin) {
        // Push out on the axis with least overlap
        const overlapLeft = this.playerPos.x - (box.minX - margin);
        const overlapRight = (box.maxX + margin) - this.playerPos.x;
        const overlapFront = this.playerPos.z - (box.minZ - margin);
        const overlapBack = (box.maxZ + margin) - this.playerPos.z;
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack);
        if (minOverlap === overlapLeft) this.playerPos.x = box.minX - margin;
        else if (minOverlap === overlapRight) this.playerPos.x = box.maxX + margin;
        else if (minOverlap === overlapFront) this.playerPos.z = box.minZ - margin;
        else this.playerPos.z = box.maxZ + margin;
      }
    }
    this.playerMesh.position.copy(this.playerPos);
    this.playerMesh.position.y = 0;
    if (this.playerDir.length() > 0.001) this.playerMesh.rotation.y = Math.atan2(this.playerDir.x, this.playerDir.z);
    this.playerLight.position.set(this.playerPos.x, 3, this.playerPos.z);
  }

  updatePlayerAnimation(dt: number) {
    if (!this.playerMesh) return;
    const armL = this.playerMesh.getObjectByName('armL') as THREE.Group;
    const armR = this.playerMesh.getObjectByName('armR') as THREE.Group;
    const legL = this.playerMesh.getObjectByName('legL') as THREE.Group;
    const legR = this.playerMesh.getObjectByName('legR') as THREE.Group;
    if (!armL || !armR || !legL || !legR) return;
    if (this.playerMoving) {
      const swing = Math.sin(this.animTime * 10) * 0.55;
      armL.rotation.x = swing; armR.rotation.x = -swing;
      legL.rotation.x = -swing * 0.7; legR.rotation.x = swing * 0.7;
      this.playerMesh.position.y = Math.abs(Math.sin(this.animTime * 10)) * 0.08;
    } else {
      const breathe = Math.sin(this.animTime * 1.8) * 0.06;
      armL.rotation.x = breathe * 0.5; armR.rotation.x = breathe * 0.5;
      legL.rotation.x = 0; legR.rotation.x = 0;
      this.playerMesh.scale.y = 1 + Math.sin(this.animTime * 1.8) * 0.005;
      this.playerMesh.position.y = 0;
    }
  }

  updateAttackAnimation(dt: number) {
    if (!this.attacking) return;
    this.attackAnim = Math.min(1, this.attackAnim + dt * 8);
    // Lunge forward then back
    const lunge = Math.sin(this.attackAnim * Math.PI) * 0.55;
    if (this.attackTarget) {
      const dir = this.attackTarget.clone().sub(this.playerPos).normalize();
      this.playerMesh.position.add(dir.multiplyScalar(lunge));
    }
    // Right arm swing hard
    const armR = this.playerMesh.getObjectByName('armR') as THREE.Group;
    if (armR) armR.rotation.x = Math.sin(this.attackAnim * Math.PI) * -1.8;
    // Particle burst at midpoint
    if (this.attackAnim > 0.4 && this.attackAnim < 0.5 && this.attackTarget) {
      this.spawnHitEffect(this.attackTarget.clone(), CLASS_COLORS[this.playerStats.className]);
    }
    if (this.attackAnim >= 1) { this.attacking = false; this.attackAnim = 0; this.attackTarget = null; }
  }

  spawnHitEffect(pos: THREE.Vector3, color: number) {
    const count = 12;
    const geo = new THREE.BufferGeometry(); const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2; const r = 0.2 + Math.random() * 0.5;
      positions[i * 3] = pos.x + Math.cos(a) * r; positions[i * 3 + 1] = pos.y + 0.5 + Math.random(); positions[i * 3 + 2] = pos.z + Math.sin(a) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.18, transparent: true, opacity: 1 });
    const pts = new THREE.Points(geo, mat); this.scene.add(pts);
    // Also add a flash ring
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.8, 20), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.copy(pos); ring.position.y = 0.1; this.scene.add(ring);
    this.slashMeshes.push({ mesh: ring as THREE.Mesh, age: 0 });
    // Fade out pts after 0.4s
    const startTime = Date.now();
    const fade = () => {
      const elapsed = (Date.now() - startTime) / 400;
      if (elapsed >= 1) { this.scene.remove(pts); geo.dispose(); mat.dispose(); return; }
      mat.opacity = 1 - elapsed;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) posAttr.setY(i, posAttr.getY(i) + 0.03);
      posAttr.needsUpdate = true;
      requestAnimationFrame(fade);
    }; fade();
  }

  updateSlashEffects(dt: number) {
    for (let i = this.slashMeshes.length - 1; i >= 0; i--) {
      const s = this.slashMeshes[i]; s.age += dt;
      const p = s.age / 0.35;
      s.mesh.scale.set(1 + p * 2, 1 + p * 2, 1);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.75 * (1 - p));
      if (s.age >= 0.35) { this.scene.remove(s.mesh); this.slashMeshes.splice(i, 1); }
    }
  }

  updateDmgNumbers(dt: number) {
    for (let i = this.dmgNumbers.length - 1; i >= 0; i--) {
      const d = this.dmgNumbers[i]; d.age += dt;
      const p = d.age / 1.2;
      d.y -= 0.8 * dt; // move up in screen
      d.opacity = p < 0.3 ? 1 : Math.max(0, 1 - (p - 0.3) / 0.7);
      d.scale = p < 0.1 ? p / 0.1 * 1.4 : 1 + (1 - p) * 0.2;
      if (d.age >= 1.2) { this.dmgNumbers.splice(i, 1); }
    }
  }

  spawnDmgNumber(worldPos: THREE.Vector3, value: number, color: string) {
    // Project to screen
    const pos = worldPos.clone().project(this.camera);
    const x = (pos.x * 0.5 + 0.5) * this.canvas.clientWidth;
    const y = (-pos.y * 0.5 + 0.5) * this.canvas.clientHeight;
    this.dmgNumbers.push({ id: dmgIdCounter++, x, y, value, color, age: 0, opacity: 1, scale: 0 });
  }

  updateMonsters(dt: number) {
    for (const m of this.monsters) {
      if (m.state === 'dead') {
        m.deathTimer += dt;
        if (m.deathTimer < 0.6) {
          m.mesh.position.y = -m.deathTimer * 1.5;
          m.mesh.rotation.z = m.deathTimer * 3;
        } else { m.mesh.visible = false; }
        continue;
      }
      m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);
      m.attackTimer = Math.max(0, m.attackTimer - dt);
      const dist = m.pos.distanceTo(this.playerPos);
      // Aggro: only if player attacks first (aggroed=true) OR very close (< 3.5)
      if (!m.aggroed && dist < 3.5) m.aggroed = true;
      if (m.aggroed && dist > 40) { m.aggroed = false; m.chaseTimer = 0; }
      if (m.aggroed || m.state === 'chase') {
        if (dist < 1.4) {
          m.state = 'attack'; m.chaseTimer = 0;
          if (m.attackTimer <= 0) { this.monsterAttack(m); m.attackTimer = 1.8; }
        } else {
          m.state = 'chase'; m.chaseTimer += dt;
          if (m.chaseTimer > 5) { m.aggroed = false; m.chaseTimer = 0; }
          else {
            const dir = this.playerPos.clone().sub(m.pos).normalize();
            m.pos.add(dir.multiplyScalar(m.speed * dt));
            m.mesh.rotation.y = Math.atan2(this.playerPos.x - m.pos.x, this.playerPos.z - m.pos.z);
          }
        }
      } else {
        m.state = 'idle';
        m.pos.x += Math.sin(this.animTime * 0.4 + m.pos.z * 0.1) * 0.012;
        m.pos.z += Math.cos(this.animTime * 0.4 + m.pos.x * 0.1) * 0.012;
      }
      m.mesh.position.copy(m.pos);
      m.mesh.position.y = m.state === 'idle' ? Math.sin(this.animTime * 1.5 + m.pos.x) * 0.06 : 0;
      // HP bar update
      const hpBar = m.mesh.getObjectByName('hpbar') as THREE.Mesh;
      if (hpBar) {
        const ratio = Math.max(0, m.hp / m.maxHp);
        hpBar.scale.x = ratio;
        hpBar.position.x = (ratio - 1) * 0.5;
        (hpBar.material as THREE.MeshBasicMaterial).color.setHex(ratio > 0.5 ? 0x00ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222);
        hpBar.lookAt(this.camera.position);
        const hpBg = m.mesh.getObjectByName('hpbg') as THREE.Mesh;
        if (hpBg) hpBg.lookAt(this.camera.position);
      }
      // Hit flash
      if (m.hitFlashTimer > 0) {
        m.mesh.traverse(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial && child.name !== 'hpbar' && child.name !== 'hpbg') {
            child.material.emissive.set(0xff2200); child.material.emissiveIntensity = m.hitFlashTimer * 3;
          }
        });
      } else {
        m.mesh.traverse(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
            child.material.emissiveIntensity = 0;
          }
        });
      }
    }
  }

  monsterAttack(m: Monster3D) {
    const dmg = Math.max(1, m.atk - this.playerStats.def + Math.floor(Math.random() * 6));
    this.playerStats.hp = Math.max(0, this.playerStats.hp - dmg);
    this.triggerCameraShake(0.35);
    this.spawnDmgNumber(this.playerPos.clone().add(new THREE.Vector3(0, 2, 0)), dmg, '#ff4444');
    this.addLog(`💥 ${m.name} causou ${dmg} de dano!`);
    if (this.playerStats.hp <= 0) {
      this.playerStats.hp = 0;
      this.deaths++;
      this.addLog('💀 Derrotado! Ressuscitando em Prontera...');
      // Deaggro all monsters immediately
      for (const m of this.monsters) { m.aggroed = false; m.state = 'idle'; }
      setTimeout(() => {
        this.playerStats.hp = Math.floor(this.playerStats.maxHp * 0.5);
        this.playerStats.mp = Math.floor(this.playerStats.maxMp * 0.5);
        // Return to city ONLY on death
        if (this.currentZone !== 'city') this.enterZone('city');
        else { this.playerPos.set(0, 0, 10); this.playerTarget.copy(this.playerPos); }
      }, 2500);
    }
  }

  updateAtmosphere(dt: number) {
    if (this.lavaParticles) {
      const pos = this.lavaParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i) + dt * (1 + i * 0.01);
        pos.setY(i, y > 8 ? Math.random() * 0.5 : y);
      }
      pos.needsUpdate = true;
    }
    if (this.snowParticles) {
      const pos = this.snowParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i) - dt * (0.5 + Math.random() * 0.5);
        pos.setY(i, y < 0 ? 20 + Math.random() * 5 : y);
        pos.setX(i, pos.getX(i) + Math.sin(this.animTime + i) * 0.02);
      }
      pos.needsUpdate = true;
    }
    if (this.rainParticles) {
      const pos = (this.rainParticles.geometry.attributes.position as THREE.BufferAttribute);
      const vel = (this.rainParticles.geometry as any).userData.vel as Float32Array;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - vel[i] * dt;
        if (y < -2) y = 30;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
    if (this.sandParticles) {
      const pos = (this.sandParticles.geometry.attributes.position as THREE.BufferAttribute);
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + (1.5 + Math.sin(i)*0.5) * dt;
        if (x > 50) x = -50;
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }
    if (this.fogParticles?.visible) {
      const pos = this.fogParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, 0.5 + Math.sin(this.animTime * 0.9 + i * 1.4) * 1.5);
        pos.setX(i, pos.getX(i) + Math.sin(this.animTime * 0.25 + i) * 0.02);
        pos.setZ(i, pos.getZ(i) + Math.cos(this.animTime * 0.25 + i) * 0.02);
      }
      pos.needsUpdate = true;
      (this.fogParticles.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(this.animTime * 2.5) * 0.2;
    }
    // Water shimmer
    if (this.waterMesh?.visible) {
      const wPos = this.waterMesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < wPos.count; i++) {
        const x = wPos.getX(i); const z = wPos.getZ(i);
        wPos.setY(i, Math.sin(x * 0.5 + this.waterTime * 2) * 0.06 + Math.cos(z * 0.4 + this.waterTime * 1.5) * 0.04);
      }
      wPos.needsUpdate = true; this.waterMesh.geometry.computeVertexNormals();
    }
  }

  updatePortalAnimations(dt: number) {
    for (const p of this.portalMeshes) {
      p.time += dt;
      // Anel do chão gira
      const ring = p.mesh.getObjectByName('particleRing');
      if (ring) ring.rotation.z += dt * 0.9;
      // Fill vertical pulsa opacidade
      const fill = p.mesh.getObjectByName('portalFill') as THREE.Mesh;
      if (fill && fill.material instanceof THREE.MeshBasicMaterial) {
        fill.material.opacity = 0.28 + Math.sin(p.time * 2.5) * 0.18;
      }
      // Luz pulsa intensidade
      const light = p.mesh.getObjectByName('portalLight') as THREE.PointLight;
      if (light) light.intensity = 3.5 + Math.sin(p.time * 3) * 1.2;
      // Cristais no topo giram levemente
      p.mesh.traverse(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.OctahedronGeometry) {
          child.rotation.y += dt * 1.5;
          child.position.y = (child.position.y > 6 ? child.position.y : 7.3) + Math.sin(p.time * 2 + child.position.x) * 0.002;
        }
      });
    }
  }

  smoothCamera() {
    const tx = this.playerPos.x + Math.sin(this.camAngle) * this.camDist;
    const tz = this.playerPos.z + Math.cos(this.camAngle) * this.camDist;
    this.camera.position.x += (tx - this.camera.position.x) * 0.08;
    this.camera.position.y += (CAM_HEIGHT - this.camera.position.y) * 0.08;
    this.camera.position.z += (tz - this.camera.position.z) * 0.08;
    // Apply camera shake
    if (this.camShakeMag > 0.001) {
      this.camShakeX = (Math.random() - 0.5) * this.camShakeMag;
      this.camShakeY = (Math.random() - 0.5) * this.camShakeMag * 0.5;
      this.camShakeMag *= this.camShakeDecay;
      this.camera.position.x += this.camShakeX;
      this.camera.position.y += this.camShakeY;
    } else { this.camShakeMag = 0; }
    this.camera.lookAt(this.playerPos.x + this.camShakeX * 0.3, 0, this.playerPos.z + this.camShakeX * 0.3);
  }

  triggerCameraShake(intensity: number) {
    this.camShakeMag = intensity;
    this.camShakeDecay = 0.75;
    if (this.onCameraShake) this.onCameraShake();
  }

  // ── MINIMAP ───────────────────────────────────────────────────────────────
  drawMinimap() {
    const canvas = this.minimapCanvas; if (!canvas) return;
    const ctx = canvas.getContext('2d')!; const W = canvas.width; const H = canvas.height;
    const scale = W / 160; const cx = W / 2; const cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    const zoneDef = ZONES[this.currentZone];
    const bgColor = `#${zoneDef.fogColor.toString(16).padStart(6, '0')}`;
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H);
    if (this.currentZone === 'city') {
      ctx.fillStyle = '#3a3020'; ctx.fillRect(cx - 35 * scale, cy - 35 * scale, 70 * scale, 70 * scale);
      ctx.strokeStyle = '#6a5a4a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - W * 0.45, cy); ctx.lineTo(cx + W * 0.45, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - H * 0.45); ctx.lineTo(cx, cy + H * 0.45); ctx.stroke();
      // Portals on minimap
      for (const intr of this.interactables) {
        if (intr.type === 'portal' && intr.zone) {
          const pd = ZONES[intr.zone]; const px = intr.pos.x * scale + cx; const pz = intr.pos.z * scale + cy;
          ctx.fillStyle = `#${pd.portalColor.toString(16).padStart(6, '0')}`;
          ctx.beginPath(); ctx.arc(px, pz, 3, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else {
      // Zone: draw trees as dots
      for (const obj of this.zoneObjects) {
        if (obj instanceof THREE.Group && obj.children.length > 1) {
          ctx.fillStyle = `#${zoneDef.treeColor?.toString(16).padStart(6, '0') ?? '2d7a2d'}`;
          ctx.fillRect(obj.position.x * scale * 0.3 + cx - 1, obj.position.z * scale * 0.3 + cy - 1, 2, 2);
        }
      }
    }
    // Monsters
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const mx = m.pos.x * scale * 0.3 + cx; const mz = m.pos.z * scale * 0.3 + cy;
      ctx.fillStyle = m.aggroed ? '#ff3333' : '#ff8800';
      ctx.beginPath(); ctx.arc(mx, mz, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    // Player
    const ppx = this.playerPos.x * scale * 0.3 + cx; const ppz = this.playerPos.z * scale * 0.3 + cy;
    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(ppx, ppz, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ppx, ppz, 4.5, 0, Math.PI * 2); ctx.stroke();
    // Zone name
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, H - 16, W, 16);
    ctx.fillStyle = '#fff'; ctx.font = `bold ${8 * scale}px monospace`; ctx.textAlign = 'center';
    ctx.fillText(ZONES[this.currentZone].icon + ' ' + ZONES[this.currentZone].name, W / 2, H - 4);
    // Compass
    ctx.fillStyle = '#ffd700'; ctx.font = `bold ${9 * scale}px monospace`; ctx.fillText('N', W / 2, 11);
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.strokeRect(0, 0, W, H);
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  private dealDamageToMonster(m: any, dmg: number) {
    m.hp -= dmg;
    m.aggroed = true; m.chaseTimer = 0;
    m.hitFlashTimer = 0.12;
    import('../systems/SoundSystem').then(mod => mod.getSoundSystem().playHit()).catch(() => {});
    this.spawnDmgNumber(m.pos.clone().add(new THREE.Vector3(0, 2, 0)), dmg, '#ff4444');
    if (m.hp <= 0) {
      this.onMonsterDead?.(m);
      this.killMonster(m);
    }
  }

  attackNearMonster() {
    const cls = (this.playerStats.className || '').toLowerCase();
    const isRanged = cls === 'archer' || cls === 'mage';
    const maxDist = isRanged ? 14 : 3.5;

    let nearest: Monster3D | null = null;
    let nearestDist = maxDist;
    for (const m of this.monsters) {
      if (m.state === 'dead') continue;
      const d = this.playerPos.distanceTo(m.pos);
      if (d < nearestDist) { nearest = m; nearestDist = d; }
    }
    if (!nearest) return;

    import('../systems/SoundSystem').then(mod => mod.getSoundSystem().playAttack()).catch(() => {});

    if (isRanged) {
      // Ranged: spawn projectile
      const projColor = cls === 'mage' ? 0x8833ff : 0xddaa44;
      const geo = cls === 'mage'
        ? new THREE.SphereGeometry(0.18, 8, 8)
        : new THREE.CylinderGeometry(0.04, 0.04, 0.55, 6);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: projColor }));
      mesh.position.copy(this.playerPos).setY(1.5);
      this.scene.add(mesh);
      const isCrit = Math.random() < 0.22;
      const dmg = Math.max(1, Math.floor(this.playerStats.atk * (1 + Math.random() * 0.5)) - nearest.def) * (isCrit ? 2 : 1);
      this.projectiles.push({ mesh, target: nearest, speed: 18, dmg });
      this.playerMesh.rotation.y = Math.atan2(nearest.pos.x - this.playerPos.x, nearest.pos.z - this.playerPos.z);
      this.addLog(isCrit ? `⚡ CRÍTICO! -${dmg} em ${nearest.name}!` : `🏹 -${dmg} em ${nearest.name}`);
    } else {
      // Melee: existing logic
      const m = nearest;
      if (!m.aggroed) m.aggroed = true;
      this.attacking = true; this.attackAnim = 0;
      this.attackTarget = m.pos.clone().add(new THREE.Vector3(0, 0.8, 0));
      const isCrit = Math.random() < 0.22;
      const dmg = Math.max(1, Math.floor(this.playerStats.atk * (1 + Math.random() * 0.5)) - m.def) * (isCrit ? 2 : 1);
      m.hp = Math.max(0, m.hp - dmg); m.hitFlashTimer = isCrit ? 0.35 : 0.18;
      const col = isCrit ? '#ffd700' : '#ff4444';
      if (isCrit) {
        this.triggerCameraShake(0.25);
        for (let k = 0; k < 3; k++) this.spawnHitEffect(m.pos.clone().add(new THREE.Vector3((Math.random()-0.5)*1.2, k*0.4+0.3, (Math.random()-0.5)*1.2)), CLASS_COLORS[this.playerStats.className]);
      } else {
        this.spawnHitEffect(m.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), CLASS_COLORS[this.playerStats.className]);
      }
      this.spawnDmgNumber(m.pos.clone().add(new THREE.Vector3(0, 2, 0)), dmg, col);
      this.addLog(isCrit ? `⚡ CRÍTICO! -${dmg} em ${m.name}!` : `⚔️ -${dmg} em ${m.name}`);
      if (m.hp <= 0) this.killMonster(m);
    }
  }

  killMonster(m: Monster3D) {
    m.state = 'dead'; m.deathTimer = 0; m.aggroed = false;
    const isBoss = m.name.startsWith('[BOSS]') || m.name.startsWith('⚡');
    if (isBoss) this.bossKills++;
    this.playerStats.xp += m.xp; this.playerStats.gold += m.gold; this.playerStats.kills++;
    this.playerStats.totalXp = (this.playerStats.totalXp || 0) + m.xp;
    this.spawnDmgNumber(m.pos.clone().add(new THREE.Vector3(0, 2.5, 0)), m.xp, '#9b59b6');
    this.addLog(isBoss ? `👑 BOSS ${m.name} derrotado! +${m.xp * 3}XP +${m.gold * 3}G!` : `🏆 ${m.name} derrotado! +${m.xp}XP +${m.gold}G`);
    if (isBoss) { this.playerStats.xp += m.xp * 2; this.playerStats.gold += m.gold * 2; }
    if (this.playerStats.xp >= this.playerStats.xpNext) this.levelUp();
    if (this.onKill) this.onKill(m.name);

    // Spawn loot drops
    this.spawnLootDrops(m, isBoss);

    // Update kill quests
    this.updateKillQuests(m.name);

    setTimeout(() => {
      if (!m.mesh.parent) return;
      m.hp = m.maxHp; m.state = 'idle'; m.mesh.visible = true;
      m.mesh.position.y = 0; m.mesh.rotation.z = 0;
      const a = Math.random() * Math.PI * 2; const d = 15 + Math.random() * 40;
      m.pos.set(Math.cos(a) * d, 0, Math.sin(a) * d); m.mesh.position.copy(m.pos);
    }, 12000);
  }

  spawnLootDrops(m: Monster3D, isBoss: boolean) {
    const zone = this.currentZone === 'city' ? 'forest' : this.currentZone;
    const drops = rollDrops(zone, isBoss);
    drops.forEach((item, i) => {
      const angle = (i / Math.max(drops.length, 1)) * Math.PI * 2;
      const radius = 1.2 + i * 0.4;
      const dropPos = new THREE.Vector3(
        m.pos.x + Math.cos(angle) * radius,
        0,
        m.pos.z + Math.sin(angle) * radius
      );

      // Orb mesh
      const orbColor = RARITY_COLORS[item.rarity];
      const geo = new THREE.SphereGeometry(0.35, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: orbColor, transparent: true, opacity: 0.9 });
      const orb = new THREE.Mesh(geo, mat);
      orb.position.copy(dropPos);
      orb.position.y = 0.5;

      // Glow ring
      const ringGeo = new THREE.RingGeometry(0.5, 0.7, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: orbColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;

      const group = new THREE.Group();
      group.add(orb);
      group.add(ring);
      group.position.copy(dropPos);
      this.scene.add(group);

      this.lootDrops.push({ item, mesh: group, pos: dropPos.clone(), age: 0 });
    });
  }

  updateLootDrops(dt: number) {
    const toRemove: number[] = [];
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const drop = this.lootDrops[i];
      drop.age += dt;

      // Spin + bob animation
      drop.mesh.rotation.y += dt * 2;
      drop.mesh.children[0].position.y = 0.5 + Math.sin(drop.age * 3) * 0.15;

      // Auto-expire after 45s
      if (drop.age > 45) {
        this.scene.remove(drop.mesh);
        toRemove.push(i);
        continue;
      }

      // Pickup range
      const dist = this.playerPos.distanceTo(drop.pos);
      if (dist < 2.5) {
        this.collectLoot(drop);
        this.scene.remove(drop.mesh);
        toRemove.push(i);
      }
    }
    for (const i of toRemove) this.lootDrops.splice(i, 1);
  }

  collectLoot(drop: { item: LootItem; pos: THREE.Vector3 }) {
    const item = drop.item;
    const existing = this.inventory.find(i => i.name === item.name);
    if (existing) {
      existing.qty++;
    } else {
      this.inventory.push({
        name: item.name,
        icon: item.icon,
        qty: 1,
        type: item.type === 'equippable' ? `equippable:${item.slot}` : item.type,
        desc: `[${item.rarity.toUpperCase()}] Valor: ${item.value}G`,
      });
    }
    this.addLog(`💎 ${item.icon} ${item.name} coletado! [${item.rarity}]`);
    this.spawnDmgNumber(drop.pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0, item.rarity === 'legendary' ? '#f39c12' : item.rarity === 'epic' ? '#9b59b6' : '#2ecc71');

    // Update collect quests
    this.updateCollectQuests(item.id);
  }

  // ── Quest System ──────────────────────────────────────────────────────────

  initQuests() {
    // Only add first quest if none active
    if (this.questProgress.length === 0) {
      this.questProgress.push({ questId: 'q_first_blood', progress: 0, completed: false, claimed: false });
    }
  }

  getActiveQuests(): QuestProgress[] {
    return this.questProgress.filter(q => !q.claimed);
  }

  updateKillQuests(monsterName: string) {
    let changed = false;
    for (const qp of this.questProgress) {
      if (qp.completed || qp.claimed) continue;
      const quest = QUESTS[qp.questId];
      if (!quest || quest.type !== 'kill') continue;
      // Match: empty target = any monster; otherwise check name contains target
      if (quest.target === '' || monsterName.includes(quest.target)) {
        qp.progress++;
        if (qp.progress >= quest.targetCount) {
          qp.completed = true;
          this.addLog(`✅ Quest concluída: ${quest.icon} ${quest.title}!`);
        }
        changed = true;
      }
    }
    // Also check kill_100 / kill_500 (track total kills)
    for (const qp of this.questProgress) {
      if (qp.completed || qp.claimed) continue;
      const quest = QUESTS[qp.questId];
      if (!quest || quest.type !== 'kill' || quest.target !== '') continue;
      // Already updated above via the first loop — skip
    }
    if (changed && this.onQuestUpdate) this.onQuestUpdate([...this.questProgress]);
  }

  updateCollectQuests(itemId: string) {
    let changed = false;
    for (const qp of this.questProgress) {
      if (qp.completed || qp.claimed) continue;
      const quest = QUESTS[qp.questId];
      if (!quest || quest.type !== 'collect') continue;
      if (quest.target === itemId) {
        qp.progress++;
        if (qp.progress >= quest.targetCount) {
          qp.completed = true;
          this.addLog(`✅ Quest concluída: ${quest.icon} ${quest.title}!`);
        }
        changed = true;
      }
    }
    if (changed && this.onQuestUpdate) this.onQuestUpdate([...this.questProgress]);
  }

  updateReachQuest(zoneId: string) {
    let changed = false;
    for (const qp of this.questProgress) {
      if (qp.completed || qp.claimed) continue;
      const quest = QUESTS[qp.questId];
      if (!quest || quest.type !== 'reach') continue;
      if (quest.target === zoneId) {
        qp.progress = 1;
        qp.completed = true;
        this.addLog(`✅ Quest concluída: ${quest.icon} ${quest.title}!`);
        changed = true;
      }
    }
    if (changed && this.onQuestUpdate) this.onQuestUpdate([...this.questProgress]);
  }

  claimQuest(questId: string): boolean {
    const qp = this.questProgress.find(q => q.questId === questId);
    if (!qp || !qp.completed || qp.claimed) return false;
    const quest = QUESTS[questId];
    if (!quest) return false;

    qp.claimed = true;
    this.playerStats.gold += quest.reward.gold;
    this.playerStats.xp += quest.reward.xp;
    if (this.playerStats.xp >= this.playerStats.xpNext) this.levelUp();

    // Grant reward item
    if (quest.reward.itemId) {
      import('../data/loot').then(({ LOOT_ITEMS }) => {
        const li = LOOT_ITEMS[quest.reward.itemId!];
        if (li) {
          const ex = this.inventory.find(i => i.name === li.name);
          if (ex) ex.qty++;
          else this.inventory.push({ name: li.name, icon: li.icon, qty: 1, type: li.type === 'equippable' ? `equippable:${li.slot}` : li.type, desc: `[${li.rarity.toUpperCase()}] Recompensa de Quest` });
        }
      });
    }
    this.addLog(`🎁 Recompensa recebida! +${quest.reward.gold}G +${quest.reward.xp}XP`);

    // Unlock next quest in chain
    if (quest.nextQuest && !this.questProgress.find(q => q.questId === quest.nextQuest)) {
      this.questProgress.push({ questId: quest.nextQuest!, progress: 0, completed: false, claimed: false });
      const next = QUESTS[quest.nextQuest!];
      if (next) this.addLog(`📜 Nova quest: ${next.icon} ${next.title}`);
    }
    // Also unlock kill milestone quests when appropriate
    const totalKills = this.playerStats.kills;
    if (totalKills >= 1 && !this.questProgress.find(q => q.questId === 'q_kill_100')) {
      this.questProgress.push({ questId: 'q_kill_100', progress: totalKills, completed: totalKills >= 100, claimed: false });
    }

    if (this.onQuestUpdate) this.onQuestUpdate([...this.questProgress]);
    return true;
  }

  saveQuestProgress(): QuestProgress[] { return [...this.questProgress]; }
  loadQuestProgress(data: QuestProgress[]) { if (data?.length) this.questProgress = data; }

  levelUp() {
    this.playerStats.level++; this.playerStats.xp -= this.playerStats.xpNext;
    this.playerStats.xpNext = Math.floor(100 * Math.pow(1.15, this.playerStats.level - 1));
    this.playerStats.maxHp += 18; this.playerStats.maxMp += 12; this.playerStats.atk += 2; this.playerStats.def += 1;
    this.playerStats.hp = this.playerStats.maxHp; this.playerStats.mp = this.playerStats.maxMp;
    this.playerSP++;
    this.addLog(`🎉 LEVEL UP! Nível ${this.playerStats.level}! HP/MP restaurados! +1 SP`);
    import('../systems/SoundSystem').then(m => m.getSoundSystem().playLevelUp()).catch(() => {});
    // Burst of golden rings on level up
    for (let ring = 0; ring < 5; ring++) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(ring * 0.5, ring * 0.5 + 0.3, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
      );
      r.rotation.x = -Math.PI / 2; r.position.copy(this.playerPos); r.position.y = 0.05 + ring * 0.05;
      this.scene.add(r); this.slashMeshes.push({ mesh: r, age: -ring * 0.07 });
    }
    this.triggerCameraShake(0.4);
  }

  useSkill(skillId: string, mpCost: number): boolean {
    if (this.playerStats.mp < mpCost) { this.addLog('❌ MP insuficiente!'); return false; }
    this.playerStats.mp -= mpCost;
    const cls = this.playerStats.className;
    const color = CLASS_COLORS[cls];
    // Big burst on player position
    for (let ring = 0; ring < 3; ring++) {
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(ring * 0.6, ring * 0.6 + 0.35, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.copy(this.playerPos); ringMesh.position.y = 0.05;
      this.scene.add(ringMesh);
      this.slashMeshes.push({ mesh: ringMesh, age: -ring * 0.06 });
    }
    const m = this.getNearMonster();
    const skillDmg = Math.floor(this.playerStats.atk * (1.8 + Math.random() * 0.8));
    if (m) {
      m.hp = Math.max(0, m.hp - skillDmg); m.aggroed = true; m.hitFlashTimer = 0.4;
      for (let k = 0; k < 3; k++) this.spawnHitEffect(m.pos.clone().add(new THREE.Vector3((Math.random()-0.5)*1.5, k*0.5+0.5, (Math.random()-0.5)*1.5)), color);
      this.spawnDmgNumber(m.pos.clone().add(new THREE.Vector3(0, 3, 0)), skillDmg, '#cc44ff');
      this.addLog(`✨ ${skillId}: -${skillDmg} em ${m.name}!`);
      if (m.hp <= 0) this.killMonster(m);
    } else { this.addLog(`✨ ${skillId} usada! (sem alvo próximo)`); }
    if (this.multiConnected && this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'attack', target: m?.name ?? '' }));
    }
    return true;
  }

  heal(amount: number) {
    this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + amount);
    this.spawnDmgNumber(this.playerPos.clone().add(new THREE.Vector3(0, 2, 0)), amount, '#2ecc71');
    this.addLog(`💚 +${amount} HP`);
  }

  addToInventory(item: { name: string; icon: string; type: string; desc: string }) {
    const ex = this.inventory.find(i => i.name === item.name);
    if (ex) ex.qty++;
    else this.inventory.push({ ...item, qty: 1 });
  }

  useInventoryItem(name: string): boolean {
    const idx = this.inventory.findIndex(i => i.name === name);
    if (idx < 0) return false;
    const item = this.inventory[idx];
    const s = this.playerStats;
    if (item.type === 'consumable') {
      if (item.name.includes('Vida Grande')) this.heal(250);
      else if (item.name.includes('Poção de Vida')) this.heal(100);
      else if (item.name.includes('Elixir Maior')) { this.heal(300); s.mp = Math.min(s.maxMp, s.mp + 150); }
      else if (item.name.includes('Poção de Mana')) s.mp = Math.min(s.maxMp, s.mp + 100);
      else if (item.name.includes('Elixir de Batalha')) { s.atk += 40; setTimeout(() => s.atk -= 40, 30000); }
      else if (item.name.includes('Escudo de Pedra')) { s.def += 30; setTimeout(() => s.def -= 30, 30000); }
      else if (item.name.includes('XP') || item.name.includes('Pergaminho')) {
        const xpAmt = item.name.includes('Pergaminho') ? 1500 : 500;
        s.xp += xpAmt; if (s.xp >= s.xpNext) this.levelUp();
      }
      this.addLog(`✅ Usou: ${item.icon} ${item.name}`);
      item.qty--;
      if (item.qty <= 0) this.inventory.splice(idx, 1);
      return true;
    }
    return false;
  }

  equipItem(name: string, icon: string, slot: string) {
    // Remove previous item in this slot
    if (this.equipmentMeshes[slot]) {
      this.playerMesh.remove(this.equipmentMeshes[slot]);
      delete this.equipmentMeshes[slot];
    }
    this.equippedItems[slot] = { name, icon, slot };
    // Build and attach visual mesh
    const mesh = this.buildEquipmentMesh(name, slot);
    if (mesh) { this.playerMesh.add(mesh); this.equipmentMeshes[slot] = mesh; }
    this.addLog(`✅ Equipado: ${icon} ${name}`);
  }

  unequipItem(slot: string) {
    if (this.equipmentMeshes[slot]) { this.playerMesh.remove(this.equipmentMeshes[slot]); delete this.equipmentMeshes[slot]; }
    delete this.equippedItems[slot];
  }

  buildEquipmentMesh(name: string, slot: string): THREE.Object3D | null {
    const mk = (color: number, emissiveInt = 0) => new THREE.MeshLambertMaterial({ color, emissive: emissiveInt > 0 ? color : 0, emissiveIntensity: emissiveInt });
    const g = new THREE.Group();

    if (slot === 'weapon') {
      // Determine weapon visual by name
      if (name.includes('Espada') || name.includes('Blade') || name.includes('Sword')) {
        const tier = name.includes('Lendário') || name.includes('5') ? 3 : name.includes('+3') || name.includes('+4') ? 2 : 1;
        const col = tier === 3 ? 0xffd700 : tier === 2 ? 0x88aaff : 0xcccccc;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5 + tier * 0.15, 0.06), mk(col, tier > 1 ? 0.4 : 0));
        blade.position.set(0.85, 1.9, 0); g.add(blade);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.09), mk(0x888888)); guard.position.set(0.85, 1.2, 0); g.add(guard);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), mk(0x5a3010)); grip.position.set(0.85, 1.0, 0); g.add(grip);
        if (tier === 3) { const glow = new THREE.PointLight(col, 1.2, 4); glow.position.set(0.85, 1.9, 0); g.add(glow); }
      } else if (name.includes('Arco') || name.includes('Bow')) {
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.055, 7, 22, Math.PI), mk(0x6B4C11));
        bow.position.set(0.85, 1.25, 0); bow.rotation.z = Math.PI / 2; g.add(bow);
      } else if (name.includes('Cajado') || name.includes('Staff') || name.includes('Orb')) {
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.0, 7), mk(0x5c2e00)); staff.position.set(0.85, 1.5, 0); g.add(staff);
        const col2 = 0xaa44ff;
        const orb2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), mk(col2, 0.9)); orb2.position.set(0.85, 2.55, 0); g.add(orb2);
        const glowLight = new THREE.PointLight(col2, 1.5, 5); glowLight.position.set(0.85, 2.55, 0); g.add(glowLight);
      } else if (name.includes('Adaga') || name.includes('Dagger') || name.includes('Faca')) {
        const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.04), mk(0xaaaaaa)); blade2.position.set(0.85, 1.1, 0); g.add(blade2);
      }
    } else if (slot === 'armor') {
      const tier = name.includes('Lendário') || name.includes('+5') ? 3 : name.includes('+3') || name.includes('Reforcada') ? 2 : 1;
      const col = tier === 3 ? 0xffd700 : tier === 2 ? 0x4488cc : 0x888888;
      // Shoulder pauldrons
      for (const sx of [-0.55, 0.55]) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.4), mk(col, tier > 1 ? 0.2 : 0));
        pad.position.set(sx, 1.32, 0); g.add(pad);
        if (tier >= 2) { const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), mk(col, 0.3)); spike.position.set(sx, 1.47, 0); g.add(spike); }
      }
      if (tier === 3) { const aura = new THREE.PointLight(col, 0.8, 5); aura.position.set(0, 1, 0); g.add(aura); }
    } else if (slot === 'helmet') {
      const tier = name.includes('Lendário') ? 3 : name.includes('+3') || name.includes('Dragão') ? 2 : 1;
      const col = tier === 3 ? 0xffd700 : tier === 2 ? 0x4466aa : 0x888888;
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.67, 0.5, 0.69), mk(col, tier > 1 ? 0.15 : 0)); helm.position.set(0, 1.91, 0); g.add(helm);
      if (tier >= 2) { const visor = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.18, 0.08), mk(col, 0.4)); visor.position.set(0, 1.9, 0.37); g.add(visor); }
      if (tier === 3) { const glow = new THREE.PointLight(col, 0.8, 3); glow.position.set(0, 2.1, 0); g.add(glow); }
    } else if (slot === 'boots') {
      const col = name.includes('Vento') ? 0x00ccff : name.includes('Fogo') ? 0xff4400 : 0x888888;
      for (const bx of [-0.2, 0.2]) {
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.5), mk(col, 0.1)); boot.position.set(bx, 0.1, 0.07); g.add(boot);
      }
    } else if (slot === 'wings') {
      const col = name.includes('Anjo') ? 0xffffff : name.includes('Demônio') || name.includes('Demonio') ? 0xff2200 : name.includes('Dragão') ? 0x44aaff : 0xaa44ff;
      // Left wing
      const wingGeoL = new THREE.ConeGeometry(0.18, 2.2, 4); wingGeoL.rotateZ(0.5); wingGeoL.rotateY(-0.3);
      const wingL = new THREE.Mesh(wingGeoL, mk(col, 0.5)); wingL.position.set(-0.9, 1.0, -0.3); g.add(wingL);
      const wingGeoR = new THREE.ConeGeometry(0.18, 2.2, 4); wingGeoR.rotateZ(-0.5); wingGeoR.rotateY(0.3);
      const wingR = new THREE.Mesh(wingGeoR, mk(col, 0.5)); wingR.position.set(0.9, 1.0, -0.3); g.add(wingR);
      // Wing glow
      const wl = new THREE.PointLight(col, 1.2, 5); wl.position.set(0, 1.0, -0.2); g.add(wl);
      // Secondary feathers
      for (let i = 0; i < 4; i++) {
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.04), mk(col, 0.3));
        fl.position.set(-0.6 - i * 0.12, 0.9 - i * 0.15, -0.25); fl.rotation.z = 0.3 + i * 0.15; g.add(fl);
        const fr = fl.clone(); fr.position.x = 0.6 + i * 0.12; fr.rotation.z = -(0.3 + i * 0.15); g.add(fr);
      }
    } else if (slot === 'shield') {
      const col = name.includes('Sagrado') || name.includes('Holy') ? 0xffd700 : name.includes('Dragão') ? 0x4466aa : 0x888888;
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.92, 0.1), mk(col, 0.15)); shield.position.set(-0.85, 1.0, 0.05); g.add(shield);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.12), mk(0xffd700, 0.3)); cross.position.set(-0.85, 1.0, 0.11); g.add(cross);
    }

    if (g.children.length === 0) return null;
    return g;
  }

  interactNearest() {
    const n = this.getNearInteractable(); if (!n) return;
    if (n.type === 'portal' && n.zone) {
      if (this.portalCooldown > 0) { this.addLog('⏳ Aguarde para usar o portal novamente...'); return; }
      this.enterZone(n.zone); return;
    }
    this.addLog(`🗣️ ${n.label}`);
  }

  addLog(msg: string) { this.combatLog.unshift(msg); if (this.combatLog.length > 8) this.combatLog.pop(); }

  toggleAutoPlay() {
    this.autoPlay = !this.autoPlay;
    this.addLog(this.autoPlay ? '🤖 Modo automático ATIVADO' : '🎮 Modo manual ATIVADO');
  }

  setQuestTarget(monsterName: string | null, zone?: ZoneId) {
    this.activeQuestTarget = monsterName;
    if (zone && zone !== this.currentZone) this.enterZone(zone);
    if (monsterName) { this.autoPlay = true; this.addLog(`🎯 Alvo da missão: ${monsterName}`); }
  }

  markTutorialSeen() { this.tutorialSeen = true; }

  loadFromSave(save: { name?: string; level: number; xp: number; xpNext: number; gold: number; kills: number; hp: number; maxHp: number; mp: number; maxMp: number; atk: number; def: number; skills: Record<string, number>; sp: number; bossKills: number; deaths: number; tutorialSeen: boolean }) {
    Object.assign(this.playerStats, { level: save.level, xp: save.xp, xpNext: save.xpNext, gold: save.gold, kills: save.kills, hp: save.hp, maxHp: save.maxHp, mp: save.mp, maxMp: save.maxMp, atk: save.atk, def: save.def });
    if (save.name) {
      this.playerStats.name = save.name;
      // Update name sprite if mesh already exists
      if (this.playerMesh) {
        const old = this.playerMesh.getObjectByName('nameSprite');
        if (old) this.playerMesh.remove(old);
        this.playerMesh.add(makeNameSprite(save.name, this.playerStats.className, true));
      }
    }
    this.bossKills = save.bossKills; this.deaths = save.deaths; this.tutorialSeen = save.tutorialSeen;
    if (save.skills) this.playerSkills = { ...save.skills };
    if (save.sp != null) this.playerSP = save.sp;
    if ((save as any).questProgress) this.loadQuestProgress((save as any).questProgress);
    if ((save as any).inventory?.length) this.inventory = [...(save as any).inventory];
  }

  updateSkills(skills: Record<string, number>, sp: number) {
    this.playerSkills = { ...skills };
    this.playerSP = sp;
  }

  // ── MULTIPLAYER ──────────────────────────────────────────────────────────
  connectMultiplayer(url: string, playerName: string) {
    if (this.multiWs) this.disconnectMultiplayer();
    let ws: WebSocket;
    try { ws = new WebSocket(url); } catch { this.addLog('❌ URL inválida'); return; }
    this.multiWs = ws;

    ws.onopen = () => {
      this.multiConnected = true;
      ws.send(JSON.stringify({ type: 'join', name: playerName, cls: this.playerStats.className, level: this.playerStats.level, x: +this.playerPos.x.toFixed(2), z: +this.playerPos.z.toFixed(2), zone: this.currentZone, hp: this.playerStats.hp, maxHp: this.playerStats.maxHp }));
    };

    ws.onmessage = (e: MessageEvent) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(e.data as string); } catch { return; }
      if (msg.type === 'init') {
        const plist = msg.players as Array<{ id: string; name: string; cls: ClassName; x: number; z: number; zone: ZoneId }>;
        for (const p of plist) this._addRemotePlayer(p);
        this.addLog(`🌐 Conectado! ${plist.length} jogador(es) online`);
      } else if (msg.type === 'player_join') {
        const p = msg.player as { id: string; name: string; cls: ClassName; x: number; z: number; zone: ZoneId };
        this._addRemotePlayer(p);
        this.addLog(`👋 ${p.name} entrou no jogo!`);
      } else if (msg.type === 'player_leave') {
        this._removeRemotePlayer(msg.id as string);
        this.addLog(`🚪 ${msg.name as string} saiu`);
      } else if (msg.type === 'player_move') {
        const rp = this.remotePlayers.get(msg.id as string);
        if (rp) { rp.targetPos.set(msg.x as number, 0, msg.z as number); if (msg.zone) rp.zone = msg.zone as ZoneId; }
      } else if (msg.type === 'player_zone') {
        const rp = this.remotePlayers.get(msg.id as string);
        if (rp) rp.zone = msg.zone as ZoneId;
      } else if (msg.type === 'chat') {
        this.addLog(`💬 ${msg.name as string}: ${msg.msg as string}`);
        this.onChat?.(msg.name as string, msg.msg as string);
      } else if (msg.type === 'clan_chat') {
        this.onClanChat?.(msg.from as string, msg.text as string);
      } else if (msg.type === 'clan_update') {
        this.onClanUpdate?.(msg.clan);
      } else if (msg.type === 'clan_members') {
        this.onClanMembers?.(msg.members as any[]);
      } else if (msg.type === 'clan_invited') {
        this.onClanUpdate?.(msg.clan);
      } else if (msg.type === 'player_attack') {
        this.addLog(`⚔️ ${msg.name as string} atacou!`);
      } else if (msg.type === 'gm_give') {
        this.playerStats.gold += msg.gold as number;
        this.addLog(msg.msg as string ?? `💰 +${msg.gold}G recebido!`);
        if (msg.role) this.playerRole = msg.role as string;
      } else if (msg.type === 'player_skin') {
        const rp = this.remotePlayers.get(msg.id as string);
        if (rp) this.applyMeshSkin(rp.mesh, msg.skin as string);
      }
    };

    ws.onclose = () => {
      this.multiConnected = false;
      for (const rp of this.remotePlayers.values()) this.scene.remove(rp.mesh);
      this.remotePlayers.clear();
      this.addLog('🔌 Desconectado do servidor');
    };

    ws.onerror = () => { this.addLog('❌ Erro de conexão'); };
  }

  _addRemotePlayer(data: { id: string; name: string; cls: ClassName; x?: number; z?: number; zone?: ZoneId }) {
    if (this.remotePlayers.has(data.id)) return;
    const pos = new THREE.Vector3(data.x ?? 0, 0, data.z ?? 0);
    const mesh = this.createPlayerMesh(data.cls);
    mesh.position.copy(pos);
    mesh.scale.setScalar(0.95);
    const nameSprite = makeNameSprite(data.name, data.cls);
    mesh.add(nameSprite);
    this.scene.add(mesh);
    this.remotePlayers.set(data.id, { mesh, pos: pos.clone(), targetPos: pos.clone(), name: data.name, cls: data.cls, zone: data.zone ?? 'city' });
  }

  _removeRemotePlayer(id: string) {
    const rp = this.remotePlayers.get(id);
    if (rp) { this.scene.remove(rp.mesh); this.remotePlayers.delete(id); }
  }

  sendChat(msg: string) {
    if (this.multiConnected && this.multiWs && this.multiWs.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'chat', msg }));
    }
  }

  sendClanChat(text: string) {
    if (this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'clan_chat', text }));
    }
  }

  inviteToClan(username: string) {
    if (this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'clan_invite', target: username }));
    }
  }

  kickFromClan(username: string) {
    if (this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'clan_kick', target: username }));
    }
  }

  leaveClan() {
    if (this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'clan_leave' }));
    }
  }

  createClan(name: string) {
    if (this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'clan_create', name }));
    }
  }

  disconnectMultiplayer() {
    this.multiWs?.close(); this.multiWs = null; this.multiConnected = false;
    for (const rp of this.remotePlayers.values()) this.scene.remove(rp.mesh);
    this.remotePlayers.clear();
  }

  getOnlinePlayers(): { name: string; cls: string; zone: ZoneId }[] {
    return [...this.remotePlayers.values()].map(rp => ({ name: rp.name, cls: rp.cls, zone: rp.zone }));
  }

  applyMeshSkin(mesh: THREE.Group, skinId: string) {
    import('../data/skins').then(({ SKINS }) => {
      const skin = SKINS.find(s => s.id === skinId);
      if (!skin) return;
      mesh.traverse(child => {
        if (child instanceof THREE.Mesh && child.name !== 'hpbar' && child.name !== 'hpbg' && child.name !== 'nameSprite') {
          const oldMat = child.material as THREE.MeshLambertMaterial;
          const newMat = new THREE.MeshPhongMaterial({
            color: skin.primaryColor !== null ? skin.primaryColor : oldMat.color,
            emissive: skin.emissive !== null ? new THREE.Color(skin.emissive) : new THREE.Color(0x000000),
            emissiveIntensity: skin.emissiveIntensity,
            shininess: skin.emissive !== null ? 80 : 30,
            specular: skin.emissive !== null ? new THREE.Color(skin.emissive).multiplyScalar(0.5) : new THREE.Color(0x444444),
          });
          child.material = newMat;
        }
      });
    });
  }

  setSkin(skinId: string) {
    this.currentSkin = skinId;
    if (skinId === 'default') {
      // Recreate mesh to restore class colors
      const oldPos = this.playerMesh.position.clone();
      const oldRot = this.playerMesh.rotation.clone();
      const nameSprite = this.playerMesh.getObjectByName('nameSprite');
      this.playerLight.position.set(oldPos.x, 3, oldPos.z);
      this.scene.remove(this.playerMesh);
      this.playerMesh = this.createPlayerMesh(this.playerStats.className);
      this.playerMesh.position.copy(oldPos);
      this.playerMesh.rotation.copy(oldRot);
      if (nameSprite) this.playerMesh.add(nameSprite.clone());
      this.scene.add(this.playerMesh);
    } else {
      this.applyMeshSkin(this.playerMesh, skinId);
    }
    if (this.multiConnected && this.multiWs?.readyState === 1) {
      this.multiWs.send(JSON.stringify({ type: 'skin', skin: skinId }));
    }
  }

  dispose() {
    this.disposed = true; cancelAnimationFrame(this.animFrame); this.renderer.dispose();
    this.disconnectMultiplayer();
  }
}
