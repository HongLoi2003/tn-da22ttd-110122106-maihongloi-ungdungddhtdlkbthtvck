import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

export default function DoctorLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hiển thị splash screen trong 1.5 giây
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ImageBackground 
        source={require('../../assets/images/bckgour.png')} 
        style={styles.splashContainer}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>HealthCare</Text>
          <Text style={styles.doctorText}>Dành cho Bác sĩ</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="appointment-detail" />
      <Stack.Screen name="patients" />
      <Stack.Screen name="patient-detail" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="chat-detail" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  doctorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
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
