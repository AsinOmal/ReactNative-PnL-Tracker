import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../src/config/fonts';
import { useAuth } from '../src/context/AuthContext';
import { fontScale, scale } from '../src/utils/scaling';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeBack() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Trader';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-redirect after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {/* Full screen gradient background */}
      <LinearGradient
        colors={['#059669', '#047857']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(40) }}>
          
          {/* App Icon Placeholder - Replace with your custom app icon */}
          <Animated.View
            style={{
              marginBottom: scale(48),
              transform: [{ scale: pulseAnim }],
              opacity: fadeAnim,
            }}
          >
            {/* App Icon */}
            <Image
              source={require('../assets/images/icon.png')}
              style={{
                width: scale(80),
                height: scale(80),
                borderRadius: scale(20),
              }}
            />
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View 
            style={{ 
              alignItems: 'center',
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={{
              fontFamily: fonts.medium,
              fontSize: fontScale(14),
              color: '#34D399',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: scale(12),
            }}>
              Welcome Back
            </Text>
            
            <Text style={{
              fontFamily: fonts.bold,
              fontSize: fontScale(36),
              color: '#FFFFFF',
              textAlign: 'center',
              letterSpacing: -0.5,
              marginBottom: scale(12),
            }}>
              {capitalizedName}
            </Text>
            
            <Text style={{
              fontFamily: fonts.regular,
              fontSize: fontScale(16),
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}>
              Great to see you again
            </Text>
          </Animated.View>

        </View>

        {/* Bottom Loading Indicator */}
        <Animated.View 
          style={{ 
            alignItems: 'center',
            paddingBottom: scale(48),
            opacity: fadeAnim,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(10),
            paddingHorizontal: scale(20),
            paddingVertical: scale(12),
            borderRadius: scale(24),
            backgroundColor: 'rgba(52, 211, 153, 0.08)',
          }}>
            <View style={{
              width: scale(8),
              height: scale(8),
              borderRadius: scale(4),
              backgroundColor: '#34D399',
            }} />
            <Text style={{
              fontFamily: fonts.medium,
              fontSize: fontScale(14),
              color: 'rgba(255,255,255,0.7)',
            }}>
              Preparing your dashboard
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}
