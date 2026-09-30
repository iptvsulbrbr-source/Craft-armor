import React, { useState } from 'react';
import { X, RotateCcw, Save, Flame, ShoppingBag, DollarSign, Award, CheckCircle, Gem, Swords, Battery, BatteryCharging, Volume2, VolumeX, Settings } from 'lucide-react';
import { GameStats } from '../types/game';
import { formatNumber } from '../data/weapons';

interface StatsModalProps {
  isOpen: boolean;
  stats: GameStats;
  diamantes?: number;
  battleStage?: number;
  soundEnabled?: boolean;
  powerSaverMode?: boolean;
  onToggleSound?: () => void;
  onTogglePowerSaver?: () => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  stats,
  diamantes = 0,
  battleStage = 1,
  soundEnabled = true,
  powerSaverMode = false,
  onToggleSound,
  onTogglePowerSaver,
  onResetGame,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl shadow-black overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display uppercase tracking-wide text-zinc-100">
                Estatísticas & Salvamento
              </h2>
              <p className="text-xs text-zinc-400">
                Progresso armazenado localmente no navegador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Total de Fusões</div>
                <div className="text-base font-bold font-mono text-zinc-100">
                  {stats.totalMerged.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Armas Compradas</div>
                <div className="text-base font-bold font-mono text-zinc-100">
                  {stats.totalPurchased.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Armas Vendidas</div>
                <div className="text-base font-bold font-mono text-zinc-100">
                  {stats.totalSold.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Maior Tier Criado</div>
                <div className="text-base font-bold font-mono text-purple-300">
                  Tier {stats.highestTierUnlocked}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Falhas de Fusão (Lendário+)</div>
                <div className="text-base font-bold font-mono text-rose-400">
                  {(stats.totalFailedFusions || 0).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Forjas Duplas 2x Ativadas</div>
                <div className="text-base font-bold font-mono text-cyan-300">
                  {(stats.doubleCraftTriggerCount || 0).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-rose-500/30 rounded-xl flex items-center gap-3 col-span-2">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400">Progresso da Batalha</div>
                  <div className="text-base font-bold font-mono text-rose-300">
                    Fase {battleStage} de 100
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono">Monstros Eliminados</div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    +{(stats.totalMonstersDefeated || 0).toLocaleString('pt-BR')} abatidos
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-cyan-500/30 rounded-xl flex items-center gap-3 col-span-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Gem className="w-5 h-5" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400">Saldo Atual em Diamantes</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {diamantes.toLocaleString('pt-BR')} 💎
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500 font-mono">Total Convertido</div>
                  <div className="text-xs font-mono text-cyan-400 font-bold">
                    +{(stats.totalDiamondsConverted || 0).toLocaleString('pt-BR')} 💎
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Painel de Preferências e Configurações */}
          <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wide">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Configurações do Jogo & Preferências</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Botão de Som Global */}
              {onToggleSound && (
                <button
                  onClick={onToggleSound}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    soundEnabled
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-left">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold">Efeitos Sonoros</div>
                      <div className="text-[10px] text-zinc-500">Web Audio API</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    soundEnabled ? 'bg-amber-950 text-amber-300 border border-amber-600/40' : 'bg-zinc-950 text-zinc-500'
                  }`}>
                    {soundEnabled ? 'Ativo' : 'Mudo'}
                  </span>
                </button>
              )}

              {/* Botão de Economia de Energia (Power Saver) */}
              {onTogglePowerSaver && (
                <button
                  onClick={onTogglePowerSaver}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    powerSaverMode
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-left">
                    {powerSaverMode ? (
                      <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                    ) : (
                      <Battery className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold">Economia (Eco)</div>
                      <div className="text-[10px] text-zinc-500">Poupar Bateria</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    powerSaverMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-zinc-950 text-zinc-500'
                  }`}>
                    {powerSaverMode ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* LocalStorage Status Banner */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3 text-xs text-zinc-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Save className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-zinc-200">Armazenamento Local Ativo</div>
              <div className="text-zinc-500 text-[11px]">
                Seu progresso é gravado automaticamente a cada compra, fusão e venda.
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Reset Danger Zone */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Progresso do Jogo</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex flex-col gap-2.5">
                <div className="text-xs text-rose-200">
                  Tem certeza? Todo o saldo de Cédulas, armas na bancada e histórico serão zerados.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onResetGame();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Sim, Zerar Tudo
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
