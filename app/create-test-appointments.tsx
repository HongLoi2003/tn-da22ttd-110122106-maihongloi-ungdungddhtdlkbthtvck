import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument } from './services/firebaseService';

export default function CreateTestAppointments() {
  const router = useRouter();
  const { userData } = useAuth();
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState('');

  const createTestAppointments = async () => {
    try {
      setCreating(true);
      setResult('Đang tạo lịch hẹn test...');
      
      if (!userData?.uid) {
        setResult('❌ Vui lòng đăng nhập');
        setCreating(false);
        return;
      }

      // ✅ Separate IDs for different purposes
      const firebaseAuthUid = userData.uid;
      const displayDoctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;
      const doctorName = (userData.doctorInfo as any)?.ten || userData.fullName || 'BS. Test';
      
      console.log('🔍 [CREATE_TEST] Creating test appointments for doctorId:', doctorId);
      
      // Tạo ngày hôm nay và các ngày tiếp theo
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 2);
      
      const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      const getDayName = (date: Date) => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
      };
      
      // Danh sách lịch hẹn test với thời gian khác nhau
      const testAppointments = [
        // Hôm nay
        {
          date: today,
          time: '08:00',
          patientName: 'Nguyễn Văn A',
          patientPhone: '0901234567',
          specialty: 'Tim mạch',
          status: 'pending'
        },
        {
          date: today,
          time: '14:30',
          patientName: 'Trần Thị B',
          patientPhone: '0902345678',
          specialty: 'Tim mạch',
          status: 'confirmed'
        },
        {
          date: today,
          time: '10:00',
          patientName: 'Lê Văn C',
          patientPhone: '0903456789',
          specialty: 'Tim mạch',
          status: 'pending'
        },
        // Ngày mai
        {
          date: tomorrow,
          time: '09:00',
          patientName: 'Phạm Thị D',
          patientPhone: '0904567890',
          specialty: 'Tim mạch',
          status: 'confirmed'
        },
        {
          date: tomorrow,
          time: '15:00',
          patientName: 'Hoàng Văn E',
          patientPhone: '0905678901',
          specialty: 'Tim mạch',
          status: 'pending'
        },
        // Ngày kia
        {
          date: dayAfter,
          time: '08:30',
          patientName: 'Đỗ Thị F',
          patientPhone: '0906789012',
          specialty: 'Tim mạch',
          status: 'confirmed'
        },
      ];
      
      let createdCount = 0;
      
      for (const apt of testAppointments) {
        const appointmentData = {
          userId: 'test-user-' + Math.random().toString(36).substr(2, 9),
          doctorId: doctorId,
          doctor: doctorName,
          specialty: apt.specialty,
          hospital: 'Bệnh viện Trường Đại học Trà Vinh',
          consultationType: 'in-person',
          date: getDayName(apt.date),
          fullDate: formatDate(apt.date),
          time: apt.time,
          duration: '30 phút',
          room: 'Phòng 204',
          floor: 'Tầng 2',
          image: 'nguyenvanam.png',
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          patientEmail: apt.patientName.toLowerCase().replace(/\s+/g, '') + '@test.com',
          patientAge: '28',
          patientGender: 'Nam',
          patientAddress: 'Trà Vinh',
          patientNote: 'Lịch hẹn test',
          patientInsuranceCode: '',
          fee: 350000,
          appointmentType: 'hospital' as const,
          status: apt.status as 'pending' | 'confirmed',
          appointmentDate: apt.date.toISOString(),
          createdAt: new Date().toISOString(),
          appointmentCode: `DL${Date.now()}${createdCount}`,
          checkInCode: `CI${Date.now()}${createdCount}`,
        };
        
        await createDocument('appointments', appointmentData);
        createdCount++;
        setResult(`Đã tạo ${createdCount}/${testAppointments.length} lịch hẹn...`);
        console.log(`✅ [CREATE_TEST] Created appointment ${createdCount}: ${apt.patientName} - ${formatDate(apt.date)} ${apt.time}`);
      }
      
      setResult(`✅ Đã tạo thành công ${createdCount} lịch hẹn test!`);
      setCreating(false);
      
      Alert.alert(
        '✅ Thành công',
        `Đã tạo ${createdCount} lịch hẹn test.\n\nThứ tự mong đợi:\n1. Hôm nay 08:00\n2. Hôm nay 10:00\n3. Hôm nay 14:30\n4. Ngày mai 09:00\n5. Ngày mai 15:00\n6. Ngày kia 08:30`,
        [
          {
            text: 'Xem Dashboard',
            onPress: () => router.push('/doctor/dashboard')
          },
          {
            text: 'OK'
          }
        ]
      );
    } catch (error) {
      console.error('❌ [CREATE_TEST] Error creating appointments:', error);
      setResult(`❌ Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCreating(false);
      
      Alert.alert(
        '❌ Lỗi',
        'Không thể tạo lịch hẹn test. Vui lòng kiểm tra quyền truy cập Firestore.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo lịch hẹn test</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Tạo lịch hẹn mẫu</Text>
            <Text style={styles.infoText}>
              Công cụ này sẽ tạo 6 lịch hẹn test với thời gian khác nhau để kiểm tra tính năng sắp xếp:{'\n\n'}
              • 3 lịch hôm nay (08:00, 10:00, 14:30){'\n'}
              • 2 lịch ngày mai (09:00, 15:00){'\n'}
              • 1 lịch ngày kia (08:30){'\n\n'}
              Sau khi tạo, vào Dashboard để xem thứ tự sắp xếp.
            </Text>
          </View>
        </View>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={createTestAppointments}
          disabled={creating}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.createButtonText}>
            {creating ? 'Đang tạo...' : 'Tạo 6 lịch hẹn test'}
          </Text>
        </TouchableOpacity>

        <View style={styles.expectedOrderCard}>
          <Text style={styles.expectedOrderTitle}>Thứ tự mong đợi trong Dashboard:</Text>
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>1.</Text>
            <Text style={styles.orderText}>Hôm nay 08:00 - Nguyễn Văn A</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>2.</Text>
            <Text style={styles.orderText}>Hôm nay 10:00 - Lê Văn C</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>3.</Text>
            <Text style={styles.orderText}>Hôm nay 14:30 - Trần Thị B</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>4.</Text>
            <Text style={styles.orderText}>Ngày mai 09:00 - Phạm Thị D</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>5.</Text>
            <Text style={styles.orderText}>Ngày mai 15:00 - Hoàng Văn E</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderNumber}>6.</Text>
            <Text style={styles.orderText}>Ngày kia 08:30 - Đỗ Thị F</Text>
          </View>
        </View>
      </ScrollView>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
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
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  expectedOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  expectedOrderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BCD4',
    width: 24,
  },
  orderText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
