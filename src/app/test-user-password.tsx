import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
import { auth, db } from './config/firebase';

export default function TestUserPasswordScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testPassword = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và password');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🔍 Testing password for:', email);
      
      // Test 1: Kiểm tra user trong Firestore
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        setResult({
          success: false,
          message: '❌ User không tồn tại trong Firestore',
          firestorePassword: null,
          firebaseAuthTest: null,
        });
        setLoading(false);
        return;
      }

      const userData = usersSnapshot.docs[0].data();
      const firestorePassword = userData.password;

      console.log('✅ User found in Firestore');
      console.log('📝 Firestore password:', firestorePassword);
      console.log('🔑 Test password:', password);

      // Test 2: Kiểm tra password match với Firestore
      const firestoreMatch = firestorePassword === password;

      // Test 3: Kiểm tra Firebase Auth
      let firebaseAuthTest = null;
      try {
        await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
        firebaseAuthTest = '✅ Firebase Auth password ĐÚNG';
        console.log('✅ Firebase Auth login successful');
      } catch (error: any) {
        firebaseAuthTest = `❌ Firebase Auth password SAI\nError: ${error.code}`;
        console.error('❌ Firebase Auth login failed:', error.code);
      }

      setResult({
        success: firestoreMatch,
        message: firestoreMatch 
          ? '✅ Password khớp với Firestore' 
          : '❌ Password KHÔNG khớp với Firestore',
        firestorePassword: firestorePassword,
        testPassword: password,
        firestoreMatch: firestoreMatch,
        firebaseAuthTest: firebaseAuthTest,
        userData: {
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
        }
      });

    } catch (error: any) {
      console.error('❌ Test error:', error);
      setResult({
        success: false,
        message: '❌ Lỗi test: ' + error.message,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="key" size={48} color="#00BCD4" />
        <Text style={styles.title}>Test User Password</Text>
        <Text style={styles.subtitle}>
          Kiểm tra password trong Firestore và Firebase Auth
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email user"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password để test</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập password muốn test"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={false}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Test Password</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <View style={[
            styles.resultHeader,
            result.success ? styles.resultHeaderSuccess : styles.resultHeaderError
          ]}>
            <Ionicons 
              name={result.success ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.resultTitle}>{result.message}</Text>
          </View>

          <View style={styles.resultContent}>
            {result.userData && (
              <>
                <Text style={styles.resultLabel}>👤 User Info:</Text>
                <Text style={styles.resultText}>Email: {result.userData.email}</Text>
                <Text style={styles.resultText}>Name: {result.userData.fullName}</Text>
                <Text style={styles.resultText}>Role: {result.userData.role}</Text>
                <View style={styles.divider} />
              </>
            )}

            {result.firestorePassword && (
              <>
                <Text style={styles.resultLabel}>🔐 Firestore Password:</Text>
                <Text style={[styles.resultText, styles.passwordText]}>
                  {result.firestorePassword}
                </Text>
                <View style={styles.divider} />
              </>
            )}

            {result.testPassword && (
              <>
                <Text style={styles.resultLabel}>🔑 Test Password:</Text>
                <Text style={[styles.resultText, styles.passwordText]}>
                  {result.testPassword}
                </Text>
                <View style={styles.divider} />
              </>
            )}

            {result.firestoreMatch !== undefined && (
              <>
                <Text style={styles.resultLabel}>📊 Firestore Match:</Text>
                <Text style={[
                  styles.resultText,
                  result.firestoreMatch ? styles.successText : styles.errorText
                ]}>
                  {result.firestoreMatch ? '✅ KHỚP' : '❌ KHÔNG KHỚP'}
                </Text>
                <View style={styles.divider} />
              </>
            )}

            {result.firebaseAuthTest && (
              <>
                <Text style={styles.resultLabel}>🔥 Firebase Auth Test:</Text>
                <Text style={styles.resultText}>{result.firebaseAuthTest}</Text>
                <View style={styles.divider} />
              </>
            )}

            {result.error && (
              <>
                <Text style={styles.resultLabel}>❌ Error:</Text>
                <Text style={[styles.resultText, styles.errorText]}>
                  {result.error}
                </Text>
              </>
            )}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#00BCD4" />
            <Text style={styles.infoText}>
              💡 Nếu Firestore password khớp nhưng Firebase Auth sai, 
              bạn cần dùng Firebase Admin SDK để đồng bộ password.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  resultHeaderSuccess: {
    backgroundColor: '#10b981',
  },
  resultHeaderError: {
    backgroundColor: '#ef4444',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  resultContent: {
    padding: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
  },
  passwordText: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
  },
  successText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    padding: 16,
    gap: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#006064',
    lineHeight: 20,
  },
});
