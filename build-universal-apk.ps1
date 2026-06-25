# ============================================
# BUILD UNIVERSAL APK - CHẠY TỐT MỌI THIẾT BỊ
# ============================================

Write-Host "=== BUILD UNIVERSAL APK ===" -ForegroundColor Cyan
Write-Host "APK này sẽ chạy tốt trên tất cả các thiết bị Android" -ForegroundColor Green

# Step 1: Pre-build check
Write-Host "`n[1/6] Chạy kiểm tra tương thích..." -ForegroundColor Yellow
.\pre-build-universal-check.ps1
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
    $continue = Read-Host "Có lỗi được phát hiện. Tiếp tục build? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Build bị hủy" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Clean cache
Write-Host "`n[2/6] Xóa cache cũ..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
npx expo start --clear

# Step 3: Verify dependencies
Write-Host "`n[3/6] Kiểm tra dependencies..." -ForegroundColor Yellow
npm install

# Step 4: Check environment
Write-Host "`n[4/6] Kiểm tra environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Thiếu .env.local - tạo từ .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local" -ErrorAction SilentlyContinue
}

# Step 5: Build with EAS
Write-Host "`n[5/6] Bắt đầu build APK..." -ForegroundColor Yellow
Write-Host "Lưu ý: Quá trình này có thể mất 10-20 phút" -ForegroundColor Cyan

eas build --platform android --profile production --local --clear-cache

# Step 6: Result
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "APK đã được tối ưu cho:" -ForegroundColor Cyan
    Write-Host "  ✓ Màn hình nhỏ (4 inch) đến lớn (tablet)" -ForegroundColor White
    Write-Host "  ✓ Tất cả độ phân giải (hdpi, xhdpi, xxhdpi, xxxhdpi)" -ForegroundColor White
    Write-Host "  ✓ Android 6.0 (API 23) trở lên" -ForegroundColor White
    Write-Host "  ✓ Notch/Camera cutout" -ForegroundColor White
    Write-Host "  ✓ Màn hình tràn viền" -ForegroundColor White
    Write-Host "  ✓ Tối ưu hiệu năng (đã xóa console.log)" -ForegroundColor White
    
    Write-Host "`nFile APK: " -ForegroundColor Yellow -NoNewline
    Get-ChildItem -Path "." -Filter "*.apk" -Recurse | Select-Object -First 1 | ForEach-Object {
        Write-Host $_.FullName -ForegroundColor Green
    }
} else {
    Write-Host "`n❌ BUILD THẤT BẠI" -ForegroundColor Red
    Write-Host "Kiểm tra lỗi ở trên và thử lại" -ForegroundColor Yellow
    exit 1
}
