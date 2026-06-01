import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    SafeAreaView,
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
  // Gmail accounts
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
  
  // Test accounts
  'doctor@test.com': { doctorId: 'bs001', fullName: 'Nguyễn Văn An' },
  'bacsi@test.com': { doctorId: 'bs002', fullName: 'Trần Thị Lan' },
};

export default function AutoMapDoctorIds() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleAutoMap = async () => {
    try {
      setLoading(true);
      setResults([]);
      const newResults: string[] = [];

      newResults.push('🔍 Bắt đầu tự động map doctorId...\n');

      // Lấy tất cả users có role = doctor
      const doctors = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);

      newResults.push(`✅ Tìm thấy ${doctors.length} tài khoản bác sĩ\n`);

      let updatedCount = 0;
      let skippedCount = 0;

      for (const doctor of doctors) {
        const email = (doctor as any).email?.toLowerCase();
        const doctorInfo = DOCTOR_EMAIL_TO_INFO_MAP[email];

        if (doctorInfo) {
          const { doctorId, fullName } = doctorInfo;
          const imageName = doctorNameToImage[fullName];
          
          // Kiểm tra xem đã có doctorId chưa
          const currentDoctorId = ((doctor as any).doctorInfo as any)?.doctorId;

          if (currentDoctorId === doctorId) {
            newResults.push(`⏭️  ${email}: Đã có doctorId = ${doctorId}`);
            skippedCount++;
          } else {
            // Cập nhật doctorId và avatar
            const updateData: any = {
              'doctorInfo.doctorId': doctorId,
              updatedAt: new Date().toISOString()
            };

            // Nếu có ảnh, cập nhật avatar
            if (imageName) {
              updateData.avatar = imageName;
            }

            await updateDocument('users', doctor.id, updateData);

            newResults.push(`✅ ${email}: Cập nhật doctorId = ${doctorId}${imageName ? `, avatar = ${imageName}` : ''}`);
            updatedCount++;
          }
        } else {
          newResults.push(`⚠️  ${email}: Không tìm thấy mapping`);
          skippedCount++;
        }
      }

      newResults.push(`\n📊 Tổng kết:`);
      newResults.push(`   - Đã cập nhật: ${updatedCount}`);
      newResults.push(`   - Bỏ qua: ${skippedCount}`);
      newResults.push(`\n✅ Hoàn thành!`);

      setResults(newResults);
    } catch (error) {
      console.error('Error auto mapping:', error);
      setResults([`❌ Lỗi: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auto Map Doctor IDs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={32} color="#00BCD4" />
          <Text style={styles.infoTitle}>Tự động map doctorId</Text>
          <Text style={styles.infoText}>
            Công cụ này sẽ tự động cập nhật <Text style={styles.bold}>doctorInfo.doctorId</Text> cho
            tất cả tài khoản bác sĩ dựa trên email.
          </Text>
          <Text style={styles.infoText}>
            Sau khi chạy, bác sĩ sẽ thấy được lịch khám mà người dùng đã đặt.
          </Text>
        </View>

        <View style={styles.mappingCard}>
          <Text style={styles.mappingTitle}>Danh sách mapping:</Text>
          {Object.entries(DOCTOR_EMAIL_TO_INFO_MAP).map(([email, info]) => (
            <View key={email} style={styles.mappingRow}>
              <Text style={styles.mappingEmail}>{email}</Text>
              <Text style={styles.mappingArrow}>→</Text>
              <Text style={styles.mappingId}>{info.doctorId}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAutoMap}
          disabled={loading}
        >
          <Ionicons name="sync" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : 'Chạy Auto Map'}
          </Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Kết quả:</Text>
            {results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  mappingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  mappingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  mappingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mappingEmail: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  mappingArrow: {
    fontSize: 14,
    color: '#94a3b8',
    marginHorizontal: 8,
  },
  mappingId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
