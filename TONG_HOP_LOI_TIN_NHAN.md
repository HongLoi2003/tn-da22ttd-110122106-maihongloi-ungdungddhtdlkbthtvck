# 🔍 TỔNG HỢP LỖI TIN NHẮN BÁC SĨ - NGƯỜI DÙNG

## 📋 Danh sách các vấn đề đã phát hiện

### ❌ Vấn đề 1: Bác sĩ không thấy tin nhắn từ người dùng

**Triệu chứng:**
- Người dùng gửi tin nhắn cho bác sĩ
- Bác sĩ vào trang tin nhắn → KHÔNG THẤY conversation
- Hoặc thấy conversation nhưng KHÔNG CÓ badge số tin nhắn chưa đọc

**Nguyên nhân:**
1. Doctor document thiếu field `authUid`
2. Conversation thiếu field `doctorAuthUid`
3. Bác sĩ query conversations nhưng không tìm thấy vì thiếu mapping

**Giải pháp:**
```bash
# Bước 1: Thêm authUid cho tất cả doctors
Chạy: app/fix-doctor-auth-uid.tsx

# Bước 2: Cập nhật tất cả conversations
Chạy: app/fix-conversations-auth-uid.tsx

# Bước 3: Kiểm tra lại
Chạy: app/check-all-doctors-chat-status.tsx
```

---

### ❌ Vấn đề 2: Một số bác sĩ nhận được tin nhắn, một số không

**Triệu chứng:**
- Bác sĩ A: Nhận được tin nhắn bình thường ✅
- Bác sĩ B, C, D: Không nhận được tin nhắn ❌

**Nguyên nhân:**
- Bác sĩ A có `authUid` trong doctor document
- Bác sĩ B, C, D KHÔNG CÓ `authUid`

**Cách kiểm tra:**
```bash
# Chạy script kiểm tra
app/check-all-doctors-chat-status.tsx

# Kết quả sẽ hiển thị:
✅ Hoạt động tốt: 1 bác sĩ (Bác sĩ A)
❌ Có vấn đề: 3 bác sĩ (Bác sĩ B, C, D)
   - Thiếu authUid: 3
```

**Giải pháp:**
```bash
# Chạy script fix
app/fix-doctor-auth-uid.tsx
```

---

### ❌ Vấn đề 3: Người dùng gửi tin nhắn nhưng bác sĩ không thấy badge

**Triệu chứng:**
- Người dùng gửi tin nhắn
- Bác sĩ thấy conversation
- Nhưng KHÔNG CÓ badge số tin nhắn chưa đọc

**Nguyên nhân:**
- Field `doctorUnreadCount` không được cập nhật
- Hoặc bác sĩ đọc field sai tên

**Kiểm tra code:**

**File: `app/doctor-chat.tsx` (Người dùng gửi tin nhắn)**
```typescript
// Line 298 - Cập nhật doctorUnreadCount
await updateDocument('conversations', conversationId, {
  lastMessage: messageText,
  lastMessageTimestamp: Timestamp.now(),
  lastMessageSender: 'patient',
  doctorUnreadCount: currentUnread + 1,  // ✅ ĐÚNG
});
```

**File: `app/doctor/chats.tsx` (Bác sĩ xem danh sách)**
```typescript
// Line 132 - Đọc doctorUnreadCount
return {
  id: conv.id,
  unreadCount: conv.doctorUnreadCount || 0,  // ✅ ĐÚNG
};
```

**=> Tên field ĐÚNG, không phải vấn đề ở đây!**

---

### ❌ Vấn đề 4: Conversation được tạo nhưng thiếu doctorAuthUid

**Triệu chứng:**
- Người dùng gửi tin nhắn lần đầu
- Conversation được tạo
- Nhưng bác sĩ không thấy

**Nguyên nhân:**
- Khi tạo conversation, code cố lấy `authUid` từ doctor document
- Nhưng doctor document KHÔNG CÓ `authUid`
- Nên `doctorAuthUid` = `doctorId` (sai!)

**Kiểm tra code:**

**File: `app/doctor-chat.tsx` (Line 147-156)**
```typescript
// Cố lấy authUid từ doctor document
let doctorAuthUid = doctorId; // Default fallback (SAI!)
try {
  const doctorData = await getDocumentById('doctors', doctorId);
  if (doctorData && (doctorData as any).authUid) {
    doctorAuthUid = (doctorData as any).authUid;  // ✅ ĐÚNG
  } else {
    console.log('Doctor document does not have authUid field');  // ⚠️ VẤN ĐỀ!
  }
} catch (error) {
  console.log('Could not fetch doctor authUid:', error);
}
```

