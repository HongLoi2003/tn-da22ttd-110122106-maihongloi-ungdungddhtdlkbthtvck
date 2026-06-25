import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
import { getFirestoreDb,} from './config/firebase';

interface DoctorResult {
  id: string;
  name: string;
  messagesFound: number;
  conversationsCreated: number;
  conversations: Array<{
    patientName: string;
    messagesCount: number;
    unreadCount: number;
    conversationId: string;
  }>;
}

export default function RebuildAllConversations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [summary, setSummary] = useState({
    totalDoctors: 0,
    totalMessages: 0,
    totalConversations: 0,
  });

  const rebuildConversations = async () => {
    try {
      setLoading(true);
      setResults([]);
      console.log('🔄 Bắt đầu tái tạo conversations cho TẤT CẢ bác sĩ...');
      
      // 1. Lấy tất cả doctors
      const doctorsSnapshot = await getDocs(collection(getFirestoreDb(), 'doctors'));
      const allDoctors = doctorsSnapshot.docs.map(doc => ({
        id: doc.data().id,
        name: doc.data().ten,
        authUid: doc.data().authUid,
      }));
      
      console.log(`📋 Tìm thấy ${allDoctors.length} bác sĩ`);
      
      const doctorResults: DoctorResult[] = [];
      let totalMessages = 0;
      let totalConversations = 0;
      
      // 2. Xử lý từng bác sĩ
      for (const doctor of allDoctors) {
        console.log(`\n👨‍⚕️ Xử lý: ${doctor.name} (${doctor.id})`);
        
        // 2.1. Lấy tất cả messages của bác sĩ này
        const messagesQuery = query(
          collection(getFirestoreDb(), 'messages'),
          where('doctorId', '==', doctor.id)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`  📨 Tìm thấy ${messages.length} messages`);
        totalMessages += messages.length;
        
        if (messages.length === 0) {
          doctorResults.push({
            id: doctor.id,
            name: doctor.name,
            messagesFound: 0,
            conversationsCreated: 0,
            conversations: [],
          });
          continue;
        }
        
        // 2.2. Group messages theo patientId
        const messagesByPatient = new Map();
        messages.forEach(msg => {
          const patientId = (msg as any).patientId || (msg as any).senderId;
          if (!messagesByPatient.has(patientId)) {
            messagesByPatient.set(patientId, []);
          }
          messagesByPatient.get(patientId).push(msg);
        });
        
        console.log(`  👥 Tìm thấy ${messagesByPatient.size} bệnh nhân`);
        
        // 2.3. Tạo conversation cho mỗi bệnh nhân
        const conversations = [];
        for (const [patientId, patientMessages] of messagesByPatient) {
          // Sắp xếp messages theo thời gian
          patientMessages.sort((a: any, b: any) => {
            const timeA = a.timestamp?.toMillis?.() || 0;
            const timeB = b.timestamp?.toMillis?.() || 0;
            return timeB - timeA;
          });
          
          const lastMessage = patientMessages[0];
          const patientName = lastMessage.patientName || lastMessage.senderName || 'Unknown Patient';
          
          // Đếm tin nhắn chưa đọc của bác sĩ
          const unreadCount = patientMessages.filter((msg: any) => 
            (msg as any).senderId === patientId && !msg.readByDoctor
          ).length;
          
          // Tạo conversation mới
          const conversationData = {
            patientId,
            patientName,
            doctorId: doctor.id,
            doctorAuthUid: doctor.authUid || '',
            doctorName: doctor.name,
            lastMessage: lastMessage.text || '',
            lastMessageTimestamp: lastMessage.timestamp || new Date(),
            doctorUnreadCount: unreadCount,
            unreadCountPatient: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          try {
            const conversationRef = await addDoc(
              collection(getFirestoreDb(), 'conversations'),
              conversationData
            );
            
            console.log(`    ✅ Tạo conversation: ${patientName} (${conversationRef.id})`);
            
            // Cập nhật conversationId cho tất cả messages
            for (const msg of patientMessages) {
              const messageRef = messagesSnapshot.docs.find(doc => doc.id === msg.id);
              if (messageRef) {
                await updateDoc(messageRef.ref, {
                  conversationId: conversationRef.id,
                });
              }
            }
            
            conversations.push({
              patientName,
              messagesCount: patientMessages.length,
              unreadCount,
              conversationId: conversationRef.id,
            });
            
            totalConversations++;
          } catch (error) {
            console.error(`    ❌ Lỗi tạo conversation cho ${patientName}:`, error);
          }
        }
        
        doctorResults.push({
          id: doctor.id,
          name: doctor.name,
          messagesFound: messages.length,
          conversationsCreated: conversations.length,
          conversations,
        });
      }
      
      setResults(doctorResults);
      setSummary({
        totalDoctors: allDoctors.length,
        totalMessages,
        totalConversations,
      });
      
      console.log('\n✅ Hoàn thành!');
      console.log(`📊 Tổng kết:`);
      console.log(`   - Bác sĩ: ${allDoctors.length}`);
      console.log(`   - Messages: ${totalMessages}`);
      console.log(`   - Conversations: ${totalConversations}`);
      
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tái tạo TẤT CẢ Conversations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>⚠️ QUAN TRỌNG</Text>
            <Text style={styles.warningText}>
              Trước khi chạy script này, hãy đảm bảo bạn đã:
            </Text>
            <Text style={styles.warningText}>
              1. ✅ Deploy Firestore Rules lên Firebase Console
            </Text>
            <Text style={styles.warningText}>
              2. ✅ Đợi 2-3 phút để rules có hiệu lực
            </Text>
            <Text style={styles.warningText}>
              3. ✅ Xác nhận rules có dòng "allow create: if true;"
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Tái tạo conversations cho TẤT CẢ bác sĩ từ messages hiện có trong Firestore.
            </Text>
          </View>
        </View>

        {summary.totalDoctors > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Tổng kết</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số bác sĩ:</Text>
              <Text style={styles.summaryValue}>{summary.totalDoctors}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng messages:</Text>
              <Text style={styles.summaryValue}>{summary.totalMessages}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Conversations tạo:</Text>
              <Text style={[styles.summaryValue, styles.success]}>{summary.totalConversations}</Text>
            </View>
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
              <Text style={styles.buttonText}>Đang tái tạo...</Text>
            </>
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Tái tạo Conversations</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Kết quả</Text>
            {results.map((doctor, index) => (
              <View key={index} style={styles.doctorCard}>
                <View style={styles.doctorHeader}>
                  <Ionicons 
                    name={doctor.conversationsCreated > 0 ? "checkmark-circle" : "alert-circle"} 
                    size={24} 
                    color={doctor.conversationsCreated > 0 ? "#4CAF50" : "#FF9800"} 
                  />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.doctorId}>ID: {doctor.id}</Text>
                  </View>
                </View>
                
                <View style={styles.doctorStats}>
                  <Text style={styles.statText}>Tin nhắn tìm thấy: {doctor.messagesFound}</Text>
                  <Text style={styles.statText}>Conversations tạo: {doctor.conversationsCreated}</Text>
                </View>

                {doctor.conversations.length > 0 && (
                  <View style={styles.conversationsContainer}>
                    <Text style={styles.conversationsTitle}>Chi tiết conversations:</Text>
                    {doctor.conversations.map((conv, i) => (
                      <View key={i} style={styles.conversationItem}>
                        <Text style={styles.conversationText}>
                          ✅ {conv.patientName}
                        </Text>
                        <Text style={styles.conversationDetail}>
                          Tin nhắn: {conv.messagesCount} | Chưa đọc: {conv.unreadCount}
                        </Text>
                        <Text style={styles.conversationId}>
                          ID: {conv.conversationId}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {results.length > 0 && summary.totalConversations > 0 && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>✅ Hoàn thành!</Text>
              <Text style={styles.successText}>
                Đã tạo {summary.totalConversations} conversations cho {summary.totalDoctors} bác sĩ.
              </Text>
              <Text style={styles.successText}>
                Bác sĩ giờ có thể thấy tin nhắn từ người dùng.
              </Text>
            </View>
          </View>
        )}

        {results.length > 0 && summary.totalConversations === 0 && (
          <View style={styles.errorCard}>
            <Ionicons name="close-circle" size={24} color="#F44336" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>❌ Không tạo được conversations!</Text>
              <Text style={styles.errorText}>
                Có thể Firestore Rules chưa được deploy hoặc chưa có hiệu lực.
              </Text>
              <Text style={styles.errorText}>
                Hãy kiểm tra lại Firebase Console và đợi thêm 2-3 phút.
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
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
    marginBottom: 4,
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
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  success: {
    color: '#4CAF50',
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
    marginBottom: 12,
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
  doctorId: {
    fontSize: 12,
    color: '#999',
  },
  doctorStats: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  conversationsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  conversationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  conversationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  conversationText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  conversationDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  conversationId: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  successCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    marginBottom: 4,
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
    marginBottom: 4,
  },
});
