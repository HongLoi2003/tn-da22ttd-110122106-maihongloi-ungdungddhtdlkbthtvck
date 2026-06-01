# HƯỚNG DẪN CÀI ĐẶT GOOGLE GEMINI AI

## ⚠️ LƯU Ý QUAN TRỌNG VỀ API KEY

**API key bạn cung cấp `AQ.Ab8RN6...` KHÔNG PHẢI là Gemini API key!**

### So sánh API Keys:

| Dịch vụ | Format API Key | Ví dụ | Trạng thái |
|---------|---------------|-------|------------|
| **Google Gemini** | `AIzaSy...` | `AIzaSyABC123def456GHI789jkl012MNO345pqr` | ✅ ĐÚNG |
| Anthropic Claude | `sk-ant-...` | `sk-ant-api03-ABC123...` | ❌ SAI |
| OpenAI | `sk-...` | `sk-proj-ABC123...` | ❌ SAI |
| Dịch vụ khác | `AQ....` | `AQ.Ab8RN6KJONhO8JkqOg8USVmF...` | ❌ SAI |

**Gemini API key luôn có định dạng:**
- ✅ Bắt đầu bằng `AIzaSy`
- ✅ Không có dấu chấm (`.`) ở đầu
- ✅ Độ dài khoảng 39 ký tự

---

## 🔑 Bước 1: Lấy API Key từ Google AI Studio

### 1.1. Truy cập Google AI Studio
Mở trình duyệt và truy cập: **https://aistudio.google.com/app/apikey**

### 1.2. Đăng nhập
Đăng nhập bằng tài khoản Google của bạn

### 1.3. Tạo API Key
1. Click vào nút **"Create API Key"** (màu xanh)
2. Chọn project có sẵn hoặc click **"Create API key in new project"**
3. Đợi vài giây để Google tạo API key
4. Copy API key (phải bắt đầu bằng `AIzaSy`)

**Hình minh họa:**
```
┌─────────────────────────────────────────┐
│  Google AI Studio                       │
│                                         │
│  Your API Keys                          │
│  ┌───────────────────────────────────┐ │
│  │ AIzaSyABC123def456GHI789jkl012... │ │ ← Copy cái này
│  └───────────────────────────────────┘ │
│  [Create API Key]                       │
└─────────────────────────────────────────┘
```

---

## 📝 Bước 2: Thêm API Key vào file .env.local

### 2.1. Mở file .env.local
Mở file `.env.local` trong thư mục gốc của project

### 2.2. Tìm dòng cấu hình Gemini
Tìm dòng:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2.3. Thay thế API key
Thay `your_gemini_api_key_here` bằng API key bạn vừa copy

