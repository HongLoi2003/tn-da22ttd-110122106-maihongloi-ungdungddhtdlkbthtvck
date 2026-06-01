import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { getDoctorAvatarSmart } from './utils/doctorAvatars';

// Map hình ảnh chuyên khoa
const specialtyImages: any = {
  'tim-mach.png': require('@/assets/images/tim-mach.png'),
  'nhi-khoa.png': require('@/assets/images/nhi-khoa.png'),
  'san-phu-khoa.png': require('@/assets/images/san-phu-khoa.png'),
  'da-lieu.png': require('@/assets/images/da-lieu.png'),
  'mat.png': require('@/assets/images/mat.png'),
  'rang-ham-mat.png': require('@/assets/images/rang-ham-mat.png'),
  'tai-mui-hong.png': require('@/assets/images/tai-mui-hong.png'),
  'tieu-hoa.png': require('@/assets/images/tieu-hoa.png'),
  'than-kinh.png': require('@/assets/images/than-kinh.png'),
  'co-xuong-khop.png': require('@/assets/images/co-xuong-khop.png'),
  'ho-hap.png': require('@/assets/images/ho-hap.png'),
  'noi-tiet.png': require('@/assets/images/noi-tiet.png'),
  'khoa.png': require('@/assets/images/khoa.png'),
};

