# ✅ CHECKLIST CUỐI CÙNG - BUILD APP VỚI GOOGLE SIGN-IN

## 📋 Tình Trạng Hiện Tại

✅ **ĐÃ HOÀN THÀNH:**
- Email Verification: Hoạt động ✅
- Password Reset: Hoạt động ✅
- Google Sign-In Web: Hoạt động ✅
- SHA-1 fingerprint: Đã thêm vào Firebase Console ✅
- google-services.json: Đã tải và đặt đúng vị trí ✅
- Web Client ID: Đã cấu hình trong `.env.local` ✅
- Package `@react-native-google-signin/google-signin`: Đã cài đặt ✅
- EAS CLI: Đã cài đặt ✅

❌ **VẤN ĐỀ:**
- Google Sign-In trên mobile báo lỗi vì đang chạy trên Expo Go
- Cần build app để có native code

---

## 🚀 BƯỚC TIẾP THEO - BUILD APP

### Lỗi Bạn Gặp:
```
PS D:\heatlecare> eas login
eas : The term 'eas' is not recognized...
```

### ✅ Giải Pháp: Dùng `npx eas`

Vì `eas` vừa mới cài đặt, bạn cần:
- **Cách 1:** Restart terminal rồi chạy `eas login`
- **Cách 2:** Dùng `npx eas login` (không cần restart)

---

## 📝 CÁC LỆNH CẦN CHẠY

### Bước 1: Login EAS

```bash
npx eas login
```

**Nhập:**
- Email Expo account của bạn
- Password

**Nếu chưa có account:**
- Chọn "Sign up" trong terminal
- Hoặc vào: https://expo.dev/signup

---

### Bước 2: Configure EAS (nếu lần đầu)

```bash
npx eas build:configure
```

Lệnh này sẽ tạo file `eas.json` nếu chưa có.

---

### Bước 3: Build Development APK

```bash
npx eas build -p android --profile development
```

**Quá trình:**
1. Upload code lên EAS servers
2. Build trên cloud (10-15 phút)
3. Nhận link download APK

**Trong lúc chờ:**
- Bạn có thể đóng terminal
- Build vẫn chạy trên cloud
- Kiểm tra tiến độ tại: https://expo.dev/accounts/[your-account]/projects/heatlecare/builds

---

### Bước 4: Download và Cài APK

1. Sau khi build xong, terminal sẽ hiện link download
2. Hoặc vào: https://expo.dev → Projects → heatlecare → Builds
3. Download APK về điện thoại
4. Cài đặt APK (enable "Install from unknown sources" nếu cần)

---

### Bước 5: Test Google Sign-In

1. Mở app từ APK vừa cài
2. Vào màn hình Login
3. Click nút "Đăng nhập bằng Google"
4. ✅ Bottom sheet Google xuất hiện
5. ✅ Chọn tài khoản
6. ✅ Đăng nhập thành công!

---

## 🎯 LỆNH ĐẦY ĐỦ (COPY & PASTE)

```bash
# Bước 1: Login
npx eas login

# Bước 2: Configure (nếu cần)
npx eas build:configure

# Bước 3: Build
npx eas build -p android --profile development
```

---

## ⚡ CÁCH NHANH HƠN (Không dùng EAS)

Nếu bạn có Android Studio đã cài đặt:

```bash
# Prebuild
npx expo prebuild --platform android --clean

# Run Android
npx expo run:android
```

**Ưu điểm:**
- ✅ Nhanh hơn (không cần đợi cloud build)
- ✅ Test ngay trên máy
- ✅ Không cần EAS account

**Nhược điểm:**
- ❌ Cần Android Studio
- ❌ Cần emulator hoặc điện thoại kết nối USB

---

## 🐛 XỬ LÝ LỖI

### Lỗi: "eas: command not found"
**Giải pháp:** Dùng `npx eas` thay vì `eas`

### Lỗi: "Not logged in"
**Giải pháp:** Chạy `npx eas login`

### Lỗi: "No Android connected device found"
**Giải pháp:** 
- Đây là lỗi của `npx expo run:android`
- Dùng EAS Build thay vì run:android
- Hoặc mở emulator/kết nối điện thoại

### Lỗi: "ANDROID_HOME is set to a non-existing path"
**Giải pháp:**
- Dùng EAS Build (không cần Android SDK)
- Hoặc cài đặt Android Studio và set ANDROID_HOME đúng

---

## 📱 SAU KHI BUILD XONG

### Development Build:
- Cài APK lên điện thoại
- App có thể connect với Metro bundler
- Chạy: `npx expo start --dev-client`
- Scan QR code từ app

### Production Build:
```bash
npx eas build -p android --profile production
```
- APK độc lập, không cần Metro bundler
- Có thể phát hành lên Google Play Store

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi build và cài APK:

1. ✅ Email Verification: Hoạt động
2. ✅ Password Reset: Hoạt động  
3. ✅ Google Sign-In Web: Hoạt động
4. ✅ **Google Sign-In Mobile: Hoạt động** 🎯

---

## 📞 NẾU CẦN TRỢ GIÚP

**Lỗi khi login EAS:**
- Kiểm tra internet
- Thử: `npx eas whoami` để xem đã login chưa

**Lỗi khi build:**
- Kiểm tra `app.json` có đúng package name không
- Kiểm tra `google-services.json` có đúng vị trí không

**Build thành công nhưng Google Sign-In vẫn lỗi:**
- Kiểm tra SHA-1 đã thêm vào Firebase Console chưa
- Kiểm tra Web Client ID trong `.env.local`
- Kiểm tra `google-services.json` có đúng project không

---

## 🚀 BẮT ĐẦU NGAY

```bash
npx eas login
```

Sau đó làm theo hướng dẫn trong terminal! 💪
