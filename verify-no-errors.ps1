# Script kiểm tra không còn lỗi ảnh
Write-Host "🔍 Verifying no image errors..." -ForegroundColor Cyan

$errors = @()

# Check 1: Kiểm tra không còn tham chiếu đến ngudugiac
Write-Host "`n📝 Checking for ngudugiac references..." -ForegroundColor Yellow
$ngudugiacFiles = Get-ChildItem -Path "app" -Recurse -Include "*.tsx","*.ts","*.js","*.jsx" | Select-String -Pattern "ngudug" -SimpleMatch
if ($ngudugiacFiles) {
    $errors += "❌ Found ngudugiac references in: $($ngudugiacFiles.Path)"
} else {
    Write-Host "  ✅ No ngudugiac references found" -ForegroundColor Green
}

# Check 2: Kiểm tra không còn tham chiếu đến canthiotreem
Write-Host "`n📝 Checking for canthiotreem references..." -ForegroundColor Yellow
$canthiotreemFiles = Get-ChildItem -Path "app" -Recurse -Include "*.tsx","*.ts","*.js","*.jsx" | Select-String -Pattern "canthiotreem" -SimpleMatch
if ($canthiotreemFiles) {
    $errors += "❌ Found canthiotreem references in: $($canthiotreemFiles.Path)"
} else {
    Write-Host "  ✅ No canthiotreem references found" -ForegroundColor Green
}

# Check 3: Kiểm tra các file ảnh quan trọng tồn tại
Write-Host "`n📝 Checking important image files exist..." -ForegroundColor Yellow
$requiredImages = @(
    "assets/images/logo.png",
    "assets/images/nguyenvanam.png",
    "assets/images/tranthilan.png",
    "assets/images/leminhtam.png",
    "assets/images/tranthimai.png"
)

foreach ($img in $requiredImages) {
    if (Test-Path $img) {
        Write-Host "  ✅ $img exists" -ForegroundColor Green
    } else {
        $errors += "❌ Missing: $img"
    }
}

# Summary
Write-Host "`n" -NoNewline
if ($errors.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED! No image errors found." -ForegroundColor Green
    Write-Host "`n🚀 Safe to build now:" -ForegroundColor Cyan
    Write-Host "   npx eas-cli build --platform android --profile preview --clear-cache" -ForegroundColor White
} else {
    Write-Host "❌ ERRORS FOUND:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   $error" -ForegroundColor Red
    }
}
