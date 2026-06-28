import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { sendAppointmentConfirmation } from './services/emailService';
import { createDocument } from './services/firebaseService';
import notificationService from './services/notificationService';

const doctorImages = {
  'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
  'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
  'lehoangnam.png': { uri: 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg' },
  'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
  'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
  'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
  'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
  'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
  'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
  'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
  'phamthuha.png': { uri: 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg' },
  'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
  'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
  'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
  'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
  'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
};

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const appointmentCode = params.appointmentCode as string;
  const checkInCode = params.checkInCode as string;
  const selectedSpecialty = params.specialty as string;
  const selectedDoctor = params.doctor as string;
  const selectedDoctorImage = params.doctorImage as string;
  const selectedDate = params.date as string;
  const selectedTime = params.time as string;
  const selectedHospital = params.hospital as string;
  const patientName = params.patientName as string;
  const patientPhone = params.patientPhone as string;
  const patientEmail = params.patientEmail as string;
  const patientAge = params.patientAge as string;
  const patientGender = params.patientGender as string;
  const patientAddress = params.patientAddress as string;
  const patientInsuranceCode = params.patientInsuranceCode as string;

  useEffect(() => {
    // Send notifications when booking is successful
    sendBookingNotifications();
  }, []);

  const sendBookingNotifications = async () => {
    if (!user?.uid) return;

    console.log('🚀 [BOOKING] sendBookingNotifications called');
    console.log('📧 [BOOKING] patientEmail value:', patientEmail);
    console.log('📧 [BOOKING] patientEmail type:', typeof patientEmail);
    console.log('📧 [BOOKING] patientEmail truthy?', !!patientEmail);

    try {
      const appointmentDateTime = `${selectedDate} lúc ${selectedTime}`;
      
      // 1. Send local notification
      await notificationService.notifyNewAppointment(selectedDoctor, appointmentDateTime);

      // 2. Create notification in Firestore
      await createDocument('notifications', {
        userId: user.uid,
        title: '✅ Đặt lịch thành công',
        body: `Lịch khám với ${selectedDoctor} vào ${appointmentDateTime} đã được xác nhận.`,
        type: 'appointment',
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          appointmentCode,
          checkInCode,
          doctor: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
          hospital: selectedHospital,
        },
      });

      // 3. Send email confirmation
      if (patientEmail) {
        try {
          console.log('📧 Sending appointment email to:', patientEmail);
          const emailSent = await sendAppointmentConfirmation(patientEmail, {
            doctorName: selectedDoctor,
            date: selectedDate,
            time: selectedTime,
            specialty: selectedSpecialty,
            hospital: selectedHospital,
            patientName: patientName,
            appointmentCode: appointmentCode,
            checkInCode: checkInCode,
          });

          if (emailSent) {
            console.log('✅ Appointment confirmation email sent successfully');
          } else {
            console.warn('⚠️ Failed to send appointment email');
          }
        } catch (emailError) {
          console.error('❌ Error sending appointment email:', emailError);
        }
      }

      // 3. Schedule reminder notifications (only if appointment is in the future)
      try {
        // Parse date and time to create Date object
        const [day, month, year] = selectedDate.split('/');
        const [hours, minutes] = selectedTime.split(':');
        const appointmentDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );

        // Only schedule if appointment is in the future
        if (appointmentDate > new Date()) {
          // Schedule reminder 1 day before
          const reminderDate1Day = new Date(appointmentDate);
          reminderDate1Day.setDate(reminderDate1Day.getDate() - 1);
          reminderDate1Day.setHours(9, 0, 0, 0);

          if (reminderDate1Day > new Date()) {
            await notificationService.scheduleAppointmentReminder(
              appointmentDate,
              selectedDoctor,
              selectedTime
            );
          }

          // Schedule reminder 1 hour before
          const reminderDate1Hour = new Date(appointmentDate);
          reminderDate1Hour.setHours(reminderDate1Hour.getHours() - 1);

          if (reminderDate1Hour > new Date()) {
            await notificationService.scheduleAppointmentReminderOneHour(
              appointmentDate,
              selectedDoctor
            );
          }
        }
      } catch (scheduleError) {
        // Don't throw error if scheduling fails, just log it
        console.warn('Could not schedule reminders:', scheduleError);
      }

      console.log('✅ All booking notifications sent successfully');
    } catch (error) {
      console.error('Error sending booking notifications:', error);
      // Don't throw error to prevent UI from showing error to user
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Ionicons name="time" size={80} color="#FF9800" />
          </View>
          <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
          <Text style={styles.successSubtitle}>
            Lịch khám đang chờ bác sĩ xác nhận
          </Text>
        </View>

        {/* Appointment Code */}
        <View style={styles.section}>
          <View style={styles.codeCard}>
            <View style={styles.codeHeader}>
              <Ionicons name="document-text" size={20} color="#00BCD4" />
              <Text style={styles.codeTitle}>Mã đặt lịch</Text>
            </View>
            <Text style={styles.codeValue}>{appointmentCode}</Text>
            <Text style={styles.codeNote}>Vui lòng lưu mã này để tra cứu lịch khám</Text>
          </View>

          <View style={styles.codeCard}>
            <View style={styles.codeHeader}>
              <Ionicons name="qr-code" size={20} color="#00BCD4" />
              <Text style={styles.codeTitle}>Mã check-in</Text>
            </View>
            <Text style={styles.codeValue}>{checkInCode}</Text>
            <Text style={styles.codeNote}>Xuất trình mã này khi đến bệnh viện</Text>
          </View>
        </View>

        {/* Doctor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bác sĩ</Text>
          <View style={styles.doctorCard}>
            <Image
              source={doctorImages[selectedDoctorImage as keyof typeof doctorImages]}
              style={styles.doctorAvatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{selectedDoctor}</Text>
              <Text style={styles.doctorSpecialty}>{selectedSpecialty}</Text>
              <View style={styles.doctorMeta}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.doctorRating}>4.8 (120 đánh giá)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch khám</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày khám</Text>
              <Text style={styles.infoValue}>{selectedDate}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giờ khám</Text>
              <Text style={styles.infoValue}>{selectedTime}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Địa điểm</Text>
              <Text style={styles.infoValue}>{selectedHospital}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="home-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phòng khám</Text>
              <Text style={styles.infoValue}>Phòng 204 - Tầng 2</Text>
            </View>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{patientName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{patientPhone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{patientEmail}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tuổi</Text>
              <Text style={styles.infoValue}>{patientAge} tuổi</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>{patientGender}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nơi ở</Text>
              <Text style={styles.infoValue}>{patientAddress}</Text>
            </View>
          </View>

          {patientInsuranceCode && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="card-outline" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mã số BHYT</Text>
                <Text style={styles.infoValue}>{patientInsuranceCode}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Important Notes */}
        <View style={styles.section}>
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="information-circle" size={24} color="#FF9800" />
              <Text style={styles.noteTitle}>Lưu ý quan trọng</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Vui lòng đến trước giờ hẹn 15 phút</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Xuất trình mã check-in tại quầy lễ tân</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Liên hệ hotline: 1900 xxxx nếu cần hỗ trợ</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/appointments')}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Xem lịch khám của tôi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <Ionicons name="add-circle" size={20} color="#00BCD4" />
            <Text style={styles.secondaryButtonText}>Đặt lịch mới</Text>
          </TouchableOpacity>
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
  successHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  codeCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#80DEEA',
    borderStyle: 'dashed',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  codeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00838F',
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  codeNote: {
    fontSize: 11,
    color: '#00838F',
    textAlign: 'center',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    marginBottom: 6,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorRating: {
    fontSize: 12,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 32,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
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
  noteCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F57F17',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteBullet: {
    fontSize: 14,
    color: '#F57F17',
    marginRight: 8,
    fontWeight: '700',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#F57F17',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
});
