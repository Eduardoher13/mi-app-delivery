import { Pressable, ScrollView, Text } from 'react-native';

import {
  SERVICE_REQUEST_FILTERS,
  ServiceRequestFilter,
} from '../utils/serviceRequestStatus';

interface ServiceRequestFilterChipsProps {
  value: ServiceRequestFilter;
  onChange: (filter: ServiceRequestFilter) => void;
  className?: string;
}

export function ServiceRequestFilterChips({
  value,
  onChange,
  className = 'mt-2',
}: ServiceRequestFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`max-h-9 shrink-0 flex-grow-0 ${className}`}
      contentContainerClassName="items-center pr-2"
    >
      {SERVICE_REQUEST_FILTERS.map((filter) => {
        const selected = value === filter.key;

        return (
          <Pressable
            key={filter.key}
            className={`mr-2 rounded-full border px-3 py-1 ${
              selected
                ? 'border-[#1e3a8a] bg-[#1e3a8a]'
                : 'border-[#E2E8F0] bg-white'
            }`}
            onPress={() => onChange(filter.key)}
          >
            <Text
              className={`text-[11px] font-bold leading-4 ${
                selected ? 'text-white' : 'text-[#0F172A]'
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
