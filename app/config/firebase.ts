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

// Validate Firebase config
const validateFirebaseConfig = (config: FirebaseConfigType): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return requiredFields.every(field => config[field as keyof FirebaseConfigType]);
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
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase. Check your configuration.');
}

export { app, auth, db, isConfigValid, storage };
export default app;
