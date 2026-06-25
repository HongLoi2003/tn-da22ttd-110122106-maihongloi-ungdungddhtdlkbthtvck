Write-Host "=== BUILD APK PUBLIC (AI CÓ THỂ TẢI) ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra EAS CLI
Write-Host "[1/3] Kiểm tra EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if ($null -eq $easInstalled) {
    Write-Host "  ⚠️  Đang cài đặt EAS CLI..." -ForegroundColor Yellow
    npm install -g eas-cli
    Write-Host "  ✅ Đã cài đặt" -ForegroundColor Green
} else {
    Write-Host "  ✅ EAS CLI đã sẵn sàng" -ForegroundColor Green
}
Write-Host ""

# Kiểm tra đăng nhập
Write-Host "[2/3] Kiểm tra đăng nhập..." -ForegroundColor Yellow
$whoami = eas whoami 2>&1

if ($whoami -match "Not logged in") {
    Write-Host "  Đang đăng nhập..." -ForegroundColor Yellow
    eas login
    Write-Host "  ✅ Đã đăng nhập" -ForegroundColor Green
} else {
    Write-Host "  ✅ Đã đăng nhập" -ForegroundColor Green
}
Write-Host ""

# Build APK
Write-Host "[3/3] Build APK Public..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Build sẽ mất 10-20 phút..." -ForegroundColor Yellow
Write-Host "📱 Theo dõi tại: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds" -ForegroundColor Cyan
Write-Host ""

# Build với production profile (không có distribution: internal)
eas build --platform android --profile production --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== BUILD THÀNH CÔNG ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sau khi build xong (10-20 phút), chạy lệnh:" -ForegroundColor Yellow
    Write-Host "  powershell -File get-download-link.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "để lấy link download APK chia sẻ cho người dùng!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== BUILD THẤT BẠI ===" -ForegroundColor Red
    Write-Host "Kiểm tra lỗi ở trên" -ForegroundColor Yellow
}

Write-Host ""
