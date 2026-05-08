# Cleanup & Restart Guide

## Problem
Appointments cũ thuộc user khác, nên không hiển thị cho user hiện tại.

## Solution
Xóa tất cả appointments cũ và đặt lịch mới.

## 🎯 Các bước thực hiện:

### Step 1: Xóa Tất cả Appointments Cũ
1. **Mở trang chủ**
2. **Cuộn xuống dưới cùng**
3. **Bấm nút đỏ "🗑️ Xóa Tất cả Appointments"**
4. **Xác nhận xóa** (không thể hoàn tác!)
5. **Chờ xóa hoàn tất**

### Step 2: Đăng Xuất & Đăng Nhập Lại
1. **Mở trang Profile**
2. **Bấm "Đăng xuất"**
3. **Đăng nhập lại** với tài khoản hiện tại
4. **Verify User UID** bằng trang debug

### Step 3: Đặt Lịch Khám Mới
1. **Mở trang "Đặt lịch khám"**
2. **Hoàn thành tất cả 4 bước**
3. **Bấm "Xem lịch khám"**
4. **Appointments sẽ hiển thị đúng**

### Step 4: Verify Dữ Liệu
1. **Mở trang chủ**
2. **Bấm "🔴 Debug Firebase (Tất cả)"**
3. **Verify User IDs khớp với user hiện tại**
4. **Verify appointments hiển thị đúng**

## 📋 Checklist

- [ ] Xóa tất cả appointments cũ
- [ ] Đăng xuất
- [ ] Đăng nhập lại
- [ ] Đặt lịch khám mới
- [ ] Verify appointments hiển thị
- [ ] Verify User UID khớp

## ⚠️ Lưu ý

- **Xóa không thể hoàn tác!** Hãy chắc chắn trước khi xóa
- **Chỉ xóa nếu appointments thuộc user khác**
- **Sau khi xóa, cần đặt lịch mới**

## 🔍 Cách Verify

### Trước khi xóa:
1. Bấm "🔴 Debug Firebase (Tất cả)"
2. Xem "👤 User IDs trong Appointments"
3. So sánh với User UID ở trang "🐛 Kiểm tra dữ liệu Appointments"
4. Nếu không khớp → xóa

### Sau khi xóa:
1. Bấm "🔴 Debug Firebase (Tất cả)"
2. Verify "Không có appointments nào"
3. Đặt lịch khám mới
4. Verify appointments hiển thị

## 📝 Trang Debug

### 🐛 Kiểm tra dữ liệu Appointments
- Xem appointments của user hiện tại
- Xem User UID
- Xem chi tiết từng appointment

### 🔴 Debug Firebase (Tất cả)
- Xem tất cả appointments trong Firebase
- Xem User IDs của appointments
- Xem chi tiết từng appointment

### 🗑️ Xóa Tất cả Appointments
- Xóa tất cả appointments từ Firebase
- Không thể hoàn tác!
- Cần xác nhận trước khi xóa

## 🎯 Expected Result

**Sau khi hoàn thành:**
- ✅ Appointments cũ được xóa
- ✅ User UID khớp với appointments mới
- ✅ Appointments hiển thị ở trang "Lịch khám"
- ✅ Appointments hiển thị ở trang chủ

## 🆘 Nếu Vẫn Có Vấn Đề

1. **Verify User UID khớp**
   - Bấm "🐛 Kiểm tra dữ liệu Appointments"
   - Xem User UID
   - Bấm "🔴 Debug Firebase (Tất cả)"
   - So sánh User IDs

2. **Verify Appointments Format**
   - Bấm "🔴 Debug Firebase (Tất cả)"
   - Xem `appointmentDate` (phải ISO format)
   - Xem `status` (phải "confirmed")

3. **Verify Appointments Page Filter**
   - Bấm "🐛 Kiểm tra dữ liệu Appointments"
   - Xem Date Analysis
   - Verify "Is Valid: ✅ Yes"
   - Verify "Is Future: ✅ Yes"

## 📞 Support

Nếu vẫn có vấn đề:
1. Screenshot trang debug
2. Copy console logs
3. Liên hệ support với thông tin trên
