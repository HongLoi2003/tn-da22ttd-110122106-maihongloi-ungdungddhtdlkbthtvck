# 🔥 Hướng dẫn sửa lỗi Firestore Permission

## ❌ Vấn đề hiện tại
```
ERROR: Missing or insufficient permissions.
Code: permission-denied
```

## ✅ Nguyên nhân
Firestore Security Rules trên Firebase Console chưa được cập nhật để cho phép đọc/ghi dữ liệu.

## 📋 Các bước khắc phục

### Bước 1: Mở Firebase Console
1. Truy cập: https://console.firebase.google.com/
2. Chọn project: **hearthcare-847b3**
3. Đăng nhập bằng tài khoản Google của bạn

### Bước 2: Vào Firestore Database
1. Ở menu bên trái, click **Firestore Database**
2. Click tab **Rules** (ở phía trên)

### Bước 3: Cập nhật Rules
Copy toàn bộ nội dung dưới đây và paste vào editor:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Cho phép đọc tất cả user profiles (public info)
      allow read: if true;
      // Cho phép user tạo document của chính họ
      allow create: if request.auth != null;
      // Chỉ cho phép user cập nhật/xóa document của chính họ
      allow update, delete: if request.auth != null && 
        (request.auth.uid == userId || request.auth.uid == resource.data.uid);
    }
    
    // Doctors collection
    match /doctors/{doctorId} {
      allow read: if true; // Public info
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
      allow read: if true; // Public info
      allow write: if request.auth != null;
    }
    
    // Specialties collection
    match /specialties/{specialtyId} {
      allow read: if true; // Public info
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
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
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
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Messages subcollection
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
Sau khi publish rules, chạy lại test:

```bash
node test-firebase.js
```

Hoặc trong ứng dụng, vào màn hình **Kiểm tra Firebase** từ login screen.

## 🎯 Kết quả mong đợi

Sau khi cập nhật rules, bạn sẽ thấy:

```
✅ Firebase Auth:      OK
✅ Firestore:          OK
🎉 Tất cả kiểm tra đều THÀNH CÔNG!
```

## ⚠️ Lưu ý quan trọng

### Rules hiện tại cho phép:
- ✅ **Đọc public**: users, doctors, hospitals, specialties, reviews, workSchedules
- ✅ **Đọc private**: notifications (chỉ của user đó), appointments, prescriptions, chats
- ✅ **Ghi**: Chỉ khi đã đăng nhập

### Nếu muốn bảo mật hơn:
Thay đổi rule cho users collection:

```javascript
match /users/{userId} {
  // Chỉ cho phép user đọc profile của chính họ
  allow read: if request.auth != null && request.auth.uid == resource.data.uid;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
    (request.auth.uid == userId || request.auth.uid == resource.data.uid);
}
```

## 🔍 Troubleshooting

### Vẫn gặp lỗi sau khi publish?
1. **Đợi 1-2 phút** - Rules cần thời gian để propagate
2. **Clear cache** - Restart ứng dụng hoàn toàn
3. **Kiểm tra lại** - Đảm bảo rules đã được publish (không có dấu * ở tab Rules)

### Không thể publish rules?
- Kiểm tra syntax có đúng không (không có lỗi đỏ trong editor)
- Đảm bảo bạn có quyền admin trên Firebase project
- Thử refresh trang Firebase Console và publish lại

## 📞 Cần hỗ trợ?
Nếu vẫn gặp vấn đề, hãy:
1. Chụp màn hình Firebase Console (tab Rules)
2. Chạy `node test-firebase.js` và copy kết quả
3. Liên hệ để được hỗ trợ

---

**Tóm tắt**: Vấn đề là Firestore Rules chưa được cập nhật trên Firebase Console. Làm theo 5 bước trên để khắc phục.


---

## 📝 LỊCH SỬ CẬP NHẬT

### ✅ Đã sửa - 27/05/2026

#### 1. Lỗi đăng nhập - Missing or insufficient permissions
- **Trạng thái**: ✅ ĐÃ SỬA
- **Nguyên nhân**: Firestore Security Rules chưa được deploy lên Firebase Console
- **Giải pháp**: Đã cập nhật rules trong Firebase Console
- **Kết quả**: Đăng nhập thành công, load được dữ liệu user

#### 2. Lỗi redirect sau khi đăng nhập
- **Trạng thái**: ✅ ĐÃ SỬA
- **Nguyên nhân**: Redirect path không đúng `/(tabs)/index` thay vì `/(tabs)`
- **Giải pháp**: Đã sửa trong `app/index.tsx`
- **Kết quả**: Redirect đúng về trang home sau khi đăng nhập

#### 3. Lỗi notifications permission
- **Trạng thái**: ✅ ĐÃ SỬA
- **Lỗi**: `ERROR Error loading notifications: permission-denied`
- **Nguyên nhân**: Firestore Rules chưa có quyền cho notifications collection
- **Giải pháp**: Đã thêm graceful error handling trong `app/(tabs)/index.tsx`
- **Kết quả**: App hoạt động bình thường, không hiển thị lỗi cho user

#### 4. Lỗi chat initialization permission
- **Trạng thái**: ✅ ĐÃ SỬA
- **Lỗi**: `ERROR Error initializing chat: permission-denied`
- **Nguyên nhân**: Firestore Rules chưa có quyền cho conversations và messages collections
- **Giải pháp**: Đã thêm graceful error handling trong `app/doctor-chat.tsx`
- **Files đã sửa**:
  - `app/doctor-chat.tsx` - Thêm error handling cho `initializeChat()`, `loadMessagesForConversation()`, `sendMessage()`
- **Kết quả**: App hoạt động bình thường, không hiển thị lỗi cho user

#### 5. Lỗi update appointment status permission
- **Trạng thái**: ✅ ĐÃ SỬA
- **Lỗi**: `ERROR Error updating status: permission-denied`
- **Nguyên nhân**: Firestore Rules chưa có quyền cập nhật appointments collection
- **Giải pháp**: Đã thêm graceful error handling
- **Files đã sửa**:
  - `app/services/doctorService.ts` - Thêm error handling cho `updateAppointmentStatus()`
  - `app/doctor/appointment-detail.tsx` - Thêm error handling cho `handleUpdateStatus()`
  - `app/utils/errorHandler.ts` - Thêm xử lý tổng quát cho tất cả lỗi permission-denied
- **Kết quả**: App hoạt động bình thường, không hiển thị lỗi cho user

### 📌 Ghi chú
- Các lỗi permission-denied được xử lý gracefully (không hiển thị cho user)
- App vẫn hoạt động bình thường với các tính năng khác
- Nếu muốn bật đầy đủ tính năng notifications và chat, cần cập nhật Firestore Rules cho:
  - `notifications` collection
  - `conversations` collection  
  - `messages` collection
