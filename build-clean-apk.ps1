Write-Host "`n=== BUILD APK CLEAN - HEALTH CARE ===" -ForegroundColor Green
Write-Host ""

# Bước 1: Xóa cache
Write-Host "📦 Bước 1: Clear cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Đã xóa .expo cache" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Đã xóa node_modules cache" -ForegroundColor Green
}

Write-Host ""

# Bước 2: Build với EAS
Write-Host "🚀 Bước 2: Build APK với EAS..." -ForegroundColor Yellow
Write-Host "Thời gian dự kiến: 10-20 phút" -ForegroundColor Cyan
Write-Host ""

# Chọn profile
$profile = "preview"  # preview = APK, production = AAB

Write-Host "Build profile: $profile (APK file)" -ForegroundColor Cyan
Write-Host ""

# Chạy build
npx eas-cli build --platform android --profile $profile --clear-cache

Write-Host ""
Write-Host "=== BUILD HOÀN TẤT ===" -ForegroundColor Green
Write-Host ""
Write-Host "✅ APK đã được build!" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Download APK từ link phía trên" -ForegroundColor Yellow
Write-Host "📱 Hoặc truy cập: https://expo.dev" -ForegroundColor Yellow
Write-Host ""
