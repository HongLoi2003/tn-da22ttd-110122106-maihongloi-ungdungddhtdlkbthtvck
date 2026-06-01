# Script tự động setup Google Sign-In cho mobile

Write-Host "🚀 Setup Google Sign-In cho Mobile" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Kiểm tra google-services.json
Write-Host "📁 Bước 1: Kiểm tra google-services.json" -ForegroundColor Yellow
if (Test-Path "android\app\google-services.json") {
    Write-Host "✅ File google-services.json đã tồn tại" -ForegroundColor Green
    
    # Đọc và extract Web Client ID
    $json = Get-Content "android\app\google-services.json" -Raw | ConvertFrom-Json
    $webClientId = $json.client[0].oauth_client | Where-Object { $_.client_type -eq 3 } | Select-Object -ExpandProperty client_id
    
    if ($webClientId) {
        Write-Host "✅ Tìm thấy Web Client ID: $webClientId" -ForegroundColor Green
        
        # Cập nhật .env.local
        Write-Host ""
        Write-Host "📝 Bước 2: Cập nhật .env.local" -ForegroundColor Yellow
        
        if (Test-Path ".env.local") {
            $envContent = Get-Content ".env.local" -Raw
            
            if ($envContent -match "EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=") {
                # Update existing
                $envContent = $envContent -replace "EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=.*", "EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=$webClientId"
                Write-Host "✅ Đã cập nhật Web Client ID trong .env.local" -ForegroundColor Green
            } else {
                # Add new
                $envContent += "`n`n# Google Sign-In Web Client ID`nEXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=$webClientId"
                Write-Host "✅ Đã thêm Web Client ID vào .env.local" -ForegroundColor Green
            }
            
            Set-Content ".env.local" -Value $envContent
        } else {
            Write-Host "❌ File .env.local không tồn tại" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Không tìm thấy Web Client ID trong google-services.json" -ForegroundColor Yellow
        Write-Host "💡 Vui lòng thêm thủ công vào .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ File google-services.json chưa tồn tại" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Hướng dẫn:" -ForegroundColor Yellow
    Write-Host "1. Vào Firebase Console: https://console.firebase.google.com" -ForegroundColor White
    Write-Host "2. Chọn project: hearthcare-847b3" -ForegroundColor White
    Write-Host "3. Settings → Project settings → Your apps → Android" -ForegroundColor White
    Write-Host "4. Download google-services.json" -ForegroundColor White
    Write-Host "5. Copy vào: android\app\google-services.json" -ForegroundColor White
    Write-Host ""
    
    # Kiểm tra trong Downloads
    $downloadsPath = "$env:USERPROFILE\Downloads\google-services.json"
    if (Test-Path $downloadsPath) {
        Write-Host "✅ Tìm thấy file trong Downloads!" -ForegroundColor Green
        Write-Host "📁 Đang copy file..." -ForegroundColor Yellow
        
        # Tạo thư mục nếu chưa có
        New-Item -ItemType Directory -Force -Path "android\app" | Out-Null
        
        # Copy file
        Copy-Item $downloadsPath -Destination "android\app\google-services.json"
        
        Write-Host "✅ Đã copy google-services.json vào android\app\" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 Chạy lại script này để tiếp tục setup" -ForegroundColor Cyan
    }
    
    exit
}

# Bước 3: Lấy SHA-1
Write-Host ""
Write-Host "🔐 Bước 3: Lấy SHA-1 Fingerprint" -ForegroundColor Yellow

$debugKeystore = "$env:USERPROFILE\.android\debug.keystore"
if (Test-Path $debugKeystore) {
    Write-Host "📱 Debug Keystore SHA-1:" -ForegroundColor Cyan
    $sha1 = keytool -list -v -keystore $debugKeystore -alias androiddebugkey -storepass android -keypass android 2>$null | Select-String "SHA1:"
    Write-Host $sha1 -ForegroundColor White
    
    Write-Host ""
    Write-Host "📋 Copy SHA-1 ở trên và:" -ForegroundColor Yellow
    Write-Host "1. Vào Firebase Console → Project Settings" -ForegroundColor White
    Write-Host "2. Your apps → Android → Add fingerprint" -ForegroundColor White
    Write-Host "3. Paste SHA-1 → Save" -ForegroundColor White
} else {
    Write-Host "⚠️ Debug keystore không tìm thấy" -ForegroundColor Yellow
}

# Bước 4: Kiểm tra package
Write-Host ""
Write-Host "📦 Bước 4: Kiểm tra package" -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.dependencies.'@react-native-google-signin/google-signin') {
    Write-Host "✅ Package @react-native-google-signin/google-signin đã được cài đặt" -ForegroundColor Green
} else {
    Write-Host "⚠️ Package chưa được cài đặt" -ForegroundColor Yellow
    Write-Host "📦 Đang cài đặt..." -ForegroundColor Yellow
    npm install @react-native-google-signin/google-signin
    Write-Host "✅ Đã cài đặt package" -ForegroundColor Green
}

# Tổng kết
Write-Host ""
Write-Host "✅ Setup hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Thêm SHA-1 vào Firebase Console (nếu chưa)" -ForegroundColor White
Write-Host "2. Chạy: npx expo start --clear" -ForegroundColor White
Write-Host "3. Test Google Sign-In trên app" -ForegroundColor White
Write-Host ""
Write-Host "📚 Xem hướng dẫn chi tiết: CAI_DAT_GOOGLE_SIGNIN_NHANH.md" -ForegroundColor Yellow
Write-Host ""
