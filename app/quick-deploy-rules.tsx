import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import React, { useState } from 'react';
import {
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

export default function QuickDeployRulesScreen() {
  const router = useRouter();
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const testPopularSpecialties = async () => {
    setTesting(true);
    setTestResult('Đang kiểm tra...');
    
    try {
      const q = query(collection(db, 'popular-specialties'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.size > 0) {
        setTestResult('✅ THÀNH CÔNG! Rules đã được deploy đúng!\n\n' +
          `Tìm thấy ${snapshot.size} chuyên khoa.\n\n` +
          'Bây giờ bạn có thể vào trang Chuyên khoa và sẽ thấy danh mục hiển thị!');
      } else {
        setTestResult('⚠️ Collection trống!\n\n' +
          'Rules OK nhưng chưa có dữ liệu.\n\n' +
          'Hãy chạy: /seed-popular-specialties để thêm dữ liệu.');
      }
    } catch (error: any) {
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setTestResult('❌ LỖI PERMISSION!\n\n' +
          'Firestore Rules CHƯA được deploy.\n\n' +
          'Làm theo hướng dẫn bên dưới để deploy rules.');
      } else {
        setTestResult(`❌ LỖI: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const openFirebaseConsole = () => {
    Linking.openURL('https://console.firebase.google.com');
  };

  const showDetailedInstructions = () => {
    Alert.alert(
      '📋 Hướng dẫn chi tiết',
      '1. Mở Firebase Console\n' +
      '2. Chọn project của bạn\n' +
      '3. Click "Firestore Database"\n' +
      '4. Click tab "Rules"\n' +
      '5. Tìm đoạn:\n' +
      '   match /specialties/{id} {\n' +
      '     allow read: if true;\n' +
      '   }\n\n' +
      '6. NGAY SAU đoạn đó, thêm:\n' +
      '   match /popular-specialties/{id} {\n' +
      '     allow read: if true;\n' +
      '     allow write: if request.auth != null;\n' +
      '   }\n\n' +
      '7. Click "Publish"\n' +
      '8. Đợi 10 giây\n' +
      '9. Quay lại đây test lại',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deploy Firestore Rules</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#2196F3" />
          </View>
          <Text style={styles.mainTitle}>Sửa lỗi Permission</Text>
          <Text style={styles.mainSubtitle}>
            Danh mục chuyên khoa không hiện vì Firestore Rules chưa được deploy
          </Text>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={testPopularSpecialties}
          disabled={testing}
        >
          <Ionicons name="play-circle" size={24} color="#fff" />
          <Text style={styles.testButtonText}>
            {testing ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
          </Text>
        </TouchableOpacity>

        {/* Test Result */}
        {testResult !== '' && (
          <View style={[
            styles.resultCard,
            testResult.includes('✅') ? styles.resultSuccess :
            testResult.includes('⚠️') ? styles.resultWarning :
            styles.resultError
          ]}>
            <Text style={styles.resultText}>{testResult}</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>🚀 Cách deploy Rules (3 phút)</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Mở Firebase Console</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={openFirebaseConsole}
              >
                <Ionicons name="open-outline" size={16} color="#2196F3" />
                <Text style={styles.linkButtonText}>
                  console.firebase.google.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Vào Firestore Rules</Text>
              <Text style={styles.stepDescription}>
                Chọn project → Firestore Database → Tab "Rules"
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Thêm rule mới</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  match /popular-specialties/{'{'}id{'}'} {'{'}
                  {'\n'}  allow read: if true;
                  {'\n'}  allow write: if request.auth != null;
                  {'\n'}{'}'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={showDetailedInstructions}
              >
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Publish & Test</Text>
              <Text style={styles.stepDescription}>
                Click nút "Publish" → Đợi 10 giây → Quay lại đây test lại
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>⚡ Thao tác nhanh</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openFirebaseConsole}
          >
            <Ionicons name="globe" size={20} color="#2196F3" />
            <Text style={styles.actionButtonText}>Mở Firebase Console</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/seed-popular-specialties')}
          >
            <Ionicons name="cloud-upload" size={20} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Seed dữ liệu chuyên khoa</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/check-firestore-rules')}
          >
            <Ionicons name="checkmark-done" size={20} color="#FF9800" />
            <Text style={styles.actionButtonText}>Kiểm tra tất cả rules</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            File firestore.rules trong project chỉ là template. 
            Bạn PHẢI deploy thủ công lên Firebase Console thì mới có hiệu lực!
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
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultSuccess: {
    backgroundColor: '#E8F5E9',
  },
  resultWarning: {
    backgroundColor: '#FFF3E0',
  },
  resultError: {
    backgroundColor: '#FFEBEE',
  },
  resultText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
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
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#000',
    lineHeight: 18,
  },
  detailButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
});
