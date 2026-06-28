import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function RebuildAllConversations() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const rebuildAllConversations = async () => {
    setLoading(true);
    setOutput('');
    log('=== TẠO LẠI TẤT CẢ CONVERSATIONS TỪ MESSAGES ===\n');

    try {
      // 1. Load all messages
      log('🔍 Đang tải tất cả messages...');
      const allMessages = await getDocumentsWithQuery('messages', []);
      log(`✅ Tìm thấy ${allMessages.length} messages\n`);

      if (allMessages.length === 0) {
        log('⚠️ Không có messages nào để xử lý');
        setLoading(false);
        return;
      }

      // 2. Load all users and doctors for mapping
      log('🔍 Đang tải thông tin users và doctors...');
      const allUsers = await getDocumentsWithQuery('users', []);
      const allDoctors = await getDocumentsWithQuery('doctors', []);
      log(`✅ Tìm thấy ${allUsers.length} users và ${allDoctors.length} doctors\n`);

      // Create lookup maps
      const userMap = new Map(allUsers.map((u: any) => [u.uid, u]));
      const doctorMap = new Map(allDoctors.map((d: any) => [d.id, d]));

      // 3. Group messages by conversationId
      const messagesByConv = new Map<string, any[]>();
      allMessages.forEach((msg: any) => {
        const convId = msg.conversationId;
        if (!convId) return;
        
        if (!messagesByConv.has(convId)) {
          messagesByConv.set(convId, []);
        }
        messagesByConv.get(convId)!.push(msg);
      });

      log(`📊 Tìm thấy ${messagesByConv.size} conversation IDs unique\n`);

      // 4. Process each conversation
      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const [convId, messages] of messagesByConv) {
        log(`\n🔍 Xử lý conversation: ${convId.substring(0, 20)}...`);
        
        // Find patient and doctor from messages
        const patientMessages = messages.filter((m: any) => m.senderType === 'patient');
        const doctorMessages = messages.filter((m: any) => m.senderType === 'doctor');

        if (patientMessages.length === 0) {
          log(`   ⚠️ Không có tin nhắn từ patient - bỏ qua`);
          skippedCount++;
          continue;
        }

        const patientId = patientMessages[0].senderId;
        const patient = userMap.get(patientId);

        if (!patient) {
          log(`   ⚠️ Không tìm thấy patient ${patientId} - bỏ qua`);
          skippedCount++;
          continue;
        }

        log(`   ✅ Patient: ${patient.fullName || patient.email}`);

        // Find doctor - có thể từ doctor messages hoặc patient messages
        let doctorId = '';
        let doctorAuthUid = '';
        let doctorName = '';
        
        if (doctorMessages.length > 0) {
          // Có tin nhắn từ doctor
          doctorAuthUid = doctorMessages[0].senderId;
          
          // Tìm doctor từ authUid
          const doctorUser = allUsers.find((u: any) => 
            u.uid === doctorAuthUid && u.role === 'doctor'
          );
          
          if (doctorUser) {
            doctorId = doctorUser.doctorInfo?.doctorId || '';
            doctorName = doctorUser.fullName || '';
            log(`   ✅ Doctor: ${doctorName} (${doctorId})`);
          } else {
            log(`   ⚠️ Không tìm thấy doctor với authUid: ${doctorAuthUid}`);
          }
        } else {
          log(`   ⚠️ Chưa có tin nhắn từ doctor - cần thêm thông tin`);
          // Nếu không có tin nhắn từ doctor, không thể xác định được doctor là ai
          // Bỏ qua conversation này
          skippedCount++;
          continue;
        }

        if (!doctorId) {
          log(`   ⚠️ Không xác định được doctorId - bỏ qua`);
          skippedCount++;
          continue;
        }

        // Get doctor info from doctors collection
        const doctorInfo = doctorMap.get(doctorId);
        if (doctorInfo) {
          doctorName = doctorInfo.name || doctorName;
        }

        // Find last message
        const sortedMessages = messages.sort((a: any, b: any) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });

        const lastMsg = sortedMessages[0];
        const lastMsgText = lastMsg.text || lastMsg.message || '';
        const lastMsgTimestamp = lastMsg.timestamp || Timestamp.now();
        const lastMsgSender = lastMsg.senderType || 'patient';

        // Count unread
        const unreadPatientMessages = messages.filter((m: any) => 
          m.senderType === 'doctor' && !m.read
        ).length;
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
          lastMessage: lastMsgText,
          lastMessageTimestamp: lastMsgTimestamp,
          lastMessageSender: lastMsgSender,
          unreadCountPatient: unreadPatientMessages,
          doctorUnreadCount: unreadDoctorMessages,
          createdAt: messages[0].timestamp || Timestamp.now(),
        };

        try {
          await createDocument('conversations', convData);
          log(`   ✅ Tạo conversation thành công!`);
          log(`      - ${messages.length} messages`);
          log(`      - Doctor unread: ${unreadDoctorMessages}`);
          createdCount++;
        } catch (error) {
          log(`   ❌ Lỗi tạo conversation: ${error}`);
          errorCount++;
        }
      }

      log(`\n\n📊 TỔNG KẾT:`);
      log(`   ✅ Đã tạo: ${createdCount} conversations`);
      log(`   ⚠️ Bỏ qua: ${skippedCount} conversations`);
      log(`   ❌ Lỗi: ${errorCount} conversations`);
      log(`\n💡 Bây giờ bác sĩ có thể đăng nhập và xem tin nhắn!`);
      
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
        <Text style={styles.title}>Tạo Lại Tất Cả Conversations</Text>
        <Text style={styles.subtitle}>
          Tự động tạo conversations từ messages hiện có
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={rebuildAllConversations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : '🔨 Rebuild All Conversations'}
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
