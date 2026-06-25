import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function CreateConversationsForPatientMessages() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const createConversations = async () => {
    setLoading(true);
    setOutput('');
    log('=== TẠO CONVERSATIONS CHO TIN NHẮN CHỈ CÓ PATIENT ===\n');

    try {
      // 1. Load all data
      log('🔍 Đang tải dữ liệu...');
      const allMessages = await getDocumentsWithQuery('messages', []);
      const allUsers = await getDocumentsWithQuery('users', []);
      const allDoctors = await getDocumentsWithQuery('doctors', []);
      
      log(`✅ ${allMessages.length} messages, ${allUsers.length} users, ${allDoctors.length} doctors\n`);

      // Create maps
      const userMap = new Map(allUsers.map((u: any) => [u.uid, u]));
      const doctorsByIdMap = new Map(allDoctors.map((d: any) => [d.id, d]));
      const doctorsByAuthMap = new Map(
        allUsers
          .filter((u: any) => u.role === 'doctor' && u.doctorInfo?.doctorId)
          .map((u: any) => [u.doctorInfo.doctorId, u])
      );

      // 2. Group messages by conversationId
      const messagesByConv = new Map<string, any[]>();
      allMessages.forEach((msg: any) => {
        const convId = msg.conversationId;
        if (!convId) return;
        if (!messagesByConv.has(convId)) {
          messagesByConv.set(convId, []);
        }
        messagesByConv.get(convId)!.push(msg);
      });

      log(`📊 ${messagesByConv.size} conversation groups\n`);

      let createdCount = 0;
      let skippedCount = 0;

      for (const [convId, messages] of messagesByConv) {
        log(`\n🔍 ${convId.substring(0, 20)}...`);

        // Find patient
        const patientMsg = messages.find((m: any) => m.senderType === 'patient');
        if (!patientMsg) {
          log(`   ⚠️ Không có tin nhắn patient - bỏ qua`);
          skippedCount++;
          continue;
        }

        const patient = userMap.get(patientMsg.senderId);
        if (!patient) {
          log(`   ⚠️ Patient ${patientMsg.senderId} không tồn tại - bỏ qua`);
          skippedCount++;
          continue;
        }

        log(`   ✅ Patient: ${patient.fullName || patient.email}`);

        // Find doctor - thử nhiều cách
        let doctorId = '';
        let doctorAuthUid = '';
        let doctorName = '';

        // Cách 1: Từ doctor messages (nếu có)
        const doctorMsg = messages.find((m: any) => m.senderType === 'doctor');
        if (doctorMsg) {
          const doctorSenderId = doctorMsg.senderId;
          
          // Check nếu senderId là doctorId (bs001, bs004...)
          if (doctorSenderId.startsWith('bs')) {
            doctorId = doctorSenderId;
            const doctorUser = doctorsByAuthMap.get(doctorId);
            if (doctorUser) {
              doctorAuthUid = doctorUser.uid;
              doctorName = doctorUser.fullName || '';
            }
            const doctorInfo = doctorsByIdMap.get(doctorId);
            if (doctorInfo) {
              doctorName = doctorInfo.name || doctorName;
            }
          } else {
            // Nếu là authUid
            doctorAuthUid = doctorSenderId;
            const doctorUser = userMap.get(doctorAuthUid);
            if (doctorUser && doctorUser.role === 'doctor') {
              doctorId = doctorUser.doctorInfo?.doctorId || '';
              doctorName = doctorUser.fullName || '';
            }
          }
        }

        // Cách 2: Parse từ conversationId (có thể có pattern patient_doctor)
        if (!doctorId && convId.includes('_')) {
          const parts = convId.split('_');
          if (parts.length >= 2 && parts[1].startsWith('bs')) {
            doctorId = parts[1];
            const doctorUser = doctorsByAuthMap.get(doctorId);
            if (doctorUser) {
              doctorAuthUid = doctorUser.uid;
              doctorName = doctorUser.fullName || '';
            }
            const doctorInfo = doctorsByIdMap.get(doctorId);
            if (doctorInfo) {
              doctorName = doctorInfo.name || doctorName;
            }
          }
        }

        // Nếu vẫn không tìm thấy doctor - TẠO CONVERSATION KHÔNG CÓ DOCTOR
        // (Để khi bác sĩ reply sau, có thể update)
        if (!doctorId) {
          log(`   ⚠️ Không xác định được doctor - tạo conversation tạm`);
          doctorId = 'unknown';
          doctorAuthUid = '';
          doctorName = 'Chưa xác định';
        } else {
          log(`   ✅ Doctor: ${doctorName} (${doctorId})`);
        }

        // Sort messages
        const sortedMessages = messages.sort((a: any, b: any) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });

        const lastMsg = sortedMessages[0];
        const unreadDoctorMessages = messages.filter((m: any) => 
          m.senderType === 'patient' && !m.read
        ).length;

        // Create conversation
        const convData = {
          id: convId,
          patientId: patient.uid,
          patientName: patient.fullName || patient.email || 'Bệnh nhân',
          patientAvatar: patient.avatar || '',
          patientPhone: patient.phone || '',
          doctorId: doctorId,
          doctorAuthUid: doctorAuthUid,
          doctorName: doctorName,
          lastMessage: lastMsg.text || lastMsg.message || '',
          lastMessageTimestamp: lastMsg.timestamp || Timestamp.now(),
          lastMessageSender: lastMsg.senderType || 'patient',
          unreadCountPatient: 0,
          doctorUnreadCount: unreadDoctorMessages,
          createdAt: messages[messages.length - 1].timestamp || Timestamp.now(),
        };

        try {
          await createDocument('conversations', convData);
          log(`   ✅ Tạo thành công! (${messages.length} msgs, ${unreadDoctorMessages} unread)`);
          createdCount++;
        } catch (error) {
          log(`   ❌ Lỗi: ${error}`);
        }
      }

      log(`\n\n📊 TỔNG KẾT:`);
      log(`   ✅ Đã tạo: ${createdCount} conversations`);
      log(`   ⚠️ Bỏ qua: ${skippedCount} conversations`);
      log(`\n💡 Bác sĩ có thể đăng nhập và xem tin nhắn!`);

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
        <Text style={styles.title}>Tạo Conversations</Text>
        <Text style={styles.subtitle}>
          Tự động tạo conversations từ patient messages
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createConversations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : '🚀 Tạo Conversations'}
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
