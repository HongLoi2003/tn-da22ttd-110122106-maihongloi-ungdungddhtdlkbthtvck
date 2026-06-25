# ============================================
# PRE-BUILD UNIVERSAL COMPATIBILITY CHECK
# ============================================
# Script kiểm tra đảm bảo APK chạy tốt trên mọi thiết bị

Write-Host "=== KIỂM TRA TƯƠNG THÍCH ĐA THIẾT BỊ ===" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Kiểm tra responsive layout issues
Write-Host "`n[1/10] Kiểm tra responsive layout..." -ForegroundColor Yellow
$hardcodedSizes = Select-String -Path "app/**/*.tsx" -Pattern "width:\s*\d+[^%]|height:\s*\d+[^%]|fontSize:\s*\d+" -ErrorAction SilentlyContinue
if ($hardcodedSizes) {
    $warnings += "⚠️  Tìm thấy hardcoded sizes - có thể gây lỗi giao diện trên màn hình khác nhau"
}

# 2. Kiểm tra SafeAreaView usage
Write-Host "[2/10] Kiểm tra SafeAreaView..." -ForegroundColor Yellow
$missingInsets = Select-String -Path "app/**/*.tsx" -Pattern "<View" -ErrorAction SilentlyContinue | Where-Object {
    $_.Line -notmatch "SafeAreaView" -and $_.Path -match "(tabs|index|_layout)"
}
if ($missingInsets.Count -gt 5) {
    $warnings += "⚠️  Nhiều View không dùng SafeAreaView - có thể bị che bởi notch/camera"
}

# 3. Kiểm tra image optimization
Write-Host "[3/10] Kiểm tra images..." -ForegroundColor Yellow
$localImages = Select-String -Path "app/**/*.tsx" -Pattern "require\(['`"].*\.(png|jpg|jpeg)" -ErrorAction SilentlyContinue
if ($localImages.Count -gt 50) {
    $warnings += "⚠️  Quá nhiều ảnh local ($($localImages.Count)) - APK sẽ rất nặng"
}

# 4. Kiểm tra permissions
Write-Host "[4/10] Kiểm tra permissions..." -ForegroundColor Yellow
$appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
if (-not $appJson.expo.android.permissions) {
    $errors += "❌ Thiếu permissions trong app.json"
}

# 5. Kiểm tra dependencies tương thích
Write-Host "[5/10] Kiểm tra dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$requiredDeps = @(
    "react-native-safe-area-context",
    "expo-constants",
    "expo-status-bar"
)
foreach ($dep in $requiredDeps) {
    if (-not $packageJson.dependencies.$dep) {
        $errors += "❌ Thiếu dependency quan trọng: $dep"
    }
}

# 6. Kiểm tra hardcoded API URLs
Write-Host "[6/10] Kiểm tra hardcoded URLs..." -ForegroundColor Yellow
$hardcodedUrls = Select-String -Path "app/**/*.{ts,tsx}" -Pattern "http://localhost|http://192\.168\." -ErrorAction SilentlyContinue
if ($hardcodedUrls) {
    $errors += "❌ Tìm thấy hardcoded localhost URLs - app sẽ không hoạt động trên thiết bị thật"
}

# 7. Kiểm tra console.log (performance)
Write-Host "[7/10] Kiểm tra console logs..." -ForegroundColor Yellow
$consoleLogs = Select-String -Path "app/**/*.{ts,tsx}" -Pattern "console\.(log|warn|error)" -ErrorAction SilentlyContinue
if ($consoleLogs.Count -gt 20) {
    $warnings += "⚠️  Quá nhiều console.log ($($consoleLogs.Count)) - ảnh hưởng performance"
}

# 8. Kiểm tra TypeScript errors
Write-Host "[8/10] Kiểm tra TypeScript..." -ForegroundColor Yellow
try {
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -ne 0) {
        $warnings += "⚠️  Có TypeScript errors - có thể gây crash runtime"
    }
} catch {
    $warnings += "⚠️  Không thể kiểm tra TypeScript"
}

# 9. Kiểm tra adaptive icon
Write-Host "[9/10] Kiểm tra adaptive icon..." -ForegroundColor Yellow
if (-not (Test-Path "assets/images/logo.png")) {
    $errors += "❌ Thiếu logo.png - app icon sẽ bị lỗi"
}

# 10. Kiểm tra google-services.json
Write-Host "[10/10] Kiểm tra Firebase config..." -ForegroundColor Yellow
if (-not (Test-Path "google-services.json")) {
    $errors += "❌ Thiếu google-services.json - Firebase sẽ không hoạt động"
}

# TỔNG KẾT
Write-Host "`n=== KẾT QUẢ KIỂM TRA ===" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ HOÀN HẢO! Sẵn sàng build APK tương thích mọi thiết bị" -ForegroundColor Green
    exit 0
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ LỖI NGHIÊM TRỌNG ($($errors.Count)):" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  CẢNH BÁO ($($warnings.Count)):" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ KHÔNG NÊN BUILD - Sửa lỗi trước!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n⚠️  CÓ THỂ BUILD - Nhưng nên sửa warnings" -ForegroundColor Yellow
    exit 0
}
