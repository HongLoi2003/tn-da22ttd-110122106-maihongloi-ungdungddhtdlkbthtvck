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
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

interface MissingConversation {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorAuthUid: string;
  messagesCount: number;
  lastMessage: string;
  lastMessageTime: any;
}

export default function FindMissingConversations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanningText] = useState('');
  const [missingConvs, setMissingConvs] = useState<MissingConversation[]>([]);
  const [fixed, setFixed] = useState(0);

  const findAndFixMissingConversations = async () => {
    try {
      setLoading(true);
      setMissingConvs([]);
      setFixed(0);
      
      console.log('=== FINDING MISSING CONVERSATIONS ===');
      setScanningText('Đang quét tất cả tin nhắn...');
      
      // 1. Lấy TẤT CẢ messages
      const allMessages = await getDocumentsWithQuery('messages', []);
      console.log(`Found ${allMessages.length} total messages`);
      setScanningText(`Tìm thấy ${allMessages.length} tin nhắn`);
      
      // 2. Group messages theo conversationId
      const messagesByConv = new Map<string, any[]>();
      allMessages.forEach((msg: any) => {
        const convId = msg.conversationId;
        if (!messagesByConv.has(convId)) {
          messagesByConv.set(convId, []);
        }
        messagesByConv.get(convId)!.push(msg);
      });
      
      console.log(`Found ${messagesByConv.size} unique conversation IDs`);
      setScanningText(`Tìm thấy ${messagesByConv.size} conversation IDs`);
      
      // 3. Kiểm tra từng conversation có tồn tại không
      const missing: MissingConversation[] = [];
      let checked = 0;
      
      for (const [convId, messages] of messagesByConv.entries()) {
        checked++;
        setScanningText(`Đang kiểm tra ${checked}/${messagesByConv.size}...`);
        
        // Kiểm tra conversation có tồn tại không
        const existingConvs = await getDocumentsWithQuery('conversations', [
          where('__name__', '==', convId)
        ]);
        
        if (existingConvs.length === 0) {
          console.log(`\n❌ MISSING CONVERSATION: ${convId}`);
          console.log(`  Messages count: ${messages.length}`);
          
          // Lấy thông tin từ messages
          const firstMsg = messages[0];
          const lastMsg = messages[messages.length - 1];
          
          // Tìm patient info
          let patientId = '';
          let patientName = 'Unknown Patient';
          const patientMsg = messages.find((m: any) => m.senderType === 'patient');
          if (patientMsg) {
            patientId = patientMsg.senderId;
            
            // Lấy patient name từ users
            const users = await getDocumentsWithQuery('users', [
              where('uid', '==', patientId)
            ]);
            if (users.length > 0) {
              patientName = (users[0] as any).fullName || 'Unknown Patient';
            }
          }
          
          // Tìm doctor info
          let doctorId = '';
          let doctorName = 'Unknown Doctor';
          let doctorAuthUid = '';
          const doctorMsg = messages.find((m: any) => m.senderType === 'doctor');
          if (doctorMsg) {
            doctorId = doctorMsg.senderId;
            
            // Tìm doctor document có authUid = doctorId
            const doctors = await getDocumentsWithQuery('doctors', [
              where('authUid', '==', doctorId)
            ]);
            
            if (doctors.length > 0) {
              const doctor = doctors[0];
              doctorId = doctor.id; // bs001, bs002, etc.
              doctorName = (doctor as any).ten || 'Unknown Doctor';
              doctorAuthUid = (doctor as any).authUid || doctorId;
            } else {
              // Fallback: tìm theo doctorId trực tiếp
              const { getDocumentById } = await import('./services/firebaseService');
              const doctorDoc = await getDocumentById('doctors', doctorId);
              if (doctorDoc) {
                doctorName = (doctorDoc as any).ten || 'Unknown Doctor';
                doctorAuthUid = (doctorDoc as any).authUid || doctorId;
              }
            }
          }
          
          console.log(`  Patient: ${patientName} (${patientId})`);
          console.log(`  Doctor: ${doctorName} (${doctorId})`);
          console.log(`  Doctor AuthUid: ${doctorAuthUid}`);
          
          missing.push({
            patientId,
            patientName,
            doctorId,
            doctorName,
            doctorAuthUid,
            messagesCount: messages.length,
            lastMessage: lastMsg.text || lastMsg.message || '',
            lastMessageTime: lastMsg.timestamp,
          });
        }
      }
      
      console.log(`\n=== SUMMARY ===`);
      console.log(`Total conversations checked: ${messagesByConv.size}`);
      console.log(`Missing conversations: ${missing.length}`);
      
      setMissingConvs(missing);
      setScanningText('Hoàn thành quét!');
      setLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      setScanningText('Lỗi khi quét!');
      setLoading(false);
    }
  };

  const fixMissingConversation = async (conv: MissingConversation) => {
    try {
      console.log(`\n=== FIXING CONVERSATION ===`);
      console.log(`Patient: ${conv.patientName}`);
      console.log(`Doctor: ${conv.doctorName}`);
      
      // Tạo conversation mới
      const newConv = await createDocument('conversations', {
        patientId: conv.patientId,
        patientName: conv.patientName,
        doctorId: conv.doctorId,
        doctorAuthUid: conv.doctorAuthUid,
        doctorName: conv.doctorName,
        lastMessage: conv.lastMessage,
        lastMessageTimestamp: conv.lastMessageTime || Timestamp.now(),
        lastMessageSender: 'patient',
        unreadCountPatient: 0,
        doctorUnreadCount: conv.messagesCount, // Tất cả tin nhắn chưa đọc
        createdAt: Timestamp.now(),
      });
      
      console.log(`✅ Created conversation: ${newConv.id}`);
      
      // Cập nhật tất cả messages với conversationId mới
      const messages = await getDocumentsWithQuery('messages', [
        where('conversationId', '==', conv.patientId + '_' + conv.doctorId)
      ]);
      
      const { updateDocument } = await import('./services/firebaseService');
      for (const msg of messages) {
        await updateDocument('messages', msg.id, {
          conversationId: newConv.id,
        });
      }
      
      console.log(`✅ Updated ${messages.length} messages`);
      
      setFixed(prev => prev + 1);
      
      // Xóa khỏi danh sách missing
      setMissingConvs(prev => prev.filter(c => 
        c.patientId !== conv.patientId || c.doctorId !== conv.doctorId
      ));
      
      alert(`✅ Đã sửa conversation cho ${conv.patientName} - ${conv.doctorName}`);
    } catch (error) {
      console.error('❌ Error fixing conversation:', error);
      alert('❌ Lỗi khi sửa conversation');
    }
  };

  const fixAllMissing = async () => {
    if (missingConvs.length === 0) return;
    
    const confirm = window.confirm(
      `Bạn có chắc muốn tạo lại ${missingConvs.length} conversations bị thiếu?`
    );
    
    if (!confirm) return;
    
    setLoading(true);
    setScanningText('Đang sửa tất cả...');
    
    for (const conv of missingConvs) {
      await fixMissingConversation(conv);
    }
    
    setScanningText('Hoàn thành!');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm Conversations Bị Thiếu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="search" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chức năng</Text>
            <Text style={styles.infoText}>
              Quét tất cả tin nhắn và tìm conversations bị thiếu. Nếu có tin nhắn nhưng không có conversation, script sẽ tạo lại.
            </Text>
          </View>
        </View>

        {scanning && (
          <View style={styles.scanningCard}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text style={styles.scanningText}>{scanning}</Text>
          </View>
        )}

        {fixed > 0 && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.successText}>Đã sửa: {fixed} conversations</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={findAndFixMissingConversations}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang quét...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.buttonText}>Quét Conversations</Text>
            </>
          )}
        </TouchableOpacity>

        {missingConvs.length > 0 && (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Tìm thấy {missingConvs.length} conversations bị thiếu</Text>
            </View>

            <TouchableOpacity 
              style={styles.fixAllButton}
              onPress={fixAllMissing}
              disabled={loading}
            >
              <Ionicons name="build" size={20} color="#fff" />
              <Text style={styles.buttonText}>Sửa Tất Cả</Text>
            </TouchableOpacity>

            {missingConvs.map((conv, index) => (
              <View key={index} style={styles.convCard}>
                <View style={styles.convHeader}>
                  <Ionicons name="warning" size={24} color="#FF9800" />
                  <View style={styles.convInfo}>
                    <Text style={styles.convTitle}>
                      {conv.patientName} → {conv.doctorName}
                    </Text>
                    <Text style={styles.convSubtitle}>
                      {conv.messagesCount} tin nhắn
                    </Text>
                  </View>
                </View>

                <View style={styles.convDetails}>
                  <Text style={styles.detailText}>Patient ID: {conv.patientId}</Text>
                  <Text style={styles.detailText}>Doctor ID: {conv.doctorId}</Text>
                  <Text style={styles.detailText}>Doctor AuthUid: {conv.doctorAuthUid}</Text>
                  <Text style={styles.detailText}>Tin nhắn cuối: {conv.lastMessage}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.fixButton}
                  onPress={() => fixMissingConversation(conv)}
                >
                  <Ionicons name="build" size={16} color="#fff" />
                  <Text style={styles.fixButtonText}>Sửa Conversation Này</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {!loading && missingConvs.length === 0 && scanning && (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.emptyText}>Không tìm thấy conversation nào bị thiếu</Text>
            <Text style={styles.emptySubtext}>Tất cả conversations đều tồn tại</Text>
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
  scanningCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 14,
    color: '#666',
  },
  successCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
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
  statsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  fixAllButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  convCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  convHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  convInfo: {
    flex: 1,
  },
  convTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  convSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  convDetails: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fixButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fixButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
