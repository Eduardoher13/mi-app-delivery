import { Image, type ImageStyle, type StyleProp } from 'react-native';

interface ListoWordmarkProps {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export function ListoWordmark({ width = 180, height = 52, style }: ListoWordmarkProps) {
  return (
    <Image
      source={require('../assets/listo-wordmark.png')}
      style={[{ width, height, resizeMode: 'contain' }, style]}
      accessibilityLabel="Listo"
    />
  );
}
