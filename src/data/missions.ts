import { QuestItem, WeaponRarity } from '../types/game';
import { formatNumber } from './weapons';

export interface PassReward {
  level: number;
  missionsRequired: number; // level * 10
  cedulas: number;
  diamantes?: number;
  premiumHours?: number;
  amuletoCharges?: number;
  quickStrikeHours?: number;
  description: string;
}

export const PASS_REWARDS: PassReward[] = [
  {
    level: 1,
    missionsRequired: 10,
    cedulas: 200,
    diamantes: 1,
    description: '200 Cédulas + 1 💎 Diamante',
  },
  {
    level: 2,
    missionsRequired: 20,
    cedulas: 300,
    amuletoCharges: 1,
    description: '300 Cédulas + 1 Carga de Amuleto (24h)',
  },
  {
    level: 3,
    missionsRequired: 30,
    cedulas: 500,
    diamantes: 2,
    description: '500 Cédulas + 2 💎 Diamantes',
  },
  {
    level: 4,
    missionsRequired: 40,
    cedulas: 750,
    premiumHours: 1,
    description: '750 Cédulas + 1h Passe VIP Premium',
  },
  {
    level: 5,
    missionsRequired: 50,
    cedulas: 1000,
    diamantes: 3,
    quickStrikeHours: 1,
    description: '1.000 Cédulas + 3 💎 + 1h Golpe Rápido',
  },
  {
    level: 6,
    missionsRequired: 60,
    cedulas: 1250,
    amuletoCharges: 1,
    description: '1.250 Cédulas + 1 Carga de Amuleto (24h)',
  },
  {
    level: 7,
    missionsRequired: 70,
    cedulas: 1500,
    diamantes: 4,
    description: '1.500 Cédulas + 4 💎 Diamantes',
  },
  {
    level: 8,
    missionsRequired: 80,
    cedulas: 1750,
    premiumHours: 2,
    description: '1.750 Cédulas + 2h Passe VIP Premium',
  },
  {
    level: 9,
    missionsRequired: 90,
    cedulas: 2000,
    diamantes: 5,
    description: '2.000 Cédulas + 5 💎 Diamantes',
  },
  {
    level: 10,
    missionsRequired: 100,
    cedulas: 3000,
    diamantes: 10,
    premiumHours: 3,
    amuletoCharges: 2,
    description: '👑 3.000 Cédulas + 10 💎 + 3h VIP + 2 Amuletos',
  },
  {
    level: 11,
    missionsRequired: 110,
    cedulas: 3500,
    diamantes: 5,
    description: '3.500 Cédulas + 5 💎 Diamantes',
  },
  {
    level: 12,
    missionsRequired: 120,
    cedulas: 4000,
    amuletoCharges: 1,
    description: '4.000 Cédulas + 1 Carga de Amuleto',
  },
  {
    level: 13,
    missionsRequired: 130,
    cedulas: 4500,
    diamantes: 6,
    description: '4.500 Cédulas + 6 💎 Diamantes',
  },
  {
    level: 14,
    missionsRequired: 140,
    cedulas: 5000,
    premiumHours: 3,
    description: '5.000 Cédulas + 3h Passe VIP Premium',
  },
  {
    level: 15,
    missionsRequired: 150,
    cedulas: 6000,
    diamantes: 15,
    premiumHours: 3,
    amuletoCharges: 2,
    description: '🏆 6.000 Cédulas + 15 💎 + 3h VIP + 2 Amuletos',
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentWeekKey(): string {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function isPassActivePeriod(): { isActive: boolean; dayOfMonth: number; daysLeft: number } {
  const d = new Date();
  const day = d.getDate();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - day + 1);
  return { isActive: true, dayOfMonth: day, daysLeft };
}

/**
 * Calcula as recompensas da Trilha Premium do Passe (+50% em relação ao Passe Normal).
 */
export function getPassPremiumReward(reward: PassReward): {
  cedulas: number;
  diamantes?: number;
  amuletoCharges?: number;
  premiumHours?: number;
  quickStrikeHours?: number;
  description: string;
} {
  const cedulas = Math.round(reward.cedulas * 1.5);
  const diamantes = reward.diamantes ? Math.max(1, Math.round(reward.diamantes * 1.5)) : undefined;
  const amuletoCharges = reward.amuletoCharges ? Math.max(1, Math.round(reward.amuletoCharges * 1.5)) : undefined;
  const premiumHours = reward.premiumHours ? Math.max(1, Math.round(reward.premiumHours * 1.5)) : undefined;
  const quickStrikeHours = reward.quickStrikeHours ? Math.max(1, Math.round(reward.quickStrikeHours * 1.5)) : undefined;

  const parts: string[] = [];
  parts.push(`${formatNumber(cedulas)} Cédulas`);
  if (diamantes) parts.push(`${diamantes} 💎`);
  if (amuletoCharges) parts.push(`${amuletoCharges}x Amuleto`);
  if (premiumHours) parts.push(`${premiumHours}h VIP`);
  if (quickStrikeHours) parts.push(`${quickStrikeHours}h Golpe`);

  return {
    cedulas,
    diamantes,
    amuletoCharges,
    premiumHours,
    quickStrikeHours,
    description: `👑 ${parts.join(' + ')} (+50% Bônus)`,
  };
}

export function calculateDailyReward(streak: number): number {
  // Dia 1 = 50, Dia 2 = 100, sobe de 50 em 50 até o teto de 1.000 por dia
  const effectiveStreak = Math.max(1, streak);
  return Math.min(1000, effectiveStreak * 50);
}

export function generateDailyQuests(): QuestItem[] {
  return [
    // 1. Crafts Diários
    {
      id: 'daily_craft_comum',
      title: 'Forje 50 armas Comuns',
      category: 'craft',
      isWeekly: false,
      targetCount: 50,
      currentCount: 0,
      rewardCedulas: 50,
      targetRarity: 'comum',
      claimed: false,
    },
    {
      id: 'daily_craft_incomum',
      title: 'Forje 10 armas Incomuns',
      category: 'craft',
      isWeekly: false,
      targetCount: 10,
      currentCount: 0,
      rewardCedulas: 100,
      targetRarity: 'incomum',
      claimed: false,
    },
    {
      id: 'daily_craft_rara',
      title: 'Forje 5 armas Raras',
      category: 'craft',
      isWeekly: false,
      targetCount: 5,
      currentCount: 0,
      rewardCedulas: 150,
      targetRarity: 'rara',
      claimed: false,
    },
    {
      id: 'daily_craft_epica',
      title: 'Forje 3 armas Épicas',
      category: 'craft',
      isWeekly: false,
      targetCount: 3,
      currentCount: 0,
      rewardCedulas: 200,
      targetRarity: 'epica',
      claimed: false,
    },
    {
      id: 'daily_craft_lendaria',
      title: 'Forje 1 arma Lendária',
      category: 'craft',
      isWeekly: false,
      targetCount: 1,
      currentCount: 0,
      rewardCedulas: 300,
      targetRarity: 'lendaria',
      claimed: false,
    },

    // 2. Fusões Diárias
    {
      id: 'daily_fuse_comum',
      title: 'Faça 10 fusões com arma Comum',
      category: 'fusion',
      isWeekly: false,
      targetCount: 10,
      currentCount: 0,
      rewardCedulas: 15,
      targetRarity: 'comum',
      claimed: false,
    },
    {
      id: 'daily_fuse_incomum',
      title: 'Faça 10 fusões com arma Incomum',
      category: 'fusion',
      isWeekly: false,
      targetCount: 10,
      currentCount: 0,
      rewardCedulas: 20,
      targetRarity: 'incomum',
      claimed: false,
    },
    {
      id: 'daily_fuse_rara',
      title: 'Faça 10 fusões com arma Rara',
      category: 'fusion',
      isWeekly: false,
      targetCount: 10,
      currentCount: 0,
      rewardCedulas: 30,
      targetRarity: 'rara',
      claimed: false,
    },
    {
      id: 'daily_fuse_epica',
      title: 'Faça 5 fusões com arma Épica',
      category: 'fusion',
      isWeekly: false,
      targetCount: 5,
      currentCount: 0,
      rewardCedulas: 40,
      targetRarity: 'epica',
      claimed: false,
    },
    {
      id: 'daily_fuse_lendaria',
      title: 'Faça 3 fusões com arma Lendária',
      category: 'fusion',
      isWeekly: false,
      targetCount: 3,
      currentCount: 0,
      rewardCedulas: 60,
      targetRarity: 'lendaria',
      claimed: false,
    },

    // 3. Abates Diários na Arena de Batalha
    {
      id: 'daily_kill_100',
      title: 'Derrote 100 inimigos na Batalha',
      category: 'battle',
      isWeekly: false,
      targetCount: 100,
      currentCount: 0,
      rewardCedulas: 25,
      claimed: false,
    },
    {
      id: 'daily_kill_500',
      title: 'Derrote 500 inimigos na Batalha',
      category: 'battle',
      isWeekly: false,
      targetCount: 500,
      currentCount: 0,
      rewardCedulas: 100,
      claimed: false,
    },
    {
      id: 'daily_kill_1000',
      title: 'Derrote 1.000 inimigos na Batalha',
      category: 'battle',
      isWeekly: false,
      targetCount: 1000,
      currentCount: 0,
      rewardCedulas: 250,
      claimed: false,
    },
  ];
}

export function generateWeeklyQuests(): QuestItem[] {
  // Regra: 5x a quantidade de metas, 3x a recompensa em Cédulas!
  return [
    // 1. Crafts Semanais (5x quantidade, 3x recompensa)
    {
      id: 'weekly_craft_comum',
      title: 'Forje 250 armas Comuns (Semanal)',
      category: 'craft',
      isWeekly: true,
      targetCount: 250, // 50 * 5
      currentCount: 0,
      rewardCedulas: 150, // 50 * 3
      targetRarity: 'comum',
      claimed: false,
    },
    {
      id: 'weekly_craft_incomum',
      title: 'Forje 50 armas Incomuns (Semanal)',
      category: 'craft',
      isWeekly: true,
      targetCount: 50, // 10 * 5
      currentCount: 0,
      rewardCedulas: 300, // 100 * 3
      targetRarity: 'incomum',
      claimed: false,
    },
    {
      id: 'weekly_craft_rara',
      title: 'Forje 25 armas Raras (Semanal)',
      category: 'craft',
      isWeekly: true,
      targetCount: 25, // 5 * 5
      currentCount: 0,
      rewardCedulas: 450, // 150 * 3
      targetRarity: 'rara',
      claimed: false,
    },
    {
      id: 'weekly_craft_epica',
      title: 'Forje 15 armas Épicas (Semanal)',
      category: 'craft',
      isWeekly: true,
      targetCount: 15, // 3 * 5
      currentCount: 0,
      rewardCedulas: 600, // 200 * 3
      targetRarity: 'epica',
      claimed: false,
    },
    {
      id: 'weekly_craft_lendaria',
      title: 'Forje 5 armas Lendárias (Semanal)',
      category: 'craft',
      isWeekly: true,
      targetCount: 5, // 1 * 5
      currentCount: 0,
      rewardCedulas: 900, // 300 * 3
      targetRarity: 'lendaria',
      claimed: false,
    },

    // 2. Fusões Semanais (5x quantidade, 3x recompensa)
    {
      id: 'weekly_fuse_comum',
      title: 'Faça 50 fusões com arma Comum (Semanal)',
      category: 'fusion',
      isWeekly: true,
      targetCount: 50, // 10 * 5
      currentCount: 0,
      rewardCedulas: 45, // 15 * 3
      targetRarity: 'comum',
      claimed: false,
    },
    {
      id: 'weekly_fuse_incomum',
      title: 'Faça 50 fusões com arma Incomum (Semanal)',
      category: 'fusion',
      isWeekly: true,
      targetCount: 50, // 10 * 5
      currentCount: 0,
      rewardCedulas: 60, // 20 * 3
      targetRarity: 'incomum',
      claimed: false,
    },
    {
      id: 'weekly_fuse_rara',
      title: 'Faça 50 fusões com arma Rara (Semanal)',
      category: 'fusion',
      isWeekly: true,
      targetCount: 50, // 10 * 5
      currentCount: 0,
      rewardCedulas: 90, // 30 * 3
      targetRarity: 'rara',
      claimed: false,
    },
    {
      id: 'weekly_fuse_epica',
      title: 'Faça 25 fusões com arma Épica (Semanal)',
      category: 'fusion',
      isWeekly: true,
      targetCount: 25, // 5 * 5
      currentCount: 0,
      rewardCedulas: 120, // 40 * 3
      targetRarity: 'epica',
      claimed: false,
    },
    {
      id: 'weekly_fuse_lendaria',
      title: 'Faça 15 fusões com arma Lendária (Semanal)',
      category: 'fusion',
      isWeekly: true,
      targetCount: 15, // 3 * 5
      currentCount: 0,
      rewardCedulas: 180, // 60 * 3
      targetRarity: 'lendaria',
      claimed: false,
    },

    // 3. Abates Semanais (5x quantidade, 3x recompensa)
    {
      id: 'weekly_kill_500',
      title: 'Derrote 500 inimigos na Batalha (Semanal)',
      category: 'battle',
      isWeekly: true,
      targetCount: 500, // 100 * 5
      currentCount: 0,
      rewardCedulas: 75, // 25 * 3
      claimed: false,
    },
    {
      id: 'weekly_kill_2500',
      title: 'Derrote 2.500 inimigos na Batalha (Semanal)',
      category: 'battle',
      isWeekly: true,
      targetCount: 2500, // 500 * 5
      currentCount: 0,
      rewardCedulas: 300, // 100 * 3
      claimed: false,
    },
    {
      id: 'weekly_kill_5000',
      title: 'Derrote 5.000 inimigos na Batalha (Semanal)',
      category: 'battle',
      isWeekly: true,
      targetCount: 5000, // 1000 * 5
      currentCount: 0,
      rewardCedulas: 750, // 250 * 3
      claimed: false,
    },
  ];
}
