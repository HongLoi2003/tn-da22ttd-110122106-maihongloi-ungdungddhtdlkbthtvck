# Script khởi động app với Expo Go

Write-Host "🚀 Đang khởi động Expo với Expo Go..." -ForegroundColor Cyan
Write-Host ""

# Xóa cache
Write-Host "🧹 Xóa cache..." -ForegroundColor Yellow
npx expo start --clear --go

Write-Host ""
Write-Host "✅ Server đã khởi động!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 HƯỚNG DẪN:" -ForegroundColor Cyan
Write-Host "   1. Tải app 'Expo Go' từ Play Store (Android) hoặc App Store (iOS)" -ForegroundColor White
Write-Host "   2. Mở app Expo Go" -ForegroundColor White
Write-Host "   3. Quét mã QR hiển thị ở trên" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Link tải Expo Go:" -ForegroundColor Yellow
Write-Host "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent" -ForegroundColor White
Write-Host "   iOS: https://apps.apple.com/app/expo-go/id982107779" -ForegroundColor White
