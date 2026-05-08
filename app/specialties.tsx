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

export default function SpecialtiesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [allSpecialties, setAllSpecialties] = useState<any[]>([]);
  const [popularSpecialties, setPopularSpecialties] = useState<any[]>([]);
  const [commonSymptoms, setCommonSymptoms] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSpecialtiesData();
    }, [])
  );

  const loadSpecialtiesData = async () => {
    try {
      setLoading(true);
      
      const [allSpecialtiesData, popularData, symptomsData, hospitalsData] = await Promise.all([
        getAllDocuments('specialties'),
        getAllDocuments('popular-specialties'),
        getAllDocuments('common-symptoms'),
        getAllDocuments('hospitals'),
      ]);

      setAllSpecialties(allSpecialtiesData);
      setPopularSpecialties(popularData);
      setCommonSymptoms(symptomsData);
      setHospitals(hospitalsData);
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
        <TouchableOpacity onPress={() => router.push('/symptom-checker')}>
          <Ionicons name="medical" size={24} color="#00BCD4" />
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
                <View style={styles.bannerIcon}>
                  <Ionicons name="medical" size={32} color="#00BCD4" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Không chắc nên khám khoa nào?</Text>
                  <Text style={styles.bannerSubtitle}>Kiểm tra triệu chứng để được tư vấn</Text>
                </View>
                <TouchableOpacity 
                  style={styles.bannerButton}
                  onPress={() => router.push('/symptom-checker')}
                >
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Common Symptoms */}
            {commonSymptoms.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Triệu chứng thường gặp</Text>
                    <Text style={styles.sectionSubtitle}>Chọn triệu chứng để được tư vấn chuyên khoa</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {commonSymptoms.map((symptom) => (
                    <TouchableOpacity
                      key={symptom.id}
                      style={styles.symptomCard}
                      onPress={() => router.push({
                        pathname: '/all-doctors',
                        params: { 
                          symptom: symptom.name,
                          specialty: symptom.specialty 
                        }
                      })}
                    >
                      <View style={[styles.symptomIconContainer, { backgroundColor: symptom.color + '15' }]}>
                        <Ionicons name={symptom.icon as any} size={28} color={symptom.color} />
                      </View>
                      <Text style={styles.symptomName}>{symptom.name}</Text>
                      <Text style={styles.symptomDescription} numberOfLines={2}>
                        {symptom.description}
                      </Text>
                      <View style={styles.symptomFooter}>
                        <View style={styles.symptomSpecialty}>
                          <Ionicons name="arrow-forward-circle" size={14} color="#00BCD4" />
                          <Text style={styles.symptomSpecialtyText}>{symptom.specialty}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Popular Specialties */}
            {popularSpecialties.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Chuyên khoa phổ biến</Text>
                  <TouchableOpacity onPress={() => setShowAllSpecialties(true)}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.specialtiesGrid}>
                  {popularSpecialties.map((specialty) => (
                    <TouchableOpacity
                      key={specialty.id}
                      style={styles.specialtyCardNew}
                      onPress={() => router.push('/specialty-detail')}
                    >
                      <Image source={require('@/assets/images/khoa.png')} style={styles.specialtyImageNew} />
                      <View style={styles.specialtyOverlay}>
                        <Text style={styles.specialtyNameNew}>{specialty.name}</Text>
                        <View style={styles.doctorCountNew}>
                          <Ionicons name="people" size={12} color="#fff" />
                          <Text style={styles.doctorCountTextNew}>{specialty.doctors} bác sĩ</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Hospitals with Specialties */}
            {hospitals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bệnh viện có chuyên khoa</Text>
                  <TouchableOpacity onPress={() => router.push('/find-hospital')}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
                {hospitals.map((hospital, index) => (
                  <TouchableOpacity
                    key={`${hospital.id}-${index}`}
                    style={styles.hospitalCard}
                    onPress={() => router.push({
                      pathname: '/hospital-detail',
                      params: { name: hospital.name, id: hospital.id }
                    })}
                  >
                    <Image source={require('@/assets/images/benhvien.png')} style={styles.hospitalImage} />
                    <View style={styles.hospitalInfo}>
                      <View style={styles.hospitalHeader}>
                        <Text style={styles.hospitalName} numberOfLines={1}>
                          {hospital.name}
                        </Text>
                        <View style={[styles.hospitalBadge, { backgroundColor: hospital.badgeColor }]}>
                          <Text style={styles.hospitalBadgeText}>{hospital.badge}</Text>
                        </View>
                      </View>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.ratingText}>
                          {hospital.rating} ({hospital.reviews} đánh giá)
                        </Text>
                      </View>
                      <Text style={styles.hospitalAddress} numberOfLines={1}>
                        {hospital.address}
                      </Text>
                      <View style={styles.specialtyTags}>
                        {hospital.specialties?.map((spec: string, index: number) => (
                          <View key={index} style={styles.specialtyTag}>
                            <Text style={styles.specialtyTagText}>{spec}</Text>
                          </View>
                        ))}
                        <Text style={styles.moreTag}>...</Text>
                      </View>
                    </View>
                    <View style={styles.distanceContainer}>
                      <Text style={styles.distanceText}>{hospital.distance}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                  </TouchableOpacity>
                ))}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
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
  horizontalScroll: {
    paddingRight: 16,
  },
  symptomCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  symptomIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
    textAlign: 'center',
  },
  symptomDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 14,
    minHeight: 28,
  },
  symptomFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  symptomSpecialty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  symptomSpecialtyText: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '600',
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specialtyCardNew: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  specialtyImageNew: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  specialtyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
  },
  specialtyNameNew: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  doctorCountNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorCountTextNew: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  hospitalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 12,
    gap: 12,
  },
  hospitalImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  hospitalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hospitalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  hospitalAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  specialtyTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialtyTagText: {
    fontSize: 10,
    color: '#666',
  },
  moreTag: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  distanceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
});
