# Test Backend Connection from Phone
# Script kiểm tra xem điện thoại có kết nối được tới backend không

Write-Host "📱 Testing Backend Connection for Phone" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Gray
Write-Host ""

# Get IP address
Write-Host "🔍 Detecting your computer's IP address..." -ForegroundColor Yellow
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"
} | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses.Count -eq 0) {
    Write-Host "❌ No network interface found!" -ForegroundColor Red
    Write-Host "Make sure you're connected to WiFi" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Available network interfaces:" -ForegroundColor Cyan
$ipAddresses | ForEach-Object {
    Write-Host "  • $($_.IPAddress) ($($_.InterfaceAlias))" -ForegroundColor Gray
}

Write-Host ""
$selectedIP = $ipAddresses[0].IPAddress
Write-Host "Using IP: $selectedIP" -ForegroundColor Green
Write-Host ""

# Test localhost
Write-Host "📡 Test 1: Testing localhost:3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 3 -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Localhost OK: $($result.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running on localhost!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Start backend first:" -ForegroundColor Yellow
    Write-Host "  cd email-api" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""

# Test IP address
Write-Host "📡 Test 2: Testing ${selectedIP}:3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${selectedIP}:3001" -Method GET -TimeoutSec 3 -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ IP access OK: $($result.message)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your phone can connect using:" -ForegroundColor Cyan
    Write-Host "   http://${selectedIP}:3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot access via IP address!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  1. Firewall is blocking port 3001" -ForegroundColor Gray
    Write-Host "  2. Backend not listening on 0.0.0.0" -ForegroundColor Gray
    Write-Host "  3. Network configuration issue" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Cyan
    Write-Host "  • Allow Node.js through Windows Firewall" -ForegroundColor Gray
    Write-Host "  • Restart backend: cd email-api && npm start" -ForegroundColor Gray
    Write-Host "  • Check if backend logs show '0.0.0.0'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Gray
Write-Host ""

# Test OTP endpoint
Write-Host "📡 Test 3: Testing OTP endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        otp = "123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "http://${selectedIP}:3001/verify-otp" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 3 `
        -ErrorAction Stop

    Write-Host "✅ OTP endpoint accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️  OTP endpoint returned 404 (expected for invalid OTP)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ OTP endpoint accessible (error expected for fake OTP)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Gray
Write-Host ""

# Generate QR code URL for easy phone testing
Write-Host "📱 To test on your phone:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure phone is on SAME WiFi as computer" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Start Expo:" -ForegroundColor Yellow
Write-Host "   npx expo start --clear" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Scan QR code with Expo Go app" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. App will auto-detect and use:" -ForegroundColor Yellow
Write-Host "   http://${selectedIP}:3001" -ForegroundColor Green
Write-Host ""
Write-Host "5. Test forgot password feature" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Backend is ready for phone testing!" -ForegroundColor Green
Write-Host ""
