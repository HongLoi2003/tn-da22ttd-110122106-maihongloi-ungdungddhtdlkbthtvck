# Script để setup network cho Android emulator
Write-Host "🔧 Setting up Android Emulator Network..." -ForegroundColor Cyan

# Check if adb is available
$adbPath = Get-Command adb -ErrorAction SilentlyContinue

if (-not $adbPath) {
    Write-Host "❌ ADB not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Android SDK Platform-Tools" -ForegroundColor Yellow
    Write-Host "Or add it to PATH: C:\Users\<YourUser>\AppData\Local\Android\Sdk\platform-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ ADB found at: $($adbPath.Source)" -ForegroundColor Green

# Check if device is connected
Write-Host "`n📱 Checking connected devices..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "emulator|device" | Where-Object { $_ -notmatch "List of devices" }

if (-not $devices) {
    Write-Host "❌ No Android device/emulator found!" -ForegroundColor Red
    Write-Host "Please start an Android emulator first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Android device found" -ForegroundColor Green

# Setup reverse port forwarding
Write-Host "`n🔗 Setting up port forwarding..." -ForegroundColor Yellow
Write-Host "   Mapping emulator:3001 -> localhost:3001" -ForegroundColor White

$result = adb reverse tcp:3001 tcp:3001

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Port forwarding successful!" -ForegroundColor Green
    Write-Host "`n📝 Now you can use:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3001 (instead of 10.0.2.2:3001)" -ForegroundColor White
    Write-Host "`nOr keep using 10.0.2.2:3001 - both will work!" -ForegroundColor Green
} else {
    Write-Host "❌ Port forwarding failed" -ForegroundColor Red
    Write-Host "Using fallback: 10.0.2.2:3001" -ForegroundColor Yellow
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
