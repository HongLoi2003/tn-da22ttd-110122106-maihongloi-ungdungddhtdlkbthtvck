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

interface DoctorDebugInfo {
  doctorId: string;
  doctorName: string;
  hasAuthUid: boolean;
  authUid?: string;
  hasUserAccount: boolean;
  userAccountUid?: string;
  conversationsFound: number;
  conversationsByDoctorId: number;
  conversationsByAuthUid: number;
  conversationDetails: any[];
  messagesCount: number;
  issues: string[];
}

export default function DebugSpecificDoctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DoctorDebugInfo[]>([]);

  // 3 bác sĩ cần kiểm tra
  const doctorsToCheck = [
    { id: 'bs001', name: 'BS. Nguyễn Văn An' },
    { id: 'bs002', name: 'BS. Trần Thị Lan' },
    { id: 'bs007', name: 'BS. Đỗ Minh Tuấn' },
  ];

  const debugDoctors = async () => {
    try {
      setLoading(true);
      setResults([]);
      
      console.log('=== DEBUG 3 BÁC SĨ CỤ THỂ ===');
      
      const debugResults: DoctorDebugInfo[] = [];
      
      for (const doctor of doctorsToCheck) {
        console.log(`\n========================================`);
        console.log(`Checking: ${doctor.name} (${doctor.id})`);
        console.log(`========================================`);
        
        const issues: string[] = [];
        let authUid = '';
        let hasUserAccount = false;
        let userAccountUid = '';
        
        // 1. Lấy thông tin doctor document
        const { getDocumentById } = await import('./services/firebaseService');
        const doctorDoc = await getDocumentById('doctors', doctor.id);
        
        if (!doctorDoc) {
          console.log('❌ Doctor document NOT FOUND');
          issues.push('Doctor document không tồn tại');
          continue;
        }
        
        console.log('✅ Doctor document found');
        console.log('Doctor data:', doctorDoc);
        
        // 2. Kiểm tra authUid
        authUid = (doctorDoc as any).authUid || '';
        if (!authUid) {
          console.log('❌ No authUid in doctor document');
          issues.push('Thiếu authUid trong doctor document');
        } else {
          console.log(`✅ authUid: ${authUid}`);
        }
        
        // 3. Tìm user account
        const users = await getDocumentsWithQuery('users', [
          where('role', '==', 'doctor'),
          where('doctorInfo.doctorId', '==', doctor.id)
        ]);
        
        if (users.length === 0) {
          console.log('❌ No user account found');
          issues.push('Không có user account');
        } else {
          hasUserAccount = true;
          userAccountUid = (users[0] as any).uid;
          console.log(`✅ User account found: ${userAccountUid}`);
          console.log('User data:', users[0]);
          
          // Kiểm tra authUid có khớp không
          if (authUid && authUid !== userAccountUid) {
            console.log('⚠️ authUid MISMATCH!');
            console.log(`  Doctor doc authUid: ${authUid}`);
            console.log(`  User account UID: ${userAccountUid}`);
            issues.push(`authUid không khớp (doc: ${authUid}, user: ${userAccountUid})`);
          }
        }
        
        // 4. Query conversations theo 3 cách
        console.log('\n--- QUERYING CONVERSATIONS ---');
        
        // Query 1: Theo doctorId
        console.log(`Query 1: doctorId == ${doctor.id}`);
        const convsByDoctorId = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', doctor.id)
        ]);
        console.log(`Found: ${convsByDoctorId.length} conversations`);
        
        // Query 2: Theo doctorAuthUid
        let convsByAuthUid: any[] = [];
        if (authUid) {
          console.log(`Query 2: doctorAuthUid == ${authUid}`);
          convsByAuthUid = await getDocumentsWithQuery('conversations', [
            where('doctorAuthUid', '==', authUid)
          ]);
          console.log(`Found: ${convsByAuthUid.length} conversations`);
        }
        
        // Query 3: Theo user UID (fallback)
        let convsByUserUid: any[] = [];
        if (userAccountUid) {
          console.log(`Query 3: doctorId == ${userAccountUid}`);
          convsByUserUid = await getDocumentsWithQuery('conversations', [
            where('doctorId', '==', userAccountUid)
          ]);
          console.log(`Found: ${convsByUserUid.length} conversations`);
        }
        
        // Merge và loại bỏ duplicate
        const convMap = new Map();
        [...convsByDoctorId, ...convsByAuthUid, ...convsByUserUid].forEach(conv => {
          if (!convMap.has(conv.id)) {
            convMap.set(conv.id, conv);
          }
        });
        
        const allConversations = Array.from(convMap.values());
        console.log(`\nTotal unique conversations: ${allConversations.length}`);
        
        // 5. Kiểm tra chi tiết từng conversation
        const conversationDetails: any[] = [];
        let totalMessages = 0;
        
        for (const conv of allConversations) {
          console.log(`\n  Conversation: ${conv.id}`);
          console.log(`    Patient: ${(conv as any).patientName}`);
          console.log(`    doctorId: ${(conv as any).doctorId}`);
          console.log(`    doctorAuthUid: ${(conv as any).doctorAuthUid || 'MISSING'}`);
          console.log(`    lastMessage: ${(conv as any).lastMessage}`);
          console.log(`    doctorUnreadCount: ${(conv as any).doctorUnreadCount || 0}`);
          
          // Đếm số tin nhắn
          const messages = await getDocumentsWithQuery('messages', [
            where('conversationId', '==', conv.id)
          ]);
          console.log(`    Messages: ${messages.length}`);
          totalMessages += messages.length;
          
          conversationDetails.push({
            id: conv.id,
            patientName: (conv as any).patientName,
            doctorId: (conv as any).doctorId,
            doctorAuthUid: (conv as any).doctorAuthUid,
            lastMessage: (conv as any).lastMessage,
            unreadCount: (conv as any).doctorUnreadCount || 0,
            messagesCount: messages.length,
          });
          
          // Kiểm tra vấn đề
          if (!(conv as any).doctorAuthUid) {
            issues.push(`Conversation ${conv.id} thiếu doctorAuthUid`);
          }
          if ((conv as any).doctorAuthUid && authUid && (conv as any).doctorAuthUid !== authUid) {
            issues.push(`Conversation ${conv.id} có doctorAuthUid sai`);
          }
        }
        
        // 6. Tổng kết
        console.log('\n--- SUMMARY ---');
        console.log(`Total conversations: ${allConversations.length}`);
        console.log(`Total messages: ${totalMessages}`);
        console.log(`Issues: ${issues.length}`);
        
        if (allConversations.length === 0 && totalMessages > 0) {
          issues.push('Có tin nhắn nhưng không tìm thấy conversation');
        }
        
        debugResults.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          hasAuthUid: !!authUid,
          authUid,
          hasUserAccount,
          userAccountUid,
          conversationsFound: allConversations.length,
          conversationsByDoctorId: convsByDoctorId.length,
          conversationsByAuthUid: convsByAuthUid.length,
          conversationDetails,
          messagesCount: totalMessages,
          issues,
        });
      }
      
      setResults(debugResults);
      setLoading(false);
      
      console.log('\n=== DEBUG COMPLETED ===');
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
        <Text style={styles.headerTitle}>Debug 3 Bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="bug" size={24} color="#FF9800" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Debug Chi Tiết</Text>
            <Text style={styles.infoText}>
              Kiểm tra 3 bác sĩ: Nguyễn Văn An, Trần Thị Lan, Đỗ Minh Tuấn
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={debugDoctors}
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
              <Text style={styles.buttonText}>Bắt đầu Debug</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Kết quả Debug</Text>
            
            {results.map((result, index) => (
              <View key={index} style={styles.doctorCard}>
                <View style={styles.doctorHeader}>
                  <Ionicons 
                    name={result.issues.length === 0 ? "checkmark-circle" : "warning"} 
                    size={24} 
                    color={result.issues.length === 0 ? "#4CAF50" : "#FF9800"} 
                  />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{result.doctorName}</Text>
                    <Text style={styles.doctorId}>ID: {result.doctorId}</Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsTitle}>Thông tin cơ bản:</Text>
                  <Text style={styles.detailText}>
                    {result.hasAuthUid ? '✅' : '❌'} authUid: {result.authUid || 'KHÔNG CÓ'}
                  </Text>
                  <Text style={styles.detailText}>
                    {result.hasUserAccount ? '✅' : '❌'} User account: {result.userAccountUid || 'KHÔNG CÓ'}
                  </Text>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsTitle}>Conversations:</Text>
                  <Text style={styles.detailText}>
                    Tổng số: {result.conversationsFound}
                  </Text>
                  <Text style={styles.detailText}>
                    Theo doctorId: {result.conversationsByDoctorId}
                  </Text>
                  <Text style={styles.detailText}>
                    Theo doctorAuthUid: {result.conversationsByAuthUid}
                  </Text>
                  <Text style={styles.detailText}>
                    Tổng tin nhắn: {result.messagesCount}
                  </Text>
                </View>

                {result.conversationDetails.length > 0 && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Chi tiết conversations:</Text>
                    {result.conversationDetails.map((conv, i) => (
                      <View key={i} style={styles.convCard}>
                        <Text style={styles.convText}>Bệnh nhân: {conv.patientName}</Text>
                        <Text style={styles.convText}>ID: {conv.id}</Text>
                        <Text style={styles.convText}>
                          doctorAuthUid: {conv.doctorAuthUid || '❌ THIẾU'}
                        </Text>
                        <Text style={styles.convText}>Tin nhắn: {conv.messagesCount}</Text>
                        <Text style={styles.convText}>Chưa đọc: {conv.unreadCount}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.issues.length > 0 && (
                  <View style={styles.issuesSection}>
                    <Text style={styles.issuesTitle}>⚠️ Vấn đề phát hiện:</Text>
                    {result.issues.map((issue, i) => (
                      <Text key={i} style={styles.issueText}>• {issue}</Text>
                    ))}
                  </View>
                )}

                {result.issues.length === 0 && (
                  <View style={styles.successSection}>
                    <Text style={styles.successText}>✅ Không có vấn đề</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.instructionCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <View style={styles.instructionContent}>
            <Text style={styles.instructionTitle}>Hướng dẫn sửa lỗi</Text>
            <Text style={styles.instructionText}>
              1. Nếu thiếu authUid → Chạy fix-doctor-auth-uid.tsx
            </Text>
            <Text style={styles.instructionText}>
              2. Nếu conversation thiếu doctorAuthUid → Chạy fix-conversations-auth-uid.tsx
            </Text>
            <Text style={styles.instructionText}>
              3. Nếu authUid không khớp → Cần sửa thủ công trong Firebase
            </Text>
          </View>
        </View>
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
    backgroundColor: '#FFF3E0',
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
    color: '#E65100',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
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
  resultsSection: {
    marginBottom: 16,
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
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  doctorId: {
    fontSize: 12,
    color: '#999',
  },
  detailsSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  convCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#00BCD4',
  },
  convText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  issuesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 13,
    color: '#C62828',
    marginBottom: 4,
  },
  successSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#1565C0',
    marginBottom: 4,
  },
});
