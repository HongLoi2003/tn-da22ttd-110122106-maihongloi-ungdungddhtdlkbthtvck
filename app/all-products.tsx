import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AllProductsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteProducts, setFavoriteProducts] = useState<Set<number>>(new Set());

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'prescription', name: 'Thuốc kê đơn' },
    { id: 'otc', name: 'Không kê đơn' },
    { id: 'supplement', name: 'Thực phẩm chức năng' },
    { id: 'personal-care', name: 'Chăm sóc cá nhân' },
  ];

  const allProducts = [
    {
      id: 1,
      name: 'Panadol Extra',
      description: 'Giảm đau - Hạ sốt',
      price: 85000,
      originalPrice: 100000,
      discount: '-15%',
      image: { uri: "https://via.placeholder.com/150" },
      category: 'otc',
      rating: 4.5,
      sold: 1200,
    },
    {
      id: 2,
      name: 'Efferalgan 500mg',
      description: 'Giảm đau - Hạ sốt',
      price: 45000,
      originalPrice: 50000,
      discount: '-10%',
      image: { uri: "https://via.placeholder.com/150" },
      category: 'otc',
      rating: 4.3,
      sold: 890,
    },
    {
      id: 3,
      name: 'Strepsils Orange',
      description: 'Viêm nghiêm trị đau họng',
      price: 39000,
      originalPrice: null,
      discount: null,
      image: { uri: "https://via.placeholder.com/150" },
      category: 'otc',
      rating: 4.7,
      sold: 650,
    },
    {
      id: 4,
      name: 'Probiotic Daily',
      description: 'Hỗ trợ tiêu hóa',
      price: 320000,
      originalPrice: null,
      discount: null,
      image: { uri: "https://via.placeholder.com/150" },
      category: 'supplement',
      rating: 4.6,
      sold: 420,
    },
    {
      id: 5,
      name: 'Vitamin C 1000mg',
      description: 'Tăng cường sức đề kháng',
      price: 180000,
      originalPrice: 200000,
      discount: '-10%',
      image: { uri: "https://via.placeholder.com/150" },
      category: 'supplement',
      rating: 4.4,
      sold: 780,
    },
    {
      id: 6,
      name: 'Kem chống nắng SPF50',
      description: 'Bảo vệ da khỏi tia UV',
      price: 250000,
      originalPrice: null,
      discount: null,
      image: { uri: "https://via.placeholder.com/150" },
      category: 'personal-care',
      rating: 4.8,
      sold: 340,
    },
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavoriteProduct = (productId: number) => {
    setFavoriteProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const renderProduct = ({ item }: { item: typeof allProducts[0] }) => (
    <TouchableOpacity style={styles.productCard}>
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      )}
      <TouchableOpacity 
        style={[
          styles.favoriteButton,
          favoriteProducts.has(item.id) && styles.favoriteButtonActive
        ]}
        onPress={(e) => {
          e.stopPropagation();
          toggleFavoriteProduct(item.id);
        }}
      >
        <Ionicons 
          name={favoriteProducts.has(item.id) ? "heart" : "heart-outline"} 
          size={20} 
          color={favoriteProducts.has(item.id) ? "#fff" : "#999"} 
        />
      </TouchableOpacity>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productDescription} numberOfLines={1}>
        {item.description}
      </Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={12} color="#FFB800" />
        <Text style={styles.ratingText}>{item.rating}</Text>
        <Text style={styles.soldText}>Đã bán {item.sold}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')}đ
        </Text>
        {item.originalPrice && (
          <Text style={styles.originalPrice}>
            {item.originalPrice.toLocaleString('vi-VN')}đ
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.addToCartButton}>
        <Ionicons name="add-circle" size={24} color="#00BCD4" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả sản phẩm</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.categoryButtonTextActive
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
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
  filterButton: {
    padding: 4,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 12,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#00BCD4',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  productsList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#E91E63',
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
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  soldText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 'auto',
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
});