import React from 'react';
import { X, Lock, CheckCircle2, Swords, DollarSign } from 'lucide-react';
import { WEAPON_TIERS, formatNumber } from '../data/weapons';
import { WeaponIcon } from './WeaponIcon';

interface CodexModalProps {
  isOpen: boolean;
  unlockedTiers: number[];
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({
  isOpen,
  unlockedTiers,
  onClose,
}) => {
  if (!isOpen) return null;

  const tiersList = Object.values(WEAPON_TIERS).sort((a, b) => a.tier - b.tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-black overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h2 className="text-lg font-bold font-display uppercase tracking-wide text-zinc-100 flex items-center gap-2">
              <span>Códex de Armas</span>
              <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {unlockedTiers.length} / 15 Descobertas
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Guia das 15 categorias de armas da forja ancestral.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Fechar Códex"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weapon List Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tiersList.map((weapon) => {
            const isUnlocked = unlockedTiers.includes(weapon.tier);

            return (
              <div
                key={weapon.tier}
                className={`relative rounded-xl p-3.5 border transition-all ${
                  isUnlocked
                    ? `bg-zinc-950/80 ${weapon.borderColor}`
                    : 'bg-zinc-950/30 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon Slot */}
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? `bg-gradient-to-b ${weapon.bgGradient} ${weapon.borderColor}`
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    {isUnlocked ? (
                      <WeaponIcon tier={weapon.tier} size={40} className="w-10 h-10 drop-shadow" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>

                  {/* Weapon Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: isUnlocked ? weapon.accentColor : '#71717a' }}
                      >
                        Tier {weapon.tier}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                          {weapon.category}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-600 uppercase">Bloqueado</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-200 truncate mt-0.5">
                      {isUnlocked ? weapon.name : '??? Desconhecido'}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Swords className="w-3 h-3 text-rose-400" />
                        <span>{isUnlocked ? formatNumber(weapon.damage) : '---'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <DollarSign className="w-3 h-3" />
                        <span>{isUnlocked ? `${formatNumber(weapon.sellValue)} Céd.` : '---'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lore text if unlocked */}
                {isUnlocked && (
                  <p className="text-[11px] text-zinc-400 mt-2.5 pt-2 border-t border-zinc-800/80 leading-relaxed italic">
                    "{weapon.lore}"
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Desbloqueie novos Tiers fundindo armas de mesmo nível na bancada.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
