import React, { useEffect, useRef } from 'react';
import { WeaponRarity } from '../types/game';
import { getRarityData } from '../data/rarities';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  shape: 'circle' | 'spark' | 'star' | 'blade' | 'crystal' | 'rune' | 'blood' | 'coin';
  rotation?: number;
  rotationSpeed?: number;
  trail?: boolean;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

interface LightBeam {
  x: number;
  width: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ImpactFlash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  length: number;
  color: string;
  alpha: number;
  decay: number;
  width: number;
}

interface ScreenFlash {
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingLabel {
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  subColor?: string;
  alpha: number;
  scale: number;
  vy: number;
  isCurrency?: boolean;
  durationFrames?: number;
  ageFrames?: number;
}

const GOLD_PALETTE = [
  '#fef08a', // pale gold
  '#fde047', // bright yellow-gold
  '#facc15', // pure gold
  '#fbbf24', // amber gold
  '#f59e0b', // deep gold
  '#ffffff', // diamond glint
];

const RAINBOW_PALETTE = [
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
];

function getBloodSpurtColors(rarity: WeaponRarity): string[] {
  switch (rarity) {
    case 'comum':
      return ['#dc2626', '#b91c1c', '#7f1d1d', '#f59e0b', '#fef08a']; // Sangue ferroso escarlate + faíscas de têmpera
    case 'incomum':
      return ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']; // Sangue bio-esmeralda ácido
    case 'rara':
      return ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff']; // Sangue criogênico azul e cristais de gelo
    case 'epica':
      return ['#9333ea', '#a855f7', '#c084fc', '#e879f9', '#f3e8ff']; // Sangue arcano púrpura e fagulhas místicas
    case 'lendaria':
      return ['#ca8a04', '#eab308', '#facc15', '#fef08a', '#ffffff']; // Sangue solar dourado e faíscas de ouro
    case 'mitica':
      return ['#be123c', '#e11d48', '#f43f5e', '#881337', '#ffffff']; // Sangue carmesim rubi profundo profano
    case 'ancestral':
      return ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#ffffff']; // Sangue etéreo ciano neon arcaico
    case 'cosmica':
      return ['#db2777', '#ec4899', '#818cf8', '#6366f1', '#f472b6']; // Poeira estelar fúcsia/índigo galáctica
    case 'divina':
      return ['#fbbf24', '#fde047', '#fef08a', '#ffffff', '#fffbeb']; // Sangue celestial de luz divina sagrada
    case 'primordial':
      return ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#ffffff']; // Explosão prismática
    default:
      return ['#dc2626', '#b91c1c', '#f59e0b'];
  }
}

class FXManager {
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private beams: LightBeam[] = [];
  private flashes: ImpactFlash[] = [];
  private slashes: SlashEffect[] = [];
  private screenFlash: ScreenFlash | null = null;
  private labels: FloatingLabel[] = [];
  private onFrameCallback: (() => void) | null = null;
  public powerSaver: boolean = false;

  public setPowerSaver(enabled: boolean) {
    this.powerSaver = enabled;
  }

  public setCallback(cb: () => void) {
    this.onFrameCallback = cb;
  }

  public getEntities() {
    return {
      particles: this.particles,
      shockwaves: this.shockwaves,
      beams: this.beams,
      flashes: this.flashes,
      slashes: this.slashes,
      screenFlash: this.screenFlash,
      labels: this.labels,
    };
  }

  public hasActiveEffects(): boolean {
    return (
      this.particles.length > 0 ||
      this.shockwaves.length > 0 ||
      this.beams.length > 0 ||
      this.flashes.length > 0 ||
      this.slashes.length > 0 ||
      this.screenFlash !== null ||
      this.labels.length > 0
    );
  }

