/**
 * Sistema de Atributos e Recompensas de Batalha
 * 
 * Regras de Ataque dos Inimigos:
 * - Fase 1: Inicia com 10 de ataque no Monstro 1, aumentando +1 a cada nível (+1 por monstro).
 *   Monstro 1 = 10, Monstro 10 = 19 de ataque.
 * - Fase 2: Inicia com o ataque final da fase anterior (19 de ataque) e aumenta +2 a cada nível.
 *   Monstro 1 = 19, Monstro 10 = 37 de ataque.
 * - Fase 3: Inicia com 37 e aumenta +3 a cada nível (Monstro 10 = 64).
 * - Fase 4: Inicia com 64 e aumenta +4 a cada nível (Monstro 10 = 100).
 * - Em geral, na Fase S, o monstro inicial tem ataque:
 *     baseStageAtk = 10 + 9 * ((S - 1) * S) / 2
 *   e a cada monstro M (0 a 9) aumenta +S de ataque:
 *     enemyAtk = baseStageAtk + M * S
 * 
 * Regras de Recompensa (Cédulas por Inimigo Eliminado):
 * - Fases 1 e 2: 2 Cédulas
 * - Fases 3 e 4: 3 Cédulas
 * - Fases 5 e 6: 4 Cédulas
 * - A cada 2 fases aumenta +1 Cédula por abate:
 *     recompensa = Math.floor((stage - 1) / 2) + 2
 */

export interface EnemyStats {
  enemyAtk: number;
  enemyDef: number;
  enemyMaxHp: number;
  baseStageAtk: number;
  attackStep: number;
}

/**
 * Calcula o Ataque do Inimigo seguindo a progressão solicitada pelo usuário.
 */
export function calculateEnemyAttack(stage: number, monsterIndex: number): { enemyAtk: number; baseStageAtk: number; attackStep: number } {
  const safeStage = Math.max(1, stage);
  const safeMonsterIdx = Math.max(0, Math.min(9, monsterIndex));

  // Ataque inicial da Fase (igual ao ataque do último monstro da fase anterior)
  // Soma de 1 até S-1 de (9 * k) = 9 * ((S-1) * S) / 2
  const baseStageAtk = 10 + Math.round((9 * ((safeStage - 1) * safeStage)) / 2);
  
  // Aumento por nível nesta fase é igual ao número da fase (safeStage)
  const attackStep = safeStage;
  const enemyAtk = baseStageAtk + safeMonsterIdx * attackStep;

  return { enemyAtk, baseStageAtk, attackStep };
}

/**
 * Retorna todos os atributos escalonados do monstro da fase/nível especificados.
 * 
 * Regras de Atributos do Inimigo:
 * - Ataque: Escalonado por fase e monstro (calculateEnemyAttack).
 * - Defesa: 20% do Ataque do Inimigo (ex: 100 de Atk -> 20 de Defesa).
 * - HP Máximo: 40% do Ataque do Inimigo (ex: 100 de Atk -> 40 de HP).
 */
export function calculateEnemyStats(stage: number, monsterIndex: number): EnemyStats {
  const safeStage = Math.max(1, stage);
  const safeMonsterIdx = Math.max(0, Math.min(9, monsterIndex));

  const { enemyAtk, baseStageAtk, attackStep } = calculateEnemyAttack(safeStage, safeMonsterIdx);

  // Defesa = 20% do ataque do inimigo
  const enemyDef = Math.max(1, Math.round(enemyAtk * 0.20));

  // HP Máximo = 40% do ataque do inimigo
  const enemyMaxHp = Math.max(1, Math.round(enemyAtk * 0.40));

  return {
    enemyAtk,
    enemyDef,
    enemyMaxHp,
    baseStageAtk,
    attackStep,
  };
}

/**
 * Calcula a recompensa em Cédulas concedida ao derrotar um monstro em determinada fase.
 * Fases 1 e 2: 2 Cédulas
 * Fases 3 e 4: 3 Cédulas
 * Fases 5 e 6: 4 Cédulas
 * A cada duas fases aumenta +1 Cédula.
 */
