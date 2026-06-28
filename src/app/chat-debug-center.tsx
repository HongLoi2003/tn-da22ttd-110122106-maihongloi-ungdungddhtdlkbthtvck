import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DebugTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const DEBUG_TOOLS: DebugTool[] = [
  {
    id: '1',
    title: 'Kiểm tra 16 Bác sĩ',
    description: 'Kiểm tra nhanh xem bác sĩ nào có thể nhận tin nhắn',
    icon: 'search',
    route: '/quick-check-all-doctors-chat',
    color: '#00BCD4'
  },
  {
    id: '2',
    title: 'Kiểm tra Chi tiết',
    description: 'Kiểm tra chi tiết trạng thái chat của tất cả bác sĩ',
    icon: 'analytics',
    route: '/check-all-doctors-chat-status',
    color: '#4CAF50'
  },
  {
    id: '3',
    title: 'Debug Chat Issue',
    description: 'Debug toàn bộ hệ thống chat (bệnh nhân hoặc bác sĩ)',
    icon: 'bug',
    route: '/debug-chat-issue',
    color: '#FF9800'
  },
  {
    id: '4',
    title: 'Sửa Doctor AuthUid',
    description: 'Cập nhật authUid cho tất cả bác sĩ',
    icon: 'construct',
    route: '/fix-doctor-auth-uid',
    color: '#9C27B0'
  },
  {
    id: '5',
    title: 'Sửa Conversations',
    description: 'Cập nhật doctorAuthUid trong conversations',
    icon: 'build',
    route: '/fix-conversations-auth-uid',
    color: '#F44336'
  },
  {
    id: '6',
    title: 'Xem Conversations',
    description: 'Xem tất cả conversations trong Firestore',
    icon: 'chatbubbles',
    route: '/check-all-conversations-in-firestore',
    color: '#2196F3'
  },
  {
    id: '7',
    title: 'Phân tích Conversations',
    description: 'Phân tích conversations của tất cả bác sĩ',
    icon: 'stats-chart',
    route: '/analyze-all-doctors-conversations',
    color: '#FF5722'
  },
];

export default function ChatDebugCenter() {
  const router = useRouter();

  const renderTool = (tool: DebugTool) => {
    return (
      <TouchableOpacity
        key={tool.id}
        style={styles.toolCard}
        onPress={() => router.push(tool.route as any)}
      >
        <View style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}>
          <Ionicons name={tool.icon as any} size={32} color={tool.color} />
        </View>
        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>{tool.title}</Text>
          <Text style={styles.toolDescription}>{tool.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Debug Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Trung tâm Debug Chat</Text>
            <Text style={styles.infoText}>
              Tập hợp các công cụ để kiểm tra và sửa lỗi hệ thống chat giữa bệnh nhân và bác sĩ.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Công cụ kiểm tra</Text>
          {DEBUG_TOOLS.slice(0, 3).map(renderTool)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Công cụ sửa lỗi</Text>
          {DEBUG_TOOLS.slice(3, 5).map(renderTool)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Công cụ phân tích</Text>
          {DEBUG_TOOLS.slice(5).map(renderTool)}
        </View>

        <View style={styles.guideCard}>
          <Ionicons name="book" size={24} color="#8B5CF6" />
          <View style={styles.guideContent}>
            <Text style={styles.guideTitle}>📚 Hướng dẫn sử dụng</Text>
            <Text style={styles.guideText}>1️⃣ Chạy "Kiểm tra 16 Bác sĩ" để xem tổng quan</Text>
            <Text style={styles.guideText}>2️⃣ Nếu có bác sĩ broken, chạy "Sửa Doctor AuthUid"</Text>
            <Text style={styles.guideText}>3️⃣ Sau đó chạy "Sửa Conversations"</Text>
            <Text style={styles.guideText}>4️⃣ Kiểm tra lại bằng "Kiểm tra Chi tiết"</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00838F',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#00838F',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B21A8',
    marginBottom: 12,
  },
  guideText: {
    fontSize: 13,
    color: '#6B21A8',
    marginBottom: 6,
    lineHeight: 18,
  },
});