  /**
   * EFEITOS DE IMPACTO VISUAL EM BATALHA NO CANVAS
   * Flashes de luz, cortes e partículas de impacto variando conforme a raridade da arma equipada!
   */
  public triggerBattleHit(
    x: number,
    y: number,
    rarity: WeaponRarity = 'comum',
    isCrit: boolean = false,
    damage: number = 0
  ) {
    const rDef = getRarityData(rarity);

    // 1. Flash de Luz Ambiente na Tela Inteira (Tinge a atmosfera com a cor da raridade)
    this.screenFlash = {
      color: isCrit ? '#fef08a' : rDef.color,
      alpha: isCrit ? 0.32 : 0.18,
      decay: isCrit ? 0.05 : 0.07,
    };

    // 2. Flash de Luz Radial Concentrado no Ponto de Impacto do Monstro
    this.flashes.push({
      x,
      y,
      radius: 12,
      maxRadius: isCrit ? 140 : 95,
      color: isCrit ? '#ffffff' : rDef.color,
      alpha: 1,
      decay: isCrit ? 0.055 : 0.075,
    });

    // 3. Rastro de Lâmina / Corte de Energia Cortante (Slash Arc)
    const slashAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    this.slashes.push({
      x,
      y,
      angle: slashAngle,
      length: isCrit ? 130 : 90,
      color: isCrit ? '#ffffff' : rDef.color,
      alpha: 1,
      decay: 0.09,
      width: isCrit ? 6 : 4,
    });

    // 4. Shockwave de Impacto Cortante em Anel Expansivo
    this.shockwaves.push({
      x,
      y,
      radius: 8,
      maxRadius: isCrit ? 95 : 60,
      color: isCrit ? '#fde047' : rDef.color,
      alpha: 1,
      lineWidth: isCrit ? 5.5 : 3.5,
    });

    // 4.1 EFEITO ESPECÍFICO DE GOLPE CRÍTICO: JATO DE SANGUE E FAÍSCAS EXPLOSIVAS QUE SALTAM DO INIMIGO
    if (isCrit) {
      const bloodPalette = getBloodSpurtColors(rarity);
      const spurtCount = 42; // Erupção densa de sangue e faíscas

      for (let i = 0; i < spurtCount; i++) {
        // Ejeção balística parabólica arremessada para cima e em leque horizontal
        const angle = -Math.PI / 2 + (Math.random() - 0.45) * 2.3;
        const speed = 4.5 + Math.random() * 10;
        const isSpark = Math.random() > 0.4;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 22,
          y: y + (Math.random() - 0.5) * 22,
          vx: Math.cos(angle) * speed + (Math.random() - 0.2) * 3,
          vy: Math.sin(angle) * speed - 2.8,
          color: bloodPalette[Math.floor(Math.random() * bloodPalette.length)],
          size: isSpark ? 2 + Math.random() * 2.8 : 3.8 + Math.random() * 4.8,
          alpha: 1,
          decay: 0.019 + Math.random() * 0.015,
          shape: isSpark ? 'spark' : 'blood',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.4,
        });
      }
    }

    // 5. Partículas de Impacto Especializadas por Cada Raridade
    const count = isCrit ? 40 : 25;

