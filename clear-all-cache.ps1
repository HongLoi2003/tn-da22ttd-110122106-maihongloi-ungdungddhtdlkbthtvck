Write-Host "`n=== CLEAR ALL CACHE ===" -ForegroundColor Green
Write-Host ""

# 1. Clear Expo cache
Write-Host "📦 Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Cleared .expo" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .expo not found" -ForegroundColor Gray
}

# 2. Clear node_modules cache
Write-Host "📦 Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "  ✅ Cleared node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  node_modules/.cache not found" -ForegroundColor Gray
}

# 3. Clear metro cache
Write-Host "📦 Clearing Metro bundler cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host ""
Write-Host "✅ All caches cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Stop the Expo dev server (Ctrl+C)" -ForegroundColor White
Write-Host "  2. Run build command:" -ForegroundColor White
Write-Host "     npx eas-cli build --platform android --profile preview --clear-cache" -ForegroundColor Cyan
Write-Host ""
