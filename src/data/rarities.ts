import { WeaponRarity } from '../types/game';

export interface RarityDefinition {
  id: WeaponRarity;
  label: string;
  order: number; // 0 to 9
  baseChance: number; // percentage (ex: 70 for 70%)
  damageMultiplier: number;
  sellMultiplier: number;
  critChance: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  glowColor: string;
  particleColor: string;
}

export const RARITIES: Record<WeaponRarity, RarityDefinition> = {
  comum: {
    id: 'comum',
    label: 'Comum',
    order: 0,
    baseChance: 70.0,
    damageMultiplier: 1.0,
    sellMultiplier: 1.0,
    critChance: 5,
    color: '#a1a1aa',
    badgeBg: 'bg-zinc-800/80',
    badgeBorder: 'border-zinc-700/60',
    glowColor: 'rgba(161, 161, 170, 0.4)',
    particleColor: '#d4d4d8',
  },
  incomum: {
    id: 'incomum',
    label: 'Incomum',
    order: 1,
    baseChance: 15.0,
    damageMultiplier: 1.3,
    sellMultiplier: 1.25,
    critChance: 10,
    color: '#4ade80',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/50',
    glowColor: 'rgba(74, 222, 128, 0.5)',
    particleColor: '#4ade80',
  },
  rara: {
    id: 'rara',
    label: 'Rara',
    order: 2,
    baseChance: 7.5,
    damageMultiplier: 1.7,
    sellMultiplier: 1.6,
    critChance: 16,
    color: '#38bdf8',
    badgeBg: 'bg-sky-950/80',
    badgeBorder: 'border-sky-500/50',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    particleColor: '#38bdf8',
  },
  epica: {
    id: 'epica',
    label: 'Épica',
    order: 3,
    baseChance: 4.0,
    damageMultiplier: 2.3,
    sellMultiplier: 2.1,
    critChance: 24,
    color: '#c084fc',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-500/50',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    particleColor: '#c084fc',
  },
  lendaria: {
    id: 'lendaria',
    label: 'Lendária',
    order: 4,
    baseChance: 2.0,
    damageMultiplier: 3.2,
    sellMultiplier: 2.8,
    critChance: 35,
    color: '#fbbf24',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-500/60',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    particleColor: '#fbbf24',
  },
  mitica: {
    id: 'mitica',
    label: 'Mítica',
    order: 5,
    baseChance: 0.9,
    damageMultiplier: 4.6,
    sellMultiplier: 4.0,
    critChance: 48,
    color: '#f43f5e',
    badgeBg: 'bg-rose-950/80',
    badgeBorder: 'border-rose-500/60',
    glowColor: 'rgba(244, 63, 94, 0.65)',
    particleColor: '#f43f5e',
  },
  ancestral: {
    id: 'ancestral',
    label: 'Ancestral',
    order: 6,
    baseChance: 0.4,
    damageMultiplier: 6.8,
    sellMultiplier: 6.0,
    critChance: 62,
    color: '#22d3ee',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-400/70',
    glowColor: 'rgba(34, 211, 238, 0.7)',
    particleColor: '#22d3ee',
  },
  cosmica: {
    id: 'cosmica',
    label: 'Cósmica',
    order: 7,
    baseChance: 0.15,
    damageMultiplier: 10.0,
    sellMultiplier: 9.0,
    critChance: 75,
    color: '#e879f9',
    badgeBg: 'bg-fuchsia-950/80',
    badgeBorder: 'border-fuchsia-400/80',
    glowColor: 'rgba(232, 121, 249, 0.75)',
    particleColor: '#e879f9',
  },
  divina: {
    id: 'divina',
    label: 'Divina',
    order: 8,
    baseChance: 0.04,
    damageMultiplier: 16.0,
    sellMultiplier: 14.0,
    critChance: 90,
    color: '#fef08a',
    badgeBg: 'bg-yellow-950/90',
    badgeBorder: 'border-yellow-300/90',
    glowColor: 'rgba(254, 240, 138, 0.85)',
    particleColor: '#fef08a',
  },
  primordial: {
    id: 'primordial',
    label: 'Primordial',
    order: 9,
    baseChance: 0.01,
    damageMultiplier: 25.0,
    sellMultiplier: 22.0,
    critChance: 100,
    color: '#ffffff',
    badgeBg: 'bg-gradient-to-r from-purple-950/80 via-amber-950/80 to-cyan-950/80',
    badgeBorder: 'border-white/90',
    glowColor: 'rgba(255, 255, 255, 0.95)',
    particleColor: '#ffffff',
  },
};

