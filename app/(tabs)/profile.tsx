import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomToast from '../components/CustomToast';
import { useAuth } from '../context/AuthContext';
import { getAllDocuments } from '../services/firebaseService';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, userData, loading, user, updateUserData } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatar, setAvatar] = useState(
    userData?.avatar ? { uri: userData.avatar } : require('@/assets/images/logo.png')
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

  useFocusEffect(
    useCallback(() => {
      loadUnreadNotifications();
    }, [user])
  );

  const loadUnreadNotifications = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const allNotifications = await getAllDocuments('notifications');
      const userUnreadNotifications = allNotifications.filter(
        (n: any) => n.userId === user.uid && !n.read
      );
      setUnreadCount(userUnreadNotifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setUnreadCount(0);
    }
  };
  
  const userInfo = {
    name: userData?.fullName || 'Người dùng',
    phone: userData?.phone || 'Chưa cập nhật',
    email: userData?.email || 'Chưa cập nhật',
    birthDate: userData?.dateOfBirth || 'Chưa cập nhật',
    gender: userData?.gender || 'Chưa cập nhật',
    address: userData?.address || 'Chưa cập nhật',
    bloodType: userData?.bloodType || 'Chưa cập nhật',
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

  const quickActions = [
    { id: '1', icon: 'calendar', label: 'Hồ sơ y tế', color: '#00BCD4', route: '/medical-records' },
    { id: '2', icon: 'shield-checkmark', label: 'Bảo hiểm', color: '#06D6A0', route: '/insurance' },
    { id: '3', icon: 'card', label: 'Thanh toán', color: '#00BCD4', route: '/payment-methods' },
    { id: '4', icon: 'star', label: 'Đánh giá', color: '#FFB800', route: '/reviews' },
  ];

  const personalInfo = [
    { id: '1', icon: 'person-outline', label: 'Họ và tên', value: userInfo.name, color: '#00BCD4' },
    { id: '2', icon: 'call-outline', label: 'Số điện thoại', value: userInfo.phone, color: '#00BCD4' },
    { id: '3', icon: 'mail-outline', label: 'Email', value: userInfo.email, color: '#00BCD4' },
    { id: '4', icon: 'calendar-outline', label: 'Ngày sinh', value: userInfo.birthDate, color: '#00BCD4' },
    { id: '5', icon: 'male-female-outline', label: 'Giới tính', value: userInfo.gender, color: '#00BCD4' },
    { id: '6', icon: 'location-outline', label: 'Địa chỉ', value: userInfo.address, color: '#00BCD4' },
    { id: '7', icon: 'water-outline', label: 'Nhóm máu', value: userInfo.bloodType, color: '#00BCD4' },
  ];

  const otherOptions = [
    { id: '1', icon: 'lock-closed-outline', label: 'Đổi mật khẩu', color: '#00BCD4' },
    { id: '2', icon: 'cloud-upload-outline', label: 'Import Hồ Sơ Y Tế', color: '#8B5CF6', isDev: true },
    { id: '3', icon: 'help-circle-outline', label: 'Trung tâm hỗ trợ', color: '#00BCD4' },
    { id: '4', icon: 'information-circle-outline', label: 'Điều khoản & Chính sách', color: '#00BCD4' },
    { id: '5', icon: 'log-out-outline', label: 'Đăng xuất', color: '#EF4444', isLogout: true },
  ];

  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  const handleLogout = async () => {
    try {
      console.log('🚪 [PROFILE] Logging out...');
      
      // Hiển thị toast đang đăng xuất
      setToast({
        visible: true,
        type: 'info',
        title: 'Đang đăng xuất...',
        message: 'Hẹn gặp lại bạn!',
      });
      
      await logout();
      console.log('✅ [PROFILE] Logout successful, redirecting to login...');
      
      // Đợi 1 giây để hiển thị toast rồi chuyển trang
      setTimeout(() => {
        router.replace('/login');
      }, 1000);
    } catch (error) {
      console.error('❌ [PROFILE] Logout error:', error);
      setToast({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể đăng xuất. Vui lòng thử lại!',
      });
    }
  };

  const handleOptionPress = (optionLabel: string) => {
    switch (optionLabel) {
      case 'Đổi mật khẩu':
        router.push('/change-password');
        break;
      case 'Import Hồ Sơ Y Tế':
        router.push('/seed-medical-data');
        break;
      case 'Trung tâm hỗ trợ':
        router.push('/support-center');
        break;
      case 'Điều khoản & Chính sách':
        router.push('/terms-policy');
        break;
      case 'Đăng xuất':
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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cá nhân</Text>
          <Text style={styles.headerSubtitle}>Quản lý thông tin và tài khoản</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="settings-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => router.push('/notifications')}
          >
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleChangeAvatar}
            >
              <Image
                source={avatar}
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{userInfo.name}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Thành viên</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{userInfo.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{userInfo.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{userInfo.birthDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>{userInfo.address}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.quickActionItem}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity onPress={() => router.push('/edit-profile')}>
              <View style={styles.editButton}>
                <Ionicons name="create-outline" size={16} color="#00BCD4" />
                <Text style={styles.editButtonText}>Chỉnh sửa</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            {personalInfo.map((info) => (
              <View key={info.id} style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <View style={[styles.infoIcon, { backgroundColor: info.color + '20' }]}>
                    <Ionicons name={info.icon as any} size={20} color={info.color} />
                  </View>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                </View>
                <View style={styles.infoRight}>
                  <Text style={styles.infoValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khác</Text>
          <View style={styles.optionsList}>
            {otherOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.optionItem}
                onPress={() => handleOptionPress(option.label)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={20} color={option.color} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.optionLabel, option.isLogout && { color: '#EF4444' }]}>
                      {option.label}
                    </Text>
                    {option.isDev && (
                      <View style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>DEV</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    opacity: 0.9,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00BCD4',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  verifiedBadge: {
    backgroundColor: '#06D6A0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
  },
  arrowBtn: {
    padding: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  infoList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  optionsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
});
