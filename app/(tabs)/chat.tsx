import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ChatTabScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Navigate to ai-consultation when tab is focused
  useFocusEffect(
    useCallback(() => {
      // Chỉ navigate một lần khi tab được focus
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        // Delay nhỏ để đảm bảo tab đã render xong
        setTimeout(() => {
          router.push('/ai-consultation');
        }, 100);
      }
      
      return () => {
        // Reset khi unfocus để lần sau vào lại sẽ navigate
        hasNavigated.current = false;
      };
    }, [])
  );

  const consultationOptions = [
    {
      id: 1,
      title: 'Tư vấn AI',
      description: 'Chat với AI để phân tích triệu chứng',
      icon: 'chatbubble-ellipses',
      color: '#00BCD4',
      route: '/ai-consultation',
    },
    {
      id: 2,
      title: 'Lịch sử tư vấn',
      description: 'Xem các cuộc hội thoại đã lưu',
      icon: 'time',
      color: '#FF9800',
      route: '/ai-chat-history',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tư vấn</Text>
        <Text style={styles.headerSubtitle}>Chọn loại tư vấn bạn cần</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="medical" size={40} color="#00BCD4" />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Tư vấn sức khỏe 24/7</Text>
            <Text style={styles.bannerText}>
              AI phân tích triệu chứng và gợi ý bác sĩ phù hợp
            </Text>
          </View>
        </View>

        {/* Consultation Options */}
        <View style={styles.optionsContainer}>
          {consultationOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => router.push(option.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={32} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color="#00BCD4" />
            <Text style={styles.infoText}>
              Thông tin của bạn được bảo mật tuyệt đối
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="medical" size={24} color="#00BCD4" />
            <Text style={styles.infoText}>
              Chỉ mang tính chất tham khảo, không thay thế bác sĩ
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
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  banner: {
    margin: 16,
    padding: 20,
    backgroundColor: '#e0f2f1',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  infoSection: {
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
