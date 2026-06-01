# Hướng Dẫn Tìm Kiếm Triệu Chứng Cải Tiến

## 📋 Tổng Quan

Hệ thống tìm kiếm triệu chứng đã được cải tiến với 2 tính năng mới:

1. **Keywords (Từ khóa)**: Mỗi triệu chứng có danh sách từ khóa để tìm kiếm gần đúng tốt hơn
2. **SpecialtyIds**: Mỗi triệu chứng có danh sách ID chuyên khoa liên quan trực tiếp

## 📊 Thống Kê Dữ Liệu

- **Tổng số triệu chứng**: 138
- **Tổng số chuyên khoa**: 12
- **Triệu chứng có keywords**: 138/138 (100%)
- **Triệu chứng có specialtyIds**: 138/138 (100%)
- **Triệu chứng thuộc nhiều chuyên khoa**: 17

## 🏥 Danh Sách Chuyên Khoa

| ID | Tên Chuyên Khoa | Số Triệu Chứng |
|----|----------------|----------------|
| 1  | Tim mạch | 13 |
| 2  | Tiêu hóa | 17 |
| 4  | Thần kinh | 13 |
| 5  | Cơ xương khớp | 11 |
| 6  | Da liễu | 17 |
| 7  | Tai mũi họng | 14 |
| 8  | Mắt | 15 |
| 9  | Răng hàm mặt | 10 |
| 10 | Nội tiết | 13 |
| 11 | Hô hấp | 17 |
| 12 | Nhi khoa | 9 |
| 13 | Sản phụ khoa | 7 |

## 🔍 Cấu Trúc Dữ Liệu Mới

### Trước Đây
```json
{
  "id": 1,
  "name": "đau đầu",
  "icon": "🤕"
}
```

### Bây Giờ
```json
{
  "id": 1,
  "name": "đau đầu",
  "icon": "🤕",
  "keywords": [
    "dau dau",
    "nhuc dau",
    "dau nua dau",
    "dau dau rat"
  ],
  "specialtyIds": [4]
}
```

## ✨ Lợi Ích Của Keywords

### 1. Tìm Kiếm Gần Đúng Tốt Hơn

**Ví dụ**: Người dùng nhập "dau dau"
- **Trước**: Chỉ khớp nếu nhập chính xác "đau đầu"
- **Bây giờ**: Khớp với cả "dau dau", "nhuc dau", "dau nua dau"

### 2. Hỗ Trợ Nhiều Cách Diễn Đạt

**Ví dụ**: Triệu chứng "ho"
```json
{
  "name": "ho",
  "keywords": ["ho", "ho khan", "ho co dom", "ho lau ngay"]
}
```

Người dùng có thể nhập:
- "ho khan" → Tìm thấy "ho"
- "ho co dom" → Tìm thấy "ho"
- "ho lau ngay" → Tìm thấy "ho"

### 3. Không Cần Dấu Tiếng Việt

Keywords đã được chuẩn hóa không dấu, giúp:
- Tìm kiếm nhanh hơn
- Không cần gõ dấu chính xác
- Hỗ trợ nhiều bàn phím khác nhau

## 🎯 Lợi Ích Của SpecialtyIds

### 1. Tra Cứu Nhanh

**Trước**: Phải duyệt qua tất cả mappings để tìm chuyên khoa
```typescript
// Phải duyệt qua 12 mappings
mappings.forEach(mapping => {
  if (mapping.symptomIds.includes(symptomId)) {
    // Tìm thấy chuyên khoa
  }
});
```

**Bây giờ**: Truy cập trực tiếp
```typescript
// Truy cập trực tiếp
const specialtyIds = symptom.specialtyIds; // [4]
```

### 2. Hiển Thị Thông Tin Ngay

Có thể hiển thị ngay chuyên khoa liên quan khi người dùng chọn triệu chứng:

```typescript
// Ví dụ: Người dùng chọn "đau đầu"
const symptom = symptoms.find(s => s.id === 1);
console.log(`Triệu chứng: ${symptom.name}`);
console.log(`Chuyên khoa liên quan: ${symptom.specialtyIds}`); // [4] = Thần kinh
```

