# 🔧 Hướng dẫn sửa lỗi "No symptoms matched"

## ✅ Đã hoàn thành

File `symptoms-mapping.json` đã được cập nhật thành công với **360 triệu chứng** cho **12 chuyên khoa**.

## 🔍 Nguyên nhân

Warning "⚠️ [SYMPTOM_ANALYSIS] No symptoms matched" xuất hiện vì:
- App React Native đang cache file `symptoms-mapping.json` cũ (chỉ có 123 triệu chứng)
- Cần restart app để load file mới (360 triệu chứng)

## 🚀 Cách khắc phục

### Bước 1: Clear Metro Bundler Cache

```bash
# Dừng app nếu đang chạy (Ctrl+C)

# Clear cache
npx expo start -c
```

### Bước 2: Restart app

```bash
# Chạy lại app
npx expo start

# Sau đó nhấn:
# - 'a' để chạy trên Android
# - 'i' để chạy trên iOS
# - 'w' để chạy trên Web
```

### Bước 3: Test lại

1. Mở app
2. Vào màn hình **Đặt lịch khám**
3. Nhập triệu chứng, ví dụ: "đau đầu", "đau lưng", "ho"
4. Bấm **"Phân tích bằng AI"** hoặc **"Xem chuyên khoa"**
5. Kiểm tra console log:
   - ✅ Nếu thấy: `✅ [SYMPTOM_ANALYSIS] Found: "đau đầu" (from name)`
   - ❌ Nếu vẫn thấy: `⚠️ [SYMPTOM_ANALYSIS] No symptoms matched`

## 📊 Kiểm tra dữ liệu

Chạy lệnh sau để verify file có đúng 360 triệu chứng:

```bash
node -e "const data = require('./symptoms-mapping.json'); console.log('Số triệu chứng:', data.symptoms.length); console.log('Số chuyên khoa:', data.mappings.length);"
```

Kết quả mong đợi:
```
Số triệu chứng: 360
Số chuyên khoa: 12
```

## 🧪 Test thủ công

Chạy file test để kiểm tra:

```bash
node test-symptom-simple.js
```

Kết quả mong đợi:
```
📊 Tổng số triệu chứng: 360
📊 Tổng số chuyên khoa: 12

🔍 TEST 1: Tìm "đau đầu"
✅ Tìm thấy: đau đầu
   Keywords: [ 'đau đầu', 'nhức đầu', 'đầu đau', 'dau dau', 'đau đầu dữ dội' ]
   Icon: 🧠
```

## 📝 Danh sách 12 chuyên khoa

1. **Thần kinh** (30 triệu chứng) - Icon: 🧠
2. **Cơ xương khớp** (30 triệu chứng) - Icon: 🦴
3. **Tim mạch** (30 triệu chứng) - Icon: ❤️
4. **Tiêu hóa** (30 triệu chứng) - Icon: 🍽️
5. **Hô hấp** (30 triệu chứng) - Icon: 🫁
6. **Da liễu** (30 triệu chứng) - Icon: 🩹
7. **Tai mũi họng** (30 triệu chứng) - Icon: 👂
8. **Mắt** (30 triệu chứng) - Icon: 👁️
9. **Nhi khoa** (30 triệu chứng) - Icon: 👶
10. **Nội tiết** (30 triệu chứng) - Icon: 🩺
11. **Răng hàm mặt** (30 triệu chứng) - Icon: 🦷
12. **Sản phụ khoa** (30 triệu chứng) - Icon: 🤰

## 🎯 Ví dụ test

### Test 1: Đau đầu → Thần kinh
```
Input: "đau đầu"
Expected: Chuyên khoa Thần kinh (confidence: 90%)
```

### Test 2: Đau lưng → Cơ xương khớp
```
Input: "đau lưng"
Expected: Chuyên khoa Cơ xương khớp (confidence: 90%)
```

### Test 3: Ho → Hô hấp
```
Input: "ho"
Expected: Chuyên khoa Hô hấp (confidence: 90%)
```

### Test 4: Đau bụng → Tiêu hóa
```
Input: "đau bụng"
Expected: Chuyên khoa Tiêu hóa (confidence: 90%)
```

## ⚠️ Lưu ý

- Nếu vẫn gặp lỗi sau khi clear cache, thử xóa folder `node_modules/.cache`
- Nếu vẫn không work, thử rebuild app: `npx expo prebuild --clean`
- Kiểm tra console log để debug: tìm dòng `[SYMPTOM_ANALYSIS]`

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, kiểm tra:
1. File `symptoms-mapping.json` có tồn tại không?
2. File có đúng 360 triệu chứng không?
3. App có đang chạy phiên bản mới nhất không?
4. Metro bundler có báo lỗi gì không?
