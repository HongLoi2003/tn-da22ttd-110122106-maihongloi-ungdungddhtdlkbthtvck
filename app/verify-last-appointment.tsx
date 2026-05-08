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

export default function VerifyLastAppointmentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLastAppointment();
  }, [user]);

  const loadLastAppointment = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) {
        setError('❌ Không có user đăng nhập');
        setLoading(false);
        return;
      }

      console.log('🔍 Checking last appointment for user:', user.uid);

      // Query all appointments for this user
      const data = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid)
      ]);

      console.log('✅ Found appointments:', data.length);

      if (data.length === 0) {
        setError('❌ Không có appointments nào cho user này');
        setLoading(false);
        return;
      }

      // Get the most recent appointment
      const sorted = data.sort((a: any, b: any) => {
        const dateA = new Date(b.createdAt || b.appointmentDate).getTime();
        const dateB = new Date(a.createdAt || a.appointmentDate).getTime();
        return dateA - dateB;
      });

      const latest = sorted[0];
      console.log('📋 Latest appointment:', JSON.stringify(latest, null, 2));

      setAppointment(latest);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIssues = () => {
    if (!appointment) return [];

    const issues: string[] = [];
    const now = new Date();

    // Check userId
    if (!appointment.userId) {
      issues.push('❌ userId không tồn tại');
    } else if (appointment.userId !== user?.uid) {
      issues.push(`❌ userId không khớp: ${appointment.userId} !== ${user?.uid}`);
    }

    // Check doctor
    if (!appointment.doctor) {
      issues.push('❌ doctor không tồn tại');
    }

    // Check specialty
    if (!appointment.specialty) {
      issues.push('❌ specialty không tồn tại');
    }

    // Check hospital
    if (!appointment.hospital) {
      issues.push('❌ hospital không tồn tại');
    }

    // Check fullDate
    if (!appointment.fullDate) {
      issues.push('❌ fullDate không tồn tại');
    }

    // Check time
    if (!appointment.time) {
      issues.push('❌ time không tồn tại');
    }

    // Check appointmentDate
    if (!appointment.appointmentDate) {
      issues.push('❌ appointmentDate không tồn tại');
    } else {
      const aptDate = new Date(appointment.appointmentDate);
      if (isNaN(aptDate.getTime())) {
        issues.push(`❌ appointmentDate không hợp lệ: ${appointment.appointmentDate}`);
      } else if (aptDate < now) {
        issues.push(`❌ appointmentDate đã qua: ${appointment.appointmentDate}`);
      }
    }

    // Check status
    if (!appointment.status) {
      issues.push('❌ status không tồn tại');
    } else if (appointment.status !== 'confirmed') {
      issues.push(`❌ status không phải "confirmed": ${appointment.status}`);
    }

    // Check createdAt
    if (!appointment.createdAt) {
      issues.push('❌ createdAt không tồn tại');
    }

    // Check patientName
    if (!appointment.patientName) {
      issues.push('⚠️ patientName không tồn tại');
    }

    return issues;
  };

  const issues = checkIssues();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Last Appointment</Text>
        <TouchableOpacity onPress={loadLastAppointment}>
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

        {!loading && appointment && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Appointment Found</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{appointment.id}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Appointment Data</Text>
              <View style={styles.dataBox}>
                <DataRow label="userId" value={appointment.userId} />
                <DataRow label="doctor" value={appointment.doctor} />
                <DataRow label="specialty" value={appointment.specialty} />
                <DataRow label="hospital" value={appointment.hospital} />
                <DataRow label="fullDate" value={appointment.fullDate} />
                <DataRow label="time" value={appointment.time} />
                <DataRow label="appointmentDate" value={appointment.appointmentDate} />
                <DataRow label="createdAt" value={appointment.createdAt} />
                <DataRow label="status" value={appointment.status} />
                <DataRow label="patientName" value={appointment.patientName} />
                <DataRow label="patientPhone" value={appointment.patientPhone} />
                <DataRow label="patientEmail" value={appointment.patientEmail} />
              </View>
            </View>

            {issues.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Issues Found</Text>
                <View style={styles.issuesBox}>
                  {issues.map((issue, index) => (
                    <Text key={index} style={styles.issueText}>
                      {issue}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {issues.length === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ All Checks Passed</Text>
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={48} color="#06D6A0" />
                  <Text style={styles.successText}>
                    Appointment data is correct!
                  </Text>
                  <Text style={styles.successSubtext}>
                    Should appear in appointments page
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Date Analysis</Text>
              <View style={styles.analysisBox}>
                {appointment.appointmentDate && (
                  <>
                    <AnalysisRow
                      label="appointmentDate"
                      value={appointment.appointmentDate}
                    />
                    <AnalysisRow
                      label="Parsed Date"
                      value={new Date(appointment.appointmentDate).toISOString()}
                    />
                    <AnalysisRow
                      label="Is Valid"
                      value={
                        !isNaN(new Date(appointment.appointmentDate).getTime())
                          ? '✅ Yes'
                          : '❌ No'
                      }
                    />
                    <AnalysisRow
                      label="Is Future"
                      value={
                        new Date(appointment.appointmentDate) > new Date()
                          ? '✅ Yes'
                          : '❌ No'
                      }
                    />
                    <AnalysisRow
                      label="Days from now"
                      value={
                        Math.ceil(
                          (new Date(appointment.appointmentDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + ' days'
                      }
                    />
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: any }) {
  let displayValue = value;

  if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    const date = new Date(value.seconds * 1000);
    displayValue = date.toISOString();
  } else if (value && typeof value === 'object') {
    displayValue = JSON.stringify(value);
  }

  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}:</Text>
      <Text style={styles.dataValue}>{displayValue || 'N/A'}</Text>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
  dataBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    flex: 0.4,
  },
  dataValue: {
    fontSize: 12,
    color: '#0f172a',
    flex: 0.6,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  issuesBox: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  issueText: {
    fontSize: 12,
    color: '#C92A2A',
    marginBottom: 6,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#E5F9F0',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#06D6A0',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06D6A0',
    marginTop: 12,
  },
  successSubtext: {
    fontSize: 12,
    color: '#06D6A0',
    marginTop: 4,
  },
  analysisBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  analysisLabel: {
    fontSize: 12,
    color: '#64748b',
    flex: 0.5,
  },
  analysisValue: {
    fontSize: 12,
    color: '#0f172a',
    flex: 0.5,
    textAlign: 'right',
    fontWeight: '500',
  },
});
