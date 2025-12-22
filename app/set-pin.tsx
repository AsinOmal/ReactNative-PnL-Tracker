import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../src/config/fonts';
import { useTheme } from '../src/context/ThemeContext';
import { removePIN, setPIN, setPinLockEnabled, verifyPIN } from '../src/services/pinService';
import { fontScale, scale } from '../src/utils/scaling';

// Mode: 'setup' (new PIN), 'change' (verify then new), 'disable' (verify then remove)
type Mode = 'setup' | 'change' | 'disable';

// Steps: 'verify' (current PIN), 'enter' (new PIN), 'confirm' (confirm new), 'success'
type Step = 'verify' | 'enter' | 'confirm' | 'success';

export default function SetPinScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: Mode = (params.mode as Mode) || 'setup';
  
  const [step, setStep] = useState<Step>(mode === 'setup' ? 'enter' : 'verify');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [shakeAnim] = useState(new Animated.Value(0));
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#18181B' : '#FFFFFF',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
    border: isDark ? '#27272A' : '#E4E4E7',
    primary: '#10B95F',
    error: '#EF4444',
  };

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showSuccess = (message: string) => {
    setStep('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.parallel([
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        router.back();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const getCurrentPinValue = () => {
    if (step === 'verify') return currentPin;
    if (step === 'enter') return newPin;
    return confirmPin;
  };

  const handleNumberPress = async (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setError('');
    
    if (step === 'verify') {
      const updated = currentPin + num;
      setCurrentPin(updated);
      if (updated.length === 6) {
        const isValid = await verifyPIN(updated);
        if (isValid) {
          if (mode === 'disable') {
            // Disable PIN
            await removePIN();
            showSuccess('PIN Lock Disabled');
          } else {
            // Move to enter new PIN
            setStep('enter');
          }
        } else {
          shake();
          setError('Incorrect PIN');
          setCurrentPin('');
        }
      }
    } else if (step === 'enter') {
      const updated = newPin + num;
      setNewPin(updated);
      if (updated.length === 6) {
        setStep('confirm');
      }
    } else if (step === 'confirm') {
      const updated = confirmPin + num;
      setConfirmPin(updated);
      if (updated.length === 6) {
        if (updated === newPin) {
          await setPIN(updated);
          await setPinLockEnabled(true);
          showSuccess(mode === 'change' ? 'PIN Changed' : 'PIN Lock Enabled');
        } else {
          shake();
          setError('PINs do not match');
          setConfirmPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'verify') {
      setCurrentPin(currentPin.slice(0, -1));
    } else if (step === 'enter') {
      setNewPin(newPin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setNewPin('');
      setConfirmPin('');
      setError('');
    } else if (step === 'enter' && mode === 'change') {
      setStep('verify');
      setCurrentPin('');
      setNewPin('');
      setError('');
    } else {
      router.back();
    }
  };

  const getTitle = () => {
    if (mode === 'disable') return 'Confirm PIN';
    if (mode === 'change') {
      if (step === 'verify') return 'Current PIN';
      if (step === 'enter') return 'New PIN';
      return 'Confirm New PIN';
    }
    return step === 'enter' ? 'Set PIN' : 'Confirm PIN';
  };

  const getHeading = () => {
    if (mode === 'disable') return 'Enter your current PIN';
    if (mode === 'change') {
      if (step === 'verify') return 'Verify your current PIN';
      if (step === 'enter') return 'Create a new 6-digit PIN';
      return 'Confirm your new PIN';
    }
    if (step === 'enter') return 'Create a 6-digit PIN';
    return 'Confirm your PIN';
  };

  const getSubheading = () => {
    if (mode === 'disable') return 'To disable PIN lock, enter your current PIN';
    if (mode === 'change') {
      if (step === 'verify') return 'Enter your current PIN to continue';
      if (step === 'enter') return 'Choose a new PIN for the app';
      return 'Enter the same PIN again';
    }
    if (step === 'enter') return 'This PIN will be used to unlock the app';
    return 'Enter the same PIN again to confirm';
  };

  const getSuccessMessage = () => {
    if (mode === 'disable') return 'PIN Lock Disabled';
    if (mode === 'change') return 'PIN Changed';
    return 'PIN Lock Enabled';
  };

  const getSuccessSubtext = () => {
    if (mode === 'disable') return 'PIN lock has been turned off';
    if (mode === 'change') return 'Your PIN has been updated';
    return 'Your app is now protected';
  };

  const pinValue = getCurrentPinValue();

  const renderDots = () => (
    <Animated.View style={{ 
      flexDirection: 'row', 
      gap: scale(12), 
      marginBottom: scale(40),
      transform: [{ translateX: shakeAnim }]
    }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: scale(16),
            height: scale(16),
            borderRadius: scale(8),
            backgroundColor: pinValue.length > i ? themeColors.primary : themeColors.border,
            borderWidth: pinValue.length > i ? 0 : 2,
            borderColor: themeColors.border,
          }}
        />
      ))}
    </Animated.View>
  );

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View style={{ gap: scale(16) }}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', gap: scale(24) }}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={{ width: scale(72), height: scale(72) }} />;
              }
              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    onPress={handleDelete}
                    style={{
                      width: scale(72),
                      height: scale(72),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="backspace-outline" size={scale(28)} color={themeColors.text} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={keyIndex}
                  onPress={() => handleNumberPress(key)}
                  style={{
                    width: scale(72),
                    height: scale(72),
                    borderRadius: scale(36),
                    backgroundColor: themeColors.card,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}
                >
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(28), color: themeColors.text }}>
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

  // Success Screen
  if (step === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(24) }}>
          <Animated.View style={{ 
            transform: [{ scale: successAnim }],
            marginBottom: scale(32)
          }}>
            <LinearGradient
              colors={mode === 'disable' ? ['#71717A', '#52525B'] : ['#10B95F', '#059669']}
              style={{
                width: scale(100),
                height: scale(100),
                borderRadius: scale(50),
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Animated.View style={{ opacity: checkmarkAnim }}>
                <Ionicons name={mode === 'disable' ? 'lock-open' : 'checkmark'} size={scale(56)} color="#FFFFFF" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
          
          <Animated.Text style={{ 
            fontFamily: fonts.bold, 
            fontSize: fontScale(28), 
            color: themeColors.text, 
            marginBottom: scale(8),
            opacity: checkmarkAnim
          }}>
            {getSuccessMessage()}
          </Animated.Text>
          <Animated.Text style={{ 
            fontFamily: fonts.regular, 
            fontSize: fontScale(15), 
            color: themeColors.textMuted, 
            textAlign: 'center',
            opacity: checkmarkAnim
          }}>
            {getSuccessSubtext()}
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: scale(16) }}>
        <TouchableOpacity onPress={handleBack} style={{ padding: scale(8) }}>
          <Ionicons name="arrow-back" size={scale(24)} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(18), color: themeColors.text, marginLeft: scale(8) }}>
          {getTitle()}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(24) }}>
        <View style={{ 
          width: scale(80), 
          height: scale(80), 
          borderRadius: scale(40), 
          backgroundColor: mode === 'disable' ? themeColors.error + '20' : themeColors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: scale(24)
        }}>
          <Ionicons 
            name={mode === 'disable' ? 'lock-open' : 'lock-closed'} 
            size={scale(40)} 
            color={mode === 'disable' ? themeColors.error : themeColors.primary} 
          />
        </View>
        
        <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(24), color: themeColors.text, marginBottom: scale(8), textAlign: 'center' }}>
          {getHeading()}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: themeColors.textMuted, marginBottom: scale(32), textAlign: 'center' }}>
          {getSubheading()}
        </Text>

        {renderDots()}
        
        {error ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: themeColors.error, marginBottom: scale(16), textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}

        {renderKeypad()}
      </View>
    </SafeAreaView>
  );
}
