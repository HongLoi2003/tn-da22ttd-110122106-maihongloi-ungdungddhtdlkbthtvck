# KIỂM TRA HỆ THỐNG PHÂN TÍCH TRIỆU CHỨNG

## 📊 TỔNG QUAN HỆ THỐNG HIỆN TẠI

### Chuyên khoa được hỗ trợ (12 chuyên khoa):
1. ✅ **Thần kinh** - 30+ keywords
2. ✅ **Cơ xương khớp** - 30+ keywords  
3. ✅ **Tim mạch** - 30+ keywords
4. ✅ **Tiêu hóa** - 30+ keywords
5. ✅ **Hô hấp** - 30+ keywords
6. ✅ **Da liễu** - 30+ keywords
7. ✅ **Tai mũi họng** - 30+ keywords
8. ✅ **Mắt** - 30+ keywords
9. ✅ **Nhi khoa** - 30+ keywords
10. ✅ **Nội tiết** - 30+ keywords
11. ✅ **Răng hàm mặt** - 30+ keywords
12. ✅ **Sản phụ khoa** - 30+ keywords

**Tổng cộng: ~360+ keywords với synonyms**

---

## 🔍 CƠ CHẾ PHÂN TÍCH

### 1. Exact Match (100% điểm)
```javascript
if (lowerText.includes(keywordObj.word)) {
  totalScore += keywordObj.weight * 1.0;
}
```

### 2. Synonym Match (90% điểm)
```javascript
keywordObj.synonyms.forEach(synonym => {
  if (lowerText.includes(synonym)) {
    totalScore += keywordObj.weight * 0.9;
  }
});
```

### 3. Fuzzy Match (70-75% điểm)
- Sử dụng Levenshtein Distance
- Cho phép gõ sai chính tả
- Similarity >= 75% mới được tính điểm

---

## ✅ ĐIỂM MẠNH

1. **Hỗ trợ nhiều từ đồng nghĩa**
   - Ví dụ: "đau đầu" = "nhức đầu", "đầu đau", "dau dau"
   
2. **Cho phép gõ sai chính tả**
   - "dau dau" → "đau đầu"
   - "kho tho" → "khó thở"

3. **Hệ thống scoring thông minh**
   - Weight khác nhau cho từng triệu chứng
   - Triệu chứng quan trọng có weight cao hơn

4. **Hiển thị top 3 chuyên khoa**
   - Giúp user có nhiều lựa chọn
   - Tính % độ tin cậy rõ ràng

---

## ⚠️ VẤN ĐỀ CẦN KIỂM TRA

### 1. Triệu chứng chung (overlap giữa các chuyên khoa)


**Ví dụ:**
- "khó thở" xuất hiện ở: Tim mạch, Hô hấp, Nhi khoa
- "đau bụng" xuất hiện ở: Tiêu hóa, Sản phụ khoa, Nhi khoa
- "mệt mỏi" xuất hiện ở: Thần kinh, Tim mạch, Nội tiết

**Giải pháp:** Hệ thống đã xử lý bằng cách:
- Tính điểm cho TẤT CẢ chuyên khoa có triệu chứng
- Hiển thị top 3 để user có nhiều lựa chọn
- Dùng follow-up questions để chính xác hóa

### 2. Triệu chứng mơ hồ
**Ví dụ:**
- "Tôi bị đau" → Đau ở đâu?
- "Tôi không khỏe" → Triệu chứng cụ thể?
- "Tôi bị ốm" → Ốm như thế nào?

**Giải pháp hiện tại:**
```javascript
if (analyzedSpecialties.length === 0) {
  // Yêu cầu mô tả chi tiết hơn
  const clarifyText = 'Tôi chưa thể xác định...';
}
```

### 3. Triệu chứng phức tạp (nhiều chuyên khoa)
**Ví dụ:**
- "Đau đầu, chóng mặt, buồn nôn" → Thần kinh? Tai mũi họng? Tiêu hóa?
- "Đau ngực, khó thở, mệt mỏi" → Tim mạch? Hô hấp?

**Giải pháp:** Follow-up questions để hỏi thêm

---

## 🧪 TEST CASES CẦN KIỂM TRA

### Test 1: Triệu chứng đơn giản
```
Input: "đau đầu"
Expected: Thần kinh (95%+)
```

### Test 2: Triệu chứng kép
```
Input: "đau đầu và chóng mặt"
Expected: Thần kinh (90%+)
```

