import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Detect if running on web
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Validate Firebase config
const validateFirebaseConfig = (config: FirebaseConfigType): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const isValid = requiredFields.every(field => {
    const value = config[field as keyof FirebaseConfigType];
    return value && value.trim() !== '';
  });
  
  if (!isValid) {
    console.log('🔍 Firebase Config Check:');
    requiredFields.forEach(field => {
      const value = config[field as keyof FirebaseConfigType];
      console.log(`  ${field}: ${value ? '✅' : '❌'}`);
    });
  }
  
  return isValid;
};

// Firebase configuration from environment variables
const firebaseConfig: FirebaseConfigType = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if Firebase config is valid
const isConfigValid = validateFirebaseConfig(firebaseConfig);

if (!isConfigValid) {
  console.error(
    '❌ Firebase configuration is incomplete. Please add all required environment variables to .env.local:\n' +
    '- EXPO_PUBLIC_FIREBASE_API_KEY\n' +
    '- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN\n' +
    '- EXPO_PUBLIC_FIREBASE_PROJECT_ID\n' +
    '- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET\n' +
    '- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID\n' +
    '- EXPO_PUBLIC_FIREBASE_APP_ID'
  );
}

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    // Initialize Auth based on platform
    try {
      // Just use getAuth for all platforms - Firebase SDK handles persistence automatically
      auth = getAuth(app);
      console.log(`✅ Firebase Auth initialized for ${isWeb ? 'WEB' : 'MOBILE'}`);
    } catch (error: any) {
      // If auth is already initialized, just get it
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
        console.log('✅ Firebase Auth already initialized, using existing instance');
      } else {
        console.error('❌ Firebase Auth initialization error:', error);
      }
    }
    
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase Firestore and Storage initialized');
    console.log(`🌐 Platform: ${isWeb ? 'WEB' : 'MOBILE'}`);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.warn('⚠️ Firebase is not initialized. Some features may not work.');
  }
} else {
  console.warn('⚠️ Firebase configuration is invalid. Firebase features will not work.');
}

export { app, auth, db, isConfigValid, storage };
export default app;
