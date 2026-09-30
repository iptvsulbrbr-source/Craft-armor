import React, { useState } from 'react';
import { X, Gem, Coins, ArrowRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { formatNumber } from '../data/weapons';

interface DiamondExchangeModalProps {
  isOpen: boolean;
  cedulas: number;
  diamantes: number;
  onConvert: (diamondsToBuy: number) => void;
  onClose: () => void;
}

export const DiamondExchangeModal: React.FC<DiamondExchangeModalProps> = ({
  isOpen,
  cedulas,
  diamantes,
  onConvert,
  onClose,
}) => {
  const [customAmount, setCustomAmount] = useState<number>(1);
  const CEDULAS_PER_DIAMOND = 1000;

  if (!isOpen) return null;

  const maxAffordable = Math.floor(cedulas / CEDULAS_PER_DIAMOND);

  const handleQuickConvert = (diamonds: number) => {
    if (diamonds <= 0) return;
    onConvert(diamonds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl shadow-black overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display uppercase tracking-wide text-zinc-100 flex items-center gap-2">
                <span>Casa de Câmbio</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">
                  1.000 Cédulas = 1 💎
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Converta seu excedente de Cédulas em Diamantes para acelerar crafts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Fechar câmbio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          
          {/* Saldos Atuais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-950 border border-amber-500/30 rounded-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-amber-400/80">Saldo Cédulas</div>
                <div className="text-sm font-bold font-mono text-amber-300 truncate">
                  {formatNumber(cedulas)}
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Gem className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-cyan-400/80">Saldo Diamantes</div>
                <div className="text-sm font-bold font-mono text-cyan-300 truncate">
                  {formatNumber(diamantes)}
                </div>
              </div>
            </div>
          </div>

          {/* Conversão Rápida em Lotes */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Conversões Rápidas:
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickConvert(1)}
                disabled={cedulas < 1000}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  cedulas >= 1000
                    ? 'bg-zinc-950/80 hover:bg-cyan-950/40 border-zinc-800 hover:border-cyan-500/60 cursor-pointer hover:scale-[1.02]'
                    : 'bg-zinc-950/40 border-zinc-800/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1 text-cyan-300 font-bold text-sm">
                  <Gem className="w-3.5 h-3.5" />
                  <span>+1 💎</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">1.000 Cédulas</span>
              </button>

              <button
                onClick={() => handleQuickConvert(10)}
                disabled={cedulas < 10000}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  cedulas >= 10000
                    ? 'bg-zinc-950/80 hover:bg-cyan-950/40 border-zinc-800 hover:border-cyan-500/60 cursor-pointer hover:scale-[1.02]'
                    : 'bg-zinc-950/40 border-zinc-800/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1 text-cyan-300 font-bold text-sm">
                  <Gem className="w-3.5 h-3.5" />
                  <span>+10 💎</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">10.000 Cédulas</span>
              </button>

              <button
                onClick={() => handleQuickConvert(50)}
                disabled={cedulas < 50000}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  cedulas >= 50000
                    ? 'bg-zinc-950/80 hover:bg-cyan-950/40 border-zinc-800 hover:border-cyan-500/60 cursor-pointer hover:scale-[1.02]'
                    : 'bg-zinc-950/40 border-zinc-800/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1 text-cyan-300 font-bold text-sm">
                  <Gem className="w-3.5 h-3.5" />
                  <span>+50 💎</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">50.000 Cédulas</span>
              </button>
            </div>
          </div>

          {/* Conversor de Quantidade Customizada ou Máximo */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span>Converter Quantidade:</span>
              <span className="text-zinc-500 font-mono text-[11px]">
                Máximo possível: {maxAffordable} 💎
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, maxAffordable)}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-cyan-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-500 pointer-events-none">
                  Diamantes
                </span>
              </div>

              <button
                onClick={() => setCustomAmount(Math.max(1, maxAffordable))}
                disabled={maxAffordable <= 0}
                className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 font-semibold transition-colors disabled:opacity-50"
              >
                Máx
              </button>

              <button
                onClick={() => handleQuickConvert(customAmount)}
                disabled={cedulas < customAmount * CEDULAS_PER_DIAMOND || customAmount <= 0}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-zinc-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Converter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Custo em Cédulas:</span>
              <span className="font-mono text-amber-300 font-bold">
                {formatNumber(customAmount * CEDULAS_PER_DIAMOND)} Cédulas
              </span>
            </div>
          </div>

          {/* Utilidade dos Diamantes */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-900/40 rounded-xl flex items-start gap-2.5 text-xs text-cyan-200">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 leading-relaxed text-[11px]">
              <span className="font-semibold text-cyan-300">Poder dos Diamantes:</span>
              <span className="text-cyan-200/80">
                Use 1 Diamante para concluir instantaneamente o tempo de craft ou fusão de qualquer arma na bancada!
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Taxa fixa de 1.000 Cédulas por Diamante.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
