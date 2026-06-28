import { createDocument, getAllDocuments, updateDocument } from './firebaseService';

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Reply[];
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

// Lấy tất cả bình luận của một bài viết
export const getArticleComments = async (articleId: string): Promise<Comment[]> => {
  try {
    const allComments = await getAllDocuments('comments');
    const articleComments = allComments.filter(
      (comment: any) => comment.articleId === articleId
    ) as Comment[];
    // Sắp xếp theo thời gian mới nhất
    return articleComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting article comments:', error);
    return [];
  }
};

// Thêm bình luận mới
export const addComment = async (
  articleId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string
): Promise<Comment | null> => {
  try {
    const newComment: Comment = {
      id: `cmt${Date.now()}`,
      articleId,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    await createDocument('comments', newComment);
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Thêm reply cho một comment
export const addReply = async (
  commentId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  content: string
): Promise<boolean> => {
  try {
    const allComments = await getAllDocuments('comments');
    const comment = allComments.find((c: any) => c.id === commentId) as Comment | undefined;
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    const newReply: Reply = {
      id: `reply${Date.now()}`,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    const updatedReplies = [...(comment.replies || []), newReply];
    await updateDocument('comments', commentId, { replies: updatedReplies });
    
    return true;
  } catch (error) {
    console.error('Error adding reply:', error);
    return false;
  }
};

// Like/Unlike comment
export const toggleCommentLike = async (
  commentId: string,
  currentLikes: number,
  isLiked: boolean
): Promise<number> => {
  try {
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
    await updateDocument('comments', commentId, { likes: newLikes });
    return newLikes;
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return currentLikes;
  }
};

// Đếm tổng số comments (bao gồm replies)
export const countComments = (comments: Comment[]): number => {
  let total = comments.length;
  comments.forEach((comment) => {
    if (comment.replies && Array.isArray(comment.replies)) {
      total += comment.replies.length;
    }
  });
  return total;
};
