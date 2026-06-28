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
import { getDocumentsWithQuery } from './services/firebaseService';

interface DoctorStatus {
  id: string;
  name: string;
  specialty: string;
  hasAuthUid: boolean;
  authUid?: string;
  hasUserAccount: boolean;
  userAccountUid?: string;
  canReceiveMessages: boolean;
  issues: string[];
}

export default function CheckAllDoctorsChatStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorStatus[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    working: 0,
    broken: 0,
    noAuthUid: 0,
    noUserAccount: 0,
  });

  const checkAllDoctors = async () => {
    try {
      setLoading(true);
      setDoctors([]);
      
      console.log('🔍 Checking all doctors...');
      
      // 1. Lấy tất cả doctors
      const allDoctors = await getDocumentsWithQuery('doctors', []);
      console.log(`Found ${allDoctors.length} doctors`);
      
      const results: DoctorStatus[] = [];
      let working = 0;
      let broken = 0;
      let noAuthUid = 0;
      let noUserAccount = 0;
      
      for (const doctor of allDoctors) {
        const doctorId = doctor.id;
        const doctorName = (doctor as any).ten || 'Unknown';
        const specialty = (doctor as any).chuyen_khoa || 'Unknown';
        const authUid = (doctor as any).authUid;
        
        const issues: string[] = [];
        let hasUserAccount = false;
        let userAccountUid = '';
        
        console.log(`\nChecking: ${doctorName} (${doctorId})`);
        
        // 2. Kiểm tra authUid
        if (!authUid) {
          console.log('  ❌ No authUid');
          issues.push('Thiếu authUid trong doctor document');
          noAuthUid++;
        } else {
          console.log(`  ✅ Has authUid: ${authUid}`);
        }
        
        // 3. Tìm user account
        const users = await getDocumentsWithQuery('users', [
          where('role', '==', 'doctor'),
          where('doctorInfo.doctorId', '==', doctorId)
        ]);
        
        if (users.length === 0) {
          console.log('  ❌ No user account');
          issues.push('Không có user account');
          noUserAccount++;
        } else {
          hasUserAccount = true;
          userAccountUid = (users[0] as any).uid;
          console.log(`  ✅ Has user account: ${userAccountUid}`);
          
          // 4. Kiểm tra authUid có khớp không
          if (authUid && authUid !== userAccountUid) {
            console.log('  ⚠️ authUid mismatch!');
            issues.push(`authUid không khớp (doc: ${authUid}, user: ${userAccountUid})`);
          }
        }
        
        // 5. Đánh giá trạng thái
        const canReceiveMessages = authUid && hasUserAccount && authUid === userAccountUid;
        
        if (canReceiveMessages) {
          working++;
          console.log('  ✅ CAN receive messages');
        } else {
          broken++;
          console.log('  ❌ CANNOT receive messages');
        }
        
        results.push({
          id: doctorId,
          name: doctorName,
          specialty,
          hasAuthUid: !!authUid,
          authUid,
          hasUserAccount,
          userAccountUid,
          canReceiveMessages,
          issues,
        });
      }
      
      setDoctors(results);
      setStats({
        total: allDoctors.length,
        working,
        broken,
        noAuthUid,
        noUserAccount,
      });
      
      console.log('\n=== SUMMARY ===');
      console.log(`Total: ${allDoctors.length}`);
      console.log(`Working: ${working}`);
      console.log(`Broken: ${broken}`);
      console.log(`No authUid: ${noAuthUid}`);
      console.log(`No user account: ${noUserAccount}`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra Chat Bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Kiểm tra tất cả bác sĩ xem bác sĩ nào có thể nhận tin nhắn và bác sĩ nào không.
            </Text>
          </View>
        </View>

        {stats.total > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Tổng số bác sĩ:</Text>
              <Text style={styles.statsValue}>{stats.total}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Hoạt động tốt:</Text>
              <Text style={[styles.statsValue, styles.statsSuccess]}>{stats.working}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Có vấn đề:</Text>
              <Text style={[styles.statsValue, styles.statsError]}>{stats.broken}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Thiếu authUid:</Text>
              <Text style={[styles.statsValue, styles.statsWarning]}>{stats.noAuthUid}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Thiếu user account:</Text>
              <Text style={[styles.statsValue, styles.statsWarning]}>{stats.noUserAccount}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={checkAllDoctors}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang kiểm tra...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.buttonText}>Kiểm tra tất cả</Text>
            </>
          )}
        </TouchableOpacity>

        {doctors.length > 0 && (
          <View style={styles.doctorsSection}>
            <Text style={styles.sectionTitle}>Danh sách bác sĩ</Text>
            
            {/* Bác sĩ hoạt động tốt */}
            {doctors.filter(d => d.canReceiveMessages).length > 0 && (
              <>
                <Text style={styles.categoryTitle}>✅ Hoạt động tốt ({doctors.filter(d => d.canReceiveMessages).length})</Text>
                {doctors.filter(d => d.canReceiveMessages).map((doctor, index) => (
                  <View key={index} style={[styles.doctorCard, styles.doctorCardSuccess]}>
                    <View style={styles.doctorHeader}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.doctorId}>ID: {doctor.id}</Text>
                      </View>
                    </View>
                    <View style={styles.doctorDetails}>
                      <Text style={styles.detailText}>✅ Có authUid</Text>
                      <Text style={styles.detailText}>✅ Có user account</Text>
                      <Text style={styles.detailText}>✅ Có thể nhận tin nhắn</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
            
            {/* Bác sĩ có vấn đề */}
            {doctors.filter(d => !d.canReceiveMessages).length > 0 && (
              <>
                <Text style={styles.categoryTitle}>❌ Có vấn đề ({doctors.filter(d => !d.canReceiveMessages).length})</Text>
                {doctors.filter(d => !d.canReceiveMessages).map((doctor, index) => (
                  <View key={index} style={[styles.doctorCard, styles.doctorCardError]}>
                    <View style={styles.doctorHeader}>
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.doctorId}>ID: {doctor.id}</Text>
                      </View>
                    </View>
                    <View style={styles.doctorDetails}>
                      <Text style={styles.detailText}>
                        {doctor.hasAuthUid ? '✅' : '❌'} authUid: {doctor.authUid || 'KHÔNG CÓ'}
                      </Text>
                      <Text style={styles.detailText}>
                        {doctor.hasUserAccount ? '✅' : '❌'} User account: {doctor.userAccountUid || 'KHÔNG CÓ'}
                      </Text>
                      {doctor.issues.length > 0 && (
                        <View style={styles.issuesContainer}>
                          <Text style={styles.issuesTitle}>Vấn đề:</Text>
                          {doctor.issues.map((issue, i) => (
                            <Text key={i} style={styles.issueText}>• {issue}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {stats.broken > 0 && (
          <View style={styles.fixCard}>
            <Ionicons name="build" size={24} color="#FF9800" />
            <View style={styles.fixContent}>
              <Text style={styles.fixTitle}>Cần sửa lỗi</Text>
              <Text style={styles.fixText}>
                Có {stats.broken} bác sĩ không thể nhận tin nhắn. Hãy chạy các script sau:
              </Text>
              <Text style={styles.fixText}>1. fix-doctor-auth-uid.tsx</Text>
              <Text style={styles.fixText}>2. fix-conversations-auth-uid.tsx</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
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
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statsSuccess: {
    color: '#4CAF50',
  },
  statsError: {
    color: '#F44336',
  },
  statsWarning: {
    color: '#FF9800',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doctorsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  doctorCardSuccess: {
    borderLeftColor: '#4CAF50',
  },
  doctorCardError: {
    borderLeftColor: '#F44336',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  doctorId: {
    fontSize: 12,
    color: '#999',
  },
  doctorDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  issuesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  issuesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 2,
  },
  fixCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 4,
  },
});
