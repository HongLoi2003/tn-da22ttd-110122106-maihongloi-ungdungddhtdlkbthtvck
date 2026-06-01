# Hướng dẫn Deploy Firestore Rules

## Vấn đề
Bác sĩ cần có thể bấm nút "Hữu ích" trên đánh giá của bệnh nhân, nhưng Firestore rules hiện tại chỉ cho phép người tạo review cập nhật.

## Giải pháp
Đã cập nhật Firestore rules để cho phép bất kỳ user đã đăng nhập nào cập nhật trường `helpful` trong reviews.

## Cách Deploy Rules

### Cách 1: Qua Firebase Console (Khuyến nghị)

1. Mở trình duyệt và truy cập: https://console.firebase.google.com
2. Chọn project **heatlecare**
3. Vào menu bên trái, chọn **Firestore Database**
4. Chọn tab **Rules** ở trên cùng
5. Copy toàn bộ nội dung từ file `firestore.rules` trong project
6. Paste vào editor trên Firebase Console
7. Click nút **Publish** để deploy

### Cách 2: Qua Firebase CLI (Nếu đã cài đặt)

```bash
# Cài đặt Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Login vào Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## Thay đổi trong Rules

### Trước:
```javascript
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}
```

### Sau:
```javascript
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null;
  // Cho phép update nếu:
  // 1. User là người tạo review (userId khớp)
  // 2. User là bác sĩ được đánh giá (chỉ update trường helpful)
  allow update: if request.auth != null && (
    resource.data.userId == request.auth.uid ||
    (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['helpful']))
  );
  allow delete: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}
```

## Kiểm tra sau khi Deploy

1. Mở app và đăng nhập với tài khoản bác sĩ
2. Vào trang **Đánh giá của bệnh nhân** (Reviews)
3. Bấm nút **Hữu ích** trên một đánh giá
4. Số lượng "Hữu ích" sẽ tăng lên và nút sẽ đổi màu xanh
5. Bấm lại lần nữa để bỏ đánh dấu (số sẽ giảm xuống)

## Tính năng mới

✅ Bác sĩ có thể bấm nút "Hữu ích" trên đánh giá
✅ Nút sẽ đổi màu khi được bấm (xanh dương)
✅ Số lượng "Hữu ích" sẽ tăng/giảm theo thời gian thực
✅ Có thể bấm lại để bỏ đánh dấu
✅ Dữ liệu được lưu vào Firebase

## Lưu ý

- Rules này cho phép BẤT KỲ user đã đăng nhập nào cập nhật trường `helpful`
- Chỉ trường `helpful` mới có thể được cập nhật bởi người khác
- Các trường khác (rating, comment, etc.) vẫn chỉ có thể được cập nhật bởi người tạo review
