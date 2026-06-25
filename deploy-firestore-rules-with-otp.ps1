# Deploy Firestore Rules with OTP support
# Chạy: .\deploy-firestore-rules-with-otp.ps1

Write-Host "🔥 Deploying Firestore Rules with Password Reset OTP support..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra firebase CLI
Write-Host "📋 Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI chưa được cài đặt!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui lòng cài đặt Firebase CLI:" -ForegroundColor Yellow
    Write-Host "npm install -g firebase-tools" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
Write-Host ""

# Kiểm tra đã login chưa
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Yellow
$loginCheck = firebase projects:list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chưa đăng nhập Firebase!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Đang mở trình duyệt để đăng nhập..." -ForegroundColor Yellow
    firebase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Đăng nhập thất bại!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Đã đăng nhập Firebase" -ForegroundColor Green
Write-Host ""

# Kiểm tra file firestore.rules
Write-Host "📄 Checking firestore.rules file..." -ForegroundColor Yellow

if (-not (Test-Path "firestore.rules")) {
    Write-Host "❌ Không tìm thấy file firestore.rules!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ File firestore.rules tồn tại" -ForegroundColor Green
Write-Host ""

# Hiển thị rules cho password_reset_otps
Write-Host "📋 Password Reset OTP Rules:" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Gray
Write-Host "match /password_reset_otps/{otpId} {" -ForegroundColor White
Write-Host "  allow create: if true;" -ForegroundColor Green
Write-Host "  allow read: if true;" -ForegroundColor Green
Write-Host "  allow update: if true;" -ForegroundColor Green
Write-Host "  allow delete: if true;" -ForegroundColor Green
Write-Host "}" -ForegroundColor White
Write-Host "-----------------------------------" -ForegroundColor Gray
Write-Host ""

# Xác nhận deploy
Write-Host "⚠️  Bạn có chắc muốn deploy Firestore Rules?" -ForegroundColor Yellow
Write-Host "Nhấn Enter để tiếp tục, hoặc Ctrl+C để hủy..." -ForegroundColor Gray
Read-Host

# Deploy rules
Write-Host ""
Write-Host "🚀 Deploying Firestore Rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Các quyền đã được cấp:" -ForegroundColor Cyan
    Write-Host "  ✅ password_reset_otps: Tạo/Đọc/Cập nhật/Xóa (không cần auth)" -ForegroundColor Green
    Write-Host "  ✅ users: Update password field" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Chức năng Quên Mật Khẩu đã sẵn sàng!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Kiểm tra rules tại:" -ForegroundColor Yellow
    Write-Host "https://console.firebase.google.com/project/hearthcare-847b3/firestore/rules" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deploy thất bại!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Kiểm tra syntax trong firestore.rules" -ForegroundColor Gray
    Write-Host "2. Đảm bảo đã đăng nhập đúng project" -ForegroundColor Gray
    Write-Host "3. Kiểm tra quyền trên Firebase Console" -ForegroundColor Gray
    exit 1
}
