import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../src/config/fonts';
import { useTheme } from '../src/context/ThemeContext';
import { hasPIN, setPIN, setPinLockEnabled, verifyPIN } from '../src/services/pinService';
import { fontScale, scale } from '../src/utils/scaling';

type Mode = 'setup' | 'confirm' | 'change-verify' | 'change-new' | 'change-confirm';

export default function SetPinScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    border: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [mode, setMode] = useState<Mode>('setup');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const PIN_LENGTH = 6;
  
  const getTitle = () => {
    switch (mode) {
      case 'setup': return 'Create PIN';
      case 'confirm': return 'Confirm PIN';
      case 'change-verify': return 'Enter Current PIN';
      case 'change-new': return 'New PIN';
      case 'change-confirm': return 'Confirm New PIN';
      default: return 'Set PIN';
    }
  };
  
  const getSubtitle = () => {
    switch (mode) {
      case 'setup': return 'Enter a 6-digit PIN to secure your app';
      case 'confirm': return 'Re-enter your PIN to confirm';
      case 'change-verify': return 'Enter your current PIN to continue';
      case 'change-new': return 'Enter your new 6-digit PIN';
      case 'change-confirm': return 'Re-enter your new PIN to confirm';
      default: return '';
    }
  };
  
  const handleKeyPress = async (key: string) => {
    setError('');
    
    if (key === 'delete') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin(prev => prev.slice(0, -1));
      return;
    }
    
    if (pin.length >= PIN_LENGTH) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPin = pin + key;
    setPin(newPin);
    
    // Check if PIN is complete
    if (newPin.length === PIN_LENGTH) {
      await handlePinComplete(newPin);
    }
  };
  
  const handlePinComplete = async (completedPin: string) => {
    switch (mode) {
      case 'setup':
        setFirstPin(completedPin);
        setPin('');
        setMode('confirm');
        break;
        
      case 'confirm':
        if (completedPin === firstPin) {
          // PINs match - save and enable
          await setPIN(completedPin);
          await setPinLockEnabled(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowSuccess(true);
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          // PINs don't match
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError('PINs do not match. Try again.');
          setPin('');
          setFirstPin('');
          setMode('setup');
        }
        break;
        
      case 'change-verify':
        const isValid = await verifyPIN(completedPin);
        if (isValid) {
          setPin('');
          setMode('change-new');
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError('Incorrect PIN');
          setPin('');
        }
        break;
        
      case 'change-new':
        setFirstPin(completedPin);
        setPin('');
        setMode('change-confirm');
        break;
        
      case 'change-confirm':
        if (completedPin === firstPin) {
          await setPIN(completedPin);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowSuccess(true);
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError('PINs do not match. Try again.');
          setPin('');
          setFirstPin('');
          setMode('change-new');
        }
        break;
    }
  };
  
  // Check if this is a change PIN flow on mount
  React.useEffect(() => {
    const checkExistingPin = async () => {
      const hasExisting = await hasPIN();
      if (hasExisting) {
        setMode('change-verify');
      }
    };
    checkExistingPin();
  }, []);
  
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={{
            width: scale(16),
            height: scale(16),
            borderRadius: scale(8),
            backgroundColor: i < pin.length ? '#10B95F' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            marginHorizontal: scale(8),
          }}
        />
      );
    }
    return dots;
  };
  
  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];
    
    return keys.map((row, rowIndex) => (
      <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: scale(16) }}>
        {row.map((key, keyIndex) => {
          if (key === '') {
            return <View key={keyIndex} style={{ width: scale(80), height: scale(80), marginHorizontal: scale(12) }} />;
          }
          
          return (
            <TouchableOpacity
              key={keyIndex}
              onPress={() => handleKeyPress(key)}
              activeOpacity={0.7}
              style={{
                width: scale(80),
                height: scale(80),
                borderRadius: scale(40),
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: scale(12),
              }}
            >
              {key === 'delete' ? (
                <Ionicons name="backspace-outline" size={scale(28)} color={themeColors.text} />
              ) : (
                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(28), color: themeColors.text }}>
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };
  
  // Success Screen
  if (showSuccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(32) }}>
          <LinearGradient
            colors={['#10B95F', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: scale(100),
              height: scale(100),
              borderRadius: scale(50),
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: scale(32),
            }}
          >
            <Ionicons name="checkmark" size={scale(50)} color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(28), color: themeColors.text, marginBottom: scale(12), textAlign: 'center' }}>
            {mode === 'change-confirm' ? 'PIN Changed!' : 'PIN Set!'}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(16), color: themeColors.textMuted, textAlign: 'center' }}>
            Your app is now secured with a 6-digit PIN
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: scale(12) }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: scale(40),
            height: scale(40),
            borderRadius: scale(12),
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={scale(22)} color={themeColors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: scale(40) }}>
        {/* Top Section */}
        <View style={{ alignItems: 'center', paddingTop: scale(40) }}>
          {/* Icon */}
          <LinearGradient
            colors={['#10B95F', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: scale(72),
              height: scale(72),
              borderRadius: scale(36),
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: scale(24),
            }}
          >
            <Ionicons name="lock-closed" size={scale(32)} color="#FFFFFF" />
          </LinearGradient>
          
          {/* Title */}
          <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(28), color: themeColors.text, marginBottom: scale(8) }}>
            {getTitle()}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: themeColors.textMuted, textAlign: 'center', paddingHorizontal: scale(32) }}>
            {getSubtitle()}
          </Text>
          
          {/* PIN Dots */}
          <View style={{ flexDirection: 'row', marginTop: scale(40) }}>
            {renderDots()}
          </View>
          
          {/* Error */}
          {error ? (
            <Text style={{ fontFamily: fonts.medium, fontSize: fontScale(14), color: '#EF4444', marginTop: scale(16) }}>
              {error}
            </Text>
          ) : null}
        </View>
        
        {/* Keypad */}
        <View style={{ paddingHorizontal: scale(20) }}>
          {renderKeypad()}
        </View>
      </View>
    </SafeAreaView>
  );
}
