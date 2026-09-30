import React from 'react';
import { FiveStageSimulationReport, getBattleStageReward } from '../data/battle';
import { formatNumber } from '../data/weapons';
import {
  Trophy,
  Skull,
  Coins,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowRight,
  Crown,
} from 'lucide-react';

interface SimulationReportModalProps {
  report: FiveStageSimulationReport;
  onClose: () => void;
}

export const SimulationReportModal: React.FC<SimulationReportModalProps> = ({
  report,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-amber-500/70 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl shadow-amber-500/20 flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Cabeçalho do Relatório */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md ${
              report.isTotalVictory
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-amber-500/30'
                : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30'
            }`}>
              {report.isTotalVictory ? '🏆' : '⚔️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-wide text-zinc-100">
                  {report.isTotalVictory ? 'Simulação Perfeita (5 Fases)!' : 'Relatório de Simulação'}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-amber-400/10 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Instantâneo</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Fases {report.startStage} a {Math.min(100, report.startStage + report.stageResults.length - 1)} simuladas com sucesso.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Resumo Estatístico em Cards 3D */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 flex-1">
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 bg-zinc-950/80 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-400" />
                <span>Cédulas</span>
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5">
                +{formatNumber(report.totalCedulasEarned)}
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Fases Vencidas</span>
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-300 mt-0.5">
                {report.stagesCompleted} / {report.stageResults.length}
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-rose-500/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                <Skull className="w-3 h-3 text-rose-400" />
                <span>Abates</span>
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-rose-300 mt-0.5">
                {report.totalMonstersDefeated}
              </span>
            </div>
          </div>

          {/* Lista de Fases Simuladas */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Detalhamento por Fase:
            </span>

            {report.stageResults.map((st) => (
              <div
                key={st.stage}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  st.isVictory
                    ? 'bg-zinc-950/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                    : 'bg-rose-950/40 border-rose-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    st.isVictory ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {st.isVictory ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <span>Fase {st.stage}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        st.isVictory ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {st.isVictory ? '10/10 Inimigos' : `${st.monstersDefeated}/10 Inimigos`}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {st.isVictory
                        ? `HP Restante: ${st.playerRemainingHp} · Dano recebido: ${st.damageTaken}`
                        : `Derrotado no Monstro ${(st.defeatedByMonsterIndex || 0) + 1}`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    +{formatNumber(st.rewardCedulas)} Céd
                  </span>
                  <span className={`text-[10px] font-mono ${st.isVictory ? 'text-zinc-500' : 'text-rose-400'}`}>
                    {st.isVictory ? 'Concluída' : 'Interrompida'}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Rodapé do Modal com Botão de Confirmação */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-mono text-center sm:text-left">
            <span>Próxima Fase na Arena: </span>
            <strong className="text-amber-300 font-bold">Fase {report.finalStage} / 100</strong>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Coletar & Continuar</span>
            <ChevronRight className="w-4 h-4 font-bold" />
          </button>
        </div>

      </div>
    </div>
  );
};
