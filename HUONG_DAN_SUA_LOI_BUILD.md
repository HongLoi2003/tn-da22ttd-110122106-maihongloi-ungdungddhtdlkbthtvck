# Hướng Dẫn Sửa Lỗi Build EAS

## Vấn Đề
Build EAS thất bại với lỗi Gradle: "Gradle build failed with unknown error"

## Nguyên Nhân
1. **New Architecture enabled** - Gây xung đột với một số dependencies
2. **NDK version cụ thể** - EAS Build không có NDK version 27.0.12077973
3. **Thiếu Google Services plugin** - Cần cho Firebase

## Đã Sửa

### 1. Tắt New Architecture
- File: `android/gradle.properties`
- Thay đổi: `newArchEnabled=false`
- File: `app.json`
- Thay đổi: `"newArchEnabled": false`

### 2. Comment NDK Version
- File: `android/gradle.properties`
- Thay đổi: `# android.ndkVersion=27.0.12077973`

### 3. Thêm Google Services Plugin
- File: `android/build.gradle`
- Thêm: `classpath('com.google.gms:google-services:4.4.0')`
- File: `android/app/build.gradle`
- Thêm: `apply plugin: 'com.google.gms.google-services'`

### 4. Cập nhật EAS Config
- File: `eas.json`
- Thêm: `"gradleCommand": ":app:assembleRelease"`

## Cách Build Lại

### Option 1: Clean và Build Local (Test)
```bash
# Windows PowerShell
.\clean-build.ps1

# Sau đó test local
npx expo run:android
```

### Option 2: Build với EAS
```bash
# Clean cache local trước
npm install

# Build với EAS
eas build --platform android --profile production

# Hoặc preview
eas build --platform android --profile preview
```

## Kiểm Tra Trước Khi Build

1. **Kiểm tra google-services.json**
```bash
Test-Path "android/app/google-services.json"
# Phải trả về: True
```

2. **Kiểm tra dependencies**
```bash
npm install
```

3. **Kiểm tra EAS CLI**
```bash
eas --version
# Phải >= 19.0.0
```

## Nếu Vẫn Lỗi

### Xem log chi tiết
1. Vào link build trên Expo: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/
2. Click vào build bị lỗi
3. Xem phase "Run gradlew" để biết lỗi cụ thể

### Các lỗi thường gặp

#### Lỗi: "Could not find google-services.json"
```bash
# Copy file google-services.json
cp "android/app/google-services (1).json" "android/app/google-services.json"
```

#### Lỗi: "Duplicate class found"
```bash
# Clean và rebuild
.\clean-build.ps1
```

#### Lỗi: "Out of memory"
```bash
# Tăng memory trong android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

## Lưu Ý

- **New Architecture**: Đã tắt vì gây xung đột với @react-native-google-signin
- **NDK Version**: Để EAS tự chọn version phù hợp
- **Google Services**: Bắt buộc phải có cho Firebase
- **Build Type**: Dùng APK thay vì AAB để test nhanh

## Kiểm Tra Sau Khi Build Thành Công

1. Download APK từ Expo
2. Cài đặt trên thiết bị Android
3. Test các tính năng:
   - Đăng nhập với Google
   - Firebase Authentication
   - Firestore
   - Push Notifications

## Tham Khảo

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
