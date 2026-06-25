# Script to fix useAuth error by clearing all caches and restarting

Write-Host "=== Fixing useAuth Error ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running Metro bundler
Write-Host "Step 1: Stopping Metro bundler..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" } | Stop-Process -Force
Write-Host "✓ Metro bundler stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Clear Expo cache
Write-Host "Step 2: Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "✓ Cleared .expo folder" -ForegroundColor Green
} else {
    Write-Host "  .expo folder not found (already clean)" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Clear node_modules cache
Write-Host "Step 3: Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Cleared node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "  node_modules/.cache not found (already clean)" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Clear Metro bundler cache
Write-Host "Step 4: Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Recurse -Force "$env:TEMP\metro-*"
    Write-Host "✓ Cleared Metro temp files" -ForegroundColor Green
}
if (Test-Path "$env:TEMP\haste-map-*") {
    Remove-Item -Recurse -Force "$env:TEMP\haste-map-*"
    Write-Host "✓ Cleared Haste map cache" -ForegroundColor Green
}
Write-Host ""

# Step 5: Clear watchman cache (if installed)
Write-Host "Step 5: Clearing Watchman cache..." -ForegroundColor Yellow
try {
    watchman watch-del-all 2>$null
    Write-Host "✓ Cleared Watchman cache" -ForegroundColor Green
} catch {
    Write-Host "  Watchman not installed (skipping)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== Cache Cleared Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Now starting Expo with clean cache..." -ForegroundColor Cyan
Write-Host ""

# Step 6: Start Expo with clean cache
npx expo start --clear
