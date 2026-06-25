# ============================================
# START APP FOR IPHONE - FREE WITH EXPO GO
# ============================================

Write-Host "=== START EXPO FOR IPHONE (FREE) ===" -ForegroundColor Cyan
Write-Host ""

# Check Expo Go on iPhone
Write-Host "STEP 1: Install Expo Go on iPhone" -ForegroundColor Yellow
Write-Host "   1. Open App Store on iPhone" -ForegroundColor White
Write-Host "   2. Search 'Expo Go'" -ForegroundColor White
Write-Host "   3. Download (free)" -ForegroundColor White
Write-Host ""

$ready = Read-Host "Expo Go installed? (y/n)"
if ($ready -ne "y") {
    Write-Host "Please install Expo Go first, then run this script again" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Great! Starting server..." -ForegroundColor Green
Write-Host ""

# Clear cache
Write-Host "Clearing cache..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue

# Check network
Write-Host ""
Write-Host "Checking network..." -ForegroundColor Yellow
try {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback" } | Select-Object -First 1).IPAddress
    Write-Host "   Your IP: $localIP" -ForegroundColor White
} catch {
    Write-Host "   Could not get IP" -ForegroundColor Gray
}
Write-Host "   iPhone and Windows must be on same WiFi!" -ForegroundColor Yellow
Write-Host ""

# Start options
Write-Host "CHOOSE CONNECTION METHOD:" -ForegroundColor Cyan
Write-Host "1. LAN - Fastest (same WiFi)" -ForegroundColor White
Write-Host "2. TUNNEL - Over internet (if LAN fails)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose (1/2)"

Write-Host ""
Write-Host "STARTING SERVER..." -ForegroundColor Green
Write-Host ""

if ($choice -eq "2") {
    Write-Host "Tunnel mode may be 1-2 seconds slower" -ForegroundColor Yellow
    Write-Host "Starting with tunnel mode..." -ForegroundColor Cyan
    Write-Host ""
    
    npx expo start --tunnel
} else {
    Write-Host "Starting with LAN mode..." -ForegroundColor Cyan
    Write-Host ""
    
    npx expo start
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HOW TO CONNECT IPHONE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "METHOD 1 (Easiest):" -ForegroundColor Green
Write-Host "  1. Open Camera app on iPhone" -ForegroundColor White
Write-Host "  2. Scan QR code above" -ForegroundColor White
Write-Host "  3. Tap 'Open in Expo Go'" -ForegroundColor White
Write-Host ""
Write-Host "METHOD 2:" -ForegroundColor Green
Write-Host "  1. Open Expo Go app on iPhone" -ForegroundColor White
Write-Host "  2. Tap 'Enter URL manually'" -ForegroundColor White
Write-Host "  3. Enter URL shown above" -ForegroundColor White
Write-Host ""
Write-Host "App will load and run on iPhone!" -ForegroundColor Green
Write-Host "Edit code -> App auto reloads" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
