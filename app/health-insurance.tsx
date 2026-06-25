import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from './context/AuthContext';

interface InsuranceInfo {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function HealthInsuranceScreen() {
  const router = useRouter();
  const { userData, updateUserData } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const guideSectionRef = useRef<View>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);
  
  const [formData, setFormData] = useState<InsuranceInfo>({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    status: 'Đang hiệu lực'
  });

  // Load insurance info from userData when component mounts
  useEffect(() => {
    if (userData?.insuranceCode) {
      setInsuranceInfo({
        name: userData.fullName || '',
        code: userData.insuranceCode,
        startDate: userData.insuranceStartDate || '',
        endDate: userData.insuranceEndDate || '',
        status: userData.insuranceStatus || 'Đang hiệu lực'
      });
    }
  }, [userData]);

  const handleQuickAction = (action: string) => {
    setSelectedSection(action);
  };

  const handleAddInsurance = () => {
    if (insuranceInfo) {
      setFormData({
        name: insuranceInfo.name,
        code: insuranceInfo.code,
        startDate: insuranceInfo.startDate,
        endDate: insuranceInfo.endDate,
        status: insuranceInfo.status
      });
    } else {
      setFormData({
        name: '',
        code: '',
        startDate: '',
        endDate: '',
        status: 'Đang hiệu lực'
      });
    }
    setShowAddModal(true);
  };

  const handleSaveInsurance = async () => {
    if (!formData.name || !formData.code || !formData.startDate || !formData.endDate) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    try {
      // Save to local state
      setInsuranceInfo(formData);
      
      // Save to Firebase userData
      await updateUserData({
        insuranceCode: formData.code,
        insuranceStartDate: formData.startDate,
        insuranceEndDate: formData.endDate,
        insuranceStatus: formData.status,
      });
      
      setShowAddModal(false);
      const message = insuranceInfo 
        ? 'Đã cập nhật thông tin bảo hiểm y tế' 
        : 'Đã thêm thẻ bảo hiểm y tế thành công';
      Alert.alert('Thành công', message);
    } catch (error) {
      console.error('Error saving insurance info:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin bảo hiểm');
    }
  };

