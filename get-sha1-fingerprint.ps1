#!/usr/bin/env pwsh
# Script lấy SHA-1 fingerprint từ keystore

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Get SHA-1 Fingerprint for Google Sign-In" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra keytool có sẵn không
$keytoolPath = Get-Command keytool -ErrorAction SilentlyContinue

if (-not $keytoolPath) {
    Write-Host "❌ Không tìm thấy keytool!" -ForegroundColor Red
    Write-Host ""
    Write-Host "keytool là công cụ của Java JDK." -ForegroundColor Yellow
    Write-Host "Vui lòng cài đặt Java JDK và thêm vào PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Download JDK: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Tìm thấy keytool: $($keytoolPath.Source)" -ForegroundColor Green
Write-Host ""

# Menu chọn keystore
Write-Host "Chọn keystore muốn lấy SHA-1:" -ForegroundColor Yellow
Write-Host "1. Debug keystore (development)" -ForegroundColor White
Write-Host "2. Release keystore (production - từ EAS)" -ForegroundColor White
Write-Host "3. Custom keystore (nhập đường dẫn)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1-3)"

$keystorePath = ""
$keystorePassword = ""
$keystoreAlias = ""

switch ($choice) {
    "1" {
        # Debug keystore
        $keystorePath = "$env:USERPROFILE\.android\debug.keystore"
        $keystorePassword = "android"
        $keystoreAlias = "androiddebugkey"
        
        if (-not (Test-Path $keystorePath)) {
            Write-Host "❌ Không tìm thấy debug keystore tại: $keystorePath" -ForegroundColor Red
            Write-Host "Tạo debug keystore bằng cách chạy: npx react-native run-android" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host ""
        Write-Host "📱 Đang lấy SHA-1 từ DEBUG keystore..." -ForegroundColor Cyan
    }
    
    "2" {
        # Release keystore từ EAS
        Write-Host ""
        Write-Host "📦 Lấy keystore từ EAS Build..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Bước 1: Tải keystore từ EAS:" -ForegroundColor Yellow
        Write-Host "  eas credentials" -ForegroundColor White
        Write-Host "  → Chọn: Android → Production → Download keystore" -ForegroundColor White
        Write-Host ""
        
        $keystorePath = Read-Host "Nhập đường dẫn đến file keystore đã tải (VD: production-keystore.jks)"
        
        if (-not (Test-Path $keystorePath)) {
            Write-Host "❌ Không tìm thấy file: $keystorePath" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        $keystorePassword = Read-Host "Nhập password của keystore (từ EAS credentials)" -AsSecureString
        $keystorePassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))
        
        Write-Host ""
        $keystoreAlias = Read-Host "Nhập alias (thường là 'key0' hoặc để trống để auto-detect)"
        
        if ([string]::IsNullOrWhiteSpace($keystoreAlias)) {
            $keystoreAlias = ""
        }
    }
    
    "3" {
        # Custom keystore
        Write-Host ""
        $keystorePath = Read-Host "Nhập đường dẫn đến keystore"
        
        if (-not (Test-Path $keystorePath)) {
            Write-Host "❌ Không tìm thấy file: $keystorePath" -ForegroundColor Red
            exit 1
        }
        
        $keystorePassword = Read-Host "Nhập password" -AsSecureString
        $keystorePassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))
        
        $keystoreAlias = Read-Host "Nhập alias (hoặc để trống)"
        
        if ([string]::IsNullOrWhiteSpace($keystoreAlias)) {
            $keystoreAlias = ""
        }
    }
    
    default {
        Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Thông tin Keystore" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Chạy keytool
try {
    if ([string]::IsNullOrWhiteSpace($keystoreAlias)) {
        # List tất cả aliases
        $output = & keytool -list -v -keystore $keystorePath -storepass $keystorePassword 2>&1
    } else {
        # List alias cụ thể
        $output = & keytool -list -v -keystore $keystorePath -alias $keystoreAlias -storepass $keystorePassword 2>&1
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi đọc keystore!" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }
    
    # Parse output để lấy SHA-1
    $sha1 = ""
    $sha256 = ""
    $md5 = ""
    
    foreach ($line in $output) {
        if ($line -match "SHA1:\s*(.+)") {
            $sha1 = $matches[1].Trim()
        }
        if ($line -match "SHA256:\s*(.+)") {
            $sha256 = $matches[1].Trim()
        }
        if ($line -match "MD5:\s*(.+)") {
            $md5 = $matches[1].Trim()
        }
    }
    
    if ([string]::IsNullOrWhiteSpace($sha1)) {
        Write-Host "❌ Không tìm thấy SHA-1 fingerprint!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Output từ keytool:" -ForegroundColor Yellow
        Write-Host $output
        exit 1
    }
    
    # Hiển thị kết quả
    Write-Host "✅ Thành công!" -ForegroundColor Green
    Write-Host ""
    
    if ($md5) {
        Write-Host "MD5:    $md5" -ForegroundColor White
    }
    
    Write-Host "SHA-1:  $sha1" -ForegroundColor Yellow
    
    if ($sha256) {
        Write-Host "SHA-256: $sha256" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  Hướng dẫn thêm vào Firebase" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Mở Firebase Console:" -ForegroundColor White
    Write-Host "   https://console.firebase.google.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Chọn project: hearthcare-847b3" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Vào Project Settings (⚙️) → General" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Tìm app Android: com.maihongloi23.heatlecare" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Scroll xuống 'SHA certificate fingerprints'" -ForegroundColor White
    Write-Host ""
    Write-Host "6. Click 'Add fingerprint' và dán SHA-1:" -ForegroundColor White
    Write-Host ""
    Write-Host "   $sha1" -ForegroundColor Green
    Write-Host ""
    Write-Host "7. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "8. Tải lại google-services.json và rebuild APK" -ForegroundColor White
    Write-Host ""
    
    # Copy SHA-1 vào clipboard nếu có thể
    try {
        Set-Clipboard -Value $sha1
        Write-Host "✅ SHA-1 đã được copy vào clipboard!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "⚠️  Không thể copy vào clipboard, vui lòng copy thủ công." -ForegroundColor Yellow
        Write-Host ""
    }
    
} catch {
    Write-Host "❌ Lỗi: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
