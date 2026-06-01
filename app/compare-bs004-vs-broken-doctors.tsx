import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
import { db } from './config/firebase';

interface DoctorComparison {
  id: string;
  name: string;
  authUid: string | null;
  userAccountUid: string | null;
  conversationsCount: number;
  conversationsByDoctorId: number;
  conversationsByAuthUid: number;
  messagesCount: number;
  hasConversations: boolean;
  differences: string[];
}

export default function CompareBs004VsBrokenDoctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workingDoctor, setWorkingDoctor] = useState<DoctorComparison | null>(null);
  const [brokenDoctors, setBrokenDoctors] = useState<DoctorComparison[]>([]);

  const analyzeDoctorData = async (doctorId: string): Promise<DoctorComparison> => {
    console.log(`\n🔍 Analyzing ${doctorId}...`);
    
    // 1. Lấy doctor document
    const doctorDoc = await getDocs(query(collection(db, 'doctors'), where('id', '==', doctorId)));
    const doctorData = doctorDoc.docs[0]?.data();
    const doctorName = doctorData?.ten || 'Unknown';
    const authUid = doctorData?.authUid || null;
    
    console.log(`Doctor: ${doctorName}`);
    console.log(`authUid: ${authUid || 'KHÔNG CÓ'}`);
    
    // 2. Tìm user account
    let userAccountUid = null;
    const userQuery = query(
      collection(db, 'users'),
      where('role', '==', 'doctor'),
      where('doctorInfo.doctorId', '==', doctorId)
    );
    const userDocs = await getDocs(userQuery);
    if (userDocs.docs.length > 0) {
      userAccountUid = userDocs.docs[0].data().uid;
      console.log(`User account UID: ${userAccountUid}`);
    } else {
      console.log('User account: KHÔNG CÓ');
    }
    
    // 3. Đếm conversations theo doctorId
    const convByDoctorIdQuery = query(
      collection(db, 'conversations'),
      where('doctorId', '==', doctorId)
    );
    const convByDoctorId = await getDocs(convByDoctorIdQuery);
    console.log(`Conversations (doctorId): ${convByDoctorId.size}`);
    
    // 4. Đếm conversations theo doctorAuthUid
    let convByAuthUid = { size: 0 };
    if (authUid) {
      const convByAuthUidQuery = query(
        collection(db, 'conversations'),
        where('doctorAuthUid', '==', authUid)
      );
      convByAuthUid = await getDocs(convByAuthUidQuery);
      console.log(`Conversations (doctorAuthUid): ${convByAuthUid.size}`);
    }
    
    // 5. Đếm messages
    const messagesQuery = query(
      collection(db, 'messages'),
      where('doctorId', '==', doctorId)
    );
    const messages = await getDocs(messagesQuery);
    console.log(`Messages: ${messages.size}`);
    
    const totalConversations = Math.max(convByDoctorId.size, convByAuthUid.size);
    
    return {
      id: doctorId,
      name: doctorName,
      authUid,
      userAccountUid,
      conversationsCount: totalConversations,
      conversationsByDoctorId: convByDoctorId.size,
      conversationsByAuthUid: convByAuthUid.size,
      messagesCount: messages.size,
      hasConversations: totalConversations > 0,
      differences: [],
    };
  };

  const compareAndFindDifferences = (
    working: DoctorComparison,
    broken: DoctorComparison
  ): string[] => {
    const diffs: string[] = [];
    
    // So sánh authUid
    if (working.authUid && !broken.authUid) {
      diffs.push('❌ Thiếu authUid trong doctor document');
    } else if (working.authUid && broken.authUid) {
      diffs.push('✅ Có authUid');
    }
    
    // So sánh user account
    if (working.userAccountUid && !broken.userAccountUid) {
      diffs.push('❌ Thiếu user account');
    } else if (working.userAccountUid && broken.userAccountUid) {
      diffs.push('✅ Có user account');
    }
    
    // So sánh authUid khớp
    if (working.authUid === working.userAccountUid && broken.authUid !== broken.userAccountUid) {
      diffs.push('❌ authUid không khớp với user account UID');
    } else if (broken.authUid === broken.userAccountUid) {
      diffs.push('✅ authUid khớp với user account UID');
    }
    
    // So sánh conversations
    if (working.hasConversations && !broken.hasConversations) {
      diffs.push(`❌ Không có conversations (working có ${working.conversationsCount})`);
    } else if (broken.hasConversations) {
      diffs.push(`✅ Có ${broken.conversationsCount} conversations`);
    }
    
    // So sánh messages
    if (working.messagesCount > 0 && broken.messagesCount === 0) {
      diffs.push(`❌ Không có messages (working có ${working.messagesCount})`);
    } else if (broken.messagesCount > 0 && broken.conversationsCount === 0) {
      diffs.push(`⚠️ Có ${broken.messagesCount} messages nhưng 0 conversations!`);
    } else if (broken.messagesCount > 0) {
      diffs.push(`✅ Có ${broken.messagesCount} messages`);
    }
    
    return diffs;
  };

  const runComparison = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting comparison...');
      
      // Phân tích BS. Trần Thị Mai (bs004) - bác sĩ hoạt động tốt
      const bs004 = await analyzeDoctorData('bs004');
      setWorkingDoctor(bs004);
      
      // Phân tích 3 bác sĩ không hoạt động
      const bs001 = await analyzeDoctorData('bs001');
      const bs002 = await analyzeDoctorData('bs002');
      const bs007 = await analyzeDoctorData('bs007');
      
      // Tìm sự khác biệt
      bs001.differences = compareAndFindDifferences(bs004, bs001);
      bs002.differences = compareAndFindDifferences(bs004, bs002);
      bs007.differences = compareAndFindDifferences(bs004, bs007);
      
      setBrokenDoctors([bs001, bs002, bs007]);
      
      console.log('\n✅ Comparison complete!');
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
        <Text style={styles.headerTitle}>So sánh BS004 vs Broken</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              So sánh BS. Trần Thị Mai (bs004) - bác sĩ hoạt động tốt với 3 bác sĩ không hoạt động để tìm sự khác biệt.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runComparison}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang so sánh...</Text>
            </>
          ) : (
            <>
              <Ionicons name="git-compare" size={20} color="#fff" />
              <Text style={styles.buttonText}>Bắt đầu so sánh</Text>
            </>
          )}
        </TouchableOpacity>

        {workingDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Bác sĩ hoạt động tốt</Text>
            <View style={[styles.doctorCard, styles.workingCard]}>
              <Text style={styles.doctorName}>{workingDoctor.name}</Text>
              <Text style={styles.doctorId}>ID: {workingDoctor.id}</Text>
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>authUid:</Text>
                  <Text style={styles.detailValue}>{workingDoctor.authUid || 'KHÔNG CÓ'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>User UID:</Text>
                  <Text style={styles.detailValue}>{workingDoctor.userAccountUid || 'KHÔNG CÓ'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Khớp:</Text>
                  <Text style={[styles.detailValue, workingDoctor.authUid === workingDoctor.userAccountUid ? styles.success : styles.error]}>
                    {workingDoctor.authUid === workingDoctor.userAccountUid ? '✅ CÓ' : '❌ KHÔNG'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Conversations:</Text>
                  <Text style={styles.detailValue}>{workingDoctor.conversationsCount}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Messages:</Text>
                  <Text style={styles.detailValue}>{workingDoctor.messagesCount}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {brokenDoctors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ Bác sĩ không hoạt động</Text>
            {brokenDoctors.map((doctor, index) => (
              <View key={index} style={[styles.doctorCard, styles.brokenCard]}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorId}>ID: {doctor.id}</Text>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>authUid:</Text>
                    <Text style={styles.detailValue}>{doctor.authUid || '❌ KHÔNG CÓ'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>User UID:</Text>
                    <Text style={styles.detailValue}>{doctor.userAccountUid || '❌ KHÔNG CÓ'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Khớp:</Text>
                    <Text style={[styles.detailValue, doctor.authUid === doctor.userAccountUid ? styles.success : styles.error]}>
                      {doctor.authUid === doctor.userAccountUid ? '✅ CÓ' : '❌ KHÔNG'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Conversations:</Text>
                    <Text style={styles.detailValue}>{doctor.conversationsCount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Messages:</Text>
                    <Text style={styles.detailValue}>{doctor.messagesCount}</Text>
                  </View>
                </View>

                {doctor.differences.length > 0 && (
                  <View style={styles.differencesContainer}>
                    <Text style={styles.differencesTitle}>Sự khác biệt so với BS004:</Text>
                    {doctor.differences.map((diff, i) => (
                      <Text key={i} style={styles.differenceText}>{diff}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {workingDoctor && brokenDoctors.length > 0 && (
          <View style={styles.conclusionCard}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <View style={styles.conclusionContent}>
              <Text style={styles.conclusionTitle}>Kết luận</Text>
              <Text style={styles.conclusionText}>
                Nếu tất cả bác sĩ đều có authUid và user account khớp nhưng vẫn có 0 conversations, 
                vấn đề là <Text style={styles.bold}>Firestore Rules chưa được deploy</Text>.
              </Text>
              <Text style={styles.conclusionText}>
                Conversations đã bị xóa hoặc không thể tạo vì rules chặn.
              </Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  workingCard: {
    borderLeftColor: '#4CAF50',
  },
  brokenCard: {
    borderLeftColor: '#F44336',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  doctorId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  detailsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  success: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  error: {
    color: '#F44336',
    fontWeight: '600',
  },
  differencesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  differencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  differenceText: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 4,
    lineHeight: 18,
  },
  conclusionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  conclusionContent: {
    flex: 1,
  },
  conclusionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  conclusionText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
});
