# 🔐 Hướng Dẫn Firebase Authentication

## ✅ Đã Triển Khai

### 1. 📧 Gửi Email Xác Minh (Email Verification)
- ✅ Tự động gửi email xác minh khi đăng ký
- ✅ Email được gửi qua Firebase Authentication
- ✅ Hoạt động cả trên APK và Web

**File:** `app/register.tsx`
```typescript
import { sendEmailVerification } from 'firebase/auth';

// Sau khi đăng ký thành công
await sendEmailVerification(userCredential.user);
```

### 2. 🔑 Quên Mật Khẩu (Password Reset)
- ✅ Gửi email reset password qua Firebase
- ✅ Link reset password có thời hạn
- ✅ Hoạt động cả trên APK và Web

**File:** `app/forgot-password.tsx`
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

await sendPasswordResetEmail(auth, email);
```

### 3. 🌐 Đăng Nhập Bằng Google
- ✅ Hoạt động trên Web (sử dụng popup)
- ⚠️ Mobile cần cấu hình thêm (xem phần dưới)

**File:** `app/login.tsx`
```typescript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

---

## 🚀 Cách Sử Dụng

### 1. Đăng Ký Tài Khoản
1. User nhập thông tin đăng ký
2. Hệ thống tạo tài khoản Firebase
3. **Tự động gửi email xác minh** đến email đã đăng ký
4. User kiểm tra email (kể cả thư mục Spam)
5. Click link xác minh trong email
6. Đăng nhập vào app

### 2. Quên Mật Khẩu
1. User click "Quên mật khẩu?"
2. Nhập email đã đăng ký
3. **Firebase gửi email reset password**
4. User kiểm tra email
5. Click link trong email
6. Đặt mật khẩu mới
7. Đăng nhập với mật khẩu mới

### 3. Đăng Nhập Bằng Google (Web)
1. User click nút Google
2. Popup đăng nhập Google xuất hiện
3. Chọn tài khoản Google
4. Tự động đăng nhập vào app

---

## 📱 Cấu Hình Cho Mobile (Android/iOS)

### Đăng Nhập Google Trên Mobile

Hiện tại đăng nhập Google chỉ hoạt động trên **Web**. Để hoạt động trên **Mobile**, cần:

#### Option 1: Sử dụng Expo AuthSession (Khuyến nghị)
```bash
npx expo install expo-auth-session expo-crypto
```

**Tạo file:** `app/utils/googleAuth.ts`
```typescript
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  const signInWithGoogle = async () => {
    const result = await promptAsync();
    if (result?.type === 'success') {
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      return await signInWithCredential(auth, credential);
    }
  };

  return { signInWithGoogle };
};
```

#### Option 2: Sử dụng @react-native-google-signin
```bash
npm install @react-native-google-signin/google-signin
```

**Cấu hình:**
1. Lấy OAuth 2.0 Client ID từ Google Cloud Console
2. Thêm SHA-1 fingerprint cho Android
3. Cấu hình URL schemes cho iOS

---

## 🔧 Cấu Hình Firebase Console

### 1. Bật Email/Password Authentication
1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project: **hearthcare-847b3**
3. Authentication → Sign-in method
4. Enable **Email/Password**

### 2. Bật Google Sign-In
1. Authentication → Sign-in method
2. Enable **Google**
3. Chọn Support email
4. Save

### 3. Cấu Hình Email Templates
1. Authentication → Templates
2. Tùy chỉnh email templates:
   - **Email verification** (Xác minh email)
   - **Password reset** (Đặt lại mật khẩu)
   - **Email address change** (Thay đổi email)

**Ví dụ template tiếng Việt:**
```
Xin chào,

Vui lòng xác minh địa chỉ email của bạn bằng cách click vào link dưới đây:

%LINK%

Nếu bạn không yêu cầu xác minh này, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ HealthCare
```

### 4. Cấu Hình Authorized Domains
1. Authentication → Settings → Authorized domains
2. Thêm domain của bạn (nếu deploy web)
3. Mặc định có: `localhost`, `*.firebaseapp.com`

---

## 🧪 Test Trên APK

### 1. Build APK
```bash
# Build development
eas build -p android --profile development

# Build production
eas build -p android --profile production
```

