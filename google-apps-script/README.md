# 📧 Google Apps Script - OTP Email Service

## 🚀 Quick Start (5 phút)

### Bước 1: Tạo Script
1. Truy cập: **https://script.google.com/**
2. Click **"New project"** (góc trên bên trái)
3. Copy code từ file `send-otp-email.gs` → Paste vào editor
4. Save (Ctrl+S)

### Bước 2: Deploy
1. Click **"Deploy"** → **"New deployment"**
2. Chọn type: **"Web app"**
3. Execute as: **"Me"**
4. Who has access: **"Anyone"**
5. Click **"Deploy"**
6. Authorize quyền (Click "Advanced" → "Go to ... (unsafe)" → "Allow")
7. **Copy Web App URL**

### Bước 3: Cấu hình App
1. Mở file: `app/services/googleScriptEmailService.ts`
2. Paste URL vào:
   ```typescript
   const GOOGLE_SCRIPT_WEB_APP_URL = 'YOUR_URL_HERE';
   ```

### Bước 4: Sử dụng
```typescript
import { sendOTPEmailViaGoogleScript } from './services/googleScriptEmailService';

const emailSent = await sendOTPEmailViaGoogleScript('user@gmail.com', '123456');
```

## 📚 Chi tiết

Xem file: `../GOOGLE-APPS-SCRIPT-SETUP.md`

## ✅ Ưu điểm

- ✅ Miễn phí
- ✅ Gửi từ Gmail cá nhân
- ✅ Độ tin cậy cao
- ✅ Ít bị spam
- ✅ Template đẹp

## 🎯 Giới hạn

- Gmail thường: **100 emails/ngày**
- Google Workspace: **500 emails/ngày**

**→ Khuyến nghị: Dùng kết hợp với EmailJS (failover)**
