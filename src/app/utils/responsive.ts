import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale width based on screen size
 */
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale height based on screen size
 */
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size based on screen size and pixel density
 */
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(newSize);
};

/**
 * Moderate scale - balance between width and height
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Get responsive padding
 */
export const getResponsivePadding = () => {
  if (SCREEN_WIDTH < 360) {
    // Small phones
    return {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    };
  } else if (SCREEN_WIDTH < 768) {
    // Normal phones
    return {
      xs: 6,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
    };
  } else {
    // Tablets
    return {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40,
    };
  }
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return SCREEN_WIDTH >= 768 || aspectRatio < 1.6;
};

/**
 * Check if device is small phone
 */
export const isSmallPhone = (): boolean => {
  return SCREEN_WIDTH < 360;
};

/**
 * Get safe area insets (for notch devices)
 */
export const getSafeAreaInsets = () => {
  // This is a basic implementation
  // For production, use react-native-safe-area-context
  return {
    top: Platform.OS === 'android' ? 0 : 44,
    bottom: Platform.OS === 'android' ? 0 : 34,
    left: 0,
    right: 0,
  };
};

export const responsive = {
  width: scaleWidth,
  height: scaleHeight,
  fontSize: scaleFontSize,
  moderate: moderateScale,
  padding: getResponsivePadding(),
  isTablet: isTablet(),
  isSmallPhone: isSmallPhone(),
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
};