### Test 3: Triệu chứng overlap
```
Input: "khó thở"
Expected: Hô hấp (80%+), Tim mạch (70%+)
```

### Test 4: Gõ sai chính tả
```
Input: "dau dau va chong mat"
Expected: Thần kinh (85%+)
```

### Test 5: Từ đồng nghĩa
```
Input: "nhức đầu và hoa mắt"
Expected: Thần kinh (90%+)
```

### Test 6: Triệu chứng mơ hồ
```
Input: "tôi bị đau"
Expected: Yêu cầu mô tả chi tiết hơn
```

### Test 7: Triệu chứng phức tạp
```
Input: "đau ngực, khó thở, tim đập nhanh"
Expected: Tim mạch (95%+), Hô hấp (75%+)
```

### Test 8: Triệu chứng nhi khoa
```
Input: "con tôi sốt cao và ho"
Expected: Nhi khoa (90%+), Hô hấp (70%+)
```

### Test 9: Triệu chứng sản phụ khoa
```
Input: "đau bụng dưới và trễ kinh"
Expected: Sản phụ khoa (95%+)
```

### Test 10: Triệu chứng răng hàm mặt
```
Input: "đau răng và sưng nướu"
Expected: Răng hàm mặt (95%+)
```

---

## 🔧 ĐỀ XUẤT CẢI THIỆN

### 1. Thêm context-aware scoring
```javascript
// Nếu có từ "con tôi", "bé", "trẻ" → tăng điểm Nhi khoa
// Nếu có từ "mang thai", "có thai" → tăng điểm Sản phụ khoa
// Nếu có từ "kinh nguyệt", "hành kinh" → tăng điểm Sản phụ khoa
```

### 2. Cải thiện xử lý triệu chứng overlap
```javascript
// Nếu có "khó thở" + "ho" → ưu tiên Hô hấp
// Nếu có "khó thở" + "đau ngực" → ưu tiên Tim mạch
// Nếu có "khó thở" + "sốt" → ưu tiên Nhi khoa (nếu trẻ em)
```

### 3. Thêm negative keywords
```javascript
// Nếu có "không đau đầu" → loại bỏ điểm Thần kinh
// Nếu có "không sốt" → giảm điểm các chuyên khoa liên quan
```

### 4. Cải thiện fuzzy matching
```javascript
// Hiện tại: similarity >= 0.75
// Đề xuất: similarity >= 0.80 để chính xác hơn
```

### 5. Thêm location-based scoring
```javascript
// "đau ở đầu" → Thần kinh
// "đau ở ngực" → Tim mạch
// "đau ở bụng" → Tiêu hóa
// "đau ở lưng" → Cơ xương khớp
```

---

## 📝 HƯỚNG DẪN TEST

### Bước 1: Chạy test cases
```bash
node test-symptom-analysis.js
```

### Bước 2: Test trên app thực tế
1. Mở app
2. Vào trang "Chat tư vấn chuyên khoa"
3. Bấm "Bắt đầu chat"
4. Nhập từng test case
5. Ghi chú kết quả

### Bước 3: Ghi chú kết quả
```
Test 1: ✅ PASS - Thần kinh 95%
Test 2: ✅ PASS - Thần kinh 92%
Test 3: ⚠️ WARN - Hô hấp 85%, Tim mạch 60% (cần cải thiện)
Test 4: ✅ PASS - Thần kinh 87%
...
```

### Bước 4: Điều chỉnh weights
Nếu kết quả không chính xác, điều chỉnh weight trong `ai-chat.tsx`:
```javascript
{ word: 'đau đầu', weight: 10, synonyms: [...] }
// Tăng weight lên 12 nếu cần ưu tiên hơn
```

---

## 🎯 KẾT LUẬN

Hệ thống phân tích triệu chứng hiện tại:
- ✅ Đã có 360+ keywords
- ✅ Hỗ trợ 12 chuyên khoa
- ✅ Có fuzzy matching
- ✅ Có synonym matching
- ✅ Có follow-up questions

**Cần kiểm tra:**
- ⚠️ Độ chính xác với triệu chứng overlap
- ⚠️ Xử lý triệu chứng mơ hồ
- ⚠️ Context-aware scoring

**Khuyến nghị:**
1. Chạy tất cả test cases
2. Ghi chú các trường hợp sai
3. Điều chỉnh weights và synonyms
4. Test lại cho đến khi đạt 90%+ accuracy
