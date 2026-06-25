import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import doctorsData from '../doctors.json';
import { db } from './config/firebase';

export default function SyncDoctorFeesFromJsonScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, synced: 0, failed: 0, notFound: 0 });

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const syncFees = async () => {
    try {
      setLoading(true);
      setLogs([]);
      setStats({ total: 0, synced: 0, failed: 0, notFound: 0 });

      addLog('🔍 Đang tải doctors từ Firestore...');
      
      const doctorsRef = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsRef);
      
      addLog(`📊 Tìm thấy ${snapshot.size} doctors trong Firestore`);
      addLog(`📊 Có ${doctorsData.length} doctors trong doctors.json`);
      addLog('');

      let synced = 0;
      let failed = 0;
      let notFound = 0;

      for (const docSnap of snapshot.docs) {
        const firestoreData = docSnap.data();
        const firestoreId = docSnap.id;
        const firestoreName = firestoreData.ten || firestoreData.name || 'N/A';
        
        // Tìm doctor tương ứng trong doctors.json
        const jsonDoctor = doctorsData.find(d => d.id === firestoreId);
        
        if (!jsonDoctor) {
          addLog(`⚠️ ${firestoreName} (${firestoreId}): Không tìm thấy trong doctors.json`);
          notFound++;
          continue;
        }
        
        const jsonFee = jsonDoctor.phi_kham;
        const firestoreFee = firestoreData.phi_kham || firestoreData.gia_kham || 0;
        
        if (!jsonFee) {
          addLog(`⚠️ ${firestoreName} (${firestoreId}): doctors.json không có phi_kham`);
          failed++;
          continue;
        }
        
        if (firestoreFee === jsonFee) {
          addLog(`✅ ${firestoreName}: Đã đúng (${jsonFee.toLocaleString('vi-VN')}đ) - Bỏ qua`);
          synced++;
        } else {
          try {
            addLog(`🔧 ${firestoreName}: ${firestoreFee.toLocaleString('vi-VN')}đ → ${jsonFee.toLocaleString('vi-VN')}đ`);
            
            await updateDoc(doc(db, 'doctors', firestoreId), {
              phi_kham: jsonFee
            });
            
            addLog(`✅ ${firestoreName}: Đã cập nhật thành công!`);
            synced++;
          } catch (error) {
            addLog(`❌ ${firestoreName}: Lỗi - ${error}`);
            failed++;
          }
        }
        
        setStats({ total: snapshot.size, synced, failed, notFound });
      }

      addLog('');
      addLog('🎉 Hoàn thành!');
      addLog(`✅ Đã sync: ${synced}/${snapshot.size}`);
      addLog(`❌ Lỗi: ${failed}/${snapshot.size}`);
      addLog(`⚠️ Không tìm thấy: ${notFound}/${snapshot.size}`);
      addLog('');
      addLog('📝 Bây giờ bạn có thể:');
      addLog('1. Quay lại /check-doctor-fee-consistency để xác nhận');
      addLog('2. Vào /recommended-doctors để xem giá đã đúng chưa');
      addLog('3. Thử đặt lịch để kiểm tra giá khớp nhau');

    } catch (error) {
      addLog(`❌ Lỗi nghiêm trọng: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const previewFees = () => {
    setLogs([]);
    addLog('📋 Danh sách phi_kham trong doctors.json:');
    addLog('');
    
    doctorsData.forEach(doctor => {
      const fee = doctor.phi_kham || 0;
      if (fee > 0) {
        addLog(`✅ ${doctor.ten} (${doctor.id}): ${fee.toLocaleString('vi-VN')}đ`);
      } else {
        addLog(`❌ ${doctor.ten} (${doctor.id}): CHƯA CÓ GIÁ`);
      }
    });
    
    const withFee = doctorsData.filter(d => d.phi_kham && d.phi_kham > 0).length;
    const noFee = doctorsData.filter(d => !d.phi_kham || d.phi_kham === 0).length;
    
    addLog('');
    addLog('📊 Tổng kết doctors.json:');
    addLog(`✅ Có giá: ${withFee}/${doctorsData.length}`);
    addLog(`❌ Chưa có giá: ${noFee}/${doctorsData.length}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sync Doctor Fees</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statValue}>{stats.synced}</Text>
          <Text style={styles.statLabel}>Đã sync</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.statValue}>{stats.failed}</Text>
          <Text style={styles.statLabel}>Lỗi</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.statValue}>{stats.notFound}</Text>
          <Text style={styles.statLabel}>Không tìm thấy</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.previewButton]}
          onPress={previewFees}
        >
          <Ionicons name="eye-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Xem doctors.json</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          onPress={syncFees}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="sync" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>Sync từ doctors.json</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.checkButton]}
          onPress={() => router.push('/check-doctor-fee-consistency')}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Xác nhận kết quả</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="information-circle-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>
                Script này sẽ đồng bộ phi_kham từ{'\n'}
                doctors.json vào Firestore
              </Text>
              <Text style={styles.emptySubtext}>
                Nhấn "Xem doctors.json" để xem dữ liệu nguồn{'\n'}
                Nhấn "Sync từ doctors.json" để bắt đầu
              </Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 12,
  },
  previewButton: {
    backgroundColor: '#8B5CF6',
  },
  checkButton: {
    backgroundColor: '#10b981',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    color: '#334155',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
