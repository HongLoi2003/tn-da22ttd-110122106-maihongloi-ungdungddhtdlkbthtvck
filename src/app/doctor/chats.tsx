import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import { deleteDocument, getDocumentsWithQuery } from '../services/firebaseService';

interface Chat {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  patientPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageTimestamp: any;
  unreadCount: number;
  hasConversation: boolean;
}

export default function DoctorChats() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      console.log('=== LOADING DOCTOR CHATS ===');
      console.log('Doctor userData:', userData);
      
      // Lấy doctorId từ doctorInfo (bs001, bs004, bs003, etc.)
      const doctorIdFromInfo = (userData.doctorInfo as any)?.doctorId;
      
      console.log('Doctor ID from doctorInfo:', doctorIdFromInfo);

      if (!doctorIdFromInfo) {
        console.log('❌ Không tìm thấy doctorId trong doctorInfo');
        setChats([]);
        setLoading(false);
        return;
      }

      // Query theo doctorAuthUid (là userData.uid - Firebase Auth UID)
      console.log('Querying conversations by doctorAuthUid:', userData.uid);
      const conversations = await getDocumentsWithQuery('conversations', [
        where('doctorAuthUid', '==', userData.uid)
      ]);
      
      console.log('Found conversations:', conversations.length);
      console.log('Conversations data:', conversations);

      // Sort manually by lastMessageTimestamp
      const sortedConversations = conversations.sort((a: any, b: any) => {
        const timeA = a.lastMessageTimestamp?.toDate ? a.lastMessageTimestamp.toDate().getTime() : 0;
        const timeB = b.lastMessageTimestamp?.toDate ? b.lastMessageTimestamp.toDate().getTime() : 0;
        return timeB - timeA;
      });

      // Load patient avatars from users collection
      const formattedChatsPromises = sortedConversations.map(async (conv: any) => {
        let timeDisplay = '';
        if (conv.lastMessageTimestamp) {
          const timestamp = conv.lastMessageTimestamp.toDate ? 
            conv.lastMessageTimestamp.toDate() : 
            new Date(conv.lastMessageTimestamp);
          
          const now = new Date();
          const diffMs = now.getTime() - timestamp.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 1) {
            timeDisplay = 'Vừa xong';
          } else if (diffMins < 60) {
            timeDisplay = `${diffMins} phút`;
          } else if (diffHours < 24) {
            timeDisplay = `${diffHours} giờ`;
          } else if (diffDays < 7) {
            timeDisplay = `${diffDays} ngày`;
          } else {
            timeDisplay = timestamp.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          }
        }

        // Load patient avatar from users collection
        let patientAvatar = '';
        
        if (conv.patientId) {
          try {
            const users = await getDocumentsWithQuery('users', [
              where('uid', '==', conv.patientId)
            ]);
            if (users.length > 0) {
              const userAvatar = (users[0] as any).avatar;
              console.log(`🔍 [Chats] Raw avatar for ${conv.patientName}:`, userAvatar ? userAvatar.substring(0, 50) + '...' : 'none');
              
              if (userAvatar) {
                // Accept any non-empty avatar (URL, data URL, or base64)
                patientAvatar = userAvatar;
                console.log(`✅ [Chats] Loaded avatar for ${conv.patientName}`);
              } else {
                console.log(`⚠️ [Chats] User has no avatar field`);
              }
            } else {
              console.log(`⚠️ [Chats] No user found with uid: ${conv.patientId}`);
            }
          } catch (error) {
            console.log(`❌ [Chats] Could not load avatar for patient ${conv.patientId}:`, error);
          }
        }
        
        // Fallback to conversation avatar if user avatar not found
        if (!patientAvatar && conv.patientAvatar) {
          console.log(`🔍 [Chats] Fallback to conversation avatar`);
          patientAvatar = conv.patientAvatar;
          console.log(`✅ [Chats] Using avatar from conversation for ${conv.patientName}`);
        }
        
        if (!patientAvatar) {
          console.log(`❌ [Chats] No avatar found for ${conv.patientName}, will use fallback UI`);
        }

        return {
          id: conv.id,
          patientId: conv.patientId || '',
          patientName: conv.patientName || 'Bệnh nhân',
          patientAvatar: patientAvatar,
          patientPhone: conv.patientPhone || '',
          lastMessage: conv.lastMessage || 'Chưa có tin nhắn',
          lastMessageTime: timeDisplay,
          lastMessageTimestamp: conv.lastMessageTimestamp,
          unreadCount: conv.doctorUnreadCount || 0,
          hasConversation: true,
        };
      });

      const formattedChats = await Promise.all(formattedChatsPromises);

      console.log('Formatted chats:', formattedChats);
      setChats(formattedChats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleDeleteChat = (chatId: string, patientName: string) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      `Bạn có chắc muốn xóa cuộc trò chuyện với ${patientName}?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => {
            // Close the swipeable
            swipeableRefs.current.get(chatId)?.close();
          }
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete conversation from Firestore
              await deleteDocument('conversations', chatId);
              
              // Update local state
              setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
              
              Alert.alert('Thành công', 'Đã xóa cuộc trò chuyện');
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện');
            }
          }
        }
      ]
    );
  };

  const renderRightActions = (chatId: string, patientName: string, progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX: translateX }] }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteChat(chatId, patientName)}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderChatCard = ({ item }: { item: Chat }) => {
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current.set(item.id, ref);
          }
        }}
        renderRightActions={(progress) => renderRightActions(item.id, item.patientName, progress)}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity 
          style={styles.chatCard}
          onPress={() => router.push({
            pathname: '/doctor/chat-detail',
            params: {
              conversationId: item.id,
              patientId: item.patientId,
              patientName: item.patientName,
              patientPhone: item.patientPhone || ''
            }
          })}
        >
          {item.patientAvatar ? (
            <Image source={{ uri: item.patientAvatar }} style={styles.avatar} />
          ) : (
            <Image 
              source={{ 
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName)}&size=128&background=00BCD4&color=fff&bold=true` 
              }} 
              style={styles.avatar} 
            />
          )}
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <Text style={styles.time}>{item.lastMessageTime}</Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00BCD4']} />
            }
          />
        )}
      </View>
    </GestureHandlerRootView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
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
  listContent: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00BCD4',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#0f172a',
  },
  unreadBadge: {
    backgroundColor: '#00BCD4',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
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
