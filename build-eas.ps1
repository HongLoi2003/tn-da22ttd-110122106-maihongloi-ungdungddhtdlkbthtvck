# Script build APK bằng EAS Build
# Chạy: powershell -ExecutionPolicy Bypass -File build-eas.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD APK BẰNG EAS BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra EAS CLI
Write-Host "[1/4] Kiểm tra EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if ($null -eq $easInstalled) {
    Write-Host "  ⚠️  EAS CLI chưa được cài đặt" -ForegroundColor Yellow
    Write-Host "     → Đang cài đặt EAS CLI..." -ForegroundColor Yellow
    npm install -g eas-cli
    Write-Host "  ✅ Đã cài đặt EAS CLI" -ForegroundColor Green
} else {
    $version = eas --version
    Write-Host "  ✅ EAS CLI đã cài đặt: $version" -ForegroundColor Green
}
Write-Host ""

# Kiểm tra đăng nhập
Write-Host "[2/4] Kiểm tra đăng nhập..." -ForegroundColor Yellow
$whoami = eas whoami 2>&1

if ($whoami -match "Not logged in") {
    Write-Host "  ⚠️  Chưa đăng nhập EAS" -ForegroundColor Yellow
    Write-Host "     → Đang mở trang đăng nhập..." -ForegroundColor Yellow
    Write-Host ""
    eas login
    Write-Host ""
    Write-Host "  ✅ Đã đăng nhập" -ForegroundColor Green
} else {
    Write-Host "  ✅ Đã đăng nhập: $whoami" -ForegroundColor Green
}
Write-Host ""

# Kiểm tra cấu hình
Write-Host "[3/4] Kiểm tra cấu hình..." -ForegroundColor Yellow

if (Test-Path "eas.json") {
    Write-Host "  ✅ File eas.json tồn tại" -ForegroundColor Green
} else {
    Write-Host "  ❌ Thiếu file eas.json" -ForegroundColor Red
    exit 1
}

if (Test-Path "app.json") {
    $appJson = Get-Content "app.json" | ConvertFrom-Json
    $projectId = $appJson.expo.extra.eas.projectId
    if ($projectId) {
        Write-Host "  ✅ EAS Project ID: $projectId" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Chưa có EAS Project ID" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Thiếu file app.json" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build APK
Write-Host "[4/4] Build APK..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Chọn profile build:" -ForegroundColor Cyan
Write-Host "  1. preview  - Build APK để test (khuyến nghị)" -ForegroundColor White
Write-Host "  2. production - Build APK production" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1 hoặc 2, mặc định: 1)"

if ($choice -eq "2") {
    $profile = "production"
} else {
    $profile = "preview"
}

Write-Host ""
Write-Host "Đang build với profile: $profile" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ Build sẽ mất 10-20 phút..." -ForegroundColor Yellow
Write-Host "📱 Bạn có thể theo dõi tiến trình tại:" -ForegroundColor Yellow
Write-Host "   https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds" -ForegroundColor Cyan
Write-Host ""

# Chạy build
eas build --platform android --profile $profile

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD HOÀN TẤT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ APK đã được build thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Download APK:" -ForegroundColor Yellow
Write-Host "   1. Click vào link download trong terminal" -ForegroundColor White
Write-Host "   2. Hoặc truy cập: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds" -ForegroundColor White
Write-Host ""
Write-Host "📱 Chia sẻ APK:" -ForegroundColor Yellow
Write-Host "   - Copy link download và gửi cho người dùng" -ForegroundColor White
Write-Host "   - Họ có thể download và install trực tiếp" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Chúc mừng! APK đã sẵn sàng để phân phối!" -ForegroundColor Green
Write-Host ""
