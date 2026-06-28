import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function FixDoctorAuthUid() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, fixed: 0, notFound: 0 });

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const fixAuthUid = async () => {
    try {
      setLoading(true);
      setLogs([]);
      setStats({ total: 0, fixed: 0, notFound: 0 });
      
      addLog('🔧 Bắt đầu sửa doctor authUid...');
      addLog('');
      
      // 1. Lấy tất cả doctors
      const doctors = await getDocumentsWithQuery('doctors', []);
      addLog(`📋 Tìm thấy ${doctors.length} bác sĩ`);
      addLog('');
      
      let fixed = 0;
      let notFound = 0;
      
      for (const doctor of doctors) {
        const doctorId = doctor.id; // bs004, bs005, etc.
        const doctorName = (doctor as any).ten || 'Unknown';
        
        addLog(`🔍 Đang xử lý: ${doctorName} (${doctorId})`);
        
        // 2. Tìm user account tương ứng
        const users = await getDocumentsWithQuery('users', [
          where('role', '==', 'doctor'),
          where('doctorInfo.doctorId', '==', doctorId)
        ]);
        
        if (users.length > 0) {
          const authUid = (users[0] as any).uid;
          addLog(`  ✅ Tìm thấy authUid: ${authUid}`);
          
          // 3. Cập nhật authUid vào doctor document
          await updateDocument('doctors', doctorId, {
            authUid: authUid
          });
          
          addLog(`  💾 Đã cập nhật authUid vào doctor document`);
          fixed++;
        } else {
          addLog(`  ⚠️ Không tìm thấy user account`);
          notFound++;
        }
        
        addLog('');
      }
      
      setStats({ total: doctors.length, fixed, notFound });
      addLog('');
      addLog('✅ Hoàn thành!');
      addLog(`📊 Tổng kết:`);
      addLog(`   - Tổng số bác sĩ: ${doctors.length}`);
      addLog(`   - Đã sửa: ${fixed}`);
      addLog(`   - Không tìm thấy: ${notFound}`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      addLog('');
      addLog(`❌ Lỗi: ${error}`);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix Doctor AuthUid</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Script này sẽ thêm field "authUid" (Firebase Auth UID) vào tất cả doctor documents.
              Điều này cần thiết để bác sĩ có thể nhận được thông báo tin nhắn từ bệnh nhân.
            </Text>
          </View>
        </View>

        {stats.total > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Tổng số bác sĩ:</Text>
              <Text style={styles.statsValue}>{stats.total}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Đã sửa:</Text>
              <Text style={[styles.statsValue, styles.statsSuccess]}>{stats.fixed}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Không tìm thấy:</Text>
              <Text style={[styles.statsValue, styles.statsWarning]}>{stats.notFound}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={fixAuthUid}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang xử lý...</Text>
            </>
          ) : (
            <>
              <Ionicons name="build" size={20} color="#fff" />
              <Text style={styles.buttonText}>Chạy Script</Text>
            </>
          )}
        </TouchableOpacity>

        {logs.length > 0 && (
          <View style={styles.logsCard}>
            <Text style={styles.logsTitle}>Logs</Text>
            <View style={styles.logsContent}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00838F',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#00838F',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statsSuccess: {
    color: '#4CAF50',
  },
  statsWarning: {
    color: '#FF9800',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  logsContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});
