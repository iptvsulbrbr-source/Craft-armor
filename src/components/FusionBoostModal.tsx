import React from 'react';
import { X, ShieldCheck, Sparkles, Gem, Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { FusionBoost, WeaponRarity } from '../types/game';
import { RARITIES, getBaseFusionSuccessChance, getFusionBoostPerCharge, calculateEffectiveFusionChance } from '../data/rarities';
import { formatDuration } from '../data/weapons';

interface FusionBoostModalProps {
  isOpen: boolean;
  diamantes: number;
  activeBoosts: FusionBoost[];
  onBuyBoost: () => void;
  onOpenExchange: () => void;
  onClose: () => void;
}

export const FusionBoostModal: React.FC<FusionBoostModalProps> = ({
  isOpen,
  diamantes,
  activeBoosts,
  onBuyBoost,
  onOpenExchange,
  onClose,
}) => {
  if (!isOpen) return null;

  const now = Date.now();
  const validBoosts = activeBoosts.filter((b) => b.expiresAt > now);
  const activeCount = validBoosts.length;
  const totalBonusPercent = activeCount * 10;
  const BOOST_COST = 10;
  const MAX_STACKS = 5;
  const canBuy = activeCount < MAX_STACKS && diamantes >= BOOST_COST;

  // Encontrar o boost que expira mais cedo
  const earliestExpiry = validBoosts.length > 0
    ? Math.min(...validBoosts.map((b) => b.expiresAt))
    : null;
  const remainingSeconds = earliestExpiry ? Math.max(0, Math.ceil((earliestExpiry - now) / 1000)) : 0;

  const highRarities: WeaponRarity[] = ['lendaria', 'mitica', 'ancestral', 'cosmica', 'divina', 'primordial'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl shadow-black overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display uppercase tracking-wide text-zinc-100 flex items-center gap-2">
                <span>Amuleto de Proteção de Fusão</span>
                <span className="text-[10px] font-mono font-bold bg-amber-950 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                  24 Horas
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Aumenta em +10% a chance de sucesso na fusão de armas Lendárias e superiores.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          
          {/* Status Atual dos Bônus */}
          <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">
                Bônus de Sucesso Ativo:
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>+{totalBonusPercent}% de Chance</span>
              </div>
              {earliestExpiry && (
                <div className="text-[11px] font-mono text-zinc-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Próxima expiração em {formatDuration(remainingSeconds)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-200">
                {activeCount} / {MAX_STACKS} Cargas
              </span>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: MAX_STACKS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border ${
                      i < activeCount
                        ? 'bg-amber-400 border-amber-300 shadow-xs shadow-amber-400'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Botão de Compra de Nova Carga (+10% por 10 Diamantes) */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Comprar Carga de +10% (24 Horas)</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Acumula até 5 vezes simultaneamente (+50% máximo).
                </div>
              </div>

              <div className="flex items-center gap-1 bg-cyan-950 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-cyan-300">
                <Gem className="w-3.5 h-3.5" />
                <span>10 💎</span>
              </div>
            </div>

            <button
              onClick={onBuyBoost}
              disabled={!canBuy}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeCount >= MAX_STACKS
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : diamantes < BOOST_COST
                  ? 'bg-zinc-800 text-amber-400/90 border border-amber-900/40 cursor-pointer hover:bg-zinc-750'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 cursor-pointer'
              }`}
            >
              {activeCount >= MAX_STACKS ? (
                <span>Limite Máximo de 5 Cargas Atingido (+50%)</span>
              ) : diamantes < BOOST_COST ? (
                <span>Saldo insuficiente ({diamantes}/10 💎) · Abrir Câmbio</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ativar Carga (+10% por 24h) por 10 💎</span>
                </>
              )}
            </button>

            {diamantes < BOOST_COST && activeCount < MAX_STACKS && (
              <button
                onClick={onOpenExchange}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline text-center cursor-pointer"
              >
                Precisa de Diamantes? Converta Cédulas na Casa de Câmbio (1.000 Céd = 1 💎)
              </button>
            )}
          </div>

          {/* Tabela de Chances de Fusão (Base vs Com Bônus Ativo) */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Chances de Sucesso nas Altas Raridades:</span>
              <span className="text-zinc-500 font-mono text-[10px]">Falha consome a arma secundária</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {highRarities.map((rKey) => {
                const rDef = RARITIES[rKey];
                const baseChance = getBaseFusionSuccessChance(rKey);
                const boostPerCharge = getFusionBoostPerCharge(rKey);
                const effectiveChance = calculateEffectiveFusionChance(rKey, activeCount);

                return (
                  <div
                    key={rKey}
                    className={`p-2.5 rounded-xl border ${rDef.badgeBg} ${rDef.badgeBorder} flex flex-col gap-1`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold" style={{ color: rDef.color }}>
                        {rDef.label}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        +{boostPerCharge.toFixed(1)}%/carga
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 font-mono text-xs">
                      <span className="text-zinc-500 text-[10px]">Base: {baseChance}%</span>
                      <span className="font-bold text-amber-300">
                        {effectiveChance}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regras Claras */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-2 text-xs text-zinc-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-[11px] leading-relaxed">
              <span className="font-semibold text-zinc-200">Como funciona a falha de fusão:</span>
              <span>
                Abaixo de Lendário, a fusão nunca falha (100%). A partir do Lendário (40%), se a fusão falhar, a arma de sacrifício se desfaz na forja e a arma base permanece na bancada.
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Duração de 24 horas independentes para cada carga.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
