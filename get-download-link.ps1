Write-Host "=== LẤY LINK DOWNLOAD APK ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra EAS CLI
Write-Host "Kiểm tra EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if ($null -eq $easInstalled) {
    Write-Host "❌ EAS CLI chưa cài đặt!" -ForegroundColor Red
    Write-Host "Cài đặt: npm install -g eas-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ EAS CLI đã cài đặt" -ForegroundColor Green
Write-Host ""

# Lấy danh sách builds
Write-Host "Lấy build mới nhất..." -ForegroundColor Yellow
eas build:list --platform=android --limit=1 --json | Out-File -FilePath "build-info.json"

$buildInfo = Get-Content "build-info.json" | ConvertFrom-Json
$latestBuild = $buildInfo[0]

if ($latestBuild.artifacts.buildUrl) {
    Write-Host ""
    Write-Host "=== THÔNG TIN BUILD ===" -ForegroundColor Green
    Write-Host "Build ID: $($latestBuild.id)" -ForegroundColor White
    Write-Host "Status: $($latestBuild.status)" -ForegroundColor White
    Write-Host "Platform: $($latestBuild.platform)" -ForegroundColor White
    Write-Host "Created: $($latestBuild.createdAt)" -ForegroundColor White
    Write-Host ""
    Write-Host "=== LINK DOWNLOAD APK ===" -ForegroundColor Cyan
    Write-Host $latestBuild.artifacts.buildUrl -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Copy link trên và gửi cho người dùng" -ForegroundColor Green
    Write-Host "📱 Họ có thể download trực tiếp mà không cần đăng nhập" -ForegroundColor Green
} else {
    Write-Host "❌ Không tìm thấy link download!" -ForegroundColor Red
    Write-Host "Build có thể đang xử lý hoặc bị lỗi" -ForegroundColor Yellow
}

# Cleanup
Remove-Item "build-info.json" -ErrorAction SilentlyContinue

Write-Host ""
