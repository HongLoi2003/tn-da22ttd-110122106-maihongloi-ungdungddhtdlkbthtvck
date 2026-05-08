import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './login';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
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
        <Stack.Screen name="ai-consultation" options={{ headerShown: false }} />
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
        <Stack.Screen name="insurance" options={{ headerShown: false }} />
        <Stack.Screen name="medical-records" options={{ headerShown: false }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
        <Stack.Screen name="reviews" options={{ headerShown: false }} />
        <Stack.Screen name="support-center" options={{ headerShown: false }} />
        <Stack.Screen name="terms-policy" options={{ headerShown: false }} />
        <Stack.Screen name="write-review" options={{ headerShown: false }} />
        <Stack.Screen name="seed-data" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
