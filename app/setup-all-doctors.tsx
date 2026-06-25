import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';

// Mapping tên bác sĩ với file ảnh
const doctorNameToImage: any = {
  'Nguyễn Văn An': 'nguyenvanam.png',
  'Trần Thị Lan': 'tranthilan.png',
  'Lê Minh Tâm': 'leminhtam.png',
  'Trần Thị Mai': 'tranthimai.png',
  'Lê Hoàng Nam': 'lehoangnam.png',
  'Phạm Thu Hà': 'phamthuha.png',
  'Đỗ Minh Tuấn': 'dominhtuan.png',
  'Vũ Thị Lan': 'vuthilan.png',
  'Hoàng Văn Đức': 'hoangvanduc.png',
  'Ngô Thị Hương': 'ngothihuong.png',
  'Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'Trần Văn Khoa': 'tranvankhoa.png',
  'Phạm Minh Quân': 'phamminhquan.png',
  'Lê Thị Hằng': 'lethihang.png',
  'Nguyễn Văn Hải': 'nguyenvanhai.png',
  'Đặng Thị Thảo': 'dangthithao.jpg',
};

// Mapping email bác sĩ với doctorId và tên đầy đủ
const DOCTOR_EMAIL_TO_INFO_MAP: { [key: string]: { doctorId: string; fullName: string } } = {
  'nguyenvanan@gmail.com': { doctorId: 'bs001', fullName: 'Nguyễn Văn An' },
  'tranthilan@gmail.com': { doctorId: 'bs002', fullName: 'Trần Thị Lan' },
  'leminhtam@gmail.com': { doctorId: 'bs003', fullName: 'Lê Minh Tâm' },
  'tranthimai@gmail.com': { doctorId: 'bs004', fullName: 'Trần Thị Mai' },
  'lehoangnam@gmail.com': { doctorId: 'bs005', fullName: 'Lê Hoàng Nam' },
  'phamthuha@gmail.com': { doctorId: 'bs006', fullName: 'Phạm Thu Hà' },
  'dominhtuan@gmail.com': { doctorId: 'bs007', fullName: 'Đỗ Minh Tuấn' },
  'vuthilan@gmail.com': { doctorId: 'bs008', fullName: 'Vũ Thị Lan' },
  'hoangvanduc@gmail.com': { doctorId: 'bs009', fullName: 'Hoàng Văn Đức' },
  'ngothihuong@gmail.com': { doctorId: 'bs010', fullName: 'Ngô Thị Hương' },
  'nguyenthihoa@gmail.com': { doctorId: 'bs011', fullName: 'Nguyễn Thị Hoa' },
  'tranvankhoa@gmail.com': { doctorId: 'bs012', fullName: 'Trần Văn Khoa' },
  'phamminhquan@gmail.com': { doctorId: 'bs013', fullName: 'Phạm Minh Quân' },
  'lethihang@gmail.com': { doctorId: 'bs014', fullName: 'Lê Thị Hằng' },
  'nguyenvanhai@gmail.com': { doctorId: 'bs015', fullName: 'Nguyễn Văn Hải' },
  'dangthithao@gmail.com': { doctorId: 'bs016', fullName: 'Đặng Thị Thảo' },
  'doctor@test.com': { doctorId: 'bs001', fullName: 'Nguyễn Văn An' },
  'bacsi@test.com': { doctorId: 'bs002', fullName: 'Trần Thị Lan' },
};

