import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomToast from '../components/CustomToast';
import { useAuth } from '../context/AuthContext';
import doctorServiceInstance, { DoctorAppointment } from '../services/doctorService';

export default function DoctorAppointments() {
  const router = useRouter();
  const { userData } = useAuth();
  const params = useLocalSearchParams();
  const statusFilter = (params.status as string) || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<DoctorAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [patientAvatars, setPatientAvatars] = useState<{ [userId: string]: string }>({});
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({ visible: true, type, title, message });
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (statusFilter && statusFilter !== selectedTab) {
      setSelectedTab(statusFilter);
    }
  }, [statusFilter]);

  useEffect(() => {
    filterAppointments();
  }, [selectedTab, appointments]);

  const loadAppointments = async () => {
    try {
      setError(null);
      if (!userData?.uid) {
        console.log('❌ [Appointments] No user data found');
        setLoading(false);
        return;
      }

      console.log('🔍 [Appointments] Loading appointments for doctor');
      console.log('📋 [Appointments] User data:', {
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        doctorInfo: userData.doctorInfo
      });
      
      // Ưu tiên dùng doctorInfo.doctorId (ID từ doctors collection như "bs004")
      // Nếu không có thì dùng uid (Firebase Auth UID)
      const doctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;
      console.log('🔑 [Appointments] Using doctorId:', doctorId);
      console.log('📝 [Appointments] doctorInfo.doctorId:', (userData.doctorInfo as any)?.doctorId);
      console.log('📝 [Appointments] userData.uid:', userData.uid);
      
      const allAppointments = await doctorServiceInstance.getDoctorAppointments(doctorId);
      console.log('✅ [Appointments] Loaded', allAppointments.length, 'appointments');
      
      if (allAppointments.length > 0) {
        console.log('📋 [Appointments] First appointment:', JSON.stringify(allAppointments[0], null, 2));
        console.log('📋 [Appointments] Patient name:', allAppointments[0].patientName);
        console.log('📋 [Appointments] Patient phone:', allAppointments[0].patientPhone);
        console.log('📋 [Appointments] Fee:', allAppointments[0].fee);
        console.log('📋 [Appointments] Room:', allAppointments[0].room);
      }
      
      setAppointments(allAppointments);
      
      // Load patient avatars
      await loadPatientAvatars(allAppointments);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ [Appointments] Error loading appointments:', error);
      setError('Không thể tải danh sách lịch khám');
      setAppointments([]);
      setLoading(false);
    }
  };

  const loadPatientAvatars = async (appointments: DoctorAppointment[]) => {
    try {
      const { getDocumentsWithQuery } = await import('../services/firebaseService');
      const { where } = await import('firebase/firestore');
      const avatarMap: { [key: string]: string } = {};
      
      console.log('🔔 [Appointments] Loading avatars for', appointments.length, 'appointments');
      
      // Get unique patient IDs
      const patientIds = [...new Set(appointments.map(apt => apt.userId).filter(Boolean))];
      console.log('👥 [Appointments] Found', patientIds.length, 'unique patients');
      
      // Load all users at once
      for (const patientId of patientIds) {
        try {
          const users = await getDocumentsWithQuery('users', [
            where('uid', '==', patientId)
          ]);
          
          if (users.length > 0 && (users[0] as any).avatar) {
            avatarMap[patientId] = (users[0] as any).avatar;
            console.log('✅ [Appointments] Loaded avatar for:', (users[0] as any).fullName);
          }
        } catch (error) {
          console.log('⚠️ [Appointments] Could not load avatar for user:', patientId);
        }
      }
      
      console.log('🔔 [Appointments] Total avatars loaded:', Object.keys(avatarMap).length);
      setPatientAvatars(avatarMap);
    } catch (error) {
      console.error('❌ [Appointments] Error loading patient avatars:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const filterAppointments = () => {
    let filtered = appointments;
    
    // Lọc bỏ các appointment có patientName là undefined hoặc rỗng
    filtered = filtered.filter(apt => 
      apt.patientName && 
      apt.patientName.trim() !== '' && 
      apt.patientName.toLowerCase() !== 'undefined'
    );
    
    // Filter by status
    if (selectedTab !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedTab);
    }
    
    // KHÔNG lọc theo ngày nữa - hiển thị tất cả
    
    setFilteredAppointments(filtered);
  };

  const getTabCount = (status: string) => {
    if (status === 'all') {
      // Lọc bỏ appointments không hợp lệ
      return appointments.filter(apt => 
        apt.patientName && 
        apt.patientName.trim() !== '' && 
        apt.patientName.toLowerCase() !== 'undefined'
      ).length;
    }
    // Lọc theo status và loại bỏ appointments không hợp lệ
    return appointments.filter(apt => 
      apt.status === status &&
      apt.patientName && 
      apt.patientName.trim() !== '' && 
      apt.patientName.toLowerCase() !== 'undefined'
    ).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'confirmed':
        return '#4caf50';
      case 'completed':
        return '#9c27b0';
      case 'cancelled':
        return '#ef4444';
      case 'rescheduled':
        return '#00BCD4';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'rescheduled':
        return 'Đã dời lịch';
      default:
        return status;
    }
  };

  const handleApprove = async (appointmentId: string) => {
    try {
      console.log('✅ [Appointments] Approving appointment:', appointmentId);
      
      await doctorServiceInstance.updateAppointmentStatus(appointmentId, 'confirmed');
      console.log('✅ [Appointments] Appointment approved successfully');
      
      await loadAppointments();
      
      showToast('success', 'Xác nhận thành công', 'Lịch khám đã được xác nhận. Bệnh nhân sẽ nhận được thông báo.');
    } catch (error: any) {
      console.error('❌ [Appointments] Error approving appointment:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi xác nhận lịch khám.';
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        errorMessage = 'Không có quyền xác nhận lịch khám.';
      }
      
      showToast('error', 'Lỗi xác nhận', errorMessage);
    }
  };

  const handleReject = async (appointmentId: string) => {
    Alert.alert(
      'Xác nhận hủy lịch',
      'Bạn có chắc chắn muốn từ chối lịch khám này? Bệnh nhân sẽ nhận được thông báo.',
      [
        {
          text: 'Không',
          style: 'cancel'
        },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('❌ [Appointments] Rejecting appointment:', appointmentId);
              await doctorServiceInstance.updateAppointmentStatus(appointmentId, 'cancelled', 'Bác sĩ từ chối');
              console.log('✅ [Appointments] Appointment rejected successfully');
              
              await loadAppointments();
              
              showToast('success', 'Đã hủy lịch', 'Lịch khám đã được hủy thành công.');
            } catch (error: any) {
              console.error('❌ [Appointments] Error rejecting appointment:', error);
              
              let errorMessage = 'Có lỗi xảy ra khi hủy lịch khám.';
              
              if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
                errorMessage = 'Không có quyền hủy lịch khám.';
              }
              
              showToast('error', 'Lỗi hủy lịch', errorMessage);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch khám</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAppointments}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <CustomToast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch khám</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.statusTab, selectedTab === 'pending' && styles.statusTabActive]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text style={[styles.statusTabText, selectedTab === 'pending' && styles.statusTabTextActive]}>
              Chờ xác nhận
            </Text>
            {getTabCount('pending') > 0 && (
              <View style={[styles.badge, selectedTab === 'pending' && styles.badgeActive]}>
                <Text style={[styles.badgeText, selectedTab === 'pending' && styles.badgeTextActive]}>
                  {getTabCount('pending')}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusTab, selectedTab === 'confirmed' && styles.statusTabActive]}
            onPress={() => setSelectedTab('confirmed')}
          >
            <Text style={[styles.statusTabText, selectedTab === 'confirmed' && styles.statusTabTextActive]}>
              Đã xác nhận
            </Text>
            {getTabCount('confirmed') > 0 && (
              <View style={[styles.badge, selectedTab === 'confirmed' && styles.badgeActive]}>
                <Text style={[styles.badgeText, selectedTab === 'confirmed' && styles.badgeTextActive]}>
                  {getTabCount('confirmed')}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusTab, selectedTab === 'completed' && styles.statusTabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.statusTabText, selectedTab === 'completed' && styles.statusTabTextActive]}>
              Đã hoàn thành
            </Text>
            {getTabCount('completed') > 0 && (
              <View style={[styles.badge, selectedTab === 'completed' && styles.badgeActive]}>
                <Text style={[styles.badgeText, selectedTab === 'completed' && styles.badgeTextActive]}>
                  {getTabCount('completed')}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusTab, selectedTab === 'cancelled' && styles.statusTabActive]}
            onPress={() => setSelectedTab('cancelled')}
          >
            <Text style={[styles.statusTabText, selectedTab === 'cancelled' && styles.statusTabTextActive]}>
              Đã hủy
            </Text>
            {getTabCount('cancelled') > 0 && (
              <View style={[styles.badge, selectedTab === 'cancelled' && styles.badgeActive]}>
                <Text style={[styles.badgeText, selectedTab === 'cancelled' && styles.badgeTextActive]}>
                  {getTabCount('cancelled')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00BCD4']} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Không có lịch khám</Text>
            <Text style={styles.emptyText}>Chưa có lịch hẹn nào trong ngày này</Text>
          </View>
        ) : (
          filteredAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => router.push(`/doctor/appointment-detail?id=${appointment.id}`)}
              activeOpacity={0.7}
            >
              {/* Time & Date */}
              <View style={styles.timeSection}>
                <Text style={styles.timeText}>{appointment.time?.split(' - ')[0] || 'N/A'}</Text>
                <Text style={styles.dateText}>
                  {appointment.fullDate ? `${appointment.fullDate.split('/')[0]}/${appointment.fullDate.split('/')[1]}` : 'N/A'}
                </Text>
              </View>

              {/* Patient Info */}
              <View style={styles.patientSection}>
                {(() => {
                  const userAvatar = appointment.userId ? patientAvatars[appointment.userId] : null;
                  return userAvatar ? (
                    <Image 
                      source={{ uri: userAvatar }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={28} color="#00BCD4" />
                    </View>
                  );
                })()}
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{appointment.patientName}</Text>
                  <Text style={styles.patientDetails}>
                    {appointment.patientPhone ? `SĐT: ${appointment.patientPhone}` : 'Chưa có thông tin'}
                  </Text>
                  <View style={styles.appointmentType}>
                    <Text style={styles.appointmentTypeText}>Khám nội tổng quát</Text>
                  </View>
                  <View style={styles.reasonRow}>
                    <Text style={styles.reasonLabel}>Lý do:</Text>
                    <Text style={styles.reasonText}>Khám sức khỏe định kỳ</Text>
                  </View>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                    <Text style={styles.durationText}>{appointment.duration}</Text>
                  </View>
                </View>
              </View>

              {/* Status Badge */}
              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                  <Text style={[styles.statusPillText, { color: getStatusColor(appointment.status) }]}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
                <Text style={styles.bookingStatus}>Đặt lịch qua ứng dụng</Text>
              </View>

              {/* Action Buttons */}
              {appointment.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleReject(appointment.id);
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                    <Text style={styles.cancelBtnText}>Hủy lịch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleApprove(appointment.id);
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.confirmBtnText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  // Tabs
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  statusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    gap: 6,
  },
  statusTabActive: {
    backgroundColor: '#00BCD4',
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  statusTabTextActive: {
    color: '#fff',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeActive: {
    backgroundColor: '#fff',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  badgeTextActive: {
    color: '#00BCD4',
  },
  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  dateFilter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  dateFilterText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  // List
  listContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  // Appointment Card
  appointmentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
  },
  patientSection: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f7fa',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  appointmentType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e0f7fa',
    marginBottom: 6,
  },
  appointmentTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00BCD4',
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 4,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  reasonText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookingStatus: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#00BCD4',
    gap: 6,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
