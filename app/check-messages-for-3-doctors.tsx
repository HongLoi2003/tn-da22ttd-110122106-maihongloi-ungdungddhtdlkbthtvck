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

interface DoctorMessages {
  doctorId: string;
  doctorName: string;
  authUid: string;
  totalMessages: number;
  messagesByConversation: Map<string, any[]>;
  conversationsInDb: any[];
  issues: string[];
}

export default function CheckMessagesFor3Doctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DoctorMessages[]>([]);

  const doctorsToCheck = [
    { id: 'bs001', name: 'BS. Nguyễn Văn An', authUid: '437y6IoqBNaUcH0Rf4MdXnM5RlE3' },
    { id: 'bs002', name: 'BS. Trần Thị Lan', authUid: 'gKFSZDMWCbS8LAty40cmwdJHgag2' },
    { id: 'bs007', name: 'BS. Đỗ Minh Tuấn', authUid: 'E1Nluyx4RzMsSLq7INK1YPZ13U82' },
  ];

  const checkMessages = async () => {
    try {
      setLoading(true);
      setResults([]);
      
      console.log('=== CHECKING MESSAGES FOR 3 DOCTORS ===');
      
      const allResults: DoctorMessages[] = [];
      
      for (const doctor of doctorsToCheck) {
        console.log(`\n========================================`);
        console.log(`Checking: ${doctor.name}`);
        console.log(`Doctor ID: ${doctor.id}`);
        console.log(`Auth UID: ${doctor.authUid}`);
        console.log(`========================================`);
        
        const issues: string[] = [];
        
        // 1. Tìm TẤT CẢ messages liên quan đến bác sĩ này
        console.log('\n--- SEARCHING FOR MESSAGES ---');
        
        // Tìm messages theo senderId (bác sĩ gửi)
        console.log('Query 1: Messages sent BY doctor (senderId == authUid)');
        const messagesSentByDoctor = await getDocumentsWithQuery('messages', [
          where('senderId', '==', doctor.authUid),
          where('senderType', '==', 'doctor')
        ]);
        console.log(`Found: ${messagesSentByDoctor.length} messages`);
        
        // Tìm messages theo senderId (bác sĩ gửi) - fallback với doctorId
        console.log('Query 2: Messages sent BY doctor (senderId == doctorId)');
        const messagesSentByDoctorId = await getDocumentsWithQuery('messages', [
          where('senderId', '==', doctor.id),
          where('senderType', '==', 'doctor')
        ]);
        console.log(`Found: ${messagesSentByDoctorId.length} messages`);
        
        // 2. Tìm conversations liên quan đến bác sĩ
        console.log('\n--- SEARCHING FOR CONVERSATIONS ---');
        
        console.log('Query 1: Conversations by doctorId');
        const convsByDoctorId = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', doctor.id)
        ]);
        console.log(`Found: ${convsByDoctorId.length} conversations`);
        
        console.log('Query 2: Conversations by doctorAuthUid');
        const convsByAuthUid = await getDocumentsWithQuery('conversations', [
          where('doctorAuthUid', '==', doctor.authUid)
        ]);
        console.log(`Found: ${convsByAuthUid.length} conversations`);
        
        // Merge conversations
        const convMap = new Map();
        [...convsByDoctorId, ...convsByAuthUid].forEach(conv => {
          if (!convMap.has(conv.id)) {
            convMap.set(conv.id, conv);
          }
        });
        const allConversations = Array.from(convMap.values());
        console.log(`Total unique conversations: ${allConversations.length}`);
        
        // 3. Lấy TẤT CẢ conversationIds từ conversations
        const conversationIds = allConversations.map(c => c.id);
        console.log('Conversation IDs:', conversationIds);
        
        // 4. Tìm messages trong các conversations này
        console.log('\n--- SEARCHING FOR MESSAGES IN CONVERSATIONS ---');
        const messagesByConv = new Map<string, any[]>();
        let totalMessagesInConvs = 0;
        
        for (const convId of conversationIds) {
          const messages = await getDocumentsWithQuery('messages', [
            where('conversationId', '==', convId)
          ]);
          console.log(`Conversation ${convId}: ${messages.length} messages`);
          messagesByConv.set(convId, messages);
          totalMessagesInConvs += messages.length;
        }
        
        console.log(`Total messages in conversations: ${totalMessagesInConvs}`);
        
        // 5. Tìm messages KHÔNG THUỘC bất kỳ conversation nào
        console.log('\n--- SEARCHING FOR ORPHAN MESSAGES ---');
        const allMessages = await getDocumentsWithQuery('messages', []);
        console.log(`Total messages in database: ${allMessages.length}`);
        
        const orphanMessages: any[] = [];
        for (const msg of allMessages) {
          const convId = (msg as any).conversationId;
          
          // Kiểm tra xem message có liên quan đến bác sĩ này không
          const senderId = (msg as any).senderId;
          const senderType = (msg as any).senderType;
          
          // Message từ bác sĩ
          if (senderType === 'doctor' && (senderId === doctor.authUid || senderId === doctor.id)) {
            // Kiểm tra conversation có tồn tại không
            if (!conversationIds.includes(convId)) {
              console.log(`Found orphan message: ${msg.id} in conversation ${convId}`);
              orphanMessages.push(msg);
            }
          }
          
          // Message GỬI ĐẾN bác sĩ (từ patient)
          if (senderType === 'patient') {
            // Kiểm tra conversation có doctorId hoặc doctorAuthUid khớp không
            const conv = allConversations.find(c => c.id === convId);
            if (!conv) {
              // Conversation không tồn tại, kiểm tra xem có phải gửi đến bác sĩ này không
              // Cần query conversation từ conversationId
              const convs = await getDocumentsWithQuery('conversations', [
                where('__name__', '==', convId)
              ]);
              
              if (convs.length > 0) {
                const c = convs[0];
                if ((c as any).doctorId === doctor.id || (c as any).doctorAuthUid === doctor.authUid) {
                  console.log(`Found message TO doctor in existing conversation: ${msg.id}`);
                  // Conversation tồn tại nhưng không được query ra
                  issues.push(`Conversation ${convId} tồn tại nhưng không được query ra`);
                }
              } else {
                // Conversation thực sự không tồn tại
                console.log(`Found orphan message TO doctor: ${msg.id} in missing conversation ${convId}`);
                orphanMessages.push(msg);
              }
            }
          }
        }
        
        console.log(`Found ${orphanMessages.length} orphan messages`);
        
        // 6. Phân tích vấn đề
        if (allConversations.length === 0 && orphanMessages.length > 0) {
          issues.push(`Có ${orphanMessages.length} tin nhắn nhưng không có conversation`);
        }
        
        if (allConversations.length > 0 && totalMessagesInConvs === 0) {
          issues.push(`Có ${allConversations.length} conversations nhưng không có tin nhắn`);
        }
        
        // 7. Tổng kết
        console.log('\n--- SUMMARY ---');
        console.log(`Conversations: ${allConversations.length}`);
        console.log(`Messages in conversations: ${totalMessagesInConvs}`);
        console.log(`Orphan messages: ${orphanMessages.length}`);
        console.log(`Issues: ${issues.length}`);
        
        allResults.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          authUid: doctor.authUid,
          totalMessages: totalMessagesInConvs + orphanMessages.length,
          messagesByConversation: messagesByConv,
          conversationsInDb: allConversations,
          issues,
        });
      }
      
      setResults(allResults);
      setLoading(false);
      
      console.log('\n=== CHECK COMPLETED ===');
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
        <Text style={styles.headerTitle}>Kiểm tra Tin nhắn 3 BS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="search" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Kiểm tra Chi Tiết</Text>
            <Text style={styles.infoText}>
              Tìm tất cả tin nhắn và conversations liên quan đến 3 bác sĩ: Nguyễn Văn An, Trần Thị Lan, Đỗ Minh Tuấn
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={checkMessages}
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
              <Text style={styles.buttonText}>Kiểm tra Tin nhắn</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsSection}>
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

                <View style={styles.statsSection}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Conversations:</Text>
                    <Text style={styles.statValue}>{result.conversationsInDb.length}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Tổng tin nhắn:</Text>
                    <Text style={styles.statValue}>{result.totalMessages}</Text>
                  </View>
                </View>

                {result.conversationsInDb.length > 0 && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Chi tiết conversations:</Text>
                    {result.conversationsInDb.map((conv, i) => {
                      const messages = result.messagesByConversation.get(conv.id) || [];
                      return (
                        <View key={i} style={styles.convCard}>
                          <Text style={styles.convText}>ID: {conv.id}</Text>
                          <Text style={styles.convText}>Bệnh nhân: {(conv as any).patientName}</Text>
                          <Text style={styles.convText}>Tin nhắn: {messages.length}</Text>
                          <Text style={styles.convText}>
                            doctorId: {(conv as any).doctorId}
                          </Text>
                          <Text style={styles.convText}>
                            doctorAuthUid: {(conv as any).doctorAuthUid || '❌ THIẾU'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {result.issues.length > 0 && (
                  <View style={styles.issuesSection}>
                    <Text style={styles.issuesTitle}>⚠️ Vấn đề:</Text>
                    {result.issues.map((issue, i) => (
                      <Text key={i} style={styles.issueText}>• {issue}</Text>
                    ))}
                  </View>
                )}

                {result.issues.length === 0 && result.conversationsInDb.length === 0 && (
                  <View style={styles.warningSection}>
                    <Text style={styles.warningText}>
                      ⚠️ Không có conversations và không có tin nhắn
                    </Text>
                    <Text style={styles.warningSubtext}>
                      Người dùng chưa gửi tin nhắn cho bác sĩ này, hoặc tin nhắn đã bị xóa
                    </Text>
                  </View>
                )}
              </View>
            ))}
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
    backgroundColor: '#E3F2FD',
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
    color: '#1565C0',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
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
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
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
  statsSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  detailsSection: {
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  convCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#00BCD4',
  },
  convText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  issuesSection: {
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
  warningSection: {
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#E65100',
  },
});
