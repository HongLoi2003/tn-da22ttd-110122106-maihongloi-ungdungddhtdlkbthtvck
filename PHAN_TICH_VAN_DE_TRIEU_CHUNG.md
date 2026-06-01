# PHÂN TÍCH VẤN ĐỀ HỆ THỐNG TRIỆU CHỨNG

## 🔍 PHÁT HIỆN VẤN ĐỀ

### Vấn đề 1: Dữ liệu không đồng bộ
**File `symptoms-mapping-300.json`:**
- Có 250 triệu chứng (236 thực tế + 14 placeholder)
- Cấu trúc đơn giản: chỉ có `id` và `name`
- KHÔNG có synonyms, KHÔNG có weights
- KHÔNG được sử dụng trong code

**File `app/ai-chat.tsx`:**
- Hardcode ~360+ keywords với synonyms
- Mỗi keyword có weight và danh sách synonyms
- Dữ liệu được viết trực tiếp trong code

### Vấn đề 2: Thiếu synonyms trong JSON
File JSON chỉ có tên triệu chứng cơ bản:
```json
{
  "id": 1,
  "name": "đau đầu"
}
```

Nhưng code cần:
```javascript
{ 
  word: 'đau đầu', 
  weight: 10, 
  synonyms: ['nhức đầu', 'đầu đau', 'dau dau', 'đau đầu dữ dội'] 
}
```

### Vấn đề 3: Triệu chứng trùng lặp
Trong JSON có nhiều triệu chứng trùng lặp giữa các chuyên khoa:
- "khó thở" xuất hiện ở: Tim mạch (id 27, 60), Hô hấp (id 60), Nhi khoa (id 162)
- "đau họng" xuất hiện ở: Hô hấp (id 61), TMH (id 117, 161)
- "ho" xuất hiện ở: Hô hấp (id 57), Nhi khoa (id 158)

---

## 📊 SO SÁNH DỮ LIỆU

### symptoms-mapping-300.json
```
✅ Có: 236 triệu chứng thực tế
❌ Thiếu: Synonyms
❌ Thiếu: Weights
❌ Thiếu: Fuzzy matching keywords
✅ Có: Mappings đến chuyên khoa
```

### ai-chat.tsx (hardcoded)
```
✅ Có: ~360+ keywords
✅ Có: Synonyms đầy đủ
✅ Có: Weights cho từng keyword
✅ Có: Fuzzy matching
✅ Có: Mappings đến chuyên khoa
```

---

## 🎯 GIẢI PHÁP

### Giải pháp 1: Cập nhật JSON file (KHUYẾN NGHỊ)
Tạo file JSON mới với cấu trúc đầy đủ:

```json
{
  "specialties": {
    "than_kinh": {
      "id": 4,
      "name": "Thần kinh",
      "icon": "🧠",
      "keywords": [
        {
          "word": "đau đầu",
          "weight": 10,
          "synonyms": ["nhức đầu", "đầu đau", "dau dau"]
        }
      ]
    }
  }
}
```

### Giải pháp 2: Giữ nguyên hardcode (HIỆN TẠI)
- Ưu điểm: Nhanh, không cần load JSON
- Nhược điểm: Khó maintain, khó cập nhật

### Giải pháp 3: Hybrid approach
- Giữ keywords trong code để performance
- Dùng JSON để quản lý mappings
- Sync định kỳ giữa JSON và code

---

## 🔧 HÀNH ĐỘNG CẦN LÀM

### Bước 1: Quyết định approach
- [ ] Dùng JSON file (cần refactor code)
- [x] Giữ hardcode (hiện tại)
- [ ] Hybrid approach

### Bước 2: Nếu dùng JSON
1. Tạo file `symptoms-complete.json` với cấu trúc đầy đủ
2. Tạo service `symptomService.ts` để load JSON
3. Refactor `ai-chat.tsx` để dùng service
4. Test lại toàn bộ hệ thống

### Bước 3: Nếu giữ hardcode
1. ✅ Giữ nguyên code hiện tại
2. ✅ Tạo documentation về keywords
3. ✅ Tạo test cases
4. ⬜ Test và verify accuracy

---

## 📝 KHUYẾN NGHỊ

### Ngắn hạn (Hiện tại)
**Giữ nguyên hardcode trong `ai-chat.tsx`**

Lý do:
- Code đã hoạt động tốt
- Có đầy đủ synonyms và weights
- Performance tốt (không cần load JSON)
- Dễ debug và maintain

### Dài hạn (Tương lai)
**Chuyển sang JSON-based approach**

Lý do:
- Dễ cập nhật triệu chứng mới
- Có thể quản lý từ admin panel
- Dễ sync với database
- Có thể A/B test keywords

---

## ✅ KẾT LUẬN

**Hiện tại:**
- File `symptoms-mapping-300.json` KHÔNG được sử dụng
- Code `ai-chat.tsx` đang dùng hardcoded keywords
- Hệ thống hoạt động tốt với ~360+ keywords

**Cần làm:**
1. ✅ Test hệ thống hiện tại với test cases
2. ✅ Verify accuracy của keywords
3. ⬜ Quyết định có chuyển sang JSON hay không
4. ⬜ Nếu chuyển, tạo migration plan

**Ưu tiên:**
- Test và verify accuracy TRƯỚC
- Refactor sang JSON SAU (nếu cần)
