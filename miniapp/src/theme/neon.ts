/**
 * AnimeTown neon theme: dark purple + neon cyan/pink glow.
 */

export const neon = {
  bg: {
    dark: '#0d0a14',
    card: 'rgba(26, 10, 46, 0.7)',
    elevated: 'rgba(37, 21, 56, 0.85)',
    gradient: 'linear-gradient(180deg, #0d0a14 0%, #1a0a2e 50%, #0d0a14 100%)',
  },
  gradient: {
    purple: 'linear-gradient(135deg, #7b2cbf 0%, #9d4edd 50%, #c77dff 100%)',
    cyan: 'linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)',
    pink: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    glow: 'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.35) 0%, transparent 70%)',
    pinkGlow: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
  },
  border: {
    glow: '0 0 12px rgba(0, 180, 216, 0.5)',
    glowPink: '0 0 12px rgba(236, 72, 153, 0.4)',
    cyan: '1px solid rgba(0, 180, 216, 0.6)',
    pink: '1px solid rgba(236, 72, 153, 0.5)',
    glass: '1px solid rgba(248, 240, 255, 0.1)',
  },
  shadow: {
    neon: '0 0 20px rgba(0, 180, 216, 0.3), 0 0 40px rgba(123, 44, 191, 0.2)',
    card: '0 4px 24px rgba(0,0,0,0.4)',
  },
  text: {
    primary: '#f8f0ff',
    secondary: 'rgba(248, 240, 255, 0.85)',
    muted: 'rgba(248, 240, 255, 0.5)',
  },
  transition: '0.2s ease',
} as const

export type NeonTheme = typeof neon
