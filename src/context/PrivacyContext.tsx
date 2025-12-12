import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => Promise<void>;
  isLoading: boolean;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_KEY = '@tradex_privacy_enabled';

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(PRIVACY_KEY);
        if (stored !== null) {
          setIsPrivacyMode(stored === 'true');
        }
      } catch (error) {
        console.error('Failed to load privacy setting', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const togglePrivacyMode = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newValue = !isPrivacyMode;
      setIsPrivacyMode(newValue);
      await AsyncStorage.setItem(PRIVACY_KEY, String(newValue));
    } catch (error) {
      console.error('Failed to save privacy setting', error);
    }
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode, isLoading }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
