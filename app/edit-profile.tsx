import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CustomToast from './components/CustomToast';
import { useAuth } from './context/AuthContext';
import { calculateAge } from './utils/dateHelper';

export default function EditProfileScreen() {
  const router = useRouter();
  const { userData, updateUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodType: '',
    height: '',
    weight: '',
    insuranceCode: '',
    avatar: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: userData.address || '',
        bloodType: userData.bloodType || '',
        height: userData.height?.toString() || '',
        weight: userData.weight?.toString() || '',
        insuranceCode: userData.insuranceCode || '',
        avatar: userData.avatar || '',
      });
      
      // Tính tuổi từ ngày sinh
      if (userData.dateOfBirth) {
        const age = calculateAge(userData.dateOfBirth);
        setCalculatedAge(age > 0 ? age : null);
      }
    }
  }, [userData]);

  // Tự động tính tuổi khi người dùng nhập ngày sinh
  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      setCalculatedAge(age > 0 ? age : null);
      console.log('✅ [EDIT_PROFILE] Calculated age:', age);
    } else {
      setCalculatedAge(null);
    }
  }, [formData.dateOfBirth]);

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
                setFormData({ ...formData, avatar: result.assets[0].uri });
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
                setFormData({ ...formData, avatar: result.assets[0].uri });
              }
            }
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên và số điện thoại');
      return;
    }

    setLoading(true);
    try {
      await updateUserData({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bloodType: formData.bloodType,
        height: formData.height ? parseInt(formData.height) : 0,
        weight: formData.weight ? parseInt(formData.weight) : 0,
        insuranceCode: formData.insuranceCode,
        avatar: formData.avatar,
      });
      
      // Hiển thị toast thành công
      setToast({
        visible: true,
        type: 'success',
        title: 'Cập nhật thành công!',
        message: 'Thông tin cá nhân đã được lưu',
      });
      
      // Quay lại sau 2 giây
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Update profile error:', error);
      setToast({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật thông tin. Vui lòng thử lại!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.avatar ? (
              <Image
                source={{ uri: formData.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={handleChangeAvatar}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Nhập họ và tên"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: '#f1f5f9' }]}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={[styles.input, { color: '#94a3b8' }]}
                value={formData.email}
                placeholder="Email"
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>Email không thể thay đổi</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                placeholder="DD/MM/YYYY"
              />
            </View>
            {calculatedAge !== null && (
              <Text style={styles.ageHint}>Tuổi: {calculatedAge} tuổi</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowGenderPicker(!showGenderPicker)}
            >
              <Ionicons name="male-female-outline" size={20} color="#64748b" />
              <Text style={[styles.input, { paddingTop: 12, color: formData.gender ? '#0f172a' : '#94a3b8' }]}>
                {formData.gender || 'Chọn giới tính'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            {showGenderPicker && (
              <View style={styles.pickerContainer}>
                {['Nam', 'Nữ', 'Khác'].map((gender) => (
                  <TouchableOpacity 
                    key={gender}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, gender });
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={styles.pickerText}>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Nhập địa chỉ"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nhóm máu</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="water-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.bloodType}
                onChangeText={(text) => setFormData({ ...formData, bloodType: text })}
                placeholder="Ví dụ: O+, A+, B+, AB+"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mã số BHYT</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                value={formData.insuranceCode}
                onChangeText={(text) => setFormData({ ...formData, insuranceCode: text })}
                placeholder="Nhập mã số bảo hiểm y tế"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Chiều cao (cm)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="resize-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  placeholder="170"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="fitness-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  placeholder="65"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#00BCD4',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00BCD4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  ageHint: {
    fontSize: 12,
    color: '#00BCD4',
    marginTop: 4,
    fontWeight: '500',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerText: {
    fontSize: 14,
    color: '#0f172a',
  },
});
