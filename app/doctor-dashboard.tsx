import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DoctorDashboardScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('today');

  const stats = [
    { id: '1', label: 'Lịch hôm nay', value: '12', icon: 'calendar', color: '#00BCD4' },
    { id: '2', label: 'Đang chờ', value: '5', icon: 'time', color: '#FFB800' },
    { id: '3', label: 'Hoàn thành', value: '7', icon: 'checkmark-circle', color: '#06D6A0' },
    { id: '4', label: 'Bệnh nhân mới', value: '3', icon: 'person-add', color: '#8B5CF6' },
  ];

  const todayAppointments = [
    {
      id: '1',
      patientName: 'Nguyễn Văn A',
      time: '08:00 - 08:30',
      type: 'Khám tổng quát',
      status: 'waiting',
      room: 'Phòng 201',
    },
    {
      id: '2',
      patientName: 'Trần Thị B',
      time: '08:30 - 09:00',
      type: 'Tái khám',
      status: 'in-progress',
      room: 'Phòng 201',
    },
    {
      id: '3',
      patientName: 'Lê Văn C',
      time: '09:00 - 09:30',
      type: 'Tư vấn online',
      status: 'scheduled',
      room: 'Video call',
    },
    {
      id: '4',
      patientName: 'Phạm Thị D',
      time: '09:30 - 10:00',
      type: 'Khám bệnh',
      status: 'scheduled',
      room: 'Phòng 201',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#FFB800';
      case 'in-progress': return '#00BCD4';
      case 'scheduled': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Đang chờ';
      case 'in-progress': return 'Đang khám';
      case 'scheduled': return 'Đã đặt';
      default: return 'Chưa xác định';
    }
  };

  const renderStatCard = ({ item }: any) => (
    <View style={[styles.statCard, { borderLeftColor: item.color }]}>
      <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{item.value}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </View>
    </View>
  );

  const renderAppointment = ({ item }: any) => (
    <TouchableOpacity style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Ionicons name="time-outline" size={16} color="#00BCD4" />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.appointmentType}>{item.type}</Text>

      <View style={styles.appointmentFooter}>
        <View style={styles.roomInfo}>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text style={styles.roomText}>{item.room}</Text>
        </View>
        <View style={styles.appointmentActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="document-text-outline" size={18} color="#00BCD4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="call-outline" size={18} color="#00BCD4" />
          </TouchableOpacity>
          {item.type.includes('online') && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.videoBtnActive]}
              onPress={() => router.push({
                pathname: '/video-call',
                params: {
                  doctorName: 'Bạn',
                  patientName: item.patientName,
                }
              })}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.doctorName}>BS. Nguyễn Văn An</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsSection}>
          <FlatList
            data={stats}
            renderItem={renderStatCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.statsRow}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="calendar-outline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.quickActionText}>Lịch làm việc</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="people-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickActionText}>Bệnh nhân</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="document-text-outline" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.quickActionText}>Bệnh án</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="stats-chart-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionText}>Thống kê</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'today' && styles.tabActive]}
            onPress={() => setSelectedTab('today')}
          >
            <Text style={[styles.tabText, selectedTab === 'today' && styles.tabTextActive]}>
              Hôm nay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
              Sắp tới
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Đã hoàn thành
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch khám hôm nay</Text>
            <Text style={styles.appointmentCount}>{todayAppointments.length} lịch</Text>
          </View>
          <FlatList
            data={todayAppointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
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
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerInfo: {
    gap: 2,
  },
  greeting: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  notificationBtn: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
  },
  statsRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderLeftWidth: 4,
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '23%',
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 11,
    color: '#0f172a',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#00BCD4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  appointmentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentCount: {
    fontSize: 14,
    color: '#64748b',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomText: {
    fontSize: 12,
    color: '#64748b',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBtnActive: {
    backgroundColor: '#00BCD4',
  },
});
