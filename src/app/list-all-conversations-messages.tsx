import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function ListAllConversationsMessages() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const listAll = async () => {
    setLoading(true);
    setOutput('');
    log('=== LIST TẤT CẢ CONVERSATIONS VÀ MESSAGES ===\n');

    try {
      // 1. List all conversations
      log('📋 CONVERSATIONS:');
      const conversations = await getDocumentsWithQuery('conversations', []);
      log(`   Tổng số: ${conversations.length}\n`);

      if (conversations.length === 0) {
        log('   ⚠️ KHÔNG CÓ CONVERSATIONS NÀO!\n');
      } else {
        conversations.forEach((conv: any, index) => {
          log(`   ${index + 1}. ID: ${conv.id}`);
          log(`      - Patient: ${conv.patientName || 'N/A'} (${conv.patientId || 'N/A'})`);
          log(`      - Doctor: ${conv.doctorName || 'N/A'} (doctorId: ${conv.doctorId || 'N/A'})`);
          log(`      - Last msg: ${conv.lastMessage?.substring(0, 40) || 'N/A'}...`);
          log(`      - Doctor unread: ${conv.doctorUnreadCount || 0}`);
          log('');
        });
      }

      // 2. List all messages
      log('\n📨 MESSAGES:');
      const messages = await getDocumentsWithQuery('messages', []);
      log(`   Tổng số: ${messages.length}\n`);

      if (messages.length === 0) {
        log('   ⚠️ KHÔNG CÓ MESSAGES NÀO!\n');
      } else {
        // Group by conversationId
        const messagesByConv = new Map<string, any[]>();
        messages.forEach((msg: any) => {
          const convId = msg.conversationId || 'NO_CONVERSATION_ID';
          if (!messagesByConv.has(convId)) {
            messagesByConv.set(convId, []);
          }
          messagesByConv.get(convId)!.push(msg);
        });

        log(`   📊 Grouped by conversation: ${messagesByConv.size} groups\n`);

        messagesByConv.forEach((msgs, convId) => {
          log(`   📁 Conversation ID: ${convId}`);
          log(`      Messages: ${msgs.length}`);
          
          // Check if conversation exists
          const convExists = conversations.some((c: any) => c.id === convId);
          if (!convExists) {
            log(`      ⚠️ CONVERSATION KHÔNG TỒN TẠI!`);
          }
          
          msgs.slice(0, 2).forEach((msg: any) => {
            log(`      - [${msg.senderType}] ${msg.text?.substring(0, 40) || msg.message?.substring(0, 40) || 'N/A'}...`);
          });
          
          if (msgs.length > 2) {
            log(`      ... và ${msgs.length - 2} tin nhắn khác`);
          }
          log('');
        });
      }

      // 3. Summary
      log('\n📊 TỔNG KẾT:');
      log(`   - Conversations: ${conversations.length}`);
      log(`   - Messages: ${messages.length}`);
      
      const orphanMessages = messages.filter((msg: any) => {
        const convId = msg.conversationId;
        return !conversations.some((c: any) => c.id === convId);
      });
      
      log(`   - Messages KHÔNG CÓ conversation: ${orphanMessages.length}`);
      
      if (orphanMessages.length > 0) {
        log('\n   ⚠️ CẦN CHẠY TOOL "Tìm Messages Không Có Conversation"');
      }
      
    } catch (error) {
      log(`\n❌ LỖI: ${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kiểm Tra Toàn Bộ Data</Text>
        <Text style={styles.subtitle}>
          List tất cả conversations và messages
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={listAll}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang tải...' : '📋 List All Data'}
          </Text>
        </TouchableOpacity>

        {output ? (
          <View style={styles.outputContainer}>
            <ScrollView style={styles.outputScroll}>
              <Text style={styles.output}>{output}</Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 500,
  },
  outputScroll: {
    maxHeight: 480,
  },
  output: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#0f172a',
    lineHeight: 18,
  },
});
