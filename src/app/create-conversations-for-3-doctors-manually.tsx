import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getFirestoreDb } from './config/firebase';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function CreateConversationsFor3Doctors() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createConversations = async () => {
    try {
      setLoading(true);
      let output = '=== TẠO CONVERSATIONS CHO 3 BÁC SĨ ===\n\n';

      // 1. Load users to get patients and doctor auth mapping
      const users = await getDocumentsWithQuery('users', []);
      const patients = users.filter((u: any) => u.role === 'patient');
      const doctorUsers = users.filter((u: any) => u.role === 'doctor' && u.doctorInfo?.doctorId);
      
      // Create doctorId -> authUid map
      const doctorAuthMap = new Map<string, any>();
      doctorUsers.forEach((user: any) => {
        const doctorId = user.doctorInfo.doctorId;
        doctorAuthMap.set(doctorId, {
          authUid: user.uid,
          email: user.email
        });
      });

      output += `✅ Found ${patients.length} patients\n`;
      output += `✅ Found ${doctorAuthMap.size} doctors\n\n`;

      // 2. Load doctors collection for names
      const doctors = await getDocumentsWithQuery('doctors', []);
      const doctorNames = new Map<string, any>();
      doctors.forEach((doc: any) => {
        doctorNames.set(doc.id, {
          name: doc.ten || doc.name,
          specialty: doc.chuyen_khoa || doc.specialty
        });
      });

      // 3. Target doctors
      const targetDoctors = [
        { id: 'bs001', name: 'BS. Nguyễn Văn An' },
        { id: 'bs003', name: 'BS. Lê Minh Tâm' },
        { id: 'bs004', name: 'BS. Trần Thị Mai' }
      ];

      let createdCount = 0;

      for (const targetDoc of targetDoctors) {
        output += `\n👨‍⚕️ Tạo conversation cho ${targetDoc.name} (${targetDoc.id}):\n`;

        const doctorAuth = doctorAuthMap.get(targetDoc.id);
        if (!doctorAuth) {
          output += `   ❌ Không tìm thấy auth info cho ${targetDoc.id}\n`;
          continue;
        }

        output += `   Auth UID: ${doctorAuth.authUid}\n`;

        const doctorInfo = doctorNames.get(targetDoc.id);
        if (!doctorInfo) {
          output += `   ❌ Không tìm thấy doctor info\n`;
          continue;
        }

        // Create 1 test conversation with first available patient
        if (patients.length === 0) {
          output += `   ❌ Không có patient nào\n`;
          continue;
        }

        const patient = patients[0]; // Use first patient
        
        const conversationData = {
          patientId: patient.uid || patient.id,
          patientName: patient.fullName || patient.email || 'Bệnh nhân',
          patientAvatar: patient.avatar || '',
          patientPhone: patient.phone || '',
          doctorId: targetDoc.id,
          doctorAuthUid: doctorAuth.authUid,
          doctorName: doctorInfo.name,
          doctorSpecialty: doctorInfo.specialty,
          lastMessage: 'Xin chào bác sĩ, tôi cần tư vấn',
          lastMessageTimestamp: Timestamp.now(),
          lastMessageSender: 'patient',
          unreadCountPatient: 0,
          doctorUnreadCount: 1,
          createdAt: Timestamp.now(),
        };

        // Create conversation with custom ID
        const convId = `test-${targetDoc.id}-${Date.now()}`;
        await setDoc(doc(getFirestoreDb(), 'conversations', convId), conversationData);

        output += `   ✅ Created conversation ${convId}\n`;
        output += `      Patient: ${conversationData.patientName}\n`;
        output += `      Doctor: ${conversationData.doctorName}\n`;
        createdCount++;
      }

      output += `\n\n🎉 HOÀN TẤT!\n`;
      output += `   Đã tạo: ${createdCount} conversations\n`;
      output += `\n💡 Bây giờ đăng nhập bác sĩ và kiểm tra trang "Tin nhắn"!\n`;

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
        <Text style={styles.title}>Create Test Conversations</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Chức năng này sẽ:</Text>
          <Text style={styles.infoText}>
            • Tạo 1 test conversation cho mỗi bác sĩ (bs001, bs003, bs004){'\n'}
            • Sử dụng patient thật từ database{'\n'}
            • Map đúng doctorId và doctorAuthUid
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={createConversations}
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
    fontFamily: 'monospace',
  },
});
