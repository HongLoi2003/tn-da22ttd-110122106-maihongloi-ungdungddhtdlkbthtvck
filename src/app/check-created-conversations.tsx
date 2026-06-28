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

export default function CheckCreatedConversations() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkConversations = async () => {
    try {
      setLoading(true);
      let output = '=== KIỂM TRA CONVERSATIONS ĐÃ TẠO ===\n\n';

      // Load all conversations
      const conversations = await getDocumentsWithQuery('conversations', []);
      output += `✅ Tìm thấy ${conversations.length} conversations\n\n`;

      // Group by doctorId
      const byDoctor = new Map<string, any[]>();
      conversations.forEach((conv: any) => {
        const dId = conv.doctorId || 'unknown';
        if (!byDoctor.has(dId)) {
          byDoctor.set(dId, []);
        }
        byDoctor.get(dId)!.push(conv);
      });

      output += `📊 Phân bổ theo bác sĩ:\n`;
      for (const [dId, convs] of byDoctor.entries()) {
        output += `   ${dId}: ${convs.length} conversations\n`;
      }
      output += '\n';

      // Check specific doctors
      output += '🔍 KIỂM TRA 3 BÁC SĨ CHÍNH:\n\n';
      
      const targetDoctors = ['bs001', 'bs003', 'bs004'];
      for (const dId of targetDoctors) {
        const convs = byDoctor.get(dId) || [];
        output += `👨‍⚕️ ${dId}: ${convs.length} conversations\n`;
        if (convs.length > 0) {
          convs.slice(0, 3).forEach((conv: any) => {
            output += `   - ${conv.patientName} | Last: "${conv.lastMessage?.substring(0, 30)}..."\n`;
            output += `     doctorAuthUid: ${conv.doctorAuthUid}\n`;
          });
          if (convs.length > 3) {
            output += `   ... và ${convs.length - 3} conversations khác\n`;
          }
        }
        output += '\n';
      }

      // Load users to check doctor login info
      output += '🔐 KIỂM TRA DOCTOR AUTH:\n\n';
      const users = await getDocumentsWithQuery('users', []);
      const doctorUsers = users.filter((u: any) => u.role === 'doctor');
      
      for (const dId of targetDoctors) {
        const doctorUser = doctorUsers.find((u: any) => u.doctorInfo?.doctorId === dId);
        if (doctorUser) {
          output += `✅ ${dId}:\n`;
          output += `   authUid: ${doctorUser.uid}\n`;
          output += `   email: ${doctorUser.email}\n`;
          
          // Check if any conversations match this authUid
          const matchingConvs = conversations.filter((c: any) => 
            c.doctorId === dId || c.doctorAuthUid === doctorUser.uid
          );
          output += `   conversations matched: ${matchingConvs.length}\n`;
        } else {
          output += `❌ ${dId}: Không tìm thấy user account\n`;
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
        <Text style={styles.title}>Check Conversations</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={checkConversations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra Conversations'}
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
    fontSize: 12,
    color: '#1a1a1a',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
