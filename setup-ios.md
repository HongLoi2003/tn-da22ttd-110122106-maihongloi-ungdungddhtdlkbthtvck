# Hướng Dẫn Setup iOS

## 📋 Yêu Cầu

### 1. Firebase iOS Setup
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project "heatlecare"
3. Click vào iOS app (hoặc thêm iOS app mới)
4. Bundle ID: `com.maihongloi23.heatlecare`
5. Download `GoogleService-Info.plist`
6. Đặt file vào thư mục gốc dự án

### 2. Google Sign In iOS Setup
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào "APIs & Services" > "Credentials"
4. Tạo OAuth 2.0 Client ID cho iOS:
   - Application type: iOS
   - Bundle ID: `com.maihongloi23.heatlecare`
5. Copy iOS Client ID (dạng: `xxx.apps.googleusercontent.com`)

### 3. Apple Developer Account (Cho Production)
- Cần Apple Developer Account ($99/năm)
- Đăng ký tại: https://developer.apple.com/

## 🔧 Cấu Hình

### Bước 1: Kiểm Tra Files
```bash
# Kiểm tra GoogleService-Info.plist
ls GoogleService-Info.plist

# Nếu chưa có, download từ Firebase Console
```

### Bước 2: Cập Nhật app.json (Đã xong ✓)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "...",
        "NSCameraUsageDescription": "...",
        "NSMicrophoneUsageDescription": "..."
      }
    }
  }
}
```

### Bước 3: Thêm Google Sign In Config
Thêm vào `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleSignIn": {
          "reservedClientId": "YOUR_IOS_CLIENT_ID_HERE"
        }
      }
    }
  }
}
```

Thay `YOUR_IOS_CLIENT_ID_HERE` bằng iOS Client ID từ Google Cloud Console.

### Bước 4: Cập Nhật .gitignore
Thêm vào `.gitignore`:
```
GoogleService-Info.plist
```

## 🚀 Build iOS

### Option 1: Build cho Simulator (Miễn phí, không cần Apple Developer)
```bash
# Build cho iOS Simulator
eas build --platform ios --profile preview

# Sau khi build xong, download .app file
# Kéo thả vào iOS Simulator để cài đặt
```

### Option 2: Build cho Device (Cần Apple Developer Account)
```bash
# Build production
eas build --platform ios --profile production

# EAS sẽ yêu cầu:
# - Apple ID
# - App Store Connect API Key
# - Provisioning Profile
```

### Option 3: Development Build (Test trên device)
```bash
# Build development client
eas build --platform ios --profile development

# Cài trên device và chạy
npx expo start --dev-client
```

## 🧪 Test iOS

### Test trên Mac với Simulator
```bash
# Cần có Xcode installed
npx expo run:ios

# Hoặc chọn device cụ thể
npx expo run:ios --device "iPhone 15 Pro"
```

### Test với Expo Go (Giới hạn)
```bash
npx expo start

# Scan QR code với Expo Go app trên iPhone
# Lưu ý: Không hỗ trợ Google Sign In và Firebase native
```

## ⚠️ Vấn Đề Thường Gặp

### 1. "GoogleService-Info.plist not found"
**Giải pháp**:
- Download từ Firebase Console
- Đặt vào thư mục gốc dự án
- Commit vào git (hoặc thêm vào EAS Secrets)

### 2. "Google Sign In failed"
**Giải pháp**:
- Kiểm tra iOS Client ID đã đúng chưa
- Kiểm tra Bundle ID khớp với Firebase
- Thêm URL Scheme vào app.json

### 3. "No provisioning profile found"
**Giải pháp**:
- Cần Apple Developer Account
- Tạo Provisioning Profile trên Apple Developer Portal
- Hoặc để EAS tự động tạo

### 4. "Build failed with unknown error"
**Giải pháp**:
- Xem log chi tiết trên EAS Dashboard
- Kiểm tra dependencies tương thích iOS
- Thử build với `--clear-cache`

## 📊 So Sánh Build Options

| Option | Cần Mac? | Cần Apple Dev? | Giá | Test được gì? |
|--------|----------|----------------|-----|---------------|
| Expo Go | Không | Không | Miễn phí | UI, logic cơ bản |
| Simulator Build | Không | Không | Miễn phí | Gần như đầy đủ |
| Development Build | Không | Có | $99/năm | Đầy đủ trên device |
| Production Build | Không | Có | $99/năm | Đầy đủ, deploy được |

## ✅ Checklist

- [x] Thêm iOS permissions vào app.json
- [x] Cập nhật eas.json với iOS config
- [ ] Download GoogleService-Info.plist từ Firebase
- [ ] Lấy iOS Client ID cho Google Sign In
- [ ] Thêm Google Sign In config vào app.json
- [ ] Test build cho simulator
- [ ] (Optional) Đăng ký Apple Developer Account
- [ ] (Optional) Build cho production

## 🎯 Kết Luận

**Dự án CÓ THỂ chạy trên iOS** với các điều kiện:

✅ **Đã sẵn sàng**:
- Code tương thích iOS
- Permissions đã được thêm
- EAS config đã có iOS

⚠️ **Cần làm thêm**:
- Download GoogleService-Info.plist
- Setup Google Sign In cho iOS
- (Optional) Apple Developer Account cho production

🚀 **Bước tiếp theo**:
1. Download GoogleService-Info.plist từ Firebase
2. Setup Google Sign In iOS Client ID
3. Build cho simulator để test: `eas build --platform ios --profile preview`

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Xem log chi tiết trên EAS Dashboard
2. Tham khảo [Expo iOS Documentation](https://docs.expo.dev/build-reference/ios-builds/)
3. Check [Firebase iOS Setup Guide](https://firebase.google.com/docs/ios/setup)
