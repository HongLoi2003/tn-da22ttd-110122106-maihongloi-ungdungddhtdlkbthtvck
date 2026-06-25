# Script để restart backend server

Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan

# Stop all node processes running server.js
Write-Host "🛑 Stopping existing server..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*email-api*" -or $_.CommandLine -like "*server.js*"
} | Stop-Process -Force

Write-Host "⏱️  Waiting for processes to stop..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Start server again
Write-Host "✅ Starting server..." -ForegroundColor Green
Set-Location email-api
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"
Set-Location ..

Write-Host "✅ Backend server is restarting..." -ForegroundColor Green
Write-Host "📝 Check the new window for server logs" -ForegroundColor Cyan
