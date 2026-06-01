# Hướng dẫn sửa lỗi Chat không hoạt động với một số bác sĩ

## Vấn đề
Người dùng có thể nhắn tin với một số bác sĩ nhưng không nhắn được với một số bác sĩ khác.

## Nguyên nhân
Bác sĩ thiếu trường `authUid` trong Firestore collection `doctors`.

### Tại sao cần authUid?
Khi bệnh nhân gửi tin nhắn cho bác sĩ, hệ thống cần:
1. Tạo/cập nhật conversation với `doctorAuthUid`
2. `doctorAuthUid` = Firebase Auth UID của bác sĩ
3. Dashboard bác sĩ query conversations theo `doctorAuthUid`
4. Nếu thiếu `authUid`, bác sĩ không thể nhận tin nhắn

### Cấu trúc dữ liệu

**Collection: doctors**
```typescript
{
  id: "bs001",              // Document ID
  ten: "BS. Nguyễn Văn An",
  chuyen_khoa: "Tim mạch",
  authUid: "xyz123abc..."   // ← QUAN TRỌNG! Firebase Auth UID
}
```

**Collection: users**
```typescript
{
  uid: "xyz123abc...",      // Firebase Auth UID
  fullName: "Nguyễn Văn An",
  role: "doctor",
  doctorInfo: {
    doctorId: "bs001"       // Link đến doctors collection
  }
}
```

**Collection: conversations**
```typescript
{
  patientId: "patient_uid",
  doctorId: "bs001",                    // ID từ doctors collection
  doctorAuthUid: "xyz123abc...",        // ← QUAN TRỌNG! Để query
  doctorName: "BS. Nguyễn Văn An",
  doctorUnreadCount: 0
}
```

## Cách kiểm tra

### Bước 1: Kiểm tra bác sĩ nào thiếu authUid
```
Vào app và truy cập: /check-all-doctors-auth-uid
Nhấn "Kiểm tra tất cả bác sĩ"
```

Kết quả sẽ hiển thị:
- ✅ Bác sĩ có authUid (màu xanh) → Có thể nhận tin nhắn
- ❌ Bác sĩ thiếu authUid (màu đỏ) → KHÔNG thể nhận tin nhắn

### Bước 2: Tự động sửa
```
Vào app và truy cập: /fix-all-doctors-auth-uid
Nhấn "Sửa tất cả bác sĩ"
```

Công cụ này sẽ:
1. Tìm tất cả bác sĩ thiếu authUid
2. Tìm tài khoản user tương ứng (role=doctor)
3. Lấy uid từ user và cập nhật vào doctors.authUid

### Bước 3: Kiểm tra lại
```
Vào lại: /check-all-doctors-auth-uid
```

Tất cả bác sĩ phải có ✅ màu xanh.

## Nếu vẫn có bác sĩ thiếu authUid

### Trường hợp 1: Bác sĩ chưa có tài khoản user
**Triệu chứng:**
- Công cụ báo "Không tìm thấy tài khoản user"
- Bác sĩ không thể đăng nhập

**Giải pháp:**
```
Vào: /seed-doctor-accounts
Nhấn "Tạo tài khoản cho tất cả bác sĩ"
```

Sau đó chạy lại `/fix-all-doctors-auth-uid`

### Trường hợp 2: Tài khoản user không có doctorInfo.doctorId
**Triệu chứng:**
- Bác sĩ có thể đăng nhập
- Nhưng công cụ không tìm thấy match

**Giải pháp:**
```
Vào: /sync-all-doctor-ids
Nhấn "Đồng bộ tất cả"
```

Công cụ này sẽ:
1. Tìm user có role=doctor
2. Match với doctors collection theo tên
3. Cập nhật doctorInfo.doctorId

Sau đó chạy lại `/fix-all-doctors-auth-uid`

## Test sau khi sửa

### Test 1: Gửi tin nhắn
1. **Đăng nhập tài khoản bệnh nhân**
2. **Chọn bác sĩ** (ví dụ: BS. Trần Thị Lan)
3. **Nhấn icon chat** hoặc vào trang chi tiết bác sĩ
4. **Gửi tin nhắn**: "Xin chào bác sĩ"

Kết quả mong đợi:
- ✅ Tin nhắn gửi thành công
- ✅ Không có lỗi trong console
- ✅ Conversation được tạo với đầy đủ thông tin

### Test 2: Bác sĩ nhận tin nhắn
1. **Đăng nhập tài khoản bác sĩ** (BS. Trần Thị Lan)
2. **Vào Dashboard**
3. **Kiểm tra badge** trên icon "Tin nhắn"

Kết quả mong đợi:
- ✅ Badge hiển thị số "1"
- ✅ Vào "Tin nhắn" thấy conversation với bệnh nhân
- ✅ Có thể đọc và trả lời tin nhắn

### Test 3: Test tất cả bác sĩ
Lặp lại Test 1 và Test 2 với từng bác sĩ trong danh sách.

## Công cụ hỗ trợ

### 1. /check-all-doctors-auth-uid
- Kiểm tra bác sĩ nào có/thiếu authUid
- Hiển thị danh sách chi tiết
- Màu xanh = OK, màu đỏ = Lỗi

### 2. /fix-all-doctors-auth-uid
- Tự động thêm authUid cho bác sĩ thiếu
- Match user account theo doctorId hoặc tên
- Hiển thị log chi tiết

