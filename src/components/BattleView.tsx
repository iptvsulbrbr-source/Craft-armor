import React, { useState, useEffect, useRef } from 'react';
import { WeaponItem } from '../types/game';
import { getWeaponData } from '../data/weapons';
import { getRarityData } from '../data/rarities';
import { calculateEnemyStats, getBattleStageReward, FiveStageSimulationReport } from '../data/battle';
import { WeaponIcon } from './WeaponIcon';
import { CombatLog, CombatLogItem } from './CombatLog';
import { SimulationReportModal } from './SimulationReportModal';
import { BattleResetModal } from './BattleResetModal';
import { sound } from '../utils/audio';
import {
  Swords,
  Shield,
  Heart,
  Clock,
  RotateCcw,
  Skull,
  Play,
  Pause,
  Sparkles,
  Zap,
  Target,
  Crown,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const MONSTER_NAMES = [
  'Lacaio da Masmorra',
  'Goblin Saqueador',
  'Esqueleto Legionário',
  'Aranha Venenosa',
  'Zumbi Corrompido',
  'Orc Berserker',
  'Golem de Pedra',
  'Espectro Noturno',
  'Gárgula Alada',
  'Quimera Voraz',
  'Elemental do Fogo',
  'Cavaleiro da Morte',
  'Demônio do Abismo',
  'Hidra de Sangue',
  'Wyvern Tempestuoso',
  'Titã da Terra',
  'Súcubo Sombria',
  'Beholder Ancestral',
  'Dragão Vermelho',
  'Soberano Cósmico',
];

interface BattleViewProps {
  slots: (WeaponItem | null)[];
  equippedWeapon: WeaponItem | null;
  currentStage: number;
  cedulas?: number;
  diamantes?: number;
  dailyBattleResetCount?: number;
  isPremiumActive: boolean;
  isQuickStrikeActive: boolean;
  hasSimulationAccess?: boolean;
  isPlaying: boolean;
  monsterIndex: number;
  stageTimeLeft: number;
  playerCurrentHp: number;
  enemyCurrentHp: number;
  isStageCompletedWaitingAdvance: boolean;
  isAutoAdvanceEnabled: boolean;
  screenShakeClass?: string;
  simulationReport?: FiveStageSimulationReport | null;
  onTogglePlay: () => void;
  onQuickStrike: () => void;
  onSimulateFiveStages?: () => void;
  onCloseSimulationReport?: () => void;
  onAdvanceToNextStageManual: () => void;
  onToggleAutoAdvance: () => void;
  onEquipWeapon: (weapon: WeaponItem | null) => void;
  onResetStage: () => void;
  onRevive: () => void;
  onOpenShop: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({
  slots,
  equippedWeapon,
  currentStage,
  cedulas = 0,
  diamantes = 0,
  dailyBattleResetCount = 0,
  isPremiumActive,
  isQuickStrikeActive,
  hasSimulationAccess = false,
  isPlaying,
  monsterIndex,
  stageTimeLeft,
  playerCurrentHp,
  enemyCurrentHp,
  isStageCompletedWaitingAdvance,
  isAutoAdvanceEnabled,
  screenShakeClass = '',
  simulationReport = null,
  onTogglePlay,
  onQuickStrike,
  onSimulateFiveStages,
  onCloseSimulationReport,
  onAdvanceToNextStageManual,
  onToggleAutoAdvance,
  onEquipWeapon,
  onResetStage,
  onRevive,
  onOpenShop,
}) => {
  const [isEquipModalOpen, setIsEquipModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Estados de Animações em Tempo Real no Campo de Batalha
  const [isHeroAttacking, setIsHeroAttacking] = useState<boolean>(false);
  const [isHeroHit, setIsHeroHit] = useState<boolean>(false);
  const [isEnemyHit, setIsEnemyHit] = useState<boolean>(false);
  const [isEnemyCrit, setIsEnemyCrit] = useState<boolean>(false);
  const [lastDamageDealt, setLastDamageDealt] = useState<number | null>(null);

  // Indicador Numérico Flutuante de Dano no Monstro
  const [floatingDamages, setFloatingDamages] = useState<
    Array<{
      id: number;
      damage: number;
      isCrit: boolean;
      offsetX: number;
      offsetY: number;
    }>
  >([]);

  // Log de Combate (Últimas 3 ações em tempo real)
  const [combatLogs, setCombatLogs] = useState<CombatLogItem[]>([]);

  const prevEnemyHpRef = useRef<number>(enemyCurrentHp);
  const prevPlayerHpRef = useRef<number>(playerCurrentHp);
  const prevMonsterRef = useRef<{ stage: number; index: number }>({ stage: currentStage, index: monsterIndex });

  // Atributos Base do Jogador (Sem arma)
  const PLAYER_BASE_ATK = 10;
  const PLAYER_BASE_DEF = 5;
  const PLAYER_BASE_HP = 100;

  // Cálculo com arma equipada
  let weaponAtk = 0;
  let weaponCrit = 5;
  let weaponRarityDef = getRarityData('comum');
  let weaponData = null;

  if (equippedWeapon) {
    weaponData = getWeaponData(equippedWeapon.tier);
    weaponRarityDef = getRarityData(equippedWeapon.rarity || 'comum');
    weaponAtk = Math.round(weaponData.damage * weaponRarityDef.damageMultiplier);
    weaponCrit = weaponRarityDef.critChance;
  }

  const bonusHp = Math.round(weaponAtk * 0.2);
  const bonusDef = Math.round(weaponAtk * 0.1);

  const playerMaxHp = PLAYER_BASE_HP + bonusHp;
  const playerAtk = PLAYER_BASE_ATK + weaponAtk;
  const playerDef = PLAYER_BASE_DEF + bonusDef;

  // Inimigo (progressão oficial de atributos e recompensas)
  const { enemyAtk, enemyDef, enemyMaxHp, baseStageAtk, attackStep } = calculateEnemyStats(currentStage, monsterIndex);
  const stageReward = getBattleStageReward(currentStage);
  const totalStageReward = stageReward * 10;

  const monsterNameIndex = (currentStage * 3 + monsterIndex) % MONSTER_NAMES.length;
  const monsterName = MONSTER_NAMES[monsterNameIndex];
  const isBossMonster = monsterIndex === 9;

  const hasQuickStrikeAccess = isPremiumActive || isQuickStrikeActive;

  // Monitorar Dano ao Inimigo para disparar Animações do Herói, Floating Text e Log de Combate
  useEffect(() => {
    if (prevEnemyHpRef.current > enemyCurrentHp && enemyCurrentHp >= 0) {
      const diff = prevEnemyHpRef.current - enemyCurrentHp;
      setLastDamageDealt(diff);

      const baseExpected = Math.max(2, playerAtk - enemyDef * 0.4);
      const isCritHit = diff > baseExpected * 1.35;

      setIsHeroAttacking(true);
      setIsEnemyHit(true);
      if (isCritHit) {
        setIsEnemyCrit(true);
      }

      // Adicionar indicador numérico flutuante
      const newDmgId = Date.now() + Math.random();
      const offsetX = (Math.random() - 0.5) * 32;
      const offsetY = (Math.random() - 0.5) * 20;
      setFloatingDamages((prev) => [
        ...prev.slice(-4),
        { id: newDmgId, damage: diff, isCrit: isCritHit, offsetX, offsetY },
      ]);
      setTimeout(() => {
        setFloatingDamages((prev) => prev.filter((d) => d.id !== newDmgId));
      }, 1100);

      // Adicionar entrada ao Log de Combate
      const logId = `hero-${Date.now()}-${Math.random()}`;
      const logText = isCritHit
        ? `Golpe crítico de ${diff} de dano no ${monsterName}!`
        : `Herói atacou ${monsterName}, ${diff} de dano!`;
      setCombatLogs((prev) => [
        ...prev.slice(-9),
        {
          id: logId,
          text: logText,
          type: isCritHit ? 'hero_crit' : 'hero_attack',
          timestamp: Date.now(),
        },
      ]);

      const t1 = setTimeout(() => setIsHeroAttacking(false), 280);
      const t2 = setTimeout(() => {
        setIsEnemyHit(false);
        setIsEnemyCrit(false);
      }, isCritHit ? 450 : 220);

      prevEnemyHpRef.current = enemyCurrentHp;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevEnemyHpRef.current = enemyCurrentHp;
  }, [enemyCurrentHp, playerAtk, enemyDef, monsterName]);

  // Monitorar Dano ao Jogador e adicionar ao Log de Combate
  useEffect(() => {
    if (prevPlayerHpRef.current > playerCurrentHp && playerCurrentHp >= 0) {
      const dmgTaken = prevPlayerHpRef.current - playerCurrentHp;
      setIsHeroHit(true);

      const logId = `enemy-${Date.now()}-${Math.random()}`;
      setCombatLogs((prev) => [
        ...prev.slice(-9),
        {
          id: logId,
          text: `${monsterName} atacou, ${dmgTaken} de dano sofrido!`,
          type: 'enemy_attack',
          timestamp: Date.now(),
        },
      ]);

      const t = setTimeout(() => setIsHeroHit(false), 240);
      prevPlayerHpRef.current = playerCurrentHp;
      return () => clearTimeout(t);
    }
    prevPlayerHpRef.current = playerCurrentHp;
  }, [playerCurrentHp, monsterName]);

  // Monitorar Mudança de Monstro ou Avanço de Fase para o Log de Combate
  useEffect(() => {
    if (
      prevMonsterRef.current.stage !== currentStage ||
      prevMonsterRef.current.index !== monsterIndex
    ) {
      const logId = `stage-${Date.now()}-${Math.random()}`;
      setCombatLogs((prev) => [
        ...prev.slice(-9),
        {
          id: logId,
          text: isBossMonster
            ? `👑 CHEFE DA FASE ${currentStage}: ${monsterName} apareceu!`
            : `⚔️ Monstro ${monsterIndex + 1}/10: ${monsterName} entrou no duelo!`,
          type: 'stage_advance',
          timestamp: Date.now(),
        },
      ]);
      prevMonsterRef.current = { stage: currentStage, index: monsterIndex };
    }
  }, [currentStage, monsterIndex, monsterName, isBossMonster]);

  // Armas prontas na bancada
  const readyWeapons = slots
    .map((item, idx) => ({ item, slotIndex: idx }))
    .filter((s): s is { item: WeaponItem; slotIndex: number } => s.item !== null && !s.item.crafting);

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col gap-5 animate-fadeIn pb-28 sm:pb-36 ${screenShakeClass}`}>
      
      {/* ========================================================================= */}
      {/* 1. HEADER DA ARENA (Fase, Cronômetro, Reiniciar)                          */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-display text-zinc-100 uppercase tracking-wide">
                Arena de Batalha · Fase {currentStage} / 100
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isBossMonster
                  ? 'bg-amber-950 border-amber-500/50 text-amber-300 animate-pulse'
                  : 'bg-rose-950 border-rose-500/40 text-rose-300'
              }`}>
                {isBossMonster ? '👑 CHEFE DA FASE' : `Monstro ${monsterIndex + 1} / 10`}
              </span>
              {isPremiumActive ? (
                <button
                  onClick={onToggleAutoAdvance}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isAutoAdvanceEnabled
                      ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 ring-1 ring-amber-400/40 shadow-sm shadow-amber-500/20'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Alternar Avanço Automático de Fases"
                >
                  <Crown className={`w-3.5 h-3.5 ${isAutoAdvanceEnabled ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span>Auto-Avanço: {isAutoAdvanceEnabled ? 'LIGADO ⚡' : 'DESLIGADO'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenShop}
                  className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer hidden sm:flex items-center gap-1"
                  title="Desbloqueie o Passe VIP Premium para ativar o Avanço Automático!"
                >
                  <Crown className="w-3 h-3 text-zinc-500" />
                  <span>Auto-Avanço 🔒 VIP</span>
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Derrote os 10 inimigos antes do tempo esgotar. Cada eliminação rende <strong className="text-emerald-400">+{stageReward} Cédulas</strong>!
            </p>
          </div>
        </div>

        {/* Controles de Fase e Cronômetro */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Botão de Modo Simulado (5 Fases Instantâneas) */}
          {hasSimulationAccess ? (
            <button
              onClick={onSimulateFiveStages}
              className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl border bg-gradient-to-r from-purple-950/90 via-amber-950/70 to-purple-950/90 border-amber-500/60 hover:border-amber-400 text-amber-300 shadow-md shadow-purple-950/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              title="Simula 5 fases consecutivas de combate instantaneamente sem animações individuais!"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span>⚡ Simular 5 Fases</span>
            </button>
          ) : (
            <button
              onClick={onOpenShop}
              className="text-[10px] sm:text-xs font-mono font-semibold px-2.5 py-1.5 rounded-xl border bg-zinc-950/90 border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Modo Simulado: Simule 5 fases instantaneamente! Disponível na Loja (1 💎 / 3 dias) ou com VIP Premium!"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-500" />
              <span>Simular 5 Fases 🔒 (Loja)</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            <Clock className={`w-4 h-4 ${stageTimeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-bold ${stageTimeLeft <= 10 ? 'text-rose-400' : 'text-zinc-200'}`}>
              {stageTimeLeft}s
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsResetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-amber-300 rounded-xl transition-all cursor-pointer shadow-sm group"
            title="Reiniciar jornada para Fase 1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 group-hover:-rotate-45 transition-transform" />
            <span className="hidden sm:inline font-mono">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LOG DE COMBATE (Últimas 3 Ações em Tempo Real com Fade-Out Automático)  */}
      {/* ========================================================================= */}
      <CombatLog logs={combatLogs} />

      {/* ========================================================================= */}
      {/* 3. CAMPO VISUAL DE BATALHA 2D (HERÓI COM ARMA EQUIPADA VS GOBLIN / INIMIGO) */}
      {/* Tochas acesas, efeitos de corte, reações a dano normal e dano crítico!     */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-3xl border-2 border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black overflow-hidden shadow-2xl p-4 sm:p-6 min-h-[260px] sm:min-h-[300px] flex flex-col justify-between select-none">
        
        {/* Efeito de Reflexo Atmosférico da Raridade da Arma */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${weaponRarityDef.color} 0%, transparent 70%)`,
          }}
        />

        {/* Chão de Pedra da Masmorra em Perspectiva */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-transparent border-t border-zinc-800/60 pointer-events-none" />

        {/* Tocha Esquerda na Parede com Chama Animada */}
        <div className="absolute top-6 left-4 sm:left-8 flex flex-col items-center pointer-events-none z-10">
          <div className="w-5 h-7 relative flex items-center justify-center">
            <Flame className="w-5 h-6 text-amber-500 animate-torch filter drop-shadow-[0_0_8px_#f97316]" />
          </div>
          <div className="w-3 h-5 bg-zinc-800 border border-zinc-700 rounded-sm mt-0.5" />
        </div>

        {/* Tocha Direita na Parede com Chama Animada */}
        <div className="absolute top-6 right-4 sm:right-8 flex flex-col items-center pointer-events-none z-10">
          <div className="w-5 h-7 relative flex items-center justify-center">
            <Flame className="w-5 h-6 text-orange-500 animate-torch filter drop-shadow-[0_0_8px_#ea580c]" />
          </div>
          <div className="w-3 h-5 bg-zinc-800 border border-zinc-700 rounded-sm mt-0.5" />
        </div>

        {/* Placa Central do Duelo */}
        <div className="relative z-20 flex flex-col items-center text-center">
          <div className="px-3 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 shadow-md flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-zinc-200">
              {isPlaying ? '⚔️ DUELO EM ANDAMENTO' : '⏸️ COMBATE EM PAUSA'}
            </span>
            {isEnemyCrit && (
              <span className="text-amber-300 font-extrabold bg-amber-950 border border-amber-500/50 px-1.5 py-0.2 rounded text-[10px] animate-bounce">
                💥 GOLPE CRÍTICO!
              </span>
            )}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono mt-1">
            Fase {currentStage} · {monsterName}
          </span>
        </div>

        {/* ÁREA DOS PERSONAGENS (HERÓI À ESQUERDA VS GOBLIN À DIREITA) */}
        <div className="relative z-20 flex items-end justify-between px-2 sm:px-12 pb-2 mt-4 sm:mt-6">
          
          {/* ===================================================================== */}
          {/* LADO ESQUERDO: O PERSONAGEM (HERÓI DA FORJA COM A ARMA EQUIPADA)     */}
          {/* ===================================================================== */}
          <div className="flex flex-col items-center relative">
            
            {/* Tag do Herói */}
            <div className="mb-2 px-2 py-0.5 rounded-md bg-zinc-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1 shadow-sm">
              <span>🛡️ HERÓI</span>
              {equippedWeapon && (
                <span className="text-amber-400 font-normal">
                  (T{equippedWeapon.tier})
                </span>
              )}
            </div>

            {/* Avatar do Herói com Animações de Golpe e Dano */}
            <div
              className={`relative transition-transform duration-200 ${
                isHeroAttacking
                  ? 'animate-hero-slash'
                  : isHeroHit
                  ? 'brightness-150 contrast-125 -translate-x-2'
                  : 'animate-float'
              }`}
            >
              {/* Sombra no Chão */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 bg-black/60 rounded-full blur-[2px] pointer-events-none" />

              {/* Corpo e Armadura do Herói em SVG */}
              <svg
                width="85"
                height="105"
                viewBox="0 0 100 120"
                className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
              >
                {/* Capa Heróica Vermelha com Ondulação */}
                <path
                  d="M 38 48 C 22 55, 12 75, 18 108 C 28 104, 38 98, 42 78 Z"
                  fill="#991b1b"
                  stroke="#7f1d1d"
                  strokeWidth="2"
                />

                {/* Pernas / Botas de Aço */}
                <rect x="35" y="86" width="12" height="24" rx="4" fill="#3f3f46" stroke="#27272a" strokeWidth="2" />
                <rect x="52" y="86" width="12" height="24" rx="4" fill="#52525b" stroke="#27272a" strokeWidth="2" />
                <rect x="33" y="104" width="16" height="8" rx="2" fill="#27272a" />
                <rect x="52" y="104" width="16" height="8" rx="2" fill="#27272a" />

                {/* Tronco / Armadura Peitoral de Placas de Aço */}
                <path
                  d="M 34 46 L 66 46 L 62 88 L 38 88 Z"
                  fill="#52525b"
                  stroke="#71717a"
                  strokeWidth="2.5"
                />
                {/* Placa Dourada / Detalhe Central na Armadura */}
                <path
                  d="M 45 52 L 55 52 L 52 75 L 48 75 Z"
                  fill="#eab308"
                  opacity="0.8"
                />
                {/* Cinto com Fivela de Ferro */}
                <rect x="37" y="78" width="26" height="6" fill="#18181b" />
                <rect x="47" y="77" width="6" height="8" fill="#d4d4d8" />

                {/* Ombreira Esquerda e Direita Reforçadas */}
                <path d="M 28 44 C 28 36, 42 38, 42 48 Z" fill="#71717a" stroke="#3f3f46" strokeWidth="1.5" />
                <path d="M 58 44 C 58 36, 72 38, 72 48 Z" fill="#71717a" stroke="#3f3f46" strokeWidth="1.5" />

                {/* Cabeça / Elmo de Cavaleiro */}
                <circle cx="50" cy="30" r="16" fill="#71717a" stroke="#3f3f46" strokeWidth="2" />
                {/* Pluma do Elmo */}
                <path d="M 46 14 C 42 4, 58 2, 54 14 Z" fill="#ef4444" />
                {/* Viseira / Fresta do Elmo */}
                <rect x="42" y="28" width="18" height="5" rx="2" fill="#18181b" />
                {/* Olhos Brilhantes com a Cor da Raridade da Arma */}
                <circle
                  cx="48"
                  cy="30.5"
                  r="1.8"
                  fill={weaponRarityDef.color}
                  className="animate-pulse"
                />
                <circle
                  cx="54"
                  cy="30.5"
                  r="1.8"
                  fill={weaponRarityDef.color}
                  className="animate-pulse"
                />

                {/* Braço Dianteiro Empunhando a Arma */}
                <path d="M 62 48 L 78 60 L 74 68 L 58 56 Z" fill="#52525b" />
                <circle cx="78" cy="62" r="5" fill="#3f3f46" />
              </svg>

              {/* Arma Equipada na Mão do Herói (Renderizada Dinamicamente com Efeito Glow) */}
              <div
                className="absolute -top-2 -right-6 sm:-right-8 pointer-events-none transition-transform duration-150"
                style={{
                  filter: `drop-shadow(0 0 10px ${weaponRarityDef.color})`,
                  transform: isHeroAttacking ? 'rotate(-25deg) scale(1.15)' : 'rotate(15deg)',
                }}
              >
                {equippedWeapon ? (
                  <WeaponIcon tier={equippedWeapon.tier} size={48} className="w-12 h-12" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                    👊
                  </div>
                )}
              </div>

              {/* Efeito de Arco de Lâmina (Slash Blade Arc) ao Atacar */}
              {isHeroAttacking && (
                <div
                  className="absolute -top-4 -right-10 w-24 h-24 pointer-events-none animate-ping opacity-75"
                  style={{
                    background: `radial-gradient(ellipse at center, ${weaponRarityDef.color} 0%, transparent 70%)`,
                  }}
                />
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CENTRO DA ARENA: ZONA DE DUELO (COLISÃO DE GOLPES & IMPACTO)          */}
          {/* ===================================================================== */}
          <div className="flex flex-col items-center justify-center relative mb-6">
            <div className="relative">
              <Swords className={`w-8 h-8 sm:w-10 sm:h-10 text-rose-500/80 transition-transform ${
                isHeroAttacking ? 'scale-125 rotate-12 text-rose-400 animate-pulse' : 'text-zinc-600'
              }`} />
              
              {/* Efeito de Faíscas Centrais ao Golpear */}
              {isHeroAttacking && (
                <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 left-1/2 -translate-x-1/2 animate-spin" />
              )}
            </div>

            {/* Dano Saltando no Meio */}
            {lastDamageDealt !== null && isEnemyHit && (
              <div className={`mt-2 font-mono font-black text-sm sm:text-base animate-bounce whitespace-nowrap ${
                isEnemyCrit
                  ? 'scale-125 crit-damage-purple-glow'
                  : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]'
              }`}>
                {isEnemyCrit ? `⚡ -${lastDamageDealt} CRÍTICO!` : `-${lastDamageDealt}`}
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* LADO DIREITO: O INIMIGO (GOBLIN SAQUEADOR / MONSTRO DA MASMORRA)      */}
          {/* ===================================================================== */}
          <div id="battle-goblin-avatar" className="flex flex-col items-center relative">
            
            {/* Indicador Numérico Flutuante (Floating Text) de Dano no Monstro com Zoom-in Agressivo e Brilho Púrpura */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-40">
              {floatingDamages.map((dmg) => (
                <div
                  key={dmg.id}
                  style={{
                    transform: `translate(${dmg.offsetX}px, ${dmg.offsetY}px)`,
                  }}
                  className={`absolute font-mono font-black select-none pointer-events-none ${
                    dmg.isCrit
                      ? 'animate-damage-crit flex flex-col items-center z-50'
                      : 'animate-damage-normal text-rose-500 drop-shadow-[0_2px_12px_rgba(244,63,94,0.9)] text-xl sm:text-2xl'
                  }`}
                >
                  {dmg.isCrit ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-black tracking-tight crit-damage-purple-glow">
                        -{dmg.damage}
                      </span>
                      <span className="text-[10.5px] sm:text-xs font-black uppercase tracking-wider text-fuchsia-200 px-2.5 py-0.5 rounded-full border shadow-xl whitespace-nowrap crit-badge-purple-glow flex items-center gap-1">
                        <span>⚡</span>
                        <span>GOLPE CRÍTICO!</span>
                      </span>
                    </>
                  ) : (
                    <span>-{dmg.damage}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Tag do Monstro */}
            <div className={`mb-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm ${
              isBossMonster
                ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
                : 'bg-zinc-950/80 border border-rose-500/40 text-rose-300'
            }`}>
              <Skull className="w-3 h-3 text-rose-400" />
              <span>{isBossMonster ? 'CHEFE' : 'GOBLIN'}</span>
              <span className="text-zinc-400 font-normal">
                Nv.{currentStage}
              </span>
            </div>

            {/* Avatar do Goblin em SVG com Reações de Dano */}
            <div
              className={`relative transition-transform duration-150 ${
                isEnemyCrit
                  ? 'animate-enemy-crit'
                  : isEnemyHit
                  ? 'animate-enemy-hit'
                  : 'animate-pulse'
              }`}
            >
              {/* Sombra no Chão do Goblin */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 bg-black/60 rounded-full blur-[2px] pointer-events-none" />

              {/* Corpo do Goblin em SVG */}
              <svg
                width="85"
                height="105"
                viewBox="0 0 100 120"
                className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
              >
                {/* Pernas do Goblin com Faixas */}
                <rect x="36" y="84" width="10" height="22" rx="3" fill="#15803d" stroke="#14532d" strokeWidth="2" />
                <rect x="52" y="84" width="10" height="22" rx="3" fill="#166534" stroke="#14532d" strokeWidth="2" />
                <rect x="32" y="102" width="14" height="6" rx="2" fill="#713f12" />
                <rect x="52" y="102" width="14" height="6" rx="2" fill="#713f12" />

                {/* Tronco / Armadura de Couro Remendado */}
                <path
                  d="M 36 50 L 64 50 L 60 86 L 38 86 Z"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="2"
                />
                {/* Tiras Cruzadas de Couro */}
                <line x1="38" y1="52" x2="62" y2="82" stroke="#451a03" strokeWidth="2.5" />
                <line x1="62" y1="52" x2="38" y2="82" stroke="#451a03" strokeWidth="2.5" />

                {/* Braço Traseiro com Porrete / Adaga Serrilhada */}
                <path d="M 64 54 L 80 62 L 76 70 L 62 60 Z" fill="#15803d" />
                <circle cx="80" cy="64" r="4.5" fill="#14532d" />
                {/* Lâmina da Adaga Serrilhada */}
                <path
                  d="M 80 64 L 92 48 L 86 46 L 82 56 Z"
                  fill="#94a3b8"
                  stroke="#475569"
                  strokeWidth="1.5"
                />

                {/* Braço Dianteiro em Postura Ofensiva */}
                <path d="M 38 56 L 24 66 L 28 72 L 40 62 Z" fill="#15803d" />
                <circle cx="24" cy="68" r="4" fill="#14532d" />

                {/* Cabeça do Goblin */}
                <circle cx="50" cy="34" r="16" fill="#15803d" stroke="#14532d" strokeWidth="2" />

                {/* Orelhas Pontudas Grandes do Goblin */}
                {/* Orelha Esquerda com Brinco de Ouro */}
                <path d="M 36 34 C 18 28, 12 36, 16 44 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
                <circle cx="16" cy="42" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                {/* Orelha Direita */}
                <path d="M 64 34 C 82 28, 88 36, 84 44 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />

                {/* Olhos Malévolos Amarelos / Vermelhos */}
                <circle cx="44" cy="32" r="3.2" fill="#facc15" />
                <circle cx="44" cy="32" r="1.4" fill="#dc2626" />
                <circle cx="54" cy="32" r="3.2" fill="#facc15" />
                <circle cx="54" cy="32" r="1.4" fill="#dc2626" />

                {/* Nariz Adunco de Goblin */}
                <path d="M 48 34 L 46 41 L 51 40 Z" fill="#166534" />

                {/* Boca com Presas Afiadas */}
                <path d="M 42 44 Q 50 48 58 44" stroke="#000" strokeWidth="2" fill="none" />
                <polygon points="45,44 47,41 49,44" fill="#ffffff" />
                <polygon points="51,44 53,41 55,44" fill="#ffffff" />

                {/* Se for Chefe: Coroa de Chifres Rústica */}
                {isBossMonster && (
                  <path
                    d="M 38 20 L 44 26 L 50 18 L 56 26 L 62 20 L 58 28 L 42 28 Z"
                    fill="#eab308"
                    stroke="#ca8a04"
                    strokeWidth="1.5"
                  />
                )}
              </svg>

              {/* Efeito de Sangue / Impacto Visual na Pele do Inimigo */}
              {isEnemyHit && (
                <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. GRID DE ATRIBUTOS: JOGADOR VS INIMIGO                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD DO JOGADOR */}
        <div className="p-5 rounded-2xl border bg-zinc-900 border-zinc-800 flex flex-col justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>Herói da Forja</span>
                    {equippedWeapon && (
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        (T{equippedWeapon.tier})
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {equippedWeapon ? `${weaponData?.name} (${weaponRarityDef.label})` : 'Desarmado (Atributos Base)'}
                  </span>
                </div>
              </div>

              {/* Botão de Trocar/Equipar Arma */}
              <button
                onClick={() => setIsEquipModalOpen(true)}
                disabled={isPlaying}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isPlaying
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300'
                }`}
                title={isPlaying ? 'Pause a batalha para trocar de arma' : 'Equipar outra arma da bancada'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{equippedWeapon ? 'Trocar Arma' : 'Equipar Arma'}</span>
              </button>
            </div>

            {/* Barra de Vida do Jogador */}
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Vida do Herói</span>
                </span>
                <span className="text-zinc-300 font-bold">
                  {Math.max(0, playerCurrentHp)} / {playerMaxHp} HP
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (playerCurrentHp / playerMaxHp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Estatísticas Detalhadas do Jogador */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-center font-mono">
              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                  <Swords className="w-3 h-3 text-rose-400" /> Atk
                </div>
                <div className="text-sm font-bold text-rose-300 mt-0.5">
                  {playerAtk}
                </div>
                <div className="text-[9px] text-zinc-400">
                  10 {weaponAtk > 0 ? `+${weaponAtk}` : ''}
                </div>
              </div>

              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-sky-400" /> Defesa
                </div>
                <div className="text-sm font-bold text-sky-300 mt-0.5">
                  {playerDef}
                </div>
                <div className="text-[9px] text-zinc-400">
                  5 {bonusDef > 0 ? `+${bonusDef}` : ''}
                </div>
              </div>

              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" /> Crítico
                </div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {weaponCrit}%
                </div>
                <div className="text-[9px] text-zinc-400">
                  1.8x Dano
                </div>
              </div>
            </div>
          </div>

          {/* Arma Equipada em Destaque */}
          {equippedWeapon && weaponData ? (
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${weaponRarityDef.badgeBorder} ${weaponRarityDef.badgeBg}`}>
                  <WeaponIcon tier={equippedWeapon.tier} size={36} className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">
                    {weaponData.name} <span className="text-amber-400 font-mono">(T{equippedWeapon.tier})</span>
                  </div>
                  <div className="text-[10px] font-mono" style={{ color: weaponRarityDef.color }}>
                    {weaponRarityDef.label} · +{weaponAtk} Atk (+{bonusHp} HP, +{bonusDef} Def)
                  </div>
                </div>
              </div>

              <button
                onClick={() => onEquipWeapon(null)}
                disabled={isPlaying}
                className="text-[11px] text-zinc-500 hover:text-rose-400 underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Desequipar
              </button>
            </div>
          ) : (
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              Nenhuma arma equipada. Equipe uma arma da bancada para ganhar ataque, HP e defesa!
            </div>
          )}
        </div>

        {/* CARD DO INIMIGO */}
        <div id="enemy-battle-card" className="p-5 rounded-2xl border bg-zinc-900 border-zinc-800 flex flex-col justify-between gap-4 relative shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
                  <Skull className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>{monsterName}</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      (Nível {currentStage})
                    </span>
                  </h3>
                  <span className="text-[10px] text-rose-400 font-mono">
                    Inimigo {monsterIndex + 1} de 10 da Fase
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-emerald-400">
                Recompensa: +{stageReward} Cédulas
              </span>
            </div>

            {/* Barra de Vida do Inimigo */}
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>Vida do Monstro</span>
                </span>
                <span className="text-zinc-300 font-bold">
                  {Math.max(0, enemyCurrentHp)} / {enemyMaxHp} HP
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (enemyCurrentHp / enemyMaxHp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Atributos do Inimigo */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-center font-mono">
              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500">Ataque</div>
                <div className="text-sm font-bold text-rose-300 mt-0.5">
                  {enemyAtk}
                </div>
                <div className="text-[9px] text-zinc-500" title={`Ataque inicial da Fase: ${baseStageAtk} (+${attackStep} a cada monstro)`}>
                  Base: {baseStageAtk}
                </div>
              </div>

              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500">Defesa</div>
                <div className="text-sm font-bold text-sky-300 mt-0.5">
                  {enemyDef}
                </div>
                <div className="text-[9px] text-zinc-500" title="Defesa correspondente a 20% do Ataque do inimigo">
                  20% do Atk
                </div>
              </div>

              <div className="p-2 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500">HP Máx</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {enemyMaxHp}
                </div>
                <div className="text-[9px] text-zinc-500" title="HP correspondente a 40% do Ataque do inimigo">
                  40% do Atk
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400 font-mono">
            <span>{isPlaying ? '⚔️ Combate em andamento...' : 'Aperte "Iniciar Batalha" para combater!'}</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. TELA / MODAL DE FASE CONCLUÍDA (Sem Premium ou Auto-Avanço Desativado)  */}
      {/* ========================================================================= */}
      {isStageCompletedWaitingAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-amber-400/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-amber-500/20 flex flex-col p-6 text-center animate-scaleUp relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
              🏆
            </div>

            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-300 text-xs font-mono font-bold mx-auto mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>10 / 10 INIMIGOS DERROTADOS!</span>
            </div>

            <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
              Fase {currentStage} Concluída!
            </h3>

            <p className="text-zinc-300 text-sm mt-2">
              Parabéns guerreiro! Você aniquilou todas as hordas da Masmorra e faturou <strong className="text-emerald-400">+{totalStageReward} Cédulas</strong>.
            </p>

            <div className="my-5 p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center justify-between text-left">
              <div>
                <div className="text-[11px] text-zinc-400 uppercase font-mono">Próximo Desafio</div>
                <div className="text-sm font-bold text-amber-300">Fase {currentStage + 1} de 100</div>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Deseja avançar agora?
              </div>
            </div>

            {/* BOTÃO PRINCIPAL DE AVANÇO */}
            <button
              onClick={onAdvanceToNextStageManual}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span>Avançar para a Fase {currentStage + 1}</span>
              <ChevronRight className="w-5 h-5 font-bold" />
            </button>

            {/* ÁREA VIP: ATIVAÇÃO DE AUTO-AVANÇO OU CONVITE VIP */}
            {isPremiumActive ? (
              <div className="mt-4 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => {
                    onToggleAutoAdvance();
                    onAdvanceToNextStageManual();
                  }}
                  className="w-full py-2.5 px-4 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Ativar Avanço Automático VIP & Avançar ⚡</span>
                </button>
                <div className="text-[10px] text-zinc-500 mt-1.5 font-mono">
                  Com o auto-avanço ativado, a masmorra passará de fase sem pausar!
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => {
                    onOpenShop();
                  }}
                  className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-800 border border-amber-500/30 text-zinc-300 hover:text-amber-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors group"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Liberar Avanço Automático de Fases (VIP na Loja)</span>
                </button>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Evite ter que clicar manualmente a cada fase com o VIP!
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTROLES DE AÇÃO DE COMBATE (Iniciar/Pausar & Golpe Rápido)           */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {playerCurrentHp <= 0 || stageTimeLeft <= 0 ? (
            <button
              onClick={onRevive}
              className="py-3 px-6 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reviver & Tentar Novamente</span>
            </button>
          ) : (
            <button
              onClick={onTogglePlay}
              className={`py-3 px-6 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar Batalha</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>Iniciar Batalha</span>
                </>
              )}
            </button>
          )}

          {/* Botão de Golpe Rápido Manual */}
          {hasQuickStrikeAccess ? (
            <button
              onClick={onQuickStrike}
              disabled={!isPlaying || playerCurrentHp <= 0 || stageTimeLeft <= 0}
              className="py-3 px-5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              title="Desfere um golpe manual instantâneo adicional no monstro!"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              <span>Golpe Rápido ⚡</span>
            </button>
          ) : (
            <button
              onClick={onOpenShop}
              className="py-2.5 px-4 bg-zinc-950/90 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer group shadow-sm shadow-black/50"
              title="Ir para a Loja: Desbloqueie o Golpe Rápido (1h por 2 💎 ou 3h por 5 💎) ou adquira o VIP Premium!"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-115 transition-transform" />
              <span>Desbloquear Golpe Rápido (Loja)</span>
            </button>
          )}

          {/* Botão de Modo Simulado (Simular 5 Fases Instantâneas) */}
          {hasSimulationAccess ? (
            <button
              onClick={onSimulateFiveStages}
              className="py-3 px-4.5 bg-gradient-to-r from-purple-600 via-amber-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              title="Simula 5 fases consecutivas de combate instantaneamente sem animações!"
            >
              <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              <span>⚡ Simular 5 Fases</span>
            </button>
          ) : (
            <button
              onClick={onOpenShop}
              className="py-2.5 px-3.5 bg-zinc-950 hover:bg-zinc-800 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer group"
              title="Ative o Modo Simulado na Loja (1 💎 por 3 dias) ou use o VIP Premium para simular 5 fases de uma vez!"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400 group-hover:scale-115 transition-transform" />
              <span>Modo Simulado 🔒 (1 💎 / 3d)</span>
            </button>
          )}

          {/* Botão de Auto-Avanço nos Controles */}
          {isPremiumActive ? (
            <button
              onClick={onToggleAutoAdvance}
              className={`py-2 px-3 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAutoAdvanceEnabled
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Alternar auto-avanço de fases"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Avanço: {isAutoAdvanceEnabled ? 'ON' : 'OFF'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenShop}
              className="py-2 px-3 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-amber-300 transition-colors cursor-pointer"
              title="Avanço Automático de Fases disponível para VIP Premium"
            >
              <Crown className="w-3.5 h-3.5 text-zinc-600" />
              <span>Auto-Avanço: 🔒 VIP</span>
            </button>
          )}
        </div>

        {/* Dica da Batalha */}
        <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 flex-wrap">
          <span>Tempo de ataque: 1 golpe a cada 1.2s</span>
          {hasQuickStrikeAccess && (
            <span className="text-amber-400 font-bold">· Golpe Rápido ativo!</span>
          )}
          {hasSimulationAccess && (
            <span className="text-purple-400 font-bold">· Modo Simulado liberado!</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL DE RELATÓRIO DE SIMULAÇÃO (5 FASES INSTANTÂNEAS)                 */}
      {/* ========================================================================= */}
      {simulationReport && (
        <SimulationReportModal
          report={simulationReport}
          onClose={() => {
            if (onCloseSimulationReport) {
              onCloseSimulationReport();
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL PARA TROCAR OU EQUIPAR ARMAS DA BANCADA                          */}
      {/* ========================================================================= */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>Equipar Arma da Bancada</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Armas de maior raridade conferem multiplicadores massivos de ataque, HP e crítico!
                </p>
              </div>
              <button
                onClick={() => setIsEquipModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col gap-2.5 flex-1">
              {readyWeapons.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Nenhuma arma pronta na bancada. Volte para a Forja e monte novas armas!
                </div>
              ) : (
                readyWeapons.map(({ item }) => {
                  const data = getWeaponData(item.tier);
                  const rDef = getRarityData(item.rarity || 'comum');
                  const atk = Math.round(data.damage * rDef.damageMultiplier);
                  const hp = Math.round(atk * 0.2);
                  const def = Math.round(atk * 0.1);
                  const isCurrent = equippedWeapon?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onEquipWeapon(item);
                        setIsEquipModalOpen(false);
                        sound.playClick();
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-400'
                          : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${rDef.badgeBorder} ${rDef.badgeBg}`}>
                          <WeaponIcon tier={item.tier} size={36} className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                            <span>{data.name}</span>
                            <span className="font-mono text-amber-400">(T{item.tier})</span>
                            <span className="text-[9px] uppercase font-bold" style={{ color: rDef.color }}>
                              {rDef.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            ⚔️ +{atk} Atk · 💚 +{hp} HP · 🛡️ +{def} Def
                          </div>
                        </div>
                      </div>

                      <button className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors cursor-pointer">
                        {isCurrent ? 'Equipado' : 'Equipar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
              <button
                onClick={() => setIsEquipModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE REINICIAR JORNADA (Regras de Custo Diário e Benefícios VIP)   */}
      {/* ========================================================================= */}
      <BattleResetModal
        isOpen={isResetModalOpen}
        currentStage={currentStage}
        monsterIndex={monsterIndex}
        cedulas={cedulas}
        diamantes={diamantes}
        isPremiumActive={isPremiumActive}
        dailyResetCount={dailyBattleResetCount}
        onConfirm={onResetStage}
        onClose={() => setIsResetModalOpen(false)}
        onOpenShop={onOpenShop}
      />

    </div>
  );
};
