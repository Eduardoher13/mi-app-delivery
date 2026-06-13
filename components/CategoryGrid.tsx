import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  flash: 'flash',
  water: 'water',
  leaf: 'leaf',
  'color-palette': 'color-palette',
  hammer: 'hammer',
  'alert-circle': 'alert-circle',
};

export function CategoryGrid({ categories, onCategoryPress }: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap justify-between">
      {categories.map((category) => (
        <Pressable
          key={category.id}
          className="mb-4 w-[30%] items-center rounded-xl border border-[#E2E8F0] bg-white py-4"
          onPress={() => onCategoryPress?.(category)}
        >
          <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0]">
            <Ionicons
              name={iconMap[category.icon] ?? 'construct'}
              size={24}
              color="#0F172A"
            />
          </View>
          <Text className="text-center text-xs font-bold text-[#0F172A]">
            {category.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
