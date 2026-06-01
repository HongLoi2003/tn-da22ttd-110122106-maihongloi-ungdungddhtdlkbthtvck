import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
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

export default function HospitalInfoScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [allDoctors, popularData] = await Promise.all([
        getAllDocuments('doctors'),
        getAllDocuments('popular-specialties'),
      ]);

      // Đếm số lượng bác sĩ theo chuyên khoa
      const doctorCountBySpecialty: Record<string, number> = {};
      allDoctors.forEach((doctor: any) => {
        const specialty = doctor.chuyen_khoa || doctor.chuyenKhoa;
        if (specialty) {
          doctorCountBySpecialty[specialty] = (doctorCountBySpecialty[specialty] || 0) + 1;
        }
      });

      // Lọc chỉ lấy chuyên khoa có hình ảnh
      const specialtiesWithImages = popularData.filter((specialty: any) => {
        const imageName = specialty.image || 'khoa.png';
        return imageName !== 'khoa.png' && specialtyImages[imageName];
      });

      // Cập nhật số lượng bác sĩ thực tế
      const updatedSpecialties = specialtiesWithImages.map((specialty: any) => {
        const actualDoctorCount = doctorCountBySpecialty[specialty.name] || 0;
        return {
          ...specialty,
          doctors: actualDoctorCount,
        };
      });

      setSpecialties(updatedSpecialties);
      
      const mappedDoctors = allDoctors.map((doc: any) => ({
        id: doc.id,
        name: doc.ten,
        specialty: doc.chuyen_khoa,
        rating: doc.rating,
        experience: doc.kinh_nghiem,
        image: doctorImages[doc.image as keyof typeof doctorImages] || doctorImages['nguyenvanam.png'],
        imageName: doc.image,
      }));
      
      setDoctors(mappedDoctors);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallHotline = () => {
    Linking.openURL('tel:0294123456');
  };

  const handleOpenMap = () => {
    const address = 'Bệnh viện Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Khóm 4, Phường 5, Trà Vinh';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bệnh viện</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hospital Image */}
        <Image 
          source={require('@/assets/images/benhviendhtv.png')}
          style={styles.hospitalImage}
        />

        {/* Hospital Info */}
        <View style={styles.infoSection}>
          <Text style={styles.hospitalName}>Bệnh viện Trường Đại học Trà Vinh</Text>
          <Text style={styles.hospitalSubtitle}>Bệnh viện Đa khoa hạng I</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#FFB800" />
            <Text style={styles.ratingText}>4.8 (2,500+ đánh giá)</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallHotline}>
              <View style={styles.actionIconBox}>
                <Ionicons name="call" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.actionText}>Hotline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleOpenMap}>
              <View style={styles.actionIconBox}>
                <Ionicons name="location" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.actionText}>Bản đồ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconBox}>
                <Ionicons name="time" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.actionText}>Giờ làm việc</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.contactText}>
              126 Nguyễn Thiện Thành, Khóm 4, Phường 5, Trà Vinh
            </Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.contactText}>0294 123 456</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.contactTextColumn}>
              <Text style={styles.contactText}>Thứ 2 - Thứ 6: 7:00 - 17:00</Text>
              <Text style={styles.contactText}>Thứ 7: 7:00 - 12:00</Text>
              <Text style={styles.contactText}>Chủ nhật: Nghỉ</Text>
            </View>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chuyên khoa</Text>
          <View style={styles.specialtiesGrid}>
            {specialties.map((specialty) => {
              const imageName = specialty.image || 'khoa.png';
              const imageSource = specialtyImages[imageName] || require('@/assets/images/khoa.png');
              
              return (
                <TouchableOpacity 
                  key={specialty.id} 
                  style={styles.specialtyCard}
                  onPress={() => router.push('/(tabs)/chat')}
                >
                  <View style={styles.specialtyIconContainer}>
                    <Image source={imageSource} style={styles.specialtyIcon} />
                  </View>
                  <Text style={styles.specialtyName}>{specialty.name}</Text>
                  <Text style={styles.specialtyDoctors}>{specialty.doctors} bác sĩ</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đội ngũ bác sĩ</Text>
            <TouchableOpacity onPress={() => router.push('/all-doctors')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#00BCD4" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.doctorsList}>
              {doctors.slice(0, 6).map((doctor) => (
                <TouchableOpacity 
                  key={doctor.id} 
                  style={styles.doctorCard}
                  onPress={() => router.push({
                    pathname: '/doctor-detail',
                    params: {
                      id: doctor.id,
                      name: doctor.name,
                      specialty: doctor.specialty,
                      image: doctor.imageName,
                      rating: doctor.rating.toString(),
                    }
                  })}
                >
                  <Image source={doctor.image} style={styles.doctorImage} />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                    <View style={styles.doctorRating}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.doctorRatingText}>{doctor.rating}</Text>
                      <Text style={styles.doctorExperience}>• {doctor.experience} năm KN</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({
                        pathname: '/(tabs)/booking',
                        params: {
                          doctorId: doctor.id,
                          doctorName: doctor.name,
                          doctorSpecialty: doctor.specialty,
                        }
                      });
                    }}
                  >
                    <Text style={styles.bookButtonText}>Đặt lịch</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  hospitalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  hospitalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactTextColumn: {
    flex: 1,
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specialtyCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  specialtyIconContainer: {
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
  specialtyIcon: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },
  specialtyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 14,
  },
  specialtyDoctors: {
    fontSize: 10,
    color: '#00BCD4',
    textAlign: 'center',
    fontWeight: '600',
  },
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
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
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  doctorExperience: {
    fontSize: 12,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
