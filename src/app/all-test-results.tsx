import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View , ActivityIndicator} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function AllTestResultsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [allTestResults, setAllTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTestResults();
    }, [user])
  );

  const loadTestResults = async () => {
    try {
      setLoading(true);
      if (!user) {
        setAllTestResults([]);
        return;
      }
      
      const data = await getDocumentsWithQuery('testResults', [
        where('userId', '==', user.uid)
      ]);
      const sortedData = data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setAllTestResults(sortedData);
    } catch (error) {
      console.error('Error loading test results:', error);
      setAllTestResults([]);
    } finally {
      setLoading(false);
    }
  };

  const testResults = selectedFilter === 'Tất cả' 
    ? allTestResults 
    : allTestResults.filter(test => test.type === selectedFilter);

  const handleTestPress = (test: any) => {
    Alert.alert(
      'Kết quả xét nghiệm',
      `${test.name}\nLoại: ${test.type}\nNgày xét nghiệm: ${test.date}\nBệnh viện: ${test.hospital}\n\nKết quả:\n- Hồng cầu: 4.5 triệu/mm³\n- Bạch cầu: 7.000/mm³\n- Tiểu cầu: 250.000/mm³\n\nKết luận: Các chỉ số trong giới hạn bình thường.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả xét nghiệm</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : testResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flask-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có kết quả xét nghiệm</Text>
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
            style={[styles.chip, selectedFilter === 'Huyết học' && styles.chipActive]}
            onPress={() => setSelectedFilter('Huyết học')}
          >
            <Text style={[styles.chipText, selectedFilter === 'Huyết học' && styles.chipTextActive]}>
              Huyết học
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedFilter === 'Hình ảnh' && styles.chipActive]}
            onPress={() => setSelectedFilter('Hình ảnh')}
          >
            <Text style={[styles.chipText, selectedFilter === 'Hình ảnh' && styles.chipTextActive]}>
              Hình ảnh
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chip, selectedFilter === 'Sinh hóa' && styles.chipActive]}
            onPress={() => setSelectedFilter('Sinh hóa')}
          >
            <Text style={[styles.chipText, selectedFilter === 'Sinh hóa' && styles.chipTextActive]}>
              Sinh hóa
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {testResults.map((test) => (
            <TouchableOpacity 
              key={test.id} 
              style={styles.testCard}
              onPress={() => handleTestPress(test)}
            >
              <View style={styles.testIcon}>
                <Ionicons name="flask" size={24} color="#06D6A0" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={styles.testType}>{test.type}</Text>
                <Text style={styles.testDate}>{test.date}</Text>
                <Text style={styles.testHospital}>{test.hospital}</Text>
              </View>
              <View style={styles.testActions}>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>Có sẵn</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={{ marginTop: 8 }} />
              </View>
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
  testCard: {
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
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  testType: {
    fontSize: 12,
    color: '#06D6A0',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  testHospital: {
    fontSize: 11,
    color: '#94a3b8',
  },
  testActions: {
    alignItems: 'flex-end',
  },
  availableBadge: {
    backgroundColor: '#06D6A0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