**Giải pháp:**
```bash
# Bước 1: Thêm authUid cho doctors
app/fix-doctor-auth-uid.tsx

# Bước 2: Sửa conversations cũ
app/fix-conversations-auth-uid.tsx
```

---

## 🔧 Các script hỗ trợ

### 1. **check-all-doctors-chat-status.tsx**
**Chức năng:** Kiểm tra tất cả bác sĩ, xem bác sĩ nào có thể nhận tin nhắn

**Kết quả:**
```
✅ Hoạt động tốt: 5 bác sĩ
   - BS. Nguyễn Văn An (bs001) ✅
   - BS. Trần Thị Lan (bs002) ✅
   ...

❌ Có vấn đề: 3 bác sĩ
   - BS. Lê Minh Tâm (bs003) ❌
     • Thiếu authUid trong doctor document
   - BS. Phạm Thu Hà (bs004) ❌
     • Không có user account
   ...
```

### 2. **fix-doctor-auth-uid.tsx**
**Chức năng:** Thêm field `authUid` vào tất cả doctor documents

**Cách hoạt động:**
1. Lấy tất cả doctors từ collection `doctors`
2. Với mỗi doctor, tìm user account tương ứng
3. Lấy `uid` từ user account
4. Cập nhật `authUid` vào doctor document

**Kết quả:**
```
✅ Đã sửa: 8 bác sĩ
⚠️ Không tìm thấy: 2 bác sĩ (cần tạo user account)
```

### 3. **fix-conversations-auth-uid.tsx**
**Chức năng:** Thêm field `doctorAuthUid` vào tất cả conversations

**Cách hoạt động:**
1. Lấy tất cả conversations
2. Với mỗi conversation, lấy `doctorId`
3. Tìm doctor document và lấy `authUid`
4. Cập nhật `doctorAuthUid` vào conversation

**Kết quả:**
```
✅ Đã sửa: 15 conversations
⚠️ Doctor không có authUid: 3 conversations
   → Cần chạy fix-doctor-auth-uid.tsx trước!
```

### 4. **debug-chat-issue.tsx**
**Chức năng:** Debug chi tiết cho 1 user (bác sĩ hoặc bệnh nhân)

**Kết quả (Bác sĩ):**
```
=== DEBUG BÁC SĨ ===
✅ Doctor ID từ doctorInfo: bs004
✅ Doctor UID từ auth: abc123xyz...

Kiểm tra doctor document: bs004
  ✅ authUid trong doctor doc: abc123xyz...
  ✅ authUid KHỚP với UID hiện tại

Query conversations theo 3 cách:
  1. doctorId = bs004: 2 conversations ✅
  2. doctorId = abc123xyz...: 0 conversations
  3. doctorAuthUid = abc123xyz...: 2 conversations ✅

TỔNG SỐ CONVERSATIONS DUY NHẤT: 2 ✅
```

**Kết quả (Bệnh nhân):**
```
=== DEBUG BỆNH NHÂN ===
Số conversations: 1 ✅

Conversation 1:
  - Doctor ID: bs004 ✅
  - Doctor AuthUid: abc123xyz... ✅
  - Last Message: Xin chào bác sĩ
  - Unread (Doctor): 1
```

---

## 📊 Cấu trúc dữ liệu đúng

### Doctor Document
```json
{
  "id": "bs004",
  "ten": "BS. Nguyễn Văn An",
  "chuyen_khoa": "Tim mạch",
  "authUid": "abc123xyz...",  // ← QUAN TRỌNG
  ...
}
```

### User Document (Bác sĩ)
```json
{
  "uid": "abc123xyz...",  // ← Firebase Auth UID
  "fullName": "BS. Nguyễn Văn An",
  "role": "doctor",
  "doctorInfo": {
    "doctorId": "bs004"  // ← Link đến doctor document
  },
  ...
}
```

### Conversation Document
```json
{
  "id": "conv123",
  "patientId": "patient-uid-123",
  "patientName": "Nguyễn Văn A",
  "doctorId": "bs004",  // ← ID từ doctors collection
  "doctorAuthUid": "abc123xyz...",  // ← QUAN TRỌNG
  "doctorName": "BS. Nguyễn Văn An",
  "lastMessage": "Xin chào bác sĩ",
  "doctorUnreadCount": 1,  // ← Số tin nhắn chưa đọc của bác sĩ
  "unreadCountPatient": 0,
  ...
}
```

---

## 🚀 Quy trình sửa lỗi (Step by step)