    switch (rarity) {
      case 'comum':
        // Faíscas de têmpera de aço incandescente e lascas de ferro
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            color: Math.random() > 0.4 ? '#e4e4e7' : '#f59e0b',
            size: 2.5 + Math.random() * 2,
            alpha: 1,
            decay: 0.035,
            shape: 'spark',
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.2,
          });
        }
        break;

      case 'incomum':
        // Lâminas de energia verde esmeralda bio-místicas e névoa de corte
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3 + Math.random() * 6.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.8,
            color: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'][Math.floor(Math.random() * 4)],
            size: 3.2 + Math.random() * 2.8,
            alpha: 1,
            decay: 0.03,
            shape: 'blade',
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.25,
          });
        }
        break;

      case 'rara':
        // Estilhaços de gelo azul celeste e faíscas elétricas crepitantes
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3.5 + Math.random() * 7;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            color: ['#0ea5e9', '#38bdf8', '#e0f2fe', '#ffffff'][Math.floor(Math.random() * 4)],
            size: 3.5 + Math.random() * 3,
            alpha: 1,
            decay: 0.028,
            shape: 'crystal',
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.3,
          });
        }
        break;

      case 'epica':
        // Vórtice arcano violeta e runas misteriosas explodindo
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3.5 + Math.random() * 7.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.2,
            color: ['#a855f7', '#c084fc', '#e879f9', '#f3e8ff'][Math.floor(Math.random() * 4)],
            size: 3.8 + Math.random() * 3.5,
            alpha: 1,
            decay: 0.026,
            shape: 'rune',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.3,
          });
        }
        break;

      case 'lendaria':
        // Fogo solar incandescente e estrelas de ouro reluzentes
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 8;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.5,
            color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
            size: 4.2 + Math.random() * 3.8,
            alpha: 1,
            decay: 0.024,
            shape: 'star',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.35,
          });
        }
        break;

      case 'mitica':
        // Lâminas carmesim cortantes e fumaça escura de batalha
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4.5 + Math.random() * 8.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.5,
            color: ['#e11d48', '#f43f5e', '#fb7185', '#881337', '#ffffff'][Math.floor(Math.random() * 5)],
            size: 4.5 + Math.random() * 4,
            alpha: 1,
            decay: 0.022,
            shape: 'blade',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.4,
          });
        }
        break;

      case 'ancestral':
        // Glifos arcaicos turquesa e fendas etéreas neon
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4.5 + Math.random() * 9;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.8,
            color: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ffffff'][Math.floor(Math.random() * 5)],
            size: 4.5 + Math.random() * 4,
            alpha: 1,
            decay: 0.02,
            shape: 'rune',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.3,
          });
        }
        break;

      case 'cosmica':
        // Poeira estelar fúcsia e índigo cintilante com estrelas cósmicas
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 5 + Math.random() * 9.5;
          const isFuchsia = Math.random() > 0.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            color: isFuchsia ? '#ec4899' : '#818cf8',
            size: 4.5 + Math.random() * 4.5,
            alpha: 1,
            decay: 0.019,
            shape: 'star',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.4,
          });
        }
        break;

      case 'divina':
        // Feixe celestial sagrado vertical dourado/branco
        this.beams.push({
          x,
          width: 38,
          color: '#ffffff',
          alpha: 0.88,
          decay: 0.04,
        });

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 5.5 + Math.random() * 10;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.2,
            color: ['#fbbf24', '#fde047', '#fef08a', '#ffffff'][Math.floor(Math.random() * 4)],
            size: 5 + Math.random() * 4.5,
            alpha: 1,
            decay: 0.018,
            shape: 'crystal',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.35,
          });
        }
        break;

      case 'primordial':
        // Super-impacto prismático com todas as cores do arco-íris
        this.beams.push({
          x,
          width: 55,
          color: '#fde047',
          alpha: 0.95,
          decay: 0.035,
        });

        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          const speed = 6 + Math.random() * 11;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.5,
            color: RAINBOW_PALETTE[i % RAINBOW_PALETTE.length],
            size: 5.5 + Math.random() * 5,
            alpha: 1,
            decay: 0.016,
            shape: ['blade', 'crystal', 'rune', 'star'][i % 4] as any,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.5,
          });
        }
        break;
    }

    // 6. Exibir Dano Flutuante
    if (damage > 0) {
      this.labels.push({
        x: x + (Math.random() - 0.5) * 35,
        y: y - 25,
        text: isCrit ? `💥 CRÍTICO! -${damage}` : `-${damage}`,
        color: isCrit ? '#fde047' : rDef.color,
        alpha: 1,
        scale: isCrit ? 1.55 : 1.3,
        vy: -2.3,
        isCurrency: false,
      });
    }

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * EFEITO EXCLUSIVO DE FORJA POR RARIDADE
   */
  public triggerMerge(
    x: number,
    y: number,
    accentColor: string,
    tier: number,
    rarity: WeaponRarity = 'comum',
    weaponName: string = ''
  ) {
    const rarityDef = getRarityData(rarity);

    switch (rarity) {
      case 'comum': {
        this.shockwaves.push({
          x,
          y,
          radius: 6,
          maxRadius: 60,
          color: '#d4d4d8',
          alpha: 0.9,
          lineWidth: 3,
        });

        for (let i = 0; i < 28; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            color: Math.random() > 0.4 ? '#f97316' : '#facc15',
            size: 2.5 + Math.random() * 2,
            alpha: 1,
            decay: 0.025 + Math.random() * 0.02,
            shape: 'spark',
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.1,
          });
        }
        for (let i = 0; i < 10; i++) {
          this.particles.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 1,
            vy: -1 - Math.random() * 1.5,
            color: '#71717a',
            size: 4 + Math.random() * 3,
            alpha: 0.6,
            decay: 0.02,
            shape: 'circle',
          });
        }
        break;
      }

      case 'incomum': {
        this.shockwaves.push({
          x,
          y,
          radius: 8,
          maxRadius: 75,
          color: '#22c55e',
          alpha: 1,
          lineWidth: 4,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 4,
          maxRadius: 50,
          color: '#86efac',
          alpha: 0.8,
          lineWidth: 2,
        });

        for (let i = 0; i < 40; i++) {
          const angle = (Math.PI * 2 * i) / 40;
          const speed = 2.5 + Math.random() * 4.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            color: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'][Math.floor(Math.random() * 4)],
            size: 3 + Math.random() * 3,
            alpha: 1,
            decay: 0.02,
            shape: Math.random() > 0.4 ? 'blade' : 'spark',
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.15,
          });
        }
        break;
      }

      case 'rara': {
        this.shockwaves.push({
          x,
          y,
          radius: 10,
          maxRadius: 85,
          color: '#0ea5e9',
          alpha: 1,
          lineWidth: 4.5,
        });

        for (let i = 0; i < 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3 + Math.random() * 5.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.2,
            color: ['#38bdf8', '#7dd3fc', '#e0f2fe', '#ffffff'][Math.floor(Math.random() * 4)],
            size: 3.5 + Math.random() * 3.5,
            alpha: 1,
            decay: 0.018,
            shape: 'crystal',
            rotation: Math.random() * Math.PI,
            rotationSpeed: 0.2,
          });
        }
        break;
      }

      case 'epica': {
        this.shockwaves.push({
          x,
          y,
          radius: 12,
          maxRadius: 95,
          color: '#a855f7',
          alpha: 1,
          lineWidth: 5,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 6,
          maxRadius: 65,
          color: '#c084fc',
          alpha: 0.9,
          lineWidth: 3,
        });

        for (let i = 0; i < 60; i++) {
          const angle = (Math.PI * 2 * i) / 60;
          const speed = 2.8 + Math.random() * 6;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            color: ['#a855f7', '#c084fc', '#e879f9', '#f3e8ff'][Math.floor(Math.random() * 4)],
            size: 4 + Math.random() * 4,
            alpha: 1,
            decay: 0.016,
            shape: Math.random() > 0.3 ? 'rune' : 'star',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
          });
        }
        break;
      }

      case 'lendaria': {
        this.shockwaves.push({
          x,
          y,
          radius: 15,
          maxRadius: 115,
          color: '#f59e0b',
          alpha: 1,
          lineWidth: 6,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 8,
          maxRadius: 80,
          color: '#fef08a',
          alpha: 1,
          lineWidth: 3.5,
        });

        for (let i = 0; i < 75; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3.5 + Math.random() * 7;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
            size: 4.5 + Math.random() * 4.5,
            alpha: 1,
            decay: 0.015,
            shape: 'star',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.25,
          });
        }
        break;
      }

      case 'mitica': {
        this.shockwaves.push({
          x,
          y,
          radius: 16,
          maxRadius: 125,
          color: '#e11d48',
          alpha: 1,
          lineWidth: 6,
        });

        for (let i = 0; i < 85; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 7.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.2,
            color: ['#e11d48', '#f43f5e', '#fb7185', '#ffe4e6', '#881337'][Math.floor(Math.random() * 5)],
            size: 4 + Math.random() * 5,
            alpha: 1,
            decay: 0.014,
            shape: 'blade',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.35,
          });
        }
        break;
      }

      case 'ancestral': {
        this.shockwaves.push({
          x,
          y,
          radius: 18,
          maxRadius: 135,
          color: '#06b6d4',
          alpha: 1,
          lineWidth: 6.5,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 9,
          maxRadius: 90,
          color: '#67e8f9',
          alpha: 0.9,
          lineWidth: 4,
        });

        for (let i = 0; i < 95; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3.5 + Math.random() * 8;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            color: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ffffff'][Math.floor(Math.random() * 5)],
            size: 4 + Math.random() * 5,
            alpha: 1,
            decay: 0.013,
            shape: 'rune',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.2,
          });
        }
        break;
      }

      case 'cosmica': {
        this.shockwaves.push({
          x,
          y,
          radius: 20,
          maxRadius: 150,
          color: '#ec4899',
          alpha: 1,
          lineWidth: 7,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 10,
          maxRadius: 110,
          color: '#6366f1',
          alpha: 0.9,
          lineWidth: 4.5,
        });

        for (let i = 0; i < 110; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 8.5;
          const isFuchsia = Math.random() > 0.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.5,
            color: isFuchsia ? '#ec4899' : '#818cf8',
            size: 4.5 + Math.random() * 5.5,
            alpha: 1,
            decay: 0.012,
            shape: 'star',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.4,
          });
        }
        break;
      }

      case 'divina': {
        this.beams.push({
          x,
          width: 50,
          color: '#fef08a',
          alpha: 0.9,
          decay: 0.018,
        });

        this.shockwaves.push({
          x,
          y,
          radius: 22,
          maxRadius: 170,
          color: '#fbbf24',
          alpha: 1,
          lineWidth: 7.5,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 12,
          maxRadius: 125,
          color: '#ffffff',
          alpha: 1,
          lineWidth: 5,
        });

        for (let i = 0; i < 130; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 4.5 + Math.random() * 9;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.2,
            color: ['#fbbf24', '#fde047', '#fef08a', '#ffffff'][Math.floor(Math.random() * 4)],
            size: 5 + Math.random() * 5.5,
            alpha: 1,
            decay: 0.011,
            shape: Math.random() > 0.5 ? 'star' : 'crystal',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.3,
          });
        }
        break;
      }

      case 'primordial': {
        this.beams.push({
          x,
          width: 80,
          color: '#ffffff',
          alpha: 1,
          decay: 0.014,
        });

        this.shockwaves.push({
          x,
          y,
          radius: 25,
          maxRadius: 210,
          color: '#ec4899',
          alpha: 1,
          lineWidth: 9,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 16,
          maxRadius: 160,
          color: '#06b6d4',
          alpha: 1,
          lineWidth: 6,
        });
        this.shockwaves.push({
          x,
          y,
          radius: 8,
          maxRadius: 110,
          color: '#fbbf24',
          alpha: 1,
          lineWidth: 5,
        });

        for (let i = 0; i < 160; i++) {
          const angle = (Math.PI * 2 * i) / 160;
          const speed = 5 + Math.random() * 11;
          const rainbowColor = RAINBOW_PALETTE[i % RAINBOW_PALETTE.length];
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.5,
            color: rainbowColor,
            size: 5.5 + Math.random() * 6.5,
            alpha: 1,
            decay: 0.009,
            shape: ['star', 'blade', 'crystal', 'rune'][i % 4] as any,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.5,
          });
        }
        break;
      }
    }

    const titleText = weaponName ? `✨ TIER ${tier} · ${weaponName} ✨` : `✨ TIER ${tier}! ✨`;
    const rarityText = `[ ${rarityDef.label.toUpperCase()} ]`;

    this.labels.push({
      x,
      y: y - 28,
      text: titleText,
      subText: rarityText,
      color: tier >= 10 ? '#fde047' : '#ffffff',
      subColor: rarityDef.color,
      alpha: 1,
      scale: tier >= 10 ? 1.45 : 1.3,
      vy: -1.2,
      isCurrency: false,
      durationFrames: 160,
      ageFrames: 0,
    });

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * Números flutuantes (+2 Cédulas) ao vender, mensagens de fusão ou recompensas
   * Duração mínima garantida de 2.5 segundos para leitura clara do usuário
   */
  public triggerFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#4ade80',
    durationMs: number = 2500
  ) {
    const durationFrames = Math.max(150, Math.round((durationMs / 1000) * 60));

    this.labels.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1.25,
      vy: -1.2,
      isCurrency: true,
      durationFrames,
      ageFrames: 0,
    });

    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 3.5;
      const isGold = Math.random() > 0.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2,
        color: isGold ? '#facc15' : color,
        size: isGold ? 3.5 : 2.5,
        alpha: 1,
        decay: 0.032,
        shape: isGold ? 'circle' : 'spark',
      });
    }

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * EFEITO VISUAL DE FUMAÇA DE FORJA NO CANVAS (AO INICIAR CRAFT/FUSÃO NA BANCADA 4X4)
   * Emite partículas de fumaça e faíscas incandescentes que se dissipam para cima
   */
  public triggerForgeSmoke(x: number, y: number, color: string = '#f59e0b') {
    const smokeColors = ['#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#d4d4d8', color];
    const count = this.powerSaver ? 12 : 22;

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 1.2 + Math.random() * 2.8;
      const chosenColor = smokeColors[Math.floor(Math.random() * smokeColors.length)];
      const isSpark = Math.random() < 0.35;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 22,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.8,
        vy: Math.sin(angle) * speed - 1.2,
        color: isSpark ? color : chosenColor,
        size: isSpark ? 2 + Math.random() * 2 : 3.8 + Math.random() * 4.5,
        alpha: 0.85,
        decay: 0.022 + Math.random() * 0.016,
        shape: isSpark ? 'spark' : 'circle',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
      });
    }

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * EFEITO DE AURA CONSTANTE PARA ARMAS PRIMORDIAIS NA BANCADA
   * Emite brilhos cósmicos prismáticos, estrelas e runas etéreas flutuantes ao redor do slot
   */
  public emitPrimordialAura(x: number, y: number, radius: number = 38) {
    const rainbowColors = [
      '#ef4444', // Vermelho Rubi
      '#f59e0b', // Âmbar Solar
      '#10b981', // Esmeralda
      '#06b6d4', // Ciano Cristal
      '#8b5cf6', // Violeta Astral
      '#ec4899', // Rosa Cósmico
      '#fde047', // Dourado
      '#ffffff', // Branco Estelar
    ];

    const count = 2; // Emissão leve e contínua a cada pulso de frame
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = (radius * 0.35) + Math.random() * (radius * 0.7);
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;

      const speed = 0.6 + Math.random() * 1.6;
      const tangentAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      const shapes: ('star' | 'spark' | 'crystal' | 'rune')[] = ['star', 'spark', 'crystal', 'rune'];
      const chosenShape = shapes[Math.floor(Math.random() * shapes.length)];
      const chosenColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];

      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(tangentAngle) * speed * 0.5,
        vy: -0.6 - Math.random() * 1.2,
        color: chosenColor,
        size: 2.5 + Math.random() * 3.5,
        alpha: 0.95,
        decay: 0.022 + Math.random() * 0.018,
        shape: chosenShape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
      });
    }

    // Mini-pulso de onda etérea suave ocasional
    if (Math.random() < 0.08) {
      this.shockwaves.push({
        x,
        y,
        radius: 8,
        maxRadius: radius * 1.15,
        color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
        alpha: 0.6,
        lineWidth: 1.8,
      });
    }

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * ANIMAÇÃO DE ABERTURA DE BAÚ DO PASSE DE TEMPORADA
   * Erupção e chafariz de moedas de ouro saindo do baú com raios dourados e shockwaves
   */
  public triggerChestOpening(
    x: number,
    y: number,
    rewardTitle: string = 'BAÚ RESGATADO!',
    rewardSubtext: string = '+Recompensas Coletadas',
    isPremium: boolean = false
  ) {
    // 1. Flash ambiente dourado na tela
    this.screenFlash = {
      color: isPremium ? '#fde047' : '#f59e0b',
      alpha: isPremium ? 0.35 : 0.22,
      decay: 0.04,
    };

    // 2. Feixe de luz celestial ascendente que irrompe do baú
    this.beams.push({
      x,
      width: isPremium ? 65 : 45,
      color: isPremium ? '#fef08a' : '#facc15',
      alpha: 0.95,
      decay: 0.025,
    });

    // 3. Flash de luz radial no ponto central do baú
    this.flashes.push({
      x,
      y,
      radius: 15,
      maxRadius: isPremium ? 150 : 110,
      color: isPremium ? '#ffffff' : '#fde047',
      alpha: 1,
      decay: 0.045,
    });

    // 4. Múltiplas Shockwaves douradas concêntricas
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: isPremium ? 180 : 130,
      color: '#facc15',
      alpha: 1,
      lineWidth: 6,
    });
    this.shockwaves.push({
      x,
      y,
      radius: 6,
      maxRadius: isPremium ? 120 : 85,
      color: '#ffffff',
      alpha: 0.9,
      lineWidth: 4,
    });

    // 5. Chafariz / Erupção de Moedas de Ouro saltando para o ar (Fountain Burst)
    const coinCount = isPremium ? 55 : 38;
    const goldCoinsPalette = ['#fde047', '#facc15', '#fbbf24', '#f59e0b', '#d97706', '#fef08a'];

    for (let i = 0; i < coinCount; i++) {
      // Leque ascendente em formato de arco de fonte (-PI/2 ± 60 graus)
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 6 + Math.random() * 9.5;
      const color = goldCoinsPalette[Math.floor(Math.random() * goldCoinsPalette.length)];

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 5 + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed - 3.5, // Impulso vertical inicial
        color,
        size: 5 + Math.random() * 4, // Tamanho da moeda
        alpha: 1,
        decay: 0.013 + Math.random() * 0.008,
        shape: 'coin',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.45,
      });
    }

    // 6. Faíscas brilhantes, estrelas e cristais dourados no entorno
    const sparkCount = isPremium ? 35 : 20;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: isPremium && i % 3 === 0 ? '#38bdf8' : '#ffffff',
        size: 3 + Math.random() * 3.5,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.015,
        shape: isPremium ? 'star' : 'spark',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      });
    }

    // 7. Rótulo Flutuante do Baú
    this.labels.push({
      x,
      y: y - 45,
      text: `📦 ${rewardTitle}`,
      subText: rewardSubtext,
      color: isPremium ? '#fde047' : '#4ade80',
      subColor: isPremium ? '#fbbf24' : '#a7f3d0',
      alpha: 1,
      scale: 1.4,
      vy: -1.4,
      isCurrency: false,
      durationFrames: 170,
      ageFrames: 0,
    });

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * ANIMAÇÃO ESPECIAL DE VITÓRIA DE FASE (10/10 MONSTROS DERROTADOS)
   * Dispara confetes multicoloridos, chuvas de estrelas/moedas, múltiplos feixes celestiais e shockwaves
   */
  public triggerStageVictory(stage: number, stageReward: number = 0) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // 1. Flash Radiante Dourado/Branco em tela inteira
    this.screenFlash = {
      color: '#ffffff',
      alpha: 0.9,
      decay: 0.022,
    };

    // 2. Múltiplos Feixes Celestiais de Luz
    const beamPositions = [cx * 0.4, cx * 0.8, cx * 1.2, cx * 1.6];
    const beamColors = ['#facc15', '#38bdf8', '#e879f9', '#4ade80'];
    beamPositions.forEach((bx, idx) => {
      this.beams.push({
        x: bx,
        width: 40 + Math.random() * 30,
        color: beamColors[idx % beamColors.length],
        alpha: 0.9,
        decay: 0.02,
      });
    });

    // 3. Shockwaves Triplas Expansivas
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 10,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.65,
      color: '#facc15',
      alpha: 1,
      lineWidth: 8,
    });
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 8,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.48,
      color: '#ec4899',
      alpha: 0.9,
      lineWidth: 6,
    });
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 6,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.8,
      color: '#38bdf8',
      alpha: 0.8,
      lineWidth: 5,
    });

    // 4. Chuva Massiva de Confetes, Estrelas e Moedas Douradas (3 pontos de erupção)
    const origins = [cx * 0.3, cx, cx * 1.7];
    const confettiColors = [
      '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
      '#8b5cf6', '#ec4899', '#fde047', '#ffffff',
      '#fbbf24', '#38bdf8', '#4ade80', '#c084fc',
    ];
    const shapes: ('star' | 'coin' | 'spark' | 'circle' | 'blade')[] = ['star', 'coin', 'spark', 'circle', 'blade'];
    const countPerOrigin = this.powerSaver ? 25 : 55;

    origins.forEach((ox) => {
      for (let i = 0; i < countPerOrigin; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const speed = 7 + Math.random() * 12;
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        this.particles.push({
          x: ox + (Math.random() - 0.5) * 40,
          y: cy + 60 + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
          vy: Math.sin(angle) * speed - 4.5,
          color,
          size: shape === 'coin' ? 5.5 + Math.random() * 4 : 4 + Math.random() * 4,
          alpha: 1,
          decay: 0.01 + Math.random() * 0.008,
          shape,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.5,
        });
      }
    });

    // 5. Rótulo Flutuante Triunfal no Centro
    this.labels.push({
      x: cx,
      y: cy - 40,
      text: `🏆 FASE ${stage} CONCLUÍDA!`,
      subText: `✨ 10/10 Monstros Eliminados${stageReward > 0 ? ` · +${stageReward.toLocaleString('pt-BR')} Cédulas` : ''}`,
      color: '#facc15',
      subColor: '#4ade80',
      alpha: 1,
      scale: 1.85,
      vy: -1.2,
      isCurrency: false,
      durationFrames: 190,
      ageFrames: 0,
    });

    if (this.onFrameCallback) this.onFrameCallback();
  }

  /**
   * ANIMAÇÃO ESPECIAL DE DERROTA DO JOGADOR
   * Dispara flash escarlate de sangue, estilhaços de lâminas e shockwaves sangrentas
   */
  public triggerPlayerDefeat(stage: number) {
    const cx = window.innerWidth * 0.35;
    const cy = window.innerHeight * 0.45;

    // 1. Flash Vermelho Sangue / Carmesim em tela inteira
    this.screenFlash = {
      color: '#dc2626',
      alpha: 0.95,
      decay: 0.024,
    };

    // 2. Shockwaves Rubras Sombrias
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 10,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.55,
      color: '#ef4444',
      alpha: 1,
      lineWidth: 7,
    });
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 6,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.35,
      color: '#7f1d1d',
      alpha: 0.9,
      lineWidth: 5,
    });

    // 3. Erupção de Sangue e Estilhaços
    const bloodColors = ['#dc2626', '#b91c1c', '#7f1d1d', '#991b1b', '#450a0a', '#18181b', '#ef4444'];
    const particleCount = this.powerSaver ? 40 : 80;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      const color = bloodColors[Math.floor(Math.random() * bloodColors.length)];

      this.particles.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color,
        size: 3.5 + Math.random() * 4.5,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.015,
        shape: Math.random() > 0.4 ? 'blood' : 'spark',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
      });
    }

    // 4. Rótulo Flutuante de Derrota
    this.labels.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 30,
      text: '💀 VOCÊ FOI DERROTADO!',
      subText: `Fase ${stage} · Recupere sua vida e aprimore suas armas na Bancada!`,
      color: '#f43f5e',
      subColor: '#fca5a5',
      alpha: 1,
      scale: 1.75,
      vy: -1.0,
      isCurrency: false,
      durationFrames: 180,
      ageFrames: 0,
    });

    if (this.onFrameCallback) this.onFrameCallback();
  }

  public update() {
    // 1. Atualizar Flash Ambiente de Tela
    if (this.screenFlash) {
      this.screenFlash.alpha -= this.screenFlash.decay;
      if (this.screenFlash.alpha <= 0) {
        this.screenFlash = null;
      }
    }

    // 2. Atualizar Flashes Radiais de Batalha
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.alpha -= f.decay;
      f.radius += (f.maxRadius - f.radius) * 0.28 + 2.5;
      if (f.alpha <= 0) {
        this.flashes.splice(i, 1);
      }
    }

    // 3. Atualizar Rastros de Corte da Arma (Slashes)
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.alpha -= s.decay;
      s.length += 3.5;
      if (s.alpha <= 0) {
        this.slashes.splice(i, 1);
      }
    }

    // 4. Atualizar Feixes Verticais Celestiais
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.alpha -= b.decay;
      b.width = Math.max(10, b.width - 0.4);
      if (b.alpha <= 0) {
        this.beams.splice(i, 1);
      }
    }

    // 5. Atualizar Ondas de Choque
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.22 + 1.6;
      sw.alpha -= 0.032;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 6. Atualizar Partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.96;
      p.alpha -= p.decay;
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed;
      }
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 7. Atualizar Textos Flutuantes (Mantém legibilidade total por no mínimo 2.5s)
    for (let i = this.labels.length - 1; i >= 0; i--) {
      const l = this.labels[i];
      l.y += l.vy;
      l.vy *= 0.94; // Suavização de flutuação para leitura confortável
      l.ageFrames = (l.ageFrames || 0) + 1;

      const totalFrames = l.durationFrames || 150; // Pelo menos 150 frames (~2.5s a 60fps)
      const fadeStartFrame = Math.max(30, totalFrames - 40);

      if (l.ageFrames >= totalFrames) {
        this.labels.splice(i, 1);
      } else if (l.ageFrames > fadeStartFrame) {
        l.alpha = Math.max(0, 1 - (l.ageFrames - fadeStartFrame) / 40);
        l.scale = Math.max(1, l.scale - 0.003);
      } else {
        l.alpha = 1; // 100% de nitidez e visibilidade na maior parte do tempo
      }
    }
  }
}

