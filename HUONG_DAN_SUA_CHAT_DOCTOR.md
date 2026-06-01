# Hướng dẫn sửa Chat cho tất cả Bác sĩ

## Vấn đề
Bác sĩ không thấy tin nhắn từ bệnh nhân vì conversations cũ không có field `doctorAuthUid`.

## Nguyên nhân
- Conversations được tạo với `doctorId` = "bs004" (ID từ doctors collection)
- Bác sĩ query bằng `userData.uid` (Firebase Auth UID)
- Hai ID này không khớp nhau

## Giải pháp đã làm

### 1. ✅ Cập nhật code
- File `app/doctor-chat.tsx`: Đã thêm logic lưu cả `doctorId` và `doctorAuthUid` khi tạo conversation mới
- File `app/doctor/chats.tsx`: Đã thêm query theo `doctorAuthUid`
- File `firestore.rules`: Đã thêm điều kiện cho phép đọc/ghi conversations theo `doctorAuthUid`

### 2. ⚠️ Cần deploy Firestore Rules
**BẮT BUỘC** phải deploy rules lên Firebase để script cập nhật hoạt động:

1. Mở https://console.firebase.google.com
2. Chọn project **heatlecare**
3. Vào **Firestore Database** → tab **Rules**
4. Copy toàn bộ nội dung từ file `firestore.rules` trong project
5. Paste vào editor trên Firebase Console
6. Click nút **Publish** để deploy

### 3. 🔧 Cập nhật conversations cũ

Sau khi deploy rules, chạy script để cập nhật conversations cũ:

**Cách 1: Qua Firebase Console (Khuyến nghị)**
1. Vào Firebase Console → Firestore Database
2. Mở collection `conversations`
3. Với mỗi conversation:
   - Thêm field `doctorAuthUid` 
   - Giá trị: Lấy từ bảng mapping bên dưới

**Cách 2: Chạy script trong app**
1. Deploy Firestore rules trước (bước 2 ở trên)
2. Vào trang `/force-update-all-conversations` trong app
3. Bấm nút "Force Update"
4. Script sẽ tự động thêm `doctorAuthUid` vào tất cả conversations

## Bảng mapping: doctorId → doctorAuthUid

```
bs001 → srLggWIVPpVUmKbdEZQtgMjo8qC2 (BS. Nguyễn Văn An)
bs002 → 8MEPZwHHq7fgJvSnbYgtoJlApDg2 (BS. Trần Thị Lan)
bs003 → zocOAhTF1BhQyXjRXhgMO25N73K2 (BS. Lê Minh Tâm)
bs004 → NHbMROGpWOV4xxlXB8EhPi5nKZ82 (BS. Trần Thị Mai)
bs007 → E1Nluyx4RzMsSLq7INK1YPZ13U82 (BS. Đỗ Minh Tuấn)
bs008 → Ng98CXXtK6ei0gerTd8SlML7AzN2 (BS. Vũ Thị Lan)
bs009 → 7OLFDPQWcwRiDMfTLP9yswV7pYG3 (BS. Hoàng Văn Đức)
bs010 → 2e2rJkQ7xUYlxMjqxK1i8c9rztl1 (BS. Ngô Thị Hương)
bs011 → qddUK3XBZaar7yZ9dvu0FLDpesG2 (BS. Nguyễn Thị Hoa)
bs012 → qE9BAaA6dXhCVuARwSe6fcQ4Gp62 (BS. Trần Văn Khoa)
bs013 → 1wroWrjwr1OjczM19LSRwSwvGI02 (BS. Phạm Minh Quân)
bs014 → rplTCJlrt7f6F4g6Yh4TzbQWlfI2 (BS. Lê Thị Hằng)
bs015 → DAKjXXMthLQT0EV4hXZfLzgrrLA2 (BS. Nguyễn Văn Hải)
bs016 → RdllWOpf11Mhwz4NtsupNkDz2Vq2 (BS. Đặng Thị Thảo)
```

## Kiểm tra sau khi sửa

1. Đăng nhập với tài khoản bác sĩ bất kỳ
2. Vào trang **Tin nhắn** (`/doctor/chats`)
3. Bác sĩ sẽ thấy tất cả tin nhắn từ bệnh nhân

## Giải pháp tạm thời (nếu không thể deploy rules ngay)

Để bệnh nhân gửi tin nhắn MỚI cho bác sĩ:
1. Đăng nhập với tài khoản bệnh nhân
2. Chọn bác sĩ và gửi tin nhắn mới
3. Conversation mới sẽ tự động có `doctorAuthUid`
4. Bác sĩ sẽ thấy tin nhắn ngay lập tức

## Lưu ý quan trọng

- **Conversations mới** (sau khi cập nhật code) sẽ tự động có `doctorAuthUid`
- **Conversations cũ** cần được cập nhật thủ công hoặc qua script
- **Firestore rules** phải được deploy để script hoạt động
- Sau khi deploy rules, tất cả bác sĩ sẽ thấy tin nhắn ngay lập tức
