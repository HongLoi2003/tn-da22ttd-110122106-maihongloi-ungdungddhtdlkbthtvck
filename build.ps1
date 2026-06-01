Write-Host "=== BUILD APK ===" -ForegroundColor Green

# Find Java
$javaPath = Get-ChildItem "C:\Program Files" -Recurse -Filter "java.exe" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like "*jdk*" } | Select-Object -First 1

if ($javaPath) {
    $env:JAVA_HOME = $javaPath.Directory.Parent.FullName
    Write-Host "Found Java: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "Java not found! Install JDK 17" -ForegroundColor Red
    exit 1
}

# Build
Write-Host "Building APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
.\gradlew assembleRelease
Set-Location ..

# Check result
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "BUILD SUCCESS!" -ForegroundColor Green
    Copy-Item $apkPath -Destination "$env:USERPROFILE\Desktop\HealthCare.apk" -Force
    Write-Host "APK copied to Desktop!" -ForegroundColor Green
} else {
    Write-Host "BUILD FAILED!" -ForegroundColor Red
}
