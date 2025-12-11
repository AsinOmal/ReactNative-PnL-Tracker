import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 13 Pro)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Scale based on width
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

// Scale based on height
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

// Moderate scale - for fonts and other elements that shouldn't scale too much
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Font scale with pixel ratio consideration
export const fontScale = (size: number): number => {
  const newSize = moderateScale(size, 0.3);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Get responsive value based on screen width breakpoints
export const responsiveValue = <T>(options: { small?: T; medium?: T; large?: T; default: T }): T => {
  if (SCREEN_WIDTH < 375) return options.small ?? options.default;
  if (SCREEN_WIDTH < 414) return options.medium ?? options.default;
  return options.large ?? options.default;
};

// Check if device is a larger phone (Pro Max, Plus, etc.)
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Check if device is a smaller phone (SE, Mini, etc.)
export const isSmallDevice = SCREEN_WIDTH < 375;

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Usage examples:
// scale(16) - scales 16px proportionally to screen width
// verticalScale(100) - scales 100px proportionally to screen height  
// moderateScale(16, 0.5) - scales 16px with 50% of the proportional difference
// fontScale(16) - scales font size moderately (recommended for text)
