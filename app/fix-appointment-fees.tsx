import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from './config/firebase';

export default function FixAppointmentFeesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, fixed: 0, alreadyOk: 0, errors: 0 });

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const fixAppointmentFees = async () => {
    try {
      setLoading(true);
      setLogs([]);
      setStats({ total: 0, fixed: 0, alreadyOk: 0, errors: 0 });

      addLog('🔍 Đang tải tất cả appointments từ Firestore...');
      
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      
      addLog(`📊 Tìm thấy ${snapshot.size} appointments`);
      setStats(prev => ({ ...prev, total: snapshot.size }));

      let fixed = 0;
      let alreadyOk = 0;
      let errors = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const id = docSnapshot.id;

        try {
          // Kiểm tra xem có trường fee không
          if (data.fee !== undefined && data.fee !== null && data.fee !== 0) {
            addLog(`✅ ${id}: Đã có fee = ${data.fee}`);
            alreadyOk++;
          } else {
            // Thử lấy từ các trường khác
            const feeValue = data.price || data.doctorFee || 300000; // Default 300k nếu không tìm thấy
            
            addLog(`🔧 ${id}: Đang cập nhật fee từ ${data.fee} → ${feeValue}`);
            
            await updateDoc(doc(db, 'appointments', id), {
              fee: feeValue
            });
            
            addLog(`✅ ${id}: Đã cập nhật fee = ${feeValue}`);
            fixed++;
          }

          setStats({ total: snapshot.size, fixed, alreadyOk, errors });
        } catch (error) {
          addLog(`❌ ${id}: Lỗi - ${error}`);
          errors++;
          setStats({ total: snapshot.size, fixed, alreadyOk, errors });
        }
      }

      addLog('');
      addLog('🎉 Hoàn thành!');
      addLog(`✅ Đã sửa: ${fixed}`);
      addLog(`✓ Đã OK: ${alreadyOk}`);
      addLog(`❌ Lỗi: ${errors}`);

    } catch (error) {
      addLog(`❌ Lỗi nghiêm trọng: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix Appointment Fees</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statValue}>{stats.fixed}</Text>
          <Text style={styles.statLabel}>Đã sửa</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#06D6A0' }]}>
          <Text style={styles.statValue}>{stats.alreadyOk}</Text>
          <Text style={styles.statLabel}>Đã OK</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.statValue}>{stats.errors}</Text>
          <Text style={styles.statLabel}>Lỗi</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={fixAppointmentFees}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.actionButtonText}>Đang xử lý...</Text>
          </>
        ) : (
          <>
            <Ionicons name="construct" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Bắt đầu sửa Fees</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        <ScrollView 
          style={styles.logsScroll}
          contentContainerStyle={styles.logsContent}
        >
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có log nào. Nhấn nút để bắt đầu.</Text>
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
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
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
  logsContent: {
    paddingBottom: 16,
  },
  logText: {
    fontSize: 12,
    color: '#334155',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
  },
});
