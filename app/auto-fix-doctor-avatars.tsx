import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getAllDocuments, updateDocument } from './services/firebaseService';
import { getDoctorAvatarSmart } from './utils/doctorAvatars';

interface DoctorInfo {
  id: string;
  name: string;
  currentImage: string;
  suggestedImage: string;
  needsUpdate: boolean;
}

export default function AutoFixDoctorAvatarsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const allDoctors = await getAllDocuments('doctors');
      
      const doctorInfos: DoctorInfo[] = allDoctors.map((doc: any) => {
        const name = doc.name || doc.fullName || doc.ten || '';
        const currentImage = doc.image || doc.hinh_anh || 'logo.png';
        
        // Get suggested image from smart function
        const suggestedImageSource = getDoctorAvatarSmart(name, currentImage);
        
        // Extract filename from require() result
        let suggestedImage = 'logo.png';
        if (suggestedImageSource) {
          const sourceStr = String(suggestedImageSource);
          // Try to extract filename from the source
          if (sourceStr.includes('nguyenvanam')) suggestedImage = 'nguyenvanam.png';
          else if (sourceStr.includes('tranthilan')) suggestedImage = 'tranthilan.png';
          else if (sourceStr.includes('tranthimai')) suggestedImage = 'tranthimai.png';
          else if (sourceStr.includes('leminhtam')) suggestedImage = 'leminhtam.png';
          else if (sourceStr.includes('hoangvanduc')) suggestedImage = 'hoangvanduc.png';
          else if (sourceStr.includes('vuthilan')) suggestedImage = 'vuthilan.png';
          else if (sourceStr.includes('dominhtuan')) suggestedImage = 'dominhtuan.png';
          else if (sourceStr.includes('ngothihuong')) suggestedImage = 'ngothihuong.png';
          else if (sourceStr.includes('nguyenvanhai')) suggestedImage = 'nguyenvanhai.png';
          else if (sourceStr.includes('nguyenthihoa')) suggestedImage = 'nguyenthihoa.png';
          else if (sourceStr.includes('tranvankhoa')) suggestedImage = 'tranvankhoa.png';
          else if (sourceStr.includes('phamminhquan')) suggestedImage = 'phamminhquan.png';
          else if (sourceStr.includes('lethihang')) suggestedImage = 'lethihang.png';
          else if (sourceStr.includes('dangthithao')) suggestedImage = 'dangthithao.jpg';
        }
        
        const needsUpdate = currentImage !== suggestedImage && suggestedImage !== 'logo.png';
        
        return {
          id: doc.id,
          name,
          currentImage,
          suggestedImage,
          needsUpdate,
        };
      });
      
      setDoctors(doctorInfos);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixAllAvatars = async () => {
    setFixing(true);
    setResults([]);
    const logs: string[] = [];

    try {
      const doctorsToFix = doctors.filter(d => d.needsUpdate);
      logs.push(`🔄 Cần cập nhật ${doctorsToFix.length} bác sĩ`);
      logs.push('');
      setResults([...logs]);

      for (const doctor of doctorsToFix) {
        try {
          await updateDocument('doctors', doctor.id, {
            image: doctor.suggestedImage,
          });
          logs.push(`✅ ${doctor.name}`);
          logs.push(`   ${doctor.currentImage} → ${doctor.suggestedImage}`);
        } catch (error) {
          logs.push(`❌ ${doctor.name}: Lỗi cập nhật`);
        }
        setResults([...logs]);
      }

      logs.push('');
      logs.push('✅ Hoàn tất! Reload lại trang để xem kết quả.');
      setResults(logs);
      
      // Reload doctors after 2 seconds
      setTimeout(() => {
        loadDoctors();
      }, 2000);
    } catch (error) {
      logs.push(`❌ Lỗi: ${error}`);
      setResults(logs);
    } finally {
      setFixing(false);
    }
  };

  const needsUpdateCount = doctors.filter(d => d.needsUpdate).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auto Fix Avatar</Text>
        <TouchableOpacity onPress={loadDoctors}>
          <Ionicons name="refresh" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsBox}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{doctors.length}</Text>
                <Text style={styles.statLabel}>Tổng bác sĩ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
                  {needsUpdateCount}
                </Text>
                <Text style={styles.statLabel}>Cần fix</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#10b981' }]}>
                  {doctors.length - needsUpdateCount}
                </Text>
                <Text style={styles.statLabel}>Đã đúng</Text>
              </View>
            </View>

            {needsUpdateCount > 0 && (
              <TouchableOpacity
                style={[styles.fixButton, fixing && styles.fixButtonDisabled]}
                onPress={fixAllAvatars}
                disabled={fixing}
              >
                {fixing ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.fixButtonText}>Đang fix...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="hammer" size={20} color="#fff" />
                    <Text style={styles.fixButtonText}>
                      Fix {needsUpdateCount} Bác Sĩ
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {results.length > 0 && (
              <View style={styles.resultsBox}>
                <Text style={styles.resultsTitle}>📊 Kết quả:</Text>
                {results.map((result, index) => (
                  <Text key={index} style={styles.resultText}>
                    {result}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                👨‍⚕️ Danh sách bác sĩ ({doctors.length})
              </Text>
              
              {doctors.map((doctor) => (
                <View
                  key={doctor.id}
                  style={[
                    styles.doctorCard,
                    doctor.needsUpdate && styles.doctorCardNeedsUpdate,
                  ]}
                >
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorImages}>
                      <View style={styles.imageContainer}>
                        <Image
                          source={getDoctorAvatarSmart(doctor.name, doctor.currentImage)}
                          style={styles.doctorAvatar}
                          contentFit="cover"
                        />
                        <Text style={styles.imageLabel}>Hiện tại</Text>
                      </View>
                      
                      {doctor.needsUpdate && (
                        <>
                          <Ionicons name="arrow-forward" size={20} color="#00BCD4" />
                          <View style={styles.imageContainer}>
                            <Image
                              source={getDoctorAvatarSmart(doctor.name, doctor.suggestedImage)}
                              style={styles.doctorAvatar}
                              contentFit="cover"
                            />
                            <Text style={styles.imageLabel}>Đề xuất</Text>
                          </View>
                        </>
                      )}
                    </View>
                    
                    {doctor.needsUpdate ? (
                      <View style={styles.statusBadgeWarning}>
                        <Ionicons name="warning" size={14} color="#f59e0b" />
                        <Text style={styles.statusTextWarning}>Cần fix</Text>
                      </View>
                    ) : (
                      <View style={styles.statusBadgeSuccess}>
                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                        <Text style={styles.statusTextSuccess}>OK</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorId}>ID: {doctor.id}</Text>
                  
                  <View style={styles.imageInfo}>
                    <Text style={styles.imageInfoLabel}>Hiện tại:</Text>
                    <Text style={styles.imageInfoValue}>{doctor.currentImage}</Text>
                  </View>
                  
                  {doctor.needsUpdate && (
                    <View style={styles.imageInfo}>
                      <Text style={styles.imageInfoLabel}>Đề xuất:</Text>
                      <Text style={[styles.imageInfoValue, { color: '#00BCD4' }]}>
                        {doctor.suggestedImage}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00BCD4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 12,
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  fixButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  fixButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  doctorCardNeedsUpdate: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorImages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageContainer: {
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  imageLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  statusBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusTextWarning: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusTextSuccess: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  doctorId: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  imageInfo: {
    flexDirection: 'row',
    marginTop: 4,
  },
  imageInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    minWidth: 80,
  },
  imageInfoValue: {
    fontSize: 12,
    color: '#0f172a',
    fontFamily: 'monospace',
    flex: 1,
  },
});
