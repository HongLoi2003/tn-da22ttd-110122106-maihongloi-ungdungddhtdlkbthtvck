# 🔧 SỬA LỖI THÔNG BÁO TIN NHẮN BÁC SĨ

## ❌ Vấn đề

Khi người dùng gửi tin nhắn cho bác sĩ, bác sĩ vào trang tin nhắn **KHÔNG THẤY** thông báo tin nhắn mới (badge số tin nhắn chưa đọc).

## 🔍 Nguyên nhân

### 1. **Tên field không nhất quán**

**Khi người dùng gửi tin nhắn** (`app/doctor-chat.tsx` line 298):
```typescript
await updateDocument('conversations', conversationId, {
  lastMessage: messageText,
  lastMessageTimestamp: Timestamp.now(),
  lastMessageSender: 'patient',
  doctorUnreadCount: currentUnread + 1,  // ✅ Tăng doctorUnreadCount
});
```

**Khi bác sĩ hiển thị danh sách chat** (`app/doctor/chats.tsx` line 132):
```typescript
return {
  id: conv.id,
  patientId: conv.patientId || '',
  patientName: conv.patientName || 'Bệnh nhân',
  unreadCount: conv.doctorUnreadCount || 0,  // ✅ Đọc doctorUnreadCount
};
```

**=> Tên field ĐÚNG, không phải vấn đề ở đây!**

### 2. **Vấn đề thực sự: Query không tìm thấy conversation**

Bác sĩ query conversation theo 3 cách:
1. `where('doctorId', '==', doctorIdFromInfo)` - doctorId từ doctorInfo (ví dụ: bs004)
2. `where('doctorId', '==', doctorUid)` - Firebase Auth UID
3. `where('doctorAuthUid', '==', doctorUid)` - Field mới

**Nhưng khi người dùng tạo conversation mới** (`app/doctor-chat.tsx` line 157):
```typescript
const newConversation = await createDocument('conversations', {
  patientId: userData.uid,
  patientName: userData.fullName || 'Bệnh nhân',
  patientAvatar: userData.avatar || '',
  doctorId: doctorId,              // ✅ ID từ doctors collection (bs004)
  doctorAuthUid: doctorAuthUid,    // ✅ Firebase Auth UID
  doctorIdOriginal: doctorId,      // ✅ Backup
  doctorName: doctorName,
  doctorSpecialty: doctorSpecialty,
  lastMessage: '',
  lastMessageTimestamp: Timestamp.now(),
  lastMessageSender: '',
  unreadCountPatient: 0,
  doctorUnreadCount: 0,            // ✅ Khởi tạo đúng
  createdAt: Timestamp.now(),
});
```

**Vấn đề:** `doctorAuthUid` có thể không được lấy đúng!

---

## ✅ Giải pháp

### Bước 1: Kiểm tra mapping doctorId → authUid

Xem file `app/doctor-chat.tsx` line 147-156:

```typescript
// Cần map doctorId (bs004) sang Firebase Auth UID
let doctorAuthUid = doctorId; // Default fallback
try {
  const { getDocumentById } = await import('./services/firebaseService');
  const doctorData = await getDocumentById('doctors', doctorId);
  if (doctorData && (doctorData as any).authUid) {
    doctorAuthUid = (doctorData as any).authUid;
    console.log('Found doctor authUid:', doctorAuthUid);
  } else {
    console.log('Doctor document does not have authUid field');  // ⚠️ VẤN ĐỀ Ở ĐÂY!
  }
} catch (error) {
  console.log('Could not fetch doctor authUid:', error);
}
```

**Nếu doctor document không có field `authUid`, thì `doctorAuthUid` sẽ bằng `doctorId` (bs004) thay vì Firebase Auth UID!**

### Bước 2: Đảm bảo tất cả doctor có field authUid

Chạy script để sync authUid cho tất cả bác sĩ:

```bash
# Đã có sẵn script này
app/sync-all-doctor-ids.tsx
app/auto-map-all-doctors.tsx
```

Hoặc tạo script mới:

```typescript
// app/fix-doctor-auth-uid.tsx
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDocumentsWithQuery, updateDocument } from './services/firebaseService';
import { where } from 'firebase/firestore';

export default function FixDoctorAuthUid() {
  const fixAuthUid = async () => {
    try {
      console.log('🔧 Fixing doctor authUid...');
      
      // 1. Lấy tất cả doctors
      const doctors = await getDocumentsWithQuery('doctors', []);
      console.log('Found', doctors.length, 'doctors');
      
      for (const doctor of doctors) {
        const doctorId = doctor.id; // bs004, bs005, etc.
        
        // 2. Tìm user account tương ứng
        const users = await getDocumentsWithQuery('users', [
          where('role', '==', 'doctor'),
          where('doctorInfo.doctorId', '==', doctorId)
        ]);
        
        if (users.length > 0) {
          const authUid = users[0].uid;
          console.log(`✅ ${doctorId} → ${authUid}`);
          
          // 3. Cập nhật authUid vào doctor document
          await updateDocument('doctors', doctorId, {
            authUid: authUid
          });
        } else {
          console.log(`⚠️ ${doctorId} → No user account found`);
        }
      }
      
      console.log('✅ Done!');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fix Doctor AuthUid</Text>
      <TouchableOpacity style={styles.button} onPress={fixAuthUid}>
        <Text style={styles.buttonText}>Run Fix</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#00BCD4', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

### Bước 3: Cập nhật tất cả conversations hiện có

Một số conversation cũ có thể không có `doctorAuthUid`. Cần cập nhật:

```typescript
// app/fix-conversations-auth-uid.tsx
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDocumentsWithQuery, updateDocument, getDocumentById } from './services/firebaseService';

