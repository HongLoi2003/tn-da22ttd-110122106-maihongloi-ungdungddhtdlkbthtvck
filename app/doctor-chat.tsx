import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Helper function to get doctor image
const getDoctorImage = (imageName: string, doctorName?: string) => {
  console.log('Doctor image name:', imageName, 'Doctor name:', doctorName); // Debug log
  
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
  };
  
  // Nếu có imageName và tìm thấy trong images
  if (imageName && images[imageName]) {
    console.log('Using image from imageName:', imageName);
    return images[imageName];
  }
  
  // Fallback: map dựa trên tên bác sĩ
  if (doctorName) {
    const nameMap: { [key: string]: string } = {
      'Nguyễn Văn An': 'nguyenvanam.png',
      'BS. Nguyễn Văn An': 'nguyenvanam.png',
      'Trần Thị Lan': 'tranthilan.png',
      'BS. Trần Thị Lan': 'tranthilan.png',
      'Lê Minh Tâm': 'leminhtam.png',
      'BS. Lê Minh Tâm': 'leminhtam.png',
      'Phạm Thu Hà': 'phamthuha.png',
      'BS. Phạm Thu Hà': 'phamthuha.png',
      'Hoàng Văn Đức': 'hoangvanduc.png',
      'BS. Hoàng Văn Đức': 'hoangvanduc.png',
      'Vũ Thị Lan': 'vuthilan.png',
      'BS. Vũ Thị Lan': 'vuthilan.png',
      'Lê Hoàng Nam': 'lehoangnam.png',
      'BS. Lê Hoàng Nam': 'lehoangnam.png',
      'Trần Thị Mai': 'tranthimai.png',
      'BS. Trần Thị Mai': 'tranthimai.png',
      'Đỗ Minh Tuấn': 'dominhtuan.png',
      'BS. Đỗ Minh Tuấn': 'dominhtuan.png',
      'Ngô Thị Hương': 'ngothihuong.png',
      'BS. Ngô Thị Hương': 'ngothihuong.png',
    };
    
    const mappedImage = nameMap[doctorName];
    if (mappedImage && images[mappedImage]) {
      console.log('Using image from name mapping:', mappedImage);
      return images[mappedImage];
    }
  }
  
  console.log('Using default logo');
  return require('@/assets/images/logo.png');
};

export default function DoctorChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const doctorName = params.doctorName as string || 'BS. Nguyễn Văn An';
  const doctorSpecialty = params.doctorSpecialty as string || 'Chuyên khoa Hô hấp';
  const doctorImage = params.doctorImage as string || 'logo.png';
  
  console.log('Doctor params:', { doctorName, doctorSpecialty, doctorImage }); // Debug log
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Xin chào! Tôi là ${doctorName}. Tôi có thể giúp gì cho bạn hôm nay?`,
      sender: 'doctor',
      time: '09:30',
      seen: true,
    },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        seen: false,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      setTimeout(() => {
        setIsTyping(true);
      }, 1000);

      setTimeout(() => {
        setIsTyping(false);
        const doctorReply = {
          id: messages.length + 2,
          text: 'Cảm ơn bạn đã chia sẻ. Tôi sẽ tư vấn chi tiết cho bạn.',
          sender: 'doctor',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          seen: true,
        };
        setMessages(prev => [...prev, doctorReply]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 2500);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
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
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => {
              router.push({
                pathname: '/voice-call',
                params: {
                  doctorName: doctorName,
                  doctorImage: doctorImage,
                }
              });
            }}
          >
            <Ionicons name="call-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => {
              router.push({
                pathname: '/video-call',
                params: {
                  doctorName: doctorName,
                  doctorImage: doctorImage,
                }
              });
            }}
          >
            <Ionicons name="videocam-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>Hôm nay</Text>
        </View>

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.sender === 'user' ? styles.userMessageWrapper : styles.doctorMessageWrapper,
            ]}
          >
            {msg.sender === 'doctor' && (
              <Image
                source={getDoctorImage(doctorImage, doctorName)}
                style={styles.messageAvatar}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.doctorBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.doctorMessageText,
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  msg.sender === 'user' ? styles.userMessageTime : styles.doctorMessageTime,
                ]}
              >
                {msg.time}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingIndicator}>
            <Image
              source={getDoctorImage(doctorImage, doctorName)}
              style={styles.messageAvatar}
            />
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <View style={styles.quickReplies}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.quickReplyBtn}>
            <Text style={styles.quickReplyText}>Triệu chứng của tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickReplyBtn}>
            <Text style={styles.quickReplyText}>Đặt lịch khám</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickReplyBtn}>
            <Text style={styles.quickReplyText}>Hỏi về thuốc</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add-circle-outline" size={28} color="#00BCD4" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94a3b8"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.emojiBtn}>
            <Ionicons name="happy-outline" size={22} color="#64748b" />
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 12,
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
    color: '#fff',
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
    color: '#fff',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
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
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  doctorMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#00BCD4',
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
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
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
  },
  quickReplies: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quickReplyBtn: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
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
  attachBtn: {
    padding: 4,
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
  emojiBtn: {
    padding: 4,
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
