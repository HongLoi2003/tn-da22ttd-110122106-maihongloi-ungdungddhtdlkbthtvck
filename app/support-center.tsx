import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SupportCenterScreen() {
  const router = useRouter();

  const contactMethods = [
    { 
      id: '1', 
      icon: 'call', 
      title: 'Hotline', 
      subtitle: '1900-xxxx',
      description: 'Hỗ trợ 24/7',
      color: '#00BCD4',
      action: () => Linking.openURL('tel:1900xxxx')
    },
    { 
      id: '2', 
      icon: 'mail', 
      title: 'Email', 
      subtitle: 'support@healthcare.vn',
      description: 'Phản hồi trong 24h',
      color: '#06D6A0',
      action: () => Linking.openURL('mailto:support@healthcare.vn')
    },
    { 
      id: '3', 
      icon: 'chatbubbles', 
      title: 'Live Chat', 
      subtitle: 'Chat trực tiếp',
      description: 'Trực tuyến 8:00 - 22:00',
      color: '#FFB800',
      action: () => router.push('/(tabs)/chat')
    },
    { 
      id: '4', 
      icon: 'logo-facebook', 
      title: 'Facebook', 
      subtitle: 'fb.com/healthcare',
      description: 'Nhắn tin qua Messenger',
      color: '#1877F2',
      action: () => Linking.openURL('https://facebook.com')
    },
  ];

  const faqs = [
    { id: '1', question: 'Làm thế nào để đặt lịch khám?', answer: 'Bạn có thể đặt lịch khám qua ứng dụng...' },
    { id: '2', question: 'Tôi có thể hủy lịch khám không?', answer: 'Có, bạn có thể hủy lịch trước 24h...' },
    { id: '3', question: 'Phí khám bệnh là bao nhiêu?', answer: 'Phí khám phụ thuộc vào chuyên khoa...' },
    { id: '4', question: 'Làm sao để xem kết quả xét nghiệm?', answer: 'Kết quả sẽ được cập nhật trong hồ sơ...' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
          {contactMethods.map((method) => (
            <TouchableOpacity 
              key={method.id} 
              style={styles.contactCard}
              onPress={method.action}
            >
              <View style={[styles.contactIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={24} color={method.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          {faqs.map((faq) => (
            <TouchableOpacity key={faq.id} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle-outline" size={20} color="#00BCD4" />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency */}
        <View style={styles.emergencyCard}>
          <Ionicons name="warning" size={32} color="#EF4444" />
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Trường hợp khẩn cấp</Text>
            <Text style={styles.emergencyText}>
              Gọi ngay 115 hoặc đến cơ sở y tế gần nhất
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:115')}
          >
            <Text style={styles.emergencyButtonText}>Gọi 115</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#00BCD4',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  faqCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  faqAnswer: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    paddingLeft: 28,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: '#991B1B',
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
