# Hướng dẫn sửa Badge Tin nhắn chưa đọc

## Vấn đề
Badge tin nhắn chưa đọc không hiển thị trên icon "Tin nhắn" ở dashboard của bác sĩ.

## Nguyên nhân
1. **Tên trường không nhất quán**: Code sử dụng 2 tên trường khác nhau:
   - `unreadCountDoctor` (tên cũ)
   - `doctorUnreadCount` (tên mới, đúng)

2. **Logic tăng số lượng sai**: Khi bệnh nhân gửi tin nhắn, code đặt `unreadCountDoctor = 1` thay vì tăng thêm 1.

## Đã sửa

### 1. Thống nhất tên trường
- ✅ Đổi tất cả `unreadCountDoctor` thành `doctorUnreadCount`
- ✅ Cập nhật trong `app/doctor/chat-detail.tsx`
- ✅ Cập nhật trong `app/doctor-chat.tsx`
- ✅ Dashboard đã dùng đúng tên `doctorUnreadCount`

### 2. Sửa logic tăng số lượng
**Trước:**
```typescript
// Sai - đặt cứng = 1
await updateDocument('conversations', conversationId, {
  unreadCountDoctor: 1,
});
```

**Sau:**
```typescript
// Đúng - tăng thêm 1 vào giá trị hiện tại
const conversations = await getDocumentsWithQuery('conversations', [
  where('id', '==', conversationId)
]);
const currentUnread = conversations.length > 0 ? (conversations[0].doctorUnreadCount || 0) : 0;

await updateDocument('conversations', conversationId, {
  doctorUnreadCount: currentUnread + 1,
});
```

### 3. Tạo công cụ migration
- ✅ Tạo `/fix-conversation-unread-field` để cập nhật conversations cũ

## Cách kiểm tra

### Bước 1: Chạy công cụ migration
```
Vào app và truy cập: /fix-conversation-unread-field
Nhấn "Cập nhật conversations"
```

Công cụ này sẽ:
- Đổi tên trường `unreadCountDoctor` → `doctorUnreadCount`
- Thêm trường `doctorUnreadCount = 0` nếu chưa có
- Giữ nguyên giá trị unread count hiện tại

### Bước 2: Kiểm tra với debug tool
```
Vào app và truy cập: /debug-unread-messages
Nhấn "Kiểm tra tin nhắn chưa đọc"
```

Kết quả mong đợi:
```
✅ Tìm thấy X conversations
📊 Tổng tin nhắn chưa đọc: Y
```

Nếu thấy:
- `doctorUnreadCount (new): 0` → Đúng, trường mới đã có
- `unreadCountDoctor (old): X` → Trường cũ vẫn còn (không sao, sẽ bị bỏ qua)

### Bước 3: Test gửi tin nhắn
1. **Đăng nhập tài khoản bệnh nhân**
2. **Vào chat với bác sĩ** (ví dụ: BS. Nguyễn Văn An)
3. **Gửi tin nhắn**: "Xin chào bác sĩ"
4. **Đăng nhập tài khoản bác sĩ**
5. **Vào Dashboard** → Kiểm tra icon "Tin nhắn"

Kết quả mong đợi:
- ✅ Badge màu đỏ hiển thị số "1" ở góc trên bên phải icon "Tin nhắn"
- ✅ Khi gửi thêm tin nhắn, số tăng lên (2, 3, 4...)
- ✅ Khi bác sĩ vào chat và đọc tin nhắn, badge biến mất (số = 0)

### Bước 4: Test nhiều conversations
1. **Gửi tin nhắn từ nhiều bệnh nhân khác nhau**
2. **Kiểm tra dashboard bác sĩ**

Kết quả mong đợi:
- Badge hiển thị tổng số tin nhắn chưa đọc từ tất cả bệnh nhân
- Ví dụ: Bệnh nhân A gửi 2 tin, Bệnh nhân B gửi 3 tin → Badge hiển thị "5"

## Vị trí badge

Badge được hiển thị tại:
```
Dashboard → Bottom Navigation → Icon "Tin nhắn" (chatbubbles-outline)
```

Style của badge:
- Màu nền: `#ef4444` (đỏ)
- Vị trí: `top: -4, right: -8` (góc trên bên phải icon)
- Font: `10px, bold, white`
- Hiển thị "99+" nếu số > 99

## Files đã thay đổi

