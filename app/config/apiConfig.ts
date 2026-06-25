/**
 * API Configuration
 * Auto-detect API URL based on environment and platform
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get backend API base URL
 * Tự động phát hiện môi trường và trả về URL phù hợp
 */
export const getApiBaseUrl = (): string => {
  // Production mode - Sử dụng Firebase Functions
  if (!__DEV__) {
    // URL sẽ có dạng: https://REGION-PROJECT_ID.cloudfunctions.net/api
    // TODO: Sau khi deploy, thay YOUR_REGION và YOUR_PROJECT_ID
    // Ví dụ: https://asia-southeast1-heartcare-12345.cloudfunctions.net/api
    return 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/api';
  }

  // Development mode
  // Lấy IP từ Expo debugger URL
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (debuggerHost) {
    // Extract IP from debuggerHost (format: "192.168.1.100:8081")
    const ip = debuggerHost.split(':')[0];
    
    // Điện thoại thật: Dùng IP của máy tính
    if (ip && ip !== 'localhost') {
      console.log('📱 Using device IP:', ip);
      return `http://${ip}:3001`;
    }
  }

  // Platform-specific fallbacks
  if (Platform.OS === 'android') {
    // Android Emulator: 10.0.2.2 = localhost của máy host
    console.log('🤖 Using Android Emulator localhost');
    return 'http://10.0.2.2:3001';
  } else if (Platform.OS === 'ios') {
    // iOS Simulator: localhost
    console.log('🍎 Using iOS Simulator localhost');
    return 'http://localhost:3001';
  } else if (Platform.OS === 'web') {
    // Web: localhost
    console.log('🌐 Using Web localhost');
    return 'http://localhost:3001';
  }

  // Default fallback
  return 'http://localhost:3001';
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password-with-otp',
  HEALTH_CHECK: '/',
} as const;

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Log API URL khi app khởi động
console.log('🔧 API Configuration initialized');
console.log('📡 API Base URL:', getApiBaseUrl());
