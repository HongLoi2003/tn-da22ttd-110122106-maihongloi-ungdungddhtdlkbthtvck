# Clear Metro Bundler Cache Script
Write-Host "🧹 Clearing Metro Bundler Cache..." -ForegroundColor Cyan

# Stop any running Metro processes
Write-Host "`n1️⃣ Stopping Metro processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" } | Stop-Process -Force
Start-Sleep -Seconds 1

# Clear Metro cache
Write-Host "`n2️⃣ Clearing Metro cache..." -ForegroundColor Yellow
if (Test-Path ".\.metro") {
    Remove-Item -Recurse -Force ".\.metro"
    Write-Host "✅ Removed .metro folder" -ForegroundColor Green
}

# Clear node_modules/.cache
Write-Host "`n3️⃣ Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path ".\node_modules\.cache") {
    Remove-Item -Recurse -Force ".\node_modules\.cache"
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
}

# Clear Expo cache
Write-Host "`n4️⃣ Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Recurse -Force "$env:TEMP\metro-*"
    Write-Host "✅ Cleared Expo temp cache" -ForegroundColor Green
}

# Clear watchman cache (if watchman is installed)
Write-Host "`n5️⃣ Clearing Watchman cache..." -ForegroundColor Yellow
try {
    watchman watch-del-all 2>$null
    Write-Host "✅ Cleared Watchman cache" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Watchman not installed (optional)" -ForegroundColor Gray
}

Write-Host "`n✨ Cache cleared! Now run:" -ForegroundColor Green
Write-Host "   npx expo start -c" -ForegroundColor Cyan
Write-Host "   or" -ForegroundColor Gray
Write-Host "   npm start -- --clear" -ForegroundColor Cyan
