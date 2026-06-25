import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { articleData } from './article-data';

export default function ArticlesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
    { id: 'cardiology', name: 'Tim mạch', icon: 'heart-outline' },
    { id: 'neurology', name: 'Thần kinh', icon: 'pulse-outline' },
    { id: 'respiratory', name: 'Hô hấp', icon: 'fitness-outline' },
    { id: 'gastroenterology', name: 'Tiêu hóa', icon: 'restaurant-outline' },
    { id: 'dermatology', name: 'Da liễu', icon: 'body-outline' },
    { id: 'pediatrics', name: 'Nhi khoa', icon: 'happy-outline' },
    { id: 'obstetrics', name: 'Sản phụ khoa', icon: 'woman-outline' },
    { id: 'orthopedics', name: 'Cơ xương khớp', icon: 'walk-outline' },
    { id: 'ent', name: 'Tai mũi họng', icon: 'ear-outline' },
    { id: 'ophthalmology', name: 'Mắt', icon: 'eye-outline' },
    { id: 'dentistry', name: 'Răng hàm mặt', icon: 'medical-outline' },
    { id: 'endocrinology', name: 'Nội tiết', icon: 'water-outline' },
  ];

  // Lấy dữ liệu từ articleData
  const featuredArticle = {
    ...articleData['featured'],
    id: 'featured',
  };

  const articles = Object.keys(articleData)
    .filter(key => key !== 'featured')
    .map(key => {
      const article = articleData[key];
      // Trích xuất excerpt từ content (100 ký tự đầu)
      const excerpt = article.content
        .trim()
        .split('\n')
        .find((line: string) => line.length > 20)
        ?.substring(0, 100) + '...' || 'Đọc tiếp để biết thêm chi tiết';
      
      // Map category sang mã category cho filter
      const categoryMap: { [key: string]: string } = {
        'Tim mạch': 'cardiology',
        'Dinh dưỡng': 'nutrition',
        'Thần kinh': 'neurology',
        'Thể dục': 'fitness',
        'Tâm lý': 'mental',
        'Nội tiết': 'endocrinology',
        'Nhãn khoa': 'ophthalmology',
        'Nha khoa': 'dentistry',
      };
      
      return {
        id: key,
        title: article.title,
        excerpt: excerpt,
        date: article.date,
        image: article.image,
        category: categoryMap[article.category] || 'nutrition',
      };
    });

  const filteredArticles = articles.filter((article) => {
    // Mapping category sang tên tiếng Việt để search
    const categoryNames: { [key: string]: string } = {
      'cardiology': 'tim mạch',
      'neurology': 'thần kinh',
      'respiratory': 'hô hấp',
      'gastroenterology': 'tiêu hóa tiêu hoá',
      'dermatology': 'da liễu',
      'pediatrics': 'nhi khoa',
      'obstetrics': 'sản phụ khoa',
      'orthopedics': 'cơ xương khớp',
      'ent': 'tai mũi họng',
      'ophthalmology': 'mắt nhãn khoa',
      'dentistry': 'răng hàm mặt nha khoa',
      'endocrinology': 'nội tiết',
    };

    const searchLower = searchText.toLowerCase();
    const categoryName = categoryNames[article.category] || '';
    
    const matchesSearch = 
      article.title.toLowerCase().includes(searchLower) ||
      article.excerpt.toLowerCase().includes(searchLower) ||
      categoryName.includes(searchLower);
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết sức khỏe</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài viết, triệu chứng..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}> Danh mục </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.id ? '#fff' : '#00BCD4'} 
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Article */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}> Bài viết nổi bật </Text>
          </View>
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => router.push({
              pathname: '/article-detail',
              params: { articleId: featuredArticle.id }
            })}
          >
            <Image source={featuredArticle.image} style={styles.featuredImage} contentFit="cover" />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>{featuredArticle.title}</Text>
              <View style={styles.featuredDate}>
                <Ionicons name="calendar-outline" size={13} color="#fff" />
                <Text style={styles.featuredDateText}>{featuredArticle.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Articles List */}
        <View style={styles.articlesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}> Danh sách bài viết </Text>
          </View>
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => router.push({
                pathname: '/article-detail',
                params: { articleId: article.id }
              })}
            >
              <Image source={article.image} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.excerpt}
                </Text>
                <View style={styles.articleFooter}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.articleDate}>{article.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  categorySection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
  },
  categoryList: {
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  categoryChipActive: {
    backgroundColor: '#00BCD4',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  featuredSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 188, 212, 0.85)',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 24,
  },
  featuredDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredDateText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  articlesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafb',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  articleImage: {
    width: 110,
    height: 110,
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 20,
  },
  articleExcerpt: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
