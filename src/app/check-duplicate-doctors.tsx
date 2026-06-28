import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function CheckDuplicateDoctors() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const checkDuplicates = async () => {
    setChecking(true);
    setLogs([]);

    try {
      addLog('🔍 KIỂM TRA TÀI KHOẢN DUPLICATE\n');
      addLog('─────────────────────────────────\n');

      // Get all doctors
      const doctors = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor')
      ]);

      addLog(`📊 Tổng số bác sĩ: ${doctors.length}\n`);

      // Group by doctorId
      const doctorIdMap = new Map<string, any[]>();
      
      for (const doctor of doctors) {
        const doctorData = doctor as any;
        const doctorId = doctorData.doctorInfo?.doctorId;
        
        if (doctorId) {
          if (!doctorIdMap.has(doctorId)) {
            doctorIdMap.set(doctorId, []);
          }
          doctorIdMap.get(doctorId)?.push(doctorData);
        }
      }

      // Find duplicates
      const duplicates: Array<{doctorId: string, accounts: any[]}> = [];
      
      doctorIdMap.forEach((accounts, doctorId) => {
        if (accounts.length > 1) {
          duplicates.push({ doctorId, accounts });
        }
      });

      if (duplicates.length === 0) {
        addLog('✅ KHÔNG CÓ TÀI KHOẢN DUPLICATE!\n');
        addLog('Tất cả doctorId là duy nhất.');
      } else {
        addLog(`⚠️  TÌM THẤY ${duplicates.length} DOCTOR ID BỊ DUPLICATE:\n`);
        
        for (const dup of duplicates) {
          addLog(`🔴 Doctor ID: ${dup.doctorId} (${dup.accounts.length} tài khoản)\n`);
          
          dup.accounts.forEach((account, index) => {
            addLog(`   ${index + 1}. ${account.fullName || 'Không có tên'}`);
            addLog(`      📧 ${account.email}`);
            addLog(`      🔑 UID: ${account.uid}`);
            addLog(`      📅 Created: ${account.createdAt || 'N/A'}\n`);
          });
          
          addLog('─────────────────────────────────\n');
        }
      }

      // Check specific doctors
      addLog('🎯 KIỂM TRA CỤ THỂ 3 BÁC SĨ:\n');
      
      const targetDoctors = [
        'Trần Thị Lan',
        'Đỗ Minh Tuấn', 
        'Nguyễn Văn An'
      ];

      for (const name of targetDoctors) {
        const matches = doctors.filter((d: any) => 
          d.fullName?.toLowerCase().includes(name.toLowerCase())
        );
        
        addLog(`👤 ${name}:`);
        
        if (matches.length === 0) {
          addLog(`   ❌ Không tìm thấy\n`);
        } else {
          addLog(`   ✅ Tìm thấy ${matches.length} tài khoản:\n`);
          
          matches.forEach((match: any, index) => {
            addLog(`   ${index + 1}. ${match.fullName}`);
            addLog(`      📧 ${match.email}`);
            addLog(`      🆔 doctorId: ${match.doctorInfo?.doctorId || 'N/A'}`);
            addLog(`      🔑 auth UID: ${match.uid}\n`);
          });
        }
      }

      // Group by fullName to find same-name duplicates
      addLog('─────────────────────────────────\n');
      addLog('🔎 TÌM TÀI KHOẢN CÙNG TÊN:\n');
      
      const nameMap = new Map<string, any[]>();
      
      for (const doctor of doctors) {
        const doctorData = doctor as any;
        const name = doctorData.fullName?.trim().toLowerCase();
        
        if (name) {
          if (!nameMap.has(name)) {
            nameMap.set(name, []);
          }
          nameMap.get(name)?.push(doctorData);
        }
      }

      const sameNameDuplicates: Array<{name: string, accounts: any[]}> = [];
      
      nameMap.forEach((accounts, name) => {
        if (accounts.length > 1) {
          sameNameDuplicates.push({ name, accounts });
        }
      });

      if (sameNameDuplicates.length === 0) {
        addLog('✅ Không có bác sĩ nào trùng tên.\n');
      } else {
        addLog(`⚠️  Tìm thấy ${sameNameDuplicates.length} tên bị trùng:\n`);
        
        for (const dup of sameNameDuplicates) {
          addLog(`🔴 Tên: ${dup.accounts[0].fullName} (${dup.accounts.length} tài khoản)\n`);
          
          dup.accounts.forEach((account, index) => {
            addLog(`   ${index + 1}. ${account.email}`);
            addLog(`      🆔 doctorId: ${account.doctorInfo?.doctorId || 'N/A'}`);
            addLog(`      🔑 UID: ${account.uid}\n`);
          });
        }
      }

    } catch (error: any) {
      addLog(`\n❌ LỖI: ${error.message}`);
      console.error('Error checking duplicates:', error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm Tra Duplicate</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>🔍 Kiểm Tra Tài Khoản Duplicate</Text>
          <Text style={styles.description}>
            Script này sẽ kiểm tra:
            {'\n\n'}
            1. Doctor ID bị trùng lặp
            {'\n'}2. Tài khoản cùng tên
            {'\n'}3. Cụ thể 3 bác sĩ: Trần Thị Lan, Đỗ Minh Tuấn, Nguyễn Văn An
          </Text>

          <TouchableOpacity
            style={[styles.button, checking && styles.buttonDisabled]}
            onPress={checkDuplicates}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.buttonText}>Kiểm Tra</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {logs.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={styles.logTitle}>📋 Kết Quả:</Text>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
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
    backgroundColor: '#f8f9fa',
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
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  logText: {
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
