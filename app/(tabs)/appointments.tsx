import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getDocumentsWithQuery } from '../services/firebaseService';

// Doctor Images - Ảnh thật từ Pexels
const DOCTOR_IMAGES: { [key: string]: any } = {
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

const DOCTOR_NAME_TO_IMAGE: { [key: string]: string } = {
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
  'BS. Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'BS. Trần Văn Khoa': 'tranvankhoa.png',
  'BS. Phạm Minh Quân': 'phamminhquan.png',
  'BS. Lê Thị Hằng': 'lethihang.png',
  'BS. Nguyễn Văn Hải': 'nguyenvanhai.png',
  'BS. Đặng Thị Thảo': 'dangthithao.jpg',
};

const DEFAULT_AVATAR = { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' };

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
    
    // Lấy avatar bác sĩ
    const getDoctorAvatar = () => {
      const doctorName = item.doctor || item.doctorName;
      const imageName = item.image || item.hinh_anh;
      
      // Priority 1: Từ imageName
      if (imageName && DOCTOR_IMAGES[imageName]) {
        return DOCTOR_IMAGES[imageName];
      }
      
      // Priority 2: Từ tên bác sĩ
      if (doctorName) {
        let mappedImage = DOCTOR_NAME_TO_IMAGE[doctorName];
        
        // Thử bỏ prefix "BS. " nếu có
        if (!mappedImage && doctorName.startsWith('BS. ')) {
          const nameWithoutPrefix = doctorName.substring(4);
          mappedImage = DOCTOR_NAME_TO_IMAGE[nameWithoutPrefix];
        }
        
        if (mappedImage && DOCTOR_IMAGES[mappedImage]) {
          return DOCTOR_IMAGES[mappedImage];
        }
      }
      
      // Priority 3: Default
      return DEFAULT_AVATAR;
    };
    
    const doctorImage = getDoctorAvatar();
    
    // Đảm bảo các field không undefined
    const doctorName = item.doctor || 'Bác sĩ';
    const specialty = item.specialty || 'Chuyên khoa';
    const hospital = item.hospital || 'Bệnh viện';
    const date = item.date || '';
    const fullDate = item.fullDate || '';
    const time = item.time || '';
    
    // Lấy giá từ nhiều field có thể có, ưu tiên fee
    const feeAmount = item.fee || item.price || item.doctorFee || 300000; // Default 300k
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(feeAmount);
    
    return (
      <View style={styles.appointmentCard}>
        {/* Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
        
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Top Section: Doctor Info */}
          <View style={styles.topSection}>
            <Image 
              source={doctorImage}
              style={styles.doctorAvatar}
            />
            <View style={styles.doctorInfoSection}>
              <View style={styles.doctorNameRow}>
                <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
                <View style={[styles.miniStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.miniStatusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              <Text style={styles.specialty}>{specialty}</Text>
              {hospital && (
                <View style={styles.hospitalRow}>
                  <Ionicons name="business" size={13} color="#64748b" />
                  <Text style={styles.hospitalText} numberOfLines={1}>{hospital}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Middle Section: Date & Time */}
          <View style={styles.middleSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="calendar" size={18} color="#00BCD4" />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>Ngày khám</Text>
                <Text style={styles.infoValue}>{date}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="time" size={18} color="#8B5CF6" />
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>Giờ khám</Text>
                <Text style={styles.infoValue}>{time}</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section: Price & Action */}
          <View style={styles.bottomSection}>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Tổng chi phí</Text>
              <Text style={styles.priceAmount}>{formattedPrice}đ</Text>
            </View>
            {isUpcoming ? (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push(`/appointment-detail?id=${item.id}`)}
              >
                <Text style={styles.actionButtonText}>Đến khám</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => router.push(`/appointment-detail?id=${item.id}`)}
              >
                <Text style={styles.detailButtonText}>Chi tiết</Text>
                <Ionicons name="arrow-forward" size={16} color="#00BCD4" />
              </TouchableOpacity>
            )}
          </View>
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
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  doctorInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  specialty: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
    marginBottom: 4,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  middleSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06D6A0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#00BCD4',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00BCD4',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
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
