import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { orderBy, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { deleteDocument, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

interface Conversation {
  id: string;
  createdAt: any;
  updatedAt: any;
  messageCount?: number;
  preview?: string;
  isDeleted?: boolean;
  deletedAt?: any;
}

export default function AIChatHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [user, showDeleted]);

  const loadConversations = async () => {
    if (!user?.uid) {
      console.log('❌ No user uid');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 Loading conversations for user:', user.uid);
      console.log('📊 Show deleted:', showDeleted);
      
      // Lấy tất cả conversations của user (bao gồm cả đã xóa)
      const convs = await getDocumentsWithQuery('ai-conversations', [
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      ]);

      // Filter theo showDeleted
      const filteredConvs = convs.filter((conv: any) => {
        if (showDeleted) {
          return conv.isDeleted === true;
        } else {
          return !conv.isDeleted;
        }
      });

      console.log('📦 Total conversations:', convs.length);
      console.log('📦 Filtered conversations:', filteredConvs.length);

      // Lấy preview message đầu tiên của mỗi conversation
      const convsWithPreview = await Promise.all(
        filteredConvs.map(async (conv: any) => {
          try {
            console.log('📝 Loading messages for conversation:', conv.id);
            const messages = await getDocumentsWithQuery('ai-messages', [
              where('conversationId', '==', conv.id),
              orderBy('createdAt', 'asc')
            ]) as any[];

            console.log(`  → Found ${messages.length} messages`);

            // Tìm message đầu tiên của user (không phải welcome message)
            const userMsg = messages.find((m: any) => m.isUser);
            const preview = userMsg ? userMsg.text : messages[0]?.text || 'Chưa có tin nhắn';

            return {
              id: conv.id,
              createdAt: conv.createdAt,
              updatedAt: conv.updatedAt,
              messageCount: messages.length,
              preview: preview.substring(0, 80) + (preview.length > 80 ? '...' : ''),
              isDeleted: conv.isDeleted || false,
              deletedAt: conv.deletedAt
            };
          } catch (error) {
            console.error('Error loading messages for conversation:', conv.id, error);
            return {
              id: conv.id,
              createdAt: conv.createdAt,
              updatedAt: conv.updatedAt,
              messageCount: 0,
              preview: 'Không thể tải tin nhắn',
              isDeleted: conv.isDeleted || false,
              deletedAt: conv.deletedAt
            };
          }
        })
      );

      console.log('✅ Total conversations with preview:', convsWithPreview.length);
      setConversations(convsWithPreview);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    router.push({
      pathname: '/ai-chat',
      params: { conversationId }
    });
  };

  const handleDeleteConversation = async (conversationId: string) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Cuộc trò chuyện sẽ được chuyển vào thùng rác. Bạn có thể khôi phục sau.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('🗑️ Soft deleting conversation:', conversationId);
              
              // Soft delete: chỉ đánh dấu isDeleted = true
              await updateDocument('ai-conversations', conversationId, {
                isDeleted: true,
                deletedAt: new Date()
              });
              
              // Xóa cache trong AsyncStorage
              await AsyncStorage.removeItem(`ai_chat_${conversationId}`);
              
              // Nếu đây là last conversation, xóa luôn
              const lastConvId = await AsyncStorage.getItem('last_ai_conversation_id');
              if (lastConvId === conversationId) {
                await AsyncStorage.removeItem('last_ai_conversation_id');
                console.log('  → Cleared last_ai_conversation_id');
              }
              
              console.log('✅ Conversation soft deleted successfully');
              
              // Reload lại danh sách
              loadConversations();
              
            } catch (error) {
              console.error('❌ Error deleting conversation:', error);
              Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleRestoreConversation = async (conversationId: string) => {
    Alert.alert(
      'Khôi phục cuộc trò chuyện',
      'Bạn muốn khôi phục cuộc trò chuyện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('♻️ Restoring conversation:', conversationId);
              
              await updateDocument('ai-conversations', conversationId, {
                isDeleted: false,
                deletedAt: null
              });
              
              console.log('✅ Conversation restored successfully');
              
              // Reload lại danh sách
              loadConversations();
              
            } catch (error) {
              console.error('❌ Error restoring conversation:', error);
              Alert.alert('Lỗi', 'Không thể khôi phục cuộc trò chuyện. Vui lòng thử lại.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handlePermanentDelete = async (conversationId: string) => {
    Alert.alert(
      'Xóa vĩnh viễn',
      'Xóa vĩnh viễn cuộc trò chuyện này? Hành động này KHÔNG THỂ hoàn tác!',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('🔥 Permanently deleting conversation:', conversationId);
              
              // 1. Xóa tất cả messages
              const messages = await getDocumentsWithQuery('ai-messages', [
                where('conversationId', '==', conversationId)
              ]);
              
              console.log(`  → Deleting ${messages.length} messages...`);
              for (const msg of messages) {
                await deleteDocument('ai-messages', msg.id);
              }
              
              // 2. Xóa conversation
              await deleteDocument('ai-conversations', conversationId);
              
              // 3. Xóa cache
              await AsyncStorage.removeItem(`ai_chat_${conversationId}`);
              
              console.log('✅ Conversation permanently deleted');
              
              // Reload lại danh sách
              loadConversations();
              
            } catch (error) {
              console.error('❌ Error permanently deleting conversation:', error);
              Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <View style={styles.conversationWrapper}>
      <TouchableOpacity
        style={[
          styles.conversationCard,
          item.isDeleted && styles.deletedConversationCard
        ]}
        onPress={() => !item.isDeleted && handleSelectConversation(item.id)}
        activeOpacity={0.7}
        disabled={deleting || item.isDeleted}
      >
        <View style={[
          styles.iconContainer,
          item.isDeleted && styles.deletedIconContainer
        ]}>
          <Ionicons 
            name={item.isDeleted ? "trash-bin" : "chatbubble-ellipses"} 
            size={24} 
            color={item.isDeleted ? "#94a3b8" : "#4A90E2"} 
          />
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[
              styles.conversationDate,
              item.isDeleted && styles.deletedText
            ]}>
              {item.isDeleted && item.deletedAt 
                ? `Đã xóa ${formatDate(item.deletedAt)}`
                : formatDate(item.updatedAt)
              }
            </Text>
            <Text style={[
              styles.messageCount,
              item.isDeleted && styles.deletedText
            ]}>
              {item.messageCount || 0} tin nhắn
            </Text>
          </View>
          
          <Text 
            style={[
              styles.conversationPreview,
              item.isDeleted && styles.deletedText
            ]} 
            numberOfLines={2}
          >
            {item.preview}
          </Text>
        </View>

        {!item.isDeleted && (
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        )}
      </TouchableOpacity>
      
      {!item.isDeleted ? (
        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={() => handleDeleteConversation(item.id)}
          activeOpacity={0.7}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.restoreButton, deleting && styles.deleteButtonDisabled]}
            onPress={() => handleRestoreConversation(item.id)}
            activeOpacity={0.7}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="reload-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.permanentDeleteButton, deleting && styles.deleteButtonDisabled]}
            onPress={() => handlePermanentDelete(item.id)}
            activeOpacity={0.7}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}> Lịch sử chat </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showDeleted ? 'Thùng rác' : 'Lịch sử chat'}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowDeleted(!showDeleted)} 
          style={styles.toggleButton}
        >
          <Ionicons 
            name={showDeleted ? "chatbubbles" : "trash-bin"} 
            size={24} 
            color="#1e293b" 
          />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={showDeleted ? "trash-bin-outline" : "chatbubbles-outline"} 
            size={80} 
            color="#cbd5e1" 
          />
          <Text style={styles.emptyTitle}>
            {showDeleted ? 'Thùng rác trống' : 'Chưa có lịch sử'}
          </Text>
          <Text style={styles.emptyText}>
            {showDeleted 
              ? 'Các cuộc trò chuyện đã xóa sẽ hiển thị tại đây'
              : 'Các cuộc trò chuyện với AI chat sẽ được lưu tại đây'
            }
          </Text>
          {!showDeleted && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/ai-chat')}
            >
              <Text style={styles.startButtonText}>Bắt đầu chat ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b'
  },
  listContainer: {
    padding: 16
  },
  conversationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  conversationCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  deleteButtonDisabled: {
    backgroundColor: '#fca5a5',
    opacity: 0.7
  },
  toggleButton: {
    padding: 8
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  restoreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  permanentDeleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  deletedConversationCard: {
    backgroundColor: '#f1f5f9',
    opacity: 0.8
  },
  deletedIconContainer: {
    backgroundColor: '#e2e8f0'
  },
  deletedText: {
    color: '#94a3b8'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  conversationContent: {
    flex: 1
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  conversationDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1
  },
  messageCount: {
    fontSize: 12,
    color: '#64748b'
  },
  conversationPreview: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20
  },
  startButton: {
    marginTop: 24,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  }
});
