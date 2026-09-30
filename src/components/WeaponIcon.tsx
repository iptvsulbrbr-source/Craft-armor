import React from 'react';

interface WeaponIconProps {
  tier: number;
  className?: string;
  size?: number;
}

export const WeaponIcon: React.FC<WeaponIconProps> = ({ tier, className = '', size = 48 }) => {
  // SVG silhouette with custom tier gradients & styling
  switch (tier) {
    case 1:
      // Adaga Enferrujada (Tier 1) - Rusty Dagger
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a1a1aa" />
              <stop offset="0.6" stopColor="#71717a" />
              <stop offset="1" stopColor="#52525b" />
            </linearGradient>
            <linearGradient id={`rust-${tier}`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#b45309" stopOpacity="0.8" />
              <stop offset="1" stopColor="#78350f" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Blade */}
          <path d="M38 10L32 12L18 26L16 28L20 32L22 30L36 16L38 10Z" fill={`url(#grad-${tier})`} />
          <path d="M38 10L25 23L27 25L38 10Z" fill="#d4d4d8" />
          <circle cx="28" cy="18" r="1.5" fill={`url(#rust-${tier})`} />
          <circle cx="23" cy="23" r="1" fill={`url(#rust-${tier})`} />
          {/* Guard */}
          <path d="M14 26L22 34L20 36L12 28Z" fill="#71717a" />
          {/* Hilt & Pommel */}
          <path d="M15 31L10 36L8 38L10 40L12 38L17 33Z" fill="#52525b" stroke="#3f3f46" strokeWidth="1" />
          <circle cx="9" cy="39" r="2.5" fill="#71717a" />
        </svg>
      );

    case 2:
      // Faca Tática de Ferro (Tier 2) - Tactical Iron Knife
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.4" stopColor="#94a3b8" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Tactical Blade */}
          <path d="M40 8L31 11L18 24L17 29L22 30L34 17L37 8Z" fill={`url(#grad-${tier})`} />
          <path d="M40 8L26 22L29 25L40 8Z" fill="#e2e8f0" fillOpacity="0.8" />
          {/* Serration */}
          <path d="M22 20L20 22M25 17L23 19M28 14L26 16" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
          {/* Crossguard */}
          <rect x="15" y="27" width="9" height="3" rx="1.5" transform="rotate(-45 15 27)" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          {/* Grip */}
          <path d="M15 31L9 37L7 41L11 39L17 33Z" fill="#1e293b" />
          <circle cx="8" cy="40" r="2" fill="#38bdf8" />
        </svg>
      );

    case 3:
      // Espada Curta Reforçada (Tier 3) - Reinforced Short Sword
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="12" y1="6" x2="42" y2="36">
              <stop stopColor="#4ade80" />
              <stop offset="0.5" stopColor="#cbd5e1" />
              <stop offset="1" stopColor="#64748b" />
            </linearGradient>
          </defs>
          {/* Double-edged Blade */}
          <path d="M42 6L33 13L20 26L18 28L20 30L22 30L35 17L42 6Z" fill={`url(#grad-${tier})`} />
          <path d="M42 6L21 27L42 6Z" stroke="#22c55e" strokeWidth="1" />
          <line x1="42" y1="6" x2="20" y2="28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          {/* Emerald inlay guard */}
          <path d="M13 25L23 35L20 38L10 28Z" fill="#1e293b" stroke="#4ade80" strokeWidth="1.5" />
          <circle cx="16.5" cy="31.5" r="2" fill="#22c55e" />
          {/* Handle */}
          <path d="M14 34L9 39L7 41L10 42L15 37Z" fill="#334155" />
          <circle cx="8" cy="41" r="2.5" fill="#4ade80" />
        </svg>
      );

    case 4:
      // Espada Larga Rúnica (Tier 4) - Runic Broadsword
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="5" y1="5" x2="43" y2="43">
              <stop stopColor="#93c5fd" />
              <stop offset="0.5" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          {/* Wide Blade */}
          <path d="M43 5L32 11L18 25L17 29L22 30L36 16L43 5Z" fill={`url(#grad-${tier})`} />
          <path d="M43 5L28 20L31 23L43 5Z" fill="#dbeafe" />
          {/* Glowing Runes */}
          <path d="M33 14L30 16L32 18M26 21L23 23L25 25" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
          {/* Heavy Winged Crossguard */}
          <path d="M11 25L25 39L22 42L8 28Z" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Pommel with gem */}
          <path d="M13 37L7 43" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
          <circle cx="6" cy="44" r="3" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
        </svg>
      );

    case 5:
      // Machado de Batalha Duplo (Tier 5) - Dual Battle Axe
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="8" y1="8" x2="40" y2="40">
              <stop stopColor="#e879f9" />
              <stop offset="0.5" stopColor="#a855f7" />
              <stop offset="1" stopColor="#581c87" />
            </linearGradient>
          </defs>
          {/* Handle Shaft */}
          <line x1="40" y1="8" x2="8" y2="40" stroke="#71717a" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="38" y1="10" x2="10" y2="38" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          {/* Top Crescent Blade */}
          <path d="M38 10C35 4 24 6 22 14C28 17 32 17 38 10Z" fill={`url(#grad-${tier})`} stroke="#f3e8ff" strokeWidth="1" />
          {/* Bottom Crescent Blade */}
          <path d="M38 10C44 13 42 24 34 26C31 20 31 16 38 10Z" fill={`url(#grad-${tier})`} stroke="#f3e8ff" strokeWidth="1" />
          {/* Central Spike */}
          <path d="M41 7L44 4L43 9Z" fill="#e879f9" />
        </svg>
      );

    case 6:
      // Cimitarra Flamejante (Tier 6) - Flame Scimitar
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="10" y1="6" x2="42" y2="38">
              <stop stopColor="#fef08a" />
              <stop offset="0.3" stopColor="#f97316" />
              <stop offset="0.8" stopColor="#dc2626" />
              <stop offset="1" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          {/* Curved Curved Scimitar Blade */}
          <path d="M42 6C36 12 30 18 19 27L17 31L22 32C30 25 38 19 42 6Z" fill={`url(#grad-${tier})`} />
          {/* Flame spikes on blade edge */}
          <path d="M38 11C36 8 32 12 31 16M29 17C27 15 24 19 23 23" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
          {/* Ornate Gold Guard */}
          <path d="M13 27C17 28 20 31 23 35L20 37C17 33 14 30 10 29Z" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          {/* Handle */}
          <path d="M14 33L9 38L6 42L10 42L15 37Z" fill="#1c1917" stroke="#ea580c" strokeWidth="1" />
          <circle cx="7" cy="42" r="3" fill="#f97316" />
        </svg>
      );

    case 7:
      // Lança Glacial do Guardião (Tier 7) - Glacial Frost Spear
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="42" y1="6" x2="10" y2="38">
              <stop stopColor="#a5f3fc" />
              <stop offset="0.4" stopColor="#38bdf8" />
              <stop offset="0.9" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          {/* Long Spear Shaft */}
          <line x1="32" y1="16" x2="8" y2="40" stroke="#0e7490" strokeWidth="2.5" strokeLinecap="round" />
          {/* Crystal Spear Head */}
          <polygon points="44,4 34,10 32,16 38,14" fill={`url(#grad-${tier})`} stroke="#cffafe" strokeWidth="1" />
          <polygon points="44,4 40,14 34,10" fill="#ffffff" fillOpacity="0.8" />
          {/* Lateral Ice Shards */}
          <polygon points="32,12 28,11 31,16" fill="#67e8f9" />
          <polygon points="36,16 37,20 32,17" fill="#67e8f9" />
          {/* Frost aura particles */}
          <circle cx="41" cy="7" r="1.5" fill="#e0f2fe" />
          <circle cx="35" cy="18" r="1" fill="#e0f2fe" />
        </svg>
      );

    case 8:
      // Martelo do Trovão Místico (Tier 8) - Thunder Warhammer
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="16" y1="8" x2="40" y2="32">
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#eab308" />
              <stop offset="1" stopColor="#854d0e" />
            </linearGradient>
          </defs>
          {/* Shaft */}
          <line x1="30" y1="18" x2="8" y2="40" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          {/* Heavy Hammer Head */}
          <rect x="24" y="8" width="18" height="14" rx="2" transform="rotate(-45 33 15)" fill={`url(#grad-${tier})`} stroke="#fef9c3" strokeWidth="1.5" />
          {/* Lightning Inscription */}
          <path d="M32 10L29 16L34 16L30 22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Golden Pommel */}
          <circle cx="8" cy="40" r="3.5" fill="#eab308" stroke="#fef08a" strokeWidth="1" />
        </svg>
      );

    case 9:
      // Glaive Espectral Sombrio (Tier 9) - Shadow Glaive
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="42" y1="6" x2="12" y2="36">
              <stop stopColor="#fda4af" />
              <stop offset="0.4" stopColor="#e11d48" />
              <stop offset="1" stopColor="#4c0519" />
            </linearGradient>
          </defs>
          {/* Shaft */}
          <line x1="28" y1="20" x2="8" y2="40" stroke="#27272a" strokeWidth="2.5" />
          {/* Curved Glaive Scythe Blade */}
          <path d="M44 6C36 6 28 14 26 22L30 24C34 18 39 12 44 6Z" fill={`url(#grad-${tier})`} stroke="#ffe4e6" strokeWidth="1" />
          <path d="M44 6C40 16 36 22 28 26L30 28C38 23 42 16 44 6Z" fill="#be123c" />
          {/* Crimson Eye */}
          <circle cx="28" cy="22" r="2" fill="#fda4af" stroke="#881337" strokeWidth="1" />
        </svg>
      );

    case 10:
      // Katana Dracônica Imperial (Tier 10) - Dragon Imperial Katana
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="42" y1="6" x2="16" y2="32">
              <stop stopColor="#fef08a" />
              <stop offset="0.3" stopColor="#f59e0b" />
              <stop offset="0.7" stopColor="#d97706" />
              <stop offset="1" stopColor="#451a03" />
            </linearGradient>
          </defs>
          {/* Elegant curved katana blade */}
          <path d="M43 5C35 12 28 20 18 29L16 32L19 33C28 24 36 15 43 5Z" fill={`url(#grad-${tier})`} stroke="#fef3c7" strokeWidth="1" />
          {/* Dragon hamon line */}
          <path d="M42 6C34 14 27 22 17 31" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />
          {/* Gold Tsuba (guard) */}
          <ellipse cx="17.5" cy="31.5" rx="4" ry="2.5" transform="rotate(-45 17.5 31.5)" fill="#b45309" stroke="#fef08a" strokeWidth="1.5" />
          {/* Tsuka (hilt with gold wraps) */}
          <path d="M15 34L9 40L7 42L10 43L16 37Z" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="8" cy="42" r="2.5" fill="#f59e0b" />
        </svg>
      );

    case 11:
      // Alfanje do Firmamento (Tier 11) - Firmament Saber
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="42" y1="6" x2="14" y2="34">
              <stop stopColor="#f5d0fe" />
              <stop offset="0.4" stopColor="#d946ef" />
              <stop offset="0.8" stopColor="#701a75" />
            </linearGradient>
          </defs>
          <path d="M44 4C35 11 27 21 17 31L16 33L20 34C29 23 38 13 44 4Z" fill={`url(#grad-${tier})`} stroke="#fae8ff" strokeWidth="1" />
          <line x1="44" y1="4" x2="19" y2="32" stroke="#ffffff" strokeWidth="1.5" />
          {/* Cosmic Orbs */}
          <circle cx="34" cy="14" r="1.5" fill="#f0abfc" />
          <circle cx="26" cy="22" r="2" fill="#e879f9" />
          {/* Guard */}
          <path d="M12 28L22 38L19 41L9 31Z" fill="#3b0764" stroke="#d946ef" strokeWidth="1.5" />
          <circle cx="8" cy="42" r="3" fill="#a21caf" stroke="#f5d0fe" strokeWidth="1" />
        </svg>
      );

    case 12:
      // Lâmina do Vazio Abissal (Tier 12) - Abyssal Void Blade
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="42" y1="6" x2="14" y2="34">
              <stop stopColor="#c7d2fe" />
              <stop offset="0.4" stopColor="#6366f1" />
              <stop offset="0.8" stopColor="#312e81" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Dark rift blade */}
          <path d="M44 4L32 12L28 17L18 27L16 30L20 32L30 22L36 18L44 4Z" fill={`url(#grad-${tier})`} stroke="#818cf8" strokeWidth="1" />
          {/* Void fissures */}
          <path d="M41 8L30 18M34 14L24 23" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="28" cy="20" r="3" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
          <circle cx="28" cy="20" r="1" fill="#e0e7ff" />
          {/* Handle */}
          <path d="M14 32L8 38L6 42L10 42L16 36Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
          <circle cx="7" cy="42" r="3" fill="#4f46e5" />
        </svg>
      );

    case 13:
      // Cetro da Singularidade (Tier 13) - Cosmic Singularity Scepter
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="38" y1="10" x2="8" y2="40">
              <stop stopColor="#99f6e4" />
              <stop offset="0.5" stopColor="#0d9488" />
              <stop offset="1" stopColor="#115e59" />
            </linearGradient>
          </defs>
          {/* Golden/Teal Staff */}
          <line x1="32" y1="16" x2="8" y2="40" stroke="#042f2e" strokeWidth="3" />
          <line x1="32" y1="16" x2="8" y2="40" stroke="#2dd4bf" strokeWidth="1.5" />
          {/* Singularity Core at Head */}
          <circle cx="36" cy="12" r="8" fill="#134e4a" stroke="#5eead4" strokeWidth="1.5" />
          <circle cx="36" cy="12" r="4" fill="#042f2e" />
          <circle cx="36" cy="12" r="1.5" fill="#ccfbf1" />
          {/* Rotating Planetary Ring */}
          <ellipse cx="36" cy="12" rx="10" ry="3" transform="rotate(-45 36 12)" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
      );

    case 14:
      // Foice do Juízo Celestial (Tier 14) - Celestial Scythe
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-${tier}`} x1="44" y1="4" x2="8" y2="40">
              <stop stopColor="#fef08a" />
              <stop offset="0.3" stopColor="#fbbf24" />
              <stop offset="0.7" stopColor="#d97706" />
              <stop offset="1" stopColor="#78350f" />
            </linearGradient>
          </defs>
          {/* Handle */}
          <line x1="26" y1="22" x2="8" y2="40" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="22" x2="8" y2="40" stroke="#fde047" strokeWidth="1" strokeLinecap="round" />
          {/* Giant Crescent Scythe Blade */}
          <path d="M46 6C34 4 22 14 20 26C24 23 30 21 34 20C32 14 38 8 46 6Z" fill={`url(#grad-${tier})`} stroke="#fef9c3" strokeWidth="1.5" />
          {/* Halo Wing Feathers */}
          <path d="M26 18C28 12 34 8 40 8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="21" cy="25" r="2.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
        </svg>
      );

    case 15:
    default:
      // Excalibur Primordial do Infinito (Tier 15) - Primordial Excalibur
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad-core-${tier}`} x1="44" y1="4" x2="16" y2="32">
              <stop stopColor="#ffffff" />
              <stop offset="0.25" stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#c084fc" />
              <stop offset="0.75" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          {/* Radiance aura */}
          <circle cx="24" cy="24" r="18" fill="none" stroke="#e0f2fe" strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Godly Master Blade */}
          <path d="M44 4L34 11L19 26L17 29L21 31L23 29L37 14L44 4Z" fill={`url(#grad-core-${tier})`} stroke="#ffffff" strokeWidth="1.5" />
          {/* Central Prismatic Beam */}
          <line x1="44" y1="4" x2="19" y2="29" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          {/* Divine Crossguard with wings */}
          <path d="M12 24C16 26 22 32 24 36L21 39C17 35 11 29 9 27Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
          <path d="M15 21C19 23 25 29 27 33L24 36C20 32 14 26 12 24Z" fill="#c084fc" />
          {/* Core Gem */}
          <circle cx="18" cy="30" r="3" fill="#ffffff" stroke="#facc15" strokeWidth="1.5" />
          {/* Royal Hilt & Infinity Pommel */}
          <path d="M15 34L10 39L8 42L11 43L16 38Z" fill="#1e1b4b" stroke="#fde047" strokeWidth="1" />
          <circle cx="8" cy="42" r="3.5" fill="#fde047" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );
  }
};
