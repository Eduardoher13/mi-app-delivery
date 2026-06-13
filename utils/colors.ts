export const colors = {
  accent: '#00A878',
  navy: '#0F172A',
  white: '#FFFFFF',
  charcoal: '#1A202C',
  neutral: '#E2E8F0',
  placeholder: '#94A3B8',
} as const;

export type ColorKey = keyof typeof colors;
