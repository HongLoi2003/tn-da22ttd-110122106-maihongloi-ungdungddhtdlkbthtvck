import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { getDocumentById, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function FixConversationsAuthUid() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, fixed: 0, noDoctorId: 0, noAuthUid: 0, error: 0 });

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const fixConversations = async () => {
    try {
      setLoading(true);
      setLogs([]);
      setStats({ total: 0, fixed: 0, noDoctorId: 0, noAuthUid: 0, error: 0 });
      
      addLog('🔧 Bắt đầu sửa conversations authUid...');
      addLog('');
      
      // 1. Lấy tất cả conversations
      const conversations = await getDocumentsWithQuery('conversations', []);
      addLog(`📋 Tìm thấy ${conversations.length} conversations`);
      addLog('');
      
      let fixed = 0;
      let noDoctorId = 0;
      let noAuthUid = 0;
      let error = 0;
      
      for (const conv of conversations) {
        const conversationId = conv.id;
        const doctorId = (conv as any).doctorId; // bs004, bs005, etc.
        const patientName = (conv as any).patientName || 'Unknown';
        
        addLog(`🔍 Conversation: ${patientName} → Doctor ${doctorId}`);
        
        if (!doctorId) {
          addLog(`  ⚠️ Không có doctorId`);
          noDoctorId++;
          addLog('');
          continue;
        }
        
        // 2. Lấy authUid từ doctor document
        try {
          const doctorData = await getDocumentById('doctors', doctorId);
          if (doctorData && (doctorData as any).authUid) {
            const authUid = (doctorData as any).authUid;
            addLog(`  ✅ Tìm thấy authUid: ${authUid}`);
            
            // 3. Cập nhật doctorAuthUid
            await updateDocument('conversations', conversationId, {
              doctorAuthUid: authUid
            });
            
            addLog(`  💾 Đã cập nhật doctorAuthUid`);
            fixed++;
          } else {
            addLog(`  ⚠️ Doctor ${doctorId} không có authUid`);
            noAuthUid++;
          }
        } catch (err) {
          addLog(`  ❌ Lỗi khi lấy doctor ${doctorId}: ${err}`);
          error++;
        }
        
        addLog('');
      }
      
      setStats({ total: conversations.length, fixed, noDoctorId, noAuthUid, error });
      addLog('');
      addLog('✅ Hoàn thành!');
      addLog(`📊 Tổng kết:`);
      addLog(`   - Tổng số conversations: ${conversations.length}`);
      addLog(`   - Đã sửa: ${fixed}`);
      addLog(`   - Không có doctorId: ${noDoctorId}`);
      addLog(`   - Doctor không có authUid: ${noAuthUid}`);
      addLog(`   - Lỗi: ${error}`);
      
      if (noAuthUid > 0) {
        addLog('');
        addLog('⚠️ Cảnh báo: Một số doctor không có authUid.');
        addLog('   Hãy chạy script "Fix Doctor AuthUid" trước!');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
      addLog('');
      addLog(`❌ Lỗi: ${err}`);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix Conversations AuthUid</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Script này sẽ thêm field "doctorAuthUid" vào tất cả conversations.
              Điều này giúp bác sĩ có thể query và nhận được thông báo tin nhắn từ bệnh nhân.
            </Text>
            <Text style={[styles.infoText, { marginTop: 8, fontWeight: '600' }]}>
              ⚠️ Lưu ý: Chạy script "Fix Doctor AuthUid" trước!
            </Text>
          </View>
        </View>

        {stats.total > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Tổng số conversations:</Text>
              <Text style={styles.statsValue}>{stats.total}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Đã sửa:</Text>
              <Text style={[styles.statsValue, styles.statsSuccess]}>{stats.fixed}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Không có doctorId:</Text>
              <Text style={[styles.statsValue, styles.statsWarning]}>{stats.noDoctorId}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Doctor không có authUid:</Text>
              <Text style={[styles.statsValue, styles.statsWarning]}>{stats.noAuthUid}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Lỗi:</Text>
              <Text style={[styles.statsValue, styles.statsError]}>{stats.error}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={fixConversations}
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
    flex: 1,
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
  statsError: {
    color: '#F44336',
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
