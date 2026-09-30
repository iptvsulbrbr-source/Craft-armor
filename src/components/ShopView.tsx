import React, { useState, useEffect } from 'react';
import { Crown, Gem, Coins, ShieldCheck, Zap, ArrowRight, Clock, CheckCircle2, Sparkles, Info, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { formatNumber, formatDuration } from '../data/weapons';
import { FusionBoost, WeaponRarity } from '../types/game';
import {
  RARITIES,
  getBaseFusionSuccessChance,
  getFusionBoostPerCharge,
  calculateEffectiveFusionChance,
} from '../data/rarities';

interface ShopViewProps {
  cedulas: number;
  diamantes: number;
  premiumExpiresAt?: number;
  quickStrikeExpiresAt?: number;
  autoCollectExpiresAt?: number;
  battleSimulationExpiresAt?: number;
  isPassPremiumUnlocked?: boolean;
  rarityEnchantCharges?: number;
  activeBoosts: FusionBoost[];
  onConvertCedulas: (diamondsToBuy: number) => void;
  onBuyFusionBoost: () => void;
  onBuyPremium: () => void;
  onBuyQuickStrike: (hours: 1 | 3) => void;
  onBuyAutoCollect: () => void;
  onBuyBattleSimulation: () => void;
  onBuyRarityEnchant?: () => void;
  onBuySeasonPassPremium?: (currency: 'cedulas' | 'diamantes') => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  cedulas,
  diamantes,
  premiumExpiresAt = 0,
  quickStrikeExpiresAt = 0,
  autoCollectExpiresAt = 0,
  battleSimulationExpiresAt = 0,
  isPassPremiumUnlocked = false,
  rarityEnchantCharges = 0,
  activeBoosts,
  onConvertCedulas,
  onBuyFusionBoost,
  onBuyPremium,
  onBuyQuickStrike,
  onBuyAutoCollect,
  onBuyBattleSimulation,
  onBuyRarityEnchant,
  onBuySeasonPassPremium,
}) => {
  const [customAmount, setCustomAmount] = useState<number>(1);
  const [showFusionInfo, setShowFusionInfo] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isPremiumActive = premiumExpiresAt > now;
  const premiumSecondsRemaining = isPremiumActive ? Math.ceil((premiumExpiresAt - now) / 1000) : 0;

  const isQuickStrikeItemActive = quickStrikeExpiresAt > now;
  const quickStrikeSecondsRemaining = isQuickStrikeItemActive ? Math.ceil((quickStrikeExpiresAt - now) / 1000) : 0;
  const hasQuickStrikeAccess = isPremiumActive || isQuickStrikeItemActive;

  const isAutoCollectActive = autoCollectExpiresAt > now;
  const autoCollectSecondsRemaining = isAutoCollectActive ? Math.ceil((autoCollectExpiresAt - now) / 1000) : 0;

  const isBattleSimulationItemActive = battleSimulationExpiresAt > now;
  const battleSimulationSecondsRemaining = isBattleSimulationItemActive ? Math.ceil((battleSimulationExpiresAt - now) / 1000) : 0;
  const hasBattleSimulationAccess = isPremiumActive || isBattleSimulationItemActive;

  const validBoosts = activeBoosts.filter((b) => b.expiresAt > now);
  const boostCount = validBoosts.length;
  const boostBonusPercent = boostCount * 10;
  const earliestBoostExpiry = validBoosts.length > 0 ? Math.min(...validBoosts.map((b) => b.expiresAt)) : null;
  const boostSecondsRemaining = earliestBoostExpiry ? Math.max(0, Math.ceil((earliestBoostExpiry - now) / 1000)) : 0;

  const CEDULAS_PER_DIAMOND = 1000;
  const maxAffordableDiamonds = Math.floor(cedulas / CEDULAS_PER_DIAMOND);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fadeIn pb-24 sm:pb-32">
      
      {/* Top Banner de Saldos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-zinc-100 uppercase tracking-wide">
              Mercado Imperial & Câmbio
            </h2>
            <p className="text-xs text-zinc-400">
              Gerencie suas Cédulas, Diamantes, VIP Premium, Passe Mensal e Amuletos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 border border-amber-500/40 px-3 py-1.5 rounded-xl">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold font-mono text-amber-300">
              {formatNumber(cedulas)} <span className="text-[10px] text-amber-400/80">Céd</span>
            </span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 border border-cyan-500/40 px-3 py-1.5 rounded-xl">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold font-mono text-cyan-300">
              {formatNumber(diamantes)} <span className="text-[10px] text-cyan-400/80">Diamantes</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. SEÇÃO STATUS VIP PREMIUM (3 HORAS POR 10 DIAMANTES, ACUMULÁVEL) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
          isPremiumActive
            ? 'bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-400/60 shadow-xl shadow-amber-950/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                <span>Status VIP Premium (3 Horas)</span>
              </span>
              <span className="text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Gem className="w-3 h-3" />
                <span>10 💎</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Ativa o status <strong>VIP Premium por 3 horas</strong>. Libera Auto-Fusão e Preenchimento da bancada ilimitados! Você pode acumular mais horas a qualquer momento.
            </p>

            {/* Status do VIP Premium */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Status VIP Atual:
                </div>
                <div className="text-sm font-bold font-mono flex items-center gap-1.5 mt-0.5">
                  {isPremiumActive ? (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Ativo · {formatDuration(premiumSecondsRemaining)}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Inativo (Bloqueado)</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                isPremiumActive ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {isPremiumActive ? 'Ativo' : 'Comprar'}
              </span>
            </div>

            {/* Vantagens do VIP Premium */}
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPremiumActive ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span>Libera <strong>Auto-Fusão Ilimitada</strong> na Bancada (Grátis: 10x/dia)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPremiumActive ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span>Libera <strong>Preencher Bancada Ilimitado</strong> (Grátis: 10x/dia)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPremiumActive ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span>Libera <strong>Ferramentas da Bancada</strong> (Auto-organizar por Tier)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPremiumActive ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span>Libera <strong>Golpe Rápido</strong> e <strong>Batalha em 2º Plano</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onBuyPremium}
            disabled={diamantes < 10}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              diamantes >= 10
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>
              {isPremiumActive ? 'Estender VIP (+3h por 10 💎)' : 'Ativar VIP Premium (3h por 10 💎)'}
            </span>
          </button>
        </div>

        {/* 2. SEÇÃO ELIXIR DE GOLPE RÁPIDO (2 OPÇÕES: 1H POR 2 💎 OU 3H POR 5 💎) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
          hasQuickStrikeAccess
            ? 'bg-gradient-to-b from-rose-950/30 via-zinc-900 to-zinc-900 border-rose-500/40 shadow-lg'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-rose-400" />
                <span>Elixir de Golpe Rápido</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Gem className="w-3 h-3" />
                  <span>2 💎 (1h) · 5 💎 (3h)</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Ativa o botão <strong>⚡ Golpear Rápido</strong> na Arena de Batalha para desferir ataques manuais imediatos contra os monstros sem esperar o turno.
            </p>

            {/* Status do Golpe Rápido */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Status Atual:
                </div>
                <div className="text-sm font-bold font-mono flex items-center gap-1.5 mt-0.5">
                  {isPremiumActive ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Incluso no VIP ({formatDuration(premiumSecondsRemaining)})</span>
                    </span>
                  ) : isQuickStrikeItemActive ? (
                    <span className="text-rose-400 flex items-center gap-1 animate-pulse">
                      <Zap className="w-4 h-4 text-rose-400" />
                      <span>Ativo · {formatDuration(quickStrikeSecondsRemaining)}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Inativo (Bloqueado)</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                hasQuickStrikeAccess ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {hasQuickStrikeAccess ? 'Ativo' : 'Escolha Abaixo'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasQuickStrikeAccess ? 'text-rose-400' : 'text-zinc-600'}`} />
                <span>Permite atacar instantaneamente sem esperar o turno</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasQuickStrikeAccess ? 'text-rose-400' : 'text-zinc-600'}`} />
                <span>Acumula tempo: as compras acumulam horas ao seu saldo</span>
              </div>
            </div>
          </div>

          {/* Duas opções de compra: 2 diamantes por 1 hora OU 5 diamantes por 3 horas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Opção 1: 1 Hora por 2 Diamantes */}
            <button
              onClick={() => onBuyQuickStrike(1)}
              disabled={diamantes < 2}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                diamantes >= 2
                  ? 'bg-zinc-950/80 hover:bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-white shadow-sm hover:scale-[1.02] active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700/60 cursor-not-allowed opacity-75'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-bold text-zinc-200">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>1 Hora</span>
              </div>
              <div className="text-[11px] font-mono font-extrabold text-cyan-300 flex items-center gap-1">
                <Gem className="w-3 h-3 text-cyan-400" />
                <span>2 Diamantes</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                {isQuickStrikeItemActive ? '+1h ao saldo' : 'Ativar por 1h'}
              </span>
            </button>

            {/* Opção 2: 3 Horas por 5 Diamantes (Destaque Econômico) */}
            <button
              onClick={() => onBuyQuickStrike(3)}
              disabled={diamantes < 5}
              className={`p-3 rounded-xl border relative flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer overflow-hidden ${
                diamantes >= 5
                  ? 'bg-gradient-to-b from-rose-900/60 to-zinc-950 border-rose-400 hover:border-rose-300 text-white shadow-md shadow-rose-950/40 hover:scale-[1.02] active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700/60 cursor-not-allowed opacity-75'
              }`}
            >
              <span className="absolute top-1 right-1.5 text-[8px] font-bold uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
                Econômico
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-rose-200">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>3 Horas</span>
              </div>
              <div className="text-[11px] font-mono font-extrabold text-cyan-300 flex items-center gap-1">
                <Gem className="w-3 h-3 text-cyan-400" />
                <span>5 Diamantes</span>
              </div>
              <span className="text-[10px] text-rose-300 font-medium">
                {isQuickStrikeItemActive ? '+3h ao saldo' : 'Ativar por 3h'}
              </span>
            </button>
          </div>
        </div>

        {/* 3. SEÇÃO COLETA AUTOMÁTICA DE ARMAS (1 HORA POR 1 💎 - ACUMULÁVEL) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
          isAutoCollectActive
            ? 'bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-900 border-emerald-400/60 shadow-xl shadow-emerald-950/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Coleta Automática de Armas (1 Hora)</span>
              </span>
              <span className="text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Gem className="w-3 h-3" />
                <span>1 💎</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Coleta automaticamente todas as armas forjadas ou fundidas na Bancada de Montagem assim que ficarem prontas, sem precisar clicar manualmente. <strong>Acumulativo:</strong> adicione mais horas a qualquer momento!
            </p>

            {/* Status da Coleta Automática */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Status Atual:
                </div>
                <div className="text-sm font-bold font-mono flex items-center gap-1.5 mt-0.5">
                  {isAutoCollectActive ? (
                    <span className="text-emerald-400 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Ativo · {formatDuration(autoCollectSecondsRemaining)}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Inativo (Manual)</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                isAutoCollectActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {isAutoCollectActive ? 'Ativo' : 'Disponível'}
              </span>
            </div>

            {/* Vantagens da Coleta Automática */}
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isAutoCollectActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span>Coleta instantânea de armas forjadas ou fundidas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isAutoCollectActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span>Funciona em segundo plano e em todas as telas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isAutoCollectActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span>Acumula tempo: cada compra adiciona +1 hora (+3.600s)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBuyAutoCollect}
            disabled={diamantes < 1}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              diamantes >= 1
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isAutoCollectActive ? 'Estender Coleta Automática (+1h por 1 💎)' : 'Ativar Coleta Automática (1h por 1 💎)'}
            </span>
          </button>
        </div>

        {/* 4. SEÇÃO MODO SIMULADO DE BATALHA (3 DIAS POR 1 💎 - ACUMULÁVEL) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
          hasBattleSimulationAccess
            ? 'bg-gradient-to-b from-purple-950/40 via-zinc-900 to-zinc-900 border-purple-400/60 shadow-xl shadow-purple-950/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Modo Simulado de Batalha (3 Dias)</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-mono font-bold bg-purple-950 border border-purple-500/40 text-purple-300 px-1.5 py-0.2 rounded">
                  3 Dias
                </span>
                <span className="text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Gem className="w-3 h-3" />
                  <span>1 💎</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Permite simular <strong>5 fases consecutivas instantaneamente</strong> na Arena de Batalha, coletando todas as cédulas e avançando sem animações individuais. <strong>Incluso no VIP Premium!</strong>
            </p>

            {/* Status do Modo Simulado */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Status Atual:
                </div>
                <div className="text-sm font-bold font-mono flex items-center gap-1.5 mt-0.5">
                  {isPremiumActive ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Incluso no VIP ({formatDuration(premiumSecondsRemaining)})</span>
                    </span>
                  ) : isBattleSimulationItemActive ? (
                    <span className="text-purple-400 flex items-center gap-1 animate-pulse">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>Ativo · {formatDuration(battleSimulationSecondsRemaining)}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Inativo (Bloqueado)</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                hasBattleSimulationAccess ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {hasBattleSimulationAccess ? 'Ativo' : '1 💎 / 3d'}
              </span>
            </div>

            {/* Vantagens do Modo Simulado */}
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasBattleSimulationAccess ? 'text-purple-400' : 'text-zinc-600'}`} />
                <span>Simula 5 fases consecutivas (50 monstros) em 1 clique</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasBattleSimulationAccess ? 'text-purple-400' : 'text-zinc-600'}`} />
                <span>Coleta instantânea de todas as Cédulas e abates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasBattleSimulationAccess ? 'text-purple-400' : 'text-zinc-600'}`} />
                <span>Acumula tempo: cada compra adiciona +3 dias (+72 horas)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBuyBattleSimulation}
            disabled={diamantes < 1}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              diamantes >= 1
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-zinc-950 shadow-md shadow-purple-950/40'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>
              {isBattleSimulationItemActive
                ? 'Estender Modo Simulado (+3 dias por 1 💎)'
                : 'Ativar Modo Simulado (3 dias por 1 💎)'}
            </span>
          </button>
        </div>

        {/* 5. SEÇÃO ENCANTAMENTO DE RARIDADE (1 HORA POR 1 💎 - +1 NÍVEL DE RARIDADE) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
          rarityEnchantCharges > 0
            ? 'bg-gradient-to-b from-fuchsia-950/40 via-zinc-900 to-zinc-900 border-fuchsia-400/60 shadow-xl shadow-fuchsia-950/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-fuchsia-400 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-fuchsia-400" />
                <span>Encantamento de Raridade (1 Hora)</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-mono font-bold bg-fuchsia-950 border border-fuchsia-500/40 text-fuchsia-300 px-1.5 py-0.2 rounded">
                  1 Hora
                </span>
                <span className="text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Gem className="w-3 h-3" />
                  <span>1 💎</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Eleva temporariamente a raridade de qualquer arma da Bancada em <strong>+1 nível por 1 hora</strong> (ex: <strong className="text-sky-300">Rara ➔ Épica</strong>, <strong className="text-amber-300">Lendária ➔ Mítica</strong>).
            </p>

            {/* Status do Estoque de Encantamentos */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Orbes no seu Inventário:
                </div>
                <div className="text-sm font-bold font-mono flex items-center gap-1.5 mt-0.5">
                  {rarityEnchantCharges > 0 ? (
                    <span className="text-fuchsia-300 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-4 h-4 text-fuchsia-400" />
                      <span>{rarityEnchantCharges} {rarityEnchantCharges === 1 ? 'Orbe Disponível' : 'Orbes Disponíveis'}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">0 Orbes Disponíveis</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                rarityEnchantCharges > 0 ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {rarityEnchantCharges > 0 ? `${rarityEnchantCharges} em Estoque` : 'Disponível'}
              </span>
            </div>

            {/* Regras e Vantagens do Encantamento */}
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                <span>Eleva Dano (+%), Crítico e valor de Venda durante a 1 hora</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                <span><strong>Permite Fusão no nível elevado</strong> (ex: Rara encantada como Épica aceita Rara, Épica ou Lendária)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                <span>Após 1 hora, o item retorna à sua raridade base original</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBuyRarityEnchant}
            disabled={diamantes < 1}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              diamantes >= 1
                ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-zinc-950 shadow-md shadow-fuchsia-950/40'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Comprar Orbe de Encantamento (1 💎)</span>
          </button>
        </div>

        {/* 3. SEÇÃO AMULETO DE PROTEÇÃO DE FUSÃO 24H (10 💎 = +10% ATÉ 5X) */}
        <div className="p-5 rounded-2xl border bg-zinc-900 border-zinc-800 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Amuleto de Proteção de Fusão (24h)</span>
              </span>
              <span className="text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Gem className="w-3 h-3" />
                <span>10 💎</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Fusões Lendárias têm 40% de sucesso. Cada carga aumenta em <strong>+10% por 24h</strong> (acumula até 5x = +50%).
            </p>

            {/* Status das Cargas */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Bônus Ativo Atual:
                </div>
                <div className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>+{boostBonusPercent}% Chance Extra</span>
                </div>
                {earliestBoostExpiry && (
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Expira em {formatDuration(boostSecondsRemaining)}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-200">
                  {boostCount} / 5 Cargas
                </span>
                <div className="flex gap-1 mt-1.5 justify-end">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full border ${
                        i < boostCount ? 'bg-amber-400 border-amber-300' : 'bg-zinc-900 border-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>💡 <em>Fusão Lendária sobe até 90% de sucesso!</em></span>
              <button
                type="button"
                onClick={() => setShowFusionInfo(!showFusionInfo)}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showFusionInfo ? 'Ocultar Detalhes' : 'Ver Chances por Raridade'}</span>
                {showFusionInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* TABELA DE CHANCES DETALHADA POR RARIDADE (Lendária, Mítica, Ancestral...) */}
            {showFusionInfo && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-amber-500/30 flex flex-col gap-2 animate-fadeIn text-[11px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-zinc-400 font-bold">
                  <span>Raridade</span>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span title="Chance Padrão de Fusão sem bônus">Base</span>
                    <span title="Bônus adicionado por carga">Por Carga</span>
                    <span className="text-amber-300" title="Chance com suas cargas ativas">Atual ({boostCount}/5)</span>
                    <span className="text-emerald-400" title="Chance com 5 cargas">Máx (5x)</span>
                  </div>
                </div>

                {(['lendaria', 'mitica', 'ancestral', 'cosmica', 'divina', 'primordial'] as WeaponRarity[]).map((rKey) => {
                  const rDef = RARITIES[rKey];
                  const base = getBaseFusionSuccessChance(rKey);
                  const perCharge = getFusionBoostPerCharge(rKey);
                  const current = calculateEffectiveFusionChance(rKey, boostCount);
                  const max = calculateEffectiveFusionChance(rKey, 5);

                  return (
                    <div key={rKey} className="flex items-center justify-between font-mono py-0.5">
                      <span className="font-bold flex items-center gap-1" style={{ color: rDef.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rDef.color }} />
                        {rDef.label}
                      </span>

                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-zinc-500">{base}%</span>
                        <span className="text-cyan-400">+{perCharge.toFixed(1)}%</span>
                        <span className="text-amber-300 font-bold">{current}%</span>
                        <span className="text-emerald-400 font-bold">{max}%</span>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-1.5 border-t border-zinc-800 text-[10px] text-zinc-500 leading-tight">
                  ℹ️ <em>Comum, Incomum, Rara e Épica têm 100% de sucesso fixo. Acima do Lendário, o padrão e os bônus diminuem em 20% a cada grau.</em>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onBuyFusionBoost}
            disabled={boostCount >= 5 || diamantes < 10}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              boostCount >= 5
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                : diamantes >= 10
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 shadow-md shadow-amber-950/40'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {boostCount >= 5
                ? 'Limite Máximo de 5 Cargas Atingido (+50%)'
                : 'Comprar Carga (+10% por 24h por 10 💎)'}
            </span>
          </button>
        </div>

        {/* 4. SEÇÃO PASSE DE TEMPORADA PREMIUM (30.000 CÉDULAS OU 30 DIAMANTES) */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
          isPassPremiumUnlocked
            ? 'bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-400/60 shadow-xl shadow-amber-950/30'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Passe de Temporada Premium</span>
              </span>
              <span className="text-xs font-mono font-bold bg-amber-950 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>30k Céd. ou 30 💎</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Desbloqueia a <strong>Trilha Dourada do Passe Mensal</strong>! Concede <strong>+50% de bônus em todas as recompensas</strong> dos 15 níveis. Válido durante o mês inteiro até a virada no Dia 1.
            </p>

            {/* Status do Passe Premium */}
            <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">
                  Status no Mês Atual:
                </div>
                <div className="text-sm font-bold font-mono flex items-center gap-1.5 mt-0.5">
                  {isPassPremiumUnlocked ? (
                    <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Ativo · Válido até Dia 1</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Inativo (Bloqueado)</span>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                isPassPremiumUnlocked ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-zinc-900 text-zinc-500'
              }`}>
                {isPassPremiumUnlocked ? 'Desbloqueado' : 'Bloqueado'}
              </span>
            </div>

            {/* Vantagens do Passe Premium */}
            <div className="flex flex-col gap-1.5 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPassPremiumUnlocked ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span><strong>+50% a mais em Cédulas</strong> (ex: 10.000 ➔ 15.000)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPassPremiumUnlocked ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span><strong>+50% a mais em Diamantes</strong> em todos os níveis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPassPremiumUnlocked ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span>Resgate da <strong>Trilha Grátis E Trilha Premium</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isPassPremiumUnlocked ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span>Dura até o final da temporada (reinicia no Dia 1)</span>
              </div>
            </div>
          </div>

          {/* Botões de Compra do Passe Premium */}
          {isPassPremiumUnlocked ? (
            <div className="w-full py-3 px-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Passe Premium Ativo! Aproveite as Recompensas +50%</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onBuySeasonPassPremium?.('cedulas')}
                disabled={cedulas < 30000}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  cedulas >= 30000
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
                }`}
                title="Comprar Passe Premium por 30.000 Cédulas"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>30.000 Cédulas</span>
              </button>

              <button
                onClick={() => onBuySeasonPassPremium?.('diamantes')}
                disabled={diamantes < 30}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  diamantes >= 30
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-zinc-950 shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
                }`}
                title="Comprar Passe Premium por 30 Diamantes"
              >
                <Gem className="w-3.5 h-3.5" />
                <span>30 💎 Diamantes</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. SEÇÃO CASA DE CÂMBIO DE DIAMANTES (1.000 CÉDULAS = 1 💎) */}
      <div className="bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display uppercase tracking-wide text-zinc-100 flex items-center gap-2">
                <span>Casa de Câmbio de Diamantes</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded">
                  1.000 Cédulas = 1 💎
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Converta suas economias em Diamantes para acelerar armas, comprar Amuleto, ativar VIP Premium ou o Passe de Temporada.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            Máx: <strong className="text-cyan-300">{maxAffordableDiamonds} 💎</strong>
          </span>
        </div>

        {/* Botões Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onConvertCedulas(1)}
            disabled={cedulas < 1000}
            className="p-3 bg-zinc-950/80 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-500/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-bold text-cyan-300">+1 💎</span>
            <span className="text-[10px] font-mono text-zinc-400">1.000 Cédulas</span>
          </button>

          <button
            onClick={() => onConvertCedulas(10)}
            disabled={cedulas < 10000}
            className="p-3 bg-zinc-950/80 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-500/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-bold text-cyan-300">+10 💎 (VIP 3h)</span>
            <span className="text-[10px] font-mono text-zinc-400">10.000 Cédulas</span>
          </button>

          <button
            onClick={() => onConvertCedulas(30)}
            disabled={cedulas < 30000}
            className="p-3 bg-zinc-950/80 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-500/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-bold text-cyan-300">+30 💎 (Passe)</span>
            <span className="text-[10px] font-mono text-zinc-400">30.000 Cédulas</span>
          </button>

          <button
            onClick={() => onConvertCedulas(50)}
            disabled={cedulas < 50000}
            className="p-3 bg-zinc-950/80 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-500/60 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-bold text-cyan-300">+50 💎</span>
            <span className="text-[10px] font-mono text-zinc-400">50.000 Cédulas</span>
          </button>

          <button
            onClick={() => onConvertCedulas(maxAffordableDiamonds)}
            disabled={maxAffordableDiamonds <= 0}
            className="p-3 bg-gradient-to-r from-cyan-950 to-zinc-950 hover:bg-cyan-900 border border-cyan-500/40 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed col-span-2 sm:col-span-1"
          >
            <span className="text-sm font-bold text-cyan-300">Converter Máx</span>
            <span className="text-[10px] font-mono text-zinc-400">
              +{maxAffordableDiamonds} 💎
            </span>
          </button>
        </div>

        {/* Conversão Customizada */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Quantidade exata:</span>
            <input
              type="number"
              min="1"
              max={Math.max(1, maxAffordableDiamonds)}
              value={customAmount}
              onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-100 w-28 focus:outline-none focus:border-cyan-400"
            />
            <span className="text-xs text-zinc-400">💎</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-mono text-zinc-400">
              Custo: <strong className="text-amber-300">{formatNumber(customAmount * 1000)} Cédulas</strong>
            </span>

            <button
              onClick={() => onConvertCedulas(customAmount)}
              disabled={cedulas < customAmount * 1000 || customAmount <= 0}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
            >
              <span>Converter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
