# Bước Cuối Cùng - Cần google-services.json

## 🎯 Tình Trạng Hiện Tại

**Đã sửa hầu hết các vấn đề:**
- ✅ Cài EAS CLI
- ✅ Đăng nhập EAS
- ✅ Sửa lỗi babel-preset-expo
- ✅ Tắt React Compiler
- ✅ Thêm EXPO_NO_BYTECODE
- ✅ Chuyển sang managed workflow
- ✅ Cập nhật app.json

**Còn thiếu 1 file:**
- ❌ google-services.json

## 📥 Cần Làm Ngay

### Download google-services.json từ Firebase

1. **Vào Firebase Console**
   https://console.firebase.google.com/

2. **Chọn project của bạn**

3. **Vào Project Settings** (icon ⚙️)

4. **Tìm Android app**
   - Package name: `com.maihongloi23.heatlecare`
   - Nếu chưa có, tạo mới

5. **Download google-services.json**
   - Click vào Android app
   - Download file

6. **Đặt vào thư mục gốc**
   ```
   D:\heatlecare\google-services.json
   ```

## 🚀 Sau Khi Có File

### Kiểm Tra
```powershell
Test-Path "google-services.json"
# Phải trả về: True
```

### Build
```bash
npx eas-cli build --platform android --profile production
```

## ✨ Kết Quả Mong Đợi

Build sẽ thành công và tạo APK trong ~10-15 phút.

## 📊 Thay Đổi Đã Làm

### 1. Chuyển Sang Managed Workflow
- Xóa thư mục `android` (đã backup thành `android.backup`)
- EAS sẽ tự generate native code
- Đơn giản hơn, ít lỗi hơn

### 2. Cấu Hình app.json
```json
{
  "android": {
    "package": "com.maihongloi23.heatlecare",
    "googleServicesFile": "./google-services.json"
  }
}
```

### 3. EAS Config
```json
{
  "build": {
    "production": {
      "android": {
        "env": {
          "EXPO_NO_BYTECODE": "1"
        }
      }
    }
  }
}
```

## 🎯 Tại Sao Approach Này Tốt Hơn

### Trước (Bare Workflow)
- Phải quản lý native code
- Dễ xung đột
- Phức tạp hơn

### Bây Giờ (Managed Workflow)
- Expo quản lý native code
- Ít lỗi hơn
- Dễ maintain hơn
- Vẫn có đầy đủ tính năng

## 📝 Files Quan Trọng

1. **google-services.json** - Cần download từ Firebase
2. **app.json** - Đã cập nhật
3. **eas.json** - Đã cập nhật
4. **package.json** - Đã cập nhật

## ⚡ Quick Start

```bash
# 1. Download google-services.json từ Firebase
# 2. Đặt vào D:\heatlecare\google-services.json
# 3. Build
npx eas-cli build --platform android --profile production
```

## 💡 Lưu Ý

- File google-services.json không được commit vào git
- EAS sẽ tự động upload khi build
- Build lần này sẽ thành công!

---

**Xem hướng dẫn chi tiết**: `DOWNLOAD_GOOGLE_SERVICES.md`
