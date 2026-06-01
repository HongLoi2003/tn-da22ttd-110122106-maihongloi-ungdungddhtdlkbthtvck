Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TÌM VÀ FIX ANDROID_HOME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Các đường dẫn phổ biến của Android SDK
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "C:\Android\Sdk",
    "D:\Android\Sdk",
    "$env:USERPROFILE\Android\Sdk",
    "C:\Program Files\Android\Sdk",
    "C:\Program Files (x86)\Android\Sdk"
)

Write-Host "🔍 Đang tìm Android SDK..." -ForegroundColor Yellow
Write-Host ""

$foundPath = $null
foreach ($path in $possiblePaths) {
    Write-Host "Kiểm tra: $path" -ForegroundColor Gray
    if (Test-Path $path) {
        Write-Host "✅ Tìm thấy Android SDK tại: $path" -ForegroundColor Green
        $foundPath = $path
        break
    }
}

Write-Host ""

if ($foundPath) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ TÌM THẤY ANDROID SDK" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Đường dẫn: $foundPath" -ForegroundColor White
    Write-Host ""
    
    # Set cho session hiện tại
    $env:ANDROID_HOME = $foundPath
    $env:PATH = "$foundPath\platform-tools;$foundPath\tools;$env:PATH"
    
    Write-Host "✅ Đã set ANDROID_HOME cho session hiện tại" -ForegroundColor Green
    Write-Host ""
    
    # Hỏi có muốn set vĩnh viễn không
    $response = Read-Host "Bạn có muốn set ANDROID_HOME vĩnh viễn? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        try {
            [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $foundPath, "User")
            Write-Host "✅ Đã set ANDROID_HOME vĩnh viễn!" -ForegroundColor Green
            Write-Host "⚠️ Vui lòng RESTART terminal để áp dụng" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Không thể set biến môi trường. Vui lòng chạy PowerShell as Administrator" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "🚀 BƯỚC TIẾP THEO" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Restart terminal (nếu set vĩnh viễn)" -ForegroundColor White
    Write-Host "2. Chạy: npx expo run:android" -ForegroundColor White
    Write-Host "3. App sẽ build và cài lên điện thoại/emulator" -ForegroundColor White
    Write-Host "4. Test Google Sign-In" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ KHÔNG TÌM THẤY ANDROID SDK" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bạn cần cài Android Studio:" -ForegroundColor Yellow
    Write-Host "1. Download: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "2. Cài đặt Android Studio" -ForegroundColor White
    Write-Host "3. Mở Android Studio → Tools → SDK Manager" -ForegroundColor White
    Write-Host "4. Cài Android SDK (API 34 hoặc mới nhất)" -ForegroundColor White
    Write-Host "5. Chạy lại script này" -ForegroundColor White
    Write-Host ""
    Write-Host "HOẶC:" -ForegroundColor Cyan
    Write-Host "Đợi 2 ngày để EAS quota reset và dùng EAS Build" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Read-Host "Nhấn Enter để thoát"
