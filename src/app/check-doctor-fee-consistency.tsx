import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from './config/firebase';

interface DoctorFeeInfo {
  id: string;
  ten: string;
  phi_kham: number;
  phi_kham_formatted: string;
}

export default function CheckDoctorFeeConsistencyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<DoctorFeeInfo[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const checkDoctors = async () => {
    try {
      setLoading(true);
      setLogs([]);
      setDoctors([]);
      
      addLog('🔍 Đang tải danh sách bác sĩ...');
      
      const doctorsRef = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsRef);
      
      addLog(`📊 Tìm thấy ${snapshot.size} bác sĩ`);
      addLog('');
      
      const doctorList: DoctorFeeInfo[] = [];
      
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const name = data.ten || data.name || 'N/A';
        const fee = data.phi_kham || data.gia_kham || 0;
        
        doctorList.push({
          id,
          ten: name,
          phi_kham: fee,
          phi_kham_formatted: fee > 0 ? `${fee.toLocaleString('vi-VN')}đ` : 'Chưa có giá',
        });
        
        if (fee > 0) {
          addLog(`✅ ${name} (${id}): ${fee.toLocaleString('vi-VN')}đ`);
        } else {
          addLog(`❌ ${name} (${id}): CHƯA CÓ GIÁ`);
        }
      });
      
      setDoctors(doctorList);
      
      const noFee = doctorList.filter(d => d.phi_kham === 0).length;
      const hasFee = doctorList.filter(d => d.phi_kham > 0).length;
      
      addLog('');
      addLog('📊 Tổng kết:');
      addLog(`✅ Có giá: ${hasFee}/${doctorList.length}`);
      addLog(`❌ Chưa có giá: ${noFee}/${doctorList.length}`);
      
      if (noFee > 0) {
        addLog('');
        addLog('⚠️ CẢNH BÁO: Có bác sĩ chưa có giá! Điều này sẽ gây ra:');
        addLog('  1. Trang recommended-doctors hiển thị giá mặc định 200,000đ');
        addLog('  2. Khi đặt lịch, appointment.fee sẽ khác với doctor.phi_kham');
        addLog('  3. Người dùng sẽ thấy giá khác nhau ở các trang');
      }
      
    } catch (error) {
      addLog(`❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fixDefaultFees = async () => {
    try {
      setLoading(true);
      addLog('');
      addLog('🔧 Đang cập nhật giá mặc định cho các bác sĩ chưa có giá...');
      
      const doctorsNeedFix = doctors.filter(d => d.phi_kham === 0);
      
      if (doctorsNeedFix.length === 0) {
        addLog('✅ Tất cả bác sĩ đã có giá!');
        return;
      }
      
      let fixed = 0;
      
      for (const doctor of doctorsNeedFix) {
        try {
          await updateDoc(doc(db, 'doctors', doctor.id), {
            phi_kham: 300000
          });
          addLog(`✅ ${doctor.ten}: Cập nhật phi_kham = 300,000đ`);
          fixed++;
        } catch (error) {
          addLog(`❌ ${doctor.ten}: Lỗi - ${error}`);
        }
      }
      
      addLog('');
      addLog(`🎉 Hoàn thành! Đã cập nhật ${fixed}/${doctorsNeedFix.length} bác sĩ`);
      addLog('');
      addLog('🔄 Đang load lại dữ liệu...');
      
      await checkDoctors();
      
    } catch (error) {
      addLog(`❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAppointmentConsistency = async () => {
    try {
      setLoading(true);
      addLog('');
      addLog('🔍 Đang kiểm tra tính nhất quán giữa doctors và appointments...');
      
      // Load doctors
      const doctorsRef = collection(db, 'doctors');
      const doctorsSnapshot = await getDocs(doctorsRef);
      const doctorFees: { [key: string]: number } = {};
      
      doctorsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        doctorFees[doc.id] = data.phi_kham || data.gia_kham || 0;
      });
      
      addLog(`📊 Loaded ${Object.keys(doctorFees).length} doctor fees`);
      
      // Load appointments
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsSnapshot = await getDocs(appointmentsRef);
      
      addLog(`📊 Loaded ${appointmentsSnapshot.size} appointments`);
      addLog('');
      
      let consistent = 0;
      let inconsistent = 0;
      
      appointmentsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const doctorId = data.doctorId;
        const appointmentFee = data.fee || 0;
        const doctorFee = doctorFees[doctorId] || 0;
        
        if (appointmentFee === doctorFee) {
          consistent++;
        } else {
          inconsistent++;
          addLog(`⚠️ Không khớp: ${data.doctor || 'N/A'}`);
          addLog(`   Doctor ID: ${doctorId}`);
          addLog(`   Doctor fee: ${doctorFee.toLocaleString('vi-VN')}đ`);
          addLog(`   Appointment fee: ${appointmentFee.toLocaleString('vi-VN')}đ`);
          addLog('');
        }
      });
      
      addLog('📊 Kết quả:');
      addLog(`✅ Khớp: ${consistent}/${appointmentsSnapshot.size}`);
      addLog(`⚠️ Không khớp: ${inconsistent}/${appointmentsSnapshot.size}`);
      
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
        <Text style={styles.headerTitle}>Check Doctor Fee Consistency</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          onPress={checkDoctors}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>Kiểm tra Bác sĩ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.checkButton, loading && styles.actionButtonDisabled]}
          onPress={checkAppointmentConsistency}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="git-compare-outline" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>So sánh với Appointments</Text>
        </TouchableOpacity>

        {doctors.some(d => d.phi_kham === 0) && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.fixButton, loading && styles.actionButtonDisabled]}
            onPress={fixDefaultFees}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="construct" size={20} color="#fff" />
            )}
            <Text style={styles.actionButtonText}>Sửa Giá Mặc Định</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Kết quả:</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
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
  checkButton: {
    backgroundColor: '#8B5CF6',
  },
  fixButton: {
    backgroundColor: '#ef4444',
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
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
  },
});
