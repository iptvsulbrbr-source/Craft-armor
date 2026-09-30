import React from 'react';
import { RotateCcw, Crown, Coins, Gem, Sparkles, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { formatNumber } from '../data/weapons';

interface BattleResetModalProps {
  isOpen: boolean;
  currentStage: number;
  monsterIndex: number;
  cedulas: number;
  diamantes: number;
  isPremiumActive: boolean;
  dailyResetCount: number;
  onConfirm: () => void;
  onClose: () => void;
  onOpenShop: () => void;
}

export const BattleResetModal: React.FC<BattleResetModalProps> = ({
  isOpen,
  currentStage,
  cedulas,
  diamantes,
  isPremiumActive,
  dailyResetCount,
  onConfirm,
  onClose,
  onOpenShop,
}) => {
  if (!isOpen) return null;

  // Cálculo do custo e possibilidade de reiniciar
  let costType: 'free' | 'cedulas' | 'diamantes' = 'free';
  let costAmount = 0;
  let canAfford = true;
  let isLimitReached = false;
  let statusText = '';
  let badgeColor = '';

  if (!isPremiumActive) {
    if (dailyResetCount >= 1) {
      isLimitReached = true;
      canAfford = false;
      costType = 'cedulas';
      costAmount = 500;
      statusText = 'Limite Diário Atingido (1/1 Hoje)';
      badgeColor = 'bg-rose-950 text-rose-300 border-rose-500/40';
    } else {
      costType = 'cedulas';
      costAmount = 500;
      canAfford = cedulas >= 500;
      statusText = '1º Reinício Diário (Sem VIP)';
      badgeColor = 'bg-zinc-800 text-amber-300 border-amber-500/30';
    }
  } else {
    // Com VIP Ativo
    if (dailyResetCount < 3) {
      costType = 'free';
      costAmount = 0;
      canAfford = true;
      statusText = `Reinício ${dailyResetCount + 1}/3 Grátis (👑 VIP)`;
      badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
    } else if (dailyResetCount === 3 || dailyResetCount === 4) {
      costType = 'cedulas';
      costAmount = 500;
      canAfford = cedulas >= 500;
      statusText = `${dailyResetCount + 1}º Reinício do Dia (500 Cédulas)`;
      badgeColor = 'bg-amber-950 text-amber-300 border-amber-500/40';
    } else {
      costType = 'diamantes';
      costAmount = 1;
      canAfford = diamantes >= 1;
      statusText = `${dailyResetCount + 1}º Reinício do Dia (1 💎)`;
      badgeColor = 'bg-purple-950 text-cyan-300 border-purple-500/40';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-amber-500/70 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-amber-500/20 flex flex-col animate-scaleUp">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <RotateCcw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-wide text-zinc-100 flex items-center gap-2">
                <span>Reiniciar Jornada</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Retorne para a <strong>Fase 1</strong> da Arena de Batalha
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          
          {/* Card de Fase Atual */}
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-500">Progresso Atual</span>
              <div className="text-sm font-bold text-zinc-100 mt-0.5">
                Fase <span className="text-amber-400 font-mono font-black">{currentStage}</span> de 100
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-500">Destino</span>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                Fase 1 (Início)
              </div>
            </div>
          </div>

          {/* Custo e Status do Reinício */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/90 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                Custo do Reinício:
              </span>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                {statusText}
              </span>
            </div>

            {/* Valor do Custo */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Valor a Pagar:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-base">
                {costType === 'free' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>0 (GRÁTIS)</span>
                  </span>
                ) : costType === 'cedulas' ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    <span>500 Cédulas</span>
                  </span>
                ) : (
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <Gem className="w-4 h-4 text-cyan-400" />
                    <span>1 Diamante</span>
                  </span>
                )}
              </div>
            </div>

            {/* Saldo do Jogador */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2 rounded-xl border flex items-center justify-between ${
                costType === 'cedulas' && cedulas < 500
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
              }`}>
                <span className="flex items-center gap-1 text-[11px]">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" /> Cédulas:
                </span>
                <span className="font-bold">{formatNumber(cedulas)}</span>
              </div>

              <div className={`p-2 rounded-xl border flex items-center justify-between ${
                costType === 'diamantes' && diamantes < 1
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
              }`}>
                <span className="flex items-center gap-1 text-[11px]">
                  <Gem className="w-3.5 h-3.5 text-cyan-400" /> Diamantes:
                </span>
                <span className="font-bold">{diamantes} 💎</span>
              </div>
            </div>
          </div>

          {/* Regras do Sistema de Reinício */}
          <div className="p-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 flex flex-col gap-2 text-xs text-zinc-400 leading-relaxed">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Regras de Reinício Diário:</span>
            </span>

            <div className="flex flex-col gap-1.5 text-[11px]">
              <div className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-bold">•</span>
                <span><strong>Sem VIP:</strong> Apenas 1 reinício ao dia custando <strong>500 Cédulas</strong>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Com VIP Premium:</strong> <strong>3 reinícios grátis</strong> ao dia!</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>VIP Extras:</strong> 4º e 5º reinícios custam <strong>500 Cédulas</strong> cada; a partir do 6º custa <strong>1 Diamante</strong> cada.</span>
              </div>
            </div>
          </div>

          {/* Banner VIP caso não seja VIP ou limite atingido */}
          {!isPremiumActive ? (
            <div className="p-3 bg-gradient-to-r from-amber-950/60 via-zinc-950 to-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-[11px] text-zinc-300">
                  <span className="font-bold text-amber-300 block">Assine o VIP Premium</span>
                  Ganhe 3 reinícios grátis todos os dias!
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenShop();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl cursor-pointer shrink-0 transition-colors"
              >
                Loja VIP
              </button>
            </div>
          ) : null}

        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 rounded-xl cursor-pointer transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={!canAfford || isLimitReached}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canAfford && !isLimitReached
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {isLimitReached
                ? 'Limite Diário Atingido'
                : !canAfford
                ? 'Saldo Insuficiente'
                : costType === 'free'
                ? 'Reiniciar Grátis (VIP)'
                : costType === 'cedulas'
                ? 'Pagar 500 Cédulas & Reiniciar'
                : 'Pagar 1 💎 & Reiniciar'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
