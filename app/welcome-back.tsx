import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../src/config/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useTrading } from '../src/context/TradingContext';
import { authenticateWithBiometrics, getBiometricCapabilities, isBiometricEnabled } from '../src/services/biometricService';
import { hasPIN, isPinLockEnabled, verifyPIN } from '../src/services/pinService';
import { fontScale, scale } from '../src/utils/scaling';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type LockState = 'loading' | 'biometric' | 'pin' | 'unlocked';

export default function WelcomeBack() {
  const router = useRouter();
  const { user } = useAuth();
  const { months, trades } = useTrading();
  
  const [lockState, setLockState] = useState<LockState>('loading');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [shakeAnim] = useState(new Animated.Value(0));
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  
  // Dot animations (sequential)
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  // Get display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Trader';
  const firstName = displayName.split(' ')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Check lock settings on mount
  useEffect(() => {
    const checkLockSettings = async () => {
      const biometricOn = await isBiometricEnabled();
      const pinOn = await isPinLockEnabled();
      const hasSetPin = await hasPIN();
      const bioCaps = await getBiometricCapabilities();
      
      if (biometricOn && bioCaps.isAvailable && bioCaps.isEnrolled) {
        // Try biometric first
        setLockState('biometric');
        const result = await authenticateWithBiometrics();
        if (result.success) {
          setLockState('unlocked');
        } else if (pinOn && hasSetPin) {
          // Fall back to PIN
          setLockState('pin');
        } else {
          // Retry biometric
          setLockState('biometric');
        }
      } else if (pinOn && hasSetPin) {
        setLockState('pin');
      } else {
        setLockState('unlocked');
      }
    };
    checkLockSettings();
  }, []);

  // Run entry animations when entering unlocked state
  useEffect(() => {
    if (lockState === 'unlocked') {
      // Reset animations first
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(40);
      
      // Entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [lockState]);

  useEffect(() => {
    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sequential dot animation
    const animateDot = (anim: Animated.Value) => 
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]);

    Animated.loop(
      Animated.stagger(200, [
        animateDot(dot1Anim),
        animateDot(dot2Anim),
        animateDot(dot3Anim),
      ])
    ).start();
  }, []);

  // Navigate when unlocked
  useEffect(() => {
    if (lockState === 'unlocked') {
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lockState]);

  // Lockout timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        setLockoutTime(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinPress = async (num: string) => {
    if (lockoutTime > 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinError('');
    
    const newPin = pin + num;
    setPin(newPin);
    
    if (newPin.length === 6) {
      const isValid = await verifyPIN(newPin);
      if (isValid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setLockState('unlocked');
      } else {
        shake();
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        setPin('');
        
        if (attempts >= 5) {
          setLockoutTime(30);
          setPinError('Too many attempts. Try again in 30s');
        } else {
          setPinError(`Incorrect PIN (${5 - attempts} attempts left)`);
        }
      }
    }
  };

  const handlePinDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(pin.slice(0, -1));
  };

  const handleRetryBiometric = async () => {
    const result = await authenticateWithBiometrics();
    if (result.success) {
      setLockState('unlocked');
    }
  };

  const renderPinDots = () => (
    <Animated.View style={{ 
      flexDirection: 'row', 
      gap: scale(12), 
      marginBottom: scale(32),
      transform: [{ translateX: shakeAnim }]
    }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: scale(16),
            height: scale(16),
            borderRadius: scale(8),
            backgroundColor: pin.length > i ? '#10B95F' : 'rgba(255,255,255,0.2)',
            borderWidth: pin.length > i ? 0 : 2,
            borderColor: 'rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </Animated.View>
  );

  const renderPinKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View style={{ gap: scale(12) }}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', gap: scale(20) }}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={{ width: scale(64), height: scale(64) }} />;
              }
              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    onPress={handlePinDelete}
                    style={{
                      width: scale(64),
                      height: scale(64),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="backspace-outline" size={scale(24)} color="#FFFFFF" />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={keyIndex}
                  onPress={() => handlePinPress(key)}
                  disabled={lockoutTime > 0}
                  style={{
                    width: scale(64),
                    height: scale(64),
                    borderRadius: scale(32),
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: lockoutTime > 0 ? 0.5 : 1,
                  }}
                >
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(24), color: '#FFFFFF' }}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // PIN Entry View
  if (lockState === 'pin') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A0A0A', '#111111', '#0A0A0A']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        
        <View style={[styles.content, { paddingTop: scale(60) }]}>
          <View style={{ marginBottom: scale(32), alignItems: 'center' }}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={{ width: scale(72), height: scale(72), borderRadius: scale(18) }} 
            />
          </View>

          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(16), color: '#A1A1AA', marginBottom: scale(8), textAlign: 'center' }}>
            Welcome back, {capitalizedName}
          </Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(28), color: '#FFFFFF', marginBottom: scale(40), textAlign: 'center' }}>
            Enter your PIN
          </Text>

          {renderPinDots()}
          
          {pinError ? (
            <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: '#EF4444', marginBottom: scale(16), textAlign: 'center' }}>
              {pinError}
            </Text>
          ) : lockoutTime > 0 ? (
            <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: '#F59E0B', marginBottom: scale(16), textAlign: 'center' }}>
              Try again in {lockoutTime}s
            </Text>
          ) : null}

          {renderPinKeypad()}
        </View>
      </View>
    );
  }

  // Biometric Retry View
  if (lockState === 'biometric') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A0A0A', '#111111', '#0A0A0A']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View style={[styles.orb, styles.orb1, { opacity: glowAnim }]} />
        <Animated.View style={[styles.orb, styles.orb2, { opacity: glowAnim }]} />
        
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Image source={require('../assets/images/icon.png')} style={styles.appIcon} />
          </Animated.View>

          <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.greeting}>Authenticate to continue</Text>
            <Text style={styles.name}>{capitalizedName}</Text>
          </Animated.View>

          <TouchableOpacity
            onPress={handleRetryBiometric}
            style={{ marginTop: scale(40), backgroundColor: '#10B95F', paddingHorizontal: scale(32), paddingVertical: scale(14), borderRadius: scale(12) }}
          >
            <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(16), color: '#FFFFFF' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Default Welcome View (unlocked or loading)
  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0A0A0A', '#111111', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative gradient orbs */}
      <Animated.View style={[styles.orb, styles.orb1, { opacity: glowAnim }]} />
      <Animated.View style={[styles.orb, styles.orb2, { opacity: glowAnim }]} />

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* App Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.appIcon}
          />
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{capitalizedName}</Text>
          <Text style={styles.subtitle}>Ready to track your trades</Text>
        </Animated.View>

        {/* Stats Preview (if data loaded) */}
        {months.length > 0 && (
          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{months.length}</Text>
              <Text style={styles.statLabel}>Months</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trades.length}</Text>
              <Text style={styles.statLabel}>Trades</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Bottom Section - Pulsing Dots */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    backgroundColor: '#10B95F',
    top: -SCREEN_WIDTH * 0.3,
    left: -SCREEN_WIDTH * 0.2,
    opacity: 0.15,
  },
  orb2: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#10B95F',
    bottom: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.2,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
  },
  iconContainer: {
    marginBottom: scale(40),
    shadowColor: '#10B95F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  appIcon: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(24),
  },
  textContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontFamily: fonts.medium,
    fontSize: fontScale(16),
    color: '#71717A',
    marginBottom: scale(4),
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: fontScale(38),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: scale(8),
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontScale(16),
    color: '#52525B',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(40),
    paddingHorizontal: scale(32),
    paddingVertical: scale(16),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: fontScale(24),
    color: '#10B95F',
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: fontScale(12),
    color: '#71717A',
    marginTop: scale(4),
  },
  statDivider: {
    width: 1,
    height: scale(32),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bottomSection: {
    paddingHorizontal: scale(40),
    paddingBottom: scale(60),
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: scale(8),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#10B95F',
  },
});
