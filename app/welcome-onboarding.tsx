import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { fontScale, scale } from '../src/utils/scaling';

export default function WelcomeOnboardingScreen() {
  const router = useRouter();
  
  const handleContinue = () => {
    router.replace('/onboarding');
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Centered Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(40) }}>
        <View 
          style={{ 
            backgroundColor: 'rgba(16, 185, 95, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            width: scale(120), 
            height: scale(120), 
            borderRadius: scale(30),
            marginBottom: scale(32),
          }}
        >
          <Ionicons name="flash" size={scale(60)} color="#10B95F" />
        </View>
        
        <Text style={{ fontSize: fontScale(20), fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginBottom: scale(4) }}>Welcome to</Text>
        <Text style={{ fontSize: fontScale(48), fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: scale(12) }}>TradeX</Text>
        <Text style={{ fontSize: fontScale(16), color: 'rgba(255,255,255,0.5)' }}>Your personal trading journal</Text>
      </View>
      
      {/* Bottom Button */}
      <View style={{ paddingHorizontal: scale(24), paddingBottom: scale(64) }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B95F', paddingVertical: scale(18), paddingHorizontal: scale(32), borderRadius: scale(16), gap: scale(8) }}
          onPress={handleContinue}
        >
          <Text style={{ fontSize: fontScale(18), fontWeight: '700', color: '#FFFFFF' }}>Get Started</Text>
          <Ionicons name="arrow-forward" size={scale(20)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
