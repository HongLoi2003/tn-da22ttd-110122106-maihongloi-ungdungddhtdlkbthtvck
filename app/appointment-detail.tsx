import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { getDocumentById, updateDocument } from './services/firebaseService';

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

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [params.id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      if (params.id) {
        const data = await getDocumentById('appointments', params.id as string);
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lịch khám');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Hủy lịch khám',
      'Bạn có chắc chắn muốn hủy lịch khám này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDocument('appointments', params.id as string, {
                status: 'cancelled',
                updatedAt: new Date().toISOString(),
              });
              Alert.alert('Thành công', 'Đã hủy lịch khám');
              router.back();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Lỗi', 'Không thể hủy lịch khám');
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    router.push(`/reschedule-appointment?id=${params.id}`);
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

  const doctorImage = appointment.image && doctorImages[appointment.image as keyof typeof doctorImages]
    ? doctorImages[appointment.image as keyof typeof doctorImages]
    : require('@/assets/images/logo.png');

  const getStatusColor = (status: string) => {
    if (status === 'confirmed') return '#06D6A0';
    if (status === 'pending') return '#FFB800';
    if (status === 'cancelled') return '#EF4444';
    if (status === 'rescheduled') return '#8B5CF6';
    return '#94a3b8';
  };

  const getStatusText = (status: string) => {
    if (status === 'confirmed') return 'Đã xác nhận';
    if (status === 'pending') return 'Chờ xác nhận';
    if (status === 'cancelled') return 'Đã hủy';
    if (status === 'rescheduled') return 'Đã đổi lịch';
    return 'Hoàn thành';
  };

  const isUpcoming = appointment.status !== 'cancelled' && appointment.status !== 'completed';

  const canCancelOrReschedule = () => {
    if (!appointment) return false;
    
    // Không cho phép nếu đã hoàn tất, đã hủy, hoặc đã đổi lịch
    if (appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'rescheduled') {
      return false;
    }

    // Cho phép hủy/đổi lịch bất kỳ lúc nào (nếu chưa hoàn tất/hủy/đổi)
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lịch khám</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <Image source={doctorImage} style={styles.doctorImage} />
          <Text style={styles.doctorName}>{appointment.doctor}</Text>
          <Text style={styles.specialty}>{appointment.specialty}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch khám</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày khám</Text>
                <Text style={styles.infoValue}>{appointment.date}, {appointment.fullDate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Giờ khám</Text>
                <Text style={styles.infoValue}>{appointment.time} ({appointment.duration})</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoValue}>{appointment.hospital}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="business-outline" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phòng khám</Text>
                <Text style={styles.infoValue}>{appointment.room} - {appointment.floor}</Text>
              </View>
            </View>

            {appointment.bookingType && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="medkit-outline" size={20} color="#00BCD4" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Hình thức</Text>
                    <Text style={styles.infoValue}>
                      {appointment.bookingType === 'offline' ? 'Khám trực tiếp' : 'Tư vấn trực tuyến'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Reason */}
        {appointment.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lý do khám</Text>
            <View style={styles.reasonCard}>
              <Text style={styles.reasonText}>{appointment.reason}</Text>
            </View>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí khám</Text>
              <Text style={styles.paymentValue}>{appointment.fee || '200.000đ'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabelTotal}>Tổng cộng</Text>
              <Text style={styles.paymentValueTotal}>{appointment.fee || '200.000đ'}</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color="#00BCD4" />
          <Text style={styles.noteText}>
            Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục khám bệnh
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {isUpcoming && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.cancelButton, !canCancelOrReschedule() && styles.buttonDisabled]}
            onPress={handleCancelAppointment}
            disabled={!canCancelOrReschedule()}
          >
            <Text style={[styles.cancelButtonText, !canCancelOrReschedule() && styles.buttonDisabledText]}>Hủy lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rescheduleButton, !canCancelOrReschedule() && styles.buttonDisabled]}
            onPress={handleReschedule}
            disabled={!canCancelOrReschedule()}
          >
            <Text style={[styles.rescheduleButtonText, !canCancelOrReschedule() && styles.buttonDisabledText]}>Đổi lịch</Text>
          </TouchableOpacity>
        </View>
      )}
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
  doctorCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  reasonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  reasonText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  paymentLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  paymentValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00BCD4',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    marginHorizontal: 16,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    lineHeight: 18,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonDisabledText: {
    color: '#cbd5e1',
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
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
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
