import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { createDocument, getDocumentsWithQuery } from '../services/firebaseService';

interface UserData {
  id?: string;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'patient' | 'doctor';
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
  insuranceCode?: string;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  insuranceStatus?: string;
  doctorInfo?: {
    specialty: string;
    licenseNumber: string;
    experience: number;
    education: string;
    hospital: string;
    rating: number;
    consultationFee: number;
    workingHours: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
  };
  createdAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<any>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  isDoctorRole: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout safety: Force stop loading after 10 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [AUTH] Loading timeout after 10s, forcing stop');
        setLoading(false);
      }
    }, 10000);

    if (!auth) {
      console.warn('Firebase auth not initialized');
      clearTimeout(timeoutId);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔐 [AUTH] Auth state changed');
      console.log('🔐 [AUTH] Current user:', currentUser?.uid, currentUser?.email);
      
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      
      if (currentUser && db) {
        console.log('🔍 [AUTH] Looking for user data in Firestore with UID:', currentUser.uid);
        
        // Đợi một chút để đảm bảo auth token được refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Query nhanh hơn với where clause
          const q = query(
            collection(db, 'users'),
            where('uid', '==', currentUser.uid)
          );
          
          const unsubscribeUserData = onSnapshot(
            q, 
            (snapshot) => {
              if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const loadedUserData = { id: doc.id, ...doc.data() } as UserData;
                setUserData(loadedUserData);
                console.log('✅ [AUTH] User data loaded:', {
                  email: loadedUserData.email,
                  role: loadedUserData.role,
                  fullName: loadedUserData.fullName
                });
              } else {
                console.warn('⚠️ [AUTH] No user data found, will be created on first login');
                setUserData(null);
              }
              setLoading(false);
            }, 
            (error) => {
              console.error('❌ [AUTH] Error fetching user data:', error);
              console.error('❌ [AUTH] Error code:', error.code);
              console.error('❌ [AUTH] Error message:', error.message);
              
              // Nếu lỗi permission, vẫn cho phép user tiếp tục với userData = null
              if (error.code === 'permission-denied') {
                console.warn('⚠️ [AUTH] Permission denied, user will continue without userData');
                setUserData(null);
              }
              setLoading(false);
            }
          );

          return () => unsubscribeUserData();
        } catch (error: any) {
          console.error('❌ [AUTH] Error setting up user data listener:', error);
          console.error('❌ [AUTH] Error code:', error?.code);
          console.error('❌ [AUTH] Error message:', error?.message);
          setUserData(null);
          setLoading(false);
        }
      } else {
        if (!currentUser) {
          console.log('ℹ️ [AUTH] No user logged in');
        } else if (!db) {
          console.warn('⚠️ [AUTH] Database not initialized');
        }
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Starting login process...');
      console.log('📧 [AUTH] Email:', email.trim());
      console.log('🔑 [AUTH] Password length:', password.length);
      
      if (!auth) {
        console.error('❌ [AUTH] Firebase auth not initialized');
        throw new Error('Firebase not initialized');
      }
      
      if (!db) {
        console.error('❌ [AUTH] Firestore not initialized');
        throw new Error('Database not initialized');
      }
      
      // Trim email to remove any whitespace
      const trimmedEmail = email.trim().toLowerCase();
      console.log('✅ [AUTH] Firebase initialized, checking Firestore for user...');
      
      // ✅ BƯỚC 1: Kiểm tra user trong Firestore
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', trimmedEmail)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        console.error('❌ [AUTH] User not found in Firestore');
        throw new Error('Email không tồn tại. Vui lòng đăng ký trước.');
      }
      
      const userDoc = usersSnapshot.docs[0];
      const firestoreUserData = userDoc.data();
      const firestorePassword = firestoreUserData.password;
      
      console.log('✅ [AUTH] User found in Firestore');
      console.log('🔍 [AUTH] Checking password match...');
      
      // ✅ BƯỚC 2: So sánh password với Firestore
      if (firestorePassword !== password) {
        console.error('❌ [AUTH] Password mismatch with Firestore');
        throw new Error('Mật khẩu không đúng. Vui lòng thử lại.');
      }
      
      console.log('✅ [AUTH] Password matches Firestore!');
      
      // ✅ BƯỚC 3: Thử đăng nhập Firebase Auth (KHÔNG BẮT BUỘC)
      let result;
      
      try {
        // Thử với password hiện tại
        result = await signInWithEmailAndPassword(auth, trimmedEmail, firestorePassword);
        console.log('✅ [AUTH] Firebase Auth login successful with current password!');
      } catch (authError: any) {
        console.warn('⚠️ [AUTH] Firebase Auth failed with current password:', authError.code);
        
        // Nếu lỗi password, thử với oldPassword để sync
        if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
          const oldPassword = firestoreUserData.oldPassword;
          
          if (oldPassword && oldPassword !== password) {
            try {
              console.log('🔄 [AUTH] Trying old password to sync Firebase Auth...');
              result = await signInWithEmailAndPassword(auth, trimmedEmail, oldPassword);
              
              // Sync password
              const { updatePassword: updateAuthPassword } = await import('firebase/auth');
              await updateAuthPassword(result.user, password);
              console.log('✅ [AUTH] Firebase Auth password synced!');
            } catch (oldPwError: any) {
              console.warn('⚠️ [AUTH] Old password also failed:', oldPwError.code);
              result = null;
            }
          } else {
            result = null;
          }
        } else {
          result = null;
        }
      }
      
      // ✅ BƯỚC 4: Nếu Firebase Auth không work và email đã tồn tại
      //     Đây là trường hợp user đã reset password nhưng Firebase Auth chưa sync
      //     GI ẢI PHÁP: Hướng dẫn user xóa và cài lại app, hoặc đợi admin xử lý
      if (!result) {
        console.log('🔄 [AUTH] Trying to create new Firebase Auth account...');
        
        try {
          result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          console.log('✅ [AUTH] New Firebase Auth account created!');
          
          // Update UID nếu khác
          if (result.user.uid !== firestoreUserData.uid) {
            const { updateDoc, doc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', userDoc.id), {
              uid: result.user.uid,
            });
            console.log('✅ [AUTH] UID updated in Firestore');
          }
        } catch (createError: any) {
          // Email already exists trong Firebase Auth
          if (createError.code === 'auth/email-already-in-use') {
            console.warn('⚠️ [AUTH] Firebase Auth account exists but password mismatch');
            console.log('⚠️ [AUTH] Firestore password is correct - attempting fallback login');
            
            // FALLBACK: Thử đăng nhập một lần nữa với password hiện tại
            // Có thể Firebase Auth đã được tạo với password này
            try {
              result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
              console.log('✅ [AUTH] Fallback login successful!');
            } catch (fallbackError: any) {
              console.error('❌ [AUTH] Fallback login failed:', fallbackError.code);
              
              // Thông báo user một cách thân thiện hơn
              throw new Error(
                'Mật khẩu đã được đổi thành công, nhưng cần một chút thời gian để đồng bộ.\n\n' +
                'Vui lòng thử lại sau 1-2 phút.\n\n' +
                'Nếu vẫn không được, vui lòng liên hệ hỗ trợ.'
              );
            }
          } else {
            throw createError;
          }
        }
      }
      
      console.log('✅ [AUTH] Login successful!');
      console.log('👤 [AUTH] User UID:', result.user.uid);
      console.log('📧 [AUTH] User Email:', result.user.email);
      
      // Check if user exists in Firestore, if not create it
      if (db) {
        // Đợi một chút để auth token được set
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const q = query(
          collection(db, 'users'),
          where('uid', '==', result.user.uid)
        );
        
        let retries = 3;
        let snapshot = null;
        
        // Retry logic để đảm bảo query thành công
        while (retries > 0 && !snapshot) {
          try {
            snapshot = await getDocs(q);
            break;
          } catch (error: any) {
            console.warn(`⚠️ [AUTH] Query attempt failed, retries left: ${retries - 1}`, error.message);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              throw error;
            }
          }
        }
        
        if (snapshot && snapshot.empty) {
          console.log('⚠️ [AUTH] User not found in Firestore, creating user document...');
          const newUserData = {
            uid: result.user.uid,
            email: result.user.email,
            fullName: result.user.displayName || 'User',
            phone: '',
            role: 'patient', // Mặc định là patient
            dateOfBirth: '',
            gender: '',
            address: '',
            avatar: result.user.photoURL || '',
            bloodType: '',
            height: 0,
            weight: 0,
            allergies: [],
            chronicDiseases: [],
            emergencyContact: null,
            insuranceNumber: '',
            insuranceCode: '',
            createdAt: new Date().toISOString(),
          };
          
          await createDocument('users', newUserData);
          console.log('✅ [AUTH] User document created in Firestore with role: patient');
        } else if (snapshot) {
          const existingUser = snapshot.docs[0].data();
          console.log('✅ [AUTH] User already exists in Firestore with role:', existingUser.role);
        }
      }
      
      // Auth state will change automatically and trigger navigation
      console.log('✅ [AUTH] Login complete, auth state will update automatically');
    } catch (error: any) {
      console.error('❌ [AUTH] Login error:', error);
      console.error('❌ [AUTH] Error code:', error.code);
      console.error('❌ [AUTH] Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('Email không tồn tại. Vui lòng đăng ký trước.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mật khẩu không đúng. Vui lòng thử lại.');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Email hoặc mật khẩu không đúng.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Quá nhiều lần thử. Vui lòng thử lại sau.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Lỗi quyền truy cập. Vui lòng liên hệ admin.');
      }
      
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
      
      // Tạo user document trong Firestore (BAO GỒM PASSWORD)
      const newUserData = {
        uid: userCredential.user.uid,
        email,
        password: password, // ✅ Lưu password vào Firestore để login có thể kiểm tra
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        role: userData.role || 'patient', // Mặc định là patient
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
        insuranceCode: userData.insuranceCode || '',
        createdAt: new Date().toISOString(),
      };
      
      await createDocument('users', newUserData);
      console.log('✅ [REGISTER] User document created with password in Firestore');
      
      // Trả về userCredential để có thể gửi email verification
      return userCredential;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      if (!userData) throw new Error('User data not found');
      
      const { updateDocument } = await import('../services/firebaseService');
      
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

  const isDoctorRole = (): boolean => {
    return userData?.role === 'doctor';
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, userData, loading, login, register, logout, updateUserData, isDoctorRole }}
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
