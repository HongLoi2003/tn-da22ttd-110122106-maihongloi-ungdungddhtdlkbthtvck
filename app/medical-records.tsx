import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';
import { getDoctorAvatar } from './utils/doctorAvatars';

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadMedicalData();
    }, [user])
  );

  const loadMedicalData = async () => {
    try {
      setLoading(true);
      if (!user) {
        setRecords([]);
        return;
      }

      // Load completed appointments as medical records
      const completedAppointments = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid),
        where('status', '==', 'completed')
      ]);
      
      // Debug log to check data
      console.log('📋 Medical Records Data:', JSON.stringify(completedAppointments, null, 2));
      
      const sortedRecords = completedAppointments.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateB - dateA;
      });
      setRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading medical data:', error);
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
      `Ngày khám: ${record.date} lúc ${record.time}\nBác sĩ: ${record.doctorName}\nChuyên khoa: ${record.specialty}\n${record.hospitalName ? `Bệnh viện: ${record.hospitalName}\n` : ''}${record.address ? `Địa chỉ: ${record.address}\n` : ''}Loại khám: ${record.type || 'Khám bệnh'}\n${record.symptoms ? `Triệu chứng: ${record.symptoms}\n` : ''}${record.reason ? `Lý do: ${record.reason}\n` : ''}${record.notes ? `Ghi chú: ${record.notes}\n` : ''}Chi phí: ${formattedPrice}\n\nTrạng thái: Đã hoàn thành`,
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
        <Text style={styles.headerTitle}>Hồ sơ y tế</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : (
          <>
        {/* Health Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Thông tin sức khỏe</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="water" size={24} color="#00BCD4" />
              <Text style={styles.summaryLabel}>Nhóm máu</Text>
              <Text style={styles.summaryValue}>{userData?.bloodType || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="fitness" size={24} color="#06D6A0" />
              <Text style={styles.summaryLabel}>Chiều cao</Text>
              <Text style={styles.summaryValue}>{userData?.height ? `${userData.height} cm` : 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="scale" size={24} color="#FFB800" />
              <Text style={styles.summaryLabel}>Cân nặng</Text>
              <Text style={styles.summaryValue}>{userData?.weight ? `${userData.weight} kg` : 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="heart" size={24} color="#EF4444" />
              <Text style={styles.summaryLabel}>Huyết áp</Text>
              <Text style={styles.summaryValue}>{(userData as any)?.bloodPressure || 'Chưa cập nhật'}</Text>
            </View>
          </View>
        </View>

        {/* Medical Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử khám bệnh</Text>
            <TouchableOpacity onPress={() => router.push('/all-medical-records')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có lịch sử khám bệnh</Text>
            </View>
          ) : (
            records.slice(0, 5).map((record) => {
              const price = record.price || record.fee || 0;
              const formattedPrice = price > 0 ? new Intl.NumberFormat('vi-VN').format(price) : '-';
              const doctorName = record.doctorName || record.doctor || 'Bác sĩ';

              return (
            <TouchableOpacity 
              key={record.id} 
              style={styles.recordCard}
              onPress={() => handleRecordPress(record)}
              activeOpacity={0.7}
            >
              {/* Top Orange Bar */}
              <View style={styles.orangeBar} />
              
              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Doctor Info Row */}
                <View style={styles.doctorRow}>
                  <Image 
                    source={getDoctorAvatar(doctorName)} 
                    style={styles.doctorAvatar}
                  />
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
                    <Text style={styles.specialty}>{record.specialty}</Text>
                    {record.hospitalName && (
                      <View style={styles.hospitalRow}>
                        <Ionicons name="business" size={12} color="#64748b" />
                        <Text style={styles.hospitalText} numberOfLines={1}>{record.hospitalName}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Đã xác nhận</Text>
                  </View>
                </View>

                {/* Date & Time Boxes */}
                <View style={styles.infoBoxRow}>
                  <View style={styles.infoBox}>
                    <Ionicons name="calendar" size={16} color="#00BCD4" />
                    <View style={styles.infoBoxText}>
                      <Text style={styles.infoBoxLabel}>Ngày khám</Text>
                      <Text style={styles.infoBoxValue}>{record.date}</Text>
                    </View>
                  </View>
                  <View style={styles.infoBox}>
                    <Ionicons name="time" size={16} color="#8B5CF6" />
                    <View style={styles.infoBoxText}>
                      <Text style={styles.infoBoxLabel}>Giờ khám</Text>
                      <Text style={styles.infoBoxValue}>{record.time}</Text>
                    </View>
                  </View>
                </View>

                {/* Price & Button */}
                <View style={styles.bottomRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Tổng chi phí</Text>
                    <Text style={styles.priceValue}>
                      {price > 0 ? `${formattedPrice}đ` : 'Chưa cập nhật'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>Chi tiết</Text>
                    <Ionicons name="arrow-forward" size={14} color="#00BCD4" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
              );
            })
          )}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  seeAll: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
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
  orangeBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#FFB800',
  },
  cardContent: {
    padding: 16,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
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
  statusBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  infoBoxRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  infoBoxText: {
    flex: 1,
  },
  infoBoxLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  infoBoxValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00BCD4',
  },
  detailButtonText: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },
});