### 3. Phát Hiện Triệu Chứng Đa Chuyên Khoa

Một số triệu chứng thuộc nhiều chuyên khoa:

```json
{
  "name": "sốt",
  "specialtyIds": [11, 10, 12]
}
```

Có nghĩa là "sốt" có thể liên quan đến:
- Chuyên khoa Hô hấp (ID: 11)
- Chuyên khoa Nội tiết (ID: 10)
- Chuyên khoa Nhi khoa (ID: 12)

## 🔧 Cách Sử Dụng Trong Code

### 1. Tìm Kiếm Với Keywords

```typescript
import symptomAnalysisService from '@/app/services/symptomAnalysisService';

// Tìm kiếm triệu chứng
const results = symptomAnalysisService.searchSymptoms('dau dau');
// Kết quả: [{ id: 1, name: "đau đầu", ... }]
```

### 2. Lấy Chuyên Khoa Từ Triệu Chứng

```typescript
const symptom = symptomAnalysisService.getSymptomById(1);
console.log(symptom.specialtyIds); // [4]

// Lấy tên chuyên khoa
const specialtyNames = symptom.specialtyIds.map(id => {
  const mapping = mappings.find(m => m.specialtyId === id);
  return mapping?.specialtyName;
});
console.log(specialtyNames); // ["Thần kinh"]
```

### 3. Phân Tích Triệu Chứng

```typescript
const recommendations = symptomAnalysisService.analyzeSymptoms([
  'dau dau',
  'chong mat',
  'buon non'
]);

// Kết quả:
// [
//   { specialtyId: 4, specialtyName: "Thần kinh", confidence: 95, ... }
// ]
```

## 📈 So Sánh Hiệu Suất

### Tìm Kiếm

| Phương Pháp | Trước | Bây Giờ |
|-------------|-------|---------|
| Khớp chính xác | ✅ | ✅ |
| Khớp gần đúng | ⚠️ Hạn chế | ✅ Tốt |
| Không dấu | ⚠️ Phải chuẩn hóa | ✅ Sẵn có |
| Nhiều cách diễn đạt | ❌ | ✅ |

### Tra Cứu Chuyên Khoa

| Thao Tác | Trước | Bây Giờ |
|----------|-------|---------|
| Tìm chuyên khoa từ triệu chứng | O(n) | O(1) |
| Hiển thị chuyên khoa liên quan | Phải duyệt mappings | Truy cập trực tiếp |

## 🧪 Test

Chạy test để kiểm tra:

```bash
node test-improved-symptom-search.js
```

Kết quả mong đợi:
- ✅ 138 triệu chứng có keywords
- ✅ 138 triệu chứng có specialtyIds
- ✅ Tìm kiếm hoạt động với keywords
- ✅ Tra cứu chuyên khoa nhanh chóng

## 📝 Ví Dụ Triệu Chứng Đa Chuyên Khoa

| Triệu Chứng | Chuyên Khoa Liên Quan |
|-------------|----------------------|
| sốt | Hô hấp, Nội tiết, Nhi khoa |
| ho | Hô hấp, Nhi khoa |
| mệt mỏi | Tim mạch, Nội tiết |
| đau họng | Hô hấp, Tai mũi họng |
| chảy máu chân răng | Tai mũi họng, Răng hàm mặt |

## 🚀 Cải Tiến Trong Tương Lai

1. **Machine Learning**: Sử dụng ML để cải thiện độ chính xác
2. **Thêm Keywords**: Bổ sung thêm từ khóa dựa trên dữ liệu người dùng
3. **Phân Tích Ngữ Cảnh**: Hiểu ngữ cảnh để đề xuất chính xác hơn
4. **Đa Ngôn Ngữ**: Hỗ trợ tiếng Anh và các ngôn ngữ khác

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng:
1. Kiểm tra file `symptoms-mapping.json`
2. Chạy test: `node test-improved-symptom-search.js`
3. Xem log trong `symptomAnalysisService.ts`
