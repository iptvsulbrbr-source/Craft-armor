import React, { useState } from 'react';
import { WEAPON_TIERS, formatNumber, getCraftDurationSeconds, formatDuration } from '../data/weapons';
import { WeaponRarity } from '../types/game';
import { RARITIES, RARITY_ORDER, getRarityData } from '../data/rarities';
import { WeaponIcon } from './WeaponIcon';
import { Lock, Sparkles, Swords, DollarSign, Award, ChevronDown, ChevronUp, Clock, Zap, Target } from 'lucide-react';

interface TierCatalogProps {
  unlockedTiers: number[];
}

export const TierCatalog: React.FC<TierCatalogProps> = ({ unlockedTiers }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTierDetail, setActiveTierDetail] = useState<number | null>(null);
  const [selectedRarityPreview, setSelectedRarityPreview] = useState<WeaponRarity>('comum');

  const allTiers = Object.values(WEAPON_TIERS).sort((a, b) => a.tier - b.tier);

  const filteredTiers = allTiers.filter((weapon) => {
    const isUnlocked = unlockedTiers.includes(weapon.tier);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const progressPercent = Math.round((unlockedTiers.length / 15) * 100);

  // Dados do Tier selecionado no popup
  const activeWeapon = activeTierDetail ? WEAPON_TIERS[activeTierDetail] : null;
  const currentRarityDef = getRarityData(selectedRarityPreview);
  const effectiveDamage = activeWeapon ? Math.round(activeWeapon.damage * currentRarityDef.damageMultiplier) : 0;
  const effectiveSell = activeWeapon ? Math.round(activeWeapon.sellValue * currentRarityDef.sellMultiplier) : 0;

  return (
    <section className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 pb-8 sm:pb-12 shadow-xl shadow-black/50">
      
      {/* Header do Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-bold font-display uppercase tracking-wide text-zinc-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Catálogo de Tiers & Atributos</span>
            </h3>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
              {unlockedTiers.length} / 15 ({progressPercent}%)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Coleção completa com atributos, tempos de craft/fusão e progressão das 10 raridades.
          </p>
        </div>

        {/* Controles de Filtro e Recolher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos (15)
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filter === 'unlocked'
                  ? 'bg-amber-500/20 text-amber-300 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Desbloqueados ({unlockedTiers.length})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filter === 'locked'
                  ? 'bg-zinc-800 text-zinc-300 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bloqueados ({15 - unlockedTiers.length})
            </button>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir catálogo' : 'Recolher catálogo'}
            aria-label="Expandir ou recolher catálogo"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Barra de Progresso Visual de Descoberta */}
      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden my-4 border border-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-sky-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Grid de Cards dos Tiers 1 ao 15 */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {filteredTiers.map((weapon) => {
            const isUnlocked = unlockedTiers.includes(weapon.tier);
            const isSelected = activeTierDetail === weapon.tier;
            const durationSec = getCraftDurationSeconds(weapon.tier);

            return (
              <div
                key={weapon.tier}
                onClick={() => {
                  if (isUnlocked) {
                    setActiveTierDetail(isSelected ? null : weapon.tier);
                  }
                }}
                className={`relative rounded-xl p-3 border transition-all flex flex-col justify-between cursor-pointer select-none ${
                  isUnlocked
                    ? `bg-zinc-950/80 ${weapon.borderColor} hover:scale-[1.02] hover:shadow-lg`
                    : 'bg-zinc-950/30 border-zinc-800/60 opacity-60 hover:opacity-75'
                } ${
                  isSelected ? 'ring-2 ring-amber-400 scale-[1.03]' : ''
                }`}
                style={{
                  boxShadow: isUnlocked
                    ? `0 4px 16px -4px ${weapon.glowColor}`
                    : undefined,
                }}
              >
                {/* Top Badge: Tier & Category */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className="text-xs font-mono font-black px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                    style={{ color: isUnlocked ? weapon.accentColor : '#71717a' }}
                  >
                    T{weapon.tier}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold truncate">
                    {isUnlocked ? weapon.category : 'Bloqueado'}
                  </span>
                </div>

                {/* Weapon Graphic Silhouette / Vector */}
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center mb-2 border ${
                    isUnlocked
                      ? `bg-gradient-to-b ${weapon.bgGradient} ${weapon.borderColor}`
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  {isUnlocked ? (
                    <WeaponIcon tier={weapon.tier} size={48} className="w-12 h-12 drop-shadow-md" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-600">
                      <Lock className="w-6 h-6" />
                      <span className="text-[10px] font-mono">T{weapon.tier}</span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="text-xs font-bold text-zinc-200 truncate leading-tight">
                  {isUnlocked ? weapon.name : '??? Desconhecido'}
                </div>

                {/* Tabela de Preço, Dano e Tempo */}
                <div className="mt-2 pt-2 border-t border-zinc-800/80 flex flex-col gap-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      Venda:
                    </span>
                    <span className="font-bold">
                      {formatNumber(weapon.sellValue)} Céd.
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                      <Swords className="w-3 h-3 text-rose-400" />
                      Dano:
                    </span>
                    <span>
                      {isUnlocked ? formatNumber(weapon.damage) : '---'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-amber-300/90">
                    <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {weapon.tier === 1 ? 'Craft:' : 'Fusão:'}
                    </span>
                    <span>
                      {formatDuration(durationSec)}
                    </span>
                  </div>
                </div>

                {/* Tag de Desbloqueado */}
                {isUnlocked && (
                  <div className="mt-2 text-center text-[10px] text-amber-400/90 font-medium flex items-center justify-center gap-1 bg-amber-500/10 py-0.5 rounded">
                    <Sparkles className="w-3 h-3" />
                    <span>Ver Atributos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAINEL DE DETALHES COMPLETO (EXATAMENTE COMO REQUISITADO NO DESIGN E SCREENSHOT) */}
      {activeWeapon && (
        <div className="mt-5 p-5 bg-zinc-950 border border-amber-500/40 rounded-2xl flex flex-col gap-4 text-xs text-zinc-300 shadow-xl shadow-black/80 animate-fadeIn">
          
          {/* Linha Superior: Ícone, Nome, Categoria, Tempo e Fechar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border ${currentRarityDef.badgeBorder} ${currentRarityDef.badgeBg}`}
                style={{ boxShadow: `0 0 20px -4px ${currentRarityDef.glowColor}` }}
              >
                <WeaponIcon tier={activeWeapon.tier} size={48} className="w-12 h-12 drop-shadow-lg" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-zinc-100">
                    {activeWeapon.name}
                  </h4>
                  <span className="font-mono text-amber-400 font-bold text-sm">
                    (Tier {activeWeapon.tier})
                  </span>
                  
                  {/* Badge de Raridade com cor dinâmica */}
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${currentRarityDef.badgeBg} ${currentRarityDef.badgeBorder}`}
                    style={{ color: currentRarityDef.color }}
                  >
                    {currentRarityDef.label}
                  </span>

                  <span className="text-[10px] uppercase bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-400 font-semibold">
                    {activeWeapon.category}
                  </span>
                </div>

                <p className="italic text-zinc-400 text-xs mt-1">
                  "{activeWeapon.lore}"
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Preço de Venda</span>
                <span className="text-emerald-400 font-bold font-mono text-base">
                  +{formatNumber(effectiveSell)} Cédulas
                </span>
              </div>

              <button
                onClick={() => setActiveTierDetail(null)}
                className="text-xs text-zinc-400 hover:text-zinc-100 underline cursor-pointer"
              >
                Fechar detalhe
              </button>
            </div>
          </div>

          {/* Seção 2: Especificações Técnicas e Tempo Exato de Craft/Fusão */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Bloco de Tempo (Craft se T1, Fusão se > T1) */}
            <div className="p-3 bg-zinc-900/90 border border-amber-500/30 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold">
                  {activeWeapon.tier === 1 ? 'Tempo de Craft' : 'Tempo de Fusão'}
                </div>
                <div className="text-sm font-bold font-mono text-amber-300">
                  {formatDuration(getCraftDurationSeconds(activeWeapon.tier))}
                </div>
              </div>
            </div>

            {/* Dano de Combate Ajustado por Raridade */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Dano de Combate</div>
                <div className="text-sm font-bold font-mono text-rose-300">
                  ⚔️ {formatNumber(effectiveDamage)}
                </div>
              </div>
            </div>

            {/* Chance de Crítico da Raridade */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Chance Crítica</div>
                <div className="text-sm font-bold font-mono text-amber-300">
                  🎯 {currentRarityDef.critChance}%
                </div>
              </div>
            </div>

            {/* Multiplicador da Raridade Atual */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Multiplicador</div>
                <div className="text-sm font-bold font-mono text-purple-300">
                  ⚡ {currentRarityDef.damageMultiplier}x Dano
                </div>
              </div>
            </div>

          </div>

          {/* Seção 3: Simulador / Seletor das 10 Raridades Disponíveis */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1">
                <span>Visualizar Atributos por Raridade:</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Padrão: Comum 70% | Incomum 15% | Primordial 0,01%
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {RARITY_ORDER.map((rarityKey) => {
                const rDef = RARITIES[rarityKey];
                const isSelectedRarity = selectedRarityPreview === rarityKey;

                return (
                  <button
                    key={rarityKey}
                    onClick={() => setSelectedRarityPreview(rarityKey)}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelectedRarity
                        ? `${rDef.badgeBg} ${rDef.badgeBorder} ring-2 ring-amber-400 scale-[1.05]`
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                    style={{ color: isSelectedRarity ? rDef.color : undefined }}
                    title={`${rDef.label}: ${rDef.baseChance}% chance base · Dano ${rDef.damageMultiplier}x · Venda ${rDef.sellMultiplier}x`}
                  >
                    <span>{rDef.label}</span>
                    <span className="text-[9px] opacity-75 font-normal">{rDef.baseChance}%</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
