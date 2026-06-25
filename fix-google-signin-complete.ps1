#!/usr/bin/env pwsh
# Script tổng hợp fix Google Sign-In

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Fix Google Sign-In - Complete Workflow" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$allStepsOk = $true

# Step 1: Check configuration
Write-Host "BƯỚC 1: Kiểm tra cấu hình..." -ForegroundColor Yellow
Write-Host ""

# Check .env.local
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=(.+)") {
        Write-Host "  ✅ .env.local có Web Client ID" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .env.local thiếu Web Client ID" -ForegroundColor Red
        $allStepsOk = $false
    }
} else {
    Write-Host "  ❌ Không tìm thấy .env.local" -ForegroundColor Red
    $allStepsOk = $false
}

# Check app.json
if (Test-Path "app.json") {
    $appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
    $hasPlugin = $appJson.expo.plugins | Where-Object { 
        $_ -is [array] -and $_[0] -eq "@react-native-google-signin/google-signin"
    }
    
    if ($hasPlugin) {
        Write-Host "  ✅ app.json có plugin Google Sign-In" -ForegroundColor Green
    } else {
        Write-Host "  ❌ app.json thiếu plugin" -ForegroundColor Red
        $allStepsOk = $false
    }
}

# Check google-services.json
if (Test-Path "google-services.json") {
    Write-Host "  ✅ google-services.json tồn tại" -ForegroundColor Green
    
    try {
        $googleServices = Get-Content "google-services.json" -Raw | ConvertFrom-Json
        $oauthClients = $googleServices.client[0].oauth_client
        $androidClient = $oauthClients | Where-Object { $_.client_type -eq 1 }
        
        if ($androidClient -and $androidClient.android_info.certificate_hash) {
            $currentSha1 = $androidClient.android_info.certificate_hash
            Write-Host "  📝 SHA-1 hiện tại: $currentSha1" -ForegroundColor Gray
            
            # Check if it's the new SHA-1
            $productionSha1 = "2facaa76d71385735b5f90b72479efbe69ca1267f"
            
            if ($currentSha1 -eq $productionSha1) {
                Write-Host "  ✅ File đã có SHA-1 mới từ EAS Build!" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  File chưa có SHA-1 production" -ForegroundColor Yellow
                Write-Host "     Cần tải lại từ Firebase Console" -ForegroundColor Yellow
                $allStepsOk = $false
            }
        }
    } catch {
        Write-Host "  ⚠️  Không đọc được file" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Không tìm thấy google-services.json" -ForegroundColor Red
    $allStepsOk = $false
}

Write-Host ""

if (-not $allStepsOk) {
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "  ❌ Có vấn đề với cấu hình!" -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bạn cần:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Tải google-services.json MỚI từ Firebase Console" -ForegroundColor White
    Write-Host "   (sau khi đã thêm SHA-1: 2F:AC:AA:...)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Copy vào project root" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Chạy lại script này" -ForegroundColor White
    Write-Host ""
    Write-Host "Hướng dẫn chi tiết:" -ForegroundColor Cyan
    Write-Host "  .\update-google-services.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Step 2: Show next steps
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  ✅ Cấu hình OK!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

Write-Host "BƯỚC 2: Rebuild APK" -ForegroundColor Yellow
Write-Host ""
Write-Host "Google Sign-In chỉ hoạt động trên APK mới." -ForegroundColor White
Write-Host ""
Write-Host "Chọn cách build:" -ForegroundColor White
Write-Host "  1. EAS Build (recommended)" -ForegroundColor Cyan
Write-Host "  2. Local Build" -ForegroundColor Cyan
Write-Host "  3. Skip (tự build sau)" -ForegroundColor Gray
Write-Host ""

$buildChoice = Read-Host "Nhập lựa chọn (1-3)"

switch ($buildChoice) {
    "1" {
        Write-Host ""
        Write-Host "Đang chạy EAS Build..." -ForegroundColor Cyan
        Write-Host ""
        
        # Check if EAS CLI is installed
        $easInstalled = Get-Command eas -ErrorAction SilentlyContinue
        
        if (-not $easInstalled) {
            Write-Host "❌ EAS CLI chưa được cài đặt!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Cài đặt:" -ForegroundColor Yellow
            Write-Host "  npm install -g eas-cli" -ForegroundColor Cyan
            Write-Host ""
            exit 1
        }
        
        # Run EAS build
        eas build -p android --profile production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Build đã được submit!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Theo dõi tiến trình:" -ForegroundColor Yellow
            Write-Host "  https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Khi build xong:" -ForegroundColor White
            Write-Host "  1. Tải APK về" -ForegroundColor Gray
            Write-Host "  2. Cài đặt lên thiết bị" -ForegroundColor Gray
            Write-Host "  3. Test Google Sign-In" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ Build failed!" -ForegroundColor Red
            Write-Host "Xem logs và fix lỗi." -ForegroundColor Yellow
            Write-Host ""
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Đang chạy Local Build..." -ForegroundColor Cyan
        Write-Host ""
        
        if (Test-Path "build-apk.ps1") {
            & ".\build-apk.ps1"
        } else {
            Write-Host "❌ Không tìm thấy build-apk.ps1" -ForegroundColor Red
            Write-Host ""
            Write-Host "Chạy thủ công:" -ForegroundColor Yellow
            Write-Host "  npx expo prebuild --clean" -ForegroundColor Cyan
            Write-Host "  cd android" -ForegroundColor Cyan
            Write-Host "  .\gradlew assembleRelease" -ForegroundColor Cyan
            Write-Host ""
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "OK, bạn có thể build sau." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Nhớ build với một trong các lệnh:" -ForegroundColor White
        Write-Host "  eas build -p android --profile production" -ForegroundColor Cyan
        Write-Host "  .\build-apk.ps1" -ForegroundColor Cyan
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "Lựa chọn không hợp lệ!" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  📚 Tài liệu" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checklist đầy đủ:" -ForegroundColor White
Write-Host "  GOOGLE-SIGNIN-CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hướng dẫn chi tiết:" -ForegroundColor White
Write-Host "  fix-google-signin.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Kiểm tra cấu hình:" -ForegroundColor White
Write-Host "  .\check-google-signin-config.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
