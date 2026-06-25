#!/usr/bin/env pwsh
# Script kiểm tra cấu hình Google Sign-In

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Google Sign-In Configuration Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Kiểm tra .env.local
Write-Host "1. Kiểm tra .env.local file..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ File tồn tại" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=(.+)") {
        $webClientId = $matches[1].Trim()
        Write-Host "   ✅ EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID: $webClientId" -ForegroundColor Green
        
        if ($webClientId -notmatch "\.apps\.googleusercontent\.com$") {
            Write-Host "   ❌ Web Client ID format không đúng!" -ForegroundColor Red
            Write-Host "      Phải có dạng: XXXXX-XXXXX.apps.googleusercontent.com" -ForegroundColor Yellow
            $allGood = $false
        }
    } else {
        Write-Host "   ❌ Thiếu EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID" -ForegroundColor Red
        Write-Host "      Thêm dòng: EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=9119519990-h0ghp9fhpjltof05160ea98bchd42i6n.apps.googleusercontent.com" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Không tìm thấy file .env.local" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 2. Kiểm tra google-services.json
Write-Host "2. Kiểm tra google-services.json..." -ForegroundColor Yellow
if (Test-Path "google-services.json") {
    Write-Host "   ✅ File tồn tại" -ForegroundColor Green
    
    try {
        $googleServices = Get-Content "google-services.json" -Raw | ConvertFrom-Json
        
        # Kiểm tra OAuth clients
        $oauthClients = $googleServices.client[0].oauth_client
        
        $androidClient = $oauthClients | Where-Object { $_.client_type -eq 1 }
        $webClient = $oauthClients | Where-Object { $_.client_type -eq 3 }
        
        if ($androidClient) {
            Write-Host "   ✅ Android OAuth Client: $($androidClient.client_id)" -ForegroundColor Green
            
            if ($androidClient.android_info.certificate_hash) {
                Write-Host "   ✅ SHA-1 Fingerprint: $($androidClient.android_info.certificate_hash)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Chưa có SHA-1 fingerprint" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ Thiếu Android OAuth Client" -ForegroundColor Red
            $allGood = $false
        }
        
        if ($webClient) {
            Write-Host "   ✅ Web OAuth Client: $($webClient.client_id)" -ForegroundColor Green
            
            # So sánh với .env.local
            if ($envContent -match "EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=(.+)") {
                $envWebClientId = $matches[1].Trim()
                if ($envWebClientId -eq $webClient.client_id) {
                    Write-Host "   ✅ Web Client ID khớp với .env.local" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ Web Client ID không khớp!" -ForegroundColor Red
                    Write-Host "      google-services.json: $($webClient.client_id)" -ForegroundColor Yellow
                    Write-Host "      .env.local:           $envWebClientId" -ForegroundColor Yellow
                    $allGood = $false
                }
            }
        } else {
            Write-Host "   ❌ Thiếu Web OAuth Client" -ForegroundColor Red
            $allGood = $false
        }
        
    } catch {
        Write-Host "   ❌ Lỗi đọc file: $_" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Không tìm thấy file google-services.json" -ForegroundColor Red
    Write-Host "      Tải từ: Firebase Console → Project Settings → Your apps" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# 3. Kiểm tra app.json
Write-Host "3. Kiểm tra app.json..." -ForegroundColor Yellow
if (Test-Path "app.json") {
    Write-Host "   ✅ File tồn tại" -ForegroundColor Green
    
    try {
        $appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
        
        # Kiểm tra plugin Google Sign-In
        $googleSignInPlugin = $appJson.expo.plugins | Where-Object { 
            $_ -is [array] -and $_[0] -eq "@react-native-google-signin/google-signin"
        }
        
        if ($googleSignInPlugin) {
            Write-Host "   ✅ Plugin @react-native-google-signin/google-signin đã cấu hình" -ForegroundColor Green
            
            $iosUrlScheme = $googleSignInPlugin[1].iosUrlScheme
            if ($iosUrlScheme) {
                Write-Host "   ✅ iOS URL Scheme: $iosUrlScheme" -ForegroundColor Green
            }
        } else {
            Write-Host "   ❌ Thiếu plugin @react-native-google-signin/google-signin" -ForegroundColor Red
            $allGood = $false
        }
        
        # Kiểm tra googleServicesFile
        if ($appJson.expo.android.googleServicesFile) {
            Write-Host "   ✅ googleServicesFile: $($appJson.expo.android.googleServicesFile)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Chưa cấu hình googleServicesFile trong android config" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "   ❌ Lỗi đọc file: $_" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Không tìm thấy file app.json" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# 4. Kiểm tra package.json
Write-Host "4. Kiểm tra package dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        
        $googleSigninPkg = $packageJson.dependencies.'@react-native-google-signin/google-signin'
        
        if ($googleSigninPkg) {
            Write-Host "   ✅ @react-native-google-signin/google-signin: $googleSigninPkg" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Thiếu package @react-native-google-signin/google-signin" -ForegroundColor Red
            Write-Host "      Chạy: npm install @react-native-google-signin/google-signin" -ForegroundColor Yellow
            $allGood = $false
        }
        
    } catch {
        Write-Host "   ❌ Lỗi đọc file: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  ✅ Cấu hình OK!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Nếu vẫn lỗi 'apiClient is null' trong APK production:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Lấy SHA-1 fingerprint của release keystore:" -ForegroundColor White
    Write-Host "   .\get-sha1-fingerprint.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Thêm SHA-1 vào Firebase Console:" -ForegroundColor White
    Write-Host "   https://console.firebase.google.com" -ForegroundColor Cyan
    Write-Host "   → Project Settings → General → Android app" -ForegroundColor White
    Write-Host "   → SHA certificate fingerprints → Add fingerprint" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Tải lại google-services.json mới" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Rebuild APK:" -ForegroundColor White
    Write-Host "   eas build -p android --profile production" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "  ❌ Có lỗi cấu hình!" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vui lòng sửa các lỗi trên và chạy lại script." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
