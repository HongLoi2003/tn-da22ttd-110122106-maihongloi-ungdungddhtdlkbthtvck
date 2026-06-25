/**
 * Test EmailJS Integration
 * Chạy file này để test gửi email OTP
 */

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendOTPEmail } from './app/services/emailService';

export default function TestEmailJS() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleTestEmail = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setResult('Đang gửi...');

    // Tạo OTP ngẫu nhiên
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const success = await sendOTPEmail(email, otpCode);
      
      if (success) {
        setResult(`✅ Gửi thành công!\nOTP: ${otpCode}\nCheck email: ${email}`);
        Alert.alert('Thành công', `OTP đã được gửi đến ${email}\nMã OTP: ${otpCode}`);
      } else {
        setResult('❌ Gửi thất bại! Check console log');
        Alert.alert('Thất bại', 'Không thể gửi email. Vui lòng kiểm tra keys');
      }
    } catch (error) {
      setResult(`❌ Lỗi: ${error}`);
      Alert.alert('Lỗi', String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test EmailJS</Text>
      
      <Text style={styles.label}>Email nhận:</Text>
      <TextInput
        style={styles.input}
        placeholder="your-email@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleTestEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang gửi...' : '📧 Gửi OTP Test'}
        </Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📋 Thông tin EmailJS:</Text>
        <Text style={styles.infoText}>Service ID: service_n1dxg9i</Text>
        <Text style={styles.infoText}>Template ID: template_6mijrdd</Text>
        <Text style={styles.infoText}>Public Key: 3NS4...pUhQJW</Text>
      </View>

      <Text style={styles.note}>
        💡 Template phải có các biến:{'\n'}
        - to_email{'\n'}
        - to_name{'\n'}
        - otp_code{'\n'}
        - app_name
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  note: {
    marginTop: 20,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