export const RARITY_ORDER: WeaponRarity[] = [
  'comum',
  'incomum',
  'rara',
  'epica',
  'lendaria',
  'mitica',
  'ancestral',
  'cosmica',
  'divina',
  'primordial',
];

export function getRarityData(rarity: WeaponRarity = 'comum'): RarityDefinition {
  return RARITIES[rarity] || RARITIES.comum;
}

export function getNextRarity(current: WeaponRarity = 'comum'): WeaponRarity | null {
  const currentIndex = RARITY_ORDER.indexOf(current);
  if (currentIndex >= 0 && currentIndex < RARITY_ORDER.length - 1) {
    return RARITY_ORDER[currentIndex + 1];
  }
  return null;
}

/**
 * Calcula o bônus de chance de upgrade acumulado com base no total de crafts.
 * Regra: +0.5% a cada meta progressiva (+100, +200, +300, +400, etc.)
 * Retorna: { bonusPercent, currentCrafts, nextMilestoneCrafts, currentMilestoneIndex }
 */
export function calculateUpgradeMastery(totalCrafts: number) {
  let craftsNeeded = 0;
  let milestonesAchieved = 0;
  let step = 100;

  while (craftsNeeded + step <= totalCrafts) {
    craftsNeeded += step;
    milestonesAchieved++;
    step += 100;
  }

  const bonusPercent = milestonesAchieved * 0.5; // +0.5% por meta
  const nextMilestoneTotal = craftsNeeded + step;
  const progressInStep = totalCrafts - craftsNeeded;

  return {
    bonusPercent,
    milestonesAchieved,
    currentCrafts: totalCrafts,
    nextMilestoneTotal,
    stepRequired: step,
    progressInStep,
    progressPercent: Math.min(100, Math.round((progressInStep / step) * 100)),
  };
}

/**
 * Calcula a chance de Craftar 2x (Double Craft).
 * Regra: Ativa com 5% de chance após 500 crafts de uma raridade/total.
 * A cada 100 crafts acima de 500, ganha +1% de chance até o teto de 50%.
 */
export function calculateDoubleCraftChance(totalCrafts: number): {
  isUnlocked: boolean;
  chancePercent: number;
  craftsUntilUnlock: number;
  capPercent: number;
} {
  const UNLOCK_THRESHOLD = 500;
  const CAP_PERCENT = 50;

  if (totalCrafts < UNLOCK_THRESHOLD) {
    return {
      isUnlocked: false,
      chancePercent: 0,
      craftsUntilUnlock: UNLOCK_THRESHOLD - totalCrafts,
      capPercent: CAP_PERCENT,
    };
  }

  // Base de 5% ao atingir 500 crafts
  const extraCrafts = totalCrafts - UNLOCK_THRESHOLD;
  const bonusPercent = Math.floor(extraCrafts / 100); // +1% a cada 100
  const chancePercent = Math.min(CAP_PERCENT, 5 + bonusPercent);

  return {
    isUnlocked: true,
    chancePercent,
    craftsUntilUnlock: 0,
    capPercent: CAP_PERCENT,
  };
}

/**
 * Rola a raridade para uma nova compra de Tier 1.
 * Chances padrão: Comum 70%, Incomum 15%, Rara 7.5%, etc.
 * Ajustada pelo bônus de maestria.
 */
