import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import doctorsData from '../doctors.json';
import { useAuth } from './context/AuthContext';
import { createDocument, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function EnableAllDoctorsChat() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      Alert.alert('Lỗi', 'Bạn không có quyền truy cập trang này');
      router.back();
    }
  }, [userData]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
    console.log(message);
  };

  const setupAllDoctors = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult('🚀 Bắt đầu thiết lập tài khoản cho tất cả bác sĩ...\n');

      const auth = getAuth();
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (const doctor of doctorsData) {
        const doctorId = doctor.id;
        const doctorName = doctor.ten;
        
        addResult(`\n📋 Xử lý: ${doctorName} (${doctorId})`);

        try {
          // 1. Kiểm tra xem bác sĩ đã có tài khoản Firebase Auth chưa
          const existingDoctors = await getDocumentsWithQuery('doctors', [
            where('id', '==', doctorId)
          ]);

          let authUid: string;
          let needCreateAuth = true;

          if (existingDoctors.length > 0 && (existingDoctors[0] as any).authUid) {
            authUid = (existingDoctors[0] as any).authUid;
            addResult(`  ✅ Đã có auth UID: ${authUid.substring(0, 10)}...`);
            needCreateAuth = false;
            skipCount++;
          } else {
            // 2. Tạo tài khoản Firebase Auth nếu chưa có
            const email = `${doctorId}@heatlecare.com`;
            const password = `HeatLe2024${doctorId}`; // Mật khẩu mặc định

            try {
              addResult(`  🔐 Tạo tài khoản Auth: ${email}`);
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              authUid = userCredential.user.uid;
              addResult(`  ✅ Auth UID: ${authUid.substring(0, 10)}...`);
            } catch (authError: any) {
              if (authError.code === 'auth/email-already-in-use') {
                addResult(`  ⚠️ Email đã tồn tại, bỏ qua...`);
                skipCount++;
                continue;
              }
              throw authError;
            }
          }

          // 3. Tạo/Cập nhật document trong collection doctors
          if (existingDoctors.length > 0) {
            addResult(`  📝 Cập nhật document doctors...`);
            await updateDocument('doctors', existingDoctors[0].id, {
              authUid: authUid,
              id: doctorId,
              name: doctorName,
              fullName: doctorName,
              specialty: doctor.chuyen_khoa,
              phone: doctor.so_dien_thoai,
              experience: doctor.kinh_nghiem,
              rating: doctor.rating,
              image: doctor.image,
              available: doctor.trang_thai,
              fee: doctor.phi_kham,
              updatedAt: new Date().toISOString(),
            });
          } else {
            addResult(`  📝 Tạo mới document doctors...`);
            await createDocument('doctors', {
              id: doctorId,
              authUid: authUid,
              name: doctorName,
              fullName: doctorName,
              specialty: doctor.chuyen_khoa,
              phone: doctor.so_dien_thoai,
              experience: doctor.kinh_nghiem,
              rating: doctor.rating,
              image: doctor.image,
              available: doctor.trang_thai,
              fee: doctor.phi_kham,
              createdAt: new Date().toISOString(),
            });
          }

          // 4. Tạo/Cập nhật document trong collection users với role = 'doctor'
          const existingUsers = await getDocumentsWithQuery('users', [
            where('uid', '==', authUid)
          ]);

          if (existingUsers.length > 0) {
            addResult(`  📝 Cập nhật document users...`);
            await updateDocument('users', existingUsers[0].id, {
              role: 'doctor',
              fullName: doctorName,
              email: `${doctorId}@heatlecare.com`,
              phone: doctor.so_dien_thoai,
              doctorInfo: {
                doctorId: doctorId,
                specialty: doctor.chuyen_khoa,
                experience: doctor.kinh_nghiem,
                rating: doctor.rating,
                fee: doctor.phi_kham,
              },
              updatedAt: new Date().toISOString(),
            });
          } else {
            addResult(`  📝 Tạo mới document users...`);
            await createDocument('users', {
              uid: authUid,
              role: 'doctor',
              fullName: doctorName,
              email: `${doctorId}@heatlecare.com`,
              phone: doctor.so_dien_thoai,
              avatar: '',
              doctorInfo: {
                doctorId: doctorId,
                specialty: doctor.chuyen_khoa,
                experience: doctor.kinh_nghiem,
                rating: doctor.rating,
                fee: doctor.phi_kham,
              },
              createdAt: new Date().toISOString(),
            });
          }

          // 5. Cập nhật tất cả conversations có doctorId này để thêm doctorAuthUid
          addResult(`  📝 Cập nhật conversations...`);
          const conversations = await getDocumentsWithQuery('conversations', [
            where('doctorId', '==', doctorId)
          ]);

          for (const conv of conversations) {
            await updateDocument('conversations', conv.id, {
              doctorAuthUid: authUid,
            });
          }
          addResult(`  ✅ Cập nhật ${conversations.length} conversations`);

          addResult(`  ✅ Hoàn thành: ${doctorName}`);
          successCount++;

        } catch (error: any) {
          addResult(`  ❌ Lỗi: ${error.message}`);
          errorCount++;
        }
      }

      addResult(`\n${'='.repeat(50)}`);
      addResult(`\n✅ TỔNG KẾT:`);
      addResult(`  • Thành công: ${successCount}`);
      addResult(`  • Đã có sẵn: ${skipCount}`);
      addResult(`  • Lỗi: ${errorCount}`);
      addResult(`  • Tổng: ${doctorsData.length}`);
      addResult(`\n🎉 Hoàn tất! Tất cả ${doctorsData.length} bác sĩ đã có thể nhận và trả lời tin nhắn.`);
      addResult(`\n📱 Thông tin đăng nhập:`);
      addResult(`  • Email: {doctorId}@heatlecare.com`);
      addResult(`  • Mật khẩu: HeatLe2024{doctorId}`);
      addResult(`  • Ví dụ: bs001@heatlecare.com / HeatLe2024bs001`);

      Alert.alert(
        'Hoàn thành',
        `✅ Thành công: ${successCount}\n⏭️ Đã có: ${skipCount}\n❌ Lỗi: ${errorCount}`,
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      addResult(`\n❌ LỖI NGHIÊM TRỌNG: ${error.message}`);
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kích hoạt Chat Bác sĩ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={48} color="#00BCD4" />
          </View>
          <Text style={styles.infoTitle}>Thiết lập Chat cho Tất cả Bác sĩ</Text>
          <Text style={styles.infoText}>
            Script này sẽ tạo tài khoản Firebase Authentication cho tất cả {doctorsData.length} bác sĩ và cấu hình để họ có thể:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
              <Text style={styles.featureText}>Đăng nhập vào ứng dụng</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
              <Text style={styles.featureText}>Nhận tin nhắn từ bệnh nhân</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
              <Text style={styles.featureText}>Trả lời tin nhắn bệnh nhân</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#06D6A0" />
              <Text style={styles.featureText}>Quản lý cuộc hội thoại</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={setupAllDoctors}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.buttonText}>Đang xử lý...</Text>
          ) : (
            <>
              <Ionicons name="rocket" size={20} color="#fff" />
              <Text style={styles.buttonText}>Bắt đầu thiết lập</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Kết quả:</Text>
            <View style={styles.resultsContent}>
              {results.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))}
            </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultsContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
});
