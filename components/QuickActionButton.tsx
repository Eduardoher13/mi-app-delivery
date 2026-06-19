import { Pressable, Text } from 'react-native';

interface QuickActionButtonProps {
  label: string;
  variant?: 'primary' | 'outline' | 'emergency';
  onPress?: () => void;
}

export function QuickActionButton({
  label,
  variant = 'outline',
  onPress,
}: QuickActionButtonProps) {
  const isEmergency = variant === 'emergency';
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      className={`mr-3 flex-1 items-center justify-center rounded-xl px-3 py-4 ${
        isEmergency || isPrimary
          ? 'bg-[#1e3a8a]'
          : 'border border-[#E2E8F0] bg-white'
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-center text-xs font-bold ${
          isEmergency || isPrimary ? 'text-white' : 'text-[#0F172A]'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