export function rollInitialCraftRarity(bonusUpgradePercent: number = 0): WeaponRarity {
  const roll = Math.random() * 100;

  // Se o jogador acumulou bônus, reduz a chance de Comum e distribui nas raridades superiores
  const effectiveIncomum = RARITIES.incomum.baseChance + bonusUpgradePercent;
  const effectiveRara = RARITIES.rara.baseChance + bonusUpgradePercent * 0.4;
  const effectiveEpica = RARITIES.epica.baseChance + bonusUpgradePercent * 0.2;
  const effectiveLendaria = RARITIES.lendaria.baseChance + bonusUpgradePercent * 0.1;
  const effectiveMitica = RARITIES.mitica.baseChance + bonusUpgradePercent * 0.05;
  const effectiveAncestral = RARITIES.ancestral.baseChance + bonusUpgradePercent * 0.02;
  const effectiveCosmica = RARITIES.cosmica.baseChance + bonusUpgradePercent * 0.01;
  const effectiveDivina = RARITIES.divina.baseChance;
  const effectivePrimordial = RARITIES.primordial.baseChance;

  // Verificação de faixas de maior para menor
  let threshold = effectivePrimordial;
  if (roll <= threshold) return 'primordial';

  threshold += effectiveDivina;
  if (roll <= threshold) return 'divina';

  threshold += effectiveCosmica;
  if (roll <= threshold) return 'cosmica';

  threshold += effectiveAncestral;
  if (roll <= threshold) return 'ancestral';

  threshold += effectiveMitica;
  if (roll <= threshold) return 'mitica';

  threshold += effectiveLendaria;
  if (roll <= threshold) return 'lendaria';

  threshold += effectiveEpica;
  if (roll <= threshold) return 'epica';

  threshold += effectiveRara;
  if (roll <= threshold) return 'rara';

  threshold += effectiveIncomum;
  if (roll <= threshold) return 'incomum';

  return 'comum';
}

export interface FusionRarityResult {
  finalRarity: WeaponRarity;
  rarityJumps: number; // 0, 1, or 2
  didUpgrade: boolean;
  upgradeMessage?: string;
}

/**
 * Retorna a chance de Forja para aumentar o Tier (+1 Tier) ao realizar uma fusão.
 * Se der certo, aumenta o Tier. Se der errado, fica no mesmo Tier (nunca regride).
 * T1 -> T2: 95%
 * T2 -> T3: 90%
 * T3 -> T4: 85%
 * T4 -> T5: 80%
 * T5 -> T6: 75%
 * T6 -> T7: 70%
 * T7 -> T8: 65%
 * T8 -> T9: 60%
 * T9 -> T10: 55%
 * T10 -> T11: 50%
 * T11 -> T12: 45%
 * T12 -> T13: 40%
 * T13 -> T14: 35%
 * T14 -> T15: 30%
 */
export function getForgeTierSuccessChance(currentTier: number, bonusPercent: number = 0): number {
  if (currentTier >= 15) return 0;
  const base = Math.max(30, 100 - (currentTier - 1) * 5);
  return Math.min(100, Math.round(base + bonusPercent));
}

/**
 * Retorna a chance visual e efetiva de aumento de Raridade em uma fusão:
 * - Se mesma raridade: chance integral da configuração (não corta pela metade).
 * - Se raridades diferentes: chance cortada pela metade (50%).
 */
export function getFusionRarityUpgradeChance(
  rarityA: WeaponRarity = 'comum',
  rarityB: WeaponRarity = 'comum',
  bonusUpgradePercent: number = 0,
  boostChargeCount: number = 0
): number {
  const isSame = rarityA === rarityB;
  const defA = getRarityData(rarityA);
  const defB = getRarityData(rarityB);
  const lowerRarity = defA.order <= defB.order ? rarityA : rarityB;
  const lowerOrder = Math.min(defA.order, defB.order);

  if (lowerOrder >= 4) {
    const base = calculateEffectiveFusionChance(lowerRarity, boostChargeCount);
    return isSame ? base : Math.max(1, Math.round((base / 2) * 10) / 10);
  }

  let fullChance = 45;
  if (lowerRarity === 'comum') fullChance = 60;
  else if (lowerRarity === 'incomum') fullChance = 47;
  else if (lowerRarity === 'rara') fullChance = 38;
  else if (lowerRarity === 'epica') fullChance = 30;

  const totalWithBonus = Math.min(95, fullChance + bonusUpgradePercent);
  return isSame ? totalWithBonus : Math.max(1, Math.round((totalWithBonus / 2) * 10) / 10);
}

/**
 * Rola a raridade resultante de uma fusão:
 * 1. Raridades DIFERENTES (ex: Comum + Incomum):
 *    - A chance de fusão de aumentar a raridade cai pela metade (50%).
 *    - Se der certo: aprimora para a maior raridade da fusão!
 *    - Se der errado: fica na MENOR raridade da fusão!
 * 2. MESMA Raridade (ex: Comum + Comum, Incomum + Incomum, etc.):
 *    - A chance de fusão de aumentar para a próxima raridade é a mesma da configuração e NÃO corta pela metade.
 *    - Se der certo: salta +1 ou até +2 raridades acima (até Primordial)!
 *    - Se der errado: continua na MESMA raridade (não rebaixa)!
 */
