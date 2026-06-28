import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function CheckAppointmentsDataScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        setError('❌ Không có user đăng nhập');
        setLoading(false);
        return;
      }

      console.log('🔍 Checking appointments for user:', user.uid);

      // Query all appointments for this user
      const data = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid)
      ]);

      console.log('✅ Found appointments:', data.length);
      console.log('📋 Data:', JSON.stringify(data, null, 2));

      setAppointments(data);
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
        <Text style={styles.headerTitle}>Kiểm tra dữ liệu Appointments</Text>
        <TouchableOpacity onPress={loadData}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Thông tin User</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>User UID:</Text>
            <Text style={styles.infoValue}>{user?.uid || 'N/A'}</Text>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Appointments Count */}
        {!loading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Tổng số Appointments</Text>
            <View style={styles.countBox}>
              <Text style={styles.countNumber}>{appointments.length}</Text>
              <Text style={styles.countLabel}>lịch khám</Text>
            </View>
          </View>
        )}

        {/* Appointments List */}
        {!loading && appointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Chi tiết Appointments</Text>
            {appointments.map((apt, index) => (
              <View key={index} style={styles.appointmentBox}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentIndex}>Appointment #{index + 1}</Text>
                  <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(apt.status) }]}>
                    {apt.status}
                  </Text>
                </View>

                <View style={styles.appointmentDetails}>
                  <DetailRow label="ID" value={apt.id} />
                  <DetailRow label="Doctor" value={apt.doctor} />
                  <DetailRow label="Specialty" value={apt.specialty} />
                  <DetailRow label="Hospital" value={apt.hospital} />
                  <DetailRow label="Date (fullDate)" value={apt.fullDate} />
                  <DetailRow label="Time" value={apt.time} />
                  <DetailRow label="appointmentDate" value={apt.appointmentDate} />
                  <DetailRow label="createdAt" value={apt.createdAt} />
                  <DetailRow label="Status" value={apt.status} />
                  <DetailRow label="Patient Name" value={apt.patientName} />
                  <DetailRow label="Patient Phone" value={apt.patientPhone} />
                  <DetailRow label="Patient Email" value={apt.patientEmail} />
                </View>

                {/* Date Analysis */}
                <View style={styles.analysisBox}>
                  <Text style={styles.analysisTitle}>📅 Date Analysis:</Text>
                  {apt.appointmentDate && (
                    <>
                      <AnalysisRow
                        label="appointmentDate"
                        value={apt.appointmentDate}
                      />
                      <AnalysisRow
                        label="Parsed Date"
                        value={new Date(apt.appointmentDate).toISOString()}
                      />
                      <AnalysisRow
                        label="Is Valid"
                        value={!isNaN(new Date(apt.appointmentDate).getTime()) ? '✅ Yes' : '❌ No'}
                      />
                      <AnalysisRow
                        label="Is Future"
                        value={new Date(apt.appointmentDate) > new Date() ? '✅ Yes' : '❌ No'}
                      />
                      <AnalysisRow
                        label="Days from now"
                        value={Math.ceil((new Date(apt.appointmentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days'}
                      />
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && appointments.length === 0 && !error && (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không có appointments nào</Text>
            <Text style={styles.emptySubtext}>Hãy đặt lịch khám để xem dữ liệu</Text>
          </View>
        )}

        {/* Debug Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Debug Info</Text>
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>
              Nếu không thấy appointments, kiểm tra:
            </Text>
            <Text style={styles.debugItem}>1. User UID có đúng không?</Text>
            <Text style={styles.debugItem}>2. Appointments có được lưu vào Firebase không?</Text>
            <Text style={styles.debugItem}>3. userId field có khớp với user.uid không?</Text>
            <Text style={styles.debugItem}>4. Mở Firebase Console để verify dữ liệu</Text>
          </View>
        </View>
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

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.analysisRow}>
      <Text style={styles.analysisLabel}>{label}:</Text>
      <Text style={styles.analysisValue}>{value}</Text>
    </View>
  );
}

function getStatusColor(status: string): string {
  if (status === 'confirmed') return '#06D6A020';
  if (status === 'pending') return '#FFB80020';
  if (status === 'completed') return '#8B5CF620';
  return '#94a3b820';
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
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    marginTop: 4,
    fontFamily: 'monospace',
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
  countBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  countNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00BCD4',
  },
  countLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  appointmentBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  appointmentDetails: {
    marginBottom: 12,
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
  analysisBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  analysisTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
    marginBottom: 8,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  analysisLabel: {
    fontSize: 11,
    color: '#64748b',
    flex: 0.5,
  },
  analysisValue: {
    fontSize: 11,
    color: '#0f172a',
    flex: 0.5,
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
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
