Write-Host "Building APK with new google-services.json..." -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME correctly
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
Write-Host ""

Set-Location android
.\gradlew assembleRelease
Set-Location ..

$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host ""
    Write-Host "BUILD THANH CONG!" -ForegroundColor Green
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "Kich thuoc: $([math]::Round($apkSize, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "APK tai: $apkPath" -ForegroundColor Yellow
    Write-Host ""
    
    # Copy ra Desktop
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    Copy-Item $apkPath -Destination "$desktopPath\HealthCare-GoogleLogin-Fixed.apk" -Force
    Write-Host "Da copy APK ra Desktop: HealthCare-GoogleLogin-Fixed.apk" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tiep theo:" -ForegroundColor Yellow
    Write-Host "1. Cai APK nay len thiet bi Android" -ForegroundColor White
    Write-Host "2. Thu dang nhap bang Google" -ForegroundColor White
    Write-Host "3. Khong con loi 'apiClient is null'!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "BUILD THAT BAI!" -ForegroundColor Red
    Write-Host "Xem logs phia tren de biet loi." -ForegroundColor Yellow
    Write-Host ""
}