1. **app/doctor/dashboard.tsx**
   - Đã có sẵn logic hiển thị badge đúng
   - Sử dụng `doctorUnreadCount` field

2. **app/doctor/chat-detail.tsx**
   - Đổi `unreadCountDoctor` → `doctorUnreadCount`
   - Sửa logic tăng unread count khi bác sĩ gửi tin

3. **app/doctor-chat.tsx**
   - Đổi `unreadCountDoctor` → `doctorUnreadCount`
   - Sửa logic tăng unread count khi bệnh nhân gửi tin

4. **app/debug-unread-messages.tsx**
   - Hiển thị cả 2 trường để so sánh
   - Giúp debug dễ dàng hơn

5. **app/fix-conversation-unread-field.tsx** (MỚI)
   - Công cụ migration để cập nhật conversations cũ

## Lưu ý quan trọng

### Firestore Rules
Đảm bảo Firestore rules cho phép:
- Bệnh nhân có thể tạo/cập nhật conversations
- Bệnh nhân có thể tạo messages
- Bác sĩ có thể đọc conversations của mình
- Bác sĩ có thể cập nhật conversations (mark as read)

### Cấu trúc Conversation
```typescript
{
  id: string,
  patientId: string,
  patientName: string,
  doctorId: string,
  doctorAuthUid: string,  // Firebase Auth UID của bác sĩ
  doctorName: string,
  lastMessage: string,
  lastMessageTimestamp: Timestamp,
  lastMessageSender: 'patient' | 'doctor',
  unreadCountPatient: number,  // Số tin nhắn bệnh nhân chưa đọc
  doctorUnreadCount: number,   // Số tin nhắn bác sĩ chưa đọc (QUAN TRỌNG!)
  createdAt: Timestamp
}
```

### Flow hoạt động

**Khi bệnh nhân gửi tin nhắn:**
1. Tạo message mới với `senderType: 'patient'`
2. Lấy giá trị `doctorUnreadCount` hiện tại
3. Cập nhật conversation: `doctorUnreadCount = currentValue + 1`

**Khi bác sĩ đọc tin nhắn:**
1. Mark tất cả messages chưa đọc thành `read: true`
2. Cập nhật conversation: `doctorUnreadCount = 0`

**Khi bác sĩ gửi tin nhắn:**
1. Tạo message mới với `senderType: 'doctor'`
2. Lấy giá trị `unreadCountPatient` hiện tại
3. Cập nhật conversation: `unreadCountPatient = currentValue + 1`

**Khi bệnh nhân đọc tin nhắn:**
1. Mark tất cả messages chưa đọc thành `read: true`
2. Cập nhật conversation: `unreadCountPatient = 0`

## Troubleshooting

### Badge không hiển thị
1. Chạy `/debug-unread-messages` để kiểm tra:
   - Có conversations không?
   - `doctorAuthUid` có đúng không?
   - `doctorUnreadCount` có giá trị > 0 không?

2. Kiểm tra console logs:
   - `💬 [Dashboard] Loading unread messages for doctorAuthUid: ...`
   - `💬 [Dashboard] Found X conversations`
   - `💬 [Dashboard] Total unread messages: Y`

3. Nếu không có conversations:
   - Bệnh nhân chưa gửi tin nhắn nào
   - Hoặc `doctorAuthUid` không khớp

### Badge hiển thị số sai
1. Chạy `/fix-conversation-unread-field` để cập nhật lại
2. Yêu cầu bệnh nhân gửi tin nhắn mới
3. Kiểm tra lại dashboard

### Badge không tăng khi có tin nhắn mới
1. Kiểm tra code trong `app/doctor-chat.tsx` line 265-275
2. Đảm bảo đang tăng `doctorUnreadCount` chứ không phải set = 1
3. Kiểm tra Firestore rules cho phép update

## Kết luận

Sau khi áp dụng các fix trên, badge tin nhắn chưa đọc sẽ:
- ✅ Hiển thị đúng số lượng tin nhắn chưa đọc
- ✅ Tăng khi có tin nhắn mới từ bệnh nhân
- ✅ Giảm về 0 khi bác sĩ đọc tin nhắn
- ✅ Tổng hợp từ tất cả conversations
- ✅ Hiển thị "99+" nếu quá 99 tin nhắn

Nếu vẫn gặp vấn đề, hãy chạy `/debug-unread-messages` và gửi kết quả để được hỗ trợ thêm.
