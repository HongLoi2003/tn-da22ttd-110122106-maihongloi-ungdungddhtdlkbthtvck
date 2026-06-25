import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function TestBackendConnection() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const testConnection = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test với các địa chỉ khác nhau
      const urls = Platform.OS === 'android' 
        ? [
            'http://10.0.2.2:3001',
            'http://localhost:3001',
          ]
        : [
            'http://localhost:3001',
            'http://127.0.0.1:3001',
          ];

      addLog(`Platform: ${Platform.OS}`);
      addLog('Starting connection tests...');

      for (const url of urls) {
        addLog(`\nTesting: ${url}`);
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          addLog(`✅ Status: ${response.status}`);
          
          const data = await response.json();
          addLog(`✅ Response: ${JSON.stringify(data)}`);

          if (data.status === 'OK') {
            addLog('🎉 SUCCESS! Backend is reachable!');
            Alert.alert('Thành công!', `Backend đang hoạt động tại:\n${url}`);
            break;
          }
        } catch (error: any) {
          addLog(`❌ Failed: ${error.message}`);
        }
      }

      addLog('\n✅ Test completed');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      Alert.alert('Lỗi', error.message);
    } finally {
      setTesting(false);
    }
  };

  const testVerifyOTP = async () => {
    setTesting(true);
    setResults([]);

    try {
      const apiBaseUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3001'
        : 'http://localhost:3001';

      const url = `${apiBaseUrl}/verify-otp`;

      addLog(`Testing verify-otp endpoint...`);
      addLog(`URL: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          otp: '123456',
        }),
      });

      addLog(`Status: ${response.status}`);
      
      const data = await response.json();
      addLog(`Response: ${JSON.stringify(data, null, 2)}`);

      if (response.status === 404) {
        addLog('✅ Endpoint works! (404 expected for test data)');
        Alert.alert('Thành công!', 'API endpoint đang hoạt động!');
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      Alert.alert('Lỗi', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Backend Connection</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Platform: {Platform.OS}</Text>
        <Text style={styles.infoText}>
          {Platform.OS === 'android' 
            ? 'Using: 10.0.2.2:3001 (Android Emulator)'
            : 'Using: localhost:3001 (iOS Simulator)'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={testConnection}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="wifi" size={24} color="#fff" />
              <Text style={styles.testButtonText}>Test Health Check</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.secondaryButton, testing && styles.testButtonDisabled]}
          onPress={testVerifyOTP}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <Text style={styles.testButtonText}>Test Verify OTP API</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>📝 Troubleshooting:</Text>
        <Text style={styles.instructionsText}>
          1. Make sure backend is running:{'\n'}
          cd email-api && npm start{'\n\n'}
          2. For Android, try:{'\n'}
          adb reverse tcp:3001 tcp:3001{'\n\n'}
          3. Check server at:{'\n'}
          http://localhost:3001
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 12,
  },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  testButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    margin: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  instructionsBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
});
