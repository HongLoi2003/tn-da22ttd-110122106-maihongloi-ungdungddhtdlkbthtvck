import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function FixAllConversationsAuthUid() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fixConversations = async () => {
    try {
      setLoading(true);
      let output = '=== FIX TẤT CẢ CONVERSATIONS AUTH UID ===\n\n';

      // 1. Load all conversations
      const conversations = await getDocumentsWithQuery('conversations', []);
      output += `✅ Tìm thấy ${conversations.length} conversations\n\n`;

      // 2. Load users to build doctorId -> authUid mapping
      const users = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);
      
      const doctorAuthMap = new Map<string, string>();
      users.forEach((user: any) => {
        if (user.doctorInfo?.doctorId && user.uid) {
          doctorAuthMap.set(user.doctorInfo.doctorId, user.uid);
        }
      });

      output += `✅ Loaded ${doctorAuthMap.size} doctor auth mappings\n`;
      output += `   Doctors: ${Array.from(doctorAuthMap.keys()).join(', ')}\n\n`;

      // 3. Fix each conversation
      let fixedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const conv of conversations) {
        const doctorId = (conv as any).doctorId;
        const currentAuthUid = (conv as any).doctorAuthUid;

        if (!doctorId) {
          output += `⚠️  [${conv.id}] Bỏ qua - không có doctorId\n`;
          skippedCount++;
          continue;
        }

        const correctAuthUid = doctorAuthMap.get(doctorId);

        if (!correctAuthUid) {
          output += `⚠️  [${conv.id}] Bỏ qua - không tìm thấy auth UID cho ${doctorId}\n`;
          skippedCount++;
          continue;
        }

        // Check if already correct
        if (currentAuthUid === correctAuthUid) {
          output += `✓ [${conv.id}] ${doctorId} - đã đúng\n`;
          skippedCount++;
          continue;
        }

        // Fix it
        try {
          await updateDocument('conversations', conv.id, {
            doctorAuthUid: correctAuthUid
          });
          output += `✅ [${conv.id}] Fixed ${doctorId}: ${currentAuthUid || 'null'} → ${correctAuthUid}\n`;
          fixedCount++;
        } catch (error) {
          output += `❌ [${conv.id}] Lỗi: ${error}\n`;
          errorCount++;
        }
      }

      output += `\n=== KẾT QUẢ ===\n`;
      output += `✅ Đã fix: ${fixedCount} conversations\n`;
      output += `⚠️  Bỏ qua: ${skippedCount} conversations\n`;
      output += `❌ Lỗi: ${errorCount} conversations\n`;
      output += `📊 Tổng: ${conversations.length} conversations\n`;

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
        <Text style={styles.title}>Fix Conversations Auth UID</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚠️ Chức năng này sẽ:</Text>
          <Text style={styles.infoText}>
            • Quét tất cả conversations{'\n'}
            • Map doctorId sang đúng Firebase Auth UID{'\n'}
            • Update field doctorAuthUid cho mỗi conversation
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={fixConversations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang fix...' : 'Fix Conversations'}
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
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#ffc107',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#000',
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
    fontSize: 12,
    color: '#1a1a1a',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
