import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentById, getDocumentsWithQuery } from './services/firebaseService';

// Import danh sách bác sĩ từ JSON
const DOCTORS_LIST = [
  { id: "bs001", ten: "BS. Nguyễn Văn An", chuyen_khoa: "Tim mạch" },
  { id: "bs002", ten: "BS. Trần Thị Lan", chuyen_khoa: "Da liễu" },
  { id: "bs003", ten: "BS. Lê Minh Tâm", chuyen_khoa: "Sản phụ khoa" },
  { id: "bs004", ten: "BS. Trần Thị Mai", chuyen_khoa: "Hô hấp" },
  { id: "bs005", ten: "BS. Lê Hoàng Nam", chuyen_khoa: "Hô hấp" },
  { id: "bs006", ten: "BS. Phạm Thu Hà", chuyen_khoa: "Tim mạch" },
  { id: "bs007", ten: "BS. Đỗ Minh Tuấn", chuyen_khoa: "Da liễu" },
  { id: "bs008", ten: "BS. Vũ Thị Lan", chuyen_khoa: "Thần kinh" },
  { id: "bs009", ten: "BS. Hoàng Văn Đức", chuyen_khoa: "Nhi khoa" },
  { id: "bs010", ten: "BS. Ngô Thị Hương", chuyen_khoa: "Tim mạch" },
  { id: "bs011", ten: "BS. Nguyễn Thị Hoa", chuyen_khoa: "Tiêu hóa" },
  { id: "bs012", ten: "BS. Trần Văn Khoa", chuyen_khoa: "Cơ xương khớp" },
  { id: "bs013", ten: "BS. Phạm Minh Quân", chuyen_khoa: "Tai mũi họng" },
  { id: "bs014", ten: "BS. Lê Thị Hằng", chuyen_khoa: "Mắt" },
  { id: "bs015", ten: "BS. Nguyễn Văn Hải", chuyen_khoa: "Răng hàm mặt" },
  { id: "bs016", ten: "BS. Đặng Thị Thảo", chuyen_khoa: "Nội tiết" }
];

interface DoctorChatStatus {
  id: string;
  name: string;
  specialty: string;
  hasAuthUid: boolean;
  authUid?: string;
  hasUserAccount: boolean;
  canReceiveChat: boolean;
  issues: string[];
}

