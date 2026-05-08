import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
};

export default function SpecialtyDetailScreen() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  const specialties = [
    { id: 'checkup', name: 'Tìm khám', icon: 'heart-outline' },
    { id: 'brain', name: 'Thần kinh', icon: 'pulse-outline' },
    { id: 'ear', name: 'Tai mũi họng', icon: 'ear-outline' },
    { id: 'skin', name: 'Da liễu', icon: 'water-outline' },
    { id: 'pediatric', name: 'Nhi khoa', icon: 'happy-outline' },
    { id: 'digestion', name: 'Cơ xương khớp', icon: 'body-outline' },
    { id: 'respiratory', name: 'Tiêu hóa', icon: 'nutrition-outline' },
    { id: 'urology', name: 'Sản phụ khoa', icon: 'woman-outline' },
    { id: 'ophthalmology', name: 'Mắt', icon: 'eye-outline' },
    { id: 'dentistry', name: 'Nhi khoa', icon: 'happy-outline' },
  ];

  const allSpecialties = [
    { id: 'checkup', name: 'Tìm khám', icon: 'heart-outline' },
    { id: 'brain', name: 'Thần kinh', icon: 'pulse-outline' },
    { id: 'ear', name: 'Tai mũi họng', icon: 'ear-outline' },
    { id: 'skin', name: 'Da liễu', icon: 'water-outline' },
    { id: 'pediatric', name: 'Nhi khoa', icon: 'happy-outline' },
    { id: 'digestion', name: 'Cơ xương khớp', icon: 'body-outline' },
    { id: 'respiratory', name: 'Tiêu hóa', icon: 'nutrition-outline' },
    { id: 'urology', name: 'Sản phụ khoa', icon: 'woman-outline' },
    { id: 'ophthalmology', name: 'Mắt', icon: 'eye-outline' },
    { id: 'dentistry', name: 'Nhi khoa', icon: 'happy-outline' },
    { id: 'cardio', name: 'Tim mạch', icon: 'heart-outline' },
    { id: 'ortho', name: 'Chỉnh hình', icon: 'body-outline' },
    { id: 'neuro', name: 'Thần kinh học', icon: 'pulse-outline' },
    { id: 'oncology', name: 'Ung bướu', icon: 'medical-outline' },
    { id: 'psychiatry', name: 'Tâm thần', icon: 'happy-outline' },
    { id: 'urology2', name: 'Tiết niệu', icon: 'medkit-outline' },
  ];

  const topDoctors = [
    {
      id: 1,
      name: 'BS. Nguyễn Văn An',
      specialty: 'Tim mạch',
      rating: 4.9,
      reviews: 128,
      image: require('@/assets/images/nguyenvanam.png'),
    },
    {
      id: 2,
      name: 'BS. Trần Thị Lan',
      specialty: 'Da liễu',
      rating: 4.8,
      reviews: 96,
      image: require('@/assets/images/tranthilan.png'),
    },
    {
      id: 3,
      name: 'BS. Lê Minh Tâm',
      specialty: 'Tai mũi họng',
      rating: 4.9,
      reviews: 112,
      image: require('@/assets/images/leminhtam.png'),
    },
  ];

  const guidelines = [
    {
      id: 1,
      title: 'Chọn chuyên khoa',
      description: 'Chọn chuyên khoa bạn cần tư vấn',
    },
    {
      id: 2,
      title: 'Chọn bác sĩ',
      description: 'Chọn bác sĩ phù hợp với bạn',
    },
    {
      id: 3,
      title: 'Bắt đầu tư vấn',
      description: 'Gọi điện hoặc chat với bác sĩ',
    },
    {
      id: 4,
      title: 'Nhận kết quả',
      description: 'Nhận kết quả hướng dẫn điều trị',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tư vấn chuyên khoa</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm chuyên khoa hoặc bác sĩ..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color="#00BCD4" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Tư vấn cùng bác sĩ chuyên khoa</Text>
            <Text style={styles.bannerSubtitle}>Nhanh chóng - Uy tín - Bảo mật</Text>
            <View style={styles.bannerFeatures}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={16} color="#00BCD4" />
                <Text style={styles.featureText}>Độ tin bác sĩ giàu kinh nghiệm</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={16} color="#00BCD4" />
                <Text style={styles.featureText}>Hỗ trợ 24/7 mọi lúc mọi nơi</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.bannerButton}
              onPress={() => router.push('/ai-consultation')}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#fff" />
              <Text style={styles.bannerButtonText}>Tư vấn ngay</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.bannerImage}
          />
        </View>

        {/* Top Doctors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bác sĩ tư vấn nhiều nhất</Text>
          <View style={styles.doctorsGrid}>
            {topDoctors.map((doctor) => (
              <TouchableOpacity 
                key={doctor.id} 
                style={styles.doctorCard}
                onPress={() => router.push('/ai-consultation')}
              >
                <Image
                  source={doctor.image}
                  style={styles.doctorImage}
                  contentFit="cover"
                  placeholder={require('@/assets/images/logo.png')}
                  transition={200}
                />
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.rating}>{doctor.rating}</Text>
                  <Text style={styles.reviews}>({doctor.reviews})</Text>
                </View>
                <TouchableOpacity 
                  style={styles.consultButton}
                  onPress={() => router.push('/ai-consultation')}
                >
                  <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                  <Text style={styles.consultButtonText}>Tư vấn ngay</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Guidelines Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng dẫn tư vấn</Text>
          <View style={styles.guidelinesContainer}>
            {guidelines.map((guideline, index) => (
              <View key={guideline.id} style={styles.guidelineItem}>
                <View style={styles.guidelineNumber}>
                  <Text style={styles.guidelineNumberText}>{guideline.id}</Text>
                </View>
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineTitle}>{guideline.title}</Text>
                  <Text style={styles.guidelineDescription}>{guideline.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* You Should Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bạn nên</Text>
          <Text style={styles.sectionSubtitle}>Đặt lịch khám với bác sĩ chuyên khoa Hô hấp</Text>
          <View style={styles.recommendedDoctorsGrid}>
            {[
              {
                id: 1,
                name: 'BS. Nguyễn Văn An',
                specialty: 'Hô hấp',
                rating: 4.9,
                image: require('@/assets/images/nguyenvanam.png'),
              },
              {
                id: 2,
                name: 'BS. Trần Thị Mai',
                specialty: 'Hô hấp',
                rating: 4.8,
                image: require('@/assets/images/tranthimai.png'),
              },
              {
                id: 3,
                name: 'BS. Lê Hoàng Nam',
                specialty: 'Hô hấp',
                rating: 4.9,
                image: require('@/assets/images/lehoangnam.png'),
              },
            ].map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.recommendedDoctorCard}
                onPress={() => router.push({
                  pathname: '/(tabs)/booking',
                  params: {
                    doctorName: doctor.name,
                    specialty: 'Hô hấp',
                    returnTo: '/specialty-detail',
                  }
                })}
              >
                <Image
                  source={doctor.image}
                  style={styles.recommendedDoctorImage}
                  contentFit="cover"
                />
                <Text style={styles.recommendedDoctorName}>{doctor.name}</Text>
                <Text style={styles.recommendedDoctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.recommendedRatingContainer}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.recommendedRating}>{doctor.rating}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.bookingButton}
                  onPress={() => router.push({
                    pathname: '/(tabs)/booking',
                    params: {
                      doctorName: doctor.name,
                      specialty: 'Hô hấp',
                    }
                  })}
                >
                  <Ionicons name="calendar-outline" size={14} color="#fff" />
                  <Text style={styles.bookingButtonText}>Đặt lịch</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
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
              <View style={styles.modalGrid}>
                {allSpecialties.map((specialty) => (
                  <TouchableOpacity
                    key={specialty.id}
                    style={styles.modalSpecialtyItem}
                    onPress={() => {
                      setSelectedSpecialty(specialty.id);
                      setShowAllSpecialties(false);
                    }}
                  >
                    <View style={styles.modalSpecialtyIcon}>
                      <Ionicons name={specialty.icon as any} size={28} color="#00BCD4" />
                    </View>
                    <Text style={styles.modalSpecialtyName}>{specialty.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#B2EBF2',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00897B',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#00897B',
    marginBottom: 12,
  },
  bannerFeatures: {
    gap: 8,
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#00897B',
  },
  bannerButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bannerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialtyItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  specialtyItemSelected: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  specialtyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialtyIconSelected: {
    backgroundColor: '#00BCD4',
  },
  specialtyName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  specialtyNameSelected: {
    color: '#fff',
  },
  doctorsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  doctorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  reviews: {
    fontSize: 10,
    color: '#999',
  },
  consultButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
    width: '100%',
    justifyContent: 'center',
  },
  consultButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  guidelinesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guidelineNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  guidelineDescription: {
    fontSize: 12,
    color: '#666',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  recommendedDoctorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  recommendedDoctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
  },
  recommendedDoctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  recommendedDoctorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
  },
  recommendedDoctorSpecialty: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  recommendedRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  recommendedRating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  bookingButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
    width: '100%',
    justifyContent: 'center',
  },
  bookingButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modalSpecialtyItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  modalSpecialtyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalSpecialtyName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
