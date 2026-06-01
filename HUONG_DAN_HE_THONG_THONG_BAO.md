# 📱 HỆ THỐNG THÔNG BÁO - HƯỚNG DẪN HOÀN CHỈNH

## ✅ Tổng quan

Hệ thống thông báo đã được tích hợp đầy đủ vào app với các tính năng:

### 1. **Thông báo tin nhắn từ bác sĩ** 💬
- Khi bác sĩ gửi tin nhắn → bệnh nhân nhận thông báo ngay lập tức
- Hiển thị tên bác sĩ và nội dung tin nhắn
- Lưu vào Firestore để xem lại trong app

### 2. **Thông báo đặt lịch thành công** ✅
- Khi đặt lịch khám → gửi thông báo xác nhận
- Hiển thị thông tin bác sĩ, ngày giờ khám

### 3. **Thông báo nhắc lịch khám** ⏰
- Nhắc trước 1 ngày (9:00 AM)
- Nhắc trước 1 giờ
- Tự động lên lịch khi đặt lịch thành công

### 4. **Thông báo thay đổi lịch khám** 🔄
- Khi lịch khám bị thay đổi
- Hiển thị thời gian mới

### 5. **Tính năng swipe-to-delete** 🗑️
- Kéo sang trái để xóa thông báo
- Animation mượt mà
- Áp dụng cho cả trang thông báo và danh sách chat bác sĩ

---

## 📂 Cấu trúc file

### 1. **Service Layer**

#### `app/services/notificationService.ts`
```typescript
// Các function chính:
- registerForPushNotifications() // Đăng ký push notification
- sendLocalNotification() // Gửi thông báo local
- scheduleNotification() // Lên lịch thông báo
- notifyNewMessage() // Thông báo tin nhắn mới
- notifyNewAppointment() // Thông báo đặt lịch thành công
- notifyAppointmentChanged() // Thông báo thay đổi lịch
- scheduleAppointmentReminder() // Nhắc lịch trước 1 ngày
- scheduleAppointmentReminderOneHour() // Nhắc lịch trước 1 giờ
```

### 2. **UI Components**

#### `app/notifications.tsx`
- Trang hiển thị danh sách thông báo
- Tab "Tất cả" và "Chưa đọc"
- Swipe-to-delete
- Icon và màu sắc theo loại thông báo

#### `app/doctor/chats.tsx`
- Danh sách tin nhắn của bác sĩ
- Swipe-to-delete conversations
- Badge số tin nhắn chưa đọc

#### `app/doctor/chat-detail.tsx`
- Trang chat chi tiết của bác sĩ
- **Tích hợp gửi thông báo khi bác sĩ trả lời**
- Tự động tạo notification trong Firestore

#### `app/booking-success.tsx`
- Trang thành công sau khi đặt lịch
- **Tự động gửi 3 loại thông báo:**
  1. Thông báo đặt lịch thành công (ngay lập tức)
  2. Nhắc lịch trước 1 ngày
  3. Nhắc lịch trước 1 giờ

#### `app/_layout.tsx`
- **Setup notification listeners toàn app**
- Đăng ký push notification khi user đăng nhập
- Listen notification khi app đang mở
- Handle navigation khi user tap vào notification

---

## 🔧 Cách hoạt động

### Flow 1: Bác sĩ gửi tin nhắn → Bệnh nhân nhận thông báo

```
1. Bác sĩ gửi tin nhắn trong app/doctor/chat-detail.tsx
   ↓
2. handleSend() được gọi
   ↓
3. Tạo message trong Firestore
   ↓
4. Gửi local notification: notificationService.notifyNewMessage()
   ↓
5. Tạo notification document trong Firestore
   ↓
6. Bệnh nhân nhận thông báo (nếu app đang mở hoặc background)
   ↓
7. Notification hiển thị trong app/notifications.tsx
```

### Flow 2: Đặt lịch khám → Gửi thông báo

```
1. User đặt lịch thành công → Navigate to booking-success.tsx
   ↓
2. useEffect() tự động gọi sendBookingNotifications()
   ↓
3. Gửi 3 loại thông báo:
   - notifyNewAppointment() → Thông báo ngay
   - scheduleAppointmentReminder() → Lên lịch nhắc 1 ngày trước
   - scheduleAppointmentReminderOneHour() → Lên lịch nhắc 1 giờ trước
   ↓
4. Tạo notification document trong Firestore
   ↓
5. User nhận thông báo theo lịch đã đặt
```

