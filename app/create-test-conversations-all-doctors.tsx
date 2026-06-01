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
import { useAuth } from './context/AuthContext';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function CreateTestConversationsAllDoctors() {
  const router = useRouter();
  const { userData } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createTestConversations = async () => {
    try {
      setLoading(true);
      let output = '=== TẠO TEST CONVERSATIONS CHO TẤT CẢ BÁC SĨ ===\n\n';

      if (!userData?.uid) {
        output += '❌ Bạn chưa đăng nhập!\n';
        setResult(output);
        setLoading(false);
        return;
      }

      output += `👤 Patient: ${userData.fullName} (${userData.uid})\n\n`;

      // Load all doctors
      const doctors = await getDocumentsWithQuery('doctors', []);
      output += `✅ Tìm thấy ${doctors.length} bác sĩ\n\n`;

      let created = 0;
      let errors = 0;

      for (const doctor of doctors) {
        const doctorData = doctor as any;
        const doctorId = doctorData.id;
        const doctorName = doctorData.ten || 'Bác sĩ';
        const doctorAuthUid = doctorData.authUid;

        output += `\n[${doctorId}] ${doctorName}\n`;

        if (!doctorAuthUid) {
          output += `  ⚠️  Không có authUid, bỏ qua\n`;
          errors++;
          continue;
        }

        try {
          // Create conversation
          const conversationData = {
            patientId: userData.uid,
            patientName: userData.fullName || 'Bệnh nhân',
            patientAvatar: userData.avatar || '',
            patientPhone: userData.phone || '',
            doctorId: doctorId,
            doctorAuthUid: doctorAuthUid,
            doctorName: doctorName,
            doctorSpecialty: doctorData.chuyen_khoa || '',
            lastMessage: 'Xin chào bác sĩ, tôi cần tư vấn',
            lastMessageTimestamp: Timestamp.now(),
            lastMessageSender: 'patient',
            unreadCountPatient: 0,
            unreadCountDoctor: 1,
            createdAt: Timestamp.now(),
          };

          const conv = await createDocument('conversations', conversationData);
          output += `  ✅ Tạo conversation: ${conv.id}\n`;

          // Create first message
          const messageData = {
            conversationId: conv.id,
            text: 'Xin chào bác sĩ, tôi cần tư vấn',
            message: 'Xin chào bác sĩ, tôi cần tư vấn',
            senderId: userData.uid,
            senderType: 'patient',
            timestamp: Timestamp.now(),
            read: false,
          };

          await createDocument('messages', messageData);
          output += `  ✅ Tạo message\n`;

          created++;
        } catch (error) {
          output += `  ❌ Lỗi: ${error}\n`;
          errors++;
        }
      }

      output += '\n=== KẾT QUẢ ===\n';
      output += `✅ Đã tạo: ${created} conversations\n`;
      output += `❌ Lỗi: ${errors}\n`;
      output += `📊 Tổng: ${doctors.length} bác sĩ\n\n`;
      output += '🎉 Bây giờ tất cả bác sĩ sẽ thấy tin nhắn!\n';

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
        <Text style={styles.title}>Test Conversations</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚠️ Script này sẽ:</Text>
          <Text style={styles.infoText}>
            • Tạo conversation mới cho TẤT CẢ bác sĩ{'\n'}
            • Gửi tin nhắn test: "Xin chào bác sĩ, tôi cần tư vấn"{'\n'}
            • Tự động thêm doctorAuthUid vào conversations{'\n'}
            • Tất cả bác sĩ sẽ thấy tin nhắn ngay lập tức
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>📝 Lưu ý:</Text>
          <Text style={styles.warningText}>
            • Bạn phải đăng nhập với tài khoản BỆNH NHÂN{'\n'}
            • Script sẽ tạo conversations mới (không ảnh hưởng conversations cũ){'\n'}
            • Sau khi chạy, đăng nhập với bất kỳ bác sĩ nào để kiểm tra
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={createTestConversations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang tạo...' : 'Tạo Test Conversations'}
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
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#28a745',
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
