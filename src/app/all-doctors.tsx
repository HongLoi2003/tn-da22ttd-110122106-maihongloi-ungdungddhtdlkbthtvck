import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

// Map specialty ID sang tên hiển thị chuẩn
const specialtyIdToName: any = {
  'tim_mach': 'Tim mạch',
  'da_lieu': 'Da liễu',
  'nhi_khoa': 'Nhi khoa',
  'san_phu_khoa': 'Sản phụ khoa',
  'than_kinh': 'Thần kinh',
  'ho_hap': 'Hô hấp',
  'tieu_hoa': 'Tiêu hóa',
  'co_xuong_khop': 'Cơ xương khớp',
  'tai_mui_hong': 'Tai mũi họng',
  'mat': 'Mắt',
  'rang_ham_mat': 'Răng hàm mặt',
  'noi_tiet': 'Nội tiết',
  'all': 'Đa khoa',
};

export default function AllDoctorsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const symptom = params.symptom as string;
  const specialtyParam = params.specialty as string;
  const searchParam = params.search as string;
  
  console.log('🔍 All params received:', params);
  console.log('🔍 Specialty param:', specialtyParam);
  console.log('🔍 Search param:', searchParam);
  
  // Map search text to specialty ID
  const mapSearchToSpecialty = (searchText: string): string | null => {
    const normalized = searchText.toLowerCase().trim();
    
    console.log('🔍 Mapping specialty:', searchText, '-> normalized:', normalized);
    
    // Map từ tên chuyên khoa AI trả về (ưu tiên cao nhất - exact match)
    if (normalized === 'thần kinh') return 'than_kinh';
    if (normalized === 'cơ xương khớp') return 'co_xuong_khop';
    if (normalized === 'tim mạch') return 'tim_mach';
    if (normalized === 'tiêu hóa' || normalized === 'tiêu hoá') return 'tieu_hoa';
    if (normalized === 'hô hấp') return 'ho_hap';
    if (normalized === 'da liễu') return 'da_lieu';
    if (normalized === 'tai mũi họng') return 'tai_mui_hong';
    if (normalized === 'mắt') return 'mat';
    if (normalized === 'răng hàm mặt') return 'rang_ham_mat';
    if (normalized === 'nội tiết') return 'noi_tiet';
    if (normalized === 'nhi khoa') return 'nhi_khoa';
    if (normalized === 'sản phụ khoa') return 'san_phu_khoa';
    if (normalized === 'nội tổng quát' || normalized === 'đa khoa') return 'all';
    
    // Map từ search text thông thường (chứa từ khóa)
    if (normalized.includes('thần') || normalized.includes('than') || normalized.includes('kinh')) return 'than_kinh';
    if (normalized.includes('xương') || normalized.includes('xuong') || normalized.includes('khớp') || normalized.includes('khop') || normalized.includes('cơ')) return 'co_xuong_khop';
    if (normalized.includes('tim') || normalized.includes('mạch') || normalized.includes('mach')) return 'tim_mach';
    if (normalized.includes('tiêu') || normalized.includes('tieu') || normalized.includes('hóa') || normalized.includes('hoa')) return 'tieu_hoa';
    if (normalized.includes('hô') || normalized.includes('ho') || normalized.includes('hấp') || normalized.includes('hap')) return 'ho_hap';
    if (normalized.includes('da') || normalized.includes('liễu') || normalized.includes('lieu')) return 'da_lieu';
    if (normalized.includes('tai') || normalized.includes('mũi') || normalized.includes('mui') || normalized.includes('họng') || normalized.includes('hong')) return 'tai_mui_hong';
    if (normalized.includes('mắt') || normalized.includes('mat') || normalized.includes('nhãn') || normalized.includes('nhan')) return 'mat';
    if (normalized.includes('răng') || normalized.includes('rang') || normalized.includes('hàm') || normalized.includes('ham') || normalized.includes('nha')) return 'rang_ham_mat';
    if (normalized.includes('nội tiết') || normalized.includes('noi tiet') || normalized.includes('tiết') || normalized.includes('tiet') || normalized.includes('đái tháo đường') || normalized.includes('tiểu đường')) return 'noi_tiet';
    if (normalized.includes('nhi') || normalized.includes('trẻ em') || normalized.includes('tre em') || normalized.includes('bé') || normalized.includes('be')) return 'nhi_khoa';
    if (normalized.includes('sản') || normalized.includes('san') || normalized.includes('phụ') || normalized.includes('phu') || normalized.includes('thai') || normalized.includes('mang thai')) return 'san_phu_khoa';
    
    return null;
  };
  
  // Determine initial specialty from params
  let initialSpecialty = 'all';
  
  // Ưu tiên specialty param từ AI chat
  if (specialtyParam) {
    const mappedSpecialty = mapSearchToSpecialty(specialtyParam);
    if (mappedSpecialty) {
      initialSpecialty = mappedSpecialty;
      console.log(`✅ Specialty param "${specialtyParam}" mapped to: ${initialSpecialty}`);
    } else {
      console.log(`⚠️ Could not map specialty param: ${specialtyParam}`);
    }
  }
  
  // Fallback to search param
  if (initialSpecialty === 'all' && searchParam) {
    const mappedSpecialty = mapSearchToSpecialty(searchParam);
    if (mappedSpecialty) {
      initialSpecialty = mappedSpecialty;
      console.log(`✅ Search param "${searchParam}" mapped to: ${initialSpecialty}`);
    }
  }
  
  const [searchText, setSearchText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const specialtyListRef = React.useRef<FlatList>(null);

  // Ensure page renders when returning from doctor-detail
  useFocusEffect(
    React.useCallback(() => {
      console.log('✅ AllDoctorsScreen focused');
      return () => {
        console.log('❌ AllDoctorsScreen unfocused');
      };
    }, [])
  );

  // Lấy dữ liệu bác sĩ từ Firebase
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Bắt đầu lấy dữ liệu bác sĩ từ Firebase...');
        const doctors = await getAllDocuments('doctors');
        console.log('Dữ liệu bác sĩ từ Firebase:', doctors);
        
        if (!doctors || doctors.length === 0) {
          console.warn('Không có dữ liệu bác sĩ từ Firebase');
          setLoading(false);
          return;
        }
        
        // Loại bỏ duplicate dựa trên id
        const uniqueDoctors = Array.from(
          new Map(doctors.map((doc: any) => [doc.id, doc])).values()
        );
        
        console.log('📊 Tổng số bác sĩ từ Firebase:', doctors.length);
        console.log('📊 Sau khi loại bỏ duplicate:', uniqueDoctors.length);
        
        // Kiểm tra xem có duplicate ID không
        const ids = doctors.map((d: any) => d.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
          console.warn('⚠️ Phát hiện duplicate IDs trong Firebase:', [...new Set(duplicateIds)]);
        }
        
        const mappedDoctors = uniqueDoctors.map((doc: any) => {
          const chuyenKhoa = doc.chuyen_khoa || doc.chuyenKhoa || 'Đa khoa';
          let specialtyId = '';
          
          // Map chuyên khoa sang ID chuẩn - xử lý cả có dấu và không dấu
          const normalized = chuyenKhoa.toLowerCase().trim();
          
          if (normalized.includes('tim') || normalized.includes('mạch')) specialtyId = 'tim_mach';
          else if (normalized.includes('da') || normalized.includes('liễu')) specialtyId = 'da_lieu';
          else if (normalized.includes('nhi')) specialtyId = 'nhi_khoa';
          else if (normalized.includes('sản') || normalized.includes('phụ') || normalized.includes('phu')) specialtyId = 'san_phu_khoa';
          else if (normalized.includes('thần') || normalized.includes('than') || normalized.includes('kinh')) specialtyId = 'than_kinh';
          else if (normalized.includes('hô') || normalized.includes('ho') || normalized.includes('hấp') || normalized.includes('hap')) specialtyId = 'ho_hap';
          else if (normalized.includes('tiêu') || normalized.includes('tieu') || normalized.includes('hóa') || normalized.includes('hoa')) specialtyId = 'tieu_hoa';
          else if (normalized.includes('cơ') || normalized.includes('co') || normalized.includes('xương') || normalized.includes('xuong') || normalized.includes('khớp') || normalized.includes('khop')) specialtyId = 'co_xuong_khop';
          else if (normalized.includes('tai') || normalized.includes('mũi') || normalized.includes('mui') || normalized.includes('họng') || normalized.includes('hong')) specialtyId = 'tai_mui_hong';
          else if (normalized.includes('mắt') || normalized.includes('mat') || normalized.includes('nhãn') || normalized.includes('nhan')) specialtyId = 'mat';
          else if (normalized.includes('răng') || normalized.includes('rang') || normalized.includes('hàm') || normalized.includes('ham') || normalized.includes('nha')) specialtyId = 'rang_ham_mat';
          else if (normalized.includes('nội tiết') || normalized.includes('noi tiet') || normalized.includes('tiết') || normalized.includes('tiet')) specialtyId = 'noi_tiet';
          else specialtyId = 'all';
          
          // Lấy tên hiển thị chuẩn từ specialtyId
          const displayName = specialtyIdToName[specialtyId] || chuyenKhoa;
          
          return {
            id: doc.id,
            name: doc.ten || doc.name || 'Bác sĩ',
            specialty: `Chuyên khoa ${displayName}`,
            specialtyId: specialtyId,
            chuyenKhoa: displayName,
            rating: doc.rating || 4.8,
            reviews: 100,
            experience: `${doc.kinh_nghiem || doc.experience || 5} năm`,
            hospital: 'Bệnh viện Trường Đại học Trà Vinh',
            image: doc.image || 'nguyenvanam.png',
            online: doc.trang_thai !== false,
            price: (doc.phi_kham || doc.gia_kham) ? `${(doc.phi_kham || doc.gia_kham).toLocaleString('vi-VN')}đ` : '200.000đ',
          };
        });
        console.log('Dữ liệu bác sĩ đã map:', mappedDoctors);
        console.log('🔍 Search param:', searchParam);
        console.log('🔍 Search text state:', searchText);
        setAllDoctors(mappedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Auto-select specialty khi có params từ AI chat hoặc symptom
  useEffect(() => {
    if ((symptom || specialtyParam) && allDoctors.length > 0) {
      // Ưu tiên dùng specialty từ params (đã được map ở initialSpecialty)
      if (specialtyParam) {
        // Đã được map ở initialSpecialty, chỉ cần scroll
        const index = specialties.findIndex(s => s.id === initialSpecialty);
        if (index > 0 && specialtyListRef.current) {
          setTimeout(() => {
            specialtyListRef.current?.scrollToIndex({ index, animated: true });
          }, 100);
        }
        return; // Không cần map lại
      }
      
      // Nếu chỉ có symptom (không có specialtyParam), thì map từ symptom
      if (symptom) {
        let recommendedSpecialty = symptomToSpecialty[symptom];
        
        if (recommendedSpecialty) {
          const normalized = recommendedSpecialty.toLowerCase().trim();
          let specialtyId = 'all';
          
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
          
          console.log('✅ Auto-filtering from symptom to specialty:', specialtyId);
          setSelectedSpecialty(specialtyId);
          
          // Scroll to specialty tab
          const index = specialties.findIndex(s => s.id === specialtyId);
          if (index > 0 && specialtyListRef.current) {
            setTimeout(() => {
              specialtyListRef.current?.scrollToIndex({ index, animated: true });
            }, 100);
          }
        }
      }
    }
  }, [allDoctors.length, symptom, specialtyParam, initialSpecialty]);

  React.useEffect(() => {
    if (params.specialty && params.specialty !== 'all') {
      const index = specialties.findIndex(s => s.id === params.specialty);
      if (index > 0 && specialtyListRef.current) {
        setTimeout(() => {
          specialtyListRef.current?.scrollToIndex({ index, animated: true });
        }, 100);
      }
    }
  }, [params.specialty]);

  // Scroll to selected specialty when it changes
  React.useEffect(() => {
    if (selectedSpecialty && selectedSpecialty !== 'all') {
      const index = specialties.findIndex(s => s.id === selectedSpecialty);
      if (index > 0 && specialtyListRef.current) {
        setTimeout(() => {
          specialtyListRef.current?.scrollToIndex({ index, animated: true });
        }, 100);
      }
    }
  }, [selectedSpecialty]);

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

  const filteredDoctors = allDoctors.filter((doctor) => {
    const searchLower = searchText.toLowerCase().trim();
    
    // Apply specialty filter
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialtyId === selectedSpecialty;
    
    // If search text exists, also search in name/hospital
    if (searchLower) {
      const nameLower = doctor.name.toLowerCase();
      const hospitalLower = doctor.hospital.toLowerCase();
      const matchesSearch = nameLower.includes(searchLower) || hospitalLower.includes(searchLower);
      return matchesSearch && matchesSpecialty;
    }
    
    return matchesSpecialty;
  });

  // Debug logs
  React.useEffect(() => {
    console.log('🔍 Search text:', `"${searchText}"`);
    console.log('📊 Selected specialty:', selectedSpecialty);
    console.log('📊 All doctors count:', allDoctors.length);
    console.log('📊 Filtered doctors count:', filteredDoctors.length);
  }, [searchText, allDoctors, filteredDoctors, selectedSpecialty]);

  const renderDoctorCard = ({ item }: any) => {
    let isPressingChat = false;
    
    return (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => {
        if (!isPressingChat) {
          router.push({
            pathname: '/doctor-detail',
            params: {
              id: item.id,
            }
          });
        }
      }}
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
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
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
                style={styles.chatBtn}
                activeOpacity={0.7}
                onPress={() => {
                  isPressingChat = true;
                  router.push({
                    pathname: '/doctor-chat',
                    params: {
                      doctorName: item.name,
                      doctorSpecialty: item.specialty,
                      doctorImage: item.image || 'logo.png',
                      doctorId: item.id,
                    }
                  });
                }}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                <Text style={styles.chatBtnText}>Nhắn tin</Text>
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
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/chat');
            }
          }} 
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bác sĩ gợi ý</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bác sĩ, chuyên khoa..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterSection}>
        <FlatList
          ref={specialtyListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={specialties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          onScrollToIndexFailed={() => {}}
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

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          Tìm thấy {filteredDoctors.length} bác sĩ
        </Text>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortText}>Sắp xếp</Text>
          <Ionicons name="swap-vertical" size={16} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không tìm thấy bác sĩ phù hợp</Text>
            <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
  },
  filterBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#00BCD4',
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
  doctorSpecialty: {
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
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