### Flow 3: User xem thông báo

```
1. User mở app/notifications.tsx
   ↓
2. Load notifications từ Firestore (filter theo userId)
   ↓
3. Hiển thị danh sách với icon và màu sắc theo type
   ↓
4. User click vào notification → Đánh dấu đã đọc
   ↓
5. User swipe sang trái → Hiện nút Xóa → Xóa khỏi Firestore
```

---

## 🎨 UI/UX Features

### 1. **Icon và màu sắc theo loại thông báo**

| Loại | Icon | Màu |
|------|------|-----|
| Tin nhắn | 💬 chatbubble | #2196F3 (xanh dương) |
| Lịch khám | 📅 calendar | #00BCD4 (cyan) |
| Thuốc | 💊 medical | #4CAF50 (xanh lá) |
| Xét nghiệm | 📋 document-text | #FF9800 (cam) |
| Đơn thuốc | 💊 receipt | #9C27B0 (tím) |

### 2. **Swipe-to-delete**
- Kéo sang trái → Hiện nút "Xóa" màu đỏ (#ef4444)
- Animation mượt mà với Animated API
- Áp dụng cho:
  - Danh sách thông báo
  - Danh sách chat của bác sĩ

### 3. **Badge số lượng chưa đọc**
- Hiển thị trên icon thông báo
- Cập nhật real-time
- Màu cyan (#00BCD4)

---

## 🔔 Notification Types

### Firestore Schema

```typescript
interface Notification {
  id: string;
  userId: string; // ID của người nhận
  title: string; // Tiêu đề thông báo
  body: string; // Nội dung
  type: 'appointment' | 'medication' | 'test_result' | 'prescription' | 'message' | 'general';
  read: boolean; // Đã đọc chưa
  createdAt: string; // ISO timestamp
  data?: {
    // Dữ liệu tùy chỉnh theo type
    conversationId?: string;
    doctorId?: string;
    doctorName?: string;
    appointmentCode?: string;
    // ...
  };
}
```

---

## 📱 Testing

### Test thông báo tin nhắn:
1. Đăng nhập tài khoản bác sĩ
2. Vào trang chat với bệnh nhân
3. Gửi tin nhắn
4. Kiểm tra bệnh nhân nhận được thông báo

### Test thông báo đặt lịch:
1. Đăng nhập tài khoản bệnh nhân
2. Đặt lịch khám với bác sĩ
3. Kiểm tra nhận được thông báo xác nhận
4. Kiểm tra notification được lên lịch (xem console log)

### Test swipe-to-delete:
1. Vào trang thông báo
2. Kéo một thông báo sang trái
3. Ấn nút "Xóa"
4. Kiểm tra thông báo đã bị xóa

---

## 🚀 Cải tiến trong tương lai

1. **Push notification thực sự** (hiện tại chỉ là local notification)
   - Cần setup Firebase Cloud Messaging (FCM)
   - Gửi notification từ server khi có sự kiện

2. **Notification sound tùy chỉnh**
   - Âm thanh khác nhau cho từng loại thông báo

3. **Rich notification**
   - Hiển thị ảnh bác sĩ trong notification
   - Action buttons (Trả lời, Xem chi tiết)

4. **Notification history**
   - Lưu trữ lâu dài
   - Tìm kiếm thông báo

5. **Notification settings**
   - Cho phép user bật/tắt từng loại thông báo
   - Chọn thời gian nhận thông báo

---

## 📝 Notes

- Thông báo được lưu trong Firestore collection `notifications`
- Local notification sử dụng `expo-notifications`
- Swipe-to-delete sử dụng `react-native-gesture-handler`
- Animation sử dụng `Animated` API của React Native

---

## ✅ Checklist hoàn thành

- [x] Thông báo tin nhắn từ bác sĩ
- [x] Thông báo đặt lịch thành công
- [x] Thông báo nhắc lịch khám (1 ngày trước)
- [x] Thông báo nhắc lịch khám (1 giờ trước)
- [x] Thông báo thay đổi lịch khám
- [x] Swipe-to-delete cho thông báo
- [x] Swipe-to-delete cho chat bác sĩ
- [x] Icon và màu sắc theo loại
- [x] Badge số lượng chưa đọc
- [x] Notification listener toàn app
- [x] Tích hợp vào booking flow
- [x] Tích hợp vào chat flow

---

**Ngày cập nhật:** 01/06/2026
**Phiên bản:** 1.0.0
