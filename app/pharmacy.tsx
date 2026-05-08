import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getAllDocuments } from './services/firebaseService';

export default function PharmacyScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  
  const screenWidth = Dimensions.get('window').width;

  useFocusEffect(
    useCallback(() => {
      loadPharmacyData();
    }, [])
  );

  const loadPharmacyData = async () => {
    try {
      setLoading(true);
      
      const [categoriesData, productsData, promotionsData, pharmaciesData] = await Promise.all([
        getAllDocuments('pharmacy-categories'),
        getAllDocuments('pharmacy-products'),
        getAllDocuments('pharmacy-promotions'),
        getAllDocuments('pharmacies'),
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setPromotions(promotionsData);
      setPharmacies(pharmaciesData);
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc sản phẩm theo danh mục
  const filteredProducts = selectedCategory === 1 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhà thuốc</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm thuốc, vitamin, thực phẩm chức năng..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.scanButton}>
              <Ionicons name="scan-outline" size={20} color="#00BCD4" />
              <Text style={styles.scanText}>Quét đơn thuốc</Text>
            </TouchableOpacity>
          </View>

          {/* Promotion Banner - Swipeable */}
          {promotions.length > 0 && (
            <View style={styles.promotionContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 32));
                  setCurrentPromoIndex(index);
                }}
              >
                {promotions.map((promo) => (
                  <View 
                    key={promo.id} 
                    style={[
                      styles.banner, 
                      { 
                        backgroundColor: promo.backgroundColor,
                        width: screenWidth - 32
                      }
                    ]}
                  >
                    <View style={styles.bannerContent}>
                      <View style={styles.bannerBadge}>
                        <Ionicons name="time-outline" size={14} color="#00BCD4" />
                        <Text style={styles.bannerBadgeText}>{promo.badge}</Text>
                      </View>
                      <Text style={[styles.bannerTitle, { color: promo.titleColor }]}>
                        {promo.title}
                      </Text>
                      <Text style={styles.bannerSubtitle}>{promo.subtitle}</Text>
                      <TouchableOpacity style={styles.bannerButton}>
                        <Text style={styles.bannerButtonText}>Mua ngay</Text>
                      </TouchableOpacity>
                    </View>
                    <Image source={require('@/assets/images/logo.png')} style={styles.bannerImage} />
                  </View>
                ))}
              </ScrollView>
              <View style={styles.bannerDots}>
                {promotions.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentPromoIndex === index && styles.dotActive
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {categories.map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id && styles.categoryCardActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View style={[
                      styles.categoryIcon,
                      selectedCategory === category.id && styles.categoryIconActive
                    ]}>
                      <Ionicons 
                        name={category.icon as any} 
                        size={28} 
                        color={selectedCategory === category.id ? '#fff' : '#00BCD4'} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryName,
                      selectedCategory === category.id && styles.categoryNameActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Best Selling Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 1 ? 'Sản phẩm bán chạy' : 
                 selectedCategory === 2 ? 'Thuốc kê đơn' :
                 selectedCategory === 3 ? 'Thuốc không kê đơn' :
                 selectedCategory === 4 ? 'Thực phẩm chức năng' :
                 selectedCategory === 5 ? 'Chăm sóc cá nhân' :
                 selectedCategory === 6 ? 'Dụng cụ y tế' : 'Sản phẩm'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/all-products')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {filteredProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsScroll}
              >
                {filteredProducts.map((product) => (
                  <TouchableOpacity key={product.id} style={styles.productCard}>
                    {product.discount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{product.discount}</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.favoriteButton}>
                      <Ionicons name="heart-outline" size={20} color="#999" />
                    </TouchableOpacity>
                    <Image source={require('@/assets/images/logo.png')} style={styles.productImage} />
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productDescription} numberOfLines={1}>
                      {product.description}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {product.price?.toLocaleString('vi-VN')}đ
                      </Text>
                      {product.originalPrice && (
                        <Text style={styles.originalPrice}>
                          {product.originalPrice.toLocaleString('vi-VN')}đ
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.addToCartButton}>
                      <Ionicons name="add-circle" size={24} color="#00BCD4" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyProducts}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có sản phẩm trong danh mục này</Text>
              </View>
            )}
          </View>

          {/* Nearby Pharmacies */}
          {pharmacies.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nhà thuốc gần bạn</Text>
                <TouchableOpacity onPress={() => router.push('/hospital-map')}>
                  <Text style={styles.seeAllText}>Xem trên bản đồ</Text>
                </TouchableOpacity>
              </View>
              {pharmacies.map((pharmacy) => (
                <TouchableOpacity key={pharmacy.id} style={styles.pharmacyCard}>
                  <Image source={require('@/assets/images/benhvien.png')} style={styles.pharmacyImage} />
                  <View style={styles.pharmacyInfo}>
                    <View style={styles.pharmacyHeader}>
                      <Text style={styles.pharmacyName} numberOfLines={1}>
                        {pharmacy.name}
                      </Text>
                      <View style={[styles.pharmacyBadge, { backgroundColor: pharmacy.badgeColor }]}>
                        <Text style={styles.pharmacyBadgeText}>{pharmacy.badge}</Text>
                      </View>
                    </View>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.ratingText}>
                        {pharmacy.rating} ({pharmacy.reviews} đánh giá)
                      </Text>
                    </View>
                    <Text style={styles.pharmacyAddress} numberOfLines={1}>
                      {pharmacy.address}
                    </Text>
                    <View style={styles.pharmacyFooter}>
                      <View style={styles.infoTag}>
                        <Ionicons name="time-outline" size={12} color="#666" />
                        <Text style={styles.infoTagText}>{pharmacy.openUntil}</Text>
                      </View>
                      <View style={styles.infoTag}>
                        <Ionicons name="bicycle-outline" size={12} color="#00BCD4" />
                        <Text style={styles.infoTagTextGreen}>{pharmacy.deliveryTime}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.pharmacyActions}>
                    <Text style={styles.distanceText}>{pharmacy.distance}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  scanText: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
  },
  promotionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    minHeight: 140,
  },
  bannerContent: {
    flex: 1,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '600',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00897B',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  bannerImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  bannerDots: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B2DFDB',
  },
  dotActive: {
    backgroundColor: '#00BCD4',
    width: 20,
  },
  categoriesContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  categoryCardActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconActive: {
    backgroundColor: '#00BCD4',
  },
  categoryName: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryNameActive: {
    color: '#00BCD4',
    fontWeight: '700',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  productsScroll: {
    paddingRight: 16,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    height: 36,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00BCD4',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  pharmacyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  pharmacyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  pharmacyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pharmacyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  pharmacyAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  pharmacyFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoTagText: {
    fontSize: 11,
    color: '#666',
  },
  infoTagTextGreen: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '600',
  },
  pharmacyActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  emptyProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
