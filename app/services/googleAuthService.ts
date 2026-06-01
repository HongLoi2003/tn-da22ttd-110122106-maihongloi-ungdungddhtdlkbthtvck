import { auth } from '@/app/config/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';

// Import Google Sign-In cho mobile
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch (error) {
    console.warn('Google Sign-In package not available');
  }
}

/**
 * Cấu hình Google Sign-In cho mobile
 * Cần gọi function này khi app khởi động
 */
export const configureGoogleSignIn = () => {
  if (Platform.OS === 'web' || !GoogleSignin) {
    return;
  }

  try {
    GoogleSignin.configure({
      // Web Client ID từ Firebase Console
      // Lấy từ: Firebase Console → Project Settings → General → Web API Key
      webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || '',
      offlineAccess: true,
    });
    console.log('✅ Google Sign-In configured for mobile');
  } catch (error) {
    console.error('❌ Error configuring Google Sign-In:', error);
  }
};

/**
 * Đăng nhập bằng Google
 * Tự động detect platform và sử dụng method phù hợp
 */
export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase Auth chưa được khởi tạo');
  }

  // Web: Sử dụng popup
  if (Platform.OS === 'web') {
    return await signInWithGoogleWeb();
  }

  // Mobile: Sử dụng native Google Sign-In
  return await signInWithGoogleMobile();
};

/**
 * Đăng nhập Google trên Web
 */
const signInWithGoogleWeb = async () => {
  try {
    console.log('🔄 [WEB] Đang đăng nhập bằng Google...');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await signInWithPopup(auth!, provider);
    console.log('✅ [WEB] Đăng nhập Google thành công!');
    console.log('👤 User:', result.user.email);

    return result;
  } catch (error: any) {
    console.error('❌ [WEB] Lỗi đăng nhập Google:', error);
    throw error;
  }
};

/**
 * Đăng nhập Google trên Mobile
 */
const signInWithGoogleMobile = async () => {
  if (!GoogleSignin) {
    throw new Error('Google Sign-In package chưa được cài đặt');
  }

  try {
    console.log('🔄 [MOBILE] Đang đăng nhập bằng Google...');

    // Kiểm tra Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Đăng nhập
    const userInfo = await GoogleSignin.signIn();
    console.log('✅ [MOBILE] Đã lấy thông tin Google user');

    // Lấy ID token
    const { idToken } = await GoogleSignin.getTokens();
    console.log('✅ [MOBILE] Đã lấy ID token');

    // Tạo credential
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Đăng nhập vào Firebase
    const result = await signInWithCredential(auth!, googleCredential);
    console.log('✅ [MOBILE] Đăng nhập Firebase thành công!');
    console.log('👤 User:', result.user.email);

    return result;
  } catch (error: any) {
    console.error('❌ [MOBILE] Lỗi đăng nhập Google:', error);
    
    // Xử lý các lỗi cụ thể
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Bạn đã hủy đăng nhập');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Đăng nhập đang được xử lý');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services không khả dụng');
    }
    
    throw error;
  }
};

/**
 * Đăng xuất Google
 */
export const signOutGoogle = async () => {
  if (Platform.OS !== 'web' && GoogleSignin) {
    try {
      await GoogleSignin.signOut();
      console.log('✅ Đã đăng xuất Google');
    } catch (error) {
      console.error('❌ Lỗi đăng xuất Google:', error);
    }
  }
};

/**
 * Kiểm tra user đã đăng nhập Google chưa
 */
export const isSignedInGoogle = async (): Promise<boolean> => {
  if (Platform.OS === 'web' || !GoogleSignin) {
    return false;
  }

  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    return false;
  }
};

/**
 * Lấy thông tin user hiện tại từ Google
 */
export const getCurrentGoogleUser = async () => {
  if (Platform.OS === 'web' || !GoogleSignin) {
    return null;
  }

  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    return null;
  }
};
