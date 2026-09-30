import React from 'react';
import {
  RARITIES,
  RARITY_ORDER,
  calculateUpgradeMastery,
  calculateDoubleCraftChance,
  getRarityData,
  getBaseFusionSuccessChance,
  getFusionBoostPerCharge,
} from '../data/rarities';
import { Sparkles, Zap, TrendingUp, Layers, Award, Target, Flame, ShieldAlert } from 'lucide-react';

interface RarityMasteryCardProps {
  totalCrafts: number;
  totalMerged: number;
  doubleCraftTriggers?: number;
}

export const RarityMasteryCard: React.FC<RarityMasteryCardProps> = ({
  totalCrafts,
  totalMerged,
  doubleCraftTriggers = 0,
}) => {
  const totalOperations = totalCrafts + totalMerged;

  const mastery = calculateUpgradeMastery(totalOperations);
  const doubleCraft = calculateDoubleCraftChance(totalOperations);

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-xl shadow-black/50 flex flex-col gap-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-bold font-display uppercase tracking-wide text-zinc-100">
                Maestria de Raridades & Forja
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                +{mastery.bonusPercent.toFixed(1)}% Bônus de Forja
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Consulte a tabela oficial com as chances de forja, chances de salto e sucesso de fusão de todas as 10 raridades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="text-zinc-500">Criações Totais:</span>
          <span className="text-amber-400 font-bold">{totalOperations}</span>
        </div>
      </div>

      {/* Grid com os 2 Mecanismos de Maestria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Bônus de Upgrade de Raridade (+0.5% por meta) */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chance de Raridade Superior</span>
            </span>
            <span className="text-xs font-mono font-extrabold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded">
              +{mastery.bonusPercent.toFixed(1)}% Permanente
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Ao forjar ou fundir armas, ganhe <strong>+0.5%</strong> cumulativo de probabilidade a cada meta concluída (100, 200, 300 crafts...).
          </p>

          {/* Barra de Progresso da Meta Atual */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>
                Meta #{mastery.milestonesAchieved + 1} ({mastery.stepRequired} criações nesta etapa)
              </span>
              <span className="text-amber-400 font-bold">
                {mastery.progressInStep} / {mastery.stepRequired} ({mastery.progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${mastery.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between pt-1 border-t border-zinc-900">
            <span>Metas Concluídas: {mastery.milestonesAchieved}</span>
            <span>Próxima Meta em: {mastery.stepRequired - mastery.progressInStep} criações</span>
          </div>
        </div>

        {/* Card 2: Forja Dupla 2x (Ativa aos 500 crafts) */}
        <div className="p-4 bg-zinc-950/80 border border-cyan-500/30 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Forja Dupla 2x (+1 Arma Bônus)</span>
            </span>
            {doubleCraft.isUnlocked ? (
              <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 rounded animate-pulse">
                {doubleCraft.chancePercent}% Ativo
              </span>
            ) : (
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                Bloqueado (Requer 500)
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Gera uma <strong>2ª arma idêntica</strong> no primeiro slot livre ao forjar ou fundir! Ativa aos 500 crafts (5% base) e sobe +1% a cada 100 criações adicionais.
          </p>

          {!doubleCraft.isUnlocked ? (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Progresso para Desbloqueio:</span>
                <span className="text-cyan-400 font-bold">
                  {totalOperations} / 500 criações ({Math.min(100, Math.round((totalOperations / 500) * 100))}%)
                </span>
              </div>
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-700 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (totalOperations / 500) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold">
                <span>Chance Atual: {doubleCraft.chancePercent}%</span>
                <span>Teto Máximo: 50%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-cyan-900">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(doubleCraft.chancePercent / 50) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between pt-1 border-t border-zinc-900">
            <span>Forjas Duplas Conquistadas: {doubleCraftTriggers}</span>
            <span>{doubleCraft.isUnlocked ? '+1% a cada 100 criações' : `Faltam ${doubleCraft.craftsUntilUnlock} criações`}</span>
          </div>
        </div>

      </div>

      {/* TABELA COMPLETA DAS 10 RARIDADES: CHANCES DE FORJA, FUSÃO E ATRIBUTOS */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs uppercase font-bold text-zinc-200 tracking-wider">
              Tabela de Chances de Forja & Fusão das 10 Raridades
            </h4>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            Do Comum (70%) até o Primordial (0,01%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RARITY_ORDER.map((rarityKey) => {
            const def = getRarityData(rarityKey);
            const fusionBase = getBaseFusionSuccessChance(rarityKey);
            const boostPerCharge = getFusionBoostPerCharge(rarityKey);

            return (
              <div
                key={def.id}
                className={`p-3 rounded-xl border ${def.badgeBg} ${def.badgeBorder} flex flex-col justify-between gap-2 transition-all hover:scale-[1.02]`}
                style={{ boxShadow: `0 4px 14px -3px ${def.glowColor}` }}
              >
                {/* Nome e Chance Base de Forja */}
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80">
                  <span className="text-xs font-bold font-mono uppercase flex items-center gap-1.5" style={{ color: def.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: def.color }} />
                    {def.label}
                  </span>
                  <span className="text-xs font-mono text-zinc-200 font-bold bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800">
                    {def.baseChance}%
                  </span>
                </div>

                {/* Atributos da Raridade */}
                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Chance de Forja:</span>
                    <span className="text-amber-300 font-bold">{def.baseChance}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Sucesso na Fusão:</span>
                    <span className={`font-bold ${fusionBase === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fusionBase}%
                    </span>
                  </div>

                  {boostPerCharge > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Amuleto (Carga):</span>
                      <span className="text-cyan-400 font-bold">+{boostPerCharge.toFixed(1)}%</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                    <span className="text-zinc-500">Dano:</span>
                    <span className="text-rose-300 font-bold">{def.damageMultiplier}x</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Venda:</span>
                    <span className="text-emerald-400 font-bold">{def.sellMultiplier}x</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Crítico:</span>
                    <span className="text-amber-300 font-bold">{def.critChance}%</span>
                  </div>
                </div>

                {/* Nota de Regra */}
                <div className="text-[9px] font-mono text-center py-1 px-1.5 bg-zinc-950/80 rounded border border-zinc-800/80 text-zinc-400">
                  {fusionBase === 100 ? (
                    <span className="text-emerald-400">✓ 100% Fusão Segura</span>
                  ) : (
                    <span className="text-rose-400">⚠️ Chance de Falhar</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
