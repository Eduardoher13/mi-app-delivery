import {
  CountryCode,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

export const DEFAULT_PHONE_COUNTRY: CountryCode = 'NI';
export const LOCAL_PHONE_DIGITS = 8;

/** Solo dígitos locales, máximo 8. */
export function sanitizeLocalPhoneDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, LOCAL_PHONE_DIGITS);
}

/** Formato visual: 8888 8888 */
export function formatLocalPhoneDisplay(digits: string): string {
  const clean = sanitizeLocalPhoneDigits(digits);
  if (clean.length <= 4) {
    return clean;
  }

  return `${clean.slice(0, 4)} ${clean.slice(4)}`;
}

export function buildE164Phone(countryCode: CountryCode, localDigits: string): string {
  const clean = sanitizeLocalPhoneDigits(localDigits);
  if (!clean) {
    return '';
  }

  const callingCode = getCountryCallingCode(countryCode);
  return `+${callingCode}${clean}`;
}

export function parseStoredPhone(
  stored: string,
): { countryCode: CountryCode; localDigits: string; callingCode: string } | null {
  const trimmed = stored.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed?.country) {
    return null;
  }

  return {
    countryCode: parsed.country,
    localDigits: sanitizeLocalPhoneDigits(parsed.nationalNumber),
    callingCode: parsed.countryCallingCode,
  };
}

export function formatPhoneForDisplay(stored: string): string {
  const parsed = parseStoredPhone(stored);
  if (!parsed || !parsed.localDigits) {
    return stored;
  }

  return `+${parsed.callingCode} ${formatLocalPhoneDisplay(parsed.localDigits)}`;
}

export function isCompleteLocalPhone(localDigits: string): boolean {
  return sanitizeLocalPhoneDigits(localDigits).length === LOCAL_PHONE_DIGITS;
}

export function isValidAppPhone(e164: string): boolean {
  const trimmed = e164.trim();
  if (!trimmed) {
    return false;
  }

  const parsed = parseStoredPhone(trimmed);
  if (!parsed || !isCompleteLocalPhone(parsed.localDigits)) {
    return false;
  }

  return isValidPhoneNumber(trimmed);
}

/** Teléfono opcional: vacío OK; si hay algo, deben ser 8 dígitos válidos. */
export function isOptionalPhoneValid(e164: string): boolean {
  if (!e164.trim()) {
    return true;
  }

  return isValidAppPhone(e164);
}
