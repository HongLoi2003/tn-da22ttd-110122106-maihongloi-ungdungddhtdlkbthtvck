# Script chạy trực tiếp trên Android (không cần QR)

Write-Host "🤖 Đang chạy app trên Android..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra thiết bị
Write-Host "📱 Kiểm tra thiết bị Android..." -ForegroundColor Yellow
adb devices

Write-Host ""
Write-Host "⚠️  Đảm bảo:" -ForegroundColor Yellow
Write-Host "   1. Đã kết nối điện thoại qua USB và bật USB Debugging" -ForegroundColor White
Write-Host "   2. HOẶC đã khởi động Android Emulator" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Tiếp tục? (Y/N)"

if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host "❌ Đã hủy" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Đang build và chạy app..." -ForegroundColor Cyan
npm run android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ App đã được cài đặt và chạy trên thiết bị!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Lỗi khi chạy app" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Thử các cách sau:" -ForegroundColor Yellow
    Write-Host "   1. Kiểm tra lại kết nối USB" -ForegroundColor White
    Write-Host "   2. Khởi động lại Android Emulator" -ForegroundColor White
    Write-Host "   3. Chạy: adb devices để xem thiết bị" -ForegroundColor White
}
