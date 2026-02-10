/**
 * AnimeTown neon theme tokens.
 * Dark background, neon purple gradients, cyan glow borders.
 */

export const neon = {
  bg: {
    dark: '#0d0a14',
    card: '#1a0a2e',
    elevated: '#251538',
  },
  gradient: {
    purple: 'linear-gradient(135deg, #7b2cbf 0%, #9d4edd 50%, #c77dff 100%)',
    cyan: 'linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)',
    glow: 'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.3) 0%, transparent 70%)',
  },
  border: {
    glow: '0 0 12px rgba(0, 180, 216, 0.5)',
    cyan: '1px solid rgba(0, 180, 216, 0.6)',
  },
  text: {
    primary: '#f8f0ff',
    secondary: 'rgba(248, 240, 255, 0.8)',
    muted: 'rgba(248, 240, 255, 0.5)',
  },
  transition: '0.2s ease',
} as const

export type NeonTheme = typeof neon