export default function QuickCheckAllDoctorsChat() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DoctorChatStatus[]>([]);
  const [summary, setSummary] = useState({ total: 0, ok: 0, broken: 0 });

  const checkAllDoctors = async () => {
    try {
      setLoading(true);
      setResults([]);
      
      console.log('🔍 Kiểm tra 16 bác sĩ...');
      
      const statuses: DoctorChatStatus[] = [];
      let okCount = 0;
      let brokenCount = 0;
      
      for (const doctor of DOCTORS_LIST) {
        console.log(`\n📋 Kiểm tra: ${doctor.ten} (${doctor.id})`);
        
        const issues: string[] = [];
        let hasAuthUid = false;
        let authUid = '';
        let hasUserAccount = false;
        
        // 1. Kiểm tra doctor document trong Firestore
        try {
          const doctorDoc = await getDocumentById('doctors', doctor.id);
          
          if (!doctorDoc) {
            console.log('  ❌ Không có doctor document trong Firestore');
            issues.push('Chưa import vào Firestore');
          } else {
            console.log('  ✅ Có doctor document');
            
            // Kiểm tra authUid
            authUid = (doctorDoc as any).authUid || '';
            if (!authUid) {
              console.log('  ❌ Thiếu authUid');
              issues.push('Thiếu authUid');
            } else {
              console.log(`  ✅ Có authUid: ${authUid}`);
              hasAuthUid = true;
            }
          }
        } catch (error) {
          console.log('  ❌ Lỗi khi lấy doctor doc:', error);
          issues.push('Lỗi truy cập Firestore');
        }
        
        // 2. Kiểm tra user account
        try {
          const users = await getDocumentsWithQuery('users', [
            where('role', '==', 'doctor'),
            where('doctorInfo.doctorId', '==', doctor.id)
          ]);
          
          if (users.length === 0) {
            console.log('  ❌ Không có user account');
            issues.push('Chưa tạo user account');
          } else {
            console.log(`  ✅ Có user account`);
            hasUserAccount = true;
            
            const userUid = (users[0] as any).uid;
            if (authUid && authUid !== userUid) {
              console.log('  ⚠️ authUid không khớp với user UID');
              issues.push(`authUid không khớp (doc: ${authUid}, user: ${userUid})`);
            }
          }
        } catch (error) {
          console.log('  ❌ Lỗi khi tìm user account:', error);
        }
        
        // 3. Đánh giá
        const canReceiveChat = hasAuthUid && hasUserAccount;
        
        if (canReceiveChat) {
          console.log('  ✅ CÓ THỂ nhận tin nhắn');
          okCount++;
        } else {
          console.log('  ❌ KHÔNG THỂ nhận tin nhắn');
          brokenCount++;
        }
        
        statuses.push({
          id: doctor.id,
          name: doctor.ten,
          specialty: doctor.chuyen_khoa,
          hasAuthUid,
          authUid,
          hasUserAccount,
          canReceiveChat,
          issues
        });
      }
      
      setResults(statuses);
      setSummary({
        total: DOCTORS_LIST.length,
        ok: okCount,
        broken: brokenCount
      });
      
      console.log('\n=== KẾT QUẢ ===');
      console.log(`Tổng: ${DOCTORS_LIST.length} bác sĩ`);
      console.log(`✅ OK: ${okCount} bác sĩ`);
      console.log(`❌ Broken: ${brokenCount} bác sĩ`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Lỗi:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra Chat 16 Bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Kiểm tra nhanh</Text>
            <Text style={styles.infoText}>
              Kiểm tra xem bác sĩ nào trong 16 bác sĩ có thể nhận tin nhắn từ bệnh nhân.
            </Text>
          </View>
        </View>

        {summary.total > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Tổng quan</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số:</Text>
              <Text style={styles.summaryValue}>{summary.total} bác sĩ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>✅ Hoạt động:</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{summary.ok} bác sĩ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>❌ Có vấn đề:</Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>{summary.broken} bác sĩ</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.checkButton, loading && styles.checkButtonDisabled]}
          onPress={checkAllDoctors}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.checkButtonText}>Đang kiểm tra...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.checkButtonText}>Kiểm tra ngay</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <>
            {/* Bác sĩ OK */}
            {results.filter(d => d.canReceiveChat).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ Hoạt động tốt ({results.filter(d => d.canReceiveChat).length})</Text>
                {results.filter(d => d.canReceiveChat).map((doctor) => (
                  <View key={doctor.id} style={[styles.card, styles.cardSuccess]}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{doctor.name}</Text>
                        <Text style={styles.cardSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.cardId}>{doctor.id}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Bác sĩ có vấn đề */}
            {results.filter(d => !d.canReceiveChat).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>❌ Có vấn đề ({results.filter(d => !d.canReceiveChat).length})</Text>
                {results.filter(d => !d.canReceiveChat).map((doctor) => (
                  <View key={doctor.id} style={[styles.card, styles.cardError]}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{doctor.name}</Text>
                        <Text style={styles.cardSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.cardId}>{doctor.id}</Text>
                      </View>
                    </View>
                    {doctor.issues.length > 0 && (
                      <View style={styles.issuesBox}>
                        <Text style={styles.issuesTitle}>Vấn đề:</Text>
                        {doctor.issues.map((issue, i) => (
                          <Text key={i} style={styles.issueText}>• {issue}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Hướng dẫn sửa */}
            {summary.broken > 0 && (
              <View style={styles.fixCard}>
                <Ionicons name="construct" size={24} color="#FF9800" />
                <View style={styles.fixContent}>
                  <Text style={styles.fixTitle}>🔧 Cần sửa</Text>
                  <Text style={styles.fixText}>
                    Có {summary.broken} bác sĩ không thể nhận tin nhắn.
                  </Text>
                  <Text style={styles.fixStep}>1️⃣ Chạy: fix-doctor-auth-uid.tsx</Text>
                  <Text style={styles.fixStep}>2️⃣ Chạy: fix-conversations-auth-uid.tsx</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00838F',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#00838F',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  checkButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardSuccess: {
    borderLeftColor: '#4CAF50',
  },
  cardError: {
    borderLeftColor: '#F44336',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSpecialty: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  cardId: {
    fontSize: 12,
    color: '#94a3b8',
  },
  issuesBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  issuesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 6,
  },
  issueText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 4,
  },
  fixCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  fixContent: {
    flex: 1,
  },
  fixTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  fixText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 8,
  },
  fixStep: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 4,
  },
});
