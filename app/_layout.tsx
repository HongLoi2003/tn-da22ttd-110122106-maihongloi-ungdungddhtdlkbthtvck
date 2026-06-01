import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import MobileFrame from './components/MobileFrame';
import { AuthProvider, useAuth } from './context/AuthContext';
import { configureGoogleSignIn } from './services/googleAuthService';
import notificationService from './services/notificationService';

SplashScreen.preventAutoHideAsync();

// Configure Google Sign-In khi app khởi động
configureGoogleSignIn();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, loading, isDoctorRole } = useAuth();

  // DEBUG: Tạm thời bypass để test web
  const isWeb = typeof window !== 'undefined';
  if (isWeb) {
    console.log('🌐 [WEB] Running on web platform');
    console.log('🌐 [WEB] Loading:', loading);
    console.log('🌐 [WEB] isLoggedIn:', isLoggedIn);
  }

  // Theo dõi thay đổi của isLoggedIn
  useEffect(() => {
    console.log('🔄 [LAYOUT] isLoggedIn changed:', isLoggedIn);
    console.log('🔄 [LAYOUT] isDoctorRole:', isDoctorRole());
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('🔄 [LAYOUT] Auth state:', { isLoggedIn, loading });
    
    if (!loading) {
      console.log('✅ [LAYOUT] Auth loaded, hiding splash...');
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // Setup notification listeners - chỉ sau khi đã mount và đăng nhập
  useEffect(() => {
    // Đợi một chút để đảm bảo layout đã mount
    const timer = setTimeout(() => {
      if (!isLoggedIn || loading) return;

      console.log('📱 [NOTIFICATION] Setting up notification listeners...');

      // Register for push notifications
      notificationService.registerForPushNotifications().then(token => {
        if (token) {
          console.log('📱 [NOTIFICATION] Push token registered:', token);
        }
      }).catch(err => {
        console.log('📱 [NOTIFICATION] Failed to register:', err);
      });

      // Listen for notifications when app is in foreground
      notificationService.addNotificationReceivedListener((notification) => {
        console.log('📱 [NOTIFICATION] Received in foreground:', notification);
        // Notification will be displayed automatically by the system
      });

      // Listen for notification taps
      notificationService.addNotificationResponseReceivedListener((response) => {
        console.log('📱 [NOTIFICATION] User tapped notification:', response);
        
        // Handle navigation based on notification type
        const data = response.notification.request.content.data;
        if (data?.type === 'message' && data?.conversationId) {
          // Navigate to chat screen
          console.log('📱 [NOTIFICATION] Should navigate to chat:', data.conversationId);
          // Navigation will be handled by the notification itself
        }
      });
    }, 1000); // Đợi 1 giây sau khi mount

    // Cleanup listeners on unmount
    return () => {
      clearTimeout(timer);
      if (isLoggedIn && !loading) {
        console.log('📱 [NOTIFICATION] Cleaning up notification listeners...');
        notificationService.removeNotificationListeners();
      }
    };
  }, [isLoggedIn, loading]);

  // Hiển thị splash screen trong khi loading
  if (loading) {
    console.log('⏳ [LAYOUT] Showing splash screen...');
    return (
      <MobileFrame>
        <View style={styles.splashContainer}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>HealthCare</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      </MobileFrame>
    );
  }

  console.log('✅ [LAYOUT] Rendering navigation with isLoggedIn:', isLoggedIn);

  return (
    <MobileFrame>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="create-test-account" options={{ headerShown: false }} />
          <Stack.Screen name="create-doctor-account" options={{ headerShown: false }} />
          <Stack.Screen name="seed-doctor-accounts" options={{ headerShown: false }} />
          <Stack.Screen name="update-user-to-doctor" options={{ headerShown: false }} />
          <Stack.Screen name="check-user-role" options={{ headerShown: false }} />
          <Stack.Screen name="debug-firebase-login" options={{ headerShown: false }} />
          <Stack.Screen name="create-quick-test-account" options={{ headerShown: false }} />
          <Stack.Screen name="test-firebase-connection" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="doctor-chat" options={{ headerShown: false }} />
          <Stack.Screen name="doctor-detail" options={{ headerShown: false }} />
          <Stack.Screen name="all-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="articles" options={{ headerShown: false }} />
          <Stack.Screen name="article-detail" options={{ headerShown: false }} />
          <Stack.Screen name="article-comments" options={{ headerShown: false }} />
          <Stack.Screen name="find-hospital" options={{ headerShown: false }} />
          <Stack.Screen name="hospital-detail" options={{ headerShown: false }} />
          <Stack.Screen name="hospital-map" options={{ headerShown: false }} />
          <Stack.Screen name="specialties" options={{ headerShown: false }} />
          <Stack.Screen name="specialty-detail" options={{ headerShown: false }} />
          <Stack.Screen name="symptom-checker" options={{ headerShown: false }} />
          <Stack.Screen name="pharmacy" options={{ headerShown: false }} />
          <Stack.Screen name="add-insurance" options={{ headerShown: false }} />
          <Stack.Screen name="add-payment-method" options={{ headerShown: false }} />
          <Stack.Screen name="chat-screen" options={{ headerShown: false }} />
          <Stack.Screen name="all-claims" options={{ headerShown: false }} />
          <Stack.Screen name="all-medical-records" options={{ headerShown: false }} />
          <Stack.Screen name="all-prescriptions" options={{ headerShown: false }} />
          <Stack.Screen name="all-products" options={{ headerShown: false }} />
          <Stack.Screen name="all-test-results" options={{ headerShown: false }} />
          <Stack.Screen name="all-transactions" options={{ headerShown: false }} />
          <Stack.Screen name="change-password" options={{ headerShown: false }} />
          <Stack.Screen name="claim-detail" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="health-insurance" options={{ headerShown: false }} />
          <Stack.Screen name="debug-conversations" options={{ headerShown: false }} />
          <Stack.Screen name="update-doctor-auth-uid" options={{ headerShown: false }} />
          <Stack.Screen name="fix-existing-conversations" options={{ headerShown: false }} />
          <Stack.Screen name="auto-map-all-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="fix-wrong-doctor-role" options={{ headerShown: false }} />
          <Stack.Screen name="check-nguyen-van-an" options={{ headerShown: false }} />
          <Stack.Screen name="sync-all-doctor-ids" options={{ headerShown: false }} />
          <Stack.Screen name="insurance" options={{ headerShown: false }} />
          <Stack.Screen name="medical-records" options={{ headerShown: false }} />
          <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
          <Stack.Screen name="reviews" options={{ headerShown: false }} />
          <Stack.Screen name="support-center" options={{ headerShown: false }} />
          <Stack.Screen name="terms-policy" options={{ headerShown: false }} />
          <Stack.Screen name="write-review" options={{ headerShown: false }} />
          <Stack.Screen name="seed-data" options={{ headerShown: false }} />
          <Stack.Screen name="seed-specialties" options={{ headerShown: false }} />
          <Stack.Screen name="seed-doctor-accounts-bulk" options={{ headerShown: false }} />
          <Stack.Screen name="update-doctor-id" options={{ headerShown: false }} />
          <Stack.Screen name="doctor" options={{ headerShown: false }} />
          <Stack.Screen name="fix-three-doctors-auth-uid" options={{ headerShown: false }} />
          <Stack.Screen name="find-and-fix-missing-conversations" options={{ headerShown: false }} />
          <Stack.Screen name="debug-specific-doctor-chat" options={{ headerShown: false }} />
          <Stack.Screen name="list-all-doctor-accounts" options={{ headerShown: false }} />
          <Stack.Screen name="create-test-conversation-tranthilan" options={{ headerShown: false }} />
          <Stack.Screen name="check-all-doctors-chat-status" options={{ headerShown: false }} />
          <Stack.Screen name="fix-doctor-auth-uid" options={{ headerShown: false }} />
          <Stack.Screen name="fix-conversations-auth-uid" options={{ headerShown: false }} />
          <Stack.Screen name="debug-chat-issue" options={{ headerShown: false }} />
          <Stack.Screen name="debug-specific-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="find-missing-conversations" options={{ headerShown: false }} />
          <Stack.Screen name="check-messages-for-3-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="rebuild-conversations-for-3-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="compare-working-vs-broken-doctors" options={{ headerShown: false }} />
          <Stack.Screen name="analyze-all-doctors-conversations" options={{ headerShown: false }} />
          <Stack.Screen name="check-all-conversations-in-firestore" options={{ headerShown: false }} />
          <Stack.Screen name="debug-web" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </MobileFrame>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  appIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  loadingContainer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
});
