import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function InspectMessagesStructure() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const inspectMessages = async () => {
    try {
      setLoading(true);
      let output = '=== KIỂM TRA CẤU TRÚC MESSAGES ===\n\n';

      // Load some messages
      const messages = await getDocumentsWithQuery('messages', []);
      output += `✅ Tìm thấy ${messages.length} messages\n\n`;

      // Show structure of first 5 messages
      output += '📨 CẤU TRÚC 5 MESSAGES ĐẦU TIÊN:\n\n';
      messages.slice(0, 5).forEach((msg: any, index: number) => {
        output += `Message #${index + 1}:\n`;
        output += `  conversationId: ${msg.conversationId}\n`;
        output += `  senderId: ${msg.senderId}\n`;
        output += `  senderType: ${msg.senderType}\n`;
        output += `  receiverId: ${msg.receiverId || 'N/A'}\n`;
        output += `  text: "${(msg.text || msg.message || '').substring(0, 40)}..."\n`;
        output += `  timestamp: ${msg.timestamp?.toDate ? msg.timestamp.toDate().toISOString() : 'N/A'}\n`;
        
        // Check for any doctor-related fields
        const allFields = Object.keys(msg);
        const doctorFields = allFields.filter(f => f.toLowerCase().includes('doctor'));
        if (doctorFields.length > 0) {
          output += `  doctor fields: ${doctorFields.join(', ')}\n`;
          doctorFields.forEach(f => {
            output += `    ${f}: ${msg[f]}\n`;
          });
        }
        output += '\n';
      });

      // Group by conversationId and check patterns
      const byConv = new Map<string, any[]>();
      messages.forEach((msg: any) => {
        const convId = msg.conversationId;
        if (!byConv.has(convId)) {
          byConv.set(convId, []);
        }
        byConv.get(convId)!.push(msg);
      });

      output += `\n📊 PHÂN TÍCH CONVERSATIONS:\n`;
      output += `Tổng số conversation IDs: ${byConv.size}\n\n`;

      // Analyze a few conversations
      const convIds = Array.from(byConv.keys()).slice(0, 3);
      for (const convId of convIds) {
        const msgs = byConv.get(convId)!;
        output += `Conversation ${convId}:\n`;
        output += `  Messages: ${msgs.length}\n`;
        output += `  Sender types: ${[...new Set(msgs.map(m => m.senderType))].join(', ')}\n`;
        output += `  Unique senderIds: ${[...new Set(msgs.map(m => m.senderId))].length}\n`;
        
        // Check if any message has doctor info
        const hasReceiverInfo = msgs.some(m => m.receiverId);
        output += `  Has receiverId: ${hasReceiverInfo ? 'Yes' : 'No'}\n`;
        
        if (hasReceiverInfo) {
          const receiverIds = [...new Set(msgs.map(m => m.receiverId).filter(Boolean))];
          output += `  Receiver IDs: ${receiverIds.join(', ')}\n`;
        }
        output += '\n';
      }

      setResult(output);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Inspect Messages</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={inspectMessages}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra Messages Structure'}
          </Text>
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 11,
    color: '#1a1a1a',
    lineHeight: 16,
    fontFamily: 'monospace',
  },
});
