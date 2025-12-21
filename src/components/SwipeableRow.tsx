import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { fonts } from '../config/fonts';
import { fontScale, scale } from '../utils/scaling';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  deleteLabel?: string;
  editLabel?: string;
}

export function SwipeableRow({ 
  children, 
  onDelete,
  onEdit,
  deleteLabel = 'Delete',
  editLabel = 'Edit',
}: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const close = () => {
    swipeableRef.current?.close();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        {onEdit && (
          <Animated.View style={[styles.actionButton, { transform: [{ translateX }] }]}>
            <TouchableOpacity
              style={[styles.action, styles.editAction]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                close();
                onEdit();
              }}
            >
              <Ionicons name="pencil" size={scale(20)} color="#FFFFFF" />
              <Text style={styles.actionText}>{editLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        {onDelete && (
          <Animated.View style={[styles.actionButton, { transform: [{ translateX }] }]}>
            <TouchableOpacity
              style={[styles.action, styles.deleteAction]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                close();
                onDelete();
              }}
            >
              <Ionicons name="trash" size={scale(20)} color="#FFFFFF" />
              <Text style={styles.actionText}>{deleteLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  actionButton: {
    justifyContent: 'center',
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(75),
    height: '100%',
    paddingVertical: scale(16),
  },
  editAction: {
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: scale(12),
    borderBottomLeftRadius: scale(12),
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    borderTopRightRadius: scale(12),
    borderBottomRightRadius: scale(12),
  },
  actionText: {
    fontFamily: fonts.semiBold,
    fontSize: fontScale(11),
    color: '#FFFFFF',
    marginTop: scale(4),
  },
});
