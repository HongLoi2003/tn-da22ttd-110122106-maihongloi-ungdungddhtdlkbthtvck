# 💬 Hướng dẫn cập nhật Firestore Rules cho tính năng Chat

## ❌ Vấn đề hiện tại

Người dùng gửi tin nhắn cho bác sĩ nhưng:
- ✅ Tin nhắn hiển thị ở phía người dùng (local state)
- ❌ Tin nhắn KHÔNG được lưu vào Firestore (permission-denied)
- ❌ Bác sĩ KHÔNG thấy được tin nhắn

## 🔍 Nguyên nhân

Firestore Security Rules chưa cho phép:
1. Tạo documents trong collection `conversations`
2. Tạo documents trong collection `messages`
3. Cập nhật documents trong collection `conversations`

## ✅ Giải pháp

Cập nhật Firestore Rules trên Firebase Console để cho phép người dùng đã đăng nhập có thể:
- Tạo và đọc conversations
- Gửi và đọc messages
- Cập nhật thông tin conversation (lastMessage, unreadCount, etc.)

## 📋 Các bước thực hiện

### Bước 1: Mở Firebase Console
1. Truy cập: https://console.firebase.google.com/
2. Chọn project: **hearthcare-847b3**
3. Đăng nhập bằng tài khoản Google của bạn

### Bước 2: Vào Firestore Database
1. Ở menu bên trái, click **Firestore Database**
2. Click tab **Rules** (ở phía trên)

### Bước 3: Cập nhật Rules

Tìm phần rules cho `chats` và `messages`, thay thế bằng rules mới dưới đây:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == userId || request.auth.uid == resource.data.uid);
    }
    
    // Doctors collection
    match /doctors/{doctorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid);
    }
    
    // Hospitals collection
    match /hospitals/{hospitalId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Specialties collection
    match /specialties/{specialtyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Work schedules collection
    match /workSchedules/{scheduleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Prescriptions collection
    match /prescriptions/{prescriptionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // ===== CHAT COLLECTIONS - CẬP NHẬT MỚI =====
    
    // Conversations collection
    match /conversations/{conversationId} {
      // Cho phép đọc nếu user là patient hoặc doctor trong conversation
      allow read: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.doctorId == request.auth.uid
      );
      // Cho phép tạo conversation mới nếu đã đăng nhập
      allow create: if request.auth != null;
      // Cho phép cập nhật nếu user là patient hoặc doctor trong conversation
      allow update: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.doctorId == request.auth.uid
      );
      // Cho phép xóa nếu user là patient hoặc doctor trong conversation
      allow delete: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        resource.data.doctorId == request.auth.uid
      );
    }
    
    // Messages collection
    match /messages/{messageId} {
      // Cho phép đọc messages nếu đã đăng nhập
      // (Lý tưởng nên check xem user có trong conversation không, nhưng cần query phức tạp)
      allow read: if request.auth != null;
      // Cho phép tạo message mới nếu đã đăng nhập
      allow create: if request.auth != null;
      // Cho phép cập nhật message (để đánh dấu đã đọc)
      allow update: if request.auth != null;
      // Cho phép xóa message nếu là người gửi
      allow delete: if request.auth != null && 
        resource.data.senderId == request.auth.uid;
    }
    
    // Chats collection (legacy - giữ lại để tương thích)
    match /chats/{chatId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Messages subcollection (legacy - giữ lại để tương thích)
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Bước 4: Publish Rules
1. Click nút **Publish** (màu xanh, góc trên bên phải)
2. Đợi vài giây để rules được deploy
3. Bạn sẽ thấy thông báo "Rules published successfully"

### Bước 5: Kiểm tra lại

Sau khi publish rules:

1. **Đăng xuất và đăng nhập lại** trong app
2. **Thử gửi tin nhắn** cho bác sĩ
3. **Kiểm tra Firebase Console**:
   - Vào Firestore Database > Data
   - Xem collection `conversations` - phải có conversation mới
   - Xem collection `messages` - phải có tin nhắn mới

## 🎯 Kết quả mong đợi

Sau khi cập nhật rules:

✅ Người dùng gửi tin nhắn → Tin nhắn được lưu vào Firestore
✅ Bác sĩ mở app → Thấy được tin nhắn từ người dùng
✅ Bác sĩ trả lời → Người dùng thấy được tin nhắn từ bác sĩ
✅ Không có lỗi permission-denied

## 🔒 Bảo mật

Rules hiện tại đảm bảo:
- ✅ Chỉ user đã đăng nhập mới có thể gửi/đọc tin nhắn
- ✅ User chỉ có thể đọc conversations mà họ tham gia
- ✅ User chỉ có thể xóa messages do họ gửi
- ⚠️ Lưu ý: Rules hiện tại cho phép user đọc tất cả messages (để đơn giản hóa)

## 🔍 Troubleshooting

### Vẫn gặp lỗi sau khi publish?

1. **Đợi 1-2 phút** - Rules cần thời gian để propagate
2. **Clear cache** - Restart ứng dụng hoàn toàn
3. **Kiểm tra lại** - Đảm bảo rules đã được publish (không có dấu * ở tab Rules)
4. **Kiểm tra auth** - Đảm bảo user đã đăng nhập (có `request.auth.uid`)

### Không thể publish rules?

- Kiểm tra syntax có đúng không (không có lỗi đỏ trong editor)
- Đảm bảo bạn có quyền admin trên Firebase project
- Thử refresh trang Firebase Console và publish lại

### Tin nhắn vẫn không hiển thị cho bác sĩ?

1. Kiểm tra `conversationId` có đúng không
2. Kiểm tra `doctorId` trong conversation có khớp với auth UID của bác sĩ không
3. Xem logs trong Firebase Console > Firestore > Rules để debug

## 📞 Cần hỗ trợ?

Nếu vẫn gặp vấn đề:
1. Chụp màn hình Firebase Console (tab Rules)
2. Chụp màn hình lỗi trong app (nếu có)
3. Kiểm tra collection `conversations` và `messages` trong Firestore Data

---

**Tóm tắt**: Cập nhật Firestore Rules để cho phép user đã đăng nhập có thể tạo conversations, gửi messages, và cập nhật conversation metadata.
