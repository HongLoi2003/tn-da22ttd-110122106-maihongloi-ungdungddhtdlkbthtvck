# HƯỚNG DẪN KIỂM TRA HỆ THỐNG PHÂN TÍCH TRIỆU CHỨNG

## 🎯 MỤC ĐÍCH
Kiểm tra xem hệ thống AI phân tích triệu chứng có hoạt động chính xác không, đảm bảo người dùng nhập triệu chứng sẽ được gợi ý đúng chuyên khoa.

---

## 📱 CÁCH 1: TEST TRỰC TIẾP TRÊN APP

### Bước 1: Mở trang test
1. Chạy app: `npm start`
2. Vào trang: `/test-symptom-analyzer`
3. Hoặc thêm link vào menu để dễ truy cập

### Bước 2: Test với các trường hợp mẫu
Bấm vào các nút "Test nhanh" để xem kết quả ngay lập tức:

#### ✅ Test 1: Thần kinh
```
Input: "đau đầu và chóng mặt"
Kỳ vọng: Thần kinh (90-95%)
```

#### ✅ Test 2: Cơ xương khớp
```
Input: "đau lưng nhức lưng"
Kỳ vọng: Cơ xương khớp (90-95%)
```

#### ✅ Test 3: Tim mạch
```
Input: "đau ngực khó thở"
Kỳ vọng: Tim mạch (90-95%)
```

#### ✅ Test 4: Tiêu hóa
```
Input: "đau bụng tiêu chảy"
Kỳ vọng: Tiêu hóa (90-95%)
```

#### ✅ Test 5: Hô hấp
```
Input: "ho và đau họng"
Kỳ vọng: Hô hấp (90-95%)
```

#### ✅ Test 6: Gõ sai chính tả
```
Input: "dau dau va chong mat"
Kỳ vọng: Thần kinh (85-90%)
```

#### ✅ Test 7: Từ đồng nghĩa
```
Input: "nhức đầu hoa mắt"
Kỳ vọng: Thần kinh (90-95%)
```

---

## 📱 CÁCH 2: TEST TRÊN TRANG AI CHAT THỰC TẾ

### Bước 1: Vào trang AI Chat
1. Mở app
2. Vào tab "Chat"
3. Bấm "Bắt đầu chat"

### Bước 2: Nhập triệu chứng và kiểm tra


| Triệu chứng nhập | Chuyên khoa kỳ vọng | Độ tin cậy | Kết quả |
|------------------|---------------------|------------|---------|
| đau đầu nhức đầu | Thần kinh | 90%+ | ⬜ |
| chóng mặt hoa mắt | Thần kinh | 90%+ | ⬜ |
| mất ngủ khó ngủ | Thần kinh | 85%+ | ⬜ |
| run tay run chân | Thần kinh | 90%+ | ⬜ |
| tê tay tê chân | Thần kinh | 90%+ | ⬜ |
| đau lưng nhức lưng | Cơ xương khớp | 90%+ | ⬜ |
| đau khớp gối | Cơ xương khớp | 90%+ | ⬜ |
| đau cổ vai gáy | Cơ xương khớp | 90%+ | ⬜ |
| viêm khớp sưng khớp | Cơ xương khớp | 90%+ | ⬜ |
| đau ngực tức ngực | Tim mạch | 90%+ | ⬜ |
| khó thở hụt hơi | Tim mạch/Hô hấp | 85%+ | ⬜ |
| tim đập nhanh | Tim mạch | 90%+ | ⬜ |
| huyết áp cao | Tim mạch | 95%+ | ⬜ |
| đau bụng đau dạ dày | Tiêu hóa | 90%+ | ⬜ |
| tiêu chảy đi ngoài | Tiêu hóa | 90%+ | ⬜ |
| buồn nôn nôn ói | Tiêu hóa | 90%+ | ⬜ |
| táo bón khó đi ngoài | Tiêu hóa | 90%+ | ⬜ |
| ho khan ho có đờm | Hô hấp | 90%+ | ⬜ |
| đau họng viêm họng | Hô hấp/TMH | 90%+ | ⬜ |
| nghẹt mũi sổ mũi | Hô hấp/TMH | 85%+ | ⬜ |
| nổi mẩn đỏ ngứa da | Da liễu | 90%+ | ⬜ |
| mụn trứng cá | Da liễu | 95%+ | ⬜ |
| dị ứng da | Da liễu | 90%+ | ⬜ |
| đau tai ù tai | Tai mũi họng | 90%+ | ⬜ |
| viêm amidan | Tai mũi họng | 95%+ | ⬜ |
| viêm xoang | Tai mũi họng | 95%+ | ⬜ |
| đau mắt mờ mắt | Mắt | 90%+ | ⬜ |
| mắt đỏ khô mắt | Mắt | 90%+ | ⬜ |
| con sốt cao và ho | Nhi khoa | 90%+ | ⬜ |
| bé biếng ăn quấy khóc | Nhi khoa | 85%+ | ⬜ |
| tiểu nhiều khát nước | Nội tiết | 90%+ | ⬜ |
| đường huyết cao | Nội tiết | 95%+ | ⬜ |
| đau răng sâu răng | Răng hàm mặt | 95%+ | ⬜ |
| sưng nướu chảy máu | Răng hàm mặt | 90%+ | ⬜ |
| đau bụng dưới trễ kinh | Sản phụ khoa | 90%+ | ⬜ |
| rối loạn kinh nguyệt | Sản phụ khoa | 90%+ | ⬜ |

