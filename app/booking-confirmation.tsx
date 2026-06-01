import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument } from './services/firebaseService';
import { scheduleAppointmentReminder } from './services/notificationService';

const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'tranthimai.png': require('@/assets/images/tranthimai.png'),
  'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
  'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
  'vuthilan.png': require('@/assets/images/vuthilan.png'),
  'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
  'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.png'),
  'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
  'phamminhquan.png': require('@/assets/images/phamminhquan.png'),
  'lethihang.png': require('@/assets/images/lethihang.png'),
  'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png'),
  'dangthithao.jpg': require('@/assets/images/dangthithao.jpg'),
};

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const selectedSpecialty = params.specialty as string;
  const selectedDoctor = params.doctor as string;
  const selectedDoctorId = params.doctorId as string;
  const selectedDoctorImage = params.doctorImage as string;
  const selectedDate = params.date as string;
  const selectedTime = params.time as string;
  const selectedHospital = params.hospital as string;
  const selectedConsultationType = params.consultationType as string;
  const doctorFee = params.doctorFee as string;
  const patientName = params.patientName as string;
  const patientPhone = params.patientPhone as string;
  const patientEmail = params.patientEmail as string;
  const patientAge = params.patientAge as string;
  const patientGender = params.patientGender as string;
  const patientAddress = params.patientAddress as string;
  const patientNote = params.patientNote as string;
  const patientInsuranceCode = params.patientInsuranceCode as string;
  
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    try {
      if (!user) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt lịch');
        return;
      }

      setSubmitting(true);
      console.log('💾 [BOOKING] Saving appointment to Firebase...');

      // Parse date from format "DD/MM/YYYY"
      const dateParts = selectedDate.split('/');
      if (dateParts.length !== 3) {
        throw new Error(`Invalid date format: ${selectedDate}`);
      }

      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error(`Invalid date values: day=${day}, month=${month}, year=${year}`);
      }

      const appointmentDateObj = new Date(year, month - 1, day);
      const appointmentDateISO = appointmentDateObj.toISOString();

      // Get day of week in Vietnamese
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayOfWeek = dayNames[appointmentDateObj.getDay()];

      // Generate appointment code: DL + DDMMYY + HHMM + random 4 digits
      const now = new Date();
      const codeDay = String(now.getDate()).padStart(2, '0');
      const codeMonth = String(now.getMonth() + 1).padStart(2, '0');
      const codeYear = String(now.getFullYear()).slice(-2);
      const codeHours = String(now.getHours()).padStart(2, '0');
      const codeMinutes = String(now.getMinutes()).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const appointmentCode = `DL${codeDay}${codeMonth}${codeYear}${codeHours}${codeMinutes}${randomNum}`;
      
      // Generate check-in code: CI + random 8 digits
      const checkInCode = `CI${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;

      const appointmentData = {
        userId: user.uid,
        doctorId: selectedDoctorId,
        doctor: selectedDoctor,
        specialty: selectedSpecialty,
        hospital: selectedHospital,
        consultationType: selectedConsultationType,
        date: dayOfWeek,
        fullDate: selectedDate,
        time: selectedTime,
        duration: '30 phút',
        room: selectedConsultationType === 'in-person' ? 'Phòng 204' : 'Video Call',
        floor: selectedConsultationType === 'in-person' ? 'Tầng 2' : 'Online',
        image: selectedDoctorImage,
        patientName: patientName,
        patientPhone: patientPhone,
        patientEmail: patientEmail,
        patientAge: patientAge,
        patientGender: patientGender,
        patientAddress: patientAddress,
        patientNote: patientNote || '',
        patientInsuranceCode: patientInsuranceCode || '',
        fee: parseInt(doctorFee) || 0,
        appointmentType: selectedConsultationType === 'in-person' ? 'hospital' : 'online',
        status: 'pending',
        appointmentDate: appointmentDateISO,
        createdAt: new Date().toISOString(),
        appointmentCode: appointmentCode,
        checkInCode: checkInCode,
      };

      console.log('💾 [BOOKING] Appointment data:', appointmentData);
      console.log('💰 [BOOKING] Doctor fee being saved:', appointmentData.fee);

      const appointmentRef = await createDocument('appointments', appointmentData);
      console.log('✅ [BOOKING] Appointment saved with ID:', appointmentRef?.id);

      // Create notification
      const notificationData = {
        userId: user.uid,
        title: '⏳ Đặt lịch đang chờ xác nhận',
        body: `Lịch khám với ${selectedDoctor} vào ${selectedDate} lúc ${selectedTime} đang chờ bác sĩ xác nhận.`,
        type: 'appointment',
        read: false,
        data: {
          appointmentId: appointmentRef?.id,
          doctorName: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
        },
      };

      await createDocument('notifications', notificationData);
      console.log('✅ [BOOKING] Notification created');

      // Schedule reminder
      await scheduleAppointmentReminder({
        doctorName: selectedDoctor,
        appointmentDate: appointmentDateObj,
        hospital: selectedHospital,
      });

      console.log('✅ [BOOKING] Appointment reminder scheduled');

      setSubmitting(false);

      // Navigate to success screen with all data
      router.replace({
        pathname: '/booking-success',
        params: {
          appointmentCode: appointmentCode,
          checkInCode: checkInCode,
          specialty: selectedSpecialty,
          doctor: selectedDoctor,
          doctorImage: selectedDoctorImage,
          date: selectedDate,
          time: selectedTime,
          hospital: selectedHospital,
          patientName: patientName,
          patientPhone: patientPhone,
          patientEmail: patientEmail,
          patientAge: patientAge,
          patientGender: patientGender,
          patientAddress: patientAddress,
          patientInsuranceCode: patientInsuranceCode,
        }
      });

    } catch (error) {
      console.error('❌ [BOOKING] Error saving appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu lịch khám';
      Alert.alert('Lỗi', errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận đặt lịch</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Doctor Info */}
        <View style={styles.section}>
          <View style={styles.doctorCard}>
            <Image
              source={doctorImages[selectedDoctorImage as keyof typeof doctorImages]}
              style={styles.doctorAvatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{selectedDoctor}</Text>
              <Text style={styles.doctorSpecialty}>{selectedSpecialty}</Text>
            </View>
          </View>
        </View>

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch khám</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày khám</Text>
              <Text style={styles.infoValue}>{selectedDate}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giờ khám</Text>
              <Text style={styles.infoValue}>{selectedTime}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Địa điểm</Text>
              <Text style={styles.infoValue}>{selectedHospital || 'Bệnh viện Trường Đại học Trà Vinh'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phí khám</Text>
              <Text style={[styles.infoValue, { color: '#00BCD4', fontWeight: '700' }]}>
                {parseInt(doctorFee || '0').toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{patientName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{patientPhone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{patientEmail}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tuổi</Text>
              <Text style={styles.infoValue}>{patientAge} tuổi</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>{patientGender}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#00BCD4" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nơi ở</Text>
              <Text style={styles.infoValue}>{patientAddress}</Text>
            </View>
          </View>

          {patientInsuranceCode && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mã số BHYT</Text>
                <Text style={styles.infoValue}>{patientInsuranceCode}</Text>
              </View>
            </View>
          )}

          {patientNote && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ghi chú</Text>
                <Text style={styles.infoValue}>{patientNote}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={submitting}
        >
          <Text style={styles.confirmButtonText}>
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
          </Text>
          {!submitting && <Ionicons name="checkmark" size={20} color="#fff" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.confirmButton, styles.backButton]} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#00BCD4" />
          <Text style={[styles.confirmButtonText, styles.backButtonText]}>Quay lại</Text>
        </TouchableOpacity>
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
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  backButtonText: {
    color: '#00BCD4',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
