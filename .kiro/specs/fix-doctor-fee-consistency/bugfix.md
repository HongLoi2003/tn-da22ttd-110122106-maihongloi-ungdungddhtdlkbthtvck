# Bugfix Requirements Document

## Introduction

Sửa lỗi không nhất quán về số tiền phí khám bác sĩ hiển thị giữa các màn hình trong ứng dụng. Khi người dùng xem danh sách bác sĩ gợi ý, chọn bác sĩ và tiến hành đặt lịch, số tiền phí khám có thể hiển thị khác nhau giữa màn hình "Bác sĩ gợi ý" (recommended-doctors.tsx) và các màn hình đặt lịch (booking.tsx, booking-patient-info.tsx, booking-confirmation.tsx).

Nguồn gốc của dữ liệu là trường `gia_kham` trong file doctors.json, được quản lý bởi doctorListService.ts. Bug này ảnh hưởng đến trải nghiệm người dùng và có thể gây nhầm lẫn về chi phí dịch vụ.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN người dùng xem bác sĩ ở màn hình "Bác sĩ gợi ý" (recommended-doctors.tsx) THEN hệ thống hiển thị giá từ `item.price` (được map trực tiếp từ `doc.gia_kham`)

1.2 WHEN người dùng chọn bác sĩ và chuyển sang màn hình đặt lịch (booking.tsx) THEN hệ thống hiển thị giá từ `doctor.gia_kham` nhưng truyền qua params dưới dạng `selectedDoctorData.gia_kham.toString()`

1.3 WHEN người dùng xem màn hình xác nhận thông tin bệnh nhân (booking-patient-info.tsx) THEN hệ thống nhận `doctorFee` từ params dưới dạng string và truyền tiếp không thay đổi

1.4 WHEN người dùng xem màn hình xác nhận đặt lịch (booking-confirmation.tsx) THEN hệ thống hiển thị giá từ `parseInt(doctorFee || '0').toLocaleString('vi-VN')` và lưu vào Firebase với `fee: parseInt(doctorFee) || 0`

1.5 WHEN có sự chuyển đổi kiểu dữ liệu không nhất quán (number → string → number) hoặc format hiển thị khác nhau THEN số tiền có thể hiển thị không khớp giữa các màn hình

### Expected Behavior (Correct)

2.1 WHEN người dùng xem bác sĩ ở màn hình "Bác sĩ gợi ý" THEN hệ thống SHALL hiển thị số tiền chính xác từ `gia_kham` trong doctors.json với format nhất quán

2.2 WHEN người dùng chọn bác sĩ và chuyển sang màn hình đặt lịch THEN hệ thống SHALL truyền số tiền qua params với kiểu dữ liệu và giá trị nhất quán (không bị mất dữ liệu qua chuyển đổi)

2.3 WHEN người dùng xem màn hình xác nhận thông tin bệnh nhân THEN hệ thống SHALL nhận và truyền tiếp số tiền chính xác không thay đổi

2.4 WHEN người dùng xem màn hình xác nhận đặt lịch THEN hệ thống SHALL hiển thị số tiền chính xác với format `toLocaleString('vi-VN')` và lưu vào Firebase với giá trị đúng

2.5 WHEN người dùng xem số tiền trên tất cả các màn hình THEN số tiền SHALL giống nhau và khớp với giá trị `gia_kham` từ doctors.json

### Unchanged Behavior (Regression Prevention)

3.1 WHEN người dùng xem danh sách bác sĩ không có giá khám (gia_kham = 0 hoặc null) THEN hệ thống SHALL CONTINUE TO hiển thị "---đ" hoặc "0đ" theo logic hiện tại

3.2 WHEN người dùng đặt lịch thành công THEN hệ thống SHALL CONTINUE TO lưu appointment vào Firebase với tất cả thông tin khác không thay đổi (doctorId, specialty, date, time, patientInfo, etc.)

3.3 WHEN người dùng điều hướng giữa các màn hình THEN hệ thống SHALL CONTINUE TO truyền tất cả params khác (doctor name, specialty, date, time, patient info) chính xác như hiện tại

3.4 WHEN format hiển thị số tiền được thay đổi THEN các chức năng khác của ứng dụng (search, filter, navigation, notifications) SHALL CONTINUE TO hoạt động bình thường
