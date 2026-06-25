# Fix images và build
Write-Host "🔧 Fixing image files..." -ForegroundColor Cyan

# Xóa và tạo lại 3 file ảnh
Write-Host "`n📸 Recreating image files..." -ForegroundColor Yellow
Copy-Item "assets/images/canthiotreem-backup.png" "assets/images/canthiotreem.png" -Force
Copy-Item "assets/images/tranthilan-backup.png" "assets/images/tranthilan.png" -Force  
Copy-Item "assets/images/ngudugiac-backup.png" "assets/images/ngudugiac.png" -Force
Write-Host "✅ Images recreated!" -ForegroundColor Green

# Clear caches
Write-Host "`n🧹 Clearing caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Build
Write-Host "`n📦 Building APK..." -ForegroundColor Yellow
npx eas-cli build --platform android --profile preview --clear-cache

Write-Host "`n✅ Done!" -ForegroundColor Green
