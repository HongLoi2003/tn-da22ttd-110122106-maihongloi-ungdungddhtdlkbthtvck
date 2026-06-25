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
import { getDoctorAvatarSmart } from './utils/doctorAvatars';

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
        const imageSource = getDoctorAvatarSmart(foundDoctor.ten || foundDoctor.name, imageName, foundDoctor.id);
        
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
          id: params.id || 'bs002',
          name: params.name || 'BS. Trần Thị Lan',
          specialty: params.specialty || 'Sản phụ khoa',
          rating: 4.9,
          reviews: 128,
          experience: '15 năm',
          patients: '2,500+',
          hospital: 'Bệnh viện Trường Đại học Trà Vinh',
          education: 'Bác sĩ Đa khoa - Đại học Trà Vinh',
          image: { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
          imageName: 'hoangvanduc.png',
        });
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      // Fallback
      setDoctor({
        id: params.id || 'bs002',
        name: params.name || 'BS. Trần Thị Lan',
        specialty: params.specialty || 'Sản phụ khoa',
        rating: 4.9,
        reviews: 128,
        experience: '15 năm',
        patients: '2,500+',
        hospital: 'Bệnh viện Trường Đại học Trà Vinh',
        education: 'Bác sĩ Đa khoa - Đại học Trà Vinh',
        image: { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
        imageName: 'hoangvanduc.png',
      });
    } finally {
      setLoading(false);
    }
  };

  // Dịch vụ khám theo chuyên khoa
  const getServicesBySpecialty = (specialty: string): string[] => {
    const servicesMap: Record<string, string[]> = {
      'Tim mạch': [
        'Khám và tư vấn bệnh tim mạch',
        'Siêu âm tim',
        'Điện tâm đồ',
        'Theo dõi huyết áp 24h',
        'Tư vấn chế độ dinh dưỡng cho tim mạch',
      ],
      'Tiêu hóa': [
        'Khám và tư vấn bệnh dạ dày - ruột',
        'Nội soi tiêu hóa',
        'Siêu âm ổ bụng',
        'Xét nghiệm chức năng gan - thận',
        'Tư vấn chế độ ăn uống',
      ],
      'Hô hấp': [
        'Khám và tư vấn bệnh phổi',
        'Đo chức năng hô hấp',
        'X-quang phổi',
        'Điều trị hen suyễn',
        'Tư vấn cai thuốc lá',
      ],
      'Thần kinh': [
        'Khám và tư vấn bệnh thần kinh',
        'Điện não đồ (EEG)',
        'Đo dẫn truyền thần kinh',
        'Siêu âm Doppler mạch máu não',
        'Tư vấn rối loạn giấc ngủ',
      ],
      'Cơ xương khớp': [
        'Khám và tư vấn bệnh xương khớp',
        'Chụp X-quang xương khớp',
        'Siêu âm cơ xương khớp',
        'Vật lý trị liệu',
        'Tư vấn phục hồi chức năng',
      ],
      'Da liễu': [
        'Khám và điều trị bệnh da',
        'Điều trị mụn trứng cá',
        'Điều trị viêm da dị ứng',
        'Xét nghiệm nấm da',
        'Tư vấn chăm sóc da',
      ],
      'Mắt': [
        'Khám và tư vấn bệnh mắt',
        'Đo thị lực',
        'Khám đáy mắt',
        'Đo nhãn áp',
        'Kê đơn kính mắt',
      ],
      'Tai mũi họng': [
        'Khám và điều trị bệnh tai mũi họng',
        'Nội soi tai mũi họng',
        'Đo thính lực',
        'Điều trị viêm xoang',
        'Phẫu thuật amidan nhỏ',
      ],
      'Nội tiết': [
        'Khám và tư vấn bệnh nội tiết',
        'Xét nghiệm hormone',
        'Tư vấn bệnh tiểu đường',
        'Theo dõi bệnh tuyến giáp',
        'Tư vấn dinh dưỡng nội tiết',
      ],
      'Nhi khoa': [
        'Khám sức khỏe trẻ em',
        'Theo dõi phát triển trẻ',
        'Tiêm chủng vacxin',
        'Tư vấn dinh dưỡng trẻ em',
        'Điều trị bệnh nhiễm khuẩn',
      ],
      'Sản phụ khoa': [
        'Khám sản phụ khoa',
        'Siêu âm thai',
        'Tư vấn kế hoạch hóa gia đình',
        'Khám và điều trị viêm nhiễm phụ khoa',
        'Theo dõi thai kỳ',
      ],
      'Răng hàm mặt': [
        'Khám và tư vấn nha khoa',
        'Điều trị sâu răng',
        'Lấy cao răng',
        'Nhổ răng',
        'Tư vấn chỉnh nha',
      ],
    };

    return servicesMap[specialty] || [
      'Khám và tư vấn sức khỏe tổng quát',
      'Tư vấn chế độ dinh dưỡng',
      'Kê đơn thuốc điều trị',
      'Theo dõi sức khỏe định kỳ',
      'Tư vấn phòng ngừa bệnh',
    ];
  };

  const services = doctor ? getServicesBySpecialty(doctor.specialty) : [];

  // Thông tin chuyên môn và hồ sơ pháp lý theo chuyên khoa
  const getProfessionalInfo = (specialty: string): string[] => {
    const professionalMap: Record<string, string[]> = {
      'Tim mạch': [
        'Bác sĩ Chuyên khoa I Tim mạch',
        'Chứng chỉ hành nghề số: 12345/BYT',
        'Thành viên Hội Tim mạch Việt Nam',
        'Chứng chỉ Siêu âm tim Doppler',
        'Chứng chỉ Đọc điện tâm đồ nâng cao',
      ],
      'Tiêu hóa': [
        'Bác sĩ Chuyên khoa I Tiêu hóa',
        'Chứng chỉ hành nghề số: 12346/BYT',
        'Chứng chỉ Nội soi tiêu hóa',
        'Thành viên Hội Tiêu hóa Việt Nam',
        'Đào tạo chuyên sâu về gan mật tụy',
      ],
      'Hô hấp': [
        'Bác sĩ Chuyên khoa I Hô hấp',
        'Chứng chỉ hành nghề số: 12347/BYT',
        'Chứng chỉ Đo chức năng hô hấp',
        'Thành viên Hội Hô hấp Việt Nam',
        'Chứng chỉ Điều trị hen suyễn',
      ],
      'Thần kinh': [
        'Bác sĩ Chuyên khoa I Thần kinh',
        'Chứng chỉ hành nghề số: 12348/BYT',
        'Chứng chỉ Điện não đồ',
        'Thành viên Hội Thần kinh Việt Nam',
        'Đào tạo về đột quỵ não',
      ],
      'Cơ xương khớp': [
        'Bác sĩ Chuyên khoa I Cơ xương khớp',
        'Chứng chỉ hành nghề số: 12349/BYT',
        'Thành viên Hội Khớp học Việt Nam',
        'Chứng chỉ Vật lý trị liệu',
        'Đào tạo về phục hồi chức năng',
      ],
      'Da liễu': [
        'Bác sĩ Chuyên khoa I Da liễu',
        'Chứng chỉ hành nghề số: 12350/BYT',
        'Thành viên Hội Da liễu Việt Nam',
        'Chứng chỉ Điều trị laser da',
        'Chứng chỉ Phẫu thuật thẩm mỹ da',
      ],
      'Mắt': [
        'Bác sĩ Chuyên khoa I Mắt',
        'Chứng chỉ hành nghề số: 12351/BYT',
        'Thành viên Hội Nhãn khoa Việt Nam',
        'Chứng chỉ Phẫu thuật mắt',
        'Chứng chỉ Khúc xạ và kính áp tròng',
      ],
      'Tai mũi họng': [
        'Bác sĩ Chuyên khoa I Tai mũi họng',
        'Chứng chỉ hành nghề số: 12352/BYT',
        'Thành viên Hội Tai mũi họng Việt Nam',
        'Chứng chỉ Nội soi TMH',
        'Chứng chỉ Phẫu thuật TMH',
      ],
      'Nội tiết': [
        'Bác sĩ Chuyên khoa I Nội tiết',
        'Chứng chỉ hành nghề số: 12353/BYT',
        'Thành viên Hội Nội tiết Việt Nam',
        'Chứng chỉ Điều trị tiểu đường',
        'Chứng chỉ Điều trị bệnh tuyến giáp',
      ],
      'Nhi khoa': [
        'Bác sĩ Chuyên khoa I Nhi',
        'Chứng chỉ hành nghề số: 12354/BYT',
        'Thành viên Hội Nhi khoa Việt Nam',
        'Chứng chỉ Dinh dưỡng trẻ em',
        'Chứng chỉ Hồi sức cấp cứu nhi',
      ],
      'Sản phụ khoa': [
        'Bác sĩ Chuyên khoa I Sản phụ khoa',
        'Chứng chỉ hành nghề số: 12355/BYT',
        'Thành viên Hội Sản phụ khoa Việt Nam',
        'Chứng chỉ Siêu âm sản khoa',
        'Chứng chỉ Sản khoa cấp cứu',
      ],
      'Răng hàm mặt': [
        'Bác sĩ Răng hàm mặt',
        'Chứng chỉ hành nghề số: 12356/BYT',
        'Thành viên Hội Răng hàm mặt Việt Nam',
        'Chứng chỉ Phẫu thuật nha khoa',
        'Chứng chỉ Cấy ghép Implant',
      ],
    };

    return professionalMap[specialty] || [
      'Bác sĩ Đa khoa',
      'Chứng chỉ hành nghề số: 12300/BYT',
      'Tốt nghiệp Đại học Y Dược',
      'Có giấy phép hành nghề hợp lệ',
      'Đăng ký hành nghề tại Sở Y tế',
    ];
  };

  // Tố chất và kỹ năng nền tảng theo chuyên khoa
  const getCoreSkills = (specialty: string): string[] => {
    const skillsMap: Record<string, string[]> = {
      'Tim mạch': [
        'Chẩn đoán và điều trị các bệnh tim mạch',
        'Đọc và phân tích điện tâm đồ chuyên sâu',
        'Kỹ năng siêu âm tim Doppler',
        'Xử lý các cấp cứu tim mạch',
        'Tư vấn phòng ngừa bệnh tim mạch',
      ],
      'Tiêu hóa': [
        'Chẩn đoán bệnh lý đường tiêu hóa',
        'Kỹ năng nội soi dạ dày - đại tràng',
        'Điều trị bệnh gan mật tụy',
        'Tư vấn dinh dưỡng tiêu hóa',
        'Xử lý xuất huyết tiêu hóa',
      ],
      'Hô hấp': [
        'Chẩn đoán bệnh phổi và đường hô hấp',
        'Đo và đánh giá chức năng hô hấp',
        'Điều trị hen suyễn và COPD',
        'Xử lý suy hô hấp cấp',
        'Tư vấn cai thuốc lá',
      ],
      'Thần kinh': [
        'Chẩn đoán bệnh lý thần kinh',
        'Đọc và phân tích điện não đồ',
        'Điều trị đau đầu và đau thần kinh',
        'Xử lý đột quỵ não cấp cứu',
        'Tư vấn rối loạn giấc ngủ',
      ],
      'Cơ xương khớp': [
        'Chẩn đoán bệnh xương khớp',
        'Kỹ năng chỉ định X-quang và MRI',
        'Điều trị viêm khớp và thoái hóa',
        'Kỹ năng tiêm khớp',
        'Tư vấn vật lý trị liệu',
      ],
      'Da liễu': [
        'Chẩn đoán bệnh da chính xác',
        'Điều trị mụn và sẹo',
        'Kỹ năng laser và điều trị thẩm mỹ da',
        'Xử lý dị ứng da',
        'Tư vấn chăm sóc da',
      ],
      'Mắt': [
        'Khám và đánh giá thị lực chính xác',
        'Chẩn đoán bệnh lý mắt',
        'Kỹ năng khám đáy mắt',
        'Đo nhãn áp và góc tiền phòng',
        'Tư vấn phẫu thuật mắt',
      ],
      'Tai mũi họng': [
        'Chẩn đoán bệnh TMH',
        'Kỹ năng nội soi TMH',
        'Đo thính lực và đánh giá',
        'Xử lý chảy máu cam',
        'Tư vấn phẫu thuật TMH',
      ],
      'Nội tiết': [
        'Chẩn đoán rối loạn nội tiết',
        'Quản lý bệnh tiểu đường',
        'Điều trị bệnh tuyến giáp',
        'Đọc và phân tích xét nghiệm hormone',
        'Tư vấn dinh dưỡng nội tiết',
      ],
      'Nhi khoa': [
        'Khám và chăm sóc sức khỏe trẻ em',
        'Theo dõi phát triển trẻ',
        'Kỹ năng tiêm chủng an toàn',
        'Xử lý cấp cứu nhi',
        'Tư vấn nuôi dưỡng trẻ',
      ],
      'Sản phụ khoa': [
        'Khám và chăm sóc sản phụ khoa',
        'Kỹ năng siêu âm thai',
        'Theo dõi và quản lý thai kỳ',
        'Xử lý cấp cứu sản khoa',
        'Tư vấn kế hoạch hóa gia đình',
      ],
      'Răng hàm mặt': [
        'Khám và chẩn đoán bệnh răng miệng',
        'Kỹ năng điều trị sâu răng',
        'Kỹ năng nhổ răng an toàn',
        'Phẫu thuật nha khoa nhỏ',
        'Tư vấn chỉnh nha và làm đẹp',
      ],
    };

    return skillsMap[specialty] || [
      'Khám bệnh tổng quát',
      'Chẩn đoán bệnh lý cơ bản',
      'Kê đơn thuốc hợp lý',
      'Tư vấn sức khỏe',
      'Theo dõi điều trị dài hạn',
    ];
  };

  const professionalInfo = doctor ? getProfessionalInfo(doctor.specialty) : [];
  const coreSkills = doctor ? getCoreSkills(doctor.specialty) : [];

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

          {/* Professional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin chuyên môn và hồ sơ pháp lý</Text>
            {professionalInfo.map((info, index) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text style={styles.serviceText}>{info}</Text>
              </View>
            ))}
          </View>

          {/* Core Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tố chất và kỹ năng nền tảng</Text>
            {coreSkills.map((skill, index) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.serviceText}>{skill}</Text>
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
