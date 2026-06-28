import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from './config/firebase';
import { createDocument } from './services/firebaseService';
import { scheduleAppointmentReminder } from './services/notificationService';

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

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const user = auth?.currentUser;
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash'); // 'cash', 'momo', 'banking', 'card'

  const handleConfirmBooking = async () => {
    try {
      if (!user) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt lịch');
        return;
      }

      setSubmitting(true);
      console.log('💾 [BOOKING-CONFIRMATION] Starting booking process...');
      console.log('💾 [BOOKING-CONFIRMATION] User ID:', user.uid);
      console.log('💾 [BOOKING-CONFIRMATION] Selected Date:', selectedDate);
      console.log('💾 [BOOKING-CONFIRMATION] Selected Time:', selectedTime);
      console.log('💾 [BOOKING-CONFIRMATION] Doctor:', selectedDoctor);
      console.log('💾 [BOOKING-CONFIRMATION] Doctor ID:', selectedDoctorId);
      console.log('💾 [BOOKING-CONFIRMATION] Doctor Fee:', doctorFee);

      // Validate required fields
      if (!selectedDate || !selectedTime || !selectedDoctor || !selectedDoctorId) {
        throw new Error('Thiếu thông tin bắt buộc: ngày, giờ, hoặc bác sĩ');
      }

      // Parse date from format "DD/MM/YYYY"
      const dateParts = selectedDate.split('/');
      console.log('📅 [BOOKING-CONFIRMATION] Date parts:', dateParts);
      
      if (dateParts.length !== 3) {
        throw new Error(`Định dạng ngày không hợp lệ: ${selectedDate}. Cần định dạng DD/MM/YYYY`);
      }

      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]);

      console.log('📅 [BOOKING-CONFIRMATION] Parsed values - Day:', day, 'Month:', month, 'Year:', year);

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error(`Giá trị ngày không hợp lệ: ngày=${day}, tháng=${month}, năm=${year}`);
      }

      if (day < 1 || day > 31) {
        throw new Error(`Ngày không hợp lệ: ${day}. Phải từ 1-31`);
      }

      if (month < 1 || month > 12) {
        throw new Error(`Tháng không hợp lệ: ${month}. Phải từ 1-12`);
      }

      if (year < 2020 || year > 2100) {
        throw new Error(`Năm không hợp lệ: ${year}. Phải từ 2020-2100`);
      }

      const appointmentDateObj = new Date(year, month - 1, day);
      
      if (isNaN(appointmentDateObj.getTime())) {
        throw new Error(`Không thể tạo ngày hợp lệ từ: ${day}/${month}/${year}`);
      }
      
      const appointmentDateISO = appointmentDateObj.toISOString();
      console.log('📅 [BOOKING-CONFIRMATION] Appointment date object:', appointmentDateObj);
      console.log('📅 [BOOKING-CONFIRMATION] Appointment date ISO:', appointmentDateISO);

      // Get day of week in Vietnamese
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayOfWeek = dayNames[appointmentDateObj.getDay()];
      console.log('📅 [BOOKING-CONFIRMATION] Day of week:', dayOfWeek);

      // Generate appointment code: DL + DDMMYY + HHMM + random 4 digits
      const now = new Date();
      const codeDay = String(now.getDate()).padStart(2, '0');
      const codeMonth = String(now.getMonth() + 1).padStart(2, '0');
      const codeYear = String(now.getFullYear()).slice(-2);
      const codeHours = String(now.getHours()).padStart(2, '0');
      const codeMinutes = String(now.getMinutes()).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const appointmentCode = `DL${codeDay}${codeMonth}${codeYear}${codeHours}${codeMinutes}${randomNum}`;
      console.log('🔢 [BOOKING-CONFIRMATION] Generated appointment code:', appointmentCode);
      
      // Generate check-in code: CI + random 8 digits
      const checkInCode = `CI${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
      console.log('🔢 [BOOKING-CONFIRMATION] Generated check-in code:', checkInCode);

      // Validate patient info
      if (!patientName || !patientPhone || !patientEmail) {
        throw new Error('Thiếu thông tin bệnh nhân: tên, số điện thoại, hoặc email');
      }

      console.log('👤 [BOOKING-CONFIRMATION] Patient info validated');
      console.log('👤 [BOOKING-CONFIRMATION] Patient name:', patientName);
      console.log('👤 [BOOKING-CONFIRMATION] Patient phone:', patientPhone);
      console.log('👤 [BOOKING-CONFIRMATION] Patient email:', patientEmail);

      const appointmentData = {
        userId: user.uid,
        doctorId: selectedDoctorId,
        doctor: selectedDoctor,
        specialty: selectedSpecialty,
        hospital: selectedHospital || 'Bệnh viện Trường Đại học Trà Vinh',
        consultationType: selectedConsultationType || 'in-person',
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
        patientAge: patientAge || '',
        patientGender: patientGender || '',
        patientAddress: patientAddress || '',
        patientNote: patientNote || '',
        patientInsuranceCode: patientInsuranceCode || '',
        fee: parseInt(doctorFee || '0') || 0,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cash' ? 'unpaid' : 'pending',
        appointmentType: selectedConsultationType === 'in-person' ? 'hospital' : 'online',
        status: 'pending',
        appointmentDate: appointmentDateISO,
        createdAt: new Date().toISOString(),
        appointmentCode: appointmentCode,
        checkInCode: checkInCode,
      };

      console.log('💾 [BOOKING-CONFIRMATION] Appointment data to save:');
      console.log(JSON.stringify(appointmentData, null, 2));
      console.log('💰 [BOOKING-CONFIRMATION] Doctor fee being saved:', appointmentData.fee);

      // Validate all required fields exist
      const requiredFields = ['userId', 'doctorId', 'doctor', 'specialty', 'fullDate', 'time', 'patientName', 'patientPhone', 'patientEmail'];
      const missingFields = requiredFields.filter(field => !appointmentData[field as keyof typeof appointmentData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }

      console.log('✅ [BOOKING-CONFIRMATION] All required fields validated');
      console.log('💾 [BOOKING-CONFIRMATION] Saving to Firebase...');

      const appointmentRef = await createDocument('appointments', appointmentData);
      
      if (!appointmentRef || !appointmentRef.id) {
        throw new Error('Không thể tạo lịch khám. Vui lòng thử lại');
      }
      
      console.log('✅ [BOOKING-CONFIRMATION] Appointment saved with ID:', appointmentRef.id);

      // Create notification
      try {
        const notificationData = {
          userId: user.uid,
          title: '⏳ Đặt lịch đang chờ xác nhận',
          body: `Lịch khám với ${selectedDoctor} vào ${selectedDate} lúc ${selectedTime} đang chờ bác sĩ xác nhận.`,
          type: 'appointment',
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            appointmentId: appointmentRef.id,
            doctorName: selectedDoctor,
            date: selectedDate,
            time: selectedTime,
          },
        };

        await createDocument('notifications', notificationData);
        console.log('✅ [BOOKING-CONFIRMATION] Notification created');
      } catch (notifError) {
        console.warn('⚠️ [BOOKING-CONFIRMATION] Failed to create notification:', notifError);
        // Don't throw error, notification is not critical
      }

      // Schedule reminder
      try {
        await scheduleAppointmentReminder({
          doctorName: selectedDoctor,
          appointmentDate: appointmentDateObj,
          hospital: selectedHospital || 'Bệnh viện Trường Đại học Trà Vinh',
        });
        console.log('✅ [BOOKING-CONFIRMATION] Appointment reminder scheduled');
      } catch (reminderError) {
        console.warn('⚠️ [BOOKING-CONFIRMATION] Failed to schedule reminder:', reminderError);
        // Don't throw error, reminder is not critical
      }

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
      console.error('❌ [BOOKING-CONFIRMATION] Error details:', error);
      
      let errorMessage = 'Không thể đặt lịch khám. Vui lòng thử lại.';
      
      if (error instanceof Error) {
        console.error('❌ [BOOKING-CONFIRMATION] Error message:', error.message);
        console.error('❌ [BOOKING-CONFIRMATION] Error stack:', error.stack);
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi đặt lịch', errorMessage, [
        {
          text: 'Đóng',
          onPress: () => console.log('Error alert closed')
        }
      ]);
      
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

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'cash' && styles.paymentMethodCardActive
            ]}
            onPress={() => setSelectedPaymentMethod('cash')}
          >
            <View style={styles.paymentMethodIcon}>
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color={selectedPaymentMethod === 'cash' ? '#00BCD4' : '#666'} 
              />
            </View>
            <View style={styles.paymentMethodContent}>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'cash' && styles.paymentMethodTitleActive
              ]}>
                Tiền mặt
              </Text>
              <Text style={styles.paymentMethodDesc}>
                Thanh toán trực tiếp tại bệnh viện
              </Text>
            </View>
            {selectedPaymentMethod === 'cash' && (
              <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'momo' && styles.paymentMethodCardActive
            ]}
            onPress={() => setSelectedPaymentMethod('momo')}
          >
            <View style={styles.paymentMethodIcon}>
              <Ionicons 
                name="wallet-outline" 
                size={24} 
                color={selectedPaymentMethod === 'momo' ? '#00BCD4' : '#666'} 
              />
            </View>
            <View style={styles.paymentMethodContent}>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'momo' && styles.paymentMethodTitleActive
              ]}>
                Ví MoMo
              </Text>
              <Text style={styles.paymentMethodDesc}>
                Thanh toán qua ví điện tử MoMo
              </Text>
            </View>
            {selectedPaymentMethod === 'momo' && (
              <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'banking' && styles.paymentMethodCardActive
            ]}
            onPress={() => setSelectedPaymentMethod('banking')}
          >
            <View style={styles.paymentMethodIcon}>
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={selectedPaymentMethod === 'banking' ? '#00BCD4' : '#666'} 
              />
            </View>
            <View style={styles.paymentMethodContent}>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'banking' && styles.paymentMethodTitleActive
              ]}>
                Chuyển khoản ngân hàng
              </Text>
              <Text style={styles.paymentMethodDesc}>
                Chuyển khoản qua Internet Banking
              </Text>
            </View>
            {selectedPaymentMethod === 'banking' && (
              <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === 'card' && styles.paymentMethodCardActive
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <View style={styles.paymentMethodIcon}>
              <Ionicons 
                name="card" 
                size={24} 
                color={selectedPaymentMethod === 'card' ? '#00BCD4' : '#666'} 
              />
            </View>
            <View style={styles.paymentMethodContent}>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'card' && styles.paymentMethodTitleActive
              ]}>
                Thẻ tín dụng/ghi nợ
              </Text>
              <Text style={styles.paymentMethodDesc}>
                Thanh toán bằng thẻ Visa, Mastercard
              </Text>
            </View>
            {selectedPaymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
            )}
          </TouchableOpacity>
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
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.confirmButtonText}>Đang xử lý...</Text>
            </>
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Xác nhận đặt lịch</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
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
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentMethodCardActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  paymentMethodTitleActive: {
    color: '#00BCD4',
  },
  paymentMethodDesc: {
    fontSize: 13,
    color: '#666',
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
