# 🚀 HƯỚNG DẪN CHẠY APP EXPO

## ⚠️ VẤN ĐỀ HIỆN TẠI

App đang sử dụng **Development Build** (expo-dev-client) thay vì **Expo Go**. Điều này có nghĩa là:
- ❌ Không thể quét mã QR bằng app Expo Go thông thường
- ✅ Cần build development client hoặc chuyển sang Expo Go

---

## 🎯 GIẢI PHÁP 1: CHUYỂN SANG EXPO GO (NHANH - KHUYẾN NGHỊ)

### Bước 1: Dừng server hiện tại
```bash
# Nhấn Ctrl+C trong terminal đang chạy npm start
```

### Bước 2: Xóa expo-dev-client khỏi dependencies
```bash
npm uninstall expo-dev-client
```

### Bước 3: Chạy lại với Expo Go
```bash
npx expo start --go
```

### Bước 4: Quét mã QR
1. Tải **Expo Go** từ:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Mở Expo Go và quét mã QR hiển thị trong terminal

---

## 🎯 GIẢI PHÁP 2: BUILD DEVELOPMENT CLIENT (CHẬM HƠN)

### Cho Android:
```bash
# Build development client
npx expo run:android

# Sau khi build xong, chạy:
npm start
```

### Cho iOS (chỉ trên Mac):
```bash
# Build development client
npx expo run:ios

# Sau khi build xong, chạy:
npm start
```

---

## 🎯 GIẢI PHÁP 3: CHẠY TRỰC TIẾP TRÊN ANDROID (KHÔNG CẦN QR)

```bash
# Kết nối điện thoại Android qua USB và bật USB Debugging
# Hoặc khởi động Android Emulator

# Chạy lệnh:
npm run android
```

---

## 📱 CÁCH KIỂM TRA APP ĐANG DÙNG GÌ

Khi chạy `npm start`, xem dòng thông báo:
- ✅ `Using Expo Go` → Có thể quét QR bằng Expo Go
- ⚠️ `Using development build` → Cần build development client trước

---

## 🔧 KHUYẾN NGHỊ

**Cho development/testing nhanh:**
→ Dùng **GIẢI PHÁP 1** (Expo Go)

**Cho production hoặc cần native modules:**
→ Dùng **GIẢI PHÁP 2** (Development Build)

**Cho testing trực tiếp không cần QR:**
→ Dùng **GIẢI PHÁP 3** (Run Android)

---

## ❓ CÂU HỎI THƯỜNG GẶP

### Q: Tại sao không quét được mã QR?
A: Vì app đang dùng development build, không phải Expo Go. Cần chuyển sang Expo Go hoặc build development client.

### Q: Nên chọn giải pháp nào?
A: 
- Nếu chỉ test UI/logic → Chọn Expo Go (nhanh)
- Nếu cần test Google Sign-In, Firebase → Cần build development client hoặc APK

### Q: Làm sao biết đã chuyển sang Expo Go?
A: Chạy `npm start` và xem có dòng "Using Expo Go" không.

---

## 🎬 BƯỚC TIẾP THEO

Chọn một trong 3 giải pháp trên và làm theo hướng dẫn!
