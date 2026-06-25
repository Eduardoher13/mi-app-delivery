import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';

interface MobileWebShellProps {
  children: ReactNode;
}

/**
 * En web: ancho completo en móvil; en tablet/escritorio usa contenedor amplio centrado.
 * En iOS/Android nativo no altera el layout.
 */
export function MobileWebShell({ children }: MobileWebShellProps) {
  if (Platform.OS !== 'web') {
    return children;
  }

  return (
    <View className="min-h-full flex-1 w-full bg-[#F1F5F9]">
      <View className="mx-auto min-h-full w-full max-w-full flex-1 md:max-w-6xl lg:max-w-7xl md:px-6 lg:px-8">
        <View className="min-h-full flex-1 w-full overflow-hidden bg-white md:my-4 md:rounded-2xl md:border md:border-[#E2E8F0] md:shadow-sm">
          {children}
        </View>
      </View>
    </View>
  );
}
