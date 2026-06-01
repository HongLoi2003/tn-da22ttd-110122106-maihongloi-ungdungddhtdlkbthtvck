import { ReactNode } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  // Tạm thời disable frame để debug
  return <>{children}</>;
  
  // Chỉ áp dụng frame trên web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // Nếu màn hình nhỏ hơn mobile, không dùng frame
  if (windowWidth < 500) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.mobileFrame, { maxHeight: windowHeight - 40 }]}>
        {/* Status bar giả */}
        <View style={styles.statusBar}>
          <View style={styles.statusBarLeft}>
            <Text style={styles.time}>9:41</Text>
          </View>
          <View style={styles.notch} />
          <View style={styles.statusBarRight}>
            <Text style={styles.statusIcon}>📶</Text>
            <Text style={styles.statusIcon}>📡</Text>
            <Text style={styles.statusIcon}>🔋</Text>
          </View>
        </View>

        {/* App content */}
        <View style={styles.appContent}>
          {children}
        </View>

        {/* Home indicator (iPhone style) */}
        <View style={styles.homeIndicatorContainer}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mobileFrame: {
    width: 390,
    height: 844,
    backgroundColor: '#fff',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 15,
    borderWidth: 8,
    borderColor: '#0f172a',
  },
  statusBar: {
    height: 44,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 1000,
  },
  statusBarLeft: {
    flex: 1,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  notch: {
    width: 150,
    height: 30,
    backgroundColor: '#000',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    top: 0,
    left: 120,
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  appContent: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  homeIndicatorContainer: {
    height: 34,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    opacity: 0.3,
  },
});
