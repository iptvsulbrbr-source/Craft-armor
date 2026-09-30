import React, { useState, useEffect } from 'react';
import { Scroll, Swords, Flame, ShieldAlert, Trophy, Sparkles, Zap } from 'lucide-react';

export interface CombatLogItem {
  id: string;
  text: string;
  type: 'hero_attack' | 'hero_crit' | 'enemy_attack' | 'victory' | 'stage_advance' | 'info';
  timestamp: number;
}

export interface CombatLogProps {
  logs: CombatLogItem[];
  className?: string;
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs, className = '' }) => {
  const [now, setNow] = useState<number>(Date.now());

  // Atualizar tempo periodicamente para controlar o fade-out automático
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Exibe apenas as últimas 3 ações
  const recentLogs = logs.slice(-3);

  if (recentLogs.length === 0) {
    return (
      <div className={`w-full bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-zinc-500 ${className}`}>
        <div className="flex items-center gap-1.5 font-mono">
          <Scroll className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">Log de Combate</span>
        </div>
        <span className="text-[10px] italic">Aguardando início do duelo...</span>
      </div>
    );
  }

  return (
    <div className={`w-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col gap-1.5 transition-all ${className}`}>
      {/* Header do Log */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 px-0.5">
        <div className="flex items-center gap-1.5 font-mono">
          <Scroll className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-zinc-200 uppercase tracking-wider text-[10px] sm:text-[11px]">
            Log de Combate (Últimas 3 Ações)
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Tempo Real
        </span>
      </div>

      {/* Lista das 3 últimas ações com fade-out progressivo */}
      <div className="flex flex-col gap-1.5 min-h-[72px] justify-end">
        {recentLogs.map((log, index) => {
          const ageMs = now - log.timestamp;
          
          // Cálculo de opacidade para Fade-out Automático após alguns segundos
          let opacityClass = 'opacity-100';
          if (ageMs > 4500) {
            opacityClass = 'opacity-25 transition-opacity duration-1000';
          } else if (ageMs > 2800) {
            opacityClass = 'opacity-65 transition-opacity duration-700';
          }

          // Estilização temática por tipo de ação
          let badgeColor = 'bg-zinc-900 border-zinc-700 text-zinc-300';
          let icon = <Swords className="w-3 h-3" />;

          switch (log.type) {
            case 'hero_crit':
              badgeColor = 'bg-amber-950/90 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/30';
              icon = <Flame className="w-3 h-3 text-amber-400 animate-pulse" />;
              break;
            case 'hero_attack':
              badgeColor = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
              icon = <Swords className="w-3 h-3 text-emerald-400" />;
              break;
            case 'enemy_attack':
              badgeColor = 'bg-rose-950/80 border-rose-500/50 text-rose-300';
              icon = <ShieldAlert className="w-3 h-3 text-rose-400" />;
              break;
            case 'victory':
              badgeColor = 'bg-yellow-950/90 border-yellow-500/60 text-yellow-300 shadow-sm shadow-yellow-500/20';
              icon = <Trophy className="w-3 h-3 text-yellow-400" />;
              break;
            case 'stage_advance':
              badgeColor = 'bg-sky-950/80 border-sky-500/50 text-sky-300';
              icon = <Zap className="w-3 h-3 text-sky-400" />;
              break;
            default:
              break;
          }

          const isLatest = index === recentLogs.length - 1;

          return (
            <div
              key={log.id}
              className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg border text-xs transition-all duration-300 animate-fadeIn ${badgeColor} ${opacityClass} ${
                isLatest ? 'ring-1 ring-white/10 scale-[1.01]' : ''
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{icon}</span>
                <span className="font-mono text-[11px] sm:text-xs truncate font-medium">
                  {log.text}
                </span>
              </div>

              <span className="text-[9px] font-mono text-zinc-400 shrink-0 opacity-80">
                {Math.max(0, Math.round(ageMs / 1000))}s atrás
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
