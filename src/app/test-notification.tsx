import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import notificationService from './services/notificationService';

export default function TestNotificationScreen() {
  const router = useRouter();

  const testMessageNotification = async () => {
    try {
      console.log('🧪 Testing message notification...');
      
      await notificationService.sendLocalNotification({
        title: '💬 Tin nhắn từ BS. Nguyễn Văn An',
        body: 'Xin chào! Tôi đã xem kết quả xét nghiệm của bạn.',
        data: {
          type: 'message',
          conversationId: 'test-conversation-123',
          doctorId: 'bs001',
          doctorName: 'BS. Nguyễn Văn An',
          doctorSpecialty: 'Chuyên khoa Tim mạch',
          doctorImage: 'nguyenvanam.png',
          doctorPhone: '0901234567',
        },
      });
      
      console.log('✅ Notification sent successfully!');
      alert('Thông báo đã được gửi! Hãy bấm vào thông báo để test navigation.');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      alert('Lỗi khi gửi thông báo: ' + error);
    }
  };

  const testAppointmentNotification = async () => {
    try {
      console.log('🧪 Testing appointment notification...');
      
      await notificationService.notifyNewAppointment(
        'BS. Trần Thị Lan',
        '14:00 - 15/06/2026'
      );
      
      console.log('✅ Appointment notification sent!');
      alert('Thông báo lịch hẹn đã được gửi!');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Lỗi: ' + error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Test Message Notification</Text>
          <Text style={styles.sectionDesc}>
            Gửi thông báo tin nhắn từ bác sĩ. Bấm vào thông báo sẽ mở trang chat.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testMessageNotification}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.buttonText}>Gửi thông báo tin nhắn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Test Appointment Notification</Text>
          <Text style={styles.sectionDesc}>
            Gửi thông báo lịch hẹn thành công.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={testAppointmentNotification}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.buttonText}>Gửi thông báo lịch hẹn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Hướng dẫn test</Text>
            <Text style={styles.infoText}>
              1. Bấm nút "Gửi thông báo tin nhắn"{'\n'}
              2. Thông báo sẽ xuất hiện trên màn hình{'\n'}
              3. Bấm vào thông báo để mở trang chat với bác sĩ{'\n'}
              4. Kiểm tra xem navigation có hoạt động đúng không
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: '#8B5CF6',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
});