### Bước 1: Kiểm tra tình trạng hiện tại
```bash
1. Mở app
2. Vào: app/check-all-doctors-chat-status.tsx
3. Bấm "Kiểm tra tất cả"
4. Xem kết quả:
   - Bao nhiêu bác sĩ hoạt động tốt?
   - Bao nhiêu bác sĩ có vấn đề?
   - Vấn đề cụ thể là gì?
```

### Bước 2: Sửa doctor documents
```bash
1. Vào: app/fix-doctor-auth-uid.tsx
2. Bấm "Chạy Script"
3. Đợi hoàn thành
4. Kiểm tra logs:
   ✅ Đã sửa: X bác sĩ
   ⚠️ Không tìm thấy: Y bác sĩ
```

### Bước 3: Sửa conversations
```bash
1. Vào: app/fix-conversations-auth-uid.tsx
2. Bấm "Chạy Script"
3. Đợi hoàn thành
4. Kiểm tra logs:
   ✅ Đã sửa: X conversations
```

### Bước 4: Kiểm tra lại
```bash
1. Vào: app/check-all-doctors-chat-status.tsx
2. Bấm "Kiểm tra tất cả"
3. Kết quả mong đợi:
   ✅ Hoạt động tốt: 100% bác sĩ
   ❌ Có vấn đề: 0 bác sĩ
```

### Bước 5: Test thực tế
```bash
1. Đăng nhập bằng tài khoản bệnh nhân
2. Gửi tin nhắn cho bác sĩ
3. Đăng nhập bằng tài khoản bác sĩ
4. Vào trang tin nhắn
5. Kiểm tra:
   ✅ Thấy conversation
   ✅ Thấy badge số tin nhắn chưa đọc
   ✅ Thấy nội dung tin nhắn
```

---

## ⚠️ Lưu ý quan trọng

### 1. Thứ tự chạy script
**PHẢI chạy theo thứ tự:**
1. `fix-doctor-auth-uid.tsx` (TRƯỚC)
2. `fix-conversations-auth-uid.tsx` (SAU)

**Lý do:** Script 2 cần lấy `authUid` từ doctor documents đã được sửa ở script 1.

### 2. Backup dữ liệu
Trước khi chạy script, nên backup Firebase:
```bash
# Export Firestore data
firebase firestore:export gs://your-bucket/backup
```

### 3. Kiểm tra Firestore Rules
Đảm bảo Firestore rules cho phép:
- Bác sĩ query conversations theo `doctorAuthUid`
- Bệnh nhân tạo conversations mới
- Cập nhật `doctorUnreadCount`

### 4. Tạo user account cho bác sĩ mới
Nếu có bác sĩ mới, cần:
1. Tạo user account (role: doctor)
2. Set `doctorInfo.doctorId` = doctor ID
3. Chạy lại `fix-doctor-auth-uid.tsx`

---

## 📞 Troubleshooting

### Q: Script chạy xong nhưng vẫn không thấy tin nhắn?
**A:** Kiểm tra:
1. Bác sĩ đăng nhập đúng tài khoản chưa?
2. Có conversation nào được tạo chưa? (Bệnh nhân phải gửi tin nhắn trước)
3. Chạy `debug-chat-issue.tsx` để xem chi tiết

### Q: Một số bác sĩ vẫn không nhận được tin nhắn?
**A:** Chạy `check-all-doctors-chat-status.tsx` để xem bác sĩ nào còn vấn đề và nguyên nhân cụ thể.

### Q: Badge không cập nhật sau khi đọc tin nhắn?
**A:** Kiểm tra code trong `app/doctor/chat-detail.tsx` có reset `doctorUnreadCount` = 0 không.

### Q: Conversation mới vẫn thiếu doctorAuthUid?
**A:** Kiểm tra doctor document có `authUid` chưa. Nếu chưa, chạy lại `fix-doctor-auth-uid.tsx`.

---

## ✅ Checklist hoàn thành

- [ ] Tất cả doctor documents có field `authUid`
- [ ] Tất cả conversations có field `doctorAuthUid`
- [ ] `authUid` khớp với Firebase Auth UID
- [ ] Bác sĩ thấy được conversations
- [ ] Badge số tin nhắn chưa đọc hiển thị đúng
- [ ] Badge biến mất sau khi đọc tin nhắn
- [ ] Người dùng gửi tin nhắn → Bác sĩ nhận được ngay lập tức

---

**Ngày tạo:** 31/05/2026  
**Người tạo:** Kiro AI Assistant  
**Phiên bản:** 1.0  
**Trạng thái:** Hoàn thành
