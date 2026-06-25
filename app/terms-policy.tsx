import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TermsPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản và Chính sách</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Điều khoản sử dụng</Text>
          <Text style={styles.paragraph}>
            Bằng việc sử dụng ứng dụng này, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây.
          </Text>
          <Text style={styles.paragraph}>
            Ứng dụng cung cấp dịch vụ đặt lịch khám bệnh, tư vấn sức khỏe trực tuyến và các dịch vụ y tế liên quan.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Chính sách bảo mật</Text>
          <Text style={styles.paragraph}>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Mọi thông tin y tế và cá nhân được mã hóa và lưu trữ an toàn.
          </Text>
          <Text style={styles.paragraph}>
            Thông tin của bạn chỉ được chia sẻ với các bác sĩ và cơ sở y tế khi có sự đồng ý của bạn.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Quyền và trách nhiệm</Text>
          <Text style={styles.subTitle}>Quyền của người dùng:</Text>
          <Text style={styles.bulletPoint}>• Được cung cấp thông tin chính xác về dịch vụ</Text>
          <Text style={styles.bulletPoint}>• Được bảo mật thông tin cá nhân</Text>
          <Text style={styles.bulletPoint}>• Được hủy hoặc thay đổi lịch hẹn</Text>

          <Text style={styles.subTitle}>Trách nhiệm của người dùng:</Text>
          <Text style={styles.bulletPoint}>• Cung cấp thông tin chính xác</Text>
          <Text style={styles.bulletPoint}>• Tuân thủ hướng dẫn của bác sĩ</Text>
          <Text style={styles.bulletPoint}>• Thanh toán đầy đủ chi phí dịch vụ</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Chính sách thanh toán và hoàn tiền</Text>
          <Text style={styles.paragraph}>
            Phí dịch vụ được thanh toán qua ứng dụng. Hoàn tiền được xử lý trong vòng 7-10 ngày làm việc nếu hủy lịch trước 24 giờ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Giới hạn trách nhiệm</Text>
          <Text style={styles.paragraph}>
            Ứng dụng chỉ là nền tảng kết nối. Chúng tôi không chịu trách nhiệm về chất lượng dịch vụ y tế từ các bác sĩ và cơ sở y tế.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Liên hệ</Text>
          <Text style={styles.paragraph}>
            Nếu có thắc mắc về điều khoản và chính sách, vui lòng liên hệ:
          </Text>
          <Text style={styles.contactInfo}>Email: info@capcuu-115.com</Text>
          <Text style={styles.contactInfo}>Hotline: 0908971115</Text>
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
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 24,
    paddingLeft: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#00BCD4',
    lineHeight: 24,
    fontWeight: '500',
  },
  updateInfo: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
