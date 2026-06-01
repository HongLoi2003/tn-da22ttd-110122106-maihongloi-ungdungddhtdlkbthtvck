import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function RebuildConversationsFromMessages() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const rebuildConversations = async () => {
    try {
      setLoading(true);
      let output = '=== TÁI TẠO CONVERSATIONS TỪ MESSAGES ===\n\n';

      // 1. Load all messages
      const messages = await getDocumentsWithQuery('messages', []);
      output += `✅ Tìm thấy ${messages.length} messages\n\n`;

      // 2. Group by conversationId
      const conversationMap = new Map<string, any[]>();
      messages.forEach((msg: any) => {
        const convId = msg.conversationId;
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, []);
        }
        conversationMap.get(convId)!.push(msg);
      });

      output += `📋 Tìm thấy ${conversationMap.size} conversations cần tái tạo\n\n`;

      // 3. Load doctor mapping
      const doctors = await getDocumentsWithQuery('doctors', []);
      const doctorIdToAuthUid = new Map<string, any>();
      doctors.forEach((doc: any) => {
        if (doc.authUid) {
          doctorIdToAuthUid.set(doc.id, {
            authUid: doc.authUid,
            name: doc.ten,
            specialty: doc.chuyen_khoa
          });
        }
      });

      output += `✅ Loaded ${doctorIdToAuthUid.size} doctors\n\n`;

      // 4. Recreate conversations
      let created = 0;
      let errors = 0;

      for (const [convId, msgs] of conversationMap.entries()) {
        try {
          // Sort messages by timestamp
          const sortedMsgs = msgs.sort((a: any, b: any) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return timeA - timeB;
          });

          const firstMsg = sortedMsgs[0];
          const lastMsg = sortedMsgs[sortedMsgs.length - 1];

          // Get patient info
          const patientId = firstMsg.senderId;
          let patientName = 'Bệnh nhân';
          let patientAvatar = '';
          let patientPhone = '';

          try {
            const users = await getDocumentsWithQuery('users', []);
            const patient = users.find((u: any) => u.uid === patientId);
            if (patient) {
              patientName = (patient as any).fullName || patientName;
              patientAvatar = (patient as any).avatar || '';
              patientPhone = (patient as any).phone || '';
            }
          } catch (error) {
            output += `⚠️  Không load được patient info cho ${patientId}\n`;
          }

          // Try to determine doctorId from conversationId or messages
          // ConversationId format might contain doctorId
          let doctorId = '';
          let doctorAuthUid = '';
          let doctorName = 'Bác sĩ';
          let doctorSpecialty = '';

          // Try to find doctor from messages (if any message is from doctor)
          const doctorMsg = msgs.find((m: any) => m.senderType === 'doctor');
          if (doctorMsg && doctorMsg.senderId) {
            // senderId might be authUid, try to find matching doctor
            for (const [dId, dInfo] of doctorIdToAuthUid.entries()) {
              if (dInfo.authUid === doctorMsg.senderId) {
                doctorId = dId;
                doctorAuthUid = dInfo.authUid;
                doctorName = dInfo.name;
                doctorSpecialty = dInfo.specialty;
                break;
              }
            }
          }

          // If still no doctor found, try to guess from first message text
          if (!doctorId) {
            const firstMsgText = firstMsg.text || firstMsg.message || '';
            // Check if message mentions a doctor name
            for (const [dId, dInfo] of doctorIdToAuthUid.entries()) {
              if (firstMsgText.toLowerCase().includes(dInfo.name.toLowerCase())) {
                doctorId = dId;
                doctorAuthUid = dInfo.authUid;
                doctorName = dInfo.name;
                doctorSpecialty = dInfo.specialty;
                break;
              }
            }
          }

          // If still no doctor, use first doctor as fallback
          if (!doctorId && doctorIdToAuthUid.size > 0) {
            const firstDoctor = Array.from(doctorIdToAuthUid.entries())[0];
            doctorId = firstDoctor[0];
            doctorAuthUid = firstDoctor[1].authUid;
            doctorName = firstDoctor[1].name;
            doctorSpecialty = firstDoctor[1].specialty;
            output += `⚠️  Không xác định được bác sĩ, dùng ${doctorName} làm mặc định\n`;
          }

          // Count unread messages
          const unreadPatient = msgs.filter((m: any) => m.senderType === 'doctor' && !m.read).length;
          const unreadDoctor = msgs.filter((m: any) => m.senderType === 'patient' && !m.read).length;

          // Create conversation with original ID
          const conversationData = {
            patientId,
            patientName,
            patientAvatar,
            patientPhone,
            doctorId,
            doctorAuthUid,
            doctorName,
            doctorSpecialty,
            lastMessage: lastMsg.text || lastMsg.message || '',
            lastMessageTimestamp: lastMsg.timestamp || Timestamp.now(),
            lastMessageSender: lastMsg.senderType || 'patient',
            unreadCountPatient: unreadPatient,
            unreadCountDoctor: unreadDoctor,
            createdAt: firstMsg.timestamp || Timestamp.now(),
          };

          // Try to create with original ID
          await createDocument('conversations', conversationData, convId);

          output += `✅ [${convId}] ${patientName} <-> ${doctorName} (${msgs.length} messages)\n`;
          created++;
        } catch (error) {
          output += `❌ [${convId}] Lỗi: ${error}\n`;
          errors++;
        }
      }

      output += '\n=== KẾT QUẢ ===\n';
      output += `✅ Đã tạo: ${created} conversations\n`;
      output += `❌ Lỗi: ${errors} conversations\n`;
      output += `📊 Tổng: ${conversationMap.size} conversations\n`;

      setResult(output);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Rebuild Conversations</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚠️ Chức năng này sẽ:</Text>
          <Text style={styles.infoText}>
            • Tái tạo conversations từ messages có sẵn{'\n'}
            • Tự động map doctorId và doctorAuthUid{'\n'}
            • Khôi phục lại tin nhắn cho bác sĩ
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={rebuildConversations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang tái tạo...' : 'Tái tạo Conversations'}
          </Text>
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#d1ecf1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#17a2b8',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c5460',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 12,
    color: '#1a1a1a',
    lineHeight: 18,
  },
});
