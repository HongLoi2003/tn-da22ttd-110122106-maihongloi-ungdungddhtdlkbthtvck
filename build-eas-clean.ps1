# Script build EAS với clear cache
Write-Host "🧹 Clearing Metro bundler cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "`n🧹 Clearing EAS build cache..." -ForegroundColor Yellow
Write-Host "📦 Building APK with preview profile..." -ForegroundColor Cyan

npx eas-cli build --platform android --profile preview --clear-cache

Write-Host "`n✅ Build command completed!" -ForegroundColor Green
Write-Host "📱 Check your build status at: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds" -ForegroundColor Cyan
