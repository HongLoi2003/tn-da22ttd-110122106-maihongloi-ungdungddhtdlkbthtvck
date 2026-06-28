import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomToast from '../components/CustomToast';
import { useAuth } from '../context/AuthContext';

// Mapping ảnh bác sĩ - 16 ảnh thật từ Pexels (chất lượng cao, miễn phí bản quyền)
const doctorImages: { [key: string]: any } = {
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

export default function DoctorProfile() {
  const router = useRouter();
  const { userData, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [availableForBooking, setAvailableForBooking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  // Sử dụng useFocusEffect để reload mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadDoctorInfo();
    }, [userData])
  );

  const loadDoctorInfo = async () => {
    try {
      setLoading(true);
      // ✅ Use display doctor ID for profile operations
      const displayDoctorId = (userData?.doctorInfo as any)?.doctorId;
      
      if (!displayDoctorId) {
        console.log('❌ No doctorId found');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading doctor info for:', displayDoctorId);
      
      // Lấy thông tin bác sĩ từ doctors collection using document ID
      const { getDocumentById } = await import('../services/firebaseService');
      const doctor = await getDocumentById('doctors', displayDoctorId);

      if (doctor) {
        console.log('✅ Doctor info loaded:', doctor);
        console.log('🖼️ Doctor image field (hinh_anh):', (doctor as any).hinh_anh);
        console.log('🖼️ Doctor image field (image):', (doctor as any).image);
        setDoctorInfo(doctor);
        // Load availableForBooking status from Firebase
        setAvailableForBooking((doctor as any).availableForBooking !== false);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading doctor info:', error);
      setLoading(false);
    }
  };

  const handleAvailableForBookingChange = async (value: boolean) => {
    try {
      setAvailableForBooking(value);
      
      // ✅ Use display doctor ID for booking availability
      const displayDoctorId = (userData?.doctorInfo as any)?.doctorId;
      if (!displayDoctorId) {
        console.log('❌ No displayDoctorId found');
        return;
      }

      console.log('💾 Updating availableForBooking to:', value);
      
      // Update Firebase
      const { updateDocument } = await import('../services/firebaseService');
      await updateDocument('doctors', displayDoctorId, {
        availableForBooking: value
      });
      
      console.log('✅ availableForBooking updated successfully');
    } catch (error) {
      console.error('❌ Error updating availableForBooking:', error);
      // Revert on error
      setAvailableForBooking(!value);
    }
  };

  const handleLogout = async () => {
    try {
      // Hiển thị toast đang đăng xuất
      setToast({
        visible: true,
        type: 'info',
        title: 'Đang đăng xuất...',
        message: `Tạm biệt, ${doctorInfo?.ten || doctorInfo?.fullName || 'Bác sĩ'}!`,
      });
      
      // Đợi 1 giây để hiển thị toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await logout();
      
      // Hiển thị toast thành công
      setToast({
        visible: true,
        type: 'success',
        title: 'Đăng xuất thành công',
        message: 'Hẹn gặp lại!',
      });
      
      // Đợi thêm 1 giây để hiển thị toast thành công rồi chuyển trang
      setTimeout(() => {
        router.replace('/login');
      }, 1000);
    } catch (error) {
      console.error('Error logging out:', error);
      setToast({
        visible: true,
        type: 'error',
        title: 'Lỗi đăng xuất',
        message: 'Không thể đăng xuất. Vui lòng thử lại!',
      });
    }
  };

  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  const handleLogoutPress = () => {
    if (isWeb) {
      // Sử dụng confirm cho web
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmed) {
        handleLogout();
      }
    } else {
      // Sử dụng Alert cho mobile
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng xuất', 
            style: 'destructive', 
            onPress: handleLogout
          },
        ]
      );
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
      {/* Toast Notification */}
      <CustomToast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onHide={() => setToast({ ...toast, visible: false })}
        duration={3000}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient background */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ</Text>
            <TouchableOpacity onPress={() => router.push('/doctor/edit-profile')}>
              <Ionicons name="create-outline" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={
                  // Priority 1: Custom avatar from users collection
                  userData?.avatar ? { uri: userData.avatar } :
                  // Priority 2: Default avatar from doctors collection
                  (doctorInfo?.hinh_anh && doctorImages[doctorInfo.hinh_anh]) || 
                  (doctorInfo?.image && doctorImages[doctorInfo.image]) || 
                  // Priority 3: Fallback
                  doctorImages['nguyenvanam.png']
                } 
                style={styles.avatar} 
              />
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() => router.push('/doctor/edit-profile')}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.doctorName}>{doctorInfo?.ten || userData?.fullName || 'Bác sĩ'}</Text>
              <Text style={styles.specialty}>{doctorInfo?.chuyen_khoa || 'Chuyên khoa'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>{doctorInfo?.danh_gia || '4.8'}</Text>
                <Text style={styles.experienceText}>• {doctorInfo?.kinh_nghiem || '8'} năm KN</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>156</Text>
              <Text style={styles.quickStatLabel}>Bệnh nhân</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>89</Text>
              <Text style={styles.quickStatLabel}>Đánh giá</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>98%</Text>
              <Text style={styles.quickStatLabel}>Hài lòng</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="mail" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData?.email || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="call" size={20} color="#4caf50" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{doctorInfo?.so_dien_thoai || userData?.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="business" size={20} color="#ff9800" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Bệnh viện</Text>
                <Text style={styles.infoValue}>{doctorInfo?.benh_vien || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="school" size={20} color="#9c27b0" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Học vấn</Text>
                <Text style={styles.infoValue}>{doctorInfo?.hoc_van || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="cash" size={20} color="#4caf50" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Phí khám</Text>
                <Text style={styles.infoValue}>
                  {(doctorInfo?.phi_kham || doctorInfo?.gia_kham) 
                    ? `${(doctorInfo.phi_kham || doctorInfo.gia_kham).toLocaleString('vi-VN')} đ` 
                    : 'Chưa cập nhật'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="card" size={20} color="#00BCD4" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Mã bác sĩ</Text>
                <Text style={styles.infoValue}>{(userData?.doctorInfo as any)?.doctorId || 'Chưa cập nhật'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="notifications" size={22} color="#00BCD4" />
                </View>
                <View style={styles.settingTextWrapper}>
                  <Text style={styles.settingTitle}>Thông báo</Text>
                  <Text style={styles.settingSubtitle}>Nhận thông báo lịch hẹn mới</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e2e8f0', true: '#00BCD4' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="calendar" size={22} color="#4caf50" />
                </View>
                <View style={styles.settingTextWrapper}>
                  <Text style={styles.settingTitle}>Trạng thái đặt lịch</Text>
                  <Text style={styles.settingSubtitle}>Cho phép bệnh nhân đặt lịch</Text>
                </View>
              </View>
              <Switch
                value={availableForBooking}
                onValueChange={handleAvailableForBookingChange}
                trackColor={{ false: '#e2e8f0', true: '#4caf50' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý</Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/doctor/work-schedule')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrapper, { backgroundColor: '#e3f2fd' }]}>
                  <Ionicons name="time" size={22} color="#00BCD4" />
                </View>
                <Text style={styles.menuTitle}>Lịch làm việc</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/doctor/reviews')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrapper, { backgroundColor: '#fff3e0' }]}>
                  <Ionicons name="star" size={22} color="#ff9800" />
                </View>
                <Text style={styles.menuTitle}>Đánh giá của bệnh nhân</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/change-password')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrapper, { backgroundColor: '#fce4ec' }]}>
                  <Ionicons name="lock-closed" size={22} color="#e91e63" />
                </View>
                <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuRow} onPress={ () => router.push('/support-center')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrapper, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="help-circle" size={22} color="#4caf50" />
                </View>
                <Text style={styles.menuTitle}>Trợ giúp và Hỗ trợ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

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
  // Header Section
  headerSection: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Profile Info
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileDetails: {
    flex: 1,
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
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  experienceText: {
    fontSize: 13,
    color: '#64748b',
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  // Section
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextWrapper: {
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
    color: '#1a1a1a',
  },
  // Settings Card
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextWrapper: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 12,
  },
  // Menu Card
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 12,
  },
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
