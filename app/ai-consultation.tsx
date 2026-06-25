import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from './config/firebase';
import followUpQuestionsService, { FollowUpQuestion } from './services/followUpQuestionsService';
import symptomMappingService, { SymptomItem } from './services/symptomMappingService';

const STORAGE_KEY_MESSAGES = '@ai_consultation_messages';
const STORAGE_KEY_STATE = '@ai_consultation_state';

interface DoctorRecommendation {
  id: string;
  name: string;
  specialty: string;
  image?: string; // Thêm field image
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  hasOptions?: boolean;
  options?: string[];
  doctors?: DoctorRecommendation[];
}

interface ConversationState {
  phase: 'initial' | 'follow-up' | 'complete';
  initialSymptoms: string;
  matchedSymptoms: SymptomItem[];
  primarySpecialty: string;
  questions: FollowUpQuestion[];
  answers: string[];
  currentQuestionIndex: number;
}

export default function AIConsultationScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // Control auto-scroll behavior
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'initial',
    initialSymptoms: '',
    matchedSymptoms: [],
    primarySpecialty: '',
    questions: [],
    answers: [],
    currentQuestionIndex: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục hội thoại khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      loadConversation();
      return () => {
        // Cleanup nếu cần
      };
    }, [])
  );

  // Lưu hội thoại mỗi khi messages hoặc conversationState thay đổi
  useEffect(() => {
    if (!isLoading) {
      saveConversation();
    }
  }, [messages, conversationState]);

  const loadConversation = async () => {
    try {
      const [savedMessages, savedState] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_MESSAGES),
        AsyncStorage.getItem(STORAGE_KEY_STATE)
      ]);

      if (savedMessages && savedState) {
        const parsedMessages = JSON.parse(savedMessages);
        const parsedState = JSON.parse(savedState);
        
        // Chuyển đổi timestamp từ string về Date
        const messagesWithDates = parsedMessages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(messagesWithDates);
        setConversationState(parsedState);
      } else {
        // Nếu chưa có dữ liệu, hiển thị tin nhắn chào mừng
        const welcomeMessage: Message = {
          id: '1',
          text: 'Xin chào! Tôi là AI Tư vấn chuyên khoa.Tôi sẽ giúp bạn phân tích triệu chứng và gợi ý chuyên khoa phù hợp.\n\nnBạn hãy mô tả triệu chứng bạn đang gặp phải.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Nếu có lỗi, hiển thị tin nhắn chào mừng
      const welcomeMessage: Message = {
        id: '1',
        text: 'Xin chào! Tôi là AI Tư vấn chuyên khoa.Tôi sẽ giúp bạn phân tích triệu chứng và gợi ý chuyên khoa phù hợp.\n\nBạn hãy mô tả triệu chứng bạn đang gặp phải.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages)),
        AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(conversationState))
      ]);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const clearConversation = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY_MESSAGES),
        AsyncStorage.removeItem(STORAGE_KEY_STATE)
      ]);
      
      // Reset về trạng thái ban đầu
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: 'Xin chào! Tôi là AI Tư vấn chuyên khoa.Tôi sẽ giúp bạn phân tích triệu chứng và gợi ý chuyên khoa phù hợp.\n\nBạn hãy mô tả triệu chứng bạn đang gặp phải.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setConversationState({
        phase: 'initial',
        initialSymptoms: '',
        matchedSymptoms: [],
        primarySpecialty: '',
        questions: [],
        answers: [],
        currentQuestionIndex: 0
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Xóa đoạn hội thoại',
      'Bạn có chắc chắn muốn xóa toàn bộ đoạn hội thoại này? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: clearConversation
        }
      ]
    );
  };

  useEffect(() => {
    // Tin nhắn chào mừng từ AI - chỉ dùng nếu không load được từ storage
    if (messages.length === 0 && !isLoading) {
      const welcomeMessage: Message = {
        id: '1',
        text: 'Xin chào! Tôi là AI Tư vấn Y tế. Tôi sẽ giúp bạn phân tích triệu chứng và gợi ý chuyên khoa phù hợp.\n\nVui lòng mô tả triệu chứng bạn đang gặp phải.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoading]);

  // Dữ liệu triệu chứng mở rộng từ specialties-data - 12 chuyên khoa
  const extendedSymptomData: Record<string, { name: string; keywords: Array<{ word: string; weight: number; synonyms: string[] }> }> = {
    // 5 chuyên khoa chính từ specialties-data.js
    'than_kinh': {
      name: 'Thần kinh',
     keywords: [
      { word: 'đau đầu', weight: 10, synonyms: ['nhức đầu', 'đầu đau', 'dau dau', 'đau đầu dữ dội'] },
      { word: 'chóng mặt', weight: 9, synonyms: ['hoa mắt', 'choáng', 'choang', 'chong mat', 'hoa mat', 'váng đầu'] },
      { word: 'mất ngủ', weight: 8, synonyms: ['khó ngủ', 'không ngủ được', 'mat ngu', 'kho ngu', 'thức đêm', 'mất giấc'] },
      { word: 'đau nửa đầu', weight: 10, synonyms: ['migraine', 'đau nửa đầu', 'đau đầu một bên', 'nhức nửa đầu'] },
      { word: 'run tay chân', weight: 9, synonyms: ['run tay', 'run chân', 'run rẩy', 'rung', 'run liên tục'] },
      { word: 'tê tay chân', weight: 9, synonyms: ['tê bì', 'tê tay', 'tê chân', 'tê liệt', 'tê mỏi'] },
      { word: 'co giật', weight: 10, synonyms: ['giật mình', 'co cứng', 'co thắt', 'giật cơ', 'co giật toàn thân'] },
      { word: 'mất trí nhớ', weight: 9, synonyms: ['quên', 'hay quên', 'suy giảm trí nhớ', 'mất trí', 'không nhớ'] },
      { word: 'hay quên', weight: 8, synonyms: ['quên lãng', 'hay quên việc', 'dễ quên', 'quên nhanh'] },
      { word: 'mệt mỏi thần kinh', weight: 8, synonyms: ['mệt mỏi', 'mệt', 'mỏi', 'met moi', 'uể oải', 'kiệt sức'] },
      { word: 'khó tập trung', weight: 8, synonyms: ['không tập trung', 'mất tập trung', 'không chú ý', 'xao lãng'] },
      { word: 'stress kéo dài', weight: 8, synonyms: ['stress', 'căng thẳng', 'lo âu', 'lo lắng', 'canh thang', 'lo au', 'stress mãn tính'] },
      { word: 'đau dây thần kinh', weight: 10, synonyms: ['đau thần kinh', 'viêm dây thần kinh', 'đau dây', 'tổn thương thần kinh'] },
      { word: 'mất thăng bằng', weight: 9, synonyms: ['loạng choạng', 'đi không vững', 'mất cân bằng', 'không giữ thăng bằng'] },
      { word: 'hoa mắt', weight: 8, synonyms: ['mờ mắt', 'nhìn mờ', 'chóng mặt', 'hoa mắt chóng mặt'] },
      { word: 'ngất xỉu', weight: 10, synonyms: ['ngất', 'xỉu', 'bất tỉnh', 'mất ý thức', 'choáng váng'] },
      { word: 'yếu cơ', weight: 9, synonyms: ['yếu tay chân', 'cơ yếu', 'mất sức', 'không có sức', 'teo cơ'] },
      { word: 'liệt mặt', weight: 10, synonyms: ['méo mặt', 'liệt nửa mặt', 'mặt méo', 'liệt dây thần kinh mặt'] },
      { word: 'đau cổ vai gáy', weight: 8, synonyms: ['đau cổ', 'đau vai', 'đau gáy', 'nhức cổ vai', 'cứng cổ'] },
      { word: 'đau lưng thần kinh', weight: 9, synonyms: ['đau lưng', 'nhức lưng', 'đau thần kinh tọa', 'đau dây thần kinh lưng'] },
      { word: 'dị cảm', weight: 8, synonyms: ['cảm giác lạ', 'tê buốt', 'châm chích', 'kiến bò', 'ngứa ran'] },
      { word: 'rối loạn giấc ngủ', weight: 8, synonyms: ['ngủ không ngon', 'ngủ không sâu', 'thức giấc nhiều', 'mất ngủ'] },
      { word: 'căng thẳng thần kinh', weight: 8, synonyms: ['căng thẳng', 'stress', 'lo âu', 'bồn chồn', 'bất an'] },
      { word: 'lo âu', weight: 8, synonyms: ['lo lắng', 'lo sợ', 'bồn chồn', 'hồi hộp', 'bất an'] },
      { word: 'trầm cảm nhẹ', weight: 8, synonyms: ['trầm cảm', 'buồn chán', 'u sầu', 'tram cam', 'chán nản'] },
      { word: 'động kinh', weight: 10, synonyms: ['co giật', 'giật cơ', 'động kinh toàn thể', 'cơn động kinh'] },
      { word: 'khó nói', weight: 9, synonyms: ['nói khó', 'nói ngọng', 'nói lắp', 'khó phát âm', 'nói không rõ'] },
      { word: 'méo miệng', weight: 10, synonyms: ['miệng méo', 'liệt mặt', 'mặt méo', 'méo mồm'] },
      { word: 'tay chân yếu', weight: 9, synonyms: ['yếu tay chân', 'tay yếu', 'chân yếu', 'mất sức', 'liệt nhẹ'] },
      { word: 'rối loạn cảm giác', weight: 8, synonyms: ['mất cảm giác', 'tê liệt', 'dị cảm', 'cảm giác lạ', 'giảm cảm giác'] }
    ]
  },
  'xuong_khop': {
    name: 'Cơ xương khớp',
    keywords: [
      { word: 'đau lưng', weight: 10, synonyms: ['nhức lưng', 'dau lung', 'lung dau', 'lưng đau', 'đau thắt lưng'] },
      { word: 'đau cổ vai gáy', weight: 9, synonyms: ['đau cổ', 'đau vai', 'đau gáy', 'nhức cổ vai', 'cứng cổ', 'mỏi vai gáy'] },
      { word: 'đau khớp gối', weight: 10, synonyms: ['đau gối', 'nhức gối', 'gối đau', 'dau goi', 'đau đầu gối'] },
      { word: 'đau vai', weight: 9, synonyms: ['nhức vai', 'vai đau', 'dau vai', 'đau khớp vai'] },
      { word: 'đau cột sống', weight: 9, synonyms: ['đau lưng', 'nhức cột sống', 'cột sống đau', 'đau sống lưng'] },
      { word: 'tê tay chân', weight: 8, synonyms: ['tê bì', 'tê tay', 'tê chân', 'tê liệt', 'tê mỏi'] },
      { word: 'cứng khớp', weight: 9, synonyms: ['khớp cứng', 'khớp không mềm', 'cứng đơ', 'khó cử động khớp'] },
      { word: 'đau cơ', weight: 8, synonyms: ['nhức cơ', 'cơ đau', 'dau co', 'đau bắp thịt'] },
      { word: 'nhức mỏi xương khớp', weight: 8, synonyms: ['mỏi xương', 'nhức xương', 'mỏi khớp', 'nhức khớp', 'xương khớp đau'] },
      { word: 'sưng khớp', weight: 9, synonyms: ['khớp sưng', 'sưng đau khớp', 'phù khớp', 'khớp to'] },
      { word: 'viêm khớp', weight: 10, synonyms: ['viem khop', 'khớp viêm', 'viêm đau khớp', 'viêm nhiều khớp'] },
      { word: 'khó vận động', weight: 9, synonyms: ['khó cử động', 'khó di chuyển', 'hạn chế vận động', 'cứng đơ'] },
      { word: 'đau thắt lưng', weight: 10, synonyms: ['thắt lưng đau', 'đau lưng dưới', 'đau vùng thắt lưng'] },
      { word: 'đau bàn chân', weight: 8, synonyms: ['bàn chân đau', 'nhức bàn chân', 'đau gót chân', 'đau mu bàn chân'] },
      { word: 'đau bàn tay', weight: 8, synonyms: ['bàn tay đau', 'nhức bàn tay', 'đau cổ tay', 'đau ngón tay'] },
      { word: 'chuột rút', weight: 8, synonyms: ['co cứng cơ', 'co thắt cơ', 'chuột rút chân', 'chuột rút tay'] },
      { word: 'yếu cơ', weight: 8, synonyms: ['yếu tay chân', 'cơ yếu', 'mất sức', 'không có sức', 'teo cơ'] },
      { word: 'khớp phát tiếng kêu', weight: 7, synonyms: ['khớp kêu', 'khớp kêu lục cục', 'khớp kêu răng rắc', 'tiếng kêu khớp'] },
      { word: 'đau khi đi lại', weight: 9, synonyms: ['đau khi đi', 'đau khi bước', 'khó đi lại', 'đau khi vận động'] },
      { word: 'đau đầu gối khi leo cầu thang', weight: 9, synonyms: ['đau gối leo cầu thang', 'gối đau khi lên xuống cầu thang', 'đau khi leo thang'] },
      { word: 'cứng cổ', weight: 8, synonyms: ['cổ cứng', 'cổ không quay được', 'đau cứng cổ', 'khó quay cổ'] },
      { word: 'đau hông', weight: 9, synonyms: ['nhức hông', 'hông đau', 'đau khớp hông', 'đau xương hông'] },
      { word: 'đau xương', weight: 9, synonyms: ['nhức xương', 'xương đau', 'đau nhức xương', 'xương bị đau'] },
      { word: 'sưng đau cơ', weight: 8, synonyms: ['cơ sưng', 'sưng cơ', 'viêm cơ', 'đau và sưng cơ'] },
      { word: 'mỏi vai gáy', weight: 8, synonyms: ['vai gáy mỏi', 'nhức vai gáy', 'mỏi cổ vai', 'vai gáy nặng'] },
      { word: 'thoái hóa khớp', weight: 10, synonyms: ['thoái hóa', 'thoai hoa', 'khớp thoái hóa', 'thoái hóa cột sống'] },
      { word: 'đau dây thần kinh tọa', weight: 10, synonyms: ['đau thần kinh tọa', 'tọa cốt thần kinh', 'đau từ lưng xuống chân'] },
      { word: 'khó cúi người', weight: 8, synonyms: ['không cúi được', 'cúi khó', 'đau khi cúi', 'cứng lưng'] },
      { word: 'khó đứng lâu', weight: 8, synonyms: ['không đứng lâu được', 'đau khi đứng lâu', 'mỏi khi đứng'] },
      { word: 'đau khi vận động', weight: 9, synonyms: ['đau khi cử động', 'đau khi hoạt động', 'đau khi di chuyển', 'vận động đau'] }
    ]
  },
  'tim_mach': {
    name: 'Tim mạch',
    keywords: [
      { word: 'đau ngực', weight: 10, synonyms: ['tức ngực', 'ngực đau', 'dau nguc', 'nhức ngực', 'đau vùng ngực'] },
      { word: 'tức ngực', weight: 10, synonyms: ['ngực tức', 'nghẹt ngực', 'ngực nghẹt', 'căng tức ngực'] },
      { word: 'khó thở', weight: 10, synonyms: ['thở khó', 'kho tho', 'thở gấp', 'hụt hơi', 'thở nhanh'] },
      { word: 'tim đập nhanh', weight: 9, synonyms: ['hồi hộp', 'tim nhanh', 'đánh trống ngực', 'tim đập mạnh', 'nhịp tim nhanh'] },
      { word: 'tim đập chậm', weight: 9, synonyms: ['tim chậm', 'nhịp tim chậm', 'tim đập yếu', 'tim đập ít'] },
      { word: 'hồi hộp', weight: 8, synonyms: ['tim đập nhanh', 'tim hồi hộp', 'hồi hộp tim', 'tim nhanh'] },
      { word: 'chóng mặt', weight: 8, synonyms: ['hoa mắt', 'choáng', 'choang', 'chong mat', 'hoa mat', 'váng đầu'] },
      { word: 'mệt mỏi', weight: 8, synonyms: ['mệt', 'mỏi', 'met moi', 'uể oải', 'kiệt sức'] },
      { word: 'đau tim', weight: 10, synonyms: ['nhức tim', 'tim đau', 'dau tim', 'đau vùng tim', 'đau tức vùng tim'] },
      { word: 'huyết áp cao', weight: 10, synonyms: ['huyết áp', 'cao huyết áp', 'huyet ap', 'huyệt áp cao', 'tăng huyết áp'] },
      { word: 'huyết áp thấp', weight: 9, synonyms: ['hạ huyết áp', 'huyết áp thấp', 'huyết áp giảm', 'huyết áp yếu'] },
      { word: 'đau ngực khi vận động', weight: 10, synonyms: ['đau ngực khi gắng sức', 'đau ngực khi hoạt động', 'đau khi vận động'] },
      { word: 'khó thở khi nằm', weight: 9, synonyms: ['thở khó khi nằm', 'khó thở ban đêm', 'thở khó khi ngủ'] },
      { word: 'phù chân', weight: 9, synonyms: ['sưng chân', 'chân sưng', 'phù bàn chân', 'chân phù'] },
      { word: 'đau vai trái', weight: 9, synonyms: ['vai trái đau', 'nhức vai trái', 'đau vai bên trái'] },
      { word: 'tê tay trái', weight: 9, synonyms: ['tay trái tê', 'tê bì tay trái', 'tê cánh tay trái'] },
      { word: 'ngất xỉu', weight: 10, synonyms: ['ngất', 'xỉu', 'bất tỉnh', 'mất ý thức', 'choáng váng'] },
      { word: 'tim đập không đều', weight: 9, synonyms: ['nhịp tim không đều', 'loạn nhịp tim', 'tim đập bất thường', 'rối loạn nhịp tim'] },
      { word: 'đau tức vùng tim', weight: 10, synonyms: ['tức vùng tim', 'đau vùng tim', 'tức ngực trái', 'đau tim'] },
      { word: 'thở gấp', weight: 9, synonyms: ['thở nhanh', 'thở hổn hển', 'thở dốc', 'thở mệt'] },
      { word: 'mệt khi leo cầu thang', weight: 9, synonyms: ['mệt khi lên cầu thang', 'khó thở khi leo thang', 'mệt khi vận động'] },
      { word: 'đau lan lên cổ', weight: 9, synonyms: ['đau cổ', 'đau lan ra cổ', 'đau từ ngực lên cổ', 'đau lan vai cổ'] },
      { word: 'đổ mồ hôi lạnh', weight: 9, synonyms: ['ra mồ hôi lạnh', 'toát mồ hôi lạnh', 'mồ hôi lạnh', 'đổ mồ hôi'] },
      { word: 'đau ngực kéo dài', weight: 10, synonyms: ['đau ngực dai dẳng', 'đau ngực lâu', 'đau ngực không ngớt'] },
      { word: 'cảm giác hụt hơi', weight: 9, synonyms: ['hụt hơi', 'thiếu hơi', 'khó thở', 'thở không đủ'] },
      { word: 'mệt tim', weight: 9, synonyms: ['suy tim', 'yếu tim', 'tim yếu', 'tim mệt', 'met tim'] },
      { word: 'đau vùng ngực trái', weight: 10, synonyms: ['đau ngực trái', 'ngực trái đau', 'đau bên trái ngực'] },
      { word: 'nhịp tim bất thường', weight: 9, synonyms: ['tim đập bất thường', 'loạn nhịp', 'rối loạn nhịp tim', 'tim không đều'] },
      { word: 'căng tức ngực', weight: 9, synonyms: ['ngực căng', 'tức ngực', 'ngực đau', 'căng vùng ngực'] },
      { word: 'khó thở về đêm', weight: 9, synonyms: ['khó thở ban đêm', 'thở khó đêm', 'khó thở khi ngủ', 'thở khó về đêm'] }
    ]
  },
  'tieu_hoa': {
    name: 'Tiêu hóa',
    keywords: [
      { word: 'đau bụng', weight: 10, synonyms: ['nhức bụng', 'bụng đau', 'dau bung', 'đau dạ dày', 'đau bao tử'] },
      { word: 'đầy hơi', weight: 9, synonyms: ['chướng bụng', 'đầy bụng', 'day hoi', 'bụng đầy', 'bụng phình'] },
      { word: 'khó tiêu', weight: 9, synonyms: ['kho tieu', 'khó tiêu hóa', 'ăn không tiêu', 'tiêu hóa kém'] },
      { word: 'buồn nôn', weight: 9, synonyms: ['nôn', 'ói', 'muốn nôn', 'buon non', 'cảm giác nôn'] },
      { word: 'nôn ói', weight: 9, synonyms: ['nôn', 'ói', 'nôn mửa', 'ói mửa', 'nôn ra'] },
      { word: 'tiêu chảy', weight: 10, synonyms: ['ỉa chảy', 'đi ngoài', 'tieu chay', 'tiêu lỏng', 'đi ngoài nhiều'] },
      { word: 'táo bón', weight: 9, synonyms: ['táo', 'tao bon', 'khó đi ngoài', 'bí đại tiện', 'táo lâu ngày'] },
      { word: 'đau dạ dày', weight: 10, synonyms: ['dạ dày đau', 'đau bao tử', 'nhức dạ dày', 'đau thượng vị'] },
      { word: 'ợ chua', weight: 8, synonyms: ['ợ', 'ợ hơi chua', 'o chua', 'ợ trào ngược'] },
      { word: 'ợ nóng', weight: 8, synonyms: ['ợ', 'trào ngược', 'o nong', 'ợ hơi nóng', 'nóng ngực'] },
      { word: 'chướng bụng', weight: 9, synonyms: ['đầy hơi', 'bụng chướng', 'bụng căng', 'bụng phình'] },
      { word: 'đi ngoài ra máu', weight: 10, synonyms: ['phân có máu', 'đại tiện ra máu', 'máu trong phân', 'đi cầu ra máu'] },
      { word: 'phân đen', weight: 10, synonyms: ['đại tiện đen', 'phân màu đen', 'phân sẫm', 'phân đen sì'] },
      { word: 'đau bụng dưới', weight: 9, synonyms: ['đau vùng chậu', 'dau bung duoi', 'đau hạ vị', 'đau bụng phía dưới'] },
      { word: 'viêm đại tràng', weight: 10, synonyms: ['đại tràng viêm', 'viêm ruột', 'viêm đại tràng cấp'] },
      { word: 'viêm dạ dày', weight: 10, synonyms: ['dạ dày viêm', 'viem da day', 'viêm bao tử', 'viêm loét dạ dày'] },
      { word: 'co thắt bụng', weight: 8, synonyms: ['co bụng', 'bụng co', 'co cứng bụng', 'cơn co bụng'] },
      { word: 'khó nuốt', weight: 8, synonyms: ['nuốt khó', 'khó nuốt nước', 'đau khi nuốt', 'nuốt vướng'] },
      { word: 'đau khi ăn', weight: 8, synonyms: ['ăn đau', 'đau khi ăn uống', 'ăn bị đau', 'đau sau khi ăn'] },
      { word: 'ăn không ngon', weight: 7, synonyms: ['chán ăn', 'biếng ăn', 'không thèm ăn', 'kém ăn'] },
      { word: 'sụt cân', weight: 8, synonyms: ['giảm cân', 'sut can', 'gầy', 'nhẹ cân', 'giảm cân nhanh'] },
      { word: 'mệt mỏi tiêu hóa', weight: 7, synonyms: ['mệt mỏi', 'mệt', 'mỏi', 'met moi', 'uể oải'] },
      { word: 'đau gan', weight: 9, synonyms: ['gan đau', 'nhức gan', 'đau vùng gan', 'đau hạ sườn phải'] },
      { word: 'vàng da', weight: 9, synonyms: ['da vàng', 'vàng mắt', 'vàng da mắt', 'da bị vàng'] },
      { word: 'đắng miệng', weight: 7, synonyms: ['miệng đắng', 'miệng bị đắng', 'vị đắng', 'cảm giác đắng'] },
      { word: 'đau quanh rốn', weight: 8, synonyms: ['đau rốn', 'rốn đau', 'đau vùng rốn', 'nhức quanh rốn'] },
      { word: 'đi ngoài nhiều lần', weight: 9, synonyms: ['tiêu chảy', 'đi ngoài liên tục', 'đi cầu nhiều', 'đại tiện nhiều'] },
      { word: 'táo bón kéo dài', weight: 9, synonyms: ['táo mãn tính', 'táo lâu ngày', 'táo dai dẳng', 'bí đại tiện lâu'] },
      { word: 'nóng rát dạ dày', weight: 9, synonyms: ['dạ dày nóng', 'rát dạ dày', 'nóng bao tử', 'rát bao tử'] },
      { word: 'trào ngược dạ dày', weight: 9, synonyms: ['trào ngược', 'ợ nóng', 'ợ chua', 'trào ngược thực quản'] }
    ]
  },
  'ho_hap': {
    name: 'Hô hấp',
    keywords: [
      { word: 'ho', weight: 10, synonyms: ['ho khan', 'ho có đờm', 'ho đờm', 'ho lâu ngày', 'ho nhiều'] },
      { word: 'ho khan', weight: 9, synonyms: ['ho khô', 'ho không đờm', 'ho khạc', 'ho liên tục'] },
      { word: 'ho có đờm', weight: 9, synonyms: ['ho đờm', 'ho bị đờm', 'ho ra đờm', 'ho có đàm'] },
      { word: 'khó thở', weight: 10, synonyms: ['thở khó', 'kho tho', 'thở gấp', 'hụt hơi', 'thở nhanh', 'khó hít thở'] },
      { word: 'đau họng', weight: 9, synonyms: ['họng đau', 'dau hong', 'viêm họng', 'sưng họng', 'nhức họng'] },
      { word: 'viêm họng', weight: 9, synonyms: ['họng viêm', 'viem hong', 'họng sưng', 'họng đỏ'] },
      { word: 'nghẹt mũi', weight: 8, synonyms: ['ngạt mũi', 'tắc mũi', 'nghet mui', 'mũi tắc', 'mũi bị nghẹt'] },
      { word: 'sổ mũi', weight: 8, synonyms: ['chảy nước mũi', 'so mui', 'mũi chảy', 'chảy mũi'] },
      { word: 'hắt hơi', weight: 7, synonyms: ['hắt xì', 'hắt hơi liên tục', 'hắt hơi nhiều', 'hắt xì hơi'] },
      { word: 'đau ngực khi thở', weight: 9, synonyms: ['ngực đau khi thở', 'đau ngực', 'thở đau ngực', 'đau khi hít thở'] },
      { word: 'thở khò khè', weight: 9, synonyms: ['khò khè', 'thở rít', 'thở có tiếng', 'thở khó'] },
      { word: 'tức ngực', weight: 9, synonyms: ['ngực tức', 'nghẹt ngực', 'ngực nghẹt', 'khó thở ngực'] },
      { word: 'viêm phế quản', weight: 10, synonyms: ['phế quản viêm', 'viêm phế quản cấp', 'viêm phế quản mãn'] },
      { word: 'viêm phổi', weight: 10, synonyms: ['viem phoi', 'phổi viêm', 'nhiễm trùng phổi', 'viêm phổi cấp'] },
      { word: 'hen suyễn', weight: 10, synonyms: ['hen', 'suyễn', 'hen suyen', 'hen phế quản', 'bệnh hen'] },
      { word: 'ho kéo dài', weight: 9, synonyms: ['ho mãn tính', 'ho lâu ngày', 'ho không khỏi', 'ho dai dẳng'] },
      { word: 'khàn tiếng', weight: 8, synonyms: ['tiếng khàn', 'khàn giọng', 'giọng khàn', 'nói khàn'] },
      { word: 'mất tiếng', weight: 9, synonyms: ['mất giọng', 'không nói được', 'câm tiếng', 'tiếng bị mất'] },
      { word: 'khó nuốt', weight: 8, synonyms: ['nuốt khó', 'khó nuốt nước', 'đau khi nuốt', 'nuốt vướng'] },
      { word: 'đau khi nuốt', weight: 8, synonyms: ['nuốt đau', 'đau nuốt', 'đau họng khi nuốt', 'nuốt bị đau'] },
      { word: 'thở gấp', weight: 9, synonyms: ['thở nhanh', 'thở hổn hển', 'thở dốc', 'thở mệt'] },
      { word: 'ho ra máu', weight: 10, synonyms: ['ho máu', 'khạc máu', 'ho có máu', 'đờm có máu'] },
      { word: 'đờm nhiều', weight: 8, synonyms: ['nhiều đờm', 'đàm nhiều', 'đờm đặc', 'đờm vàng', 'đờm xanh'] },
      { word: 'viêm xoang', weight: 9, synonyms: ['viem xoang', 'xoang viêm', 'đau xoang', 'viêm xoang mũi'] },
      { word: 'chảy nước mũi', weight: 8, synonyms: ['sổ mũi', 'mũi chảy nước', 'chảy mũi', 'nước mũi chảy'] },
      { word: 'viêm amidan', weight: 9, synonyms: ['viem amidan', 'amidan sưng', 'sưng amidan', 'amidan viêm'] },
      { word: 'cảm lạnh', weight: 8, synonyms: ['cảm', 'cúm', 'cam cum', 'cảm cúm', 'bị cảm'] },
      { word: 'sốt kèm ho', weight: 9, synonyms: ['sốt và ho', 'ho và sốt', 'sốt ho', 'ho có sốt'] },
      { word: 'mệt khi hít thở', weight: 8, synonyms: ['mệt khi thở', 'thở mệt', 'hít thở mệt', 'khó thở mệt'] },
      { word: 'dị ứng hô hấp', weight: 9, synonyms: ['dị ứng đường hô hấp', 'dị ứng phổi', 'dị ứng mũi họng', 'viêm mũi dị ứng'] }
    ]
  },
    'da_lieu': {
      name: 'Da liễu',
      keywords: [
        { word: 'nổi mẩn đỏ', weight: 10, synonyms: ['mẩn đỏ', 'nổi mẩn', 'man do', 'phát ban', 'nổi đỏ', 'da đỏ'] },
        { word: 'ngứa da', weight: 10, synonyms: ['ngứa', 'ngứa ngáy', 'ngua', 'da ngứa', 'ngứa khắp người'] },
        { word: 'mụn trứng cá', weight: 9, synonyms: ['mụn', 'nổi mụn', 'noi mun', 'mụn cá', 'mụn bọc', 'mụn đầu đen'] },
        { word: 'dị ứng da', weight: 10, synonyms: ['dị ứng', 'di ung', 'da dị ứng', 'kích ứng da', 'phản ứng da'] },
        { word: 'phát ban', weight: 9, synonyms: ['nổi ban', 'ban đỏ', 'da nổi ban', 'xuất hiện ban'] },
        { word: 'da khô', weight: 8, synonyms: ['khô da', 'da khô ráp', 'da thiếu ẩm', 'da bị khô'] },
        { word: 'da bong tróc', weight: 8, synonyms: ['bong tróc', 'da bong', 'da tróc', 'da lột', 'da bị lột'] },
        { word: 'nổi mề đay', weight: 9, synonyms: ['mề đay', 'me day', 'nổi mề', 'phát mề đay'] },
        { word: 'viêm da', weight: 9, synonyms: ['viem da', 'da viêm', 'sưng da', 'da bị viêm'] },
        { word: 'nấm da', weight: 9, synonyms: ['nấm', 'nam da', 'nhiễm nấm', 'nấm ngoài da', 'nấm da đầu'] },
        { word: 'lang ben', weight: 9, synonyms: ['lang beng', 'ghẻ lở', 'ghẻ ngứa', 'bệnh ghẻ'] },
        { word: 'chàm da', weight: 9, synonyms: ['chàm', 'cham', 'eczema', 'viêm da chàm'] },
        { word: 'da nổi đốm', weight: 8, synonyms: ['nổi đốm', 'đốm da', 'da có đốm', 'đốm trắng', 'đốm đỏ'] },
        { word: 'da bị kích ứng', weight: 8, synonyms: ['kích ứng da', 'da kích ứng', 'da nhạy cảm', 'da bị tổn thương'] },
        { word: 'mụn nước', weight: 8, synonyms: ['nổi mụn nước', 'bọng nước', 'mụn bóng nước', 'phỏng nước'] },
        { word: 'da sưng đỏ', weight: 9, synonyms: ['sưng đỏ', 'da sưng', 'da đỏ sưng', 'viêm sưng da'] },
        { word: 'ngứa da đầu', weight: 8, synonyms: ['da đầu ngứa', 'ngứa đầu', 'ngứa vùng đầu', 'đầu ngứa'] },
        { word: 'rụng tóc', weight: 8, synonyms: ['tóc rụng', 'rung toc', 'hói', 'tóc gãy rụng', 'rụng tóc nhiều'] },
        { word: 'gàu nhiều', weight: 7, synonyms: ['gàu', 'gàu đầu', 'da đầu bị gàu', 'nhiều gàu'] },
        { word: 'da nhờn', weight: 7, synonyms: ['da dầu', 'da tiết dầu', 'da bóng nhờn', 'da nhiều dầu'] },
        { word: 'da bị thâm', weight: 7, synonyms: ['da thâm', 'thâm da', 'vết thâm', 'da sạm', 'da đen'] },
        { word: 'viêm nang lông', weight: 8, synonyms: ['nang lông viêm', 'viêm lỗ chân lông', 'mụn viêm nang lông'] },
        { word: 'nứt da', weight: 8, synonyms: ['da nứt', 'da bị nứt', 'nứt nẻ', 'da nứt nẻ', 'da rạn nứt'] },
        { word: 'da bị cháy nắng', weight: 8, synonyms: ['cháy nắng', 'da cháy', 'bỏng nắng', 'da bị bỏng nắng'] },
        { word: 'mụn viêm', weight: 9, synonyms: ['mụn sưng', 'mụn đỏ', 'mụn bọc viêm', 'mụn có mủ'] },
        { word: 'da nổi hạt', weight: 8, synonyms: ['nổi hạt', 'hạt da', 'da sần sùi', 'da nhám'] },
        { word: 'da đổi màu', weight: 8, synonyms: ['đổi màu da', 'da thay đổi màu', 'da sạm màu', 'da bạc màu'] },
        { word: 'ngứa toàn thân', weight: 9, synonyms: ['ngứa khắp người', 'ngứa cả người', 'toàn thân ngứa', 'ngứa nhiều chỗ'] },
        { word: 'viêm da cơ địa', weight: 9, synonyms: ['viêm da dị ứng', 'da cơ địa', 'atopic dermatitis', 'viêm da mãn tính'] },
        { word: 'da bị sẹo', weight: 7, synonyms: ['sẹo da', 'vết sẹo', 'da có sẹo', 'sẹo lồi', 'sẹo lõm'] }
      ]
    },
    'tai_mui_hong': {
      name: 'Tai mũi họng',
      keywords: [
        { word: 'đau họng', weight: 10, synonyms: ['họng đau', 'dau hong', 'viêm họng', 'sưng họng', 'nhức họng'] },
        { word: 'viêm họng', weight: 10, synonyms: ['họng viêm', 'viem hong', 'họng sưng', 'họng đỏ', 'họng bị viêm'] },
        { word: 'ho', weight: 9, synonyms: ['ho khan', 'ho có đờm', 'ho đờm', 'ho lâu ngày', 'ho nhiều'] },
        { word: 'khàn tiếng', weight: 9, synonyms: ['tiếng khàn', 'khàn giọng', 'giọng khàn', 'nói khàn', 'giọng bị khàn'] },
        { word: 'mất tiếng', weight: 9, synonyms: ['mất giọng', 'không nói được', 'câm tiếng', 'tiếng bị mất', 'không ra tiếng'] },
        { word: 'nghẹt mũi', weight: 9, synonyms: ['ngạt mũi', 'tắc mũi', 'nghet mui', 'mũi tắc', 'mũi bị nghẹt'] },
        { word: 'sổ mũi', weight: 9, synonyms: ['chảy nước mũi', 'so mui', 'mũi chảy', 'chảy mũi', 'mũi sổ'] },
        { word: 'chảy nước mũi', weight: 8, synonyms: ['sổ mũi', 'mũi chảy nước', 'chảy mũi', 'nước mũi chảy'] },
        { word: 'hắt hơi', weight: 7, synonyms: ['hắt xì', 'hắt hơi liên tục', 'hắt hơi nhiều', 'hắt xì hơi'] },
        { word: 'đau tai', weight: 10, synonyms: ['tai đau', 'dau tai', 'nhức tai', 'tai nhức', 'tai bị đau'] },
        { word: 'ù tai', weight: 9, synonyms: ['u tai', 'tai ù', 'nghe kém', 'tai bị ù', 'ù ù tai'] },
        { word: 'nghe kém', weight: 9, synonyms: ['điếc', 'nghe không rõ', 'giảm thính lực', 'tai kém', 'nghe yếu'] },
        { word: 'viêm tai giữa', weight: 10, synonyms: ['viêm tai', 'tai viêm', 'viem tai', 'viêm tai trong', 'tai giữa viêm'] },
        { word: 'chảy mủ tai', weight: 9, synonyms: ['tai chảy mủ', 'mủ tai', 'tai ra mủ', 'chảy dịch tai'] },
        { word: 'viêm xoang', weight: 10, synonyms: ['viem xoang', 'xoang viêm', 'đau xoang', 'viêm xoang mũi', 'viêm xoang mạn'] },
        { word: 'đau vùng xoang', weight: 9, synonyms: ['đau xoang', 'xoang đau', 'nhức xoang', 'đau vùng mũi'] },
        { word: 'khó nuốt', weight: 9, synonyms: ['nuốt khó', 'khó nuốt nước', 'đau khi nuốt', 'nuốt vướng'] },
        { word: 'đau khi nuốt', weight: 9, synonyms: ['nuốt đau', 'đau nuốt', 'đau họng khi nuốt', 'nuốt bị đau'] },
        { word: 'hôi miệng', weight: 7, synonyms: ['hơi thở hôi', 'hoi mieng', 'miệng hôi', 'thở hôi'] },
        { word: 'viêm amidan', weight: 10, synonyms: ['viem amidan', 'amidan sưng', 'sưng amidan', 'amidan viêm', 'viêm amiđan'] },
        { word: 'sưng amidan', weight: 9, synonyms: ['amidan sưng', 'amidan to', 'amidan bị sưng', 'sưng họng'] },
        { word: 'khó thở bằng mũi', weight: 8, synonyms: ['thở mũi khó', 'không thở được mũi', 'nghẹt mũi', 'tắc mũi'] },
        { word: 'ngứa họng', weight: 7, synonyms: ['họng ngứa', 'ngứa cổ họng', 'ngứa trong họng', 'họng bị ngứa'] },
        { word: 'đau đầu do xoang', weight: 9, synonyms: ['đau đầu xoang', 'nhức đầu do xoang', 'đau đầu viêm xoang'] },
        { word: 'chảy máu cam', weight: 9, synonyms: ['máu cam', 'chay mau mui', 'mũi chảy máu', 'chảy máu mũi'] },
        { word: 'khạc đờm', weight: 8, synonyms: ['ho đờm', 'đờm', 'khạc ra đờm', 'có đờm'] },
        { word: 'dị ứng mũi', weight: 8, synonyms: ['viêm mũi dị ứng', 'dị ứng', 'mũi dị ứng', 'viêm mũi'] },
        { word: 'thở khò khè', weight: 8, synonyms: ['khò khè', 'thở rít', 'thở có tiếng', 'thở khó'] },
        { word: 'cảm lạnh', weight: 8, synonyms: ['cảm', 'cúm', 'cam cum', 'cảm cúm', 'bị cảm'] },
        { word: 'sốt kèm đau họng', weight: 9, synonyms: ['sốt và đau họng', 'đau họng có sốt', 'sốt họng', 'sốt viêm họng'] }
      ]
    },
    'mat': {
      name: 'Mắt',
      keywords: [
        { word: 'đau mắt', weight: 10, synonyms: ['mắt đau', 'dau mat', 'nhức mắt', 'mắt nhức'] },
        { word: 'mắt đỏ', weight: 9, synonyms: ['đỏ mắt', 'do mat', 'mắt đỏ ngầu', 'mắt bị đỏ'] },
        { word: 'mờ mắt', weight: 10, synonyms: ['mắt mờ', 'mo mat', 'nhìn mờ', 'nhìn không rõ', 'thị lực mờ'] },
        { word: 'khô mắt', weight: 9, synonyms: ['mắt khô', 'kho mat', 'mắt khô khan', 'mắt bị khô'] },
        { word: 'ngứa mắt', weight: 8, synonyms: ['mắt ngứa', 'ngua mat', 'mắt bị ngứa', 'ngứa vùng mắt'] },
        { word: 'chảy nước mắt', weight: 8, synonyms: ['mắt chảy nước', 'chay nuoc mat', 'nước mắt chảy', 'mắt ra nước'] },
        { word: 'nhìn đôi', weight: 9, synonyms: ['nhìn hai', 'thấy đôi', 'nhìn bóng đôi', 'song thị'] },
        { word: 'sưng mắt', weight: 8, synonyms: ['mắt sưng', 'phù mắt', 'mắt bị sưng', 'sưng quanh mắt'] },
        { word: 'cộm mắt', weight: 8, synonyms: ['lẹo mắt', 'mắt cộm', 'mắt bị lẹo', 'viêm bờ mi'] },
        { word: 'nhạy cảm ánh sáng', weight: 8, synonyms: ['sợ ánh sáng', 'chói mắt', 'mắt nhạy sáng', 'quang sợ'] },
        { word: 'mỏi mắt', weight: 8, synonyms: ['mắt mỏi', 'mệt mắt', 'mắt mệt mỏi', 'mắt bị mỏi'] },
        { word: 'giảm thị lực', weight: 10, synonyms: ['thị lực giảm', 'mắt kém', 'nhìn kém', 'thị lực yếu'] },
        { word: 'nhìn không rõ', weight: 9, synonyms: ['nhìn mờ', 'thấy không rõ', 'mờ mắt', 'nhìn không sắc'] },
        { word: 'đau khi nhìn', weight: 8, synonyms: ['nhìn đau', 'mắt đau khi nhìn', 'đau khi mở mắt'] },
        { word: 'mắt có ghèn', weight: 8, synonyms: ['ghèn mắt', 'mắt ghèn', 'mắt ra ghèn', 'chảy ghèn'] },
        { word: 'viêm kết mạc', weight: 9, synonyms: ['đau mắt đỏ', 'viêm màng kết', 'kết mạc viêm', 'mắt hột'] },
        { word: 'viêm bờ mi', weight: 8, synonyms: ['bờ mi viêm', 'mi mắt viêm', 'viêm mi', 'cộm mắt'] },
        { word: 'mắt bị kích ứng', weight: 8, synonyms: ['kích ứng mắt', 'mắt kích ứng', 'mắt nhạy cảm', 'dị ứng mắt'] },
        { word: 'chớp mắt nhiều', weight: 7, synonyms: ['nháy mắt nhiều', 'chớp mắt liên tục', 'mắt chớp', 'giật mí'] },
        { word: 'nhìn thấy đốm đen', weight: 9, synonyms: ['đốm đen', 'ruồi bay', 'thấy bóng đen', 'thấy đốm'] },
        { word: 'mắt bị khô rát', weight: 8, synonyms: ['khô rát mắt', 'mắt khô và rát', 'rát mắt', 'cay rát mắt'] },
        { word: 'chảy ghèn mắt', weight: 8, synonyms: ['ghèn chảy', 'mắt chảy ghèn', 'ra ghèn', 'mủ mắt'] },
        { word: 'mắt bị sưng đỏ', weight: 9, synonyms: ['sưng đỏ mắt', 'mắt sưng và đỏ', 'viêm sưng mắt'] },
        { word: 'mắt mệt mỏi', weight: 8, synonyms: ['mỏi mắt', 'mắt mỏi', 'mệt mắt', 'mắt bị mệt'] },
        { word: 'nhìn xa không rõ', weight: 9, synonyms: ['cận thị', 'cận', 'can thi', 'nhìn gần', 'mắt cận'] },
        { word: 'nhìn gần không rõ', weight: 9, synonyms: ['viễn thị', 'viễn', 'vien thi', 'nhìn xa', 'mắt viễn'] },
        { word: 'đau hốc mắt', weight: 8, synonyms: ['hốc mắt đau', 'đau quanh mắt', 'nhức hốc mắt'] },
        { word: 'cay mắt', weight: 7, synonyms: ['mắt cay', 'mắt bị cay', 'rát mắt', 'cay rát'] },
        { word: 'mắt bị lóa', weight: 7, synonyms: ['lóa mắt', 'chói mắt', 'mắt chói', 'bị chói'] },
        { word: 'co giật mí mắt', weight: 8, synonyms: ['giật mí', 'mí mắt giật', 'co giật mi', 'nháy mắt không tự chủ'] }
      ]
    },
    'nhi_khoa': {
      name: 'Nhi khoa',
      keywords: [
        { word: 'sốt', weight: 10, synonyms: ['sốt cao', 'nóng', 'sot', 'trẻ sốt', 'bé sốt', 'con sốt'] },
        { word: 'ho', weight: 9, synonyms: ['ho khan', 'ho có đờm', 'ho đờm', 'trẻ ho', 'bé ho', 'ho nhiều'] },
        { word: 'sổ mũi', weight: 8, synonyms: ['chảy nước mũi', 'so mui', 'mũi chảy', 'trẻ sổ mũi'] },
        { word: 'nghẹt mũi', weight: 8, synonyms: ['ngạt mũi', 'tắc mũi', 'nghet mui', 'mũi tắc', 'mũi bị nghẹt'] },
        { word: 'đau họng', weight: 8, synonyms: ['họng đau', 'dau hong', 'viêm họng', 'trẻ đau họng'] },
        { word: 'khó thở', weight: 9, synonyms: ['thở khó', 'kho tho', 'thở gấp', 'hụt hơi', 'thở nhanh'] },
        { word: 'biếng ăn', weight: 9, synonyms: ['không ăn', 'bieng an', 'kém ăn', 'chán ăn', 'không chịu ăn'] },
        { word: 'quấy khóc', weight: 8, synonyms: ['khóc nhiều', 'quay khoc', 'bé khóc', 'trẻ khóc', 'khóc quấy'] },
        { word: 'tiêu chảy', weight: 10, synonyms: ['ỉa chảy', 'đi ngoài nhiều', 'tieu chay', 'tiêu lỏng', 'bé tiêu chảy'] },
        { word: 'nôn ói', weight: 9, synonyms: ['nôn', 'ói', 'nôn mửa', 'trẻ nôn', 'bé nôn'] },
        { word: 'đau bụng', weight: 9, synonyms: ['nhức bụng', 'bụng đau', 'dau bung', 'trẻ đau bụng'] },
        { word: 'phát ban', weight: 8, synonyms: ['nổi ban', 'ban đỏ', 'da nổi ban', 'nổi mẩn'] },
        { word: 'dị ứng', weight: 8, synonyms: ['di ung', 'dị ứng da', 'dị ứng thức ăn', 'phản ứng dị ứng'] },
        { word: 'mệt mỏi', weight: 7, synonyms: ['mệt', 'mỏi', 'met moi', 'uể oải', 'trẻ mệt'] },
        { word: 'khò khè', weight: 9, synonyms: ['thở khò khè', 'thở rít', 'thở có tiếng', 'khò khè khi thở'] },
        { word: 'táo bón', weight: 8, synonyms: ['táo', 'tao bon', 'khó đi ngoài', 'trẻ táo bón', 'bí đại tiện'] },
        { word: 'sụt cân', weight: 8, synonyms: ['giảm cân', 'sut can', 'gầy', 'trẻ gầy', 'nhẹ cân'] },
        { word: 'chậm tăng cân', weight: 8, synonyms: ['không tăng cân', 'cân không tăng', 'chậm lớn', 'suy dinh dưỡng'] },
        { word: 'mất ngủ', weight: 7, synonyms: ['khó ngủ', 'không ngủ được', 'mat ngu', 'trẻ mất ngủ', 'ngủ không ngon'] },
        { word: 'co giật', weight: 10, synonyms: ['giật mình', 'co cứng', 'co thắt', 'giật cơ', 'co giật toàn thân'] },
        { word: 'da nổi mẩn', weight: 8, synonyms: ['nổi mẩn', 'mẩn đỏ', 'da đỏ', 'phát ban'] },
        { word: 'viêm họng', weight: 8, synonyms: ['họng viêm', 'viem hong', 'họng sưng', 'họng đỏ'] },
        { word: 'viêm tai', weight: 9, synonyms: ['đau tai', 'tai viêm', 'viem tai', 'tai đau', 'viêm tai giữa'] },
        { word: 'sốt cao', weight: 10, synonyms: ['sốt', 'nóng cao', 'sot cao', 'sốt trên 38 độ', 'sốt trên 39 độ'] },
        { word: 'chảy nước mũi', weight: 8, synonyms: ['sổ mũi', 'mũi chảy nước', 'chảy mũi', 'nước mũi chảy'] },
        { word: 'đổ mồ hôi nhiều', weight: 7, synonyms: ['ra mồ hôi', 'toát mồ hôi', 'đổ mồ hôi', 'trẻ đổ mồ hôi'] },
        { word: 'bé bỏ bú', weight: 9, synonyms: ['không bú', 'bỏ bú', 'không chịu bú', 'từ chối bú', 'ngừng bú'] },
        { word: 'khóc đêm', weight: 8, synonyms: ['khóc ban đêm', 'khóc về đêm', 'trẻ khóc đêm', 'bé khóc đêm'] },
        { word: 'mọc răng sốt', weight: 8, synonyms: ['sốt mọc răng', 'mọc răng', 'trẻ mọc răng', 'sốt khi mọc răng'] },
        { word: 'viêm phế quản', weight: 9, synonyms: ['phế quản viêm', 'viêm phế quản cấp', 'viêm phế quản trẻ em'] }
      ]
    },
    'noi_tiet': {
      name: 'Nội tiết',
      keywords: [
        { word: 'tiểu nhiều', weight: 10, synonyms: ['đi tiểu nhiều', 'tiểu đường', 'tieu nhieu', 'đái nhiều', 'tiểu liên tục'] },
        { word: 'khát nước nhiều', weight: 10, synonyms: ['khát nước', 'uống nước nhiều', 'khát liên tục', 'luôn khát'] },
        { word: 'sụt cân bất thường', weight: 9, synonyms: ['giảm cân nhanh', 'sut can', 'gầy nhanh', 'giảm cân không rõ nguyên nhân'] },
        { word: 'tăng cân nhanh', weight: 9, synonyms: ['béo nhanh', 'tăng cân', 'béo phì', 'thừa cân', 'tăng cân không kiểm soát'] },
        { word: 'mệt mỏi kéo dài', weight: 9, synonyms: ['mệt mỏi', 'mệt', 'mỏi', 'met moi', 'uể oải', 'kiệt sức'] },
        { word: 'đường huyết cao', weight: 10, synonyms: ['tiểu đường', 'đái tháo đường', 'tieu duong', 'đường máu cao', 'glucose cao'] },
        { word: 'run tay', weight: 8, synonyms: ['run chân', 'run rẩy', 'rung', 'run liên tục', 'tay run'] },
        { word: 'đổ mồ hôi nhiều', weight: 8, synonyms: ['ra mồ hôi', 'toát mồ hôi', 'đổ mồ hôi', 'tiết mồ hôi nhiều'] },
        { word: 'tim đập nhanh', weight: 8, synonyms: ['hồi hộp', 'tim nhanh', 'đánh trống ngực', 'tim đập mạnh'] },
        { word: 'rụng tóc', weight: 8, synonyms: ['tóc rụng', 'rung toc', 'hói', 'tóc gãy rụng', 'rụng tóc nhiều'] },
        { word: 'da khô', weight: 7, synonyms: ['khô da', 'da khô ráp', 'da thiếu ẩm', 'da bị khô'] },
        { word: 'khó ngủ', weight: 7, synonyms: ['mất ngủ', 'không ngủ được', 'mat ngu', 'kho ngu', 'thức đêm'] },
        { word: 'mất ngủ', weight: 7, synonyms: ['khó ngủ', 'không ngủ được', 'mat ngu', 'thức đêm', 'mất giấc'] },
        { word: 'ăn nhiều', weight: 8, synonyms: ['ăn nhiều mà gầy', 'ăn không no', 'thèm ăn nhiều', 'ăn liên tục'] },
        { word: 'chán ăn', weight: 7, synonyms: ['biếng ăn', 'không ăn', 'kém ăn', 'không thèm ăn'] },
        { word: 'mờ mắt', weight: 8, synonyms: ['mắt mờ', 'mo mat', 'nhìn mờ', 'nhìn không rõ', 'thị lực mờ'] },
        { word: 'tê tay chân', weight: 8, synonyms: ['tê bì', 'tê tay', 'tê chân', 'tê liệt', 'tê mỏi'] },
        { word: 'yếu cơ', weight: 8, synonyms: ['yếu tay chân', 'cơ yếu', 'mất sức', 'không có sức', 'teo cơ'] },
        { word: 'hạ đường huyết', weight: 9, synonyms: ['đường huyết thấp', 'glucose thấp', 'đường máu thấp', 'hạ đường máu'] },
        { word: 'huyết áp cao', weight: 8, synonyms: ['huyết áp', 'cao huyết áp', 'huyet ap', 'huyệt áp cao', 'tăng huyết áp'] },
        { word: 'mệt sau ăn', weight: 7, synonyms: ['buồn ngủ sau ăn', 'mệt khi ăn xong', 'uể oải sau ăn'] },
        { word: 'vết thương lâu lành', weight: 9, synonyms: ['vết thương khó lành', 'vết thương không lành', 'lâu liền sẹo'] },
        { word: 'đi tiểu ban đêm nhiều', weight: 9, synonyms: ['tiểu đêm', 'đi tiểu đêm', 'tiểu ban đêm', 'thức đêm đi tiểu'] },
        { word: 'khô miệng', weight: 7, synonyms: ['miệng khô', 'khát nước', 'miệng bị khô', 'khô họng'] },
        { word: 'da sạm màu', weight: 7, synonyms: ['da đen', 'da sạm', 'da thâm', 'da đổi màu'] },
        { word: 'căng thẳng nội tiết', weight: 7, synonyms: ['căng thẳng', 'stress', 'lo âu', 'bồn chồn'] },
        { word: 'rối loạn kinh nguyệt', weight: 9, synonyms: ['kinh nguyệt', 'roi loan kinh', 'mất kinh', 'kinh không đều'] },
        { word: 'tăng tiết mồ hôi', weight: 7, synonyms: ['đổ mồ hôi nhiều', 'ra mồ hôi nhiều', 'tiết mồ hôi'] },
        { word: 'lạnh tay chân', weight: 7, synonyms: ['tay chân lạnh', 'tay lạnh', 'chân lạnh', 'tứ chi lạnh'] },
        { word: 'rối loạn hormone', weight: 9, synonyms: ['mất cân bằng hormone', 'hormone không ổn định', 'rối loạn nội tiết tố'] }
      ]
    },
    'rang_ham_mat': {
      name: 'Răng hàm mặt',
      keywords: [
        { word: 'đau răng', weight: 10, synonyms: ['nhức răng', 'dau rang', 'răng đau', 'răng nhức'] },
        { word: 'sâu răng', weight: 10, synonyms: ['răng sâu', 'sau rang', 'răng bị sâu', 'răng bị mục', 'răng thủng'] },
        { word: 'chảy máu chân răng', weight: 9, synonyms: ['chảy máu nướu', 'chay mau rang', 'nướu chảy máu', 'lợi chảy máu'] },
        { word: 'sưng nướu', weight: 9, synonyms: ['nướu sưng', 'lợi sưng', 'sưng lợi', 'nướu bị sưng'] },
        { word: 'hôi miệng', weight: 8, synonyms: ['hơi thở hôi', 'hoi mieng', 'miệng hôi', 'thở hôi'] },
        { word: 'ê buốt răng', weight: 9, synonyms: ['răng ê buốt', 'răng nhạy cảm', 'buốt răng', 'răng buốt'] },
        { word: 'viêm nướu', weight: 9, synonyms: ['nướu viêm', 'viem nuou', 'viêm lợi', 'lợi viêm'] },
        { word: 'viêm nha chu', weight: 9, synonyms: ['nha chu', 'viêm quanh răng', 'bệnh nha chu', 'viêm quanh nướu'] },
        { word: 'đau hàm', weight: 8, synonyms: ['hàm đau', 'nhức hàm', 'đau xương hàm', 'hàm bị đau'] },
        { word: 'mọc răng khôn', weight: 9, synonyms: ['răng khôn', 'rang khon', 'răng số 8', 'răng khôn mọc', 'răng khôn đau'] },
        { word: 'lệch khớp cắn', weight: 8, synonyms: ['khớp cắn lệch', 'cắn lệch', 'răng lệch', 'khớp cắn sai'] },
        { word: 'răng lung lay', weight: 9, synonyms: ['lung lay răng', 'răng lay', 'răng lung', 'răng yếu'] },
        { word: 'khó nhai', weight: 8, synonyms: ['nhai khó', 'không nhai được', 'đau khi nhai', 'nhai đau'] },
        { word: 'đau khi ăn uống', weight: 8, synonyms: ['ăn đau', 'uống đau', 'đau khi ăn', 'đau khi uống'] },
        { word: 'viêm tủy răng', weight: 10, synonyms: ['tủy răng viêm', 'viêm tủy', 'đau tủy răng', 'tủy bị viêm'] },
        { word: 'mẻ răng', weight: 8, synonyms: ['răng mẻ', 'răng gãy', 'răng bị mẻ', 'răng vỡ'] },
        { word: 'răng bị vàng', weight: 7, synonyms: ['răng vàng', 'răng ố vàng', 'răng xỉn màu', 'răng đổi màu'] },
        { word: 'áp xe răng', weight: 10, synonyms: ['áp xe', 'mủ răng', 'viêm mủ răng', 'răng có mủ'] },
        { word: 'sưng mặt do răng', weight: 9, synonyms: ['sưng má', 'mặt sưng', 'má sưng', 'sưng mặt'] },
        { word: 'nhiệt miệng', weight: 8, synonyms: ['nóng miệng', 'lở miệng', 'nhiệt trong miệng', 'miệng nóng'] },
        { word: 'loét miệng', weight: 8, synonyms: ['lở miệng', 'miệng loét', 'loét lưỡi', 'lở lưỡi'] },
        { word: 'khô miệng', weight: 7, synonyms: ['miệng khô', 'khát nước', 'miệng bị khô', 'thiếu nước bọt'] },
        { word: 'đau lợi', weight: 8, synonyms: ['lợi đau', 'đau nướu', 'nướu đau', 'nhức lợi'] },
        { word: 'khó há miệng', weight: 8, synonyms: ['há miệng khó', 'không há miệng được', 'miệng khó mở', 'cứng hàm'] },
        { word: 'đau khớp hàm', weight: 9, synonyms: ['khớp hàm đau', 'đau khớp thái dương hàm', 'TMJ', 'khớp hàm bị đau'] },
        { word: 'viêm miệng', weight: 8, synonyms: ['miệng viêm', 'viêm niêm mạc miệng', 'viêm lưỡi', 'viêm trong miệng'] },
        { word: 'mất răng', weight: 9, synonyms: ['rụng răng', 'răng rụng', 'răng bị mất', 'thiếu răng'] },
        { word: 'răng nhạy cảm', weight: 8, synonyms: ['răng ê buốt', 'răng nhạy', 'răng yếu', 'răng dễ buốt'] },
        { word: 'đau quai hàm', weight: 8, synonyms: ['quai hàm đau', 'đau vùng hàm', 'nhức quai hàm', 'đau má'] },
        { word: 'cắn đau', weight: 8, synonyms: ['đau khi cắn', 'cắn bị đau', 'đau khi nhai', 'cắn không được'] }
      ]
    },
    'san_phu_khoa': {
      name: 'Sản phụ khoa',
      keywords: [
        { word: 'đau bụng dưới', weight: 10, synonyms: ['đau vùng chậu', 'dau bung duoi', 'đau bụng kinh', 'đau hạ vị'] },
        { word: 'rối loạn kinh nguyệt', weight: 9, synonyms: ['kinh nguyệt', 'roi loan kinh', 'mất kinh', 'kinh không đều'] },
        { word: 'trễ kinh', weight: 9, synonyms: ['chậm kinh', 'kinh trễ', 'kinh muộn', 'kinh không đến'] },
        { word: 'đau bụng kinh', weight: 9, synonyms: ['đau kinh', 'đau bụng khi hành kinh', 'đau khi có kinh', 'đau bụng đến tháng'] },
        { word: 'rong kinh', weight: 8, synonyms: ['kinh nhiều', 'ra máu nhiều', 'kinh kéo dài', 'kinh ra nhiều'] },
        { word: 'khí hư bất thường', weight: 9, synonyms: ['khí hư', 'dịch âm đạo', 'ra khí hư', 'khí hư nhiều'] },
        { word: 'ngứa vùng kín', weight: 9, synonyms: ['ngứa âm đạo', 'ngứa phụ khoa', 'ngứa vùng nhạy cảm', 'ngứa bên trong'] },
        { word: 'đau vùng chậu', weight: 9, synonyms: ['đau chậu', 'đau vùng bụng dưới', 'đau hạ vị', 'đau vùng tử cung'] },
        { word: 'ra máu bất thường', weight: 10, synonyms: ['chảy máu âm đạo', 'ra máu ngoài kinh', 'xuất huyết âm đạo', 'chảy máu bất thường'] },
        { word: 'tiểu buốt', weight: 8, synonyms: ['đi tiểu buốt', 'tiểu đau', 'buốt khi tiểu', 'đau khi đi tiểu'] },
        { word: 'tiểu rắt', weight: 8, synonyms: ['đi tiểu rắt', 'tiểu gắt', 'rát khi tiểu', 'tiểu khó'] },
        { word: 'đau khi quan hệ', weight: 9, synonyms: ['quan hệ đau', 'đau khi giao hợp', 'giao hợp đau', 'đau khi ân ái'] },
        { word: 'buồn nôn khi mang thai', weight: 9, synonyms: ['nôn nghén', 'nghén', 'buồn nôn', 'nôn khi mang thai'] },
        { word: 'mệt mỏi khi mang thai', weight: 8, synonyms: ['mệt khi mang thai', 'mệt mỏi thai kỳ', 'mệt khi có thai'] },
        { word: 'thai máy bất thường', weight: 9, synonyms: ['thai máy', 'thai động', 'thai không ổn định', 'thai yếu'] },
        { word: 'đau lưng khi mang thai', weight: 8, synonyms: ['đau lưng thai kỳ', 'nhức lưng khi mang thai', 'lưng đau khi có thai'] },
        { word: 'căng tức ngực', weight: 8, synonyms: ['ngực căng', 'tức ngực', 'ngực đau', 'căng vú'] },
        { word: 'khó thụ thai', weight: 9, synonyms: ['vô sinh', 'hiếm muộn', 'vo sinh', 'khó có con', 'không có thai'] },
        { word: 'viêm phụ khoa', weight: 10, synonyms: ['viêm âm đạo', 'viem phu khoa', 'viêm vùng kín', 'nhiễm trùng phụ khoa'] },
        { word: 'viêm âm đạo', weight: 9, synonyms: ['âm đạo viêm', 'viêm vùng kín', 'viêm phụ khoa', 'nhiễm trùng âm đạo'] },
        { word: 'nấm âm đạo', weight: 9, synonyms: ['nấm phụ khoa', 'nhiễm nấm', 'nấm vùng kín', 'nấm candida'] },
        { word: 'ra khí hư có mùi', weight: 9, synonyms: ['khí hư hôi', 'dịch có mùi', 'khí hư tanh', 'dịch âm đạo có mùi'] },
        { word: 'chậm kinh', weight: 9, synonyms: ['trễ kinh', 'kinh chậm', 'kinh muộn', 'kinh không đến'] },
        { word: 'đau tử cung', weight: 9, synonyms: ['tử cung đau', 'đau vùng tử cung', 'co thắt tử cung', 'tử cung co'] },
        { word: 'sảy thai dấu hiệu', weight: 10, synonyms: ['sảy thai', 'say thai', 'mất thai', 'thai lưu', 'dấu hiệu sảy thai'] },
        { word: 'phù chân khi mang thai', weight: 8, synonyms: ['sưng chân', 'phù chân thai kỳ', 'chân sưng khi mang thai'] },
        { word: 'co thắt bụng', weight: 9, synonyms: ['co bụng', 'bụng co', 'co tử cung', 'cơn co'] },
        { word: 'đau sau sinh', weight: 8, synonyms: ['đau hậu sản', 'đau sau đẻ', 'đau tử cung sau sinh', 'đau bụng sau sinh'] },
        { word: 'kinh nguyệt không đều', weight: 9, synonyms: ['kinh không đều', 'rối loạn kinh', 'kinh thất thường', 'kinh không đúng'] },
        { word: 'ra dịch bất thường', weight: 9, synonyms: ['dịch âm đạo bất thường', 'khí hư bất thường', 'ra dịch nhiều', 'dịch lạ'] }
      ]
    }
  };

  const analyzeSymptoms = async (userInput: string): Promise<{ specialty: string; doctors: DoctorRecommendation[]; analysis: string; confidence: number; matchedSymptoms: string[] }> => {
    // Tìm kiếm triệu chứng trong text người dùng nhập
    const lowerInput = userInput.toLowerCase();
    
    // Phân tích triệu chứng mở rộng từ dữ liệu mới
    const specialtyScores: Record<string, { score: number; matchedSymptoms: string[] }> = {};
    
    for (const [specialtyKey, specialtyData] of Object.entries(extendedSymptomData)) {
      let score = 0;
      const matched: string[] = [];
      
      for (const keyword of specialtyData.keywords) {
        // Kiểm tra từ khóa chính
        if (lowerInput.includes(keyword.word.toLowerCase())) {
          score += keyword.weight;
          matched.push(keyword.word);
          continue;
        }
        
        // Kiểm tra từ đồng nghĩa
        for (const synonym of keyword.synonyms) {
          if (lowerInput.includes(synonym.toLowerCase())) {
            score += keyword.weight * 0.8; // Từ đồng nghĩa có trọng số thấp hơn
            matched.push(keyword.word);
            break;
          }
        }
      }
      
      if (score > 0) {
        specialtyScores[specialtyKey] = { score, matchedSymptoms: matched };
      }
    }
    
    // Tìm chuyên khoa có điểm cao nhất
    const sortedSpecialties = Object.entries(specialtyScores)
      .sort((a, b) => b[1].score - a[1].score);
    
    if (sortedSpecialties.length > 0) {
      const [topSpecialtyKey, topData] = sortedSpecialties[0];
      const specialtyName = extendedSymptomData[topSpecialtyKey].name;
      
      // Tính confidence dựa trên điểm số
      const maxPossibleScore = extendedSymptomData[topSpecialtyKey].keywords
        .slice(0, 3)
        .reduce((sum, k) => sum + k.weight, 0);
      const confidence = Math.min(95, Math.round((topData.score / maxPossibleScore) * 100));
      
      // Lấy bác sĩ từ Firebase
      let doctorRecommendations: DoctorRecommendation[] = [];
      try {
        if (db) {
          const doctorsRef = collection(db, 'doctors');
          let querySnapshot = await getDocs(query(doctorsRef, where('specialty', '==', specialtyName)));
          
          if (querySnapshot.empty) {
            querySnapshot = await getDocs(query(doctorsRef, where('chuyen_khoa', '==', specialtyName)));
          }
          
          if (!querySnapshot.empty) {
            doctorRecommendations = querySnapshot.docs
              .slice(0, 3)
              .map((doc) => {
                const data = doc.data();
                const name = data.name || data.ten || data.fullName || 'Chưa cập nhật';
                const displayName = name.startsWith('BS.') ? name : `BS. ${name}`;
                const imageName = data.image || 'hoangvanduc.png';
                return {
                  id: doc.id,
                  name: displayName,
                  specialty: specialtyName,
                  image: imageName
                };
              });
          }
        }
        
        if (doctorRecommendations.length === 0) {
          doctorRecommendations = [
            { id: 'bs001', name: 'BS. Ngô Thị Hương', specialty: specialtyName },
            { id: 'bs002', name: 'BS. Vũ Thị Lan', specialty: specialtyName }
          ];
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        doctorRecommendations = [
          { id: 'bs001', name: 'BS. Ngô Thị Hương', specialty: specialtyName },
          { id: 'bs002', name: 'BS. Vũ Thị Lan', specialty: specialtyName }
        ];
      }
      
      return {
        specialty: specialtyName,
        doctors: doctorRecommendations,
        analysis: `Dựa trên phân tích ${topData.matchedSymptoms.length} triệu chứng (${topData.matchedSymptoms.slice(0, 3).join(', ')}${topData.matchedSymptoms.length > 3 ? '...' : ''}), hệ thống AI xác định chuyên khoa phù hợp là ${specialtyName}.`,
        confidence,
        matchedSymptoms: topData.matchedSymptoms
      };
    }
    
    // Fallback về logic cũ nếu không tìm thấy
    const lowerInput2 = userInput.toLowerCase();
    // Fallback về logic cũ nếu không tìm thấy
    const matchedSymptomItems: SymptomItem[] = [];
    
    // Tìm các triệu chứng khớp - ưu tiên cụm từ dài hơn
    const allSymptoms = symptomMappingService.getAllSymptoms();
    
    // Sắp xếp theo độ dài tên triệu chứng (dài nhất trước) để ưu tiên cụm từ
    const sortedSymptoms = [...allSymptoms].sort((a, b) => b.name.length - a.name.length);
    
    sortedSymptoms.forEach(symptom => {
      if (lowerInput.includes(symptom.name.toLowerCase()) && 
          !matchedSymptomItems.find(s => s.id === symptom.id)) {
        
        // Kiểm tra xem có triệu chứng dài hơn đã chứa triệu chứng này chưa
        const hasLongerMatch = matchedSymptomItems.some(existing => 
          existing.name.toLowerCase().includes(symptom.name.toLowerCase())
        );
        
        if (!hasLongerMatch) {
          matchedSymptomItems.push(symptom);
        }
      }
    });
    
    // Nếu không tìm thấy bằng cách match cụm từ, thử tìm theo từng từ
    if (matchedSymptomItems.length === 0) {
      const words = lowerInput.split(/[\s,，、]+/);
      words.forEach(word => {
        if (word.length > 1) {
          const results = symptomMappingService.searchSymptoms(word);
          results.forEach((symptom: SymptomItem) => {
            if (!matchedSymptomItems.find(s => s.id === symptom.id)) {
              matchedSymptomItems.push(symptom);
            }
          });
        }
      });
    }

    // Nếu tìm thấy triệu chứng, phân tích bằng symptomMappingService
    if (matchedSymptomItems.length > 0) {
      const symptomIds = matchedSymptomItems.map(s => s.id);
      const specialtyMatches = symptomMappingService.analyzeSymptoms(symptomIds);
      
      if (specialtyMatches.length > 0) {
        const bestMatch = specialtyMatches[0];
        
        // Lấy danh sách bác sĩ từ Firebase theo chuyên khoa
        let doctorRecommendations: DoctorRecommendation[] = [];
        try {
          if (db) {
            const doctorsRef = collection(db, 'doctors');
            // Thử cả 2 field: specialty (tiếng Anh) và chuyen_khoa (tiếng Việt)
            let querySnapshot = await getDocs(query(doctorsRef, where('specialty', '==', bestMatch.specialtyName)));
            
            // Nếu không tìm thấy, thử với field tiếng Việt
            if (querySnapshot.empty) {
              querySnapshot = await getDocs(query(doctorsRef, where('chuyen_khoa', '==', bestMatch.specialtyName)));
            }
            
            if (!querySnapshot.empty) {
              doctorRecommendations = querySnapshot.docs
                .slice(0, 3)
                .map((doc) => {
                  const data = doc.data();
                  // Thử các field name khác nhau
                  const name = data.name || data.ten || data.fullName || 'Chưa cập nhật';
                  const displayName = name.startsWith('BS.') ? name : `BS. ${name}`;
                  const imageName = data.image || 'hoangvanduc.png';
                  return {
                    id: doc.id,
                    name: displayName,
                    specialty: bestMatch.specialtyName,
                    image: imageName
                  };
                });
            }
          }
          
          // Fallback nếu không tìm thấy bác sĩ
          if (doctorRecommendations.length === 0) {
            console.log('No doctors found for specialty:', bestMatch.specialtyName);
            // Thử lấy bất kỳ bác sĩ nào
            if (db) {
              const allDoctorsRef = collection(db, 'doctors');
              const allDoctorsSnapshot = await getDocs(allDoctorsRef);
              if (!allDoctorsSnapshot.empty) {
                doctorRecommendations = allDoctorsSnapshot.docs
                  .slice(0, 3)
                  .map((doc) => {
                    const data = doc.data();
                    const name = data.name || data.ten || data.fullName || 'Chưa cập nhật';
                    const displayName = name.startsWith('BS.') ? name : `BS. ${name}`;
                    return {
                      id: doc.id,
                      name: displayName,
                      specialty: bestMatch.specialtyName
                    };
                  });
              }
            }
            
            // Fallback cuối cùng
            if (doctorRecommendations.length === 0) {
              doctorRecommendations = [
                { id: 'fallback-1', name: 'BS. Ngô Thị Hương', specialty: bestMatch.specialtyName },
                { id: 'fallback-2', name: 'BS. Vũ Thị Lan', specialty: bestMatch.specialtyName }
              ];
            }
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
          doctorRecommendations = [
            { id: 'fallback-1', name: 'BS. Ngô Thị Hương', specialty: bestMatch.specialtyName },
            { id: 'fallback-2', name: 'BS. Vũ Thị Lan', specialty: bestMatch.specialtyName }
          ];
        }
        
        return {
          specialty: bestMatch.specialtyName,
          doctors: doctorRecommendations,
          analysis: `Dựa trên phân tích ${matchedSymptomItems.length} triệu chứng bạn mô tả (${matchedSymptomItems.map(s => s.name).join(', ')}), hệ thống AI đã xác định chuyên khoa phù hợp nhất là ${bestMatch.specialtyName}.`,
          confidence: bestMatch.matchPercentage,
          matchedSymptoms: matchedSymptomItems.map(s => s.name)
        };
      }
    }
    
    // Fallback: Phân tích theo từ khóa cơ bản nếu không tìm thấy triệu chứng chính xác
    const lowerSymptoms = userInput.toLowerCase();
    
    if (lowerSymptoms.includes('đau ngực') || lowerSymptoms.includes('tim') || lowerSymptoms.includes('huyết áp') || lowerSymptoms.includes('khó thở')) {
      return {
        specialty: 'Tim mạch',
        doctors: [{ id: 'fallback-tim-mach-0', name: 'BS. Ngô Thị Hương', specialty: 'Tim mạch' }],
        analysis: 'Các triệu chứng bạn mô tả có thể liên quan đến hệ tim mạch. Đau ngực và khó thở có thể là dấu hiệu của các vấn đề về tim.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    if (lowerSymptoms.includes('đau bụng') || lowerSymptoms.includes('buồn nôn') || lowerSymptoms.includes('tiêu hóa') || lowerSymptoms.includes('đau dạ dày')) {
      return {
        specialty: 'Tiêu hóa',
        doctors: [{ id: 'fallback-tieu-hoa-0', name: 'BS. Nguyễn Thị Hoa', specialty: 'Tiêu hóa' }],
        analysis: 'Triệu chứng cho thấy có thể có vấn đề về hệ tiêu hóa. Đau bụng và buồn nôn thường liên quan đến dạ dày hoặc ruột.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    if (lowerSymptoms.includes('ho') || lowerSymptoms.includes('khó thở') || lowerSymptoms.includes('phổi') || lowerSymptoms.includes('hen suyễn')) {
      return {
        specialty: 'Hô hấp',
        doctors: [{ id: 'fallback-ho-hap-0', name: 'BS. Trần Thị Mai', specialty: 'Hô hấp' }],
        analysis: 'Các triệu chứng liên quan đến hệ hô hấp. Ho và khó thở có thể do nhiễm trùng đường hô hấp hoặc các bệnh lý phổi.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    if (lowerSymptoms.includes('đau đầu') || lowerSymptoms.includes('chóng mặt') || lowerSymptoms.includes('thần kinh') || lowerSymptoms.includes('mất ngủ')) {
      return {
        specialty: 'Thần kinh',
        doctors: [{ id: 'fallback-than-kinh-0', name: 'BS. Vũ Thị Lan', specialty: 'Thần kinh' }],
        analysis: 'Triệu chứng có thể liên quan đến hệ thần kinh. Đau đầu và chóng mặt cần được kiểm tra để loại trừ các vấn đề nghiêm trọng.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    if (lowerSymptoms.includes('da') || lowerSymptoms.includes('ngứa') || lowerSymptoms.includes('phát ban') || lowerSymptoms.includes('mụn')) {
      return {
        specialty: 'Da liễu',
        doctors: [
          { id: 'fallback-da-lieu-0', name: 'BS. Trần Thị Lan', specialty: 'Da liễu' },
          { id: 'fallback-da-lieu-1', name: 'BS. Đỗ Minh Tuấn', specialty: 'Da liễu' }
        ],
        analysis: 'Các triệu chứng về da cần được khám bởi bác sĩ da liễu để chẩn đoán chính xác và điều trị phù hợp.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Mắt
    if (lowerSymptoms.includes('mắt') || lowerSymptoms.includes('nhìn mờ') || lowerSymptoms.includes('đau mắt') || 
        lowerSymptoms.includes('ngứa mắt') || lowerSymptoms.includes('chảy nước mắt')) {
      return {
        specialty: 'Mắt',
        doctors: [{ id: 'fallback-mat-0', name: 'BS. Lê Thị Hằng', specialty: 'Mắt' }],
        analysis: 'Các triệu chứng về mắt cần được khám bởi bác sĩ nhãn khoa để kiểm tra thị lực và các bệnh lý về mắt.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Tai mũi họng
    if (lowerSymptoms.includes('tai') || lowerSymptoms.includes('mũi') || lowerSymptoms.includes('họng') || 
        lowerSymptoms.includes('đau họng') || lowerSymptoms.includes('nghẹt mũi') || lowerSymptoms.includes('chảy máu cam')) {
      return {
        specialty: 'Tai mũi họng',
        doctors: [{ id: 'fallback-tai-mui-hong-0', name: 'BS. Phạm Minh Quân', specialty: 'Tai mũi họng' }],
        analysis: 'Các triệu chứng về tai, mũi, họng cần được khám chuyên khoa để chẩn đoán và điều trị kịp thời.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Nội tiết
    if (lowerSymptoms.includes('tiểu đường') || lowerSymptoms.includes('tuyến giáp') || lowerSymptoms.includes('nội tiết') || 
        lowerSymptoms.includes('tăng cân') || lowerSymptoms.includes('giảm cân') || lowerSymptoms.includes('khát nước nhiều')) {
      return {
        specialty: 'Nội tiết',
        doctors: [{ id: 'fallback-noi-tiet-0', name: 'BS. Đặng Thị Thảo', specialty: 'Nội tiết' }],
        analysis: 'Các triệu chứng có thể liên quan đến rối loạn nội tiết. Cần khám để kiểm tra chức năng tuyến và hormone.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Nhi khoa
    if (lowerSymptoms.includes('trẻ em') || lowerSymptoms.includes('trẻ nhỏ') || lowerSymptoms.includes('nhi') || 
        lowerSymptoms.includes('sốt cao ở trẻ') || lowerSymptoms.includes('tiêm chủng')) {
      return {
        specialty: 'Nhi khoa',
        doctors: [{ id: 'fallback-nhi-khoa-0', name: 'BS. Hoàng Văn Đức', specialty: 'Nhi khoa' }],
        analysis: 'Triệu chứng ở trẻ em cần được bác sĩ nhi khoa thăm khám để đảm bảo sức khỏe và phát triển của trẻ.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Sản phụ khoa
    if (lowerSymptoms.includes('kinh nguyệt') || lowerSymptoms.includes('mang thai') || lowerSymptoms.includes('phụ khoa') || 
        lowerSymptoms.includes('đau bụng dưới') || lowerSymptoms.includes('ra máu âm đạo')) {
      return {
        specialty: 'Sản phụ khoa',
        doctors: [{ id: 'fallback-san-phu-khoa-0', name: 'BS. Lê Minh Tâm', specialty: 'Sản phụ khoa' }],
        analysis: 'Các triệu chứng phụ khoa cần được bác sĩ sản phụ khoa thăm khám để chẩn đoán và điều trị phù hợp.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Răng hàm mặt
    if (lowerSymptoms.includes('răng') || lowerSymptoms.includes('đau răng') || lowerSymptoms.includes('nha khoa') || 
        lowerSymptoms.includes('sâu răng') || lowerSymptoms.includes('chảy máu chân răng')) {
      return {
        specialty: 'Răng hàm mặt',
        doctors: [{ id: 'fallback-rang-ham-mat-0', name: 'BS. Nguyễn Văn Hải', specialty: 'Răng hàm mặt' }],
        analysis: 'Các vấn đề về răng miệng cần được bác sĩ nha khoa khám và điều trị để bảo vệ sức khỏe răng miệng.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Cơ xương khớp
    if (lowerSymptoms.includes('đau khớp') || lowerSymptoms.includes('đau lưng') || lowerSymptoms.includes('đau cơ') || 
        lowerSymptoms.includes('sưng khớp') || lowerSymptoms.includes('gãy xương') || lowerSymptoms.includes('bong gân')) {
      return {
        specialty: 'Cơ xương khớp',
        doctors: [{ id: 'fallback-co-xuong-khop-0', name: 'BS. Trần Văn Khoa', specialty: 'Cơ xương khớp' }],
        analysis: 'Các triệu chứng về cơ xương khớp cần được bác sĩ chuyên khoa khám để chẩn đoán và điều trị phù hợp.',
        confidence: 70,
        matchedSymptoms: []
      };
    }
    
    // Mặc định - không tìm thấy chuyên khoa phù hợp
    return {
      specialty: 'Đa khoa',
      doctors: [],
      analysis: 'Hệ thống chưa xác định được chuyên khoa cụ thể từ triệu chứng bạn mô tả.\n\nBạn có thể:\n\n• Đến Bệnh viện Trường Đại học Trà Vinh để gặp bác sĩ khoa Đa khoa - Nội tổng hợp\n\n• Tìm bác sĩ trong hệ thống của ứng dụng và nhắn tin trực tiếp để được tư vấn chính xác hơn\n\nBác sĩ sẽ giúp bạn xác định đúng chuyên khoa và phương pháp điều trị phù hợp nhất.',
      confidence: 0,
      matchedSymptoms: []
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Enable auto-scroll when sending new message
    setShouldAutoScroll(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    setTimeout(async () => {
      // Giai đoạn 1: Phân tích triệu chứng ban đầu
      if (conversationState.phase === 'initial') {
        const analysis = await analyzeSymptoms(currentInput);
        
        // KIỂM TRA: Nếu là "Đa khoa" (không khớp triệu chứng) - KHÔNG hỏi câu hỏi
        if (analysis.specialty === 'Đa khoa' || analysis.matchedSymptoms.length === 0) {
          // Gửi tin nhắn gợi ý trực tiếp mà KHÔNG hỏi câu hỏi
          const directMessage: Message = {
            id: Date.now().toString(),
            text: analysis.analysis,
            isUser: false,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, directMessage]);
          setIsTyping(false);
          
          // Reset về trạng thái ban đầu để người dùng có thể nhập lại
          setConversationState({
            phase: 'initial',
            initialSymptoms: '',
            matchedSymptoms: [],
            primarySpecialty: '',
            questions: [],
            answers: [],
            currentQuestionIndex: 0
          });
          return; // DỪNG LẠI, không hỏi câu hỏi
        }
        
        // Nếu CÓ khớp triệu chứng - Tiếp tục hỏi câu hỏi như bình thường
        // Lấy 2-5 câu hỏi theo dõi
        const questionCount = Math.floor(Math.random() * 4) + 2; // 2-5 câu
        const questions = followUpQuestionsService.getQuestions(
          [], 
          analysis.specialty, 
          questionCount
        );
        
        // Cập nhật state
        setConversationState({
          phase: 'follow-up',
          initialSymptoms: currentInput,
          matchedSymptoms: [],
          primarySpecialty: analysis.specialty,
          questions,
          answers: [],
          currentQuestionIndex: 0
        });
        
        // Gửi tin nhắn giới thiệu
        const introMessage: Message = {
          id: Date.now().toString(),
          text: `Cảm ơn bạn đã chia sẻ. Để tôi hiểu rõ hơn về tình trạng của bạn, xin vui lòng trả lời thêm ${questions.length} câu hỏi sau:\n\n${questions[0].question}`,
          isUser: false,
          timestamp: new Date(),
          hasOptions: questions[0].type === 'choice',
          options: questions[0].options
        };
        
        setMessages(prev => [...prev, introMessage]);
        setIsTyping(false);
      }
      // Giai đoạn 2: Thu thập câu trả lời
      else if (conversationState.phase === 'follow-up') {
        const newAnswers = [...conversationState.answers, currentInput];
        const nextIndex = conversationState.currentQuestionIndex + 1;
        
        // Nếu còn câu hỏi
        if (nextIndex < conversationState.questions.length) {
          setConversationState({
            ...conversationState,
            answers: newAnswers,
            currentQuestionIndex: nextIndex
          });
          
          const nextQuestion = conversationState.questions[nextIndex];
          const questionMessage: Message = {
            id: Date.now().toString(),
            text: nextQuestion.question,
            isUser: false,
            timestamp: new Date(),
            hasOptions: nextQuestion.type === 'choice',
            options: nextQuestion.options
          };
          
          setMessages(prev => [...prev, questionMessage]);
          setIsTyping(false);
        }
        // Đã hết câu hỏi - phân tích và đưa ra kết quả
        else {
          setConversationState({
            ...conversationState,
            phase: 'complete',
            answers: newAnswers
          });
          
          // Phân tích câu trả lời
          const specialtyAnalysis = followUpQuestionsService.analyzeAnswers(
            conversationState.primarySpecialty,
            newAnswers,
            conversationState.questions
          );
          
          // Lấy danh sách bác sĩ cho TẤT CẢ các chuyên khoa được phân tích
          let allDoctorRecommendations: DoctorRecommendation[] = [];
          
          try {
            if (db) {
              // Lấy bác sĩ cho từng chuyên khoa (lấy tối đa 2-3 chuyên khoa có % cao nhất)
              const topSpecialties = specialtyAnalysis.slice(0, 3); // Top 3 chuyên khoa
              
              for (const specialtyItem of topSpecialties) {
                const doctorsRef = collection(db, 'doctors');
                let querySnapshot = await getDocs(query(doctorsRef, where('specialty', '==', specialtyItem.specialty)));
                
                if (querySnapshot.empty) {
                  querySnapshot = await getDocs(query(doctorsRef, where('chuyen_khoa', '==', specialtyItem.specialty)));
                }
                
                if (!querySnapshot.empty) {
                  const doctorsForSpecialty = querySnapshot.docs
                    .slice(0, 2) // Lấy 2 bác sĩ mỗi chuyên khoa
                    .map((doc) => {
                      const data = doc.data();
                      const name = data.name || data.ten || data.fullName || 'Chưa cập nhật';
                      const displayName = name.startsWith('BS.') ? name : `BS. ${name}`;
                      return {
                        id: doc.id,
                        name: displayName,
                        specialty: specialtyItem.specialty
                      };
                    });
                  
                  allDoctorRecommendations.push(...doctorsForSpecialty);
                }
              }
            }
            
            // Fallback nếu không tìm thấy bác sĩ
            if (allDoctorRecommendations.length === 0) {
              allDoctorRecommendations = [
                { id: 'final-fallback-0', name: 'BS. Nguyễn Văn An', specialty: specialtyAnalysis[0].specialty },
                { id: 'final-fallback-1', name: 'BS. Trần Minh Đức', specialty: specialtyAnalysis[0].specialty }
              ];
            }
          } catch (error) {
            console.error('Error fetching doctors:', error);
            allDoctorRecommendations = [
              { id: 'final-fallback-0', name: 'BS. Nguyễn Văn An', specialty: specialtyAnalysis[0].specialty },
              { id: 'final-fallback-1', name: 'BS. Trần Minh Đức', specialty: specialtyAnalysis[0].specialty }
            ];
          }
          
          // Tạo phản hồi cuối cùng với phân tích đa chuyên khoa
          let responseText = `✨ Kết quả phân tích \n\n`;
          responseText += `Dựa trên ${conversationState.questions.length + 1} thông tin bạn cung cấp, hệ thống AI đã phân tích như sau:\n\n`;
          
          // Hiển thị xác suất các chuyên khoa
          responseText += `📊 Phân tích chuyên khoa:\n`;
          specialtyAnalysis.forEach((item, index) => {
            const icon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
            responseText += `${icon} ${item.specialty}: ${item.percentage}%\n`;
          });
          
          responseText += `\n💡 Bác sĩ gợi ý theo từng chuyên khoa:\n`;
          
          const finalResponse: Message = {
            id: Date.now().toString(),
            text: responseText,
            isUser: false,
            timestamp: new Date(),
            doctors: allDoctorRecommendations // Bao gồm bác sĩ từ tất cả chuyên khoa
          };
          
          setMessages(prev => [...prev, finalResponse]);
          setIsTyping(false);
          
          // Reset state để bắt đầu cuộc trò chuyện mới
          setTimeout(() => {
            setConversationState({
              phase: 'initial',
              initialSymptoms: '',
              matchedSymptoms: [],
              primarySpecialty: '',
              questions: [],
              answers: [],
              currentQuestionIndex: 0
            });
          }, 1000);
        }
      }
      // Giai đoạn 3: Hoàn thành - xử lý yêu cầu mới
      else {
        const analysis = await analyzeSymptoms(currentInput);
        
        let responseText = `${analysis.analysis}\n\n`;
        responseText += `Độ tin cậy: ${analysis.confidence}%\n\n`;
        responseText += `Chuyên khoa gợi ý: ${analysis.specialty}\n\n`;
        responseText += `Bác sĩ được gợi ý:\n`;
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          doctors: analysis.doctors
        };

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }
    }, 2000);
  };

  const handleOptionSelect = (option: string) => {
    // Enable auto-scroll when selecting option
    setShouldAutoScroll(true);
    setInputText(option);
    // Tự động gửi sau khi chọn option
    setTimeout(() => {
      if (option.trim()) {
        sendMessage();
      }
    }, 100);
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
        
        {/* Hiển thị danh sách bác sĩ được nhóm theo chuyên khoa */}
        {!item.isUser && item.doctors && item.doctors.length > 0 && (
          <View style={styles.doctorsContainer}>
            {/* Nhóm bác sĩ theo chuyên khoa */}
            {(() => {
              // Group doctors by specialty
              const doctorsBySpecialty: Record<string, DoctorRecommendation[]> = {};
              item.doctors.forEach(doctor => {
                if (!doctorsBySpecialty[doctor.specialty]) {
                  doctorsBySpecialty[doctor.specialty] = [];
                }
                doctorsBySpecialty[doctor.specialty].push(doctor);
              });
              
              // Render grouped doctors
              return Object.entries(doctorsBySpecialty).map(([specialty, doctors], specialtyIndex) => (
                <View key={specialty} style={styles.specialtyGroup}>
                  {/* Specialty header */}
                  <View style={styles.specialtyHeader}>
                    <Text style={styles.specialtyHeaderText}>
                      {specialty}
                    </Text>
                    <View style={styles.specialtyBadge}>
                      <Text style={styles.specialtyBadgeText}>
                        {doctors.length} BS
                      </Text>
                    </View>
                  </View>
                  
                  {/* Doctor cards for this specialty */}
                  {doctors.map((doctor) => (
                    <TouchableOpacity
                      key={doctor.id}
                      style={styles.doctorCard}
                      onPress={() => {
                        console.log('Navigating to doctor:', doctor);
                        router.push({
                          pathname: '/doctor-detail',
                          params: {
                            id: doctor.id,
                            name: doctor.name,
                            specialty: doctor.specialty
                          }
                        });
                      }}
                    >
                      <View style={styles.doctorCardContent}>
                        <View style={styles.doctorInfo}>
                          <Text style={styles.doctorName} numberOfLines={1}>{doctor.name}</Text>
                          <Text style={styles.doctorSpecialty} numberOfLines={1}>{doctor.specialty}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ));
            })()}
            
            <Text style={styles.doctorHint}>
              💡 Nhấn vào bác sĩ để xem thông tin chi tiết và đặt lịch khám
            </Text>
          </View>
        )}
        
        {item.hasOptions && item.options && (
          <View style={styles.optionsContainer}>
            {item.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Tư vấn chuyên khoa </Text>
          <Text style={styles.headerSubtitle}>Trợ lý thông minh</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={clearConversation}
          >
            <Ionicons name="refresh-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleClearConversation}
          >
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
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
        onContentSizeChange={() => {
          // Only auto-scroll if user hasn't manually scrolled up
          if (shouldAutoScroll) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onScroll={(event) => {
          // Detect if user manually scrolled
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
          setShouldAutoScroll(isAtBottom);
        }}
        scrollEventThrottle={16}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  optionButton: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  optionText: {
    color: '#00838F',
    fontSize: 14,
    fontWeight: '600',
  },
  doctorsContainer: {
    marginTop: 12,
    gap: 8,
  },
  specialtyGroup: {
    marginBottom: 16,
  },
  specialtyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  specialtyHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  specialtyBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  specialtyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    letterSpacing: 0.5,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  doctorInfo: {
    flex: 1,
    gap: 4,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  doctorHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});