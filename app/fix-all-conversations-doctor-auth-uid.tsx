import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAllDocuments, updateDocument } from './services/firebaseService';

export default function FixAllConversationsDoctorAuthUid() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [fixing, setFixing] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const fixAllConversations = async () => {
    try {
      setFixing(true);
      setLogs([]);
      
      addLog('🔧 Starting to fix all conversations...\n');
      
      // 1. Load all conversations (this may fail due to permissions)
      addLog('📥 Loading all conversations...');
      let conversations: any[] = [];
      
      try {
        conversations = await getAllDocuments('conversations');
        addLog(`✅ Found ${conversations.length} conversations\n`);
      } catch (error: any) {
        const errorMsg = error?.message || error?.code || 'Unknown error';
        addLog(`⚠️  Could not load all conversations: ${errorMsg}`);
        addLog(`💡 This might be a permission issue. Trying alternative approach...\n`);
        
        // Alternative: Only fix conversations for current user
        Alert.alert(
          'Permission Error',
          'Cannot access all conversations. This script needs admin access. Please use Firebase Console or admin script instead.',
          [{ text: 'OK' }]
        );
        setFixing(false);
        return;
      }
      
      // 2. Load all doctor users to create doctorId -> authUid mapping
      addLog('👨‍⚕️ Loading all doctor users...');
      const users = await getAllDocuments('users');
      const doctorUsers = users.filter((u: any) => u.role === 'doctor' && u.doctorInfo?.doctorId);
      addLog(`✅ Found ${doctorUsers.length} doctor users\n`);
      
      // Create mapping: doctorId (bs001, bs004) -> authUid (Firebase UID)
      const doctorIdToAuthUid: { [key: string]: string } = {};
      doctorUsers.forEach((user: any) => {
        const doctorId = user.doctorInfo.doctorId;
        const authUid = user.uid;
        if (doctorId && authUid) {
          doctorIdToAuthUid[doctorId] = authUid;
          addLog(`   ${doctorId} -> ${authUid}`);
        }
      });
      addLog(`\n✅ Created mapping for ${Object.keys(doctorIdToAuthUid).length} doctors\n`);
      
      // 3. Fix each conversation
      let fixed = 0;
      let skipped = 0;
      let failed = 0;
      
      addLog('🔧 Fixing conversations...\n');
      
      for (const conv of conversations) {
        const conversationData = conv as any;
        const conversationId = conversationData.id;
        const doctorId = conversationData.doctorId;
        const currentDoctorAuthUid = conversationData.doctorAuthUid;
        const patientName = conversationData.patientName || 'Unknown';
        
        // Skip if already has valid doctorAuthUid
        if (currentDoctorAuthUid && currentDoctorAuthUid !== doctorId) {
          addLog(`⏭️  Skip ${conversationId} (${patientName}) - already has doctorAuthUid`);
          skipped++;
          continue;
        }
        
        // Try to find doctorAuthUid from mapping
        const doctorAuthUid = doctorIdToAuthUid[doctorId];
        
        if (!doctorAuthUid) {
          addLog(`❌ FAILED ${conversationId} (${patientName}) - doctorId ${doctorId} not found in users`);
          failed++;
          continue;
        }
        
        // Update conversation with doctorAuthUid
        try {
          await updateDocument('conversations', conversationId, {
            doctorAuthUid: doctorAuthUid
          });
          addLog(`✅ FIXED ${conversationId} (${patientName}) - set doctorAuthUid to ${doctorAuthUid}`);
          fixed++;
        } catch (error: any) {
          const errorMsg = error?.message || error?.code || 'Unknown error';
          addLog(`❌ ERROR ${conversationId} (${patientName}) - ${errorMsg}`);
          failed++;
        }
      }
      
      addLog(`\n=== SUMMARY ===`);
      addLog(`✅ Fixed: ${fixed}`);
      addLog(`⏭️  Skipped: ${skipped}`);
      addLog(`❌ Failed: ${failed}`);
      addLog(`📊 Total: ${conversations.length}`);
      
      Alert.alert(
        'Hoàn thành',
        `Fixed ${fixed} conversations\nSkipped ${skipped}\nFailed ${failed}`,
        [{ text: 'OK' }]
      );
      
      setFixing(false);
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || JSON.stringify(error);
      addLog(`\n❌ ERROR: ${errorMessage}`);
      console.error('Full error:', error);
      Alert.alert('Lỗi', errorMessage);
      setFixing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix All Conversations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#0ea5e9" />
          <Text style={styles.infoText}>
            This will update all conversations to add doctorAuthUid field for proper doctor chat access.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, fixing && styles.buttonDisabled]}
          onPress={fixAllConversations}
          disabled={fixing}
        >
          <Ionicons name="construct" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {fixing ? 'Fixing...' : 'Fix All Conversations'}
          </Text>
        </TouchableOpacity>

        {/* Logs */}
        {logs.length > 0 && (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Logs:</Text>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#475569',
    marginBottom: 4,
  },
});
