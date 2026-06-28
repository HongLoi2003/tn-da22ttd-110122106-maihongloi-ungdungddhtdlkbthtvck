import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteDocument, getDocumentsWithQuery } from './services/firebaseService';

export default function DeleteDuplicateTestAccounts() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const accountsToDelete = [
    { email: 'bacsi@test.com', doctorId: 'bs002', reason: 'Duplicate test account' },
    { email: 'doctor@test.com', doctorId: 'bs001', reason: 'Duplicate test account' },
  ];

  const deleteAccounts = async () => {
    Alert.alert(
      '⚠️ Xác nhận xóa',
      'Bạn có chắc muốn xóa 2 tài khoản test duplicate?\n\n• bacsi@test.com (bs002)\n• doctor@test.com (bs001)\n\nHành động này KHÔNG THỂ hoàn tác!',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setLogs([]);

            try {
              addLog('🗑️  BẮT ĐẦU XÓA TÀI KHOẢN DUPLICATE...\n');
              addLog('─────────────────────────────────\n');

              let deletedCount = 0;
              let failedCount = 0;

              for (const account of accountsToDelete) {
                addLog(`🔍 Đang tìm: ${account.email}`);

                try {
                  // Find user by email
                  const users = await getDocumentsWithQuery('users', [
                    where('email', '==', account.email)
                  ]);

                  if (users.length === 0) {
                    addLog(`   ⚠️  Không tìm thấy user với email này\n`);
                    failedCount++;
                    continue;
                  }

                  const user = users[0] as any;
                  const userId = user.id;
                  const uid = user.uid;
                  const fullName = user.fullName;
                  const doctorId = user.doctorInfo?.doctorId;

                  addLog(`   📧 Email: ${account.email}`);
                  addLog(`   👤 Tên: ${fullName}`);
                  addLog(`   🆔 Doctor ID: ${doctorId}`);
                  addLog(`   🔑 Auth UID: ${uid}`);
                  addLog(`   🗑️  Đang xóa...`);

                  // Delete from Firestore users collection
                  await deleteDocument('users', userId);

                  addLog(`   ✅ Đã xóa thành công!\n`);
                  deletedCount++;

                  // Note: Firebase Auth user needs to be deleted manually from Firebase Console
                  addLog(`   ⚠️  LƯU Ý: Cần xóa thủ công từ Firebase Auth Console:`);
                  addLog(`      UID: ${uid}\n`);

                } catch (error: any) {
                  addLog(`   ❌ LỖI: ${error.message}\n`);
                  failedCount++;
                }
              }

              addLog('─────────────────────────────────\n');
              addLog('📊 TỔNG KẾT:\n');
              addLog(`✅ Đã xóa: ${deletedCount} tài khoản`);
              addLog(`❌ Thất bại: ${failedCount} tài khoản\n`);

              if (deletedCount > 0) {
                addLog('⚠️  LƯU Ý QUAN TRỌNG:\n');
                addLog('Tài khoản đã bị xóa khỏi Firestore, nhưng vẫn còn trong Firebase Authentication.');
                addLog('Bạn cần vào Firebase Console → Authentication → Users và xóa thủ công các UID đã liệt kê ở trên.\n');
                addLog('🔗 https://console.firebase.google.com/');
              }

            } catch (error: any) {
              addLog(`\n❌ LỖI NGHIÊM TRỌNG: ${error.message}`);
              console.error('Error deleting accounts:', error);
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xóa Tài Khoản Duplicate</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={48} color="#f59e0b" />
          <Text style={styles.warningTitle}>⚠️ CẢNH BÁO</Text>
          <Text style={styles.warningText}>
            Hành động này sẽ XÓA VĨNH VIỄN các tài khoản test duplicate.
            {'\n\n'}
            KHÔNG THỂ HOÀN TÁC!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🗑️ Các Tài Khoản Sẽ Bị Xóa</Text>
          
          {accountsToDelete.map((account, index) => (
            <View key={index} style={styles.accountItem}>
              <View style={styles.accountIcon}>
                <Ionicons name="person-remove" size={20} color="#ef4444" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountEmail}>{account.email}</Text>
                <Text style={styles.accountDetail}>Doctor ID: {account.doctorId}</Text>
                <Text style={styles.accountReason}>{account.reason}</Text>
              </View>
            </View>
          ))}

          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.noteText}>
              Sau khi xóa, bạn cần vào Firebase Console để xóa thủ công các tài khoản khỏi Authentication.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={deleteAccounts}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.buttonText}>Xóa Tài Khoản</Text>
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
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  accountDetail: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  accountReason: {
    fontSize: 12,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
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
