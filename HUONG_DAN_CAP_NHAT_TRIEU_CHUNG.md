# Hướng dẫn cập nhật triệu chứng mới

## Tổng quan
Đã tạo các file để thêm **TẤT CẢ** triệu chứng mới vào hệ thống phân tích triệu chứng.

## Các file đã tạo

1. **specialties-data.js** - Chứa: Thần kinh, Cơ xương khớp
2. **specialties-data-part2.js** - Chứa: Tim mạch, Tiêu hóa, Hô hấp, Da liễu, Tai mũi họng
3. **specialties-data-part3.js** - Chứa: Mắt, Nhi khoa
4. **specialties-data-part4.js** - Chứa: Nội tiết, Răng hàm mặt
5. **specialties-data-part5.js** - Chứa: Sản phụ khoa
6. **update-symptoms-complete.js** - Script cập nhật chính

## Triệu chứng đã thêm

### ✅ ĐÃ HOÀN THÀNH TẤT CẢ 12 CHUYÊN KHOA:

- **Thần kinh** (30 triệu chứng)
- **Cơ xương khớp** (30 triệu chứng)
- **Tim mạch** (30 triệu chứng)
- **Tiêu hóa** (30 triệu chứng)
- **Hô hấp** (30 triệu chứng)
- **Da liễu** (30 triệu chứng)
- **Tai mũi họng** (30 triệu chứng)
- **Mắt** (30 triệu chứng)
- **Nhi khoa** (30 triệu chứng)
- **Nội tiết** (30 triệu chứng)
- **Răng hàm mặt** (30 triệu chứng)
- **Sản phụ khoa** (30 triệu chứng)

**TỔNG CỘNG: 360 TRIỆU CHỨNG - 12 CHUYÊN KHOA**

## Cách chạy

```bash
# Cài đặt Node.js nếu chưa có
# Sau đó chạy:
node update-symptoms-complete.js
```

## Kết quả

Script sẽ:
1. Đọc dữ liệu từ `specialties-data.js` và `specialties-data-part2.js`
2. Tạo ID tự động cho mỗi triệu chứng
3. Tạo mapping giữa triệu chứng và chuyên khoa
4. Ghi vào file `symptoms-mapping.json`

## Lưu ý

- Mỗi triệu chứng có **weight** (độ quan trọng) từ 7-10
- Mỗi triệu chứng có **synonyms** (từ đồng nghĩa) để tăng khả năng tìm kiếm
- Tất cả keywords đã được chuẩn hóa để hỗ trợ tìm kiếm không dấu

## Tổng số triệu chứng

- **ĐÃ HOÀN THÀNH**: 360 triệu chứng (12 chuyên khoa)
- Mỗi chuyên khoa có 30 triệu chứng với keywords và synonyms đầy đủ

## Bước tiếp theo

Sau khi chạy script, hệ thống phân tích triệu chứng sẽ:
- Tự động nhận diện triệu chứng từ text người dùng nhập
- Gợi ý chuyên khoa phù hợp với độ tin cậy (confidence %)
- Hiển thị danh sách bác sĩ chuyên khoa tương ứng

## Cách chạy script

```bash
node update-symptoms-complete.js
```

Script sẽ tự động:
1. Đọc dữ liệu từ 5 file part (part1 đến part5)
2. Tạo ID cho từng triệu chứng (từ 1 đến 360)
3. Tạo mapping giữa triệu chứng và chuyên khoa
4. Ghi vào file `symptoms-mapping.json`

## Kết quả mong đợi

Sau khi chạy script thành công, bạn sẽ thấy:
```
✅ HOÀN TẤT!
📊 Tổng: 360 triệu chứng
📊 Tổng: 12 chuyên khoa
💾 Đã lưu: symptoms-mapping.json
```
