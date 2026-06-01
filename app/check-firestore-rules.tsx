import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from './config/firebase';

export default function CheckFirestoreRulesScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const checkRules = async () => {
    setChecking(true);
    const testResults: any = {
      timestamp: new Date().toISOString(),
      collections: {},
      summary: {
        total: 0,
        accessible: 0,
        blocked: 0,
      }
    };

    const collectionsToTest = [
      'specialties',
      'popular-specialties',
      'common-symptoms',
      'hospitals',
      'doctors',
      'users',
      'appointments',
    ];

    for (const collectionName of collectionsToTest) {
      testResults.summary.total++;
      try {
        const q = query(collection(db, collectionName), limit(1));
        const snapshot = await getDocs(q);
        
        testResults.collections[collectionName] = {
          status: 'accessible',
          icon: 'checkmark-circle',
          color: '#4CAF50',
          message: `✅ OK - ${snapshot.size} documents`,
          docCount: snapshot.size,
        };
        testResults.summary.accessible++;
      } catch (error: any) {
        const isPermissionError = error.code === 'permission-denied' || 
                                 error.message?.includes('permission');
        
        testResults.collections[collectionName] = {
          status: isPermissionError ? 'permission-denied' : 'error',
          icon: isPermissionError ? 'lock-closed' : 'alert-circle',
          color: isPermissionError ? '#FF5722' : '#FFC107',
          message: isPermissionError 
            ? '🚫 PERMISSION DENIED' 
            : `⚠️ Error: ${error.message}`,
          error: error.message,
        };
        testResults.summary.blocked++;
      }
    }

    setResults(testResults);
    setChecking(false);
  };

  const openFirebaseConsole = () => {
    Alert.alert(
      '🔥 Mở Firebase Console',
      'Bạn sẽ được chuyển đến Firebase Console để deploy Firestore Rules',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mở Console',
          onPress: () => {
            Linking.openURL('https://console.firebase.google.com');
          }
        }
      ]
    );
  };

  const showDeployInstructions = () => {
    Alert.alert(
      '📋 Hướng dẫn Deploy Rules',
      '1. Mở Firebase Console\n' +
      '2. Chọn project của bạn\n' +
      '3. Vào Firestore Database → Rules\n' +
      '4. Thêm rule cho popular-specialties:\n\n' +
      'match /popular-specialties/{id} {\n' +
      '  allow read: if true;\n' +
      '  allow write: if request.auth != null;\n' +
      '}\n\n' +
      '5. Click nút "Publish"\n' +
      '6. Đợi 5-10 giây\n' +
      '7. Quay lại đây và test lại',
      [
        { text: 'Đã hiểu', style: 'default' },
        {
          text: 'Mở Console',
          onPress: openFirebaseConsole
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra Firestore Rules</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={32} color="#2196F3" />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Kiểm tra quyền truy cập</Text>
            <Text style={styles.infoBannerSubtitle}>
              Tool này sẽ test xem Firestore Rules đã được deploy đúng chưa
            </Text>
          </View>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={checkRules}
          disabled={checking}
        >
          {checking ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.testButtonText}>Đang kiểm tra...</Text>
            </>
          ) : (
            <>
              <Ionicons name="play-circle" size={24} color="#fff" />
              <Text style={styles.testButtonText}>Bắt đầu kiểm tra</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {results && (
          <>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📊 Tổng quan</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{results.summary.total}</Text>
                  <Text style={styles.summaryLabel}>Tổng số</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
                    {results.summary.accessible}
                  </Text>
                  <Text style={styles.summaryLabel}>Truy cập OK</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#FF5722' }]}>
                    {results.summary.blocked}
                  </Text>
                  <Text style={styles.summaryLabel}>Bị chặn</Text>
                </View>
              </View>
              <Text style={styles.timestamp}>
                Kiểm tra lúc: {new Date(results.timestamp).toLocaleTimeString('vi-VN')}
              </Text>
            </View>

            {/* Collection Results */}
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>📁 Chi tiết từng collection</Text>
              {Object.entries(results.collections).map(([name, data]: [string, any]) => (
                <View key={name} style={styles.collectionCard}>
                  <View style={styles.collectionHeader}>
                    <Ionicons name={data.icon} size={24} color={data.color} />
                    <Text style={styles.collectionName}>{name}</Text>
                  </View>
                  <Text style={[styles.collectionStatus, { color: data.color }]}>
                    {data.message}
                  </Text>
                  {data.error && (
                    <Text style={styles.errorDetail}>{data.error}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            {results.summary.blocked > 0 && (
              <View style={styles.actionSection}>
                <Text style={styles.actionTitle}>🚨 Phát hiện lỗi permission!</Text>
                <Text style={styles.actionSubtitle}>
                  Bạn cần deploy Firestore Rules lên Firebase Console
                </Text>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={showDeployInstructions}
                >
                  <Ionicons name="book" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Xem hướng dẫn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={openFirebaseConsole}
                >
                  <Ionicons name="open" size={20} color="#2196F3" />
                  <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>
                    Mở Firebase Console
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Success Message */}
            {results.summary.blocked === 0 && (
              <View style={styles.successSection}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.successTitle}>🎉 Hoàn hảo!</Text>
                <Text style={styles.successSubtitle}>
                  Tất cả collections đều truy cập được. Firestore Rules đã được deploy đúng!
                </Text>
              </View>
            )}
          </>
        )}

        {/* Instructions */}
        {!results && (
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>📖 Cách sử dụng</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Click nút "Bắt đầu kiểm tra" để test quyền truy cập
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Xem kết quả để biết collection nào bị lỗi permission
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Nếu có lỗi, làm theo hướng dẫn để deploy rules
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Sau khi deploy xong, quay lại và test lại
              </Text>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoBannerSubtitle: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  resultsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  collectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  collectionStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorDetail: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  actionSection: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#C62828',
    marginBottom: 16,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  successSection: {
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 32,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
