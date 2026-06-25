import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getDocument, updateDocument } from './services/firebaseService';

interface NotificationDetail {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'appointment' | 'medication' | 'test_result' | 'prescription' | 'general';
  read: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotification();
  }, [notificationId]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      const data = await getDocument('notifications', notificationId);
      
      if (data) {
        setNotification(data as NotificationDetail);
        
        // Đánh dấu đã đọc nếu chưa đọc
        if (!(data as any).read) {
          await updateDocument('notifications', notificationId, { read: true });
        }
      }
    } catch (error) {
      console.error('Error loading notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return 'calendar';
      case 'medication': return 'medical';
      case 'test_result': return 'document-text';
      case 'prescription': return 'receipt';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment': return '#00BCD4';
      case 'medication': return '#4CAF50';
      case 'test_result': return '#FF9800';
      case 'prescription': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment': return 'Lịch khám';
      case 'medication': return 'Nhắc uống thuốc';
      case 'test_result': return 'Kết quả xét nghiệm';
      case 'prescription': return 'Đơn thuốc';
      default: return 'Thông báo';
    }
  };

  const formatDate = (dateString: string | number | undefined) => {
    try {
      let date: Date;
      
      // Nếu không có dateString, dùng thời gian hiện tại
      if (!dateString) {
        date = new Date();
      } else if (typeof dateString === 'number') {
        // Xử lý timestamp (số)
        date = new Date(dateString);
      } else if (typeof dateString === 'string') {
        // Xử lý ISO string hoặc các định dạng khác
        date = new Date(dateString);
      } else {
        date = new Date();
      }

      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        date = new Date();
      }

      return date.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return new Date().toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleViewRelated = () => {
    if (!notification) return;

    switch (notification.type) {
      case 'appointment':
        if (notification.data?.appointmentId) {
          router.push({
            pathname: '/appointment-detail',
            params: { id: notification.data.appointmentId },
          });
        } else {
          router.push('/(tabs)/appointments');
        }
        break;
      case 'test_result':
        router.push('/all-test-results');
        break;
      case 'medication':
      case 'prescription':
        router.push('/all-prescriptions');
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={{ marginTop: 16, color: '#64748b' }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle-outline" size={64} color="#cbd5e1" />
          <Text style={{ marginTop: 16, color: '#64748b' }}>Không tìm thấy thông báo</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon & Type */}
        <View style={styles.iconSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getNotificationColor(notification.type) + '20' },
            ]}
          >
            <Ionicons
              name={getNotificationIcon(notification.type) as any}
              size={48}
              color={getNotificationColor(notification.type)}
            />
          </View>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getNotificationColor(notification.type) },
            ]}
          >
            <Text style={styles.typeBadgeText}>{getTypeLabel(notification.type)}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>{notification.title}</Text>
        </View>

        {/* Body */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nội dung</Text>
          <Text style={styles.body}>{notification.body}</Text>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Thời gian</Text>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{formatDate(notification.createdAt)}</Text>
          </View>
        </View>

        {/* Additional Data */}
        {notification.data && Object.keys(notification.data).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thông tin chi tiết</Text>
            {notification.data.doctorName && (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>Bác sĩ: {notification.data.doctorName}</Text>
              </View>
            )}
            {notification.data.hospital && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>{notification.data.hospital}</Text>
              </View>
            )}
            {notification.data.appointmentDate && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>
                  {new Date(notification.data.appointmentDate).toLocaleString('vi-VN', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        {notification.type !== 'general' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleViewRelated}>
            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  content: { flex: 1 },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#0f172a',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
