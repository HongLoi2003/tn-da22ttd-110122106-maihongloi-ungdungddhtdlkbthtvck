import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from './config/firebase';
import { useAuth } from './context/AuthContext';

export default function DebugAppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAppointments(data);
      console.log('📊 Total appointments:', data.length);
      data.forEach(apt => {
        console.log(`💰 ${apt.id}: fee=${apt.fee}, price=${apt.price}, doctorFee=${apt.doctorFee}`);
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const renderAppointmentDebug = (item: any) => {
    const hasFee = item.fee !== undefined && item.fee !== null && item.fee !== 0;
    const hasPrice = item.price !== undefined && item.price !== null && item.price !== 0;
    const hasDoctorFee = item.doctorFee !== undefined && item.doctorFee !== null && item.doctorFee !== 0;
    
    const finalFee = item.fee || item.price || item.doctorFee || 0;
    
    return (
      <View key={item.id} style={styles.debugCard}>
        <View style={styles.debugHeader}>
          <Text style={styles.debugId}>ID: {item.id}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: finalFee > 0 ? '#10b981' : '#ef4444' }
          ]}>
            <Text style={styles.statusText}>
              {finalFee > 0 ? '✓ OK' : '✗ Missing'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.debugDoctor}>{item.doctor || 'N/A'}</Text>
        <Text style={styles.debugDate}>{item.date} - {item.time}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.debugDetails}>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>fee:</Text>
            <Text style={[styles.debugValue, hasFee && styles.debugValueOk]}>
              {item.fee !== undefined ? item.fee : 'undefined'}
            </Text>
          </View>
          
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>price:</Text>
            <Text style={[styles.debugValue, hasPrice && styles.debugValueOk]}>
              {item.price !== undefined ? item.price : 'undefined'}
            </Text>
          </View>
          
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>doctorFee:</Text>
            <Text style={[styles.debugValue, hasDoctorFee && styles.debugValueOk]}>
              {item.doctorFee !== undefined ? item.doctorFee : 'undefined'}
            </Text>
          </View>
          
          <View style={[styles.debugRow, styles.debugRowFinal]}>
            <Text style={styles.debugLabelFinal}>Final Fee:</Text>
            <Text style={styles.debugValueFinal}>
              {finalFee.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Appointments</Text>
        <TouchableOpacity onPress={loadAppointments} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userLabel}>User ID:</Text>
        <Text style={styles.userValue}>{user?.uid || 'Not logged in'}</Text>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{appointments.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {appointments.filter(a => a.fee || a.price || a.doctorFee).length}
          </Text>
          <Text style={styles.summaryLabel}>With Fee</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {appointments.filter(a => !a.fee && !a.price && !a.doctorFee).length}
          </Text>
          <Text style={styles.summaryLabel}>Missing Fee</Text>
        </View>
      </View>

      {/* Appointments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>No appointments found</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {appointments.map(renderAppointmentDebug)}
        </ScrollView>
      )}

      {/* Fix Button */}
      {appointments.some(a => !a.fee && !a.price && !a.doctorFee) && (
        <TouchableOpacity 
          style={styles.fixButton}
          onPress={() => router.push('/fix-appointment-fees')}
        >
          <Ionicons name="construct" size={20} color="#fff" />
          <Text style={styles.fixButtonText}>Fix Missing Fees</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  userInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  userValue: {
    fontSize: 11,
    color: '#0f172a',
    fontFamily: 'monospace',
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00BCD4',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  debugCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugId: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  debugDoctor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  debugDate: {
    fontSize: 12,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  debugDetails: {
    gap: 8,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugRowFinal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  debugLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  debugValue: {
    fontSize: 12,
    color: '#ef4444',
    fontFamily: 'monospace',
  },
  debugValueOk: {
    color: '#10b981',
  },
  debugLabelFinal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  debugValueFinal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00BCD4',
  },
  fixButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fixButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
