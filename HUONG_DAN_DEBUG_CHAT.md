# 🔍 HƯỚNG DẪN DEBUG CHAT - BÁC SĨ KHÔNG THẤY TIN NHẮN

## ❌ Vấn đề

Người dùng (bệnh nhân) gửi tin nhắn cho bác sĩ, nhưng bác sĩ vào trang tin nhắn **KHÔNG THẤY** conversation hoặc tin nhắn.

---

## 🔧 Cách debug

### Bước 1: Chạy script debug

1. Mở app
2. Vào trang: `app/debug-chat-issue.tsx`
3. Bấm nút **"Chạy Debug"**
4. Xem kết quả trong logs

### Bước 2: Phân tích kết quả

Script sẽ kiểm tra:

#### Nếu đăng nhập bằng **tài khoản bác sĩ**:

```
✅ Doctor ID từ doctorInfo: bs004
✅ Doctor UID từ auth: abc123xyz...

Kiểm tra doctor document: bs004
  ✅ authUid trong doctor doc: abc123xyz...
  ✅ authUid KHỚP với UID hiện tại

Query conversations theo 3 cách:
  1. doctorId = bs004: 2 conversations ✅
     - Conv 1: Nguyễn Văn A (Xin chào bác sĩ...)
     - Conv 2: Trần Thị B (Tôi bị đau đầu...)
  2. doctorId = abc123xyz...: 0 conversations
  3. doctorAuthUid = abc123xyz...: 2 conversations ✅
     - Conv 1: Nguyễn Văn A (Xin chào bác sĩ...)
     - Conv 2: Trần Thị B (Tôi bị đau đầu...)

TỔNG SỐ CONVERSATIONS DUY NHẤT: 2 ✅
```

**=> Nếu thấy kết quả như trên: HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG**

#### Nếu đăng nhập bằng **tài khoản bệnh nhân**:

```
Số conversations: 1 ✅

Conversation 1:
  - ID: conv123
  - Doctor ID: bs004 ✅
  - Doctor AuthUid: abc123xyz... ✅
  - Doctor Name: BS. Nguyễn Văn An
  - Last Message: Xin chào bác sĩ
  - Unread (Patient): 0
  - Unread (Doctor): 1
  - Doctor authUid trong doc: abc123xyz... ✅
```

**=> Nếu thấy kết quả như trên: CONVERSATION ĐƯỢC TẠO ĐÚNG**

---

## 🚨 Các lỗi thường gặp

### Lỗi 1: Doctor document thiếu authUid

```
❌ Doctor ID từ doctorInfo: bs004
✅ Doctor UID từ auth: abc123xyz...

Kiểm tra doctor document: bs004
  ❌ authUid trong doctor doc: KHÔNG CÓ

Query conversations theo 3 cách:
  1. doctorId = bs004: 2 conversations ✅
  2. doctorId = abc123xyz...: 0 conversations
  3. doctorAuthUid = abc123xyz...: 0 conversations ❌

TỔNG SỐ CONVERSATIONS DUY NHẤT: 2
```

**Nguyên nhân:** Doctor document thiếu field `authUid`

**Giải pháp:**
```bash
# Chạy script
app/fix-doctor-auth-uid.tsx
```

---

### Lỗi 2: Conversation thiếu doctorAuthUid

```
Conversation 1:
  - ID: conv123
  - Doctor ID: bs004 ✅
  - Doctor AuthUid: KHÔNG CÓ ❌
  - Doctor Name: BS. Nguyễn Văn An
  - Doctor authUid trong doc: abc123xyz... ✅
  ⚠️ Conversation thiếu doctorAuthUid!
    Cần chạy: fix-conversations-auth-uid.tsx
```

**Nguyên nhân:** Conversation thiếu field `doctorAuthUid`

**Giải pháp:**
```bash
# Chạy script
app/fix-conversations-auth-uid.tsx
```

---

### Lỗi 3: authUid không khớp

```
Kiểm tra doctor document: bs004
  ⚠️ authUid trong doctor doc: xyz789abc...
  ⚠️ authUid KHÔNG KHỚP với UID hiện tại!
    Expected: abc123xyz...
    Got: xyz789abc...
```

**Nguyên nhân:** 
- Bác sĩ đăng nhập bằng tài khoản khác
- Doctor document có authUid sai

**Giải pháp:**
1. Kiểm tra xem bác sĩ đăng nhập đúng tài khoản chưa
2. Nếu đúng, chạy lại script `fix-doctor-auth-uid.tsx`

---

### Lỗi 4: Không tìm thấy conversation nào

