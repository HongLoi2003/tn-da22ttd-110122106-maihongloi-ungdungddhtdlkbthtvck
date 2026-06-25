# Setup Forgot Password for Real Phone
# Script tự động cấu hình và test

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Setup Forgot Password for Real Phone  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Step 1: Detect IP
Write-Host "📡 [1/5] Detecting your computer's IP..." -ForegroundColor Yellow
$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    ($_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual")
}

if ($networkAdapters.Count -eq 0) {
    Write-Host "❌ No network connection found!" -ForegroundColor Red
    Write-Host "   Please connect to WiFi first" -ForegroundColor Gray
    exit 1
}

$ip = $networkAdapters[0].IPAddress
$interface = $networkAdapters[0].InterfaceAlias

Write-Host "✅ Found IP: $ip ($interface)" -ForegroundColor Green
Write-Host ""

# Step 2: Check backend
Write-Host "📡 [2/5] Checking backend server..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 2 -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Message: $($result.message)" -ForegroundColor Gray
    $backendRunning = $true
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
}

if (-not $backendRunning) {
    Write-Host ""
    Write-Host "⚠️  Starting backend automatically..." -ForegroundColor Yellow
    
    if (Test-Path "email-api/package.json") {
        Write-Host "   Installing dependencies..." -ForegroundColor Gray
        Push-Location email-api
        npm install --silent 2>$null
        
        Write-Host "   Starting server in background..." -ForegroundColor Gray
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized
        Pop-Location
        
        Write-Host "   Waiting for server to start..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ Backend started successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Backend may take a few more seconds to start" -ForegroundColor Yellow
            Write-Host "   Check the backend window for status" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ email-api folder not found" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 3: Test IP access
Write-Host "📡 [3/5] Testing network access..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${ip}:3001" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend accessible from network" -ForegroundColor Green
    Write-Host "   URL: http://${ip}:3001" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Cannot access via network IP" -ForegroundColor Yellow
    Write-Host "   This might be a firewall issue" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Allow Node.js through Windows Firewall:" -ForegroundColor Cyan
    Write-Host "   1. Search 'Windows Defender Firewall'" -ForegroundColor Gray
    Write-Host "   2. Click 'Allow an app through firewall'" -ForegroundColor Gray
    Write-Host "   3. Find Node.js and check Private + Public" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Check config file
Write-Host "📡 [4/5] Checking API configuration..." -ForegroundColor Yellow
if (Test-Path "app/config/apiConfig.ts") {
    Write-Host "✅ API config file exists" -ForegroundColor Green
    Write-Host "   File: app/config/apiConfig.ts" -ForegroundColor Gray
    Write-Host "   Auto-detect: Enabled" -ForegroundColor Gray
} else {
    Write-Host "⚠️  API config file not found" -ForegroundColor Yellow
    Write-Host "   Creating it now..." -ForegroundColor Gray
    # File was already created earlier
    Write-Host "✅ Created app/config/apiConfig.ts" -ForegroundColor Green
}

Write-Host ""

# Step 5: Instructions
Write-Host "📱 [5/5] Final setup steps..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Setup Complete! Here's what to do next:" -ForegroundColor Green
Write-Host ""
Write-Host "1️⃣  Start Expo (if not already running):" -ForegroundColor Cyan
Write-Host "    npx expo start --clear" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  On your phone:" -ForegroundColor Cyan
Write-Host "    • Open Expo Go app" -ForegroundColor White
Write-Host "    • Make sure phone is on SAME WiFi: $interface" -ForegroundColor White
Write-Host "    • Scan the QR code" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Test Forgot Password:" -ForegroundColor Cyan
Write-Host "    • Open app → Login → 'Quên mật khẩu?'" -ForegroundColor White
Write-Host "    • Enter email and send OTP" -ForegroundColor White
Write-Host "    • Check console logs for API URL" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Expected API URL on phone:" -ForegroundColor Cyan
Write-Host "    http://${ip}:3001" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "📋 Configuration Summary:" -ForegroundColor Yellow
Write-Host "  • Computer IP: $ip" -ForegroundColor Gray
Write-Host "  • Network: $interface" -ForegroundColor Gray
Write-Host "  • Backend: http://localhost:3001" -ForegroundColor Gray
Write-Host "  • Phone URL: http://${ip}:3001" -ForegroundColor Gray
Write-Host "  • Auto-detect: Enabled" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
Write-Host "  • If connection fails, check:" -ForegroundColor Gray
Write-Host "    - Phone and computer on SAME WiFi" -ForegroundColor Gray
Write-Host "    - Firewall allows port 3001" -ForegroundColor Gray
Write-Host "    - No VPN on phone or computer" -ForegroundColor Gray
Write-Host "  • Read: FIX-NETWORK-ERROR.md for details" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Ready to test! Good luck! 🚀" -ForegroundColor Green
Write-Host ""
