# Download google-services.json

## ⚠️ Cần Làm Ngay

File `google-services.json` bị thiếu. Cần download từ Firebase Console.

## 📥 Cách Download

### Bước 1: Vào Firebase Console
https://console.firebase.google.com/

### Bước 2: Chọn Project
- Click vào project "heatlecare" (hoặc tên project của bạn)

### Bước 3: Vào Project Settings
- Click vào icon ⚙️ (Settings) bên cạnh "Project Overview"
- Chọn "Project settings"

### Bước 4: Chọn Android App
- Scroll xuống phần "Your apps"
- Tìm Android app với package name: `com.maihongloi23.heatlecare`
- Nếu chưa có, click "Add app" và tạo Android app mới

### Bước 5: Download File
- Click vào Android app
- Scroll xuống tìm "google-services.json"
- Click "Download google-services.json"

### Bước 6: Đặt File Vào Dự Án
```bash
# Copy file vừa download vào thư mục gốc dự án
# File phải có tên: google-services.json
# Đặt tại: D:\heatlecare\google-services.json
```

## 🔧 Sau Khi Download

### 1. Kiểm Tra File
```powershell
Test-Path "google-services.json"
# Phải trả về: True
```

### 2. Cập Nhật app.json
File app.json đã được cập nhật để trỏ đến:
```json
"googleServicesFile": "./google-services.json"
```

### 3. Build Lại
```bash
npx eas-cli build --platform android --profile production
```

## 📝 Lưu Ý

- File này chứa Firebase config cho Android
- Không commit file này vào git (đã có trong .gitignore)
- EAS sẽ tự động upload file khi build
- File phải đặt ở thư mục gốc dự án

## ✅ Checklist

- [ ] Vào Firebase Console
- [ ] Download google-services.json
- [ ] Đặt file vào D:\heatlecare\google-services.json
- [ ] Kiểm tra file tồn tại
- [ ] Build lại với EAS

## 🚀 Sau Khi Có File

Chạy lệnh này để build:
```bash
npx eas-cli build --platform android --profile production
```

Build sẽ thành công lần này!
