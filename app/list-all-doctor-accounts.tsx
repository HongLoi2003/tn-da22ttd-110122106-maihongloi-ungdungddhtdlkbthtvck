import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function ListAllDoctorAccounts() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const listDoctors = async () => {
    setLoading(true);
    setResult('Đang tìm kiếm...\n\n');

    try {
      // Tìm tất cả users có role = doctor
      const doctorUsers = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);

      setResult(prev => prev + `=== TÌM THẤY ${doctorUsers.length} BÁC SĨ ===\n\n`);

      for (const user of doctorUsers) {
        const userData = user as any;
        setResult(prev => prev + `📋 ${userData.fullName}\n`);
        setResult(prev => prev + `   Email: ${userData.email}\n`);
        setResult(prev => prev + `   Auth UID: ${userData.uid}\n`);
        setResult(prev => prev + `   Doctor ID: ${userData.doctorInfo?.doctorId || 'KHÔNG CÓ'}\n`);
        setResult(prev => prev + `   Phone: ${userData.phone || 'N/A'}\n`);
        setResult(prev => prev + `\n`);
      }

      // Tìm thêm users có doctorInfo nhưng role khác
      setResult(prev => prev + `\n=== USERS CÓ DOCTORINFO NHƯNG ROLE KHÁC ===\n\n`);
      const allUsers = await getDocumentsWithQuery('users', []);
      
      let foundOthers = 0;
      for (const user of allUsers) {
        const userData = user as any;
        if (userData.doctorInfo && userData.role !== 'doctor') {
          foundOthers++;
          setResult(prev => prev + `⚠️ ${userData.fullName}\n`);
          setResult(prev => prev + `   Email: ${userData.email}\n`);
          setResult(prev => prev + `   Auth UID: ${userData.uid}\n`);
          setResult(prev => prev + `   Role: ${userData.role || 'undefined'}\n`);
          setResult(prev => prev + `   Doctor ID: ${userData.doctorInfo?.doctorId}\n`);
          setResult(prev => prev + `\n`);
        }
      }

      if (foundOthers === 0) {
        setResult(prev => prev + `Không có\n`);
      }

      setResult(prev => prev + `\n🎉 Hoàn thành!\n`);

    } catch (error) {
      setResult(prev => prev + `\n❌ Lỗi: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Danh Sách Bác Sĩ</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Script này sẽ:</Text>
          <Text style={styles.infoText}>• Liệt kê tất cả tài khoản bác sĩ</Text>
          <Text style={styles.infoText}>• Hiển thị email và mật khẩu để đăng nhập</Text>
          <Text style={styles.infoText}>• Kiểm tra role và doctorInfo</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={listDoctors}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xem danh sách</Text>
          )}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Kết quả:</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#00BCD4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
