import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllDocuments } from '../services/firebaseService';

// Helper function to get doctor image
const getDoctorImageFromName = (imageName: string) => {
  const images: { [key: string]: any } = {
    'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
    'tranthilan.png': require('@/assets/images/tranthilan.png'),
    'leminhtam.png': require('@/assets/images/leminhtam.png'),
    'phamthuha.png': require('@/assets/images/phamthuha.png'),
    'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
    'vuthilan.png': require('@/assets/images/vuthilan.png'),
    'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
    'tranthimai.png': require('@/assets/images/tranthimai.png'),
    'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
    'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  };
  return images[imageName] || require('@/assets/images/logo.png');
};

export default function ChatScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await getAllDocuments('doctors');
      console.log('Doctors data:', data); // Debug log
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Mapping triệu chứng -> chuyên khoa (chi tiết)
  const symptomToSpecialty: { [key: string]: string } = {
    // Tim mạch (15 triệu chứng)
    'đau ngực': 'cardiology',
    'tức ngực': 'cardiology',
    'khó thở': 'cardiology',
    'khó thở khi nằm': 'cardiology',
    'hồi hộp': 'cardiology',
    'tim đập nhanh': 'cardiology',
    'tim đập không đều': 'cardiology',
    'loạn nhịp': 'cardiology',
    'chóng mặt': 'cardiology',
    'ngất xỉu': 'cardiology',
    'mệt mỏi kéo dài': 'cardiology',
    'phù chân': 'cardiology',
    'sưng chân': 'cardiology',
    'đau lan ra tay trái': 'cardiology',
    'đổ mồ hôi lạnh': 'cardiology',
    'buồn nôn kèm đau ngực': 'cardiology',
    'da tím tái': 'cardiology',
    'thiếu oxy': 'cardiology',
    'ho kéo dài': 'cardiology',
    
    // Hô hấp (15 triệu chứng)
    'ho khan': 'respiratory',
    'ho có đờm': 'respiratory',
    'ho': 'respiratory',
    'thở gấp': 'respiratory',
    'thở khò khè': 'respiratory',
    'đau họng': 'respiratory',
    'hắt hơi': 'respiratory',
    'đau ngực khi thở': 'respiratory',
    'ho ra máu': 'respiratory',
    'sốt kèm ho': 'respiratory',
    'mất giọng': 'respiratory',
    'khàn tiếng': 'respiratory',
    'chảy nước mũi': 'respiratory',
    'khàn giọng': 'respiratory',
    'viêm họng': 'respiratory',
    'viêm phổi': 'respiratory',
    'hen suyễn': 'respiratory',
    
    // Da liễu (15 triệu chứng)
    'ngứa da': 'dermatology',
    'nổi mẩn đỏ': 'dermatology',
    'phát ban': 'dermatology',
    'mụn trứng cá': 'dermatology',
    'mụn': 'dermatology',
    'da khô': 'dermatology',
    'bong tróc': 'dermatology',
    'da nhờn': 'dermatology',
    'tiết dầu nhiều': 'dermatology',
    'nổi mụn nước': 'dermatology',
    'lở loét da': 'dermatology',
    'da thâm': 'dermatology',
    'da sạm': 'dermatology',
    'nhiễm nấm da': 'dermatology',
    'hắc lào': 'dermatology',
    'lang ben': 'dermatology',
    'dị ứng da': 'dermatology',
    'rụng tóc': 'dermatology',
    'gàu': 'dermatology',
    'móng tay bất thường': 'dermatology',
    'móng chân bất thường': 'dermatology',
    'cháy nắng': 'dermatology',
    
    // Thần kinh (15 triệu chứng)
    'đau đầu': 'neurology',
    'đau nửa đầu': 'neurology',
    'hoa mắt': 'neurology',
    'tê bì tay chân': 'neurology',
    'tê bì': 'neurology',
    'yếu tay chân': 'neurology',
    'mất ngủ': 'neurology',
    'ngủ nhiều bất thường': 'neurology',
    'suy giảm trí nhớ': 'neurology',
    'khó tập trung': 'neurology',
    'run tay chân': 'neurology',
    'run tay': 'neurology',
    'co giật': 'neurology',
    'mất ý thức': 'neurology',
    'méo miệng': 'neurology',
    'liệt mặt': 'neurology',
    'nói khó': 'neurology',
    'nói ngọng': 'neurology',
    'đi lại mất thăng bằng': 'neurology',
    'mất thăng bằng': 'neurology',
    'lo âu': 'neurology',
    'căng thẳng': 'neurology',
    
    // Nhi khoa (15 triệu chứng)
    'sốt': 'pediatrics',
    'sốt cao': 'pediatrics',
    'sổ mũi': 'pediatrics',
    'nghẹt mũi': 'pediatrics',
    'khò khè': 'pediatrics',
    'biếng ăn': 'pediatrics',
    'nôn': 'pediatrics',
    'nôn ói': 'pediatrics',
    'tiêu chảy': 'pediatrics',
    'táo bón': 'pediatrics',
    'đau bụng': 'pediatrics',
    'quấy khóc': 'pediatrics',
    'khóc nhiều': 'pediatrics',
    'ngủ kém': 'pediatrics',
    'khó ngủ': 'pediatrics',
    'chậm tăng cân': 'pediatrics',
    
    // Sản phụ khoa (15 triệu chứng)
    'đau bụng dưới': 'obgyn',
    'rối loạn kinh nguyệt': 'obgyn',
    'kinh nguyệt không đều': 'obgyn',
    'trễ kinh': 'obgyn',
    'rong kinh': 'obgyn',
    'ra máu kéo dài': 'obgyn',
    'khí hư bất thường': 'obgyn',
    'ngứa vùng kín': 'obgyn',
    'đau khi quan hệ': 'obgyn',
    'chảy máu âm đạo': 'obgyn',
    'đau vùng chậu': 'obgyn',
    'tiểu buốt': 'obgyn',
    'tiểu rắt': 'obgyn',
    'buồn nôn thai kỳ': 'obgyn',
    'căng tức ngực': 'obgyn',
    'ra máu khi mang thai': 'obgyn',
    'thai máy bất thường': 'obgyn',
    
    // Tiêu hóa (15 triệu chứng)
    'đầy hơi': 'gastro',
    'chướng bụng': 'gastro',
    'khó tiêu': 'gastro',
    'ợ hơi': 'gastro',
    'ợ chua': 'gastro',
    'trào ngược': 'gastro',
    'đi ngoài ra máu': 'gastro',
    'phân đen': 'gastro',
    'chán ăn': 'gastro',
    'sụt cân không rõ nguyên nhân': 'gastro',
    'đau vùng thượng vị': 'gastro',
    'nóng rát vùng ngực': 'gastro',
    'ợ nóng': 'gastro',
    'đau dạ dày': 'gastro',
    
    // Cơ xương khớp (15 triệu chứng)
    'đau khớp': 'ortho',
    'sưng khớp': 'ortho',
    'cứng khớp': 'ortho',
    'đau lưng': 'ortho',
    'đau cổ': 'ortho',
    'đau vai': 'ortho',
    'đau gối': 'ortho',
    'đau cơ': 'ortho',
    'yếu cơ': 'ortho',
    'hạn chế vận động': 'ortho',
    'khớp kêu lục cục': 'ortho',
    'biến dạng khớp': 'ortho',
    'co cứng cơ': 'ortho',
    'đau khi vận động': 'ortho',
    'đau cột sống': 'ortho',
  };

  const getSpecialtyFromSymptom = (symptom: string): string => {
    const lowerSymptom = symptom.toLowerCase().trim();
    
    // Tìm chuyên khoa phù hợp - ưu tiên match chính xác nhất
    let bestMatch = 'all';
    let maxMatchLength = 0;
    
    for (const [key, specialty] of Object.entries(symptomToSpecialty)) {
      if (lowerSymptom.includes(key) && key.length > maxMatchLength) {
        bestMatch = specialty;
        maxMatchLength = key.length;
      }
    }
    
    return bestMatch;
  };

  const commonSymptoms = [
    { id: 'symptom-1', icon: '💔', label: 'Đau ngực', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'cardiology', specialtyId: 'tim_mach' },
    { id: 'symptom-2', icon: '🩹', label: 'Ngứa da', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'dermatology', specialtyId: 'da_lieu' },
    { id: 'symptom-3', icon: '🌡️', label: 'Sốt', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'pediatrics', specialtyId: 'nhi_khoa' },
    { id: 'symptom-4', icon: '🤰', label: 'Rối loạn kinh', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'obgyn', specialtyId: 'san_phu_khoa' },
    { id: 'symptom-5', icon: '🤕', label: 'Đau đầu', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'neurology', specialtyId: 'than_kinh' },
    { id: 'symptom-6', icon: '😷', label: 'Ho', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'respiratory', specialtyId: 'ho_hap' },
    { id: 'symptom-7', icon: '🤢', label: 'Đau bụng', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'gastro', specialtyId: 'tieu_hoa' },
    { id: 'symptom-8', icon: '🦵', label: 'Đau khớp', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'ortho', specialtyId: 'co_xuong_khop' },
    { id: 'symptom-9', icon: '👂', label: 'Ngạt mũi', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'ent', specialtyId: 'tai_mui_hong' },
    { id: 'symptom-10', icon: '👁️', label: 'Mờ mắt', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'ophthalmology', specialtyId: 'mat' },
    { id: 'symptom-11', icon: '🦷', label: 'Đau răng', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'dental', specialtyId: 'rang_ham_mat' },
    { id: 'symptom-12', icon: '😴', label: 'Mệt mỏi', color: '#E0F7FA', borderColor: '#00BCD4', specialty: 'endocrinology', specialtyId: 'noi_tiet' },
  ];

  const getSpecialtyName = (specialtyId: string): string => {
    const specialtyNames: { [key: string]: string } = {
      'respiratory': 'Hô hấp',
      'cardiology': 'Tim mạch',
      'dermatology': 'Da liễu',
      'neurology': 'Thần kinh',
      'pediatrics': 'Nhi khoa',
      'obgyn': 'Sản phụ khoa',
      'gastro': 'Tiêu hóa',
      'ortho': 'Cơ xương khớp',
      'ent': 'Tai mũi họng',
      'ophthalmology': 'Mắt',
      'dental': 'Răng hàm mặt',
      'endocrinology': 'Nội tiết',
    };
    return specialtyNames[specialtyId] || 'Tổng quát';
  };

  const getSpecialtyIdFromSpecialty = (specialty: string): string => {
    const specialtyMap: { [key: string]: string } = {
      'respiratory': 'ho_hap',
      'cardiology': 'tim_mach',
      'dermatology': 'da_lieu',
      'neurology': 'than_kinh',
      'pediatrics': 'nhi_khoa',
      'gastro': 'tieu_hoa',
      'ortho': 'co_xuong_khop',
      'obgyn': 'san_phu_khoa',
    };
    return specialtyMap[specialty] || 'all';
  };

  const currentSpecialty = searchText.trim() ? getSpecialtyFromSymptom(searchText) : 'respiratory';
  const currentSpecialtyName = getSpecialtyName(currentSpecialty);

  const suggestions = [
    {
      id: 'suggestion-1',
      icon: '🩺',
      title: currentSpecialtyName,
      subtitle: 'Phù hợp cao',
      description: `Các triệu chứng bạn mô tả có thể liên quan đến bệnh lý ${currentSpecialtyName.toLowerCase()}.`,
      match: 92,
      color: '#E0F7FA',
    },
  ];

  const quickActions = [
    {
      id: '1',
      icon: 'calendar-outline',
      title: 'Đặt lịch khám với bác sĩ chuyên khoa Hô hấp',
      subtitle: 'Đã được nhắn đến các bác sĩ lịch khám',
      color: '#00BCD4',
    },
    {
      id: '2',
      icon: 'list-outline',
      title: 'Theo dõi triệu chứng',
      subtitle: 'Nếu triệu chứng nặng hơn, hãy đến cơ sở y tế gần nhất',
      color: '#00BCD4',
    },
    {
      id: '3',
      icon: 'document-text-outline',
      title: 'Tham khảo bài viết liên quan',
      subtitle: 'Tìm hiểu thêm về các bệnh lý hô hấp thường gặp',
      color: '#00BCD4',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tư vấn chuyên khoa</Text>
          <Text style={styles.headerSubtitle}>
            Mô tả triệu chứng để nhận gợi ý chuyên khoa phù hợp
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.chatIconBtn}
          onPress={() => router.push('/ai-consultation')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionLabel}>Mô tả triệu chứng của bạn</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Ví dụ: đau đầu, ho khan, đau bụng..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => {
                if (searchText.trim()) {
                  const specialty = getSpecialtyFromSymptom(searchText);
                  const specialtyId = getSpecialtyIdFromSpecialty(specialty);
                  router.push({
                    pathname: '/recommended-doctors',
                    params: { 
                      symptom: searchText.trim(),
                      specialty: specialtyId
                    }
                  });
                }
              }}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={() => {
                if (searchText.trim()) {
                  const specialty = getSpecialtyFromSymptom(searchText);
                  const specialtyId = getSpecialtyIdFromSpecialty(specialty);
                  router.push({
                    pathname: '/recommended-doctors',
                    params: { 
                      symptom: searchText.trim(),
                      specialty: specialtyId
                    }
                  });
                }
              }}
            >
              <Ionicons name="arrow-forward-circle" size={24} color="#00BCD4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Common Symptoms */}
        <View style={styles.symptomsSection}>
          <Text style={styles.sectionLabel}>Triệu chứng thường gặp</Text>
          <View style={styles.symptomsGrid}>
            {commonSymptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[styles.symptomChip, { 
                  backgroundColor: symptom.color,
                  borderColor: symptom.borderColor,
                  borderWidth: 1.5,
                }]}
                onPress={() => {
                  setSearchText(symptom.label);
                  router.push({
                    pathname: '/recommended-doctors',
                    params: { 
                      symptom: symptom.label,
                      specialty: symptom.specialtyId
                    }
                  });
                }}
              >
                <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                <Text style={styles.symptomLabel}>{symptom.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consult Button */}
        <TouchableOpacity 
          style={styles.consultButton}
          onPress={() => {
            router.push('/ai-consultation');
          }}
        >
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={styles.consultButtonText}>Nhận tư vấn ngay</Text>
        </TouchableOpacity>

        {/* Suggestions */}
        <View style={styles.suggestionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kết quả gợi ý</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color="#00BCD4" />
            </TouchableOpacity>
          </View>

          {suggestions.map((suggestion) => (
            <View key={suggestion.id} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionLeft}>
                  <View style={[styles.suggestionIcon, { backgroundColor: suggestion.color }]}>
                    <Text style={styles.suggestionIconText}>{suggestion.icon}</Text>
                  </View>
                  <View>
                    <View style={styles.suggestionTitleRow}>
                      <Text style={styles.suggestionTitle}>Chuyên khoa phù hợp</Text>
                    </View>
                    <View style={styles.suggestionSubtitleRow}>
                      <Text style={styles.suggestionSpecialty}>{suggestion.title}</Text>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchText}>Phù hợp cao</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.matchCircle}>
                  <Text style={styles.matchPercentage}>{suggestion.match}%</Text>
                  <Text style={styles.matchLabel}>Độ phù hợp</Text>
                </View>
              </View>
              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Bạn nên</Text>
          
          {/* Action 1: Tư vấn AI */}
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/ai-consultation')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#00BCD4' + '20' }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#00BCD4" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Tư vấn với AI ngay</Text>
              <Text style={styles.actionSubtitle}>Nhận phân tích chi tiết và gợi ý bác sĩ phù hợp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Action 2: Xem bác sĩ chuyên khoa */}
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/all-doctors')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="people" size={20} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Xem bác sĩ chuyên khoa</Text>
              <Text style={styles.actionSubtitle}>Danh sách bác sĩ giỏi và đánh giá cao</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Action 3: Đặt lịch khám */}
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="calendar" size={20} color="#FF9800" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Đặt lịch khám ngay</Text>
              <Text style={styles.actionSubtitle}>Chọn thời gian phù hợp với lịch trình của bạn</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Action 4: Tìm bệnh viện gần */}
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/find-hospital')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F44336' + '20' }]}>
              <Ionicons name="location" size={20} color="#F44336" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Tìm bệnh viện gần nhất</Text>
              <Text style={styles.actionSubtitle}>Nếu triệu chứng nghiêm trọng, hãy đến ngay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Action 5: Đọc bài viết */}
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/articles')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' + '20' }]}>
              <Ionicons name="book" size={20} color="#9C27B0" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Đọc bài viết về sức khỏe</Text>
              <Text style={styles.actionSubtitle}>Tìm hiểu thêm kiến thức y tế hữu ích</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Doctors Section */}
        <View style={styles.doctorsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bác sĩ gợi ý</Text>
            <TouchableOpacity onPress={() => router.push('/all-doctors')}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00BCD4" />
            </View>
          ) : doctors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có bác sĩ nào</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
              {doctors.slice(0, 5).map((doctor) => (
                <View key={doctor.id} style={styles.doctorCard}>
                  <View style={styles.doctorAvatarContainer}>
                    <Image 
                      source={getDoctorImageFromName(doctor.image || doctor.ten)}
                      style={styles.doctorAvatar} 
                    />
                    <View style={styles.onlineBadge} />
                  </View>
                  <Text style={styles.doctorName} numberOfLines={1}>
                    {doctor.ten || doctor.name}
                  </Text>
                  <Text style={styles.doctorSpecialty} numberOfLines={1}>
                    {doctor.chuyen_khoa || doctor.specialty}
                  </Text>
                  <View style={styles.doctorRating}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>{doctor.rating || 4.8}</Text>
                    <Text style={styles.reviewsText}>({doctor.reviewCount || 100})</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => router.push({
                      pathname: '/doctor-chat',
                      params: {
                        doctorName: doctor.ten || doctor.name,
                        doctorSpecialty: doctor.chuyen_khoa || doctor.specialty,
                        doctorImage: doctor.image || 'logo.png',
                      }
                    })}
                  >
                    <Text style={styles.bookButtonText}>Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
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
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  chatIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  symptomsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    width: '31.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomIcon: {
    fontSize: 16,
  },
  symptomLabel: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: '600',
    flex: 1,
  },
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  consultButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  suggestionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionIconText: {
    fontSize: 24,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  suggestionSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionSpecialty: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  matchBadge: {
    backgroundColor: '#06D6A0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  matchText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  matchCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00BCD4',
  },
  matchLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  suggestionDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  doctorsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  doctorsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#06D6A0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 6,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  reviewsText: {
    fontSize: 10,
    color: '#64748b',
  },
  bookButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00BCD4',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
  },
});
