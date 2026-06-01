import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from './config/firebase';

export default function ForceUpdateAllConversations() {
  const router = useRouter();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const forceUpdate = async () => {
    try {
      setLoading(true);
      let output = '=== FORCE UPDATE ALL CONVERSATIONS ===\n\n';

      // 1. Load doctors mapping
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      const doctorIdToAuthUid = new Map<string, string>();
      
      doctorsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.authUid) {
          doctorIdToAuthUid.set(doc.id, data.authUid);
        }
      });

      output += `✅ Loaded ${doctorIdToAuthUid.size} doctors\n\n`;

      // 2. Load ALL conversations (bypass rules by using admin access)
      const conversationsSnapshot = await getDocs(collection(db, 'conversations'));
      output += `📋 Found ${conversationsSnapshot.size} conversations\n\n`;

      if (conversationsSnapshot.size === 0) {
        output += '⚠️  Không có conversations nào!\n';
        output += 'Có thể conversations đã bị xóa hoặc chưa được tạo.\n';
        setResult(output);
        setLoading(false);
        return;
      }

      // 3. Update each conversation
      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const convDoc of conversationsSnapshot.docs) {
        const convData = convDoc.data();
        const doctorId = convData.doctorId;

        output += `\n[${convDoc.id}]\n`;
        output += `  doctorId: ${doctorId}\n`;
        output += `  doctorAuthUid: ${convData.doctorAuthUid || 'N/A'}\n`;

        // Check if already has doctorAuthUid
        if (convData.doctorAuthUid) {
          output += `  ⏭️  Đã có doctorAuthUid\n`;
          skipped++;
          continue;
        }

        // Get authUid from mapping
        const authUid = doctorIdToAuthUid.get(doctorId);
        
        if (!authUid) {
          output += `  ⚠️  Không tìm thấy authUid cho doctorId: ${doctorId}\n`;
          errors++;
          continue;
        }

        // Update conversation
        try {
          const convRef = doc(db, 'conversations', convDoc.id);
          await updateDoc(convRef, {
            doctorAuthUid: authUid
          });
          output += `  ✅ Cập nhật doctorAuthUid: ${authUid}\n`;
          updated++;
        } catch (error) {
          output += `  ❌ Lỗi: ${error}\n`;
          errors++;
        }
      }

      output += '\n=== KẾT QUẢ ===\n';
      output += `✅ Đã cập nhật: ${updated} conversations\n`;
      output += `⏭️  Đã có sẵn: ${skipped} conversations\n`;
      output += `❌ Lỗi: ${errors} conversations\n`;
      output += `📊 Tổng: ${conversationsSnapshot.size} conversations\n`;

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
        <Text style={styles.title}>Force Update Conversations</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚠️ Script này sẽ:</Text>
          <Text style={styles.infoText}>
            • Sử dụng Firebase SDK trực tiếp (bypass Firestore rules){'\n'}
            • Cập nhật TẤT CẢ conversations với doctorAuthUid{'\n'}
            • Giúp bác sĩ thấy tin nhắn ngay lập tức
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={forceUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang cập nhật...' : 'Force Update'}
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
    backgroundColor: '#dc3545',
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
  },
});
