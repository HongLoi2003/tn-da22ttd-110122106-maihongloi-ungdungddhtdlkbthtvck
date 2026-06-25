import { Timestamp, where } from 'firebase/firestore';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function FindOrphanMessages3Doctors() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const targetDoctors = [
    { id: 'bs001', name: 'BS. Nguyễn Văn An', authUid: '437y6IoqBNaUcH0Rf4MdXnM5RlE3' },
    { id: 'bs004', name: 'BS. Trần Thị Lan', authUid: 'NHbMROGpWOV4xxlXB8EhPi5nKZ82' },
    { id: 'bs003', name: 'BS. Đỗ Minh Tuấn', authUid: 'zocOAhTF1BhQyXjRXhgMO25N73K2' }
  ];

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const findAndFixOrphanMessages = async () => {
    setLoading(true);
    setOutput('');
    log('=== TÌM VÀ TẠO LẠI CONVERSATIONS TỪ MESSAGES ===\n');

    try {
      // Lấy TẤT CẢ messages trong Firestore
      log('🔍 Đang tải tất cả messages...');
      const allMessages = await getDocumentsWithQuery('messages', []);
      log(`✅ Tìm thấy ${allMessages.length} messages\n`);

      for (const doctor of targetDoctors) {
        log(`\n📋 Xử lý ${doctor.name} (${doctor.id})...`);

        // Tìm messages liên quan đến bác sĩ này
        // Messages có thể chứa doctorId trong conversationId (format: patientId_doctorId)
        const doctorMessages = allMessages.filter((msg: any) => {
          const convId = msg.conversationId || '';
          // Check nếu conversationId chứa doctorId hoặc authUid
          return convId.includes(doctor.id) || convId.includes(doctor.authUid);
        });

        log(`   📨 Tìm thấy ${doctorMessages.length} messages liên quan`);

        if (doctorMessages.length === 0) {
          log(`   ⚠️ Không có messages nào`);
          continue;
        }

        // Group messages theo conversationId
        const messagesByConv = new Map<string, any[]>();
        doctorMessages.forEach((msg: any) => {
          const convId = msg.conversationId;
          if (!messagesByConv.has(convId)) {
            messagesByConv.set(convId, []);
          }
          messagesByConv.get(convId)!.push(msg);
        });

        log(`   📊 Tìm thấy ${messagesByConv.size} conversation IDs unique`);

        // Kiểm tra từng conversationId xem đã có trong conversations collection chưa
        for (const [convId, messages] of messagesByConv) {
          log(`\n   🔍 Kiểm tra conversation: ${convId}`);
          
          // Check xem conversation này đã tồn tại chưa
          const existingConv = await getDocumentsWithQuery('conversations', [
            where('__name__', '==', convId)
          ]);

          if (existingConv.length > 0) {
            log(`      ✅ Conversation đã tồn tại`);
            continue;
          }

          log(`      ⚠️ Conversation KHÔNG TỒN TẠI - cần tạo mới!`);
          log(`      📝 Có ${messages.length} messages trong conversation này`);

          // Tìm thông tin patient từ messages
          const patientMessages = messages.filter((m: any) => m.senderType === 'patient');
          if (patientMessages.length === 0) {
            log(`      ❌ Không tìm thấy tin nhắn từ patient`);
            continue;
          }

          const firstPatientMsg = patientMessages[0];
          const patientId = firstPatientMsg.senderId;

          // Lấy thông tin patient từ users collection
          const patients = await getDocumentsWithQuery('users', [
            where('uid', '==', patientId)
          ]);

          if (patients.length === 0) {
            log(`      ❌ Không tìm thấy patient với uid: ${patientId}`);
            continue;
          }

          const patient = patients[0] as any;
          log(`      ✅ Tìm thấy patient: ${patient.fullName || patient.email}`);

          // Tìm tin nhắn cuối cùng
          const sortedMessages = messages.sort((a: any, b: any) => {
            const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
            return timeB - timeA; // Descending
          });

          const lastMsg = sortedMessages[0];
          const lastMsgText = lastMsg.text || lastMsg.message || '';
          const lastMsgTimestamp = lastMsg.timestamp || Timestamp.now();
          const lastMsgSender = lastMsg.senderType || 'patient';

          // Đếm unread messages
          const unreadPatientMessages = messages.filter((m: any) => 
            m.senderType === 'doctor' && !m.read
          ).length;
          const unreadDoctorMessages = messages.filter((m: any) => 
            m.senderType === 'patient' && !m.read
          ).length;

          // Tạo conversation mới
          const newConvData = {
            id: convId, // Custom ID
            patientId: patient.uid,
            patientName: patient.fullName || patient.email || 'Bệnh nhân',
            patientAvatar: patient.avatar || '',
            patientPhone: patient.phone || '',
            doctorId: doctor.id,
            doctorAuthUid: doctor.authUid,
            doctorName: doctor.name,
            lastMessage: lastMsgText,
            lastMessageTimestamp: lastMsgTimestamp,
            lastMessageSender: lastMsgSender,
            unreadCountPatient: unreadPatientMessages,
            doctorUnreadCount: unreadDoctorMessages,
            createdAt: messages[0].timestamp || Timestamp.now(),
          };

          try {
            // Tạo conversation với custom ID
            await createDocument('conversations', newConvData);
            log(`      ✅ Đã tạo conversation mới!`);
            log(`         - Patient: ${newConvData.patientName}`);
            log(`         - Tin nhắn cuối: ${lastMsgText.substring(0, 50)}...`);
            log(`         - Unread (doctor): ${unreadDoctorMessages}`);
          } catch (error) {
            log(`      ❌ Lỗi tạo conversation: ${error}`);
          }
        }
      }

      log('\n\n✅ HOÀN TẤT! Đã tạo lại conversations từ messages.');
      log('\n💡 Bây giờ thử đăng nhập bác sĩ và kiểm tra lại.');
      
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
        <Text style={styles.title}>Tìm Messages Không Có Conversation</Text>
        <Text style={styles.subtitle}>
          Tạo lại conversations từ messages tồn tại
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={findAndFixOrphanMessages}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : '🔍 Tìm & Tạo Conversations'}
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
