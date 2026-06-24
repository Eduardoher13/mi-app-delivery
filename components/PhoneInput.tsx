import { Ionicons } from '@expo/vector-icons';
import type { CountryCode as LibCountryCode } from 'libphonenumber-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  Flag,
} from 'react-native-country-picker-modal';

import {
  buildE164Phone,
  DEFAULT_PHONE_COUNTRY,
  formatLocalPhoneDisplay,
  getDisplayMaxLength,
  getNationalDigitLimit,
  getPhonePlaceholder,
  parseStoredPhone,
  sanitizeLocalPhoneDigits,
} from '../utils/phoneFormat';

interface PhoneInputProps {
  value: string;
  onChangeValue: (e164: string) => void;
  defaultCountryCode?: CountryCode;
  placeholder?: string;
  onFocus?: TextInputProps['onFocus'];
}

function toLibCountryCode(code: CountryCode): LibCountryCode {
  return code as LibCountryCode;
}

export function PhoneInput({
  value,
  onChangeValue,
  defaultCountryCode = DEFAULT_PHONE_COUNTRY as CountryCode,
  placeholder,
  onFocus,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountryCode);
  const [callingCode, setCallingCode] = useState('505');
  const [localDisplay, setLocalDisplay] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const digitLimit = useMemo(
    () => getNationalDigitLimit(toLibCountryCode(countryCode)),
    [countryCode],
  );
  const displayMaxLength = useMemo(
    () => getDisplayMaxLength(toLibCountryCode(countryCode)),
    [countryCode],
  );
  const resolvedPlaceholder = useMemo(
    () => placeholder ?? getPhonePlaceholder(toLibCountryCode(countryCode)),
    [countryCode, placeholder],
  );

  useEffect(() => {
    if (!value.trim()) {
      setLocalDisplay('');
      return;
    }

    const parsed = parseStoredPhone(value);
    if (!parsed) {
      return;
    }

    setCountryCode(parsed.countryCode as CountryCode);
    setCallingCode(parsed.callingCode);
    setLocalDisplay(formatLocalPhoneDisplay(parsed.localDigits));
  }, [value]);

  const syncPhoneValue = useCallback(
    (nextCountryCode: CountryCode, digits: string) => {
      const libCode = toLibCountryCode(nextCountryCode);
      const limit = getNationalDigitLimit(libCode);
      const clean = sanitizeLocalPhoneDigits(digits, limit);
      const formatted = formatLocalPhoneDisplay(clean);
      setLocalDisplay(formatted);
      onChangeValue(buildE164Phone(libCode, clean));
    },
    [onChangeValue],
  );

  const handleLocalChange = (text: string) => {
    syncPhoneValue(countryCode, text);
  };

  const handleSelectCountry = (country: Country) => {
    const nextCountryCode = country.cca2;
    setCountryCode(nextCountryCode);
    setCallingCode(country.callingCode[0] ?? callingCode);
    syncPhoneValue(nextCountryCode, sanitizeLocalPhoneDigits(localDisplay, digitLimit));
    setPickerVisible(false);
  };

  return (
    <View>
      <View className="flex-row overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <CountryPicker
          countryCode={countryCode}
          withFilter
          withFlag
          withCallingCode={false}
          withEmoji
          onSelect={handleSelectCountry}
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
        />

        <Pressable
          className="flex-row items-center border-r border-[#E2E8F0] px-3 py-3"
          onPress={() => setPickerVisible(true)}
          hitSlop={4}
        >
          <Flag countryCode={countryCode} withEmoji flagSize={18} />
          <Text className="ml-2 text-sm font-semibold text-[#0F172A]">+{callingCode}</Text>
          <Ionicons name="chevron-down" size={14} color="#94A3B8" style={{ marginLeft: 4 }} />
        </Pressable>

        <TextInput
          className="flex-1 px-3 py-3 text-sm text-[#0F172A]"
          placeholder={resolvedPlaceholder}
          placeholderTextColor="#94A3B8"
          value={localDisplay}
          onChangeText={handleLocalChange}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={displayMaxLength}
          returnKeyType="done"
        />
      </View>
      <Text className="mt-1 text-[10px] text-[#94A3B8]">
        {digitLimit} dígitos para este país · espacio cada 4
      </Text>
    </View>
  );
}
