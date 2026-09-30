import React, { useState } from 'react';
import { DailyLoginState, QuestItem, SeasonPassState } from '../types/game';
import {
  PASS_REWARDS,
  calculateDailyReward,
  isPassActivePeriod,
  getTodayDateString,
  getPassPremiumReward,
} from '../data/missions';
import { formatNumber } from '../data/weapons';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  Flame,
  Gem,
  Gift,
  Lock,
  Scroll,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';

interface RewardsViewProps {
  dailyLogin: DailyLoginState;
  quests: QuestItem[];
  seasonPass: SeasonPassState;
  cedulas?: number;
  diamantes?: number;
  onClaimDailyLogin: () => void;
  onClaimQuest: (questId: string) => void;
  onClaimPassLevel: (level: number, isPremiumTrack?: boolean, clickRect?: DOMRect) => void;
  onBuySeasonPassPremium?: (currency: 'cedulas' | 'diamantes') => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  dailyLogin,
  quests,
  seasonPass,
  cedulas = 0,
  diamantes = 0,
  onClaimDailyLogin,
  onClaimQuest,
  onClaimPassLevel,
  onBuySeasonPassPremium,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'missions' | 'pass'>('missions');
  const [missionFilter, setMissionFilter] = useState<'daily' | 'weekly'>('daily');

  const todayStr = getTodayDateString();
  const hasClaimedToday = dailyLogin.lastClaimDate === todayStr;
  const currentRewardAmount = calculateDailyReward(dailyLogin.streak || 1);

  // Missões
  const dailyQuests = quests.filter((q) => !q.isWeekly);
  const weeklyQuests = quests.filter((q) => q.isWeekly);
  const activeQuestsList = missionFilter === 'daily' ? dailyQuests : weeklyQuests;

  const pendingDailyClaims = dailyQuests.filter((q) => !q.claimed && q.currentCount >= q.targetCount).length;
  const pendingWeeklyClaims = weeklyQuests.filter((q) => !q.claimed && q.currentCount >= q.targetCount).length;
  const totalPendingQuests = pendingDailyClaims + pendingWeeklyClaims;

  // Passe de Batalha (Inicia dia 1, termina dia 28)
  const passInfo = isPassActivePeriod();
  const totalCompleted = seasonPass.totalMissionsCompletedThisMonth || 0;
  const passLevel = Math.floor(totalCompleted / 10);
  const progressInLevel = totalCompleted % 10;

  const pendingPassClaims = PASS_REWARDS.filter(
    (r) => passLevel >= r.level && !seasonPass.claimedLevels.includes(r.level)
  ).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fadeIn pb-28 sm:pb-36">
      
