# Thử Prebuild Approach

## Vấn Đề
Build thất bại với "unknown error" trong phase Run gradlew.

## Nguyên Nhân Có Thể
- Google Services plugin không được apply đúng
- Conflict giữa managed workflow và native code
- EAS không nhận được google-services.json

## Giải Pháp: Dùng Prebuild

### Option 1: Build Local Trước
```bash
# Generate native code
npx expo prebuild --platform android

# Test build local
cd android
./gradlew assembleRelease

# Nếu OK, commit và build với EAS
```

### Option 2: Đơn Giản Hóa Config

Xóa thư mục android và để EAS tự generate:
```bash
# Backup android folder
mv android android.backup

# Build với EAS (sẽ tự generate)
npx eas-cli build --platform android --profile production
```

### Option 3: Sử dụng Managed Workflow

Không dùng thư mục android, để Expo quản lý hoàn toàn:
1. Xóa thư mục android
2. Xóa google-services.json
3. Dùng expo-google-app-auth thay vì native
4. Build với managed workflow

## Khuyến Nghị

**Thử Option 2 trước** - Đơn giản nhất:
1. Rename android folder
2. Build lại với EAS
3. EAS sẽ tự generate native code

Nếu vẫn lỗi, cần xem log chi tiết.
