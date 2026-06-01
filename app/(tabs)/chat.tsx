import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ChatTabScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tư vấn chuyên khoa</Text>
      </View>

      {/* Content - Wrapped in ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.aiCard}>
          <View style={styles.aiIconLarge}>
            <ExpoImage 
              source={require('@/assets/images/ai.png')} 
              style={styles.aiImage}
              contentFit="contain"
            />
          </View>
          <Text style={styles.aiTitle}>Chat tư vấn chuyên khoa</Text>
          <Text style={styles.aiDescription}>
            Mô tả triệu chứng của bạn và nhận tư vấn từ AI về chuyên khoa phù hợp
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push('/ai-chat')}
          >
            <Text style={styles.startButtonText}>Bắt đầu chat</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.howItWorksTitle}>Cách sử dụng</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Mô tả triệu chứng tự nhiên (VD: "Tôi bị đau đầu và chóng mặt")</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>AI phân tích và gợi ý chuyên khoa phù hợp</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Xem danh sách bác sĩ và đặt lịch khám</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#06D6A0" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Bảo mật 100%</Text>
              <Text style={styles.featureDesc}>Thông tin của bạn được bảo mật tuyệt đối</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="time" size={24} color="#FFB800" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Hỗ trợ tư vấn chuyên khoa 24/7</Text>
              <Text style={styles.featureDesc}>AI luôn sẵn sàng tư vấn mọi lúc</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="analytics" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Phân tích chuyên khoa chính xác</Text>
              <Text style={styles.featureDesc}>Gợi ý chuyên khoa phù hợp với triệu chứng</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  aiImage: {
    width: 96,
    height: 96,
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  aiDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  howItWorksSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    paddingTop: 4,
  },
});
