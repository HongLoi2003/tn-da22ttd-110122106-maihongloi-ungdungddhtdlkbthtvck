import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument } from './services/firebaseService';

export default function CreateTestConversationTranThiLan() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createTestConversation = async () => {
    setLoading(true);
    setResult('Đang tạo conversation test...\n\n');

    try {
      if (!userData?.uid) {
        setResult('❌ Chưa đăng nhập\n');
        setLoading(false);
        return;
      }

      // Thông tin BS. Trần Thị Lan
      const doctorId = 'bs002';
      const doctorAuthUid = '8MEPZwHHq7fgJvSnbYgtoJlApDg2';
      const doctorName = 'BS. Trần Thị Lan';

      setResult(prev => prev + `Tạo conversation cho:\n`);
      setResult(prev => prev + `Patient: ${userData.fullName} (${userData.uid})\n`);
      setResult(prev => prev + `Doctor: ${doctorName} (${doctorId})\n`);
      setResult(prev => prev + `Doctor Auth UID: ${doctorAuthUid}\n\n`);

      // Tạo conversation
      const conversation = await createDocument('conversations', {
        patientId: userData.uid,
        patientName: userData.fullName || 'Bệnh nhân',
        patientAvatar: userData.avatar || '',
        patientPhone: userData.phone || '',
        doctorId: doctorId,
        doctorAuthUid: doctorAuthUid,
        doctorIdOriginal: doctorId,
        doctorName: doctorName,
        doctorSpecialty: 'Nội khoa',
        lastMessage: 'Xin chào bác sĩ',
        lastMessageTimestamp: Timestamp.now(),
        lastMessageSender: 'patient',
        unreadCountPatient: 0,
        doctorUnreadCount: 1,
        createdAt: Timestamp.now(),
      });

      setResult(prev => prev + `✅ Đã tạo conversation: ${conversation.id}\n\n`);

      // Tạo tin nhắn test
      const message = await createDocument('messages', {
        conversationId: conversation.id,
        text: 'Xin chào bác sĩ, tôi cần tư vấn',
        message: 'Xin chào bác sĩ, tôi cần tư vấn',
        senderId: userData.uid,
        senderType: 'patient',
        timestamp: Timestamp.now(),
        read: false,
      });

      setResult(prev => prev + `✅ Đã tạo message: ${message.id}\n\n`);

      setResult(prev => prev + `🎉 Hoàn thành!\n\n`);
      setResult(prev => prev + `Bây giờ:\n`);
      setResult(prev => prev + `1. Đăng xuất\n`);
      setResult(prev => prev + `2. Đăng nhập bằng: tranthilan@gmail.com\n`);
      setResult(prev => prev + `3. Vào trang "Tin nhắn"\n`);
      setResult(prev => prev + `4. Sẽ thấy conversation với ${userData.fullName}\n`);

    } catch (error) {
      setResult(prev => prev + `\n❌ Lỗi: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Test BS. Trần Thị Lan</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Script này sẽ:</Text>
          <Text style={styles.infoText}>• Tạo conversation giữa bạn và BS. Trần Thị Lan</Text>
          <Text style={styles.infoText}>• Tạo tin nhắn test</Text>
          <Text style={styles.infoText}>• Set đúng doctorId và doctorAuthUid</Text>
        </View>

        {userData ? (
          <View style={styles.userCard}>
            <Text style={styles.userLabel}>Đang đăng nhập:</Text>
            <Text style={styles.userName}>{userData.fullName}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>⚠️ Chưa đăng nhập</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createTestConversation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo conversation test</Text>
          )}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Kết quả:</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#00BCD4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  userCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  userLabel: {
    fontSize: 12,
    color: '#00838F',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
