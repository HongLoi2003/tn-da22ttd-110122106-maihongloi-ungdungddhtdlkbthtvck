# 💻 Mã nguồn chương trình

Thư mục này chứa toàn bộ mã nguồn của ứng dụng Health Care.

## 📁 Cấu trúc

### `/app` - Source code chính
Chứa toàn bộ code React Native/Expo của ứng dụng bao gồm:
- Các màn hình (screens)
- Components
- Services (logic nghiệp vụ)
- Utilities
- Context (quản lý state)

### `/assets` - Tài nguyên
Chứa hình ảnh, icon, fonts và các tài nguyên tĩnh khác

### `/android` - Native Android code
Cấu hình và code native cho nền tảng Android

### `/functions` - Firebase Cloud Functions
Các hàm backend chạy trên Firebase

### `/google-apps-script` - Email Service
Scripts để gửi email qua Google Apps Script

### Cơ sở dữ liệu
Các file JSON chứa dữ liệu mẫu:
- `doctors.json` - Danh sách bác sĩ
- `medicines-database.json` - Cơ sở dữ liệu thuốc
- `symptoms-mapping.json` - Ánh xạ triệu chứng và chuyên khoa
- `specialties.json` - Danh sách chuyên khoa
- `appointments.json` - Dữ liệu lịch hẹn mẫu

### Video demo
File video demo chương trình sẽ được đặt tại thư mục gốc với tên:
- `video-demo-heatlecare.mp4`

### Docker files (nếu có)
Các file cấu hình Docker để deploy:
- `Dockerfile`
- `docker-compose.yml`

## 🚀 Cách chạy

Xem file `docs/hướng-dẫn-sử-dụng.md` để biết chi tiết cách cài đặt và chạy ứng dụng.
