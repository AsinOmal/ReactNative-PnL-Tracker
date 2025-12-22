import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { fonts } from '../src/config/fonts';
import { fontScale, scale } from '../src/utils/scaling';

interface OnboardingSlide {
  id: number;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  textColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
}

const onboarding: OnboardingSlide[] = [
  {
    id: 1,
    bgColor: '#10B95F',
    iconBgColor: 'rgba(255,255,255,0.25)',
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF',
    icon: 'trending-up',
    title: 'Track\nYour Trades',
    subtitle: 'with ease',
    description: 'Record your monthly P&L and keep all trading data organized.',
  },
  {
    id: 2,
    bgColor: '#1A1A1A',
    iconBgColor: 'rgba(255,255,255,0.15)',
    iconColor: '#FFFFFF',
    textColor: '#FFFFFF',
    icon: 'bar-chart',
    title: 'Analyze\n& Grow',
    subtitle: 'your portfolio',
    description: 'Beautiful charts and analytics to understand your patterns.',
  },
  {
    id: 3,
    bgColor: '#F59E0B',
    iconBgColor: 'rgba(0,0,0,0.1)',
    iconColor: '#1A1A1A',
    textColor: '#1A1A1A',
    icon: 'document-text',
    title: 'Export\n& Share',
    subtitle: 'your reports',
    description: 'Generate professional PDF reports and CSV exports.',
  },
];

const STORAGE_KEY = '@tradex_onboarding_complete';

export default function OnboardingScreen() {
  const router = useRouter();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

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
        setActiveIndex((prev) => Math.min(prev + 1, onboarding.length - 1));
      }
      swiperRef.current?.scrollBy(1, true);
    }
  };

  const currentSlide = onboarding[activeIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.bgColor }]}>
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
          <View key={item.id} style={styles.slide}>
            {/* Icon Circle */}
            <View style={styles.iconSection}>
              <View style={[styles.iconContainer, { backgroundColor: item.iconBgColor }]}>
                <Ionicons name={item.icon} size={scale(80)} color={item.iconColor} />
              </View>
            </View>

            {/* Content - Left Aligned */}
            <View style={styles.content}>
              <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
              <Text style={[styles.subtitle, { color: item.textColor, opacity: 0.8 }]}>{item.subtitle}</Text>
              <Text style={[styles.description, { color: item.textColor, opacity: 0.6 }]}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Swiper>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Dots - Left */}
        <View style={styles.dots}>
          {onboarding.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex
                      ? currentSlide.textColor
                      : `${currentSlide.textColor}40`,
                },
              ]}
            />
          ))}
        </View>

        {/* Arrow Button - Right */}
        <TouchableOpacity
          style={[styles.arrowButton, { backgroundColor: currentSlide.textColor }]}
          onPress={handleNext}
        >
          <Ionicons
            name={isLastSlide ? 'checkmark' : 'arrow-forward'}
            size={scale(24)}
            color={currentSlide.bgColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingRight: scale(8),
    paddingTop: scale(50),
    paddingBottom: scale(16),
  },
  skipBtn: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
  },
  skipText: {
    fontFamily: fonts.bold,
    fontSize: fontScale(16),
  },
  slide: {
    flex: 1,
  },
  iconSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: scale(32),
    paddingBottom: scale(140),
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontScale(42),
    lineHeight: fontScale(48),
    marginBottom: scale(8),
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontScale(16),
    marginBottom: scale(12),
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
  },
  bottomNav: {
    position: 'absolute',
    bottom: scale(48),
    left: scale(32),
    right: scale(32),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: scale(8),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  arrowButton: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
