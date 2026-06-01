import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getDocumentsWithQuery } from '../services/firebaseService';

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

const doctorNameToImage: { [key: string]: string } = {
  'Nguyễn Văn An': 'nguyenvanam.png',
  'Trần Thị Lan': 'tranthilan.png',
  'Lê Minh Tâm': 'leminhtam.png',
  'Trần Thị Mai': 'tranthimai.png',
  'Lê Hoàng Nam': 'lehoangnam.png',
  'Phạm Thu Hà': 'phamthuha.png',
  'Đỗ Minh Tuấn': 'dominhtuan.png',
  'Vũ Thị Lan': 'vuthilan.png',
  'Hoàng Văn Đức': 'hoangvanduc.png',
  'Ngô Thị Hương': 'ngothihuong.png',
  'Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'Trần Văn Khoa': 'tranvankhoa.png',
  'Phạm Minh Quân': 'phamminhquan.png',
  'Lê Thị Hằng': 'lethihang.png',
  'Nguyễn Văn Hải': 'nguyenvanhai.png',
  'Đặng Thị Thảo': 'dangthithao.jpg',
  // Thêm các biến thể tên có thể có
  'BS. Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'BS. Nguyễn Văn An': 'nguyenvanam.png',
  'BS. Trần Thị Lan': 'tranthilan.png',
  'BS. Lê Minh Tâm': 'leminhtam.png',
  'BS. Trần Thị Mai': 'tranthimai.png',
  'BS. Lê Hoàng Nam': 'lehoangnam.png',
  'BS. Phạm Thu Hà': 'phamthuha.png',
  'BS. Đỗ Minh Tuấn': 'dominhtuan.png',
  'BS. Vũ Thị Lan': 'vuthilan.png',
  'BS. Hoàng Văn Đức': 'hoangvanduc.png',
  'BS. Ngô Thị Hương': 'ngothihuong.png',
  'BS. Trần Văn Khoa': 'tranvankhoa.png',
  'BS. Phạm Minh Quân': 'phamminhquan.png',
  'BS. Lê Thị Hằng': 'lethihang.png',
  'BS. Nguyễn Văn Hải': 'nguyenvanhai.png',
  'BS. Đặng Thị Thảo': 'dangthithao.jpg',
};

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 [APPOINTMENTS] Starting loadAppointments...');
      console.log('👤 [APPOINTMENTS] User UID:', user?.uid);
      
      if (!user) {
        console.warn('⚠️ [APPOINTMENTS] No user logged in');
        setAppointments([]);
        setLoading(false);
        return;
      }
      
      console.log('🔍 [APPOINTMENTS] Querying appointments for user:', user.uid);
      const data = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid)
      ]);
      
      console.log('✅ [APPOINTMENTS] Query returned', data.length, 'appointments');
      console.log('📋 [APPOINTMENTS] Appointments data:', JSON.stringify(data, null, 2));
      
      if (data.length === 0) {
        console.warn('⚠️ [APPOINTMENTS] No appointments found for user:', user.uid);
      }
      
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(b.createdAt || b.appointmentDate).getTime();
        const dateB = new Date(a.createdAt || a.appointmentDate).getTime();
        return dateA - dateB;
      });
      setAppointments(sortedData);
      console.log('✅ [APPOINTMENTS] Appointments loaded and sorted:', sortedData.length);
      
      // Auto-switch to 'all' tab if no upcoming appointments
      if (sortedData.length > 0 && selectedTab === 'upcoming') {
        const upcomingCount = sortedData.filter((apt: any) => {
          const aptDate = new Date(apt.appointmentDate || apt.createdAt);
          return aptDate >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed';
        }).length;
        
        if (upcomingCount === 0) {
          console.log('⚠️ [APPOINTMENTS] No upcoming appointments, switching to "all" tab');
          setSelectedTab('all');
        }
      }
    } catch (error) {
      console.error('❌ [APPOINTMENTS] Error loading appointments:', error);
      console.error('❌ [APPOINTMENTS] Error details:', JSON.stringify(error, null, 2));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedTab]);

  useFocusEffect(
    useCallback(() => {
      console.log('👁️ [APPOINTMENTS] useFocusEffect triggered');
      console.log('👤 [APPOINTMENTS] Current user:', user?.uid);
      console.log('⏰ [APPOINTMENTS] Timestamp:', new Date().toISOString());
      if (user) {
        loadAppointments();
      }
    }, [loadAppointments, user])
  );

  const getAppointments = () => {
    const now = new Date();
    console.log('🔍 [APPOINTMENTS] getAppointments called');
    console.log('📅 [APPOINTMENTS] Current time:', now.toISOString());
    console.log('📊 [APPOINTMENTS] Total appointments:', appointments.length);
    console.log('📋 [APPOINTMENTS] Selected tab:', selectedTab);
    
    if (selectedTab === 'all') {
      console.log('✅ [APPOINTMENTS] Returning all appointments:', appointments.length);
      return appointments;
    }
    
    if (selectedTab === 'upcoming') {
      const filtered = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate || apt.createdAt);
        const isValid = !isNaN(aptDate.getTime());
        const isUpcoming = aptDate >= now;
        const isNotCancelled = apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'rescheduled';
        
        console.log(`📅 [APPOINTMENTS] Apt: ${apt.doctor}, Date: ${apt.appointmentDate}, Parsed: ${aptDate.toISOString()}, Valid: ${isValid}, Upcoming: ${isUpcoming}, Status: ${apt.status}, Include: ${isValid && isUpcoming && isNotCancelled}`);
        
        return isValid && isUpcoming && isNotCancelled;
      });
      console.log('✅ [APPOINTMENTS] Returning upcoming appointments:', filtered.length);
      return filtered;
    }
    
    const completed = appointments.filter((apt: any) => {
      return apt.status === 'completed' || apt.status === 'cancelled';
    });
    console.log('✅ [APPOINTMENTS] Returning completed appointments:', completed.length);
    return completed;
  };

  const getStatusColor = (status: string) => {
    if (status === 'confirmed') return '#06D6A0';
    if (status === 'pending') return '#FFB800';
    if (status === 'rescheduled') return '#8B5CF6';
    if (status === 'completed') return '#10b981';
    return '#94a3b8';
  };

  const getStatusText = (status: string) => {
    if (status === 'confirmed') return 'Đã xác nhận';
    if (status === 'pending') return 'Chờ xác nhận';
    if (status === 'rescheduled') return 'Đã đổi lịch';
    if (status === 'completed') return 'Hoàn thành';
    if (status === 'cancelled') return 'Đã hủy';
    return 'Không xác định';
  };

  const renderAppointmentCard = ({ item }: any) => {
    const now = new Date();
    const aptDate = new Date(item.appointmentDate || item.createdAt);
    const isUpcoming = aptDate >= now && item.status !== 'cancelled' && item.status !== 'completed';
    
    // Debug log
    console.log('🖼️ [APPOINTMENTS] Rendering card for:', item.doctor);
    console.log('🖼️ [APPOINTMENTS] item.image:', item.image);
    console.log('🖼️ [APPOINTMENTS] item.hinh_anh:', item.hinh_anh);
    
    // Lấy avatar bác sĩ với fallback
    const getAvatar = () => {
      const imageFileName = item.image || item.hinh_anh;
      
      console.log('🖼️ [APPOINTMENTS] imageFileName:', imageFileName);
      
      // Priority 1: Từ file name
      if (imageFileName && doctorImages[imageFileName as keyof typeof doctorImages]) {
        console.log('✅ [APPOINTMENTS] Found image by filename:', imageFileName);
        return doctorImages[imageFileName as keyof typeof doctorImages];
      }
      
      // Priority 2: Từ tên bác sĩ
      if (item.doctor) {
        const mappedImage = doctorNameToImage[item.doctor];
        console.log('🔍 [APPOINTMENTS] Mapped image for', item.doctor, ':', mappedImage);
        if (mappedImage && doctorImages[mappedImage as keyof typeof doctorImages]) {
          console.log('✅ [APPOINTMENTS] Found image by doctor name:', mappedImage);
          return doctorImages[mappedImage as keyof typeof doctorImages];
        }
      }
      
      // Priority 3: Default
      console.log('⚠️ [APPOINTMENTS] Using default logo');
      return require('@/assets/images/logo.png');
    };
    
    const doctorImage = getAvatar();
    
    // Đảm bảo các field không undefined
    const doctorName = item.doctor || 'Bác sĩ';
    const specialty = item.specialty || 'Chuyên khoa';
    const hospital = item.hospital || 'Bệnh viện';
    const date = item.date || '';
    const fullDate = item.fullDate || '';
    const time = item.time || '';
    const duration = item.duration || '30 phút';
    const room = item.room || 'Phòng khám';
    const floor = item.floor || 'Tầng 1';
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <Image 
              source={doctorImage}
              style={styles.doctorAvatar}
            />
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
              <Text style={styles.specialty} numberOfLines={1}>{specialty}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#64748b" />
                <Text style={styles.hospital} numberOfLines={1}>{hospital}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {isUpcoming && (
          <>
            <View style={styles.appointmentDetails}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar-outline" size={18} color="#00BCD4" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{date}</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{fullDate}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time-outline" size={18} color="#00BCD4" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{time}</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>({duration})</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="business-outline" size={18} color="#00BCD4" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel} numberOfLines={1}>{room}</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{floor}</Text>
                </View>
              </View>
            </View>

            {/* Fee Display */}
            {item.fee && (
              <View style={styles.feeContainer}>
                <Text style={styles.feeLabel}>Phí khám:</Text>
                <Text style={styles.feeValue}>{item.fee.toLocaleString('vi-VN')} đ</Text>
              </View>
            )}
          </>
        )}

        {!isUpcoming && (
          <>
            <View style={styles.simpleDetails}>
              <View style={styles.simpleDetailRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.simpleDetailText} numberOfLines={1}>
                  {date}, {fullDate}
                </Text>
                <Text style={styles.simpleDetailText}>•</Text>
                <Text style={styles.simpleDetailText}>{time}</Text>
              </View>
              <View style={styles.simpleDetailRow}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.simpleDetailText} numberOfLines={1}>{hospital}</Text>
              </View>
              {item.fee && (
                <View style={styles.simpleDetailRow}>
                  <Ionicons name="card-outline" size={14} color="#64748b" />
                  <Text style={styles.simpleDetailText}>
                    Phí khám: {item.fee.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.cardActions}>
          {isUpcoming ? (
            <>
              <TouchableOpacity 
                style={styles.outlineButton}
                onPress={() => router.push(`/appointment-detail?id=${item.id}`)}
              >
                <Text style={styles.outlineButtonText}>Chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Đến khám</Text>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.fullWidthButton}
              onPress={() => router.push(`/appointment-detail?id=${item.id}`)}
            >
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch khám</Text>
        <TouchableOpacity 
          style={styles.calendarBtn}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Ionicons name="calendar-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Calendar View */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Lịch khám tháng này</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Ionicons name="close" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarContent}>
            <View style={styles.calendarStats}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: '#06D6A0' }]} />
                <Text style={styles.statLabel}>Đã xác nhận</Text>
                <Text style={styles.statValue}>
                  {appointments.filter(a => a.status === 'confirmed').length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: '#FFB800' }]} />
                <Text style={styles.statLabel}>Chờ xác nhận</Text>
                <Text style={styles.statValue}>
                  {appointments.filter(a => a.status === 'pending').length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.statLabel}>Đã đổi lịch</Text>
                <Text style={styles.statValue}>
                  {appointments.filter(a => a.status === 'rescheduled').length}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.bookNewButton}
              onPress={() => {
                setShowCalendar(false);
                router.push('/(tabs)/booking');
              }}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.bookNewButtonText}>Đặt lịch khám mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
              Sắp tới
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Đã hoàn thành
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedTab === 'upcoming' ? 'Sắp tới' : selectedTab === 'completed' ? 'Đã đặt' : 'Tất cả'}
        </Text>
      </View>

      {/* Appointments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      ) : getAppointments().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {selectedTab === 'upcoming' ? 'Chưa có lịch khám sắp tới' : 
             selectedTab === 'completed' ? 'Chưa có lịch khám đã hoàn thành' : 
             'Chưa có lịch khám nào'}
          </Text>
          {selectedTab === 'upcoming' && appointments.length > 0 && (
            <TouchableOpacity 
              style={styles.switchTabButton}
              onPress={() => setSelectedTab('all')}
            >
              <Text style={styles.switchTabButtonText}>Xem tất cả lịch khám</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={getAppointments()}
          renderItem={renderAppointmentCard}
          keyExtractor={(item, index) => item.id || `appointment-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
  },
  calendarBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#00BCD4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  hospital: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  detailIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  detailValue: {
    fontSize: 11,
    color: '#64748b',
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  feeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  simpleDetails: {
    gap: 8,
    marginBottom: 12,
  },
  simpleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simpleDetailText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#00BCD4',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  fullWidthButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  switchTabButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#00BCD4',
    borderRadius: 8,
  },
  switchTabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  calendarContent: {
    gap: 16,
  },
  calendarStats: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  bookNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  bookNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
