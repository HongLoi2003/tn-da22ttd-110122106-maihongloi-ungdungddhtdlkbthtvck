import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

interface MobileFrameProps {
  children: ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  // Tắt frame để tránh bị 2 lớp điện thoại chồng lên nhau
  return <>{children}</>;
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
    width: 405,
    height: 900,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 15,
    borderWidth: 8,
    borderColor: '#1a1a1a',
  },
  statusBar: {
    height: 28,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
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
    width: 100,
    height: 20,
    backgroundColor: '#000',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -50,
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
    height: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  homeIndicator: {
    width: 100,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
    opacity: 0.3,
  },
});
