# Script chuyển sang Expo Go để test nhanh

Write-Host "🔄 Đang chuyển sang Expo Go..." -ForegroundColor Cyan
Write-Host ""

# Bước 1: Xóa expo-dev-client
Write-Host "📦 Bước 1: Xóa expo-dev-client..." -ForegroundColor Yellow
npm uninstall expo-dev-client

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Đã xóa expo-dev-client" -ForegroundColor Green
} else {
    Write-Host "❌ Lỗi khi xóa expo-dev-client" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Bước 2: Clear cache
Write-Host "🧹 Bước 2: Xóa cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host ""
Write-Host "✅ HOÀN TẤT!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Bây giờ bạn có thể:" -ForegroundColor Cyan
Write-Host "   1. Tải Expo Go từ Play Store/App Store" -ForegroundColor White
Write-Host "   2. Mở Expo Go và quét mã QR" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Server đang chạy, hãy quét mã QR bằng Expo Go!" -ForegroundColor Green
