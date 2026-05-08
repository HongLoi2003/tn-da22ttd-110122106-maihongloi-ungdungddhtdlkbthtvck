import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export default function AIConsultationScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Tin nhắn chào mừng từ AI
    const welcomeMessage: Message = {
      id: '1',
      text: 'Xin chào! Tôi là AI Tư vấn Y tế. Tôi sẽ giúp bạn phân tích triệu chứng và gợi ý chuyên khoa phù hợp.\n\nVui lòng mô tả triệu chứng bạn đang gặp phải.',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const analyzeSymptoms = (symptoms: string): { specialty: string; doctors: string[]; analysis: string } => {
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes('đau ngực') || lowerSymptoms.includes('tim') || lowerSymptoms.includes('huyết áp') || lowerSymptoms.includes('khó thở')) {
      return {
        specialty: 'Tim mạch',
        doctors: ['BS. Nguyễn Văn An', 'BS. Trần Minh Đức', 'BS. Lê Thị Hương'],
        analysis: 'Các triệu chứng bạn mô tả có thể liên quan đến hệ tim mạch. Đau ngực và khó thở có thể là dấu hiệu của các vấn đề về tim.'
      };
    }
    
    if (lowerSymptoms.includes('đau bụng') || lowerSymptoms.includes('buồn nôn') || lowerSymptoms.includes('tiêu hóa') || lowerSymptoms.includes('đau dạ dày')) {
      return {
        specialty: 'Tiêu hóa',
        doctors: ['BS. Phạm Văn Hải', 'BS. Nguyễn Thị Lan', 'BS. Hoàng Minh Tuấn'],
        analysis: 'Triệu chứng cho thấy có thể có vấn đề về hệ tiêu hóa. Đau bụng và buồn nôn thường liên quan đến dạ dày hoặc ruột.'
      };
    }
    
    if (lowerSymptoms.includes('ho') || lowerSymptoms.includes('khó thở') || lowerSymptoms.includes('phổi') || lowerSymptoms.includes('hen suyễn')) {
      return {
        specialty: 'Hô hấp',
        doctors: ['BS. Vũ Thanh Tùng', 'BS. Đặng Thị Mai', 'BS. Lý Văn Nam'],
        analysis: 'Các triệu chứng liên quan đến hệ hô hấp. Ho và khó thở có thể do nhiễm trùng đường hô hấp hoặc các bệnh lý phổi.'
      };
    }
    
    if (lowerSymptoms.includes('đau đầu') || lowerSymptoms.includes('chóng mặt') || lowerSymptoms.includes('thần kinh') || lowerSymptoms.includes('mất ngủ')) {
      return {
        specialty: 'Thần kinh',
        doctors: ['BS. Cao Văn Dũng', 'BS. Phan Thị Hoa', 'BS. Đinh Quang Minh'],
        analysis: 'Triệu chứng có thể liên quan đến hệ thần kinh. Đau đầu và chóng mặt cần được kiểm tra để loại trừ các vấn đề nghiêm trọng.'
      };
    }
    
    if (lowerSymptoms.includes('da') || lowerSymptoms.includes('ngứa') || lowerSymptoms.includes('phát ban') || lowerSymptoms.includes('mụn')) {
      return {
        specialty: 'Da liễu',
        doctors: ['BS. Trần Thị Lan', 'BS. Ngô Văn Phúc', 'BS. Lê Thị Hạnh'],
        analysis: 'Các triệu chứng về da cần được khám bởi bác sĩ da liễu để chẩn đoán chính xác và điều trị phù hợp.'
      };
    }
    
    if (lowerSymptoms.includes('sốt') || lowerSymptoms.includes('mệt mỏi') || lowerSymptoms.includes('cảm lạnh')) {
      return {
        specialty: 'Nội tổng quát',
        doctors: ['BS. Nguyễn Văn Bình', 'BS. Trương Thị Nga', 'BS. Lê Minh Tâm'],
        analysis: 'Triệu chứng chung cần được khám nội tổng quát để đánh giá toàn diện tình trạng sức khỏe.'
      };
    }
    
    // Mặc định
    return {
      specialty: 'Nội tổng quát',
      doctors: ['BS. Nguyễn Văn Bình', 'BS. Trương Thị Nga', 'BS. Lê Minh Tâm'],
      analysis: 'Dựa trên mô tả của bạn, tôi khuyên bạn nên khám nội tổng quát để được đánh giá chi tiết.'
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const analysis = analyzeSymptoms(inputText);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `${analysis.analysis}\n\n🏥 **Chuyên khoa gợi ý:** ${analysis.specialty}\n\n👨‍⚕️ **Bác sĩ đề xuất:**\n${analysis.doctors.map((doctor, index) => `${index + 1}. ${doctor}`).join('\n')}\n\n💡 **Lời khuyên:** Bạn nên đặt lịch khám với một trong các bác sĩ trên để được chẩn đoán chính xác và điều trị kịp thời.\n\nBạn có muốn tôi giúp đặt lịch khám không?`,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="medical" size={20} color="#00BCD4" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, item.isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.isUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={styles.aiAvatar}>
          <Ionicons name="medical" size={20} color="#00BCD4" />
        </View>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Tư vấn Y tế</Text>
          <Text style={styles.headerSubtitle}>Trợ lý thông minh</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="information-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={renderTypingIndicator}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Mô tả triệu chứng của bạn..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#00BCD4',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#0f172a',
  },
  userText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  aiTimestamp: {
    color: '#94a3b8',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});