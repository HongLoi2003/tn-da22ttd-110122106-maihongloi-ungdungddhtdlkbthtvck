# ============================================
# BUILD iOS APP - CHO IPHONE/IPAD
# ============================================

Write-Host "=== BUILD iOS APP ===" -ForegroundColor Cyan

# Kiem tra macOS
if ($IsMacOS -eq $false -and $env:OS -match "Windows") {
    Write-Host "WARNING: Build iOS CHI hoat dong tren macOS voi Xcode" -ForegroundColor Red
    Write-Host ""
    Write-Host "BAN CO 3 LUA CHON:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. BUILD TREN CLOUD (KHONG CAN MAC) - Khuyen nghi" -ForegroundColor Green
    Write-Host "   eas build --platform ios --profile production" -ForegroundColor White
    Write-Host "   EAS se build tren server cua ho" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. MUON/THUE MAC" -ForegroundColor Yellow
    Write-Host "   Can macOS + Xcode de build local" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. CHI RELEASE ANDROID TRUOC" -ForegroundColor Yellow
    Write-Host "   70% nguoi Viet dung Android" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Ban muon build tren cloud? (y/n)"
    if ($choice -eq "y") {
        Write-Host "`nDang build iOS tren EAS cloud..." -ForegroundColor Yellow
        eas build --platform ios --profile production
    } else {
        Write-Host "`nBuild bi huy" -ForegroundColor Red
        exit 1
    }
    exit 0
}

# Neu dang tren macOS
Write-Host "Dang chay tren macOS" -ForegroundColor Green

# Kiem tra Xcode
if (-not (Get-Command "xcodebuild" -ErrorAction SilentlyContinue)) {
    Write-Host "Chua cai Xcode" -ForegroundColor Red
    Write-Host "Cai Xcode tu App Store: https://apps.apple.com/app/xcode/id497799835" -ForegroundColor Yellow
    exit 1
}

# Kiem tra Apple Developer account
Write-Host "`nYEU CAU:" -ForegroundColor Yellow
Write-Host "1. Apple Developer Account (99 USD/nam)" -ForegroundColor White
Write-Host "2. Da dang nhap Apple ID trong Xcode" -ForegroundColor White
Write-Host "3. Certificate va Provisioning Profile" -ForegroundColor White

$continue = Read-Host "`nBan da co du yeu cau tren? (y/n)"
if ($continue -ne "y") {
    Write-Host "Build bi huy" -ForegroundColor Red
    exit 1
}

# Clean cache
Write-Host "`n[1/3] Xoa cache cu..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "ios/build" -Recurse -Force -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "[2/3] Kiem tra dependencies..." -ForegroundColor Yellow
npm install
cd ios
pod install --repo-update
cd ..

# Build
Write-Host "[3/3] Bat dau build iOS..." -ForegroundColor Yellow
Write-Host "Luu y: Qua trinh nay co the mat 15-30 phut" -ForegroundColor Cyan

eas build --platform ios --profile production --local

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBUILD iOS THANH CONG!" -ForegroundColor Green
    Write-Host "`nCACH CAI LEN IPHONE:" -ForegroundColor Cyan
    Write-Host "1. Keo file .ipa vao iTunes/Finder" -ForegroundColor White
    Write-Host "2. Sync voi iPhone" -ForegroundColor White
    Write-Host "3. Hoac dung TestFlight de distribute" -ForegroundColor White
} else {
    Write-Host "`nBUILD THAT BAI" -ForegroundColor Red
}
