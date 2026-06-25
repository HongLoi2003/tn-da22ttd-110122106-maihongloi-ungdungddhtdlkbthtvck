import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DebugAIChatStorage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [storageData, setStorageData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    loadAllStorageData();
  }, []);

  const loadAllStorageData = async () => {
    try {
      // Lấy tất cả keys
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Lọc chỉ lấy keys liên quan đến ai_chat
      const aiChatKeys = allKeys.filter(key => key.startsWith('ai_chat_'));
      
      console.log('🔍 Found', aiChatKeys.length, 'ai_chat keys:', aiChatKeys);
      
      setStorageKeys(aiChatKeys);
      
      // Load data cho mỗi key
      const data: { [key: string]: any } = {};
      for (const key of aiChatKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            data[key] = parsed;
            console.log(`📦 Key: ${key}, Messages:`, parsed.length);
          }
        } catch (err) {
          console.error(`❌ Error loading ${key}:`, err);
          data[key] = { error: 'Failed to parse' };
        }
      }
      
      setStorageData(data);
    } catch (error) {
      console.error('❌ Error loading storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllAIChatStorage = async () => {
    try {
      for (const key of storageKeys) {
        await AsyncStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      }
      alert('Đã xóa tất cả cache AI Chat');
      loadAllStorageData();
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      alert('Lỗi khi xóa cache');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug AI Chat Storage</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Tổng quan</Text>
          <Text style={styles.infoText}>Số lượng conversations: {storageKeys.length}</Text>
        </View>

        {/* Clear All Button */}
        {storageKeys.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearAllAIChatStorage}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.clearButtonText}>Xóa tất cả cache</Text>
          </TouchableOpacity>
        )}

        {/* Storage Keys */}
        {storageKeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không có dữ liệu trong cache</Text>
          </View>
        ) : (
          storageKeys.map((key, index) => {
            const data = storageData[key];
            const isError = data?.error;
            const messageCount = isError ? 0 : (Array.isArray(data) ? data.length : 0);
            
            return (
              <View key={key} style={styles.card}>
                <View style={styles.keyHeader}>
                  <Text style={styles.keyNumber}>#{index + 1}</Text>
                  <Text style={styles.keyText} numberOfLines={1}>
                    {key}
                  </Text>
                </View>
                
                {isError ? (
                  <Text style={styles.errorText}>❌ {data.error}</Text>
                ) : (
                  <>
                    <Text style={styles.messageCount}>
                      💬 {messageCount} tin nhắn
                    </Text>
                    
                    {/* Show first 3 messages */}
                    {Array.isArray(data) && data.slice(0, 3).map((msg: any, msgIndex: number) => (
                      <View key={msgIndex} style={styles.messagePreview}>
                        <Text style={styles.messageSender}>
                          {msg.isUser ? '👤 User' : '🤖 AI'}
                        </Text>
                        <Text style={styles.messageText} numberOfLines={2}>
                          {msg.text}
                        </Text>
                      </View>
                    ))}
                    
                    {messageCount > 3 && (
                      <Text style={styles.moreText}>
                        ... và {messageCount - 3} tin nhắn khác
                      </Text>
                    )}
                  </>
                )}
              </View>
            );
          })
        )}

        {/* Reload Button */}
        <TouchableOpacity 
          style={styles.reloadButton}
          onPress={loadAllStorageData}
        >
          <Ionicons name="refresh-outline" size={20} color="#4A90E2" />
          <Text style={styles.reloadButtonText}>Tải lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
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
  loadingText: {
    marginTop: 12,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  keyText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748b',
  },
  messageCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  messagePreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 12,
    color: '#334155',
  },
  moreText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
  },
});
