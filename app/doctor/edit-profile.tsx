import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateDocument } from '../services/firebaseService';

// Mapping ảnh bác sĩ - 16 ảnh thật từ Pexels (chất lượng cao, miễn phí bản quyền)
const doctorImages: any = {
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
};

export default function EditDoctorProfile() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hospital, setHospital] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [fee, setFee] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState(''); // For uploaded photo
  const [doctorFirebaseId, setDoctorFirebaseId] = useState('');

  useEffect(() => {
    loadDoctorInfo();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      console.log('Camera or media library permissions not granted');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setCustomAvatar(imageUri);
        console.log('✅ Image selected from gallery');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setCustomAvatar(imageUri);
        console.log('✅ Photo taken');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Thay đổi ảnh đại diện',
      'Chọn ảnh từ thư viện hoặc chụp ảnh mới',
      [
        {
          text: 'Chụp ảnh',
          onPress: takePhoto,
        },
        {
          text: 'Chọn từ thư viện',
          onPress: pickImageFromGallery,
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ]
    );
  };

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
        
        setDoctorFirebaseId(doctor.id);
        setFullName((doctor as any).ten || '');
        setSpecialty((doctor as any).chuyen_khoa || '');
        setPhone((doctor as any).so_dien_thoai || '');
        setEmail(userData?.email || '');
        setHospital((doctor as any).benh_vien || '');
        setExperience((doctor as any).kinh_nghiem?.toString() || '');
        setEducation((doctor as any).hoc_van || '');
        setFee((doctor as any).gia_kham?.toString() || '');
        setAvatar((doctor as any).hinh_anh || '');
        
        // Load custom avatar from users collection
        if (userData?.avatar) {
          setCustomAvatar(userData.avatar);
          console.log('✅ Custom avatar loaded from users collection');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading doctor info:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving doctor info...');

      if (!doctorFirebaseId) {
        console.log('❌ No doctor Firebase ID');
        setSaving(false);
        return;
      }

      // Cập nhật thông tin trong doctors collection
      await updateDocument('doctors', doctorFirebaseId, {
        ten: fullName,
        chuyen_khoa: specialty,
        so_dien_thoai: phone,
        benh_vien: hospital,
        kinh_nghiem: parseInt(experience) || 0,
        hoc_van: education,
        gia_kham: parseInt(fee) || 0,
        hinh_anh: avatar,
      });

      // Update custom avatar in users collection if changed
      if (customAvatar && userData?.uid) {
        console.log('💾 Updating custom avatar in users collection...');
        await updateDocument('users', userData.uid, {
          avatar: customAvatar,
          fullName: fullName, // Also update name
        });
        console.log('✅ Custom avatar updated');
      }

      console.log('✅ Doctor info updated successfully');
      
      Alert.alert('Thành công', 'Thông tin đã được cập nhật!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
      
      setSaving(false);
    } catch (error) {
      console.error('❌ Error saving doctor info:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại!');
      setSaving(false);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
          >
            <Image 
              source={
                customAvatar 
                  ? { uri: customAvatar } 
                  : (avatar ? doctorImages[avatar] : doctorImages['nguyenvanam.png'])
              } 
              style={styles.avatar} 
            />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={showImagePickerOptions}
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chuyên khoa</Text>
            <TextInput
              style={styles.input}
              value={specialty}
              onChangeText={setSpecialty}
              placeholder="Nhập chuyên khoa"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.hint}>Email không thể thay đổi</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bệnh viện</Text>
            <TextInput
              style={styles.input}
              value={hospital}
              onChangeText={setHospital}
              placeholder="Nhập tên bệnh viện"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kinh nghiệm (năm)</Text>
            <TextInput
              style={styles.input}
              value={experience}
              onChangeText={setExperience}
              placeholder="Nhập số năm kinh nghiệm"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Học vấn</Text>
            <TextInput
              style={styles.input}
              value={education}
              onChangeText={setEducation}
              placeholder="Nhập trình độ học vấn"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phí khám (VNĐ)</Text>
            <TextInput
              style={styles.input}
              value={fee}
              onChangeText={setFee}
              placeholder="Nhập phí khám"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#f1f5f9',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    fontSize: 12,
    color: '#64748b',
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  saveButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});
