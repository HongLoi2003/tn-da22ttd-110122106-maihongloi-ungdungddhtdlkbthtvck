# Xem Lỗi Build Chi Tiết

## 🔍 Cách Xem Log

### Bước 1: Mở Link Build
https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/a013c3dd-2b1e-4b5e-a46c-1738534d6698

### Bước 2: Tìm Phase "Run gradlew"
- Scroll xuống tìm phase có màu đỏ
- Click vào "Run gradlew" để mở log

### Bước 3: Tìm Error Message
Tìm các dòng có:
- `error:`
- `FAILURE:`
- `BUILD FAILED`
- `Exception`

## 📋 Các Lỗi Thường Gặp

### 1. Google Services Error
```
Could not find google-services.json
```
**Giải pháp**: File google-services.json không được upload

### 2. Dependency Error
```
Could not resolve all dependencies
Could not find com.google.gms:google-services
```
**Giải pháp**: Vấn đề với dependencies

### 3. Memory Error
```
OutOfMemoryError
GC overhead limit exceeded
```
**Giải pháp**: Tăng memory trong gradle.properties

### 4. Duplicate Class Error
```
Duplicate class found
```
**Giải pháp**: Xung đột dependencies

### 5. NDK Error
```
NDK not found
No version of NDK matched
```
**Giải pháp**: Vấn đề với NDK version

## 🔧 Hành Động

**Vui lòng:**
1. Mở link build ở trên
2. Click vào phase "Run gradlew"
3. Copy toàn bộ error message (khoảng 20-30 dòng cuối)
4. Gửi cho tôi để phân tích

## 💡 Lưu Ý

Lỗi "unknown error" thường là:
- Google Services plugin issue
- Dependency conflict
- Memory issue
- NDK version issue

Cần xem log chi tiết để biết chính xác.
