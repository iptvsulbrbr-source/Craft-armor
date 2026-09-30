import React, { useState } from 'react';
import { ShoppingBag, DollarSign, ArrowUpDown, ShieldAlert, Sparkles, CheckCircle2, Trash2, Gem, Clock, ShieldCheck, Crown, Battery, BatteryCharging, Zap } from 'lucide-react';
import { formatNumber, getWeaponData } from '../data/weapons';
import { getRarityData } from '../data/rarities';
import { WeaponItem } from '../types/game';

interface SidebarProps {
  cedulas: number;
  diamantes: number;
  freeSlotsCount: number;
  selectedWeapon: { slotIndex: number; item: WeaponItem } | null;
  activeFusionBoostPercent?: number;
  isPremiumActive?: boolean;
  powerSaverMode?: boolean;
  dailyFillBenchRemaining?: number;
  onBuyTier1: () => void;
  onSellSelected: () => void;
  onSellSlot: (slotIndex: number, targetRect?: DOMRect) => void;
  onAutoSort: () => void;
  onFillEmptyWithTier1: () => void;
  onTogglePowerSaver?: () => void;
  onOpenExchange: () => void;
  onOpenFusionBoost?: () => void;
  onOpenShop?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  cedulas,
  diamantes,
  freeSlotsCount,
  selectedWeapon,
  activeFusionBoostPercent = 0,
  isPremiumActive = false,
  powerSaverMode = false,
  dailyFillBenchRemaining = 10,
  onBuyTier1,
  onSellSelected,
  onSellSlot,
  onAutoSort,
  onFillEmptyWithTier1,
  onTogglePowerSaver,
  onOpenExchange,
  onOpenFusionBoost,
  onOpenShop,
}) => {
  const [isDragOverSell, setIsDragOverSell] = useState<boolean>(false);

  const tier1Cost = 2;
  const canBuy = cedulas >= tier1Cost && freeSlotsCount > 0;
  const maxCanBuy = Math.min(Math.floor(cedulas / tier1Cost), freeSlotsCount);

  const selectedData = selectedWeapon ? getWeaponData(selectedWeapon.item.tier) : null;

  // Drag and Drop na Área de Venda
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOverSell) setIsDragOverSell(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSell(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverSell(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSell(false);

    let slotIndex = -1;
    const slotIndexStr = e.dataTransfer.getData('text/plain');
    if (slotIndexStr) {
      const parsed = parseInt(slotIndexStr, 10);
      if (!isNaN(parsed)) slotIndex = parsed;
    }

    // Fallback garantido caso o navegador ou emulador limpe dataTransfer
    if (slotIndex < 0 && typeof (window as any).__DRAGGED_SLOT_INDEX__ === 'number') {
      slotIndex = (window as any).__DRAGGED_SLOT_INDEX__;
    }

    if (slotIndex < 0) return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    onSellSlot(slotIndex, targetRect);
    (window as any).__DRAGGED_SLOT_INDEX__ = null;
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4">
      
      {/* Primary Action Card: Comprar Tier 1 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg shadow-black/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
            Forja de Armas
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {freeSlotsCount} / 16 livres
          </span>
        </div>

        {/* Large Buy Tier 1 Button */}
        <button
          onClick={onBuyTier1}
          disabled={!canBuy}
          className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-between transition-all transform active:scale-[0.98] ${
            canBuy
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-75'
          }`}
          title={
            freeSlotsCount === 0
              ? 'Bancada cheia! Funda ou venda armas para liberar espaço.'
              : cedulas < tier1Cost
              ? 'Saldo insuficiente de Cédulas.'
              : 'Comprar Adaga Enferrujada Tier 1 por 2 Cédulas (Forja em 5s)'
          }
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-950/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight flex items-center gap-1.5">
                <span>Comprar Tier 1</span>
                <span className="text-[10px] font-mono bg-zinc-950/30 px-1.5 py-0.2 rounded font-normal flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> 5s
                </span>
              </div>
              <div className="text-[11px] opacity-80 font-normal">Adaga Enferrujada</div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/30 px-2.5 py-1 rounded-lg font-mono text-sm font-extrabold">
            <span>2</span>
            <span className="text-xs opacity-75">Cédulas</span>
          </div>
        </button>

        {/* Mensagem de Estado se Bloqueado */}
        {freeSlotsCount === 0 ? (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/40 p-2.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Bancada cheia! Arraste para a Área de Venda ou funda armas.</span>
          </div>
        ) : cedulas < tier1Cost ? (
          <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg">
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Sem cédulas. Venda armas na Área de Venda para faturar!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span>Atalho rápido:</span>
            <span className="text-zinc-300 font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-[10px]">
              [Espaço] ou [C]
            </span>
          </div>
        )}

        {/* Multi-buy option if player has spare cash and slots */}
        {maxCanBuy > 1 && (
          isPremiumActive ? (
            <button
              onClick={onFillEmptyWithTier1}
              className="w-full py-2 px-3 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preencher bancada (+{maxCanBuy} armas por {maxCanBuy * 2} Cédulas)</span>
            </button>
          ) : (
            <button
              onClick={onOpenShop}
              className="w-full py-2 px-3 text-xs font-medium text-amber-300/80 bg-zinc-950/80 hover:bg-zinc-900 border border-amber-500/40 rounded-lg transition-all flex items-center justify-between cursor-pointer group"
              title="Ative o Passe Premium (3h por 10 💎) na Loja para liberar esta função"
            >
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px]">Preencher bancada (+{maxCanBuy} armas)</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/50 px-1.5 py-0.5 rounded">
                Requer Premium
              </span>
            </button>
          )
        )}
      </div>

      {/* ÁREA DE VENDA (Drop Zone por Drag & Drop) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg shadow-black/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span>Área de Venda</span>
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            Retorno Imediato
          </span>
        </div>

        {/* Zona de Drop Interativa para Arrastar Armas */}
        <div
          id="sell-drop-zone"
          data-sell-zone="true"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 transition-all p-4 flex flex-col items-center justify-center text-center gap-2 select-none cursor-pointer ${
            isDragOverSell
              ? 'bg-emerald-950/70 border-emerald-400 scale-[1.03] ring-4 ring-emerald-500/30 shadow-xl shadow-emerald-500/20'
              : selectedWeapon && selectedData
              ? 'bg-zinc-950 border-emerald-500/50 shadow-md shadow-emerald-950/20'
              : 'bg-zinc-950/60 border-dashed border-zinc-800 hover:border-emerald-500/40'
          }`}
        >
          {isDragOverSell ? (
            <div className="pointer-events-none flex flex-col items-center text-emerald-300 animate-pulse py-2">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <span className="text-sm font-black uppercase tracking-wide mt-1">
                Solte para Vender!
              </span>
              <span className="text-xs text-emerald-200">
                Cédulas creditadas instantaneamente
              </span>
            </div>
          ) : selectedWeapon && selectedData ? (
            (() => {
              const rarityDef = getRarityData(selectedWeapon.item.rarity || 'comum');
              const effectiveDamage = Math.round(selectedData.damage * rarityDef.damageMultiplier);
              const effectiveSell = Math.round(selectedData.sellValue * rarityDef.sellMultiplier);

              return (
                <div className="w-full flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-100">{selectedData.name}</span>
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border ${rarityDef.badgeBg} ${rarityDef.badgeBorder}`}
                          style={{ color: rarityDef.color }}
                        >
                          {rarityDef.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Tier {selectedData.tier} · Dano: {formatNumber(effectiveDamage)} ({rarityDef.damageMultiplier}x)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-emerald-400">
                        +{formatNumber(effectiveSell)} Cédulas
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onSellSelected}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Confirmar Venda (+{formatNumber(effectiveSell)} Cédulas)</span>
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="pointer-events-none py-2 flex flex-col items-center gap-1.5 text-zinc-400">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-200">
                Arraste qualquer arma aqui para vender
              </span>
              <span className="text-[11px] text-zinc-500 max-w-[200px] leading-tight">
                Ou clique em uma arma na bancada para vendê-la
              </span>
            </div>
          )}
        </div>

        {/* Guia Rápido da Tabela de Preços (Tier 1 = 2 Cédulas até Tier 15) */}
        <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400 font-semibold">
            <span>Progressão de Venda:</span>
            <span className="text-emerald-400 font-mono">Tier 1 = 2 Cédulas</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Cada fusão multiplica o valor de venda. Armas avançadas geram fortunas de Cédulas!
          </p>
        </div>
      </div>

      {/* Bench Organization Tools */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg shadow-black/40 flex flex-col gap-3">
        <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
          Ferramentas da Bancada
        </span>

        {/* Botão Preencher Bancada com Tier 1 (10x/dia grátis · Ilimitado VIP) */}
        <button
          onClick={onFillEmptyWithTier1}
          disabled={freeSlotsCount === 0 || cedulas < 2}
          className={`w-full py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
            isPremiumActive || dailyFillBenchRemaining > 0
              ? 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
          }`}
          title={
            isPremiumActive
              ? 'Preencher todos os slots livres com Tier 1 (VIP Premium: Ilimitado)'
              : `Preencher bancada com Tier 1 (${dailyFillBenchRemaining}/10 hoje · Ilimitado com VIP)`
          }
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Preencher Bancada (T1)</span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
            isPremiumActive
              ? 'bg-amber-400 text-zinc-950 border-amber-400'
              : dailyFillBenchRemaining > 0
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              : 'bg-rose-950 text-rose-300 border-rose-500/40'
          }`}>
            {isPremiumActive ? '👑 VIP' : `${dailyFillBenchRemaining}/10`}
          </span>
        </button>

        {isPremiumActive ? (
          <button
            onClick={onAutoSort}
            className="w-full py-2.5 px-3 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            title="Agrupa armas iguais lado a lado para facilitar fusões"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Organizar por Tier</span>
          </button>
        ) : (
          <button
            onClick={onOpenShop}
            className="w-full py-2.5 px-3 text-xs font-medium text-zinc-400 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition-all flex items-center justify-between cursor-pointer group"
            title="Ative o Passe Premium (3h por 10 💎) na Loja para liberar esta ferramenta"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
              <span>Auto-Organizar por Tier</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
              <Crown className="w-3 h-3 text-amber-400" />
              VIP
            </span>
          </button>
        )}

        <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-1.5 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Arraste armas iguais para fundir em Tier superior.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Use Diamantes para acelerar tempos de espera.</span>
          </div>
        </div>
      </div>

      {/* CARD MODO ECONOMIA DE ENERGIA (POWER SAVER) */}
      {onTogglePowerSaver && (
        <div className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col gap-3 shadow-lg ${
          powerSaverMode
            ? 'bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-900 border-emerald-500/50 shadow-emerald-950/20 ring-1 ring-emerald-500/30'
            : 'bg-zinc-900 border-zinc-800 shadow-black/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-300 flex items-center gap-1.5">
              {powerSaverMode ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Battery className="w-4 h-4 text-zinc-400" />
              )}
              <span>Economia de Energia</span>
            </span>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              powerSaverMode
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
            }`}>
              {powerSaverMode ? 'Ativado' : 'Desativado'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Reduz a frequência de checagem dos loops em segundo plano (como auto-crafting e forja) para poupar bateria e reduzir aquecimento em celulares.
          </p>

          <button
            onClick={onTogglePowerSaver}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              powerSaverMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 shadow-emerald-950/40'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
          >
            {powerSaverMode ? (
              <>
                <BatteryCharging className="w-4 h-4" />
                <span>Modo Eco Ativo (Clique para Desativar)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Ativar Modo Economia (Power Saver)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Regras Oficiais de Fusão e Raridade */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-lg shadow-black/40 flex flex-col gap-2.5">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Regras de Fusão da Forja</span>
        </span>

        <div className="flex flex-col gap-2 text-[11px] text-zinc-300">
          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col gap-1">
            <span className="font-bold text-emerald-400">✨ Mesma Raridade (Mesmo Tier):</span>
            <span className="text-[10px] text-zinc-400 leading-tight">
              Aumenta o Tier + Chance de Upgrade de até +2 Raridades (Comum pode ir até Rara; Incomum e superiores até +2 raridades até Primordial). Se não saltar, mantém a mesma raridade!
            </span>
          </div>

          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col gap-1">
            <span className="font-bold text-amber-400">⚡ 1 Nível de Diferença (Fusão Mista):</span>
            <span className="text-[10px] text-zinc-400 leading-tight">
              Chance cortada pela metade (ex: 50%). Se der certo, aumenta o Tier e permanece na <strong>menor raridade</strong> usada.
            </span>
          </div>

          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-rose-500/30 flex flex-col gap-1">
            <span className="font-bold text-rose-400">🚫 Diferença &gt; 1 Raridade:</span>
            <span className="text-[10px] text-zinc-400 leading-tight">
              Bloqueado! O sistema avisa as raridades aceitas (ex: Comum só funde com Comum ou Incomum).
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
};
