import React, { useState, useRef, useEffect } from 'react';
import { WeaponItem } from '../types/game';
import { getWeaponData, formatNumber, formatDuration } from '../data/weapons';
import {
  getRarityData,
  getAllowedFusionRaritiesLabel,
  getForgeTierSuccessChance,
  getFusionRarityUpgradeChance,
  getNextRarity,
} from '../data/rarities';
import { WeaponIcon } from './WeaponIcon';
import { WeaponTooltip } from './WeaponTooltip';
import { fx } from './ParticleCanvas';
import {
  Trash2,
  Sparkles,
  ArrowLeftRight,
  ArrowDown,
  Hammer,
  Zap,
  Gem,
  DollarSign,
  ShoppingBag,
  Coins,
  ShieldAlert,
  Info,
  Wand2,
} from 'lucide-react';

export interface FusionBlockedAlertInfo {
  sourceName: string;
  sourceRarity: string;
  sourceRarityLabel: string;
  sourceRarityColor: string;
  targetName: string;
  targetRarity: string;
  targetRarityLabel: string;
  targetRarityColor: string;
  allowedRaritiesLabel: string;
}

export interface FusionNotificationInfo {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'attempt' | 'warning' | 'error';
  color?: string;
}

interface WorkbenchProps {
  slots: (WeaponItem | null)[];
  selectedSlot: number | null;
  className?: string;
  diamantes?: number;
  cedulas?: number;
  freeSlotsCount?: number;
  canBuyTier1?: boolean;
  onBuyTier1?: () => void;
  onAutoMergeSameRarity?: () => void;
  autoMergeRemainingUses?: number;
  onFillEmptyWithTier1?: () => void;
  dailyFillBenchRemaining?: number;
  isPremiumActive?: boolean;
  autoCollectExpiresAt?: number;
  onSelectSlot: (index: number) => void;
  onMoveOrMerge: (fromIndex: number, toIndex: number, targetRect?: DOMRect) => void;
  onQuickSell: (index: number, event: React.MouseEvent) => void;
  onRushCraft?: (index: number, event: React.MouseEvent) => void;
  onCollectCraft?: (index: number, event?: React.MouseEvent) => void;
  onCollectAll?: () => void;
  onSellSlot?: (slotIndex: number, targetRect?: DOMRect) => void;
  rarityEnchantCharges?: number;
  onEnchantWeapon?: (slotIndex: number) => void;
  fusionBlockedAlert?: FusionBlockedAlertInfo | null;
  onDismissFusionAlert?: () => void;
  fusionNotification?: FusionNotificationInfo | null;
  onDismissFusionNotification?: () => void;
}

