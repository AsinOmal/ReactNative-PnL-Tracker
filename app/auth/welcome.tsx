import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontScale, moderateScale, scale } from '../../src/utils/scaling';

export default function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <View className="flex-1 justify-between" style={{ paddingHorizontal: scale(32), paddingVertical: scale(40) }}>
        {/* Logo Area - Right Aligned */}
        <View className="items-end">
          <View 
            className="bg-profit-light justify-center items-center"
            style={{ 
              width: scale(72), 
              height: scale(72), 
              borderRadius: scale(18),
              marginBottom: scale(12),
            }}
          >
            <Ionicons name="trending-up" size={scale(40)} color="#10B95F" />
          </View>
          <Text style={{ fontSize: fontScale(24), fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 }}>TradeX</Text>
          <Text style={{ fontSize: fontScale(13), color: '#71717A', marginTop: scale(4) }}>Track your trading journey</Text>
        </View>
        
        {/* Hero Text */}
        <View className="flex-1 justify-center items-center">
          <Text style={{ fontSize: fontScale(30), fontWeight: '700', color: '#FFFFFF', marginBottom: scale(8), textAlign: 'center' }}>Master Your</Text>
          <Text style={{ fontSize: fontScale(72), fontWeight: '800', color: '#10B95F', lineHeight: fontScale(76), letterSpacing: -2, textAlign: 'center' }}>Trades</Text>
          
          {/* Quote Section - with top margin */}
          <View style={{ marginTop: moderateScale(48) }}>
            <Text style={{ fontSize: fontScale(15), color: '#71717A', lineHeight: fontScale(22), textAlign: 'center', maxWidth: scale(280) }}>
              "The goal of a successful trader is to make the best trades. Money is secondary."
            </Text>
            <Text style={{ fontSize: fontScale(13), fontWeight: '500', color: '#FFFFFF', marginTop: scale(12), textAlign: 'center' }}>- Alexander Elder</Text>
          </View>
        </View>
        
        {/* Buttons - Centered */}
        <View style={{ alignItems: 'center', gap: scale(16) }}>
          <TouchableOpacity 
            style={{ paddingVertical: scale(12), paddingHorizontal: scale(32) }}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={{ fontSize: fontScale(20), fontWeight: '700', color: '#FFFFFF' }}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-primary"
            style={{ paddingVertical: scale(16), paddingHorizontal: scale(32), borderRadius: scale(16), gap: scale(12) }}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={{ fontSize: fontScale(18), fontWeight: '700', color: '#FFFFFF' }}>Register</Text>
            <Ionicons name="arrow-forward" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