export function getBattleStageReward(stage: number): number {
  const safeStage = Math.max(1, stage);
  return Math.floor((safeStage - 1) / 2) + 2;
}

export interface StageSimulationResult {
  stage: number;
  monstersDefeated: number; // 0 a 10
  totalMonsters: number; // 10
  isVictory: boolean;
  rewardCedulas: number;
  damageTaken: number;
  playerRemainingHp: number;
  defeatedByMonsterIndex?: number;
}

export interface FiveStageSimulationReport {
  startStage: number;
  finalStage: number;
  stagesCompleted: number;
  totalCedulasEarned: number;
  totalMonstersDefeated: number;
  isTotalVictory: boolean;
  stageResults: StageSimulationResult[];
}

/**
 * Simula 5 fases consecutivas de combate instantaneamente (Modo Simulado VIP / Licença).
 */
export function simulateFiveStages(
  startStage: number,
  playerAtk: number,
  playerMaxHp: number,
  playerDef: number,
  critChance: number = 5
): FiveStageSimulationReport {
  const safeStart = Math.max(1, Math.min(100, startStage));
  const stagesToSimulate = Math.min(5, 101 - safeStart);

  let currentStage = safeStart;
  let totalCedulasEarned = 0;
  let totalMonstersDefeated = 0;
  let stagesCompleted = 0;
  let isTotalVictory = true;
  const stageResults: StageSimulationResult[] = [];

  for (let s = 0; s < stagesToSimulate; s++) {
    const stageNum = safeStart + s;
    if (stageNum > 100) break;

    const rewardPerMonster = getBattleStageReward(stageNum);
    let monstersDefeatedThisStage = 0;
    let stageReward = 0;
    let stageDamageTaken = 0;
    let playerHp = playerMaxHp;
    let stageVictory = true;
    let defeatedByIndex: number | undefined = undefined;

    // Simula os 10 monstros da fase
    for (let m = 0; m < 10; m++) {
      const { enemyAtk, enemyDef, enemyMaxHp } = calculateEnemyStats(stageNum, m);
      let monsterHp = enemyMaxHp;

      // Turnos de combate do monstro m
      let rounds = 0;
      while (monsterHp > 0 && playerHp > 0 && rounds < 100) {
        rounds++;
        // Turno do Jogador
        const isCrit = Math.random() * 100 <= critChance;
        const rawPlayerDmg = isCrit ? Math.round(playerAtk * 1.5) : playerAtk;
        const netPlayerDmg = Math.max(1, rawPlayerDmg - enemyDef);
        monsterHp -= netPlayerDmg;

        if (monsterHp <= 0) {
          // Monstro derrotado!
          monstersDefeatedThisStage++;
          stageReward += rewardPerMonster;
          totalMonstersDefeated++;
          totalCedulasEarned += rewardPerMonster;
          break;
        }

        // Turno do Monstro
        const netMonsterDmg = Math.max(1, enemyAtk - playerDef);
        playerHp -= netMonsterDmg;
        stageDamageTaken += netMonsterDmg;

        if (playerHp <= 0) {
          // Jogador derrotado
          stageVictory = false;
          defeatedByIndex = m;
          break;
        }
      }

      if (!stageVictory || playerHp <= 0) {
        break;
      }
    }

    stageResults.push({
      stage: stageNum,
      monstersDefeated: monstersDefeatedThisStage,
      totalMonsters: 10,
      isVictory: stageVictory,
      rewardCedulas: stageReward,
      damageTaken: stageDamageTaken,
      playerRemainingHp: Math.max(0, playerHp),
      defeatedByMonsterIndex: defeatedByIndex,
    });

    if (stageVictory) {
      stagesCompleted++;
      currentStage = Math.min(100, stageNum + 1);
    } else {
      isTotalVictory = false;
      currentStage = stageNum;
      break;
    }
  }

  return {
    startStage: safeStart,
    finalStage: currentStage,
    stagesCompleted,
    totalCedulasEarned,
    totalMonstersDefeated,
    isTotalVictory,
    stageResults,
  };
}

