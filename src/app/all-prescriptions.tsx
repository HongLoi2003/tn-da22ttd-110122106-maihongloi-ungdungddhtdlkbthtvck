import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View , ActivityIndicator} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function AllPrescriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [allPrescriptions, setAllPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadPrescriptions();
    }, [user])
  );

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      if (!user) {
        setAllPrescriptions([]);
        return;
      }
      
      const data = await getDocumentsWithQuery('prescriptions', [
        where('userId', '==', user.uid)
      ]);
      const sortedData = data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setAllPrescriptions(sortedData);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setAllPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const prescriptions = selectedFilter === 'Tất cả' 
    ? allPrescriptions 
    : selectedFilter === 'Đang dùng'
    ? allPrescriptions.filter(p => p.status === 'active')
    : allPrescriptions.filter(p => p.status === 'completed');

  const handlePrescriptionPress = (prescription: any) => {
    Alert.alert(
      'Chi tiết đơn thuốc',
      `Thuốc: ${prescription.medicine}\nSố lượng: ${prescription.quantity}\nBác sĩ kê đơn: ${prescription.doctor}\nNgày kê đơn: ${prescription.date}\n\nCách dùng:\n${prescription.usage}\n\nLưu ý: Uống đủ liệu trình theo chỉ định của bác sĩ.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn thuốc</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : prescriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có đơn thuốc</Text>
          </View>
        ) : (
          <>
        <View style={styles.filterChips}>
          <TouchableOpacity 
            style={[styles.chip, selectedFilter === 'Tất cả' && styles.chipActive]}
            onPress={() => setSelectedFilter('Tất cả')}
          >
            <Text style={[styles.chipText, selectedFilter === 'Tất cả' && styles.chipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedFilter === 'Đang dùng' && styles.chipActive]}
            onPress={() => setSelectedFilter('Đang dùng')}
          >
            <Text style={[styles.chipText, selectedFilter === 'Đang dùng' && styles.chipTextActive]}>
              Đang dùng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedFilter === 'Đã hoàn thành' && styles.chipActive]}
            onPress={() => setSelectedFilter('Đã hoàn thành')}
          >
            <Text style={[styles.chipText, selectedFilter === 'Đã hoàn thành' && styles.chipTextActive]}>
              Đã hoàn thành
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {prescriptions.map((prescription) => (
            <TouchableOpacity 
              key={prescription.id} 
              style={styles.prescriptionCard}
              onPress={() => handlePrescriptionPress(prescription)}
            >
              <View style={styles.prescriptionIcon}>
                <Ionicons name="medical" size={24} color="#FFB800" />
              </View>
              <View style={styles.prescriptionInfo}>
                <View style={styles.prescriptionHeader}>
                  <Text style={styles.prescriptionName}>{prescription.medicine}</Text>
                  {prescription.status === 'active' && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>Đang dùng</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.prescriptionQuantity}>Số lượng: {prescription.quantity}</Text>
                <Text style={styles.prescriptionDoctor}>{prescription.doctor}</Text>
                <Text style={styles.prescriptionDate}>{prescription.date}</Text>
                <Text style={styles.prescriptionUsage}>{prescription.usage}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
          </>
        )}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
  },
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prescriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  prescriptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  activeBadge: {
    backgroundColor: '#06D6A0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  prescriptionQuantity: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  prescriptionDoctor: {
    fontSize: 12,
    color: '#00BCD4',
    marginBottom: 2,
  },
  prescriptionDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  prescriptionUsage: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
  },
});
