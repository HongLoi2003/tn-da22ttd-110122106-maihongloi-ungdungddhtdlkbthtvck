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
import { getFirestoreDb } from './config/firebase';

interface ConversationData {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorAuthUid: string;
  lastMessage: string;
  messagesCount: number;
}

export default function CheckBs004Conversations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    doctorName: string;
    authUid: string | null;
    userAccountUid: string | null;
    conversationsCount: number;
    conversations: ConversationData[];
    messagesCount: number;
  } | null>(null);

  const checkBs004 = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking BS. Trần Thị Mai (bs004)...');
      
      // 1. Lấy doctor document
      const doctorQuery = query(collection(getFirestoreDb(), 'doctors'), where('id', '==', 'bs004'));
      const doctorDocs = await getDocs(doctorQuery);
      const doctorData = doctorDocs.docs[0]?.data();
      const doctorName = doctorData?.ten || 'Unknown';
      const authUid = doctorData?.authUid || null;
      
      console.log(`Doctor: ${doctorName}`);
      console.log(`authUid: ${authUid || 'KHÔNG CÓ'}`);
      
      // 2. Tìm user account
      let userAccountUid = null;
      const userQuery = query(
        collection(getFirestoreDb(), 'users'),
        where('role', '==', 'doctor'),
        where('doctorInfo.doctorId', '==', 'bs004')
      );
      const userDocs = await getDocs(userQuery);
      if (userDocs.docs.length > 0) {
        userAccountUid = userDocs.docs[0].data().uid;
        console.log(`User account UID: ${userAccountUid}`);
      }
      
      // 3. Tìm conversations theo doctorId
      const convQuery1 = query(
        collection(getFirestoreDb(), 'conversations'),
        where('doctorId', '==', 'bs004')
      );
      const convDocs1 = await getDocs(convQuery1);
      console.log(`Conversations (doctorId=bs004): ${convDocs1.size}`);
      
      // 4. Tìm conversations theo doctorAuthUid
      let convDocs2 = { docs: [], size: 0 };
      if (authUid) {
        const convQuery2 = query(
          collection(getFirestoreDb(), 'conversations'),
          where('doctorAuthUid', '==', authUid)
        );
        convDocs2 = await getDocs(convQuery2) as any;
        console.log(`Conversations (doctorAuthUid=${authUid}): ${convDocs2.size}`);
      }
      
      // 5. Gộp conversations (loại bỏ trùng lặp)
      const allConvDocs = [...convDocs1.docs, ...convDocs2.docs];
      const uniqueConvs = new Map();
      allConvDocs.forEach(doc => {
        if (!uniqueConvs.has(doc.id)) {
          uniqueConvs.set(doc.id, doc);
        }
      });
      
      // 6. Lấy chi tiết conversations
      const conversations: ConversationData[] = [];
      for (const [id, doc] of uniqueConvs) {
        const data = doc.data();
        
        // Đếm messages trong conversation này
        const messagesQuery = query(
          collection(getFirestoreDb(), 'messages'),
          where('conversationId', '==', id)
        );
        const messagesDocs = await getDocs(messagesQuery);
        
        conversations.push({
          id,
          patientId: data.patientId || 'Unknown',
          patientName: data.patientName || 'Unknown',
          doctorId: data.doctorId || 'Unknown',
          doctorAuthUid: data.doctorAuthUid || 'Unknown',
          lastMessage: data.lastMessage || 'No message',
          messagesCount: messagesDocs.size,
        });
      }
      
      // 7. Đếm tổng messages
      const allMessagesQuery = query(
        collection(getFirestoreDb(), 'messages'),
        where('doctorId', '==', 'bs004')
      );
      const allMessages = await getDocs(allMessagesQuery);
      console.log(`Total messages: ${allMessages.size}`);
      
      setResult({
        doctorName,
        authUid,
        userAccountUid,
        conversationsCount: uniqueConvs.size,
        conversations,
        messagesCount: allMessages.size,
      });
      
      console.log('✅ Check complete!');
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
        <Text style={styles.headerTitle}>Kiểm tra BS004</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Kiểm tra chi tiết BS. Trần Thị Mai (bs004) - bác sĩ bạn nói là hoạt động tốt.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={checkBs004}
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
              <Text style={styles.buttonText}>Kiểm tra BS004</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{result.doctorName}</Text>
              <Text style={styles.summarySubtitle}>ID: bs004</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>authUid:</Text>
                  <Text style={styles.statValue}>{result.authUid || '❌ KHÔNG CÓ'}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>User UID:</Text>
                  <Text style={styles.statValue}>{result.userAccountUid || '❌ KHÔNG CÓ'}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Khớp:</Text>
                  <Text style={[styles.statValue, result.authUid === result.userAccountUid ? styles.success : styles.error]}>
                    {result.authUid === result.userAccountUid ? '✅ CÓ' : '❌ KHÔNG'}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Conversations:</Text>
                  <Text style={[styles.statValue, result.conversationsCount > 0 ? styles.success : styles.error]}>
                    {result.conversationsCount}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Messages:</Text>
                  <Text style={styles.statValue}>{result.messagesCount}</Text>
                </View>
              </View>
            </View>

            {result.conversationsCount > 0 ? (
              <View style={styles.conversationsSection}>
                <Text style={styles.sectionTitle}>Conversations ({result.conversationsCount})</Text>
                {result.conversations.map((conv, index) => (
                  <View key={index} style={styles.conversationCard}>
                    <View style={styles.conversationHeader}>
                      <Ionicons name="chatbubble" size={20} color="#00BCD4" />
                      <Text style={styles.conversationPatient}>{conv.patientName}</Text>
                    </View>
                    
                    <View style={styles.conversationDetails}>
                      <Text style={styles.conversationDetail}>ID: {conv.id}</Text>
                      <Text style={styles.conversationDetail}>Patient ID: {conv.patientId}</Text>
                      <Text style={styles.conversationDetail}>Doctor ID: {conv.doctorId}</Text>
                      <Text style={styles.conversationDetail}>Doctor Auth UID: {conv.doctorAuthUid}</Text>
                      <Text style={styles.conversationDetail}>Messages: {conv.messagesCount}</Text>
                      <Text style={styles.conversationLastMessage}>"{conv.lastMessage}"</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.warningCard}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Không có conversations!</Text>
                  <Text style={styles.warningText}>
                    BS004 có {result.messagesCount} messages nhưng 0 conversations.
                  </Text>
                  <Text style={styles.warningText}>
                    Điều này có nghĩa là conversations đã bị xóa hoặc không thể tạo.
                  </Text>
                </View>
              </View>
            )}

            {result.conversationsCount === 0 && result.messagesCount > 0 && (
              <View style={styles.conclusionCard}>
                <Ionicons name="bulb" size={24} color="#F44336" />
                <View style={styles.conclusionContent}>
                  <Text style={styles.conclusionTitle}>Kết luận</Text>
                  <Text style={styles.conclusionText}>
                    Nếu BS004 (bác sĩ bạn nói hoạt động tốt) cũng có 0 conversations, 
                    có nghĩa là <Text style={styles.bold}>TẤT CẢ bác sĩ đều bị ảnh hưởng</Text>.
                  </Text>
                  <Text style={styles.conclusionText}>
                    Vấn đề không phải ở bác sĩ cụ thể mà là <Text style={styles.bold}>Firestore Rules 
                    chưa được deploy</Text> hoặc conversations đã bị xóa hàng loạt.
                  </Text>
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#000',
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
  conversationsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  conversationPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  conversationDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  conversationDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  conversationLastMessage: {
    fontSize: 13,
    color: '#000',
    marginTop: 8,
    fontStyle: 'italic',
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
  conclusionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
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
    color: '#C62828',
    marginBottom: 8,
  },
  conclusionText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
});