export function rollFusionRarity(
  rarityA: WeaponRarity = 'comum',
  rarityB: WeaponRarity = 'comum',
  bonusUpgradePercent: number = 0,
  boostChargeCount: number = 0
): FusionRarityResult {
  const defA = getRarityData(rarityA);
  const defB = getRarityData(rarityB);

  const isSameRarity = rarityA === rarityB;
  const lowerRarity: WeaponRarity = defA.order <= defB.order ? rarityA : rarityB;
  const higherRarity: WeaponRarity = defA.order > defB.order ? rarityA : rarityB;
  const lowerDef = getRarityData(lowerRarity);
  const higherDef = getRarityData(higherRarity);

  // Primordial é a raridade máxima absoluta
  if (rarityA === 'primordial' && rarityB === 'primordial') {
    return {
      finalRarity: 'primordial',
      rarityJumps: 0,
      didUpgrade: false,
      upgradeMessage: 'Raridade Primordial Máxima preservada!',
    };
  }

  // CASO 1: RARIDADES DIFERENTES (MISTA)
  if (!isSameRarity) {
    // A chance de fusão de aumentar a raridade cai pela metade!
    const effectiveChance = getFusionRarityUpgradeChance(
      rarityA,
      rarityB,
      bonusUpgradePercent,
      boostChargeCount
    );
    const roll = Math.random() * 100;

    if (roll <= effectiveChance) {
      // Deu certo: promove para a maior raridade da fusão!
      return {
        finalRarity: higherRarity,
        rarityJumps: Math.max(1, higherDef.order - lowerDef.order),
        didUpgrade: true,
        upgradeMessage: `⚡ Fusão Mista com Sucesso! Raridade aprimorada para ${higherDef.label}!`,
      };
    } else {
      // Deu errado: fica na MENOR raridade da fusão!
      return {
        finalRarity: lowerRarity,
        rarityJumps: 0,
        didUpgrade: false,
        upgradeMessage: `Fusão Mista: upgrade falhou. Raridade fixada na menor (${lowerDef.label}).`,
      };
    }
  }

  // CASO 2: MESMA RARIDADE
  // A chance de fusão de aumentar para a próxima raridade é a mesma da configuração e NÃO corta pela metade!
  const baseOrder = defA.order;
  const currentRarity = rarityA;

  // Para raridades altas (Lendária+), usa a chance de fusão com amuleto
  if (baseOrder >= 4) {
    const effectiveChance = calculateEffectiveFusionChance(currentRarity, boostChargeCount);
    const roll = Math.random() * 100;
    if (roll <= effectiveChance && baseOrder + 1 < RARITY_ORDER.length) {
      const nextRarity = RARITY_ORDER[baseOrder + 1];
      const nextDef = getRarityData(nextRarity);
      return {
        finalRarity: nextRarity,
        rarityJumps: 1,
        didUpgrade: true,
        upgradeMessage: `🌟 FUSÃO LENDÁRIA BEM-SUCEDIDA! Raridade promovida para ${nextDef.label}!`,
      };
    } else {
      // Se der errado, fica na mesma raridade!
      return {
        finalRarity: currentRarity,
        rarityJumps: 0,
        didUpgrade: false,
        upgradeMessage: `Fusão concluída! Raridade mantida em ${defA.label}.`,
      };
    }
  }

  // Para Comum, Incomum, Rara, Épica:
  const isCommon = currentRarity === 'comum';
  const doubleJumpChance = Math.min(30, (isCommon ? 15.0 : 10.0) + bonusUpgradePercent * 0.4);
  const singleJumpChance = Math.min(65, (isCommon ? 45.0 : 35.0) + bonusUpgradePercent);

  const roll = Math.random() * 100;

  // 1. Tentar Salto Duplo (+2 Raridades) se houver espaço
  if (baseOrder + 2 < RARITY_ORDER.length && roll <= doubleJumpChance) {
    const doubleJumpRarity = RARITY_ORDER[baseOrder + 2];
    const newDef = getRarityData(doubleJumpRarity);
    return {
      finalRarity: doubleJumpRarity,
      rarityJumps: 2,
      didUpgrade: true,
      upgradeMessage: isCommon
        ? `🌟 FORJA SUPREMA! Comum saltou direto para ${newDef.label} (+2 Raridades)!`
        : `🌟 SALTO DUPLO DE RARIDADE! +2 Níveis ➔ ${newDef.label}!`,
    };
  }

  // 2. Tentar Salto Simples (+1 Raridade)
  if (baseOrder + 1 < RARITY_ORDER.length && roll <= (doubleJumpChance + singleJumpChance)) {
    const singleJumpRarity = RARITY_ORDER[baseOrder + 1];
    const newDef = getRarityData(singleJumpRarity);
    return {
      finalRarity: singleJumpRarity,
      rarityJumps: 1,
      didUpgrade: true,
      upgradeMessage: `✨ UPGRADE DE RARIDADE! +1 Nível ➔ ${newDef.label}!`,
    };
  }

  // 3. Não conseguiu upgrade: Continua na MESMA raridade!
  return {
    finalRarity: currentRarity,
    rarityJumps: 0,
    didUpgrade: false,
    upgradeMessage: `Raridade mantida em ${defA.label}.`,
  };
}

