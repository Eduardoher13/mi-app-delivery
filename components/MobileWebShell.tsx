import type { ReactNode } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';

const MOBILE_WEB_MAX_WIDTH = 430;

interface MobileWebShellProps {
  children: ReactNode;
}

export function MobileWebShell({ children }: MobileWebShellProps) {
  if (Platform.OS !== 'web') {
    return children;
  }

  const shellStyle: ViewStyle = {
    flex: 1,
    width: '100%',
    maxWidth: MOBILE_WEB_MAX_WIDTH,
    alignSelf: 'center',
  };

  const frameStyle: ViewStyle = {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  };

  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: '#F1F5F9' }}>
      <View style={shellStyle}>
        <View style={frameStyle}>{children}</View>
      </View>
    </View>
  );
}
