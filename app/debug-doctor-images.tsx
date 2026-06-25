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

export default function DebugDoctorImagesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [fixing, setFixing] = useState(false);

  // Mapping chính xác
  const nameToImage: { [key: string]: string } = {
    'Trần Thị Mai': 'tranthimai.png',
    'Hoàng Văn Đức': 'hoangvanduc.png',
    'Nguyễn Thị Hoa': 'nguyenthihoa.png',
    'Nguyễn Văn An': 'nguyenvanam.png',
    'Trần Thị Lan': 'tranthilan.png',
    'Lê Minh Tâm': 'leminhtam.png',
    'Vũ Thị Lan': 'vuthilan.png',
    'Đỗ Minh Tuấn': 'dominhtuan.png',
    'Ngô Thị Hương': 'ngothihuong.png',
    'Nguyễn Văn Hải': 'nguyenvanhai.png',
    'Trần Văn Khoa': 'tranvankhoa.png',
    'Phạm Minh Quân': 'phamminhquan.png',
    'Lê Thị Hằng': 'lethihang.png',
    'Đặng Thị Thảo': 'dangthithao.jpg',
  };

    const images: { [key: string]: any } = {
    'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
    'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
    'lehoangnam.png': { uri: 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg' },
    'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
    'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
    'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
    'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
    'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
    'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
    'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
    'phamthuha.png': { uri: 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg' },
    'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
    'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
    'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
    'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
    'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
    'logo.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const allDoctors = await getAllDocuments('doctors');
      
      const processed = allDoctors.map((doc: any) => {
        // Lấy tên từ nhiều field có thể có
        const rawName = doc.name || doc.fullName || doc.ten || '';
        // Loại bỏ "BS. " nếu có
        const cleanName = rawName.replace(/^BS\.\s*/i, '').trim();
        
        // Lấy image hiện tại
        const currentImage = doc.image || doc.hinh_anh || 'logo.png';
        
        // Tìm image đúng từ mapping
        const correctImage = nameToImage[cleanName] || 'logo.png';
        
        // Check xem có cần update không
        const needsUpdate = currentImage !== correctImage && correctImage !== 'logo.png';
        
        return {
          id: doc.id,
          rawName,
          cleanName,
          currentImage,
          correctImage,
          needsUpdate,
          hasMapping: !!nameToImage[cleanName],
        };
      });
      
      setDoctors(processed);
      console.log('📋 Doctors loaded:', processed);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixAll = async () => {
    setFixing(true);
    try {
      const toFix = doctors.filter(d => d.needsUpdate);
      console.log(`🔧 Fixing ${toFix.length} doctors...`);
      
      for (const doctor of toFix) {
        try {
          await updateDocument('doctors', doctor.id, {
            image: doctor.correctImage,
          });
          console.log(`✅ Fixed: ${doctor.cleanName} → ${doctor.correctImage}`);
        } catch (error) {
          console.error(`❌ Error fixing ${doctor.cleanName}:`, error);
        }
      }
      
      alert(`✅ Đã fix ${toFix.length} bác sĩ!\n\nReload lại trang để xem kết quả.`);
      
      // Reload after 1 second
      setTimeout(() => {
        loadDoctors();
      }, 1000);
    } catch (error) {
      console.error('Error fixing:', error);
      alert('❌ Có lỗi xảy ra!');
    } finally {
      setFixing(false);
    }
  };

  const needsUpdateCount = doctors.filter(d => d.needsUpdate).length;
  const noMappingCount = doctors.filter(d => !d.hasMapping).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Avatar</Text>
        <TouchableOpacity onPress={loadDoctors}>
          <Ionicons name="refresh" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.statsBox}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tổng bác sĩ:</Text>
              <Text style={styles.statValue}>{doctors.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cần fix:</Text>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                {needsUpdateCount}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Không có mapping:</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                {noMappingCount}
              </Text>
            </View>
          </View>

          {needsUpdateCount > 0 && (
            <TouchableOpacity
              style={[styles.fixButton, fixing && styles.fixButtonDisabled]}
              onPress={fixAll}
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
                    Fix {needsUpdateCount} Bác Sĩ Ngay
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {doctors.map((doctor) => (
            <View
              key={doctor.id}
              style={[
                styles.doctorCard,
                doctor.needsUpdate && styles.doctorCardWarning,
                !doctor.hasMapping && styles.doctorCardError,
              ]}
            >
              <View style={styles.doctorHeader}>
                <View style={styles.avatarRow}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={images[doctor.currentImage] || images['logo.png']}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                    <Text style={styles.avatarLabel}>Hiện tại</Text>
                  </View>
                  
                  {doctor.needsUpdate && (
                    <>
                      <Ionicons name="arrow-forward" size={20} color="#00BCD4" />
                      <View style={styles.avatarContainer}>
                        <Image
                          source={images[doctor.correctImage] || images['logo.png']}
                          style={styles.avatar}
                          contentFit="cover"
                        />
                        <Text style={styles.avatarLabel}>Đúng</Text>
                      </View>
                    </>
                  )}
                </View>
                
                {!doctor.hasMapping ? (
                  <View style={styles.badgeError}>
                    <Ionicons name="close-circle" size={14} color="#ef4444" />
                    <Text style={styles.badgeTextError}>No mapping</Text>
                  </View>
                ) : doctor.needsUpdate ? (
                  <View style={styles.badgeWarning}>
                    <Ionicons name="warning" size={14} color="#f59e0b" />
                    <Text style={styles.badgeTextWarning}>Cần fix</Text>
                  </View>
                ) : (
                  <View style={styles.badgeSuccess}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.badgeTextSuccess}>OK</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên gốc:</Text>
                <Text style={styles.infoValue}>{doctor.rawName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên clean:</Text>
                <Text style={styles.infoValue}>{doctor.cleanName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValueMono}>{doctor.id}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Image hiện tại:</Text>
                <Text style={styles.infoValueMono}>{doctor.currentImage}</Text>
              </View>
              
              {doctor.hasMapping && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Image đúng:</Text>
                  <Text style={[styles.infoValueMono, { color: '#00BCD4' }]}>
                    {doctor.correctImage}
                  </Text>
                </View>
              )}
              
              {!doctor.hasMapping && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={16} color="#ef4444" />
                  <Text style={styles.warningText}>
                    Không tìm thấy mapping cho tên "{doctor.cleanName}"
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
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
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  doctorCardWarning: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  doctorCardError: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  avatarLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeTextSuccess: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  badgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeTextWarning: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  badgeError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeTextError: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    minWidth: 110,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '500',
  },
  infoValueMono: {
    flex: 1,
    fontSize: 11,
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#ef4444',
    lineHeight: 16,
  },
});
