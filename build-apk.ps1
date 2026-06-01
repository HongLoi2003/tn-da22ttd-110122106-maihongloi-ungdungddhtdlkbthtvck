# Script build APK - Health Care
Write-Host "`n=== BUILD APK - HEALTH CARE ===" -ForegroundColor Green

# Tìm Java
Write-Host "Đang tìm Java..." -ForegroundColor Yellow
$javaPath = Get-ChildItem "C:\Program Files" -Recurse -Filter "java.exe" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like "*jdk*" } | Select-Object -First 1

if ($javaPath) {
    $env:JAVA_HOME = $javaPath.Directory.Parent.FullName
    Write-Host "✓ Tìm thấy Java: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "❌ Không tìm thấy Java!" -ForegroundColor Red
    Write-Host "Cài Java JDK 17: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    exit 1
}

# Build APK
Write-Host "`nBắt đầu build APK..." -ForegroundColor Yellow
Write-Host "Thời gian dự kiến: 10-20 phút`n" -ForegroundColor Cyan

Set-Location android
.\gradlew clean
.\gradlew assembleRelease
Set-Location ..

# Kiểm tra kết quả
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "`n=== BUILD THÀNH CÔNG! ===" -ForegroundColor Green
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "Kích thước: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    
    # Copy ra Desktop
    Copy-Item $apkPath -Destination "$env:USERPROFILE\Desktop\HealthCare.apk" -Force
    Write-Host "✓ Đã copy APK ra Desktop!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ BUILD THẤT BẠI!`n" -ForegroundColor Red
}
