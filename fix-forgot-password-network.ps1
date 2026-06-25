# Fix Network Connection Issue for Forgot Password
# Hướng dẫn sửa lỗi "Network request failed"

Write-Host "🔧 Fixing Forgot Password Network Issue" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Gray
Write-Host ""

# Bước 1: Lấy IP của máy tính
Write-Host "📡 Step 1: Getting your computer's IP address..." -ForegroundColor Yellow

$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "✅ Your IP Address: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not detect IP address automatically" -ForegroundColor Yellow
    Write-Host "Please find your IP manually:" -ForegroundColor Gray
    Write-Host "  Windows: ipconfig" -ForegroundColor Cyan
    Write-Host "  Mac/Linux: ifconfig or ip addr" -ForegroundColor Cyan
    Write-Host ""
    $ipAddress = Read-Host "Enter your IP address (e.g. 192.168.1.100)"
}

Write-Host ""

# Bước 2: Kiểm tra backend
Write-Host "📡 Step 2: Checking backend server..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend server is running on localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start backend:" -ForegroundColor Yellow
    Write-Host "  cd email-api" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Enter after starting backend..." -ForegroundColor Gray
    Read-Host
}

Write-Host ""

# Bước 3: Kiểm tra firewall
Write-Host "📡 Step 3: Checking firewall..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure port 3001 is allowed in firewall" -ForegroundColor Yellow
Write-Host ""
Write-Host "To allow Node.js through Windows Firewall:" -ForegroundColor Gray
Write-Host "  1. Open Windows Defender Firewall" -ForegroundColor Cyan
Write-Host "  2. Click 'Allow an app through firewall'" -ForegroundColor Cyan
Write-Host "  3. Find Node.js and check both Private and Public" -ForegroundColor Cyan
Write-Host ""

# Bước 4: Hướng dẫn
Write-Host "📱 Step 4: Configure your app" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPTION 1: Use automatic IP detection (RECOMMENDED)" -ForegroundColor Cyan
Write-Host "  File app/config/apiConfig.ts đã được tạo sẵn" -ForegroundColor Gray
Write-Host "  App sẽ tự động detect IP từ Expo" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2: Manual configuration" -ForegroundColor Cyan
Write-Host "  1. Open: app/config/apiConfig.ts" -ForegroundColor Gray
Write-Host "  2. Replace production URL if needed" -ForegroundColor Gray
Write-Host ""

# Bước 5: Test connection
Write-Host "📡 Step 5: Testing connection from your IP..." -ForegroundColor Yellow
Write-Host ""

try {
    $testUrl = "http://${ipAddress}:3001"
    Write-Host "Testing: $testUrl" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is accessible from: $testUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot access backend from: $testUrl" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  • Firewall blocking connection" -ForegroundColor Gray
    Write-Host "  • Backend only listening on localhost (not 0.0.0.0)" -ForegroundColor Gray
    Write-Host "  • Phone and computer not on same WiFi network" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Gray
Write-Host ""

# Bước 6: Final instructions
Write-Host "🎯 Final Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure backend is running:" -ForegroundColor Yellow
Write-Host "   cd email-api && npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Make sure phone and computer on SAME WiFi" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Restart Expo app:" -ForegroundColor Yellow
Write-Host "   npx expo start --clear" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Open app on phone (not emulator)" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Try forgot password feature" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Expected API URL on real device:" -ForegroundColor Cyan
Write-Host "   http://${ipAddress}:3001" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Configuration complete!" -ForegroundColor Green
Write-Host ""
