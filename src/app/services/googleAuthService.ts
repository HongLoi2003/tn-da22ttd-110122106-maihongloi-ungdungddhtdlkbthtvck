import { auth } from '@/config/firebase';
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
    console.log('⚠️ Google Sign-In: Skipping configure (web or package not available)');
    return;
  }

  try {
    const webClientId = process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || '';
    
    if (!webClientId) {
      console.error('❌ EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID is missing!');
      console.error('Add to .env.local: EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=9119519990-h0ghp9fhpjltof05160ea98bchd42i6n.apps.googleusercontent.com');
      return;
    }
    
    console.log('🔧 Configuring Google Sign-In...');
    console.log('   Web Client ID:', webClientId.substring(0, 20) + '...');
    
    GoogleSignin.configure({
      webClientId: webClientId,
      offlineAccess: true,
    });
    
    console.log('✅ Google Sign-In configured successfully!');
  } catch (error) {
    console.error('❌ Error configuring Google Sign-In:', error);
    console.error('   Make sure SHA-1 fingerprint is added to Firebase Console');
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

  // Mobile: Kiểm tra package có sẵn không
  if (!GoogleSignin) {
    console.warn('⚠️ Google Sign-In chưa sẵn sàng trong dev mode');
    throw new Error('Google Sign-In chỉ hoạt động trên APK build.\n\nVui lòng:\n1. Build APK: eas build -p android\n2. Hoặc sử dụng đăng nhập Email');
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
