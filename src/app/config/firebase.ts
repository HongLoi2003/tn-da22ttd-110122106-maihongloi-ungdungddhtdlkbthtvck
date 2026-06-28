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

const validateFirebaseConfig = (config: FirebaseConfigType): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const isValid = requiredFields.every(field => {
    const value = config[field as keyof FirebaseConfigType];
    return value && value.trim() !== '';
  });
  
  if (!isValid) {
    console.log('Firebase Config Check:');
    requiredFields.forEach(field => {
      const value = config[field as keyof FirebaseConfigType];
      console.log('  ' + field + ': ' + (value ? 'OK' : 'MISSING'));
    });
  }
  
  return isValid;
};

const firebaseConfig: FirebaseConfigType = {
  apiKey: "AIzaSyDehJOLX38acOCdq1CFbVqigBgxebaBD2k",
  authDomain: "hearthcare-847b3.firebaseapp.com",
  projectId: "hearthcare-847b3",
  storageBucket: "hearthcare-847b3.firebasestorage.app",
  messagingSenderId: "9119519990",
  appId: "1:9119519990:web:0f8f0508861c87e2be48d7",
};

const isConfigValid = validateFirebaseConfig(firebaseConfig);

if (!isConfigValid) {
  console.error('Firebase configuration is incomplete');
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized');
    
    try {
      auth = getAuth(app);
      console.log('Firebase Auth initialized');
    } catch (error: any) {
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
        console.log('Firebase Auth already initialized');
      } else {
        console.error('Firebase Auth error:', error);
      }
    }
    
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase Firestore and Storage initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase configuration is invalid');
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  return auth;
}

export { app, auth, db, isConfigValid, storage };
export default app;
