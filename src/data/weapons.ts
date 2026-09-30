import { WeaponTierData } from '../types/game';

export const WEAPON_TIERS: Record<number, WeaponTierData> = {
  1: {
    tier: 1,
    name: 'Adaga Enferrujada',
    category: 'Comum',
    damage: 2,
    sellValue: 2, // Tier 1 = 2 Cédulas
    buyCost: 2,
    accentColor: '#a1a1aa',
    glowColor: 'rgba(161, 161, 170, 0.4)',
    borderColor: 'border-zinc-500/40',
    bgGradient: 'from-zinc-900 to-zinc-800',
    textColor: 'text-zinc-300',
    lore: 'Uma lâmina gasta encontrada nos fundos da forja, mas afiada o bastante para iniciar a jornada.',
  },
  2: {
    tier: 2,
    name: 'Faca Tática de Ferro',
    category: 'Comum',
    damage: 5,
    sellValue: 5,
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    borderColor: 'border-sky-500/50',
    bgGradient: 'from-slate-900 to-sky-950/60',
    textColor: 'text-sky-300',
    lore: 'Lâmina compacta de ferro forjado, balanceada para golpes rápidos e precisos.',
  },
  3: {
    tier: 3,
    name: 'Espada Curta Reforçada',
    category: 'Comum',
    damage: 12,
    sellValue: 12,
    accentColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.4)',
    borderColor: 'border-emerald-500/50',
    bgGradient: 'from-zinc-900 to-emerald-950/60',
    textColor: 'text-emerald-300',
    lore: 'Guarda cruzada e têmpera aprimorada em carvão negro, ideal para infantaria.',
  },
  4: {
    tier: 4,
    name: 'Espada Larga Rúnica',
    category: 'Aço Rúnico',
    damage: 28,
    sellValue: 28,
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    borderColor: 'border-blue-500/50',
    bgGradient: 'from-slate-900 to-blue-950/70',
    textColor: 'text-blue-300',
    lore: 'Gravada com glifos arcanos que vibram levemente ao contato com o ar.',
  },
  5: {
    tier: 5,
    name: 'Machado de Batalha Duplo',
    category: 'Aço Rúnico',
    damage: 65,
    sellValue: 65,
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    borderColor: 'border-purple-500/50',
    bgGradient: 'from-zinc-900 to-purple-950/70',
    textColor: 'text-purple-300',
    lore: 'Lâminas simétricas forjadas em aço negro, capazes de romper armaduras pesadas.',
  },
  6: {
    tier: 6,
    name: 'Cimitarra Flamejante',
    category: 'Elemental',
    damage: 150,
    sellValue: 150,
    accentColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.55)',
    borderColor: 'border-orange-500/60',
    bgGradient: 'from-zinc-900 to-amber-950/70',
    textColor: 'text-orange-300',
    lore: 'Banhada em magma vulcânico, exala labaredas perpétuas ao longo do gume.',
  },
  7: {
    tier: 7,
    name: 'Lança Glacial do Guardião',
    category: 'Elemental',
    damage: 340,
    sellValue: 350,
    accentColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.55)',
    borderColor: 'border-cyan-400/60',
    bgGradient: 'from-slate-900 to-cyan-950/70',
    textColor: 'text-cyan-300',
    lore: 'Cristalizada pelo gelo eterno do pico setentrional, congela instantaneamente seus alvos.',
  },
  8: {
    tier: 8,
    name: 'Martelo do Trovão Místico',
    category: 'Elemental',
    damage: 780,
    sellValue: 800,
    accentColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    borderColor: 'border-yellow-400/60',
    bgGradient: 'from-zinc-900 to-yellow-950/70',
    textColor: 'text-yellow-300',
    lore: 'Condensado com a fúria das tempestades celestes, cada impacto ressoa como trovão.',
  },
  9: {
    tier: 9,
    name: 'Glaive Espectral Sombrio',
    category: 'Dracônica',
    damage: 1800,
    sellValue: 1850,
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    borderColor: 'border-rose-500/60',
    bgGradient: 'from-zinc-900 to-rose-950/70',
    textColor: 'text-rose-300',
    lore: 'Forjada nas cinzas da garganta de um dragão ancestral sob a lua de sangue.',
  },
  10: {
    tier: 10,
    name: 'Katana Dracônica Imperial',
    category: 'Dracônica',
    damage: 4200,
    sellValue: 4300,
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.7)',
    borderColor: 'border-amber-400/70',
    bgGradient: 'from-stone-900 to-amber-950/80',
    textColor: 'text-amber-200',
    lore: 'Dobra de aço ancestral mil vezes repousada em sangue dracônico dourado.',
  },
  11: {
    tier: 11,
    name: 'Alfanje do Firmamento',
    category: 'Cósmica',
    damage: 9800,
    sellValue: 10000,
    accentColor: '#e879f9',
    glowColor: 'rgba(232, 121, 249, 0.7)',
    borderColor: 'border-fuchsia-400/70',
    bgGradient: 'from-zinc-900 to-fuchsia-950/80',
    textColor: 'text-fuchsia-200',
    lore: 'Polida com poeira de nebulosas estelares distantes, reflete a luz das galáxias.',
  },
  12: {
    tier: 12,
    name: 'Lâmina do Vazio Abissal',
    category: 'Cósmica',
    damage: 23000,
    sellValue: 23500,
    accentColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.75)',
    borderColor: 'border-indigo-400/70',
    bgGradient: 'from-slate-950 to-indigo-950/80',
    textColor: 'text-indigo-200',
    lore: 'Consome a matéria em seu redor, distorcendo o espaço-tempo em cada estocada.',
  },
  13: {
    tier: 13,
    name: 'Cetro da Singularidade',
    category: 'Cósmica',
    damage: 54000,
    sellValue: 55000,
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.8)',
    borderColor: 'border-teal-300/80',
    bgGradient: 'from-slate-950 to-teal-950/80',
    textColor: 'text-teal-200',
    lore: 'Contém no ápice o núcleo estabilizado de uma estrela de nêutrons em colapso.',
  },
  14: {
    tier: 14,
    name: 'Foice do Juízo Celestial',
    category: 'Divina',
    damage: 130000,
    sellValue: 130000,
    accentColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.85)',
    borderColor: 'border-amber-200/90',
    bgGradient: 'from-stone-900 via-amber-950/60 to-yellow-950/90',
    textColor: 'text-amber-100',
    lore: 'Empunhada pelos arcanjos da criação para ditar o destino final de mundos inteiros.',
  },
  15: {
    tier: 15,
    name: 'Excalibur Primordial do Infinito',
    category: 'Primordial',
    damage: 320000,
    sellValue: 320000,
    accentColor: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'border-white/90',
    bgGradient: 'from-zinc-950 via-purple-950/70 to-amber-950/70',
    textColor: 'text-white',
    lore: 'O ápice supremo da arte bélica universal. Uma arma capaz de moldar a própria realidade.',
  },
};

