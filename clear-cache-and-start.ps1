# Clear all React Native and Expo caches
Write-Host "Clearing Metro bundler cache..." -ForegroundColor Green
npx expo start --clear

Write-Host "`nIf the error persists, also try:" -ForegroundColor Yellow
Write-Host "1. Stop the current dev server (Ctrl+C)" -ForegroundColor Yellow
Write-Host "2. Run: rm -rf node_modules/.cache" -ForegroundColor Yellow
Write-Host "3. Run: npx expo start --clear" -ForegroundColor Yellow
