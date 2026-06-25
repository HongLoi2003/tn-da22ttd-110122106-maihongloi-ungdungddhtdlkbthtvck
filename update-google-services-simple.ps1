#!/usr/bin/env pwsh

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Cap nhat google-services.json" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ban da them SHA-1 moi vao Firebase:" -ForegroundColor Green
Write-Host "  2F:AC:AA:76:D7:13:85:73:B5:F9:0B:72:47:9E:FB:E6:9C:A1:26:7F" -ForegroundColor Yellow
Write-Host ""

# Kiem tra file hien tai
if (Test-Path "google-services.json") {
    Write-Host "File google-services.json hien tai co ton tai." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Khong tim thay file google-services.json" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Huong dan tai file moi" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Buoc 1: Mo Firebase Console" -ForegroundColor Yellow
Write-Host "  https://console.firebase.google.com/project/hearthcare-847b3/settings/general" -ForegroundColor Cyan
Write-Host ""

Write-Host "Buoc 2: Scroll xuong 'Your apps'" -ForegroundColor Yellow
Write-Host "  -> Tim app Android: com.maihongloi23.heatlecare" -ForegroundColor White
Write-Host ""

Write-Host "Buoc 3: Click nut 'google-services.json'" -ForegroundColor Yellow
Write-Host "  File se duoc download ve may" -ForegroundColor White
Write-Host ""

Write-Host "Buoc 4: Copy file vao project" -ForegroundColor Yellow
Write-Host "  - Mo folder Downloads" -ForegroundColor White
Write-Host "  - Copy file google-services.json" -ForegroundColor White
Write-Host "  - Dan vao thu muc goc cua project" -ForegroundColor White
Write-Host "  - Chon 'Replace' neu duoc hoi" -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan

Write-Host ""
$answer = Read-Host "Ban da tai va copy file google-services.json moi chua? (y/n)"

if ($answer -eq "y" -or $answer -eq "Y") {
    Write-Host ""
    Write-Host "Dang kiem tra file moi..." -ForegroundColor Cyan
    
    if (Test-Path "google-services.json") {
        Write-Host ""
        Write-Host "Da tim thay file google-services.json!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  Tiep theo: Rebuild APK" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Google Sign-In se chi hoat dong sau khi rebuild APK moi." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Chon cach build:" -ForegroundColor White
        Write-Host "1. EAS Build: eas build -p android --profile production" -ForegroundColor Cyan
        Write-Host "2. Local Build: .\build-apk.ps1" -ForegroundColor Cyan
        Write-Host ""
        
        $buildNow = Read-Host "Ban co muon build ngay khong? (y/n)"
        
        if ($buildNow -eq "y" -or $buildNow -eq "Y") {
            Write-Host ""
            Write-Host "Dang chay EAS Build..." -ForegroundColor Cyan
            Write-Host ""
            
            eas build -p android --profile production
        } else {
            Write-Host ""
            Write-Host "Nho rebuild APK truoc khi test Google Sign-In!" -ForegroundColor Yellow
            Write-Host ""
        }
    } else {
        Write-Host ""
        Write-Host "Khong tim thay file google-services.json" -ForegroundColor Red
        Write-Host "Vui long tai file tu Firebase Console va copy vao project." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Hay tai file google-services.json tu Firebase Console va chay lai script nay." -ForegroundColor Yellow
    Write-Host ""
}
