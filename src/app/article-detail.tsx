import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams();

  const articleData: { [key: string]: any } = {
    'featured': {
      title: 'Phòng ngừa bệnh tim mạch hiệu quả',
      date: '20/06/2026',
      image: { uri: 'https://images.pexels.com/photos/128597/pexels-photo-128597.jpeg' },
      category: 'Tim mạch',
      
      content: 'Bệnh tim mạch là một trong những nguyên nhân gây tử vong hàng đầu trên thế giới. Tuy nhiên, nhiều trường hợp có thể được phòng ngừa thông qua lối sống lành mạnh.\n\nCác yếu tố nguy cơ:\n• Huyết áp cao\n• Cholesterol cao\n• Hút thuốc\n• Béo phì\n• Tiểu đường\n\nCách phòng ngừa:\n• Ăn uống lành mạnh: nhiều rau xanh, trái cây, hạn chế muối, đường\n• Vận động 30 phút/ngày\n• Kiểm soát cân nặng\n• Bỏ thuốc lá\n• Giảm stress, ngủ đủ giấc\n• Khám sức khỏe định kỳ',
    },
    '1': {
      title: 'Uống đủ nước mỗi ngày',
      date: '18/06/2026',
      image: { uri: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80' },
      category: 'Tim mạch',
    
      content: 'Nước chiếm 60-70% trọng lượng cơ thể và đóng vai trò thiết yếu trong mọi hoạt động sống.\n\nLợi ích của nước:\n• Vận chuyển chất dinh dưỡng\n• Điều hòa nhiệt độ cơ thể\n• Bôi trơn các khớp\n• Thải độc tố\n• Hỗ trợ tiêu hóa\n\nLượng nước cần uống:\n• Nam: 3.7 lít/ngày\n• Nữ: 2.7 lít/ngày\n\nDấu hiệu thiếu nước:\n• Khô miệng, môi nứt\n• Nước tiểu vàng đậm\n• Đau đầu, chóng mặt\n• Mệt mỏi, táo bón\n\nMẹo uống đủ nước:\n• Mang chai nước bên mình\n• Uống trước mỗi bữa ăn\n• Ăn nhiều trái cây\n• Đặt nhắc nhở',
    },
    '2': {
      title: 'Cách ngủ ngon hơn',
      date: '17/06/2026',
      image: { uri: 'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg' },
      category: 'Thần kinh',
     
      content: 'Giấc ngủ chất lượng là nền tảng của sức khỏe thể chất và tinh thần.\n\nLợi ích của giấc ngủ:\n• Phục hồi năng lượng\n• Tăng cường trí nhớ\n• Củng cố hệ miễn dịch\n• Điều hòa hormone\n• Cải thiện tâm trạng\n\nNguyên nhân mất ngủ:\n• Stress, lo âu\n• Dùng điện tử trước ngủ\n• Uống caffeine muộn\n• Môi trường không phù hợp\n• Lịch ngủ không đều\n\n10 mẹo ngủ ngon:\n1. Ngủ dậy đều giờ\n2. Môi trường tối, mát 18-20°C\n3. Tắt điện thoại 1h trước ngủ\n4. Không caffeine sau 2h chiều\n5. Tập thể dục buổi sáng\n6. Thiền, thở sâu\n7. Tắm nước ấm\n8. Đọc sách\n9. Nệm thoải mái\n10. Thư giãn trước khi ngủ',
    },
    '3': {
      title: 'Tập thể dục đúng cách',
      date: '16/06/2026',
      image: { uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80' },
      category: 'Cơ xương khớp',
      
      content: 'Tập thể dục đều đặn giúp cải thiện sức khỏe toàn diện, tăng tuổi thọ và chất lượng cuộc sống.\n\nLợi ích của vận động:\n• Tăng cường tim mạch\n• Kiểm soát cân nặng\n• Cải thiện tâm trạng\n• Tăng năng lượng\n• Ngủ ngon hơn\n• Giảm nguy cơ bệnh mãn tính\n\nCác loại hình tập luyện:\n• Cardio: chạy bộ, bơi lội, đạp xe\n• Sức mạnh: tập tạ, squat, push-up\n• Linh hoạt: yoga, stretching\n• Cân bằng: pilates, tai chi\n\nTần suất tập luyện:\n• Cardio: 150 phút/tuần\n• Sức mạnh: 2-3 lần/tuần\n• Stretching: hàng ngày\n\nLưu ý quan trọng:\n• Khởi động 5-10 phút\n• Tăng cường độ từ từ\n• Uống đủ nước\n• Nghe cơ thể mình\n• Nghỉ ngơi phù hợp',
    },
    '4': {
      title: 'Chế độ ăn uống lành mạnh',
      date: '15/06/2026',
      image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
      category: 'Tim mạch',
      
      content: 'Chế độ ăn uống cân bằng là chìa khóa cho sức khỏe tốt và phòng ngừa bệnh tật.\n\nNguyên tắc ăn uống lành mạnh:\n\n1. Đa dạng thực phẩm:\n• Rau xanh, trái cây nhiều màu sắc\n• Ngũ cốc nguyên hạt\n• Protein nạc\n• Chất béo lành mạnh\n\n2. Thực phẩm nên ăn:\n• Rau xanh, trái cây tươi\n• Cá, hải sản\n• Các loại hạt\n• Sữa, sản phẩm từ sữa\n• Dầu ô liu\n\n3. Thực phẩm hạn chế:\n• Đường, đồ ngọt\n• Muối, đồ mặn\n• Thức ăn nhanh\n• Đồ chiên rán\n• Thực phẩm chế biến sẵn\n\n4. Thói quen tốt:\n• Ăn 3 bữa chính, 2 bữa phụ\n• Ăn chậm, nhai kỹ\n• Uống nước đủ\n• Không ăn khuya\n• Kiểm soát khẩu phần',
    },
    '5': {
      title: 'Quản lý stress hiệu quả',
      date: '14/06/2026',
      image: { uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      category: 'Thần kinh',
     
      content: 'Stress kéo dài ảnh hưởng xấu đến sức khỏe thể chất và tinh thần. Học cách quản lý stress là kỹ năng sống quan trọng.\n\nTác hại của stress:\n• Rối loạn giấc ngủ\n• Đau đầu, đau cơ\n• Huyết áp cao\n• Suy giảm miễn dịch\n• Lo âu, trầm cảm\n• Vấn đề tiêu hóa\n\nDấu hiệu cảnh báo:\n• Mệt mỏi thường xuyên\n• Khó tập trung\n• Thay đổi tâm trạng\n• Căng thẳng, cáu gắt\n• Ăn uống thay đổi\n\nCách giảm stress:\n\n1. Thư giãn:\n• Thiền 10-15 phút/ngày\n• Hít thở sâu\n• Nghe nhạc thư giãn\n• Tắm nước ấm\n\n2. Vận động:\n• Yoga, đi bộ\n• Bơi lội, chạy bộ\n• Tập thể dục nhẹ\n\n3. Thời gian cho bản thân:\n• Đọc sách\n• Làm vườn\n• Vẽ, viết nhật ký\n• Gặp gỡ bạn bè\n\n4. Tổ chức thời gian:\n• Ưu tiên công việc\n• Từ chối hợp lý\n• Nghỉ ngơi đủ\n• Cân bằng công việc - cuộc sống',
    },
  };

  const article = articleData[articleId as string] || articleData['featured'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Image */}
        <Image source={article.image} style={styles.featuredImage} contentFit="cover" />

        {/* Article Info */}
        <View style={styles.articleInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          
          <Text style={styles.title}>{article.title}</Text>
          
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{article.author}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{article.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{article.readTime}</Text>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Text style={styles.contentText}>{article.content}</Text>
        </View>

        {/* Related Articles */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Bài viết liên quan</Text>
          
          <TouchableOpacity 
            style={styles.relatedCard}
            onPress={() => router.push({
              pathname: '/article-detail',
              params: { articleId: '1' }
            })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80' }} 
              style={styles.relatedImage}
              contentFit="cover" 
            />
            <View style={styles.relatedContent}>
              <Text style={styles.relatedCardTitle}>Uống đủ nước mỗi ngày</Text>
              <Text style={styles.relatedDate}>18/06/2026</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.relatedCard}
            onPress={() => router.push({
              pathname: '/article-detail',
              params: { articleId: '2' }
            })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80' }} 
              style={styles.relatedImage}
              contentFit="cover" 
            />
            <View style={styles.relatedContent}>
              <Text style={styles.relatedCardTitle}>Cách ngủ ngon hơn</Text>
              <Text style={styles.relatedDate}>17/06/2026</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.relatedCard}
            onPress={() => router.push({
              pathname: '/article-detail',
              params: { articleId: '3' }
            })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80' }} 
              style={styles.relatedImage}
              contentFit="cover" 
            />
            <View style={styles.relatedContent}>
              <Text style={styles.relatedCardTitle}>Tập thể dục đúng cách</Text>
              <Text style={styles.relatedDate}>16/06/2026</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.relatedCard}
            onPress={() => router.push({
              pathname: '/article-detail',
              params: { articleId: '4' }
            })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' }} 
              style={styles.relatedImage}
              contentFit="cover" 
            />
            <View style={styles.relatedContent}>
              <Text style={styles.relatedCardTitle}>Chế độ ăn uống lành mạnh</Text>
              <Text style={styles.relatedDate}>15/06/2026</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.relatedCard}
            onPress={() => router.push({
              pathname: '/article-detail',
              params: { articleId: '5' }
            })}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' }} 
              style={styles.relatedImage}
              contentFit="cover" 
            />
            <View style={styles.relatedContent}>
              <Text style={styles.relatedCardTitle}>Quản lý stress hiệu quả</Text>
              <Text style={styles.relatedDate}>14/06/2026</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 250,
  },
  articleInfo: {
    padding: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 32,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  articleContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  relatedSection: {
    padding: 16,
    marginTop: 24,
    backgroundColor: '#f8fafb',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  relatedCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  relatedImage: {
    width: 90,
    height: 90,
  },
  relatedContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  relatedDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
