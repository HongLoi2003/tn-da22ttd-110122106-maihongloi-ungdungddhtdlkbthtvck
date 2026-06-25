# Fix Lỗi Google Sign-In trong APK Production

## Vấn đề
Lỗi "apiClient is null - call configure() first" xuất hiện khi đăng nhập Google trong APK vì thiếu cấu hình SHA certificate cho production build.

## Nguyên nhân
- APK development dùng debug keystore (SHA-1 đã có: `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`)
- APK production dùng release keystore với SHA-1 khác
- Firebase Console chưa có SHA-1 của release keystore

## Giải pháp

### Bước 1: Lấy SHA-1 của Release Keystore

#### Nếu dùng EAS Build (Expo):
```bash
# Tải về credentials
eas credentials

# Chọn: Android → Production → Download Keystore
# File sẽ được lưu: production-keystore.jks
```

#### Lấy SHA-1 từ keystore:
```bash
# Windows PowerShell
keytool -list -v -keystore production-keystore.jks -alias <alias_name>

# Hoặc nếu dùng default alias:
keytool -list -v -keystore production-keystore.jks
```

Lưu ý:
- Mật khẩu keystore: được EAS cung cấp khi download
- Tìm dòng: `SHA1: XX:XX:XX:...` (40 ký tự hex)

### Bước 2: Thêm SHA-1 vào Firebase Console

1. Mở Firebase Console: https://console.firebase.google.com
2. Chọn project: **hearthcare-847b3**
3. Vào **Project Settings** (⚙️)
4. Tab **General** → tìm app Android: `com.maihongloi23.heatlecare`
5. Scroll xuống phần **SHA certificate fingerprints**
6. Click **Add fingerprint**
7. Dán SHA-1 của production keystore
8. Click **Save**

### Bước 3: Tải lại google-services.json

1. Sau khi thêm SHA-1, Firebase sẽ cập nhật cấu hình
2. Download file `google-services.json` mới từ Firebase Console
3. Thay thế file cũ trong project
4. Commit thay đổi

### Bước 4: Rebuild APK

```bash
# Clean cache
npx expo start --clear

# Rebuild với EAS
eas build -p android --profile production

# Hoặc local build
./build-apk.ps1
```

### Bước 5: Test

1. Tải APK mới về thiết bị
2. Cài đặt
3. Thử đăng nhập bằng Google
4. Nếu vẫn lỗi, kiểm tra logs:

```bash
adb logcat | grep -i "google"
```

## Kiểm tra nhanh

### Debug SHA-1 (đã có trong Firebase):
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### Production SHA-1 (EAS Build - ĐÃ THÊM):
```
2F:AC:AA:76:D7:13:85:73:B5:F9:0B:72:47:9E:FB:E6:9C:A1:26:7F
```

### Web Client ID (đã đúng):
```
9119519990-h0ghp9fhpjltof05160ea98bchd42i6n.apps.googleusercontent.com
```

### Android Client ID (đã đúng):
```
9119519990-7p0ipag5n5gpqho8skg3im5omf1sqrju.apps.googleusercontent.com
```

## Trạng thái hiện tại

✅ Firebase đã có 2 SHA-1:
- Debug keystore: `5E:8F:16:...` (cho development)
- Production keystore: `2F:AC:AA:...` (cho EAS Build APK)

⚠️ **Cần làm tiếp:**
1. Tải lại `google-services.json` từ Firebase Console
2. Thay file cũ trong project
3. Rebuild APK để áp dụng cấu hình mới

## Lưu ý quan trọng

1. **Mỗi keystore có SHA-1 khác nhau**:
   - Debug keystore: dùng cho development
   - Release keystore: dùng cho production APK
   - Cần thêm CẢ HAI vào Firebase Console

2. **Sau khi thêm SHA-1**:
   - Phải tải lại `google-services.json`
   - Phải rebuild APK
   - Không thể dùng APK cũ

3. **Nếu không có keystore**:
   - EAS tự động tạo và quản lý keystore
   - Dùng `eas credentials` để tải về

## Kiểm tra configure() được gọi

File hiện tại đã gọi `configureGoogleSignIn()` trong `app/_layout.tsx`:

```typescript
// Configure Google Sign-In khi app khởi động
configureGoogleSignIn();
```

Điều này đúng rồi, vấn đề chỉ là thiếu SHA-1 certificate.

## Nếu vẫn lỗi

1. Kiểm tra Google Play Services trên thiết bị đã cập nhật chưa
2. Xóa cache Google Play Services
3. Thử đăng nhập bằng tài khoản Google khác
4. Kiểm tra network có bị chặn không (firewall, proxy)

## Tài liệu tham khảo

- Firebase Console: https://console.firebase.google.com
- EAS Build: https://docs.expo.dev/build/introduction/
- Google Sign-In Setup: https://docs.expo.dev/guides/google-authentication/
