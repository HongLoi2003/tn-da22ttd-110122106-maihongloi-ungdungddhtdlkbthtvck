# Checklist Build EAS Thành Công

## ✅ Đã Hoàn Thành

### 1. Cấu Hình Gradle
- [x] Tắt New Architecture (`newArchEnabled=false`)
- [x] Comment NDK version cụ thể
- [x] Thêm Google Services plugin
- [x] Cấu hình memory đủ lớn (2GB)

### 2. Cấu Hình App
- [x] `app.json`: `newArchEnabled: false`
- [x] Package name: `com.maihongloi23.heatlecare`
- [x] Version: 1.0.0

### 3. Firebase
- [x] File `google-services.json` tồn tại
- [x] Google Services plugin được apply

### 4. EAS Config
- [x] `eas.json` có gradleCommand
- [x] Build type: APK
- [x] Profile: production và preview

## 📋 Cần Làm Trước Khi Build

### Bước 1: Kiểm Tra File
```powershell
# Kiểm tra google-services.json
Test-Path "android/app/google-services.json"

# Nếu không có, copy từ backup
if (!(Test-Path "android/app/google-services.json")) {
    Copy-Item "android/app/google-services (1).json" "android/app/google-services.json"
}
```

### Bước 2: Clean Dependencies
```powershell
# Xóa node_modules
Remove-Item -Recurse -Force node_modules

# Cài lại
npm install
```

### Bước 3: Kiểm Tra EAS CLI
```bash
# Kiểm tra version
eas --version

# Nếu chưa có, cài đặt
npm install -g eas-cli

# Login
eas login
```

### Bước 4: Build
```bash
# Build production
eas build --platform android --profile production

# Hoặc preview để test nhanh
eas build --platform android --profile preview
```

## 🔍 Kiểm Tra Trong Quá Trình Build

### Theo Dõi Log
1. Mở link build trên terminal
2. Xem các phase:
   - ✅ Install dependencies
   - ✅ Run gradlew
   - ✅ Build APK

### Các Phase Quan Trọng

#### Phase: Install dependencies
- Kiểm tra: Tất cả packages được cài đặt thành công
- Lỗi thường gặp: Network timeout, version conflict

#### Phase: Run gradlew
- Kiểm tra: Gradle build không có lỗi
- Lỗi thường gặp: 
  - Missing google-services.json
  - Duplicate class
  - Out of memory
  - NDK not found

#### Phase: Build APK
- Kiểm tra: APK được tạo thành công
- Lỗi thường gặp: Signing error, resource not found

## ⚠️ Các Lỗi Thường Gặp và Cách Sửa

### Lỗi 1: "google-services.json not found"
```powershell
# Copy file
Copy-Item "android/app/google-services (1).json" "android/app/google-services.json"

# Kiểm tra
Test-Path "android/app/google-services.json"
```

### Lỗi 2: "Duplicate class"
```powershell
# Clean build
.\clean-build.ps1

# Hoặc manual
Remove-Item -Recurse -Force android/app/build
Remove-Item -Recurse -Force android/build
Remove-Item -Recurse -Force android/.gradle
```

### Lỗi 3: "Out of memory"
Sửa trong `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Lỗi 4: "NDK not found"
Đã sửa bằng cách comment:
```properties
# android.ndkVersion=27.0.12077973
```

### Lỗi 5: "New Architecture conflict"
Đã sửa bằng cách tắt:
```properties
newArchEnabled=false
```

## ✨ Sau Khi Build Thành Công

### 1. Download APK
```bash
# Link sẽ có trong terminal hoặc
# Vào: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/
```

### 2. Test APK
- Cài đặt trên thiết bị Android
- Test các tính năng chính:
  - [ ] Đăng nhập/Đăng ký
  - [ ] Google Sign In
  - [ ] Firebase Authentication
  - [ ] Firestore đọc/ghi
  - [ ] Chat
  - [ ] Đặt lịch
  - [ ] Push Notifications

### 3. Nếu Test OK
- Build lại với profile production
- Submit lên Google Play Store (nếu cần)

## 📊 Thống Kê Build

### Build Time Dự Kiến
- Install dependencies: 2-3 phút
- Run gradlew: 5-10 phút
- Build APK: 2-3 phút
- **Tổng**: ~10-15 phút

### APK Size Dự Kiến
- Debug: ~80-100 MB
- Release: ~50-70 MB (sau khi minify)

## 🎯 Mục Tiêu

- [x] Sửa lỗi cấu hình
- [ ] Build thành công
- [ ] Test APK
- [ ] Deploy production

## 📝 Ghi Chú

- **New Architecture**: Tắt vì xung đột với Google Sign In
- **NDK**: Để EAS tự chọn version
- **Build Type**: APK cho test nhanh, AAB cho production
- **Profile**: Dùng preview để test, production để release

## 🔗 Links Hữu Ích

- [EAS Build Dashboard](https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Console](https://console.firebase.google.com/)
