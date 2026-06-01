import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Danh sách thuốc đầy đủ
const allMedicines = [
  // Thuốc giảm đau, hạ sốt (OTC)
  { id: 1, name: 'Paracetamol 500mg', category: 'pain-relief', type: 'OTC', price: '15.000đ - 30.000đ', usage: 'Giảm đau, hạ sốt. Uống 1-2 viên/lần, 3-4 lần/ngày' },
  { id: 2, name: 'Ibuprofen 400mg', category: 'pain-relief', type: 'OTC', price: '25.000đ - 45.000đ', usage: 'Giảm đau, hạ sốt, chống viêm. Uống 1 viên/lần, 3 lần/ngày' },
  { id: 3, name: 'Aspirin 100mg', category: 'pain-relief', type: 'OTC', price: '20.000đ - 35.000đ', usage: 'Giảm đau, chống viêm. Uống 1-2 viên/lần' },
  
  // Thuốc kháng sinh (Prescription)
  { id: 4, name: 'Amoxicillin 500mg', category: 'antibiotics', type: 'Prescription', price: '50.000đ - 80.000đ', usage: 'Kháng sinh điều trị nhiễm khuẩn. Theo chỉ định bác sĩ' },
  { id: 5, name: 'Cephalexin 500mg', category: 'antibiotics', type: 'Prescription', price: '60.000đ - 100.000đ', usage: 'Kháng sinh điều trị nhiễm khuẩn. Theo chỉ định bác sĩ' },
  { id: 6, name: 'Azithromycin 250mg', category: 'antibiotics', type: 'Prescription', price: '70.000đ - 120.000đ', usage: 'Kháng sinh điều trị nhiễm khuẩn đường hô hấp. Theo chỉ định bác sĩ' },
  
  // Thuốc tim mạch (Prescription)
  { id: 7, name: 'Atorvastatin 20mg', category: 'cardiovascular', type: 'Prescription', price: '80.000đ - 150.000đ', usage: 'Giảm cholesterol. Uống 1 viên/ngày vào buổi tối' },
  { id: 8, name: 'Amlodipine 5mg', category: 'cardiovascular', type: 'Prescription', price: '50.000đ - 90.000đ', usage: 'Hạ huyết áp. Uống 1 viên/ngày' },
  { id: 9, name: 'Losartan 50mg', category: 'cardiovascular', type: 'Prescription', price: '60.000đ - 110.000đ', usage: 'Hạ huyết áp. Uống 1 viên/ngày' },
  
  // Vitamin & TPCN (OTC)
  { id: 10, name: 'Vitamin C 1000mg', category: 'vitamins', type: 'OTC', price: '100.000đ - 200.000đ', usage: 'Tăng cường sức đề kháng. Uống 1 viên/ngày' },
  { id: 11, name: 'Vitamin D3 + K2', category: 'vitamins', type: 'OTC', price: '150.000đ - 300.000đ', usage: 'Bổ sung canxi, tốt cho xương. Uống 1 viên/ngày' },
  { id: 12, name: 'Omega-3 Fish Oil', category: 'vitamins', type: 'OTC', price: '200.000đ - 400.000đ', usage: 'Tốt cho tim mạch, não bộ. Uống 1-2 viên/ngày' },
  { id: 13, name: 'Vitamin B Complex', category: 'vitamins', type: 'OTC', price: '80.000đ - 150.000đ', usage: 'Bổ sung vitamin B tổng hợp. Uống 1 viên/ngày' },
];

