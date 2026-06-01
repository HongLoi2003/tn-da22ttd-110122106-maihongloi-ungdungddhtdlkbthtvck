import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocumentById, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function FindAndFixMissingConversations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const fixAllConversations = async () => {
    setLoading(true);
    setResult('Đang tìm kiếm conversations...\n\n');

    try {
      // Lấy TẤT CẢ conversations
      const allConversations = await getDocumentsWithQuery('conversations', []);
      
      setResult(prev => prev + `Tìm thấy ${allConversations.length} conversations\n\n`);

      let fixed = 0;
      let skipped = 0;
      let errors = 0;

      for (const conv of allConversations) {
        const convData = conv as any;
        
        // Bỏ qua nếu đã có doctorAuthUid
        if (convData.doctorAuthUid) {
          skipped++;
          continue;
        }

        const doctorId = convData.doctorId;
        if (!doctorId) {
          setResult(prev => prev + `⚠️ Conversation ${conv.id} không có doctorId\n`);
          errors++;
          continue;
        }

        setResult(prev => prev + `\n🔍 Conversation ${conv.id}\n`);
        setResult(prev => prev + `   Patient: ${convData.patientName}\n`);
        setResult(prev => prev + `   Doctor ID: ${doctorId}\n`);

        try {
          // Lấy thông tin bác sĩ từ doctors collection
          const doctorData = await getDocumentById('doctors', doctorId);
          
          if (!doctorData) {
            setResult(prev => prev + `   ❌ Không tìm thấy doctor document\n`);
            errors++;
            continue;
          }

          const authUid = (doctorData as any).authUid;
          
          if (!authUid) {
            setResult(prev => prev + `   ❌ Doctor không có authUid\n`);
            errors++;
            continue;
          }

          // Cập nhật conversation
          await updateDocument('conversations', conv.id, {
            doctorAuthUid: authUid
          });

          setResult(prev => prev + `   ✅ Đã cập nhật với authUid: ${authUid}\n`);
          fixed++;

        } catch (error) {
          setResult(prev => prev + `   ❌ Lỗi: ${error}\n`);
          errors++;
        }
      }

      setResult(prev => prev + `\n\n📊 Tổng kết:\n`);
      setResult(prev => prev + `✅ Đã sửa: ${fixed}\n`);
      setResult(prev => prev + `⏭️ Bỏ qua (đã có authUid): ${skipped}\n`);
      setResult(prev => prev + `❌ Lỗi: ${errors}\n`);
      setResult(prev => prev + `\n🎉 Hoàn thành!\n`);

    } catch (error) {
      setResult(prev => prev + `\n❌ Lỗi: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sửa Tất Cả Conversations</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Script này sẽ:</Text>
          <Text style={styles.infoText}>• Tìm tất cả conversations</Text>
          <Text style={styles.infoText}>• Kiểm tra conversations thiếu doctorAuthUid</Text>
          <Text style={styles.infoText}>• Lấy authUid từ doctors collection</Text>
          <Text style={styles.infoText}>• Cập nhật field doctorAuthUid</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={fixAllConversations}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Bắt đầu sửa</Text>
          )}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Kết quả:</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#00BCD4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