      {/* Navegação entre as 3 Sub-Abas: Login Diário, Missões e Passe */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-xl">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Login Diário</span>
          {!hasClaimedToday && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeTab === 'missions'
              ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>Missões</span>
          {totalPendingQuests > 0 && (
            <span className="text-[10px] font-mono font-bold bg-emerald-500 text-zinc-950 px-1.5 py-0.2 rounded-full animate-bounce">
              {totalPendingQuests}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pass')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeTab === 'pass'
              ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-extrabold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Passe Mensal</span>
          {pendingPassClaims > 0 && (
            <span className="text-[10px] font-mono font-bold bg-cyan-400 text-zinc-950 px-1.5 py-0.2 rounded-full animate-bounce">
              {pendingPassClaims}
            </span>
          )}
        </button>
      </div>

      {/* ABA 1: LOGIN DIÁRIO (50 a 1.000 CÉDULAS) */}
      {activeTab === 'login' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Card Principal de Resgate */}
          <div className="bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/10">
                <Gift className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-zinc-100 font-display uppercase tracking-wide">
                    Recompensa de Login Diário
                  </h3>
                  <span className="text-xs font-mono font-bold bg-amber-950 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{dailyLogin.streak || 1} {dailyLogin.streak === 1 ? 'Dia Seguido' : 'Dias Seguidos'}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">
                  Logue todos os dias consecutivamente para aumentar sua recompensa diária em <strong>+50 Cédulas</strong> a cada dia, até atingir o teto máximo de <strong>1.000 Cédulas por dia</strong>!
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2 w-full md:w-auto">
              <div className="text-xs font-mono text-zinc-400 text-center sm:text-right">
                <span>Próxima Recompensa:</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-end">
                  <Coins className="w-5 h-5 text-emerald-400" />
                  <span>+{formatNumber(currentRewardAmount)} Cédulas</span>
                </div>
              </div>

              <button
                onClick={onClaimDailyLogin}
                disabled={hasClaimedToday}
                className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  hasClaimedToday
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/30 font-black'
                }`}
              >
                {hasClaimedToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Resgatado Hoje (Volte Amanhã)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Resgatar +{currentRewardAmount} Cédulas Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trilha Visual dos 20 Dias de Login Consecutivo (50 até 1.000 Cédulas) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Trilha de Progressão Diária (Dias 1 ao 20)</span>
              </h4>
              <span className="text-[11px] text-zinc-400 font-mono">
                Teto máximo: 1.000 Cédulas / dia
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from({ length: 20 }).map((_, idx) => {
                const dayNum = idx + 1;
                const reward = calculateDailyReward(dayNum);
                const isCurrentStreak = (dailyLogin.streak || 1) === dayNum;
                const isPast = (dailyLogin.streak || 1) > dayNum;

                return (
                  <div
                    key={dayNum}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                      isCurrentStreak
                        ? 'bg-amber-950/60 border-amber-500/80 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                        : isPast
                        ? 'bg-zinc-950/60 border-emerald-500/40 text-zinc-400'
                        : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={`font-bold ${isCurrentStreak ? 'text-amber-400' : 'text-zinc-400'}`}>
                        Dia {dayNum}
                      </span>
                      {isPast ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isCurrentStreak ? (
                        <span className="text-[9px] font-bold uppercase bg-amber-500 text-zinc-950 px-1 rounded">Hoje</span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{reward}</span>
                    </div>

                    <div className="text-[9px] text-zinc-500 font-mono">
                      {dayNum === 20 ? 'Teto Máximo' : `+50 Cédulas`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: MISSÕES DIÁRIAS E SEMANAIS */}
      {activeTab === 'missions' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          {/* Seletor Diárias vs Semanais */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMissionFilter('daily')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  missionFilter === 'daily'
                    ? 'bg-zinc-100 text-zinc-950 shadow-md font-extrabold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                <span>Missões Diárias</span>
                {pendingDailyClaims > 0 && (
                  <span className="text-[10px] font-mono bg-emerald-500 text-zinc-950 px-1.5 py-0.2 rounded-full">
                    {pendingDailyClaims}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMissionFilter('weekly')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  missionFilter === 'weekly'
                    ? 'bg-zinc-100 text-zinc-950 shadow-md font-extrabold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                <span>Missões Semanais (5x Metas · 3x Cédulas)</span>
                {pendingWeeklyClaims > 0 && (
                  <span className="text-[10px] font-mono bg-emerald-500 text-zinc-950 px-1.5 py-0.2 rounded-full">
                    {pendingWeeklyClaims}
                  </span>
                )}
              </button>
            </div>

            <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {missionFilter === 'daily'
                  ? 'Reinicia todo dia à meia-noite'
                  : 'Reinicia a cada semana'}
              </span>
            </div>
          </div>

          {/* Lista de Missões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeQuestsList.map((quest) => {
              const isCompleted = quest.currentCount >= quest.targetCount;
              const isClaimed = quest.claimed;
              const progressPercent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    isClaimed
                      ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                      : isCompleted
                      ? 'bg-gradient-to-r from-emerald-950/30 to-zinc-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        quest.category === 'craft'
                          ? 'bg-amber-500/20 text-amber-400'
                          : quest.category === 'fusion'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {quest.category === 'craft' ? '🔨' : quest.category === 'fusion' ? '⚡' : '⚔️'}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-100">
                          {quest.title}
                        </h5>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                          <span className="capitalize text-zinc-500">{quest.category}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            +{formatNumber(quest.rewardCedulas)} Cédulas
                          </span>
                        </div>
                      </div>
                    </div>

                    {isClaimed ? (
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Resgatado</span>
                      </span>
                    ) : isCompleted ? (
                      <button
                        onClick={() => onClaimQuest(quest.id)}
                        className="py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-xs rounded-lg shadow-md shadow-emerald-500/30 flex items-center gap-1 cursor-pointer animate-pulse whitespace-nowrap"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Resgatar (+{quest.rewardCedulas})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-zinc-400">
                        {quest.currentCount} / {quest.targetCount}
                      </span>
                    )}
                  </div>

                  {/* Barra de Progresso */}
                  <div className="flex flex-col gap-1">
                    <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: PASSE DE BATALHA MENSAL (INICIA DIA 1, REINICIA DIA 1) */}
      {activeTab === 'pass' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Header do Passe de Batalha */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-purple-950/40 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl shadow-lg shadow-indigo-500/10 shrink-0">
                <Trophy className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-zinc-100 font-display uppercase tracking-wide">
                    Passe de Temporada Mensal
                  </h3>
                  <span className="text-xs font-mono font-bold bg-indigo-950 border border-indigo-500/40 text-indigo-300 px-2.5 py-0.5 rounded-full">
                    Nível {passLevel}
                  </span>
                  {seasonPass.isPremiumUnlocked && (
                    <span className="text-xs font-mono font-extrabold bg-amber-500 text-zinc-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/30">
                      <Crown className="w-3.5 h-3.5" />
                      PASSE PREMIUM ATIVO (+50%)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">
                  Inicia no <strong>Dia 1</strong> e dura até o final do mês (reinicia no Dia 1). Começa no Nível 0 e <strong>a cada 10 missões concluídas você sobe 1 nível</strong>!
                </p>
              </div>
            </div>

            {/* Status da Temporada e Dias Restantes */}
            <div className="flex flex-col items-center sm:items-end gap-1 font-mono text-xs text-zinc-300 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 shrink-0">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>
                  Dia {passInfo.dayOfMonth} · {passInfo.daysLeft} dias restantes
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Missões Feitas este Mês: <strong className="text-amber-400">{totalCompleted}</strong>
              </div>
              <div className="text-[11px] text-zinc-500">
                Próximo Nível: {progressInLevel} / 10 missões ({10 - progressInLevel} restantes)
              </div>
            </div>
          </div>

          {/* BANNER PROMOCIONAL DO PASSE PREMIUM (+50% EM TODAS AS RECOMPENSAS) */}
          <div className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-all ${
            seasonPass.isPremiumUnlocked
              ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/30 border-amber-500/60 shadow-amber-500/10'
              : 'bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border-amber-500/40'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-1.5 font-display uppercase tracking-wide">
                    <span>Trilha do Passe Premium (+50% Recompensas)</span>
                  </h4>
                  {seasonPass.isPremiumUnlocked ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full">
                      DESBLOQUEADO
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-zinc-800 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      30.000 Céd. ou 30 💎
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  O Passe Premium concede <strong>+50% a mais em todas as recompensas</strong> (se a recompensa é 10.000 cédulas, ganhe 15.000!). Você pode resgatar a trilha normal e a trilha premium. Vence no Dia 1.
                </p>
              </div>
            </div>

            {seasonPass.isPremiumUnlocked ? (
              <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Trilha Dourada Ativa</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap justify-end">
                <button
                  onClick={() => onBuySeasonPassPremium?.('cedulas')}
                  disabled={cedulas < 30000}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    cedulas >= 30000
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
                  }`}
                  title="Comprar Passe Premium por 30.000 Cédulas"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>30.000 Cédulas</span>
                </button>

                <button
                  onClick={() => onBuySeasonPassPremium?.('diamantes')}
                  disabled={diamantes < 30}
                  className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    diamantes >= 30
                      ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-zinc-950 shadow-md shadow-cyan-500/20'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-75'
                  }`}
                  title="Comprar Passe Premium por 30 Diamantes"
                >
                  <Gem className="w-3.5 h-3.5" />
                  <span>30 💎 Diamantes</span>
                </button>
              </div>
            )}
          </div>

          {/* Trilha de Níveis do Passe (Níveis 1 ao 15 com Trilha Normal e Trilha Premium) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Trilha de Recompensas (Normal e Premium +50%)</span>
              </h4>
              <span className="text-[11px] text-zinc-400 font-mono">
                Seu Nível Atual: <strong>Nível {passLevel}</strong> · 10 Missões = +1 Nível
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {PASS_REWARDS.map((reward) => {
                const isUnlocked = passLevel >= reward.level;
                const isClaimedNormal = seasonPass.claimedLevels.includes(reward.level);
                const isClaimedPremium = (seasonPass.claimedPremiumLevels || []).includes(reward.level);
                const premiumReward = getPassPremiumReward(reward);

                return (
                  <div
                    key={reward.level}
                    className={`p-4 rounded-xl border flex flex-col gap-3.5 transition-all ${
                      isClaimedNormal && isClaimedPremium
                        ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                        : isUnlocked
                        ? 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    {/* Linha de Cabeçalho do Nível */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black font-mono text-sm border ${
                          isUnlocked
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}>
                          {reward.level}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                            <span>Nível {reward.level}</span>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.2 rounded border border-zinc-800">
                              Requer {reward.missionsRequired} Missões
                            </span>
                          </h5>
                        </div>
                      </div>

                      {!isUnlocked && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Faltam {reward.missionsRequired - totalCompleted} missões</span>
                        </div>
                      )}
                    </div>

                    {/* Grade de 2 Trilhas: Trilha Normal vs Trilha Premium */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      
                      {/* TRILHA 1: NORMAL (GRÁTIS) */}
                      <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                        isClaimedNormal
                          ? 'bg-zinc-950/60 border-zinc-800/60'
                          : isUnlocked
                          ? 'bg-zinc-950/90 border-emerald-500/40 ring-1 ring-emerald-500/20'
                          : 'bg-zinc-950/60 border-zinc-800/80'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1">
                              <Gift className="w-3 h-3 text-emerald-400" />
                              <span>Passe Normal (Grátis)</span>
                            </span>
                            {isClaimedNormal && (
                              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Resgatado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-200 font-mono mt-1 font-semibold">
                            {reward.description}
                          </div>
                        </div>

                        <div>
                          {isClaimedNormal ? (
                            <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Recompensa Normal Coletada</span>
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                onClaimPassLevel(reward.level, false, rect);
                              }}
                              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Abrir Baú Normal</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Requer Nível {reward.level}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* TRILHA 2: PREMIUM (+50% BÔNUS) */}
                      <div className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                        isClaimedPremium
                          ? 'bg-zinc-950/60 border-zinc-800/60'
                          : isUnlocked && seasonPass.isPremiumUnlocked
                          ? 'bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-950 border-amber-400/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30'
                          : 'bg-zinc-950/60 border-amber-500/20'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span>Passe Premium (+50%)</span>
                            </span>
                            {isClaimedPremium && (
                              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5 font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Resgatado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-amber-300 font-mono mt-1 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{premiumReward.description}</span>
                          </div>
                        </div>

                        <div>
                          {isClaimedPremium ? (
                            <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Recompensa Premium Coletada</span>
                            </span>
                          ) : isUnlocked ? (
                            seasonPass.isPremiumUnlocked ? (
                              <button
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  onClaimPassLevel(reward.level, true, rect);
                                }}
                                className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md shadow-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
                              >
                                <Crown className="w-3.5 h-3.5" />
                                <span>Abrir Baú Premium 👑 (+50%)</span>
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-amber-400/90">
                                  🔒 Requer Passe Premium
                                </span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => onBuySeasonPassPremium?.('cedulas')}
                                    disabled={cedulas < 30000}
                                    className="flex-1 py-1 px-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-[9px] rounded transition-colors disabled:opacity-50 cursor-pointer text-center"
                                  >
                                    30k Cédulas
                                  </button>
                                  <button
                                    onClick={() => onBuySeasonPassPremium?.('diamantes')}
                                    disabled={diamantes < 30}
                                    className="flex-1 py-1 px-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[9px] rounded transition-colors disabled:opacity-50 cursor-pointer text-center"
                                  >
                                    30 💎
                                  </button>
                                </div>
                              </div>
                            )
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Requer Nível {reward.level} e Passe Premium
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
