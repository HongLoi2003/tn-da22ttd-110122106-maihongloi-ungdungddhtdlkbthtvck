import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function SyncAllDoctorIds() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleSync = async () => {
    try {
      setLoading(true);
      setResults([]);
      const logs: string[] = [];

      logs.push('=== BẮT ĐẦU ĐỒNG BỘ DOCTOR IDS ===\n');

      // 1. Lấy mapping: doctor name -> doctorId
      const doctors = await getDocumentsWithQuery('doctors', []);
      const nameToId = new Map<string, string>();
      
      doctors.forEach((doc: any) => {
        const name = doc.ten || doc.name;
        if (name && doc.id) {
          // Map cả tên có và không có "BS."
          nameToId.set(name, doc.id);
          nameToId.set(name.replace(/^(BS\.|Bs\.)\s*/i, ''), doc.id);
          nameToId.set(`BS. ${name.replace(/^(BS\.|Bs\.)\s*/i, '')}`, doc.id);
        }
      });

      logs.push(`✅ Tìm thấy ${doctors.length} bác sĩ trong doctors collection\n`);

      // 2. Sync Appointments
      logs.push('📋 ĐỒNG BỘ APPOINTMENTS...');
      const appointments = await getDocumentsWithQuery('appointments', []);
      let aptUpdated = 0;
      
      for (const apt of appointments) {
        const aptData = apt as any;
        const doctorName = aptData.doctor;
        const currentDoctorId = aptData.doctorId;
        
        if (doctorName) {
          const correctDoctorId = nameToId.get(doctorName);
          
          if (correctDoctorId && correctDoctorId !== currentDoctorId) {
            await updateDocument('appointments', apt.id, {
              doctorId: correctDoctorId
            });
            logs.push(`  ✅ [${apt.id}] ${doctorName}: ${currentDoctorId || 'N/A'} -> ${correctDoctorId}`);
            aptUpdated++;
          }
        }
      }
      logs.push(`  📊 Đã cập nhật: ${aptUpdated}/${appointments.length} appointments\n`);

      // 3. Sync Reviews
      logs.push('⭐ ĐỒNG BỘ REVIEWS...');
      const reviews = await getDocumentsWithQuery('reviews', []);
      let reviewUpdated = 0;
      
      for (const review of reviews) {
        const reviewData = review as any;
        const doctorName = reviewData.doctorName;
        const currentDoctorId = reviewData.doctorId;
        
        if (doctorName) {
          const correctDoctorId = nameToId.get(doctorName);
          
          if (correctDoctorId && correctDoctorId !== currentDoctorId) {
            await updateDocument('reviews', review.id, {
              doctorId: correctDoctorId
            });
            logs.push(`  ✅ [${review.id}] ${doctorName}: ${currentDoctorId || 'N/A'} -> ${correctDoctorId}`);
            reviewUpdated++;
          }
        }
      }
      logs.push(`  📊 Đã cập nhật: ${reviewUpdated}/${reviews.length} reviews\n`);

      // 4. Sync Conversations
      logs.push('💬 ĐỒNG BỘ CONVERSATIONS...');
      const conversations = await getDocumentsWithQuery('conversations', []);
      let convUpdated = 0;
      
      for (const conv of conversations) {
        const convData = conv as any;
        const doctorName = convData.doctorName;
        const currentDoctorId = convData.doctorId;
        
        if (doctorName) {
          const correctDoctorId = nameToId.get(doctorName);
          
          if (correctDoctorId && correctDoctorId !== currentDoctorId) {
            // Lấy authUid từ doctors collection
            const doctorDoc = doctors.find((d: any) => d.id === correctDoctorId);
            const authUid = (doctorDoc as any)?.authUid;
            
            const updateData: any = {
              doctorId: correctDoctorId
            };
            
            if (authUid) {
              updateData.doctorAuthUid = authUid;
            }
            
            await updateDocument('conversations', conv.id, updateData);
            logs.push(`  ✅ [${conv.id}] ${doctorName}: ${currentDoctorId || 'N/A'} -> ${correctDoctorId}`);
            convUpdated++;
          }
        }
      }
      logs.push(`  📊 Đã cập nhật: ${convUpdated}/${conversations.length} conversations\n`);

      // 5. Sync Work Schedules
      logs.push('📅 ĐỒNG BỘ WORK SCHEDULES...');
      const schedules = await getDocumentsWithQuery('workSchedules', []);
      let scheduleUpdated = 0;
      
      for (const schedule of schedules) {
        const scheduleData = schedule as any;
        const doctorName = scheduleData.doctorName;
        const currentDoctorId = scheduleData.doctorId;
        
        if (doctorName) {
          const correctDoctorId = nameToId.get(doctorName);
          
          if (correctDoctorId && correctDoctorId !== currentDoctorId) {
            await updateDocument('workSchedules', schedule.id, {
              doctorId: correctDoctorId
            });
            logs.push(`  ✅ [${schedule.id}] ${doctorName}: ${currentDoctorId || 'N/A'} -> ${correctDoctorId}`);
            scheduleUpdated++;
          }
        }
      }
      logs.push(`  📊 Đã cập nhật: ${scheduleUpdated}/${schedules.length} schedules\n`);

      logs.push('=== KẾT QUẢ TỔNG HỢP ===');
      logs.push(`✅ Appointments: ${aptUpdated} cập nhật`);
      logs.push(`✅ Reviews: ${reviewUpdated} cập nhật`);
      logs.push(`✅ Conversations: ${convUpdated} cập nhật`);
      logs.push(`✅ Work Schedules: ${scheduleUpdated} cập nhật`);
      logs.push(`📊 Tổng: ${aptUpdated + reviewUpdated + convUpdated + scheduleUpdated} cập nhật`);

      setResults(logs);
      setLoading(false);

      Alert.alert(
        'Hoàn thành',
        `Đã đồng bộ ${aptUpdated + reviewUpdated + convUpdated + scheduleUpdated} records`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error:', error);
      setResults(prev => [...prev, `\n❌ LỖI: ${error.message}`]);
      setLoading(false);
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sync All Doctor IDs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Đồng Bộ Tất Cả Doctor IDs</Text>
          <Text style={styles.description}>
            Script này sẽ đồng bộ doctorId trong tất cả collections:
            {'\n\n'}
            • Appointments - Lịch khám{'\n'}
            • Reviews - Đánh giá{'\n'}
            • Conversations - Tin nhắn{'\n'}
            • Work Schedules - Lịch làm việc
            {'\n\n'}
            Sau khi chạy xong, tất cả doctorId sẽ được chuẩn hóa theo doctors collection.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sync" size={20} color="#fff" />
                <Text style={styles.buttonText}>Bắt đầu đồng bộ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Kết quả:</Text>
            <ScrollView style={styles.resultsScroll}>
              {results.map((line, index) => (
                <Text key={index} style={styles.resultLine}>
                  {line}
                </Text>
              ))}
            </ScrollView>
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    maxHeight: 400,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultsScroll: {
    maxHeight: 350,
  },
  resultLine: {
    fontSize: 13,
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});
