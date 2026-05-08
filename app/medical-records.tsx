import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MedicalRecordsScreen() {
  const router = useRouter();

  const records = [
    { 
      id: '1', 
      date: '15/04/2026', 
      doctor: 'BS. Nguyễn Văn An', 
      specialty: 'Tim mạch',
      diagnosis: 'Khám sức khỏe định kỳ',
      status: 'completed'
    },
    { 
      id: '2', 
      date: '10/03/2026', 
      doctor: 'BS. Trần Thị Mai', 
      specialty: 'Da liễu',
      diagnosis: 'Viêm da cơ địa',
      status: 'completed'
    },
    { 
      id: '3', 
      date: '05/02/2026', 
      doctor: 'BS. Lê Hoàng Nam', 
      specialty: 'Tiêu hóa',
      diagnosis: 'Đau dạ dày',
      status: 'completed'
    },
  ];

  const testResults = [
    { id: '1', name: 'Xét nghiệm máu', date: '15/04/2026', status: 'available' },
    { id: '2', name: 'Siêu âm bụng', date: '10/03/2026', status: 'available' },
    { id: '3', name: 'X-quang phổi', date: '05/02/2026', status: 'available' },
  ];

  const prescriptions = [
    { id: '1', medicine: 'Paracetamol 500mg', quantity: '20 viên', date: '15/04/2026' },
    { id: '2', medicine: 'Amoxicillin 250mg', quantity: '14 viên', date: '10/03/2026' },
  ];

  const handleRecordPress = (record: any) => {
    Alert.alert(
      'Chi tiết khám bệnh',
      `Ngày khám: ${record.date}\nBác sĩ: ${record.doctor}\nChuyên khoa: ${record.specialty}\nChẩn đoán: ${record.diagnosis}\n\nGhi chú: Bệnh nhân đã được khám và tư vấn chi tiết.`
    );
  };

  const handleTestPress = (test: any) => {
    Alert.alert(
      'Kết quả xét nghiệm',
      `${test.name}\nNgày xét nghiệm: ${test.date}\n\nKết quả:\n- Hồng cầu: 4.5 triệu/mm³\n- Bạch cầu: 7.000/mm³\n- Tiểu cầu: 250.000/mm³\n\nKết luận: Các chỉ số trong giới hạn bình thường.`
    );
  };

  const handlePrescriptionPress = (prescription: any) => {
    Alert.alert(
      'Chi tiết đơn thuốc',
      `Thuốc: ${prescription.medicine}\nSố lượng: ${prescription.quantity}\nNgày kê đơn: ${prescription.date}\n\nCách dùng:\n- Uống 1 viên x 3 lần/ngày\n- Sau bữa ăn\n- Uống đủ liệu trình`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ y tế</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Health Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Thông tin sức khỏe</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="water" size={24} color="#00BCD4" />
              <Text style={styles.summaryLabel}>Nhóm máu</Text>
              <Text style={styles.summaryValue}>O+</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="fitness" size={24} color="#06D6A0" />
              <Text style={styles.summaryLabel}>Chiều cao</Text>
              <Text style={styles.summaryValue}>165 cm</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="scale" size={24} color="#FFB800" />
              <Text style={styles.summaryLabel}>Cân nặng</Text>
              <Text style={styles.summaryValue}>55 kg</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text style={styles.summaryLabel}>Huyết áp</Text>
              <Text style={styles.summaryValue}>120/80</Text>
            </View>
          </View>
        </View>

        {/* Medical Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử khám bệnh</Text>
            <TouchableOpacity onPress={() => router.push('/all-medical-records')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {records.map((record) => (
            <TouchableOpacity 
              key={record.id} 
              style={styles.recordCard}
              onPress={() => handleRecordPress(record)}
            >
              <View style={styles.recordIcon}>
                <Ionicons name="document-text" size={24} color="#00BCD4" />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordDate}>{record.date}</Text>
                <Text style={styles.recordDoctor}>{record.doctor}</Text>
                <Text style={styles.recordSpecialty}>{record.specialty}</Text>
                <Text style={styles.recordDiagnosis}>{record.diagnosis}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Test Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kết quả xét nghiệm</Text>
            <TouchableOpacity onPress={() => router.push('/all-test-results')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {testResults.map((test) => (
            <TouchableOpacity 
              key={test.id} 
              style={styles.testCard}
              onPress={() => handleTestPress(test)}
            >
              <View style={styles.testIcon}>
                <Ionicons name="flask" size={24} color="#06D6A0" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={styles.testDate}>{test.date}</Text>
              </View>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Có sẵn</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prescriptions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn thuốc</Text>
            <TouchableOpacity onPress={() => router.push('/all-prescriptions')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {prescriptions.map((prescription) => (
            <TouchableOpacity 
              key={prescription.id} 
              style={styles.prescriptionCard}
              onPress={() => handlePrescriptionPress(prescription)}
            >
              <View style={styles.prescriptionIcon}>
                <Ionicons name="medical" size={24} color="#FFB800" />
              </View>
              <View style={styles.prescriptionInfo}>
                <Text style={styles.prescriptionName}>{prescription.medicine}</Text>
                <Text style={styles.prescriptionQuantity}>Số lượng: {prescription.quantity}</Text>
                <Text style={styles.prescriptionDate}>{prescription.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  seeAll: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  recordDoctor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  recordSpecialty: {
    fontSize: 13,
    color: '#00BCD4',
    marginBottom: 2,
  },
  recordDiagnosis: {
    fontSize: 13,
    color: '#64748b',
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 12,
    color: '#64748b',
  },
  availableBadge: {
    backgroundColor: '#06D6A0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prescriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  prescriptionQuantity: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  prescriptionDate: {
    fontSize: 12,
    color: '#64748b',
  },
});
