import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

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

export default function ReviewsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorAvatars, setDoctorAvatars] = useState<{ [key: string]: any }>({});

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [user])
  );

  const loadReviews = async () => {
    try {
      setLoading(true);
      if (!user) {
        setMyReviews([]);
        setPendingReviews([]);
        return;
      }
      
      // Lấy đánh giá đã viết
      const reviews = await getDocumentsWithQuery('reviews', [
        where('userId', '==', user.uid)
      ]);
      const sortedReviews = reviews.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setMyReviews(sortedReviews);

      // Lấy lịch hẹn chưa đánh giá
      const appointments = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid),
        where('status', '==', 'completed')
      ]);
      
      // Lọc những lịch hẹn chưa có đánh giá
      const reviewedAppointmentIds = reviews.map((r: any) => r.appointmentId);
      const pending = appointments.filter((apt: any) => 
        !reviewedAppointmentIds.includes(apt.id)
      );
      setPendingReviews(pending);

      // Load doctor avatars
      await loadDoctorAvatars([...sortedReviews, ...pending]);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setMyReviews([]);
      setPendingReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorAvatars = async (items: any[]) => {
    try {
      const { getDocumentById } = await import('./services/firebaseService');
      const avatarMap: { [key: string]: any } = {};
      
      // Get unique doctor IDs
      const doctorIds = [...new Set(items.map(item => item.doctorId).filter(Boolean))];
      
      for (const doctorId of doctorIds) {
        try {
          const doctor = await getDocumentById('doctors', doctorId);
          if (doctor) {
            const imageField = (doctor as any).hinh_anh || (doctor as any).image;
            if (imageField && doctorImages[imageField]) {
              avatarMap[doctorId] = doctorImages[imageField];
            }
          }
        } catch (error) {
          console.log('Could not load doctor avatar:', doctorId);
        }
      }
      
      setDoctorAvatars(avatarMap);
    } catch (error) {
      console.error('Error loading doctor avatars:', error);
    }
  };

  const getDoctorAvatar = (doctorId: string) => {
    return doctorAvatars[doctorId] || require('@/assets/images/logo.png');
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (myReviews.length === 0) return 0;
    const sum = myReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / myReviews.length).toFixed(1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : (
          <>
        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{myReviews.length}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>{calculateAverageRating()}</Text>
              <Ionicons name="star" size={24} color="#FFB800" />
            </View>
            <Text style={styles.statLabel}>Trung bình</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingReviews.length}</Text>
            <Text style={styles.statLabel}>Chờ đánh giá</Text>
          </View>
        </View>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chờ đánh giá</Text>
            {pendingReviews.map((review) => (
              <TouchableOpacity key={review.id} style={styles.pendingCard}>
                <Image
                  source={getDoctorAvatar(review.doctorId)}
                  style={styles.doctorAvatar}
                />
                <View style={styles.pendingInfo}>
                  <Text style={styles.doctorName}>{review.doctor}</Text>
                  <Text style={styles.specialty}>{review.specialty}</Text>
                  <Text style={styles.reviewDate}>Khám ngày: {review.date}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.reviewButton}
                  onPress={() => router.push(`/write-review?appointmentId=${review.id}`)}
                >
                  <Text style={styles.reviewButtonText}>Đánh giá</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của tôi</Text>
          {myReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={getDoctorAvatar(review.doctorId)}
                  style={styles.doctorAvatar}
                />
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.doctorName}>{review.doctor}</Text>
                  <Text style={styles.specialty}>{review.specialty}</Text>
                  {renderStars(review.rating)}
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>

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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  pendingInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  reviewButton: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  moreButton: {
    padding: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
