export type WeaponCategory = 'Comum' | 'Aço Rúnico' | 'Elemental' | 'Dracônica' | 'Cósmica' | 'Divina' | 'Primordial';

export type WeaponRarity =
  | 'comum'
  | 'incomum'
  | 'rara'
  | 'epica'
  | 'lendaria'
  | 'mitica'
  | 'ancestral'
  | 'cosmica'
  | 'divina'
  | 'primordial';

export interface WeaponTierData {
  tier: number;
  name: string;
  category: WeaponCategory;
  damage: number;
  sellValue: number;
  buyCost?: number;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  textColor: string;
  lore: string;
}

export interface CraftingInfo {
  type: 'craft' | 'fusion';
  targetTier: number;
  targetRarity?: WeaponRarity;
  startTime: number;
  durationMs: number;
  endTime: number;
  originalTier?: number;
  originalRarity?: WeaponRarity;
  forgeSucceeded?: boolean; // Se a forja aumentou o Tier
  fusionSucceeded?: boolean; // Se a fusão aprimorou a Raridade
  forgeChance?: number; // % chance da forja de subir Tier
  fusionChance?: number; // % chance da fusão de subir Raridade
  effectiveChance?: number;
  isMixedFusion?: boolean;
  sourceRarity?: WeaponRarity;
  rarityJumps?: number; // 0, 1, or 2
  didUpgradeRarity?: boolean;
  upgradeMessage?: string;
}

export interface FusionBoost {
  id: string;
  purchasedAt: number;
  expiresAt: number;
  bonusPercent: number; // 10%
}

export interface WeaponItem {
  id: string; // unique instance id for animations
  tier: number;
  rarity?: WeaponRarity;
  createdTime: number;
  crafting?: CraftingInfo | null;
  enchantExpiresAt?: number; // timestamp quando o encantamento de +1 raridade de 1h expira
  baseRarity?: WeaponRarity; // raridade base antes do encantamento temporário
}

export interface GameStats {
  totalMerged: number;
  totalSold: number;
  totalPurchased: number;
  highestTierUnlocked: number;
  totalCedulasEarned: number;
  totalDiamondsConverted?: number;
  totalCraftsCount?: number;
  doubleCraftTriggerCount?: number;
  totalFailedFusions?: number;
  totalMonstersDefeated?: number;
}

export type ActiveScreen = 'forge' | 'shop' | 'catalog' | 'mastery' | 'battle' | 'rewards';

export interface DailyLoginState {
  streak: number;
  lastClaimDate: string; // YYYY-MM-DD
}

export interface QuestItem {
  id: string;
  title: string;
  category: 'craft' | 'fusion' | 'battle';
  isWeekly: boolean;
  targetCount: number;
  currentCount: number;
  rewardCedulas: number;
  targetRarity?: WeaponRarity;
  claimed: boolean;
}

export interface SeasonPassState {
  monthKey: string; // e.g. "2026-09"
  totalMissionsCompletedThisMonth: number;
  claimedLevels: number[];
  isPremiumUnlocked?: boolean;
  claimedPremiumLevels?: number[];
}

export interface GameSaveState {
  cedulas: number;
  diamantes?: number;
  premiumExpiresAt?: number;
  quickStrikeExpiresAt?: number;
  autoCollectExpiresAt?: number;
  battleSimulationExpiresAt?: number;
  rarityEnchantCharges?: number;
  slots: (WeaponItem | null)[];
  unlockedTiers: number[];
  unlockedRarities?: WeaponRarity[];
  fusionBoosts?: FusionBoost[];
  equippedWeapon?: WeaponItem | null;
  battleStage?: number;
  isAutoAdvanceEnabled?: boolean;
  dailyLogin?: DailyLoginState;
  dailyQuestsDate?: string;
  weeklyQuestsDate?: string;
  quests?: QuestItem[];
  seasonPass?: SeasonPassState;
  dailyAutoFusionDate?: string;
  dailyAutoFusionCount?: number;
  dailyFillBenchDate?: string;
  dailyFillBenchCount?: number;
  dailyBattleResetDate?: string;
  dailyBattleResetCount?: number;
  stats: GameStats;
  soundEnabled: boolean;
  powerSaverMode?: boolean;
  version: number;
}

