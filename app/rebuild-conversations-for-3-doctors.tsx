import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Timestamp, where } from 'firebase/firestore';
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
import { createDocument, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

interface RebuildResult {
  doctorId: string;
  doctorName: string;
  messagesFound: number;
  conversationsCreated: number;
  conversationDetails: any[];
  errors: string[];
}

export default function RebuildConversationsFor3Doctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RebuildResult[]>([]);
  const [currentStep, setCurrentStep] = useState('');

  const doctorsToFix = [
    { id: 'bs001', name: 'BS. Nguyễn Văn An', authUid: '437y6IoqBNaUcH0Rf4MdXnM5RlE3' },
    { id: 'bs002', name: 'BS. Trần Thị Lan', authUid: 'gKFSZDMWCbS8LAty40cmwdJHgag2' },
    { id: 'bs007', name: 'BS. Đỗ Minh Tuấn', authUid: 'E1Nluyx4RzMsSLq7INK1YPZ13U82' },
  ];

  const rebuildConversations = async () => {
    try {
      setLoading(true);
      setResults([]);
      
      console.log('=== REBUILDING CONVERSATIONS FOR 3 DOCTORS ===');
      
      const allResults: RebuildResult[] = [];
      
      for (const doctor of doctorsToFix) {
        setCurrentStep(`Đang xử lý ${doctor.name}...`);
        console.log(`\n========================================`);
        console.log(`Processing: ${doctor.name}`);
        console.log(`========================================`);
        
        const errors: string[] = [];
        const conversationDetails: any[] = [];
        
        // 1. Lấy TẤT CẢ messages
        setCurrentStep(`${doctor.name}: Đang tìm tin nhắn...`);
        const allMessages = await getDocumentsWithQuery('messages', []);
        console.log(`Total messages in database: ${allMessages.length}`);
        
        // 2. Lọc messages liên quan đến bác sĩ này
        const doctorMessages = allMessages.filter((msg: any) => {
          const senderId = msg.senderId;
          const senderType = msg.senderType;
          
          // Messages từ bác sĩ
          if (senderType === 'doctor' && (senderId === doctor.authUid || senderId === doctor.id)) {
            return true;
          }
          
          return false;
        });
        
        console.log(`Found ${doctorMessages.length} messages from doctor`);
        
        // 3. Group messages theo conversationId
        const messagesByConv = new Map<string, any[]>();
        doctorMessages.forEach((msg: any) => {
          const convId = msg.conversationId;
          if (!messagesByConv.has(convId)) {
            messagesByConv.set(convId, []);
          }
          messagesByConv.get(convId)!.push(msg);
        });
        
        console.log(`Found ${messagesByConv.size} unique conversation IDs`);
        
        // 4. Tạo lại conversations
        setCurrentStep(`${doctor.name}: Đang tạo conversations...`);
        let conversationsCreated = 0;
        
        for (const [convId, messages] of messagesByConv.entries()) {
          console.log(`\n--- Processing conversation: ${convId} ---`);
          console.log(`Messages: ${messages.length}`);
          
          // Kiểm tra conversation đã tồn tại chưa
          const existingConvs = await getDocumentsWithQuery('conversations', [
            where('__name__', '==', convId)
          ]);
          
          if (existingConvs.length > 0) {
            console.log('Conversation already exists, skipping...');
            continue;
          }
          
          // Lấy thông tin từ messages
          const sortedMessages = messages.sort((a: any, b: any) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return timeA - timeB;
          });
          
          const firstMsg = sortedMessages[0];
          const lastMsg = sortedMessages[sortedMessages.length - 1];
          
          // Tìm patient info
          let patientId = '';
          let patientName = 'Unknown Patient';
          
          // Lấy tất cả messages trong conversation này (bao gồm cả từ patient)
          const allConvMessages = await getDocumentsWithQuery('messages', [
            where('conversationId', '==', convId)
          ]);
          
          const patientMsg = allConvMessages.find((m: any) => m.senderType === 'patient');
          if (patientMsg) {
            patientId = (patientMsg as any).senderId;
            
            // Lấy patient name từ users
            const users = await getDocumentsWithQuery('users', [
              where('uid', '==', patientId)
            ]);
            if (users.length > 0) {
              patientName = (users[0] as any).fullName || 'Unknown Patient';
            }
          } else {
            console.log('⚠️ No patient message found, using conversation ID to find patient');
            // Fallback: parse conversationId (format: patientId_doctorId)
            const parts = convId.split('_');
            if (parts.length >= 2) {
              patientId = parts[0];
              const users = await getDocumentsWithQuery('users', [
                where('uid', '==', patientId)
              ]);
              if (users.length > 0) {
                patientName = (users[0] as any).fullName || 'Unknown Patient';
              }
            }
          }
          
          if (!patientId) {
            console.log('❌ Cannot determine patient ID, skipping...');
            errors.push(`Conversation ${convId}: Không xác định được patient`);
            continue;
          }
          
          console.log(`Patient: ${patientName} (${patientId})`);
          console.log(`Doctor: ${doctor.name} (${doctor.id})`);
          
          // Đếm tin nhắn chưa đọc của bác sĩ
          const unreadForDoctor = allConvMessages.filter((m: any) => 
            m.senderType === 'patient' && !m.read
          ).length;
          
          // Tạo conversation mới
          try {
            const newConv = await createDocument('conversations', {
              patientId,
              patientName,
              doctorId: doctor.id,
              doctorAuthUid: doctor.authUid,
              doctorName: doctor.name,
              lastMessage: (lastMsg as any).text || (lastMsg as any).message || '',
              lastMessageTimestamp: (lastMsg as any).timestamp || Timestamp.now(),
              lastMessageSender: (lastMsg as any).senderType || 'patient',
              unreadCountPatient: 0,
              doctorUnreadCount: unreadForDoctor,
              createdAt: (firstMsg as any).timestamp || Timestamp.now(),
            });
            
            console.log(`✅ Created conversation: ${newConv.id}`);
            
            // Cập nhật tất cả messages với conversationId mới
            for (const msg of allConvMessages) {
              await updateDocument('messages', msg.id, {
                conversationId: newConv.id,
              });
            }
            
            console.log(`✅ Updated ${allConvMessages.length} messages`);
            
            conversationsCreated++;
            conversationDetails.push({
              oldConvId: convId,
              newConvId: newConv.id,
              patientName,
              messagesCount: allConvMessages.length,
              unreadCount: unreadForDoctor,
            });
          } catch (error) {
            console.error('❌ Error creating conversation:', error);
            errors.push(`Conversation ${convId}: ${error}`);
          }
        }
        
        console.log(`\n=== SUMMARY FOR ${doctor.name} ===`);
        console.log(`Messages found: ${doctorMessages.length}`);
        console.log(`Conversations created: ${conversationsCreated}`);
        console.log(`Errors: ${errors.length}`);
        
        allResults.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          messagesFound: doctorMessages.length,
          conversationsCreated,
          conversationDetails,
          errors,
        });
      }
      
      setResults(allResults);
      setCurrentStep('Hoàn thành!');
      setLoading(false);
      
      console.log('\n=== REBUILD COMPLETED ===');
    } catch (error) {
      console.error('❌ Error:', error);
      setCurrentStep('Lỗi!');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tái tạo Conversations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Cảnh báo</Text>
            <Text style={styles.warningText}>
              Script này sẽ tái tạo conversations từ messages có sẵn cho 3 bác sĩ: Nguyễn Văn An, Trần Thị Lan, Đỗ Minh Tuấn.
            </Text>
          </View>
        </View>

        {currentStep && (
          <View style={styles.stepCard}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text style={styles.stepText}>{currentStep}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={rebuildConversations}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang xử lý...</Text>
            </>
          ) : (
            <>
              <Ionicons name="build" size={20} color="#fff" />
              <Text style={styles.buttonText}>Tái tạo Conversations</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Kết quả</Text>
            
            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons 
                    name={result.conversationsCreated > 0 ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={result.conversationsCreated > 0 ? "#4CAF50" : "#F44336"} 
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{result.doctorName}</Text>
                    <Text style={styles.resultId}>ID: {result.doctorId}</Text>
                  </View>
                </View>

                <View style={styles.statsSection}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Tin nhắn tìm thấy:</Text>
                    <Text style={styles.statValue}>{result.messagesFound}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Conversations tạo:</Text>
                    <Text style={[styles.statValue, styles.statSuccess]}>
                      {result.conversationsCreated}
                    </Text>
                  </View>
                </View>

                {result.conversationDetails.length > 0 && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Chi tiết conversations:</Text>
                    {result.conversationDetails.map((conv, i) => (
                      <View key={i} style={styles.convCard}>
                        <Text style={styles.convText}>✅ {conv.patientName}</Text>
                        <Text style={styles.convText}>Tin nhắn: {conv.messagesCount}</Text>
                        <Text style={styles.convText}>Chưa đọc: {conv.unreadCount}</Text>
                        <Text style={styles.convText}>ID mới: {conv.newConvId}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.errors.length > 0 && (
                  <View style={styles.errorsSection}>
                    <Text style={styles.errorsTitle}>❌ Lỗi:</Text>
                    {result.errors.map((error, i) => (
                      <Text key={i} style={styles.errorText}>• {error}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successTitle}>Hoàn thành!</Text>
              <Text style={styles.successText}>
                Bác sĩ giờ có thể thấy tin nhắn từ người dùng
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
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
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
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resultId: {
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
  statSuccess: {
    color: '#4CAF50',
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
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  convText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 4,
  },
  errorsSection: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    marginBottom: 4,
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 12,
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
});
