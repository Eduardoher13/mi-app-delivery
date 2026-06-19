import { Image, Text, View } from 'react-native';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export function Avatar({ name, avatarUrl, size = 80 }: AvatarProps) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        className="rounded-full bg-[#E2E8F0]"
        style={{ width: size, height: size }}
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }

  return (
    <View
      className="items-center justify-center rounded-full bg-[#1e3a8a]"
      style={{ width: size, height: size }}
    >
      <Text className="font-bold text-white" style={{ fontSize: size * 0.3 }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
