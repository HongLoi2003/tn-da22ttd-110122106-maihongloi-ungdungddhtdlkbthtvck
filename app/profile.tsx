import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const quickActions = [
    { id: '1', icon: 'calendar', label: 'Hồ sơ y tế', color: '#00BCD4' },
    { id: '2', icon: 'shield-checkmark', label: 'Bảo hiểm', color: '#06D6A0' },
    { id: '3', icon: 'card', label: 'Thanh toán', color: '#00BCD4' },
    { id: '4', icon: 'star', label: 'Đánh giá', color: '#FFB800' },
  ];

  const personalInfo = [
    { id: '1', icon: 'person-outline', label: 'Họ và tên', value: 'Nguyễn Mai Loan', color: '#00BCD4' },
    { id: '2', icon: 'call-outline', label: 'Số điện thoại', value: '0987 654 321', color: '#00BCD4' },
    { id: '3', icon: 'mail-outline', label: 'Email', value: 'mailoan@gmail.com', color: '#00BCD4' },
    { id: '4', icon: 'calendar-outline', label: 'Ngày sinh', value: '15/05/1998', color: '#00BCD4' },
    { id: '5', icon: 'male-female-outline', label: 'Giới tính', value: 'Nữ', color: '#00BCD4' },
    { id: '6', icon: 'location-outline', label: 'Địa chỉ', value: 'Hà Nội, Việt Nam', color: '#00BCD4' },
    { id: '7', icon: 'water-outline', label: 'Nhóm máu', value: 'O+', color: '#00BCD4' },
  ];

  const otherOptions = [
    { id: '1', icon: 'lock-closed-outline', label: 'Đổi mật khẩu', color: '#00BCD4' },
    { id: '2', icon: 'help-circle-outline', label: 'Trung tâm hỗ trợ', color: '#00BCD4' },
    { id: '3', icon: 'information-circle-outline', label: 'Điều khoản & Chính sách', color: '#00BCD4' },
    { id: '4', icon: 'log-out-outline', label: 'Đăng xuất', color: '#EF4444', isLogout: true },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cá nhân</Text>
          <Text style={styles.headerSubtitle}>Quản lý thông tin và tài khoản</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>Nguyễn Mai Loan</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Thành viên</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>0987 654 321</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>mailoan@gmail.com</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>15/05/1998</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>Hà Nội, Việt Nam</Text>
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
            <TouchableOpacity key={action.id} style={styles.quickActionItem}>
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
            <TouchableOpacity>
              <View style={styles.editButton}>
                <Ionicons name="create-outline" size={16} color="#00BCD4" />
                <Text style={styles.editButtonText}>Chỉnh sửa</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.infoList}>
            {personalInfo.map((info) => (
              <TouchableOpacity key={info.id} style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <View style={[styles.infoIcon, { backgroundColor: info.color + '20' }]}>
                    <Ionicons name={info.icon as any} size={20} color={info.color} />
                  </View>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                </View>
                <View style={styles.infoRight}>
                  <Text style={styles.infoValue}>{info.value}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khác</Text>
          <View style={styles.optionsList}>
            {otherOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionItem}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={20} color={option.color} />
                  </View>
                  <Text style={[styles.optionLabel, option.isLogout && { color: '#EF4444' }]}>
                    {option.label}
                  </Text>
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
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
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
