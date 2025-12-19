import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../config/fonts';
import { useTheme } from '../context/ThemeContext';
import { fontScale, scale } from '../utils/scaling';

type IconName = 'bar-chart' | 'trending-up' | 'calendar' | 'wallet' | 'analytics' | 'document-text';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
}

export function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  onAction,
  icon = 'bar-chart'
}: EmptyStateProps) {
  const { isDark } = useTheme();
  
  const colors = {
    text: isDark ? '#F4F4F5' : '#18181B',
    textMuted: isDark ? '#71717A' : '#A1A1AA',
    primary: '#6366F1',
    iconBg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.button}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(40),
  },
  iconContainer: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: fontScale(20),
    fontFamily: fonts.semiBold,
    marginBottom: scale(8),
    textAlign: 'center',
  },
  message: {
    fontSize: fontScale(14),
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: fontScale(20),
    marginBottom: scale(24),
  },
  button: {
    backgroundColor: '#10B95F',
    paddingHorizontal: scale(24),
    paddingVertical: scale(14),
    borderRadius: scale(24),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontFamily: fonts.semiBold,
  },
});
