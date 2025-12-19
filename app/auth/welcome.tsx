import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../src/config/fonts';
import { fontScale, moderateScale, scale } from '../../src/utils/scaling';

export default function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: scale(32), paddingVertical: scale(40) }}>
        {/* Logo Area - Right Aligned */}
        <View style={{ alignItems: 'flex-end' }}>
          <View 
            style={{ 
              backgroundColor: 'rgba(16, 185, 95, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              width: scale(72), 
              height: scale(72), 
              borderRadius: scale(18),
              marginBottom: scale(12),
            }}
          >
            <Ionicons name="trending-up" size={scale(40)} color="#10B95F" />
          </View>
          <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(24), color: '#FFFFFF', letterSpacing: -0.5 }}>TradeX</Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(13), color: '#71717A', marginTop: scale(4) }}>Track your trading journey</Text>
        </View>
        
        {/* Hero Text */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(30), color: '#FFFFFF', marginBottom: scale(8), textAlign: 'center' }}>Master Your</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(72), color: '#10B95F', lineHeight: fontScale(76), letterSpacing: -2, textAlign: 'center' }}>Trades</Text>
          
          {/* Quote Section - with top margin */}
          <View style={{ marginTop: moderateScale(48) }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: '#71717A', lineHeight: fontScale(22), textAlign: 'center', maxWidth: scale(280) }}>
              "The goal of a successful trader is to make the best trades. Money is secondary."
            </Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(13), color: '#FFFFFF', marginTop: scale(12), textAlign: 'center' }}>- Alexander Elder</Text>
          </View>
        </View>
        
        {/* Buttons - Centered */}
        <View style={{ alignItems: 'center', gap: scale(16) }}>
          <TouchableOpacity 
            style={{ paddingVertical: scale(12), paddingHorizontal: scale(32) }}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(20), color: '#FFFFFF' }}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B95F', paddingVertical: scale(16), paddingHorizontal: scale(32), borderRadius: scale(16), gap: scale(12) }}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: '#FFFFFF' }}>Register</Text>
            <Ionicons name="arrow-forward" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
