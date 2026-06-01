# Kiểm Tra iOS Compatibility

## ✅ Điểm Tốt

### 1. Cấu Hình iOS Cơ Bản
- [x] Bundle Identifier: `com.maihongloi23.heatlecare`
- [x] Icon được cấu hình
- [x] Supports Tablet: true
- [x] ITSAppUsesNonExemptEncryption: false (bắt buộc cho App Store)

### 2. Code Đã Xử Lý iOS
- [x] KeyboardAvoidingView với `behavior='padding'` cho iOS
- [x] Platform-specific styling (paddingTop, paddingBottom)
- [x] Phone call với `telprompt:` cho iOS
- [x] Font family fallback cho iOS

### 3. Dependencies Tương Thích
- [x] Expo SDK 54 - Hỗ trợ đầy đủ iOS
- [x] React Native 0.81.5 - Tương thích iOS
- [x] @react-native-google-signin - Hỗ trợ iOS
- [x] Firebase - Hỗ trợ iOS

## ⚠️ Vấn Đề Cần Lưu Ý

### 1. Thiếu GoogleService-Info.plist
**Vấn đề**: Firebase trên iOS cần file `GoogleService-Info.plist`

**Giải pháp**:
1. Vào Firebase Console
2. Chọn project "heatlecare"
3. Vào iOS app settings
4. Download `GoogleService-Info.plist`
5. Thêm vào dự án khi build

### 2. Thiếu iOS Permissions
**Vấn đề**: Cần khai báo permissions trong Info.plist

**Cần thêm**:
```json
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false,
    "NSPhotoLibraryUsageDescription": "Cho phép ứng dụng truy cập thư viện ảnh của bạn",
    "NSCameraUsageDescription": "Cho phép ứng dụng sử dụng camera của bạn",
    "NSMicrophoneUsageDescription": "Cho phép ứng dụng sử dụng microphone cho cuộc gọi",
    "NSPhotoLibraryAddUsageDescription": "Cho phép ứng dụng lưu ảnh vào thư viện"
  }
}
```

### 3. Google Sign In iOS Setup
**Vấn đề**: Google Sign In cần URL Scheme cho iOS

**Cần thêm**:
```json
"ios": {
  "config": {
    "googleSignIn": {
      "reservedClientId": "YOUR_IOS_CLIENT_ID"
    }
  }
}
```

### 4. @react-native-voice/voice
**Vấn đề**: Package này trong dependencies nhưng không được sử dụng

**Giải pháp**: Có thể xóa nếu không dùng
```bash
npm uninstall @react-native-voice/voice
```

### 5. react-native-worklets
**Vấn đề**: Package này có thể gây vấn đề với iOS build

**Kiểm tra**: Xem có thực sự cần không

## 🔧 Cần Sửa Để Build iOS

### Bước 1: Cập Nhật app.json
```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.maihongloi23.heatlecare",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSPhotoLibraryUsageDescription": "Cho phép ứng dụng truy cập thư viện ảnh của bạn",
        "NSCameraUsageDescription": "Cho phép ứng dụng sử dụng camera của bạn",
        "NSMicrophoneUsageDescription": "Cho phép ứng dụng sử dụng microphone cho cuộc gọi",
        "NSPhotoLibraryAddUsageDescription": "Cho phép ứng dụng lưu ảnh vào thư viện"
      },
      "icon": "./assets/images/logo.png",
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      }
    }
  }
}
```

### Bước 2: Thêm GoogleService-Info.plist
1. Download từ Firebase Console
2. Đặt vào thư mục gốc dự án
3. EAS Build sẽ tự động copy vào iOS project

### Bước 3: Cập Nhật eas.json
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Bước 4: Clean Dependencies
```bash
# Xóa package không dùng
npm uninstall @react-native-voice/voice

# Cài lại
npm install
```

## 🚀 Build iOS

### Yêu Cầu
- Apple Developer Account ($99/năm)
- Đã đăng ký Bundle ID trên Apple Developer Portal
- Đã tạo Provisioning Profile

### Build với EAS
```bash
# Build cho simulator (test)
eas build --platform ios --profile preview

# Build cho device (production)
eas build --platform ios --profile production
```

### Nếu Không Có Apple Developer Account
```bash
# Build cho simulator (miễn phí)
eas build --platform ios --profile preview --simulator
```

## 📋 Checklist Build iOS

- [ ] Thêm permissions vào app.json
- [ ] Download GoogleService-Info.plist từ Firebase
- [ ] Lấy iOS Client ID cho Google Sign In
- [ ] Cập nhật eas.json với iOS config
- [ ] Xóa dependencies không dùng
- [ ] Test trên iOS Simulator
- [ ] Build với EAS

## ⚡ Test Nhanh iOS

### Option 1: Expo Go (Giới hạn)
```bash
npx expo start
# Scan QR code với Expo Go app trên iPhone
```

**Lưu ý**: Expo Go không hỗ trợ:
- Google Sign In
- Firebase native modules
- Custom native code

### Option 2: Development Build
```bash
# Build development client
eas build --platform ios --profile development

# Cài trên device và chạy
npx expo start --dev-client
```

### Option 3: iOS Simulator (Mac only)
```bash
# Cần có Xcode installed
npx expo run:ios
```

## 🎯 Kết Luận

### Có Thể Chạy iOS?
**CÓ** - Nhưng cần:
1. ✅ Code đã tương thích iOS
2. ⚠️ Cần thêm GoogleService-Info.plist
3. ⚠️ Cần thêm iOS permissions
4. ⚠️ Cần setup Google Sign In cho iOS
5. ⚠️ Cần Apple Developer Account để build production

### Độ Khó
- **Test với Simulator**: Dễ (nếu có Mac)
- **Build Development**: Trung bình
- **Build Production**: Khó (cần Apple Developer Account)

### Thời Gian Ước Tính
- Setup cấu hình: 30 phút
- Build lần đầu: 15-20 phút
- Test và fix bugs: 1-2 giờ

## 📝 Ghi Chú

- iOS build phức tạp hơn Android
- Cần Mac để test trên Simulator
- Cần Apple Developer Account ($99/năm) để deploy
- Google Sign In cần setup riêng cho iOS
- Firebase cần GoogleService-Info.plist riêng

## 🔗 Tài Liệu Tham Khảo

- [Expo iOS Build](https://docs.expo.dev/build-reference/ios-builds/)
- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [Google Sign In iOS](https://developers.google.com/identity/sign-in/ios/start)
- [Apple Developer Portal](https://developer.apple.com/)
