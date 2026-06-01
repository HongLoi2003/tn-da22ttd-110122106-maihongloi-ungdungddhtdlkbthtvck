import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import doctorServiceInstance, { Patient } from '../services/doctorService';

export default function DoctorPatients() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [patientAvatars, setPatientAvatars] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      if (!userData?.uid) return;

      // Ưu tiên dùng doctorInfo.doctorId nếu có, không thì dùng uid
      const doctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;
      console.log('🔍 [Patients] Loading patients for doctorId:', doctorId);

      const data = await doctorServiceInstance.getDoctorPatients(doctorId);
      console.log('✅ [Patients] Loaded', data.length, 'patients');
      setPatients(data);
      
      // Load patient avatars
      if (data.length > 0) {
        await loadPatientAvatars(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setLoading(false);
    }
  };

  const loadPatientAvatars = async (patients: Patient[]) => {
    try {
      const { getDocumentsWithQuery } = await import('../services/firebaseService');
      const { where } = await import('firebase/firestore');
      const avatarMap: { [key: string]: string } = {};
      
      console.log('🔔 [Patients] Loading avatars for', patients.length, 'patients');
      
      // Get unique patient user IDs
      const patientIds = [...new Set(patients.map(p => p.userId).filter(Boolean))];
      console.log('👥 [Patients] Found', patientIds.length, 'unique patient IDs');
      
      // Load all users at once
      for (const patientId of patientIds) {
        try {
          const users = await getDocumentsWithQuery('users', [
            where('uid', '==', patientId)
          ]);
          
          if (users.length > 0 && (users[0] as any).avatar) {
            avatarMap[patientId] = (users[0] as any).avatar;
            console.log('✅ [Patients] Loaded avatar for:', (users[0] as any).fullName);
          }
        } catch (error) {
          console.log('⚠️ [Patients] Could not load avatar for user:', patientId);
        }
      }
      
      console.log('🔔 [Patients] Total avatars loaded:', Object.keys(avatarMap).length);
      setPatientAvatars(avatarMap);
    } catch (error) {
      console.error('❌ [Patients] Error loading patient avatars:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const filterPatients = () => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(
      patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.phone.includes(query)
    );
    setFilteredPatients(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bệnh nhân</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bệnh nhân..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00BCD4']} />
        }
      >
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Tổng bệnh nhân</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{filteredPatients.length}</Text>
            <Text style={styles.statLabel}>Kết quả tìm kiếm</Text>
          </View>
        </View>

        {filteredPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy bệnh nhân' : 'Chưa có bệnh nhân nào'}
            </Text>
          </View>
        ) : (
          filteredPatients.map((patient) => {
            const userAvatar = patient.userId ? patientAvatars[patient.userId] : null;
            
            return (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => router.push(`/doctor/patient-detail?id=${patient.id}`)}
              >
                {userAvatar ? (
                  <Image 
                    source={{ uri: userAvatar }} 
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {patient.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <View style={styles.patientMeta}>
                    <Ionicons name="call-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{patient.phone}</Text>
                  </View>
                  <View style={styles.patientMeta}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{patient.totalVisits} lần khám</Text>
                  </View>
                  {patient.lastVisit && (
                    <View style={styles.lastVisitBadge}>
                      <Text style={styles.lastVisitText}>Khám gần nhất: {patient.lastVisit}</Text>
                    </View>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            );
          })
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00BCD4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00BCD4',
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  lastVisitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  lastVisitText: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
});
