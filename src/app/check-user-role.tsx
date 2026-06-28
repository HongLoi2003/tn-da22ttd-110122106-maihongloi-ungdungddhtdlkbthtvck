import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getAllDocuments, updateDocument } from './services/firebaseService';

export default function CheckUserRoleScreen() {
  const router = useRouter();
  const { user, userData, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const users = await getAllDocuments('users');
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fixUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'doctor' ? 'patient' : 'patient';
      await updateDocument('users', userId, { role: newRole });
      Alert.alert('Thành công', `Đã cập nhật role thành: ${newRole}`);
      loadAllUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật role');
    }
  };

  const addRoleToUser = async (userId: string) => {
    try {
      await updateDocument('users', userId, { role: 'patient' });
      Alert.alert('Thành công', 'Đã thêm role: patient');
      loadAllUsers();
    } catch (error) {
      console.error('Error adding role:', error);
      Alert.alert('Lỗi', 'Không thể thêm role');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra User Role</Text>
        <TouchableOpacity onPress={loadAllUsers} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Current User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người dùng hiện tại</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>UID:</Text>
              <Text style={styles.infoValue}>{user?.uid || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên:</Text>
              <Text style={styles.infoValue}>{userData?.fullName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={[
                styles.infoValue,
                userData?.role === 'doctor' ? styles.doctorRole : styles.patientRole
              ]}>
                {userData?.role || 'KHÔNG CÓ ROLE'}
              </Text>
            </View>
          </View>
        </View>

        {/* All Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tất cả người dùng ({allUsers.length})</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#00BCD4" style={styles.loader} />
          ) : (
            allUsers.map((u, index) => (
              <View key={u.id || index} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.fullName || u.email}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>Role: </Text>
                    {u.role ? (
                      <Text style={[
                        styles.roleValue,
                        u.role === 'doctor' ? styles.doctorRole : styles.patientRole
                      ]}>
                        {u.role}
                      </Text>
                    ) : (
                      <Text style={styles.noRole}>KHÔNG CÓ</Text>
                    )}
                  </View>
                </View>
                <View style={styles.userActions}>
                  {u.role ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => fixUserRole(u.id, u.role)}
                    >
                      <Ionicons name="create" size={20} color="#00BCD4" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.addButton]}
                      onPress={() => addRoleToUser(u.id)}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
  doctorRole: {
    color: '#00BCD4',
    fontWeight: '700',
  },
  patientRole: {
    color: '#10b981',
    fontWeight: '700',
  },
  noRole: {
    color: '#ef4444',
    fontWeight: '700',
  },
  loader: {
    marginTop: 20,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  roleValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  addButton: {
    backgroundColor: '#00BCD4',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
