#!/usr/bin/env pwsh
# Kiem tra cuoi cung truoc khi build

Write-Host "`n" -NoNewline
Write-Host "KIEM TRA CUOI CUNG TRUOC KHI BUILD" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

$hasErrors = $false

# 1. Kiem tra anh lon con trong code
Write-Host "`n" -NoNewline
Write-Host "Buoc 1: Kiem tra anh lon (>500KB)..." -ForegroundColor Yellow

$largeImages = @(
    'benhviendhtv.png',
    'hearderddau.png',
    'benhvien.png',
    'ai.png',
    'thaikykhoemanh.png',
    'chamsocrang.png',
    'bacsi.png',
    'bckgour.png',
    'Phongnguatieuduong.png',
    'dauhieubenhtim.png',
    'leminhtam.png',
    'nguyenthihoa.png',
    'chamsocdamun.png',
    'stress.png',
    'dominhtuan.png',
    'daukhopgoi.png',
    'chedouonguoc.png',
    'yoga.png',
    'viemxoangmantinh.png',
    'chamsoctresosinh.png'
)

$foundLargeImages = $false
foreach ($img in $largeImages) {
    $pattern = "@/assets/images/$img"
    $found = Get-ChildItem -Path "app" -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue | 
        Select-String -Pattern $pattern -SimpleMatch
    
    if ($found) {
        Write-Host "   Tim thay: $img" -ForegroundColor Red
        $foundLargeImages = $true
        $hasErrors = $true
    }
}

if (-not $foundLargeImages) {
    Write-Host "   OK: Khong con anh lon trong code" -ForegroundColor Green
}

# 2. Tong ket
Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Gray

if ($hasErrors) {
    Write-Host "`n" -NoNewline
    Write-Host "CO VAN DE CAN KHAC PHUC!" -ForegroundColor Red
    Write-Host "`nGiai phap:" -ForegroundColor Yellow
    Write-Host "   1. Xem loi o tren" -ForegroundColor White
    Write-Host "   2. Thay require() bang URL" -ForegroundColor White
    Write-Host ""
    exit 1
} else {
    Write-Host "`n" -NoNewline
    Write-Host "TAT CA DEU OK!" -ForegroundColor Green
    Write-Host "`n" -NoNewline
    Write-Host "SAN SANG BUILD!" -ForegroundColor Cyan
    Write-Host "`nChay lenh:" -ForegroundColor Yellow
    Write-Host "   npx eas-cli build --platform android --profile preview --clear-cache" -ForegroundColor White
    Write-Host ""
    exit 0
}
