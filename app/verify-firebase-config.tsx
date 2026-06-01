import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db, isConfigValid } from './config/firebase';

export default function VerifyFirebaseConfigScreen() {
  const router = useRouter();

  const checkAuth = () => {
    if (!auth) {
      return { status: '❌', message: 'Auth chưa được khởi tạo' };
    }
    return { status: '✅', message: 'Auth đã sẵn sàng' };
  };

  const checkDb = () => {
    if (!db) {
      return { status: '❌', message: 'Firestore chưa được khởi tạo' };
    }
    return { status: '✅', message: 'Firestore đã sẵn sàng' };
  };

  const checkConfig = () => {
    if (!isConfigValid) {
      return { status: '❌', message: 'Config không hợp lệ' };
    }
    return { status: '✅', message: 'Config hợp lệ' };
  };

  const authStatus = checkAuth();
  const dbStatus = checkDb();
  const configStatus = checkConfig();

  const allGood = authStatus.status === '✅' && dbStatus.status === '✅' && configStatus.status === '✅';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Firebase Config</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Status */}
        <View style={[styles.statusCard, allGood ? styles.successCard : styles.errorCard]}>
          <Text style={styles.statusIcon}>{allGood ? '✅' : '❌'}</Text>
          <Text style={styles.statusTitle}>
            {allGood ? 'Firebase đã sẵn sàng!' : 'Firebase có vấn đề'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {allGood
              ? 'Tất cả các tính năng đều hoạt động'
              : 'Vui lòng kiểm tra cấu hình'}
          </Text>
        </View>

        {/* Detailed Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết kiểm tra</Text>

          {/* Config Check */}
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>{configStatus.status}</Text>
            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>Firebase Config</Text>
              <Text style={styles.checkMessage}>{configStatus.message}</Text>
            </View>
          </View>

          {/* Auth Check */}
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>{authStatus.status}</Text>
            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>Firebase Authentication</Text>
              <Text style={styles.checkMessage}>{authStatus.message}</Text>
            </View>
          </View>

          {/* Firestore Check */}
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>{dbStatus.status}</Text>
            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>Cloud Firestore</Text>
              <Text style={styles.checkMessage}>{dbStatus.message}</Text>
            </View>
          </View>
        </View>

        {/* Environment Variables */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biến môi trường</Text>
          <View style={styles.envBox}>
            <Text style={styles.envItem}>
              FIREBASE_API_KEY: {process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✅ Có' : '❌ Thiếu'}
            </Text>
            <Text style={styles.envItem}>
              FIREBASE_AUTH_DOMAIN: {process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Có' : '❌ Thiếu'}
            </Text>
            <Text style={styles.envItem}>
              FIREBASE_PROJECT_ID: {process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Có' : '❌ Thiếu'}
            </Text>
            <Text style={styles.envItem}>
              FIREBASE_STORAGE_BUCKET: {process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Có' : '❌ Thiếu'}
            </Text>
            <Text style={styles.envItem}>
              FIREBASE_MESSAGING_SENDER_ID: {process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Có' : '❌ Thiếu'}
            </Text>
            <Text style={styles.envItem}>
              FIREBASE_APP_ID: {process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '✅ Có' : '❌ Thiếu'}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        {!allGood && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cách khắc phục</Text>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                1. Kiểm tra file <Text style={styles.code}>.env.local</Text> có đầy đủ biến môi trường
              </Text>
              <Text style={styles.instructionText}>
                2. Đảm bảo tất cả biến bắt đầu với <Text style={styles.code}>EXPO_PUBLIC_</Text>
              </Text>
              <Text style={styles.instructionText}>
                3. Restart development server: <Text style={styles.code}>npx expo start --clear</Text>
              </Text>
              <Text style={styles.instructionText}>
                4. Kiểm tra Firebase Console có project <Text style={styles.code}>hearthcare-847b3</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Next Steps */}
        {allGood && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bước tiếp theo</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/test-firebase-auth' as any)}
            >
              <Ionicons name="flask" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Test Firebase Auth</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/register' as any)}
            >
              <Ionicons name="person-add" size={20} color="#00BCD4" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Đăng ký tài khoản
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/login' as any)}
            >
              <Ionicons name="log-in" size={20} color="#00BCD4" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  successCard: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  checkContent: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  checkMessage: {
    fontSize: 13,
    color: '#64748b',
  },
  envBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  envItem: {
    fontSize: 13,
    color: '#e2e8f0',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  instructionBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instructionText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    color: '#0f172a',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#00BCD4',
  },
});