/**
 * Chance de SUCESSO na fusão por raridade:
 * Comum, Incomum, Rara, Épica = 100% de sucesso (não falham).
 * Lendária = 40% de chance de dar certo.
 * Cada raridade subsequente diminui a chance em 20% do valor anterior:
 * - Lendária: 40.0%
 * - Mítica: 32.0% (-20%)
 * - Ancestral: 25.6% (-20%)
 * - Cósmica: 20.5% (-20%)
 * - Divina: 16.4% (-20%)
 * - Primordial: 13.1% (-20%)
 */
export function getBaseFusionSuccessChance(rarity: WeaponRarity = 'comum'): number {
  switch (rarity) {
    case 'comum':
    case 'incomum':
    case 'rara':
    case 'epica':
      return 100;
    case 'lendaria':
      return 40.0;
    case 'mitica':
      return 32.0;
    case 'ancestral':
      return 25.6;
    case 'cosmica':
      return 20.5;
    case 'divina':
      return 16.4;
    case 'primordial':
      return 13.1;
    default:
      return 100;
  }
}

/**
 * Bônus de chance por carga do Amuleto (24h) para cada raridade.
 * Lendária = +10% por carga (até +50%).
 * As outras raridades acima diminuem proporcionalmente (-20% cada):
 * - Lendária: +10.0%
 * - Mítica: +8.0%
 * - Ancestral: +6.4%
 * - Cósmica: +5.1%
 * - Divina: +4.1%
 * - Primordial: +3.3%
 */
export function getFusionBoostPerCharge(rarity: WeaponRarity = 'comum'): number {
  switch (rarity) {
    case 'comum':
    case 'incomum':
    case 'rara':
    case 'epica':
      return 0; // Já têm 100% de sucesso
    case 'lendaria':
      return 10.0;
    case 'mitica':
      return 8.0;
    case 'ancestral':
      return 6.4;
    case 'cosmica':
      return 5.1;
    case 'divina':
      return 4.1;
    case 'primordial':
      return 3.3;
    default:
      return 0;
  }
}

export function calculateEffectiveFusionChance(
  rarity: WeaponRarity = 'comum',
  chargeCount: number = 0
): number {
  const base = getBaseFusionSuccessChance(rarity);
  if (base >= 100) return 100;
  const boostPerCharge = getFusionBoostPerCharge(rarity);
  const totalBoost = boostPerCharge * Math.min(5, Math.max(0, chargeCount));
  return Math.min(100, Math.round((base + totalBoost) * 10) / 10);
}

/**
 * Retorna as raridades compatíveis para fusão com uma dada raridade.
 * Regra: Mesma raridade, exatamente 1 raridade acima ou 1 raridade abaixo.
 * Diferenças maiores que 1 nível são estritamente proibidas!
 */
export function getAllowedFusionRarities(rarity: WeaponRarity = 'comum'): WeaponRarity[] {
  const currentIdx = RARITY_ORDER.indexOf(rarity);
  if (currentIdx === -1) return ['comum'];

  const allowed: WeaponRarity[] = [];
  if (currentIdx > 0) allowed.push(RARITY_ORDER[currentIdx - 1]);
  allowed.push(rarity);
  if (currentIdx < RARITY_ORDER.length - 1) allowed.push(RARITY_ORDER[currentIdx + 1]);

  return allowed;
}

