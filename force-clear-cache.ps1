# Script để xóa hoàn toàn cache và khởi động lại Expo

Write-Host "🛑 Bước 1: Dừng tất cả process Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "🧹 Bước 2: Xóa cache Metro bundler..." -ForegroundColor Yellow
if (Test-Path ".metro") {
    Remove-Item -Recurse -Force ".metro"
    Write-Host "   ✓ Đã xóa .metro" -ForegroundColor Green
}

Write-Host "🧹 Bước 3: Xóa node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✓ Đã xóa node_modules/.cache" -ForegroundColor Green
}

Write-Host "🧹 Bước 4: Xóa cache Expo..." -ForegroundColor Yellow
npx expo start --clear --no-dev --minify 2>&1 | Out-Null
if (Test-Path "$env:LOCALAPPDATA\Expo") {
    Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Expo\*" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Đã xóa cache Expo" -ForegroundColor Green
}

Write-Host "`n🚀 Bước 5: Khởi động Expo với cache sạch..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
npx expo start --clear

Write-Host "`n✅ Hoàn tất!" -ForegroundColor Green
