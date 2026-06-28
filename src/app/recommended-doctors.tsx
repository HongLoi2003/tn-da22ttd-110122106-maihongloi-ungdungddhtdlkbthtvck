import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllDocuments } from './services/firebaseService';
import { getDoctorAvatarSmart } from './utils/doctorAvatars';

// Map triệu chứng sang chuyên khoa
const symptomToSpecialty: any = {
  'Đau đầu': 'Thần kinh',
  'Sốt cao': 'Nội tổng quát',
  'Ho khan': 'Hô hấp',
  'Đau bụng': 'Tiêu hóa',
  'Đau ngực': 'Tim mạch',
  'Đau khớp': 'Cơ xương khớp',
};

export default function RecommendedDoctorsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const symptom = params.symptom as string;
  const specialtyParam = params.specialty as string; // Nhận specialty từ params
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Load doctors chỉ 1 lần khi component mount
  useEffect(() => {
    console.log('🔄 Component mounted, loading doctors...');
    loadDoctors();
  }, []);

  // Set filter AFTER doctors are loaded
  useEffect(() => {
    if ((symptom || specialtyParam) && doctors.length > 0) {
      console.log('🔄 useEffect: Symptom:', symptom, '| Specialty param:', specialtyParam);
      console.log('🔄 useEffect: Doctors available:', doctors.length);
      
      // Danh sách các specialty ID hợp lệ
      const validSpecialtyIds = ['tim_mach', 'da_lieu', 'nhi_khoa', 'san_phu_khoa', 'than_kinh', 'ho_hap', 'tieu_hoa', 'co_xuong_khop', 'tai_mui_hong', 'mat', 'rang_ham_mat', 'noi_tiet', 'all'];
      
      let specialtyId = 'all';
      
      // Nếu specialtyParam đã là ID hợp lệ, dùng trực tiếp
      if (specialtyParam && validSpecialtyIds.includes(specialtyParam)) {
        specialtyId = specialtyParam;
        console.log('✅ useEffect: Using specialty ID directly:', specialtyId);
      } else {
        // Nếu không, map từ tên tiếng Việt
        const recommendedSpecialty = specialtyParam || symptomToSpecialty[symptom];
        console.log('🔄 Recommended specialty:', recommendedSpecialty);
        
        if (recommendedSpecialty) {
          const normalized = recommendedSpecialty.toLowerCase().trim();
          if (normalized.includes('tim') || normalized.includes('mạch')) specialtyId = 'tim_mach';
          else if (normalized.includes('da') || normalized.includes('liễu')) specialtyId = 'da_lieu';
          else if (normalized.includes('nhi')) specialtyId = 'nhi_khoa';
          else if (normalized.includes('sản') || normalized.includes('phụ')) specialtyId = 'san_phu_khoa';
          else if (normalized.includes('thần') || normalized.includes('kinh')) specialtyId = 'than_kinh';
          else if (normalized.includes('hô') || normalized.includes('hấp')) specialtyId = 'ho_hap';
          else if (normalized.includes('tiêu') || normalized.includes('hóa')) specialtyId = 'tieu_hoa';
          else if (normalized.includes('cơ') || normalized.includes('xương') || normalized.includes('khớp')) specialtyId = 'co_xuong_khop';
          else if (normalized.includes('tai') || normalized.includes('mũi') || normalized.includes('họng')) specialtyId = 'tai_mui_hong';
          else if (normalized.includes('mắt') || normalized.includes('nhãn')) specialtyId = 'mat';
          else if (normalized.includes('răng') || normalized.includes('hàm') || normalized.includes('nha')) specialtyId = 'rang_ham_mat';
          else if (normalized.includes('nội tiết') || normalized.includes('tiết')) specialtyId = 'noi_tiet';
          else if (normalized.includes('nội') || normalized.includes('tổng quát')) specialtyId = 'all';
        }
        console.log('✅ useEffect: Mapped to specialty:', specialtyId);
      }
      
      setSelectedSpecialty(specialtyId);
    }
  }, [doctors.length, symptom, specialtyParam]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      console.log('🔍 Đang load dữ liệu bác sĩ từ Firebase...');
      const data = await getAllDocuments('doctors');
      console.log('📊 Dữ liệu bác sĩ nhận được:', data);
      console.log('📊 Số lượng bác sĩ:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Không có dữ liệu bác sĩ từ Firebase - Vui lòng seed dữ liệu!');
        
        // Hiển thị alert hướng dẫn
        Alert.alert(
          '⚠️ Chưa có dữ liệu bác sĩ',
          'Bạn cần import dữ liệu vào Firebase trước.\n\n' +
          'Cách làm:\n' +
          '1. Vào trang Profile (tab cuối cùng)\n' +
          '2. Tìm và bấm vào "Seed Data" hoặc "Import dữ liệu"\n' +
          '3. Bấm nút "Import Tất Cả Dữ Liệu"\n' +
          '4. Đợi import xong và quay lại đây',
          [
            {
              text: 'Đi đến Seed Data',
              onPress: () => router.push('/seed-data')
            },
            {
              text: 'Đóng',
              style: 'cancel'
            }
          ]
        );
        
        setDoctors([]);
        setLoading(false);
        return;
      }

      // Loại bỏ duplicate dựa trên id
      const uniqueData = Array.from(
        new Map(data.map((doc: any) => [doc.id, doc])).values()
      );
      
      console.log('📊 Sau khi loại bỏ duplicate:', uniqueData.length, 'bác sĩ');
      
      // Kiểm tra xem có duplicate ID không
      const ids = data.map((d: any) => d.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn('⚠️ Phát hiện duplicate IDs:', [...new Set(duplicateIds)]);
      }

      // Mapping từ specialtyId sang tên hiển thị
      const specialtyNames: { [key: string]: string } = {
        'tim_mach': 'Tim mạch',
        'than_kinh': 'Thần kinh',
        'ho_hap': 'Hô hấp',
        'tieu_hoa': 'Tiêu hóa',
        'da_lieu': 'Da liễu',
        'nhi_khoa': 'Nhi khoa',
        'san_phu_khoa': 'Sản phụ khoa',
        'co_xuong_khop': 'Cơ xương khớp',
        'tai_mui_hong': 'Tai mũi họng',
        'mat': 'Mắt',
        'rang_ham_mat': 'Răng hàm mặt',
        'noi_tiet': 'Nội tiết',
      };

      const mappedDoctors = uniqueData.map((doc: any) => {
        // Lấy chuyên khoa từ nhiều trường có thể có
        const chuyenKhoa = doc.chuyen_khoa || doc.chuyenKhoa || doc.specialty || doc.chuyen_khoa_id || 'Đa khoa';
        
        console.log('🔍 Bác sĩ:', doc.ten || doc.name, '- Chuyên khoa gốc:', chuyenKhoa);
        
        let specialtyId = '';
        
        // Map chuyên khoa - xử lý cả tiếng Việt có dấu và không dấu
        const normalizedSpecialty = chuyenKhoa.toLowerCase().trim();
        
        if (normalizedSpecialty.includes('tim') || normalizedSpecialty.includes('mạch') || normalizedSpecialty.includes('cardio')) {
          specialtyId = 'tim_mach';
        } else if (normalizedSpecialty.includes('da') || normalizedSpecialty.includes('liễu') || normalizedSpecialty.includes('derma')) {
          specialtyId = 'da_lieu';
        } else if (normalizedSpecialty.includes('nhi')) {
          specialtyId = 'nhi_khoa';
        } else if (normalizedSpecialty.includes('sản') || normalizedSpecialty.includes('phụ') || normalizedSpecialty.includes('phu')) {
          specialtyId = 'san_phu_khoa';
        } else if (normalizedSpecialty.includes('thần') || normalizedSpecialty.includes('than') || normalizedSpecialty.includes('kinh') || normalizedSpecialty.includes('neuro')) {
          specialtyId = 'than_kinh';
          console.log('✅ Tìm thấy bác sĩ Thần kinh:', doc.ten || doc.name);
        } else if (normalizedSpecialty.includes('hô') || normalizedSpecialty.includes('ho') || normalizedSpecialty.includes('hấp') || normalizedSpecialty.includes('hap') || normalizedSpecialty.includes('respiratory')) {
          specialtyId = 'ho_hap';
        } else if (normalizedSpecialty.includes('tiêu') || normalizedSpecialty.includes('tieu') || normalizedSpecialty.includes('hóa') || normalizedSpecialty.includes('hoa') || normalizedSpecialty.includes('gastro')) {
          specialtyId = 'tieu_hoa';
        } else if (normalizedSpecialty.includes('cơ') || normalizedSpecialty.includes('co') || normalizedSpecialty.includes('xương') || normalizedSpecialty.includes('xuong') || normalizedSpecialty.includes('khớp') || normalizedSpecialty.includes('khop') || normalizedSpecialty.includes('ortho')) {
          specialtyId = 'co_xuong_khop';
        } else if (normalizedSpecialty.includes('tai') || normalizedSpecialty.includes('mũi') || normalizedSpecialty.includes('mui') || normalizedSpecialty.includes('họng') || normalizedSpecialty.includes('hong') || normalizedSpecialty.includes('ent')) {
          specialtyId = 'tai_mui_hong';
        } else if (normalizedSpecialty.includes('mắt') || normalizedSpecialty.includes('mat') || normalizedSpecialty.includes('nhãn') || normalizedSpecialty.includes('nhan') || normalizedSpecialty.includes('ophthal')) {
          specialtyId = 'mat';
        } else if (normalizedSpecialty.includes('răng') || normalizedSpecialty.includes('rang') || normalizedSpecialty.includes('hàm') || normalizedSpecialty.includes('ham') || normalizedSpecialty.includes('nha') || normalizedSpecialty.includes('dental')) {
          specialtyId = 'rang_ham_mat';
        } else if (normalizedSpecialty.includes('nội tiết') || normalizedSpecialty.includes('noi tiet') || normalizedSpecialty.includes('tiết') || normalizedSpecialty.includes('tiet') || normalizedSpecialty.includes('endocrin')) {
          specialtyId = 'noi_tiet';
        } else {
          specialtyId = 'all';
          console.log('⚠️ Không map được chuyên khoa:', chuyenKhoa, '→ set = all');
        }
        
        console.log(`  → Mapped to: ${specialtyId}`);
        
        // Lấy tên chuyên khoa đẹp từ mapping
        const displaySpecialty = specialtyNames[specialtyId] || chuyenKhoa;
        
        return {
          id: doc.id,
          name: doc.ten || doc.name || 'Bác sĩ',
          specialty: displaySpecialty,
          specialtyId: specialtyId,
          chuyenKhoa: chuyenKhoa,
          rating: doc.rating || 4.8,
          reviews: 100,
          experience: `${doc.kinh_nghiem || doc.experience || 5} năm`,
          hospital: 'Bệnh viện Trường Đại học Trà Vinh',
          image: doc.image || 'nguyenvanam.png',
          online: doc.trang_thai !== false,
          price: (doc.phi_kham || doc.gia_kham) ? `${(doc.phi_kham || doc.gia_kham).toLocaleString('vi-VN')}đ` : '200.000đ',
          phone: doc.sdt || doc.phone || '',
        };
      });

      mappedDoctors.sort((a, b) => b.rating - a.rating);
      console.log('✅ Đã map xong dữ liệu bác sĩ:', mappedDoctors.length, 'bác sĩ');
      console.log('📋 Danh sách specialty IDs:', [...new Set(mappedDoctors.map(d => d.specialtyId))]);
      console.log('📋 Danh sách chuyên khoa gốc:', [...new Set(mappedDoctors.map(d => d.chuyenKhoa))]);
      
      // Log chi tiết từng bác sĩ
      mappedDoctors.forEach(d => {
        console.log(`  - ${d.name}: "${d.chuyenKhoa}" → ${d.specialtyId}`);
      });
      
      setDoctors(mappedDoctors);
      // Don't set filter here - let useEffect handle it after state updates
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    { id: 'all', name: 'Tất cả' },
    { id: 'tim_mach', name: 'Tim mạch' },
    { id: 'than_kinh', name: 'Thần kinh' },
    { id: 'ho_hap', name: 'Hô hấp' },
    { id: 'tieu_hoa', name: 'Tiêu hóa' },
    { id: 'da_lieu', name: 'Da liễu' },
    { id: 'nhi_khoa', name: 'Nhi khoa' },
    { id: 'san_phu_khoa', name: 'Sản phụ khoa' },
    { id: 'co_xuong_khop', name: 'Cơ xương khớp' },
    { id: 'tai_mui_hong', name: 'Tai mũi họng' },
    { id: 'mat', name: 'Mắt' },
    { id: 'rang_ham_mat', name: 'Răng hàm mặt' },
    { id: 'noi_tiet', name: 'Nội tiết' },
  ];
  
  // Apply search first if there's a query, then filter by specialty
  const searchedDoctors = searchQuery.trim() 
    ? doctors.filter(doc => {
        const query = searchQuery.toLowerCase().trim();
        const name = (doc.name || '').toLowerCase();
        const specialty = (doc.specialty || '').toLowerCase();
        const chuyenKhoa = (doc.chuyenKhoa || '').toLowerCase();
        
        // Normalize Vietnamese characters for better search
        const normalizeVietnamese = (str: string) => {
          if (!str) return '';
          return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
        };
        
        const normalizedQuery = normalizeVietnamese(query);
        const normalizedName = normalizeVietnamese(name);
        const normalizedSpecialty = normalizeVietnamese(specialty);
        const normalizedChuyenKhoa = normalizeVietnamese(chuyenKhoa);
        
        // Debug log
        console.log('🔍 Search:', {
          query,
          name: doc.name,
          specialty: doc.specialty,
          chuyenKhoa: doc.chuyenKhoa,
          normalizedQuery,
          normalizedSpecialty,
          match: normalizedSpecialty.includes(normalizedQuery)
        });
        
        // Tìm kiếm cả có dấu và không dấu
        const match = (
          name.includes(query) ||
          normalizedName.includes(normalizedQuery) ||
          specialty.includes(query) ||
          normalizedSpecialty.includes(normalizedQuery) ||
          chuyenKhoa.includes(query) ||
          normalizedChuyenKhoa.includes(normalizedQuery)
        );
        
        if (match) {
          console.log('✅ Found match:', doc.name, '-', doc.specialty);
        }
        
        return match;
      })
    : doctors;
  
  // Then apply specialty filter if not searching or if "all" is selected
  const filteredDoctors = selectedSpecialty === 'all' || searchQuery.trim()
    ? searchedDoctors 
    : searchedDoctors.filter(doc => {
        console.log(`Filtering: ${doc.name} - specialtyId: "${doc.specialtyId}" vs selected: "${selectedSpecialty}"`);
        return doc.specialtyId === selectedSpecialty;
      });
  
  console.log('📊 Final results:', filteredDoctors.length, 'doctors found');

  const renderDoctorCard = ({ item }: any) => {
    const handleChatPress = () => {
      router.push({
        pathname: '/doctor-chat',
        params: {
          doctorId: item.id,
          doctorName: `BS. ${item.name}`,
          doctorSpecialty: item.specialty,
          doctorImage: item.image || 'logo.png',
          doctorPhone: item.phone || '',
        }
      });
    };

    return (
      <TouchableOpacity 
        style={styles.doctorCard}
        onPress={handleChatPress}
      >
        <View style={styles.cardContent}>
          <View style={styles.doctorAvatarContainer}>
            <Image source={getDoctorAvatarSmart(item.name, item.image)} style={styles.doctorAvatar} />
            {item.online && <View style={styles.onlineBadge} />}
          </View>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorHeader}>
              <Text style={styles.doctorName}>{item.name}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            <Text style={styles.specialty}>{item.specialty}</Text>
            <View style={styles.doctorMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="briefcase-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>{item.experience}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>{item.hospital}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Phí tư vấn:</Text>
                <Text style={styles.priceValue}>{item.price}</Text>
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
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bác sĩ chuyên khoa</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {symptom ? `Bác sĩ chuyên ${specialtyParam || symptomToSpecialty[symptom] || 'khoa'}` : 'Bác sĩ gợi ý'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {symptom && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#00BCD4" />
          <Text style={styles.infoText}>
            Triệu chứng "{symptom}" thường liên quan đến chuyên khoa {specialtyParam || symptomToSpecialty[symptom] || 'Đa khoa'}. 
            {filteredDoctors.length > 0 
              ? ` Tìm thấy ${filteredDoctors.length} bác sĩ phù hợp.`
              : ' Không tìm thấy bác sĩ chuyên khoa này.'
            }
          </Text>
        </View>
      )}
      
      {!symptom && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#00BCD4" />
          <Text style={styles.infoText}>
            Danh sách bác sĩ được xếp hạng theo đánh giá cao nhất
          </Text>
        </View>
      )}

      {/* Specialty Filter */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={specialties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSpecialty === item.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSpecialty(item.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSpecialty === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>Không có bác sĩ nào</Text>
          
          <TouchableOpacity
            style={styles.seedButton}
            onPress={() => router.push('/seed-data')}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.seedButtonText}>Đi đến Seed Data</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDoctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy bác sĩ' : 'Không có bác sĩ chuyên khoa này'}
          </Text>
          {searchQuery && (
            <Text style={styles.emptySubtext}>
              Không tìm thấy bác sĩ với từ khóa "{searchQuery}"
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctorCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    lineHeight: 18,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00BCD4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  seedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
