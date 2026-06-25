Write-Host "🧹 Clearing all caches and restarting..." -ForegroundColor Cyan

# Clear Metro cache folders
Write-Host "`nClearing Metro cache..." -ForegroundColor Yellow
if (Test-Path ".\.metro") { Remove-Item -Recurse -Force ".\.metro" }
if (Test-Path ".\node_modules\.cache") { Remove-Item -Recurse -Force ".\node_modules\.cache" }

# Clear Expo cache
Write-Host "Clearing Expo cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "`n✅ Done! App should restart with fresh cache." -ForegroundColor Green
