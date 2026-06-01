Write-Host "=== Build Android APK ===" -ForegroundColor Cyan
Write-Host ""

# Check EAS CLI
Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
try {
    $easVersion = eas --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: EAS CLI not found!" -ForegroundColor Red
        Write-Host "Install with: npm install -g eas-cli" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "OK: EAS CLI version $easVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: EAS CLI not found!" -ForegroundColor Red
    Write-Host "Install with: npm install -g eas-cli" -ForegroundColor Yellow
    exit 1
}

# Check google-services.json
Write-Host "`nChecking google-services.json..." -ForegroundColor Yellow
if (!(Test-Path "android/app/google-services.json")) {
    Write-Host "WARNING: google-services.json not found!" -ForegroundColor Yellow
    if (Test-Path "android/app/google-services (1).json") {
        Write-Host "Copying from backup..." -ForegroundColor Yellow
        Copy-Item "android/app/google-services (1).json" "android/app/google-services.json"
        Write-Host "OK: Copied successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: No google-services.json found!" -ForegroundColor Red
        Write-Host "Please download from Firebase Console" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "OK: google-services.json exists" -ForegroundColor Green
}

# Ask for build profile
Write-Host "`n=== Select Build Profile ===" -ForegroundColor Cyan
Write-Host "1. Production (Release build, optimized)" -ForegroundColor White
Write-Host "2. Preview (Test build, faster)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2, default: 1)"

if ($choice -eq "2") {
    $profile = "preview"
    Write-Host "`nBuilding with PREVIEW profile..." -ForegroundColor Yellow
} else {
    $profile = "production"
    Write-Host "`nBuilding with PRODUCTION profile..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting build..." -ForegroundColor Green
Write-Host "This will take about 10-15 minutes." -ForegroundColor Yellow
Write-Host "You can close this window and check progress at:" -ForegroundColor Yellow
Write-Host "https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/" -ForegroundColor Cyan
Write-Host ""

# Run build
eas build --platform android --profile $profile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Build Started Successfully ===" -ForegroundColor Green
    Write-Host "Check progress at: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/" -ForegroundColor Cyan
} else {
    Write-Host "`n=== Build Failed ===" -ForegroundColor Red
    Write-Host "Check the error message above" -ForegroundColor Yellow
    Write-Host "See BUILD_ANDROID_NGAY.md for troubleshooting" -ForegroundColor Yellow
}
