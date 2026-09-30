import React from 'react';
import { ActiveScreen } from '../types/game';
import { Hammer, Store, Award, TrendingUp, Crown, Swords, Scroll, Zap } from 'lucide-react';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onChangeScreen: (screen: ActiveScreen) => void;
  isPremiumActive?: boolean;
  pendingRewardsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onChangeScreen,
  isPremiumActive = false,
  pendingRewardsCount = 0,
}) => {
  const isCoreActive = activeScreen === 'forge' || activeScreen === 'battle';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-1 sm:px-2 py-1 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-1 sm:gap-2 relative">
        
        {/* ========================================================================= */}
        {/* 1. MENU LOJA & CÂMBIO (COR: CIANO #06b6d4)                               */}
        {/* ========================================================================= */}
        <button
          onClick={() => onChangeScreen('shop')}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 relative ${
            activeScreen === 'shop'
              ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-500/60 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-950/70 scale-105'
              : 'text-zinc-500 hover:text-cyan-400 hover:bg-cyan-950/30'
          }`}
          title="Loja (Casa de Câmbio, Amuletos, VIP Premium & Passe de Temporada)"
          aria-label="Loja e Câmbio"
        >
          <div className="relative">
            <Store className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-115 group-active:rotate-6 ${
              activeScreen === 'shop' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse' : ''
            }`} />
            {isPremiumActive && (
              <Crown className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1.5 animate-bounce" />
            )}
          </div>
          <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 font-mono tracking-tight transition-colors ${
            activeScreen === 'shop' ? 'text-cyan-300 font-extrabold' : 'text-zinc-400'
          }`}>
            Loja
          </span>
          {activeScreen === 'shop' && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] absolute -bottom-0.5" />
          )}
        </button>

        {/* ========================================================================= */}
        {/* 2. MENU MISSÕES, LOGIN & PASSE (COR: ESMERALDA #10b981)                   */}
        {/* ========================================================================= */}
        <button
          onClick={() => onChangeScreen('rewards')}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 relative ${
            activeScreen === 'rewards'
              ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-500/60 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-950/70 scale-105'
              : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30'
          }`}
          title="Missões Diárias, Login e Passe de Temporada"
          aria-label="Missões e Passe"
        >
          <div className="relative">
            <Scroll className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-115 group-hover:-rotate-6 ${
              activeScreen === 'rewards' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : ''
            }`} />
            {pendingRewardsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 text-[8px] font-mono font-bold bg-emerald-500 text-zinc-950 px-1 py-0.2 rounded-full animate-bounce shadow-md shadow-emerald-500/50">
                {pendingRewardsCount}
              </span>
            )}
          </div>
          <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 font-mono tracking-tight transition-colors ${
            activeScreen === 'rewards' ? 'text-emerald-300 font-extrabold' : 'text-zinc-400'
          }`}>
            Missões
          </span>
          {activeScreen === 'rewards' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] absolute -bottom-0.5" />
          )}
        </button>

        {/* ========================================================================= */}
        {/* ARCO CENTRAL EM DESTAQUE: FORJA ⚒️ & BATALHA ⚔️ (SALTADOS E DESTACADOS)     */}
        {/* Envolvidos por um arco luminoso em degradê 3D com destaque conjunto       */}
        {/* ========================================================================= */}
        <div className="relative shrink-0 -mt-3 sm:-mt-4">
          
          {/* Arco Decorativo Superior Conectando os Dois Menus */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-700/80 shadow-md shadow-black/80 flex items-center gap-1.5 z-20 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider font-display bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
              FORJA ⇄ COMBATE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>

          {/* O Moldura do Arco (Borda em Gradiente Âmbar -> Carmesim com Efeito 3D) */}
          <div
            className={`p-[2px] rounded-2xl transition-all duration-300 ${
              activeScreen === 'forge'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-zinc-700 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                : activeScreen === 'battle'
                ? 'bg-gradient-to-r from-zinc-700 via-rose-500 to-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                : 'bg-gradient-to-r from-amber-500/60 via-zinc-700/80 to-rose-500/60 shadow-xl shadow-black/80'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-950/95 backdrop-blur-md rounded-2xl p-1 sm:p-1.5">
              
              {/* --- BOTÃO CENTRAL 1: FORJA (ÂMBAR DOURADO) --- */}
              <button
                onClick={() => onChangeScreen('forge')}
                className={`flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 relative ${
                  activeScreen === 'forge'
                    ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-zinc-950 ring-2 ring-amber-300 shadow-lg shadow-amber-500/40 scale-105'
                    : 'bg-zinc-900/90 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-500/30'
                }`}
                title="Bancada de Forja e Fusão (Comprar, Fundir e Vender Armas)"
                aria-label="Forja"
              >
                <div className="relative">
                  <Hammer className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-12 group-active:-rotate-12 ${
                    activeScreen === 'forge'
                      ? 'text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                      : 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                  }`} />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 font-display transition-colors ${
                  activeScreen === 'forge' ? 'text-zinc-950 font-black' : 'text-amber-300'
                }`}>
                  Forja
                </span>
                {activeScreen === 'forge' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fde047] absolute -bottom-1" />
                )}
              </button>

              {/* Divisor Estilizado de Energia no Centro do Arco */}
              <div className="h-8 w-[1px] bg-gradient-to-b from-amber-500/40 via-zinc-600 to-rose-500/40 mx-0.5" />

              {/* --- BOTÃO CENTRAL 2: BATALHA (CARMESIM / ROSE SANGUE) --- */}
              <button
                onClick={() => onChangeScreen('battle')}
                className={`flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 relative ${
                  activeScreen === 'battle'
                    ? 'bg-gradient-to-b from-rose-500 via-rose-600 to-red-600 text-white ring-2 ring-rose-300 shadow-lg shadow-rose-600/50 scale-105'
                    : 'bg-zinc-900/90 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30'
                }`}
                title="Arena de Batalha (Fases 1 a 100, Combate Ativo & Auto-Batalha)"
                aria-label="Batalha"
              >
                <div className="relative">
                  <Swords className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-115 group-active:scale-125 ${
                    activeScreen === 'battle'
                      ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] animate-pulse'
                      : 'text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                  }`} />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 font-display transition-colors ${
                  activeScreen === 'battle' ? 'text-white font-black' : 'text-rose-300'
                }`}>
                  Batalha
                </span>
                {activeScreen === 'battle' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-200 shadow-[0_0_6px_#f43f5e] absolute -bottom-1" />
                )}
              </button>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MENU CATÁLOGO & ATRIBUTOS (COR: AZUL CELESTE / SKY #38bdf8)            */}
        {/* ========================================================================= */}
        <button
          onClick={() => onChangeScreen('catalog')}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 relative ${
            activeScreen === 'catalog'
              ? 'text-sky-300 bg-sky-950/70 border border-sky-500/60 ring-2 ring-sky-400/40 shadow-lg shadow-sky-950/70 scale-105'
              : 'text-zinc-500 hover:text-sky-400 hover:bg-sky-950/30'
          }`}
          title="Catálogo de Armas (Tiers 1 ao 15, Dano e Tempos)"
          aria-label="Catálogo de Armas"
        >
          <Award className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-115 group-hover:rotate-6 ${
            activeScreen === 'catalog' ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse' : ''
          }`} />
          <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 font-mono tracking-tight transition-colors ${
            activeScreen === 'catalog' ? 'text-sky-300 font-extrabold' : 'text-zinc-400'
          }`}>
            Catálogo
          </span>
          {activeScreen === 'catalog' && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] absolute -bottom-0.5" />
          )}
        </button>

        {/* ========================================================================= */}
        {/* 6. MENU MAESTRIA DE RARIDADE (COR: PÚRPURA / VIOLETA #a855f7)             */}
        {/* ========================================================================= */}
        <button
          onClick={() => onChangeScreen('mastery')}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer group active:scale-90 relative ${
            activeScreen === 'mastery'
              ? 'text-purple-300 bg-purple-950/70 border border-purple-500/60 ring-2 ring-purple-400/40 shadow-lg shadow-purple-950/70 scale-105'
              : 'text-zinc-500 hover:text-purple-400 hover:bg-purple-950/30'
          }`}
          title="Maestria de Raridade e Forja Dupla 2x"
          aria-label="Maestria de Raridade"
        >
          <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-115 group-active:-translate-y-0.5 ${
            activeScreen === 'mastery' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse' : ''
          }`} />
          <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 font-mono tracking-tight transition-colors ${
            activeScreen === 'mastery' ? 'text-purple-300 font-extrabold' : 'text-zinc-400'
          }`}>
            Maestria
          </span>
          {activeScreen === 'mastery' && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7] absolute -bottom-0.5" />
          )}
        </button>

      </div>
    </nav>
  );
};
