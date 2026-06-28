import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    // Auto hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <ImageBackground
      source={require('../assets/images/backgourd.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* App Name */}
          <Text style={styles.title}>Health Care</Text>
          
          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Overlay tối nhẹ để text dễ đọc hơn
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 75, // Tròn hoàn toàn (width/2)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden', // Đảm bảo logo không vượt ra ngoài viền tròn
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60, // Logo cũng tròn
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
    marginBottom: 24,
  },
  loadingContainer: {
    marginTop: 16,
  },
});
