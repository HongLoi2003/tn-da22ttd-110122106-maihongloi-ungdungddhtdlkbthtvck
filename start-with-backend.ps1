# Script để start cả backend và React Native app

Write-Host "🚀 Starting HeartCare with Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if serviceAccountKey.json exists
if (-not (Test-Path "serviceAccountKey.json")) {
    Write-Host "❌ Error: serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "Please download it from Firebase Console" -ForegroundColor Yellow
    exit 1
}

# Install email-api dependencies if needed
if (-not (Test-Path "email-api/node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location email-api
    npm install
    Set-Location ..
    Write-Host ""
}

# Start backend in new window
Write-Host "🔧 Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; cd email-api; node server.js"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test backend connection
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Starting React Native..." -ForegroundColor Green
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "  - Press 'a' for Android" -ForegroundColor White
Write-Host "  - Press 'i' for iOS" -ForegroundColor White
Write-Host ""

# Start React Native
npm start
