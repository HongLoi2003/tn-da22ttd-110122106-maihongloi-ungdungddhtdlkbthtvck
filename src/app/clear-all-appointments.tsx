import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, getDocs } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getFirestoreDb } from './config/firebase';

export default function ClearAllAppointments() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState('');

  const clearAllAppointments = async () => {
    Alert.alert(
      '⚠️ Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa TẤT CẢ lịch hẹn? Hành động này không thể hoàn tác!',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              setResult('Đang xóa...');
              
              console.log('🗑️ [CLEAR] Starting to delete all appointments...');
              
              // Get all appointments
              const appointmentsRef = collection(getFirestoreDb(), 'appointments');
              const snapshot = await getDocs(appointmentsRef);
              
              console.log(`📋 [CLEAR] Found ${snapshot.size} appointments to delete`);
              
              // Delete each appointment
              let deletedCount = 0;
              for (const doc of snapshot.docs) {
                await deleteDoc(doc.ref);
                deletedCount++;
                console.log(`✅ [CLEAR] Deleted appointment ${deletedCount}/${snapshot.size}`);
                setResult(`Đã xóa ${deletedCount}/${snapshot.size} lịch hẹn...`);
              }
              
              console.log('✅ [CLEAR] All appointments deleted successfully!');
              setResult(`✅ Đã xóa thành công ${deletedCount} lịch hẹn!`);
              setClearing(false);
              
              Alert.alert(
                '✅ Thành công',
                `Đã xóa ${deletedCount} lịch hẹn khỏi hệ thống.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ [CLEAR] Error deleting appointments:', error);
              setResult(`❌ Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
              setClearing(false);
              
              Alert.alert(
                '❌ Lỗi',
                'Không thể xóa lịch hẹn. Vui lòng kiểm tra quyền truy cập Firestore.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xóa tất cả lịch hẹn</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={64} color="#ff9800" />
          <Text style={styles.warningTitle}>Cảnh báo!</Text>
          <Text style={styles.warningText}>
            Công cụ này sẽ xóa TẤT CẢ lịch hẹn trong hệ thống.
          </Text>
          <Text style={styles.warningSubtext}>
            Hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
          </Text>
        </View>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.deleteButton, clearing && styles.deleteButtonDisabled]}
          onPress={clearAllAppointments}
          disabled={clearing}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>
            {clearing ? 'Đang xóa...' : 'Xóa tất cả lịch hẹn'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Lưu ý</Text>
            <Text style={styles.infoText}>
              • Tất cả lịch hẹn của bệnh nhân sẽ bị xóa{'\n'}
              • Tất cả lịch hẹn của bác sĩ sẽ bị xóa{'\n'}
              • Dashboard sẽ hiển thị trống sau khi xóa{'\n'}
              • Bạn có thể tạo lịch hẹn mới sau khi xóa
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff9800',
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  warningSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  resultText: {
    fontSize: 14,
    color: '#00838f',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00838f',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#00838f',
    lineHeight: 20,
  },
});
