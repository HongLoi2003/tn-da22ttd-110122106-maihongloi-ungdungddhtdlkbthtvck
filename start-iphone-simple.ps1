# Simple script to start Expo for iPhone testing
# No Vietnamese characters to avoid encoding issues

Write-Host "=== START EXPO FOR IPHONE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1: Install 'Expo Go' app from App Store on your iPhone" -ForegroundColor Yellow
Write-Host ""

$ready = Read-Host "Ready to start? (y/n)"
if ($ready -ne "y") {
    exit 1
}

Write-Host ""
Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host ""

# Clear cache
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Choose connection method:" -ForegroundColor Cyan
Write-Host "1. LAN (faster - same WiFi required)" -ForegroundColor White
Write-Host "2. TUNNEL (slower - works over internet)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select (1 or 2)"

Write-Host ""

if ($choice -eq "2") {
    Write-Host "Starting with tunnel mode..." -ForegroundColor Yellow
    npx expo start --tunnel
} else {
    Write-Host "Starting with LAN mode..." -ForegroundColor Yellow
    npx expo start
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HOW TO CONNECT YOUR IPHONE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "METHOD 1 (Easiest):" -ForegroundColor Green
Write-Host "  1. Open Camera app on iPhone" -ForegroundColor White
Write-Host "  2. Scan the QR code above" -ForegroundColor White
Write-Host "  3. Tap 'Open in Expo Go'" -ForegroundColor White
Write-Host ""
Write-Host "METHOD 2:" -ForegroundColor Green
Write-Host "  1. Open Expo Go app on iPhone" -ForegroundColor White
Write-Host "  2. Tap 'Enter URL manually'" -ForegroundColor White
Write-Host "  3. Enter the URL shown above" -ForegroundColor White
Write-Host ""
Write-Host "Your app will load on iPhone!" -ForegroundColor Green
Write-Host "Edit code -> Auto reload on iPhone" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
