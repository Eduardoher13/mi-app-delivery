import { Ionicons } from '@expo/vector-icons';
import type { CountryCode as LibCountryCode } from 'libphonenumber-js';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import CountryPicker, {
  Country,
  CountryCode,
  Flag,
} from 'react-native-country-picker-modal';

import {
  buildE164Phone,
  DEFAULT_PHONE_COUNTRY,
  formatLocalPhoneDisplay,
  parseStoredPhone,
  sanitizeLocalPhoneDigits,
} from '../utils/phoneFormat';

interface PhoneInputProps {
  value: string;
  onChangeValue: (e164: string) => void;
  defaultCountryCode?: CountryCode;
  placeholder?: string;
}

function toLibCountryCode(code: CountryCode): LibCountryCode {
  return code as LibCountryCode;
}

export function PhoneInput({
  value,
  onChangeValue,
  defaultCountryCode = DEFAULT_PHONE_COUNTRY as CountryCode,
  placeholder = '8888 8888',
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountryCode);
  const [callingCode, setCallingCode] = useState('505');
  const [localDisplay, setLocalDisplay] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

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
      const formatted = formatLocalPhoneDisplay(digits);
      setLocalDisplay(formatted);
      onChangeValue(buildE164Phone(toLibCountryCode(nextCountryCode), digits));
    },
    [onChangeValue],
  );

  const handleLocalChange = (text: string) => {
    const digits = sanitizeLocalPhoneDigits(text);
    syncPhoneValue(countryCode, digits);
  };

  const handleSelectCountry = (country: Country) => {
    const nextCountryCode = country.cca2;
    setCountryCode(nextCountryCode);
    setCallingCode(country.callingCode[0] ?? callingCode);
    syncPhoneValue(nextCountryCode, sanitizeLocalPhoneDigits(localDisplay));
    setPickerVisible(false);
  };

  return (
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
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={localDisplay}
        onChangeText={handleLocalChange}
        keyboardType="number-pad"
        maxLength={9}
        returnKeyType="done"
      />
    </View>
  );
}
