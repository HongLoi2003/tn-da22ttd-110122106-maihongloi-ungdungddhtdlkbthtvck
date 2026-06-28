import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentById, getDocumentsWithQuery, updateDocument } from './services/firebaseService';
import { getImageSource } from './utils/imageHelper';

// Helper để get avatar - fallback về URL hoặc require local
function getDoctorAvatarSmart(doctorName: string, imageUrl?: string) {
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return { uri: imageUrl };
  }
  return getImageSource('logo.png', 'common');
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function RescheduleAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    loadAppointment();
  }, [params.id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      if (params.id) {
        const data: any = await getDocumentById('appointments', params.id as string);
        if (data) {
          setAppointment(data);
          setSelectedDate(data.date || '');
          setSelectedTime(data.time || '');
          setSelectedDoctorId(data.doctorId || '');
        }
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lịch khám');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDoctors = async () => {
    try {
      const doctors = await getDocumentsWithQuery('doctors', [
        where('specialty', '==', appointment.specialty)
      ]);
      setAvailableDoctors(doctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  useEffect(() => {
    if (appointment?.specialty) {
      loadAvailableDoctors();
    }
  }, [appointment]);

  const canReschedule = () => {
    if (!appointment) return false;
    
    // Kiểm tra trạng thái
    if (appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'rescheduled') {
      return false;
    }

    // Cho phép đổi lịch bất kỳ lúc nào (nếu chưa hoàn tất/hủy/đổi)
    return true;
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày và giờ khám mới');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do đổi lịch');
      return;
    }

    Alert.alert(
      'Xác nhận đổi lịch',
      'Bạn có chắc chắn muốn đổi lịch khám này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              // Tạo ngày giờ mới
              const [day, month, year] = selectedDate.split('/');
              const [hour, minute] = selectedTime.split(':');
              
              // Validate date parts
              const dayNum = parseInt(day);
              const monthNum = parseInt(month);
              const yearNum = parseInt(year);
              const hourNum = parseInt(hour);
              const minuteNum = parseInt(minute);
              
              if (!dayNum || !monthNum || !yearNum || hourNum === undefined || minuteNum === undefined) {
                Alert.alert('Lỗi', 'Vui lòng nhập đúng định dạng ngày (DD/MM/YYYY) và giờ');
                setSubmitting(false);
                return;
              }
              
              const newAppointmentDate = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);

              // Lấy thông tin bác sĩ mới nếu đổi bác sĩ
              let doctorInfo = {
                doctor: appointment.doctor,
                doctorId: appointment.doctorId,
                image: appointment.image,
              };

              if (selectedDoctorId && selectedDoctorId !== appointment.doctorId) {
                const newDoctor = availableDoctors.find(d => d.id === selectedDoctorId);
                if (newDoctor) {
                  doctorInfo = {
                    doctor: newDoctor.name,
                    doctorId: newDoctor.id,
                    image: newDoctor.image,
                  };
                }
              }

              await updateDocument('appointments', params.id as string, {
                ...doctorInfo,
                date: selectedDate,
                time: selectedTime,
                fullDate: selectedDate, // Cập nhật fullDate để hiển thị đúng
                appointmentDate: newAppointmentDate.toISOString(),
                status: 'rescheduled',
                rescheduleReason: reason,
                rescheduledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });

              Alert.alert('Thành công', 'Đã đổi lịch khám thành công', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error('Error rescheduling appointment:', error);
              Alert.alert('Lỗi', 'Không thể đổi lịch khám');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#cbd5e1" />
        <Text style={styles.errorText}>Không tìm thấy thông tin lịch khám</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!canReschedule()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi lịch khám</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="time-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Không thể đổi lịch</Text>
          <Text style={styles.errorText}>
            {appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'rescheduled'
              ? 'Lịch khám đã hoàn tất, đã hủy hoặc đã đổi lịch'
              : 'Chỉ có thể đổi lịch trước ít nhất 2 giờ'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const doctorImage = getDoctorAvatarSmart(appointment.doctor, appointment.image || appointment.hinh_anh);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi lịch khám</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Appointment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch khám hiện tại</Text>
          <View style={styles.currentCard}>
            <View style={styles.doctorRow}>
              <Image source={doctorImage} style={styles.doctorAvatar} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{appointment.doctor}</Text>
                <Text style={styles.specialty}>{appointment.specialty}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>{appointment.date} - {appointment.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>{appointment.hospital}</Text>
            </View>
          </View>
        </View>

        {/* New Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày mới</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
        </View>

        {/* New Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn giờ mới</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Change Doctor (Optional) */}
        {availableDoctors.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đổi bác sĩ (tùy chọn)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.doctorList}>
                {availableDoctors.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={[
                      styles.doctorCard,
                      selectedDoctorId === doctor.id && styles.doctorCardSelected,
                    ]}
                    onPress={() => setSelectedDoctorId(doctor.id)}
                  >
                    <Image
                      source={getDoctorAvatarSmart(doctor.name, doctor.image)}
                      style={styles.doctorCardImage}
                    />
                    <Text style={styles.doctorCardName} numberOfLines={1}>
                      {doctor.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lý do đổi lịch *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Nhập lý do đổi lịch..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color="#00BCD4" />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Lưu ý khi đổi lịch:</Text>
            <Text style={styles.noteText}>• Không hoàn tiền khi đổi lịch</Text>
            <Text style={styles.noteText}>• Số tiền đã thanh toán sẽ được giữ nguyên</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedTime || !reason.trim() || submitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleReschedule}
          disabled={!selectedDate || !selectedTime || !reason.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Xác nhận đổi lịch</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  currentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: '#64748b',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 70,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  doctorList: {
    flexDirection: 'row',
    gap: 12,
  },
  doctorCard: {
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  doctorCardSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  doctorCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  doctorCardName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#00BCD4',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