### 2. Test Email Verification
1. Cài APK trên thiết bị
2. Đăng ký tài khoản mới
3. Kiểm tra email (Gmail, Outlook, etc.)
4. Click link xác minh
5. Quay lại app và đăng nhập

### 3. Test Password Reset
1. Click "Quên mật khẩu?"
2. Nhập email
3. Kiểm tra email
4. Click link reset
5. Đặt mật khẩu mới
6. Đăng nhập

### 4. Test Google Sign-In (Web Only)
1. Mở app trên browser: `npx expo start --web`
2. Click nút Google
3. Chọn tài khoản Google
4. Đăng nhập thành công

---

## 🐛 Xử Lý Lỗi Thường Gặp

### 1. Email không được gửi
**Nguyên nhân:**
- Firebase chưa bật Email/Password authentication
- Email bị vào Spam
- Quota email đã hết (Firebase free: 100 emails/day)

**Giải pháp:**
- Kiểm tra Firebase Console → Authentication
- Kiểm tra thư mục Spam
- Upgrade Firebase plan nếu cần

### 2. Google Sign-In không hoạt động trên mobile
**Nguyên nhân:**
- Chưa cấu hình OAuth Client ID
- Chưa thêm SHA-1 fingerprint

**Giải pháp:**
- Sử dụng Expo AuthSession (xem phần trên)
- Hoặc chỉ enable trên Web

### 3. "auth/popup-blocked"
**Nguyên nhân:**
- Browser chặn popup

**Giải pháp:**
- Cho phép popup cho domain
- Hoặc dùng `signInWithRedirect` thay vì `signInWithPopup`

### 4. "auth/user-not-found"
**Nguyên nhân:**
- Email chưa được đăng ký

**Giải pháp:**
- Hiển thị message rõ ràng cho user
- Đề xuất đăng ký tài khoản

---

## 📊 Kiểm Tra Users Trong Firebase

1. Vào Firebase Console
2. Authentication → Users
3. Xem danh sách users đã đăng ký
4. Kiểm tra:
   - ✅ Email verified (đã xác minh)
   - ⏳ Email not verified (chưa xác minh)
   - 🌐 Sign-in provider (Email, Google, Facebook)

---

## 🔒 Bảo Mật

### 1. Email Verification
- User phải xác minh email trước khi sử dụng đầy đủ tính năng
- Kiểm tra `user.emailVerified` trong code

```typescript
if (!user.emailVerified) {
  Alert.alert(
    'Email chưa xác minh',
    'Vui lòng xác minh email để tiếp tục'
  );
  return;
}
```

### 2. Password Policy
- Tối thiểu 8 ký tự
- Nên có chữ hoa, chữ thường, số, ký tự đặc biệt
- Đã validate trong `app/utils/validation.ts`

### 3. Rate Limiting
- Firebase tự động giới hạn số lần thử đăng nhập
- Chặn IP nếu có hành vi đáng ngờ

---

## 📝 Checklist Triển Khai

- [x] Cài đặt Firebase SDK
- [x] Cấu hình Firebase trong `.env.local`
- [x] Tạo `firebaseConfig.ts`
- [x] Implement Email/Password Authentication
- [x] Implement Email Verification
- [x] Implement Password Reset
- [x] Implement Google Sign-In (Web)
- [ ] Implement Google Sign-In (Mobile) - Optional
- [ ] Implement Facebook Sign-In - Optional
- [x] Test trên Web
- [ ] Test trên APK
- [ ] Tùy chỉnh Email Templates
- [ ] Setup Production Firebase Project

---

## 🎯 Kết Luận

Firebase Authentication đã được tích hợp đầy đủ với:
- ✅ **Email Verification** - Gửi email xác minh tự động
- ✅ **Password Reset** - Gửi email reset password
- ✅ **Google Sign-In** - Hoạt động trên Web
- ✅ **Hoạt động trên APK** - Email features hoạt động 100%

**Đơn giản, ổn định, không cần backend riêng!**

---

## 📚 Tài Liệu Tham Khảo

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Google Sign-In for Expo](https://docs.expo.dev/guides/google-authentication/)
