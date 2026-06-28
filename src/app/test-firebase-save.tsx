import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function TestFirebaseSaveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  const testSave = async () => {
    try {
      setTesting(true);
      setResult('');
      setLogs([]);

      if (!user) {
        addLog('❌ No user logged in');
        setResult('❌ No user logged in');
        setTesting(false);
        return;
      }

      addLog(`👤 User UID: ${user.uid}`);
      addLog('');

      // Test 1: Create a test appointment
      addLog('📝 Test 1: Creating test appointment...');
      const testAppointment = {
        userId: user.uid,
        doctor: 'Test Doctor',
        specialty: 'Test Specialty',
        hospital: 'Test Hospital',
        date: 'T4',
        fullDate: '20/05/2025',
        time: '09:00',
        duration: '30 phút',
        room: 'Phòng 204',
        floor: 'Tầng 2',
        image: 'test.png',
        patientName: 'Test Patient',
        patientPhone: '0123456789',
        patientEmail: 'test@example.com',
        patientAddress: 'Test Address',
        status: 'confirmed',
        appointmentDate: '2025-05-20T09:00:00.000Z',
        createdAt: new Date().toISOString(),
      };

      addLog('📋 Appointment data:');
      addLog(JSON.stringify(testAppointment, null, 2));
      addLog('');

      // Save to Firebase
      addLog('💾 Saving to Firebase...');
      const result = await createDocument('appointments', testAppointment);
      addLog(`✅ Saved! ID: ${result?.id}`);
      addLog('');

      // Test 2: Query back
      addLog('🔍 Test 2: Querying back...');
      const queryResult = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid),
      ]);
      addLog(`✅ Query returned ${queryResult.length} appointments`);
      addLog('');

      // Test 3: Check the saved data
      if (queryResult.length > 0) {
        addLog('📋 Saved data:');
        addLog(JSON.stringify(queryResult[0], null, 2));
        addLog('');
        addLog('✅ SUCCESS! Appointment was saved and retrieved!');
        setResult('✅ SUCCESS! Appointment was saved and retrieved!');
      } else {
        addLog('❌ FAILED! Appointment was not retrieved!');
        setResult('❌ FAILED! Appointment was not retrieved!');
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      addLog(JSON.stringify(error, null, 2));
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Firebase Save</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 User Info</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>User UID:</Text>
            <Text style={styles.infoValue}>{user?.uid || 'Not logged in'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={testSave}
          disabled={testing}
        >
          {testing ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.testButtonText}>Testing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flask" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Run Test</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Result</Text>
            <View
              style={[
                styles.resultBox,
                result.includes('SUCCESS')
                  ? styles.resultBoxSuccess
                  : styles.resultBoxError,
              ]}
            >
              <Text style={styles.resultText}>{result}</Text>
            </View>
          </View>
        )}

        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Logs</Text>
            <View style={styles.logsBox}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ What This Test Does</Text>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoTextItem}>
              1. Creates a test appointment with your user UID
            </Text>
            <Text style={styles.infoTextItem}>
              2. Saves it to Firebase using createDocument()
            </Text>
            <Text style={styles.infoTextItem}>
              3. Queries it back using getDocumentsWithQuery()
            </Text>
            <Text style={styles.infoTextItem}>
              4. Verifies the data was saved correctly
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Troubleshooting</Text>
          <View style={styles.troubleBox}>
            <Text style={styles.troubleTitle}>If test fails:</Text>
            <Text style={styles.troubleItem}>
              • Check Firebase connection
            </Text>
            <Text style={styles.troubleItem}>
              • Check Firestore rules allow writes
            </Text>
            <Text style={styles.troubleItem}>
              • Check user is authenticated
            </Text>
            <Text style={styles.troubleItem}>
              • Check console for error messages
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  testButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  resultBoxSuccess: {
    borderLeftColor: '#06D6A0',
  },
  resultBoxError: {
    borderLeftColor: '#FF6B6B',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  logsBox: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
  },
  logText: {
    fontSize: 11,
    color: '#00FF00',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  infoTextBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  infoTextItem: {
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 8,
  },
  troubleBox: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  troubleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  troubleItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});
