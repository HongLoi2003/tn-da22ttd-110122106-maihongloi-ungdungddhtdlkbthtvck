import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { recognizeMedicineFromImage } from './services/medicineRecognitionService';

// Import full medicines database
const medicinesDatabaseData = require('../medicines-database.json');
const medicinesDatabase = medicinesDatabaseData.medicines || [];

// Function to check if image is a real image or UI Avatars placeholder
const isRealImage = (imageUrl: string): boolean => {
  if (!imageUrl) return false;
  // UI Avatars URLs start with https://ui-avatars.com
  return !imageUrl.includes('ui-avatars.com');
};

// Function to search medicines in database
const searchMedicines = (query: string) => {
  const searchTerm = query.toLowerCase().trim();
  return medicinesDatabase.filter((medicine: any) => 
    medicine.name.toLowerCase().includes(searchTerm) ||
    medicine.category.toLowerCase().includes(searchTerm) ||
    medicine.activeIngredient?.toLowerCase().includes(searchTerm)
  );
};

// Danh sách thuốc phổ biến để tra cứu
const featuredMedicines = [
  { 
    id: 1, 
    name: 'Paracetamol', 
    description: 'Giảm đau - Hạ sốt',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    category: 'Giảm đau, hạ sốt',
    type: 'OTC'
  },
  { 
    id: 2, 
    name: 'Ibuprofen', 
    description: 'Giảm đau - Chống viêm',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    category: 'Giảm đau, chống viêm',
    type: 'OTC'
  },
  { 
    id: 3, 
    name: 'Amoxicillin', 
    description: 'Kháng sinh',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    category: 'Kháng sinh',
    type: 'Prescription'
  },
  { 
    id: 4, 
    name: 'Vitamin C', 
    description: 'Bổ sung vitamin',
    image: 'https://plus.unsplash.com/premium_photo-1690534069029-fe07fb0c3b60?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Vml0YW1pbiUyMEN8ZW58MHx8MHx8fDA%3D',
    category: 'Vitamin & Khoáng chất',
    type: 'OTC'
  },
  { 
    id: 5, 
    name: 'Omeprazole', 
    description: 'Điều trị dạ dày',
    image: 'https://media.istockphoto.com/id/2267385544/fr/photo/vue-en-angle-%C3%A9lev%C3%A9-de-capsules-pharmaceutiques-roses-et-bleues.webp?a=1&b=1&s=612x612&w=0&k=20&c=ftRDsZpfA3yWms-1PEmVIR7cTOtVWAzQRy0OaDgj-Mc=',
    category: 'Tiêu hóa',
    type: 'Prescription'
  },
];