```
Query conversations theo 3 cách:
  1. doctorId = bs004: 0 conversations
  2. doctorId = abc123xyz...: 0 conversations
  3. doctorAuthUid = abc123xyz...: 0 conversations

TỔNG SỐ CONVERSATIONS DUY NHẤT: 0 ❌

❌ KHÔNG TÌM THẤY CONVERSATION NÀO!

Nguyên nhân có thể:
  1. Chưa có bệnh nhân nào nhắn tin cho bác sĩ này
  2. Doctor document thiếu authUid
  3. Conversations thiếu doctorAuthUid

Giải pháp:
  - Chạy script: fix-doctor-auth-uid.tsx
  - Chạy script: fix-conversations-auth-uid.tsx
```

**Giải pháp:**
1. Kiểm tra xem có bệnh nhân nào đã gửi tin nhắn chưa
2. Chạy 2 script fix như hướng dẫn

---

## 📊 Cấu trúc dữ liệu đúng

### Doctor Document (trong collection `doctors`)

```json
{
  "id": "bs004",
  "ten": "BS. Nguyễn Văn An",
  "chuyen_khoa": "Tim mạch",
  "authUid": "abc123xyz...",  // ← QUAN TRỌNG: Firebase Auth UID
  ...
}
```

### User Document (trong collection `users`)

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

### Conversation Document (trong collection `conversations`)

```json
{
  "id": "conv123",
  "patientId": "patient-uid-123",
  "patientName": "Nguyễn Văn A",
  "doctorId": "bs004",  // ← ID từ doctors collection
  "doctorAuthUid": "abc123xyz...",  // ← QUAN TRỌNG: Firebase Auth UID
  "doctorName": "BS. Nguyễn Văn An",
  "lastMessage": "Xin chào bác sĩ",
  "lastMessageTimestamp": Timestamp,
  "doctorUnreadCount": 1,  // ← Số tin nhắn chưa đọc của bác sĩ
  "unreadCountPatient": 0,
  ...
}
```

---

## 🔄 Flow hoạt động đúng

### 1. Bệnh nhân gửi tin nhắn

```typescript
// app/doctor-chat.tsx

// Tạo conversation mới
const newConversation = await createDocument('conversations', {
  patientId: userData.uid,
  doctorId: doctorId,  // bs004
  doctorAuthUid: doctorAuthUid,  // abc123xyz... (lấy từ doctor document)
  ...
});

// Gửi tin nhắn
await createDocument('messages', {
  conversationId: conversationId,
  text: messageText,
  senderId: userData.uid,
  senderType: 'patient',
  ...
});

// Cập nhật conversation
await updateDocument('conversations', conversationId, {
  lastMessage: messageText,
  doctorUnreadCount: currentUnread + 1,  // Tăng unread count
  ...
});
```

### 2. Bác sĩ xem danh sách tin nhắn

```typescript
// app/doctor/chats.tsx

// Query theo 3 cách
const convsByDoctorId = await getDocumentsWithQuery('conversations', [
  where('doctorId', '==', doctorIdFromInfo)  // bs004
]);

const convsByAuthUid = await getDocumentsWithQuery('conversations', [
  where('doctorAuthUid', '==', doctorUid)  // abc123xyz...
]);

// Merge và hiển thị
const conversations = [...convsByDoctorId, ...convsByAuthUid];
```

### 3. Bác sĩ đọc tin nhắn

```typescript
// app/doctor/chat-detail.tsx

// Load messages
const messages = await getDocumentsWithQuery('messages', [
  where('conversationId', '==', conversationId)
]);

// Mark as read
await updateDocument('messages', messageId, { read: true });

// Reset unread count
await updateDocument('conversations', conversationId, {
  doctorUnreadCount: 0
});
```

---

## ✅ Checklist kiểm tra

- [ ] Tất cả doctor documents có field `authUid`
- [ ] Tất cả conversations có field `doctorAuthUid`
- [ ] `authUid` trong doctor document khớp với Firebase Auth UID
- [ ] `doctorAuthUid` trong conversation khớp với `authUid` trong doctor document
- [ ] Bác sĩ đăng nhập đúng tài khoản
- [ ] Bệnh nhân đã gửi tin nhắn cho bác sĩ
- [ ] `doctorUnreadCount` được cập nhật khi bệnh nhân gửi tin nhắn

---

## 🚀 Các script hỗ trợ

1. **`app/debug-chat-issue.tsx`** - Debug toàn bộ hệ thống chat
2. **`app/fix-doctor-auth-uid.tsx`** - Thêm authUid cho doctors
3. **`app/fix-conversations-auth-uid.tsx`** - Thêm doctorAuthUid cho conversations
4. **`app/check-all-doctors-auth-uid.tsx`** - Kiểm tra authUid của tất cả doctors

---

## 📞 Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn, vui lòng:
1. Chạy script debug và chụp màn hình logs
2. Kiểm tra Firebase Console xem dữ liệu có đúng không
3. Liên hệ team dev để được hỗ trợ

---

**Ngày tạo:** 31/05/2026  
**Người tạo:** Kiro AI Assistant  
**Phiên bản:** 1.0
