import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getAllDocuments } from './services/firebaseService';
import { getImageSource } from './utils/imageHelper';

const hospitalImages: any = {
  'benhvien.png': require('../assets/images/benhviendhtv.png'),
  'benhviendhtv.png': require('../assets/images/benhviendhtv.png'),
};

// Helper function
function getDoctorAvatarSmart(doctorName: string, imageUrl?: string) {
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return { uri: imageUrl };
  }
  return getImageSource('logo.png', 'common');
}

export default function HospitalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState('info');
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [hospitalData, setHospitalData] = useState<any>(null);
  const [loadingHospital, setLoadingHospital] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadHospital();
    loadDoctors();
  }, [params.id]);

  const loadHospital = async () => {
    try {
      setLoadingHospital(true);
      const hospitalsData = await getAllDocuments('hospitals');
      const hospital = hospitalsData.find((h: any) => h.id === params.id);
      
      if (hospital) {
        setHospitalData(hospital);
        console.log('Loaded hospital:', hospital);
      } else {
        console.warn('Hospital not found:', params.id);
        // Fallback to default
        setHospitalData({
          id: params.id,
          name: params.name || 'Bệnh viện',
          address: 'Địa chỉ',
          phone: '0000000000',
          email: 'email@hospital.vn',
          website: 'www.hospital.vn',
          rating: 4.6,
          reviewCount: 0,
          specialties: [],
          services: [],
        });
      }
    } catch (error) {
      console.error('Error loading hospital:', error);
      setHospitalData({
        id: params.id,
        name: params.name || 'Bệnh viện',
        address: 'Địa chỉ',
        phone: '0000000000',
        email: 'email@hospital.vn',
        website: 'www.hospital.vn',
        rating: 4.6,
        reviewCount: 0,
        specialties: [],
        services: [],
      });
    } finally {
      setLoadingHospital(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const data = await getAllDocuments('doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const iconMap: { [key: string]: string } = {
      'Tim mạch': '❤️',
      'Tiêu hóa': '🫁',
      'Nhi khoa': '👶',
      'Thần kinh': '🧠',
      'Cơ xương khớp': '🦴',
      'Xương khớp': '🦴',
      'Da liễu': '🧴',
      'Tai mũi họng': '👂',
      'Mắt': '👁️',
      'Răng hàm mặt': '🦷',
      'Nội tiết': '⚕️',
      'Hô hấp': '🫁',
      'Sản phụ khoa': '🤰',
      'Sơ sinh': '👶',
      'Hô hấp nhi': '🫁',
      'Tim mạch nhi': '❤️',
      'Tiêu hóa nhi': '🫁',
      'Vô sinh - Hiếm muộn': '👨‍👩‍👧',
      'Phụ khoa': '👩',
      'Thẩm mỹ da': '💄',
      'Laser': '✨',
      'Điều trị mụn': '🧴',
      'Chấn thương chỉnh hình': '🦴',
      'Ngoại khoa': '🏥',
      'Nội khoa': '🏥',
      'Ung bướu': '🏥',
      'Thận - Tiết niệu': '🏥',
      'Nội soi': '🔍',
      'Siêu âm 4D': '📡',
      'Sinh thường': '👶',
      'Sinh mổ': '🏥',
      'Điều trị vô sinh': '👨‍👩‍👧',
      'Vật lý trị liệu': '💪',
    };
    return iconMap[specialty] || '🏥';
  };

  const hospital = hospitalData ? {
    ...hospitalData,
    image: hospitalImages[hospitalData.image] || require('../assets/images/benhviendhtv.png'),
    distance: hospitalData.distance || '0 km',
    reviews: hospitalData.reviewCount || 0,
    openTime: hospitalData.workingHours || '24/7',
  } : {
    name: 'Bệnh viện',
    distance: '0 km',
    address: 'Địa chỉ',
    phone: '0000000000',
    email: 'email@hospital.vn',
    website: 'www.hospital.vn',
    image: require('../assets/images/benhviendhtv.png'),
    rating: 4.6,
    reviews: 0,
    openTime: '24/7',
    specialties: [],
    services: [],
  };

  const specialties = (hospital.specialties && Array.isArray(hospital.specialties)) 
    ? [...new Set(hospital.specialties)] // Loại bỏ duplicate bằng Set
    : [
        'Tim mạch',
        'Tiêu hóa',
        'Nhi khoa',
        'Thần kinh',
        'Cơ xương khớp',
        'Da liễu',
      ];

  const services = (hospital.services && Array.isArray(hospital.services))
    ? [...new Set(hospital.services)] // Loại bỏ duplicate bằng Set
    : [
        'Khám bệnh tổng quát',
        'Cấp cứu 24/7',
        'Xét nghiệm',
        'Chẩn đoán hình ảnh',
        'Phẫu thuật',
        'Điều trị nội trú',
      ];

  const reviews = [
    {
      id: 1,
      userName: 'Nguyễn Văn A',
      rating: 5,
      date: '15/01/2025',
      comment: 'Bệnh viện rất tốt, bác sĩ tận tình, cơ sở vật chất hiện đại. Rất hài lòng với dịch vụ.',
      avatar: require('../assets/images/logo.png'),
    },
    {
      id: 2,
      userName: 'Trần Thị B',
      rating: 4,
      date: '12/01/2025',
      comment: 'Nhân viên thân thiện, thời gian chờ hợp lý. Tuy nhiên giá khám hơi cao.',
      avatar: require('../assets/images/logo.png'),
    },
    {
      id: 3,
      userName: 'Lê Văn C',
      rating: 5,
      date: '10/01/2025',
      comment: 'Đội ngũ y bác sĩ chuyên nghiệp, trang thiết bị y tế đầy đủ. Rất đáng tin cậy.',
      avatar: require('../assets/images/logo.png'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={hospital.image} style={styles.headerImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive
            ]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        {/* Hospital Info */}
        <View style={styles.infoSection}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <Text style={styles.ratingText}>
                {hospital.rating} ({hospital.reviews} đánh giá)
              </Text>
            </View>
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.distanceText}>{hospital.distance}</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="location" size={20} color="#00BCD4" />
            <Text style={styles.contactText}>{hospital.address}</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="time" size={20} color="#00BCD4" />
            <Text style={styles.contactText}>Mở cửa: {hospital.openTime}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call" size={20} color="#00BCD4" />
              <Text style={styles.actionButtonText}>Gọi điện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="navigate" size={20} color="#00BCD4" />
              <Text style={styles.actionButtonText}>Chỉ đường</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social" size={20} color="#00BCD4" />
              <Text style={styles.actionButtonText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
            onPress={() => setSelectedTab('info')}
          >
            <Text style={[styles.tabText, selectedTab === 'info' && styles.tabTextActive]}>
              Thông tin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'doctors' && styles.tabActive]}
            onPress={() => setSelectedTab('doctors')}
          >
            <Text style={[styles.tabText, selectedTab === 'doctors' && styles.tabTextActive]}>
              Bác sĩ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reviews' && styles.tabActive]}
            onPress={() => setSelectedTab('reviews')}
          >
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.tabTextActive]}>
              Đánh giá
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'info' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chuyên khoa</Text>
              <View style={styles.specialtyGrid}>
                {(hospital.specialties || []).map((specialty: string, index: number) => (
                  <View key={index} style={styles.specialtyItem}>
                    <View style={styles.specialtyIcon}>
                      <Text style={styles.specialtyEmoji}>
                        {getSpecialtyIcon(specialty)}
                      </Text>
                    </View>
                    <Text style={styles.specialtyName}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dịch vụ</Text>
              {services.map((service: any, index: number) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Liên hệ</Text>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.contactItemText}>{hospital.phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.contactItemText}>{hospital.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="globe-outline" size={20} color="#666" />
                <Text style={styles.contactItemText}>{hospital.website}</Text>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'doctors' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đội ngũ bác sĩ</Text>
            {loadingDoctors ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00BCD4" />
              </View>
            ) : doctors.length === 0 ? (
              <Text style={styles.comingSoon}>Không có bác sĩ nào</Text>
            ) : (
              doctors.map((doctor) => (
                <TouchableOpacity 
                  key={doctor.id} 
                  style={styles.doctorCard}
                  onPress={() => router.push({
                    pathname: '/doctor-detail',
                    params: {
                      id: doctor.id,
                      name: doctor.ten,
                      specialty: doctor.chuyen_khoa,
                      image: doctor.image,
                    }
                  })}
                >
                  <Image source={getDoctorAvatarSmart(doctor.ten, doctor.image)} style={styles.doctorAvatar} />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.ten}</Text>
                    <Text style={styles.doctorSpecialty}>{doctor.chuyen_khoa}</Text>
                    <View style={styles.doctorRating}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.doctorRatingText}>{doctor.rating}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => router.push({
                      pathname: '/doctor-detail',
                      params: {
                        id: doctor.id,
                        name: doctor.ten,
                        specialty: doctor.chuyen_khoa,
                        image: doctor.image,
                      }
                    })}
                  >
                    <Text style={styles.bookButtonText}>Đặt khám</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selectedTab === 'reviews' && (
          <>
            <View style={styles.section}>
              <View style={styles.reviewHeader}>
                <Text style={styles.sectionTitle}>Đánh giá từ bệnh nhân</Text>
                <TouchableOpacity 
                  style={styles.writeReviewButton}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Ionicons name="create-outline" size={18} color="#00BCD4" />
                  <Text style={styles.writeReviewText}>Viết đánh giá</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ratingOverview}>
                <View style={styles.ratingScore}>
                  <Text style={styles.ratingScoreNumber}>{hospital.rating}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= hospital.rating ? 'star' : 'star-outline'}
                        size={16}
                        color="#FFB800"
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingCount}>{hospital.reviews} đánh giá</Text>
                </View>
              </View>

              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={review.avatar} style={styles.reviewAvatar} />
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUserName}>{review.userName}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#FFB800"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.bookingButton}
          onPress={() => router.push('/(tabs)/booking')}
        >
          <Text style={styles.bookingButtonText}>Đặt lịch khám</Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      {showReviewModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viết đánh giá</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.reviewForm}>
              <Text style={styles.reviewFormLabel}>Đánh giá của bạn</Text>
              <View style={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setUserRating(star)}
                  >
                    <Ionicons
                      name={star <= userRating ? 'star' : 'star-outline'}
                      size={32}
                      color="#FFB800"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.reviewFormLabel}>Nhận xét</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Chia sẻ trải nghiệm của bạn về bệnh viện..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={reviewText}
                onChangeText={setReviewText}
                textAlignVertical="top"
              />

              <TouchableOpacity 
                style={styles.submitReviewButton}
                onPress={() => {
                  if (userRating > 0 && reviewText.trim()) {
                    alert('Cảm ơn bạn đã đánh giá!');
                    setUserRating(0);
                    setReviewText('');
                    setShowReviewModal(false);
                  } else {
                    alert('Vui lòng chọn số sao và nhập nhận xét');
                  }
                }}
              >
                <Text style={styles.submitReviewButtonText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#E91E63',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00BCD4',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#00BCD4',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  specialtyItem: {
    width: '30%',
    alignItems: 'center',
  },
  specialtyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialtyEmoji: {
    fontSize: 30,
  },
  specialtyName: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactItemText: {
    fontSize: 14,
    color: '#333',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorRatingText: {
    fontSize: 13,
    color: '#666',
  },
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00BCD4',
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  ratingOverview: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  ratingScore: {
    alignItems: 'center',
  },
  ratingScoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#00BCD4',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 13,
    color: '#666',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  reviewForm: {
    padding: 16,
  },
  reviewFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starRating: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  submitReviewButton: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitReviewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookingButton: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  comingSoon: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 32,
  },
});
