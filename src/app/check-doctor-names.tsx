import { Ionicons } from '@expo/vector-icons';
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
import { getAllDocuments } from './services/firebaseService';

export default function CheckDoctorNamesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const allDoctors = await getAllDocuments('doctors');
      
      // Sort by name
      const sorted = allDoctors.sort((a: any, b: any) => {
        const nameA = a.name || a.fullName || '';
        const nameB = b.name || b.fullName || '';
        return nameA.localeCompare(nameB);
      });
      
      setDoctors(sorted);
      console.log('📋 Doctors:', sorted);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyMapping = () => {
    const mapping = doctors.map((doctor: any) => {
      const name = doctor.name || doctor.fullName || 'Unknown';
      const image = doctor.image || 'logo.png';
      return `  '${name}': '${image}',`;
    }).join('\n');
    
    console.log('📋 Mapping:\n' + mapping);
    alert('Mapping đã được copy vào console log!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Doctor Names</Text>
        <TouchableOpacity onPress={loadDoctors}>
          <Ionicons name="refresh" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Mục đích</Text>
            <Text style={styles.infoText}>
              Xem tên chính xác của tất cả bác sĩ trong Firestore để cập nhật mapping đúng.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                📊 Tổng số bác sĩ: {doctors.length}
              </Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyMapping}>
                <Ionicons name="copy" size={16} color="#fff" />
                <Text style={styles.copyButtonText}>Copy Mapping</Text>
              </TouchableOpacity>
            </View>

            {doctors.map((doctor: any, index) => {
              const name = doctor.name || doctor.fullName || 'Unknown';
              const image = doctor.image || '❌ MISSING';
              const id = doctor.id;
              
              return (
                <View key={id || index} style={styles.doctorCard}>
                  <View style={styles.doctorHeader}>
                    <Text style={styles.doctorIndex}>#{index + 1}</Text>
                    <Text style={styles.doctorId}>{id}</Text>
                  </View>
                  
                  <View style={styles.doctorRow}>
                    <Text style={styles.label}>Tên:</Text>
                    <Text style={styles.value}>{name}</Text>
                  </View>
                  
                  <View style={styles.doctorRow}>
                    <Text style={styles.label}>Image:</Text>
                    <Text style={[
                      styles.value,
                      image === '❌ MISSING' && styles.errorValue
                    ]}>
                      {image}
                    </Text>
                  </View>
                  
                  {doctor.specialty && (
                    <View style={styles.doctorRow}>
                      <Text style={styles.label}>Chuyên khoa:</Text>
                      <Text style={styles.valueSmall}>{doctor.specialty}</Text>
                    </View>
                  )}
                  
                  <View style={styles.mappingBox}>
                    <Text style={styles.mappingText}>
                      '{name}': '{image}',
                    </Text>
                  </View>
                </View>
              );
            })}
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
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  doctorIndex: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  doctorId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  doctorRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 100,
  },
  value: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  valueSmall: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  errorValue: {
    color: '#ef4444',
    fontWeight: '700',
  },
  mappingBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  mappingText: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
  },
});
