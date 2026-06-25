# Clear React Native / Expo cache
Write-Host "Clearing Expo and React Native cache..." -ForegroundColor Yellow

# Clear Expo cache
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "✓ Cleared .expo folder" -ForegroundColor Green
}

# Clear node_modules/.cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Cleared node_modules/.cache" -ForegroundColor Green
}

# Clear Metro bundler cache
npx expo start --clear

Write-Host "`nCache cleared! The Metro bundler will start with a clean cache." -ForegroundColor Green
