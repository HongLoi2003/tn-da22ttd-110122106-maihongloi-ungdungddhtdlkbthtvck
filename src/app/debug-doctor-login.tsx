import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from './config/firebase';

export default function DebugDoctorLoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);

  const checkDoctorAccount = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email bác sĩ');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      console.log('🔍 Checking doctor account:', email);

      // Tìm trong users collection
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase().trim())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        setResults({
          found: false,
          message: 'Không tìm thấy tài khoản trong Firestore'
        });
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();

      setResults({
        found: true,
        docId: userDoc.id,
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        hasPassword: !!userData.password,
        passwordLength: userData.password?.length || 0,
        password: userData.password, // Show password for debug
        hasOldPassword: !!userData.oldPassword,
        oldPasswordLength: userData.oldPassword?.length || 0,
        oldPassword: userData.oldPassword,
        passwordResetAt: userData.passwordResetAt?.toDate?.()?.toISOString?.() || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      });

      console.log('✅ Doctor account found:', {
        docId: userDoc.id,
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        hasPassword: !!userData.password,
      });

    } catch (error: any) {
      console.error('❌ Error checking doctor account:', error);
      Alert.alert('Lỗi', error.message || 'Không thể kiểm tra tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const listAllDoctors = async () => {
    setLoading(true);
    setResults(null);

    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      console.log('🔍 Listing all doctor accounts...');

      const doctorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'doctor')
      );
      const doctorsSnapshot = await getDocs(doctorsQuery);

      const doctors = doctorsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          email: data.email,
          fullName: data.fullName,
          uid: data.uid,
          hasPassword: !!data.password,
          passwordLength: data.password?.length || 0,
        };
      });

      setResults({
        found: true,
        type: 'list',
        count: doctors.length,
        doctors: doctors,
      });

      console.log(`✅ Found ${doctors.length} doctor accounts`);

    } catch (error: any) {
      console.error('❌ Error listing doctors:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lấy danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🔍 Debug Doctor Login</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Email bác sĩ:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email bác sĩ"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={checkDoctorAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kiểm tra tài khoản</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={listAllDoctors}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#00BCD4" />
            ) : (
              <Text style={styles.secondaryButtonText}>Liệt kê tất cả bác sĩ</Text>
            )}
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Kết quả:</Text>
            
            {results.type === 'list' ? (
              <View>
                <Text style={styles.resultText}>
                  Tìm thấy {results.count} bác sĩ:
                </Text>
                {results.doctors.map((doctor: any, index: number) => (
                  <View key={index} style={styles.doctorItem}>
                    <Text style={styles.doctorText}>
                      {index + 1}. {doctor.fullName}
                    </Text>
                    <Text style={styles.doctorDetail}>Email: {doctor.email}</Text>
                    <Text style={styles.doctorDetail}>UID: {doctor.uid}</Text>
                    <Text style={styles.doctorDetail}>
                      Password: {doctor.hasPassword ? `✅ (${doctor.passwordLength} ký tự)` : '❌ Không có'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : results.found ? (
              <View>
                <Text style={styles.resultSuccess}>✅ Tìm thấy tài khoản!</Text>
                <Text style={styles.resultText}>Doc ID: {results.docId}</Text>
                <Text style={styles.resultText}>UID: {results.uid}</Text>
                <Text style={styles.resultText}>Email: {results.email}</Text>
                <Text style={styles.resultText}>Họ tên: {results.fullName}</Text>
                <Text style={styles.resultText}>Role: {results.role}</Text>
                <Text style={styles.resultText}>
                  Password: {results.hasPassword ? `✅ (${results.passwordLength} ký tự)` : '❌'}
                </Text>
                {results.hasPassword && (
                  <Text style={styles.resultPassword}>
                    Password: {results.password}
                  </Text>
                )}
                {results.hasOldPassword && (
                  <>
                    <Text style={styles.resultText}>
                      Old Password: ✅ ({results.oldPasswordLength} ký tự)
                    </Text>
                    <Text style={styles.resultPassword}>
                      Old Password: {results.oldPassword}
                    </Text>
                  </>
                )}
                {results.passwordResetAt && (
                  <Text style={styles.resultText}>
                    Password Reset At: {results.passwordResetAt}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.resultError}>❌ {results.message}</Text>
            )}
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#00BCD4',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  backButton: {
    backgroundColor: '#666',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  results: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultSuccess: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  resultError: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  resultPassword: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#00BCD4',
    fontFamily: 'monospace',
  },
  doctorItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  doctorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  doctorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});
