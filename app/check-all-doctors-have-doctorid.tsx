import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function CheckAllDoctorsHaveDoctorId() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const checkAllDoctors = async () => {
    setChecking(true);
    setLogs([]);

    try {
      addLog('🔍 Đang tìm tất cả bác sĩ...\n');

      // Get all doctors
      const doctors = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);

      addLog(`📊 Tìm thấy ${doctors.length} bác sĩ\n`);
      addLog('─────────────────────────────────\n');

      let hasDoctorId = 0;
      let noDoctorId = 0;
      const missingDoctors: any[] = [];

      for (const doctor of doctors) {
        const doctorData = doctor as any;
        const fullName = doctorData.fullName || 'Không có tên';
        const email = doctorData.email || 'Không có email';
        const uid = doctorData.uid;
        const doctorId = doctorData.doctorInfo?.doctorId;

        if (doctorId) {
          addLog(`✅ ${fullName}`);
          addLog(`   📧 ${email}`);
          addLog(`   🆔 doctorId: ${doctorId}`);
          addLog(`   🔑 auth UID: ${uid}\n`);
          hasDoctorId++;
        } else {
          addLog(`❌ ${fullName}`);
          addLog(`   📧 ${email}`);
          addLog(`   🆔 doctorId: KHÔNG CÓ`);
          addLog(`   🔑 auth UID: ${uid}\n`);
          noDoctorId++;
          missingDoctors.push({
            fullName,
            email,
            uid
          });
        }
      }

      addLog('─────────────────────────────────\n');
      addLog(`📈 TỔNG KẾT:\n`);
      addLog(`✅ Có doctorId: ${hasDoctorId}`);
      addLog(`❌ Không có doctorId: ${noDoctorId}\n`);

      if (missingDoctors.length > 0) {
        addLog('⚠️  CÁC BÁC SĨ THIẾU doctorId:\n');
        missingDoctors.forEach((doc, index) => {
          addLog(`${index + 1}. ${doc.fullName} (${doc.email})`);
        });
        addLog('\n💡 Gợi ý: Chạy script "Auto Map All Doctors" để thêm doctorId cho các bác sĩ này.');
      } else {
        addLog('🎉 TẤT CẢ BÁC SĨ ĐÃ CÓ doctorId!');
      }

    } catch (error: any) {
      addLog(`\n❌ LỖI: ${error.message}`);
      console.error('Error checking doctors:', error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm Tra doctorId</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>🔍 Kiểm Tra doctorInfo.doctorId</Text>
          <Text style={styles.description}>
            Script này kiểm tra xem tất cả bác sĩ đã có field "doctorInfo.doctorId" chưa.
            {'\n\n'}
            Field này cần thiết để phân biệt giữa:
            {'\n'}• Display ID (bs001, bs004, etc.)
            {'\n'}• Firebase Auth UID (FdVxTq...)
          </Text>

          <TouchableOpacity
            style={[styles.button, checking && styles.buttonDisabled]}
            onPress={checkAllDoctors}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.buttonText}>Kiểm Tra</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {logs.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={styles.logTitle}>📋 Kết Quả:</Text>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  logText: {
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
