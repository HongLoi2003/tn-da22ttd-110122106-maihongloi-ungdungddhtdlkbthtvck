import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getAllDocuments } from './services/firebaseService';

// Helper function to get doctor image
const getDoctorImage = (imageName: string) => {
  const images: { [key: string]: any } = {
    'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
    'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
    'lehoangnam.png': { uri: 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg' },
    'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
    'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
    'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
    'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
    'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
    'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
    'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
    'phamthuha.png': { uri: 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg' },
    'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
    'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
    'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
    'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
    'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
    'logo.png': { uri: "https://via.placeholder.com/150" },
  };
  
  if (imageName && images[imageName]) {
    return images[imageName];
  }
  
  return { uri: "https://via.placeholder.com/150" };
};

export default function DebugNotificationAvatarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const allNotifications = await getAllDocuments('notifications');
      
      const userNotifications = allNotifications
        .filter((n: any) => n.userId === user.uid && n.type === 'message')
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      
      setNotifications(userNotifications);
      console.log('📱 [DEBUG] Loaded notifications:', userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const testNavigation = (notification: any) => {
    console.log('📱 [DEBUG] Testing navigation with notification:', notification);
    console.log('📱 [DEBUG] Notification data:', notification.data);
    
    if (notification.data) {
      router.push({
        pathname: '/doctor-chat',
        params: {
          conversationId: notification.data.conversationId || '',
          doctorId: notification.data.doctorId || '',
          doctorName: notification.data.doctorName || 'Bác sĩ',
          doctorSpecialty: notification.data.doctorSpecialty || '',
          doctorImage: notification.data.doctorImage || 'logo.png',
          doctorPhone: notification.data.doctorPhone || '',
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Notification Avatar</Text>
        <TouchableOpacity onPress={loadNotifications}>
          <Ionicons name="refresh" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Debug Info</Text>
            <Text style={styles.infoText}>
              Trang này hiển thị tất cả notification tin nhắn và data của chúng.
              Kiểm tra xem doctorImage có được lưu đúng không.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có notification tin nhắn</Text>
          </View>
        ) : (
          notifications.map((notification, index) => (
            <View key={notification.id || index} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => testNavigation(notification)}
                >
                  <Text style={styles.testButtonText}>Test</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.notificationBody}>{notification.body}</Text>

              {notification.data && (
                <View style={styles.dataSection}>
                  <Text style={styles.dataTitle}>📦 Notification Data:</Text>
                  
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>doctorImage:</Text>
                    <Text style={styles.dataValue}>
                      {notification.data.doctorImage || '❌ MISSING'}
                    </Text>
                  </View>

                  {notification.data.doctorImage && (
                    <View style={styles.avatarPreview}>
                      <Text style={styles.dataLabel}>Avatar Preview:</Text>
                      <Image
                        source={getDoctorImage(notification.data.doctorImage)}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    </View>
                  )}

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>doctorName:</Text>
                    <Text style={styles.dataValue}>
                      {notification.data.doctorName || '❌ MISSING'}
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>doctorId:</Text>
                    <Text style={styles.dataValue}>
                      {notification.data.doctorId || '❌ MISSING'}
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>doctorSpecialty:</Text>
                    <Text style={styles.dataValue}>
                      {notification.data.doctorSpecialty || '❌ MISSING'}
                    </Text>
                  </View>

                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>conversationId:</Text>
                    <Text style={styles.dataValue}>
                      {notification.data.conversationId || '❌ MISSING'}
                    </Text>
                  </View>
                </View>
              )}

              {!notification.data && (
                <View style={styles.errorBox}>
                  <Ionicons name="warning" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>
                    ❌ Notification không có data!
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  testButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  notificationBody: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  dataSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dataTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  dataRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 120,
  },
  dataValue: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  avatarPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
});
