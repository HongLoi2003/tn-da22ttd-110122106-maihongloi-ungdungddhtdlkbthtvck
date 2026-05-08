/**
 * Application Configuration
 * Centralized configuration management for the app
 */

export const CONFIG = {
  // Firebase
  firebase: {
    isConfigured: !!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  },

  // API Endpoints
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Notifications
  notifications: {
    appointmentReminderBefore: 60 * 60 * 1000, // 1 hour before
    medicationReminderTime: '08:00', // 8 AM
  },

  // Validation Rules
  validation: {
    passwordMinLength: 8,
    phonePattern: /^[0-9]{10,11}$/,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Feature Flags
  features: {
    videoCall: true,
    voiceCall: true,
    aiDiagnostic: true,
    pharmacy: true,
    insurance: true,
  },

  // Agora Configuration (for video/voice calls)
  agora: {
    appId: process.env.EXPO_PUBLIC_AGORA_APP_ID || '',
    appCertificate: process.env.EXPO_PUBLIC_AGORA_APP_CERTIFICATE || '',
    isConfigured: !!process.env.EXPO_PUBLIC_AGORA_APP_ID,
  },
};

export default CONFIG;