export default function FixConversationsAuthUid() {
  const fixConversations = async () => {
    try {
      console.log('🔧 Fixing conversations authUid...');
      
      // 1. Lấy tất cả conversations
      const conversations = await getDocumentsWithQuery('conversations', []);
      console.log('Found', conversations.length, 'conversations');
      
      for (const conv of conversations) {
        const doctorId = (conv as any).doctorId; // bs004, bs005, etc.
        
        if (!doctorId) {
          console.log(`⚠️ Conversation ${conv.id} has no doctorId`);
          continue;
        }
        
        // 2. Lấy authUid từ doctor document
        try {
          const doctorData = await getDocumentById('doctors', doctorId);
          if (doctorData && (doctorData as any).authUid) {
            const authUid = (doctorData as any).authUid;
            console.log(`✅ Conversation ${conv.id}: ${doctorId} → ${authUid}`);
            
            // 3. Cập nhật doctorAuthUid
            await updateDocument('conversations', conv.id, {
              doctorAuthUid: authUid
            });
          } else {
            console.log(`⚠️ Doctor ${doctorId} has no authUid`);
          }
        } catch (error) {
          console.log(`❌ Error getting doctor ${doctorId}:`, error);
        }
      }
      
      console.log('✅ Done!');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fix Conversations AuthUid</Text>
      <TouchableOpacity style={styles.button} onPress={fixConversations}>
        <Text style={styles.buttonText}>Run Fix</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#00BCD4', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

---

## 🧪 Cách test

### Test 1: Kiểm tra doctor có authUid không

```typescript
// Trong console Firebase hoặc app
const doctor = await getDocumentById('doctors', 'bs004');
console.log('Doctor authUid:', doctor.authUid);
// Kết quả mong đợi: Firebase Auth UID (ví dụ: "abc123xyz...")
```

### Test 2: Kiểm tra conversation có doctorAuthUid không

```typescript
const conversations = await getDocumentsWithQuery('conversations', [
  where('patientId', '==', 'patient-uid')
]);
console.log('Conversation doctorAuthUid:', conversations[0].doctorAuthUid);
// Kết quả mong đợi: Firebase Auth UID (ví dụ: "abc123xyz...")
```

### Test 3: Kiểm tra bác sĩ có thấy conversation không

```typescript
// Đăng nhập bằng tài khoản bác sĩ
const doctorUid = userData.uid; // Firebase Auth UID của bác sĩ
const conversations = await getDocumentsWithQuery('conversations', [
  where('doctorAuthUid', '==', doctorUid)
]);
console.log('Found conversations:', conversations.length);
// Kết quả mong đợi: > 0
```

### Test 4: Gửi tin nhắn và kiểm tra unread count

1. Đăng nhập bằng tài khoản bệnh nhân
2. Gửi tin nhắn cho bác sĩ
3. Kiểm tra conversation:
```typescript
const conv = await getDocumentById('conversations', conversationId);
console.log('Doctor unread count:', conv.doctorUnreadCount);
// Kết quả mong đợi: 1 (hoặc số tin nhắn chưa đọc)
```
4. Đăng nhập bằng tài khoản bác sĩ
5. Vào trang tin nhắn → Phải thấy badge số tin nhắn chưa đọc

---

## 📋 Checklist sửa lỗi

- [ ] Chạy script `fix-doctor-auth-uid.tsx` để thêm authUid cho tất cả doctors
- [ ] Chạy script `fix-conversations-auth-uid.tsx` để cập nhật tất cả conversations
- [ ] Test: Gửi tin nhắn từ bệnh nhân → Bác sĩ phải thấy badge
- [ ] Test: Bác sĩ đọc tin nhắn → Badge phải biến mất
- [ ] Test: Tạo conversation mới → Phải có doctorAuthUid

---

## 🎯 Kết quả mong đợi

Sau khi sửa:
1. ✅ Bệnh nhân gửi tin nhắn → `doctorUnreadCount` tăng lên
2. ✅ Bác sĩ vào trang tin nhắn → Thấy badge số tin nhắn chưa đọc
3. ✅ Bác sĩ click vào conversation → Badge biến mất, `doctorUnreadCount` = 0
4. ✅ Tất cả conversations đều có `doctorAuthUid` để query

---

**Ngày tạo:** 31/05/2026  
**Người tạo:** Kiro AI Assistant  
**Phiên bản:** 1.0
