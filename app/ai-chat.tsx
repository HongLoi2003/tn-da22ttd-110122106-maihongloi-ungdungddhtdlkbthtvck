import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument, getDocumentsWithQuery } from './services/firebaseService';
import { processFollowUpAnswer, shouldContinueFollowUp } from './utils/followUpLogic';
import { FollowUpQuestion, getFollowUpQuestions, specialtyNameToKey } from './utils/followUpQuestions';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  specialties?: { name: string; match: number; icon: string }[];
  actions?: { label: string; action: string }[];
  followUpQuestion?: FollowUpQuestion;
  quickReplies?: string[];
  isFollowUp?: boolean;
  confidence?: number;
}

// Hệ thống phân tích triệu chứng thông minh
const analyzeSymptoms = (text: string): { name: string; match: number; icon: string }[] => {
  const lowerText = text.toLowerCase().trim();
  
  // Định nghĩa chuyên khoa với keywords, synonyms và weights
  const specialties: { [key: string]: { 
    name: string; 
    icon: string; 
    keywords: { word: string; weight: number; synonyms: string[] }[] 
  } } = {
    'than_kinh': {
      name: 'Thần kinh',
      icon: '🧠',
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
      icon: '🦴',
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
      icon: '❤️',
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
      icon: '🍽️',
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
      icon: '🫁',
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
      icon: '🧴',
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
      icon: '👂',
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
      icon: '👁️',
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
      icon: '👶',
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
      icon: '🦋',
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
      icon: '🦷',
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
      icon: '🤰',
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

  // Hàm tính độ tương đồng giữa 2 chuỗi (Levenshtein distance)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  };

  // Scoring system cho mỗi chuyên khoa
  const scores: { [key: string]: number } = {};

  Object.keys(specialties).forEach(specialtyKey => {
    let totalScore = 0;
    const specialty = specialties[specialtyKey];

    specialty.keywords.forEach(keywordObj => {
      // 1. Exact match
      if (lowerText.includes(keywordObj.word)) {
        totalScore += keywordObj.weight * 1.0;
      }

      // 2. Synonym match
      keywordObj.synonyms.forEach(synonym => {
        if (lowerText.includes(synonym)) {
          totalScore += keywordObj.weight * 0.9;
        }
      });

      // 3. Fuzzy match (cho phép gõ sai)
      const words = lowerText.split(/\s+/);
      words.forEach(word => {
        // So sánh với keyword chính
        const similarity1 = calculateSimilarity(word, keywordObj.word);
        if (similarity1 >= 0.75 && similarity1 < 1.0) {
          totalScore += keywordObj.weight * 0.7 * similarity1;
        }

        // So sánh với synonyms
        keywordObj.synonyms.forEach(synonym => {
          const similarity2 = calculateSimilarity(word, synonym);
          if (similarity2 >= 0.75 && similarity2 < 1.0) {
            totalScore += keywordObj.weight * 0.6 * similarity2;
          }
        });
      });
    });

    if (totalScore > 0) {
      scores[specialtyKey] = totalScore;
    }
  });

  // Sắp xếp theo điểm số
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (sorted.length === 0) {
    return [];
  }

  // Tính phần trăm tin cậy
  const maxScore = sorted[0][1];
  const totalScore = sorted.reduce((sum, [, score]) => sum + score, 0);

  return sorted.map(([key, score]) => ({
    name: specialties[key].name,
    icon: specialties[key].icon,
    match: Math.min(Math.round((score / maxScore) * 100), 98)
  }));
};

export default function AIChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Follow-up question states
  const [currentSpecialty, setCurrentSpecialty] = useState<string>('');
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [symptomScore, setSymptomScore] = useState<{ [key: string]: number }>({});
  const [followUpMode, setFollowUpMode] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  // Menu modal state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  useEffect(() => {
    loadOrCreateConversation();
  }, [user, params.conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lưu messages vào AsyncStorage mỗi khi messages thay đổi
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      saveMessagesToStorage();
    }
  }, [messages, conversationId]);

  const loadOrCreateConversation = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading conversation for user:', user.uid);
      
      // Nếu có conversationId từ params (từ màn hình history), load conversation đó
      if (params.conversationId) {
        console.log('📝 Loading conversation from params:', params.conversationId);
        setConversationId(params.conversationId as string);
        
        // Lưu conversationId này để lần sau sử dụng
        await AsyncStorage.setItem('last_ai_conversation_id', params.conversationId as string);
        
        // Thử load từ AsyncStorage trước
        const cachedMessages = await loadMessagesFromStorage(params.conversationId as string);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log('✅ Loaded', cachedMessages.length, 'messages from cache');
          setMessages(cachedMessages);
          setLoading(false);
          
          // Đồng bộ với Firestore trong background để cập nhật nếu có thay đổi
          syncMessagesInBackground(params.conversationId as string);
          return;
        }
        
        // Nếu không có cache, load từ Firestore
        const msgs = await getDocumentsWithQuery('ai-messages', [
          where('conversationId', '==', params.conversationId)
        ]);
        
        console.log('📦 Loaded', msgs.length, 'messages from Firestore');
        
        const sortedMsgs = msgs.sort((a: any, b: any) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateA - dateB;
        });
        
        setMessages(formatFirestoreMessages(sortedMsgs));
        setLoading(false);
        return;
      }

      // Nếu không có params, thử load từ last conversation ID đã lưu
      console.log('🔍 Checking for last conversation ID...');
      const lastConvId = await AsyncStorage.getItem('last_ai_conversation_id');
      
      if (lastConvId) {
        console.log('✅ Found last conversation ID:', lastConvId);
        setConversationId(lastConvId);
        
        // Thử load từ cache trước
        const cachedMessages = await loadMessagesFromStorage(lastConvId);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log('✅ Loaded', cachedMessages.length, 'messages from cache');
          setMessages(cachedMessages);
          setLoading(false);
          
          // Đồng bộ với Firestore trong background
          syncMessagesInBackground(lastConvId);
          return;
        }
        
        // Nếu không có cache, load từ Firestore
        console.log('🔍 Loading from Firestore for last conversation...');
        const msgs = await getDocumentsWithQuery('ai-messages', [
          where('conversationId', '==', lastConvId)
        ]);
        
        if (msgs.length > 0) {
          console.log('📦 Loaded', msgs.length, 'messages from Firestore');
          
          const sortedMsgs = msgs.sort((a: any, b: any) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateA - dateB;
          });
          
          setMessages(formatFirestoreMessages(sortedMsgs));
          setLoading(false);
          return;
        }
        
        console.log('⚠️ Last conversation not found, searching for any conversation...');
      }

      // Nếu không có last conversation hoặc không tìm thấy, tìm conversation mới nhất
      console.log('🔍 Searching for existing conversations...');
      const conversations = await getDocumentsWithQuery('ai-conversations', [
        where('userId', '==', user.uid)
      ]);

      console.log('📋 Found', conversations.length, 'conversations');

      const sortedConversations = conversations.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      if (sortedConversations.length > 0) {
        // Load conversation hiện có
        const conv = sortedConversations[0];
        console.log('✅ Loading most recent conversation:', conv.id);
        setConversationId(conv.id);
        
        // Lưu conversationId này để lần sau sử dụng
        await AsyncStorage.setItem('last_ai_conversation_id', conv.id);
        
        // Thử load từ AsyncStorage trước
        const cachedMessages = await loadMessagesFromStorage(conv.id);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log('✅ Loaded', cachedMessages.length, 'messages from cache');
          setMessages(cachedMessages);
          setLoading(false);
          
          // Đồng bộ với Firestore trong background
          syncMessagesInBackground(conv.id);
          return;
        }
        
        console.log('🔍 No cache found, loading from Firestore...');
        
        // Nếu không có cache, load từ Firestore
        const msgs = await getDocumentsWithQuery('ai-messages', [
          where('conversationId', '==', conv.id)
        ]);
        
        console.log('📦 Loaded', msgs.length, 'messages from Firestore');
        
        const sortedMsgs = msgs.sort((a: any, b: any) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateA - dateB;
        });
        
        setMessages(formatFirestoreMessages(sortedMsgs));
      } else {
        // Tạo conversation mới
        console.log('🆕 Creating new conversation...');
        const newConv = await createDocument('ai-conversations', {
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setConversationId(newConv.id);
        console.log('✅ Created new conversation:', newConv.id);
        
        // Lưu conversationId này
        await AsyncStorage.setItem('last_ai_conversation_id', newConv.id);
        
        // Thêm tin nhắn chào mừng
        const welcomeMsg = await createDocument('ai-messages', {
          conversationId: newConv.id,
          text: 'Bạn đang gặp vấn đề về sức khỏe?\n\nHãy mô tả chi tiết triệu chứng của bạn.\nAI sẽ phân tích và gợi ý chuyên khoa phù hợp.',
          isUser: false,
          createdAt: new Date()
        });
        
        const welcomeText = 'Bạn đang gặp vấn đề về sức khỏe?\n\nHãy mô tả chi tiết triệu chứng của bạn.\nAI sẽ phân tích và gợi ý chuyên khoa phù hợp.';
        
        setMessages([{
          id: welcomeMsg.id,
          text: welcomeText,
          isUser: false,
          timestamp: 'Hôm nay, 10:30'
        }]);
      }
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lưu messages vào AsyncStorage
  const saveMessagesToStorage = async () => {
    try {
      const storageKey = `ai_chat_${conversationId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(messages));
      console.log('💾 Saved', messages.length, 'messages to storage with key:', storageKey);
    } catch (error) {
      console.error('❌ Error saving messages to storage:', error);
    }
  };

  // Load messages từ AsyncStorage
  const loadMessagesFromStorage = async (convId: string): Promise<Message[] | null> => {
    try {
      const storageKey = `ai_chat_${convId}`;
      const cachedData = await AsyncStorage.getItem(storageKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('📱 Loaded', parsedData.length, 'messages from storage with key:', storageKey);
        return parsedData;
      }
      console.log('❌ No cached data found for key:', storageKey);
      return null;
    } catch (error) {
      console.error('❌ Error loading messages from storage:', error);
      return null;
    }
  };

  // Xóa messages từ AsyncStorage
  const clearMessagesFromStorage = async () => {
    try {
      const storageKey = `ai_chat_${conversationId}`;
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing messages from storage:', error);
    }
  };

  // Helper function để format messages từ Firestore
  const formatFirestoreMessages = (msgs: any[]): Message[] => {
    return msgs.map((msg: any) => ({
      id: msg.id,
      text: msg.text,
      isUser: msg.isUser,
      timestamp: new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      specialties: msg.specialties,
      actions: msg.actions,
      followUpQuestion: msg.followUpQuestion,
      quickReplies: msg.quickReplies,
      isFollowUp: msg.isFollowUp,
      confidence: msg.confidence
    }));
  };

  // Đồng bộ messages với Firestore trong background
  const syncMessagesInBackground = async (convId: string) => {
    try {
      console.log('🔄 Syncing messages from Firestore in background...');
      const msgs = await getDocumentsWithQuery('ai-messages', [
        where('conversationId', '==', convId)
      ]);
      
      const sortedMsgs = msgs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateA - dateB;
      });
      
      const firestoreMessages = formatFirestoreMessages(sortedMsgs);
      
      // Chỉ cập nhật nếu có sự thay đổi
      if (firestoreMessages.length !== messages.length) {
        console.log('🔄 Updating messages from Firestore:', firestoreMessages.length);
        setMessages(firestoreMessages);
      } else {
        console.log('✅ Messages are in sync');
      }
    } catch (error) {
      console.error('❌ Error syncing messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId) return;

    const userMessageText = inputText;
    setInputText('');

    try {
      // Lưu tin nhắn user
      const userMsg = await createDocument('ai-messages', {
        conversationId,
        text: userMessageText,
        isUser: true,
        createdAt: new Date()
      });

      const userMessage: Message = {
        id: userMsg.id,
        text: userMessageText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, userMessage]);

      // KIỂM TRA: Nếu đang ở follow-up mode, xử lý như câu trả lời follow-up
      if (followUpMode) {
        // Tìm câu hỏi follow-up gần nhất
        const lastFollowUpQuestion = [...messages].reverse().find(m => m.isFollowUp && m.followUpQuestion);
        
        if (lastFollowUpQuestion && lastFollowUpQuestion.followUpQuestion) {
          // Xử lý như handleQuickReply
          handleQuickReply(userMessageText, lastFollowUpQuestion);
        }
        return; // KHÔNG phân tích triệu chứng lại
      }

      // CHỈ phân tích triệu chứng khi KHÔNG ở follow-up mode
      const analyzedSpecialties = analyzeSymptoms(userMessageText);

      // Tạo phản hồi AI
      setTimeout(async () => {
        const aiResponseText = 'Cảm ơn bạn đã chia sẻ. Dựa trên thông tin bạn cung cấp, tôi đã phân tích triệu chứng và có một số gợi ý về chuyên khoa phù hợp:';
        
        const aiMsg = await createDocument('ai-messages', {
          conversationId,
          text: aiResponseText,
          isUser: false,
          createdAt: new Date()
        });

        const aiResponse: Message = {
          id: aiMsg.id,
          text: aiResponseText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiResponse]);

        // Thêm kết quả phân tích
        setTimeout(async () => {
          const specialtyText = 'Kết quả phân tích\nDựa trên thông tin bạn cung cấp, đây là các chuyên khoa phù hợp:';
          
          // Nếu không tìm thấy triệu chứng phù hợp, yêu cầu mô tả chi tiết hơn
          let finalSpecialties = analyzedSpecialties;
          
          if (analyzedSpecialties.length === 0) {
            // Không dùng "Nội tổng quát" nữa, yêu cầu user mô tả rõ hơn
            const clarifyText = 'Tôi chưa thể xác định chuyên khoa phù hợp từ thông tin bạn cung cấp.\n\nVui lòng mô tả chi tiết hơn về triệu chứng của bạn:\n• Triệu chứng cụ thể là gì?\n• Xuất hiện ở vị trí nào trên cơ thể?\n• Kéo dài bao lâu?\n• Có triệu chứng kèm theo không?';
            
            const clarifyMsg = await createDocument('ai-messages', {
              conversationId,
              text: clarifyText,
              isUser: false,
              createdAt: new Date()
            });
            
            setMessages(prev => [...prev, {
              id: clarifyMsg.id,
              text: clarifyText,
              isUser: false,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }]);
            return; // Dừng lại, không hiển thị kết quả
          }
          
          const actionsData = [
            { label: 'Gọi ý bác sĩ', action: 'suggest_doctor' },
            { label: 'Tư vấn thêm về triệu chứng', action: 'more_info' },
            { label: 'Không, cảm ơn', action: 'no_thanks' },
          ];
          
          const specialtyMsg = await createDocument('ai-messages', {
            conversationId,
            text: specialtyText,
            isUser: false,
            specialties: finalSpecialties,
            topSpecialty: finalSpecialties[0].name, // Lưu chuyên khoa phù hợp nhất
            actions: actionsData,
            createdAt: new Date()
          });

          const specialtyMessage: Message = {
            id: specialtyMsg.id,
            text: specialtyText,
            isUser: false,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            specialties: finalSpecialties,
            actions: actionsData,
          };
          setMessages(prev => [...prev, specialtyMessage]);
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickReply = async (reply: string, questionMessage: Message) => {
    if (!questionMessage.followUpQuestion) return;
    
    // Lưu câu trả lời của user
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    
    await createDocument('ai-messages', {
      conversationId,
      text: reply,
      isUser: true,
      createdAt: new Date()
    });
    
    // Xử lý câu trả lời và cập nhật điểm
    const { updatedScore } = processFollowUpAnswer(
      reply,
      questionMessage.followUpQuestion,
      {
        currentSpecialty,
        askedQuestions,
        symptomScore,
        followUpMode,
        questionCount
      }
    );
    
    setSymptomScore(updatedScore);
    
    // TĂNG questionCount TRƯỚC KHI kiểm tra
    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);
    
    // Kiểm tra xem có tiếp tục hỏi không (với questionCount mới)
    const nextStep = shouldContinueFollowUp(
      {
        currentSpecialty,
        askedQuestions,
        symptomScore: updatedScore,
        followUpMode,
        questionCount: newQuestionCount // Dùng giá trị mới
      },
      4 // Max 4 câu hỏi (thay vì 3)
    );
    
    setTimeout(async () => {
      if (nextStep.shouldAskFollowUp && nextStep.question) {
        // Hỏi câu tiếp theo
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: nextStep.question.question,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          followUpQuestion: nextStep.question,
          quickReplies: ['Có', 'Không', 'Không chắc'], // Thêm quick replies
          isFollowUp: true,
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setAskedQuestions(prev => [...prev, nextStep.question!.id]);
        
        await createDocument('ai-messages', {
          conversationId,
          text: aiMessage.text,
          isUser: false,
          isFollowUp: true,
          questionId: nextStep.question.id,
          createdAt: new Date()
        });
      } else if (nextStep.finalResult) {
        // Hiển thị kết quả cuối cùng
        const result = nextStep.finalResult;
        let resultText = `Dựa trên triệu chứng bạn cung cấp:\n\n`;
        resultText += `✅ Chuyên khoa phù hợp nhất: ${result.specialty}\n`;
        resultText += `📊 Độ tin cậy: ${result.confidence}%\n`;
        
        if (result.relatedSpecialties.length > 0) {
          resultText += `\nCác chuyên khoa liên quan:\n`;
          result.relatedSpecialties.forEach((spec: { name: string; confidence: number }) => {
            resultText += `• ${spec.name} - ${spec.confidence}%\n`;
          });
        }
        
        resultText += `\nBạn có muốn xem danh sách bác sĩ chuyên khoa ${result.specialty} không?`;
        
        const finalMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: resultText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          confidence: result.confidence,
          specialties: [
            {
              name: result.specialty,
              match: result.confidence,
              icon: getSpecialtyIcon(result.specialty)
            }
          ],
          actions: [
            { label: 'Gợi ý bác sĩ', action: 'suggest_doctor' }
          ]
        };
        
        setMessages(prev => [...prev, finalMessage]);
        setFollowUpMode(false);
        
        await createDocument('ai-messages', {
          conversationId,
          text: finalMessage.text,
          isUser: false,
          confidence: result.confidence,
          specialty: result.specialty,
          createdAt: new Date()
        });
      }
    }, 800);
  };
  
  // Helper function để lấy icon cho chuyên khoa
  const getSpecialtyIcon = (specialtyName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Thần kinh': '🧠',
      'Cơ xương khớp': '🦴',
      'Tim mạch': '❤️',
      'Tiêu hóa': '🍽️',
      'Hô hấp': '🫁',
      'Da liễu': '🧴',
      'Tai mũi họng': '👂',
      'Mắt': '👁️',
      'Nhi khoa': '👶',
      'Nội tiết': '🦋',
      'Răng hàm mặt': '🦷',
      'Sản phụ khoa': '🤰'
    };
    return iconMap[specialtyName] || '⚕️';
  };

  const handleAction = async (action: string, messageId?: string) => {
    if (action === 'suggest_doctor') {
      // Tìm tin nhắn MỚI NHẤT có chuyên khoa (tìm từ cuối lên đầu)
      const messageWithSpecialty = [...messages].reverse().find(m => m.specialties && m.specialties.length > 0);
      
      if (messageWithSpecialty && messageWithSpecialty.specialties) {
        const topSpecialty = messageWithSpecialty.specialties[0].name;
        console.log('🔍 Top specialty from AI:', topSpecialty);
        // Chuyển đến trang bác sĩ với filter chuyên khoa
        router.push({
          pathname: '/all-doctors',
          params: { specialty: topSpecialty }
        });
      } else {
        router.push('/all-doctors');
      }
    } else if (action === 'more_info') {
      // Bắt đầu follow-up mode
      const messageWithSpecialty = [...messages].reverse().find(m => m.specialties && m.specialties.length > 0);
      
      if (messageWithSpecialty && messageWithSpecialty.specialties) {
        const topSpecialty = messageWithSpecialty.specialties[0];
        const specialtyKey = specialtyNameToKey[topSpecialty.name];
        
        if (specialtyKey) {
          // Khởi tạo follow-up state
          setCurrentSpecialty(specialtyKey);
          setFollowUpMode(true);
          setQuestionCount(0);
          setAskedQuestions([]);
          
          // Khởi tạo điểm ban đầu
          const initialScore: { [key: string]: number } = {};
          initialScore[specialtyKey] = topSpecialty.match * 0.1; // Convert % to score
          setSymptomScore(initialScore);
          
          // Lưu tin nhắn user
          const userMessage: Message = {
            id: Date.now().toString(),
            text: 'Tôi muốn tư vấn thêm về triệu chứng',
            isUser: true,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, userMessage]);
          
          await createDocument('ai-messages', {
            conversationId,
            text: userMessage.text,
            isUser: true,
            createdAt: new Date()
          });
          
          // Lấy câu hỏi đầu tiên
          const questions = getFollowUpQuestions(specialtyKey, [], 1);
          
          if (questions.length > 0) {
            const firstQuestion = questions[0];
            
            setTimeout(() => {
              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: firstQuestion.question,
                isUser: false,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                followUpQuestion: firstQuestion,
                quickReplies: ['Có', 'Không', 'Không chắc'], // Thêm quick replies
                isFollowUp: true,
              };
              
              setMessages(prev => [...prev, aiMessage]);
              setAskedQuestions([firstQuestion.id]);
              setQuestionCount(1); // Đã hỏi câu đầu tiên
              
              // Lưu vào Firebase
              createDocument('ai-messages', {
                conversationId,
                text: aiMessage.text,
                isUser: false,
                isFollowUp: true,
                questionId: firstQuestion.id,
                createdAt: new Date()
              });
            }, 500);
          }
        }
      }
    }
  };

  // Menu handlers
  const handleNewChat = async () => {
    setShowMenuModal(false);
    
    // Xóa cache của conversation hiện tại
    await clearMessagesFromStorage();
    
    // Xóa last conversation ID
    await AsyncStorage.removeItem('last_ai_conversation_id');
    
    // Tạo conversation mới
    const newConvData = {
      userId: user?.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const newConv = await createDocument('ai-conversations', newConvData);
    setConversationId(newConv.id);
    
    // Lưu conversationId mới
    await AsyncStorage.setItem('last_ai_conversation_id', newConv.id);
    
    // Reset messages với welcome message
    const welcomeText = 'Bạn đang gặp vấn đề về sức khỏe?\n\nHãy mô tả chi tiết triệu chứng của bạn.\nAI sẽ phân tích và gợi ý chuyên khoa phù hợp.';
    
    const welcomeMsgData = {
      conversationId: newConv.id,
      text: welcomeText,
      isUser: false,
      createdAt: new Date()
    };
    const welcomeMsg = await createDocument('ai-messages', welcomeMsgData);
    
    setMessages([{
      id: welcomeMsg.id,
      text: welcomeText,
      isUser: false,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleClearHistory = async () => {
    setShowMenuModal(false);
    
    try {
      // Xóa cache của conversation hiện tại
      await clearMessagesFromStorage();
      
      // Xóa last conversation ID
      await AsyncStorage.removeItem('last_ai_conversation_id');
      
      // Chỉ reset local state, KHÔNG xóa conversation cũ trong database
      const welcomeText = 'Lịch sử chat đã được xóa.\n\nBạn đang gặp vấn đề về sức khỏe?\n\nHãy mô tả chi tiết triệu chứng của bạn.\nAI sẽ phân tích và gợi ý chuyên khoa phù hợp.';
      
      setMessages([{
        id: Date.now().toString(),
        text: welcomeText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Reset conversationId để tạo conversation mới khi gửi tin nhắn tiếp theo
      setConversationId('');
      
      console.log('✅ Chat history cleared successfully (local only)');
    } catch (error: any) {
      console.error('Error clearing history:', error);
    }
  };

  const handleLoadConversation = async (convId: string) => {
    setShowHistoryModal(false);
    
    try {
      setConversationId(convId);
      
      // Load messages
      const msgs = await getDocumentsWithQuery('ai-messages', [
        where('conversationId', '==', convId)
      ]);
      
      const sortedMsgs = msgs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateA - dateB;
      });
      
      setMessages(sortedMsgs.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.isUser,
        timestamp: new Date(msg.createdAt.seconds * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        specialties: msg.specialties,
        actions: msg.actions,
        followUpQuestion: msg.followUpQuestion,
        quickReplies: msg.quickReplies,
        isFollowUp: msg.isFollowUp
      })));
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.aiAvatarHeader, { backgroundColor: '#00BCD4', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Chat tư vấn chuyên khoa</Text>
            <Text style={styles.headerSubtitle}>Đặt câu hỏi về thông tin triệu chứng của bạn</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowMenuModal(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id}>
            {!message.isUser && (
              <View style={styles.aiMessageContainer}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#4A90E2" />
                </View>
                <View style={styles.aiMessageWrapper}>
                  <View style={styles.aiMessageBubble}>
                    <Text style={styles.aiMessageText}>{message.text}</Text>
                  </View>
                  
                  {/* Quick Replies cho follow-up questions */}
                  {message.quickReplies && message.quickReplies.length > 0 && message.isFollowUp && (
                    <View style={styles.quickRepliesContainer}>
                      {message.quickReplies.map((reply, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.quickReplyButton}
                          onPress={() => handleQuickReply(reply, message)}
                        >
                          <Text style={styles.quickReplyText}>{reply}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {message.specialties && (
                    <View style={styles.specialtiesCard}>
                      {message.specialties.map((specialty, index) => (
                        <View key={index} style={styles.specialtyItem}>
                          <View style={styles.specialtyHeader}>
                            <Text style={styles.specialtyIcon}>{specialty.icon}</Text>
                            <Text style={styles.specialtyName}>{specialty.name}</Text>
                          </View>
                          <View style={styles.specialtyProgress}>
                            <Text style={styles.specialtyMatchText}>Độ tin cậy: {specialty.match}%</Text>
                            <View style={styles.progressBar}>
                              <View style={[styles.progressFill, { width: `${specialty.match}%` }]} />
                            </View>
                          </View>
                        </View>
                      ))}
                      
                      {message.actions && (
                        <View style={styles.actionsContainer}>
                          <Text style={styles.actionsTitle}>
                            Bạn có muốn tôi gợi ý bác sĩ ở chuyên khoa{'\n'}
                            Thần kinh phù hợp cho bạn không?
                          </Text>
                          <View style={styles.actionButtons}>
                            {message.actions.map((action, index) => (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.actionButton,
                                  index === 0 && styles.actionButtonPrimary
                                ]}
                                onPress={() => handleAction(action.action)}
                              >
                                <Text style={[
                                  styles.actionButtonText,
                                  index === 0 && styles.actionButtonTextPrimary
                                ]}>
                                  {action.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <Text style={styles.messageTime}>{message.timestamp}</Text>
                </View>
              </View>
            )}

            {message.isUser && (
              <View style={styles.userMessageContainer}>
                <View style={styles.userMessageBubble}>
                  <Text style={styles.userMessageText}>{message.text}</Text>
                </View>
                <View style={styles.messageTimeRow}>
                  <Text style={styles.messageTime}>{message.timestamp}</Text>
                  <Ionicons name="checkmark-done" size={14} color="#4A90E2" />
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.disclaimer}>
          
        </View>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={20} color="#64748b" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn của bạn"
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#fff' : '#94a3b8'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.menuModalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowMenuModal(false)}
          />
          <View style={styles.menuModalContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNewChat}
            >
              <Ionicons name="add-circle-outline" size={22} color="#0f172a" />
              <Text style={styles.menuItemText}>Tạo cuộc trò chuyện mới</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleClearHistory}
            >
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Xóa lịch sử chat</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setShowMenuModal(false)}
            >
              <Ionicons name="close-circle-outline" size={22} color="#64748b" />
              <Text style={styles.menuItemText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.historyModalOverlay}
          activeOpacity={1}
          onPress={() => setShowHistoryModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.historyModalContent}
          >
            <View style={styles.historyModalHeader}>
              <Text style={styles.historyModalTitle}>Lịch sử chat</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {conversationHistory.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyHistoryText}>Chưa có lịch sử chat</Text>
                </View>
              ) : (
                conversationHistory.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={[
                      styles.historyItem,
                      conv.id === conversationId && styles.historyItemActive
                    ]}
                    onPress={() => handleLoadConversation(conv.id)}
                  >
                    <View style={styles.historyItemIcon}>
                      <Ionicons name="chatbubble-ellipses" size={20} color="#4A90E2" />
                    </View>
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyItemPreview} numberOfLines={2}>
                        {conv.preview}
                      </Text>
                      <View style={styles.historyItemMeta}>
                        <Text style={styles.historyItemDate}>
                          {new Date(conv.createdAt.seconds * 1000).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.historyItemCount}>
                          {conv.messageCount} tin nhắn
                        </Text>
                      </View>
                    </View>
                    {conv.id === conversationId && (
                      <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 75 : 38,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatarHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  aiMessageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    gap: 8,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  aiMessageWrapper: {
    flex: 1,
  },
  aiMessageBubble: {
    backgroundColor: '#E8F4F8',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
    maxWidth: '90%',
  },
  aiMessageText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  userMessageBubble: {
    backgroundColor: '#D6E9FF',
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 14,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
  messageTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  specialtiesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specialtyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  specialtyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  specialtyIcon: {
    fontSize: 20,
  },
  specialtyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  specialtyProgress: {
    gap: 6,
  },
  specialtyMatchText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  actionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionsTitle: {
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 18,
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  actionButtonTextPrimary: {
    color: '#fff',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94a3b8',
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  micButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4A90E2',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickReplyButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#4A90E2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickReplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 120 : 80,
    paddingRight: 16,
  },
  menuModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  historyModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  historyModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyList: {
    flex: 1,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  historyItemActive: {
    backgroundColor: '#f0f9ff',
  },
  historyItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemContent: {
    flex: 1,
    gap: 6,
  },
  historyItemPreview: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    lineHeight: 20,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#64748b',
  },
  historyItemCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
