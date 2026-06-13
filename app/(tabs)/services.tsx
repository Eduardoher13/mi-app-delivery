import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-black text-[#0F172A]">Servicios</Text>
        <Text className="mt-2 text-center text-sm text-[#94A3B8]">
          Pantalla de servicios — en construcción
        </Text>
        {/* TODO: obtener datos de API GET /services */}
      </View>
    </SafeAreaView>
  );
}
