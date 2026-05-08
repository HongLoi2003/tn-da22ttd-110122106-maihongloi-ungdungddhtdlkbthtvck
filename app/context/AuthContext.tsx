import { auth, db } from '@/app/config/firebase';
import { createDocument, getDocumentsWithQuery } from '@/app/services/firebaseService';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserData {
  id?: string;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceNumber?: string;
  createdAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      
      if (currentUser && db) {
        // Lắng nghe thay đổi dữ liệu user từ Firestore
        const q = query(
          collection(db, 'users'),
          where('uid', '==', currentUser.uid)
        );
        
        let hasSetLoading = false;
        const unsubscribeUserData = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setUserData({ id: doc.id, ...doc.data() } as UserData);
          } else {
            setUserData(null);
          }
          if (!hasSetLoading) {
            setLoading(false);
            hasSetLoading = true;
          }
        }, (error) => {
          console.error('Error fetching user data:', error);
          if (!hasSetLoading) {
            setLoading(false);
            hasSetLoading = true;
          }
        });

        return () => unsubscribeUserData();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Starting login process...');
      console.log('📧 [AUTH] Email:', email);
      console.log('🔑 [AUTH] Password length:', password.length);
      
      if (!auth) {
        console.error('❌ [AUTH] Firebase auth not initialized');
        throw new Error('Firebase not initialized');
      }
      
      console.log('✅ [AUTH] Firebase auth initialized, attempting signIn...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ [AUTH] Login successful!');
      console.log('👤 [AUTH] User UID:', result.user.uid);
      console.log('📧 [AUTH] User Email:', result.user.email);
    } catch (error: any) {
      console.error('❌ [AUTH] Login error:', error);
      console.error('❌ [AUTH] Error code:', error.code);
      console.error('❌ [AUTH] Error message:', error.message);
      console.error('❌ [AUTH] Full error:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      if (!auth) throw new Error('Firebase not initialized');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Tạo user document trong Firestore
      const newUserData = {
        uid: userCredential.user.uid,
        email,
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: userData.address || '',
        avatar: userData.avatar || '',
        bloodType: userData.bloodType || '',
        height: userData.height || 0,
        weight: userData.weight || 0,
        allergies: userData.allergies || [],
        chronicDiseases: userData.chronicDiseases || [],
        emergencyContact: userData.emergencyContact || null,
        insuranceNumber: userData.insuranceNumber || '',
        createdAt: new Date().toISOString(),
      };
      
      await createDocument('users', newUserData);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      if (!userData) throw new Error('User data not found');
      
      const { updateDocument } = await import('@/app/services/firebaseService');
      
      // Nếu userData có id, sử dụng trực tiếp
      if (userData.id) {
        await updateDocument('users', userData.id, data);
      } else {
        // Nếu không, tìm kiếm theo uid
        const userDocs = await getDocumentsWithQuery('users', [
          where('uid', '==', user.uid)
        ]);
        
        if (userDocs.length > 0) {
          await updateDocument('users', userDocs[0].id, data);
        } else {
          throw new Error('User document not found in Firestore');
        }
      }
    } catch (error) {
      console.error('Update user data error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!auth) throw new Error('Firebase not initialized');
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, userData, loading, login, register, logout, updateUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
