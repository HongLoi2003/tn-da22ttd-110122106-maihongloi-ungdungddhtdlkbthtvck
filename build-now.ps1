#!/usr/bin/env pwsh
# Build APK ngay - Da fix xong anh

Write-Host "`n" -NoNewline
Write-Host "BUILD APK - DA FIX XONG ANH" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray

# Kiem tra nhanh
Write-Host "`nKiem tra nhanh..." -ForegroundColor Yellow
.\final-check-before-build.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nVan con van de! Khong the build." -ForegroundColor Red
    exit 1
}

# Clear cache
Write-Host "`nClear cache..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   OK: Da clear cache" -ForegroundColor Green

# Build
Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "BAT DAU BUILD..." -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

npx eas-cli build --platform android --profile preview --clear-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n" -NoNewline
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host "BUILD THANH CONG!" -ForegroundColor Green
    Write-Host ("=" * 60) -ForegroundColor Gray
} else {
    Write-Host "`n" -NoNewline
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host "BUILD THAT BAI!" -ForegroundColor Red
    Write-Host ("=" * 60) -ForegroundColor Gray
}

Write-Host ""
