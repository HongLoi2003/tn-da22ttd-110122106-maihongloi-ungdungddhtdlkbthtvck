Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BUILD APP VỚI GOOGLE SIGN-IN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Đang login EAS..." -ForegroundColor Yellow
Write-Host ""
npx eas login
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Login thất bại!" -ForegroundColor Red
    Write-Host "Vui lòng thử lại hoặc tạo account tại: https://expo.dev/signup" -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Login thành công!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Đang configure EAS (nếu cần)..." -ForegroundColor Yellow
Write-Host ""
npx eas build:configure
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️ Configure có vấn đề, nhưng có thể không sao" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[3/3] Bắt đầu build Development APK..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Quá trình này sẽ mất 10-15 phút" -ForegroundColor Yellow
Write-Host "💡 Bạn có thể đóng terminal, build vẫn chạy trên cloud" -ForegroundColor Cyan
Write-Host "🔗 Kiểm tra tiến độ tại: https://expo.dev" -ForegroundColor Cyan
Write-Host ""

npx eas build -p android --profile development

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ HOÀN THÀNH!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Download APK từ link trên" -ForegroundColor White
Write-Host "2. Cài APK lên điện thoại" -ForegroundColor White
Write-Host "3. Mở app và test Google Sign-In" -ForegroundColor White
Write-Host ""
Read-Host "Nhấn Enter để thoát"
