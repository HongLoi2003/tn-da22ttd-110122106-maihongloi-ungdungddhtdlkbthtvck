# 🧪 Test Firebase Authentication

## ✅ Đã Sửa Lỗi

Lỗi `auth is not defined` đã được sửa bằng cách:
- Import động Firebase Auth trong `handleGoogleLogin()`
- Kiểm tra `auth` trước khi sử dụng
- Xử lý trường hợp Firebase chưa được khởi tạo

## 🚀 Cách Test

### 1. Test Trên Web (Khuyến nghị)

```bash
npx expo start --web
```

**Test các tính năng:**
- ✅ Đăng ký tài khoản → Nhận email xác minh
- ✅ Quên mật khẩu → Nhận email reset
- ✅ Đăng nhập Google → Popup Google Sign-In

### 2. Test Trên Mobile

```bash
npx expo start
```

**Quét QR code và test:**
- ✅ Đăng ký → Email xác minh
- ✅ Quên mật khẩu → Email reset
- ⚠️ Google Sign-In → Hiển thị thông báo (chưa hỗ trợ mobile)

### 3. Sử dụng Màn Hình Test

Navigate đến: `/test-firebase-auth`

**Các test có sẵn:**
1. **Kiểm tra User hiện tại** - Xem thông tin user đang đăng nhập
2. **Gửi Email Xác Minh** - Test gửi email verification
3. **Gửi Email Reset Password** - Test reset password
4. **Đăng nhập Google** - Test Google Sign-In (Web only)

---

## 📧 Test Email Verification

### Bước 1: Đăng ký tài khoản mới
1. Mở app
2. Click "Đăng ký ngay"
3. Nhập thông tin:
   - Họ tên: Test User
   - Email: your-email@gmail.com
   - Số điện thoại: 0123456789
   - Mật khẩu: Test@123
4. Click "Đăng ký"

### Bước 2: Kiểm tra email
1. Mở Gmail/Email của bạn
2. Tìm email từ: `noreply@hearthcare-847b3.firebaseapp.com`
3. **Kiểm tra cả thư mục Spam!**
4. Click link "Verify your email"

### Bước 3: Đăng nhập
1. Quay lại app
2. Đăng nhập với email và password vừa tạo
3. ✅ Thành công!

---

## 🔑 Test Password Reset

### Bước 1: Click "Quên mật khẩu?"
1. Từ màn hình đăng nhập
2. Click "Quên mật khẩu?"

### Bước 2: Nhập email
1. Nhập email đã đăng ký
2. Click "Gửi email đặt lại mật khẩu"

### Bước 3: Kiểm tra email
1. Mở Gmail/Email
2. Tìm email từ Firebase
3. **Kiểm tra cả Spam!**
4. Click link "Reset your password"

### Bước 4: Đặt mật khẩu mới
1. Nhập mật khẩu mới
2. Confirm mật khẩu
3. Click "Save"

### Bước 5: Đăng nhập
1. Quay lại app
2. Đăng nhập với mật khẩu mới
3. ✅ Thành công!

---

## 🌐 Test Google Sign-In (Web Only)

### Bước 1: Chạy trên Web
```bash
npx expo start --web
```

### Bước 2: Click nút Google
1. Từ màn hình đăng nhập
2. Click nút Google (icon Google)

### Bước 3: Chọn tài khoản
1. Popup Google xuất hiện
2. Chọn tài khoản Google
3. Cho phép quyền truy cập

### Bước 4: Tự động đăng nhập
1. App tự động đăng nhập
2. Chuyển đến màn hình chính
3. ✅ Thành công!

**Lưu ý:**
- Nếu popup bị chặn → Cho phép popup trong browser
- Nếu lỗi → Kiểm tra Firebase Console đã enable Google Sign-In

---

## 🔍 Kiểm Tra Trong Firebase Console

### 1. Xem Users đã đăng ký
1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project: **hearthcare-847b3**
3. Authentication → Users
4. Xem danh sách users

### 2. Kiểm tra Email Verified
- ✅ **Email verified** - Đã xác minh
- ⏳ **Not verified** - Chưa xác minh

### 3. Kiểm tra Sign-in Provider
- 📧 **Email/Password** - Đăng ký bằng email
- 🌐 **Google** - Đăng nhập bằng Google

---

## 🐛 Xử Lý Lỗi

### Lỗi: "auth is not defined"
**Đã sửa!** Import động Firebase Auth

### Lỗi: "Email không được gửi"
**Giải pháp:**
1. Kiểm tra Firebase Console → Authentication
2. Đảm bảo Email/Password đã enable
3. Kiểm tra thư mục Spam

### Lỗi: "Popup blocked"
**Giải pháp:**
1. Cho phép popup trong browser
2. Hoặc dùng `signInWithRedirect` (cần cấu hình thêm)

### Lỗi: "Google Sign-In không hoạt động"
**Giải pháp:**
1. Chỉ hoạt động trên Web
2. Mobile cần cấu hình thêm (xem HUONG_DAN_FIREBASE_AUTH.md)

---

## 📱 Test Trên APK

### Build APK
```bash
# Development
eas build -p android --profile development

# Production
eas build -p android --profile production
```

### Test trên thiết bị
1. Cài APK
2. Test đăng ký → ✅ Email verification hoạt động
3. Test quên mật khẩu → ✅ Email reset hoạt động
4. Test Google Sign-In → ⚠️ Hiển thị thông báo (chưa hỗ trợ)

---

## ✅ Checklist Test

### Email Verification
- [ ] Đăng ký tài khoản mới
- [ ] Nhận email xác minh
- [ ] Click link trong email
- [ ] Email được verify trong Firebase Console

### Password Reset
- [ ] Click "Quên mật khẩu?"
- [ ] Nhập email
- [ ] Nhận email reset
- [ ] Click link và đặt mật khẩu mới
- [ ] Đăng nhập với mật khẩu mới

### Google Sign-In (Web)
- [ ] Click nút Google
- [ ] Popup Google xuất hiện
- [ ] Chọn tài khoản
- [ ] Tự động đăng nhập
- [ ] User được tạo trong Firestore

### Mobile
- [ ] Email verification hoạt động trên APK
- [ ] Password reset hoạt động trên APK
- [ ] Google Sign-In hiển thị thông báo

---

## 🎯 Kết Quả Mong Đợi

### ✅ Hoạt động
- Email Verification (Web + Mobile)
- Password Reset (Web + Mobile)
- Google Sign-In (Web only)

### ⚠️ Cần cấu hình thêm
- Google Sign-In trên Mobile (cần Expo AuthSession)
- Facebook Sign-In (chưa implement)

---

## 📞 Hỗ Trợ

Nếu gặp lỗi, kiểm tra:
1. Console logs trong browser/terminal
2. Firebase Console → Authentication → Users
3. Email spam folder
4. File: `HUONG_DAN_FIREBASE_AUTH.md` để biết chi tiết

---

## 🚀 Bước Tiếp Theo

1. ✅ Test tất cả tính năng
2. ✅ Tùy chỉnh email templates trong Firebase Console
3. ⏳ Cấu hình Google Sign-In cho Mobile (optional)
4. ⏳ Thêm Facebook Sign-In (optional)
5. ✅ Build APK và test trên thiết bị thật
