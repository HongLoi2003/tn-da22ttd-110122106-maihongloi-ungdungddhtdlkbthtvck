import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ImageSourcePropType,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAllDocuments } from '../services/firebaseService';
import { getDoctorAvatarSmart } from '../utils/doctorAvatars';



interface Doctor {
  id: string;
  ten: string;
  chuyen_khoa: string;
  rating: number;
  image: ImageSourcePropType;
  kinh_nghiem: number;
  imageName?: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: ImageSourcePropType;
  date: string;
  category: string;
}

export default function HomeScreen() {
  console.log('🏠 [HOME] HomeScreen component rendering');
  const router = useRouter();
  const { userData, user } = useAuth();
  console.log('👤 [HOME] User data:', userData?.fullName);
  const [searchText, setSearchText] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [favoriteDoctors, setFavoriteDoctors] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSearch = () => {
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      
      // Check if search is for a hospital
      const hospitalKeywords = ['bệnh viện', 'bv', 'hospital', 'phòng khám', 'phòng', 'khám'];
      const isHospitalSearch = hospitalKeywords.some(keyword => searchLower.includes(keyword));
      
      if (isHospitalSearch) {
        router.push({
          pathname: '/find-hospital',
          params: { search: searchText }
        });
      } else {
        router.push({
          pathname: '/all-doctors',
          params: { search: searchText }
        });
      }
    }
  };

  useEffect(() => {
    // Lấy dữ liệu từ Firebase
    const fetchData = async () => {
      try {
        setDataLoading(true);
        
        // Lấy bác sĩ từ Firebase
        console.log('Fetching doctors from Firebase...');
        const doctorsData = await getAllDocuments('doctors');
        console.log('Doctors data from Firebase:', doctorsData);
        
        if (doctorsData && doctorsData.length > 0) {
          const mappedDoctors = doctorsData.slice(0, 4).map((doc: any) => {
            try {
              const imageName = doc.image || doc.hinh_anh || 'hoangvanduc.png';
              console.log('🔍 Mapping doctor:', doc.ten, '| image field:', doc.image, '| hinh_anh field:', doc.hinh_anh, '| using:', imageName);
              const imageSource = getDoctorAvatarSmart(doc.ten, imageName);
              
              return {
                id: doc.id,
                ten: doc.ten || 'Bác sĩ',
                chuyen_khoa: doc.chuyen_khoa || 'Đa khoa',
                rating: doc.rating || 4.8,
                image: imageSource,
                kinh_nghiem: doc.kinh_nghiem || 5,
                imageName: imageName,
              };
            } catch (error) {
              console.error('❌ Error mapping doctor:', doc.id, doc.ten, error);
              // Return a safe default
              return {
                id: doc.id || 'unknown',
                ten: doc.ten || 'Bác sĩ',
                chuyen_khoa: doc.chuyen_khoa || 'Đa khoa',
                rating: doc.rating || 4.8,
                image: require('@/assets/images/logo.png'),
                kinh_nghiem: doc.kinh_nghiem || 5,
                imageName: 'logo.png',
              };
            }
          });
          setDoctors(mappedDoctors);
          console.log('Mapped doctors:', mappedDoctors);
        } else {
          console.warn('No doctors data from Firebase');
          throw new Error('No doctors data');
        }

        // Articles - sử dụng mock data vì không có collection articles
        setArticles([
          {
            id: '1',
            title: 'Uống đủ nước mỗi ngày',
            excerpt: 'Nước là nguồn sống, chiếm 60-70% trọng lượng cơ thể',
            image: require('@/assets/images/chedouonguoc.png'),
            date: '20/03/2024',
            category: 'nutrition',
          },
          {
            id: '2',
            title: 'Cách ngủ ngon hơn',
            excerpt: 'Giấc ngủ chất lượng là nền tảng của sức khỏe',
            image: require('@/assets/images/stress.png'),
            date: '17/03/2024',
            category: 'sleep',
          },
          {
            id: '3',
            title: 'Dấu hiệu bệnh tim',
            excerpt: 'Bệnh tim là nguyên nhân gây tử vong hàng đầu',
            image: require('@/assets/images/dauhieubenhtim.png'),
            date: '16/03/2024',
            category: 'cardiology',
          },
          {
            id: '4',
            title: 'Tập thể dục đều đặn',
            excerpt: 'Vận động thể chất đều đặn là chìa khóa cho sức khỏe toàn diện',
            image: require('@/assets/images/yoga.png'),
            date: '15/03/2024',
            category: 'fitness',
          },
        ]);
      } catch (error) {
        console.warn('Error fetching Firebase data, using mock data:', error);
        // Nếu lỗi, sử dụng mock data
        setDoctors([
          {
            id: 'bs001',
            ten: 'BS. Nguyễn Văn An',
            chuyen_khoa: 'Tim mạch',
            rating: 4.9,
            image: require('@/assets/images/hoangvanduc.png'),
            kinh_nghiem: 10,
          },
          {
            id: 'bs002',
            ten: 'BS. Trần Thị Lan',
            chuyen_khoa: 'Sản phụ khoa',
            rating: 4.8,
            image: require('@/assets/images/hesuyen.png'),
            kinh_nghiem: 7,
          },
          {
            id: 'bs003',
            ten: 'BS. Lê Minh Tâm',
            chuyen_khoa: 'Nhi khoa',
            rating: 4.9,
            image: require('@/assets/images/dominhtuan.png'),
            kinh_nghiem: 5,
          },
          {
            id: 'bs004',
            ten: 'BS. Phạm Thu Hà',
            chuyen_khoa: 'Cấp cứu',
            rating: 4.7,
            image: require('@/assets/images/dangthithao.jpg'),
            kinh_nghiem: 8,
          },
        ]);

        setArticles([
          {
            id: '1',
            title: 'Uống đủ nước mỗi ngày',
            excerpt: 'Nước là nguồn sống, chiếm 60-70% trọng lượng cơ thể',
            image: require('@/assets/images/chedouonguoc.png'),
            date: '20/03/2024',
            category: 'nutrition',
          },
          {
            id: '2',
            title: 'Cách ngủ ngon hơn',
            excerpt: 'Giấc ngủ chất lượng là nền tảng của sức khỏe',
            image: require('@/assets/images/stress.png'),
            date: '17/03/2024',
            category: 'sleep',
          },
          {
            id: '3',
            title: 'Dấu hiệu bệnh tim',
            excerpt: 'Bệnh tim là nguyên nhân gây tử vong hàng đầu',
            image: require('@/assets/images/dauhieubenhtim.png'),
            date: '16/03/2024',
            category: 'cardiology',
          },
          {
            id: '4',
            title: 'Tập thể dục đều đặn',
            excerpt: 'Vận động thể chất đều đặn là chìa khóa cho sức khỏe toàn diện',
            image: require('@/assets/images/yoga.png'),
            date: '15/03/2024',
            category: 'fitness',
          },
        ]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
    loadUnreadNotifications();
  }, [user]);

  const loadUnreadNotifications = async () => {
    if (!user) {
      console.log('No user logged in');
      setUnreadCount(0);
      return;
    }

    try {
      console.log('Loading notifications for user:', user.uid);
      const allNotifications = await getAllDocuments('notifications');
      console.log('All notifications:', allNotifications);
      
      const userUnreadNotifications = allNotifications.filter(
        (n: any) => n.userId === user.uid && !n.read
      );
      console.log('User unread notifications:', userUnreadNotifications);
      console.log('Unread count:', userUnreadNotifications.length);
      
      setUnreadCount(userUnreadNotifications.length);
    } catch (error: any) {
      // Bỏ qua lỗi permission-denied cho notifications
      if (error?.code === 'permission-denied') {
        console.log('⚠️ Notifications permission denied, skipping...');
      } else {
        console.error('Error loading notifications:', error);
      }
      setUnreadCount(0);
    }
  };

  // Refresh dữ liệu khi quay lại home screen
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused - refreshing data');
      loadUnreadNotifications(); // Refresh thông báo
    }, [])
  );

  const QuickMenuButton = ({ icon, label, description, onPress }: any) => (
    <TouchableOpacity style={styles.quickMenuButton} onPress={onPress}>
      <View style={styles.quickMenuIconContainer}>{icon}</View>
      <Text style={styles.quickMenuLabel}>{label}</Text>
      <Text style={styles.quickMenuDescription}>{description}</Text>
    </TouchableOpacity>
  );

  const toggleFavoriteDoctor = (doctorId: string) => {
    setFavoriteDoctors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(doctorId)) {
        newSet.delete(doctorId);
      } else {
        newSet.add(doctorId);
      }
      return newSet;
    });
  };

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => {
    const isFavorite = favoriteDoctors.has(doctor.id);
    
    return (
      <TouchableOpacity
        style={styles.doctorCard}
        onPress={() => router.push({
          pathname: '/doctor-detail',
          params: {
            id: doctor.id,
            name: doctor.ten,
            specialty: doctor.chuyen_khoa,
            image: doctor.imageName,
            rating: doctor.rating.toString(),
          }
        })}
      >
        <View style={styles.doctorImageContainer}>
          <Image source={doctor.image} style={styles.doctorImage} />
          <TouchableOpacity 
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavoriteDoctor(doctor.id);
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={18} 
              color={isFavorite ? "#fff" : "#E91E63"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.doctorTitle}>BS.TS</Text>
        <Text style={styles.doctorName} numberOfLines={1}>{doctor.ten}</Text>
        <Text style={styles.doctorSpecialty} numberOfLines={1}>{doctor.chuyen_khoa}</Text>
        <Text style={styles.doctorHospital} numberOfLines={2}>Bệnh viện Trường Đại học Trà Vinh</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.rating}>{doctor.rating}</Text>
          <Text style={styles.reviewCount}>({doctor.kinh_nghiem}00+)</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ArticleCard = ({ article }: { article: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => router.push(`/article-detail?id=${article.id}`)}
    >
      <View style={styles.articleImageContainer}>
        <Image source={article.image} style={styles.articleImage} />
        <View style={styles.articleTag}>
          <Text style={styles.articleTagText}>{article.date}</Text>
        </View>
      </View>
      <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
      <Text style={styles.articleExcerpt} numberOfLines={2}>{article.excerpt}</Text>
      <View style={styles.articleFooter}>
        <Ionicons name="calendar" size={12} color="#999" />
        <Text style={styles.viewCount}>{article.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={
                userData?.avatar 
                  ? { uri: userData.avatar }
                  : require('@/assets/images/icon.png')
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>
                Xin chào, {userData?.fullName || 'Bạn'} 👋
              </Text>
              <Text style={styles.subGreeting}>
                <Ionicons name="heart" size={12} color="#00BCD4" /> Chăm sóc sức khỏe chu đáo mỗi ngày
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/find-hospital')}>
              <Ionicons name="location" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.notificationBadge}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications" size={24} color="#333" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bác sĩ, chuyên khoa, triệu chứng..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Chăm sóc sức khỏe <Text style={styles.bannerTitleHighlight}>mỗi ngày</Text></Text>
            <Text style={styles.bannerSubtitle}>
              Đặt lịch khám và tư vấn chuyên khoa
            </Text>
            <View style={styles.bannerButtonContainer}>
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={() => router.push('/booking')}
              >
                <Text style={styles.bannerButtonText}>Đặt lịch khám</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.bannerButtonSecondary}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <Text style={styles.bannerButtonSecondaryText}>Tư vấn ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bannerImageContainer}>
            <Image
              source={require('@/assets/images/bacsi.png')}
              style={styles.bannerImage}
            />
          </View>
        </View>

        {/* Quick Menu */}
        <View style={styles.quickMenuSection}>
          <View style={styles.quickMenuGrid}>
            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/booking')}
            >
              <View style={styles.quickMenuGridIconBox}>
                <Image 
                  source={require('@/assets/images/datlichkham.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Đặt lịch khám</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <View style={styles.quickMenuGridIconBox}>
                <Image 
                  source={require('@/assets/images/tuvanonline.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Tư vấn online</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/(tabs)/appointments')}
            >
              <View style={styles.quickMenuGridIconBox}>
                <Image 
                  source={require('@/assets/images/lichkham.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Lịch khám</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/find-hospital')}
            >
              <View style={styles.quickMenuGridIconBox}>
                <Image 
                  source={require('@/assets/images/timbenhvien.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Bệnh viện</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickMenuGrid}>
            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/specialties')}
            >
              <View style={[styles.quickMenuGridIconBox, { backgroundColor: '#FFF5F5' }]}>
                <Image 
                  source={require('@/assets/images/chuyenkhoa.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Chuyên khoa</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/pharmacy')}
            >
              <View style={[styles.quickMenuGridIconBox, { backgroundColor: '#F0FFF4' }]}>
                <Image 
                  source={require('@/assets/images/nhathuoc.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Nhà thuốc</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/health-insurance')}
            >
              <View style={[styles.quickMenuGridIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Image 
                  source={require('@/assets/images/baohiemyte.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Bảo hiểm y tế</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickMenuGridItem}
              onPress={() => router.push('/support-center')}
            >
              <View style={[styles.quickMenuGridIconBox, { backgroundColor: '#FFF1F2' }]}>
                <Image 
                  source={require('@/assets/images/hotrosuckhoe.png')} 
                  style={styles.quickMenuImage}
                />
              </View>
              <Text style={styles.quickMenuGridItemLabel}>Hỗ trợ sức khỏe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bác sĩ được quan tâm</Text>
            <TouchableOpacity onPress={() => router.push('/all-doctors')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={doctors}
            renderItem={({ item }) => <DoctorCard doctor={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          />
        </View>

        {/* Health Articles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài viết sức khỏe</Text>
            <TouchableOpacity onPress={() => router.push('/articles')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={articles}
            renderItem={({ item }) => <ArticleCard article={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 35,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  subGreeting: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 13,
  },
  filterButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 20,
    padding: 8,
  },
  banner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  bannerContent: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'center',
    zIndex: 1,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00897B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00695C',
    marginBottom: 10,
    lineHeight: 26,
  },
  bannerTitleHighlight: {
    color: '#00BCD4',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#00897B',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  bannerButtonContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  bannerButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
    gap: 5,
  },
  bannerButtonSecondary: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  bannerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  bannerButtonSecondaryText: {
    color: '#00BCD4',
    fontWeight: '600',
    fontSize: 12,
  },
  bannerImageContainer: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 160,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  decorIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B3E5FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorIcon1: {
    top: -10,
    right: -10,
  },
  decorIcon2: {
    bottom: 10,
    right: -15,
  },
  decorIcon3: {
    bottom: -5,
    left: -10,
  },
  quickMenuSection: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  quickMenuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  quickMenuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickMenuLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickMenuDescription: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 15,
  },
  quickMenuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickMenuGridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  quickMenuGridIconBox: {
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
    overflow: 'hidden',
    padding: 10,
  },
  quickMenuImage: {
    width: 55,
    height: 55,
    resizeMode: 'cover',
  },
  quickMenuGridItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 14,
  },
  quickMenuGridItemDesc: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  seeAll: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
  doctorCard: {
    width: 170,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  doctorImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  doctorImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#E91E63',
  },
  doctorTitle: {
    fontSize: 10,
    color: '#999',
    paddingHorizontal: 10,
    paddingTop: 8,
    fontWeight: '500',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  doctorSpecialty: {
    fontSize: 11,
    color: '#999',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  doctorHospital: {
    fontSize: 10,
    color: '#00BCD4',
    paddingHorizontal: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 6,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
  },
  bookButton: {
    backgroundColor: '#00BCD4',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  articleCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  articleImageContainer: {
    position: 'relative',
    width: '100%',
    height: 100,
  },
  articleImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  articleTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  articleTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 10,
    paddingTop: 10,
    lineHeight: 16,
  },
  articleExcerpt: {
    fontSize: 11,
    color: '#999',
    paddingHorizontal: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  viewCount: {
    fontSize: 11,
    color: '#999',
  },
  hospitalCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  hospitalImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
  },
  hospitalInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  hospitalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  hospitalDistance: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '500',
  },
  hospitalRating: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  hospitalAddress: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  consultationBanner: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    alignItems: 'center',
  },
  consultationContent: {
    flex: 1,
  },
  consultationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  consultationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  consultationButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  consultationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  consultationImage: {
    width: 80,
    height: 80,
    marginLeft: 12,
  },
});
