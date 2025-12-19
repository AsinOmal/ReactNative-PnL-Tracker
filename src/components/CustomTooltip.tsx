import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import { fontScale, scale } from '../utils/scaling';

export function CustomTooltip() {
  const { currentStep, goToNext, stop, isLastStep, currentStepNumber, totalStepsNumber } = useCopilot();
  
  return (
    <View style={{
      backgroundColor: '#1F1F23',
      borderRadius: scale(20),
      paddingHorizontal: scale(20),
      paddingVertical: scale(18),
      minWidth: scale(280),
      maxWidth: scale(320),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    }}>
      {/* Step indicator */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: scale(12),
        gap: scale(8),
      }}>
        <LinearGradient
          colors={['#10B95F', '#059669']}
          style={{
            width: scale(28),
            height: scale(28),
            borderRadius: scale(8),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="sparkles" size={scale(14)} color="#FFFFFF" />
        </LinearGradient>
        <Text style={{
          color: '#71717A',
          fontWeight: '600',
          fontSize: fontScale(12),
          letterSpacing: 0.5,
        }}>
          STEP {currentStepNumber} OF {totalStepsNumber}
        </Text>
      </View>

      {/* Main text */}
      <Text style={{
        color: '#F4F4F5',
        fontWeight: '500',
        fontSize: fontScale(15),
        lineHeight: fontScale(22),
        marginBottom: scale(18),
      }}>
        {currentStep?.text || 'Follow the tour!'}
      </Text>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => stop()}
          style={{
            paddingVertical: scale(8),
            paddingHorizontal: scale(16),
          }}
        >
          <Text style={{ color: '#71717A', fontWeight: '600', fontSize: fontScale(14) }}>Skip</Text>
        </TouchableOpacity>

        {!isLastStep ? (
          <TouchableOpacity 
            onPress={() => goToNext()}
            style={{
              backgroundColor: '#10B95F',
              paddingVertical: scale(10),
              paddingHorizontal: scale(20),
              borderRadius: scale(12),
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(6),
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: fontScale(14) }}>Next</Text>
            <Ionicons name="arrow-forward" size={scale(14)} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => stop()}
            style={{
              backgroundColor: '#10B95F',
              paddingVertical: scale(10),
              paddingHorizontal: scale(20),
              borderRadius: scale(12),
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(6),
            }}
          >
            <Ionicons name="checkmark-circle" size={scale(16)} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: fontScale(14) }}>Got it!</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
