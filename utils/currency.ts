export const CORDOBA_SYMBOL = 'C$';

function parseAmount(amount: number | string | null | undefined): number | null {
  const value = typeof amount === 'number' ? amount : Number.parseFloat(String(amount ?? ''));
  return Number.isFinite(value) ? value : null;
}

/** Formato estándar de precios en córdobas nicaragüenses: C$120.00 */
export function formatCordoba(
  amount: number | string | null | undefined,
  fallback = '—',
): string {
  const value = parseAmount(amount);
  if (value === null) {
    return fallback;
  }

  return `${CORDOBA_SYMBOL}${value.toFixed(2)}`;
}

/** Tarifa por hora: C$45.00/hr */
export function formatCordobaPerHour(
  amount: number | string | null | undefined,
  fallback = '—',
): string {
  const value = parseAmount(amount);
  if (value === null) {
    return fallback;
  }

  return `${CORDOBA_SYMBOL}${value.toFixed(2)}/hr`;
}
