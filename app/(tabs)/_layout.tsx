import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';
import {
  getInitialTabName,
  hiddenTabOptions,
  isCliente,
  isEmpresa,
  isProfesional,
} from '../../utils/roles';

type TabIconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const role = user?.role;

  // Solo las tabs del rol activo aparecen en la barra inferior
  const showClienteTabs = isCliente(role);
  const showEmpresaTabs = isEmpresa(role);
  const showProfesionalTabs = isProfesional(role);

  return (
    <Tabs
      initialRouteName={loading ? undefined : getInitialTabName(role)}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.neutral,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
          ...hiddenTabOptions(showClienteTabs),
        }}
      />
      <Tabs.Screen
        name="services/index"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color }) => <TabIcon name="construct" color={color} />,
          ...hiddenTabOptions(showClienteTabs),
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Tiendas',
          tabBarIcon: ({ color }) => <TabIcon name="storefront" color={color} />,
          ...hiddenTabOptions(showClienteTabs),
        }}
      />
      <Tabs.Screen
        name="pro-requests/index"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color }) => <TabIcon name="briefcase" color={color} />,
          ...hiddenTabOptions(showProfesionalTabs),
        }}
      />
      <Tabs.Screen
        name="empresa-orders/index"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <TabIcon name="receipt" color={color} />,
          ...hiddenTabOptions(showEmpresaTabs),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: showEmpresaTabs ? 'Mi tienda' : 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