export default function SetupAllDoctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const setupAll = async () => {
    try {
      setLoading(true);
      setResult('🚀 Bắt đầu setup toàn bộ hệ thống bác sĩ...\n\n');

      // STEP 1: Map doctorId cho users
      setResult(prev => prev + '📍 BƯỚC 1: Map doctorId cho tài khoản bác sĩ\n');
      const doctors = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);
      setResult(prev => prev + `✅ Tìm thấy ${doctors.length} tài khoản bác sĩ\n\n`);

      let userUpdated = 0;
      for (const doctor of doctors) {
        const email = (doctor as any).email?.toLowerCase();
        const doctorInfo = DOCTOR_EMAIL_TO_INFO_MAP[email];

        if (doctorInfo) {
          const { doctorId, fullName } = doctorInfo;
          const imageName = doctorNameToImage[fullName];
          const currentDoctorId = ((doctor as any).doctorInfo as any)?.doctorId;

          if (currentDoctorId !== doctorId) {
            const updateData: any = {
              'doctorInfo.doctorId': doctorId,
              updatedAt: new Date().toISOString()
            };
            if (imageName) {
              updateData.avatar = imageName;
            }
            await updateDocument('users', doctor.id, updateData);
            setResult(prev => prev + `✅ ${email}: doctorId = ${doctorId}\n`);
            userUpdated++;
          }
        }
      }
      setResult(prev => prev + `\n📊 Đã cập nhật ${userUpdated} tài khoản\n\n`);

      // STEP 2: Fix appointments mapping
      setResult(prev => prev + '📍 BƯỚC 2: Sửa doctorId trong appointments\n');
      const doctorsCollection = await getDocumentsWithQuery('doctors', []);
      const appointments = await getDocumentsWithQuery('appointments', []);
      setResult(prev => prev + `✅ Tìm thấy ${appointments.length} lịch hẹn\n\n`);

      let appointmentsFixed = 0;
      for (const apt of appointments) {
        const aptDoctor = (apt as any).doctor;
        const aptDoctorId = (apt as any).doctorId;

        const matchingDoctor = doctorsCollection.find((doc: any) => {
          const docName = doc.ten;
          const cleanAptDoctor = aptDoctor
            ?.replace(/^BS\.\s*/i, '')
            ?.replace(/^Bs\.\s*/i, '')
            ?.trim()
            ?.toLowerCase();
          const cleanDocName = docName?.trim()?.toLowerCase();
          
          return (
            cleanAptDoctor === cleanDocName ||
            aptDoctor === docName ||
            aptDoctor === `BS. ${docName}` ||
            aptDoctor?.toLowerCase() === docName?.toLowerCase()
          );
        });

        if (matchingDoctor && aptDoctorId !== matchingDoctor.id) {
          await updateDocument('appointments', apt.id, {
            doctorId: matchingDoctor.id
          });
          setResult(prev => prev + `🔧 ${aptDoctor}: ${aptDoctorId || 'undefined'} → ${matchingDoctor.id}\n`);
          appointmentsFixed++;
        }
      }
      setResult(prev => prev + `\n📊 Đã sửa ${appointmentsFixed} lịch hẹn\n\n`);

      // SUMMARY
      setResult(prev => prev + '✅ HOÀN TẤT!\n\n');
      setResult(prev => prev + '📊 Tổng kết:\n');
      setResult(prev => prev + `   - Tài khoản bác sĩ: ${userUpdated} cập nhật\n`);
      setResult(prev => prev + `   - Lịch hẹn: ${appointmentsFixed} sửa\n\n`);
      setResult(prev => prev + '🎉 Tất cả bác sĩ giờ đã có thể xem lịch hẹn!\n');

      Alert.alert(
        'Thành công!', 
        `Đã setup xong:\n- ${userUpdated} tài khoản bác sĩ\n- ${appointmentsFixed} lịch hẹn`
      );
      setLoading(false);
    } catch (error) {
      console.error('Error setup:', error);
      setResult(prev => prev + `\n❌ Lỗi: ${error}\n`);
      Alert.alert('Lỗi', 'Không thể setup hệ thống');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup All Doctors</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroCard}>
          <Ionicons name="rocket" size={48} color="#00BCD4" />
          <Text style={styles.heroTitle}>Setup Toàn Bộ Hệ Thống</Text>
          <Text style={styles.heroText}>
            Tool này sẽ tự động setup tất cả bác sĩ trong hệ thống:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Map doctorId cho tất cả tài khoản bác sĩ</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Cập nhật avatar cho bác sĩ</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Sửa doctorId trong tất cả appointments</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Đảm bảo bác sĩ thấy được lịch hẹn</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={setupAll}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="rocket" size={24} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : 'Chạy Setup Tự Động'}
          </Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>📋 Kết quả:</Text>
            <ScrollView style={styles.resultScroll}>
              <Text style={styles.resultText}>{result}</Text>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#00BCD4',
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: 400,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  resultScroll: {
    maxHeight: 320,
  },
  resultText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
