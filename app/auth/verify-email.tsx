import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../src/config/fonts';
import { useAuth } from '../../src/context/AuthContext';
import { sendVerificationEmail } from '../../src/services/authService';
import { fontScale, scale } from '../../src/utils/scaling';

const BG_COLOR = '#2563EB'; // Blue theme

export default function VerifyEmailScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Send verification email automatically on first load
    if (user && !user.emailVerified) {
      handleSendEmail(true);
    }
  }, []);

  const handleSendEmail = async (silent = false) => {
    if (isSending) return;
    setIsSending(true);
    try {
      console.log('Attempting to send verification email...');
      await sendVerificationEmail();
      console.log('sendVerificationEmail completed');
      if (!silent) Alert.alert('Email Sent', `A verification link has been sent to ${user?.email}`);
    } catch (error: any) {
      console.error('handleSendEmail error:', error);
      if (!silent) Alert.alert('Error', error.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      await refreshUser();
      // The _layout effect will detect the change and redirect automatically
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Animated.View style={{ flex: 1, backgroundColor: BG_COLOR, opacity: fadeAnim }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: scale(24), 
          paddingTop: scale(8),
          paddingBottom: scale(16),
        }}>
          <Text style={{ 
            fontFamily: fonts.bold, 
            fontSize: fontScale(20), 
            color: '#FFFFFF',
          }}>
            TradeX
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(32) }}>
          {/* 3D Icon Card */}
          <Animated.View style={{ 
            marginBottom: scale(40), 
            transform: [{ scale: scaleAnim }],
          }}>
            <View style={{
              width: scale(100),
              height: scale(100),
              borderRadius: scale(28),
              backgroundColor: 'rgba(255,255,255,0.25)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
            }}>
              <Ionicons name="mail" size={scale(48)} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Text */}
          <Text style={{ 
            fontFamily: fonts.bold, 
            fontSize: fontScale(32), 
            color: '#FFFFFF', 
            marginBottom: scale(8), 
            textAlign: 'center' 
          }}>
            Check your inbox
          </Text>

          <Text style={{ 
            fontFamily: fonts.regular, 
            fontSize: fontScale(16), 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: scale(8), 
            textAlign: 'center',
            lineHeight: fontScale(24),
          }}>
            We sent a verification link to
          </Text>
          
          <Text style={{ 
            fontFamily: fonts.bold, 
            fontSize: fontScale(17), 
            color: '#FFFFFF', 
            marginBottom: scale(48), 
            textAlign: 'center' 
          }}>
            {user?.email}
          </Text>

          {/* Actions */}
          <View style={{ width: '100%', gap: scale(12) }}>
            {/* Primary Button */}
            <TouchableOpacity 
              onPress={handleCheckVerification}
              activeOpacity={0.9}
              style={{
                backgroundColor: '#FFFFFF',
                paddingVertical: scale(18),
                borderRadius: scale(16),
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text style={{ 
                fontFamily: fonts.bold, 
                fontSize: fontScale(18), 
                color: BG_COLOR,
              }}>
                {isVerifying ? 'Checking...' : "I've Verified My Email"}
              </Text>
            </TouchableOpacity>

            {/* Secondary Button */}
            <TouchableOpacity 
              onPress={() => handleSendEmail(false)}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingVertical: scale(16),
                borderRadius: scale(16),
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                fontFamily: fonts.semiBold, 
                fontSize: fontScale(16), 
                color: '#FFFFFF',
              }}>
                {isSending ? 'Sending...' : 'Resend Email'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingBottom: scale(32), alignItems: 'center' }}>
          <TouchableOpacity onPress={logout}>
            <Text style={{ 
              fontFamily: fonts.medium, 
              fontSize: fontScale(14), 
              color: 'rgba(255,255,255,0.6)' 
            }}>
              Use a different email
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}
