import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Timestamp, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

// Helper function to get doctor image
const getDoctorImage = (imageName: string, doctorName?: string) => {
  const images: { [key: string]: any } = {
    'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
    'tranthilan.png': require('@/assets/images/tranthilan.png'),
    'leminhtam.png': require('@/assets/images/leminhtam.png'),
    'phamthuha.png': require('@/assets/images/phamthuha.png'),
    'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
    'vuthilan.png': require('@/assets/images/vuthilan.png'),
    'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
    'tranthimai.png': require('@/assets/images/tranthimai.png'),
    'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
    'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
    'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png'),
    'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.png'),
    'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
    'phamminhquan.png': require('@/assets/images/phamminhquan.png'),
    'lethihang.png': require('@/assets/images/lethihang.png'),
    'dangthithao.jpg': require('@/assets/images/dangthithao.jpg'),
  };
  
  if (imageName && images[imageName]) {
    return images[imageName];
  }
  
  return require('@/assets/images/logo.png');
};

export default function DoctorChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData } = useAuth();
  
  const doctorId = params.doctorId as string;
  const doctorName = params.doctorName as string || 'BS. Nguyễn Văn An';
  const doctorSpecialty = params.doctorSpecialty as string || 'Chuyên khoa Hô hấp';
  const doctorImage = params.doctorImage as string || 'logo.png';
  const doctorPhone = params.doctorPhone as string || '';
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageAnimations, setMessageAnimations] = useState<{ [key: string]: Animated.Value }>({});
  const [patientAvatar, setPatientAvatar] = useState<string | null>(null);

  const handlePhoneCall = async () => {
    if (!doctorPhone) {
      console.log('Không có số điện thoại của bác sĩ');
      return;
    }

    const phoneNumber = doctorPhone.replace(/\s/g, '');
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
        callerName: doctorName,
        callerAvatar: doctorImage,
        callType: 'outgoing'
      }
    });
  };

  useEffect(() => {
    initializeChat();
    
    // Load patient avatar
    if (userData?.avatar) {
      setPatientAvatar(userData.avatar);
    }
    
    const interval = setInterval(() => {
      if (conversationId) {
        loadMessages();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [conversationId]);

  const initializeChat = async () => {
    try {
      if (!userData?.uid || !doctorId) {
        console.log('Missing userData or doctorId');
        console.log('userData:', userData);
        console.log('doctorId:', doctorId);
        setLoading(false);
        return;
      }

      console.log('=== INITIALIZING CHAT ===');
      console.log('Patient ID:', userData.uid);
      console.log('Patient Name:', userData.fullName);
      console.log('Doctor ID from params:', doctorId);
      console.log('Doctor Name:', doctorName);

      // Try to find existing conversation by patientId and doctorId
      let existingConversations = await getDocumentsWithQuery('conversations', [
        where('patientId', '==', userData.uid),
        where('doctorId', '==', doctorId)
      ]);

      // If not found, also try with doctorIdOriginal (for backward compatibility)
      if (existingConversations.length === 0) {
        existingConversations = await getDocumentsWithQuery('conversations', [
          where('patientId', '==', userData.uid),
          where('doctorIdOriginal', '==', doctorId)
        ]);
      }

      console.log('Existing conversations found:', existingConversations.length);

      if (existingConversations.length > 0) {
        const conv = existingConversations[0];
        setConversationId(conv.id);
        console.log('Using existing conversation:', conv.id);
        console.log('Conversation data:', conv);
        await loadMessagesForConversation(conv.id);
      } else {
        console.log('Creating new conversation...');
        
        // Cần map doctorId (bs004) sang Firebase Auth UID
        // Lấy thông tin bác sĩ từ doctors collection
        let doctorAuthUid = doctorId; // Default fallback
        try {
          const { getDocumentById } = await import('./services/firebaseService');
          const doctorData = await getDocumentById('doctors', doctorId);
          if (doctorData && (doctorData as any).authUid) {
            doctorAuthUid = (doctorData as any).authUid;
            console.log('Found doctor authUid:', doctorAuthUid);
          } else {
            console.log('Doctor document does not have authUid field');
          }
        } catch (error) {
          console.log('Could not fetch doctor authUid:', error);
        }
        
        // Lưu cả doctorId gốc (từ doctors collection) và doctorAuthUid (Firebase Auth UID)
        const newConversation = await createDocument('conversations', {
          patientId: userData.uid,
          patientName: userData.fullName || 'Bệnh nhân',
          patientAvatar: userData.avatar || '',
          doctorId: doctorId, // ID từ doctors collection (bs004, bs005, etc.)
          doctorAuthUid: doctorAuthUid, // Firebase Auth UID của bác sĩ
          doctorIdOriginal: doctorId, // Backup để query
          doctorName: doctorName,
          doctorSpecialty: doctorSpecialty,
          lastMessage: '',
          lastMessageTimestamp: Timestamp.now(),
          lastMessageSender: '',
          unreadCountPatient: 0,
          doctorUnreadCount: 0,
          createdAt: Timestamp.now(),
        });
        
        setConversationId(newConversation.id);
        console.log('Created new conversation:', newConversation.id);
        console.log('New conversation data:', newConversation);
      }

      setLoading(false);
    } catch (error: any) {
      // Xử lý lỗi permission-denied một cách graceful
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.log('Chat feature requires Firestore permissions - silently handling');
        // Không hiển thị lỗi cho user, chỉ log để debug
      } else {
        console.error('Error initializing chat:', error);
      }
      setLoading(false);
    }
  };

  const loadMessagesForConversation = async (convId: string) => {
    try {
      const messagesData = await getDocumentsWithQuery('messages', [
        where('conversationId', '==', convId)
      ]);

      const sortedMessages = messagesData.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeA - timeB;
      });

      const formattedMessages = sortedMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.text || msg.message || '',
        sender: msg.senderType,
        time: msg.timestamp?.toDate ? 
          msg.timestamp.toDate().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 
          '',
        timestamp: msg.timestamp,
        seen: msg.read || false,
      }));

      // Chỉ animate tin nhắn MỚI (chưa có trong state)
      const currentMessageIds = new Set(messages.map(m => m.id));
      const newMessageIds = formattedMessages
        .filter((msg: any) => !currentMessageIds.has(msg.id))
        .map((msg: any) => msg.id);
      
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

      const unreadMessages = messagesData.filter((msg: any) => 
        msg.senderType === 'doctor' && !msg.read
      );

      for (const msg of unreadMessages) {
        await updateDocument('messages', msg.id, { read: true });
      }

      if (unreadMessages.length > 0) {
        await updateDocument('conversations', convId, {
          unreadCountPatient: 0,
        });
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.log('Messages feature requires Firestore permissions - silently handling');
      } else {
        console.error('Error loading messages:', error);
      }
    }
  };

  const loadMessages = async () => {
    if (conversationId) {
      await loadMessagesForConversation(conversationId);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !conversationId || !userData?.uid) return;

    const messageText = message.trim();
    const now = new Date();
    const newMessage = {
      id: 'temp-' + Date.now(),
      text: messageText,
      sender: 'patient',
      time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Timestamp.now(),
      seen: false,
    };

    // Thêm tin nhắn vào UI ngay lập tức
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Scroll xuống cuối
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const createResult = await createDocument('messages', {
        conversationId,
        text: messageText,
        message: messageText,
        senderId: userData.uid,
        senderType: 'patient',
        timestamp: Timestamp.now(),
        read: false,
      });

      // Get current conversation to increment unread count
      const { getDocumentById } = await import('./services/firebaseService');
      const conversation = await getDocumentById('conversations', conversationId);
      const currentUnread = conversation ? ((conversation as any).doctorUnreadCount || 0) : 0;
      
      await updateDocument('conversations', conversationId, {
        lastMessage: messageText,
        lastMessageTimestamp: Timestamp.now(),
        lastMessageSender: 'patient',
        doctorUnreadCount: currentUnread + 1,
      });

      // Chỉ load lại nếu thực sự lưu được vào Firestore (không phải mock data)
      if (createResult && !createResult.id.startsWith('mock-')) {
        await loadMessages();
      }
    } catch (error: any) {
      // Xử lý lỗi permission-denied một cách graceful
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.log('Send message requires Firestore permissions - using local state only');
        // Tin nhắn đã được thêm vào UI ở trên, không cần làm gì thêm
      } else {
        console.error('Error sending message:', error);
        // Xóa tin nhắn tạm nếu gửi thất bại (lỗi khác permission)
        setMessages(prev => prev.filter(m => m.id !== newMessage.id));
        setMessage(messageText);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.doctorInfo}>
            <Image
              source={getDoctorImage(doctorImage, doctorName)}
              style={styles.doctorAvatar}
            />
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{doctorName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.doctorInfo}>
          <Image
            source={getDoctorImage(doctorImage, doctorName)}
            style={styles.doctorAvatar}
          />
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Bác sĩ</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handlePhoneCall}
          >
            <Ionicons name="call" size={22} color="#00BCD4" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleVideoCall}
          >
            <Ionicons name="videocam" size={24} color="#00BCD4" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có tin nhắn</Text>
            <Text style={styles.emptySubtext}>Gửi tin nhắn đầu tiên cho bác sĩ</Text>
          </View>
        ) : (
          <>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>Hôm nay</Text>
            </View>

            {messages.map((msg) => {
              const animValue = messageAnimations[msg.id];
              const shouldAnimate = animValue !== undefined;
              const isPatient = msg.sender === 'patient';
              
              return (
                <Animated.View
                  key={msg.id}
                  style={[
                    styles.messageWrapper,
                    isPatient ? styles.userMessageWrapper : styles.doctorMessageWrapper,
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
                  {!isPatient && (
                    <Image
                      source={getDoctorImage(doctorImage, doctorName)}
                      style={styles.messageAvatar}
                    />
                  )}
                  <View style={styles.messageContent}>
                    {!isPatient && (
                      <Text style={styles.senderName}>{doctorName}</Text>
                    )}
                    {isPatient && (
                      <Text style={styles.senderNameRight}>{userData?.fullName || 'Bạn'}</Text>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isPatient ? styles.userBubble : styles.doctorBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isPatient ? styles.userMessageText : styles.doctorMessageText,
                        ]}
                      >
                        {msg.text}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isPatient ? styles.userMessageTime : styles.doctorMessageTime,
                        ]}
                      >
                        {msg.time}
                      </Text>
                    </View>
                  </View>
                  {isPatient && patientAvatar && (
                    <Image
                      source={{ uri: patientAvatar }}
                      style={styles.patientAvatar}
                    />
                  )}
                </Animated.View>
              );
            })}
          </>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>
        <TouchableOpacity 
          style={[styles.sendBtn, message.trim() && styles.sendBtnActive]}
          onPress={sendMessage}
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
    backgroundColor: '#f0f9ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06D6A0',
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  doctorMessageWrapper: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
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
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  patientMessageAvatar: {
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '100%',
    minWidth: 60,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#00BCD4',
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  userMessageText: {
    color: '#fff',
  },
  doctorMessageText: {
    color: '#0f172a',
  },
  messageTime: {
    fontSize: 11,
  },
  userMessageTime: {
    color: '#fff',
    opacity: 0.8,
    textAlign: 'right',
  },
  doctorMessageTime: {
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#00BCD4',
  },
});