export default function PharmacyScreen() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [scanningImage, setScanningImage] = React.useState<string | null>(null);
  const [scanResult, setScanResult] = React.useState<any>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text);
    
    if (text.trim().length === 0) {
      setSearchResults([]);
      setSelectedFeature(null);
      return;
    }
    
    if (text.trim().length < 2) {
      return; // Wait for at least 2 characters
    }
    
    setIsSearching(true);
    
    // Search in database
    try {
      const results = searchMedicines(text);
      setSearchResults(results.slice(0, 20)); // Limit to 20 results
      if (results.length > 0) {
        setSelectedFeature('search');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Categories
  const categories = [
    { id: 'prescription', icon: '💊', name: 'Thuốc kê đơn', color: '#4A90E2' },
    { id: 'otc', icon: '🏥', name: 'Thuốc không\nkê đơn', color: '#50C878' },
    { id: 'supplements', icon: '💪', name: 'Thực phẩm\nchức năng', color: '#FFB84D' },
    { id: 'vitamins', icon: '🍊', name: 'Vitamin và\nKhoáng chất', color: '#FF6B6B' },
    { id: 'beauty', icon: '💄', name: 'Chăm sóc\ncá nhân', color: '#9B59B6' },
  ];

  // Handle camera scan
  const handleCameraScan = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setScanningImage(imageUri);
      setSelectedFeature('scan-result');
      simulateScan(imageUri);
    }
  };

  // Handle pick image
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setScanningImage(imageUri);
      setSelectedFeature('scan-result');
      simulateScan(imageUri);
    }
  };

  // Simulate AI scanning
  const simulateScan = async (imageUri: string) => {
    console.log('simulateScan called with imageUri:', imageUri);
    setIsScanning(true);
    setScanResult(null);
    
    try {
      // Use AI recognition service
      console.log('Calling recognizeMedicineFromImage...');
      const result = await recognizeMedicineFromImage(imageUri);
      console.log('Recognition result:', result);
      
      if (result) {
        console.log('Setting scan result:', result.name);
        setScanResult(result);
      } else {
        console.log('No result returned');
        Alert.alert('Thông báo', 'Không thể nhận diện thuốc từ ảnh. Vui lòng thử lại với ảnh rõ hơn.');
      }
    } catch (error) {
      console.error('Error scanning medicine:', error);
      Alert.alert('Lỗi', 'Không thể nhận diện thuốc. Vui lòng thử lại.');
    } finally {
      console.log('Scan complete, setting isScanning to false');
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View>
            <Text style={styles.headerTitle}>Nhà Thuốc</Text>
            <Text style={styles.headerSubtitle}>Bệnh viện Trà Vinh</Text>
          </View>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm thuốc, TPCN, bệnh lý..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={handleSearch}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity>
              <Ionicons name="qr-code-outline" size={24} color="#50C878" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        {selectedFeature === 'search' && searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsTitle}>
                Tìm thấy {searchResults.length} kết quả
              </Text>
              <TouchableOpacity onPress={() => {
                setSearchText('');
                setSearchResults([]);
                setSelectedFeature(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchResultsList}>
              {searchResults.map((item) => (
                <TouchableOpacity 
                  key={item.id.toString()}
                  style={styles.medicineResultCard}
                  onPress={() => {
                    setScanResult(item);
                    setSelectedFeature('medicine-detail');
                  }}
                >
                  {/* Show real image if available, otherwise show placeholder */}
                  {isRealImage(item.imageUrl) ? (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.medicineResultImage}
                    />
                  ) : (
                    <View style={[styles.medicineResultImage, styles.medicineResultImagePlaceholder]}>
                      <Text style={styles.medicineResultImagePlaceholderText}>
                        {item.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.medicineResultInfo}>
                    <Text style={styles.medicineResultName}>{item.name}</Text>
                    <Text style={styles.medicineResultCategory}>{item.category}</Text>
                    <View style={styles.medicineResultFooter}>
                      {item.type === 'Prescription' ? (
                        <View style={styles.prescriptionBadge}>
                          <Text style={styles.prescriptionBadgeText}>Kê đơn</Text>
                        </View>
                      ) : (
                        <View style={styles.otcBadge}>
                          <Text style={styles.otcBadgeText}>OTC</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Show default content only when not searching */}
        {selectedFeature !== 'search' && (
          <>
            {/* Banner */}
            <View style={styles.bannerContainer}>
              <View style={styles.banner}>
                <Image 
                  style={styles.bannerBackgroundImage}
                />
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>Tra cứu và nhận diện ảnh thuốc thông minh</Text>
                  <Text style={styles.bannerSubtitle}>Nhanh chóng - Chính xác - Tiện lợi</Text>
                </View>
              </View>
            </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSelectedFeature('search')}
          >
            <Ionicons name="search" size={28} color="#50C878" />
            <Text style={styles.actionButtonText}>Tìm kiếm{'\n'}thuốc</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleCameraScan}
          >
            <Ionicons name="camera" size={32} color="#fff" />
            <Text style={styles.actionButtonTextWhite}>Nhận diện thuốc{'\n'}bằng hình ảnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSelectedFeature('prescriptions')}
          >
            <Ionicons name="document-text" size={28} color="#50C878" />
            <Text style={styles.actionButtonText}>Đơn thuốc{'\n'}của tôi</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục thuốc</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thuốc phổ biến</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setSelectedFeature('all-medicines')}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <Ionicons name="arrow-forward" size={16} color="#50C878" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsGrid}>
            {featuredMedicines.map((medicine) => (
              <TouchableOpacity 
                key={medicine.id} 
                style={styles.productCard}
                onPress={() => {
                  // Find medicine in database
                  const foundMedicine = medicinesDatabase.find((m: any) => 
                    m.name.toLowerCase().includes(medicine.name.toLowerCase())
                  );
                  if (foundMedicine) {
                    setScanResult(foundMedicine);
                    setSelectedFeature('medicine-detail');
                  }
                }}
              >
                {/* Show real image if available, otherwise show placeholder with text */}
                {isRealImage(medicine.image) ? (
                  <Image source={{ uri: medicine.image }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.productImagePlaceholder]}>
                    <Text style={styles.productImagePlaceholderText}>
                      {medicine.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{medicine.name}</Text>
                  <Text style={styles.productDescription}>{medicine.description}</Text>
                  <View style={styles.productFooter}>
                    {medicine.type === 'Prescription' ? (
                      <View style={styles.prescriptionTag}>
                        <Ionicons name="warning" size={12} color="#E65100" />
                        <Text style={styles.prescriptionTagText}>Kê đơn</Text>
                      </View>
                    ) : (
                      <View style={styles.otcTag}>
                        <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                        <Text style={styles.otcTagText}>OTC</Text>
                      </View>
                    )}
                    <Ionicons name="information-circle" size={24} color="#50C878" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Info */}
        {/* Removed delivery card */}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* Medicine Detail Modal */}
      {selectedFeature === 'medicine-detail' && scanResult && (
        <View style={styles.modalOverlay}>
          <View style={styles.scanModal}>
            <View style={styles.scanModalHeader}>
              <Text style={styles.scanModalTitle}>Thông tin thuốc</Text>
              <TouchableOpacity onPress={() => {
                setSelectedFeature(null);
                setScanResult(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Ảnh thuốc lớn ở đầu trang - luôn hiển thị */}
              <View style={styles.medicineDetailImageContainer}>
                {scanResult.imageUrl && isRealImage(scanResult.imageUrl) ? (
                  <Image 
                    source={{ uri: scanResult.imageUrl }} 
                    style={styles.medicineDetailImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.medicineDetailImage, styles.medicineDetailImagePlaceholder]}>
                    <Text style={styles.medicineDetailImagePlaceholderText}>
                      {scanResult.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.resultSection}>
                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    {/* Hiển thị ảnh thuốc từ database */}
                    {scanResult.imageUrl && isRealImage(scanResult.imageUrl) ? (
                      <Image 
                        source={{ uri: scanResult.imageUrl }} 
                        style={styles.resultMedicineImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.resultMedicineImage, styles.resultMedicineImagePlaceholder]}>
                        <Text style={styles.resultMedicineImagePlaceholderText}>
                          {scanResult.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultMedicineName}>{scanResult.name}</Text>
                      <Text style={styles.resultMedicineDesc}>{scanResult.category}</Text>
                      {scanResult.type === 'Prescription' ? (
                        <View style={styles.prescriptionTag}>
                          <Ionicons name="warning" size={12} color="#E65100" />
                          <Text style={styles.prescriptionTagText}>Cần đơn bác sĩ</Text>
                        </View>
                      ) : (
                        <View style={styles.otcTag}>
                          <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                          <Text style={styles.otcTagText}>Không cần đơn</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.usageSection}>
                  <Text style={styles.usageTitle}>Thành phần và Hàm lượng</Text>
                  <Text style={styles.usageText}>{scanResult.activeIngredient}</Text>
                </View>

                <View style={styles.usageSection}>
                  <Text style={styles.usageTitle}>Công dụng</Text>
                  <Text style={styles.usageText}>{scanResult.indication || scanResult.usage}</Text>
                </View>

                <View style={styles.usageSection}>
                  <Text style={styles.usageTitle}>Liều dùng</Text>
                  <Text style={styles.usageText}>{scanResult.dosage}</Text>
                </View>

                <View style={styles.usageSection}>
                  <Text style={styles.usageTitle}>Dạng bào chế và Quy cách đóng gói</Text>
                  <Text style={styles.usageText}>{scanResult.packaging} - {scanResult.packSize}</Text>
                </View>

                {scanResult.contraindication && (
                  <View style={styles.warningSection}>
                    <Ionicons name="alert-circle" size={20} color="#FF9800" />
                    <View style={styles.warningContent}>
                      <Text style={styles.warningTitle}>Chống chỉ định</Text>
                      <Text style={styles.warningText}>{scanResult.contraindication}</Text>
                    </View>
                  </View>
                )}

                {scanResult.sideEffects && (
                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Tác dụng phụ</Text>
                    <Text style={styles.usageText}>{scanResult.sideEffects}</Text>
                  </View>
                )}

                {scanResult.warnings && (
                  <View style={styles.warningSection}>
                    <Ionicons name="warning" size={20} color="#FF5722" />
                    <View style={styles.warningContent}>
                      <Text style={styles.warningTitle}>Hướng dẫn sử dụng và Cảnh báo</Text>
                      <Text style={styles.warningText}>{scanResult.warnings}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.usageSection}>
                  <Text style={styles.usageTitle}>Thông tin hạn dùng và Bảo quản</Text>
                  <Text style={styles.usageText}>• Hạn dùng: {scanResult.expiryInfo}</Text>
                  <Text style={styles.usageText}>• Bảo quản: {scanResult.storage}</Text>
                </View>

                {scanResult.manufacturer && (
                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Đơn vị sản xuất</Text>
                    <Text style={styles.usageText}>• {scanResult.manufacturer.name}</Text>
                    <Text style={styles.usageText}>• Địa chỉ: {scanResult.manufacturer.address}</Text>
                    <Text style={styles.usageText}>• Hotline: {scanResult.manufacturer.phone}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Scan Result Modal */}
      {selectedFeature === 'scan-result' && (
        <View style={styles.modalOverlay}>
          <View style={styles.scanModal}>
            <View style={styles.scanModalHeader}>
              <Text style={styles.scanModalTitle}>Nhận diện thuốc bằng hình ảnh</Text>
              <TouchableOpacity onPress={() => {
                setSelectedFeature(null);
                setScanningImage(null);
                setScanResult(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {scanningImage && (
                <View style={styles.scanImageContainer}>
                  <Image source={{ uri: scanningImage }} style={styles.scanImage} />
                  <View style={styles.scanOverlay}>
                    <View style={styles.scanFrame} />
                    <TouchableOpacity 
                      style={styles.scanActionButton}
                      onPress={handleCameraScan}
                    >
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={styles.scanActionText}>Chụp lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.scanActionButton, styles.scanActionButtonSecondary]}
                      onPress={handlePickImage}
                    >
                      <Ionicons name="images" size={20} color="#50C878" />
                      <Text style={styles.scanActionTextSecondary}>Chọn ảnh</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.scanHint}>
                Đảm bảo ảnh rõ nét, chụp cả mặt trước của hộp/vỉ thuốc
              </Text>

              {isScanning && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="large" color="#50C878" />
                  <Text style={styles.scanningText}>Đang phân tích hình ảnh...</Text>
                </View>
              )}

              {scanResult && !isScanning && (
                <View style={styles.resultSection}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#50C878" />
                    <Text style={styles.resultTitle}>Kết quả nhận diện</Text>
                  </View>

                  <View style={styles.resultCard}>
                    <View style={styles.resultRow}>
                      {/* Hiển thị ảnh thuốc từ database */}
                      {scanResult.imageUrl && isRealImage(scanResult.imageUrl) ? (
                        <Image 
                          source={{ uri: scanResult.imageUrl }} 
                          style={styles.resultMedicineImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.resultMedicineImage, styles.resultMedicineImagePlaceholder]}>
                          <Text style={styles.resultMedicineImagePlaceholderText}>
                            {scanResult.name.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultMedicineName}>{scanResult.name}</Text>
                        <Text style={styles.resultMedicineDesc}>{scanResult.category}</Text>
                        {scanResult.type === 'Prescription' ? (
                          <View style={styles.prescriptionTag}>
                            <Ionicons name="warning" size={12} color="#E65100" />
                            <Text style={styles.prescriptionTagText}>Cần đơn bác sĩ</Text>
                          </View>
                        ) : (
                          <View style={styles.otcTag}>
                            <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
                            <Text style={styles.otcTagText}>Không cần đơn</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.accuracyBar}>
                      <Text style={styles.accuracyText}>Độ chính xác: {scanResult.accuracy}%</Text>
                      <View style={styles.accuracyProgress}>
                        <View style={[styles.accuracyFill, { width: `${scanResult.accuracy}%` }]} />
                      </View>
                    </View>
                  </View>

                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Thành phần và Hàm lượng</Text>
                    <Text style={styles.usageText}>{scanResult.activeIngredient}</Text>
                  </View>

                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Công dụng</Text>
                    <Text style={styles.usageText}>{scanResult.indication || scanResult.usage}</Text>
                  </View>

                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Liều dùng</Text>
                    <Text style={styles.usageText}>{scanResult.dosage}</Text>
                  </View>

                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Dạng bào chế và Quy cách đóng gói</Text>
                    <Text style={styles.usageText}>{scanResult.packaging} - {scanResult.packSize}</Text>
                  </View>

                  {scanResult.contraindication && (
                    <View style={styles.warningSection}>
                      <Ionicons name="alert-circle" size={20} color="#FF9800" />
                      <View style={styles.warningContent}>
                        <Text style={styles.warningTitle}>Chống chỉ định</Text>
                        <Text style={styles.warningText}>{scanResult.contraindication}</Text>
                      </View>
                    </View>
                  )}

                  {scanResult.sideEffects && (
                    <View style={styles.usageSection}>
                      <Text style={styles.usageTitle}>Tác dụng phụ</Text>
                      <Text style={styles.usageText}>{scanResult.sideEffects}</Text>
                    </View>
                  )}

                  {scanResult.warnings && (
                    <View style={styles.warningSection}>
                      <Ionicons name="warning" size={20} color="#FF5722" />
                      <View style={styles.warningContent}>
                        <Text style={styles.warningTitle}>Hướng dẫn sử dụng và Cảnh báo</Text>
                        <Text style={styles.warningText}>{scanResult.warnings}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Thông tin hạn dùng và Bảo quản</Text>
                    <Text style={styles.usageText}>• Hạn dùng: {scanResult.expiryInfo}</Text>
                    <Text style={styles.usageText}>• Bảo quản: {scanResult.storage}</Text>
                  </View>

                  <View style={styles.usageSection}>
                    <Text style={styles.usageTitle}>Kiểm soát chất lượng</Text>
                    <Text style={styles.usageText}>{scanResult.qualityControl}</Text>
                  </View>

                  {scanResult.manufacturer && (
                    <View style={styles.usageSection}>
                      <Text style={styles.usageTitle}>Đơn vị sản xuất</Text>
                      <Text style={styles.usageText}>• {scanResult.manufacturer.name}</Text>
                      <Text style={styles.usageText}>• Địa chỉ: {scanResult.manufacturer.address}</Text>
                      <Text style={styles.usageText}>• Hotline: {scanResult.manufacturer.phone}</Text>
                    </View>
                  )}


                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* All Medicines View */}
      {selectedFeature === 'all-medicines' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tất cả thuốc</Text>
              <TouchableOpacity onPress={() => setSelectedFeature(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchBoxInModal}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInputInModal}
                placeholder="Tìm kiếm thuốc..."
                value={searchText}
                onChangeText={handleSearch}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearchText('');
                  setSearchResults([]);
                }}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.modalContent}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#50C878" />
                  <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
                </View>
              ) : (
                <View style={styles.allMedicinesGrid}>
                  {(searchText.length > 0 ? searchResults : medicinesDatabase.slice(0, 50)).map((medicine: any, index: number) => (
                    <TouchableOpacity
                      key={medicine.id || index}
                      style={styles.medicineCard}
                      onPress={() => {
                        setScanResult(medicine);
                        setSelectedFeature('medicine-detail');
                      }}
                    >
                      {/* Show real image if available, otherwise show placeholder */}
                      {medicine.imageUrl && isRealImage(medicine.imageUrl) ? (
                        <Image 
                          source={{ uri: medicine.imageUrl }} 
                          style={styles.medicineCardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.medicineCardImage, styles.medicineCardImagePlaceholder]}>
                          <Text style={styles.medicineCardImagePlaceholderText}>
                            {medicine.name.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.medicineCardContent}>
                        <Text style={styles.medicineCardName} numberOfLines={2}>
                          {medicine.name}
                        </Text>
                        <Text style={styles.medicineCardCategory} numberOfLines={1}>
                          {medicine.category}
                        </Text>
                        <View style={styles.medicineCardFooter}>
                          {medicine.requiresPrescription ? (
                            <View style={styles.prescriptionBadge}>
                              <Text style={styles.prescriptionBadgeText}>Kê đơn</Text>
                            </View>
                          ) : (
                            <View style={styles.otcBadge}>
                              <Text style={styles.otcBadgeText}>OTC</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {searchText.length > 0 && searchResults.length === 0 && !isSearching && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={64} color="#ccc" />
                  <Text style={styles.noResultsText}>Không tìm thấy thuốc phù hợp</Text>
                  <Text style={styles.noResultsSubtext}>
                    Vui lòng thử từ khóa khác
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {selectedFeature === 'prescriptions' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đơn thuốc của tôi</Text>
              <TouchableOpacity onPress={() => setSelectedFeature(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.prescriptionCard}>
                <View style={styles.prescriptionHeader}>
                  <View>
                    <Text style={styles.prescriptionDate}>15/05/2024</Text>
                    <Text style={styles.prescriptionDoctor}>BS. Nguyễn Văn An - Tim mạch</Text>
                  </View>
                  <View style={styles.prescriptionBadge}>
                    <Text style={styles.prescriptionBadgeText}>Đã hoàn thành</Text>
                  </View>
                </View>
                <View style={styles.prescriptionMedicines}>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#50C878" />
                    <Text style={styles.medicineItemText}>Aspirin 100mg - 1 viên/ngày</Text>
                  </View>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#50C878" />
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
                  <View style={[styles.prescriptionBadge, { backgroundColor: '#50C878' }]}>
                    <Text style={styles.prescriptionBadgeText}>Đang điều trị</Text>
                  </View>
                </View>
                <View style={styles.prescriptionMedicines}>
                  <View style={styles.medicineItem}>
                    <Ionicons name="medical" size={16} color="#50C878" />
                    <Text style={styles.medicineItemText}>Amoxicillin 500mg - 3 lần/ngày</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Ionicons name="information-circle-outline" size={18} color="#50C878" />
                  <Text style={styles.viewDetailsButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#50C878',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 9,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  banner: {
    position: 'relative',
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
    minHeight: 100,
    justifyContent: 'center',
    backgroundColor: '#50C878',
    borderWidth: 2,
    borderColor: '#45B068',
  },
  bannerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(80, 200, 120, 0.45)',
  },
  bannerContent: {
    width: '100%',
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 12,
    opacity: 0.95,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#50C878',
  },
  bannerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#50C878',
    minHeight: 100,
  },
  actionButtonPrimary: {
    backgroundColor: '#50C878',
    borderColor: '#50C878',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#50C878',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionButtonTextWhite: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoriesSection: {
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#50C878',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#50C878',
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryCard: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
  productsSection: {
    paddingVertical: 12,
  },
  productsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  deliveryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  scanModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  scanModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scanModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  scanImageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  scanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  scanOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -100,
    marginLeft: -100,
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#50C878',
    borderRadius: 16,
  },
  scanActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#50C878',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  scanActionButtonSecondary: {
    backgroundColor: '#fff',
  },
  scanActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  scanActionTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#50C878',
  },
  scanHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    lineHeight: 18,
  },
  scanningIndicator: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  scanningText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  resultSection: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  medicineIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultMedicineImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  medicineDetailImageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicineDetailImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultMedicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  resultMedicineDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  prescriptionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  prescriptionTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E65100',
  },
  otcTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  otcTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  accuracyBar: {
    gap: 8,
  },
  accuracyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  accuracyProgress: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    backgroundColor: '#50C878',
    borderRadius: 4,
  },
  usageSection: {
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  usageText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  warningSection: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewMoreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#50C878',
  },
  prescriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  prescriptionDoctor: {
    fontSize: 12,
    color: '#666',
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
    fontSize: 13,
    color: '#333',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#50C878',
  },
  viewDetailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#50C878',
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  searchResultsList: {
    flex: 1,
  },
  medicineResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medicineResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  medicineResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicineResultName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  medicineResultCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  medicineResultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prescriptionBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  prescriptionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E65100',
  },
  otcBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  otcBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  searchBoxInModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInputInModal: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  modalContent: {
    flex: 1,
  },
  allMedicinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  medicineCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  medicineCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  medicineCardContent: {
    padding: 10,
  },
  medicineCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    minHeight: 36,
  },
  medicineCardCategory: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  medicineCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 8,
  },
  // Placeholder styles for medicine images
  productImagePlaceholder: {
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  medicineResultImagePlaceholder: {
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineResultImagePlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  medicineCardImagePlaceholder: {
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineCardImagePlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  medicineDetailImagePlaceholder: {
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineDetailImagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  resultMedicineImagePlaceholder: {
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultMedicineImagePlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
});
