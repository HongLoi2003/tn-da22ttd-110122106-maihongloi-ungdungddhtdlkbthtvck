import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { resetAndReseedData, seedCorrectData } from './scripts/seedCorrectData';
import { getFirebaseDataReport, validateAndFixFirebaseData } from './scripts/validateAndFixFirebaseData';

export default function ValidateFirebaseDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleValidate = async () => {
    try {
      setLoading(true);
      setResult('🔍 Đang kiểm tra dữ liệu Firebase...\n');
      
      console.clear();
      await validateAndFixFirebaseData();
      
      setResult((prev) => prev + '\n✅ Kiểm tra hoàn tất!');
    } catch (error) {
      setResult((prev) => prev + `\n❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setResult('📊 Đang tạo báo cáo...\n');
      
      console.clear();
      await getFirebaseDataReport();
      
      setResult((prev) => prev + '\n✅ Báo cáo hoàn tất! Xem console để chi tiết.');
    } catch (error) {
      setResult((prev) => prev + `\n❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setResult('🌱 Đang seed dữ liệu mẫu...\n');
      
      console.clear();
      await seedCorrectData();
      
      setResult((prev) => prev + '\n✅ Seed dữ liệu hoàn tất!');
    } catch (error) {
      setResult((prev) => prev + `\n❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndReseed = async () => {
    try {
      setLoading(true);
      setResult('🔄 Đang reset và seed lại dữ liệu...\n');
      
      console.clear();
      await resetAndReseedData();
      
      setResult((prev) => prev + '\n✅ Reset và seed hoàn tất!');
    } catch (error) {
      setResult((prev) => prev + `\n❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra Firebase</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Công cụ Kiểm tra Dữ liệu</Text>
          <Text style={styles.description}>
            Kiểm tra, sửa và seed dữ liệu trên Firebase để đảm bảo format đúng
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Kiểm tra & Sửa</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleValidate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Kiểm tra & Sửa Dữ liệu</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#00BCD4" />
            ) : (
              <>
                <Ionicons name="document-text" size={20} color="#00BCD4" />
                <Text style={styles.buttonTextSecondary}>Tạo Báo cáo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Seed Dữ liệu</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={handleSeedData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="leaf" size={20} color="#fff" />
                <Text style={styles.buttonText}>Seed Dữ liệu Mẫu</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetAndReseed}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reset & Seed Lại</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>📋 Kết quả:</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Thông tin</Text>
          <Text style={styles.infoText}>
            • Kiểm tra tất cả collections: appointments, doctors, hospitals, users
          </Text>
          <Text style={styles.infoText}>
            • Xác thực format dữ liệu (date, time, status, etc.)
          </Text>
          <Text style={styles.infoText}>
            • Tự động sửa các lỗi format
          </Text>
          <Text style={styles.infoText}>
            • Thêm các field bắt buộc nếu thiếu
          </Text>
          <Text style={styles.infoText}>
            • Seed dữ liệu mẫu với format đúng
          </Text>
        </View>
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
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#00BCD4',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#00BCD4',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  successButton: {
    backgroundColor: '#06D6A0',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00BCD4',
  },
  resultSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  resultBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  resultText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00838F',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#00838F',
    marginBottom: 6,
    lineHeight: 18,
  },
});
