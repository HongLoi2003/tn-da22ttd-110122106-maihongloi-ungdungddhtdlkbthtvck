import { where } from 'firebase/firestore';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function Fix3DoctorsConversations() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const targetDoctors = [
    { id: 'bs001', name: 'BS. Nguyễn Văn An' },
    { id: 'bs004', name: 'BS. Trần Thị Lan' },
    { id: 'bs003', name: 'BS. Đỗ Minh Tuấn' }
  ];

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const checkAndFixDoctors = async () => {
    setLoading(true);
    setOutput('');
    log('=== KIỂM TRA VÀ FIX 3 BÁC SĨ (CHỈ DÙNG DOCTORID) ===\n');

    try {
      for (const doctor of targetDoctors) {
        log(`\n📋 Đang xử lý ${doctor.name} (${doctor.id})...`);

        // 1. Tìm authUid của bác sĩ từ users collection
        log(`   🔍 Tìm authUid trong users collection...`);
        const users = await getDocumentsWithQuery('users', [
          where('role', '==', 'doctor')
        ]);

        const matchingUser = users.find((u: any) => 
          u.doctorInfo?.doctorId === doctor.id
        );

        if (!matchingUser) {
          log(`   ❌ Không tìm thấy user với doctorInfo.doctorId = ${doctor.id}`);
          continue;
        }

        const authUid = (matchingUser as any).uid;
        log(`   ✅ Tìm thấy authUid: ${authUid}`);

        // 2. Tìm tất cả conversations có thể liên quan
        log(`\n   📨 Tìm conversations...`);
        
        // Tìm theo doctorId đúng (bs001, bs004, etc.)
        const convByDoctorId = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', doctor.id)
        ]);
        log(`   - Có ${convByDoctorId.length} conversations với doctorId = ${doctor.id}`);

        // Tìm theo authUid (có thể conversations cũ lưu authUid làm doctorId)
        const convByAuthUid = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', authUid)
        ]);
        log(`   - Có ${convByAuthUid.length} conversations với doctorId = authUid`);

        // 3. Fix conversations sai (doctorId = authUid) -> đổi thành doctorId đúng
        let fixedCount = 0;
        for (const conv of convByAuthUid) {
          const convData = conv as any;
          if (convData.doctorId === authUid) {
            // Sửa doctorId về đúng format (bs001, bs004, etc.)
            await updateDocument('conversations', conv.id, {
              doctorId: doctor.id
            });
            fixedCount++;
            log(`   ✅ Sửa conversation ${conv.id}: doctorId ${authUid} → ${doctor.id}`);
          }
        }

        if (fixedCount > 0) {
          log(`   ✅ Đã fix ${fixedCount} conversations`);
        } else {
          log(`   ✅ Không có conversations cần fix`);
        }

        // 4. Kiểm tra lại
        log(`\n   🔍 Kiểm tra lại sau khi fix...`);
        const finalCheck = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', doctor.id)
        ]);
        log(`   ✅ Bác sĩ ${doctor.name} hiện có ${finalCheck.length} conversations`);
        
        if (finalCheck.length > 0) {
          log(`   📝 Chi tiết conversations:`);
          finalCheck.forEach((c: any) => {
            log(`      - ${c.patientName || 'Không rõ'} (${c.lastMessage?.substring(0, 30) || 'Chưa có tin nhắn'})`);
          });
        }
      }

      log('\n\n✅ HOÀN TẤT! Tất cả 3 bác sĩ đã được kiểm tra và fix.');
      log('\n💡 Bây giờ bác sĩ đăng nhập sẽ thấy tin nhắn từ bệnh nhân.');
      
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
        <Text style={styles.title}>Fix 3 Bác Sĩ Conversations</Text>
        <Text style={styles.subtitle}>
          Nguyễn Văn An, Trần Thị Lan, Đỗ Minh Tuấn
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={checkAndFixDoctors}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : '🔧 Kiểm Tra & Fix'}
          </Text>
        </TouchableOpacity>

        {output ? (
          <View style={styles.outputContainer}>
            <Text style={styles.output}>{output}</Text>
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
  },
  output: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#0f172a',
    lineHeight: 18,
  },
});
