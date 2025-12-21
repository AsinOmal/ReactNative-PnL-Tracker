import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { fontScale, scale } from '../src/utils/scaling';

export default function WelcomeOnboarding() {
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  // Bubble animations
  const bubble1Anim = useRef(new Animated.Value(0)).current;
  const bubble2Anim = useRef(new Animated.Value(0)).current;
  const bubble3Anim = useRef(new Animated.Value(0)).current;
  const bubble4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bubble animations
    const animateBubble = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateBubble(bubble1Anim, 0);
    animateBubble(bubble2Anim, 500);
    animateBubble(bubble3Anim, 1000);
    animateBubble(bubble4Anim, 1500);
  }, []);

  const handleContinue = () => {
    router.replace('/onboarding');
  };

  const handleSkip = () => {
    router.replace('/auth/welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Multi-layer gradient background */}
      <LinearGradient
        colors={['#0F0F23', '#1A1A3E', '#2D1B4E', '#1A1A3E', '#0F0F23']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Overlay gradient for depth */}
      <LinearGradient
        colors={['transparent', 'rgba(16, 185, 95, 0.05)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { transform: [{ rotate: '45deg' }] }]}
      />

      {/* Animated Bubbles/Orbs - Background */}
      <Animated.View 
        style={[
          styles.bubble,
          styles.bubble1,
          {
            opacity: bubble1Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.6, 0.3],
            }),
            transform: [
              {
                translateY: bubble1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                scale: bubble1Anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.2, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#10B95F', '#10B95F00']}
          style={styles.bubbleGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.bubble,
          styles.bubble2,
          {
            opacity: bubble2Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 0.5, 0.2],
            }),
            transform: [
              {
                translateX: bubble2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#7C3AED', '#7C3AED00']}
          style={styles.bubbleGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.bubble,
          styles.bubble3,
          {
            opacity: bubble3Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.15, 0.4, 0.15],
            }),
            transform: [
              {
                translateY: bubble3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#10B95F', '#10B95F00']}
          style={styles.bubbleGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.bubble,
          styles.bubble4,
          {
            opacity: bubble4Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 0.45, 0.2],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={['#2563EB', '#2563EB00']}
          style={styles.bubbleGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TradeX</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Welcome Text - Above Icon */}
        <Animated.View 
          style={[
            styles.welcomeContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>WELCOME</Text>
        </Animated.View>

        {/* App Icon only - no bubble/glow behind */}
        <Animated.View 
          style={[
            styles.iconWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: floatAnim },
              ],
            },
          ]}
        >
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.appIcon}
          />
        </Animated.View>

        {/* Text Content */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>
            Your Trading{'\n'}Journey Awaits
          </Text>
          
          <Text style={styles.subtitle}>
            Track • Analyze • Grow
          </Text>
          
          <Text style={styles.description}>
            Join thousands of traders who trust TradeX{'\n'}to manage their performance
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#10B95F', '#059669']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={scale(20)} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer text */}
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  bubbleGradient: {
    width: '100%',
    height: '100%',
  },
  bubble1: {
    width: scale(250),
    height: scale(250),
    top: -scale(50),
    left: -scale(80),
  },
  bubble2: {
    width: scale(200),
    height: scale(200),
    top: scale(150),
    right: -scale(60),
  },
  bubble3: {
    width: scale(180),
    height: scale(180),
    bottom: scale(200),
    left: -scale(40),
  },
  bubble4: {
    width: scale(120),
    height: scale(120),
    bottom: scale(100),
    right: scale(40),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingTop: scale(60),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(22),
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  skipBtn: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: scale(20),
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: fontScale(14),
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
  },
  welcomeContainer: {
    marginBottom: scale(36),
  },
  welcomeText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  iconWrapper: {
    marginBottom: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(28),
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontScale(38),
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: fontScale(46),
    marginBottom: scale(16),
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(18),
    color: '#10B95F',
    textAlign: 'center',
    marginBottom: scale(16),
    letterSpacing: 2,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontScale(15),
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: fontScale(22),
  },
  bottom: {
    paddingHorizontal: scale(24),
    paddingBottom: scale(40),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
    marginBottom: scale(24),
  },
  progressDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressDotActive: {
    width: scale(28),
    backgroundColor: '#10B95F',
  },
  continueButton: {
    borderRadius: scale(16),
    overflow: 'hidden',
    shadowColor: '#10B95F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(18),
    gap: scale(10),
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(18),
    color: '#FFFFFF',
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontScale(12),
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: scale(16),
  },
});