**Ví dụ ĐÚNG:**
```env
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

**Ví dụ SAI (KHÔNG dùng):**
```env
EXPO_PUBLIC_GEMINI_API_KEY=AQ.Ab8RN6KJONhO8JkqOg8USVmF-wSgR8Ac2InSsTEblNJtyNPq8Q
```

### 2.4. Kiểm tra kỹ
- ✅ API key phải bắt đầu bằng `AIzaSy`
- ✅ Không có khoảng trắng thừa trước/sau API key
- ✅ Không có dấu ngoặc kép hoặc ký tự đặc biệt

### 2.5. Lưu file
Nhấn `Ctrl+S` (Windows) hoặc `Cmd+S` (Mac) để lưu file

---

## 🚀 Bước 3: Khởi động lại ứng dụng

### 3.1. Dừng ứng dụng hiện tại
Nhấn `Ctrl+C` trong terminal để dừng ứng dụng

### 3.2. Xóa cache và khởi động lại
```bash
npx expo start --clear
```

**Lưu ý:** Phải dùng `--clear` để xóa cache và load lại biến môi trường mới.

---

## ✅ Bước 4: Kiểm tra

### 4.1. Kiểm tra UI
1. Mở app và vào màn hình **Đặt lịch khám**
2. Nhập triệu chứng vào ô text (ví dụ: "đau đầu, chóng mặt")
3. Kiểm tra nút phân tích:
   - ✅ **Thấy nút "Phân tích bằng AI" với icon ✨** → API key đã hoạt động
   - ❌ **Chỉ thấy nút "Xem chuyên khoa"** → API key chưa được cấu hình hoặc không hợp lệ

### 4.2. Kiểm tra console log
Mở console và tìm:
```
✅ [GEMINI] Service initialized successfully  ← API key hợp lệ
```

Hoặc:
```
ℹ️ [GEMINI] API key not configured or invalid format  ← API key không hợp lệ
```

### 4.3. Test phân tích
Thử nhập các triệu chứng sau:
- "Tôi bị đau đầu dữ dội, chóng mặt và buồn nôn"
- "Khó thở, ho khan, đau ngực"
- "Đau bụng, tiêu chảy, buồn nôn"

Nếu thấy text **"🤖 Phân tích bằng AI: ..."** → AI đã hoạt động thành công!

---

## 🎯 Cách hoạt động

### Khi có API Key hợp lệ:
1. Người dùng nhập triệu chứng
2. Hệ thống gửi triệu chứng đến **Google Gemini AI**
3. AI phân tích dựa trên **330 triệu chứng** của **12 chuyên khoa**
4. AI trả về:
   - Chuyên khoa phù hợp nhất
   - Độ tin cậy (0-100%)
   - Giải thích tại sao chọn chuyên khoa này
   - Các triệu chứng được nhận diện
5. Hiển thị kết quả với icon ✨ và text "🤖 Phân tích bằng AI"

### Khi không có API Key:
- Hệ thống tự động sử dụng **fuzzy matching** (phương pháp cũ)
- Vẫn hoạt động bình thường, chỉ không có AI explanation
- Độ chính xác thấp hơn

---

## 🐛 Troubleshooting

### ❌ Lỗi: "API key not valid. Please pass a valid API key"

**Nguyên nhân:**
- API key không đúng format (không bắt đầu bằng `AIzaSy`)
- API key bị sai hoặc đã bị vô hiệu hóa
- API key của dịch vụ khác (không phải Gemini)

**Giải pháp:**
1. Kiểm tra API key trong `.env.local` có bắt đầu bằng `AIzaSy` không
2. Nếu không, truy cập https://aistudio.google.com/app/apikey để tạo API key mới
3. Copy API key mới (phải bắt đầu bằng `AIzaSy`)
4. Dán vào `.env.local`
5. Khởi động lại app: `npx expo start --clear`

### ❌ Không thấy nút "Phân tích bằng AI"

**Nguyên nhân:**
- API key chưa được cấu hình
- API key không hợp lệ
- App chưa được khởi động lại sau khi thay đổi `.env.local`

**Giải pháp:**
1. Kiểm tra file `.env.local` đã lưu chưa
2. Kiểm tra API key có đúng format không
3. Khởi động lại app với `npx expo start --clear` (bắt buộc có `--clear`)
4. Kiểm tra console log có thông báo `✅ [GEMINI] Service initialized successfully` không

### ⏱️ Phân tích chậm

**Bình thường:**
- Gemini AI cần 2-5 giây để phân tích
- Hiển thị "AI đang phân tích..." trong lúc chờ

**Bất thường:**
- Nếu quá 10 giây không có kết quả
- Kiểm tra kết nối internet
- Kiểm tra console log có lỗi không

**Fallback:**
- Nếu AI thất bại, hệ thống tự động chuyển sang fuzzy matching
- Vẫn có kết quả phân tích, nhưng độ chính xác thấp hơn

### 🔍 Cách kiểm tra API key đang dùng

Mở console log và tìm:
```
✅ [GEMINI] Service initialized successfully  ← API key hợp lệ
ℹ️ [GEMINI] API key not configured or invalid format  ← API key không hợp lệ
```

Hoặc kiểm tra trong code:
```typescript
console.log('API Key:', process.env.EXPO_PUBLIC_GEMINI_API_KEY);
console.log('Starts with AIzaSy:', process.env.EXPO_PUBLIC_GEMINI_API_KEY?.startsWith('AIzaSy'));
```

---

## 📊 Danh sách triệu chứng AI phân tích

AI được huấn luyện với **330 triệu chứng** thuộc **12 chuyên khoa**:

1. **Thần kinh** (30 triệu chứng): Đau đầu, Chóng mặt, Mất ngủ, Run tay chân, Tê tay chân...
2. **Cơ xương khớp** (30 triệu chứng): Đau lưng, Đau cổ vai gáy, Đau khớp gối, Cứng khớp...
3. **Da liễu** (30 triệu chứng): Nổi mẩn đỏ, Ngứa da, Mụn trứng cá, Dị ứng da...
4. **Hô hấp** (30 triệu chứng): Ho, Khó thở, Đau họng, Nghẹt mũi, Viêm phổi...
5. **Mắt** (30 triệu chứng): Đau mắt, Mắt đỏ, Mờ mắt, Khô mắt, Giảm thị lực...
6. **Nhi khoa** (30 triệu chứng): Sốt, Ho, Tiêu chảy, Nôn ói, Biếng ăn...
7. **Nội tiết** (30 triệu chứng): Tiểu nhiều, Khát nước nhiều, Sụt cân, Đường huyết cao...
8. **Răng hàm mặt** (30 triệu chứng): Đau răng, Sâu răng, Chảy máu chân răng, Sưng nướu...
9. **Sản phụ khoa** (30 triệu chứng): Đau bụng dưới, Rối loạn kinh nguyệt, Trễ kinh...
10. **Tai mũi họng** (30 triệu chứng): Đau họng, Viêm họng, Nghẹt mũi, Đau tai, Ù tai...
11. **Tiêu hóa** (30 triệu chứng): Đau bụng, Đầy hơi, Khó tiêu, Tiêu chảy, Táo bón...
12. **Tim mạch** (30 triệu chứng): Đau ngực, Tức ngực, Khó thở, Tim đập nhanh...

---

## ⚠️ Lưu ý quan trọng

- ✅ API key phải bắt đầu bằng `AIzaSy` và không có dấu chấm (`.`)
- ❌ Nếu API key của bạn bắt đầu bằng `AQ.`, `sk-`, `sk-ant-` thì đó KHÔNG PHẢI là Gemini API key
- 🆓 Gemini API miễn phí có giới hạn: 60 requests/phút, 1500 requests/ngày
- 🔒 Không chia sẻ API key với người khác
- 💾 File `.env.local` không được commit lên Git (đã có trong `.gitignore`)
- 🌐 Cần kết nối internet để sử dụng Gemini AI

---

## 🔗 Tài liệu tham khảo

- Google AI Studio: https://aistudio.google.com/
- Gemini API Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing

---

## 🎉 Hoàn tất!

Sau khi thêm API key đúng format (`AIzaSy...`) và khởi động lại ứng dụng với `npx expo start --clear`, tính năng phân tích triệu chứng bằng AI sẽ hoạt động!

**Nếu vẫn gặp vấn đề:**
1. Chụp màn hình console log
2. Chụp màn hình file `.env.local` (che API key)
3. Mô tả chi tiết lỗi gặp phải
