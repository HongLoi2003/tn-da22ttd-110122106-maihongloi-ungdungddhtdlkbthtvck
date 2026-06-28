import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function CheckAllDoctorsAuthUid() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);

  const checkDoctors = async () => {
    try {
      setChecking(true);
      setResult('Đang kiểm tra...');
      
      // Get all doctors from Firestore
      const doctorsData = await getDocumentsWithQuery('doctors', []);
      
      console.log('📋 [CHECK] Found', doctorsData.length, 'doctors in Firestore');
      
      const doctorsList: any[] = [];
      let hasAuthUidCount = 0;
      let missingAuthUidCount = 0;
      
      for (const doc of doctorsData) {
        const doctor = doc as any;
        const hasAuthUid = !!doctor.authUid;
        
        if (hasAuthUid) {
          hasAuthUidCount++;
        } else {
          missingAuthUidCount++;
        }
        
        doctorsList.push({
          id: doctor.id,
          ten: doctor.ten || 'Unknown',
          chuyen_khoa: doctor.chuyen_khoa || 'N/A',
          authUid: doctor.authUid || null,
          hasAuthUid: hasAuthUid,
        });
        
        console.log(`${hasAuthUid ? '✅' : '❌'} [${doctor.id}] ${doctor.ten}: authUid = ${doctor.authUid || 'MISSING'}`);
      }
      
      setDoctors(doctorsList);
      
      const summary = `📊 Tổng quan:\n\n` +
        `• Tổng số bác sĩ: ${doctorsData.length}\n` +
        `• Có authUid: ${hasAuthUidCount}\n` +
        `• Thiếu authUid: ${missingAuthUidCount}\n\n` +
        `${missingAuthUidCount > 0 ? '⚠️ Các bác sĩ thiếu authUid sẽ KHÔNG thể nhận tin nhắn!' : '✅ Tất cả bác sĩ đều có authUid'}`;
      
      setResult(summary);
      setChecking(false);
    } catch (error) {
      console.error('❌ [CHECK] Error:', error);
      setResult(`❌ Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra authUid bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Kiểm tra authUid</Text>
            <Text style={styles.infoText}>
              Công cụ này kiểm tra xem tất cả bác sĩ trong Firestore có trường "authUid" hay không.{'\n\n'}
              authUid là Firebase Auth UID của bác sĩ, cần thiết để:{'\n'}
              • Nhận tin nhắn từ bệnh nhân{'\n'}
              • Hiển thị badge tin nhắn chưa đọc{'\n'}
              • Truy cập dashboard và chức năng bác sĩ
            </Text>
          </View>
        </View>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.checkButton, checking && styles.checkButtonDisabled]}
          onPress={checkDoctors}
          disabled={checking}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.checkButtonText}>
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra tất cả bác sĩ'}
          </Text>
        </TouchableOpacity>

        {doctors.length > 0 && (
          <View style={styles.doctorsSection}>
            <Text style={styles.sectionTitle}>
              Danh sách bác sĩ ({doctors.length})
            </Text>
            
            {doctors.map((doctor, index) => (
              <View 
                key={doctor.id} 
                style={[
                  styles.doctorCard,
                  !doctor.hasAuthUid && styles.doctorCardError
                ]}
              >
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorHeaderLeft}>
                    {doctor.hasAuthUid ? (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    )}
                    <Text style={styles.doctorIndex}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.doctorId}>{doctor.id}</Text>
                </View>
                
                <Text style={styles.doctorName}>{doctor.ten}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.chuyen_khoa}</Text>
                
                {doctor.hasAuthUid ? (
                  <View style={styles.authUidBox}>
                    <Text style={styles.authUidLabel}>authUid:</Text>
                    <Text style={styles.authUidValue}>{doctor.authUid}</Text>
                  </View>
                ) : (
                  <View style={styles.missingBox}>
                    <Ionicons name="warning" size={16} color="#ef4444" />
                    <Text style={styles.missingText}>
                      Thiếu authUid - Không thể nhận tin nhắn!
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {doctors.length > 0 && doctors.some(d => !d.hasAuthUid) && (
          <View style={styles.fixCard}>
            <Ionicons name="construct" size={24} color="#f59e0b" />
            <View style={styles.fixContent}>
              <Text style={styles.fixTitle}>Cần sửa</Text>
              <Text style={styles.fixText}>
                Các bác sĩ thiếu authUid cần được tạo tài khoản Firebase Auth hoặc cập nhật trường authUid.{'\n\n'}
                Sử dụng công cụ:{'\n'}
                • /seed-doctor-accounts - Tạo tài khoản cho tất cả bác sĩ{'\n'}
                • /sync-all-doctor-ids - Đồng bộ authUid
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00838f',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#00838f',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  resultText: {
    fontSize: 14,
    color: '#00838f',
    fontWeight: '600',
    lineHeight: 20,
  },
  checkButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  checkButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  doctorsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  doctorCardError: {
    borderColor: '#ef4444',
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doctorIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BCD4',
  },
  doctorId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  authUidBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  authUidLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 4,
  },
  authUidValue: {
    fontSize: 12,
    color: '#166534',
    fontFamily: 'monospace',
  },
  missingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  missingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  fixCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  fixContent: {
    flex: 1,
  },
  fixTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  fixText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});
