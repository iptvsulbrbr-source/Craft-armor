import React from 'react';
import { Volume2, VolumeX, BookOpen, BarChart3, Coins, Sparkles, Gem, ShieldCheck, Crown, Scroll, Battery, BatteryCharging, Zap } from 'lucide-react';
import { formatNumber, formatDuration } from '../data/weapons';

interface HeaderProps {
  cedulas: number;
  diamantes: number;
  highestTier: number;
  soundEnabled: boolean;
  powerSaverMode?: boolean;
  activeFusionBoostPercent?: number;
  isPremiumActive?: boolean;
  premiumExpiresAt?: number;
  pendingRewardsCount?: number;
  onToggleSound: () => void;
  onTogglePowerSaver?: () => void;
  onOpenCodex: () => void;
  onOpenStats: () => void;
  onOpenExchange: () => void;
  onOpenFusionBoost?: () => void;
  onOpenShop?: () => void;
  onOpenRewards?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cedulas,
  diamantes,
  highestTier,
  soundEnabled,
  powerSaverMode = false,
  activeFusionBoostPercent = 0,
  isPremiumActive = false,
  premiumExpiresAt = 0,
  pendingRewardsCount = 0,
  onToggleSound,
  onTogglePowerSaver,
  onOpenCodex,
  onOpenStats,
  onOpenExchange,
  onOpenFusionBoost,
  onOpenShop,
  onOpenRewards,
}) => {
  const premiumSeconds = isPremiumActive && premiumExpiresAt > Date.now()
    ? Math.ceil((premiumExpiresAt - Date.now()) / 1000)
    : 0;

  return (
    <header className="w-full bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 px-2 sm:px-4 md:px-8 py-2 transition-colors shadow-lg shadow-black/40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        
        {/* LINHA 1: Brand Title e Saldos de Moedas (Cédulas e Diamantes) */}
        <div className="flex items-center justify-between gap-2 w-full md:w-auto">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm md:text-lg font-bold font-display tracking-wide text-zinc-100 uppercase leading-none">
                Armory Craft
              </h1>
              <p className="text-[10px] text-zinc-400 hidden sm:block mt-0.5">
                Fusão de Armas · Tier 1 ao 15
              </p>
            </div>
          </div>

          {/* Saldos (Cédulas e Diamantes Lado a Lado) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Saldo de Cédulas */}
            <div 
              className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 border border-amber-500/40 px-2 sm:px-3 py-1 rounded-xl shadow-inner shadow-amber-500/5 group"
              title={`Saldo exato: ${cedulas.toLocaleString('pt-BR')} Cédulas`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-amber-400/80 -mb-0.5">
                  Cédulas
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-tight text-amber-300">
                  {formatNumber(cedulas)}
                </span>
              </div>
            </div>

            {/* Saldo de Diamantes */}
            <div 
              onClick={onOpenExchange}
              className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 border border-cyan-500/50 hover:border-cyan-400 px-2 sm:px-3 py-1 rounded-xl shadow-inner shadow-cyan-500/10 group cursor-pointer transition-all hover:scale-[1.02]"
              title={`Saldo: ${diamantes.toLocaleString('pt-BR')} Diamantes (Clique para abrir Câmbio: 1.000 Cédulas = 1 💎)`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                <Gem className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 drop-shadow" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-cyan-400/80 -mb-0.5">
                    Diamantes
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-cyan-300 font-extrabold uppercase hidden md:inline bg-cyan-950 px-1 rounded border border-cyan-700/50">
                    +Câmbio
                  </span>
                </div>
                <span className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-tight text-cyan-300">
                  {formatNumber(diamantes)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* LINHA 2 NO MOBILE (Diretamente abaixo das cédulas):
            Amuleto, Missões/Login, Códex, Estatísticas, Volume e VIP */}
        <div className="flex items-center justify-between md:justify-end gap-1 sm:gap-2 pt-1.5 md:pt-0 border-t border-zinc-800/80 md:border-t-0 w-full md:w-auto">
          
          {/* 1. Amuleto de Fusão (+10%) */}
          {onOpenFusionBoost && (
            <button
              onClick={onOpenFusionBoost}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold font-mono transition-all cursor-pointer flex-1 sm:flex-initial ${
                activeFusionBoostPercent > 0
                  ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950/40'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Amuleto de Proteção de Fusão 24h (+10% chance por carga)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-400 font-bold">
                {activeFusionBoostPercent > 0 ? `+${activeFusionBoostPercent}%` : '+10%'}
              </span>
            </button>
          )}

          {/* 2. Badge VIP Premium (Se ativo) */}
          {isPremiumActive && (
            <div
              onClick={onOpenShop}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-950/80 to-amber-900/60 text-amber-300 shadow-md shadow-amber-950/40 text-[11px] sm:text-xs font-mono font-bold cursor-pointer animate-pulse shrink-0"
              title={`Passe Premium VIP Ativo! Restam ${formatDuration(premiumSeconds)} (Clique para estender na Loja)`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[9px] uppercase font-black">VIP</span>
              <span className="text-[10px] text-amber-200 hidden xs:inline">{formatDuration(premiumSeconds)}</span>
            </div>
          )}

          {/* 3. Missões, Login & Passe */}
          {onOpenRewards && (
            <button
              onClick={onOpenRewards}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 rounded-xl border border-emerald-500/40 transition-colors whitespace-nowrap cursor-pointer relative flex-1 sm:flex-initial"
              title="Login Diário, Missões e Passe de Temporada"
            >
              <Scroll className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Missões</span>
              {pendingRewardsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          )}

          {/* 4. Códex Button */}
          <button
            onClick={onOpenCodex}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-300 bg-zinc-800/90 hover:bg-zinc-700 hover:text-white rounded-xl border border-zinc-700/60 transition-colors whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
            title="Códex de Armas (Tiers 1 ao 15)"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Códex</span>
          </button>

          {/* 5. Stats Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-300 bg-zinc-800/90 hover:bg-zinc-700 hover:text-white rounded-xl border border-zinc-700/60 transition-colors whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
            title="Estatísticas, Configurações e Salvamento Local"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Stats</span>
          </button>

          {/* 6. Power Saver Mode Quick Toggle Button (Economia de Energia) */}
          {onTogglePowerSaver && (
            <button
              onClick={onTogglePowerSaver}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                powerSaverMode
                  ? 'bg-emerald-950/80 border-emerald-400/80 text-emerald-300 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
              title={
                powerSaverMode
                  ? 'Modo Economia de Energia: ATIVO (Sincronização em 2º plano reduzida para poupar bateria no mobile)'
                  : 'Modo Economia de Energia: DESATIVADO (Clique para reduzir uso de CPU/Bateria)'
              }
              aria-label="Modo Economia de Bateria"
            >
              {powerSaverMode ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              )}
              <span className="hidden sm:inline font-mono text-[10.5px]">
                {powerSaverMode ? 'Eco: ON' : 'Eco'}
              </span>
            </button>
          )}

          {/* 7. DEDICATED GLOBAL SOUND TOGGLE BUTTON (Mudo / Desmutado com Persistência em LocalStorage) */}
          <button
            onClick={onToggleSound}
            data-testid="header-sound-toggle-btn"
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
              soundEnabled
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border-amber-500/60 shadow-md shadow-amber-950/30 ring-1 ring-amber-400/30'
                : 'bg-zinc-950/90 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
            title={
              soundEnabled
                ? '🔊 Áudio Global Ativado (Clique para Silenciar e salvar no navegador)'
                : '🔇 Áudio Global Silenciado (Clique para Ativar efeitos sonoros Web Audio e salvar no navegador)'
            }
            aria-label={soundEnabled ? 'Silenciar Áudio Global' : 'Ativar Áudio Global'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-mono font-black text-amber-300 hidden xs:inline">
                  SOM
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80 animate-ping hidden md:inline" />
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-[11px] font-mono text-zinc-500 hidden xs:inline">
                  MUDO
                </span>
              </>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
