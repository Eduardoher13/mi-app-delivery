/** Paleta Listo!: navy + blanco */
export const colors = {
  navy: '#1e3a8a',
  navyDark: '#0f172a',
  accent: '#1e3a8a',
  white: '#FFFFFF',
  neutral: '#E2E8F0',
  placeholder: '#94A3B8',
} as const;

export type ColorKey = keyof typeof colors;
