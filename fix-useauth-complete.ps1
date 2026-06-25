# Complete fix for useAuth error including TypeScript cache

Write-Host "=== Complete Fix for useAuth Error ===" -ForegroundColor Cyan
Write-Host ""

# Stop Metro
Write-Host "Stopping Metro bundler..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✓ Done" -ForegroundColor Green
Write-Host ""

# Clear all caches
Write-Host "Clearing all caches..." -ForegroundColor Yellow

$foldersToDelete = @(
    ".expo",
    "node_modules/.cache",
    ".expo-shared"
)

foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Host "  ✓ Cleared $folder" -ForegroundColor Green
    }
}

# Clear temp files
$tempPatterns = @("metro-*", "haste-map-*", "react-*")
foreach ($pattern in $tempPatterns) {
    $files = Get-ChildItem -Path $env:TEMP -Filter $pattern -ErrorAction SilentlyContinue
    if ($files) {
        $files | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared temp $pattern" -ForegroundColor Green
    }
}

Write-Host ""

# Reinstall dependencies (optional but recommended)
Write-Host "Do you want to reinstall node_modules? (y/n): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "✓ Removed node_modules" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== All Caches Cleared ===" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Expo with clean cache..." -ForegroundColor Cyan
Write-Host ""

# Start with clean cache
npx expo start --clear
