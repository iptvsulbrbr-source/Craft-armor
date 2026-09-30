/**
 * Armory Craft - Jogo de Fusão e Craft de Armas (Tier 1 ao 15)
 * 100% Client-Side, LocalStorage, Web Audio API, HTML5 Canvas FX
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Workbench } from './components/Workbench';
import { TierCatalog } from './components/TierCatalog';
import { RarityMasteryCard } from './components/RarityMasteryCard';
import { ShopView } from './components/ShopView';
import { BattleView, MONSTER_NAMES } from './components/BattleView';
import { RewardsView } from './components/RewardsView';
import { BottomNav } from './components/BottomNav';
import { ParticleCanvas, fx } from './components/ParticleCanvas';
import { CodexModal } from './components/CodexModal';
import { StatsModal } from './components/StatsModal';
import { DiamondExchangeModal } from './components/DiamondExchangeModal';
import { FusionBoostModal } from './components/FusionBoostModal';
import { sound } from './utils/audio';
import {
  GameSaveState,
  GameStats,
  WeaponItem,
  WeaponRarity,
  FusionBoost,
  ActiveScreen,
  DailyLoginState,
  QuestItem,
  SeasonPassState,
} from './types/game';
import { getWeaponData, formatNumber, getCraftDurationSeconds, formatDuration } from './data/weapons';
import {
  getRarityData,
  calculateUpgradeMastery,
  calculateDoubleCraftChance,
  rollInitialCraftRarity,
  rollFusionRarity,
  getBaseFusionSuccessChance,
  calculateEffectiveFusionChance,
  calculateFusionSuccessChance,
  getForgeTierSuccessChance,
  getFusionRarityUpgradeChance,
  getAllowedFusionRaritiesLabel,
  isFusionRarityAllowed,
  getNextRarity,
} from './data/rarities';
import {
  generateDailyQuests,
  generateWeeklyQuests,
  getTodayDateString,
  getCurrentWeekKey,
  getCurrentMonthKey,
  PASS_REWARDS,
  calculateDailyReward,
  getPassPremiumReward,
} from './data/missions';
import { calculateEnemyStats, getBattleStageReward, simulateFiveStages, FiveStageSimulationReport } from './data/battle';
import { Trophy, Swords, Crown } from 'lucide-react';

const STORAGE_KEY = 'armory_craft_save_v2';
const INITIAL_CEDULAS = 2; // Jogador começa com 2 de cédulas apenas

const DEFAULT_STATS: GameStats = {
  totalMerged: 0,
  totalSold: 0,
  totalPurchased: 0,
  highestTierUnlocked: 1,
  totalCedulasEarned: 2,
  totalDiamondsConverted: 0,
  totalCraftsCount: 0,
  doubleCraftTriggerCount: 0,
  totalFailedFusions: 0,
  totalMonstersDefeated: 0,
};

export default function App() {
  // Navigation State
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('forge');

  // Game State
  const [cedulas, setCedulas] = useState<number>(INITIAL_CEDULAS);
  const [diamantes, setDiamantes] = useState<number>(0);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<number>(0);
  const [quickStrikeExpiresAt, setQuickStrikeExpiresAt] = useState<number>(0);
  const [autoCollectExpiresAt, setAutoCollectExpiresAt] = useState<number>(0);
  const [battleSimulationExpiresAt, setBattleSimulationExpiresAt] = useState<number>(0);
  const [rarityEnchantCharges, setRarityEnchantCharges] = useState<number>(0);
  const [slots, setSlots] = useState<(WeaponItem | null)[]>(Array(16).fill(null));
  const [unlockedTiers, setUnlockedTiers] = useState<number[]>([1]);
  const [unlockedRarities, setUnlockedRarities] = useState<WeaponRarity[]>(['comum']);
  const [fusionBoosts, setFusionBoosts] = useState<FusionBoost[]>([]);
  const [equippedWeapon, setEquippedWeapon] = useState<WeaponItem | null>(null);
  const [battleStage, setBattleStage] = useState<number>(1);
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [powerSaverMode, setPowerSaverMode] = useState<boolean>(false);

  // Sistema de Login Diário, Missões e Passe
  const [dailyLogin, setDailyLogin] = useState<DailyLoginState>({ streak: 1, lastClaimDate: '' });
  const [dailyQuestsDate, setDailyQuestsDate] = useState<string>(getTodayDateString());
  const [weeklyQuestsDate, setWeeklyQuestsDate] = useState<string>(getCurrentWeekKey());
  const [quests, setQuests] = useState<QuestItem[]>([
    ...generateDailyQuests(),
    ...generateWeeklyQuests(),
  ]);
  const [seasonPass, setSeasonPass] = useState<SeasonPassState>({
    monthKey: getCurrentMonthKey(),
    totalMissionsCompletedThisMonth: 0,
    claimedLevels: [],
    isPremiumUnlocked: false,
    claimedPremiumLevels: [],
  });

  // Limites Diários: Auto-Fusão, Preencher Bancada e Reinício de Batalha
  const [dailyAutoFusionDate, setDailyAutoFusionDate] = useState<string>(getTodayDateString());
  const [dailyAutoFusionCount, setDailyAutoFusionCount] = useState<number>(0);
  const [dailyFillBenchDate, setDailyFillBenchDate] = useState<string>(getTodayDateString());
  const [dailyFillBenchCount, setDailyFillBenchCount] = useState<number>(0);
  const [dailyBattleResetDate, setDailyBattleResetDate] = useState<string>(getTodayDateString());
  const [dailyBattleResetCount, setDailyBattleResetCount] = useState<number>(0);

  // Battle Combat Loop State
  const [isBattlePlaying, setIsBattlePlaying] = useState<boolean>(false);
  const [battleMonsterIndex, setBattleMonsterIndex] = useState<number>(0);
  const [battleTimeLeft, setBattleTimeLeft] = useState<number>(60);
  const [battlePlayerHp, setBattlePlayerHp] = useState<number>(100);
  const [battleEnemyHp, setBattleEnemyHp] = useState<number>(10);
  const [isStageCompletedWaitingAdvance, setIsStageCompletedWaitingAdvance] = useState<boolean>(false);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState<boolean>(true);

  // Refs de batalha para evitar fechamento obsoleto no loop assíncrono de combate
  const battleStageRef = useRef<number>(battleStage);
  const battleMonsterIndexRef = useRef<number>(battleMonsterIndex);
  const battleEnemyHpRef = useRef<number>(battleEnemyHp);
  const isBattlePlayingRef = useRef<boolean>(isBattlePlaying);
  const isAutoAdvanceEnabledRef = useRef<boolean>(isAutoAdvanceEnabled);
  const isPremiumActiveRef = useRef<boolean>(false);

  // UI Selection & Modals
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState<boolean>(false);
  const [isFusionBoostOpen, setIsFusionBoostOpen] = useState<boolean>(false);
  const [celebrationTier, setCelebrationTier] = useState<number | null>(null);
  const [celebrationRarity, setCelebrationRarity] = useState<WeaponRarity | null>(null);
  const [screenShakeClass, setScreenShakeClass] = useState<string>('');
  const [simulationReport, setSimulationReport] = useState<FiveStageSimulationReport | null>(null);
  const [fusionNotification, setFusionNotification] = useState<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'attempt' | 'warning' | 'error';
    color?: string;
  } | null>(null);
  const fusionNotificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showFusionNotification = useCallback((
    title: string,
    message: string,
    type: 'success' | 'attempt' | 'warning' | 'error' = 'attempt',
    color?: string
  ) => {
    if (fusionNotificationTimerRef.current) {
      clearTimeout(fusionNotificationTimerRef.current);
    }
    setFusionNotification({
      id: Date.now(),
      title,
      message,
      type,
      color,
    });
    fusionNotificationTimerRef.current = setTimeout(() => {
      setFusionNotification(null);
    }, 2500);
  }, []);

  const [fusionBlockedAlert, setFusionBlockedAlert] = useState<{
    sourceName: string;
    sourceRarity: string;
    sourceRarityLabel: string;
    sourceRarityColor: string;
    targetName: string;
    targetRarity: string;
    targetRarityLabel: string;
    targetRarityColor: string;
    allowedRaritiesLabel: string;
  } | null>(null);

  const triggerScreenShake = useCallback((type: 'shake-light' | 'shake-heavy' | 'shake-crit' = 'shake-light') => {
    setScreenShakeClass(type);
    window.setTimeout(() => {
      setScreenShakeClass('');
    }, type === 'shake-crit' ? 450 : 320);
  }, []);

  // Calcular status de buffs
  const now = Date.now();
  const isPremiumActive = premiumExpiresAt > now;
  const isQuickStrikeActive = (quickStrikeExpiresAt > now) || isPremiumActive;
  const hasSimulationAccess = isPremiumActive || (battleSimulationExpiresAt > now);

  // Usos restantes hoje para Fusão Automática e Preencher Bancada
  const todayDateStr = getTodayDateString();
  const autoMergeRemainingUses = isPremiumActive
    ? 999
    : Math.max(0, 10 - (dailyAutoFusionDate === todayDateStr ? dailyAutoFusionCount : 0));
  const dailyFillBenchRemaining = isPremiumActive
    ? 999
    : Math.max(0, 10 - (dailyFillBenchDate === todayDateStr ? dailyFillBenchCount : 0));

  // Sincronizar refs
  useEffect(() => {
    battleStageRef.current = battleStage;
  }, [battleStage]);
  useEffect(() => {
    battleMonsterIndexRef.current = battleMonsterIndex;
  }, [battleMonsterIndex]);
  useEffect(() => {
    battleEnemyHpRef.current = battleEnemyHp;
  }, [battleEnemyHp]);
  useEffect(() => {
    isBattlePlayingRef.current = isBattlePlaying;
  }, [isBattlePlaying]);
  useEffect(() => {
    isAutoAdvanceEnabledRef.current = isAutoAdvanceEnabled;
  }, [isAutoAdvanceEnabled]);
  useEffect(() => {
    isPremiumActiveRef.current = isPremiumActive;
  }, [isPremiumActive]);

  // Calcular bônus de fusão ativo (cada boost ativo até 5x dá +10% base)
  const validBoosts = fusionBoosts.filter((b) => b.expiresAt > now);
  const activeFusionBoostPercent = Math.min(50, validBoosts.length * 10);

  // Atributos do Jogador na Batalha
  const PLAYER_BASE_ATK = 10;
  const PLAYER_BASE_DEF = 5;
  const PLAYER_BASE_HP = 100;

  let weaponAtk = 0;
  let weaponCrit = 5;
  if (equippedWeapon) {
    const wData = getWeaponData(equippedWeapon.tier);
    const rDef = getRarityData(equippedWeapon.rarity || 'comum');
    weaponAtk = Math.round(wData.damage * rDef.damageMultiplier);
    weaponCrit = rDef.critChance;
  }
  const bonusHp = Math.round(weaponAtk * 0.2);
  const bonusDef = Math.round(weaponAtk * 0.1);

  const playerMaxHp = PLAYER_BASE_HP + bonusHp;
  const playerAtk = PLAYER_BASE_ATK + weaponAtk;
  const playerDef = PLAYER_BASE_DEF + bonusDef;

  // Atributos do Monstro Atual (calculados pela progressão oficial da Masmorra)
  const { enemyAtk, enemyDef, enemyMaxHp } = calculateEnemyStats(battleStage, battleMonsterIndex);

  // Vida sempre cheia antes de iniciar batalha ou ao trocar de arma
  useEffect(() => {
    if (!isBattlePlaying) {
      setBattlePlayerHp(playerMaxHp);
      setBattleEnemyHp(enemyMaxHp);
    }
  }, [playerMaxHp, enemyMaxHp, isBattlePlaying, equippedWeapon]);

  // Função auxiliar para atualizar progresso das missões
  const advanceQuests = useCallback((category: 'craft' | 'fusion' | 'battle', rarity?: WeaponRarity, count: number = 1) => {
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (q.claimed || q.category !== category) return q;
        if (q.targetRarity && rarity && q.targetRarity !== rarity) return q;

        const nextCount = Math.min(q.targetCount, q.currentCount + count);
        return {
          ...q,
          currentCount: nextCount,
        };
      })
    );
  }, []);

  // 1. Carregar progresso do LocalStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: GameSaveState = JSON.parse(saved);
        if (typeof data.cedulas === 'number') setCedulas(data.cedulas);
        if (typeof data.diamantes === 'number') setDiamantes(data.diamantes);
        if (typeof data.premiumExpiresAt === 'number') setPremiumExpiresAt(data.premiumExpiresAt);
        if (typeof data.quickStrikeExpiresAt === 'number') setQuickStrikeExpiresAt(data.quickStrikeExpiresAt);
        if (typeof data.autoCollectExpiresAt === 'number') setAutoCollectExpiresAt(data.autoCollectExpiresAt);
        if (typeof data.battleSimulationExpiresAt === 'number') setBattleSimulationExpiresAt(data.battleSimulationExpiresAt);
        if (typeof data.rarityEnchantCharges === 'number') setRarityEnchantCharges(data.rarityEnchantCharges);
        if (Array.isArray(data.slots) && data.slots.length === 16) setSlots(data.slots);
        if (Array.isArray(data.unlockedTiers) && data.unlockedTiers.length > 0) setUnlockedTiers(data.unlockedTiers);
        if (Array.isArray(data.unlockedRarities) && data.unlockedRarities.length > 0) {
          setUnlockedRarities(data.unlockedRarities);
        }
        if (Array.isArray(data.fusionBoosts)) {
          setFusionBoosts(data.fusionBoosts.filter((b) => b.expiresAt > Date.now()));
        }
        if (data.equippedWeapon) setEquippedWeapon(data.equippedWeapon);
        if (typeof data.battleStage === 'number') setBattleStage(Math.max(1, Math.min(100, data.battleStage)));
        if (typeof data.isAutoAdvanceEnabled === 'boolean') setIsAutoAdvanceEnabled(data.isAutoAdvanceEnabled);
        if (data.dailyLogin) setDailyLogin(data.dailyLogin);
        if (data.dailyQuestsDate) setDailyQuestsDate(data.dailyQuestsDate);
        if (data.weeklyQuestsDate) setWeeklyQuestsDate(data.weeklyQuestsDate);
        if (data.dailyAutoFusionDate) setDailyAutoFusionDate(data.dailyAutoFusionDate);
        if (typeof data.dailyAutoFusionCount === 'number') setDailyAutoFusionCount(data.dailyAutoFusionCount);
        if (data.dailyFillBenchDate) setDailyFillBenchDate(data.dailyFillBenchDate);
        if (typeof data.dailyFillBenchCount === 'number') setDailyFillBenchCount(data.dailyFillBenchCount);
        if (data.dailyBattleResetDate) setDailyBattleResetDate(data.dailyBattleResetDate);
        if (typeof data.dailyBattleResetCount === 'number') setDailyBattleResetCount(data.dailyBattleResetCount);
        if (Array.isArray(data.quests) && data.quests.length > 0) setQuests(data.quests);
        if (data.seasonPass) setSeasonPass(data.seasonPass);
        if (data.stats) setStats(data.stats);
        if (typeof data.soundEnabled === 'boolean') {
          setSoundEnabled(data.soundEnabled);
          sound.setMuted(!data.soundEnabled);
        }
        if (typeof data.powerSaverMode === 'boolean') {
          setPowerSaverMode(data.powerSaverMode);
          fx.setPowerSaver(data.powerSaverMode);
        }
      } else {
        // Inicializar com 2 armas Tier 1 Comuns de presente na bancada
        const initialSlots: (WeaponItem | null)[] = Array(16).fill(null);
        initialSlots[0] = { id: 'init-1', tier: 1, rarity: 'comum', createdTime: Date.now() };
        initialSlots[1] = { id: 'init-2', tier: 1, rarity: 'comum', createdTime: Date.now() + 1 };
        setSlots(initialSlots);
      }
    } catch (e) {
      console.error('Falha ao ler dados do LocalStorage:', e);
    }
  }, []);

  // 2. Salvar automaticamente no LocalStorage a cada alteração
  useEffect(() => {
    try {
      const stateToSave: GameSaveState = {
        cedulas,
        diamantes,
        premiumExpiresAt,
        quickStrikeExpiresAt,
        autoCollectExpiresAt,
        battleSimulationExpiresAt,
        rarityEnchantCharges,
        slots,
        unlockedTiers,
        unlockedRarities,
        fusionBoosts: validBoosts,
        equippedWeapon,
        battleStage,
        isAutoAdvanceEnabled,
        dailyLogin,
        dailyQuestsDate,
        weeklyQuestsDate,
        dailyAutoFusionDate,
        dailyAutoFusionCount,
        dailyFillBenchDate,
        dailyFillBenchCount,
        dailyBattleResetDate,
        dailyBattleResetCount,
        quests,
        seasonPass,
        stats,
        soundEnabled,
        powerSaverMode,
        version: 2,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Falha ao salvar no LocalStorage:', e);
    }
  }, [
    cedulas,
    diamantes,
    premiumExpiresAt,
    quickStrikeExpiresAt,
    autoCollectExpiresAt,
    battleSimulationExpiresAt,
    rarityEnchantCharges,
    slots,
    unlockedTiers,
    unlockedRarities,
    validBoosts,
    equippedWeapon,
    battleStage,
    isAutoAdvanceEnabled,
    dailyLogin,
    dailyQuestsDate,
    weeklyQuestsDate,
    dailyAutoFusionDate,
    dailyAutoFusionCount,
    dailyFillBenchDate,
    dailyFillBenchCount,
    dailyBattleResetDate,
    dailyBattleResetCount,
    quests,
    seasonPass,
    stats,
    soundEnabled,
    powerSaverMode,
  ]);

  // Resets automáticos de Missões Diárias e Semanais e Temporada do Passe
  useEffect(() => {
    const today = getTodayDateString();
    const currentWeek = getCurrentWeekKey();
    const currentMonth = getCurrentMonthKey();

    // Reset Diário de Missões
    if (dailyQuestsDate !== today) {
      setDailyQuestsDate(today);
      setQuests((prev) => [
        ...generateDailyQuests(),
        ...prev.filter((q) => q.isWeekly),
      ]);
    }

    // Reset Diário de Usos da Auto-Fusão e Preenchimento da Bancada (10x grátis/dia)
    if (dailyAutoFusionDate !== today) {
      setDailyAutoFusionDate(today);
      setDailyAutoFusionCount(0);
    }
    if (dailyFillBenchDate !== today) {
      setDailyFillBenchDate(today);
      setDailyFillBenchCount(0);
    }
    if (dailyBattleResetDate !== today) {
      setDailyBattleResetDate(today);
      setDailyBattleResetCount(0);
    }

    // Reset Semanal
    if (weeklyQuestsDate !== currentWeek) {
      setWeeklyQuestsDate(currentWeek);
      setQuests((prev) => [
        ...prev.filter((q) => !q.isWeekly),
        ...generateWeeklyQuests(),
      ]);
    }

    // Reset Mensal do Passe (Inicia dia 1, vence o passe premium)
    if (seasonPass.monthKey !== currentMonth) {
      setSeasonPass({
        monthKey: currentMonth,
        totalMissionsCompletedThisMonth: 0,
        claimedLevels: [],
        isPremiumUnlocked: false,
        claimedPremiumLevels: [],
      });
    }
  }, [dailyQuestsDate, weeklyQuestsDate, seasonPass.monthKey, dailyAutoFusionDate, dailyFillBenchDate]);

  const freeSlotsCount = slots.filter((s) => s === null).length;

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sound.setMuted(!next);
      if (next) {
        sound.playClick();
      }
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        next ? '🔊 Áudio Global Ativado' : '🔇 Áudio Global Silenciado',
        next ? '#facc15' : '#a1a1aa',
        2000
      );
      return next;
    });
  }, []);

  const handleTogglePowerSaver = useCallback(() => {
    setPowerSaverMode((prev) => {
      const next = !prev;
      fx.setPowerSaver(next);
      sound.playClick();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        next ? '🔋 Economia de Energia: ATIVADO' : '⚡ Alto Desempenho: ATIVADO',
        next ? '#34d399' : '#38bdf8',
        2200
      );
      showFusionNotification(
        next ? '🔋 Modo Economia de Energia Ativo' : '⚡ Alto Desempenho Ativo',
        next
          ? 'Frequência de loops em 2º plano reduzida para poupar bateria no dispositivo móvel.'
          : 'Sincronização em alta taxa de atualização restaurada.',
        next ? 'success' : 'attempt',
        next ? '#34d399' : '#38bdf8'
      );
      return next;
    });
  }, [showFusionNotification]);

  // 3. Loop em Segundo Plano para Conclusão de Forjas e Fusões (com suporte a Power Saver)
  useEffect(() => {
    const syncIntervalMs = powerSaverMode ? 1200 : 200;
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const isAutoCollectActive = autoCollectExpiresAt > currentTime;

      // Se a Coleta Automática NÃO estiver ativa, as armas prontas permanecem no slot para coleta manual do jogador!
      if (!isAutoCollectActive) return;

      let hasChanges = false;
      const nextSlots = [...slots];

      nextSlots.forEach((slot, index) => {
        if (slot?.crafting && currentTime >= slot.crafting.endTime) {
          const finishedTier = slot.crafting.targetTier;
          const finishedRarity: WeaponRarity = slot.crafting.targetRarity || 'comum';
          const finishedWeaponData = getWeaponData(finishedTier);
          const rarityDef = getRarityData(finishedRarity);
          const wasFusion = slot.crafting.type === 'fusion';
          const forgeSucceeded = slot.crafting.forgeSucceeded !== false;
          const didUpgradeRarity = slot.crafting.didUpgradeRarity === true;

          // Atualizar o slot com a arma resultante (nunca regride abaixo do tier definido)
          nextSlots[index] = {
            ...slot,
            tier: finishedTier,
            rarity: finishedRarity,
            crafting: null,
          };
          hasChanges = true;

          if (wasFusion) {
            advanceQuests('fusion', finishedRarity, 1);

            if (forgeSucceeded && didUpgradeRarity) {
              // 1. SUCESSO TOTAL: Subiu Tier e Subiu Raridade!
              triggerScreenShake('shake-crit');
              sound.playUnlock();
              fx.triggerMerge(
                window.innerWidth / 2,
                window.innerHeight / 2,
                rarityDef.color,
                finishedTier,
                finishedRarity,
                finishedWeaponData.name
              );
              fx.triggerFloatingText(
                window.innerWidth / 2,
                window.innerHeight / 2 - 50,
                `🌟 Auto-Coleta: T${finishedTier} & ${rarityDef.label}!`,
                rarityDef.color,
                2500
              );
              showFusionNotification(
                '🌟 SUCESSO TOTAL NA FORJA & FUSÃO!',
                `Tier aumentou para T${finishedTier} e Raridade aprimorada para ${rarityDef.label}!`,
                'success',
                rarityDef.color
              );
            } else if (forgeSucceeded && !didUpgradeRarity) {
              // 2. FORJA SUBIU TIER (Fusão manteve raridade ou fixou na menor)
              triggerScreenShake('shake-light');
              sound.playMerge(finishedTier);
              fx.triggerMerge(
                window.innerWidth / 2,
                window.innerHeight / 2,
                rarityDef.color,
                finishedTier,
                finishedRarity,
                finishedWeaponData.name
              );
              fx.triggerFloatingText(
                window.innerWidth / 2,
                window.innerHeight / 2,
                `🤖 Auto-Coleta: Tier ${finishedTier} (${rarityDef.label})`,
                '#38bdf8',
                2500
              );
              showFusionNotification(
                '⚒️ TIER AUMENTADO COM SUCESSO!',
                `A forja aumentou a arma para Tier ${finishedTier}. Raridade: ${rarityDef.label}.`,
                'success',
                '#38bdf8'
              );
            } else if (!forgeSucceeded && didUpgradeRarity) {
              // 3. FUSÃO APRIMOROU RARIDADE (Tier permaneceu no mesmo)
              triggerScreenShake('shake-heavy');
              sound.playUnlock();
              fx.triggerMerge(
                window.innerWidth / 2,
                window.innerHeight / 2,
                rarityDef.color,
                finishedTier,
                finishedRarity,
                finishedWeaponData.name
              );
              fx.triggerFloatingText(
                window.innerWidth / 2,
                window.innerHeight / 2 - 50,
                `✨ Auto-Coleta: ${rarityDef.label} (Tier ${finishedTier})`,
                rarityDef.color,
                2500
              );
              showFusionNotification(
                '✨ RARIDADE APRIMORADA!',
                `A fusão aprimorou a raridade para ${rarityDef.label}! (Tier ${finishedTier} mantido).`,
                'success',
                rarityDef.color
              );
            } else {
              // 4. FORJA FALHOU E FUSÃO MANTEVE RARIDADE (Arma preservada no mesmo tier)
              sound.playClick();
              fx.triggerFloatingText(
                window.innerWidth / 2,
                window.innerHeight / 2,
                `🤖 Auto-Coleta: Tier ${finishedTier} (${rarityDef.label}) mantido.`,
                '#fbbf24',
                2500
              );
              showFusionNotification(
                '🛡️ Forja Resistente (Tier Mantido)',
                `A arma permaneceu no Tier ${finishedTier} (${rarityDef.label}). Não houve regressão de nível!`,
                'warning',
                '#fbbf24'
              );
              setStats((prev) => ({
                ...prev,
                totalFailedFusions: (prev.totalFailedFusions || 0) + 1,
              }));
            }
          } else {
            advanceQuests('craft', finishedRarity, 1);
            triggerScreenShake(finishedTier >= 8 ? 'shake-heavy' : 'shake-light');
            fx.triggerMerge(
              window.innerWidth / 2,
              window.innerHeight / 2,
              rarityDef.id !== 'comum' ? rarityDef.particleColor : finishedWeaponData.accentColor,
              finishedTier,
              finishedRarity,
              finishedWeaponData.name
            );
            fx.triggerFloatingText(
              window.innerWidth / 2,
              window.innerHeight / 2 - 40,
              `🤖 Auto-Coleta: Tier ${finishedTier} (${rarityDef.label})`,
              rarityDef.color,
              2000
            );
          }

          // Verificar Forja Dupla 2x (Ativa aos 500 crafts)
          const totalOps = (stats.totalPurchased || 0) + (stats.totalMerged || 0);
          const doubleCraft = calculateDoubleCraftChance(totalOps);
          if (doubleCraft.isUnlocked && Math.random() * 100 <= doubleCraft.chancePercent) {
            const emptyIdx = nextSlots.findIndex((s, idx) => s === null && idx !== index);
            if (emptyIdx !== -1) {
              nextSlots[emptyIdx] = {
                id: `${currentTime}-dup-${Math.random()}`,
                tier: finishedTier,
                rarity: finishedRarity,
                createdTime: currentTime,
              };
              sound.playUnlock();
              fx.triggerFloatingText(
                window.innerWidth / 2,
                window.innerHeight / 2 - 40,
                `✨ FORJA DUPLA 2x! (+1 ${finishedWeaponData.name})`,
                '#22d3ee'
              );
              setStats((prev) => ({
                ...prev,
                doubleCraftTriggerCount: (prev.doubleCraftTriggerCount || 0) + 1,
              }));
            }
          }

          // Descobertas
          const isFirstTierDiscovery = !unlockedTiers.includes(finishedTier);
          if (isFirstTierDiscovery) {
            setUnlockedTiers((prev) => [...prev, finishedTier]);
            setCelebrationTier(finishedTier);
            sound.playUnlock();
          } else {
            sound.playMerge(finishedTier);
          }

          if (!unlockedRarities.includes(finishedRarity)) {
            setUnlockedRarities((prev) => [...prev, finishedRarity]);
            setCelebrationRarity(finishedRarity);
          }

          setStats((prev) => ({
            ...prev,
            totalMerged: wasFusion ? prev.totalMerged + 1 : prev.totalMerged,
            totalCraftsCount: (prev.totalCraftsCount || 0) + 1,
            highestTierUnlocked: Math.max(prev.highestTierUnlocked, finishedTier),
          }));
        }
      });

      if (hasChanges) {
        setSlots(nextSlots);
      }
    }, syncIntervalMs);

    return () => clearInterval(interval);
  }, [slots, autoCollectExpiresAt, powerSaverMode, unlockedTiers, unlockedRarities, stats, triggerScreenShake, advanceQuests, showFusionNotification]);

  // 3.1. Loop em Segundo Plano para Expiração do Encantamento de Raridade (1 Hora, com suporte a Power Saver)
  useEffect(() => {
    const enchantIntervalMs = powerSaverMode ? 3000 : 1000;
    const enchantTimer = setInterval(() => {
      const currentTime = Date.now();
      let hasExpired = false;
      const nextSlots = [...slots];

      nextSlots.forEach((slot, index) => {
        if (slot && slot.enchantExpiresAt && currentTime >= slot.enchantExpiresAt) {
          const restoredRarity = slot.baseRarity || 'comum';
          const restoredDef = getRarityData(restoredRarity);
          const wData = getWeaponData(slot.tier);

          nextSlots[index] = {
            ...slot,
            rarity: restoredRarity,
            baseRarity: undefined,
            enchantExpiresAt: undefined,
          };
          hasExpired = true;

          sound.playClick();
          fx.triggerFloatingText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            `⏳ Encantamento de ${wData.name} expirou (retornou para ${restoredDef.label})`,
            '#a1a1aa',
            2500
          );
          showFusionNotification(
            '⏳ Encantamento Expirado',
            `${wData.name} retornou à sua raridade base (${restoredDef.label}).`,
            'warning',
            restoredDef.color
          );
        }
      });

      if (hasExpired) {
        setSlots(nextSlots);
        if (equippedWeapon && equippedWeapon.enchantExpiresAt && currentTime >= equippedWeapon.enchantExpiresAt) {
          setEquippedWeapon((prev) =>
            prev
              ? {
                  ...prev,
                  rarity: prev.baseRarity || 'comum',
                  baseRarity: undefined,
                  enchantExpiresAt: undefined,
                }
              : null
          );
        }
      }
    }, enchantIntervalMs);

    return () => clearInterval(enchantTimer);
  }, [slots, equippedWeapon, powerSaverMode, showFusionNotification]);

  // 4. LOOP DE BATALHA (Suporta Auto-Batalha em 2º plano com Premium e Auto-Avanço de Fases)
  useEffect(() => {
    if (!isBattlePlaying) return;

    if (!isPremiumActive && activeScreen !== 'battle') {
      setIsBattlePlaying(false);
      return;
    }

    const combatTimer = setInterval(() => {
      if (!isBattlePlayingRef.current) return;
      if (battleEnemyHpRef.current <= 0) return;

      const currentStage = battleStageRef.current;
      const currentMonsterIdx = battleMonsterIndexRef.current;
      const currentStats = calculateEnemyStats(currentStage, currentMonsterIdx);

      // Jogador Ataca o Monstro
      const isCrit = Math.random() * 100 <= weaponCrit;
      const critMult = isCrit ? 1.8 : 1.0;
      const rawDmg = Math.max(2, playerAtk - currentStats.enemyDef * 0.4);
      const dmg = Math.round(rawDmg * critMult);

      // Disparar efeitos visuais de impacto no Canvas (Flashes de luz, rastro de corte, sangue e partículas por raridade)
      if (activeScreen === 'battle') {
        if (isCrit) {
          triggerScreenShake('shake-crit');
        } else {
          triggerScreenShake('shake-light');
        }

        const enemyEl = document.getElementById('battle-goblin-avatar') || document.getElementById('enemy-battle-card');
        let hitX = window.innerWidth * 0.72;
        let hitY = window.innerHeight * 0.38;
        if (enemyEl) {
          const rect = enemyEl.getBoundingClientRect();
          hitX = rect.left + rect.width / 2;
          hitY = rect.top + rect.height * 0.45;
        }
        fx.triggerBattleHit(hitX, hitY, equippedWeapon?.rarity || 'comum', isCrit, dmg);
      }

      const nextEnemyHp = battleEnemyHpRef.current - dmg;

      if (nextEnemyHp <= 0) {
        // MONSTRO DERROTADO: Recompensa dinâmica por fase
        const stageReward = getBattleStageReward(currentStage);
        setCedulas((c) => c + stageReward);
        setStats((s) => ({
          ...s,
          totalCedulasEarned: s.totalCedulasEarned + stageReward,
          totalMonstersDefeated: (s.totalMonstersDefeated || 0) + 1,
        }));
        sound.playUnlock();

        // Atualizar Missões de Abate
        advanceQuests('battle', undefined, 1);

        if (activeScreen === 'battle') {
          fx.triggerFloatingText(
            window.innerWidth / 2 + 100,
            window.innerHeight / 2 - 50,
            `+${stageReward} Cédulas! 💰`,
            '#4ade80'
          );
        }

        // Checar se concluiu os 10 monstros da fase (índice 9)
        if (currentMonsterIdx >= 9) {
          // Disparar Animação Especial de Vitória de Fase no ParticleCanvas (Confetes, Feixes Celestiais e Brilho Radiante)
          triggerScreenShake('shake-crit');
          fx.triggerStageVictory(currentStage, stageReward * 10);
          sound.playUnlock();

          showFusionNotification(
            `🏆 Fase ${currentStage} Concluída!`,
            `Todos os 10 monstros foram derrotados! Recompensa acumulada: +${(stageReward * 10).toLocaleString('pt-BR')} Cédulas.`,
            'success',
            '#facc15'
          );

          if (currentStage >= 100) {
            setIsBattlePlaying(false);
            setBattleEnemyHp(0);
            battleEnemyHpRef.current = 0;
            return;
          }

          if (isPremiumActiveRef.current && isAutoAdvanceEnabledRef.current) {
            // AVANÇO AUTOMÁTICO VIP
            const nextStage = currentStage + 1;
            const newEnemyHp = calculateEnemyStats(nextStage, 0).enemyMaxHp;
            setBattleStage(nextStage);
            setBattleMonsterIndex(0);
            setBattleTimeLeft(60);
            setBattleEnemyHp(newEnemyHp);
            battleEnemyHpRef.current = newEnemyHp;
            battleMonsterIndexRef.current = 0;
            battleStageRef.current = nextStage;

            if (activeScreen === 'battle') {
              fx.triggerFloatingText(
                window.innerWidth / 2,
                window.innerHeight / 2 - 40,
                `🚀 Avanço Automático VIP! Entrando na Fase ${nextStage}`,
                '#fbbf24'
              );
            }
          } else {
            // SEM PREMIUM OU AUTO-AVANÇO DESATIVADO: PAUSA E EXIBE MODAL DE FASE CONCLUÍDA
            setIsBattlePlaying(false);
            setIsStageCompletedWaitingAdvance(true);
            const nextStageHp = calculateEnemyStats(currentStage + 1, 0).enemyMaxHp;
            setBattleEnemyHp(nextStageHp);
            battleEnemyHpRef.current = nextStageHp;
          }
        } else {
          // Passa IMEDIATAMENTE para o próximo monstro da mesma fase!
          const nextIdx = currentMonsterIdx + 1;
          const nextMonsterHp = calculateEnemyStats(currentStage, nextIdx).enemyMaxHp;
          setBattleMonsterIndex(nextIdx);
          setBattleEnemyHp(nextMonsterHp);
          battleEnemyHpRef.current = nextMonsterHp;
          battleMonsterIndexRef.current = nextIdx;
        }

        // Monstro foi eliminado: não contra-ataca!
        return;
      }

      // MONSTRO SOBREVIVEU: Atualiza o HP e agenda contra-ataque
      setBattleEnemyHp(nextEnemyHp);
      battleEnemyHpRef.current = nextEnemyHp;

      setTimeout(() => {
        if (!isBattlePlayingRef.current) return;
        if (battleEnemyHpRef.current <= 0) return;

        setBattlePlayerHp((prevPlayerHp) => {
          if (prevPlayerHp <= 0) return 0;
          const rawEnemyDmg = Math.max(1, currentStats.enemyAtk - playerDef * 0.4);
          const enemyDmg = Math.round(rawEnemyDmg);
          const nextHp = prevPlayerHp - enemyDmg;

          if (nextHp <= 0) {
            setIsBattlePlaying(false);
            sound.playError();
            triggerScreenShake('shake-heavy');
            fx.triggerPlayerDefeat(battleStageRef.current);
            showFusionNotification(
              '💀 Derrotado em Batalha!',
              `Você caiu diante dos monstros da Fase ${battleStageRef.current}. Aprimore suas armas na Bancada!`,
              'error',
              '#f43f5e'
            );
            return 0;
          }
          return nextHp;
        });
      }, 400);

    }, 850);

    return () => clearInterval(combatTimer);
  }, [
    isBattlePlaying,
    isPremiumActive,
    activeScreen,
    playerAtk,
    playerDef,
    weaponCrit,
    calculateEnemyStats,
    equippedWeapon,
    advanceQuests,
    triggerScreenShake,
    showFusionNotification,
  ]);

  // Cronômetro da Batalha (60 segundos por fase)
  useEffect(() => {
    if (!isBattlePlaying) return;

    const clockTimer = setInterval(() => {
      setBattleTimeLeft((prev) => {
        if (prev <= 1) {
          setIsBattlePlaying(false);
          sound.playError();
          triggerScreenShake('shake-heavy');
          fx.triggerPlayerDefeat(battleStageRef.current);
          showFusionNotification(
            '⏰ Tempo Esgotado!',
            `O tempo da Fase ${battleStageRef.current} acabou! Aumente o dano da sua arma para abater mais rápido.`,
            'warning',
            '#fbbf24'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(clockTimer);
  }, [isBattlePlaying, triggerScreenShake, showFusionNotification]);

  // Alternar Auto-Avanço de Fases (VIP Premium)
  const handleToggleAutoAdvance = useCallback(() => {
    setIsAutoAdvanceEnabled((prev) => !prev);
    sound.playClick();
  }, []);

  // Ação de Golpe Rápido (Requer Premium ou Elixir 1 💎)
  const handleQuickStrike = useCallback(() => {
    if (!isBattlePlayingRef.current || battleEnemyHpRef.current <= 0 || battlePlayerHp <= 0) return;
    if (!isQuickStrikeActive) {
      setActiveScreen('shop');
      return;
    }

    const currentStage = battleStageRef.current;
    const currentMonsterIdx = battleMonsterIndexRef.current;
    const currentStats = calculateEnemyStats(currentStage, currentMonsterIdx);

    const isCrit = Math.random() * 100 <= weaponCrit;
    const critMult = isCrit ? 1.8 : 1.0;
    const rawDmg = Math.max(2, playerAtk - currentStats.enemyDef * 0.4);
    const dmg = Math.round(rawDmg * critMult);

    sound.playMerge(Math.min(15, (equippedWeapon?.tier || 1)));

    // Disparar efeitos visuais de impacto no Canvas (Flashes e partículas por raridade)
    if (activeScreen === 'battle') {
      if (isCrit) {
        triggerScreenShake('shake-crit');
      } else {
        triggerScreenShake('shake-light');
      }

      const enemyEl = document.getElementById('battle-goblin-avatar') || document.getElementById('enemy-battle-card');
      let hitX = window.innerWidth * 0.72;
      let hitY = window.innerHeight * 0.35;
      if (enemyEl) {
        const rect = enemyEl.getBoundingClientRect();
        hitX = rect.left + rect.width / 2;
        hitY = rect.top + rect.height * 0.45;
      }
      fx.triggerBattleHit(hitX, hitY, equippedWeapon?.rarity || 'comum', isCrit, dmg);
    }

    const nextEnemyHp = battleEnemyHpRef.current - dmg;
    if (nextEnemyHp <= 0) {
      const stageReward = getBattleStageReward(currentStage);
      setCedulas((c) => c + stageReward);
      setStats((s) => ({
        ...s,
        totalCedulasEarned: s.totalCedulasEarned + stageReward,
        totalMonstersDefeated: (s.totalMonstersDefeated || 0) + 1,
      }));
      sound.playUnlock();

      advanceQuests('battle', undefined, 1);

      if (activeScreen === 'battle') {
        fx.triggerFloatingText(
          window.innerWidth / 2 + 100,
          window.innerHeight / 2 - 50,
          `+${stageReward} Cédulas! 💰`,
          '#4ade80'
        );
      }

      if (currentMonsterIdx >= 9) {
        if (currentStage >= 100) {
          setIsBattlePlaying(false);
          setBattleEnemyHp(0);
          battleEnemyHpRef.current = 0;
        } else if (isPremiumActiveRef.current && isAutoAdvanceEnabledRef.current) {
          const nextStage = currentStage + 1;
          const newHp = calculateEnemyStats(nextStage, 0).enemyMaxHp;
          setBattleStage(nextStage);
          setBattleMonsterIndex(0);
          setBattleTimeLeft(60);
          setBattleEnemyHp(newHp);
          battleEnemyHpRef.current = newHp;
          battleMonsterIndexRef.current = 0;
          battleStageRef.current = nextStage;
        } else {
          setIsBattlePlaying(false);
          setIsStageCompletedWaitingAdvance(true);
          const nextStageHp = calculateEnemyStats(currentStage + 1, 0).enemyMaxHp;
          setBattleEnemyHp(nextStageHp);
          battleEnemyHpRef.current = nextStageHp;
        }
      } else {
        const nextIdx = currentMonsterIdx + 1;
        const nextMonsterHp = calculateEnemyStats(currentStage, nextIdx).enemyMaxHp;
        setBattleMonsterIndex(nextIdx);
        setBattleEnemyHp(nextMonsterHp);
        battleEnemyHpRef.current = nextMonsterHp;
        battleMonsterIndexRef.current = nextIdx;
      }
    } else {
      setBattleEnemyHp(nextEnemyHp);
      battleEnemyHpRef.current = nextEnemyHp;
    }
  }, [
    battlePlayerHp,
    isQuickStrikeActive,
    weaponCrit,
    playerAtk,
    equippedWeapon,
    calculateEnemyStats,
    advanceQuests,
    triggerScreenShake,
    activeScreen,
  ]);

  // Avançar manualmente para a próxima fase (quando sem Premium ou auto-avanço desativado)
  const handleAdvanceToNextStageManual = useCallback(() => {
    const nextStage = battleStage + 1;
    const nextHp = calculateEnemyStats(nextStage, 0).enemyMaxHp;
    setBattleStage(nextStage);
    setBattleMonsterIndex(0);
    setBattleTimeLeft(60);
    setBattleEnemyHp(nextHp);
    battleEnemyHpRef.current = nextHp;
    battleMonsterIndexRef.current = 0;
    battleStageRef.current = nextStage;
    setIsStageCompletedWaitingAdvance(false);
    setIsBattlePlaying(true);
    sound.playClick();
  }, [battleStage, calculateEnemyStats]);

  // Simular 5 Fases Instantâneas de Batalha (VIP Premium ou Modo Simulado Ativo)
  const handleSimulateFiveStages = useCallback(() => {
    if (!hasSimulationAccess) {
      setActiveScreen('shop');
      return;
    }

    if (battleStage >= 100) {
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        '🏆 Você já alcançou a Fase 100!',
        '#fbbf24',
        2500
      );
      return;
    }

    const report = simulateFiveStages(
      battleStage,
      playerAtk,
      playerMaxHp,
      playerDef,
      weaponCrit
    );

    if (report.totalCedulasEarned > 0) {
      setCedulas((c) => c + report.totalCedulasEarned);
    }

    setStats((s) => ({
      ...s,
      totalCedulasEarned: s.totalCedulasEarned + report.totalCedulasEarned,
      totalMonstersDefeated: (s.totalMonstersDefeated || 0) + report.totalMonstersDefeated,
    }));

    advanceQuests('battle', undefined, report.totalMonstersDefeated);

    setBattleStage(report.finalStage);
    battleStageRef.current = report.finalStage;
    setBattleMonsterIndex(0);
    battleMonsterIndexRef.current = 0;
    setBattleTimeLeft(60);
    setIsBattlePlaying(false);
    setIsStageCompletedWaitingAdvance(false);

    const nextStats = calculateEnemyStats(report.finalStage, 0);
    setBattleEnemyHp(nextStats.enemyMaxHp);
    battleEnemyHpRef.current = nextStats.enemyMaxHp;
    setBattlePlayerHp(playerMaxHp);

    setSimulationReport(report);

    if (report.isTotalVictory) {
      sound.playUnlock();
      triggerScreenShake('shake-crit');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 40,
        `🏆 +${report.stagesCompleted} Fases Vencidas (+${report.totalCedulasEarned} Cédulas)!`,
        '#4ade80',
        3000
      );
    } else {
      sound.playMerge(3);
      triggerScreenShake('shake-light');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 40,
        `⚔️ +${report.stagesCompleted} Fases Simuladas (+${report.totalCedulasEarned} Cédulas)!`,
        '#fbbf24',
        3000
      );
    }
  }, [
    hasSimulationAccess,
    battleStage,
    playerAtk,
    playerMaxHp,
    playerDef,
    weaponCrit,
    calculateEnemyStats,
    advanceQuests,
    triggerScreenShake,
  ]);

  // Reviver na Batalha
  const handleReviveBattle = useCallback(() => {
    const statsCurrent = calculateEnemyStats(battleStage, battleMonsterIndex);
    setBattlePlayerHp(playerMaxHp);
    setBattleEnemyHp(statsCurrent.enemyMaxHp);
    battleEnemyHpRef.current = statsCurrent.enemyMaxHp;
    setBattleTimeLeft(60);
    setIsBattlePlaying(false);
    sound.playClick();
  }, [playerMaxHp, battleStage, battleMonsterIndex, calculateEnemyStats]);

  // Reiniciar Jornada de Fases (Regras Diárias e Benefícios VIP)
  const handleResetStage = useCallback(() => {
    const today = getTodayDateString();
    const currentCount = dailyBattleResetDate === today ? dailyBattleResetCount : 0;

    if (!isPremiumActive) {
      if (currentCount >= 1) {
        sound.playError();
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          '🚫 Limite diário atingido (1x ao dia sem VIP)! Assine o VIP.',
          '#f43f5e',
          2800
        );
        return;
      }
      if (cedulas < 500) {
        sound.playError();
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          'Cédulas insuficientes (500 Cédulas necessárias)!',
          '#f43f5e',
          2500
        );
        return;
      }
      setCedulas((c) => c - 500);
      setDailyBattleResetDate(today);
      setDailyBattleResetCount(currentCount + 1);
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 30,
        '-500 Cédulas (1º Reinício Diário)',
        '#fbbf24',
        2500
      );
    } else {
      // Com VIP Premium Ativo
      if (currentCount < 3) {
        // 1º, 2º e 3º reinícios: Grátis
        setDailyBattleResetDate(today);
        setDailyBattleResetCount(currentCount + 1);
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2 - 30,
          `👑 Reinício ${currentCount + 1}/3 Grátis (VIP)!`,
          '#4ade80',
          2500
        );
      } else if (currentCount === 3 || currentCount === 4) {
        // 4º e 5º reinícios: 500 Cédulas
        if (cedulas < 500) {
          sound.playError();
          fx.triggerFloatingText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Cédulas insuficientes (500 Cédulas necessárias)!',
            '#f43f5e',
            2500
          );
          return;
        }
        setCedulas((c) => c - 500);
        setDailyBattleResetDate(today);
        setDailyBattleResetCount(currentCount + 1);
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2 - 30,
          `-500 Cédulas (${currentCount + 1}º Reinício VIP)`,
          '#fbbf24',
          2500
        );
      } else {
        // 6º reinício em diante: 1 Diamante cada
        if (diamantes < 1) {
          sound.playError();
          fx.triggerFloatingText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Diamantes insuficientes (1 💎 necessário)!',
            '#38bdf8',
            2500
          );
          return;
        }
        setDiamantes((d) => d - 1);
        setDailyBattleResetDate(today);
        setDailyBattleResetCount(currentCount + 1);
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2 - 30,
          `-1 💎 Diamante (${currentCount + 1}º Reinício VIP)`,
          '#38bdf8',
          2500
        );
      }
    }

    const stats1 = calculateEnemyStats(1, 0);
    setBattleStage(1);
    setBattleMonsterIndex(0);
    setBattleTimeLeft(60);
    setBattlePlayerHp(playerMaxHp);
    setBattleEnemyHp(stats1.enemyMaxHp);
    battleEnemyHpRef.current = stats1.enemyMaxHp;
    battleMonsterIndexRef.current = 0;
    battleStageRef.current = 1;
    setIsBattlePlaying(false);
    setIsStageCompletedWaitingAdvance(false);
    sound.playUnlock();
    triggerScreenShake('shake-light');
  }, [
    isPremiumActive,
    dailyBattleResetDate,
    dailyBattleResetCount,
    cedulas,
    diamantes,
    playerMaxHp,
    calculateEnemyStats,
    triggerScreenShake,
  ]);

  // 5. Comprar Arma Tier 1 por 2 Cédulas
  const handleBuyTier1 = useCallback(() => {
    const cost = 2;
    if (cedulas < cost) {
      sound.playError();
      return;
    }

    const firstEmptyIndex = slots.findIndex((s) => s === null);
    if (firstEmptyIndex === -1) {
      sound.playError();
      return;
    }

    const durationSec = getCraftDurationSeconds(1);
    const currentTime = Date.now();

    const totalOps = (stats.totalPurchased || 0) + (stats.totalMerged || 0);
    const mastery = calculateUpgradeMastery(totalOps);
    const rolledRarity = rollInitialCraftRarity(mastery.bonusPercent);
    const rarityDef = getRarityData(rolledRarity);

    const newItem: WeaponItem = {
      id: `${currentTime}-${Math.random()}`,
      tier: 1,
      rarity: rolledRarity,
      createdTime: currentTime,
      crafting: {
        type: 'craft',
        targetTier: 1,
        targetRarity: rolledRarity,
        startTime: currentTime,
        durationMs: durationSec * 1000,
        endTime: currentTime + durationSec * 1000,
        fusionSucceeded: true,
      },
    };

    const nextSlots = [...slots];
    nextSlots[firstEmptyIndex] = newItem;

    setCedulas((prev) => prev - cost);
    setSlots(nextSlots);
    setStats((prev) => ({
      ...prev,
      totalPurchased: prev.totalPurchased + 1,
      totalCraftsCount: (prev.totalCraftsCount || 0) + 1,
    }));

    advanceQuests('craft', rolledRarity, 1);

    sound.playCraftStart();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `-2 Cédulas (🔨 Forjando T1 ${rarityDef.label} · ${durationSec}s)`,
      rarityDef.color
    );
  }, [cedulas, slots, stats, advanceQuests]);

  // 6. Preencher bancada com Tier 1 (10x ao dia grátis · Ilimitado VIP)
  const handleFillEmptyWithTier1 = useCallback(() => {
    const today = getTodayDateString();
    const currentCount = dailyFillBenchDate === today ? dailyFillBenchCount : 0;
    const remaining = isPremiumActive ? 999 : Math.max(0, 10 - currentCount);

    if (!isPremiumActive && remaining <= 0) {
      sound.playError();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        '👑 Limite diário atingido (10/10)! Adquira o VIP Premium para preencher ilimitadamente.',
        '#f43f5e'
      );
      showFusionNotification(
        'Limite Diário de Preenchimento (10/10)',
        'Você usou seus 10 preenchimentos diários gratuitos. Assine o VIP Premium na Loja para uso ilimitado!',
        'warning',
        '#f59e0b'
      );
      return;
    }

    const costPerItem = 2;
    const emptyIndices: number[] = [];
    slots.forEach((s, idx) => {
      if (s === null) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) {
      sound.playError();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Bancada já está cheia!',
        '#94a3b8'
      );
      return;
    }

    const maxAffordable = Math.floor(cedulas / costPerItem);
    const countToBuy = Math.min(emptyIndices.length, maxAffordable);

    if (countToBuy <= 0) {
      sound.playError();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Cédulas insuficientes (cada T1 custa 2 Cédulas)',
        '#f43f5e'
      );
      return;
    }

    const totalCost = countToBuy * costPerItem;
    const nextSlots = [...slots];
    const durationSec = getCraftDurationSeconds(1);
    const currentTime = Date.now();
    const totalOps = (stats.totalPurchased || 0) + (stats.totalMerged || 0);
    const mastery = calculateUpgradeMastery(totalOps);

    for (let i = 0; i < countToBuy; i++) {
      const idx = emptyIndices[i];
      const rolledRarity = rollInitialCraftRarity(mastery.bonusPercent);
      nextSlots[idx] = {
        id: `${currentTime}-${i}-${Math.random()}`,
        tier: 1,
        rarity: rolledRarity,
        createdTime: currentTime,
        crafting: {
          type: 'craft',
          targetTier: 1,
          targetRarity: rolledRarity,
          startTime: currentTime,
          durationMs: durationSec * 1000,
          endTime: currentTime + durationSec * 1000,
          fusionSucceeded: true,
        },
      };
      advanceQuests('craft', rolledRarity, 1);
    }

    setCedulas((prev) => prev - totalCost);
    setSlots(nextSlots);
    setStats((prev) => ({
      ...prev,
      totalPurchased: prev.totalPurchased + countToBuy,
      totalCraftsCount: (prev.totalCraftsCount || 0) + countToBuy,
    }));

    if (!isPremiumActive) {
      setDailyFillBenchDate(today);
      setDailyFillBenchCount((prev) => prev + 1);
    }

    const newRemaining = isPremiumActive ? 999 : Math.max(0, 9 - currentCount);
    sound.playCraftStart();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `-${totalCost} Cédulas (Forjando +${countToBuy} T1 · ${isPremiumActive ? '👑 VIP' : `${newRemaining}/10 hoje`})`,
      '#fbbf24'
    );
  }, [
    cedulas,
    slots,
    stats,
    isPremiumActive,
    dailyFillBenchDate,
    dailyFillBenchCount,
    advanceQuests,
    showFusionNotification,
  ]);

  // 6.1. Auto-Fusão da Mesma Raridade (10x ao dia grátis · Ilimitado VIP)
  const handleAutoMergeSameRarity = useCallback(() => {
    const today = getTodayDateString();
    const currentFusionCount = dailyAutoFusionDate === today ? dailyAutoFusionCount : 0;
    const remaining = isPremiumActive ? 999 : Math.max(0, 10 - currentFusionCount);

    if (!isPremiumActive && remaining <= 0) {
      sound.playError();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        '👑 Limite diário atingido (10/10)! Adquira o VIP Premium para auto-fusão ilimitada.',
        '#f43f5e'
      );
      showFusionNotification(
        'Limite Diário Atingido (10/10)',
        'Você usou suas 10 fusões automáticas gratuitas de hoje. Assine o VIP Premium na Loja para fundir à vontade!',
        'warning',
        '#f59e0b'
      );
      return;
    }

    // Encontrar pares da MESMA raridade e MESMO tier que não estejam em craft
    const availableSlots = slots
      .map((s, idx) => ({ s, idx }))
      .filter(({ s }) => s !== null && !s.crafting && s.tier < 15);

    // Ordenar por tier crescente para fundir em ordem
    availableSlots.sort((a, b) => a.s!.tier - b.s!.tier);

    const pairsToMerge: { sourceIdx: number; targetIdx: number; tier: number; rarity: WeaponRarity }[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < availableSlots.length; i++) {
      const itemA = availableSlots[i];
      if (usedIndices.has(itemA.idx) || !itemA.s) continue;

      for (let j = i + 1; j < availableSlots.length; j++) {
        const itemB = availableSlots[j];
        if (usedIndices.has(itemB.idx) || !itemB.s) continue;

        // REGRA CRÍTICA: APENAS MESMA RARIDADE E MESMO TIER!
        if (
          itemA.s.tier === itemB.s.tier &&
          (itemA.s.rarity || 'comum') === (itemB.s.rarity || 'comum')
        ) {
          usedIndices.add(itemA.idx);
          usedIndices.add(itemB.idx);
          pairsToMerge.push({
            sourceIdx: itemA.idx,
            targetIdx: itemB.idx,
            tier: itemA.s.tier,
            rarity: itemA.s.rarity || 'comum',
          });
          break;
        }
      }
    }

    if (pairsToMerge.length === 0) {
      sound.playError();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        '⚡ Nenhuma arma de mesma raridade e tier disponível para fundir!',
        '#94a3b8'
      );
      showFusionNotification(
        'Nenhum Par da Mesma Raridade',
        'A auto-fusão rápida junta apenas armas do mesmo tier E da mesma raridade! Forje mais armas ou aguarde as fusões atuais.',
        'attempt',
        '#38bdf8'
      );
      return;
    }

    // Executar todas as fusões de mesma raridade encontradas
    const nextSlots = [...slots];
    const totalOps = (stats.totalPurchased || 0) + (stats.totalMerged || 0);
    const mastery = calculateUpgradeMastery(totalOps);
    const currentTime = Date.now();
    let upgradedRarityCount = 0;
    let upgradedTierCount = 0;

    for (const pair of pairsToMerge) {
      const sourceItem = nextSlots[pair.sourceIdx]!;
      const targetItem = nextSlots[pair.targetIdx]!;
      const r = pair.rarity;

      // 1. Chance de Forja (Tier + 1)
      const forgeChance = getForgeTierSuccessChance(targetItem.tier);
      const forgeRoll = Math.random() * 100;
      const forgeSucceeded = forgeRoll < forgeChance;
      const nextTier = forgeSucceeded ? targetItem.tier + 1 : targetItem.tier;
      if (forgeSucceeded) upgradedTierCount++;

      // 2. Chance de Fusão (Mesma raridade: chance total, não corta pela metade!)
      const fusionChance = getFusionRarityUpgradeChance(
        r,
        r,
        mastery.bonusPercent,
        validBoosts.length
      );
      const fusionRollResult = rollFusionRarity(
        r,
        r,
        mastery.bonusPercent,
        validBoosts.length
      );
      const nextRarity = fusionRollResult.finalRarity;
      if (fusionRollResult.didUpgrade) upgradedRarityCount++;

      const durationSec = getCraftDurationSeconds(nextTier);

      // Desocupa o slot de origem
      nextSlots[pair.sourceIdx] = null;

      // Ocupa o slot de destino com o craft em andamento
      nextSlots[pair.targetIdx] = {
        ...targetItem,
        tier: nextTier,
        rarity: nextRarity,
        crafting: {
          type: 'fusion',
          targetTier: nextTier,
          targetRarity: nextRarity,
          originalTier: targetItem.tier,
          originalRarity: r,
          startTime: currentTime,
          durationMs: durationSec * 1000,
          endTime: currentTime + durationSec * 1000,
          forgeSucceeded,
          fusionSucceeded: fusionRollResult.didUpgrade,
          forgeChance,
          fusionChance,
          effectiveChance: fusionChance,
          isMixedFusion: false,
          sourceRarity: r,
          rarityJumps: fusionRollResult.rarityJumps,
          didUpgradeRarity: fusionRollResult.didUpgrade,
          upgradeMessage: fusionRollResult.upgradeMessage,
        },
      };

      advanceQuests('fusion', nextRarity, nextTier);
    }

    setSlots(nextSlots);
    setStats((prev) => ({
      ...prev,
      totalMerged: prev.totalMerged + pairsToMerge.length,
    }));

    if (!isPremiumActive) {
      setDailyAutoFusionDate(today);
      setDailyAutoFusionCount((prev) => prev + 1);
    }

    const newRemaining = isPremiumActive ? 999 : Math.max(0, 9 - currentFusionCount);
    sound.playMerge(pairsToMerge[0].tier);
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2 - 20,
      `⚡ ${pairsToMerge.length} ${pairsToMerge.length === 1 ? 'fusão iniciada' : 'fusões iniciadas'}! (${isPremiumActive ? '👑 VIP' : `${newRemaining}/10 hoje`})`,
      '#38bdf8'
    );

    showFusionNotification(
      `⚡ ${pairsToMerge.length} ${pairsToMerge.length === 1 ? 'Fusão Realizada' : 'Fusões Realizadas'} em Lote!`,
      `Fundidas armas de mesma raridade! ${upgradedTierCount} subiram Tier e ${upgradedRarityCount} aprimoraram Raridade. Restam: ${isPremiumActive ? 'Ilimitadas (VIP)' : `${newRemaining}/10 hoje`}.`,
      'success',
      '#38bdf8'
    );
  }, [
    slots,
    isPremiumActive,
    dailyAutoFusionDate,
    dailyAutoFusionCount,
    validBoosts.length,
    stats,
    advanceQuests,
    showFusionNotification,
  ]);

  // 7. Mover ou Fundir Armas
  const handleMoveOrMerge = useCallback(
    (fromIndex: number, toIndex: number, targetRect?: DOMRect) => {
      if (fromIndex === toIndex) return;

      const sourceItem = slots[fromIndex];
      const targetItem = slots[toIndex];

      if (!sourceItem) return;
      if (sourceItem.crafting || targetItem?.crafting) return;

      const nextSlots = [...slots];

      if (targetItem && targetItem.tier === sourceItem.tier) {
        if (targetItem.tier >= 15) {
          sound.playError();
          fx.triggerFloatingText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Tier 15 é o Nível Supremo!',
            '#ffffff'
          );
          return;
        }

        const sourceRarity = sourceItem.rarity || 'comum';
        const targetRarity = targetItem.rarity || 'comum';
        const defSource = getRarityData(sourceRarity);
        const defTarget = getRarityData(targetRarity);

        const totalOps = (stats.totalPurchased || 0) + (stats.totalMerged || 0);
        const mastery = calculateUpgradeMastery(totalOps);

        // 1. VERIFICAÇÃO DE REGRA: MÁXIMO 1 NÍVEL DE DIFERENÇA DE RARIDADE!
        // Não é permitido fundir com mais de 1 raridade acima ou abaixo (ex: Comum com Rara ou Incomum com Épica)
        const chanceCalc = calculateFusionSuccessChance(
          sourceRarity,
          targetRarity,
          validBoosts.length,
          targetItem.tier,
          mastery.bonusPercent
        );

        if (!chanceCalc.isAllowed) {
          sound.playError();
          triggerScreenShake('shake-light');

          const allowedLabel = getAllowedFusionRaritiesLabel(sourceRarity);
          const fxX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth / 2;
          const fxY = targetRect ? targetRect.top + targetRect.height / 2 : window.innerHeight / 2;

          fx.triggerFloatingText(
            fxX,
            fxY,
            `⚠️ Fusão Inválida! ${defSource.label} só aceita fusão com: ${allowedLabel}.`,
            '#f43f5e',
            2500
          );

          showFusionNotification(
            '⚠️ Fusão Bloqueada: Incompatível!',
            `${defSource.label} só aceita fusão com: ${allowedLabel}.`,
            'error',
            '#f43f5e'
          );

          setFusionBlockedAlert({
            sourceName: getWeaponData(sourceItem.tier).name,
            sourceRarity,
            sourceRarityLabel: defSource.label,
            sourceRarityColor: defSource.color,
            targetName: getWeaponData(targetItem.tier).name,
            targetRarity,
            targetRarityLabel: defTarget.label,
            targetRarityColor: defTarget.color,
            allowedRaritiesLabel: allowedLabel,
          });

          setSelectedSlot(null);
          return;
        }

        // Se a fusão for permitida, limpa qualquer aviso anterior
        setFusionBlockedAlert(null);

        // 2. FUSÃO PERMITIDA: MESMA RARIDADE OU EXATAMENTE 1 NÍVEL DE DIFERENÇA
        const durationSec = getCraftDurationSeconds(targetItem.tier + 1);
        const currentTime = Date.now();

        // A) Chance da Forja: aumenta o tier 1 acima se der certo (targetItem.tier + 1).
        // Se der errado, o tier NÃO regride, NÃO volta para 1, apenas fica no mesmo tier (targetItem.tier)!
        const forgeRoll = Math.random() * 100;
        const forgeSucceeded = forgeRoll <= chanceCalc.forgeChance;
        const targetTier = forgeSucceeded ? targetItem.tier + 1 : targetItem.tier;

        // B) Chance da Fusão (Raridade):
        // - Se raridades diferentes: chance corta pela metade. Se falhar, fica na menor raridade!
        // - Se mesma raridade: chance integral da configuração. Se falhar, fica na mesma raridade!
        const fusionResult = rollFusionRarity(
          sourceRarity,
          targetRarity,
          mastery.bonusPercent,
          validBoosts.length
        );
        const targetRarityResult = fusionResult.finalRarity;
        const rarityDef = getRarityData(targetRarityResult);

        nextSlots[toIndex] = {
          id: `${currentTime}-${Math.random()}`,
          tier: targetTier,
          rarity: targetRarityResult,
          createdTime: currentTime,
          crafting: {
            type: 'fusion',
            targetTier,
            targetRarity: targetRarityResult,
            originalTier: targetItem.tier,
            originalRarity: targetRarity,
            forgeSucceeded,
            fusionSucceeded: fusionResult.didUpgrade,
            forgeChance: chanceCalc.forgeChance,
            fusionChance: chanceCalc.effectiveChance,
            effectiveChance: chanceCalc.effectiveChance,
            isMixedFusion: !chanceCalc.isSameRarity,
            sourceRarity,
            rarityJumps: fusionResult.rarityJumps,
            didUpgradeRarity: fusionResult.didUpgrade,
            upgradeMessage: fusionResult.upgradeMessage,
            startTime: currentTime,
            durationMs: durationSec * 1000,
            endTime: currentTime + durationSec * 1000,
          },
        };
        nextSlots[fromIndex] = null;

        advanceQuests('fusion', chanceCalc.higherRarity, 1);

        setSlots(nextSlots);
        sound.playCraftStart();

        if (targetRect) {
          const fxX = targetRect.left + targetRect.width / 2;
          const fxY = targetRect.top + targetRect.height / 2;

          const forgePct = chanceCalc.forgeChance;
          const fusionPct = chanceCalc.effectiveChance;
          const isSame = chanceCalc.isSameRarity;

          if (isSame) {
            showFusionNotification(
              `⚡ Fusão Iniciada: ${rarityDef.label.toUpperCase()} (T${targetItem.tier} ➔ T${targetItem.tier + 1})`,
              `⚒️ Forja (+1 Tier): ${forgePct}% | ⚡ Fusão (Raridade): ${fusionPct}% (Integral). Sorteio em andamento (${durationSec}s)!`,
              'attempt',
              rarityDef.color
            );
            fx.triggerFloatingText(
              fxX,
              fxY,
              `⚒️ Forja ${forgePct}% (+1 Tier) | ⚡ Fusão ${fusionPct}% (${rarityDef.label})`,
              forgePct >= 70 ? '#4ade80' : '#fbbf24',
              2500
            );
          } else {
            const lowerDef = getRarityData(chanceCalc.lowerRarity);
            const higherDef = getRarityData(chanceCalc.higherRarity);
            showFusionNotification(
              `⚡ Fusão Mista Iniciada: ${lowerDef.label.toUpperCase()} + ${higherDef.label.toUpperCase()}`,
              `⚒️ Forja (+1 Tier): ${forgePct}% | ⚡ Fusão (Raridade): ${fusionPct}% (½ Menor Chance).`,
              'warning',
              '#fbbf24'
            );
            fx.triggerFloatingText(
              fxX,
              fxY,
              `⚒️ Forja ${forgePct}% (+1 Tier) | ⚡ Fusão ${fusionPct}% (½ Menor Chance)`,
              fusionPct >= 40 ? '#4ade80' : '#f59e0b',
              2500
            );
          }
        }
      } else if (!targetItem) {
        nextSlots[toIndex] = sourceItem;
        nextSlots[fromIndex] = null;
        setSlots(nextSlots);
        sound.playClick();
      } else {
        nextSlots[toIndex] = sourceItem;
        nextSlots[fromIndex] = targetItem;
        setSlots(nextSlots);
        sound.playSwap();

        if (targetRect) {
          const fxX = targetRect.left + targetRect.width / 2;
          const fxY = targetRect.top + targetRect.height / 2;
          fx.triggerFloatingText(fxX, fxY, 'Posições Invertidas ⇄', '#38bdf8');
        }
      }

      setSelectedSlot(null);
    },
    [slots, stats, validBoosts.length, advanceQuests]
  );

  // 8. Acelerar com 1 Diamante
  const handleRushCraft = useCallback(
    (index: number, event: React.MouseEvent) => {
      event.stopPropagation();
      const item = slots[index];
      if (!item?.crafting) return;

      if (diamantes < 1) {
        sound.playError();
        setActiveScreen('shop');
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          'Sem Diamantes! Abra o Mercado de Câmbio',
          '#38bdf8'
        );
        return;
      }

      setDiamantes((prev) => prev - 1);
      const finishedTier = item.crafting.targetTier;
      const finishedRarity: WeaponRarity = item.crafting.targetRarity || 'comum';
      const finishedWeaponData = getWeaponData(finishedTier);
      const rarityDef = getRarityData(finishedRarity);
      const wasFusion = item.crafting.type === 'fusion';
      const forgeSucceeded = item.crafting.forgeSucceeded !== false;
      const didUpgradeRarity = item.crafting.didUpgradeRarity === true;

      const nextSlots = [...slots];
      nextSlots[index] = {
        ...item,
        tier: finishedTier,
        rarity: finishedRarity,
        crafting: null,
      };
      setSlots(nextSlots);

      const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const fxX = targetRect.left + targetRect.width / 2;
      const fxY = targetRect.top + targetRect.height / 2;

      fx.triggerFloatingText(fxX, fxY - 30, '⚡ Acelerado (-1 💎)', '#22d3ee', 2000);

      if (wasFusion) {
        advanceQuests('fusion', finishedRarity, 1);

        if (forgeSucceeded && didUpgradeRarity) {
          triggerScreenShake('shake-crit');
          sound.playUnlock();
          fx.triggerMerge(fxX, fxY, rarityDef.color, finishedTier, finishedRarity, finishedWeaponData.name);
          fx.triggerFloatingText(fxX, fxY - 50, `🌟 SUCESSO TOTAL! T${finishedTier} & ${rarityDef.label}!`, rarityDef.color, 2500);
          showFusionNotification('🌟 SUCESSO TOTAL NA FORJA & FUSÃO!', `Tier aumentou para T${finishedTier} e Raridade aprimorada para ${rarityDef.label}!`, 'success', rarityDef.color);
        } else if (forgeSucceeded && !didUpgradeRarity) {
          triggerScreenShake('shake-light');
          sound.playMerge(finishedTier);
          fx.triggerMerge(fxX, fxY, rarityDef.color, finishedTier, finishedRarity, finishedWeaponData.name);
          fx.triggerFloatingText(fxX, fxY, `⚒️ TIER AUMENTADO! Tier ${finishedTier} (${rarityDef.label})`, '#38bdf8', 2500);
          showFusionNotification('⚒️ TIER AUMENTADO COM SUCESSO!', `A forja aumentou a arma para Tier ${finishedTier}. Raridade: ${rarityDef.label}.`, 'success', '#38bdf8');
        } else if (!forgeSucceeded && didUpgradeRarity) {
          triggerScreenShake('shake-heavy');
          sound.playUnlock();
          fx.triggerMerge(fxX, fxY, rarityDef.color, finishedTier, finishedRarity, finishedWeaponData.name);
          fx.triggerFloatingText(fxX, fxY - 50, `✨ RARIDADE APRIMORADA! ${rarityDef.label} (Tier ${finishedTier})`, rarityDef.color, 2500);
          showFusionNotification('✨ RARIDADE APRIMORADA!', `A fusão aprimorou a raridade para ${rarityDef.label}! (Tier ${finishedTier} mantido).`, 'success', rarityDef.color);
        } else {
          sound.playClick();
          fx.triggerFloatingText(fxX, fxY, `🛡️ Forja Resistente: Tier ${finishedTier} (${rarityDef.label}) mantido.`, '#fbbf24', 2500);
          showFusionNotification('🛡️ Forja Resistente (Tier Mantido)', `A arma permaneceu no Tier ${finishedTier} (${rarityDef.label}). Não houve regressão de nível!`, 'warning', '#fbbf24');
          setStats((prev) => ({
            ...prev,
            totalFailedFusions: (prev.totalFailedFusions || 0) + 1,
          }));
        }
      } else {
        advanceQuests('craft', finishedRarity, 1);
        triggerScreenShake(finishedTier >= 8 ? 'shake-heavy' : 'shake-light');
        fx.triggerMerge(
          fxX,
          fxY,
          rarityDef.id !== 'comum' ? rarityDef.particleColor : finishedWeaponData.accentColor,
          finishedTier,
          finishedRarity,
          finishedWeaponData.name
        );
      }

      const isFirstDiscovery = !unlockedTiers.includes(finishedTier);
      if (isFirstDiscovery) {
        setUnlockedTiers((prev) => [...prev, finishedTier]);
        setCelebrationTier(finishedTier);
        sound.playUnlock();
      } else {
        sound.playMerge(finishedTier);
      }

      if (!unlockedRarities.includes(finishedRarity)) {
        setUnlockedRarities((prev) => [...prev, finishedRarity]);
        setCelebrationRarity(finishedRarity);
      }

      setStats((prev) => ({
        ...prev,
        totalMerged: wasFusion ? prev.totalMerged + 1 : prev.totalMerged,
        totalCraftsCount: (prev.totalCraftsCount || 0) + 1,
        highestTierUnlocked: Math.max(prev.highestTierUnlocked, finishedTier),
      }));
    },
    [slots, diamantes, unlockedTiers, unlockedRarities, triggerScreenShake, advanceQuests]
  );

  // 9. Conversão de Cédulas em Diamantes
  const handleConvertCedulasToDiamonds = useCallback(
    (diamondsToBuy: number) => {
      const cost = diamondsToBuy * 1000;
      if (cedulas < cost || diamondsToBuy <= 0) {
        sound.playError();
        return;
      }

      setCedulas((prev) => prev - cost);
      setDiamantes((prev) => prev + diamondsToBuy);
      setStats((prev) => ({
        ...prev,
        totalDiamondsConverted: (prev.totalDiamondsConverted || 0) + diamondsToBuy,
      }));

      sound.playDiamondConvert();
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        `+${diamondsToBuy} 💎 Diamantes`,
        '#22d3ee'
      );
    },
    [cedulas]
  );

  // 10. Comprar Amuleto de Proteção de Fusão
  const handleBuyFusionBoost = useCallback(() => {
    const currentTime = Date.now();
    const currentValid = fusionBoosts.filter((b) => b.expiresAt > currentTime);
    if (currentValid.length >= 5) {
      sound.playError();
      return;
    }

    if (diamantes < 10) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Sem Diamantes suficientes (10 💎 necessários)',
        '#38bdf8'
      );
      return;
    }

    setDiamantes((prev) => prev - 10);
    const newBoost: FusionBoost = {
      id: `boost-${currentTime}-${Math.random()}`,
      purchasedAt: currentTime,
      expiresAt: currentTime + 24 * 60 * 60 * 1000,
      bonusPercent: 10,
    };

    const nextBoosts = [...currentValid, newBoost];
    setFusionBoosts(nextBoosts);

    sound.playUnlock();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `⚡ Amuleto Ativado (+10% por 24h) [${nextBoosts.length}/5]`,
      '#fbbf24'
    );
  }, [diamantes, fusionBoosts]);

  // 11. Comprar Moeda / Passe Premium (3 Horas por 10 💎)
  const handleBuyPremium = useCallback(() => {
    if (diamantes < 10) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Sem Diamantes suficientes (10 💎 necessários)',
        '#38bdf8'
      );
      return;
    }

    setDiamantes((prev) => prev - 10);
    const currentTime = Date.now();
    const currentBase = Math.max(currentTime, premiumExpiresAt);
    const newExpiresAt = currentBase + 3 * 60 * 60 * 1000;
    setPremiumExpiresAt(newExpiresAt);

    sound.playUnlock();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      '👑 VIP Premium Ativado (+3 Horas)!',
      '#fbbf24'
    );
  }, [diamantes, premiumExpiresAt]);

  // 12. Comprar Elixir de Golpe Rápido (1h por 2 💎 ou 3h por 5 💎)
  const handleBuyQuickStrike = useCallback((hours: 1 | 3 = 1) => {
    const cost = hours === 1 ? 2 : 5;
    if (diamantes < cost) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        `Sem Diamantes (${cost} 💎 necessários)`,
        '#38bdf8',
        2500
      );
      return;
    }

    setDiamantes((prev) => prev - cost);
    const currentTime = Date.now();
    const currentBase = Math.max(currentTime, quickStrikeExpiresAt);
    const addedMs = hours * 60 * 60 * 1000;
    const newExpiresAt = currentBase + addedMs;
    setQuickStrikeExpiresAt(newExpiresAt);

    sound.playUnlock();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `⚡ Golpe Rápido Ativado (+${hours}h por ${cost} 💎)!`,
      '#fb7185',
      2500
    );
  }, [diamantes, quickStrikeExpiresAt]);

  // 12.1. Comprar Coleta Automática de Armas (1 Hora por 1 💎 - Acumulativo)
  const handleBuyAutoCollect = useCallback(() => {
    if (diamantes < 1) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Sem Diamantes suficientes (1 💎 necessário)',
        '#38bdf8',
        2500
      );
      return;
    }

    setDiamantes((prev) => prev - 1);
    const currentTime = Date.now();
    const currentBase = Math.max(currentTime, autoCollectExpiresAt);
    const addedMs = 60 * 60 * 1000; // 1 hora
    const newExpiresAt = currentBase + addedMs;
    setAutoCollectExpiresAt(newExpiresAt);

    sound.playUnlock();
    triggerScreenShake('shake-light');
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      '🤖 Coleta Automática Ativada (+1h por 1 💎)!',
      '#34d399',
      2500
    );
  }, [diamantes, autoCollectExpiresAt, triggerScreenShake]);

  // 12.2. Comprar Modo Simulado de Batalha (3 Dias por 1 💎 - Acumulativo)
  const handleBuyBattleSimulation = useCallback(() => {
    if (diamantes < 1) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Sem Diamantes suficientes (1 💎 necessário)',
        '#38bdf8',
        2500
      );
      return;
    }

    setDiamantes((prev) => prev - 1);
    const currentTime = Date.now();
    const currentBase = Math.max(currentTime, battleSimulationExpiresAt);
    const addedMs = 3 * 24 * 60 * 60 * 1000; // 3 dias (72 horas)
    const newExpiresAt = currentBase + addedMs;
    setBattleSimulationExpiresAt(newExpiresAt);

    sound.playUnlock();
    triggerScreenShake('shake-light');
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      '⚡ Modo Simulado Ativado (+3 Dias por 1 💎)!',
      '#c084fc',
      2500
    );
  }, [diamantes, battleSimulationExpiresAt, triggerScreenShake]);

  // 12.3. Comprar Orbe de Encantamento de Raridade (1 Hora por 1 💎)
  const handleBuyRarityEnchant = useCallback(() => {
    if (diamantes < 1) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'Sem Diamantes suficientes (1 💎 necessário)',
        '#38bdf8',
        2500
      );
      return;
    }

    setDiamantes((prev) => prev - 1);
    setRarityEnchantCharges((prev) => (prev || 0) + 1);

    sound.playUnlock();
    triggerScreenShake('shake-light');
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      '✨ +1 Orbe de Encantamento Adquirido (1 💎)!',
      '#e879f9',
      2500
    );
    showFusionNotification(
      '✨ Orbe de Encantamento Obtido!',
      'Use na Bancada em qualquer arma para elevar sua raridade em +1 nível por 1 hora!',
      'success',
      '#e879f9'
    );
  }, [diamantes, triggerScreenShake, showFusionNotification]);

  // 12.4. Encantar Arma na Bancada (+1 Nível de Raridade por 1 Hora)
  const handleEnchantWeapon = useCallback(
    (slotIndex: number) => {
      const item = slots[slotIndex];
      if (!item || item.crafting) return;

      const currentRarity = item.rarity || 'comum';
      if (currentRarity === 'primordial') {
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          '👑 A arma já está na raridade máxima Primordial!',
          '#ffffff',
          2500
        );
        return;
      }

      const hasCharges = (rarityEnchantCharges || 0) > 0;
      if (!hasCharges && diamantes < 1) {
        sound.playError();
        setActiveScreen('shop');
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          'Sem Orbes ou Diamantes suficientes (1 💎)!',
          '#38bdf8',
          2500
        );
        return;
      }

      // Consumir 1 Orbe do inventário ou 1 Diamante
      if (hasCharges) {
        setRarityEnchantCharges((prev) => Math.max(0, (prev || 0) - 1));
      } else {
        setDiamantes((prev) => prev - 1);
      }

      const nextRarity = getNextRarity(currentRarity);
      if (!nextRarity) return;

      const nowTime = Date.now();
      const currentExpiresAt = item.enchantExpiresAt && item.enchantExpiresAt > nowTime ? item.enchantExpiresAt : nowTime;
      const newExpiresAt = currentExpiresAt + 60 * 60 * 1000; // +1 Hora (3600 segundos)

      const originalBaseRarity = item.baseRarity || item.rarity || 'comum';
      const newRarityDef = getRarityData(nextRarity);
      const oldRarityDef = getRarityData(currentRarity);

      const nextSlots = [...slots];
      nextSlots[slotIndex] = {
        ...item,
        baseRarity: originalBaseRarity,
        rarity: nextRarity,
        enchantExpiresAt: newExpiresAt,
      };

      if (equippedWeapon?.id === item.id) {
        setEquippedWeapon({
          ...equippedWeapon,
          baseRarity: originalBaseRarity,
          rarity: nextRarity,
          enchantExpiresAt: newExpiresAt,
        });
      }

      setSlots(nextSlots);
      sound.playUnlock();
      triggerScreenShake('shake-light');

      const wData = getWeaponData(item.tier);
      fx.triggerMerge(
        window.innerWidth / 2,
        window.innerHeight / 2,
        newRarityDef.color,
        item.tier,
        nextRarity,
        wData.name
      );
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 40,
        `✨ Encantada: ${oldRarityDef.label} ➔ ${newRarityDef.label} (1 Hora)!`,
        newRarityDef.color,
        3000
      );
      showFusionNotification(
        '✨ Arma Encantada com Sucesso!',
        `${wData.name} agora é ${newRarityDef.label} por 1 hora! (+Dano, +Crítico e aceita fusões no nível elevado)`,
        'success',
        newRarityDef.color
      );
    },
    [slots, rarityEnchantCharges, diamantes, equippedWeapon, triggerScreenShake, showFusionNotification]
  );

  // 12.2. Coleta Manual de Arma Pronta na Bancada
  const handleCollectCraft = useCallback(
    (index: number, event?: React.MouseEvent) => {
      const item = slots[index];
      if (!item?.crafting) return;
      if (Date.now() < item.crafting.endTime) return;

      const currentTime = Date.now();
      const finishedTier = item.crafting.targetTier;
      const finishedRarity: WeaponRarity = item.crafting.targetRarity || 'comum';
      const finishedWeaponData = getWeaponData(finishedTier);
      const rarityDef = getRarityData(finishedRarity);
      const wasFusion = item.crafting.type === 'fusion';
      const forgeSucceeded = item.crafting.forgeSucceeded !== false;
      const didUpgradeRarity = item.crafting.didUpgradeRarity === true;

      const nextSlots = [...slots];
      nextSlots[index] = {
        ...item,
        tier: finishedTier,
        rarity: finishedRarity,
        crafting: null,
      };

      let fxX = window.innerWidth / 2;
      let fxY = window.innerHeight / 2;
      if (event?.currentTarget) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        fxX = rect.left + rect.width / 2;
        fxY = rect.top + rect.height / 2;
      }

      fx.triggerFloatingText(fxX, fxY - 20, '✨ Arma Coletada!', '#34d399', 1800);

      if (wasFusion) {
        advanceQuests('fusion', finishedRarity, 1);
        if (forgeSucceeded && didUpgradeRarity) {
          triggerScreenShake('shake-crit');
          sound.playUnlock();
          fx.triggerMerge(fxX, fxY, rarityDef.color, finishedTier, finishedRarity, finishedWeaponData.name);
          fx.triggerFloatingText(fxX, fxY - 50, `🌟 SUCESSO TOTAL! T${finishedTier} & ${rarityDef.label}!`, rarityDef.color, 2500);
          showFusionNotification('🌟 SUCESSO TOTAL NA FORJA & FUSÃO!', `Tier aumentou para T${finishedTier} e Raridade aprimorada para ${rarityDef.label}!`, 'success', rarityDef.color);
        } else if (forgeSucceeded && !didUpgradeRarity) {
          triggerScreenShake('shake-light');
          sound.playMerge(finishedTier);
          fx.triggerMerge(fxX, fxY, rarityDef.color, finishedTier, finishedRarity, finishedWeaponData.name);
          fx.triggerFloatingText(fxX, fxY, `⚒️ TIER AUMENTADO! Tier ${finishedTier} (${rarityDef.label})`, '#38bdf8', 2500);
          showFusionNotification('⚒️ TIER AUMENTADO COM SUCESSO!', `A forja aumentou a arma para Tier ${finishedTier}. Raridade: ${rarityDef.label}.`, 'success', '#38bdf8');
        } else if (!forgeSucceeded && didUpgradeRarity) {
          triggerScreenShake('shake-heavy');
          sound.playUnlock();
          fx.triggerMerge(fxX, fxY, rarityDef.color, finishedTier, finishedRarity, finishedWeaponData.name);
          fx.triggerFloatingText(fxX, fxY - 50, `✨ RARIDADE APRIMORADA! ${rarityDef.label} (Tier ${finishedTier})`, rarityDef.color, 2500);
          showFusionNotification('✨ RARIDADE APRIMORADA!', `A fusão aprimorou a raridade para ${rarityDef.label}! (Tier ${finishedTier} mantido).`, 'success', rarityDef.color);
        } else {
          sound.playClick();
          fx.triggerFloatingText(fxX, fxY, `🛡️ Forja Resistente: Tier ${finishedTier} (${rarityDef.label}) mantido.`, '#fbbf24', 2500);
          showFusionNotification('🛡️ Forja Resistente (Tier Mantido)', `A arma permaneceu no Tier ${finishedTier} (${rarityDef.label}). Não houve regressão de nível!`, 'warning', '#fbbf24');
          setStats((prev) => ({
            ...prev,
            totalFailedFusions: (prev.totalFailedFusions || 0) + 1,
          }));
        }
      } else {
        advanceQuests('craft', finishedRarity, 1);
        triggerScreenShake(finishedTier >= 8 ? 'shake-heavy' : 'shake-light');
        sound.playMerge(finishedTier);
        fx.triggerMerge(
          fxX,
          fxY,
          rarityDef.id !== 'comum' ? rarityDef.particleColor : finishedWeaponData.accentColor,
          finishedTier,
          finishedRarity,
          finishedWeaponData.name
        );
        fx.triggerFloatingText(fxX, fxY - 40, `🔨 FORJA CONCLUÍDA! Tier ${finishedTier} (${rarityDef.label})`, rarityDef.color, 2000);
      }

      // Descobertas
      if (!unlockedTiers.includes(finishedTier)) {
        setUnlockedTiers((prev) => [...prev, finishedTier]);
        setCelebrationTier(finishedTier);
        sound.playUnlock();
      }
      if (!unlockedRarities.includes(finishedRarity)) {
        setUnlockedRarities((prev) => [...prev, finishedRarity]);
        setCelebrationRarity(finishedRarity);
      }

      setStats((prev) => ({
        ...prev,
        totalMerged: wasFusion ? prev.totalMerged + 1 : prev.totalMerged,
        totalCraftsCount: (prev.totalCraftsCount || 0) + 1,
        highestTierUnlocked: Math.max(prev.highestTierUnlocked, finishedTier),
      }));

      setSlots(nextSlots);
    },
    [slots, unlockedTiers, unlockedRarities, advanceQuests, triggerScreenShake, showFusionNotification]
  );

  // 12.3. Coletar Todas as Armas Prontas da Bancada
  const handleCollectAllReady = useCallback(() => {
    const currentTime = Date.now();
    let collectedCount = 0;
    const nextSlots = [...slots];

    nextSlots.forEach((slot, index) => {
      if (slot?.crafting && currentTime >= slot.crafting.endTime) {
        const finishedTier = slot.crafting.targetTier;
        const finishedRarity: WeaponRarity = slot.crafting.targetRarity || 'comum';
        const wasFusion = slot.crafting.type === 'fusion';
        const forgeSucceeded = slot.crafting.forgeSucceeded !== false;
        const didUpgradeRarity = slot.crafting.didUpgradeRarity === true;

        nextSlots[index] = {
          ...slot,
          tier: finishedTier,
          rarity: finishedRarity,
          crafting: null,
        };
        collectedCount++;

        if (wasFusion) {
          advanceQuests('fusion', finishedRarity, 1);
          if (!forgeSucceeded && !didUpgradeRarity) {
            setStats((prev) => ({ ...prev, totalFailedFusions: (prev.totalFailedFusions || 0) + 1 }));
          }
        } else {
          advanceQuests('craft', finishedRarity, 1);
        }

        if (!unlockedTiers.includes(finishedTier)) {
          setUnlockedTiers((prev) => [...prev, finishedTier]);
        }
        if (!unlockedRarities.includes(finishedRarity)) {
          setUnlockedRarities((prev) => [...prev, finishedRarity]);
        }
      }
    });

    if (collectedCount > 0) {
      setSlots(nextSlots);
      sound.playMerge(3);
      triggerScreenShake('shake-light');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2 - 30,
        `✨ ${collectedCount} Armas Coletadas!`,
        '#34d399',
        2200
      );
    }
  }, [slots, unlockedTiers, unlockedRarities, advanceQuests, triggerScreenShake]);

  // 13. Resgate do Login Diário (50 a 1000 Cédulas)
  const handleClaimDailyLogin = useCallback(() => {
    const today = getTodayDateString();
    if (dailyLogin.lastClaimDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let newStreak = 1;
    if (dailyLogin.lastClaimDate === yStr) {
      newStreak = (dailyLogin.streak || 0) + 1;
    } else if (!dailyLogin.lastClaimDate) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }

    const reward = calculateDailyReward(newStreak);

    setDailyLogin({
      streak: newStreak,
      lastClaimDate: today,
    });

    setCedulas((c) => c + reward);
    sound.playUnlock();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `🎁 +${reward} Cédulas (Login Diário - Dia ${newStreak})!`,
      '#4ade80'
    );
  }, [dailyLogin]);

  // 14. Resgate de Recompensa de Missão
  const handleClaimQuest = useCallback((questId: string) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest || targetQuest.claimed || targetQuest.currentCount < targetQuest.targetCount) return;

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );

    setCedulas((c) => c + targetQuest.rewardCedulas);
    sound.playUnlock();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2,
      `📜 +${targetQuest.rewardCedulas} Cédulas (Missão Concluída)!`,
      '#22d3ee'
    );

    // Progresso do Passe de Batalha (a cada 10 missões, sobe 1 nível!)
    setSeasonPass((prevPass) => {
      const nextTotal = (prevPass.totalMissionsCompletedThisMonth || 0) + 1;
      const oldLevel = Math.floor((prevPass.totalMissionsCompletedThisMonth || 0) / 10);
      const newLevel = Math.floor(nextTotal / 10);

      if (newLevel > oldLevel) {
        sound.playMerge(10);
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2 - 40,
          `🎖️ PASSE DE TEMPORADA: NÍVEL ${newLevel} ALCANÇADO!`,
          '#fbbf24'
        );
      }

      return {
        ...prevPass,
        totalMissionsCompletedThisMonth: nextTotal,
      };
    });
  }, [quests]);

  // 15. Compra do Passe de Temporada Premium (30.000 Cédulas ou 30 💎)
  const handleBuySeasonPassPremium = useCallback((currency: 'cedulas' | 'diamantes') => {
    if (seasonPass.isPremiumUnlocked) {
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        '👑 Passe de Temporada Premium já está ativo!',
        '#fbbf24'
      );
      return;
    }

    if (currency === 'cedulas') {
      const cost = 30000;
      if (cedulas < cost) {
        sound.playError();
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          `Cédulas insuficientes (${formatNumber(cedulas)} / 30.000)!`,
          '#f43f5e'
        );
        return;
      }
      setCedulas((prev) => prev - cost);
    } else {
      const cost = 30;
      if (diamantes < cost) {
        sound.playError();
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          `Diamantes insuficientes (${diamantes} / 30 💎)!`,
          '#f43f5e'
        );
        return;
      }
      setDiamantes((prev) => prev - cost);
    }

    setSeasonPass((prev) => ({
      ...prev,
      isPremiumUnlocked: true,
    }));

    sound.playUnlock();
    fx.triggerFloatingText(
      window.innerWidth / 2,
      window.innerHeight / 2 - 30,
      '👑 PASSE DE TEMPORADA PREMIUM DESBLOQUEADO (+50% RECOMPENSAS)!',
      '#fbbf24'
    );
    showFusionNotification(
      '👑 Passe Premium Desbloqueado!',
      'Você agora tem acesso à Trilha Dourada com +50% de bônus em todas as recompensas até o final do mês (Dia 1)!',
      'success',
      '#fbbf24'
    );
  }, [seasonPass.isPremiumUnlocked, cedulas, diamantes, showFusionNotification]);

  // 15.1. Resgate de Nível do Passe da Temporada (Trilha Normal e Trilha Premium +50%)
  const handleClaimPassLevel = useCallback((level: number, isPremiumTrack?: boolean, clickRect?: DOMRect) => {
    const reward = PASS_REWARDS.find((r) => r.level === level);
    if (!reward) return;

    const currentLevel = Math.floor((seasonPass.totalMissionsCompletedThisMonth || 0) / 10);
    if (currentLevel < level) return;

    const fxX = clickRect ? clickRect.left + clickRect.width / 2 : window.innerWidth / 2;
    const fxY = clickRect ? clickRect.top + clickRect.height / 2 : window.innerHeight / 2;

    if (isPremiumTrack) {
      if (!seasonPass.isPremiumUnlocked) {
        sound.playError();
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          '🔒 Requer Passe Premium (30.000 Cédulas ou 30 💎)!',
          '#f43f5e'
        );
        return;
      }
      if ((seasonPass.claimedPremiumLevels || []).includes(level)) return;

      const premReward = getPassPremiumReward(reward);
      if (premReward.cedulas) {
        setCedulas((c) => c + premReward.cedulas);
      }
      if (premReward.diamantes) {
        setDiamantes((d) => d + premReward.diamantes!);
      }
      if (premReward.premiumHours) {
        const nowTime = Date.now();
        const base = Math.max(nowTime, premiumExpiresAt);
        setPremiumExpiresAt(base + premReward.premiumHours * 60 * 60 * 1000);
      }
      if (premReward.quickStrikeHours) {
        const nowTime = Date.now();
        const base = Math.max(nowTime, quickStrikeExpiresAt);
        setQuickStrikeExpiresAt(base + premReward.quickStrikeHours * 60 * 60 * 1000);
      }
      if (premReward.amuletoCharges) {
        const nowTime = Date.now();
        const newBoosts: FusionBoost[] = Array.from({ length: premReward.amuletoCharges }).map((_, i) => ({
          id: `pass-prem-boost-${nowTime}-${i}`,
          purchasedAt: nowTime,
          expiresAt: nowTime + 24 * 60 * 60 * 1000,
          bonusPercent: 10,
        }));
        setFusionBoosts((prev) => [...prev.filter((b) => b.expiresAt > nowTime), ...newBoosts].slice(-5));
      }

      setSeasonPass((prev) => ({
        ...prev,
        claimedPremiumLevels: [...(prev.claimedPremiumLevels || []), level],
      }));

      triggerScreenShake('shake-heavy');
      sound.playChestReward();
      fx.triggerChestOpening(
        fxX,
        fxY,
        `BAÚ PREMIUM NÍVEL ${level} ABERTO!`,
        premReward.description,
        true
      );
    } else {
      if (seasonPass.claimedLevels.includes(level)) return;

      if (reward.cedulas) {
        setCedulas((c) => c + reward.cedulas);
      }
      if (reward.diamantes) {
        setDiamantes((d) => d + reward.diamantes!);
      }
      if (reward.premiumHours) {
        const nowTime = Date.now();
        const base = Math.max(nowTime, premiumExpiresAt);
        setPremiumExpiresAt(base + reward.premiumHours * 60 * 60 * 1000);
      }
      if (reward.quickStrikeHours) {
        const nowTime = Date.now();
        const base = Math.max(nowTime, quickStrikeExpiresAt);
        setQuickStrikeExpiresAt(base + reward.quickStrikeHours * 60 * 60 * 1000);
      }
      if (reward.amuletoCharges) {
        const nowTime = Date.now();
        const newBoosts: FusionBoost[] = Array.from({ length: reward.amuletoCharges }).map((_, i) => ({
          id: `pass-boost-${nowTime}-${i}`,
          purchasedAt: nowTime,
          expiresAt: nowTime + 24 * 60 * 60 * 1000,
          bonusPercent: 10,
        }));
        setFusionBoosts((prev) => [...prev.filter((b) => b.expiresAt > nowTime), ...newBoosts].slice(-5));
      }

      setSeasonPass((prev) => ({
        ...prev,
        claimedLevels: [...prev.claimedLevels, level],
      }));

      triggerScreenShake('shake-heavy');
      sound.playChestReward();
      fx.triggerChestOpening(
        fxX,
        fxY,
        `BAÚ DO PASSE NÍVEL ${level} ABERTO!`,
        reward.description,
        false
      );
    }
  }, [seasonPass, premiumExpiresAt, quickStrikeExpiresAt, triggerScreenShake]);

  // 16. Venda de Arma
  const handleSellSlot = useCallback(
    (index: number, targetRect?: DOMRect) => {
      const item = slots[index];
      if (!item) return;
      if (item.crafting) return;

      const data = getWeaponData(item.tier);
      const rarityDef = getRarityData(item.rarity || 'comum');
      const gain = Math.round(data.sellValue * rarityDef.sellMultiplier);

      const nextSlots = [...slots];
      nextSlots[index] = null;

      if (equippedWeapon?.id === item.id) {
        setEquippedWeapon(null);
      }

      setSlots(nextSlots);
      setCedulas((prev) => prev + gain);
      setStats((prev) => ({
        ...prev,
        totalSold: prev.totalSold + 1,
        totalCedulasEarned: prev.totalCedulasEarned + gain,
      }));

      sound.playSell();

      if (targetRect) {
        const fxX = targetRect.left + targetRect.width / 2;
        const fxY = targetRect.top + targetRect.height / 2;
        fx.triggerFloatingText(fxX, fxY, `+${formatNumber(gain)} Cédulas (${rarityDef.label})`, '#4ade80');
      } else {
        fx.triggerFloatingText(
          window.innerWidth / 2,
          window.innerHeight / 2,
          `+${formatNumber(gain)} Cédulas (${rarityDef.label})`,
          '#4ade80'
        );
      }

      if (selectedSlot === index) {
        setSelectedSlot(null);
      }
    },
    [slots, selectedSlot, equippedWeapon]
  );

  const handleQuickSell = useCallback(
    (index: number, event?: React.MouseEvent) => {
      if (event) event.stopPropagation();
      const targetRect = event ? (event.currentTarget as HTMLElement).getBoundingClientRect() : undefined;
      handleSellSlot(index, targetRect);
    },
    [handleSellSlot]
  );

  const handleSellSelected = useCallback(() => {
    if (selectedSlot !== null && slots[selectedSlot]) {
      handleSellSlot(selectedSlot);
    }
  }, [selectedSlot, slots, handleSellSlot]);

  // 17. Auto-Organizar bancada (Requer VIP Premium)
  const handleAutoSort = useCallback(() => {
    if (!isPremiumActive) {
      sound.playError();
      setActiveScreen('shop');
      fx.triggerFloatingText(
        window.innerWidth / 2,
        window.innerHeight / 2,
        '👑 Auto-Organizar requer Passe Premium (3h por 10 💎)',
        '#fbbf24'
      );
      return;
    }

    const activeItems = slots.filter((s): s is WeaponItem => s !== null);
    if (activeItems.length === 0) return;

    activeItems.sort((a, b) => b.tier - a.tier);

    const newSlots: (WeaponItem | null)[] = Array(16).fill(null);
    activeItems.forEach((item, i) => {
      newSlots[i] = item;
    });

    setSlots(newSlots);
    setSelectedSlot(null);
    sound.playClick();
  }, [slots, isPremiumActive]);

  // 18. Reiniciar Jogo
  const handleResetGame = useCallback(() => {
    const initialSlots: (WeaponItem | null)[] = Array(16).fill(null);
    initialSlots[0] = { id: 'init-1', tier: 1, rarity: 'comum', createdTime: Date.now() };
    initialSlots[1] = { id: 'init-2', tier: 1, rarity: 'comum', createdTime: Date.now() + 1 };

    setCedulas(INITIAL_CEDULAS);
    setDiamantes(0);
    setPremiumExpiresAt(0);
    setQuickStrikeExpiresAt(0);
    setAutoCollectExpiresAt(0);
    setBattleSimulationExpiresAt(0);
    setDailyBattleResetDate(getTodayDateString());
    setDailyBattleResetCount(0);
    setSlots(initialSlots);
    setUnlockedTiers([1]);
    setUnlockedRarities(['comum']);
    setFusionBoosts([]);
    setEquippedWeapon(null);
    setBattleStage(1);
    setBattleMonsterIndex(0);
    setBattleTimeLeft(60);
    setIsBattlePlaying(false);
    setIsStageCompletedWaitingAdvance(false);
    setDailyLogin({ streak: 1, lastClaimDate: '' });
    setQuests([...generateDailyQuests(), ...generateWeeklyQuests()]);
    setSeasonPass({ monthKey: getCurrentMonthKey(), totalMissionsCompletedThisMonth: 0, claimedLevels: [] });
    setStats({
      ...DEFAULT_STATS,
      totalCedulasEarned: INITIAL_CEDULAS,
    });
    setSelectedSlot(null);
    localStorage.removeItem(STORAGE_KEY);
    sound.playClick();
  }, []);

  // Total de Recompensas Pendentes para exibir nos Badges
  const todayStr = getTodayDateString();
  const hasLoginPending = dailyLogin.lastClaimDate !== todayStr;
  const pendingQuestsCount = quests.filter((q) => !q.claimed && q.currentCount >= q.targetCount).length;
  const passCurrentLevel = Math.floor((seasonPass.totalMissionsCompletedThisMonth || 0) / 10);
  const pendingPassCount = PASS_REWARDS.filter(
    (r) => passCurrentLevel >= r.level && !seasonPass.claimedLevels.includes(r.level)
  ).length;
  const totalPendingRewards = (hasLoginPending ? 1 : 0) + pendingQuestsCount + pendingPassCount;

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'KeyC') {
        e.preventDefault();
        handleBuyTier1();
      } else if (e.code === 'KeyO') {
        e.preventDefault();
        handleAutoSort();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        setActiveScreen('shop');
      } else if (e.code === 'Digit1') {
        setActiveScreen('shop');
      } else if (e.code === 'Digit2') {
        setActiveScreen('battle');
      } else if (e.code === 'Digit3') {
        setActiveScreen('forge');
      } else if (e.code === 'Digit4') {
        setActiveScreen('rewards');
      } else if (e.code === 'Digit5') {
        setActiveScreen('catalog');
      } else if (e.code === 'Digit6') {
        setActiveScreen('mastery');
      } else if (e.code === 'Escape') {
        setSelectedSlot(null);
        setIsCodexOpen(false);
        setIsStatsOpen(false);
        setIsExchangeOpen(false);
        setIsFusionBoostOpen(false);
        setCelebrationTier(null);
        setCelebrationRarity(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBuyTier1, handleAutoSort, handleToggleSound]);

  const selectedWeaponData =
    selectedSlot !== null && slots[selectedSlot]
      ? { slotIndex: selectedSlot, item: slots[selectedSlot]! }
      : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* HTML5 Canvas Particle & Shockwave Overlay */}
      <ParticleCanvas />

      {/* Header Fixo no Topo */}
      <Header
        cedulas={cedulas}
        diamantes={diamantes}
        highestTier={stats.highestTierUnlocked}
        soundEnabled={soundEnabled}
        powerSaverMode={powerSaverMode}
        activeFusionBoostPercent={activeFusionBoostPercent}
        isPremiumActive={isPremiumActive}
        premiumExpiresAt={premiumExpiresAt}
        pendingRewardsCount={totalPendingRewards}
        onToggleSound={handleToggleSound}
        onTogglePowerSaver={handleTogglePowerSaver}
        onOpenCodex={() => setIsCodexOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenExchange={() => setActiveScreen('shop')}
        onOpenFusionBoost={() => setActiveScreen('shop')}
        onOpenShop={() => setActiveScreen('shop')}
        onOpenRewards={() => setActiveScreen('rewards')}
      />

      {/* NOTIFICAÇÃO FLUTUANTE DE AUTO-BATALHA VIP EM SEGUNDO PLANO */}
      {isPremiumActive && isBattlePlaying && activeScreen !== 'battle' && (
        <div
          onClick={() => setActiveScreen('battle')}
          className="fixed top-16 right-4 z-40 bg-zinc-900/95 border-2 border-rose-500/80 p-3 rounded-2xl shadow-2xl shadow-rose-950/50 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all animate-bounce"
          title="Auto-Batalha VIP ativa em segundo plano! Clique para assistir"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base">
            <Swords className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex flex-col text-xs font-mono">
            <div className="flex items-center gap-1.5 font-bold text-rose-300">
              <span className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                VIP Batalha em 2º Plano
              </span>
              <span className="text-[10px] bg-rose-950 text-rose-200 border border-rose-600/50 px-1.5 py-0.5 rounded font-bold">
                Fase {battleStage}/100
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Monstro {battleMonsterIndex + 1}/10 ({MONSTER_NAMES[(battleStage * 3 + battleMonsterIndex) % MONSTER_NAMES.length]}) · +{getBattleStageReward(battleStage)} Cédulas/abate
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal Dividido por Menus com espaço generoso para rolagem total dos cards */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-48 sm:pb-56 md:pb-64">
        
        {/* TELA 1: FORJA & BANCADA (Menu Principal no Meio) */}
        {activeScreen === 'forge' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full animate-fadeIn pb-12 sm:pb-16">
            {/* Bancada de Montagem 4x4 com Área de Venda Integrada (Prioridade Máxima no Mobile) */}
            <div className="w-full lg:flex-1 order-1 lg:order-2">
              <Workbench
                slots={slots}
                selectedSlot={selectedSlot}
                className={screenShakeClass}
                diamantes={diamantes}
                cedulas={cedulas}
                freeSlotsCount={freeSlotsCount}
                canBuyTier1={cedulas >= 2 && freeSlotsCount > 0}
                onBuyTier1={handleBuyTier1}
                onAutoMergeSameRarity={handleAutoMergeSameRarity}
                autoMergeRemainingUses={autoMergeRemainingUses}
                onFillEmptyWithTier1={handleFillEmptyWithTier1}
                dailyFillBenchRemaining={dailyFillBenchRemaining}
                isPremiumActive={isPremiumActive}
                autoCollectExpiresAt={autoCollectExpiresAt}
                rarityEnchantCharges={rarityEnchantCharges}
                onEnchantWeapon={handleEnchantWeapon}
                onSelectSlot={(idx) => setSelectedSlot(idx === -1 ? null : idx)}
                onMoveOrMerge={handleMoveOrMerge}
                onQuickSell={handleQuickSell}
                onRushCraft={handleRushCraft}
                onCollectCraft={handleCollectCraft}
                onCollectAll={handleCollectAllReady}
                onSellSlot={handleSellSlot}
                fusionBlockedAlert={fusionBlockedAlert}
                onDismissFusionAlert={() => setFusionBlockedAlert(null)}
                fusionNotification={fusionNotification}
                onDismissFusionNotification={() => setFusionNotification(null)}
              />
            </div>

            {/* Painel Lateral com Informações Complementares, Preenchimento e Atalhos */}
            <div className="w-full lg:w-80 order-2 lg:order-1">
              <Sidebar
                cedulas={cedulas}
                diamantes={diamantes}
                freeSlotsCount={freeSlotsCount}
                selectedWeapon={selectedWeaponData}
                activeFusionBoostPercent={activeFusionBoostPercent}
                isPremiumActive={isPremiumActive}
                powerSaverMode={powerSaverMode}
                dailyFillBenchRemaining={dailyFillBenchRemaining}
                onBuyTier1={handleBuyTier1}
                onSellSelected={handleSellSelected}
                onSellSlot={handleSellSlot}
                onAutoSort={handleAutoSort}
                onFillEmptyWithTier1={handleFillEmptyWithTier1}
                onTogglePowerSaver={handleTogglePowerSaver}
                onOpenExchange={() => setActiveScreen('shop')}
                onOpenFusionBoost={() => setActiveScreen('shop')}
                onOpenShop={() => setActiveScreen('shop')}
              />
            </div>
          </div>
        )}

        {/* TELA 2: LOJA, CÂMBIO & PASSE PREMIUM */}
        {activeScreen === 'shop' && (
          <ShopView
            cedulas={cedulas}
            diamantes={diamantes}
            premiumExpiresAt={premiumExpiresAt}
            quickStrikeExpiresAt={quickStrikeExpiresAt}
            autoCollectExpiresAt={autoCollectExpiresAt}
            battleSimulationExpiresAt={battleSimulationExpiresAt}
            isPassPremiumUnlocked={seasonPass.isPremiumUnlocked}
            rarityEnchantCharges={rarityEnchantCharges}
            activeBoosts={fusionBoosts}
            onConvertCedulas={handleConvertCedulasToDiamonds}
            onBuyFusionBoost={handleBuyFusionBoost}
            onBuyPremium={handleBuyPremium}
            onBuyQuickStrike={handleBuyQuickStrike}
            onBuyAutoCollect={handleBuyAutoCollect}
            onBuyBattleSimulation={handleBuyBattleSimulation}
            onBuyRarityEnchant={handleBuyRarityEnchant}
            onBuySeasonPassPremium={handleBuySeasonPassPremium}
          />
        )}

        {/* TELA 3: BATALHA (Fases 1 a 100, 10 Monstros por Fase) */}
        {activeScreen === 'battle' && (
          <BattleView
            slots={slots}
            equippedWeapon={equippedWeapon}
            currentStage={battleStage}
            cedulas={cedulas}
            diamantes={diamantes}
            dailyBattleResetCount={dailyBattleResetDate === getTodayDateString() ? dailyBattleResetCount : 0}
            isPremiumActive={isPremiumActive}
            isQuickStrikeActive={isQuickStrikeActive}
            hasSimulationAccess={hasSimulationAccess}
            isPlaying={isBattlePlaying}
            monsterIndex={battleMonsterIndex}
            stageTimeLeft={battleTimeLeft}
            playerCurrentHp={battlePlayerHp}
            enemyCurrentHp={battleEnemyHp}
            isStageCompletedWaitingAdvance={isStageCompletedWaitingAdvance}
            isAutoAdvanceEnabled={isAutoAdvanceEnabled}
            screenShakeClass={screenShakeClass}
            simulationReport={simulationReport}
            onTogglePlay={() => setIsBattlePlaying(!isBattlePlaying)}
            onQuickStrike={handleQuickStrike}
            onSimulateFiveStages={handleSimulateFiveStages}
            onCloseSimulationReport={() => setSimulationReport(null)}
            onAdvanceToNextStageManual={handleAdvanceToNextStageManual}
            onToggleAutoAdvance={handleToggleAutoAdvance}
            onEquipWeapon={setEquippedWeapon}
            onResetStage={handleResetStage}
            onRevive={handleReviveBattle}
            onOpenShop={() => setActiveScreen('shop')}
          />
        )}

        {/* TELA 4: MISSÕES, LOGIN DIÁRIO & PASSE MENSAL (NOVO MENU!) */}
        {activeScreen === 'rewards' && (
          <RewardsView
            dailyLogin={dailyLogin}
            quests={quests}
            seasonPass={seasonPass}
            cedulas={cedulas}
            diamantes={diamantes}
            onClaimDailyLogin={handleClaimDailyLogin}
            onClaimQuest={handleClaimQuest}
            onClaimPassLevel={handleClaimPassLevel}
            onBuySeasonPassPremium={handleBuySeasonPassPremium}
          />
        )}

        {/* TELA 5: CATÁLOGO DE TIERS & ATRIBUTOS */}
        {activeScreen === 'catalog' && (
          <div className="w-full animate-fadeIn pb-12 sm:pb-16">
            <TierCatalog unlockedTiers={unlockedTiers} />
          </div>
        )}

        {/* TELA 6: MAESTRIA DE RARIDADE & FORJA 2X */}
        {activeScreen === 'mastery' && (
          <div className="w-full animate-fadeIn pb-12 sm:pb-16">
            <RarityMasteryCard
              totalCrafts={stats.totalPurchased || 0}
              totalMerged={stats.totalMerged || 0}
              doubleCraftTriggers={stats.doubleCraftTriggerCount || 0}
            />
          </div>
        )}

      </main>

      {/* Menu Fixo na Parte Inferior da Tela (Bottom Navigation com Ícones) */}
      <BottomNav
        activeScreen={activeScreen}
        onChangeScreen={(screen) => {
          if (screen !== activeScreen) {
            sound.playClick();
            setActiveScreen(screen);
          }
        }}
        isPremiumActive={isPremiumActive}
        pendingRewardsCount={totalPendingRewards}
      />

      {/* Modais Complementares */}
      <DiamondExchangeModal
        isOpen={isExchangeOpen}
        cedulas={cedulas}
        diamantes={diamantes}
        onConvert={handleConvertCedulasToDiamonds}
        onClose={() => setIsExchangeOpen(false)}
      />

      <FusionBoostModal
        isOpen={isFusionBoostOpen}
        diamantes={diamantes}
        activeBoosts={fusionBoosts}
        onBuyBoost={handleBuyFusionBoost}
        onOpenExchange={() => {
          setIsFusionBoostOpen(false);
          setIsExchangeOpen(true);
        }}
        onClose={() => setIsFusionBoostOpen(false)}
      />

      <CodexModal
        isOpen={isCodexOpen}
        unlockedTiers={unlockedTiers}
        onClose={() => setIsCodexOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        stats={stats}
        diamantes={diamantes}
        battleStage={battleStage}
        soundEnabled={soundEnabled}
        powerSaverMode={powerSaverMode}
        onToggleSound={handleToggleSound}
        onTogglePowerSaver={handleTogglePowerSaver}
        onResetGame={handleResetGame}
        onClose={() => setIsStatsOpen(false)}
      />

      {/* Banner Pop-up de Descoberta de Novo Tier */}
      {celebrationTier && (
        <div className="fixed bottom-20 right-6 z-40 animate-bounce">
          <div className="bg-zinc-900 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-3 text-zinc-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">Novo Tier Descoberto!</div>
              <div className="text-sm font-bold">{getWeaponData(celebrationTier).name}</div>
            </div>
            <button
              onClick={() => setCelebrationTier(null)}
              className="ml-2 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-800 px-2 py-1 rounded-md cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Banner Pop-up de Descoberta de Nova Raridade */}
      {celebrationRarity && (
        <div className="fixed bottom-36 right-6 z-40 animate-bounce">
          <div className="bg-zinc-900 border-2 border-cyan-400 p-4 rounded-2xl shadow-2xl shadow-cyan-500/20 flex items-center gap-3 text-zinc-100">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-400">Nova Raridade Descoberta!</div>
              <div className="text-sm font-bold capitalize" style={{ color: getRarityData(celebrationRarity).color }}>
                {getRarityData(celebrationRarity).label}
              </div>
            </div>
            <button
              onClick={() => setCelebrationRarity(null)}
              className="ml-2 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-800 px-2 py-1 rounded-md cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
