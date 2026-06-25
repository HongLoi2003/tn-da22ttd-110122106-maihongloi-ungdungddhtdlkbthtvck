import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from './config/firebase';

export default function CheckDoctorAppointmentsFeeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, hasFee: 0, noFee: 0 });

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const checkAppointments = async () => {
    try {
      setLoading(true);
      setLogs([]);
      
      addLog('🔍 Đang tải tất cả appointments...');
      
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      
      addLog(`📊 Tìm thấy ${snapshot.size} appointments`);
      
      let hasFee = 0;
      let noFee = 0;
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        
        if (data.fee !== undefined && data.fee !== null && data.fee !== 0) {
          addLog(`✅ ${id}: có fee = ${data.fee}`);
          hasFee++;
        } else {
          addLog(`❌ ${id}: KHÔNG có fee (fee = ${data.fee})`);
          addLog(`   → Doctor: ${data.doctor || 'N/A'}`);
          addLog(`   → Patient: ${data.patientName || 'N/A'}`);
          addLog(`   → Date: ${data.fullDate || 'N/A'}`);
          noFee++;
        }
      });
      
      setStats({ total: snapshot.size, hasFee, noFee });
      
      addLog('');
      addLog('📊 Tổng kết:');
      addLog(`✅ Có fee: ${hasFee}/${snapshot.size}`);
      addLog(`❌ Không có fee: ${noFee}/${snapshot.size}`);
      
      if (noFee > 0) {
        addLog('');
        addLog('⚠️ CẦN CHẠY SCRIPT FIX-APPOINTMENT-FEES để cập nhật fee cho các appointments thiếu!');
      }
      
    } catch (error) {
      addLog(`❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Appointments Fee</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statValue}>{stats.hasFee}</Text>
          <Text style={styles.statLabel}>Có fee</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.statValue}>{stats.noFee}</Text>
          <Text style={styles.statLabel}>Không có fee</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.checkButton, loading && styles.checkButtonDisabled]}
        onPress={checkAppointments}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.checkButtonText}>Đang kiểm tra...</Text>
          </>
        ) : (
          <>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.checkButtonText}>Kiểm tra Appointments</Text>
          </>
        )}
      </TouchableOpacity>

      {stats.noFee > 0 && (
        <TouchableOpacity 
          style={styles.fixButton}
          onPress={() => router.push('/fix-appointment-fees')}
        >
          <Ionicons name="construct" size={20} color="#fff" />
          <Text style={styles.fixButtonText}>Sửa Appointments thiếu Fee</Text>
        </TouchableOpacity>
      )}

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Kết quả kiểm tra:</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>Nhấn nút để kiểm tra</Text>
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
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fixButtonText: {
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
