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
import { useAuth } from './context/AuthContext';
import { getDocumentById, getDocumentsWithQuery } from './services/firebaseService';

export default function DebugChatIssue() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    const log = `${prefix} ${message}`;
    console.log(log);
    setLogs(prev => [...prev, log]);
  };

  const debugChat = async () => {
    try {
      setLoading(true);
      setLogs([]);
      
      addLog('=== BẮT ĐẦU DEBUG CHAT ===', 'info');
      addLog('');
      
      // 1. Kiểm tra user hiện tại
      if (!userData) {
        addLog('Không có userData - Vui lòng đăng nhập', 'error');
        setLoading(false);
        return;
      }
      
      addLog(`User: ${userData.fullName}`, 'info');
      addLog(`UID: ${userData.uid}`, 'info');
      addLog(`Role: ${userData.role}`, 'info');
      addLog('');
      
      if (userData.role === 'doctor') {
        // DEBUG BÁC SĨ
        addLog('=== DEBUG BÁC SĨ ===', 'info');
        addLog('');
        
        const doctorIdFromInfo = (userData.doctorInfo as any)?.doctorId;
        const doctorUid = userData.uid;
        
        addLog(`Doctor ID từ doctorInfo: ${doctorIdFromInfo || 'KHÔNG CÓ'}`, doctorIdFromInfo ? 'success' : 'error');
        addLog(`Doctor UID từ auth: ${doctorUid}`, 'info');
        addLog('');
        
        // Kiểm tra doctor document có authUid không
        if (doctorIdFromInfo) {
          addLog(`Kiểm tra doctor document: ${doctorIdFromInfo}`, 'info');
          try {
            const doctorDoc = await getDocumentById('doctors', doctorIdFromInfo);
            if (doctorDoc) {
              const authUid = (doctorDoc as any).authUid;
              addLog(`  - authUid trong doctor doc: ${authUid || 'KHÔNG CÓ'}`, authUid ? 'success' : 'error');
              if (authUid && authUid !== doctorUid) {
                addLog(`  - ⚠️ authUid KHÔNG KHỚP với UID hiện tại!`, 'warning');
                addLog(`    Expected: ${doctorUid}`, 'warning');
                addLog(`    Got: ${authUid}`, 'warning');
              } else if (authUid === doctorUid) {
                addLog(`  - ✅ authUid KHỚP với UID hiện tại`, 'success');
              }
            } else {
              addLog(`  - Doctor document KHÔNG TỒN TẠI`, 'error');
            }
          } catch (error) {
            addLog(`  - Lỗi khi lấy doctor doc: ${error}`, 'error');
          }
          addLog('');
        }
        
        // Query conversations theo 3 cách
        addLog('Query conversations theo 3 cách:', 'info');
        
        // Query 1: doctorId
        if (doctorIdFromInfo) {
          const convs1 = await getDocumentsWithQuery('conversations', [
            where('doctorId', '==', doctorIdFromInfo)
          ]);
          addLog(`  1. doctorId = ${doctorIdFromInfo}: ${convs1.length} conversations`, convs1.length > 0 ? 'success' : 'warning');
          if (convs1.length > 0) {
            convs1.forEach((conv: any, i: number) => {
              addLog(`     - Conv ${i + 1}: ${conv.patientName} (${conv.lastMessage?.substring(0, 30) || 'Chưa có tin nhắn'}...)`, 'info');
            });
          }
        }
        
        // Query 2: doctorId = auth UID
        const convs2 = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', doctorUid)
        ]);
        addLog(`  2. doctorId = ${doctorUid}: ${convs2.length} conversations`, convs2.length > 0 ? 'success' : 'warning');
        
        // Query 3: doctorAuthUid
        const convs3 = await getDocumentsWithQuery('conversations', [
          where('doctorAuthUid', '==', doctorUid)
        ]);
        addLog(`  3. doctorAuthUid = ${doctorUid}: ${convs3.length} conversations`, convs3.length > 0 ? 'success' : 'warning');
        if (convs3.length > 0) {
          convs3.forEach((conv: any, i: number) => {
            addLog(`     - Conv ${i + 1}: ${conv.patientName} (${conv.lastMessage?.substring(0, 30) || 'Chưa có tin nhắn'}...)`, 'info');
          });
        }
        
        addLog('');
        
        // Tổng kết
        const totalUnique = new Set([
          ...(doctorIdFromInfo ? await getDocumentsWithQuery('conversations', [where('doctorId', '==', doctorIdFromInfo)]) : []),
          ...convs2,
          ...convs3
        ].map((c: any) => c.id)).size;
        
        addLog(`TỔNG SỐ CONVERSATIONS DUY NHẤT: ${totalUnique}`, totalUnique > 0 ? 'success' : 'error');
        
        if (totalUnique === 0) {
          addLog('');
          addLog('❌ KHÔNG TÌM THẤY CONVERSATION NÀO!', 'error');
          addLog('');
          addLog('Nguyên nhân có thể:', 'warning');
          addLog('  1. Chưa có bệnh nhân nào nhắn tin cho bác sĩ này', 'warning');
          addLog('  2. Doctor document thiếu authUid', 'warning');
          addLog('  3. Conversations thiếu doctorAuthUid', 'warning');
          addLog('');
          addLog('Giải pháp:', 'info');
          addLog('  - Chạy script: fix-doctor-auth-uid.tsx', 'info');
          addLog('  - Chạy script: fix-conversations-auth-uid.tsx', 'info');
        }
        
      } else {
        // DEBUG BỆNH NHÂN
        addLog('=== DEBUG BỆNH NHÂN ===', 'info');
        addLog('');
        
        // Query conversations của bệnh nhân
        const convs = await getDocumentsWithQuery('conversations', [
          where('patientId', '==', userData.uid)
        ]);
        
        addLog(`Số conversations: ${convs.length}`, convs.length > 0 ? 'success' : 'warning');
        addLog('');
        
        if (convs.length > 0) {
          for (let i = 0; i < convs.length; i++) {
            const conv = convs[i] as any;
            addLog(`Conversation ${i + 1}:`, 'info');
            addLog(`  - ID: ${conv.id}`, 'info');
            addLog(`  - Doctor ID: ${conv.doctorId || 'KHÔNG CÓ'}`, conv.doctorId ? 'success' : 'error');
            addLog(`  - Doctor AuthUid: ${conv.doctorAuthUid || 'KHÔNG CÓ'}`, conv.doctorAuthUid ? 'success' : 'error');
            addLog(`  - Doctor Name: ${conv.doctorName}`, 'info');
            addLog(`  - Last Message: ${conv.lastMessage || 'Chưa có'}`, 'info');
            addLog(`  - Unread (Patient): ${conv.unreadCountPatient || 0}`, 'info');
            addLog(`  - Unread (Doctor): ${conv.doctorUnreadCount || 0}`, 'info');
            
            // Kiểm tra doctor document
            if (conv.doctorId) {
              try {
                const doctorDoc = await getDocumentById('doctors', conv.doctorId);
                if (doctorDoc) {
                  const authUid = (doctorDoc as any).authUid;
                  addLog(`  - Doctor authUid trong doc: ${authUid || 'KHÔNG CÓ'}`, authUid ? 'success' : 'error');
                  
                  if (!conv.doctorAuthUid && authUid) {
                    addLog(`  - ⚠️ Conversation thiếu doctorAuthUid!`, 'warning');
                    addLog(`    Cần chạy: fix-conversations-auth-uid.tsx`, 'warning');
                  } else if (conv.doctorAuthUid !== authUid) {
                    addLog(`  - ⚠️ doctorAuthUid KHÔNG KHỚP!`, 'warning');
                    addLog(`    Conv: ${conv.doctorAuthUid}`, 'warning');
                    addLog(`    Doc: ${authUid}`, 'warning');
                  }
                } else {
                  addLog(`  - ❌ Doctor document KHÔNG TỒN TẠI`, 'error');
                }
              } catch (error) {
                addLog(`  - Lỗi khi lấy doctor doc: ${error}`, 'error');
              }
            }
            
            addLog('');
          }
        } else {
          addLog('Chưa có conversation nào', 'warning');
        }
      }
      
      addLog('');
      addLog('=== HOÀN THÀNH DEBUG ===', 'success');
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      addLog('');
      addLog(`❌ Lỗi: ${error}`, 'error');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Chat Issue</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="bug" size={24} color="#FF9800" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Script này sẽ kiểm tra toàn bộ hệ thống chat để tìm nguyên nhân bác sĩ không thấy tin nhắn từ bệnh nhân.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={debugChat}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang kiểm tra...</Text>
            </>
          ) : (
            <>
              <Ionicons name="bug" size={20} color="#fff" />
              <Text style={styles.buttonText}>Chạy Debug</Text>
            </>
          )}
        </TouchableOpacity>

        {logs.length > 0 && (
          <View style={styles.logsCard}>
            <Text style={styles.logsTitle}>Debug Logs</Text>
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
    backgroundColor: '#FFF3E0',
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
    color: '#E65100',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
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
