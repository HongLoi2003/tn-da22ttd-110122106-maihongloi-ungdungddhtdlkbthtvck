# 🏥 Health Care - Ứng Dụng Chăm Sóc Sức Khỏe

## 📋 Giới Thiệu Đồ Án

Health Care là một ứng dụng di động toàn diện cho phép người dùng:
- Tư vấn sức khỏe trực tuyến với bác sĩ
- Đặt lịch khám bệnh nhanh chóng
- Chẩn đoán triệu chứng bằng AI (Google Gemini)
- Quản lý hồ sơ bệnh án điện tử
- Tra cứu thuốc và hiệu thuốc
- Chat realtime với bác sĩ
- Gọi thoại và video call
- Quản lý bảo hiểm y tế

Ứng dụng hỗ trợ 2 vai trò chính:
- **Bệnh nhân**: Tìm bác sĩ, đặt lịch khám, tư vấn AI, quản lý hồ sơ
- **Bác sĩ**: Quản lý lịch làm việc, danh sách bệnh nhân, cuộc hẹn, chat với bệnh nhân

## 🎯 Mục Tiêu Đồ Án

1. **Tiện lợi**: Kết nối bệnh nhân với bác sĩ một cách nhanh chóng, tiết kiệm thời gian
2. **Thông minh**: Sử dụng AI để phân tích triệu chứng và gợi ý chuyên khoa phù hợp
3. **Toàn diện**: Cung cấp đầy đủ tính năng từ đặt lịch, tư vấn đến quản lý hồ sơ
4. **Bảo mật**: Đảm bảo thông tin y tế được mã hóa và bảo vệ tuyệt đối
5. **Đa nền tảng**: Chạy trên cả Android, iOS và Web

## 🏗️ Kiến Trúc Hệ Thống

### Frontend
- **Framework**: React Native (Expo)
- **Routing**: Expo Router (File-based routing)
- **State Management**: React Context API
- **UI Components**: Custom components với React Native
- **Authentication**: Firebase Authentication + Google Sign-In

### Backend
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage (lưu trữ ảnh, file)
- **Authentication**: Firebase Auth
- **Cloud Functions**: Firebase Cloud Functions
- **Email Service**: Google Apps Script + EmailJS

### AI & Thông Minh Nhân Tạo
- **AI Engine**: Google Gemini API
- **Tính năng**: 
  - Phân tích triệu chứng bệnh
  - Gợi ý chuyên khoa phù hợp
  - Tư vấn sức khỏe ban đầu
  - Phân tích độ nghiêm trọng của triệu chứng

### Kiến Trúc Tổng Quan
```
┌─────────────────────────────────────────────┐
│           Mobile App (React Native)         │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │   Patient    │      │     Doctor      │ │
│  │   Interface  │      │    Interface    │ │
│  └──────────────┘      └─────────────────┘ │
└────────────┬────────────────────────────────┘
             │
             ├─────────────────┬──────────────┐
             │                 │              │
    ┌────────▼────────┐ ┌─────▼──────┐ ┌────▼────────┐
    │  Firebase Auth  │ │  Firestore │ │   Storage   │
    └─────────────────┘ └────────────┘ └─────────────┘
             │
    ┌────────▼─────────────────────────┐
    │  Google Gemini AI (Chẩn đoán)    │
    └──────────────────────────────────┘
```

## 🛠️ Công Nghệ Sử Dụng

### Core Technologies
- **React Native**: 0.81.5
- **Expo SDK**: ~54.0.35
- **TypeScript**: ~5.9.2
- **Firebase**: ^12.12.1

### Thư Viện Chính
- `expo-router`: Routing và navigation
- `@google/generative-ai`: Tích hợp Google Gemini AI
- `@react-native-google-signin/google-signin`: Đăng nhập Google
- `expo-image-picker`: Chọn và upload ảnh
- `expo-notifications`: Thông báo push
- `@react-native-async-storage/async-storage`: Lưu trữ local
- `react-native-reanimated`: Animation
- `nodemailer`: Gửi email

## 📦 Phần Mềm Cần Thiết

### 1. Môi Trường Phát Triển
- **Node.js**: >= 18.x (Khuyến nghị: 20.x LTS)
- **npm** hoặc **yarn**: Package manager
- **Git**: Version control

