import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from './config/firebase';

export default function DebugFirebaseScreen() {
  const router = useRouter();
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!db) {
        setError('❌ Firebase not initialized');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching ALL appointments from Firebase...');

      // Get all appointments without any filter
      const snapshot = await getDocs(collection(db, 'appointments'));

      console.log('✅ Total appointments in collection:', snapshot.docs.length);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('📋 All appointments:', JSON.stringify(data, null, 2));

      setAllAppointments(data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Firebase - Tất cả Appointments</Text>
        <TouchableOpacity onPress={loadAllData}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Tổng số Appointments</Text>
              <View style={styles.countBox}>
                <Text style={styles.countNumber}>{allAppointments.length}</Text>
                <Text style={styles.countLabel}>appointments trong Firebase</Text>
              </View>
            </View>

            {allAppointments.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
                <Text style={styles.emptyText}>❌ Không có appointments nào trong Firebase!</Text>
                <Text style={styles.emptySubtext}>
                  Điều này có nghĩa appointments không được lưu vào Firebase khi đặt lịch.
                </Text>
              </View>
            )}

            {allAppointments.length > 0 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>👤 User IDs trong Appointments</Text>
                  <View style={styles.userIdBox}>
                    {Array.from(new Set(allAppointments.map(apt => apt.userId))).map((userId, index) => (
                      <View key={index} style={styles.userIdItem}>
                        <Text style={styles.userIdLabel}>User {index + 1}:</Text>
                        <Text style={styles.userIdValue}>{userId}</Text>
                        <Text style={styles.userIdCount}>
                          ({allAppointments.filter(apt => apt.userId === userId).length} appointments)
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 Chi tiết Appointments</Text>
                  {allAppointments.map((apt, index) => (
                    <View key={index} style={styles.appointmentBox}>
                      <View style={styles.appointmentHeader}>
                        <Text style={styles.appointmentIndex}>Appointment #{index + 1}</Text>
                        <Text style={styles.appointmentId}>{apt.id}</Text>
                      </View>

                      <View style={styles.appointmentDetails}>
                        <DetailRow label="userId" value={apt.userId} />
                        <DetailRow label="doctor" value={apt.doctor} />
                        <DetailRow label="specialty" value={apt.specialty} />
                        <DetailRow label="hospital" value={apt.hospital} />
                        <DetailRow label="fullDate" value={apt.fullDate} />
                        <DetailRow label="time" value={apt.time} />
                        <DetailRow label="appointmentDate" value={apt.appointmentDate} />
                        <DetailRow label="createdAt" value={apt.createdAt} />
                        <DetailRow label="status" value={apt.status} />
                        <DetailRow label="patientName" value={apt.patientName} />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Troubleshooting</Text>
              <View style={styles.debugBox}>
                <Text style={styles.debugText}>
                  {allAppointments.length === 0
                    ? '❌ Appointments không được lưu vào Firebase'
                    : '✅ Appointments được lưu vào Firebase'}
                </Text>
                <Text style={styles.debugItem}>
                  • Kiểm tra console logs khi đặt lịch
                </Text>
                <Text style={styles.debugItem}>
                  • Tìm logs: "📝 [FIREBASE] Creating document"
                </Text>
                <Text style={styles.debugItem}>
                  • Nếu không thấy → appointments không được gửi đến Firebase
                </Text>
                <Text style={styles.debugItem}>
                  • Nếu thấy error → có vấn đề với Firebase connection
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  // Handle Firebase Timestamp objects
  let displayValue = value;
  
  if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    // Firebase Timestamp
    const date = new Date(value.seconds * 1000);
    displayValue = date.toISOString();
  } else if (value && typeof value === 'object') {
    // Other objects
    displayValue = JSON.stringify(value);
  }
  
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{displayValue || 'N/A'}</Text>
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
    fontSize: 16,
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
  countBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  countNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  countLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  userIdBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  userIdItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  userIdValue: {
    fontSize: 12,
    color: '#0f172a',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  userIdCount: {
    fontSize: 11,
    color: '#FF6B6B',
    marginTop: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorBox: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#C92A2A',
    fontWeight: '500',
  },
  appointmentBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  appointmentHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appointmentIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  appointmentId: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  appointmentDetails: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    flex: 0.4,
  },
  detailValue: {
    fontSize: 12,
    color: '#0f172a',
    flex: 0.6,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  debugBox: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  debugText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  debugItem: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 12,
    marginVertical: 4,
  },
});
