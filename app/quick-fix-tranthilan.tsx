import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { updateDocument } from './services/firebaseService';

export default function QuickFixTranThiLanScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const fixTranThiLan = async () => {
    try {
      setLoading(true);
      setResult('Đang cập nhật...\n');
      
      // Update bs002 (Trần Thị Lan)
      await updateDocument('doctors', 'bs002', {
        image: 'tranthilan.png',
        hinh_anh: 'tranthilan.png',
      });
      
      setResult('✅ Đã cập nhật ảnh cho BS. Trần Thị Lan (bs002)\n');
      setResult(prev => prev + '📸 Image: tranthilan.png\n');
      setResult(prev => prev + '\n✨ Vui lòng tải lại trang để thấy thay đổi!');
      
      Alert.alert(
        'Hoàn thành',
        'Đã sửa ảnh bác sĩ Trần Thị Lan. Vui lòng tải lại trang!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error fixing:', error);
      setResult('❌ Lỗi: ' + error);
      Alert.alert('Lỗi', 'Không thể cập nhật: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Fix Trần Thị Lan</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Sửa ảnh BS. Trần Thị Lan</Text>
          <Text style={styles.description}>
            Tool này sẽ cập nhật field "image" và "hinh_anh" cho bác sĩ Trần Thị Lan (bs002) 
            thành "tranthilan.png"
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={fixTranThiLan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sửa ngay</Text>
            )}
          </TouchableOpacity>

          {result ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 16,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
});
