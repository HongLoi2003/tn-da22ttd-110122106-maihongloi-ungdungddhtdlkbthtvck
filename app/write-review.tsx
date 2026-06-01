import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomToast from './components/CustomToast';
import { useAuth } from './context/AuthContext';
import { createDocument, getDocumentById } from './services/firebaseService';

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

export default function WriteReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  // Hàm tìm ảnh bác sĩ dựa trên tên
  const getDoctorImage = (doctorName: string, imageField?: string) => {
    // Nếu có trường image và tồn tại trong mapping
    if (imageField && doctorImages[imageField]) {
      return doctorImages[imageField];
    }

    // Tạo tên file từ tên bác sĩ
    const cleanName = doctorName
      .replace('BS. ', '')
      .replace('Bs. ', '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '');

    // Thử các định dạng file
    const possibleFiles = [
      `${cleanName}.png`,
      `${cleanName}.jpg`,
    ];

    for (const file of possibleFiles) {
      if (doctorImages[file]) {
        return doctorImages[file];
      }
    }

    return null;
  };

  useEffect(() => {
    loadAppointment();
  }, [params.appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      if (params.appointmentId) {
        const data = await getDocumentById('appointments', params.appointmentId as string);
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const tags = [
    'Tận tâm',
    'Chuyên nghiệp',
    'Giải thích rõ ràng',
    'Thân thiện',
    'Kỹ lưỡng',
    'Nhanh chóng',
    'Tư vấn tốt',
    'Nhiệt tình',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nhận xét');
      return;
    }

    if (!user || !appointment) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      await createDocument('reviews', {
        userId: user.uid,
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        doctor: appointment.doctor,
        specialty: appointment.specialty,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        date: new Date().toLocaleDateString('vi-VN'),
      });

      // Hiển thị toast thành công với tên bác sĩ
      setToast({
        visible: true,
        type: 'success',
        title: 'Đánh giá thành công!',
        message: `Cảm ơn bạn đã đánh giá ${appointment.doctor}`,
      });

      // Quay lại sau 2 giây
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setToast({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể gửi đánh giá. Vui lòng thử lại!',
      });
    } finally {
      setSubmitting(false);
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết đánh giá</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : !appointment ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy thông tin lịch hẹn</Text>
          </View>
        ) : (
          <>
        {/* Doctor Info */}
        <View style={styles.doctorCard}>
          {getDoctorImage(appointment.doctor, appointment.image) ? (
            <Image
              source={getDoctorImage(appointment.doctor, appointment.image)}
              style={styles.doctorAvatar}
            />
          ) : (
            <View style={styles.doctorAvatarPlaceholder}>
              <Text style={styles.doctorAvatarText}>
                {appointment.doctor?.replace('BS. ', '').replace('Bs. ', '').charAt(0)?.toUpperCase() || 'BS'}
              </Text>
            </View>
          )}
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{appointment.doctor}</Text>
            <Text style={styles.specialty}>{appointment.specialty}</Text>
            <Text style={styles.appointmentDate}>Khám ngày: {appointment.date}</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color="#FFB800"
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 && 'Xuất sắc'}
              {rating === 4 && 'Tốt'}
              {rating === 3 && 'Trung bình'}
              {rating === 2 && 'Tệ'}
              {rating === 1 && 'Rất tệ'}
            </Text>
          )}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bác sĩ có điểm gì nổi bật?</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhận xét chi tiết</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn về bác sĩ..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{comment.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
          </>
        )}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  doctorAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00BCD4',
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFB800',
    textAlign: 'center',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagSelected: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  tagTextSelected: {
    color: '#fff',
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
  },
});
