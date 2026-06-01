import { ReactNode } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrameAndroid({ children }: MobileFrameProps) {
  // Chỉ áp dụng frame trên web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const windowWidth = Dimensions.get('window').width;

  // Nếu màn hình nhỏ hơn mobile, không dùng frame
  if (windowWidth < 500) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mobileFrame}>
        {/* Android Status bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusBarLeft}>
            <View style={styles.time}>9:41</View>
          </View>
          <View style={styles.statusBarRight}>
            <View style={styles.statusIcon}>📶</View>
            <View style={styles.statusIcon}>📡</View>
            <View style={styles.statusIcon}>🔋</View>
          </View>
        </View>

        {/* App content */}
        <View style={styles.appContent}>
          {children}
        </View>

        {/* Android Navigation bar */}
        <View style={styles.navBar}>
          <View style={styles.navButton}>◀</View>
          <View style={styles.navButton}>⚪</View>
          <View style={styles.navButton}>▢</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d5db', // Gray background
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  mobileFrame: {
    width: 360, // Pixel 5 width
    height: 800, // Pixel 5 height
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    // @ts-ignore - web only
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  statusBar: {
    height: 24,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  statusBarLeft: {
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    // @ts-ignore - web only
    fontFamily: 'Roboto, sans-serif',
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    fontSize: 10,
  },
  appContent: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  navBar: {
    height: 48,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  navButton: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.8,
  },
});