export function getWeaponData(tier: number): WeaponTierData {
  return WEAPON_TIERS[tier] || WEAPON_TIERS[1];
}

/**
 * Tempo de craft / fusão em segundos para cada Tier:
 * T1 = 5s
 * T2 = 9s, T3 = 17s, T4 = 30s, T5 = 60s, T6 = 120s
 * Dobrando consecutivamente até o Tier 15
 */
export function getCraftDurationSeconds(tier: number): number {
  switch (tier) {
    case 1:
      return 5;
    case 2:
      return 9;
    case 3:
      return 17;
    case 4:
      return 30;
    case 5:
      return 60;
    case 6:
      return 120;
    case 7:
      return 240;
    case 8:
      return 480;
    case 9:
      return 960;
    case 10:
      return 1920;
    case 11:
      return 3840;
    case 12:
      return 7680;
    case 13:
      return 15360;
    case 14:
      return 30720;
    case 15:
      return 61440;
    default:
      return 5;
  }
}

export function formatDuration(seconds: number): string {
  const rounded = Math.max(0, Math.ceil(seconds));
  if (rounded < 60) return `${rounded}s`;
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  if (m < 60) return `${m}m ${s > 0 ? `${s}s` : ''}`;
  const h = Math.floor(m / 60);
  const remainingM = m % 60;
  return `${h}h ${remainingM > 0 ? `${remainingM}m` : ''}`;
}

export const PRICE_PROGRESSION_TABLE = Object.values(WEAPON_TIERS)
  .sort((a, b) => a.tier - b.tier)
  .map((w) => ({
    tier: w.tier,
    name: w.name,
    sellValue: w.sellValue,
    damage: w.damage,
    category: w.category,
    craftDuration: getCraftDurationSeconds(w.tier),
  }));

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('pt-BR');
}
