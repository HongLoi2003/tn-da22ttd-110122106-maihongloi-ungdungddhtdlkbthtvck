import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getDocumentsWithQuery } from '../services/firebaseService';

interface Review {
  id: string;
  patientId?: string;
  patientName: string;
  patientAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  appointmentDate: string;
  helpful: number;
}

export default function DoctorReviews() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    averageRating: 4.8,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0,
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      // Toggle helpful state
      const isCurrentlyHelpful = helpfulReviews.has(reviewId);
      const newHelpfulReviews = new Set(helpfulReviews);
      
      if (isCurrentlyHelpful) {
        newHelpfulReviews.delete(reviewId);
      } else {
        newHelpfulReviews.add(reviewId);
      }
      
      setHelpfulReviews(newHelpfulReviews);
      
      // Update review in state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + (isCurrentlyHelpful ? -1 : 1) }
            : review
        )
      );
      
      // Update in Firebase
      const { updateDocument } = await import('../services/firebaseService');
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        await updateDocument('reviews', reviewId, {
          helpful: review.helpful + (isCurrentlyHelpful ? -1 : 1)
        });
      }
    } catch (error) {
      console.error('❌ Error updating helpful count:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      // ✅ Use display doctor ID for reviews
      const displayDoctorId = (userData?.doctorInfo as any)?.doctorId;
      
      if (!displayDoctorId) {
        console.log('❌ No doctorId found');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading reviews for doctor:', displayDoctorId);
      
      // Load reviews from Firebase
      const reviewsData = await getDocumentsWithQuery('reviews', [
        where('doctorId', '==', displayDoctorId)
      ]);
      
      console.log('✅ Loaded', reviewsData.length, 'reviews');
      
      if (reviewsData.length > 0) {
        // Get unique patient IDs
        const patientIds = [...new Set(reviewsData.map((r: any) => r.patientId || r.userId).filter(Boolean))];
        console.log('👥 Found', patientIds.length, 'unique patients');
        
        // Load patient info for all patients
        const patientsMap = new Map<string, any>();
        
        for (const patientId of patientIds) {
          try {
            const patients = await getDocumentsWithQuery('users', [
              where('uid', '==', patientId)
            ]);
            
            if (patients.length > 0) {
              patientsMap.set(patientId, patients[0]);
              console.log('✅ Loaded patient:', (patients[0] as any).fullName);
            }
          } catch (error) {
            console.error('❌ Error loading patient:', patientId, error);
          }
        }
        
        // Map Firebase data to Review interface with real patient names
        const mappedReviews: Review[] = reviewsData.map((r: any) => {
          const patientId = r.patientId || r.userId;
          const patientInfo = patientId ? patientsMap.get(patientId) : null;
          
          return {
            id: r.id,
            patientId: patientId,
            patientName: patientInfo?.fullName || r.patientName || 'Bệnh nhân',
            patientAvatar: patientInfo?.avatar || r.patientAvatar,
            rating: r.rating || 5,
            comment: r.comment || '',
            date: r.date || 'Gần đây',
            appointmentDate: r.appointmentDate || '',
            helpful: r.helpful || 0,
          };
        });
        
        // Simply reverse the array to show newest first
        // (Firestore returns oldest first by default)
        const reversedReviews = [...mappedReviews].reverse();
        
        setReviews(reversedReviews);
        
        // Calculate stats from real data
        const total = reversedReviews.length;
        const sum = reversedReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = total > 0 ? sum / total : 0;
        
        setStats({
          averageRating: avg,
          totalReviews: total,
          fiveStars: reversedReviews.filter(r => r.rating === 5).length,
          fourStars: reversedReviews.filter(r => r.rating === 4).length,
          threeStars: reversedReviews.filter(r => r.rating === 3).length,
          twoStars: reversedReviews.filter(r => r.rating === 2).length,
          oneStars: reversedReviews.filter(r => r.rating === 1).length,
        });
      } else {
        // No reviews found
        console.log('⚠️  No reviews found for this doctor');
        setReviews([]);
        setStats({
          averageRating: 0,
          totalReviews: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStars: 0,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đánh giá của bệnh nhân</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của bệnh nhân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <Text style={styles.averageRating}>{stats.averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(stats.averageRating))}
            <Text style={styles.totalReviews}>{stats.totalReviews} đánh giá</Text>
          </View>
          
          <View style={styles.statsRight}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats[`${['', '', '', '', 'one', 'two', 'three', 'four', 'five'][star]}Stars` as keyof typeof stats] as number;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <View key={star} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{star}</Text>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.ratingCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Tất cả đánh giá ({reviews.length})</Text>
          
          {reviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
              <Text style={styles.emptyText}>
                Bạn chưa có đánh giá nào từ bệnh nhân. Đánh giá sẽ xuất hiện sau khi bệnh nhân hoàn thành lịch khám.
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewHeaderLeft}>
                    {review.patientAvatar ? (
                      <Image 
                        source={{ uri: review.patientAvatar }} 
                        style={styles.patientAvatarImage}
                      />
                    ) : (
                      <View style={styles.patientAvatar}>
                        <Text style={styles.patientAvatarText}>
                          {review.patientName?.charAt(0) || 'P'}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.patientName}>{review.patientName}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                  {renderStars(review.rating)}
                </View>
                
                <Text style={styles.reviewComment}>{review.comment}</Text>
                
                <View style={styles.reviewFooter}>
                  <TouchableOpacity 
                    style={[
                      styles.helpfulButton,
                      helpfulReviews.has(review.id) && styles.helpfulButtonActive
                    ]}
                    onPress={() => handleHelpfulClick(review.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={helpfulReviews.has(review.id) ? "thumbs-up" : "thumbs-up-outline"} 
                      size={14} 
                      color={helpfulReviews.has(review.id) ? "#3b82f6" : "#64748b"} 
                    />
                    <Text style={[
                      styles.helpfulText,
                      helpfulReviews.has(review.id) && styles.helpfulTextActive
                    ]}>
                      Hữu ích ({review.helpful})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 13,
    color: '#64748b',
  },
  statsRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    width: 12,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748b',
    width: 24,
    textAlign: 'right',
  },
  reviewsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  patientAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
  },
  reviewComment: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#64748b',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  helpfulButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  helpfulText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  helpfulTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
