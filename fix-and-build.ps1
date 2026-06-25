# Script fix images và build APK
Write-Host "🔧 Fixing image issues and building APK..." -ForegroundColor Cyan

# Step 1: Clear all caches
Write-Host "`n📦 Step 1: Clearing caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android -ErrorAction SilentlyContinue
Write-Host "✅ Caches cleared!" -ForegroundColor Green

# Step 2: Clean Metro bundler
Write-Host "`n📦 Step 2: Cleaning Metro bundler..." -ForegroundColor Yellow
npx expo start --clear --no-dev --minify

# Step 3: Build with EAS
Write-Host "`n📦 Step 3: Building APK with EAS..." -ForegroundColor Yellow
npx eas-cli build --platform android --profile preview --clear-cache

Write-Host "`n✅ Done! Check your build at: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds" -ForegroundColor Green
