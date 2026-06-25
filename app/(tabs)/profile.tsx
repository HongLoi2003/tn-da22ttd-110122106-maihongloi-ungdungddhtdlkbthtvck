import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomToast from '../components/CustomToast';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, userData, updateUserData } = useAuth();
  const [avatar, setAvatar] = useState(
    userData?.avatar ? { uri: userData.avatar } : require('../../assets/images/logo.png')
  );
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });
  
  // Cập nhật avatar khi userData thay đổi
  useEffect(() => {
    if (userData?.avatar) {
      setAvatar({ uri: userData.avatar });
    }
  }, [userData?.avatar]);
  
  const userInfo = {
    name: userData?.fullName || 'Người dùng',
    phone: userData?.phone || 'Chưa cập nhật',
    email: userData?.email || 'Chưa cập nhật',
    birthDate: userData?.dateOfBirth || 'Chưa cập nhật',
    gender: userData?.gender || 'Chưa cập nhật',
    address: userData?.address || 'Chưa cập nhật',
    bloodType: userData?.bloodType || 'Chưa cập nhật',
    insuranceCode: userData?.insuranceCode || 'Chưa cập nhật',
  };

  const handleChangeAvatar = async () => {
    Alert.alert(
      'Đổi ảnh đại diện',
      'Chọn cách thức',
      [
        {
          text: 'Chụp ảnh',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled) {
                const newAvatarUri = result.assets[0].uri;
                setAvatar({ uri: newAvatarUri });
                // Lưu avatar vào Firebase
                await saveAvatarToFirebase(newAvatarUri);
              }
            }
          },
        },
        {
          text: 'Chọn từ thư viện',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled) {
                const newAvatarUri = result.assets[0].uri;
                setAvatar({ uri: newAvatarUri });
                // Lưu avatar vào Firebase
                await saveAvatarToFirebase(newAvatarUri);
              }
            }
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const saveAvatarToFirebase = async (avatarUri: string) => {
    try {
      console.log('💾 [PROFILE] Saving avatar to Firebase:', avatarUri);
      await updateUserData({ avatar: avatarUri });
      console.log('✅ [PROFILE] Avatar saved successfully');
      Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật');
    } catch (error) {
      console.error('❌ [PROFILE] Error saving avatar:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện');
    }
  };

  const personalInfo = [
    { id: '1', icon: 'person-outline', label: 'Họ và tên', value: userInfo.name, color: '#00BCD4' },
    { id: '2', icon: 'call-outline', label: 'Số điện thoại', value: userInfo.phone, color: '#00BCD4' },
    { id: '3', icon: 'mail-outline', label: 'Email', value: userInfo.email, color: '#00BCD4' },
    { id: '4', icon: 'calendar-outline', label: 'Ngày sinh', value: userInfo.birthDate, color: '#00BCD4' },
    { id: '5', icon: 'male-female-outline', label: 'Giới tính', value: userInfo.gender, color: '#00BCD4' },
    { id: '6', icon: 'location-outline', label: 'Địa chỉ', value: userInfo.address, color: '#00BCD4' },
    { id: '7', icon: 'water-outline', label: 'Nhóm máu', value: userInfo.bloodType, color: '#00BCD4' },
    { id: '8', icon: 'card-outline', label: 'Mã số BHYT', value: userInfo.insuranceCode, color: '#00BCD4' },
  ];

  const otherOptions = [
    { id: '1', icon: 'card-outline', label: 'Phương thức thanh toán', color: '#00BCD4', bgColor: '#e3f2fd', route: '/payment-methods' },
    { id: '2', icon: 'star-outline', label: 'Đánh giá của tôi', color: '#ff9800', bgColor: '#fff3e0', route: '/reviews' },
    { id: '3', icon: 'lock-closed-outline', label: 'Đổi mật khẩu', color: '#e91e63', bgColor: '#fce4ec' },
    { id: '4', icon: 'help-circle-outline', label: 'Trung tâm hỗ trợ', color: '#4caf50', bgColor: '#e8f5e9' },
    { id: '5', icon: 'information-circle-outline', label: 'Điều khoản và Chính sách', color: '#9c27b0', bgColor: '#f3e5f5' },
  ];

  const handleLogoutPress = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 [PROFILE] Logging out...');
              
              // Hiển thị toast đang đăng xuất
              setToast({
                visible: true,
                type: 'info',
                title: 'Đang đăng xuất...',
                message: `Tạm biệt, ${userInfo.name}!`,
              });
              
              // Đợi 1 giây để hiển thị toast
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              await logout();
              console.log('✅ [PROFILE] Logout successful, redirecting to login...');
              
              // Hiển thị toast thành công
              setToast({
                visible: true,
                type: 'success',
                title: 'Đăng xuất thành công',
                message: 'Hẹn gặp lại bạn!',
              });
              
              // Đợi thêm 1 giây để hiển thị toast thành công rồi chuyển trang
              setTimeout(() => {
                router.replace('/login');
              }, 1000);
            } catch (error) {
              console.error('❌ [PROFILE] Logout error:', error);
              setToast({
                visible: true,
                type: 'error',
                title: 'Lỗi đăng xuất',
                message: 'Không thể đăng xuất. Vui lòng thử lại!',
              });
            }
          },
        },
      ]
    );
  };

  const handleOptionPress = (optionLabel: string) => {
    switch (optionLabel) {
      case 'Phương thức thanh toán':
        router.push('/payment-methods');
        break;
      case 'Đánh giá của tôi':
        router.push('/reviews');
        break;
      case 'Đổi mật khẩu':
        router.push('/change-password');
        break;
      case 'Trung tâm hỗ trợ':
        router.push('/support-center');
        break;
      case 'Điều khoản và Chính sách':
        router.push('/terms-policy');
        break;
    }
  };

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
            <Text style={styles.headerTitle}>Hồ sơ</Text>
            <TouchableOpacity onPress={() => router.push('/edit-profile')}>
              <Ionicons name="create-outline" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleChangeAvatar}
            >
              <Image
                source={avatar}
                style={styles.avatar}
              />
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userRole}>Thành viên</Text>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={14} color="#64748b" />
                <Text style={styles.contactText}>{userInfo.phone}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>12</Text>
              <Text style={styles.quickStatLabel}>Lịch hẹn</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>8</Text>
              <Text style={styles.quickStatLabel}>Đã khám</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>5</Text>
              <Text style={styles.quickStatLabel}>Đánh giá</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            {personalInfo.map((info) => (
              <View key={info.id} style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name={info.icon as any} size={20} color={info.color} />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý</Text>
          
          <View style={styles.menuCard}>
            {otherOptions.map((option, index) => (
              <View key={option.id}>
                {index > 0 && <View style={styles.menuDivider} />}
                <TouchableOpacity 
                  style={styles.menuRow}
                  onPress={() => handleOptionPress(option.label)}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconWrapper, { 
                      backgroundColor: option.bgColor 
                    }]}>
                      <Ionicons name={option.icon as any} size={22} color={option.color} />
                    </View>
                    <Text style={styles.menuTitle}>
                      {option.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            ))}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
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
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
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
    borderWidth: 2,
    borderColor: '#00BCD4',
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
    width: 2,
    backgroundColor: '#b3e5fc',
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
