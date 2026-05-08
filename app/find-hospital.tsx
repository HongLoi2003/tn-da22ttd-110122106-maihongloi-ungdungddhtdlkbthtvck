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

const hospitalImages = {
  'benhvien.png': require('@/assets/images/benhvien.png'),
  'benhvienbachmai.png': require('@/assets/images/benhvienbachmai.png'),
  'benviennhitrunguong.png': require('@/assets/images/benviennhitrunguong.png'),
  'benhvienphusanhonoi.png': require('@/assets/images/benhvienphusanhonoi.png'),
  'benhviendalieutrunguong.png': require('@/assets/images/benhviendalieutrunguong.png'),
  'benhvienquany103.png': require('@/assets/images/benhvienquany103.png'),
};

export default function FindHospitalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const searchParam = params.search as string;
  
  console.log('🔍 Hospital search param:', searchParam);
  
  // Find hospital by name from search param
  const findHospitalByName = (searchText: string, hospitalsList: any[]): any | null => {
    if (!searchText || !hospitalsList.length) return null;
    
    const searchLower = searchText.toLowerCase().trim();
    return hospitalsList.find(hospital => 
      hospital.name.toLowerCase().includes(searchLower)
    );
  };
  
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    // If search param exists and hospitals are loaded, find and navigate to that hospital
    if (searchParam && hospitals.length > 0) {
      const foundHospital = findHospitalByName(searchParam, hospitals);
      if (foundHospital) {
        console.log('✅ Found hospital:', foundHospital.name);
        // Navigate directly to hospital detail
        router.push({
          pathname: '/hospital-detail',
          params: { 
            name: foundHospital.name,
            id: foundHospital.id 
          }
        });
      } else {
        console.log('❌ Hospital not found, showing search results');
        setSearchText(searchParam);
      }
    }
  }, [searchParam, hospitals]);

  useEffect(() => {
    filterAndSearchHospitals();
  }, [searchText, selectedFilter, hospitals]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await getAllDocuments('hospitals');
      setHospitals(data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchHospitals = () => {
    let filtered = hospitals;

    // Tìm kiếm theo tên, địa chỉ, chuyên khoa
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(hospital => 
        hospital.name.toLowerCase().includes(searchLower) ||
        hospital.address.toLowerCase().includes(searchLower) ||
        (hospital.specialties && hospital.specialties.some((s: string) => s.toLowerCase().includes(searchLower)))
      );
    }

    // Lọc theo loại bệnh viện
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'pediatric') {
        filtered = filtered.filter(hospital => 
          hospital.specialties && hospital.specialties.includes('Nhi khoa')
        );
      }
      // Có thể thêm các filter khác nếu cần
    }

    setFilteredHospitals(filtered);
  };

  const getHospitalImage = (hospitalId: string) => {
    const imageMap: { [key: string]: string } = {
      'hosp001': 'benviennhitrunguong.png',
      'hosp002': 'benhvienbachmai.png',
      'hosp003': 'benviennhitrunguong.png',
      'hosp004': 'benhvienphusanhonoi.png',
      'hosp005': 'benhviendalieutrunguong.png',
      'hosp006': 'benhvienquany103.png',
    };
    
    const imageName = imageMap[hospitalId] || 'benhvien.png';
    return hospitalImages[imageName as keyof typeof hospitalImages] || hospitalImages['benhvien.png'];
  };

  const filters = [
    { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
    { id: 'public', name: 'Công lập', icon: 'business-outline' },
    { id: 'private', name: 'Tư nhân', icon: 'shield-checkmark-outline' },
    { id: 'international', name: 'Quốc tế', icon: 'globe-outline' },
    { id: 'pediatric', name: 'Nhi khoa', icon: 'happy-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm bệnh viện</Text>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => router.push('/hospital-map')}
        >
          <Ionicons name="map-outline" size={20} color="#00BCD4" />
          <Text style={styles.mapButtonText}>Bản đồ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bệnh viện, chuyên khoa, dịch vụ..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color="#00BCD4" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={18} 
                color={selectedFilter === filter.id ? '#fff' : '#00BCD4'} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>Kết quả tìm kiếm ({filteredHospitals.length})</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Sắp xếp: Gần nhất</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : filteredHospitals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không tìm thấy bệnh viện nào</Text>
          </View>
        ) : (
          <>
            {/* Hospital List */}
            <View style={styles.hospitalList}>
              {filteredHospitals.map((hospital, index) => (
                <TouchableOpacity 
                  key={`${hospital.id}-${index}`} 
                  style={styles.hospitalCard}
                  onPress={() => router.push({
                    pathname: '/hospital-detail',
                    params: { 
                      name: hospital.name,
                      id: hospital.id 
                    }
                  })}
                >
                  <Image 
                    source={getHospitalImage(hospital.id)}
                    style={styles.hospitalImage} 
                  />
                  <View style={[styles.badge, { backgroundColor: '#00BCD4' }]}>
                    <Text style={styles.badgeText}>Công lập</Text>
                  </View>
                  
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    
                    <View style={styles.distanceRow}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.distanceText}>{hospital.address}</Text>
                    </View>
                    
                    <View style={styles.tagsContainer}>
                      {hospital.specialties && hospital.specialties.slice(0, 2).map((specialty: string, index: number) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{specialty}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={16} color="#FFB800" />
                      <Text style={styles.ratingText}>
                        {hospital.rating} ({hospital.reviewCount} đánh giá)
                      </Text>
                    </View>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Not Found Section */}
        <View style={styles.notFoundCard}>
          <View style={styles.notFoundIcon}>
            <Ionicons name="business-outline" size={40} color="#00BCD4" />
          </View>
          <Text style={styles.notFoundTitle}>Không tìm thấy bệnh viện bạn cần?</Text>
          <Text style={styles.notFoundText}>
            Gửi yêu cầu để chúng tôi hỗ trợ tìm kiếm bệnh viện phù hợp nhất cho bạn
          </Text>
          <TouchableOpacity 
            style={styles.requestButton}
            onPress={() => setShowRequestModal(true)}
          >
            <Text style={styles.requestButtonText}>Gửi yêu cầu</Text>
            <Ionicons name="arrow-forward" size={18} color="#00BCD4" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Request Modal */}
      {showRequestModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi yêu cầu tìm bệnh viện</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.requestForm}>
              <Text style={styles.requestLabel}>Mô tả yêu cầu của bạn</Text>
              <TextInput
                style={styles.requestInput}
                placeholder="Ví dụ: Tôi cần tìm bệnh viện chuyên khoa tim mạch gần khu vực Quận 1..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={requestText}
                onChangeText={setRequestText}
                textAlignVertical="top"
              />
              <Text style={styles.requestHint}>
                Chúng tôi sẽ liên hệ với bạn trong vòng 24h để hỗ trợ tìm kiếm bệnh viện phù hợp
              </Text>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => {
                  if (requestText.trim()) {
                    alert('Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
                    setRequestText('');
                    setShowRequestModal(false);
                  } else {
                    alert('Vui lòng nhập mô tả yêu cầu');
                  }
                }}
              >
                <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
              </TouchableOpacity>
            </View>
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
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
  filterContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#00BCD4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    color: '#666',
  },
  hospitalList: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 16,
  },
  hospitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  hospitalImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  hospitalInfo: {
    padding: 16,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  hospitalAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  notFoundCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#00BCD4',
    borderRadius: 24,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
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
    maxHeight: '70%',
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
  requestForm: {
    padding: 16,
  },
  requestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requestInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#000',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  requestHint: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
