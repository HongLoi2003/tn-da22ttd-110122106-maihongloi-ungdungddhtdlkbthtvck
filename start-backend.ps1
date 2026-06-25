# Script để start backend server cho forgot password
Write-Host "🚀 Starting Backend Server for Password Reset..." -ForegroundColor Cyan

# Check if node_modules exists in email-api
if (-not (Test-Path "email-api/node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Set-Location email-api
    npm install
    Set-Location ..
}

# Check if serviceAccountKey.json exists
if (-not (Test-Path "serviceAccountKey.json")) {
    Write-Host "❌ Error: serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "Please download it from Firebase Console and place it in the root directory" -ForegroundColor Yellow
    exit 1
}

# Start server
Write-Host "✅ Starting server on port 3001..." -ForegroundColor Green
Set-Location email-api
node server.js
