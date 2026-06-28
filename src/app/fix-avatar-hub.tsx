import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ToolCard {
  title: string;
  description: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  recommended?: boolean;
}

export default function FixAvatarHubScreen() {
  const router = useRouter();

  const tools: ToolCard[] = [
    {
      title: 'Auto Fix Avatar (Thông Minh)',
      description: 'Tự động phát hiện và fix avatar sai. Xem preview trước khi fix. KHUYẾN NGHỊ DÙNG TOOL NÀY!',
      route: '/auto-fix-doctor-avatars',
      icon: 'sparkles',
      color: '#8B5CF6',
      recommended: true,
    },
    {
      title: 'Fix Ngay Avatar',
      description: 'Cập nhật avatar cho tất cả bác sĩ trong Firestore theo mapping cố định.',
      route: '/quick-fix-doctor-images',
      icon: 'flash',
      color: '#00BCD4',
    },
    {
      title: 'Kiểm Tra Tên Bác Sĩ',
      description: 'Xem tên chính xác của tất cả bác sĩ trong Firestore để đảm bảo mapping đúng.',
      route: '/check-doctor-names',
      icon: 'list',
      color: '#8B5CF6',
    },
    {
      title: 'Test Avatar',
      description: 'Xem preview avatar của tất cả bác sĩ để kiểm tra mapping có đúng không.',
      route: '/test-doctor-avatar',
      icon: 'images',
      color: '#F59E0B',
    },
    {
      title: 'Debug Thông Báo',
      description: 'Xem dữ liệu thông báo và preview avatar trong notifications.',
      route: '/debug-notification-avatar',
      icon: 'bug',
      color: '#EF4444',
    },
    {
      title: 'Trang Bác Sĩ Gợi Ý',
      description: 'Xem trang bác sĩ gợi ý để kiểm tra avatar hiển thị đúng chưa.',
      route: '/recommended-doctors',
      icon: 'people',
      color: '#10B981',
    },
  ];

  const renderToolCard = (tool: ToolCard) => (
    <TouchableOpacity
      key={tool.route}
      style={[
        styles.toolCard,
        tool.recommended && styles.toolCardRecommended,
      ]}
      onPress={() => router.push(tool.route as any)}
    >
      {tool.recommended && (
        <View style={styles.recommendedBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.recommendedText}>Khuyến nghị</Text>
        </View>
      )}
      
      <View style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}>
        <Ionicons name={tool.icon} size={32} color={tool.color} />
      </View>
      
      <View style={styles.toolContent}>
        <Text style={styles.toolTitle}>{tool.title}</Text>
        <Text style={styles.toolDescription}>{tool.description}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix Avatar Bác Sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroBox}>
          <Ionicons name="medical" size={48} color="#00BCD4" />
          <Text style={styles.heroTitle}>Trung Tâm Fix Avatar</Text>
          <Text style={styles.heroSubtitle}>
            Tất cả công cụ để fix avatar bác sĩ ở một nơi
          </Text>
        </View>

        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>📋 Các Bước Thực Hiện</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Chạy "Fix Ngay Avatar"</Text>
              <Text style={styles.stepText}>Cập nhật field image cho tất cả bác sĩ</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Test với tin nhắn MỚI</Text>
              <Text style={styles.stepText}>Bác sĩ gửi tin nhắn mới cho bệnh nhân</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Kiểm tra kết quả</Text>
              <Text style={styles.stepText}>Xem avatar trong thông báo và trang chat</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Công Cụ</Text>
          {tools.map(renderToolCard)}
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#f59e0b" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Lưu ý</Text>
            <Text style={styles.warningText}>
              • Thông báo CŨ vẫn giữ avatar cũ (logo){'\n'}
              • Chỉ thông báo MỚI mới có avatar đúng{'\n'}
              • Phải gửi tin nhắn MỚI để test
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  heroBox: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  stepsBox: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  toolCardRecommended: {
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});
