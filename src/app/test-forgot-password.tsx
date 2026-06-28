/**
 * Test Forgot Password Flow
 * Screen để test nhanh flow quên mật khẩu
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from './config/firebase';
import { sendOTPEmail } from './services/emailService';

export default function TestForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('maihongloi060423@gmail.com');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${icon} ${message}`]);
  };

  const testSendOTP = async () => {
    if (!db) {
      Alert.alert('Lỗi', 'Firebase chưa được khởi tạo');
      return;
    }

    setLoading(true);
    setTestResults([]);
    addLog('Bắt đầu test gửi OTP...');

    try {
      // 1. Tạo OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      addLog(`Tạo OTP: ${otpCode}`);

      // 2. Lưu vào Firestore
      addLog('Lưu OTP vào Firestore...');
      const docRef = await addDoc(collection(db, 'password_reset_otps'), {
        email: email.toLowerCase(),
        otp: otpCode,
        createdAt: serverTimestamp(),
      });
      addLog(`OTP đã lưu: ${docRef.id}`, 'success');

      // 3. Gửi email
      addLog('Gửi OTP qua EmailJS...');
      const emailSent = await sendOTPEmail(email, otpCode);

      if (emailSent) {
        addLog('Email đã gửi thành công!', 'success');
        addLog(`Check email: ${email}`);
        Alert.alert(
          'Thành công!',
          `OTP: ${otpCode}\n\nCheck email ${email} để xem OTP`,
          [{ text: 'OK' }]
        );
      } else {
        addLog('Không thể gửi email', 'error');
        Alert.alert('Lỗi', 'Không thể gửi email');
      }
    } catch (error: any) {
      addLog(`Lỗi: ${error.message}`, 'error');
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testResetPassword = async () => {
    Alert.alert(
      'Test Reset Password',
      'Vui lòng test trực tiếp trên màn hình "Quên mật khẩu"\n\nFlow:\n1. Nhập email\n2. Nhận OTP\n3. Nhập OTP + mật khẩu mới\n4. Đăng nhập',
      [
        {
          text: 'Đi đến Quên mật khẩu',
          onPress: () => router.push('/forgot-password'),
        },
        { text: 'Đóng' },
      ]
    );
  };

  const checkBackendAPI = async () => {
    setLoading(true);
    setTestResults([]);
    addLog('Kiểm tra Backend API...');

    try {
      const API_URL = __DEV__
        ? Platform.OS === 'android'
          ? 'http://10.0.2.2:3001'
          : 'http://localhost:3001'
        : 'https://your-api-url.com';

      addLog(`Connecting to: ${API_URL}`);

      const response = await fetch(API_URL, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        addLog('Backend API đang chạy!', 'success');
        addLog(`Status: ${data.status}`);
        addLog(`Message: ${data.message}`);
      } else {
        addLog(`Backend API lỗi: ${response.status}`, 'error');
      }
    } catch (error: any) {
      addLog('Không thể kết nối Backend API', 'error');
      addLog(error.message, 'error');
      addLog('Hãy chạy: cd email-api && npm start');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Forgot Password</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Email Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email để test</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Functions</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={testSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Test Gửi OTP Email</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={checkBackendAPI}
            disabled={loading}
          >
            <Ionicons name="server-outline" size={20} color="#00BCD4" />
            <Text style={[styles.buttonText, { color: '#00BCD4' }]}>
              Check Backend API
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={testResetPassword}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#00BCD4" />
            <Text style={[styles.buttonText, { color: '#00BCD4' }]}>
              Test Reset Password Flow
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <View style={styles.resultsContainer}>
              {testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng dẫn</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              1. Chạy Backend API:{'\n'}
              <Text style={styles.codeText}>cd email-api && npm start</Text>
              {'\n\n'}
              2. Test gửi OTP email{'\n\n'}
              3. Check Backend API đang chạy{'\n\n'}
              4. Test full flow trên màn hình "Quên mật khẩu"
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: '#00BCD4',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    backgroundColor: '#E0F7FA',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#006064',
    lineHeight: 22,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 4,
  },
});
