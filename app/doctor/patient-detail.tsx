import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface PatientDetail {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceNumber?: string;
  totalVisits?: number;
  lastVisit?: string;
}

export default function DoctorPatientDetail() {
  const router = useRouter();
  const { userData } = useAuth();
  const params = useLocalSearchParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      if (!userData?.uid || !patientId) {
        console.log('❌ Missing userData or patientId');
        console.log('userData:', userData);
        console.log('patientId:', patientId);
        setLoading(false);
        return;
      }

      console.log('🔍 Loading patient detail for:', patientId);
      console.log('📋 Patient ID type:', typeof patientId);
      console.log('📋 Patient ID length:', patientId.length);

      // Load patient appointments first
      const { getDocumentsWithQuery } = await import('../services/firebaseService');
      const { where } = await import('firebase/firestore');
      
      const appointmentsData = await getDocumentsWithQuery('appointments', [
        where('userId', '==', patientId)
      ]);

      console.log('✅ Patient appointments loaded:', appointmentsData.length);
      setAppointments(appointmentsData);

      // Try to load patient info from users collection
      const { getDocumentById } = await import('../services/firebaseService');
      let patientData = await getDocumentById('users', patientId);
      console.log('📦 Patient data by ID:', patientData);

      // If not found by document ID, try querying by uid field
      if (!patientData) {
        console.log('⚠️ Not found by document ID, trying uid field...');
        const users = await getDocumentsWithQuery('users', [
          where('uid', '==', patientId)
        ]);
        
        if (users.length > 0) {
          patientData = users[0];
          console.log('✅ Found by uid field:', patientData);
        }
      }

      // If still not found, use data from appointments
      if (!patientData && appointmentsData.length > 0) {
        console.log('⚠️ User not found in users collection, using appointment data');
        const firstAppointment = appointmentsData[0];
        
        patientData = {
          id: patientId,
          uid: patientId,
          fullName: firstAppointment.patientName || 'Bệnh nhân',
          email: firstAppointment.patientEmail || '',
          phone: firstAppointment.patientPhone || '',
          address: firstAppointment.patientAddress || '',
          dateOfBirth: undefined,
          gender: undefined,
        };
        
        console.log('✅ Created patient data from appointment:', patientData);
      }

      if (patientData) {
        console.log('✅ Patient data loaded:', patientData);
        setPatient(patientData as PatientDetail);
      } else {
        console.log('❌ No patient data found for ID:', patientId);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading patient:', error);
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bệnh nhân</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>Không tìm thấy bệnh nhân</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bệnh nhân</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {patient.avatar ? (
            <Image 
              source={{ uri: patient.avatar }} 
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patient.fullName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.patientName}>{patient.fullName}</Text>
          <Text style={styles.patientEmail}>{patient.email}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {appointments.filter(apt => apt.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Lần khám</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : '--'}
              </Text>
              <Text style={styles.statLabel}>Tuổi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patient.gender === 'Nam' || patient.gender === 'male' ? 'Nam' : 
                 patient.gender === 'Nữ' || patient.gender === 'female' ? 'Nữ' : 
                 patient.gender === 'Khác' || patient.gender === 'other' ? 'Khác' : '--'}
              </Text>
              <Text style={styles.statLabel}>Giới tính</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{patient.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{patient.email}</Text>
              </View>
            </View>
            
            {patient.address && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#00BCD4" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Địa chỉ</Text>
                    <Text style={styles.infoValue}>{patient.address}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Appointment History */}
        {appointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử khám bệnh ({appointments.length})</Text>
            {appointments.slice(0, 5).map((appointment: any) => (
              <View key={appointment.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{appointment.fullDate}</Text>
                  <View style={[
                    styles.historyBadge, 
                    { backgroundColor: appointment.status === 'completed' ? '#dcfce7' : '#dbeafe' }
                  ]}>
                    <Text style={[
                      styles.historyBadgeText, 
                      { color: appointment.status === 'completed' ? '#10b981' : '#3b82f6' }
                    ]}>
                      {appointment.status === 'completed' ? 'Hoàn thành' : 
                       appointment.status === 'confirmed' ? 'Đã xác nhận' : 
                       appointment.status === 'pending' ? 'Chờ xác nhận' : 'Đã hủy'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyText}>Chuyên khoa: {appointment.specialty}</Text>
                <Text style={styles.historyText}>Bác sĩ: {appointment.doctor}</Text>
                <Text style={styles.historyText}>Thời gian: {appointment.time}</Text>
                {appointment.notes && (
                  <Text style={styles.historyText}>Ghi chú: {appointment.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#00BCD4',
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00BCD4',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
});
