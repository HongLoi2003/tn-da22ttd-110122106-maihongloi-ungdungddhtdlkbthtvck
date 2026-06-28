import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { resetAndReseedData } from './scripts/seedCorrectData';
import { seedFirebaseData } from './scripts/seedFirebase';

export default function CleanAndImportDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCleanAndImport = async () => {
    Alert.alert(
      '🚨 XÁC NHẬN THAO TÁC',
      'Bạn sắp:\n\n' +
      '❌ XÓA TẤT CẢ dữ liệu cũ trên Firebase\n' +
      '✅ IMPORT LẠI dữ liệu mới từ file JSON\n\n' +
      'Hành động này sẽ:\n' +
      '• Xóa tất cả doctors, hospitals, appointments, users, etc.\n' +
      '• Import lại từ file JSON với format đúng\n' +
      '• Không thể hoàn tác!\n\n' +
      '⚠️ Quá trình có thể mất vài phút!',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'TIẾP TỤC XÓA & IMPORT',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setResult('🔄 Đang xóa tất cả dữ liệu cũ...\n');
            setSuccess(false);

            try {
              console.clear();
              console.log('🚀 [CLEAN] Bắt đầu xóa và import lại dữ liệu...');

              // Step 1: Reset and reseed with correct format
              setResult((prev) => prev + '✅ Đã xóa dữ liệu cũ\n');
              setResult((prev) => prev + '🌱 Đang import dữ liệu mới...\n');

              await resetAndReseedData();

              setResult((prev) => prev + '✅ Đã import dữ liệu mới\n');
              setResult((prev) => prev + '🔄 Đang seed dữ liệu bổ sung...\n');

              // Step 2: Seed additional data
              await seedFirebaseData();

              setResult((prev) => prev + '✅ Đã seed dữ liệu bổ sung\n\n');
              setResult((prev) => prev + '🎉 HOÀN THÀNH!\n\n');
              setResult((prev) => prev + '📊 Dữ liệu đã được cập nhật:\n');
              setResult((prev) => prev + '• 16 Bác sĩ\n');
              setResult((prev) => prev + '• 6 Bệnh viện\n');
              setResult((prev) => prev + '• 6 Lịch khám\n');
              setResult((prev) => prev + '• 2 Người dùng\n');
              setResult((prev) => prev + '• 12 Chuyên khoa\n');
              setResult((prev) => prev + '• 6 Triệu chứng\n');
              setResult((prev) => prev + '• Và nhiều dữ liệu khác\n\n');
              setResult((prev) => prev + '✨ Tất cả dữ liệu đã sẵn sàng!');

              setSuccess(true);
              console.log('✅ [CLEAN] Hoàn tất xóa và import lại dữ liệu!');
            } catch (error) {
              console.error('❌ [CLEAN] Lỗi:', error);
              const errorMessage = error instanceof Error ? error.message : 'Không xác định';
              setResult((prev) => prev + `\n\n❌ LỖI: ${errorMessage}`);
              setSuccess(false);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xóa & Import Dữ liệu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧹 Làm Sạch & Import Lại</Text>
          <Text style={styles.description}>
            Xóa tất cả dữ liệu cũ trên Firebase và import lại dữ liệu mới từ file JSON
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={24} color="#DC2626" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>⚠️ Cảnh báo</Text>
              <Text style={styles.warningText}>
                Hành động này sẽ xóa TẤT CẢ dữ liệu hiện tại trên Firebase và không thể hoàn tác!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton, loading && styles.buttonDisabled]}
            onPress={handleCleanAndImport}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.buttonText}>Đang xử lý...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="nuclear-outline" size={28} color="#fff" />
                <View>
                  <Text style={styles.buttonText}>XÓA & IMPORT LẠI</Text>
                  <Text style={styles.buttonSubtext}>Xóa tất cả & import dữ liệu mới</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.section}>
            <View style={[styles.resultBox, success ? styles.resultSuccess : styles.resultError]}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={success ? 'checkmark-circle' : 'alert-circle'} 
                  size={24} 
                  color={success ? '#059669' : '#DC2626'} 
                />
                <Text style={[styles.resultTitle, success ? styles.resultTitleSuccess : styles.resultTitleError]}>
                  {success ? 'Thành công!' : 'Lỗi'}
                </Text>
              </View>
              <Text style={[styles.resultText, success ? styles.resultTextSuccess : styles.resultTextError]}>
                {result}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.infoTitle}>📋 Dữ liệu sẽ được import:</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoItem}>✓ 16 Bác sĩ (12 chuyên khoa)</Text>
            <Text style={styles.infoItem}>✓ 6 Bệnh viện</Text>
            <Text style={styles.infoItem}>✓ 6 Lịch khám</Text>
            <Text style={styles.infoItem}>✓ 2 Người dùng</Text>
            <Text style={styles.infoItem}>✓ 12 Chuyên khoa</Text>
            <Text style={styles.infoItem}>✓ 6 Triệu chứng thường gặp</Text>
            <Text style={styles.infoItem}>✓ 3 Cuộc hội thoại</Text>
            <Text style={styles.infoItem}>✓ 10 Tin nhắn</Text>
            <Text style={styles.infoItem}>✓ 5 Hồ sơ bệnh án</Text>
            <Text style={styles.infoItem}>✓ 2 Đơn thuốc</Text>
            <Text style={styles.infoItem}>✓ 8 Thông báo</Text>
            <Text style={styles.infoItem}>✓ 12 Bình luận</Text>
            <Text style={styles.infoItem}>✓ 2 Bảo hiểm</Text>
            <Text style={styles.infoItem}>✓ 3 Quyền lợi bảo hiểm</Text>
            <Text style={styles.infoItem}>✓ 2 Yêu cầu bảo hiểm</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.infoTitle}>🔍 Quá trình thực hiện:</Text>
          <View style={styles.stepsBox}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Xóa tất cả dữ liệu cũ</Text>
                <Text style={styles.stepDesc}>Xóa tất cả collections trên Firebase</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Import dữ liệu mới</Text>
                <Text style={styles.stepDesc}>Import từ file JSON với format đúng</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Seed dữ liệu bổ sung</Text>
                <Text style={styles.stepDesc}>Thêm dữ liệu bổ sung từ các file khác</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>✓</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Hoàn thành</Text>
                <Text style={styles.stepDesc}>Dữ liệu sẵn sàng sử dụng</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.infoTitle}>💡 Lưu ý:</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteItem}>• Đảm bảo đã cấu hình Firebase trong .env.local</Text>
            <Text style={styles.noteItem}>• Quá trình có thể mất vài phút</Text>
            <Text style={styles.noteItem}>• Không thể hoàn tác hành động này</Text>
            <Text style={styles.noteItem}>• Chỉ sử dụng cho development</Text>
            <Text style={styles.noteItem}>• Kiểm tra console để xem chi tiết</Text>
          </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#991B1B',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#FEE2E2',
    marginTop: 2,
  },
  resultBox: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  resultSuccess: {
    backgroundColor: '#D1FAE5',
    borderLeftColor: '#059669',
  },
  resultError: {
    backgroundColor: '#FEE2E2',
    borderLeftColor: '#DC2626',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultTitleSuccess: {
    color: '#059669',
  },
  resultTitleError: {
    color: '#DC2626',
  },
  resultText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  resultTextSuccess: {
    color: '#065F46',
  },
  resultTextError: {
    color: '#991B1B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  infoItem: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 6,
    lineHeight: 18,
  },
  stepsBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#7C3AED',
  },
  noteBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteItem: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 6,
    lineHeight: 18,
  },
});
