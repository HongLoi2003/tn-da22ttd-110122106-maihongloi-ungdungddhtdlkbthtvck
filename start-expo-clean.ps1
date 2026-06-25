# Script để khởi động Expo sau khi dừng tất cả process đang chạy

Write-Host "🛑 Đang dừng tất cả process Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Đang xóa cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "✅ Hoàn tất!" -ForegroundColor Green