### 3. /seed-doctor-accounts
- Tạo tài khoản Firebase Auth cho tất cả bác sĩ
- Email: [doctorId]@heatlecare.com
- Password: doctor123

### 4. /sync-all-doctor-ids
- Đồng bộ doctorInfo.doctorId trong users
- Match theo tên bác sĩ
- Cập nhật authUid trong doctors

### 5. /debug-unread-messages
- Kiểm tra conversations của bác sĩ
- Xem doctorAuthUid có đúng không
- Debug badge tin nhắn

## Flow hoạt động đúng

### Khi bệnh nhân gửi tin nhắn:
```
1. Bệnh nhân chọn bác sĩ (doctorId = "bs001")
2. App tìm doctor document (id = "bs001")
3. Lấy authUid từ doctor document
4. Tạo/cập nhật conversation:
   {
     doctorId: "bs001",
     doctorAuthUid: "xyz123abc...",  ← Từ doctors.authUid
     doctorUnreadCount: 1
   }
5. Tạo message mới
```

### Khi bác sĩ xem dashboard:
```
1. Bác sĩ đăng nhập (userData.uid = "xyz123abc...")
2. Dashboard query conversations:
   where('doctorAuthUid', '==', 'xyz123abc...')
3. Tính tổng doctorUnreadCount
4. Hiển thị badge
```

### Nếu thiếu authUid:
```
1. Conversation được tạo với doctorAuthUid = "bs001" (SAI!)
2. Dashboard query với doctorAuthUid = "xyz123abc..."
3. Không tìm thấy conversation → Badge = 0
4. Bác sĩ không thấy tin nhắn
```

## Cấu trúc code

### app/doctor-chat.tsx (Bệnh nhân gửi tin)
```typescript
// Lấy authUid từ doctors collection
const doctorData = await getDocumentById('doctors', doctorId);
const doctorAuthUid = doctorData?.authUid || doctorId; // Fallback

// Tạo conversation
await createDocument('conversations', {
  doctorId: doctorId,           // bs001
  doctorAuthUid: doctorAuthUid, // xyz123abc... ← QUAN TRỌNG!
  doctorUnreadCount: 0
});
```

### app/doctor/dashboard.tsx (Bác sĩ xem tin nhắn)
```typescript
// Query conversations theo authUid
const conversations = await getDocumentsWithQuery('conversations', [
  where('doctorAuthUid', '==', userData.uid) // xyz123abc...
]);

// Tính tổng unread
let totalUnread = 0;
conversations.forEach(conv => {
  totalUnread += conv.doctorUnreadCount || 0;
});
```

## Troubleshooting

### Vấn đề: Công cụ báo "Không tìm thấy tài khoản user"
**Nguyên nhân:** Bác sĩ chưa có tài khoản Firebase Auth

**Giải pháp:**
1. Chạy `/seed-doctor-accounts` để tạo tài khoản
2. Chạy lại `/fix-all-doctors-auth-uid`

### Vấn đề: Công cụ match sai bác sĩ
**Nguyên nhân:** Có nhiều bác sĩ cùng tên hoặc tên không khớp

**Giải pháp:**
1. Kiểm tra log chi tiết
2. Cập nhật thủ công trong Firestore:
   - Vào doctors collection
   - Tìm document của bác sĩ
   - Thêm field `authUid` với giá trị từ users.uid

### Vấn đề: Badge vẫn không hiển thị sau khi sửa
**Nguyên nhân:** Conversations cũ vẫn dùng doctorAuthUid sai

**Giải pháp:**
1. Chạy `/fix-conversations-doctor-auth-uid` để cập nhật conversations cũ
2. Hoặc xóa conversations cũ và tạo mới

### Vấn đề: Một số bác sĩ OK, một số vẫn lỗi
**Nguyên nhân:** Chỉ một số bác sĩ thiếu authUid

**Giải pháp:**
1. Chạy `/check-all-doctors-auth-uid` để xem bác sĩ nào lỗi
2. Chạy `/fix-all-doctors-auth-uid` để sửa
3. Nếu vẫn lỗi, kiểm tra từng bác sĩ trong Firestore

## Checklist hoàn chỉnh

- [ ] Chạy `/check-all-doctors-auth-uid` - Xem bác sĩ nào thiếu authUid
- [ ] Nếu có bác sĩ thiếu, chạy `/fix-all-doctors-auth-uid`
- [ ] Nếu báo "Không tìm thấy user", chạy `/seed-doctor-accounts`
- [ ] Chạy lại `/fix-all-doctors-auth-uid`
- [ ] Kiểm tra lại `/check-all-doctors-auth-uid` - Tất cả phải ✅
- [ ] Test gửi tin nhắn với từng bác sĩ
- [ ] Kiểm tra badge hiển thị đúng trên dashboard bác sĩ
- [ ] Chạy `/fix-conversation-unread-field` để cập nhật field name
- [ ] Test lại toàn bộ flow chat

## Kết luận

Sau khi hoàn thành các bước trên:
- ✅ Tất cả bác sĩ đều có authUid
- ✅ Bệnh nhân có thể nhắn tin với bất kỳ bác sĩ nào
- ✅ Bác sĩ nhận được tin nhắn và thấy badge
- ✅ Chat hoạt động bình thường cho tất cả bác sĩ

Nếu vẫn gặp vấn đề, hãy:
1. Kiểm tra console logs
2. Chạy các công cụ debug
3. Kiểm tra Firestore rules
4. Xem dữ liệu trực tiếp trong Firestore Console