export const fx = new FXManager();

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { particles, shockwaves, beams, flashes, slashes, screenFlash, labels } = fx.getEntities();

      // 1. Desenhar Flash Ambiente de Tela Inteira
      if (screenFlash && screenFlash.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, screenFlash.alpha);
        ctx.fillStyle = screenFlash.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 2. Desenhar Flashes de Impacto Radial (Flashes de Luz da Batalha no Monstro)
      flashes.forEach((f) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, f.alpha);
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, Math.max(1, f.radius));
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, f.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(1, f.radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Desenhar Rastros de Corte da Lâmina (Slash Blade Arc)
      slashes.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 18;

        const dx = Math.cos(s.angle) * (s.length / 2);
        const dy = Math.sin(s.angle) * (s.length / 2);

        ctx.beginPath();
        ctx.moveTo(s.x - dx, s.y - dy);
        ctx.lineTo(s.x + dx, s.y + dy);
        ctx.stroke();

        // Núcleo branco no centro do corte da arma
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = s.width * 0.45;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Desenhar Feixes Verticais Celestiais (Divina & Primordial)
      beams.forEach((b) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, b.alpha);
        const grad = ctx.createLinearGradient(b.x - b.width / 2, 0, b.x + b.width / 2, 0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.5, b.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 25;
        ctx.fillRect(b.x - b.width / 2, 0, b.width, canvas.height);
        ctx.restore();
      });

      // 5. Desenhar Ondas de Choque
      shockwaves.forEach((sw) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius), 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = sw.lineWidth;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      });

      // 6. Desenhar Partículas com Formas Exclusivas
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;

        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);

        if (p.shape === 'star') {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(
              Math.cos(((18 + i * 72) * Math.PI) / 180) * p.size,
              -Math.sin(((18 + i * 72) * Math.PI) / 180) * p.size
            );
            ctx.lineTo(
              Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.size / 2.2),
              -Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.size / 2.2)
            );
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'blade') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size * 2);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'crystal') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.6);
          ctx.lineTo(p.size * 0.9, -p.size * 0.4);
          ctx.lineTo(p.size * 0.9, p.size * 0.4);
          ctx.lineTo(0, p.size * 1.6);
          ctx.lineTo(-p.size * 0.9, p.size * 0.4);
          ctx.lineTo(-p.size * 0.9, -p.size * 0.4);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'rune') {
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-p.size * 0.7, -p.size * 0.7, p.size * 1.4, p.size * 1.4);
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
        } else if (p.shape === 'spark') {
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.8, 0);
          ctx.lineTo(0, -p.size * 1.6);
          ctx.lineTo(p.size * 0.8, 0);
          ctx.lineTo(0, p.size * 1.6);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'blood') {
          ctx.beginPath();
          const speed = Math.hypot(p.vx, p.vy);
          const angle = Math.atan2(p.vy, p.vx);
          ctx.rotate(angle);
          ctx.ellipse(
            0,
            0,
            Math.max(1.5, p.size * (1 + Math.min(speed * 0.28, 2.4))),
            Math.max(1, p.size * 0.7),
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (p.shape === 'coin') {
          // Moeda de Ouro 3D Giratória com Borda e Brilho Interno
          const flipScale = Math.abs(Math.cos(p.rotation || 0));
          ctx.scale(Math.max(0.15, flipScale), 1);

          // Borda externa da moeda
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Anel interno da moeda
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.72, 0, Math.PI * 2);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Ponto de brilho / glint
          ctx.beginPath();
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 7. Desenhar Textos Flutuantes e Dano
      labels.forEach((l) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, l.alpha);
        ctx.font = `bold ${Math.round(15 * l.scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeText(l.text, l.x, l.y);

        ctx.fillStyle = l.color;
        ctx.fillText(l.text, l.x, l.y);

        if (l.subText && l.subColor) {
          ctx.font = `bold ${Math.round(12 * l.scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.strokeText(l.subText, l.x, l.y + 20 * l.scale);
          ctx.fillStyle = l.subColor;
          ctx.fillText(l.subText, l.x, l.y + 20 * l.scale);
        }

        ctx.restore();
      });

      fx.update();

      if (fx.hasActiveEffects()) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    const kickstart = () => {
      if (animFrameRef.current === null) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    fx.setCallback(kickstart);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};
