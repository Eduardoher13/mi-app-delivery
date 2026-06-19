import {
  CountryCode,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';

export const DEFAULT_PHONE_COUNTRY: CountryCode = 'NI';
const DEFAULT_NATIONAL_DIGIT_LIMIT = 12;

/** Solo dígitos locales; límite según el país (o 12 por defecto). */
export function sanitizeLocalPhoneDigits(
  input: string,
  maxDigits = DEFAULT_NATIONAL_DIGIT_LIMIT,
): string {
  return input.replace(/\D/g, '').slice(0, maxDigits);
}

/** Formato visual con espacio cada 4 dígitos: 8888 8888, 991 2345, etc. */
export function formatLocalPhoneDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (!clean) {
    return '';
  }

  return clean.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function getNationalDigitLimit(countryCode: CountryCode): number {
  try {
    const example = getExampleNumber(countryCode, examples);
    if (example) {
      return example.nationalNumber.length;
    }
  } catch {
    // Sin ejemplo para este país
  }

  return DEFAULT_NATIONAL_DIGIT_LIMIT;
}

export function getPhonePlaceholder(countryCode: CountryCode): string {
  try {
    const example = getExampleNumber(countryCode, examples);
    if (example) {
      return formatLocalPhoneDisplay(example.nationalNumber);
    }
  } catch {
    // fallback
  }

  return countryCode === 'NI' ? '8888 8888' : '0000 0000';
}

export function getDisplayMaxLength(countryCode: CountryCode): number {
  return formatLocalPhoneDisplay('9'.repeat(getNationalDigitLimit(countryCode))).length;
}

export function buildE164Phone(countryCode: CountryCode, localDigits: string): string {
  const limit = getNationalDigitLimit(countryCode);
  const clean = sanitizeLocalPhoneDigits(localDigits, limit);
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
    localDigits: parsed.nationalNumber,
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

export function isValidAppPhone(e164: string): boolean {
  const trimmed = e164.trim();
  if (!trimmed) {
    return false;
  }

  return isValidPhoneNumber(trimmed);
}

/** Teléfono opcional: vacío OK; si hay algo, debe ser válido para el país (+código). */
export function isOptionalPhoneValid(e164: string): boolean {
  if (!e164.trim()) {
    return true;
  }

  return isValidAppPhone(e164);
}

export function getPhoneValidationMessage(): string {
  return 'Ingresa un teléfono válido para el país seleccionado.';
}
