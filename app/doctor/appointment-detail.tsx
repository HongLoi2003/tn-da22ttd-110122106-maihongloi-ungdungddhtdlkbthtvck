import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import doctorServiceInstance, { DoctorAppointment } from '../services/doctorService';

export default function DoctorAppointmentDetail() {
  const router = useRouter();
  const { userData } = useAuth();
  const params = useLocalSearchParams();
  const appointmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [appointment, setAppointment] = useState<DoctorAppointment | null>(null);
  const [patientData, setPatientData] = useState<any>(null); // Thêm state cho thông tin bệnh nhân
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      if (!userData?.uid || !appointmentId) {
        console.log('❌ Missing userData or appointmentId');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading appointment detail for ID:', appointmentId);

      // ✅ Separate IDs for different purposes
      const firebaseAuthUid = userData.uid;
      const displayDoctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;
      console.log('🔑 Firebase Auth UID:', firebaseAuthUid);
      console.log('📝 Display Doctor ID:', displayDoctorId);

      const appointments = await doctorServiceInstance.getDoctorAppointments(displayDoctorId);
      console.log('✅ Loaded', appointments.length, 'appointments');
      
      const found = appointments.find(apt => apt.id === appointmentId);
      
      if (found) {
        console.log('✅ Found appointment:', found);
        console.log('💰 [APPOINTMENT_DETAIL] Fee value:', found.fee);
        console.log('💰 [APPOINTMENT_DETAIL] Fee type:', typeof found.fee);
        setAppointment(found);

        // Load patient data from users collection
        if (found.userId) {
          const { getDocumentsWithQuery, getDocumentById } = await import('../services/firebaseService');
          const { where } = await import('firebase/firestore');
          
          try {
            // Try by document ID first
            let userData = await getDocumentById('users', found.userId);
            
            // If not found, try by uid field
            if (!userData) {
              const users = await getDocumentsWithQuery('users', [
                where('uid', '==', found.userId)
              ]);
              if (users.length > 0) {
                userData = users[0];
              }
            }
            
            if (userData) {
              console.log('✅ Loaded patient data:', userData);
              setPatientData(userData);
            }
          } catch (error) {
            console.error('❌ Error loading patient data:', error);
          }
        }
      } else {
        console.log('❌ Appointment not found with ID:', appointmentId);
        console.log('Available appointment IDs:', appointments.map(a => a.id));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading appointment:', error);
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    
    try {
      // Support multiple date formats: DD/MM/YYYY, YYYY-MM-DD, ISO
      let birthDate: Date;
      
      if (dateOfBirth.includes('/')) {
        // DD/MM/YYYY format
        const parts = dateOfBirth.split('/');
        if (parts.length === 3) {
          birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          return null;
        }
      } else {
        // ISO or YYYY-MM-DD format
        birthDate = new Date(dateOfBirth);
      }
      
      if (isNaN(birthDate.getTime())) {
        return null;
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age > 0 ? age : null;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  const handleUpdateStatus = async (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled') => {
    if (!appointment) return;

    const statusMessages = {
      pending: { title: '⏳ Chờ xác nhận', message: 'Lịch khám đã được chuyển về trạng thái chờ xác nhận.' },
      confirmed: { title: '✅ Xác nhận thành công', message: 'Lịch khám đã được xác nhận. Bệnh nhân sẽ nhận được thông báo.' },
      completed: { title: '✅ Hoàn thành', message: 'Lịch khám đã được đánh dấu hoàn thành.' },
      cancelled: { title: '❌ Đã hủy', message: 'Lịch khám đã được hủy thành công.' },
      rescheduled: { title: '📅 Đã dời lịch', message: 'Lịch khám đã được dời sang thời gian mới.' }
    };

    try {
      setUpdating(true);
      await doctorServiceInstance.updateAppointmentStatus(appointment.id, newStatus);
      console.log(`✅ Đã cập nhật trạng thái: ${newStatus}`);
      
      await loadAppointment();
      setUpdating(false);
      
      const statusMsg = statusMessages[newStatus];
      Alert.alert(
        statusMsg.title,
        statusMsg.message,
        [{ text: 'Đóng' }]
      );
    } catch (error: any) {
      console.error('❌ Error updating status:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật trạng thái lịch khám.';
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        errorMessage = 'Không có quyền cập nhật lịch khám. Vui lòng kiểm tra quyền truy cập Firestore.';
      }
      
      Alert.alert(
        '❌ Lỗi cập nhật',
        errorMessage,
        [{ text: 'Đóng', style: 'cancel' }]
      );
      
      setUpdating(false);
    }
  };

  const handleReschedule = async () => {
    if (!appointment || !newDate || !newTime) {
      Alert.alert(
        '⚠️ Thiếu thông tin',
        'Vui lòng nhập đầy đủ ngày và giờ khám mới.',
        [{ text: 'Đóng' }]
      );
      return;
    }

    try {
      setUpdating(true);
      await doctorServiceInstance.rescheduleAppointment(
        appointment.id,
        newDate,
        newTime,
        rescheduleReason || 'Bác sĩ đổi lịch'
      );
      console.log('✅ Đã cập nhật lịch khám');
      
      setShowRescheduleModal(false);
      await loadAppointment();
      setUpdating(false);
      
      Alert.alert(
        '✅ Đổi lịch thành công',
        `Lịch khám đã được dời sang ${newDate} lúc ${newTime}. Bệnh nhân sẽ nhận được thông báo.`,
        [{ text: 'Đóng' }]
      );
    } catch (error: any) {
      console.error('❌ Error rescheduling:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đổi lịch khám.';
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        errorMessage = 'Không có quyền đổi lịch khám. Vui lòng kiểm tra quyền truy cập Firestore.';
      }
      
      Alert.alert(
        '❌ Lỗi đổi lịch',
        errorMessage,
        [{ text: 'Đóng', style: 'cancel' }]
      );
      setUpdating(false);
    }
  };

  const openRescheduleModal = () => {
    if (appointment) {
      setNewDate(appointment.fullDate);
      setNewTime(appointment.time);
      setRescheduleReason('');
      setShowRescheduleModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#4caf50';
      case 'completed': return '#9c27b0';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết lịch khám</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>Không tìm thấy lịch khám</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lịch khám</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(appointment.status) + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
          <Text style={[styles.statusLabel, { color: getStatusColor(appointment.status) }]}>
            {getStatusText(appointment.status)}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
            {appointment.userId && (
              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => router.push(`/doctor/patient-detail?id=${appointment.userId}`)}
              >
                <Text style={styles.viewProfileText}>Xem hồ sơ</Text>
                <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ tên</Text>
                <Text style={styles.infoValue}>{appointment.patientName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{appointment.patientPhone}</Text>
              </View>
            </View>
            {appointment.patientEmail && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color="#00BCD4" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{appointment.patientEmail}</Text>
                  </View>
                </View>
              </>
            )}
            {appointment.patientAge && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color="#00BCD4" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Tuổi</Text>
                    <Text style={styles.infoValue}>
                      {(() => {
                        // Tính tuổi từ dateOfBirth trong patientData nếu có
                        if (patientData?.dateOfBirth) {
                          const age = calculateAge(patientData.dateOfBirth);
                          return age !== null ? `${age} tuổi` : `${appointment.patientAge} tuổi`;
                        }
                        return `${appointment.patientAge} tuổi`;
                      })()}
                    </Text>
                  </View>
                </View>
              </>
            )}
            {appointment.patientGender && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons 
                    name={appointment.patientGender === 'Nam' ? 'male' : appointment.patientGender === 'Nữ' ? 'female' : 'transgender'} 
                    size={20} 
                    color="#00BCD4" 
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Giới tính</Text>
                    <Text style={styles.infoValue}>{appointment.patientGender}</Text>
                  </View>
                </View>
              </>
            )}
            {appointment.patientAddress && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#00BCD4" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Nơi ở</Text>
                    <Text style={styles.infoValue}>{appointment.patientAddress}</Text>
                  </View>
                </View>
              </>
            )}
            {appointment.patientInsuranceCode && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="card" size={20} color="#00BCD4" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Mã số BHYT</Text>
                    <Text style={styles.infoValue}>{appointment.patientInsuranceCode}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch khám</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày khám</Text>
                <Text style={styles.infoValue}>{appointment.date}, {appointment.fullDate}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Giờ khám</Text>
                <Text style={styles.infoValue}>{appointment.time} ({appointment.duration})</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="medical" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Chuyên khoa</Text>
                <Text style={styles.infoValue}>{appointment.specialty}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoValue}>{appointment.hospital}</Text>
                <Text style={styles.infoSubValue}>{appointment.room} - {appointment.floor}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons 
                name={appointment.appointmentType === 'hospital' ? 'business' : 'videocam'} 
                size={20} 
                color="#00BCD4" 
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hình thức</Text>
                <Text style={styles.infoValue}>
                  {appointment.appointmentType === 'hospital' ? 'Khám tại bệnh viện' : 'Khám online'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phí khám</Text>
                <Text style={[styles.infoValue, styles.feeText]}>
                  {(appointment.fee || 0).toLocaleString('vi-VN')} đ
                </Text>
              </View>
            </View>
          </View>
        </View>

        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi lịch khám</Text>
              <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày khám mới (DD/MM/YYYY)</Text>
                <TextInput
                  style={styles.input}
                  value={newDate}
                  onChangeText={setNewDate}
                  placeholder="VD: 25/05/2025"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giờ khám mới (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="VD: 14:30"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lý do đổi lịch (tùy chọn)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={rescheduleReason}
                  onChangeText={setRescheduleReason}
                  placeholder="Nhập lý do..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowRescheduleModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleReschedule}
                disabled={updating || !newDate || !newTime}
              >
                <Text style={styles.confirmModalButtonText}>
                  {updating ? 'Đang lưu...' : 'Xác nhận'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {appointment.status === 'pending' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={openRescheduleModal}
            disabled={updating}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Đổi lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleUpdateStatus('cancelled')}
            disabled={updating}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleUpdateStatus('confirmed')}
            disabled={updating}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      )}

      {appointment.status === 'confirmed' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={openRescheduleModal}
            disabled={updating}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Đổi lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleUpdateStatus('completed')}
            disabled={updating}
          >
            <Ionicons name="checkmark-done" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Hoàn thành</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    padding: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  infoSubValue: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  feeText: {
    color: '#00BCD4',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  confirmButton: {
    backgroundColor: '#00BCD4',
  },
  completeButton: {
    backgroundColor: '#9c27b0',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rescheduleButton: {
    backgroundColor: '#f59e0b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmModalButton: {
    backgroundColor: '#00BCD4',
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
