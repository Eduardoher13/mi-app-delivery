import type { Href } from 'expo-router';

export type AppRole = 'cliente' | 'empresa' | 'profesional' | string;

export function isCliente(role?: string): boolean {
  return role === 'cliente';
}

export function isEmpresa(role?: string): boolean {
  return role === 'empresa';
}

export function isProfesional(role?: string): boolean {
  return role === 'profesional';
}

/** Tab inicial según rol tras login o al abrir la app. */
export function getDefaultTabHref(role?: string): Href {
  switch (role) {
    case 'empresa':
      return '/(tabs)/empresa-orders' as Href;
    case 'profesional':
      return '/(tabs)/pro-requests' as Href;
    default:
      return '/(tabs)/home';
  }
}

/** Nombre de tab inicial para Tabs.initialRouteName (rutas con carpeta/index). */
export function getInitialTabName(role?: string): string {
  switch (role) {
    case 'empresa':
      return 'empresa-orders/index';
    case 'profesional':
      return 'pro-requests/index';
    default:
      return 'home/index';
  }
}

export function hiddenTabOptions(visible: boolean) {
  if (visible) {
    return {};
  }

  return { href: null };
}
