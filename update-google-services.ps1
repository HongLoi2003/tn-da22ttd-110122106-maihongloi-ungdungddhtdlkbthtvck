#!/usr/bin/env pwsh
# Script hướng dẫn cập nhật google-services.json sau khi thêm SHA-1 mới

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Cập nhật google-services.json" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Bạn đã thêm SHA-1 mới vào Firebase:" -ForegroundColor Green
Write-Host "   2F:AC:AA:76:D7:13:85:73:B5:F9:0B:72:47:9E:FB:E6:9C:A1:26:7F" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 SHA-1 cũ (debug keystore):" -ForegroundColor White
Write-Host "   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25" -ForegroundColor Gray
Write-Host ""

# Kiểm tra file hiện tại
if (Test-Path "google-services.json") {
    Write-Host "📄 File google-services.json hiện tại:" -ForegroundColor White
    
    try {
        $currentFile = Get-Content "google-services.json" -Raw | ConvertFrom-Json
        
        # Lấy SHA-1 hiện tại
        $oauthClients = $currentFile.client[0].oauth_client
        $androidClient = $oauthClients | Where-Object { $_.client_type -eq 1 }
        
        if ($androidClient -and $androidClient.android_info.certificate_hash) {
            $currentSha1 = $androidClient.android_info.certificate_hash
            Write-Host "   SHA-1 trong file: $currentSha1" -ForegroundColor Gray
            
            # So sánh với SHA-1 mới
            $newSha1 = "2facaa76d71385735b5f90b72479efbe69ca1267f"
            
            if ($currentSha1 -eq $newSha1) {
                Write-Host "   ✅ File đã được cập nhật!" -ForegroundColor Green
                Write-Host ""
                Write-Host "=====================================" -ForegroundColor Cyan
                Write-Host "  Tiếp theo:" -ForegroundColor Cyan
                Write-Host "=====================================" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "1. Rebuild APK với EAS Build:" -ForegroundColor White
                Write-Host "   eas build -p android --profile production" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "2. Hoặc build local:" -ForegroundColor White
                Write-Host "   .\build-apk.ps1" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "3. Test đăng nhập Google trên APK mới" -ForegroundColor White
                Write-Host ""
                exit 0
            } else {
                Write-Host "   ⚠️  File chưa được cập nhật!" -ForegroundColor Yellow
                Write-Host ""
            }
        }
    } catch {
        Write-Host "   ⚠️  Không thể đọc file" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "❌ Không tìm thấy file google-services.json" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Hướng dẫn tải google-services.json" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bước 1: Mở Firebase Console" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/hearthcare-847b3/settings/general" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bước 2: Scroll xuống phần 'Your apps'" -ForegroundColor Yellow
Write-Host "   → Tìm app Android: com.maihongloi23.heatlecare" -ForegroundColor White
Write-Host ""

Write-Host "Bước 3: Click nút 'google-services.json'" -ForegroundColor Yellow
Write-Host "   File sẽ được download về máy" -ForegroundColor White
Write-Host ""

Write-Host "Bước 4: Copy file vào project" -ForegroundColor Yellow
Write-Host "   - Mở folder Downloads" -ForegroundColor White
Write-Host "   - Copy file google-services.json" -ForegroundColor White
Write-Host "   - Dán vào thư mục gốc của project (cùng cấp với app.json)" -ForegroundColor White
Write-Host "   - Chọn 'Replace' nếu được hỏi" -ForegroundColor White
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan

# Hỏi user đã tải file chưa
Write-Host ""
$answer = Read-Host "Bạn đã tải và copy file google-services.json mới chưa? (y/n)"

if ($answer -eq "y" -or $answer -eq "Y") {
    Write-Host ""
    Write-Host "Đang kiểm tra file mới..." -ForegroundColor Cyan
    
    if (Test-Path "google-services.json") {
        try {
            $newFile = Get-Content "google-services.json" -Raw | ConvertFrom-Json
            
            Write-Host ""
            Write-Host "✅ File google-services.json:" -ForegroundColor Green
            Write-Host "   Project ID: $($newFile.project_info.project_id)" -ForegroundColor White
            Write-Host "   Package: $($newFile.client[0].client_info.android_client_info.package_name)" -ForegroundColor White
            
            # Kiểm tra OAuth clients
            $oauthClients = $newFile.client[0].oauth_client
            
            Write-Host ""
            Write-Host "📱 OAuth Clients:" -ForegroundColor Yellow
            
            foreach ($client in $oauthClients) {
                if ($client.client_type -eq 1) {
                    Write-Host "   Android Client: $($client.client_id)" -ForegroundColor White
                    if ($client.android_info.certificate_hash) {
                        Write-Host "   SHA-1: $($client.android_info.certificate_hash)" -ForegroundColor Green
                    }
                } elseif ($client.client_type -eq 3) {
                    Write-Host "   Web Client: $($client.client_id)" -ForegroundColor White
                }
            }
            
            Write-Host ""
            Write-Host "=====================================" -ForegroundColor Cyan
            Write-Host "  Tiếp theo: Rebuild APK" -ForegroundColor Cyan
            Write-Host "=====================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Google Sign-In sẽ chỉ hoạt động sau khi rebuild APK mới." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Chọn cách build:" -ForegroundColor White
            Write-Host "1. EAS Build (recommended): eas build -p android --profile production" -ForegroundColor Cyan
            Write-Host "2. Local Build: .\build-apk.ps1" -ForegroundColor Cyan
            Write-Host ""
            
            $buildNow = Read-Host "Bạn có muốn build ngay không? (y/n)"
            
            if ($buildNow -eq "y" -or $buildNow -eq "Y") {
                Write-Host ""
                Write-Host "Đang chạy EAS Build..." -ForegroundColor Cyan
                Write-Host ""
                
                eas build -p android --profile production
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "✅ Build thành công!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Khi build hoàn tất:" -ForegroundColor Yellow
                    Write-Host "1. Tải APK về từ EAS dashboard" -ForegroundColor White
                    Write-Host "2. Cài đặt lên thiết bị" -ForegroundColor White
                    Write-Host "3. Test đăng nhập Google" -ForegroundColor White
                    Write-Host ""
                } else {
                    Write-Host ""
                    Write-Host "❌ Build failed!" -ForegroundColor Red
                    Write-Host "Kiểm tra lỗi và thử lại." -ForegroundColor Yellow
                    Write-Host ""
                }
            } else {
                Write-Host ""
                Write-Host "Nhớ rebuild APK trước khi test Google Sign-In!" -ForegroundColor Yellow
                Write-Host ""
            }
            
        } catch {
            Write-Host ""
            Write-Host "❌ Lỗi đọc file: $_" -ForegroundColor Red
            Write-Host ""
        }
    } else {
        Write-Host ""
        Write-Host "❌ Không tìm thấy file google-services.json" -ForegroundColor Red
        Write-Host "Vui lòng tải file từ Firebase Console và copy vào project." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Hãy tải file google-services.json từ Firebase Console và chạy lại script này." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
