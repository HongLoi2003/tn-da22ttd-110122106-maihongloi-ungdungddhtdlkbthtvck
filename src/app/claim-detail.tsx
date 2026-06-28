import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ClaimDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data - trong thực tế sẽ lấy từ API dựa vào params.id
  const claim = {
    id: params.id || '1',
    date: '15/04/2026',
    hospital: 'BV Đa khoa Tâm An',
    amount: '500.000đ',
    status: 'approved',
    coverage: '450.000đ',
    type: 'Khám bệnh',
    claimDate: '16/04/2026',
    approvedDate: '18/04/2026',
    doctor: 'BS. Nguyễn Văn An',
    specialty: 'Tim mạch',
    diagnosis: 'Khám sức khỏe định kỳ',
    claimNumber: 'BT2026041500123',
    documents: [
      { id: '1', name: 'Hóa đơn viện phí', type: 'pdf' },
      { id: '2', name: 'Đơn thuốc', type: 'pdf' },
      { id: '3', name: 'Kết quả xét nghiệm', type: 'pdf' },
    ],
    timeline: [
      { date: '18/04/2026', time: '14:30', status: 'Đã duyệt', description: 'Yêu cầu bồi thường đã được phê duyệt' },
      { date: '17/04/2026', time: '10:15', status: 'Đang xử lý', description: 'Đang xem xét hồ sơ' },
      { date: '16/04/2026', time: '09:00', status: 'Đã tiếp nhận', description: 'Yêu cầu bồi thường đã được tiếp nhận' },
    ]
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved') return { bg: '#D1FAE5', text: '#059669' };
    if (status === 'pending') return { bg: '#FEF3C7', text: '#D97706' };
    if (status === 'rejected') return { bg: '#FEE2E2', text: '#DC2626' };
    return { bg: '#F1F5F9', text: '#64748B' };
  };

  const statusColor = getStatusColor(claim.status);

  const handleDownloadDocument = (doc: any) => {
    Alert.alert(
      'Tải tài liệu',
      `Bạn muốn tải xuống "${doc.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Tải xuống',
          onPress: () => {
            // Trong thực tế sẽ gọi API để tải file
            Alert.alert('Thành công', `Đã tải xuống ${doc.name}`);
          }
        }
      ]
    );
  };

  const handleExportPDF = () => {
    Alert.alert(
      'Xuất PDF',
      'Bạn muốn xuất toàn bộ thông tin bồi thường thành file PDF?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xuất PDF',
          onPress: () => {
            // Trong thực tế sẽ gọi API để tạo và tải PDF
            Alert.alert('Thành công', 'Đã xuất file PDF thành công');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bồi thường</Text>
        <TouchableOpacity onPress={handleExportPDF}>
          <Ionicons name="download-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Ionicons name="checkmark-circle" size={24} color={statusColor.text} />
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {claim.status === 'approved' ? 'Đã duyệt' : 'Đang xử lý'}
            </Text>
          </View>
          <Text style={styles.claimNumber}>Mã yêu cầu: {claim.claimNumber}</Text>
        </View>

        {/* Amount Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chi phí</Text>
          <View style={styles.amountCard}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Tổng chi phí</Text>
              <Text style={styles.amountValue}>{claim.amount}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Bảo hiểm chi trả</Text>
              <Text style={[styles.amountValue, styles.coverageAmount]}>{claim.coverage}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountRow}>
              <Text style={styles.totalLabel}>Bạn cần thanh toán</Text>
              <Text style={styles.totalValue}>50.000đ</Text>
            </View>
          </View>
        </View>

        {/* Medical Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khám bệnh</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày khám</Text>
                <Text style={styles.infoValue}>{claim.date}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cơ sở y tế</Text>
                <Text style={styles.infoValue}>{claim.hospital}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bác sĩ</Text>
                <Text style={styles.infoValue}>{claim.doctor}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Chuyên khoa</Text>
                <Text style={styles.infoValue}>{claim.specialty}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="clipboard-outline" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Chẩn đoán</Text>
                <Text style={styles.infoValue}>{claim.diagnosis}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
            <TouchableOpacity onPress={handleExportPDF} style={styles.exportButton}>
              <Ionicons name="document-text-outline" size={16} color="#00BCD4" />
              <Text style={styles.exportText}>Xuất PDF</Text>
            </TouchableOpacity>
          </View>
          {claim.documents.map((doc) => (
            <TouchableOpacity 
              key={doc.id} 
              style={styles.documentCard}
              onPress={() => handleDownloadDocument(doc)}
            >
              <View style={styles.documentIcon}>
                <Ionicons name="document-text" size={24} color="#00BCD4" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentType}>{doc.type.toUpperCase()}</Text>
              </View>
              <Ionicons name="download-outline" size={20} color="#00BCD4" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử xử lý</Text>
          <View style={styles.timeline}>
            {claim.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < claim.timeline.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineStatus}>{item.status}</Text>
                    <Text style={styles.timelineDate}>{item.date} {item.time}</Text>
                  </View>
                  <Text style={styles.timelineDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
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
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  claimNumber: {
    fontSize: 13,
    color: '#64748b',
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  amountCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  coverageAmount: {
    color: '#06D6A0',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
    color: '#64748b',
  },
  timeline: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00BCD4',
    marginTop: 4,
    marginRight: 12,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    bottom: -16,
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  timelineDate: {
    fontSize: 12,
    color: '#64748b',
  },
  timelineDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
