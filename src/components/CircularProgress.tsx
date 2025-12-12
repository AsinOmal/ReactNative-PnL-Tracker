import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fonts } from '../config/fonts';

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  progressColor?: string;
  bgColor?: string;
  centerLabel?: string;
  centerValue?: string;
  isDark?: boolean;
}

export function CircularProgress({
  progress,
  size = 160,
  strokeWidth = 12,
  progressColor = '#10B95F',
  bgColor,
  centerLabel = 'Progress',
  centerValue,
  isDark = false,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const defaultBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#F4F4F5' : '#18181B';
  const mutedColor = isDark ? '#71717A' : '#A1A1AA';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor || defaultBgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.centerContent}>
        <Text style={[styles.centerValue, { color: textColor }]}>
          {centerValue || `${Math.round(clampedProgress * 100)}%`}
        </Text>
        <Text style={[styles.centerLabel, { color: mutedColor }]}>
          {centerLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
  },
  centerValue: {
    fontFamily: fonts.bold,
    fontSize: 32,
  },
  centerLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 2,
  },
});
