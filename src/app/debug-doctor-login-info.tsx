import { where } from 'firebase/firestore';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function DebugDoctorLoginInfo() {
  const { userData } = useAuth();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const checkDoctorInfo = async () => {
    setLoading(true);
    setOutput('');
    log('=== THÔNG TIN BÁC SĨ ĐANG ĐĂNG NHẬP ===\n');

    try {
      if (!userData) {
        log('❌ Chưa đăng nhập!');
        setLoading(false);
        return;
      }

      log('👤 THÔNG TIN USER:');
      log(`   - UID: ${userData.uid}`);
      log(`   - Name: ${userData.fullName || userData.email}`);
      log(`   - Role: ${userData.role}`);
      log(`   - Doctor Info: ${JSON.stringify(userData.doctorInfo, null, 2)}`);

      const doctorIdFromInfo = (userData.doctorInfo as any)?.doctorId;
      log(`\n📋 DOCTOR ID từ doctorInfo: ${doctorIdFromInfo || 'KHÔNG CÓ'}`);

      if (!doctorIdFromInfo) {
        log('\n❌ KHÔNG CÓ doctorInfo.doctorId!');
        log('   Đây là lý do không thấy conversations.');
        log('   Cần cập nhật user document.');
        setLoading(false);
        return;
      }

      // Query conversations
      log(`\n🔍 Tìm conversations với doctorId = ${doctorIdFromInfo}...`);
      const conversations = await getDocumentsWithQuery('conversations', [
        where('doctorId', '==', doctorIdFromInfo)
      ]);

      log(`✅ Tìm thấy ${conversations.length} conversations`);

      if (conversations.length > 0) {
        log('\n📝 CHI TIẾT CONVERSATIONS:');
        conversations.forEach((conv: any, idx) => {
          log(`\n   ${idx + 1}. ${conv.patientName || 'Không rõ'}`);
          log(`      - ID: ${conv.id}`);
          log(`      - Doctor ID: ${conv.doctorId}`);
          log(`      - Doctor Auth UID: ${conv.doctorAuthUid || 'N/A'}`);
          log(`      - Last msg: ${conv.lastMessage?.substring(0, 40) || 'N/A'}...`);
          log(`      - Unread: ${conv.doctorUnreadCount || 0}`);
        });
      } else {
        log('\n⚠️ KHÔNG CÓ CONVERSATIONS!');
        log('   Có thể:');
        log('   1. Chưa có bệnh nhân nào nhắn tin cho bác sĩ này');
        log('   2. Conversations có doctorId khác với doctorInfo.doctorId');
      }

      // Check if there are conversations with authUid
      log(`\n🔍 Kiểm tra conversations với authUid = ${userData.uid}...`);
      const convsByAuthUid = await getDocumentsWithQuery('conversations', [
        where('doctorAuthUid', '==', userData.uid)
      ]);
      log(`   Tìm thấy ${convsByAuthUid.length} conversations`);

      log(`\n🔍 Kiểm tra conversations với doctorId = ${userData.uid}...`);
      const convsByUid = await getDocumentsWithQuery('conversations', [
        where('doctorId', '==', userData.uid)
      ]);
      log(`   Tìm thấy ${convsByUid.length} conversations`);

    } catch (error) {
      log(`\n❌ LỖI: ${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Debug Doctor Login Info</Text>
        <Text style={styles.subtitle}>
          Kiểm tra thông tin bác sĩ đang đăng nhập
        </Text>

        {userData && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>👤 {userData.fullName || userData.email}</Text>
            <Text style={styles.infoText}>🆔 {userData.uid}</Text>
            <Text style={styles.infoText}>
              📋 Doctor ID: {(userData.doctorInfo as any)?.doctorId || 'N/A'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={checkDoctorInfo}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang kiểm tra...' : '🔍 Kiểm Tra'}
          </Text>
        </TouchableOpacity>

        {output ? (
          <View style={styles.outputContainer}>
            <ScrollView style={styles.outputScroll}>
              <Text style={styles.output}>{output}</Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 500,
  },
  outputScroll: {
    maxHeight: 480,
  },
  output: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#0f172a',
    lineHeight: 18,
  },
});
