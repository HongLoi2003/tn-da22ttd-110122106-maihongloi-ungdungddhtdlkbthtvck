# ✅ Sẵn Sàng Build Android

## 🎉 Tất Cả Đã Được Sửa

### Vấn Đề Build Đã Sửa
- [x] New Architecture đã tắt (`newArchEnabled=false`)
- [x] NDK version đã comment (để EAS tự chọn)
- [x] Google Services plugin đã thêm
- [x] app.json đã sạch lỗi (xóa properties không hợp lệ)
- [x] EAS config đã cập nhật với gradleCommand
- [x] iOS permissions đã thêm (bonus)

### Files Đã Thay Đổi
1. `android/gradle.properties` - Tắt New Architecture, comment NDK
2. `android/build.gradle` - Thêm Google Services classpath
3. `android/app/build.gradle` - Apply Google Services plugin
4. `app.json` - Xóa properties không hợp lệ, thêm iOS permissions
5. `eas.json` - Thêm gradleCommand và iOS config

## 🚀 Build Ngay

### Cách 1: Dùng Script (Dễ nhất)
```powershell
# Windows
.\build-android-now.ps1

# Linux/Mac
chmod +x build-android-now.sh
./build-android-now.sh
```

### Cách 2: Lệnh Trực Tiếp
```bash
# Production (Recommended)
eas build --platform android --profile production

# Preview (Test nhanh)
eas build --platform android --profile preview
```

## 📋 Checklist Trước Build

- [x] Code đã commit (optional)
- [x] google-services.json có trong android/app/
- [x] EAS CLI đã cài đặt
- [x] Đã đăng nhập EAS (`eas login`)
- [x] Internet connection ổn định

## ⏱️ Timeline

1. **Upload code**: 1-2 phút
2. **Install dependencies**: 2-3 phút  
3. **Run gradlew**: 5-10 phút
4. **Build APK**: 2-3 phút
5. **Total**: ~10-15 phút

## 📊 Theo Dõi Build

### Link Dashboard
https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/

### Các Phase Quan Trọng
1. ✅ **Upload** - Code được upload lên EAS
2. ✅ **Install dependencies** - npm install
3. ✅ **Run gradlew** - Gradle build (phase quan trọng nhất)
4. ✅ **Build APK** - Tạo file APK

## 📥 Sau Khi Build Xong

### Download APK
1. Link download sẽ có trong terminal
2. Hoặc vào dashboard để download
3. File APK khoảng 50-70 MB

### Cài Đặt
1. Copy APK vào điện thoại Android
2. Mở file APK
3. Cho phép cài đặt từ nguồn không xác định (nếu cần)
4. Cài đặt

### Test Checklist
- [ ] App mở được
- [ ] Đăng nhập/Đăng ký
- [ ] Google Sign In
- [ ] Firebase hoạt động
- [ ] Chat
- [ ] Booking
- [ ] Notifications

## ⚠️ Nếu Build Lỗi

### Bước 1: Xem Log
1. Mở link build trên EAS
2. Tìm phase bị lỗi (màu đỏ)
3. Click để xem chi tiết

### Bước 2: Tìm Lỗi Thường Gặp

#### Lỗi: "google-services.json not found"
```bash
# Kiểm tra
Test-Path "android/app/google-services.json"

# Copy từ backup
Copy-Item "android/app/google-services (1).json" "android/app/google-services.json"
```

#### Lỗi: "Duplicate class"
```bash
# Clean và build lại
.\clean-build.ps1
eas build --platform android --profile production --clear-cache
```

#### Lỗi: "Out of memory"
Tăng memory trong `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Bước 3: Build Lại
```bash
# Build lại với clear cache
eas build --platform android --profile production --clear-cache
```

## 📚 Tài Liệu Tham Khảo

- `BUILD_ANDROID_NGAY.md` - Hướng dẫn chi tiết
- `HUONG_DAN_SUA_LOI_BUILD.md` - Troubleshooting
- `CHECKLIST_BUILD_EAS.md` - Checklist đầy đủ
- `TOM_TAT_SUA_LOI_BUILD.md` - Tóm tắt các sửa đổi

## 🎯 Mục Tiêu

- [ ] Build thành công
- [ ] APK chạy được trên thiết bị
- [ ] Tất cả tính năng hoạt động
- [ ] Sẵn sàng deploy

## 💡 Tips

1. **Lần đầu build**: Có thể mất 15-20 phút
2. **Lần sau**: Nhanh hơn nhờ cache (~10 phút)
3. **Preview profile**: Nhanh hơn production
4. **Clear cache**: Chỉ dùng khi có vấn đề
5. **Theo dõi**: Mở dashboard để xem progress

## ✨ Bonus: Build iOS

Sau khi Android OK, có thể build iOS:
1. Download GoogleService-Info.plist từ Firebase
2. Setup Google Sign In iOS
3. Build: `eas build --platform ios --profile preview`

Xem chi tiết trong `TOM_TAT_IOS.md`

---

## 🚀 Sẵn Sàng? Chạy Lệnh Này:

```bash
eas build --platform android --profile production
```

Hoặc dùng script:
```bash
.\build-android-now.ps1
```

**Good luck! 🎉**
