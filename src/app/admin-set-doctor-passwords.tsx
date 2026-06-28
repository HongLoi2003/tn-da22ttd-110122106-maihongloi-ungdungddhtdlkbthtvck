import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from './config/firebase';

const DEFAULT_PASSWORD = '123456';

export default function AdminSetDoctorPasswordsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const setPasswordsForAllDoctors = async () => {
    Alert.alert(
      'Xác nhận',
      `Bạn muốn đặt password "${DEFAULT_PASSWORD}" cho TẤT CẢ bác sĩ?\n\nLưu ý: Password hiện tại sẽ bị ghi đè!`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: () => executeSetPasswords(),
        },
      ]
    );
  };

  const executeSetPasswords = async () => {
    setLoading(true);
    setResults(null);

    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      console.log('🚀 Setting passwords for all doctors...');

      // Lấy tất cả bác sĩ
      const doctorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'doctor')
      );
      const doctorsSnapshot = await getDocs(doctorsQuery);

      console.log(`📊 Found ${doctorsSnapshot.size} doctors`);

      const updateResults = {
        success: [] as string[],
        failed: [] as string[],
      };

      // Update password cho từng bác sĩ
      for (const doc of doctorsSnapshot.docs) {
        const userData = doc.data();
        const email = userData.email;
        const fullName = userData.fullName;

        try {
          await updateDoc(doc.ref, {
            password: DEFAULT_PASSWORD,
            updatedAt: new Date(),
          });

          console.log(`✅ Updated: ${fullName} (${email})`);
          updateResults.success.push(`${fullName} (${email})`);
        } catch (error: any) {
          console.error(`❌ Failed: ${fullName} (${email})`, error);
          updateResults.failed.push(`${fullName} (${email})`);
        }

        // Delay nhỏ giữa các updates
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setResults({
        total: doctorsSnapshot.size,
        success: updateResults.success.length,
        failed: updateResults.failed.length,
        successList: updateResults.success,
        failedList: updateResults.failed,
      });

      console.log('✅ Done!');
      Alert.alert(
        'Hoàn thành!',
        `Đã cập nhật password cho ${updateResults.success.length}/${doctorsSnapshot.size} bác sĩ.\n\nPassword: ${DEFAULT_PASSWORD}`
      );

    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🔐 Admin: Set Doctor Passwords</Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#FF9800" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              Tool này sẽ đặt password mặc định "{DEFAULT_PASSWORD}" cho TẤT CẢ bác sĩ trong hệ thống.
            </Text>
            <Text style={[styles.infoText, { marginTop: 8 }]}>
              Bác sĩ có thể dùng password này để đăng nhập, sau đó NÊN đổi password qua "Quên mật khẩu".
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={setPasswordsForAllDoctors}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Đang xử lý...</Text>
            </>
          ) : (
            <>
              <Ionicons name="key" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Đặt password cho tất cả bác sĩ</Text>
            </>
          )}
        </TouchableOpacity>

        {results && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>📊 Kết quả</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tổng số bác sĩ:</Text>
              <Text style={styles.resultValue}>{results.total}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: '#4CAF50' }]}>Thành công:</Text>
              <Text style={[styles.resultValue, { color: '#4CAF50' }]}>{results.success}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: '#f44336' }]}>Thất bại:</Text>
              <Text style={[styles.resultValue, { color: '#f44336' }]}>{results.failed}</Text>
            </View>

            {results.successList.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>✅ Thành công:</Text>
                {results.successList.map((name: string, index: number) => (
                  <Text key={index} style={styles.listItem}>
                    {index + 1}. {name}
                  </Text>
                ))}
              </View>
            )}

            {results.failedList.length > 0 && (
              <View style={styles.listSection}>
                <Text style={[styles.listTitle, { color: '#f44336' }]}>❌ Thất bại:</Text>
                {results.failedList.map((name: string, index: number) => (
                  <Text key={index} style={[styles.listItem, { color: '#f44336' }]}>
                    {index + 1}. {name}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.credentialsBox}>
              <Text style={styles.credentialsTitle}>🔑 Thông tin đăng nhập:</Text>
              <Text style={styles.credentialsText}>Email: {'<email-cua-bac-si>'}</Text>
              <Text style={styles.credentialsText}>Password: {DEFAULT_PASSWORD}</Text>
              <Text style={[styles.credentialsText, { marginTop: 8, fontStyle: 'italic' }]}>
                ⚠️ Yêu cầu bác sĩ đổi password ngay sau khi đăng nhập!
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#FF9800',
  },
  backButton: {
    backgroundColor: '#666',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  results: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4CAF50',
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  credentialsBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  credentialsText: {
    fontSize: 14,
    color: '#0D47A1',
    fontFamily: 'monospace',
  },
});
