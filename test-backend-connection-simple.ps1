# Test Backend Connection
# Kiểm tra backend server có đang chạy không

Write-Host "🔍 Testing Backend Connection..." -ForegroundColor Cyan
Write-Host ""

# Test localhost:3001
Write-Host "📡 Testing http://localhost:3001 ..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5 -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.status -eq "OK") {
        Write-Host "✅ Backend server is RUNNING!" -ForegroundColor Green
        Write-Host "   Status: $($result.status)" -ForegroundColor Gray
        Write-Host "   Message: $($result.message)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎯 Backend is ready for forgot password feature!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend responded but status is not OK" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend server is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 To start backend server:" -ForegroundColor Yellow
    Write-Host "   1. Open a NEW terminal" -ForegroundColor Gray
    Write-Host "   2. cd email-api" -ForegroundColor Cyan
    Write-Host "   3. npm install" -ForegroundColor Cyan
    Write-Host "   4. npm start" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   You should see: '✅ Server running on http://localhost:3001'" -ForegroundColor Gray
}

Write-Host ""

# Kiểm tra địa chỉ IP của máy (cho điện thoại thật)
Write-Host "📱 Your computer's IP addresses:" -ForegroundColor Yellow
Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | 
    Select-Object -First 3 | 
    ForEach-Object {
        Write-Host "   - $($_.IPAddress)" -ForegroundColor Cyan
    }

Write-Host ""
Write-Host "💡 If testing on real phone, use: http://YOUR_IP:3001" -ForegroundColor Gray
