import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function AutoMapAllDoctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleAutoMap = async () => {
    try {
      setLoading(true);
      setResults([]);
      const logs: string[] = [];

      logs.push('=== BẮT ĐẦU TỰ ĐỘNG MAP DOCTORS ===\n');

      // 1. Lấy tất cả doctors từ doctors collection
      const doctors = await getDocumentsWithQuery('doctors', []);
      logs.push(`✅ Tìm thấy ${doctors.length} bác sĩ trong doctors collection\n`);

      // 2. Lấy tất cả users có role = doctor
      const doctorUsers = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);
      logs.push(`✅ Tìm thấy ${doctorUsers.length} user có role doctor\n`);

      // 3. Tạo map: authUid -> doctorId (từ script update-doctor-auth-uid)
      const authUidToDoctorId = new Map();
      doctors.forEach((doc: any) => {
        if (doc.id && doc.authUid) {
          authUidToDoctorId.set(doc.authUid, doc.id);
        }
      });

      logs.push(`✅ Tìm thấy ${authUidToDoctorId.size} bác sĩ có authUid\n`);
      logs.push('=== BẮT ĐẦU CẬP NHẬT USER PROFILES ===\n');

      let updated = 0;
      let skipped = 0;
      let alreadyHas = 0;

      for (const user of doctorUsers) {
        const userData = user as any;
        const userUid = userData.uid;
        const userEmail = userData.email;
        const userFullName = userData.fullName;

        // Kiểm tra xem user đã có doctorInfo.doctorId chưa
        if (userData.doctorInfo && userData.doctorInfo.doctorId) {
          logs.push(`⏭️  [${userFullName}] Đã có doctorId: ${userData.doctorInfo.doctorId}`);
          alreadyHas++;
          continue;
        }

        // Tìm doctorId tương ứng với user này
        const doctorId = authUidToDoctorId.get(userUid);

        if (!doctorId) {
          logs.push(`⚠️  [${userFullName}] (${userEmail}) - Không tìm thấy doctorId tương ứng`);
          skipped++;
          continue;
        }

        // Cập nhật user profile với doctorInfo
        await updateDocument('users', user.id, {
          doctorInfo: {
            doctorId: doctorId,
            updatedAt: new Date().toISOString()
          }
        });

        logs.push(`✅ [${userFullName}] -> doctorId: ${doctorId}`);
        updated++;
      }

      logs.push('');
      logs.push('=== KẾT QUẢ ===');
      logs.push(`✅ Đã cập nhật: ${updated} users`);
      logs.push(`⏭️  Đã có sẵn: ${alreadyHas} users`);
      logs.push(`⚠️  Bỏ qua: ${skipped} users`);
      logs.push(`📊 Tổng: ${doctorUsers.length} users`);

      setResults(logs);
      setLoading(false);

      Alert.alert(
        'Hoàn thành',
        `Đã map ${updated} bác sĩ với doctors collection`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error:', error);
      setResults(prev => [...prev, `\n❌ LỖI: ${error.message}`]);
      setLoading(false);
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auto Map All Doctors</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Tự động Map Tất Cả Bác Sĩ</Text>
          <Text style={styles.description}>
            Script này sẽ tự động thêm field "doctorInfo.doctorId" vào tất cả user có role = doctor.
            {'\n\n'}
            Điều này cần thiết để bác sĩ có thể xem được lịch hẹn của mình.
            {'\n\n'}
            <Text style={styles.bold}>Lưu ý:</Text> Cần chạy script "/update-doctor-auth-uid" trước để có authUid trong doctors collection.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAutoMap}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="git-merge" size={20} color="#fff" />
                <Text style={styles.buttonText}>Bắt đầu map</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Kết quả:</Text>
            {results.map((line, index) => (
              <Text key={index} style={styles.resultLine}>
                {line}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultLine: {
    fontSize: 13,
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});
