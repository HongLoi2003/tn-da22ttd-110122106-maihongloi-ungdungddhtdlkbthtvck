import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from './config/firebase';

export default function CreateQuickTestAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const createTestAccount = async (type: 'patient' | 'doctor') => {
    setLoading(true);
    setLogs([]);

    const email = type === 'patient' ? 'patient@test.com' : 'doctor@test.com';
    const password = '123456';
    const fullName = type === 'patient' ? 'Bệnh nhân Test' : 'Bác sĩ Test';

    try {
      addLog(`=== TẠO TÀI KHOẢN ${type.toUpperCase()} ===`);
      addLog(`📧 Email: ${email}`);
      addLog(`🔑 Password: ${password}`);

      if (!auth || !db) {
        addLog('❌ Firebase chưa được khởi tạo!');
        Alert.alert('Lỗi', 'Firebase chưa được khởi tạo');
        return;
      }

      // 1. Create auth account
      addLog('\n🔐 Đang tạo tài khoản Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      addLog(`✅ Tạo Auth thành công! UID: ${userCredential.user.uid}`);

      // 2. Create Firestore document
      addLog('\n📝 Đang tạo document trong Firestore...');
      
      const userData: any = {
        uid: userCredential.user.uid,
        email: email,
        fullName: fullName,
        phone: '0123456789',
        role: type,
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: 'Hà Nội, Việt Nam',
        avatar: '',
        createdAt: new Date().toISOString(),
      };

      if (type === 'patient') {
        userData.bloodType = 'O';
        userData.height = 170;
        userData.weight = 65;
        userData.allergies = [];
        userData.chronicDiseases = [];
        userData.emergencyContact = {
          name: 'Người thân',
          relationship: 'Vợ/Chồng',
          phone: '0987654321'
        };
        userData.insuranceNumber = 'BH123456789';
      } else {
        userData.doctorInfo = {
          specialty: 'Nội khoa',
          licenseNumber: 'BS123456',
          experience: 5,
          education: 'Đại học Y Hà Nội',
          hospital: 'Bệnh viện Bạch Mai',
          rating: 4.5,
          consultationFee: 200000,
          workingHours: [
            { day: 'monday', startTime: '08:00', endTime: '17:00' },
            { day: 'tuesday', startTime: '08:00', endTime: '17:00' },
            { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
            { day: 'thursday', startTime: '08:00', endTime: '17:00' },
            { day: 'friday', startTime: '08:00', endTime: '17:00' },
          ]
        };
      }

      const docRef = await addDoc(collection(db, 'users'), userData);
      addLog(`✅ Tạo Firestore document thành công! ID: ${docRef.id}`);

      addLog('\n✅ TẠO TÀI KHOẢN THÀNH CÔNG!');
      addLog(`📧 Email: ${email}`);
      addLog(`🔑 Password: ${password}`);
      addLog(`👤 Role: ${type}`);

      Alert.alert(
        'Thành công!',
        `Tài khoản ${type} đã được tạo:\n\nEmail: ${email}\nPassword: ${password}\n\nBạn có thể đăng nhập ngay bây giờ.`,
        [
          { text: 'Đăng nhập ngay', onPress: () => router.push('/login') },
          { text: 'OK' }
        ]
      );

    } catch (error: any) {
      addLog(`\n❌ LỖI: ${error.code}`);
      addLog(`   Message: ${error.message}`);

      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email này đã được sử dụng. Tài khoản có thể đã tồn tại.';
      }

      Alert.alert('Lỗi', errorMessage);
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo tài khoản test</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Tạo tài khoản test nhanh</Text>
          <Text style={styles.description}>
            Tạo tài khoản test để kiểm tra chức năng đăng nhập:
            {'\n'}• Tài khoản bệnh nhân: patient@test.com
            {'\n'}• Tài khoản bác sĩ: doctor@test.com
            {'\n'}• Mật khẩu: 123456
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => createTestAccount('patient')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Tạo tài khoản Bệnh nhân</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDoctor, loading && styles.buttonDisabled]}
            onPress={() => createTestAccount('doctor')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="medical" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Tạo tài khoản Bác sĩ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Logs */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Logs</Text>
            <View style={styles.logsContainer}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Warning */}
        <View style={styles.section}>
          <Text style={styles.warningTitle}>⚠️ Lưu ý</Text>
          <Text style={styles.description}>
            • Nếu tài khoản đã tồn tại, bạn sẽ nhận được thông báo lỗi
            {'\n'}• Sau khi tạo thành công, bạn có thể đăng nhập ngay
            {'\n'}• Đây là tài khoản test, chỉ dùng để kiểm tra
          </Text>
        </View>
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
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonDoctor: {
    backgroundColor: '#10b981',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logsContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
  },
  logText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 8,
  },
});