  const scrollToGuideSection = () => {
    if (guideSectionRef.current && scrollViewRef.current) {
      guideSectionRef.current.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Bảo hiểm y tế </Text>
        <TouchableOpacity onPress={handleAddInsurance}>
          <Ionicons name="add-circle" size={28} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Insurance Card or Empty State */}
        {insuranceInfo ? (
          <View style={styles.cardContainer}>
            <View style={styles.insuranceCard}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>Thẻ bảo hiểm y tế</Text>
                    <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>{insuranceInfo.status}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.shieldContainer}>
                  <View style={styles.shieldIcon}>
                    <Ionicons name="shield-checkmark" size={40} color="#fff" />
                  </View>
                </View>
              </View>
              
              <Text style={styles.cardName}>{insuranceInfo.name}</Text>
              <Text style={styles.cardNumber}>Mã số BHYT: {insuranceInfo.code}</Text>
              
              <View style={styles.cardDates}>
                <View style={styles.dateItem}>
                  <Ionicons name="calendar-outline" size={18} color="#fff" />
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Ngày hiệu lực</Text>
                    <Text style={styles.dateValue}>{insuranceInfo.startDate}</Text>
                  </View>
                </View>
                <View style={styles.dateItem}>
                  <Ionicons name="time-outline" size={18} color="#fff" />
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Ngày hết hạn</Text>
                    <Text style={styles.dateValue}>{insuranceInfo.endDate}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.viewCardButton}
                onPress={() => handleQuickAction('view-card')}
              >
                <Ionicons name="qr-code-outline" size={18} color="#00BCD4" />
                <Text style={styles.viewCardText}>Xem thẻ BHYT</Text>
              </TouchableOpacity>
            </View>

            {/* Card Indicators */}
            <View style={styles.cardIndicators}>
              <View style={[styles.indicator, styles.indicatorActive]} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="shield-outline" size={80} color="#00BCD4" />
              </View>
              <Text style={styles.emptyStateTitle}>Chưa có thẻ bảo hiểm y tế</Text>
              <Text style={styles.emptyStateDescription}>
                Thêm thông tin thẻ BHYT của bạn để quản lý và tra cứu quyền lợi bảo hiểm
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={handleAddInsurance}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Thêm thẻ BHYT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleQuickAction('benefits')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="document-text-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Quyền lợi{'\n'}bảo hiểm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/find-hospital')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="business-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Cơ sở y tế{'\n'}khám chữa bệnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/(tabs)/appointments')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="clipboard-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Lịch sử{'\n'}khám chữa bệnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleQuickAction('update-card')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>Đổi thông tin{'\n'}thẻ BHYT</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Section Content */}
        {selectedSection === 'benefits' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Quyền lợi bảo hiểm y tế</Text>
              <TouchableOpacity onPress={() => setSelectedSection(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <View style={styles.benefitDetailItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                <Text style={styles.benefitDetailText}>
                  Khám chữa bệnh tại các cơ sở y tế công lập đúng tuyến được chi trả 100%
                </Text>
              </View>
              <View style={styles.benefitDetailItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                <Text style={styles.benefitDetailText}>
                  Khám chữa bệnh trái tuyến được chi trả từ 40% đến 100% tùy trường hợp
                </Text>
              </View>
              <View style={styles.benefitDetailItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                <Text style={styles.benefitDetailText}>
                  Chi phí thuốc, vật tư y tế được chi trả từ 80% đến 100%
                </Text>
              </View>
              <View style={styles.benefitDetailItem}>
                <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                <Text style={styles.benefitDetailText}>
                  Được hưởng các dịch vụ y tế dự phòng miễn phí
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedSection === 'update-card' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Đổi thông tin thẻ BHYT</Text>
              <TouchableOpacity onPress={() => setSelectedSection(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailDescription}>
                Để cập nhật thông tin thẻ BHYT, vui lòng liên hệ:
              </Text>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={20} color="#00BCD4" />
                <Text style={styles.contactText}>Hotline: 0294 123 456</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location" size={20} color="#00BCD4" />
                <Text style={styles.contactText}>
                  Bệnh viện Trường Đại học Trà Vinh{'\n'}
                  126 Nguyễn Thiện Thành, Khóm 4, Phường 5, Trà Vinh
                </Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="time" size={20} color="#00BCD4" />
                <Text style={styles.contactText}>
                  Thứ 2 - Thứ 6: 7:00 - 17:00{'\n'}
                  Thứ 7: 7:00 - 12:00
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedSection === 'view-card' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Thẻ BHYT của bạn</Text>
              <TouchableOpacity onPress={() => setSelectedSection(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code" size={120} color="#00BCD4" />
                  <Text style={styles.qrCodeText}>Mã QR thẻ BHYT</Text>
                </View>
              </View>
              <Text style={styles.detailDescription}>
                Xuất trình mã QR này khi đến khám tại các cơ sở y tế để được hưởng quyền lợi BHYT.
              </Text>
            </View>
          </View>
        )}

        {selectedSection === 'additional-insurance' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Bảo hiểm bổ sung</Text>
              <TouchableOpacity onPress={() => setSelectedSection(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailDescription}>
                Các gói bảo hiểm bổ sung giúp bạn được hưởng quyền lợi cao hơn:
              </Text>
              <View style={styles.insurancePackage}>
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>Gói Cơ bản</Text>
                  <Text style={styles.packagePrice}>500.000đ/tháng</Text>
                </View>
                <View style={styles.benefitDetailItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#00BCD4" />
                  <Text style={styles.benefitDetailText}>Chi trả 100% viện phí</Text>
                </View>
                <View style={styles.benefitDetailItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#00BCD4" />
                  <Text style={styles.benefitDetailText}>Khám bệnh không giới hạn</Text>
                </View>
              </View>
              <View style={styles.insurancePackage}>
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>Gói Nâng cao</Text>
                  <Text style={styles.packagePrice}>1.000.000đ/tháng</Text>
                </View>
                <View style={styles.benefitDetailItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#00BCD4" />
                  <Text style={styles.benefitDetailText}>Tất cả quyền lợi gói Cơ bản</Text>
                </View>
                <View style={styles.benefitDetailItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#00BCD4" />
                  <Text style={styles.benefitDetailText}>Khám tại phòng VIP</Text>
                </View>
                <View style={styles.benefitDetailItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#00BCD4" />
                  <Text style={styles.benefitDetailText}>Bảo hiểm răng hàm mặt</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => router.push('/support-center')}
              >
                <Text style={styles.registerButtonText}>Liên hệ đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedSection === 'guide-usage' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Hướng dẫn sử dụng thẻ BHYT</Text>
              <TouchableOpacity onPress={() => setSelectedSection(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.guideStepTitle}>Bước 1: Chuẩn bị</Text>
              <Text style={styles.guideStepText}>
                Mang theo thẻ BHYT, CMND/CCCD và giấy tờ liên quan khi đến khám.
              </Text>
              
              <Text style={styles.guideStepTitle}>Bước 2: Đăng ký khám</Text>
              <Text style={styles.guideStepText}>
                Xuất trình thẻ BHYT tại quầy tiếp nhận để đăng ký khám bệnh.
              </Text>
              
              <Text style={styles.guideStepTitle}>Bước 3: Khám bệnh</Text>
              <Text style={styles.guideStepText}>
                Chờ gọi tên và vào phòng khám theo hướng dẫn của nhân viên y tế.
              </Text>
              
              <Text style={styles.guideStepTitle}>Bước 4: Thanh toán</Text>
              <Text style={styles.guideStepText}>
                BHYT sẽ chi trả phần được hưởng, bạn chỉ cần thanh toán phần còn lại (nếu có).
              </Text>
              
              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={20} color="#00BCD4" />
                <Text style={styles.noteText}>
                  Lưu ý: Khám đúng tuyến được chi trả 100%, khám trái tuyến được chi trả 40-100%.
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedSection === 'cost-estimate' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Ước tính chi phí khám</Text>
              <TouchableOpacity onPress={() => setSelectedSection(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailDescription}>
                Dự tính chi phí khám chữa bệnh và mức hưởng BHYT:
              </Text>
              
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Khám bệnh thông thường</Text>
                <View style={styles.costDetail}>
                  <Text style={styles.costValue}>150.000đ - 300.000đ</Text>
                  <Text style={styles.costInsurance}>BHYT chi trả: 100%</Text>
                </View>
              </View>
              
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Khám chuyên khoa</Text>
                <View style={styles.costDetail}>
                  <Text style={styles.costValue}>200.000đ - 500.000đ</Text>
                  <Text style={styles.costInsurance}>BHYT chi trả: 80-100%</Text>
                </View>
              </View>
              
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Xét nghiệm cơ bản</Text>
                <View style={styles.costDetail}>
                  <Text style={styles.costValue}>100.000đ - 500.000đ</Text>
                  <Text style={styles.costInsurance}>BHYT chi trả: 80-100%</Text>
                </View>
              </View>
              
              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={20} color="#00BCD4" />
                <Text style={styles.noteText}>
                  Chi phí thực tế phụ thuộc vào chuyên khoa và dịch vụ cụ thể.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => router.push('/(tabs)/booking')}
              >
                <Text style={styles.registerButtonText}>Đặt lịch khám ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Health Insurance Banner */}
        <View style={styles.bannerContainer}>
          
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Bảo vệ sức khỏe toàn diện cho bạn và gia đình</Text>
            <Text style={styles.bannerSubtitle}>Tham gia bảo hiểm bổ sung để được hưởng quyền lợi cao hơn</Text>
            <TouchableOpacity 
              style={styles.bannerButton}
              onPress={() => handleQuickAction('additional-insurance')}
            >
              <Text style={styles.bannerButtonText}>Khám phá ngay</Text>
              <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits Information */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin quyền lợi</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => handleQuickAction('benefits')}
            >
              <Text style={styles.seeAllText}>Xem chi tiết</Text>
              <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
            </TouchableOpacity>
          </View>

          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medical-outline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.benefitTitle}>Đúng tuyến</Text>
              <Text style={styles.benefitPercentage}>100%</Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medical-outline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.benefitTitle}>Trái tuyến</Text>
              <Text style={styles.benefitPercentage}>40 - 100%</Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medkit-outline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.benefitTitle}>Thuốc và Vật tư</Text>
              <Text style={styles.benefitPercentage}>80 - 100%</Text>
            </View>
          </View>
        </View>

        {/* Guide Section */}
        <View ref={guideSectionRef} style={styles.guideSection}>
          <Text style={styles.sectionTitle}>Hướng dẫn & Tiện ích</Text>
          
          <TouchableOpacity 
            style={styles.guideItem}
            onPress={() => handleQuickAction('guide-usage')}
          >
            <View style={styles.guideIcon}>
              <Ionicons name="card-outline" size={24} color="#00BCD4" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Hướng dẫn sử dụng thẻ BHYT</Text>
              <Text style={styles.guideSubtitle}>Quy trình thăm khám bệnh và thanh toán BHYT</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guideItem}
            onPress={() => handleQuickAction('cost-estimate')}
          >
            <View style={styles.guideIcon}>
              <Ionicons name="calculator-outline" size={24} color="#00BCD4" />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Ước tính chi phí khám chữa bệnh</Text>
              <Text style={styles.guideSubtitle}>Dự tính chi phí và mức hưởng BHYT</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guideItem}
            onPress={() => router.push('/support-center')}
          >
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
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Insurance Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {insuranceInfo ? 'Cập nhật thông tin BHYT' : 'Thêm thẻ bảo hiểm y tế'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ và tên</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mã số BHYT</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.code}
                  onChangeText={(text) => setFormData({...formData, code: text})}
                  placeholder="Ví dụ: DN 4 01 01 123 456 7890"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày hiệu lực</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.startDate}
                  onChangeText={(text) => setFormData({...formData, startDate: text})}
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày hết hạn</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.endDate}
                  onChangeText={(text) => setFormData({...formData, endDate: text})}
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trạng thái</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.statusButton,
                      formData.status === 'Đang hiệu lực' && styles.statusButtonActive
                    ]}
                    onPress={() => setFormData({...formData, status: 'Đang hiệu lực'})}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      formData.status === 'Đang hiệu lực' && styles.statusButtonTextActive
                    ]}>Đang hiệu lực</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.statusButton,
                      formData.status === 'Hết hạn' && styles.statusButtonActive
                    ]}
                    onPress={() => setFormData({...formData, status: 'Hết hạn'})}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      formData.status === 'Hết hạn' && styles.statusButtonTextActive
                    ]}>Hết hạn</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveInsurance}
              >
                <Text style={styles.saveButtonText}>Lưu thông tin</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderWidth: 2,
    borderColor: '#00BCD4',
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
    padding: 12,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  benefitPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00BCD4',
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
  detailSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  detailContent: {
    gap: 12,
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  benefitDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitDetailText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
  },
  qrCodeText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  insurancePackage: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  packageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  registerButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  guideStepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 6,
  },
  guideStepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#E0F7FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#00695C',
    lineHeight: 18,
  },
  costItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  costDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00BCD4',
  },
  costInsurance: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#00BCD4',
  },
  saveButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  emptyStateContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});