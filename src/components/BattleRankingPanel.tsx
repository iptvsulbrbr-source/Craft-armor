import React, { useState, useEffect } from 'react';
import { WeaponItem } from '../types/game';
import { getWeaponData } from '../data/weapons';
import { getRarityData } from '../data/rarities';
import { WeaponIcon } from './WeaponIcon';
import { Trophy, Medal, Swords, Calendar, Trash2, Shield, Flame, Star, Sparkles } from 'lucide-react';

export interface BattleRankingEntry {
  id: string;
  stage: number;
  monsterIndex: number;
  timestamp: number;
  date: string;
  weaponName: string;
  weaponTier: number;
  weaponRarity: string;
}

const STORAGE_RANKING_KEY = 'armory_craft_battle_ranking_top10';

interface BattleRankingPanelProps {
  currentStage: number;
  monsterIndex: number;
  equippedWeapon: WeaponItem | null;
}

export const BattleRankingPanel: React.FC<BattleRankingPanelProps> = ({
  currentStage,
  monsterIndex,
  equippedWeapon,
}) => {
  const [rankingList, setRankingList] = useState<BattleRankingEntry[]>([]);

  // Carregar do LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RANKING_KEY);
      if (saved) {
        const parsed: BattleRankingEntry[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRankingList(parsed);
        }
      } else {
        // Inicializar com o recorde atual do jogador
        const initialRecord = createEntry(currentStage, monsterIndex, equippedWeapon);
        setRankingList([initialRecord]);
        localStorage.setItem(STORAGE_RANKING_KEY, JSON.stringify([initialRecord]));
      }
    } catch (e) {
      console.error('Falha ao carregar ranking:', e);
    }
  }, []);

  function createEntry(stage: number, mIndex: number, weapon: WeaponItem | null): BattleRankingEntry {
    const d = new Date();
    const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    
    let wName = 'Desarmado';
    let wTier = 0;
    let wRarity = 'comum';

    if (weapon) {
      const wData = getWeaponData(weapon.tier);
      wName = wData.name;
      wTier = weapon.tier;
      wRarity = weapon.rarity || 'comum';
    }

    return {
      id: `run-${Date.now()}-${Math.random()}`,
      stage,
      monsterIndex: mIndex,
      timestamp: Date.now(),
      date: dateFormatted,
      weaponName: wName,
      weaponTier: wTier,
      weaponRarity: wRarity,
    };
  }

  // Atualizar ranking quando o jogador avança de fase ou bate recorde
  useEffect(() => {
    if (currentStage <= 0) return;

    setRankingList((prevList) => {
      // Verificar se já existe uma entrada com esse estágio ou superior
      const existingBestForStage = prevList.find((e) => e.stage === currentStage);

      let updatedList = [...prevList];

      if (existingBestForStage) {
        if (monsterIndex > existingBestForStage.monsterIndex) {
          // Atualiza o progresso de monstros dessa fase
          updatedList = updatedList.map((entry) =>
            entry.id === existingBestForStage.id
              ? {
                  ...entry,
                  monsterIndex,
                  timestamp: Date.now(),
                  weaponName: equippedWeapon ? getWeaponData(equippedWeapon.tier).name : entry.weaponName,
                  weaponTier: equippedWeapon ? equippedWeapon.tier : entry.weaponTier,
                  weaponRarity: equippedWeapon ? (equippedWeapon.rarity || 'comum') : entry.weaponRarity,
                }
              : entry
          );
        }
      } else {
        // Nova fase alcançada! Adiciona no ranking
        const newEntry = createEntry(currentStage, monsterIndex, equippedWeapon);
        updatedList.push(newEntry);
      }

      // Ordenar por Maior Estágio > Maior Monstro > Timestamp mais recente
      updatedList.sort((a, b) => {
        if (b.stage !== a.stage) return b.stage - a.stage;
        if (b.monsterIndex !== a.monsterIndex) return b.monsterIndex - a.monsterIndex;
        return b.timestamp - a.timestamp;
      });

      // Manter apenas o TOP 10
      const top10 = updatedList.slice(0, 10);
      try {
        localStorage.setItem(STORAGE_RANKING_KEY, JSON.stringify(top10));
      } catch (err) {
        console.error('Falha ao salvar ranking:', err);
      }

      return top10;
    });
  }, [currentStage, monsterIndex, equippedWeapon]);

  const handleClearRanking = () => {
    if (window.confirm('Deseja realmente redefinir o histórico do TOP 10 do ranking local?')) {
      const freshEntry = createEntry(currentStage, monsterIndex, equippedWeapon);
      const resetList = [freshEntry];
      setRankingList(resetList);
      localStorage.setItem(STORAGE_RANKING_KEY, JSON.stringify(resetList));
    }
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header do Ranking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display uppercase tracking-wide text-zinc-100 flex items-center gap-1.5">
                <span>Ranking TOP 10 da Arena</span>
                <span className="text-[10px] font-mono font-bold bg-amber-950 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded">
                  Local
                </span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Os 10 maiores estágios já conquistados por você na jornada da Arena, salvos no navegador.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearRanking}
          className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-center"
          title="Limpar histórico de recordes"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Resetar Ranking</span>
        </button>
      </div>

      {/* Lista do TOP 10 */}
      <div className="flex flex-col gap-2">
        {rankingList.map((entry, index) => {
          const rankPos = index + 1;
          const isGold = rankPos === 1;
          const isSilver = rankPos === 2;
          const isBronze = rankPos === 3;
          const isCurrentRun = entry.stage === currentStage;
          const rDef = getRarityData(entry.weaponRarity as any || 'comum');

          return (
            <div
              key={entry.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                isGold
                  ? 'bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-950 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : isSilver
                  ? 'bg-gradient-to-r from-slate-900/60 via-zinc-950 to-zinc-950 border-slate-400/50'
                  : isBronze
                  ? 'bg-gradient-to-r from-amber-950/20 via-zinc-950 to-zinc-950 border-amber-700/50'
                  : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Posição e Fase */}
              <div className="flex items-center gap-3">
                {/* Medalha / Badge de Posição */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-sm border shrink-0 ${
                    isGold
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/30'
                      : isSilver
                      ? 'bg-slate-300 text-zinc-950 border-slate-200'
                      : isBronze
                      ? 'bg-amber-700 text-amber-100 border-amber-600'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `${rankPos}º`}
                </div>

                {/* Detalhes do Estágio */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      Fase {entry.stage} / 100
                    </span>
                    <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 border border-rose-600/40 px-2 py-0.5 rounded">
                      Monstro {Math.min(10, entry.monsterIndex + 1)}/10
                    </span>
                    {isCurrentRun && (
                      <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded flex items-center gap-0.5 animate-pulse">
                        <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        Fase Atual
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    <span>Conquistado em: {entry.date}</span>
                  </div>
                </div>
              </div>

              {/* Arma Utilizada na Conquista */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                {entry.weaponTier > 0 ? (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${rDef.badgeBorder} ${rDef.badgeBg}`}>
                      <WeaponIcon tier={entry.weaponTier} size={24} className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                        <span>{entry.weaponName}</span>
                        <span className="text-amber-400 font-mono text-[10px]">(T{entry.weaponTier})</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase" style={{ color: rDef.color }}>
                        {rDef.label}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-zinc-500 font-mono">Desarmado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
