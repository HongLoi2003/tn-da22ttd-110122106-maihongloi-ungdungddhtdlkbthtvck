import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { deleteDocument, getAllDocuments, updateDocument } from './services/firebaseService';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'appointment' | 'medication' | 'test_result' | 'prescription' | 'message' | 'general';
  read: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const allNotifications = await getAllDocuments('notifications');
      
      const userNotifications = allNotifications
        .filter((n: any) => n.userId === user.uid)
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) as Notification[];
      
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return 'calendar';
      case 'medication': return 'medical';
      case 'test_result': return 'document-text';
      case 'prescription': return 'receipt';
      case 'message': return 'chatbubble';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment': return '#00BCD4';
      case 'medication': return '#4CAF50';
      case 'test_result': return '#FF9800';
      case 'prescription': return '#9C27B0';
      case 'message': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Cập nhật local state
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Cập nhật Firebase
    try {
      await updateDocument('notifications', notification.id, { read: true });
    } catch (error) {
      console.error('Error updating notification:', error);
    }

    // Chuyển đến trang chi tiết thông báo
    router.push({
      pathname: '/notification-detail',
      params: { id: notification.id },
    });
  };

  const handleMarkAllAsRead = async () => {
    // Cập nhật local state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Cập nhật Firebase
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await updateDocument('notifications', notification.id, { read: true });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    // Cập nhật local state
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Xóa khỏi Firebase
    try {
      await deleteDocument('notifications', id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const renderRightActions = (notificationId: string, progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(notificationId)}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filteredNotifications =
    selectedTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={{ marginTop: 16, color: '#64748b' }}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={24} color="#00BCD4" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              Tất cả ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'unread' && styles.tabActive]}
            onPress={() => setSelectedTab('unread')}
          >
            <Text style={[styles.tabText, selectedTab === 'unread' && styles.tabTextActive]}>
              Chưa đọc ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Không có thông báo</Text>
            </View>
          ) : (
            filteredNotifications.map(notification => (
              <Swipeable
                key={notification.id}
                ref={(ref) => {
                  if (ref) {
                    swipeableRefs.current.set(notification.id, ref);
                  }
                }}
                renderRightActions={(progress) => renderRightActions(notification.id, progress)}
                overshootRight={false}
                friction={2}
              >
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.notificationCardUnread,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: getNotificationColor(notification.type) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type) as any}
                      size={24}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>{getTimeAgo(notification.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  markAllBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#00BCD4' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#00BCD4' },
  content: { flex: 1 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardUnread: { backgroundColor: '#E0F7FA' },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  notificationTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BCD4',
    marginLeft: 8,
  },
  notificationBody: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 6 },
  notificationTime: { fontSize: 12, color: '#94a3b8' },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 16, color: '#94a3b8', marginTop: 16 },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
