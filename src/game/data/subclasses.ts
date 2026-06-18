import type { ClassName } from './classes';

export interface SubClass {
  id: string; name: string; icon: string; color: string;
  description: string; requiredLevel: number; requiredQuests: number;
  bonusStats: { hp?: number; mp?: number; atk?: number; def?: number; crit?: number; speed?: number };
  passives: string[];
}

export const SUBCLASSES: Record<ClassName, SubClass[]> = {
  warrior: [
    { id: 'knight', name: 'Cavaleiro', icon: '🛡️⚔️', color: '#c0392b', description: 'Defesa absoluta, líder de batalha.', requiredLevel: 20, requiredQuests: 10, bonusStats: { hp: 200, def: 15 }, passives: ['Escudo Divino: -20% dano recebido', 'Provocação: força monstros a atacar você'] },
    { id: 'berserker', name: 'Berserker', icon: '😡⚔️', color: '#e74c3c', description: 'Destruição pura, ignora defesa inimiga.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 30, hp: -50 }, passives: ['Fúria: +50% ATK abaixo de 30% HP', 'Sangue Frio: crit chance +20%'] },
    { id: 'guardian', name: 'Guardião', icon: '🗡️🛡️', color: '#e67e22', description: 'Protetor do grupo, habilidades de aura.', requiredLevel: 30, requiredQuests: 20, bonusStats: { hp: 150, def: 10, mp: 80 }, passives: ['Aura de Proteção: aliados recebem -15% dano', 'Contra-ataque: 25% chance ao receber dano'] },
  ],
  mage: [
    { id: 'wizard', name: 'Arcano', icon: '🔮⚡', color: '#9b59b6', description: 'Magia destrutiva maximizada.', requiredLevel: 20, requiredQuests: 10, bonusStats: { mp: 200, atk: 25 }, passives: ['Amplificação: +30% dano de skill', 'Mana Overflow: regenera 5% MP por turno'] },
    { id: 'necromancer', name: 'Necromante', icon: '💀🔮', color: '#6c3483', description: 'Magia das trevas, drena vida inimiga.', requiredLevel: 20, requiredQuests: 10, bonusStats: { mp: 150, atk: 20 }, passives: ['Dreno de Vida: 15% do dano converte em HP', 'Invocar Esqueleto: minion de batalha'] },
    { id: 'elementalist', name: 'Elementalista', icon: '🌊🔥', color: '#2980b9', description: 'Domina fogo, gelo e raio.', requiredLevel: 30, requiredQuests: 20, bonusStats: { mp: 180, atk: 22, def: 5 }, passives: ['Combo Elemental: 3 elementos = +100% dano', 'Resistência Elemental: -25% dano mágico'] },
  ],
  archer: [
    { id: 'ranger', name: 'Ranger', icon: '🏹🌿', color: '#27ae60', description: 'Especialista em exploração e emboscada.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 20, def: 5 }, passives: ['Olho de Águia: +30% alcance', 'Furtividade: invisível por 3s ao entrar em zona'] },
    { id: 'hunter', name: 'Caçador', icon: '🏹🐺', color: '#16a085', description: 'Especialista em monstros e bestas.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 25 }, passives: ['+50% XP de monstros', 'Armadilha: paralisa inimigo por 2s'] },
    { id: 'sniper', name: 'Sniper', icon: '🎯🏹', color: '#1abc9c', description: 'Tiros certeiros, dano crítico letal.', requiredLevel: 30, requiredQuests: 20, bonusStats: { atk: 35, hp: -30 }, passives: ['Tiro Perfeito: crit = 3x dano', 'Recarga Rápida: cooldown -40%'] },
  ],
  priest: [
    { id: 'bishop', name: 'Bispo', icon: '✝️👑', color: '#f1c40f', description: 'Curas massivas e bênçãos divinas.', requiredLevel: 20, requiredQuests: 10, bonusStats: { mp: 200, hp: 100 }, passives: ['Cura Superior: +50% efetividade de cura', 'Ressurreição: revive com 50% HP (1x/batalha)'] },
    { id: 'monk', name: 'Monge', icon: '🥊✝️', color: '#f39c12', description: 'Combate corpo a corpo sagrado.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 18, def: 12, hp: 80 }, passives: ['Punho Sagrado: dano físico + sagrado', 'Meditação: regenera MP em combate'] },
    { id: 'oracle', name: 'Oráculo', icon: '🔮✝️', color: '#f1c40f', description: 'Visão do futuro, buffs preditivos.', requiredLevel: 30, requiredQuests: 20, bonusStats: { mp: 180, atk: 15 }, passives: ['Premonição: evade próximo ataque', 'Profecia: +25% XP do grupo'] },
  ],
  ninja: [
    { id: 'shadow', name: 'Sombra', icon: '🌑🌀', color: '#1a252f', description: 'Ataques invisíveis, elimina antes de ser visto.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 28, def: -5 }, passives: ['Ataque Pelas Costas: +100% dano surprise', 'Névoa de Fumaça: 2s invencível'] },
    { id: 'wind', name: 'Vento', icon: '💨🌀', color: '#2980b9', description: 'Velocidade máxima, impossível de acertar.', requiredLevel: 20, requiredQuests: 10, bonusStats: { def: 8, atk: 15 }, passives: ['Evasão Máxima: +35% dodge', 'Passo do Vento: teleporte curto'] },
    { id: 'storm', name: 'Tempestade', icon: '⚡🌀', color: '#00d2ff', description: 'Ataques de raio, paralisa inimigos.', requiredLevel: 30, requiredQuests: 20, bonusStats: { atk: 32, mp: 100 }, passives: ['Raio: 20% chance paralisia', 'Olho da Tempestade: imune a slow'] },
  ],
  paladin: [
    { id: 'crusader', name: 'Cruzado', icon: '⚔️🛡️', color: '#d35400', description: 'Guerra santa, destrói mortos-vivos.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 20, def: 15 }, passives: ['+100% dano contra mortos-vivos', 'Lança Sagrada: projétil de luz'] },
    { id: 'holy_knight', name: 'Cavaleiro Santo', icon: '👑🛡️', color: '#e67e22', description: 'Equilíbrio perfeito entre ataque e defesa.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 15, def: 18, hp: 120 }, passives: ['Escudo de Luz: reflete 20% dano', 'Bênção de Batalha: +15 ATK por 10s'] },
    { id: 'templar', name: 'Templário', icon: '🏰⚔️', color: '#c0392b', description: 'Guerreiro supremo da ordem sagrada.', requiredLevel: 30, requiredQuests: 20, bonusStats: { atk: 25, def: 20, hp: 200, mp: 100 }, passives: ['Sacrifício Divino: -50% HP para +100% ATK', 'Imunidade Sagrada: imune a debuffs'] },
  ],
  assassin: [
    { id: 'shadow_lord', name: 'Senhor das Sombras', icon: '🗡️💀', color: '#8e0c4e', description: 'Mata com um golpe, invisibilidade permanente.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 40, hp: -60 }, passives: ['Golpe Letal: 10% chance morte instantânea', 'Sombra Permanente: furtivo sempre'] },
    { id: 'phantom', name: 'Fantasma', icon: '👤🗡️', color: '#6c0035', description: 'Atravessa paredes, ataca de dentro.', requiredLevel: 20, requiredQuests: 10, bonusStats: { atk: 30, def: -8 }, passives: ['Fase Etérea: atravessa obstáculos', 'Marca da Morte: DOT 3 turnos'] },
    { id: 'viper', name: 'Víbora', icon: '🐍🗡️', color: '#a93226', description: 'Veneno letal, enfraquece antes de matar.', requiredLevel: 30, requiredQuests: 20, bonusStats: { atk: 35, def: 5 }, passives: ['Veneno Letal: -5% HP/s por 10s', 'Colmilhos: penetra toda defesa'] },
  ],
};