/**
 * Verifica se a fusão entre duas raridades é permitida.
 * Retorna true se a diferença for <= 1 nível de raridade.
 */
export function isFusionRarityAllowed(
  rarityA: WeaponRarity = 'comum',
  rarityB: WeaponRarity = 'comum'
): boolean {
  const defA = getRarityData(rarityA);
  const defB = getRarityData(rarityB);
  return Math.abs(defA.order - defB.order) <= 1;
}

/**
 * Retorna uma string formatada em português com as raridades permitidas para fusão.
 * Ex: Comum -> "Comum ou Incomum"
 *     Incomum -> "Comum, Incomum ou Rara"
 */
export function getAllowedFusionRaritiesLabel(rarity: WeaponRarity = 'comum'): string {
  const allowed = getAllowedFusionRarities(rarity);
  const labels = allowed.map((r) => getRarityData(r).label);
  if (labels.length <= 1) return labels[0] || 'Comum';
  if (labels.length === 2) return `${labels[0]} ou ${labels[1]}`;
  return `${labels[0]}, ${labels[1]} ou ${labels[2]}`;
}

/**
 * Calcula a chance de sucesso da fusão de acordo com as regras:
 * 1. Se for da MESMA raridade e mesmo tier: chance padrão daquela raridade.
 * 2. Se for de raridades DIFERENTES (com 1 nível de diferença): a chance diminui pela metade
 *    da chance do item da menor raridade!
 * 3. Se a diferença for maior que 1 nível: chance é 0 (fusão proibida).
 */
export function calculateFusionSuccessChance(
  rarityA: WeaponRarity = 'comum',
  rarityB: WeaponRarity = 'comum',
  chargeCount: number = 0,
  currentTier: number = 1,
  bonusMasteryPercent: number = 0
): {
  isAllowed: boolean;
  isSameRarity: boolean;
  effectiveChance: number;
  fusionChance: number;
  forgeChance: number;
  lowerRarity: WeaponRarity;
  higherRarity: WeaponRarity;
  allowedRaritiesForA: string;
  allowedRaritiesForB: string;
  reason?: string;
} {
  const defA = getRarityData(rarityA);
  const defB = getRarityData(rarityB);
  const diff = Math.abs(defA.order - defB.order);

  const lowerRarity: WeaponRarity = defA.order <= defB.order ? rarityA : rarityB;
  const higherRarity: WeaponRarity = defA.order > defB.order ? rarityA : rarityB;

  const allowedForA = getAllowedFusionRaritiesLabel(rarityA);
  const allowedForB = getAllowedFusionRaritiesLabel(rarityB);

  const forgeChance = getForgeTierSuccessChance(currentTier, bonusMasteryPercent);
  const fusionChance = getFusionRarityUpgradeChance(
    rarityA,
    rarityB,
    bonusMasteryPercent,
    chargeCount
  );

  if (diff > 1) {
    return {
      isAllowed: false,
      isSameRarity: false,
      effectiveChance: 0,
      fusionChance: 0,
      forgeChance,
      lowerRarity,
      higherRarity,
      allowedRaritiesForA: allowedForA,
      allowedRaritiesForB: allowedForB,
      reason: `Fusão proibida! Diferença maior que 1 raridade (${defA.label} com ${defB.label}). A arma ${defA.label} só aceita fusão com: ${allowedForA}.`,
    };
  }

  // Caso 1: Mesma raridade e mesmo tier: chance integral da raridade
  if (diff === 0) {
    return {
      isAllowed: true,
      isSameRarity: true,
      effectiveChance: fusionChance,
      fusionChance,
      forgeChance,
      lowerRarity,
      higherRarity,
      allowedRaritiesForA: allowedForA,
      allowedRaritiesForB: allowedForB,
    };
  }

  // Caso 2: Raridades diferentes (exatamente 1 nível de diferença)
  // Regra: a chance da fusão de aumentar a raridade cai pela metade!
  return {
    isAllowed: true,
    isSameRarity: false,
    effectiveChance: fusionChance,
    fusionChance,
    forgeChance,
    lowerRarity,
    higherRarity,
    allowedRaritiesForA: allowedForA,
    allowedRaritiesForB: allowedForB,
  };
}


