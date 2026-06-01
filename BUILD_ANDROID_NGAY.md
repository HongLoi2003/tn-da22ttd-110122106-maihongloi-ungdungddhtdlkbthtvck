# Build Android Ngay

## ✅ Đã Sẵn Sàng

Tất cả các vấn đề đã được sửa:
- [x] New Architecture đã tắt
- [x] NDK version đã comment
- [x] Google Services plugin đã thêm
- [x] app.json đã sạch lỗi
- [x] EAS config đã cập nhật

## 🚀 Build Ngay

### Bước 1: Đăng Nhập EAS (Nếu chưa)
```bash
eas login
```

### Bước 2: Build Production
```bash
eas build --platform android --profile production
```

### Hoặc Build Preview (Nhanh hơn)
```bash
eas build --platform android --profile preview
```

## 📊 Theo Dõi Build

Sau khi chạy lệnh build:
1. EAS sẽ upload code lên cloud
2. Link build sẽ hiện trên terminal
3. Mở link để theo dõi progress
4. Build mất khoảng 10-15 phút

## 🔗 Link Build Dashboard

https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/

## ⏱️ Timeline Dự Kiến

- Upload code: 1-2 phút
- Install dependencies: 2-3 phút
- Run gradlew: 5-10 phút
- Build APK: 2-3 phút
- **Tổng: 10-15 phút**

## 📥 Sau Khi Build Xong

1. Download APK từ link trong terminal
2. Hoặc vào dashboard để download
3. Cài APK trên thiết bị Android
4. Test các tính năng

## ⚠️ Nếu Build Lỗi

### Xem Log Chi Tiết
1. Mở link build
2. Click vào phase bị lỗi (thường là "Run gradlew")
3. Đọc error message

### Lỗi Thường Gặp

#### "google-services.json not found"
```bash
# Kiểm tra file
Test-Path "android/app/google-services.json"

# Nếu không có, copy từ backup
Copy-Item "android/app/google-services (1).json" "android/app/google-services.json"
```

#### "Out of memory"
Sửa trong `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

#### "Duplicate class"
```bash
# Clean và build lại
.\clean-build.ps1
eas build --platform android --profile production
```

## 🎯 Mục Tiêu

- [ ] Build thành công
- [ ] Download APK
- [ ] Cài trên thiết bị
- [ ] Test đăng nhập
- [ ] Test Firebase
- [ ] Test chat
- [ ] Test booking

## 💡 Tips

- Dùng `preview` profile để test nhanh
- Dùng `production` profile cho bản release
- Có thể build nhiều lần, EAS cache dependencies
- Build lần 2 trở đi sẽ nhanh hơn

## 📝 Ghi Chú

- APK size: ~50-70 MB
- Minimum Android: API 24 (Android 7.0)
- Target Android: API 35 (Android 15)
- Build type: APK (dễ test)
- Có thể đổi sang AAB cho Google Play Store

## 🔄 Build Lại

Nếu cần build lại:
```bash
# Build với cache
eas build --platform android --profile production

# Build không cache (nếu có vấn đề)
eas build --platform android --profile production --clear-cache
```

## ✨ Sau Khi Test OK

Nếu APK chạy tốt:
1. Có thể build AAB cho Google Play Store
2. Hoặc tiếp tục dùng APK để distribute
3. Setup CI/CD cho auto build (optional)

---

**Sẵn sàng? Chạy lệnh này:**
```bash
eas build --platform android --profile production
```
