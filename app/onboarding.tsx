import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Swiper from 'react-native-swiper';
import { fontScale, scale } from '../src/utils/scaling';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  textColor: string;
}

const onboarding: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Track\nYour Trades',
    subtitle: 'with ease',
    description: 'Record your monthly P&L and keep all trading data organized.',
    icon: 'trending-up',
    bgColor: '#10B95F', // Green
    textColor: '#FFFFFF',
  },
  {
    id: 2,
    title: 'Analyze\n& Grow',
    subtitle: 'your portfolio',
    description: 'Beautiful charts and analytics to understand your patterns.',
    icon: 'bar-chart',
    bgColor: '#1E1E1E', // Dark
    textColor: '#FFFFFF',
  },
  {
    id: 3,
    title: 'Export\n& Share',
    subtitle: 'your reports',
    description: 'Generate professional PDF reports and CSV exports.',
    icon: 'document-text',
    bgColor: '#FFB800', // Gold/Yellow
    textColor: '#1E1E1E',
  },
];

const STORAGE_KEY = '@tradex_onboarding_complete';

export default function OnboardingScreen() {
  const router = useRouter();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const isLastSlide = activeIndex === onboarding.length - 1;
  const currentSlide = onboarding[activeIndex];
  
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      router.replace('/auth/welcome');
    } catch (e) {
      console.error('Failed to save onboarding status:', e);
      router.replace('/auth/welcome');
    }
  };
  
  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      if (Platform.OS === 'web') {
        setActiveIndex(prev => Math.min(prev + 1, onboarding.length - 1));
      }
      swiperRef.current?.scrollBy(1, true);
    }
  };
  
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={currentSlide.textColor === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      
      <Swiper
        ref={swiperRef}
        loop={false}
        index={activeIndex}
        showsPagination={false}
        onIndexChanged={(index) => setActiveIndex(index)}
        scrollEnabled={true}
        showsButtons={false}
      >
        {onboarding.map((item) => (
          <View key={item.id} style={{ flex: 1, backgroundColor: item.bgColor, paddingTop: scale(60) }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: scale(24), marginBottom: scale(20) }}>
              <TouchableOpacity onPress={completeOnboarding}>
                <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: item.textColor, opacity: 0.7 }}>Skip</Text>
              </TouchableOpacity>
            </View>
            
            {/* Visual Area */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: scale(40) }}>
              <View 
                style={{ 
                  width: scale(200), 
                  height: scale(200), 
                  borderRadius: scale(100), 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: item.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                }}
              >
                <Ionicons name={item.icon} size={scale(100)} color={item.textColor} />
              </View>
            </View>
            
            {/* Content Area */}
            <View style={{ paddingHorizontal: scale(32), paddingBottom: scale(140) }}>
              <Text style={{ fontSize: fontScale(42), fontWeight: '800', lineHeight: fontScale(48), letterSpacing: -0.5, color: item.textColor, marginBottom: scale(8) }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: fontScale(16), fontWeight: '500', color: item.textColor, opacity: 0.7, marginBottom: scale(12) }}>
                {item.subtitle}
              </Text>
              <Text style={{ fontSize: fontScale(15), lineHeight: fontScale(22), color: item.textColor, opacity: 0.6, maxWidth: scale(280) }}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Swiper>
      
      {/* Bottom Navigation */}
      <View style={{ position: 'absolute', bottom: scale(50), left: scale(32), right: scale(32), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Dots & Label */}
        <View>
          <View style={{ flexDirection: 'row', gap: scale(8) }}>
            {onboarding.map((_, index) => (
              <View 
                key={index} 
                style={{ 
                  width: scale(8), 
                  height: scale(8), 
                  borderRadius: scale(4), 
                  backgroundColor: index === activeIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </View>
        </View>
        
        {/* Next Button */}
        <TouchableOpacity 
          style={{ 
            width: scale(56), 
            height: scale(56), 
            borderRadius: scale(16), 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: currentSlide.textColor === '#FFFFFF' ? '#FFFFFF' : '#1E1E1E',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleNext}
        >
          <Ionicons 
            name={isLastSlide ? 'checkmark' : 'chevron-forward'} 
            size={scale(24)} 
            color={currentSlide.textColor === '#FFFFFF' ? currentSlide.bgColor : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