### Bước 3: Ghi chú kết quả
- ✅ = Đúng chuyên khoa và độ tin cậy
- ⚠️ = Đúng chuyên khoa nhưng độ tin cậy thấp
- ❌ = Sai chuyên khoa

---

## 🔍 CÁCH 3: TEST BẰNG SCRIPT

### Chạy script test
```bash
node test-symptom-analysis.js
```

Script sẽ hiển thị danh sách test cases và hướng dẫn test.

---

## 📊 ĐÁNH GIÁ KẾT QUẢ

### Tiêu chí đánh giá:
- **Xuất sắc**: 95%+ test cases đúng
- **Tốt**: 90-94% test cases đúng
- **Trung bình**: 85-89% test cases đúng
- **Cần cải thiện**: <85% test cases đúng

### Các vấn đề thường gặp:

#### 1. Triệu chứng overlap
**Vấn đề:** "khó thở" xuất hiện ở cả Tim mạch và Hô hấp
**Giải pháp:** 
- Hiển thị cả 2 chuyên khoa
- Dùng follow-up questions để chính xác hóa

#### 2. Độ tin cậy thấp
**Vấn đề:** Chuyên khoa đúng nhưng độ tin cậy chỉ 60-70%
**Giải pháp:**
- Tăng weight của keyword quan trọng
- Thêm nhiều synonyms

#### 3. Sai chuyên khoa
**Vấn đề:** Gợi ý sai chuyên khoa hoàn toàn
**Giải pháp:**
- Kiểm tra lại keywords
- Thêm keywords mới
- Điều chỉnh weights

---

## 🔧 CÁCH ĐIỀU CHỈNH

### Nếu kết quả không chính xác:

#### Bước 1: Mở file `app/ai-chat.tsx`

#### Bước 2: Tìm chuyên khoa cần điều chỉnh
```javascript
'than_kinh': {
  name: 'Thần kinh',
  icon: '🧠',
  keywords: [
    // Danh sách keywords ở đây
  ]
}
```

#### Bước 3: Điều chỉnh weight
```javascript
// Tăng weight nếu muốn ưu tiên hơn
{ word: 'đau đầu', weight: 12, synonyms: [...] }

// Giảm weight nếu quá cao
{ word: 'mệt mỏi', weight: 6, synonyms: [...] }
```

#### Bước 4: Thêm synonyms
```javascript
{ 
  word: 'đau đầu', 
  weight: 10, 
  synonyms: [
    'nhức đầu', 
    'đầu đau', 
    'dau dau',
    'đau đầu dữ dội',
    'đau nửa đầu' // Thêm synonym mới
  ] 
}
```

#### Bước 5: Thêm keyword mới
```javascript
keywords: [
  // Existing keywords...
  { 
    word: 'đau đầu kèm buồn nôn', 
    weight: 10, 
    synonyms: ['đau đầu và nôn', 'nhức đầu buồn nôn'] 
  }
]
```

#### Bước 6: Test lại
Sau khi điều chỉnh, test lại tất cả các trường hợp để đảm bảo không ảnh hưởng đến các test khác.

---

## 📝 MẪU BÁO CÁO TEST

```markdown
# Báo cáo test hệ thống phân tích triệu chứng
Ngày test: [DATE]
Người test: [NAME]

## Tổng quan
- Tổng số test cases: 35
- Số test PASS: 32
- Số test FAIL: 3
- Tỷ lệ thành công: 91.4%

## Chi tiết test FAIL

### Test 1: "khó thở"
- Kỳ vọng: Hô hấp (90%+)
- Kết quả: Tim mạch (85%), Hô hấp (75%)
- Nguyên nhân: Triệu chứng overlap
- Giải pháp: Chấp nhận (hiển thị cả 2)

### Test 2: "đau bụng"
- Kỳ vọng: Tiêu hóa (90%+)
- Kết quả: Tiêu hóa (70%), Sản phụ khoa (65%)
- Nguyên nhân: Triệu chứng chung
- Giải pháp: Thêm context-aware scoring

### Test 3: "mệt mỏi"
- Kỳ vọng: Thần kinh (85%+)
- Kết quả: Thần kinh (60%), Tim mạch (55%), Nội tiết (50%)
- Nguyên nhân: Triệu chứng quá chung
- Giải pháp: Yêu cầu mô tả chi tiết hơn

## Khuyến nghị
1. Tăng weight cho keywords đặc trưng
2. Thêm context-aware scoring
3. Cải thiện xử lý triệu chứng chung
```

---

## ✅ CHECKLIST

- [ ] Đã test tất cả 35 test cases
- [ ] Ghi chú kết quả vào bảng
- [ ] Tính tỷ lệ thành công
- [ ] Xác định các test FAIL
- [ ] Phân tích nguyên nhân
- [ ] Điều chỉnh weights/synonyms
- [ ] Test lại sau khi điều chỉnh
- [ ] Viết báo cáo test
- [ ] Commit code sau khi hoàn thành

---

## 🎯 KẾT LUẬN

Hệ thống phân tích triệu chứng đã được thiết kế với:
- ✅ 360+ keywords
- ✅ 12 chuyên khoa
- ✅ Fuzzy matching
- ✅ Synonym matching
- ✅ Scoring thông minh

**Mục tiêu:** Đạt 90%+ accuracy trên tất cả test cases

**Lưu ý:** Một số triệu chứng overlap là bình thường, quan trọng là hiển thị đủ thông tin để user có thể lựa chọn.
