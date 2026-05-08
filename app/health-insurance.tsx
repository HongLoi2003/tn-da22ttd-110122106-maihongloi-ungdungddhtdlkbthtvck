import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HealthInsuranceScreen() {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảo hiểm y tế</Text>
        <TouchableOpacity>
          <View style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color="#00BCD4" />
            <Text style={styles.helpText}>Hướng dẫn</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Insurance Card */}
        <View style={styles.cardContainer}>
          <View style={styles.insuranceCard}>
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Thẻ bảo hiểm y tế</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>Đang hiệu lực</Text>
                  </View>
                </View>
              </View>
              <View style={styles.shieldContainer}>
                <View style={styles.shieldIcon}>
                  <Ionicons name="shield-checkmark" size={40} color="#fff" />
                </View>
              </View>
            </View>
            
            <Text style={styles.cardName}>NGUYỄN VĂN A</Text>
            <Text style={styles.cardNumber}>Mã số BHYT: DN 4 01 01 123 456 7890</Text>
            
            <View style={styles.cardDates}>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Ngày hiệu lực</Text>
                  <Text style={styles.dateValue}>01/01/2024</Text>
                </View>
              </View>
              <View style={styles.dateItem}>
                <Ionicons name="time-outline" size={18} color="#fff" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Ngày hết hạn</Text>
                  <Text style={styles.dateValue}>31/12/2024</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewCardButton}>
              <Ionicons name="qr-code-outline" size={18} color="#00BCD4" />
              <Text style={styles.viewCardText}>Xem thẻ BHYT</Text>
            </TouchableOpacity>
          </View>

          {/* Card Indicators */}
          <View style={styles.cardIndicators}>
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="document-text-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Quyền lợi{'\n'}bảo hiểm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="business-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Cơ sở y tế{'\n'}khám chữa bệnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="clipboard-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Lịch sử{'\n'}khám chữa bệnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Đổi thông tin{'\n'}thẻ BHYT</Text>
          </TouchableOpacity>
        </View>

        {/* Health Insurance Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.bannerImage}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Bảo vệ sức khỏe toàn diện cho bạn và gia đình</Text>
            <Text style={styles.bannerSubtitle}>Tham gia bảo hiểm bổ sung để được hưởng quyền lợi cao hơn</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Khám phá ngay</Text>
              <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits Information */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin quyền lợi</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Xem chi tiết</Text>
              <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
            </TouchableOpacity>
          </View>

          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medical-outline" size={28} color="#00BCD4" />
              </View>
              <Text style={styles.benefitTitle}>Khám chữa bệnh{'\n'}đúng tuyến</Text>
              <Text style={styles.benefitPercentage}>100%</Text>
              <Text style={styles.benefitDescription}>Chi phí được chi trả</Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medical-outline" size={28} color="#00BCD4" />
              </View>
              <Text style={styles.benefitTitle}>Khám chữa bệnh{'\n'}trái tuyến</Text>
              <Text style={styles.benefitPercentage}>40% - 100%</Text>
              <Text style={styles.benefitDescription}>Chi phí được chi trả</Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medkit-outline" size={28} color="#00BCD4" />
              </View>
              <Text style={styles.benefitTitle}>Tỷ lệ chi trả{'\n'}thuốc, vật tư y tế</Text>
              <Text style={styles.benefitPercentage}>80% - 100%</Text>
              <Text style={styles.benefitDescription}>Tùy theo loại dịch vụ</Text>
            </View>
          </View>
        </View>

        {/* Guide Section */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>Hướng dẫn & Tiện ích</Text>
          
          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Ionicons name="card-outline" size={24} color="#00BCD4" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Hướng dẫn sử dụng thẻ BHYT</Text>
              <Text style={styles.guideSubtitle}>Quy trình thăm khám bệnh và thanh toán BHYT</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Ionicons name="calculator-outline" size={24} color="#00BCD4" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Ước tính chi phí khám chữa bệnh</Text>
              <Text style={styles.guideSubtitle}>Dự tính chi phí và mức hưởng BHYT</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#00BCD4" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Câu hỏi thường gặp</Text>
              <Text style={styles.guideSubtitle}>Giải đáp các thắc mắc về BHYT</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Health Insurance Promotion */}
        <View style={styles.promotionBanner}>
          <View style={styles.promotionIcons}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.promotionImage}
            />
          </View>
          <View style={styles.promotionContent}>
            <Text style={styles.promotionTitle}>Bảo vệ sức khỏe - Vững vàng tương lai</Text>
            <Text style={styles.promotionSubtitle}>Tham gia bảo hiểm y tế để được chăm sóc sức khỏe chất lượng với chi phí hợp lý.</Text>
            <TouchableOpacity style={styles.promotionButton}>
              <Text style={styles.promotionButtonText}>Tìm hiểu thêm</Text>
              <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  insuranceCard: {
    backgroundColor: '#00897B',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitleRow: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  shieldContainer: {
    position: 'relative',
  },
  shieldIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 20,
    opacity: 0.9,
  },
  cardDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInfo: {
    gap: 2,
  },
  dateLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  viewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  cardIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  indicatorActive: {
    backgroundColor: '#00BCD4',
    width: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 15,
  },
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  bannerImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00897B',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
  },
  benefitsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 15,
  },
  benefitPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  guideSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  guideSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  promotionBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  promotionIcons: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  promotionContent: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 6,
  },
  promotionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  promotionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promotionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
  },
});