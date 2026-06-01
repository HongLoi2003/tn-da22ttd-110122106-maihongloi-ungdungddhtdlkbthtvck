import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function CheckAllConversationsInFirestore() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [totalConversations, setTotalConversations] = useState(0);
  const [conversations, setConversations] = useState<any[]>([]);
  const [groupedByDoctor, setGroupedByDoctor] = useState<Map<string, any[]>>(new Map());

  const checkAllConversations = async () => {
    try {
      setLoading(true);
      
      console.log('=== CHECKING ALL CONVERSATIONS IN FIRESTORE ===');
      
      // Lấy TẤT CẢ conversations (không filter)
      const allConversations = await getDocumentsWithQuery('conversations', []);
      
      console.log(`Found ${allConversations.length} total conversations`);
      
      setTotalConversations(allConversations.length);
      setConversations(allConversations);
      
      // Group by doctorId
      const grouped = new Map<string, any[]>();
      
      allConversations.forEach((conv: any) => {
        const doctorId = conv.doctorId || 'unknown';
        if (!grouped.has(doctorId)) {
          grouped.set(doctorId, []);
        }
        grouped.get(doctorId)!.push(conv);
      });
      
      console.log('Grouped by doctorId:');
      grouped.forEach((convs, doctorId) => {
        console.log(`  ${doctorId}: ${convs.length} conversations`);
      });
      
      setGroupedByDoctor(grouped);
      
      // Log sample conversations
      if (allConversations.length > 0) {
        console.log('\nSample conversations:');
        allConversations.slice(0, 5).forEach((conv: any, index: number) => {
          console.log(`\nConversation ${index + 1}:`);
          console.log(`  ID: ${conv.id}`);
          console.log(`  doctorId: ${conv.doctorId}`);
          console.log(`  doctorAuthUid: ${conv.doctorAuthUid || 'N/A'}`);
          console.log(`  doctorName: ${conv.doctorName}`);
          console.log(`  patientName: ${conv.patientName}`);
          console.log(`  lastMessage: ${conv.lastMessage}`);
        });
      }
      
      setLoading(false);
      console.log('=== CHECK COMPLETED ===');
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
        <Text style={styles.headerTitle}>Kiểm tra Conversations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="search" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Kiểm tra Firestore</Text>
            <Text style={styles.infoText}>
              Lấy TẤT CẢ conversations từ Firestore (không filter)
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={checkAllConversations}
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
              <Text style={styles.buttonText}>Kiểm tra Conversations</Text>
            </>
          )}
        </TouchableOpacity>

        {totalConversations >= 0 && !loading && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {totalConversations === 0 ? '❌' : '✅'} Tổng số conversations: {totalConversations}
            </Text>
            
            {totalConversations === 0 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color="#FF9800" />
                <Text style={styles.warningText}>
                  KHÔNG CÓ conversations nào trong Firestore!{'\n'}
                  Tất cả conversations đã bị xóa hoặc chưa được tạo.
                </Text>
              </View>
            )}
          </View>
        )}

        {groupedByDoctor.size > 0 && (
          <View style={styles.groupedSection}>
            <Text style={styles.sectionTitle}>Conversations theo bác sĩ</Text>
            
            {Array.from(groupedByDoctor.entries())
              .sort((a, b) => b[1].length - a[1].length)
              .map(([doctorId, convs], index) => (
                <View key={index} style={styles.doctorGroup}>
                  <View style={styles.doctorGroupHeader}>
                    <Text style={styles.doctorGroupTitle}>
                      {doctorId}
                    </Text>
                    <Text style={styles.doctorGroupCount}>
                      {convs.length} conversations
                    </Text>
                  </View>
                  
                  {convs.slice(0, 3).map((conv: any, i: number) => (
                    <View key={i} style={styles.convCard}>
                      <Text style={styles.convText}>
                        Bệnh nhân: {conv.patientName || 'Unknown'}
                      </Text>
                      <Text style={styles.convText}>
                        doctorAuthUid: {conv.doctorAuthUid || '❌ THIẾU'}
                      </Text>
                      <Text style={styles.convText}>
                        Tin nhắn cuối: {conv.lastMessage || 'N/A'}
                      </Text>
                    </View>
                  ))}
                  
                  {convs.length > 3 && (
                    <Text style={styles.moreText}>
                      ... và {convs.length - 3} conversations khác
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {conversations.length > 0 && (
          <View style={styles.sampleSection}>
            <Text style={styles.sectionTitle}>Sample conversations (5 đầu tiên)</Text>
            
            {conversations.slice(0, 5).map((conv: any, index: number) => (
              <View key={index} style={styles.sampleCard}>
                <Text style={styles.sampleTitle}>Conversation {index + 1}</Text>
                <Text style={styles.sampleText}>ID: {conv.id}</Text>
                <Text style={styles.sampleText}>doctorId: {conv.doctorId}</Text>
                <Text style={styles.sampleText}>
                  doctorAuthUid: {conv.doctorAuthUid || '❌ THIẾU'}
                </Text>
                <Text style={styles.sampleText}>
                  doctorName: {conv.doctorName || 'N/A'}
                </Text>
                <Text style={styles.sampleText}>
                  patientName: {conv.patientName || 'N/A'}
                </Text>
                <Text style={styles.sampleText}>
                  lastMessage: {conv.lastMessage || 'N/A'}
                </Text>
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
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  groupedSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  doctorGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  doctorGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  doctorGroupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  doctorGroupCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  convCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  convText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sampleSection: {
    marginBottom: 16,
  },
  sampleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  sampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sampleText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
