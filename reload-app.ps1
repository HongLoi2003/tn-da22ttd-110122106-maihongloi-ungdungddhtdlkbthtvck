# Script để reload app với clear cache

Write-Host "🔄 Reloading app với clear cache..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Các bước:" -ForegroundColor Yellow
Write-Host "1. Dừng Metro server hiện tại (Ctrl+C trong terminal đang chạy)" -ForegroundColor White
Write-Host "2. Chạy lệnh sau để clear cache và start lại:" -ForegroundColor White
Write-Host ""
Write-Host "   npx expo start -c" -ForegroundColor Green
Write-Host ""
Write-Host "Hoặc:" -ForegroundColor Yellow
Write-Host "   npm start -- --reset-cache" -ForegroundColor Green
Write-Host ""
Write-Host "3. Sau khi Metro start, bấm 'a' để mở Android hoặc reload app" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Nếu vẫn không thấy thay đổi, tắt app hoàn toàn và mở lại" -ForegroundColor Cyan