### 2. Công Cụ Expo
```bash
npm install -g expo-cli
npm install -g eas-cli
```

### 3. Android Development (Cho build Android)
- **Android Studio**: Phiên bản mới nhất
- **Java JDK**: 17 hoặc 21
- **Android SDK**: API Level 34+
- **Gradle**: 8.x+

### 4. iOS Development (Cho build iOS - chỉ trên macOS)
- **Xcode**: Phiên bản mới nhất
- **CocoaPods**: `sudo gem install cocoapods`
- **iOS Simulator**: Đi kèm với Xcode

### 5. Firebase CLI (Tùy chọn)
```bash
npm install -g firebase-tools
```

### 6. Editors & Tools
- **VS Code**: Khuyến nghị
- **Expo Go App**: Cài trên điện thoại để test

## ⚙️ Cài Đặt và Cấu Hình

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd heatlecare
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình Firebase
1. Tạo project trên [Firebase Console](https://console.firebase.google.com/)
2. Bật Authentication (Email/Password + Google)
3. Tạo Firestore Database
4. Bật Firebase Storage
5. Tải file `google-services.json` (Android) và đặt vào thư mục gốc
6. Cập nhật file `.env.local`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Bước 4: Cấu Hình Google Gemini AI
1. Lấy API key từ [Google AI Studio](https://makersuite.google.com/)
2. Thêm vào `.env.local`:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Bước 5: Cấu Hình Google Sign-In
1. Lấy OAuth 2.0 Client ID từ Google Cloud Console
2. Cập nhật trong `app.json` và setup theo hướng dẫn trong file `fix-google-signin.md`

### Bước 6: Deploy Firestore Rules
```bash
# Windows
./deploy-firestore-rules.ps1

# macOS/Linux
./deploy-firestore-rules.sh
```

### Bước 7: Cấu Hình Email Service (Tùy chọn)
Xem hướng dẫn chi tiết trong `google-apps-script/README.md`

## 🚀 Chạy Ứng Dụng

### Development Mode

#### 1. Chạy trên Expo Go (Nhanh nhất)
```bash
npm start
# hoặc
npx expo start
```
- Quét QR code bằng Expo Go app trên điện thoại
- Hoặc nhấn `a` để mở Android Emulator
- Hoặc nhấn `i` để mở iOS Simulator

#### 2. Chạy trên Android Emulator
```bash
npm run android
# hoặc
npx expo run:android
```

#### 3. Chạy trên iOS Simulator (macOS)
```bash
npm run ios
# hoặc
npx expo run:ios
```

#### 4. Chạy trên Web
```bash
npm run web
```

### Production Build

#### Build Android APK (Development)
```bash
# Windows
./build-apk.ps1

# macOS/Linux
./build-apk.sh
```

#### Build với EAS (Production)
```bash
# Đăng nhập EAS
eas login

# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production

# Build cả hai
eas build --platform all
```

#### Kiểm Tra Trước Khi Build
```bash
# Windows
./pre-build-check.ps1

# macOS/Linux
./pre-build-check.sh
```

## 📱 Cấu Trúc Thư Mục

```
heatlecare/
├── app/                          # Source code chính
│   ├── (tabs)/                   # Tab navigation cho bệnh nhân
│   │   ├── index.tsx             # Trang chủ
│   │   ├── chat.tsx              # Chat với bác sĩ
│   │   ├── appointments.tsx      # Lịch hẹn
│   │   ├── booking.tsx           # Đặt lịch
│   │   └── profile.tsx           # Hồ sơ
│   ├── doctor/                   # Interface cho bác sĩ
│   │   ├── dashboard.tsx         # Dashboard bác sĩ
│   │   ├── appointments.tsx      # Quản lý cuộc hẹn
│   │   ├── patients.tsx          # Danh sách bệnh nhân
│   │   ├── chats.tsx             # Chat với bệnh nhân
│   │   └── profile.tsx           # Hồ sơ bác sĩ
│   ├── services/                 # Business logic services
│   │   ├── geminiService.ts      # AI chẩn đoán
│   │   ├── symptomAnalysisService.ts
│   │   ├── emailService.ts       # Email service
│   │   └── doctorService.ts      # Doctor management
│   ├── components/               # Reusable components
│   ├── config/                   # Configuration files
│   │   ├── firebase.ts           # Firebase config
│   │   └── apiConfig.ts          # API endpoints
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx       # Authentication context
│   ├── utils/                    # Helper functions
│   ├── login.tsx                 # Đăng nhập
│   ├── register.tsx              # Đăng ký
│   └── _layout.tsx               # Root layout
├── assets/                       # Tài nguyên tĩnh (ảnh, fonts)
├── android/                      # Android native code
├── functions/                    # Firebase Cloud Functions
├── google-apps-script/           # Email service scripts
├── scripts/                      # Build & deployment scripts
├── *.json                        # Data files (doctors, medicines, etc.)
├── firestore.rules               # Firestore security rules
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── eas.json                      # EAS Build configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔑 Tính Năng Chính

### Dành Cho Bệnh Nhân
- ✅ Đăng ký/Đăng nhập (Email/Google)
- ✅ Chẩn đoán triệu chứng bằng AI
- ✅ Tìm kiếm bác sĩ theo chuyên khoa
- ✅ Đặt lịch khám bệnh
- ✅ Chat realtime với bác sĩ
- ✅ Gọi thoại/video với bác sĩ
- ✅ Xem lịch sử khám bệnh
- ✅ Quản lý hồ sơ bệnh án
- ✅ Tra cứu thuốc
- ✅ Quản lý bảo hiểm y tế
- ✅ Đọc bài viết sức khỏe
- ✅ Thông báo push

### Dành Cho Bác Sĩ
- ✅ Đăng nhập với tài khoản bác sĩ
- ✅ Dashboard quản lý tổng quan
- ✅ Quản lý lịch làm việc
- ✅ Xem danh sách bệnh nhân
- ✅ Quản lý cuộc hẹn
- ✅ Chat với bệnh nhân
- ✅ Xem hồ sơ bệnh nhân chi tiết
- ✅ Cập nhật thông tin cá nhân
- ✅ Xem đánh giá từ bệnh nhân

## 🔐 Bảo Mật

- Mã hóa dữ liệu với Firebase Security Rules
- Authentication với Firebase Auth
- Phân quyền rõ ràng (Patient/Doctor)
- Bảo vệ thông tin y tế cá nhân
- HTTPS cho tất cả API calls
- Xác thực token cho mỗi request

## 📊 Database Schema

### Collections Chính
- `users`: Thông tin người dùng (bệnh nhân)
- `doctors`: Thông tin bác sĩ
- `appointments`: Lịch hẹn khám
- `conversations`: Cuộc hội thoại
- `messages`: Tin nhắn chat
- `medicalRecords`: Hồ sơ bệnh án
- `medicines`: Danh sách thuốc
- `specialties`: Chuyên khoa
- `symptoms`: Triệu chứng và ánh xạ

## 🧪 Testing

```bash
# Chạy tests
npm test

# Test kết nối Firebase
node test-firebase.js

# Test email service
node test-emailjs.tsx

# Test symptom analysis
node test-symptom-analysis.js
```

## 📝 Scripts Hữu Ích

```bash
# Import dữ liệu mẫu
node import-all-data.js

# Tạo tài khoản bác sĩ
node create-doctor-accounts-batch.js

# Clear cache
./clear-cache.ps1

# Deploy Firestore rules
./deploy-firestore-rules.ps1

# Build APK nhanh
./build-android-now.ps1
```

## 🤝 Đóng Góp

Nếu bạn muốn đóng góp vào dự án:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## 👨‍💻 Tác Giả

**Mai Hồng Lợi**
- Email: maihongloi23@gmail.com
- GitHub: @maihongloi23

## 🙏 Cảm Ơn

- Firebase - Backend infrastructure
- Google Gemini AI - AI diagnostic engine
- Expo - Cross-platform framework
- React Native community

---

**Lưu ý**: Đây là dự án đồ án, không phải ứng dụng y tế chuyên nghiệp. Luôn tham khảo ý kiến bác sĩ thực tế cho các vấn đề sức khỏe.
