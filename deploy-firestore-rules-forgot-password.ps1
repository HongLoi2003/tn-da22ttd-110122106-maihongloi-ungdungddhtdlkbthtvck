# Deploy Firestore Rules with Forgot Password Support
# Cho phép user update password khi forgot password (chưa đăng nhập)

Write-Host "🔥 Deploying Firestore Rules for Forgot Password..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Firebase CLI
$firebaseCommand = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCommand) {
    Write-Host "❌ Firebase CLI chưa được cài đặt!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cài đặt Firebase CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g firebase-tools" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Firebase CLI đã cài đặt" -ForegroundColor Green
Write-Host ""

# Kiểm tra đã login chưa
Write-Host "🔍 Kiểm tra Firebase login status..." -ForegroundColor Cyan
$loginStatus = firebase login:list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chưa đăng nhập Firebase!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Đăng nhập Firebase:" -ForegroundColor Yellow
    Write-Host "  firebase login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Đã đăng nhập Firebase" -ForegroundColor Green
Write-Host ""

# Deploy Firestore rules
Write-Host "📤 Deploying Firestore rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Firestore rules deployed thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Các thay đổi đã deploy:" -ForegroundColor Yellow
    Write-Host "  ✓ Cho phép user update password khi forgot password (chưa đăng nhập)" -ForegroundColor White
    Write-Host "  ✓ Bảo mật: Chỉ cho update password và updatedAt fields" -ForegroundColor White
    Write-Host "  ✓ Kiểm tra email khớp trước khi update" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Test ngay:" -ForegroundColor Cyan
    Write-Host "  1. Mở app → Quên mật khẩu" -ForegroundColor White
    Write-Host "  2. Nhập email → Nhận OTP" -ForegroundColor White
    Write-Host "  3. Nhập OTP → Đổi mật khẩu" -ForegroundColor White
    Write-Host "  4. Đăng nhập với password mới" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deploy thất bại!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kiểm tra lỗi ở trên và thử lại" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
