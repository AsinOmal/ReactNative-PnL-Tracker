import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Wrapper component that ensures NativeWind's colorScheme stays in sync with app theme
 */
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { setColorScheme } = useColorScheme();
  
  // Force colorScheme update whenever theme changes
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);
  
  return <View style={{ flex: 1 }}>{children}</View>;
}
