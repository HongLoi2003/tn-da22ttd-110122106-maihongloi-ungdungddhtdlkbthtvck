import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from './config/firebase';

export default function DeleteAllAppointmentsScreen() {
  const router = useRouter();
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    countAppointments();
  }, []);

  const countAppointments = async () => {
    try {
      setLoading(true);
      if (!db) {
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(collection(db, 'appointments'));
      setTotalAppointments(snapshot.docs.length);
      console.log('📊 Total appointments:', snapshot.docs.length);
    } catch (error) {
      console.error('❌ Error counting appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllAppointments = async () => {
    try {
      setDeleting(true);
      console.log('🗑️ Starting to delete all appointments...');

      if (!db) {
        Alert.alert('Lỗi', 'Firebase not initialized');
        setDeleting(false);
        return;
      }

      const snapshot = await getDocs(collection(db, 'appointments'));
      console.log('📋 Found', snapshot.docs.length, 'appointments to delete');

      let deletedCount = 0;
      for (const docSnapshot of snapshot.docs) {
        try {
          await deleteDoc(doc(db, 'appointments', docSnapshot.id));
          deletedCount++;
          console.log(`✅ Deleted ${deletedCount}/${snapshot.docs.length}`);
        } catch (error) {
          console.error('❌ Error deleting document:', docSnapshot.id, error);
        }
      }

      console.log('✅ Deleted all appointments:', deletedCount);
      setDeleted(true);
      setTotalAppointments(0);

      Alert.alert(
        'Thành công',
        `Đã xóa ${deletedCount} appointments từ Firebase`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('❌ Error deleting appointments:', error);
      Alert.alert('Lỗi', 'Không thể xóa appointments');
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '⚠️ Xác nhận xóa',
      `Bạn chắc chắn muốn xóa tất cả ${totalAppointments} appointments từ Firebase?\n\nHành động này không thể hoàn tác!`,
      [
        { text: 'Hủy', onPress: () => {}, style: 'cancel' },
        {
          text: 'Xóa tất cả',
          onPress: deleteAllAppointments,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗑️ Xóa Tất cả Appointments</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Đang kiểm tra...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Thông tin</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Tổng số appointments:</Text>
                <Text style={styles.infoValue}>{totalAppointments}</Text>
              </View>
            </View>

            {totalAppointments === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-circle" size={64} color="#06D6A0" />
                <Text style={styles.emptyText}>✅ Không có appointments nào</Text>
                <Text style={styles.emptySubtext}>
                  Tất cả appointments đã được xóa hoặc collection trống
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚠️ Cảnh báo</Text>
                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                    <View style={styles.warningContent}>
                      <Text style={styles.warningTitle}>Hành động này không thể hoàn tác!</Text>
                      <Text style={styles.warningText}>
                        Bạn sắp xóa {totalAppointments} appointments từ Firebase.
                      </Text>
                      <Text style={styles.warningText}>
                        Sau khi xóa, bạn sẽ cần đặt lịch khám mới.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 Các bước tiếp theo</Text>
                  <View style={styles.stepsBox}>
                    <StepItem number={1} text="Xóa tất cả appointments cũ" />
                    <StepItem number={2} text="Đăng xuất và đăng nhập lại" />
                    <StepItem number={3} text="Đặt lịch khám mới" />
                    <StepItem number={4} text="Appointments sẽ hiển thị đúng" />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.deleteButtonText}>Đang xóa...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.deleteButtonText}>
                        Xóa {totalAppointments} Appointments
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ℹ️ Thông tin</Text>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoTextLabel}>Tại sao cần xóa?</Text>
                <Text style={styles.infoText}>
                  • Appointments cũ thuộc user khác
                </Text>
                <Text style={styles.infoText}>
                  • User UID không khớp
                </Text>
                <Text style={styles.infoText}>
                  • Cần xóa để bắt đầu lại với user hiện tại
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#FF6B6B',
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
    color: '#FF6B6B',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06D6A0',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
  warningBox: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    flexDirection: 'row',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C92A2A',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#C92A2A',
    marginBottom: 4,
  },
  stepsBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    fontSize: 13,
    color: '#0f172a',
    flex: 1,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoTextBox: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  infoTextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});