export default function SpecialtiesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [allSpecialties, setAllSpecialties] = useState<any[]>([]);
  const [popularSpecialties, setPopularSpecialties] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSpecialtiesData();
      loadUnreadNotifications();
    }, [])
  );

  const loadUnreadNotifications = async () => {
    try {
      const { auth } = await import('./config/firebase');
      const user = auth?.currentUser;
      
      if (!user) {
        setUnreadCount(0);
        return;
      }

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

  const loadSpecialtiesData = async () => {
    try {
      setLoading(true);
      
      const [allSpecialtiesData, popularData, doctorsData] = await Promise.all([
        getAllDocuments('specialties'),
        getAllDocuments('popular-specialties'),
        getAllDocuments('doctors'),
      ]);

      // Debug: Log dữ liệu bác sĩ để kiểm tra
      console.log('📊 Dữ liệu bác sĩ từ Firebase:', doctorsData);
      if (doctorsData.length > 0) {
        console.log('📋 Ví dụ bác sĩ đầu tiên:', doctorsData[0]);
        console.log('📋 Các trường có sẵn:', Object.keys(doctorsData[0]));
      }

      // Đếm số lượng bác sĩ theo chuyên khoa
      const doctorCountBySpecialty: Record<string, number> = {};
      doctorsData.forEach((doctor: any) => {
        const specialty = doctor.chuyen_khoa || doctor.chuyenKhoa;
        if (specialty) {
          doctorCountBySpecialty[specialty] = (doctorCountBySpecialty[specialty] || 0) + 1;
        }
      });

      // Cập nhật số lượng bác sĩ thực tế cho popular specialties
      const updatedPopularSpecialties = popularData.map((specialty: any) => {
        const actualDoctorCount = doctorCountBySpecialty[specialty.name] || 0;
        return {
          ...specialty,
          doctors: actualDoctorCount,
        };
      });

      // Loại bỏ chuyên khoa trùng lặp dựa trên tên
      const uniqueSpecialties = updatedPopularSpecialties.reduce((acc: any[], current: any) => {
        const exists = acc.find(item => item.name === current.name);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setAllSpecialties(allSpecialtiesData);
      setPopularSpecialties(uniqueSpecialties);
      
      // Lấy 6 bác sĩ nổi bật (rating cao nhất)
      const topDoctors = doctorsData
        .filter((doctor: any) => doctor.rating >= 4.5)
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
      
      setFeaturedDoctors(topDoctors);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading specialties data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuyên khoa</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <View style={styles.notificationBadge}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm chuyên khoa, triệu chứng, bệnh lý..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Quick Symptom Checker Banner */}
            <View style={styles.bannerContainer}>
              <View style={styles.bannerContent}>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Không chắc nên khám khoa nào?</Text>
                  <Text style={styles.bannerSubtitle}>Kiểm tra triệu chứng để được tư vấn</Text>
                </View>
                <TouchableOpacity 
                  style={styles.bannerButton}
                  onPress={() => router.push('/(tabs)/chat')}
                >
                  <Text style={styles.bannerButtonText}>Kiểm tra ngay</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Danh mục chuyên khoa - Grid 4 cột */}
            {popularSpecialties.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderNoButton}>
                  <Text style={styles.sectionTitle}>Danh mục chuyên khoa</Text>
                </View>
                <View style={styles.specialtiesGridNew}>
                  {popularSpecialties.map((specialty) => {
                    const imageName = specialty.image || 'khoa.png';
                    const imageSource = specialtyImages[imageName] || specialtyImages['khoa.png'];
                    
                    return (
                      <TouchableOpacity
                        key={specialty.id}
                        style={styles.specialtyItemNew}
                        onPress={() => router.push('/(tabs)/chat')}
                      >
                        <View style={styles.specialtyIconContainerNew}>
                          <Image source={imageSource} style={styles.specialtyIconNew} />
                        </View>
                        <Text style={styles.specialtyNameNew} numberOfLines={2}>
                          {specialty.name}
                        </Text>
                        <Text style={styles.specialtyDoctorsNew}>
                          {specialty.doctors} bác sĩ
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Featured Doctors */}
            {featuredDoctors.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bác sĩ nổi bật</Text>
                  <TouchableOpacity onPress={() => router.push('/all-doctors')}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
                {featuredDoctors.map((doctor, index) => {
                  const avatarSource = getDoctorAvatarSmart(
                    doctor.ten || doctor.name || doctor.ho_ten,
                    doctor.image || doctor.hinh_anh
                  );
                  const doctorName = doctor.ten || doctor.name || doctor.ho_ten || 'Bác sĩ';
                  const specialty = doctor.chuyen_khoa || doctor.chuyenKhoa || doctor.specialty || 'Đa khoa';
                  const experience = doctor.kinh_nghiem || doctor.experience || '5+';
                  const hospital = doctor.benh_vien || doctor.hospital || 'Bệnh viện Trường Đại học Trà Vinh';
                  const doctorImage = doctor.image || doctor.hinh_anh || 'logo.png';
                  const doctorPhone = doctor.sdt || doctor.phone || '';
                  
                  const handleChatPress = () => {
                    router.push({
                      pathname: '/doctor-chat',
                      params: { 
                        doctorId: doctor.id,
                        doctorName: `BS. ${doctorName}`,
                        doctorSpecialty: specialty,
                        doctorImage: doctorImage,
                        doctorPhone: doctorPhone
                      }
                    });
                  };
                  
                  return (
                    <TouchableOpacity 
                      key={`${doctor.id}-${index}`}
                      style={styles.doctorCard}
                      onPress={handleChatPress}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.doctorAvatarContainer}>
                          <Image source={avatarSource} style={styles.doctorAvatar} />
                          <View style={styles.onlineBadge} />
                        </View>
                        <View style={styles.doctorInfo}>
                          <View style={styles.doctorHeader}>
                            <Text style={styles.doctorName}>{doctorName}</Text>
                            <View style={styles.ratingBadge}>
                              <Ionicons name="star" size={12} color="#FFB800" />
                              <Text style={styles.ratingText}>{doctor.rating || 4.8}</Text>
                            </View>
                          </View>
                          <Text style={styles.specialty}>Chuyên khoa {specialty}</Text>
                          <View style={styles.doctorMeta}>
                            <View style={styles.metaItem}>
                              <Ionicons name="briefcase-outline" size={14} color="#64748b" />
                              <Text style={styles.metaText}>{experience} năm</Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Ionicons name="location-outline" size={14} color="#64748b" />
                              <Text style={styles.metaText}>{hospital}</Text>
                            </View>
                          </View>
                          <View style={styles.cardFooter}>
                            <View style={styles.priceContainer}>
                              <Text style={styles.priceLabel}>Phí tư vấn:</Text>
                              <Text style={styles.priceValue}>200.000đ</Text>
                            </View>
                            <View style={styles.cardActions}>
                              <TouchableOpacity 
                                style={styles.chatButton}
                                onPress={handleChatPress}
                              >
                                <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                                <Text style={styles.chatButtonText}>Nhắn tin</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* All Specialties Modal */}
      {showAllSpecialties && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tất cả chuyên khoa</Text>
              <TouchableOpacity onPress={() => setShowAllSpecialties(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {allSpecialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty.id}
                  style={styles.specialtyItem}
                  onPress={() => {
                    setShowAllSpecialties(false);
                    router.push('/specialty-detail');
                  }}
                >
                  <View style={styles.specialtyItemIcon}>
                    <Ionicons name={specialty.icon as any} size={24} color="#00BCD4" />
                  </View>
                  <Text style={styles.specialtyItemText}>{specialty.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#E0F7FA',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00897B',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#00897B',
  },
  bannerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionHeaderNoButton: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  doctorAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#06D6A0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  specialty: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  doctorMeta: {
    gap: 4,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  doctorRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  doctorRating: {
    fontSize: 12,
    color: '#666',
  },
  doctorExperience: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorExperienceText: {
    fontSize: 12,
    color: '#666',
  },
  doctorActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  modalList: {
    padding: 16,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specialtyItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  specialtyItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  // Styles mới cho grid 4 cột
  specialtiesGridNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specialtyItemNew: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  specialtyIconContainerNew: {
    width: 75,
    height: 75,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0F7FA',
  },
  specialtyIconNew: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },
  specialtyNameNew: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 14,
  },
  specialtyDoctorsNew: {
    fontSize: 10,
    color: '#00BCD4',
    textAlign: 'center',
    fontWeight: '600',
  },
});