export const Workbench: React.FC<WorkbenchProps> = ({
  slots,
  selectedSlot,
  className = '',
  diamantes = 0,
  cedulas = 0,
  freeSlotsCount = 16,
  canBuyTier1 = false,
  onBuyTier1,
  onAutoMergeSameRarity,
  autoMergeRemainingUses = 10,
  onFillEmptyWithTier1,
  dailyFillBenchRemaining = 10,
  isPremiumActive = false,
  autoCollectExpiresAt = 0,
  rarityEnchantCharges = 0,
  onEnchantWeapon,
  onSelectSlot,
  onMoveOrMerge,
  onQuickSell,
  onRushCraft,
  onCollectCraft,
  onCollectAll,
  onSellSlot,
  fusionBlockedAlert,
  onDismissFusionAlert,
  fusionNotification,
  onDismissFusionNotification,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isOverSellZone, setIsOverSellZone] = useState<boolean>(false);
  const [isDragOverSell, setIsDragOverSell] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const slotElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  // --- Sistema de Tooltips (Hover no Desktop & Long Press no Mobile) ---
  const [hoveredSlot, setHoveredSlot] = useState<{
    index: number;
    rect: DOMRect;
  } | null>(null);
  const [pinnedTooltip, setPinnedTooltip] = useState<{
    index: number;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // Handlers para Tooltip de Hover (Desktop)
  const handleSlotMouseEnter = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedIndex !== null || (window as any).__DRAGGED_SLOT_INDEX__ !== null) return;
    const item = slots[index];
    if (!item) return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSlot({ index, rect });
    }, 140);
  };

  const handleSlotMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredSlot(null);
  };

  // Atualização em tempo real para os timers de craft/fusão
  useEffect(() => {
    const hasAnyCrafting = slots.some((s) => s?.crafting);
    if (!hasAnyCrafting) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 150);

    return () => clearInterval(interval);
  }, [slots]);

  // Emissão contínua de aura para armas de raridade 'Primordial' na bancada via ParticleCanvas
  useEffect(() => {
    const primordialIndices: number[] = [];
    slots.forEach((s, idx) => {
      if (s && s.rarity === 'primordial') {
        primordialIndices.push(idx);
      }
    });

    if (primordialIndices.length === 0) return;

    const auraInterval = setInterval(() => {
      primordialIndices.forEach((idx) => {
        const el = slotElementsRef.current[idx];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            fx.emitPrimordialAura(centerX, centerY, rect.width / 2);
          }
        }
      });
    }, 130);

    return () => clearInterval(auraInterval);
  }, [slots]);

  // --- Handlers de Drag & Drop para a Grade 4x4 ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    const item = slots[index];
    if (!item || item.crafting) {
      e.preventDefault();
      return;
    }

    // Cancelar qualquer tooltip ativa ao iniciar drag
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredSlot(null);
    setPinnedTooltip(null);

    setDraggedIndex(index);
    (window as any).__DRAGGED_SLOT_INDEX__ = index;
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'all';

    if (selectedSlot !== null) {
      onSelectSlot(-1);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsOverSellZone(false);
    setIsDragOverSell(false);
    setTimeout(() => {
      (window as any).__DRAGGED_SLOT_INDEX__ = null;
    }, 200);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    let sourceIndex = -1;
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr) {
      const parsed = parseInt(sourceIndexStr, 10);
      if (!isNaN(parsed)) sourceIndex = parsed;
    }

    if (sourceIndex < 0 && typeof (window as any).__DRAGGED_SLOT_INDEX__ === 'number') {
      sourceIndex = (window as any).__DRAGGED_SLOT_INDEX__;
    }

    setDraggedIndex(null);
    setDragOverIndex(null);

    if (sourceIndex < 0 || sourceIndex === targetIndex) return;

    if (slots[targetIndex]?.crafting || slots[sourceIndex]?.crafting) return;

    const targetElement = slotElementsRef.current[targetIndex];
    const targetRect = targetElement ? targetElement.getBoundingClientRect() : undefined;

    onMoveOrMerge(sourceIndex, targetIndex, targetRect);
    (window as any).__DRAGGED_SLOT_INDEX__ = null;
  };

  // --- Handlers de Drag & Drop para a Área de Venda Integrada ---
  const handleSellDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOverSell) setIsDragOverSell(true);
  };

  const handleSellDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSell(true);
  };

  const handleSellDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverSell(false);
  };

  const handleSellDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverSell(false);
    setIsOverSellZone(false);

    let slotIndex = -1;
    const str = e.dataTransfer.getData('text/plain');
    if (str) {
      const parsed = parseInt(str, 10);
      if (!isNaN(parsed)) slotIndex = parsed;
    }
    if (slotIndex < 0 && typeof (window as any).__DRAGGED_SLOT_INDEX__ === 'number') {
      slotIndex = (window as any).__DRAGGED_SLOT_INDEX__;
    }

    if (slotIndex >= 0 && onSellSlot) {
      const rect = e.currentTarget.getBoundingClientRect();
      onSellSlot(slotIndex, rect);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    (window as any).__DRAGGED_SLOT_INDEX__ = null;
  };

  const handleSellZoneClick = (e: React.MouseEvent) => {
    if (selectedSlot !== null && slots[selectedSlot] && !slots[selectedSlot]?.crafting && onSellSlot) {
      const rect = e.currentTarget.getBoundingClientRect();
      onSellSlot(selectedSlot, rect);
      onSelectSlot(-1);
    }
  };

  // --- Suporte a Toque Mobile (Touch Drag & Drop & Long Press Tooltip) ---
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const item = slots[index];
    if (!item) return;

    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    hasMovedRef.current = false;
    isLongPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Iniciar contagem para detecção de Pressionar Longamente (Long Press)
    longPressTimerRef.current = setTimeout(() => {
      if (!hasMovedRef.current) {
        isLongPressTriggeredRef.current = true;
        setPinnedTooltip({ index });
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(40);
          } catch (_) {}
        }
        setDraggedIndex(null);
        (window as any).__DRAGGED_SLOT_INDEX__ = null;
      }
    }, 420);

    if (!item.crafting) {
      setDraggedIndex(index);
      (window as any).__DRAGGED_SLOT_INDEX__ = index;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touchStartPos.current) {
      const dist = Math.hypot(touch.clientX - touchStartPos.current.x, touch.clientY - touchStartPos.current.y);
      if (dist > 8) {
        hasMovedRef.current = true;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }

    if (isLongPressTriggeredRef.current) {
      return;
    }

    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;

    // Feedback visual se arrastando sobre a Área de Venda
    const sellZone = elem.closest('[data-sell-zone="true"]');
    if (sellZone) {
      setIsOverSellZone(true);
      sellZone.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-950/90');
    } else {
      setIsOverSellZone(false);
      document.querySelectorAll('[data-sell-zone="true"]').forEach((el) => {
        el.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-950/90');
      });
    }

    const slotIdxStr = elem.closest('[data-slot-index]')?.getAttribute('data-slot-index');
    if (slotIdxStr !== null && slotIdxStr !== undefined) {
      const idx = parseInt(slotIdxStr, 10);
      if (!isNaN(idx)) {
        setDragOverIndex(idx);
      }
    } else {
      setDragOverIndex(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      setDraggedIndex(null);
      (window as any).__DRAGGED_SLOT_INDEX__ = null;
      touchStartPos.current = null;
      return;
    }

    if (draggedIndex === null) return;

    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const srcIdx = draggedIndex;

    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsOverSellZone(false);

    // Limpar feedback visual da Área de Venda
    document.querySelectorAll('[data-sell-zone="true"]').forEach((el) => {
      el.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-950/90');
    });

    // 1. Soltou na Área de Venda!
    const sellZone = elem?.closest('[data-sell-zone="true"]');
    if (sellZone && onSellSlot) {
      const sellRect = sellZone.getBoundingClientRect();
      onSellSlot(srcIdx, sellRect);
      touchStartPos.current = null;
      (window as any).__DRAGGED_SLOT_INDEX__ = null;
      return;
    }

    // 2. Soltou em outro slot da bancada
    const slotIdxStr = elem?.closest('[data-slot-index]')?.getAttribute('data-slot-index');
    const targetIdx = slotIdxStr !== null && slotIdxStr !== undefined ? parseInt(slotIdxStr, 10) : dragOverIndex;

    if (targetIdx !== null && !isNaN(targetIdx) && targetIdx !== srcIdx) {
      if (!slots[targetIdx]?.crafting && !slots[srcIdx]?.crafting) {
        const targetElem = slotElementsRef.current[targetIdx];
        const targetRect = targetElem ? targetElem.getBoundingClientRect() : undefined;
        onMoveOrMerge(srcIdx, targetIdx, targetRect);
      }
    } else {
      if (touchStartPos.current) {
        const dist = Math.hypot(touch.clientX - touchStartPos.current.x, touch.clientY - touchStartPos.current.y);
        if (dist < 10) {
          handleSlotClick(srcIdx);
        }
      }
    }
    touchStartPos.current = null;
    setTimeout(() => {
      (window as any).__DRAGGED_SLOT_INDEX__ = null;
    }, 200);
  };

  // --- Clique Normal (Click-to-Select & Click-to-Move/Merge & Click-to-Collect) ---
  const handleSlotClick = (index: number) => {
    if (isLongPressTriggeredRef.current) {
      return;
    }
    const item = slots[index];

    // Se o slot possui uma arma pronta para coleta, executa a coleta imediata ao clicar!
    if (item?.crafting && now >= item.crafting.endTime) {
      if (onCollectCraft) {
        onCollectCraft(index);
      }
      return;
    }

    if (selectedSlot !== null) {
      if (selectedSlot === index) {
        onSelectSlot(-1);
      } else {
        if (item?.crafting) return;

        const targetElement = slotElementsRef.current[index];
        const targetRect = targetElement ? targetElement.getBoundingClientRect() : undefined;
        onMoveOrMerge(selectedSlot, index, targetRect);
        onSelectSlot(-1);
      }
    } else {
      if (item && !item.crafting) {
        onSelectSlot(index);
      }
    }
  };

  const draggedItem = draggedIndex !== null ? slots[draggedIndex] : null;
  const selectedItem = selectedSlot !== null ? slots[selectedSlot] : null;

  const isAutoCollectActive = autoCollectExpiresAt > now;
  const autoCollectRemainingSec = isAutoCollectActive ? Math.ceil((autoCollectExpiresAt - now) / 1000) : 0;
  const readyToCollectSlotsCount = slots.filter((s) => s?.crafting && now >= s.crafting.endTime).length;

  return (
    <div className={`flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl shadow-black/50 flex flex-col justify-between select-none ${className}`}>
      
      {/* Cabeçalho da Bancada (com Botão Comprar Tier 1 e Slots Livres) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 mb-3 sm:mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base md:text-lg font-bold font-display text-zinc-100 flex items-center gap-2">
              <span>Bancada de Montagem</span>
            </h2>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-md">
              {freeSlotsCount} / 16 livres
            </span>

            {isAutoCollectActive && (
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                <span>Auto-Coleta: {formatDuration(autoCollectRemainingSec)}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
            Arraste armas iguais para fundir. Arraste para a Área de Venda abaixo para lucrar!
          </p>
        </div>

        {/* Botões de Ação no Topo da Bancada: Comprar, Fusionar, Preencher e Coletar Todas */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 flex-wrap">
          {readyToCollectSlotsCount > 0 && onCollectAll && (
            <button
              onClick={onCollectAll}
              className="px-2.5 py-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all transform active:scale-95 shrink-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-md shadow-emerald-500/30 animate-pulse cursor-pointer border border-emerald-300"
              title="Coletar todas as armas prontas da bancada"
            >
              <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Coletar ({readyToCollectSlotsCount})</span>
            </button>
          )}

          {onBuyTier1 && (
            <button
              onClick={onBuyTier1}
              disabled={!canBuyTier1}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all transform active:scale-95 shrink-0 ${
                canBuyTier1
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-75'
              }`}
              title="Comprar Tier 1 por 2 Cédulas"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Comprar</span>
            </button>
          )}

          {onAutoMergeSameRarity && (
            <button
              onClick={onAutoMergeSameRarity}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all transform active:scale-95 shrink-0 cursor-pointer ${
                isPremiumActive || autoMergeRemainingUses > 0
                  ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-zinc-950 shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400/40'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-750'
              }`}
              title={
                isPremiumActive
                  ? 'Auto-Fusão da mesma raridade em lote (VIP Premium: Ilimitado!)'
                  : `Auto-Fusão da mesma raridade (${autoMergeRemainingUses}/10 hoje · Ilimitado com VIP)`
              }
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Fusionar</span>
              <span className={`font-mono text-[9px] px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5 ${
                isPremiumActive
                  ? 'bg-amber-400 text-zinc-950'
                  : autoMergeRemainingUses > 0
                  ? 'bg-zinc-950/40 text-cyan-200'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}>
                {isPremiumActive ? '👑 VIP' : `${autoMergeRemainingUses}/10`}
              </span>
            </button>
          )}

          {onFillEmptyWithTier1 && (
            <button
              onClick={onFillEmptyWithTier1}
              disabled={freeSlotsCount === 0 || cedulas < 2}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all transform active:scale-95 shrink-0 cursor-pointer ${
                freeSlotsCount === 0 || cedulas < 2
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-75'
                  : isPremiumActive || dailyFillBenchRemaining > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
              title={
                isPremiumActive
                  ? 'Preencher bancada com Tier 1 (VIP Premium: Ilimitado!)'
                  : `Preencher bancada com Tier 1 (${dailyFillBenchRemaining}/10 hoje · Ilimitado com VIP)`
              }
            >
              <span>Preencher</span>
              <span className={`font-mono text-[9px] px-1 py-0.2 rounded font-extrabold flex items-center gap-0.5 ${
                isPremiumActive
                  ? 'bg-amber-400 text-zinc-950'
                  : dailyFillBenchRemaining > 0
                  ? 'bg-amber-950/60 text-amber-300'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}>
                {isPremiumActive ? '👑 VIP' : `${dailyFillBenchRemaining}/10`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER DE STATUS / FEEDBACK DE FUSÃO (Visível por no mínimo 2.5s) */}
      {fusionNotification && (
        <div
          className={`mb-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 flex items-center justify-between gap-3 shadow-xl animate-fadeIn ${
            fusionNotification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-100 shadow-rose-950/40'
              : fusionNotification.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-950/40'
              : fusionNotification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100 shadow-emerald-950/40'
              : 'bg-zinc-950/95 border-amber-400/80 text-zinc-100 shadow-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center shrink-0">
              {fusionNotification.type === 'error' ? (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              ) : fusionNotification.type === 'warning' ? (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              ) : fusionNotification.type === 'success' ? (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              )}
            </div>
            <div>
              <div
                className="text-xs sm:text-sm font-black uppercase tracking-wide flex items-center gap-1.5"
                style={{ color: fusionNotification.color || undefined }}
              >
                {fusionNotification.title}
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5">
                {fusionNotification.message}
              </p>
            </div>
          </div>
          {onDismissFusionNotification && (
            <button
              onClick={onDismissFusionNotification}
              className="text-zinc-400 hover:text-white px-2 py-1 rounded bg-black/30 border border-white/10 text-xs font-bold transition-colors cursor-pointer"
              title="Fechar aviso"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* BANNER DE ALERTA: FUSÃO BLOQUEADA (Diferença > 1 Raridade) */}
      {fusionBlockedAlert && (
        <div className="mb-3 p-3 sm:p-4 bg-gradient-to-r from-rose-950/95 via-zinc-950 to-rose-950/95 border-2 border-rose-500/80 rounded-xl sm:rounded-2xl shadow-2xl shadow-rose-950/60 flex flex-col gap-2.5 animate-fadeIn text-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase text-rose-200 tracking-tight leading-tight">
                  Fusão Bloqueada: Diferença Superior a 1 Raridade!
                </h4>
                <p className="text-[10px] sm:text-[11px] text-zinc-400">
                  Regra: Só é permitido fundir com a mesma raridade ou exatamente 1 raridade acima/abaixo.
                </p>
              </div>
            </div>
            {onDismissFusionAlert && (
              <button
                onClick={onDismissFusionAlert}
                className="text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                title="Fechar aviso"
              >
                ✕
              </button>
            )}
          </div>

          <div className="p-2.5 bg-zinc-950/90 rounded-xl border border-rose-500/30 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 text-zinc-300">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400">Arma Selecionada:</span>
                <span className="font-bold text-zinc-100">{fusionBlockedAlert.sourceName}</span>
                <span
                  className="font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded border"
                  style={{
                    color: fusionBlockedAlert.sourceRarityColor,
                    borderColor: `${fusionBlockedAlert.sourceRarityColor}60`,
                    backgroundColor: `${fusionBlockedAlert.sourceRarityColor}15`,
                  }}
                >
                  {fusionBlockedAlert.sourceRarityLabel}
                </span>
              </div>
              <span className="text-rose-400 font-extrabold text-xs">
                ❌ Incompatível com {fusionBlockedAlert.targetRarityLabel}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-1">
              <span className="text-amber-300 font-bold text-[11px] sm:text-xs">
                💡 Raridades que aceitam fusão com {fusionBlockedAlert.sourceRarityLabel}:
              </span>
              <div className="font-mono font-black text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 p-2 rounded-lg text-center text-xs shadow-inner">
                👉 {fusionBlockedAlert.allowedRaritiesLabel}
              </div>
              <p className="text-[10px] text-zinc-400 text-center mt-0.5">
                Exemplos corretos: Comum ⇄ Incomum, Incomum ⇄ Rara, Rara ⇄ Épica.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade 4x4 (16 Slots) */}
      <div
        className="grid grid-cols-4 gap-2 sm:gap-2.5 md:gap-3.5 aspect-square max-w-[540px] mx-auto w-full touch-none"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slots.map((item, index) => {
          const isSelected = selectedSlot === index;
          const isBeingDragged = draggedIndex === index;
          const isHoveredTarget = dragOverIndex === index && draggedIndex !== index;

          const isCrafting = !!item?.crafting;
          const craft = item?.crafting;
          const isReadyToCollect = isCrafting && craft && now >= craft.endTime;

          // Cálculo do progresso e tempo restante
          let remainingSec = 0;
          let progressPercent = 0;
          if (craft) {
            const elapsed = Math.max(0, now - craft.startTime);
            progressPercent = Math.min(100, (elapsed / craft.durationMs) * 100);
            remainingSec = Math.max(0, Math.ceil((craft.endTime - now) / 1000));
          }

          // Item sendo comparado
          const activeSource = draggedItem || selectedItem;
          const activeSourceIdx = draggedIndex !== null ? draggedIndex : selectedSlot;

          const isSameTierAsSource =
            activeSource &&
            item &&
            !isCrafting &&
            !activeSource.crafting &&
            activeSourceIdx !== index &&
            item.tier === activeSource.tier;

          // Verificação de compatibilidade de raridade (máximo 1 nível de diferença)
          const defSource = activeSource ? getRarityData(activeSource.rarity || 'comum') : null;
          const defTarget = item ? getRarityData(item.rarity || 'comum') : null;
          const rarityDiff = defSource && defTarget ? Math.abs(defSource.order - defTarget.order) : 0;
          const isFusionAllowed = isSameTierAsSource && rarityDiff <= 1;
          const isFusionBlocked = isSameTierAsSource && rarityDiff > 1;

          const isDiffTierAsSource =
            activeSource &&
            item &&
            !isCrafting &&
            !activeSource.crafting &&
            activeSourceIdx !== index &&
            item.tier !== activeSource.tier;

          const data = item ? getWeaponData(item.tier) : null;
          const itemRarity = item?.rarity || 'comum';
          const rarityDef = getRarityData(itemRarity);
          const hasBonus = rarityDef.order > 0;
          const isPrimordial = itemRarity === 'primordial';
          const isEnchanted = !!(item?.enchantExpiresAt && item.enchantExpiresAt > now);
          const enchantRemainingSec = isEnchanted ? Math.ceil((item!.enchantExpiresAt! - now) / 1000) : 0;

          return (
            <div
              key={index}
              ref={(el) => {
                slotElementsRef.current[index] = el;
              }}
              data-slot-index={index}
              draggable={!!item && !isCrafting}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onClick={() => handleSlotClick(index)}
              onMouseEnter={(e) => handleSlotMouseEnter(index, e)}
              onMouseLeave={handleSlotMouseLeave}
              className={`relative rounded-xl md:rounded-2xl transition-all duration-150 flex flex-col items-center justify-center cursor-pointer select-none group overflow-hidden ${
                isReadyToCollect
                  ? 'bg-gradient-to-b from-emerald-950/80 via-zinc-900 to-zinc-950 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/50 animate-ready-glow scale-[1.02]'
                  : isCrafting
                  ? 'bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-900 border-2 border-amber-500/60 shadow-lg shadow-amber-950/30'
                  : item
                  ? isPrimordial
                    ? 'bg-gradient-to-b from-purple-950/80 via-zinc-900 to-zinc-950 border-2 border-fuchsia-400 shadow-2xl shadow-fuchsia-500/40 animate-primordial-card'
                    : isEnchanted
                    ? 'bg-gradient-to-b from-fuchsia-950/80 via-zinc-900 to-zinc-950 border-2 border-fuchsia-400 shadow-2xl shadow-fuchsia-500/50 animate-enchantment-glow'
                    : hasBonus
                    ? `bg-gradient-to-b ${data?.bgGradient} border-2 ${rarityDef.badgeBorder} shadow-lg`
                    : `bg-gradient-to-b ${data?.bgGradient} border-2 ${data?.borderColor}`
                  : 'bg-zinc-950/70 border-2 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-950'
              } ${
                isBeingDragged ? 'opacity-40 scale-95 border-dashed border-amber-500/60' : ''
              } ${
                isSelected
                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 shadow-lg shadow-amber-500/30 scale-[1.02]'
                  : ''
              } ${
                isFusionAllowed && !isHoveredTarget
                  ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-950 shadow-xl shadow-emerald-500/50 animate-fusion-compatible z-10'
                  : ''
              } ${
                isFusionBlocked && !isHoveredTarget
                  ? 'ring-2 ring-rose-500/70 border-rose-500/50 opacity-50'
                  : ''
              } ${
                activeSource && !isFusionAllowed && !isFusionBlocked && !isSelected && !isBeingDragged && item
                  ? 'opacity-45 grayscale-[20%]'
                  : ''
              } ${
                isHoveredTarget && isFusionAllowed
                  ? 'ring-4 ring-emerald-400 border-emerald-300 scale-[1.08] bg-emerald-950/80 z-20 shadow-2xl shadow-emerald-500/70'
                  : ''
              } ${
                isHoveredTarget && isFusionBlocked
                  ? 'ring-4 ring-rose-500 border-rose-400 scale-[1.06] bg-rose-950/90 z-20 shadow-2xl shadow-rose-500/50'
                  : ''
              } ${
                isHoveredTarget && isDiffTierAsSource
                  ? 'ring-3 ring-sky-400 border-sky-400 scale-[1.04] bg-sky-950/60 z-20 shadow-xl shadow-sky-500/40'
                  : ''
              } ${
                isHoveredTarget && !item
                  ? 'ring-3 ring-amber-400 border-amber-400 scale-[1.03] bg-amber-950/40 z-20'
                  : ''
              }`}
              style={{
                boxShadow: isReadyToCollect
                  ? undefined
                  : item && !isCrafting
                  ? isPrimordial
                    ? '0 0 25px rgba(239, 68, 68, 0.6), 0 0 45px rgba(168, 85, 247, 0.45), inset 0 0 16px rgba(253, 224, 71, 0.35)'
                    : hasBonus
                    ? `0 0 18px ${rarityDef.glowColor}, inset 0 0 8px ${rarityDef.glowColor}`
                    : `0 0 15px ${data?.glowColor}`
                  : 'none',
              }}
            >
              {/* Slot Number Badge */}
              <span className="absolute top-1 left-1.5 text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors pointer-events-none">
                #{index + 1}
              </span>

              {/* Indicador de Compatibilidade de Fusão em Destaque */}
              {isFusionAllowed && (
                <div className="absolute top-1 right-1 z-30 pointer-events-none flex items-center gap-0.5 bg-emerald-950/95 border border-emerald-400 text-emerald-300 px-1 py-0.2 rounded text-[7.5px] font-mono font-black shadow-md shadow-emerald-500/50 animate-bounce">
                  <Zap className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                  <span>FUSÃO OK</span>
                </div>
              )}

              {/* Indicador de Encantamento Ativo (+1 Raridade por 1 Hora) */}
              {isEnchanted && !isFusionAllowed && (
                <div className="absolute top-1 right-1 z-30 pointer-events-none flex items-center gap-0.5 bg-fuchsia-950/95 border border-fuchsia-400 text-fuchsia-300 px-1 py-0.2 rounded text-[7.5px] font-mono font-black shadow-md shadow-fuchsia-500/50 animate-pulse">
                  <Wand2 className="w-2.5 h-2.5 text-fuchsia-300" />
                  <span>{formatDuration(enchantRemainingSec)}</span>
                </div>
              )}

              {item && data ? (
                isCrafting ? (
                  isReadyToCollect ? (
                    /* ========================================================================= */
                    /* ESTADO PRONTO PARA COLETA (Glow Pulsante + Botão COLETAR)                 */
                    /* ========================================================================= */
                    <div className="w-full h-full p-2 flex flex-col items-center justify-between pointer-events-none">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1 rounded">
                          T{craft?.targetTier || item.tier}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-emerald-300 flex items-center gap-0.5 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          <span>PRONTA!</span>
                        </span>
                      </div>

                      <div className="relative my-auto flex items-center justify-center">
                        <WeaponIcon
                          tier={craft?.targetTier || item.tier}
                          size={34}
                          className="animate-pulse filter drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                        />
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
                        </div>
                      </div>

                      <div className="w-full flex flex-col gap-1">
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-emerald-500/40">
                          <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full" />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCollectCraft?.(index, e);
                          }}
                          className="pointer-events-auto w-full py-0.5 px-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 border border-emerald-300 text-zinc-950 font-black text-[9px] rounded shadow-md shadow-emerald-500/40 flex items-center justify-center gap-1 transition-all transform active:scale-95 cursor-pointer animate-pulse"
                          title="Coletar arma forjada/fundida"
                        >
                          <Sparkles className="w-2.5 h-2.5 fill-zinc-950" />
                          <span>COLETAR</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ========================================================================= */
                    /* ESTADO DE CONSTRUÇÃO / FORJA EM ANDAMENTO                                 */
                    /* ========================================================================= */
                    <div className="w-full h-full p-2 flex flex-col items-center justify-between pointer-events-none">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1 rounded">
                            T{item.tier}
                          </span>
                          {craft && craft.type === 'fusion' && (
                            <div className="flex items-center gap-0.5">
                              {craft.forgeChance !== undefined && (
                                <span
                                  className="text-[7.5px] font-mono font-extrabold px-1 rounded border leading-tight bg-sky-950/80 text-sky-300 border-sky-500/40"
                                  title={`Chance da Forja de aumentar o Tier: ${craft.forgeChance}%`}
                                >
                                  ⚒️{craft.forgeChance}%
                                </span>
                              )}
                              {craft.effectiveChance !== undefined && (
                                <span
                                  className={`text-[7.5px] font-mono font-extrabold px-1 rounded border leading-tight ${
                                    craft.isMixedFusion
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                  }`}
                                  title={
                                    craft.isMixedFusion
                                      ? `Fusão Mista: ${craft.effectiveChance}% de chance (metade da chance do item de menor raridade)`
                                      : `Fusão Mesma Raridade: ${craft.effectiveChance}% de chance integral`
                                  }
                                >
                                  ⚡{craft.effectiveChance}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-amber-300 flex items-center gap-0.5">
                          <Hammer className="w-2.5 h-2.5 animate-bounce" />
                          {remainingSec}s
                        </span>
                      </div>

                      <div className="relative my-auto flex items-center justify-center">
                        <WeaponIcon
                          tier={item.tier}
                          size={32}
                          className="opacity-40 animate-pulse grayscale"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-mono font-bold text-amber-200 bg-black/60 px-1 py-0.5 rounded border border-amber-500/30">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full flex flex-col gap-1">
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-amber-500/30">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-150 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {onRushCraft && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRushCraft(index, e);
                            }}
                            className="pointer-events-auto w-full py-0.5 px-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 rounded text-[9px] font-bold text-cyan-300 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                            title="Acelerar imediatamente por 1 Diamante"
                          >
                            <Gem className="w-2 h-2 text-cyan-400" />
                            <span>1 💎 Acelerar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  /* ========================================================================= */
                  /* ESTADO PRONTO / ARMA MONTADA                                              */
                  /* ========================================================================= */
                  <div className="w-full h-full p-1.5 sm:p-2 flex flex-col items-center justify-between pointer-events-none">
                    {/* Linha Superior: Selo de Raridade, Brilho Indicador (Glow Icon) e Tier */}
                    {(() => {
                      const isHighRarity = rarityDef.order >= 2;
                      const effectiveDamage = Math.round(data.damage * rarityDef.damageMultiplier);

                      return (
                        <>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded border leading-none ${rarityDef.badgeBorder} ${rarityDef.badgeBg}`}
                                style={{ color: rarityDef.color }}
                              >
                                {rarityDef.label.substring(0, 3)}
                              </span>

                              {/* Indicador Visual de 'Brilho' (Glow Icon) para Itens com Raridade Superior a Comum ou Bônus */}
                              {hasBonus && (
                                <span
                                  className={`flex items-center justify-center p-0.5 rounded-full transition-all duration-200 group-hover:scale-125 animate-glow-icon ${
                                    isPrimordial
                                      ? 'bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-purple-500/40 border border-amber-300 shadow-md shadow-amber-400/50'
                                      : ''
                                  }`}
                                  style={{
                                    backgroundColor: isPrimordial ? undefined : `${rarityDef.color}30`,
                                    color: isPrimordial ? '#fde047' : rarityDef.color,
                                    boxShadow: `0 0 8px ${rarityDef.glowColor}`,
                                  }}
                                  title={`✨ Item Valioso (${rarityDef.label}): +${Math.round((rarityDef.damageMultiplier - 1) * 100)}% Dano e ${rarityDef.critChance}% Crítico!`}
                                >
                                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                                </span>
                              )}
                            </div>

                            <span
                              className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded text-zinc-950 shadow-sm flex items-center gap-0.5"
                              style={{ backgroundColor: isPrimordial ? '#facc15' : data.accentColor }}
                            >
                              {isPrimordial && <span className="text-[8px]">👑</span>}
                              <span>T{item.tier}</span>
                            </span>
                          </div>

                          {/* Ícone da Arma com Brilho Dinâmico e Aura Exclusiva */}
                          <div className="relative my-auto flex items-center justify-center py-1">
                            {/* Brilho adicional flutuante em armas valiosas */}
                            {hasBonus && (
                              <div
                                className="absolute -top-1.5 -right-1.5 pointer-events-none flex items-center justify-center z-10"
                                title="Bônus Ativo"
                              >
                                <Sparkles
                                  className={`w-3.5 h-3.5 ${isPrimordial ? 'animate-bounce text-amber-300' : isHighRarity ? 'animate-bounce' : 'animate-pulse'}`}
                                  style={{
                                    color: isPrimordial ? '#fde047' : rarityDef.color,
                                    filter: `drop-shadow(0 0 6px ${rarityDef.glowColor})`,
                                  }}
                                />
                              </div>
                            )}

                            {/* Aura Específica de Fundo para Primordial */}
                            {isPrimordial && (
                              <div
                                className="absolute -inset-2 rounded-full blur-md opacity-75 animate-pulse pointer-events-none"
                                style={{
                                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(250, 204, 21, 0.3) 80%, transparent 100%)',
                                }}
                              />
                            )}

                            <WeaponIcon
                              tier={item.tier}
                              size={40}
                              className={`transition-transform duration-200 group-hover:scale-110 ${
                                isPrimordial
                                  ? 'filter drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]'
                                  : hasBonus
                                  ? `filter drop-shadow-[0_0_8px_${rarityDef.glowColor}]`
                                  : 'drop-shadow-md'
                              }`}
                            />
                          </div>

                          {/* Informações da Arma: Nome, Dano e Venda Rápida */}
                          <div className="w-full flex flex-col items-center gap-0.5">
                            <span className={`text-[10px] sm:text-[11px] font-bold truncate w-full text-center leading-tight ${
                              isPrimordial ? 'text-amber-200 font-extrabold' : 'text-zinc-100'
                            }`}>
                              {data.name}
                            </span>

                            {/* Atributo: Dano com Multiplicador de Raridade */}
                            <div className="flex items-center gap-1 text-[9px] font-mono flex-wrap justify-center">
                              <span className="text-rose-400 font-bold">⚔️ {effectiveDamage}</span>
                              {isEnchanted ? (
                                <span
                                  className="font-bold text-[7.5px] px-1 py-0.1 rounded border flex items-center gap-0.5 bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50"
                                  title={`Arma Encantada (+1 Raridade por 1h): ${formatDuration(enchantRemainingSec)} restantes`}
                                >
                                  <Wand2 className="w-2 h-2 text-fuchsia-400" />
                                  <span>+1 Raridade</span>
                                </span>
                              ) : hasBonus ? (
                                <span
                                  className="font-bold text-[8px] px-1 py-0.1 rounded border flex items-center gap-0.5"
                                  style={{
                                    color: isPrimordial ? '#fde047' : rarityDef.color,
                                    borderColor: `${rarityDef.color}50`,
                                    backgroundColor: `${rarityDef.color}18`,
                                  }}
                                  title={`Multiplicador de ${rarityDef.label}: ${rarityDef.damageMultiplier}x (+${Math.round((rarityDef.damageMultiplier - 1) * 100)}% Dano)`}
                                >
                                  <span>+{Math.round((rarityDef.damageMultiplier - 1) * 100)}%</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Botão de Venda Rápida */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickSell(index, e);
                      }}
                      className="pointer-events-auto absolute bottom-1 right-1 p-1 rounded-md bg-zinc-900/90 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
                      title="Vender rapidamente (ou arraste para a Área de Venda abaixo)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              ) : (
                /* Slot Vazio */
                <div className="flex flex-col items-center justify-center text-zinc-700 group-hover:text-zinc-500 transition-colors pointer-events-none">
                  <span className="text-2xl font-light opacity-30 group-hover:opacity-60">+</span>
                </div>
              )}

              {/* Overlay Visual quando é Alvo de Drag (Mesmo Tier vs Tier Diferente) */}
              {isHoveredTarget && activeSource && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center p-2 backdrop-blur-[1px] animate-fadeIn">
                  {isSameTierAsSource ? (
                    isFusionBlocked ? (
                      <div className="flex flex-col items-center text-rose-300 text-center px-1">
                        <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight text-rose-300">
                          BLOQUEADO!
                        </span>
                        <span className="text-[7.5px] font-mono text-zinc-300 leading-tight">
                          Máx 1 nível de diferença
                        </span>
                        <div className="text-[7.5px] font-mono text-amber-300 font-bold bg-zinc-950/90 px-1 py-0.5 rounded border border-amber-500/30 mt-0.5 max-w-[120px] truncate">
                          {defSource?.label} só aceita {getAllowedFusionRaritiesLabel(activeSource?.rarity || 'comum')}
                        </div>
                        <span className="text-[7px] font-mono text-rose-400 line-through">
                          Incompatível com {defTarget?.label}
                        </span>
                      </div>
                    ) : item.tier < 15 ? (
                      (() => {
                        const forgeChance = getForgeTierSuccessChance(item.tier);
                        const fusionChance = getFusionRarityUpgradeChance(
                          activeSource.rarity || 'comum',
                          item.rarity || 'comum'
                        );
                        return (
                          <div className="flex flex-col items-center text-emerald-300 text-center px-1">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-spin" />
                            <span className="text-[9px] md:text-xs font-black uppercase tracking-tight">
                              {rarityDiff === 0 ? 'FUSÃO!' : 'FUSÃO MISTA!'}
                            </span>
                            <span className="text-[8.5px] font-mono text-emerald-200 font-bold">
                              → Tier {item.tier + 1}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-0.5 w-full">
                              <span className="text-[7.5px] sm:text-[8px] font-mono font-bold px-1 py-0.2 rounded border bg-sky-950/90 text-sky-300 border-sky-500/40">
                                ⚒️ Forja (+1T): {forgeChance}%
                              </span>
                              <span
                                className={`text-[7.5px] sm:text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                  rarityDiff === 0
                                    ? 'text-emerald-300 bg-emerald-950/90 border-emerald-500/40'
                                    : 'text-amber-300 bg-amber-950/90 border-amber-500/40'
                                }`}
                              >
                                ⚡ Fusão: {fusionChance}% {rarityDiff === 0 ? '(Integral)' : '(½ Menor)'}
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center text-amber-300">
                        <span className="text-[10px] font-bold">TIER 15</span>
                        <span className="text-[8px] text-zinc-400">Nível Máximo</span>
                      </div>
                    )
                  ) : isDiffTierAsSource ? (
                    <div className="flex flex-col items-center text-sky-400">
                      <ArrowLeftRight className="w-5 h-5 text-sky-300" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-tight">
                        INVERTER
                      </span>
                      <span className="text-[8px] font-mono text-sky-200">
                        T{activeSource.tier} ⇄ T{item.tier}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-amber-400">
                      <ArrowDown className="w-4 h-4 text-amber-300" />
                      <span className="text-[10px] font-bold uppercase">
                        MOVER
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE ENCANTAMENTO DE RARIDADE (ATIVADA QUANDO UMA ARMA ESTÁ SELECIONADA) */}
      {/* ========================================================================= */}
      {selectedSlot !== null && selectedItem && !selectedItem.crafting && onEnchantWeapon && (
        (() => {
          const sRarity = selectedItem.rarity || 'comum';
          const sRarityDef = getRarityData(sRarity);
          const nextRarity = getNextRarity(sRarity);
          const nextRarityDef = nextRarity ? getRarityData(nextRarity) : null;
          const isSlotEnchanted = !!(selectedItem.enchantExpiresAt && selectedItem.enchantExpiresAt > now);
          const slotEnchantSec = isSlotEnchanted ? Math.ceil((selectedItem.enchantExpiresAt! - now) / 1000) : 0;
          const canAfford = (rarityEnchantCharges || 0) > 0 || diamantes >= 1;

          if (sRarity === 'primordial' && !isSlotEnchanted) return null;

          return (
            <div className="w-full max-w-[540px] mx-auto mt-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 border-fuchsia-400/80 bg-gradient-to-r from-fuchsia-950/95 via-purple-950/90 to-zinc-950 shadow-xl shadow-fuchsia-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center shrink-0 shadow-md">
                  <Wand2 className="w-5 h-5 text-fuchsia-300 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-fuchsia-200 uppercase tracking-wide">
                      {isSlotEnchanted ? 'Encantamento Ativo' : 'Encantamento de Raridade'}
                    </span>
                    {isSlotEnchanted ? (
                      <span className="text-[10px] font-mono font-bold text-fuchsia-300 bg-black/60 px-1.5 py-0.2 rounded border border-fuchsia-400/40 animate-pulse">
                        ⏳ {formatDuration(slotEnchantSec)}
                      </span>
                    ) : nextRarityDef ? (
                      <span
                        className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border"
                        style={{
                          color: nextRarityDef.color,
                          borderColor: `${nextRarityDef.color}60`,
                          backgroundColor: `${nextRarityDef.color}15`,
                        }}
                      >
                        {sRarityDef.label} ➔ {nextRarityDef.label}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] sm:text-xs text-zinc-300">
                    {isSlotEnchanted
                      ? `Arma operando como ${sRarityDef.label}! Você pode estender por +1h.`
                      : nextRarityDef
                      ? `Eleva para ${nextRarityDef.label} (+Dano, +Crítico e fusão no nível alto) por 1h!`
                      : 'Raridade máxima'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onEnchantWeapon(selectedSlot)}
                disabled={!canAfford}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-all transform active:scale-95 cursor-pointer shadow-lg ${
                  canAfford
                    ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 text-zinc-950 shadow-fuchsia-500/30 font-black'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
                }`}
                title={isSlotEnchanted ? 'Estender Encantamento (+1h)' : 'Encantar arma (+1 Raridade por 1h)'}
              >
                <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
                <span>
                  {isSlotEnchanted
                    ? `Renovar (+1h) · ${(rarityEnchantCharges || 0) > 0 ? '1 Orbe' : '1 💎'}`
                    : (rarityEnchantCharges || 0) > 0
                    ? `Usar 1 Orbe (${rarityEnchantCharges} disp.)`
                    : 'Encantar (1 💎)'}
                </span>
              </button>
            </div>
          );
        })()
      )}

      {/* ========================================================================= */}
      {/* ÁREA DE VENDA INTEGRADA E PERMANENTE (VISÍVEL DIRETAMENTE ABAIXO DA GRADE) */}
      {/* ========================================================================= */}
      <div
        id="workbench-sell-dropzone"
        data-sell-zone="true"
        onDragOver={handleSellDragOver}
        onDragEnter={handleSellDragEnter}
        onDragLeave={handleSellDragLeave}
        onDrop={handleSellDrop}
        onClick={handleSellZoneClick}
        className={`w-full max-w-[540px] mx-auto mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-150 flex items-center justify-between gap-3 select-none cursor-pointer ${
          isOverSellZone || isDragOverSell
            ? 'bg-emerald-950/90 border-emerald-400 ring-4 ring-emerald-500/40 shadow-2xl shadow-emerald-500/30 scale-[1.02]'
            : selectedItem && !selectedItem.crafting
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40 hover:bg-emerald-950/50'
            : 'bg-zinc-950/80 border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-950'
        }`}
        title="Arraste uma arma aqui para vendê-la ou clique para vender a arma selecionada"
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold shrink-0 transition-transform ${
              isOverSellZone || isDragOverSell
                ? 'bg-emerald-500 text-zinc-950 scale-110 shadow-lg shadow-emerald-500/40'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            }`}
          >
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex flex-col text-left">
            {isOverSellZone || isDragOverSell ? (
              <>
                <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wide animate-pulse">
                  ✨ Solte para Vender Agora!
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-200">
                  Cédulas creditadas instantaneamente
                </span>
              </>
            ) : selectedItem && !selectedItem.crafting ? (
              (() => {
                const sData = getWeaponData(selectedItem.tier);
                const rDef = getRarityData(selectedItem.rarity || 'comum');
                const val = Math.round(sData.sellValue * rDef.sellMultiplier);
                return (
                  <>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-zinc-100">
                        Vender {sData.name}
                      </span>
                      <span
                        className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border"
                        style={{ color: rDef.color, borderColor: `${rDef.color}60`, backgroundColor: `${rDef.color}15` }}
                      >
                        {rDef.label}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-0.5">
                      Toque aqui ou arraste para vender por <strong className="text-emerald-400 font-bold">+{val} Cédulas</strong>
                    </span>
                  </>
                );
              })()
            ) : (
              <>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>Área de Venda</span>
                  <span className="text-[10px] font-normal text-zinc-400 lowercase hidden sm:inline">
                    (retorno em cédulas)
                  </span>
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                  Segure e arraste qualquer arma aqui para vender
                </span>
              </>
            )}
          </div>
        </div>

        {/* Botão de Ação / Badge na Direita */}
        <div className="pointer-events-none shrink-0">
          {selectedItem && !selectedItem.crafting ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vender</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Trash2 className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Solte aqui</span>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé da Bancada com Instruções */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <Hammer className="w-3 h-3" />
            <span>T1 (5s), T2 (9s), T3 (17s)...</span>
          </span>
          <span className="text-zinc-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            <Gem className="w-3 h-3" />
            <span>1 💎 Acelerar</span>
          </span>
          <span className="text-zinc-600 hidden sm:inline">·</span>
          <span className="text-amber-300/80 font-medium hidden md:inline">
            💡 Passe o mouse ou segure na arma para ver atributos
          </span>
        </div>

        <span className="font-mono text-zinc-500 text-[10px] sm:text-[11px]">
          Segure e arraste para fundir ou vender
        </span>
      </div>

      {/* Tooltip ao Passar o Mouse (Hover no Desktop) */}
      {hoveredSlot !== null && !pinnedTooltip && draggedIndex === null && slots[hoveredSlot.index] && (
        <WeaponTooltip
          item={slots[hoveredSlot.index]!}
          slotIndex={hoveredSlot.index}
          targetRect={hoveredSlot.rect}
          isPinned={false}
        />
      )}

      {/* Tooltip Fixada por Toque Longo (Mobile Long-Press) */}
      {pinnedTooltip !== null && slots[pinnedTooltip.index] && (
        <WeaponTooltip
          item={slots[pinnedTooltip.index]!}
          slotIndex={pinnedTooltip.index}
          isPinned={true}
          onClose={() => setPinnedTooltip(null)}
        />
      )}

    </div>
  );
};
