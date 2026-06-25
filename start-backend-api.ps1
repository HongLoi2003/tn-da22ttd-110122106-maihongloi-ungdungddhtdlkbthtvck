# Start Backend API for Password Reset
# Chạy script này để khởi động backend API

Write-Host "🚀 Khởi động Backend API..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "email-api/node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    cd email-api
    npm install
    cd ..
}

# Check if serviceAccountKey.json exists
if (-not (Test-Path "serviceAccountKey.json")) {
    Write-Host "❌ Lỗi: serviceAccountKey.json không tồn tại!" -ForegroundColor Red
    Write-Host "Vui lòng tải file này từ Firebase Console:" -ForegroundColor Yellow
    Write-Host "  1. Vào: https://console.firebase.google.com" -ForegroundColor Yellow
    Write-Host "  2. Project Settings → Service Accounts" -ForegroundColor Yellow
    Write-Host "  3. Generate New Private Key" -ForegroundColor Yellow
    Write-Host "  4. Lưu file vào root project với tên: serviceAccountKey.json" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Tất cả dependencies đã sẵn sàng" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Backend API sẽ chạy tại: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📧 Endpoint: /reset-password-with-otp" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

# Start server
cd email-api
npm start
