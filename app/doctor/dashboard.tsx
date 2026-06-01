import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import doctorServiceInstance, { DoctorAppointment } from '../services/doctorService';

// Mapping ảnh bác sĩ
const doctorImages: any = {
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

export default function DoctorDashboard() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    today: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<DoctorAppointment[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [patientAvatars, setPatientAvatars] = useState<{ [key: string]: string }>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Hàm tạo màu avatar dựa trên tên
  const getAvatarColor = (name?: string | null) => {
    const colors = [
      { bg: '#e3f2fd', text: '#1976d2' }, // Blue
      { bg: '#f3e5f5', text: '#7b1fa2' }, // Purple
      { bg: '#e8f5e9', text: '#388e3c' }, // Green
      { bg: '#fff3e0', text: '#f57c00' }, // Orange
      { bg: '#fce4ec', text: '#c2185b' }, // Pink
      { bg: '#e0f7fa', text: '#00838f' }, // Cyan
      { bg: '#f1f8e9', text: '#689f38' }, // Light Green
      { bg: '#ede7f6', text: '#5e35b1' }, // Deep Purple
    ];
    // Kiểm tra name có tồn tại và không rỗng
    if (!name || name.length === 0) {
      return colors[0]; // Trả về màu mặc định
    }
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Load patient avatars
  const loadPatientAvatars = async (appointments: DoctorAppointment[]) => {
    try {
      const { getDocumentsWithQuery } = await import('../services/firebaseService');
      const { where } = await import('firebase/firestore');
      const avatarMap: { [key: string]: string } = {};
      
      console.log('🔔 [Dashboard] Loading avatars for', appointments.length, 'appointments');
      
      // Get unique patient IDs
      const patientIds = [...new Set(appointments.map(apt => apt.userId).filter(Boolean))];
      console.log('👥 [Dashboard] Found', patientIds.length, 'unique patients');
      
      // Load all users at once
      for (const patientId of patientIds) {
        try {
          const users = await getDocumentsWithQuery('users', [
            where('uid', '==', patientId)
          ]);
          
          if (users.length > 0 && (users[0] as any).avatar) {
            avatarMap[patientId] = (users[0] as any).avatar;
            console.log('✅ [Dashboard] Loaded avatar for:', (users[0] as any).fullName);
          }
        } catch (error) {
          console.log('⚠️ [Dashboard] Could not load avatar for user:', patientId);
        }
      }
      
      console.log('🔔 [Dashboard] Total avatars loaded:', Object.keys(avatarMap).length);
      setPatientAvatars(avatarMap);
    } catch (error) {
      console.error('❌ [Dashboard] Error loading patient avatars:', error);
    }
  };

  // Load unread message count
  const loadUnreadMessageCount = async () => {
    try {
      if (!userData?.uid) return;
      
      const doctorAuthUid = userData.uid;
      console.log('💬 [Dashboard] Loading unread messages for doctorAuthUid:', doctorAuthUid);
      
      const { getDocumentsWithQuery } = await import('../services/firebaseService');
      const { where } = await import('firebase/firestore');
      
      // Query conversations where doctor is participant
      const conversations = await getDocumentsWithQuery('conversations', [
        where('doctorAuthUid', '==', doctorAuthUid)
      ]);
      
      console.log('💬 [Dashboard] Found', conversations.length, 'conversations');
      
      // Sum up unread counts
      let totalUnread = 0;
      conversations.forEach((conv: any) => {
        const unread = conv.doctorUnreadCount || 0;
        totalUnread += unread;
        if (unread > 0) {
          console.log(`💬 [Dashboard] Conversation with ${conv.patientName}: ${unread} unread`);
        }
      });
      
      console.log('💬 [Dashboard] Total unread messages:', totalUnread);
      setUnreadMessageCount(totalUnread);
    } catch (error) {
      console.error('❌ [Dashboard] Error loading unread message count:', error);
    }
  };

  // Tính thời gian từ khi tạo appointment
  const getTimeAgo = (createdAt: string) => {
    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } catch {
      return 'Mới';
    }
  };

  // Sử dụng useFocusEffect để reload mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [userData])
  );

  const loadDashboardData = async () => {
    try {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      const doctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;
      
      // Load doctor info from Firebase using document ID directly
      try {
        const { getDocumentById } = await import('../services/firebaseService');
        const doctor = await getDocumentById('doctors', doctorId);
        if (doctor) {
          setDoctorInfo(doctor);
          console.log('✅ [Dashboard] Doctor info loaded:', doctor);
          console.log('🖼️ [Dashboard] Doctor image field (hinh_anh):', (doctor as any).hinh_anh);
          console.log('🖼️ [Dashboard] Doctor image field (image):', (doctor as any).image);
        }
      } catch (error) {
        console.log('⚠️ Could not load doctor info:', error);
      }
      
      const statsData = await doctorServiceInstance.getAppointmentStats(doctorId);
      setStats(statsData);

      const todayApts = await doctorServiceInstance.getTodayAppointments(doctorId);
      setTodayAppointments(todayApts);
      
      // Load patient avatars
      if (todayApts.length > 0) {
        await loadPatientAvatars(todayApts);
      }
      
      // Load unread message count
      await loadUnreadMessageCount();

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#3b82f6';
      case 'confirmed': return '#10b981';
      case 'completed': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Khám lại';
      case 'confirmed': return 'Khám mới';
      case 'completed': return 'Tái khám';
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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={
              (doctorInfo?.hinh_anh && doctorImages[doctorInfo.hinh_anh]) || 
              (doctorInfo?.image && doctorImages[doctorInfo.image]) || 
              doctorImages['nguyenvanam.png']
            } 
            style={styles.avatar} 
          />
          
          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>Xin chào,</Text>
            <View style={styles.doctorNameRow}>
              <Text style={styles.doctorName}>BS. {doctorInfo?.ten || userData?.fullName}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.specialty}>{doctorInfo?.chuyen_khoa || 'Chuyên khoa'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
            {stats.pending > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{stats.pending}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statNumber}>{stats.today}</Text>
            <Text style={styles.statLabel}>Lịch hẹn</Text>
            <Text style={styles.statSubtext}>
              <Text style={styles.statGrowth}>↑ 20%</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="people-outline" size={20} color="#10b981" />
            </View>
            <Text style={styles.statNumber}>{stats.confirmed}</Text>
            <Text style={styles.statLabel}>Bệnh nhân</Text>
            <Text style={styles.statSubtext}>
              <Text style={styles.statGrowth}>↑ 25%</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="clipboard-outline" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Hồ sơ</Text>
            <Text style={styles.statSubtext}>Tổng số</Text>
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch hẹn sắp tới</Text>
            <TouchableOpacity onPress={() => router.push('/doctor/appointments')}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length > 0 ? (
            todayAppointments.slice(0, 5).map((apt, index) => {
              const avatarColor = getAvatarColor(apt.patientName);
              const userAvatar = apt.userId ? patientAvatars[apt.userId] : null;
              
              return (
                <TouchableOpacity
                  key={apt.id}
                  style={styles.appointmentCard}
                  onPress={() => router.push(`/doctor/appointment-detail?id=${apt.id}`)}
                  activeOpacity={0.7}
                >
                  {/* Left Section - Avatar & Time */}
                  <View style={styles.leftSection}>
                    <View style={styles.avatarWrapper}>
                      {userAvatar ? (
                        <Image 
                          source={{ uri: userAvatar }}
                          style={styles.patientAvatarImage}
                        />
                      ) : (
                        <View style={[styles.patientAvatar, { backgroundColor: avatarColor.bg }]}>
                          <Text style={[styles.avatarText, { color: avatarColor.text }]}>
                            {apt.patientName?.charAt(0)?.toUpperCase() || 'P'}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(apt.status) }]} />
                    </View>
                    <View style={styles.timeBox}>
                      <Ionicons name="time-outline" size={14} color="#00BCD4" />
                      <Text style={styles.timeText}>{apt.time?.split(' - ')[0] || 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Right Section - Info */}
                  <View style={styles.rightSection}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.nameRow}>
                        <Text style={styles.patientName}>{apt.patientName || 'Bệnh nhân'}</Text>
                        <View style={[styles.statusPill, { backgroundColor: getStatusColor(apt.status) + '15' }]}>
                          <View style={[styles.statusDotSmall, { backgroundColor: getStatusColor(apt.status) }]} />
                          <Text style={[styles.statusText, { color: getStatusColor(apt.status) }]}>
                            {getStatusText(apt.status)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>{apt.patientPhone || 'Chưa có SĐT'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>{apt.fullDate}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailItem}>
                        <Ionicons name="medical-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>{apt.specialty || 'Khám tổng quát'}</Text>
                      </View>
                    </View>

                    {/* Footer */}
                    {apt.duration && (
                      <View style={styles.cardFooter}>
                        <View style={styles.durationBadge}>
                          <Ionicons name="hourglass-outline" size={12} color="#00BCD4" />
                          <Text style={styles.durationText}>{apt.duration}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Không có lịch hẹn sắp tới</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#00BCD4" />
          <Text style={[styles.navText, { color: '#00BCD4' }]}>Tổng quan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor/appointments')}>
          <Ionicons name="calendar-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Lịch hẹn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor/chats')}>
          <View style={styles.navIconContainer}>
            <Ionicons name="chatbubbles-outline" size={24} color="#64748b" />
            {unreadMessageCount > 0 && (
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>
                  {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Tin nhắn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor/patients')}>
          <Ionicons name="people-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Bệnh nhân</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/doctor/profile')}>
          <Ionicons name="person-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông báo</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Lịch khám chờ xác nhận */}
              {todayAppointments.filter(apt => apt.status === 'pending').length > 0 && (
                <View style={styles.notificationSection}>
                  <Text style={styles.notificationSectionTitle}>
                    Lịch khám chờ xác nhận ({todayAppointments.filter(apt => apt.status === 'pending').length})
                  </Text>
                  {todayAppointments.filter(apt => apt.status === 'pending').slice(0, 5).map((apt) => {
                    const avatarColor = getAvatarColor(apt.patientName);
                    const userAvatar = apt.userId ? patientAvatars[apt.userId] : null;
                    
                    return (
                      <TouchableOpacity
                        key={apt.id}
                        style={styles.notificationItem}
                        onPress={() => {
                          setShowNotifications(false);
                          router.push(`/doctor/appointment-detail?id=${apt.id}`);
                        }}
                      >
                        {userAvatar ? (
                          <Image 
                            source={{ uri: userAvatar }}
                            style={styles.notifAvatarImage}
                          />
                        ) : (
                          <View style={[styles.notifIcon, { backgroundColor: avatarColor.bg }]}>
                            <Text style={[styles.notifIconText, { color: avatarColor.text }]}>
                              {apt.patientName?.charAt(0)?.toUpperCase() || 'P'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.notifContent}>
                          <Text style={styles.notifTitle}>Lịch hẹn mới từ {apt.patientName || 'Bệnh nhân'}</Text>
                          <Text style={styles.notifText}>📅 {apt.fullDate} • ⏰ {apt.time?.split(' - ')[0] || 'N/A'}</Text>
                          <Text style={styles.notifText}>🏥 {apt.specialty || 'Khám tổng quát'}</Text>
                          <Text style={styles.notifTime}>{getTimeAgo(apt.createdAt)}</Text>
                        </View>
                        <View style={styles.notifDot} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Lịch khám đã xác nhận hôm nay */}
              {todayAppointments.filter(apt => apt.status === 'confirmed').length > 0 && (
                <View style={styles.notificationSection}>
                  <Text style={styles.notificationSectionTitle}>
                    Lịch khám hôm nay ({todayAppointments.filter(apt => apt.status === 'confirmed').length})
                  </Text>
                  {todayAppointments.filter(apt => apt.status === 'confirmed').slice(0, 3).map((apt) => {
                    const avatarColor = getAvatarColor(apt.patientName);
                    const userAvatar = apt.userId ? patientAvatars[apt.userId] : null;
                    
                    return (
                      <TouchableOpacity
                        key={apt.id}
                        style={styles.notificationItem}
                        onPress={() => {
                          setShowNotifications(false);
                          router.push(`/doctor/appointment-detail?id=${apt.id}`);
                        }}
                      >
                        {userAvatar ? (
                          <Image 
                            source={{ uri: userAvatar }}
                            style={styles.notifAvatarImage}
                          />
                        ) : (
                          <View style={[styles.notifIcon, { backgroundColor: avatarColor.bg }]}>
                            <Text style={[styles.notifIconText, { color: avatarColor.text }]}>
                              {apt.patientName?.charAt(0)?.toUpperCase() || 'P'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.notifContent}>
                          <Text style={styles.notifTitle}>{apt.patientName || 'Bệnh nhân'}</Text>
                          <Text style={styles.notifText}>⏰ {apt.time} • 🏥 {apt.specialty || 'Khám tổng quát'}</Text>
                        </View>
                        <View style={[styles.notifDot, { backgroundColor: '#4caf50' }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Tin nhắn */}
              <View style={styles.notificationSection}>
                <Text style={styles.notificationSectionTitle}>Tin nhắn</Text>
                <TouchableOpacity
                  style={styles.notificationItem}
                  onPress={() => {
                    setShowNotifications(false);
                    router.push('/doctor/chats');
                  }}
                >
                  <View style={[styles.notifIcon, { backgroundColor: '#e3f2fd' }]}>
                    <Ionicons name="chatbubbles" size={20} color="#00BCD4" />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>Tin nhắn từ bệnh nhân</Text>
                    <Text style={styles.notifText}>Xem tất cả tin nhắn</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              {/* Empty state */}
              {todayAppointments.length === 0 && (
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyNotifText}>Không có thông báo mới</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: '#64748b',
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 3,
  },
  statSubtext: {
    fontSize: 10,
    color: '#94a3b8',
  },
  statGrowth: {
    color: '#10b981',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  patientAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00838f',
  },
  rightSection: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  detailDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#e2e8f0',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00838f',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: 20,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIconContainer: {
    position: 'relative',
  },
  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  messageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  navText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
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
    color: '#1a1a1a',
  },
  notificationSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  notificationSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notifIconText: {
    fontSize: 16,
    fontWeight: '700',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  notifText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BCD4',
    marginLeft: 8,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyNotifText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
  },
});
