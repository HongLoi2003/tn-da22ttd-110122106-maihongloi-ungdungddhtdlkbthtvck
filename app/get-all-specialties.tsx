import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAllDocuments } from './services/firebaseService';

interface Specialty {
  id: string;
  name: string;
  description?: string;
  image?: string;
  doctors?: number;
}

export default function GetAllSpecialties() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Đang tải dữ liệu từ Firebase...');

      // Lấy tất cả dữ liệu
      const [specialtiesData, doctorsData, popularData] = await Promise.all([
        getAllDocuments('specialties'),
        getAllDocuments('doctors'),
        getAllDocuments('popular-specialties'),
      ]);

      console.log('📊 Số lượng specialties:', specialtiesData.length);
      console.log('📊 Số lượng popular-specialties:', popularData.length);
      console.log('📊 Số lượng doctors:', doctorsData.length);

      // Đếm số bác sĩ theo chuyên khoa
      const doctorCountBySpecialty: Record<string, number> = {};
      doctorsData.forEach((doctor: any) => {
        const specialty = doctor.chuyen_khoa || doctor.chuyenKhoa;
        if (specialty) {
          doctorCountBySpecialty[specialty] = (doctorCountBySpecialty[specialty] || 0) + 1;
        }
      });

      // Gộp dữ liệu từ cả 2 collection
      const allSpecialtiesMap = new Map<string, Specialty>();

      // Thêm từ specialties
      specialtiesData.forEach((spec: any) => {
        allSpecialtiesMap.set(spec.name, {
          id: spec.id,
          name: spec.name,
          description: spec.description,
          image: spec.image,
          doctors: doctorCountBySpecialty[spec.name] || 0,
        });
      });

      // Thêm từ popular-specialties
      popularData.forEach((spec: any) => {
        if (!allSpecialtiesMap.has(spec.name)) {
          allSpecialtiesMap.set(spec.name, {
            id: spec.id,
            name: spec.name,
            description: spec.description,
            image: spec.image,
            doctors: doctorCountBySpecialty[spec.name] || 0,
          });
        }
      });

      // Thêm các chuyên khoa từ bác sĩ (nếu chưa có)
      Object.keys(doctorCountBySpecialty).forEach((specialtyName) => {
        if (!allSpecialtiesMap.has(specialtyName)) {
          allSpecialtiesMap.set(specialtyName, {
            id: `auto-${specialtyName.toLowerCase().replace(/\s+/g, '-')}`,
            name: specialtyName,
            doctors: doctorCountBySpecialty[specialtyName],
          });
        }
      });

      const allSpecialties = Array.from(allSpecialtiesMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name, 'vi')
      );

      setSpecialties(allSpecialties);
      setDoctors(doctorsData);

      console.log('✅ Tổng số chuyên khoa:', allSpecialties.length);
      console.log('📋 Danh sách:', allSpecialties.map(s => s.name));

    } catch (err: any) {
      console.error('❌ Lỗi:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const exportToConsole = () => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DANH SÁCH ĐẦY ĐỦ CÁC CHUYÊN KHOA');
    console.log('='.repeat(60));
    console.log(`\nTổng số: ${specialties.length} chuyên khoa\n`);
    
    specialties.forEach((spec, index) => {
      console.log(`${index + 1}. ${spec.name}`);
      console.log(`   - ID: ${spec.id}`);
      console.log(`   - Số bác sĩ: ${spec.doctors}`);
      if (spec.image) console.log(`   - Hình ảnh: ${spec.image}`);
      if (spec.description) console.log(`   - Mô tả: ${spec.description}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('📊 THỐNG KÊ THEO SỐ BÁC SĨ');
    console.log('='.repeat(60));
    
    const sorted = [...specialties].sort((a, b) => (b.doctors || 0) - (a.doctors || 0));
    sorted.forEach((spec, index) => {
      if (spec.doctors && spec.doctors > 0) {
        console.log(`${index + 1}. ${spec.name}: ${spec.doctors} bác sĩ`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ ĐÃ XUẤT DỮ LIỆU RA CONSOLE');
    console.log('='.repeat(60) + '\n');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tất cả chuyên khoa</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tất cả chuyên khoa</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAllData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả chuyên khoa</Text>
        <TouchableOpacity onPress={exportToConsole}>
          <Ionicons name="download-outline" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{specialties.length}</Text>
              <Text style={styles.summaryLabel}>Chuyên khoa</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{doctors.length}</Text>
              <Text style={styles.summaryLabel}>Bác sĩ</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {specialties.filter(s => s.doctors && s.doctors > 0).length}
              </Text>
              <Text style={styles.summaryLabel}>Có bác sĩ</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 Danh sách {specialties.length} chuyên khoa
          </Text>
          
          {specialties.map((specialty, index) => (
            <View key={specialty.id} style={styles.specialtyCard}>
              <View style={styles.specialtyHeader}>
                <View style={styles.specialtyNumber}>
                  <Text style={styles.specialtyNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.specialtyInfo}>
                  <Text style={styles.specialtyName}>{specialty.name}</Text>
                  {specialty.description && (
                    <Text style={styles.specialtyDescription} numberOfLines={2}>
                      {specialty.description}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.specialtyMeta}>
                {specialty.image && (
                  <View style={styles.metaItem}>
                    <Ionicons name="image-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{specialty.image}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color="#00BCD4" />
                  <Text style={[styles.metaText, styles.doctorCount]}>
                    {specialty.doctors || 0} bác sĩ
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📊 Thống kê theo số bác sĩ
          </Text>
          
          {specialties
            .filter(s => s.doctors && s.doctors > 0)
            .sort((a, b) => (b.doctors || 0) - (a.doctors || 0))
            .map((specialty, index) => (
              <View key={specialty.id} style={styles.statCard}>
                <Text style={styles.statRank}>#{index + 1}</Text>
                <Text style={styles.statName}>{specialty.name}</Text>
                <View style={styles.statBadge}>
                  <Text style={styles.statCount}>{specialty.doctors}</Text>
                </View>
              </View>
            ))}
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={exportToConsole}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Xuất ra Console</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00BCD4',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  specialtyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  specialtyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  specialtyNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  specialtyNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BCD4',
  },
  specialtyInfo: {
    flex: 1,
  },
  specialtyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  specialtyDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  specialtyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
  },
  doctorCount: {
    color: '#00BCD4',
    fontWeight: '600',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  statRank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    width: 32,
  },
  statName: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  statBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00BCD4',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
