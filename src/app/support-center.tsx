import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SupportCenterScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = React.useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const contactMethods = [
    { 
      id: '1', 
      icon: 'call', 
      title: 'Hotline', 
      subtitle: '0908971115',
      description: 'Hỗ trợ 24/7',
      color: '#00BCD4',
      action: () => Linking.openURL('tel: 0908971115')
    },
    { 
      id: '2', 
      icon: 'mail', 
      title: 'Email', 
      subtitle: 'info@capcuu-115.com',
      description: 'Phản hồi trong 24h',
      color: '#06D6A0',
      action: () => Linking.openURL('mailto:info@capcuu-115.com')
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
      subtitle: 'fb.com/travinhgeneralhospital',
      description: 'Nhắn tin qua Messenger',
      color: '#1877F2',
      action: () => Linking.openURL('https://facebook.com')
    },
  ];

  const faqs = [
    { 
      id: '1', 
      question: 'Làm thế nào để đặt lịch khám?', 
      answer: 'Bạn có thể đặt lịch khám qua ứng dụng bằng cách: 1) Chọn chuyên khoa hoặc bác sĩ, 2) Chọn ngày và giờ khám phù hợp, 3) Điền thông tin bệnh nhân, 4) Xác nhận và thanh toán (nếu cần). Lịch khám sẽ được xác nhận qua thông báo và email.' 
    },
    { 
      id: '2', 
      question: 'Tôi có thể hủy lịch khám không?', 
      answer: 'Có, bạn có thể hủy lịch khám trước 24 giờ so với giờ hẹn. Vào mục "Lịch khám" > Chọn lịch cần hủy > Nhấn "Hủy lịch". Nếu đã thanh toán, số tiền sẽ được hoàn lại trong 3-5 ngày làm việc.' 
    },
    { 
      id: '3', 
      question: 'Phí khám bệnh là bao nhiêu?', 
      answer: 'Phí khám phụ thuộc vào chuyên khoa và bác sĩ. Phí khám thông thường từ 150.000đ - 500.000đ. Bạn có thể xem chi tiết phí khám khi chọn bác sĩ. Chúng tôi chấp nhận thanh toán qua thẻ, ví điện tử và tiền mặt tại bệnh viện.' 
    },
    { 
      id: '4', 
      question: 'Làm sao để xem kết quả xét nghiệm?', 
      answer: 'Kết quả xét nghiệm sẽ được cập nhật trong hồ sơ sức khỏe của bạn trong vòng 24-48 giờ. Vào mục "Hồ sơ" > "Kết quả xét nghiệm" để xem chi tiết. Bạn cũng sẽ nhận được thông báo khi kết quả đã sẵn sàng.' 
    },
    { 
      id: '5', 
      question: 'Tôi có thể đặt lịch cho người thân không?', 
      answer: 'Có, bạn có thể thêm hồ sơ người thân trong mục "Hồ sơ" và đặt lịch khám cho họ. Mỗi tài khoản có thể quản lý tối đa 5 hồ sơ bệnh nhân.' 
    },
    { 
      id: '6', 
      question: 'Bệnh viện có hỗ trợ bảo hiểm y tế không?', 
      answer: 'Có, Bệnh viện Trường Đại học Trà Vinh chấp nhận bảo hiểm y tế. Vui lòng mang theo thẻ BHYT khi đến khám. Bạn có thể cập nhật thông tin BHYT trong hồ sơ để thuận tiện hơn.' 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
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
          {faqs.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <TouchableOpacity 
                key={faq.id} 
                style={styles.faqCard}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle-outline" size={20} color="#00BCD4" />
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#64748b" 
                  />
                </View>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
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
    marginTop: 8,
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
