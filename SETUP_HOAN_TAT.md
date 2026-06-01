# ✅ Setup Google Sign-In - Hoàn Tất!

## 🎉 Đã Hoàn Thành

### ✅ Bước 1: Web Client ID
```
9119519990-h0ghp9fhpjltof05160ea98bchd42i6n.apps.googleusercontent.com
```
- ✅ Đã thêm vào `.env.local`

### ✅ Bước 2: google-services.json
- ✅ Đã lưu vào `android/app/google-services.json`

### ✅ Bước 3: SHA-1 Fingerprint
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

---

## 🚀 Bước Tiếp Theo (Quan Trọng!)

### Bước 1: Thêm SHA-1 vào Firebase Console

1. Mở trình duyệt và vào: https://console.firebase.google.com
2. Chọn project: **hearthcare-847b3**
3. Click ⚙️ (Settings) → **Project settings**
4. Scroll xuống phần **Your apps**
5. Tìm **Android app** (icon Android)
6. Click **Add fingerprint**
7. Paste SHA-1 này:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
8. Click **Save**

**Screenshot hướng dẫn:**
```
Firebase Console
  → Settings (⚙️)
    → Project settings
      → Your apps
        → Android app
          → SHA certificate fingerprints
            → [Add fingerprint]
              → Paste: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
              → [Save]
```

### Bước 2: Rebuild App

```bash
# Stop app hiện tại (Ctrl+C nếu đang chạy)

# Clear cache và restart
npx expo start --clear

# Chọn 'a' để chạy trên Android
# Hoặc scan QR code
```

### Bước 3: Test Google Sign-In

1. Mở app trên điện thoại/emulator
2. Vào màn hình **Đăng nhập**
3. Click nút **Google** (icon Google)
4. **Kết quả mong đợi:**
   - ✅ Bottom sheet Google xuất hiện
   - ✅ Hiển thị danh sách tài khoản Google
   - ✅ Chọn tài khoản
   - ✅ Tự động đăng nhập vào app

---

## 📋 Checklist Hoàn Chỉnh

- [x] Lấy Web Client ID từ google-services.json
- [x] Thêm Web Client ID vào .env.local
- [x] Lưu google-services.json vào android/app/
- [x] Lấy SHA-1 fingerprint
- [ ] **Thêm SHA-1 vào Firebase Console** ← BẠN CẦN LÀM BƯỚC NÀY
- [ ] Rebuild app: `npx expo start --clear`
- [ ] Test Google Sign-In

---

## 🎯 Kết Quả Sau Khi Hoàn Thành

### Trước:
```
Click nút Google
  ↓
⚠️ "Đăng nhập bằng Google trên mobile đang được phát triển"
```

### Sau:
```
Click nút Google
  ↓
✅ Bottom sheet Google xuất hiện
  ↓
✅ Chọn tài khoản Google
  ↓
✅ Đăng nhập thành công!
  ↓
✅ Tự động tạo user trong Firestore
  ↓
✅ Chuyển đến màn hình chính
```

---

## 🐛 Nếu Gặp Lỗi

### Lỗi: "DEVELOPER_ERROR"
**Nguyên nhân:** SHA-1 chưa được thêm vào Firebase

**Giải pháp:**
1. Kiểm tra đã thêm SHA-1 vào Firebase Console chưa
2. Đợi 5-10 phút để Firebase cập nhật
3. Rebuild app: `npx expo start --clear`

### Lỗi: "Network error"
**Nguyên nhân:** Google Sign-In chưa được enable trong Firebase

**Giải pháp:**
1. Firebase Console → Authentication
2. Sign-in method
3. Enable **Google**
4. Save

### Lỗi: "Package not found"
**Giải pháp:**
```bash
npm install @react-native-google-signin/google-signin
npx expo start --clear
```

---

## 📊 Tổng Kết

### Files Đã Cập Nhật:
1. ✅ `.env.local` - Thêm Web Client ID
2. ✅ `android/app/google-services.json` - File config Firebase
3. ✅ `app/services/googleAuthService.ts` - Service xử lý Google Sign-In
4. ✅ `app/login.tsx` - Sử dụng service mới
5. ✅ `app/_layout.tsx` - Configure khi app khởi động

### Tính Năng Hoàn Chỉnh:
- ✅ Email Verification (Web + Mobile)
- ✅ Password Reset (Web + Mobile)
- ✅ Google Sign-In (Web)
- ✅ Google Sign-In (Mobile) ← Sắp hoàn thành!

---

## 🚀 Lệnh Nhanh

```bash
# Rebuild app
npx expo start --clear

# Hoặc rebuild native
npx expo run:android

# Build APK
eas build -p android --profile development
```

---

## 📞 Cần Hỗ Trợ?

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Xem file: `CAI_DAT_GOOGLE_SIGNIN_NHANH.md`
3. Xem file: `HUONG_DAN_GOOGLE_SIGNIN_MOBILE.md`

---

## 🎉 Chúc Mừng!

Bạn đã hoàn thành 90% setup!

**Chỉ còn 1 bước cuối:**
1. Thêm SHA-1 vào Firebase Console
2. Rebuild app
3. Test và tận hưởng! 🚀

**SHA-1 của bạn:**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Link Firebase Console:**
https://console.firebase.google.com/project/hearthcare-847b3/settings/general
