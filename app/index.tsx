import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { isLoggedIn, loading, isDoctorRole, userData, user } = useAuth();

  console.log('📍 [INDEX] Rendering with:', { 
    isLoggedIn, 
    loading, 
    isDoctor: isDoctorRole(),
    userRole: userData?.role,
    userEmail: userData?.email,
    hasUser: !!user,
    hasUserData: !!userData
  });

  if (loading) {
    console.log('⏳ [INDEX] Still loading...');
    return null;
  }

  if (isLoggedIn) {
    // Nếu đã đăng nhập nhưng chưa có userData, đợi thêm
    if (!userData) {
      console.log('⚠️ [INDEX] User logged in but userData not loaded yet, waiting...');
      return null; // Đợi userData load
    }
    
    // Check if user is a doctor
    if (isDoctorRole()) {
      console.log('✅ [INDEX] Doctor logged in, redirecting to doctor dashboard');
      return <Redirect href="/doctor/dashboard" />;
    }
    
    console.log('✅ [INDEX] Patient logged in, redirecting to home tab');
    return <Redirect href="/(tabs)" />;
  }

  console.log('❌ [INDEX] User not logged in, redirecting to login');
  return <Redirect href="/login" />;
}
