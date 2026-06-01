import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from './config/firebase';
import { createDocument } from './services/firebaseService';

export default function CreateDoctorAccount() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const createDoctorTestAccount = async () => {
    try {
      setCreating(true);

      // Doctor account details
      const doctorEmail = 'nguyenvanan@gmail.com';
      const doctorPassword = '123456';
      const doctorData = {
        fullName: 'Nguyễn Văn An',
        phone: '0901234567',
        role: 'doctor',
        dateOfBirth: '15/05/1985',
        gender: 'Nam',
        address: 'Trà Vinh',
        avatar: '',
        bloodType: 'O',
        height: 175,
        weight: 70,
        allergies: [],
        chronicDiseases: [],
        emergencyContact: {
          name: 'Nguyễn Thị Bình',
          relationship: 'Vợ',
          phone: '0907654321'
        },
        insuranceNumber: '',
        doctorInfo: {
          doctorId: 'bs004', // ID của bác sĩ trong collection doctors
          specialty: 'Tim mạch',
          licenseNumber: 'BS-12345',
          experience: 15,
          education: 'Đại học Trà Vinh',
          hospital: 'Bệnh viện Trường Đại học Trà Vinh',
          rating: 4.9,
          consultationFee: 200000,
          workingHours: [
            { day: 'Thứ 2', startTime: '08:00', endTime: '17:00' },
            { day: 'Thứ 3', startTime: '08:00', endTime: '17:00' },
            { day: 'Thứ 4', startTime: '08:00', endTime: '17:00' },
            { day: 'Thứ 5', startTime: '08:00', endTime: '17:00' },
            { day: 'Thứ 6', startTime: '08:00', endTime: '17:00' },
          ]
        }
      };

      console.log('🔐 Creating doctor account...');
      console.log('📧 Email:', doctorEmail);
      console.log('🔑 Password:', doctorPassword);

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        doctorEmail,
        doctorPassword
      );

      console.log('✅ Firebase Auth account created:', userCredential.user.uid);

      // Create Firestore user document
      const userData = {
        uid: userCredential.user.uid,
        email: doctorEmail,
        ...doctorData,
        createdAt: new Date().toISOString(),
      };

      await createDocument('users', userData);
      console.log('✅ Firestore user document created');

      Alert.alert(
        'Thành công!',
        `Tài khoản bác sĩ đã được tạo:\n\nEmail: ${doctorEmail}\nMật khẩu: ${doctorPassword}\n\nBạn có thể đăng nhập ngay bây giờ.`,
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.replace('/login')
          }
        ]
      );

      setCreating(false);
    } catch (error: any) {
      console.error('❌ Error creating doctor account:', error);
      
      let errorMessage = 'Không thể tạo tài khoản bác sĩ';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Tài khoản bác sĩ đã tồn tại.\n\nBạn có thể đăng nhập với:\nEmail: nguyenvanan@gmail.com\nMật khẩu: 123456';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu (cần ít nhất 6 ký tự)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ';
      }

      Alert.alert('Lỗi', errorMessage);
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo tài khoản bác sĩ</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={48} color="#00BCD4" />
            </View>
            <Text style={styles.title}>Tạo tài khoản bác sĩ test</Text>
            <Text style={styles.subtitle}>
              Tạo một tài khoản bác sĩ mẫu để test chức năng Doctor Dashboard
            </Text>
          </View>

          {/* Account Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Thông tin đăng nhập</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>nguyenvanan@gmail.com</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mật khẩu:</Text>
              <Text style={styles.detailValue}>123456</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Thông tin bác sĩ</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Họ tên:</Text>
              <Text style={styles.detailValue}>BS. Nguyễn Văn An</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chuyên khoa:</Text>
              <Text style={styles.detailValue}>Tim mạch</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kinh nghiệm:</Text>
              <Text style={styles.detailValue}>15 năm</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bệnh viện:</Text>
              <Text style={styles.detailValue}>Bệnh viện Trường Đại học Trà Vinh</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phí khám:</Text>
              <Text style={styles.detailValue}>200.000 đ</Text>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={24} color="#f59e0b" />
            <Text style={styles.warningText}>
              Tài khoản này chỉ dùng để test. Nếu email đã tồn tại, bạn có thể đăng nhập trực tiếp.
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={createDoctorTestAccount}
            disabled={creating}
          >
            {creating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.createButtonText}>Đang tạo...</Text>
              </>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Tạo tài khoản bác sĩ</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  createButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
});
