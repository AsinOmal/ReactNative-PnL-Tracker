import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../config/fonts';

interface MilestoneCelebrationProps {
  visible: boolean;
  milestone: 25 | 50 | 75 | 100;
  onClose: () => void;
  isDark?: boolean;
}

export function MilestoneCelebration({ visible, milestone, onClose, isDark = false }: MilestoneCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const milestoneData = {
    25: { icon: 'rocket' as const, title: 'Great Start!', subtitle: "You're 25% to your goal", color: '#3B82F6' },
    50: { icon: 'flame' as const, title: 'Halfway There!', subtitle: "50% achieved - keep it up!", color: '#8B5CF6' },
    75: { icon: 'star' as const, title: 'Almost There!', subtitle: "75% done - home stretch!", color: '#F59E0B' },
    100: { icon: 'trophy' as const, title: 'Goal Achieved!', subtitle: "Congratulations! You did it!", color: '#10B95F' },
  };

  const data = milestoneData[milestone];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={isDark ? ['#1F1F23', '#27272A'] : ['#FFFFFF', '#F4F4F5']}
            style={styles.card}
          >
            {/* Animated Icon */}
            <Animated.View style={[styles.iconContainer, { backgroundColor: data.color, transform: [{ rotate: spin }] }]}>
              <Ionicons name={data.icon} size={40} color="#FFFFFF" />
            </Animated.View>

            {/* Milestone Badge */}
            <View style={[styles.badge, { backgroundColor: data.color }]}>
              <Text style={styles.badgeText}>{milestone}%</Text>
            </View>

            {/* Text */}
            <Text style={[styles.title, { color: isDark ? '#F4F4F5' : '#18181B' }]}>
              {data.title}
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#71717A' : '#A1A1AA' }]}>
              {data.subtitle}
            </Text>

            {/* Close Button */}
            <TouchableOpacity style={[styles.button, { backgroundColor: data.color }]} onPress={onClose}>
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 320,
  },
  card: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
