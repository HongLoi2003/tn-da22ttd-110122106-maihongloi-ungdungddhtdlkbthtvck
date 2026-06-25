import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';
import { getDoctorAvatar } from './utils/doctorAvatars';

export default function AllMedicalRecordsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [user])
  );

  const loadRecords = async () => {
    try {
      setLoading(true);
      if (!user) {
        setRecords([]);
        return;
      }
      
      // Load completed appointments only
      const completedAppointments = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid),
        where('status', '==', 'completed')
      ]);
      const sortedRecords = completedAppointments.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateB - dateA;
      });
      setRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading medical records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPress = (record: any) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(record.price || 0);

    Alert.alert(
      'Chi tiết lịch khám',
      `Ngày khám: ${record.date} lúc ${record.time}\nBác sĩ: ${record.doctorName || record.doctor}\nChuyên khoa: ${record.specialty}\n${record.hospitalName || record.hospital ? `Bệnh viện: ${record.hospitalName || record.hospital}\n` : ''}${record.address ? `Địa chỉ: ${record.address}\n` : ''}Loại khám: ${record.type || 'Khám bệnh'}\n${record.symptoms ? `Triệu chứng: ${record.symptoms}\n` : ''}${record.reason ? `Lý do: ${record.reason}\n` : ''}${record.notes ? `Ghi chú: ${record.notes}\n` : ''}Chi phí: ${formattedPrice}\n\nTrạng thái: Đã hoàn thành`,
      [{ text: 'Đóng' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử khám bệnh</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="search" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có hồ sơ khám bệnh</Text>
          </View>
        ) : (
          <>
        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={24} color="#00BCD4" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Tổng lần khám</Text>
              <Text style={styles.statValue}>{records.length} lần</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Bác sĩ đã khám</Text>
              <View style={styles.doctorAvatarsRow}>
                {Array.from(new Set(records.map(r => r.doctorName || r.doctor)))
                  .slice(0, 4)
                  .map((doctorName, index) => (
                    <Image
                      key={index}
                      source={getDoctorAvatar(doctorName)}
                      style={[styles.miniAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
                    />
                  ))}
                {Array.from(new Set(records.map(r => r.doctorName || r.doctor))).length > 4 && (
                  <View style={[styles.miniAvatar, styles.moreAvatars, { marginLeft: -8 }]}>
                    <Text style={styles.moreAvatarsText}>
                      +{Array.from(new Set(records.map(r => r.doctorName || r.doctor))).length - 4}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="wallet" size={24} color="#06D6A0" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Tổng chi phí</Text>
              <Text style={styles.statValue}>
                {new Intl.NumberFormat('vi-VN').format(
                  records.reduce((sum, r) => sum + (r.price || r.fee || 0), 0)
                )}đ
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {records.map((record) => {
            const formattedPrice = new Intl.NumberFormat('vi-VN').format(record.price || record.fee || 0);
            const doctorName = record.doctorName || record.doctor || 'Bác sĩ';
            const hospitalName = record.hospitalName || record.hospital;

            return (
            <TouchableOpacity 
              key={record.id} 
              style={styles.recordCard}
              onPress={() => handleRecordPress(record)}
              activeOpacity={0.7}
            >
              {/* Status Bar - Completed */}
              <View style={styles.completedStatusBar} />
              
              {/* Compact Horizontal Layout */}
              <View style={styles.compactContent}>
                {/* Avatar */}
                <Image 
                  source={getDoctorAvatar(doctorName)} 
                  style={styles.compactAvatar}
                />
                
                {/* Main Info */}
                <View style={styles.compactMainInfo}>
                  <Text style={styles.compactDoctorName} numberOfLines={1}>{doctorName}</Text>
                  <Text style={styles.compactSpecialty} numberOfLines={1}>{record.specialty}</Text>
                  <View style={styles.compactMetaRow}>
                    <Ionicons name="calendar-outline" size={12} color="#64748b" />
                    <Text style={styles.compactMetaText}>{record.date}</Text>
                    <Text style={styles.compactDivider}>•</Text>
                    <Ionicons name="time-outline" size={12} color="#64748b" />
                    <Text style={styles.compactMetaText}>{record.time}</Text>
                  </View>
                  <Text style={styles.compactPrice}>{formattedPrice}đ</Text>
                </View>
                
                {/* Status Badge */}
                <View style={styles.compactStatusBadge}>
                  <Text style={styles.compactStatusText}>Hoàn thành</Text>
                </View>
              </View>
            </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  doctorAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAvatars: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  completedStatusBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#10b981',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  compactMainInfo: {
    flex: 1,
    gap: 4,
  },
  compactDoctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  compactSpecialty: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  compactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  compactMetaText: {
    fontSize: 12,
    color: '#64748b',
  },
  compactDivider: {
    fontSize: 12,
    color: '#cbd5e1',
    marginHorizontal: 2,
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#06D6A0',
    marginTop: 2,
  },
  compactStatusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compactStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  doctorInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  specialty: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
    marginBottom: 4,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  middleSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06D6A0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00BCD4',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
  },
});
