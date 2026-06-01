# ❌ LỖI: API KEY KHÔNG HỢP LỆ

## Vấn đề

Bạn đã cung cấp API key: `AQ.Ab8RN6KJONhO8JkqOg8USVmF-wSgR8Ac2InSsTEblNJtyNPq8Q`

**Đây KHÔNG PHẢI là Google Gemini API key!**

## Tại sao không hoạt động?

API key của bạn bắt đầu bằng `AQ.` - đây là API key của một dịch vụ khác (có thể là Anthropic, AWS, hoặc dịch vụ khác), không phải Google Gemini.

### So sánh:

| Dịch vụ | Format | API key của bạn | Trạng thái |
|---------|--------|-----------------|------------|
| **Google Gemini** | `AIzaSy...` | `AQ.Ab8RN6...` | ❌ KHÔNG KHỚP |
| Dịch vụ khác | `AQ....` | `AQ.Ab8RN6...` | ✅ KHỚP (nhưng sai dịch vụ) |

## Giải pháp

### Bước 1: Lấy API key ĐÚNG từ Google

1. Truy cập: **https://aistudio.google.com/app/apikey**
2. Đăng nhập bằng tài khoản Google
3. Click nút **"Create API Key"** (màu xanh)
4. Chọn project hoặc tạo mới
5. Copy API key (phải bắt đầu bằng `AIzaSy`)

**Ví dụ API key ĐÚNG:**
```
AIzaSyABC123def456GHI789jkl012MNO345pqr
```

### Bước 2: Cập nhật file .env.local

Mở file `.env.local` và thay đổi:

**TRƯỚC (SAI):**
```env
EXPO_PUBLIC_GEMINI_API_KEY=AQ.Ab8RN6KJONhO8JkqOg8USVmF-wSgR8Ac2InSsTEblNJtyNPq8Q
```

**SAU (ĐÚNG):**
```env
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

### Bước 3: Khởi động lại app

```bash
npx expo start --clear
```

**Lưu ý:** Phải dùng `--clear` để xóa cache!

## Cách kiểm tra

### Cách 1: Chạy test file
```bash
# Trong app, mở màn hình:
app/test-api-key-format.tsx
```

Màn hình này sẽ hiển thị:
- ✅ API key hợp lệ hoặc ❌ API key không hợp lệ
- Loại API key (Google Gemini, Anthropic, OpenAI, etc.)
- Các kiểm tra chi tiết
- Hướng dẫn sửa lỗi

### Cách 2: Kiểm tra console log

Sau khi khởi động lại app, xem console:

**Nếu API key ĐÚNG:**
```
✅ [GEMINI] Service initialized successfully
```

**Nếu API key SAI:**
```
ℹ️ [GEMINI] API key not configured or invalid format - using fallback
```

### Cách 3: Kiểm tra UI

Vào màn hình **Đặt lịch khám** → Nhập triệu chứng:

**Nếu API key ĐÚNG:**
- Thấy nút **"Phân tích bằng AI"** với icon ✨
- Khi phân tích xong, thấy text **"🤖 Phân tích bằng AI: ..."**

**Nếu API key SAI:**
- Chỉ thấy nút **"Xem chuyên khoa"** (không có icon ✨)
- Không có text "🤖 Phân tích bằng AI"

## Lỗi bạn đang gặp

```
ERROR  ❌ [GEMINI] Error analyzing symptoms: 
[Error: [GoogleGenerativeAI Error]: Error fetching from 
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: 
[400 ] API key not valid. Please pass a valid API key.
```

**Nguyên nhân:** API key `AQ.Ab8RN6...` không phải là Gemini API key nên Google từ chối.

**Giải pháp:** Lấy API key MỚI từ https://aistudio.google.com/app/apikey (phải bắt đầu bằng `AIzaSy`)

## Checklist

Trước khi hỏi lại, hãy kiểm tra:

- [ ] API key bắt đầu bằng `AIzaSy` (KHÔNG PHẢI `AQ.`, `sk-`, `sk-ant-`)
- [ ] API key không có dấu chấm (`.`) ở đầu
- [ ] API key có độ dài khoảng 39 ký tự
- [ ] Đã lưu file `.env.local`
- [ ] Đã khởi động lại app với `npx expo start --clear`
- [ ] Đã kiểm tra console log có thông báo `✅ [GEMINI] Service initialized successfully`

## Tài liệu tham khảo

- Hướng dẫn chi tiết: `HUONG_DAN_CAI_DAT_GEMINI_AI.md`
- Test API key: `app/test-api-key-format.tsx`
- Google AI Studio: https://aistudio.google.com/app/apikey
- Gemini API Docs: https://ai.google.dev/docs

## Tóm tắt

1. ❌ API key `AQ.Ab8RN6...` KHÔNG PHẢI là Gemini API key
2. ✅ Gemini API key phải bắt đầu bằng `AIzaSy`
3. 🔑 Lấy API key mới tại: https://aistudio.google.com/app/apikey
4. 📝 Cập nhật file `.env.local`
5. 🚀 Khởi động lại app: `npx expo start --clear`
6. ✅ Kiểm tra console log hoặc chạy `app/test-api-key-format.tsx`
