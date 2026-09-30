import React from 'react';
import { WeaponItem } from '../types/game';
import { getWeaponData, formatNumber, formatDuration, getCraftDurationSeconds } from '../data/weapons';
import { getRarityData } from '../data/rarities';
import { WeaponIcon } from './WeaponIcon';
import { Swords, Sparkles, Coins, Zap, Hammer, X, Info, Shield, Clock, Wand2 } from 'lucide-react';

export interface WeaponTooltipProps {
  item: WeaponItem;
  slotIndex: number;
  targetRect?: DOMRect | null;
  isPinned?: boolean; // ativado por long press no mobile
  onClose?: () => void;
}

export const WeaponTooltip: React.FC<WeaponTooltipProps> = ({
  item,
  slotIndex,
  targetRect,
  isPinned = false,
  onClose,
}) => {
  const data = getWeaponData(item.tier);
  const rarityDef = getRarityData(item.rarity || 'comum');
  const now = Date.now();
  const isEnchanted = !!(item.enchantExpiresAt && item.enchantExpiresAt > now);
  const enchantSecondsRemaining = isEnchanted ? Math.ceil((item.enchantExpiresAt! - now) / 1000) : 0;
  const baseRarityDef = item.baseRarity ? getRarityData(item.baseRarity) : null;

  const effectiveDamage = Math.round(data.damage * rarityDef.damageMultiplier);
  const effectiveSell = Math.round(data.sellValue * rarityDef.sellMultiplier);
  const craftDuration = getCraftDurationSeconds(item.tier);

  const damageBonusPercent = Math.round((rarityDef.damageMultiplier - 1) * 100);
  const sellBonusPercent = Math.round((rarityDef.sellMultiplier - 1) * 100);

  // Se estiver pinned (mobile), renderizamos como modal flutuante com backdrop
  if (isPinned) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      >
        <div
          className="relative w-full max-w-sm rounded-2xl bg-zinc-950 border-2 shadow-2xl p-4 text-zinc-100 flex flex-col gap-3 overflow-hidden animate-scaleUp"
          style={{
            borderColor: `${rarityDef.color}80`,
            boxShadow: `0 0 30px ${rarityDef.glowColor}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar com Slot e Botão Fechar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold">
                Slot #{slotIndex + 1}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Toque Longo Ativo
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cabeçalho da Arma */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden"
              style={{
                backgroundColor: `${rarityDef.color}15`,
                borderColor: `${rarityDef.color}80`,
              }}
            >
              <WeaponIcon tier={item.tier} size={36} />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border"
                  style={{
                    color: rarityDef.color,
                    borderColor: `${rarityDef.color}60`,
                    backgroundColor: `${rarityDef.color}20`,
                  }}
                >
                  {rarityDef.label}
                </span>
                <span
                  className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded text-zinc-950 font-bold"
                  style={{ backgroundColor: data.accentColor }}
                >
                  Tier {item.tier}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {data.category}
                </span>
              </div>

              <h3 className="text-base font-black text-zinc-100 truncate mt-0.5">
                {data.name}
              </h3>
            </div>
          </div>

          {/* Banner de Encantamento Ativo (+1 Raridade por 1 Hora) */}
          {isEnchanted && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-950/80 via-purple-950/70 to-pink-950/80 border border-fuchsia-400/60 flex items-center justify-between gap-2 shadow-lg shadow-fuchsia-950/40 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center shrink-0">
                  <Wand2 className="w-4 h-4 text-fuchsia-300" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-fuchsia-200 tracking-wide flex items-center gap-1">
                    <span>✨ Arma Encantada (+1 Raridade)</span>
                  </div>
                  <div className="text-[9.5px] text-zinc-300 font-mono">
                    Base: <strong style={{ color: baseRarityDef?.color || '#a1a1aa' }}>{baseRarityDef?.label || 'Original'}</strong> ➔ Atual: <strong style={{ color: rarityDef.color }}>{rarityDef.label}</strong>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-fuchsia-300 bg-black/50 px-2 py-0.5 rounded border border-fuchsia-400/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-fuchsia-400" />
                  <span>{formatDuration(enchantSecondsRemaining)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Lore / Descrição */}
          {data.lore && (
            <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80 leading-snug">
              "{data.lore}"
            </p>
          )}

          {/* Painel de Atributos Principais */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                Poder de Ataque
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-rose-400 font-mono">
                  {effectiveDamage}
                </span>
                {rarityDef.damageMultiplier > 1 && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    (+{damageBonusPercent}%)
                  </span>
                )}
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">
                Base: {data.damage} × {rarityDef.damageMultiplier}x
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Valor de Venda
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {formatNumber(effectiveSell)}
                </span>
                <span className="text-[10px] text-emerald-300">Céd.</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">
                Base: {formatNumber(data.sellValue)} × {rarityDef.sellMultiplier}x
              </span>
            </div>
          </div>

          {/* Bônus da Raridade */}
          <div
            className="p-2.5 rounded-xl border flex flex-col gap-1.5"
            style={{
              borderColor: `${rarityDef.color}40`,
              backgroundColor: `${rarityDef.color}08`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold flex items-center gap-1"
                style={{ color: rarityDef.color }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Bônus de Raridade ({rarityDef.label}):
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Nível {rarityDef.order}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded">
                <span className="text-zinc-400">Multiplicador Dano:</span>
                <span className="text-amber-300 font-bold">
                  {rarityDef.damageMultiplier}x (+{damageBonusPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded">
                <span className="text-zinc-400">Multiplicador Venda:</span>
                <span className="text-emerald-300 font-bold">
                  {rarityDef.sellMultiplier}x (+{sellBonusPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded">
                <span className="text-zinc-400">Chance Crítico:</span>
                <span className="text-cyan-300 font-bold">
                  {rarityDef.critChance}%
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded">
                <span className="text-zinc-400">Forja Base:</span>
                <span className="text-purple-300 font-bold">
                  {rarityDef.baseChance}%
                </span>
              </div>
            </div>
          </div>

          {/* Info de Forja/Crafting se ativo */}
          {item.crafting ? (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Hammer className="w-3.5 h-3.5 animate-bounce" />
                  Em Forja / Fusão
                </span>
                <span>Restante: {Math.max(0, Math.ceil((item.crafting.endTime - Date.now()) / 1000))}s</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Esta arma está sendo trabalhada e não pode ser movida até a conclusão.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                Tempo de Forja T{item.tier}: {formatDuration(craftDuration)}
              </span>
              <span className="text-zinc-400">Toque fora para fechar</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Versão desktop (hover): ancorada elegantemente ao slot
  // Calcula estilo de posicionamento baseado em targetRect
  let style: React.CSSProperties = {};
  let placement: 'top' | 'bottom' = 'bottom';

  if (targetRect) {
    const tooltipWidth = 280;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 900;

    // Calcular X centralizado com o slot
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    // Prevenir overflow nas bordas da tela
    if (left < 10) left = 10;
    if (left + tooltipWidth > windowWidth - 10) left = windowWidth - tooltipWidth - 10;

    // Se o slot estiver na metade inferior da tela, posiciona acima do slot
    if (targetRect.bottom + 260 > windowHeight) {
      style = {
        position: 'fixed',
        left: `${left}px`,
        bottom: `${windowHeight - targetRect.top + 8}px`,
        width: `${tooltipWidth}px`,
      };
    } else {
      style = {
        position: 'fixed',
        left: `${left}px`,
        top: `${targetRect.bottom + 8}px`,
        width: `${tooltipWidth}px`,
      };
    }
  }

  return (
    <div
      className={`z-50 pointer-events-none rounded-xl bg-zinc-950/95 backdrop-blur-md border shadow-2xl p-3 text-zinc-100 flex flex-col gap-2 transition-opacity duration-150 animate-fadeIn ${
        !targetRect ? 'absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64' : ''
      }`}
      style={{
        ...style,
        borderColor: `${rarityDef.color}70`,
        boxShadow: `0 8px 30px -4px ${rarityDef.glowColor}, 0 0 1px 1px ${rarityDef.color}40`,
      }}
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 shadow-sm"
          style={{
            backgroundColor: `${rarityDef.color}15`,
            borderColor: `${rarityDef.color}60`,
          }}
        >
          <WeaponIcon tier={item.tier} size={28} />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className="text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded border"
              style={{
                color: rarityDef.color,
                borderColor: `${rarityDef.color}60`,
                backgroundColor: `${rarityDef.color}15`,
              }}
            >
              {rarityDef.label}
            </span>
            <span
              className="text-[8px] font-mono font-bold px-1 py-0.2 rounded text-zinc-950"
              style={{ backgroundColor: data.accentColor }}
            >
              T{item.tier}
            </span>
            <span className="text-[8px] font-mono text-zinc-500">
              #{slotIndex + 1}
            </span>
          </div>

          <h4 className="text-xs font-black text-zinc-100 truncate leading-tight mt-0.5">
            {data.name}
          </h4>
        </div>
      </div>

      {/* Banner de Encantamento Ativo (+1 Raridade por 1 Hora) */}
      {isEnchanted && (
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-fuchsia-950/90 to-purple-950/90 border border-fuchsia-400/60 flex items-center justify-between gap-1 text-[9px] shadow-md shadow-fuchsia-950/40">
          <div className="flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-fuchsia-300 shrink-0" />
            <span className="font-bold text-fuchsia-200">
              ✨ Encantada ({baseRarityDef?.label} ➔ {rarityDef.label})
            </span>
          </div>
          <span className="font-mono font-bold text-fuchsia-300 bg-black/40 px-1.5 py-0.2 rounded border border-fuchsia-400/40">
            {formatDuration(enchantSecondsRemaining)}
          </span>
        </div>
      )}

      {/* Grid de Estatísticas: Dano, Venda e Crítico */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 flex flex-col">
          <span className="text-[9px] text-zinc-400 flex items-center gap-1 font-semibold">
            <Swords className="w-3 h-3 text-rose-400" />
            Dano
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-rose-400 font-mono">
              {effectiveDamage}
            </span>
            {rarityDef.damageMultiplier > 1 && (
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                (+{damageBonusPercent}%)
              </span>
            )}
          </div>
          <span className="text-[8px] text-zinc-500 font-mono">
            Base: {data.damage} × {rarityDef.damageMultiplier}x
          </span>
        </div>

        <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 flex flex-col">
          <span className="text-[9px] text-zinc-400 flex items-center gap-1 font-semibold">
            <Coins className="w-3 h-3 text-emerald-400" />
            Valor de Venda
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-emerald-400 font-mono">
              {formatNumber(effectiveSell)}
            </span>
            <span className="text-[8px] text-emerald-300">Céd.</span>
          </div>
          <span className="text-[8px] text-zinc-500 font-mono">
            Base: {formatNumber(data.sellValue)} × {rarityDef.sellMultiplier}x
          </span>
        </div>
      </div>

      {/* Caixa de Bônus da Raridade */}
      <div
        className="p-1.5 rounded-lg border flex flex-col gap-1 text-[9px]"
        style={{
          borderColor: `${rarityDef.color}40`,
          backgroundColor: `${rarityDef.color}08`,
        }}
      >
        <span
          className="font-bold flex items-center gap-1"
          style={{ color: rarityDef.color }}
        >
          <Sparkles className="w-3 h-3" />
          Bônus da Raridade ({rarityDef.label}):
        </span>

        <div className="grid grid-cols-2 gap-1 font-mono text-[8px]">
          <div className="flex justify-between bg-black/40 px-1.5 py-0.5 rounded">
            <span className="text-zinc-400">Dano:</span>
            <span className="text-amber-300 font-bold">+{damageBonusPercent}%</span>
          </div>
          <div className="flex justify-between bg-black/40 px-1.5 py-0.5 rounded">
            <span className="text-zinc-400">Venda:</span>
            <span className="text-emerald-300 font-bold">+{sellBonusPercent}%</span>
          </div>
          <div className="flex justify-between bg-black/40 px-1.5 py-0.5 rounded">
            <span className="text-zinc-400">Crítico:</span>
            <span className="text-cyan-300 font-bold">{rarityDef.critChance}%</span>
          </div>
          <div className="flex justify-between bg-black/40 px-1.5 py-0.5 rounded">
            <span className="text-zinc-400">Chance Forja:</span>
            <span className="text-purple-300 font-bold">{rarityDef.baseChance}%</span>
          </div>
        </div>
      </div>

      {/* Dica de Ação */}
      <div className="flex items-center justify-between text-[8px] text-zinc-400 pt-1 border-t border-zinc-800/80">
        <span className="truncate">
          💡 Arraste para fundir ou vender
        </span>
        <span className="text-zinc-500 font-mono shrink-0 ml-1">
          {formatDuration(craftDuration)}
        </span>
      </div>
    </div>
  );
};
