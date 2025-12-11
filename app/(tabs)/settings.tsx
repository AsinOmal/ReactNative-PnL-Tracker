import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useTrading } from '../../src/context/TradingContext';
import {
  BiometricCapabilities,
  getBiometricCapabilities,
  getBiometricName,
  isBiometricEnabled,
  setBiometricEnabled,
} from '../../src/services/biometricService';
import { generateAndShareCSV } from '../../src/services/csvService';
import { fontScale, scale } from '../../src/utils/scaling';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { months } = useTrading();
  
  const [biometric, setBiometric] = useState<BiometricCapabilities | null>(null);
  const [biometricOn, setBiometricOn] = useState(false);
  
  useEffect(() => {
    const checkBiometric = async () => {
      const caps = await getBiometricCapabilities();
      setBiometric(caps);
      const enabled = await isBiometricEnabled();
      setBiometricOn(enabled);
    };
    checkBiometric();
  }, []);
  
  const handleBiometricToggle = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBiometricOn(value);
  };
  
  const handleExportCSV = async () => {
    if (months.length === 0) {
      Alert.alert('No Data', 'You have no months to export.');
      return;
    }
    try {
      await generateAndShareCSV(months);
    } catch (err) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };
  
  const themeColors = {
    bg: isDark ? '#0A0A0A' : '#FAFAFA',
    card: isDark ? '#1F1F23' : '#FFFFFF',
    border: isDark ? '#27272A' : '#E4E4E7',
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
  };
  
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: scale(20), paddingTop: scale(12) }}>
          <Text style={{ fontSize: fontScale(32), fontWeight: '700', color: themeColors.text }}>Settings</Text>
          <Text style={{ fontSize: fontScale(11), color: themeColors.textMuted, opacity: 0.5 }}>v1.0.0</Text>
        </View>
        
        {/* Profile Section */}
        <View style={{ marginHorizontal: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: scale(16), gap: scale(16) }}>
            <View style={{ width: scale(56), height: scale(56), borderRadius: scale(28), backgroundColor: '#10B95F', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: fontScale(24), fontWeight: '700', color: '#FFFFFF' }}>
                {user?.email?.[0].toUpperCase() || 'T'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontScale(18), fontWeight: '600', color: themeColors.text }}>
                {user?.email?.split('@')[0] || 'TradeX User'}
              </Text>
              <Text style={{ fontSize: fontScale(14), color: themeColors.textMuted, marginTop: scale(2) }}>
                {user?.email || 'Not signed in'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Appearance */}
        <Text style={{ fontSize: fontScale(12), fontWeight: '600', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: scale(20), marginTop: scale(24), marginBottom: scale(8) }}>Appearance</Text>
        <View style={{ marginHorizontal: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(16) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(14) }}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={scale(22)} color="#10B95F" />
              <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: themeColors.text }}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: themeColors.border, true: '#10B95F' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Security */}
        <Text style={{ fontSize: fontScale(12), fontWeight: '600', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: scale(20), marginTop: scale(24), marginBottom: scale(8) }}>Security</Text>
        <View style={{ marginHorizontal: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, overflow: 'hidden' }}>
          {biometric?.isAvailable && biometric.isEnrolled ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(16) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(14) }}>
                <Ionicons 
                  name={biometric.biometricType === 'faceid' ? 'scan' : 'finger-print'} 
                  size={scale(22)} 
                  color="#10B95F" 
                />
                <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: themeColors.text }}>
                  {getBiometricName(biometric.biometricType)}
                </Text>
              </View>
              <Switch
                value={biometricOn}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: themeColors.border, true: '#10B95F' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(16) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(14) }}>
                <Ionicons name="lock-closed" size={scale(22)} color={themeColors.textMuted} />
                <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: themeColors.textMuted }}>
                  Biometrics not available
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Data */}
        <Text style={{ fontSize: fontScale(12), fontWeight: '600', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: scale(20), marginTop: scale(24), marginBottom: scale(8) }}>Data</Text>
        <View style={{ marginHorizontal: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, overflow: 'hidden' }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(16) }} onPress={handleExportCSV}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(14) }}>
              <Ionicons name="download-outline" size={scale(22)} color="#10B95F" />
              <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: themeColors.text }}>Export to CSV</Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(20)} color={themeColors.textMuted} />
          </TouchableOpacity>
        </View>
        
        {/* Account */}
        <Text style={{ fontSize: fontScale(12), fontWeight: '600', color: themeColors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: scale(20), marginTop: scale(24), marginBottom: scale(8) }}>Account</Text>
        <View style={{ marginHorizontal: scale(20), borderRadius: scale(16), backgroundColor: themeColors.card, overflow: 'hidden' }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(16) }} onPress={handleLogout}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(14) }}>
              <Ionicons name="log-out-outline" size={scale(22)} color="#EF4444" />
              <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: '#EF4444' }}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: scale(120) }} />
      </ScrollView>
    </SafeAreaView>
  );
}