export default function PharmacyScreen() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState('');

  // Lọc thuốc theo search text
  const filteredMedicines = React.useMemo(() => {
    if (!searchText.trim()) return allMedicines;
    
    const searchLower = searchText.toLowerCase().trim();
    return allMedicines.filter(medicine => 
      medicine.name.toLowerCase().includes(searchLower) ||
      medicine.usage.toLowerCase().includes(searchLower)
    );
  }, [searchText]);

  const mainFeatures = [
    {
      id: 1,
      icon: 'medical',
      title: 'Tra cứu thuốc',
      description: 'Tra cứu thông tin thuốc, giá cả và công dụng',
      color: '#00BCD4',
      action: 'view-medicines'
    },
    {
      id: 2,
      icon: 'document-text',
      title: 'Đơn thuốc của tôi',
      description: 'Xem đơn thuốc do bác sĩ kê sau khám bệnh',
      color: '#4CAF50',
      action: 'view-prescriptions'
    },
    {
      id: 3,
      icon: 'call',
      title: 'Liên hệ nhà thuốc',
      description: 'Hỗ trợ tư vấn và mua thuốc theo đơn',
      color: '#FF9800',
      action: 'order-support'
    },
  ];

  const handleFeaturePress = (action: string) => {
    if (action === 'order-support') {
      router.push('/support-center');
    } else {
      setSelectedFeature(action);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhà thuốc</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Nhà thuốc Bệnh viện{'\n'}Đại học Trà Vinh</Text>
            <Text style={styles.bannerSubtitle}>
              Hỗ trợ tra cứu thông tin thuốc và tư vấn dược lý
            </Text>
          </View>
          <Image
            source={require('@/assets/images/nhathuoc.png')}
            style={styles.bannerImage}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm thuốc..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Search Results */}
          {searchText.trim() && (
            <View style={styles.searchResults}>
              {filteredMedicines.length > 0 ? (
                <>
                  <View style={styles.searchResultsHeader}>
                    <View style={styles.searchResultsHeaderLeft}>
                      <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                      <Text style={styles.searchResultsTitle}>
                        {filteredMedicines.length} kết quả
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false}>
                    {filteredMedicines.map((medicine, index) => (
                      <View 
                        key={medicine.id} 
                        style={[
                          styles.searchResultItem,
                          index === filteredMedicines.length - 1 && styles.searchResultItemLast
                        ]}
                      >
                        <View style={styles.searchResultIconContainer}>
                          <View style={[
                            styles.searchResultIcon,
                            { backgroundColor: medicine.type === 'Prescription' ? '#FFF3E0' : '#E0F7FA' }
                          ]}>
                            <Ionicons 
                              name="medical" 
                              size={24} 
                              color={medicine.type === 'Prescription' ? '#FF9800' : '#00BCD4'} 
                            />
                          </View>
                        </View>
                        
                        <View style={styles.searchResultContent}>
                          <View style={styles.searchResultTop}>
                            <Text style={styles.searchResultName} numberOfLines={1}>
                              {medicine.name}
                            </Text>
                            {medicine.type === 'Prescription' ? (
                              <View style={styles.searchPrescriptionBadge}>
                                <Ionicons name="warning" size={12} color="#E65100" />
                                <Text style={styles.searchPrescriptionBadgeText}>Cần đơn</Text>
                              </View>
                            ) : (
                              <View style={styles.otcBadge}>
                                <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                                <Text style={styles.otcBadgeText}>OTC</Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.searchResultMiddle}>
                            <View style={styles.priceTag}>
                              <Ionicons name="pricetag" size={14} color="#00BCD4" />
                              <Text style={styles.searchResultPrice}>{medicine.price}</Text>
                            </View>
                          </View>
                          
                          <Text style={styles.searchResultUsage} numberOfLines={2}>
                            {medicine.usage}
                          </Text>
                          
                          <TouchableOpacity 
                            style={styles.viewDetailButton}
                            onPress={() => {
                              setSearchText('');
                              setSelectedFeature('view-medicines');
                              setSelectedCategory(medicine.category);
                            }}
                          >
                            <Text style={styles.viewDetailButtonText}>Xem chi tiết</Text>
                            <Ionicons name="arrow-forward" size={14} color="#00BCD4" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <View style={styles.searchEmptyState}>
                  <View style={styles.searchEmptyIcon}>
                    <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                  </View>
                  <Text style={styles.searchEmptyText}>Không tìm thấy thuốc</Text>
                  <Text style={styles.searchEmptySubtext}>
                    Không tìm thấy "{searchText}"{'\n'}
                    Thử tìm kiếm với từ khóa khác
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearSearchButton}
                    onPress={() => setSearchText('')}
                  >
                    <Text style={styles.clearSearchButtonText}>Xóa tìm kiếm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Main Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Dịch vụ nhà thuốc</Text>
          
          {mainFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => handleFeaturePress(feature.action)}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={32} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Detail Sections */}
        {selectedFeature === 'view-medicines' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Danh mục thuốc</Text>
              <TouchableOpacity onPress={() => setSelectedFeature(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailDescription}>
                Các loại thuốc phổ biến tại nhà thuốc:
              </Text>
              
              <TouchableOpacity 
                style={styles.medicineCategory}
                onPress={() => setSelectedCategory('pain-relief')}
              >
                <View style={styles.medicineCategoryIcon}>
                  <Ionicons name="medical" size={24} color="#00BCD4" />
                </View>
                <View style={styles.medicineCategoryContent}>
                  <Text style={styles.medicineCategoryTitle}>Thuốc giảm đau, hạ sốt</Text>
                  <Text style={styles.medicineCategoryDesc}>Paracetamol, Ibuprofen, Aspirin...</Text>
                  <View style={styles.medicineTypeBadge}>
                    <Text style={styles.medicineTypeBadgeText}>✅ OTC - Không cần đơn</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.medicineCategory}
                onPress={() => setSelectedCategory('antibiotics')}
              >
                <View style={styles.medicineCategoryIcon}>
                  <Ionicons name="fitness" size={24} color="#4CAF50" />
                </View>
                <View style={styles.medicineCategoryContent}>
                  <Text style={styles.medicineCategoryTitle}>Thuốc kháng sinh</Text>
                  <Text style={styles.medicineCategoryDesc}>Amoxicillin, Cephalexin...</Text>
                  <View style={[styles.medicineTypeBadge, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={[styles.medicineTypeBadgeText, { color: '#E65100' }]}>⚠️ Prescription - Cần đơn bác sĩ</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.medicineCategory}
                onPress={() => setSelectedCategory('cardiovascular')}
              >
                <View style={styles.medicineCategoryIcon}>
                  <Ionicons name="heart" size={24} color="#E91E63" />
                </View>
                <View style={styles.medicineCategoryContent}>
                  <Text style={styles.medicineCategoryTitle}>Thuốc tim mạch</Text>
                  <Text style={styles.medicineCategoryDesc}>Thuốc huyết áp, cholesterol...</Text>
                  <View style={[styles.medicineTypeBadge, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={[styles.medicineTypeBadgeText, { color: '#E65100' }]}>⚠️ Prescription - Cần đơn bác sĩ</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.medicineCategory}
                onPress={() => setSelectedCategory('vitamins')}
              >
                <View style={styles.medicineCategoryIcon}>
                  <Ionicons name="nutrition" size={24} color="#FF9800" />
                </View>
                <View style={styles.medicineCategoryContent}>
                  <Text style={styles.medicineCategoryTitle}>Vitamin & Thực phẩm chức năng</Text>
                  <Text style={styles.medicineCategoryDesc}>Vitamin C, D, Canxi, Omega-3...</Text>
                  <View style={styles.medicineTypeBadge}>
                    <Text style={styles.medicineTypeBadgeText}>✅ OTC - Không cần đơn</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              {selectedCategory && (
                <View style={styles.categoryDetail}>
                  <View style={styles.categoryDetailHeader}>
                    <Text style={styles.categoryDetailTitle}>
                      {selectedCategory === 'pain-relief' && 'Thuốc giảm đau, hạ sốt'}
                      {selectedCategory === 'antibiotics' && 'Thuốc kháng sinh'}
                      {selectedCategory === 'cardiovascular' && 'Thuốc tim mạch'}
                      {selectedCategory === 'vitamins' && 'Vitamin & Thực phẩm chức năng'}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {selectedCategory === 'pain-relief' && (
                    <>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Paracetamol 500mg</Text>
                        <Text style={styles.medicinePrice}>15.000đ - 30.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Giảm đau, hạ sốt. Uống 1-2 viên/lần, 3-4 lần/ngày</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Ibuprofen 400mg</Text>
                        <Text style={styles.medicinePrice}>25.000đ - 45.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Giảm đau, hạ sốt, chống viêm. Uống 1 viên/lần, 3 lần/ngày</Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === 'antibiotics' && (
                    <>
                      <View style={styles.warningBox}>
                        <Ionicons name="warning" size={20} color="#FF9800" />
                        <Text style={styles.warningText}>Cần có đơn thuốc của bác sĩ</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Amoxicillin 500mg</Text>
                        <Text style={styles.medicinePrice}>50.000đ - 80.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Kháng sinh điều trị nhiễm khuẩn. Theo chỉ định bác sĩ</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Cephalexin 500mg</Text>
                        <Text style={styles.medicinePrice}>60.000đ - 100.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Kháng sinh điều trị nhiễm khuẩn. Theo chỉ định bác sĩ</Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === 'cardiovascular' && (
                    <>
                      <View style={styles.warningBox}>
                        <Ionicons name="warning" size={20} color="#FF9800" />
                        <Text style={styles.warningText}>Cần có đơn thuốc của bác sĩ</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Atorvastatin 20mg</Text>
                        <Text style={styles.medicinePrice}>80.000đ - 150.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Giảm cholesterol. Uống 1 viên/ngày vào buổi tối</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Amlodipine 5mg</Text>
                        <Text style={styles.medicinePrice}>50.000đ - 90.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Hạ huyết áp. Uống 1 viên/ngày</Text>
                      </View>
                    </>
                  )}

                  {selectedCategory === 'vitamins' && (
                    <>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Vitamin C 1000mg</Text>
                        <Text style={styles.medicinePrice}>100.000đ - 200.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Tăng cường sức đề kháng. Uống 1 viên/ngày</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Vitamin D3 + K2</Text>
                        <Text style={styles.medicinePrice}>150.000đ - 300.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Bổ sung canxi, tốt cho xương. Uống 1 viên/ngày</Text>
                      </View>
                      <View style={styles.medicineDetailItem}>
                        <Text style={styles.medicineName}>Omega-3 Fish Oil</Text>
                        <Text style={styles.medicinePrice}>200.000đ - 400.000đ/hộp</Text>
                        <Text style={styles.medicineUsage}>Tốt cho tim mạch, não bộ. Uống 1-2 viên/ngày</Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Medical Warning */}
              <View style={styles.medicalWarningBox}>
                <Ionicons name="medical" size={24} color="#E91E63" />
                <View style={styles.medicalWarningContent}>
                  <Text style={styles.medicalWarningTitle}>⚠️ Lưu ý y tế quan trọng</Text>
                  <Text style={styles.medicalWarningText}>
                    • Không tự ý sử dụng kháng sinh khi chưa có chỉ định bác sĩ{'\n'}
                    • Đọc kỹ hướng dẫn sử dụng trước khi dùng thuốc{'\n'}
                    • Tham khảo ý kiến dược sĩ nếu có thắc mắc
                  </Text>
                </View>
              </View>

              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={20} color="#00BCD4" />
                <Text style={styles.noteBoxText}>
                  Thông tin thuốc chỉ mang tính chất tham khảo. Vui lòng liên hệ nhà thuốc để biết thêm chi tiết.
                </Text>
              </View>
            </View>
          </View>
        )}

        {selectedFeature === 'view-prescriptions' && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Đơn thuốc của bạn</Text>
              <TouchableOpacity onPress={() => setSelectedFeature(null)}>
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailDescription}>
                Quản lý đơn thuốc từ các lần khám bệnh:
              </Text>
              
              <View style={styles.prescriptionCard}>
                <View style={styles.prescriptionHeader}>
                  <View>
                    <Text style={styles.prescriptionDate}>15/05/2024</Text>
                    <Text style={styles.prescriptionDoctor}>BS. Nguyễn Văn An - Tim mạch</Text>
                  </View>
                  <View style={styles.prescriptionBadge}>
                    <Text style={styles.prescriptionBadgeText}>Đã mua</Text>
                  </View>
                </View>
                <View style={styles.prescriptionMedicines}>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#00BCD4" />
                    <Text style={styles.medicineItemText}>Aspirin 100mg - 1 viên/ngày</Text>
                  </View>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#00BCD4" />
                    <Text style={styles.medicineItemText}>Atorvastatin 20mg - 1 viên/ngày</Text>
                  </View>
                </View>
              </View>

              <View style={styles.prescriptionCard}>
                <View style={styles.prescriptionHeader}>
                  <View>
                    <Text style={styles.prescriptionDate}>10/05/2024</Text>
                    <Text style={styles.prescriptionDoctor}>BS. Trần Thị Lan - Nội tổng quát</Text>
                  </View>
                  <View style={[styles.prescriptionBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.prescriptionBadgeText}>Chưa mua</Text>
                  </View>
                </View>
                <View style={styles.prescriptionMedicines}>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#00BCD4" />
                    <Text style={styles.medicineItemText}>Amoxicillin 500mg - 3 lần/ngày</Text>
                  </View>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#00BCD4" />
                    <Text style={styles.medicineItemText}>Paracetamol 500mg - Khi sốt</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.buyButton}
                  onPress={() => router.push('/support-center')}
                >
                  <Ionicons name="call-outline" size={18} color="#fff" />
                  <Text style={styles.buyButtonText}>Yêu cầu hỗ trợ mua thuốc</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={20} color="#00BCD4" />
                <Text style={styles.noteBoxText}>
                  Đơn thuốc được lưu tự động sau mỗi lần khám bệnh tại bệnh viện.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#00BCD4" />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Địa chỉ</Text>
                <Text style={styles.contactText}>
                  Bệnh viện Trường Đại học Trà Vinh{'\n'}
                  126 Nguyễn Thiện Thành, Khóm 4, Phường 5, Trà Vinh
                </Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#00BCD4" />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Hotline</Text>
                <Text style={styles.contactText}>0908 971 115</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="time" size={20} color="#00BCD4" />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Giờ làm việc</Text>
                <Text style={styles.contactText}>
                  Thứ 2 - Thứ 6: 7:00 - 17:00{'\n'}
                  Thứ 7: 7:00 - 12:00{'\n'}
                  Chủ nhật: Nghỉ
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Lưu ý quan trọng</Text>
          
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={24} color="#00BCD4" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Thuốc kê đơn</Text>
              <Text style={styles.noteText}>
                Cần có đơn thuốc của bác sĩ để mua các loại thuốc kê đơn
              </Text>
            </View>
          </View>

          <View style={styles.noteCard}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Thuốc chính hãng</Text>
              <Text style={styles.noteText}>
                Tất cả thuốc đều có nguồn gốc rõ ràng, được kiểm định chất lượng
              </Text>
            </View>
          </View>

          <View style={styles.noteCard}>
            <Ionicons name="people" size={24} color="#FF9800" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Tư vấn miễn phí</Text>
              <Text style={styles.noteText}>
                Dược sĩ luôn sẵn sàng tư vấn về cách sử dụng thuốc an toàn
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  banner: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00695C',
    marginBottom: 8,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#00897B',
    lineHeight: 18,
  },
  bannerImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  featuresSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  contactSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  notesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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
    fontSize: 18,
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
  medicineCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  medicineCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineCategoryContent: {
    flex: 1,
  },
  medicineCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  medicineCategoryDesc: {
    fontSize: 12,
    color: '#666',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#E0F7FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#00695C',
    lineHeight: 18,
  },
  prescriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  prescriptionDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  prescriptionDoctor: {
    fontSize: 13,
    color: '#666',
  },
  prescriptionBadge: {
    backgroundColor: '#999',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prescriptionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  prescriptionMedicines: {
    gap: 8,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medicineItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  medicineTypeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  medicineTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  medicalWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  medicalWarningContent: {
    flex: 1,
  },
  medicalWarningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },
  medicalWarningText: {
    fontSize: 13,
    color: '#B71C1C',
    lineHeight: 20,
  },
  categoryDetail: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B2EBF2',
  },
  categoryDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00695C',
  },
  medicineDetailItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
    marginBottom: 6,
  },
  medicineUsage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchResultsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  searchResultsList: {
    maxHeight: 450,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
    backgroundColor: '#fff',
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultIconContainer: {
    paddingTop: 4,
  },
  searchResultIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    lineHeight: 20,
  },
  searchPrescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  searchPrescriptionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E65100',
  },
  otcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  otcBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  searchResultMiddle: {
    marginBottom: 8,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchResultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BCD4',
  },
  searchResultUsage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  viewDetailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  searchEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  searchEmptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchEmptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  searchEmptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearSearchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE4EC',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  locationBannerContent: {
    flex: 1,
  },
  locationBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2185B',
    marginBottom: 4,
  },
  locationBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#880E4F',
  },
  pharmacyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pharmacyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyHeaderContent: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  pharmacyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pharmacyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pharmacyRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB300',
  },
  pharmacyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pharmacyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pharmacyStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pharmacyInfo: {
    gap: 10,
    marginBottom: 16,
  },
  pharmacyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pharmacyDistance: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E91E63',
  },
  pharmacyInfoSeparator: {
    fontSize: 14,
    color: '#ccc',
  },
  pharmacyAddress: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  pharmacyPhone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  pharmacyHours: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pharmacyActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingVertical: 12,
    borderRadius: 10,
  },
  pharmacyActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  pharmacyActionButtonSecondary: {
    backgroundColor: '#E0F7FA',
  },
  pharmacyActionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BCD4',
  },
  pharmacySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pharmacySearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  pharmacyEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  pharmacyEmptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pharmacyEmptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  pharmacyEmptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
});
