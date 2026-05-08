import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { addComment, addReply, Comment, getArticleComments, toggleCommentLike } from './services/commentService';

const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
  'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
  'vuthilan.png': require('@/assets/images/vuthilan.png'),
  'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
  'tranthimai.png': require('@/assets/images/tranthimai.png'),
  'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
};

export default function ArticleCommentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const articleId = params.articleId as string || '1';
  const articleTitle = params.articleTitle as string || 'Bài viết';

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    if (!userData) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận');
      return;
    }

    try {
      setSubmitting(true);

      if (replyingTo) {
        // Thêm reply
        const success = await addReply(
          replyingTo,
          userData.id || userData.uid || 'user001',
          userData.fullName || 'Người dùng',
          userData.avatar || 'nguyenvanam.png',
          commentText
        );

        if (success) {
          setCommentText('');
          setReplyingTo(null);
          await loadComments();
        } else {
          Alert.alert('Lỗi', 'Không thể thêm phản hồi');
        }
      } else {
        // Thêm comment mới
        const newComment = await addComment(
          articleId,
          userData.id || userData.uid || 'user001',
          userData.fullName || 'Người dùng',
          userData.avatar || 'nguyenvanam.png',
          commentText
        );

        if (newComment) {
          setCommentText('');
          await loadComments();
        } else {
          Alert.alert('Lỗi', 'Không thể thêm bình luận');
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    const isLiked = likedComments.has(commentId);
    const newLikes = await toggleCommentLike(commentId, currentLikes, isLiked);
    
    // Update local state
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId ? { ...comment, likes: newLikes } : comment
      )
    );

    // Update liked state
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Vừa xong';
    
    try {
      const date = new Date(dateString);
      
      // Kiểm tra date có hợp lệ không
      if (isNaN(date.getTime())) {
        return 'Vừa xong';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Vừa xong';
    }
  };

  const getAvatarSource = (avatar: string) => {
    // Nếu avatar là URL thì return object với uri
    if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
      return { uri: avatar };
    }
    // Nếu avatar là tên file trong doctorImages thì dùng
    if (avatar && doctorImages[avatar as keyof typeof doctorImages]) {
      return doctorImages[avatar as keyof typeof doctorImages];
    }
    // Mặc định dùng logo
    return require('@/assets/images/logo.png');
  };

  const getUserAvatar = () => {
    // Lấy avatar của user hiện tại
    if (userData?.avatar) {
      // Nếu là URL
      if (userData.avatar.startsWith('http://') || userData.avatar.startsWith('https://')) {
        return { uri: userData.avatar };
      }
      // Nếu là tên file trong doctorImages
      if (doctorImages[userData.avatar as keyof typeof doctorImages]) {
        return doctorImages[userData.avatar as keyof typeof doctorImages];
      }
    }
    // Mặc định dùng logo
    return require('@/assets/images/logo.png');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bình luận</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{articleTitle}</Text>
        </View>
      </View>

      {/* Comments List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
            <Text style={styles.loadingText}>Đang tải bình luận...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
            <Text style={styles.emptySubtext}>Hãy là người đầu tiên bình luận!</Text>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                {/* Main Comment */}
                <View style={styles.commentCard}>
                  <Image 
                    source={getAvatarSource(comment.userAvatar)} 
                    style={styles.avatar} 
                  />
                  <View style={styles.commentBody}>
                    <Text style={styles.userName}>{comment.userName}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                      <Text style={styles.timeText}>{formatDate(comment.createdAt)}</Text>
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleLikeComment(comment.id, comment.likes)}
                      >
                        <Ionicons 
                          name={likedComments.has(comment.id) ? "heart" : "heart-outline"} 
                          size={16} 
                          color={likedComments.has(comment.id) ? "#EF4444" : "#64748b"} 
                        />
                        <Text style={styles.actionText}>{comment.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => {
                          setReplyingTo(comment.id);
                          setCommentText(`@${comment.userName} `);
                        }}
                      >
                        <Ionicons name="chatbubble-outline" size={16} color="#64748b" />
                        <Text style={styles.actionText}>Trả lời</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {comment.replies.map((reply) => (
                      <View key={reply.id} style={styles.replyCard}>
                        <Image 
                          source={getAvatarSource(reply.userAvatar)} 
                          style={styles.replyAvatar} 
                        />
                        <View style={styles.replyBody}>
                          <Text style={styles.userName}>{reply.userName}</Text>
                          <Text style={styles.commentText}>{reply.content}</Text>
                          <View style={styles.commentActions}>
                            <Text style={styles.timeText}>{formatDate(reply.createdAt)}</Text>
                            <TouchableOpacity style={styles.actionBtn}>
                              <Ionicons name="heart-outline" size={14} color="#64748b" />
                              <Text style={styles.actionText}>{reply.likes}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Input Box */}
      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingBanner}>
            <Text style={styles.replyingText}>Đang trả lời bình luận</Text>
            <TouchableOpacity onPress={() => {
              setReplyingTo(null);
              setCommentText('');
            }}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputWrapper}>
          <Image 
            source={getUserAvatar()} 
            style={styles.inputAvatar} 
          />
          <TextInput
            style={styles.input}
            placeholder={replyingTo ? "Viết phản hồi..." : "Viết bình luận..."}
            placeholderTextColor="#94a3b8"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentBody: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#64748b',
  },
  repliesContainer: {
    marginLeft: 52,
    marginTop: 8,
    gap: 8,
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  replyBody: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  replyingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
  },
  replyingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
