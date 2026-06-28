import { Redirect } from 'expo-router';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import SplashScreen from './splash-screen';

export default function Index() {
  const { isLoggedIn, loading, isDoctorRole, userData, user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  console.log('📍 [INDEX] Rendering with:', { 
    isLoggedIn, 
    loading,
    showSplash,
    isDoctor: isDoctorRole(),
    userRole: userData?.role,
    userEmail: userData?.email,
    hasUser: !!user,
    hasUserData: !!userData
  });

  // Show custom splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Sau splash screen, redirect ngay không cần loading screen trung gian
  // Auth context sẽ xử lý việc kiểm tra trong background
  
  if (isLoggedIn && userData) {
    // Check if user is a doctor
    if (isDoctorRole()) {
      console.log('✅ [INDEX] Doctor logged in, redirecting to doctor dashboard');
      return <Redirect href="/doctor/dashboard" />;
    }
    
    console.log('✅ [INDEX] Patient logged in, redirecting to home tab');
    return <Redirect href="/(tabs)" />;
  }

  // Nếu không đăng nhập hoặc đang loading, redirect sang login
  console.log('❌ [INDEX] User not logged in or still loading, redirecting to login');
  return <Redirect href="/login" />;
}
