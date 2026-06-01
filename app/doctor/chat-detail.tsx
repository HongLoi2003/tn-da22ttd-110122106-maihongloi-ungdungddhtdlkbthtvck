import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createDocument, getDocumentsWithQuery, updateDocument } from '../services/firebaseService';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  timestamp: any;
  read: boolean;
}

export default function DoctorChatDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  
  const conversationId = params.conversationId as string;
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  const patientPhone = params.patientPhone as string;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [messageAnimations, setMessageAnimations] = useState<{ [key: string]: Animated.Value }>({});
  const [patientAvatar, setPatientAvatar] = useState<string | null>(null);
  const [doctorAvatar, setDoctorAvatar] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState<string>('Bác sĩ');

  const handlePhoneCall = async () => {
    if (!patientPhone) {
      console.log('Không có số điện thoại của bệnh nhân');
      return;
    }

    const phoneNumber = patientPhone.replace(/\s/g, ''); // Remove spaces
    const phoneUrl = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        console.log('Không thể thực hiện cuộc gọi');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
    }
  };

  const handleVideoCall = () => {
    router.push({
      pathname: '/video-call',
      params: {
        callerName: patientName,
        callerAvatar: '',
        callType: 'outgoing'
      }
    });
  };

  useEffect(() => {
    loadMessages();
    loadAvatars();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const loadAvatars = async () => {
    try {
      // Load patient avatar
      if (patientId) {
        const { getDocumentsWithQuery } = await import('../services/firebaseService');
        const { where } = await import('firebase/firestore');
        const users = await getDocumentsWithQuery('users', [
          where('uid', '==', patientId)
        ]);
        if (users.length > 0 && (users[0] as any).avatar) {
          setPatientAvatar((users[0] as any).avatar);
        }
      }
      
      // Load doctor avatar and name
      if (userData?.avatar) {
        setDoctorAvatar(userData.avatar);
      }
      if (userData?.fullName) {
        setDoctorName(userData.fullName);
      }
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  const loadMessages = async () => {
    try {
      if (!conversationId) return;

      // Query đơn giản - chỉ filter theo conversationId, không dùng orderBy
      const messagesData = await getDocumentsWithQuery('messages', [
        where('conversationId', '==', conversationId)
      ]);

      // Sort manually by timestamp
      const sortedMessages = messagesData.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeA - timeB; // Ascending order (oldest first)
      });

      const formattedMessages: Message[] = sortedMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.text || msg.message || '',
        senderId: msg.senderId,
        senderType: msg.senderType,
        timestamp: msg.timestamp,
        read: msg.read || false,
      }));

      // Chỉ animate tin nhắn MỚI (chưa có trong state)
      const currentMessageIds = new Set(messages.map(m => m.id));
      const newMessageIds = formattedMessages
        .filter(msg => !currentMessageIds.has(msg.id))
        .map(msg => msg.id);
      
      if (newMessageIds.length > 0 && messages.length > 0) {
        // Chỉ animate nếu đã có tin nhắn cũ (không phải lần load đầu)
        const newAnimations: { [key: string]: Animated.Value } = {};
        newMessageIds.forEach(id => {
          const anim = new Animated.Value(0);
          newAnimations[id] = anim;
          
          Animated.spring(anim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        });
        
        setMessageAnimations(prev => ({ ...prev, ...newAnimations }));
      }

      setMessages(formattedMessages);
      setLoading(false);

      // Mark messages as read
      const doctorId = (userData?.doctorInfo as any)?.doctorId || userData?.uid;
      const unreadMessages = messagesData.filter((msg: any) => 
        msg.senderType === 'patient' && !msg.read
      );

      for (const msg of unreadMessages) {
        await updateDocument('messages', msg.id, { read: true });
      }

      // Update conversation unread count
      if (unreadMessages.length > 0) {
        await updateDocument('conversations', conversationId, {
          doctorUnreadCount: 0,
        });
      }

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !conversationId || !userData?.uid) return;

    const messageText = message.trim();
    setMessage('');

    try {
      const doctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;

      // Create message
      await createDocument('messages', {
        conversationId,
        text: messageText,
        message: messageText,
        senderId: doctorId,
        senderType: 'doctor',
        timestamp: Timestamp.now(),
        read: false,
      });

      // Get current conversation to increment patient unread count
      const { getDocumentById } = await import('../services/firebaseService');
      const conversation = await getDocumentById('conversations', conversationId);
      const currentPatientUnread = conversation ? ((conversation as any).unreadCountPatient || 0) : 0;
      
      // Update conversation
      await updateDocument('conversations', conversationId, {
        lastMessage: messageText,
        lastMessageTimestamp: Timestamp.now(),
        lastMessageSender: 'doctor',
        unreadCountPatient: currentPatientUnread + 1,
      });

      // Send notification to patient
      try {
        await notificationService.notifyNewMessage(doctorName, messageText);
        
        // Also create notification in Firestore for patient
        await createDocument('notifications', {
          userId: patientId,
          title: `💬 Tin nhắn từ ${doctorName}`,
          body: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText,
          type: 'message',
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            conversationId,
            doctorId: doctorId,
            doctorName: doctorName,
          },
        });
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // Don't fail the message send if notification fails
      }

      // Reload messages
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText); // Restore message on error
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isDoctor = item.senderType === 'doctor';
    
    let timeDisplay = '';
    if (item.timestamp) {
      const timestamp = item.timestamp.toDate ? 
        item.timestamp.toDate() : 
        new Date(item.timestamp);
      timeDisplay = timestamp.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }

    const animValue = messageAnimations[item.id];
    const shouldAnimate = animValue !== undefined;

    return (
      <Animated.View 
        style={[
          styles.messageContainer, 
          isDoctor && styles.messageContainerDoctor,
          shouldAnimate && {
            opacity: animValue,
            transform: [
              {
                scale: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {!isDoctor && patientAvatar && (
          <Image 
            source={{ uri: patientAvatar }}
            style={styles.messageAvatar}
          />
        )}
        <View style={styles.messageContent}>
          {!isDoctor && (
            <Text style={styles.senderName}>{patientName || 'Bệnh nhân'}</Text>
          )}
          {isDoctor && (
            <Text style={styles.senderNameRight}>{doctorName}</Text>
          )}
          <View style={[styles.messageBubble, isDoctor && styles.messageBubbleDoctor]}>
            <Text style={[styles.messageText, isDoctor && styles.messageTextDoctor]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, isDoctor && styles.messageTimeDoctor]}>
              {timeDisplay}
            </Text>
          </View>
        </View>
        {isDoctor && doctorAvatar && (
          <Image 
            source={{ uri: doctorAvatar }}
            style={styles.messageDoctorAvatar}
          />
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{patientName || 'Bệnh nhân'}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{patientName || 'Bệnh nhân'}</Text>
          <Text style={styles.headerSubtitle}>Bệnh nhân</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handlePhoneCall}>
            <Ionicons name="call" size={22} color="#00BCD4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
            <Ionicons name="videocam" size={24} color="#00BCD4" />
          </TouchableOpacity>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>Chưa có tin nhắn</Text>
          <Text style={styles.emptySubtext}>Gửi tin nhắn đầu tiên cho bệnh nhân</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
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
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  messageContainerDoctor: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageContent: {
    maxWidth: '80%',
    flex: 0,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageDoctorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    marginLeft: 4,
  },
  senderNameRight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    marginRight: 4,
    textAlign: 'right',
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    maxWidth: '100%',
  },
  messageBubbleDoctor: {
    alignSelf: 'flex-end',
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  messageText: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTextDoctor: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  messageTimeDoctor: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#0f172a',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
