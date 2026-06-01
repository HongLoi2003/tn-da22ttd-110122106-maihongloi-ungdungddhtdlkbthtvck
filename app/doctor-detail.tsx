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
    TouchableOpacity,
    View
} from 'react-native';
import { getAllDocuments } from './services/firebaseService';

const doctorImages = {
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

export default function DoctorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  console.log('🔍 Doctor detail params:', params);

  useEffect(() => {
    loadDoctorData();
  }, [params.id]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const doctorId = params.id as string;
      
      if (!doctorId) {
        console.warn('No doctor ID provided');
        setLoading(false);
        return;
      }

      console.log('📥 Fetching doctor data for ID:', doctorId);
      const allDoctors = await getAllDocuments('doctors');
      console.log('📊 All doctors from Firebase:', allDoctors);
      
      const foundDoctor: any = allDoctors.find((d: any) => d.id === doctorId);
      
      if (foundDoctor) {
        console.log('✅ Found doctor:', foundDoctor);
        const imageName = foundDoctor.image || 'hoangvanduc.png';
        const imageSource = doctorImages[imageName as keyof typeof doctorImages] || require('@/assets/images/hoangvanduc.png');
        
        setDoctor({
          id: foundDoctor.id,
          name: foundDoctor.ten || 'Bác sĩ',
          specialty: foundDoctor.chuyen_khoa || 'Đa khoa',
          rating: foundDoctor.rating || 4.8,
          reviews: 128,
          experience: `${foundDoctor.kinh_nghiem || 5} năm`,
          patients: '2,500+',
          hospital: 'Bệnh viện Trường Đại học Trà Vinh',
          education: 'Bác sĩ Đa khoa - Đại học Trà Vinh',
          image: imageSource,
          imageName: imageName,
        });
      } else {
        console.warn('❌ Doctor not found with ID:', doctorId);
        // Use fallback data
        setDoctor({
          id: params.id || 'bs001',
          name: params.name || 'BS. Nguyễn Văn An',
          specialty: params.specialty || 'Tim mạch',
          rating: 4.9,
          reviews: 128,
          experience: '15 năm',
          patients: '2,500+',
          hospital: 'Bệnh viện Trường Đại học Trà Vinh',
          education: 'Bác sĩ Đa khoa - Đại học Trà Vinh',
          image: require('@/assets/images/hoangvanduc.png'),
          imageName: 'hoangvanduc.png',
        });
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      // Fallback
      setDoctor({
        id: params.id || 'bs001',
        name: params.name || 'BS. Nguyễn Văn An',
        specialty: params.specialty || 'Tim mạch',
        rating: 4.9,
        reviews: 128,
        experience: '15 năm',
        patients: '2,500+',
        hospital: 'Bệnh viện Trường Đại học Trà Vinh',
        education: 'Bác sĩ Đa khoa - Đại học Trà Vinh',
        image: require('@/assets/images/hoangvanduc.png'),
        imageName: 'hoangvanduc.png',
      });
    } finally {
      setLoading(false);
    }
  };

  const services = [
    'Khám và tư vấn bệnh tim mạch',
    'Siêu âm tim',
    'Điện tâm đồ',
    'Theo dõi huyết áp 24h',
    'Tư vấn chế độ dinh dưỡng',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Đang tải thông tin bác sĩ...</Text>
        </View>
      ) : !doctor ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Không thể tải thông tin bác sĩ</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thông tin bác sĩ</Text>
            <TouchableOpacity 
              style={[
                styles.favoriteIconButton,
                isFavorite && styles.favoriteIconButtonActive
              ]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
          </View>

          {/* Doctor Info */}
          <View style={styles.doctorSection}>
            <Image source={doctor.image} style={styles.doctorImage} />
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <Text style={styles.ratingText}>
                {doctor.rating} ({doctor.reviews} đánh giá)
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="briefcase-outline" size={24} color="#00BCD4" />
                <Text style={styles.statValue}>{doctor.experience}</Text>
                <Text style={styles.statLabel}>Kinh nghiệm</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={24} color="#00BCD4" />
                <Text style={styles.statValue}>{doctor.patients}</Text>
                <Text style={styles.statLabel}>Bệnh nhân</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="ribbon-outline" size={24} color="#00BCD4" />
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Hài lòng</Text>
              </View>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{doctor.education}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{doctor.hospital}</Text>
            </View>
          </View>

          {/* Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch vụ khám</Text>
            {services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Bottom Button */}
      {!loading && doctor && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => {
              router.push({
                pathname: '/doctor-chat',
                params: {
                  doctorId: doctor.id,
                  doctorName: doctor.name,
                  doctorSpecialty: doctor.specialty,
                  doctorImage: doctor.imageName,
                }
              });
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#00BCD4" />
            <Text style={styles.chatButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bookingButton}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/booking',
                params: {
                  doctorId: doctor.id,
                  doctorName: doctor.name,
                  doctorSpecialty: doctor.specialty,
                  doctorImage: doctor.imageName,
                }
              });
            }}
          >
            <Text style={styles.bookingButtonText}>Đặt lịch khám</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  doctorSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  bookingButton: {
    flex: 1,
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
  favoriteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconButtonActive: {
    backgroundColor: '#E91E63',
  },
});
