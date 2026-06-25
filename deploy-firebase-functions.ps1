# Deploy Firebase Functions for Password Reset API
# Chạy: .\deploy-firebase-functions.ps1

Write-Host "🚀 Deploying Firebase Functions..." -ForegroundColor Cyan
Write-Host ""

# Check Firebase CLI
Write-Host "📋 Checking Firebase CLI..." -ForegroundColor Yellow
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 To install Firebase CLI:" -ForegroundColor Yellow
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ Firebase CLI installed" -ForegroundColor Green
Write-Host ""

# Check login
Write-Host "🔐 Checking Firebase login..." -ForegroundColor Yellow
firebase login:list

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Push-Location functions
npm install express cors
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔥 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Firebase Functions deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Check the Function URL in the output above" -ForegroundColor Gray
    Write-Host "   2. Copy the URL (something like: https://REGION-PROJECT.cloudfunctions.net/api)" -ForegroundColor Gray
    Write-Host "   3. Update app/config/apiConfig.ts with your Function URL" -ForegroundColor Gray
    Write-Host "   4. Build APK: npm run build:apk or eas build" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 Test your API:" -ForegroundColor Cyan
    Write-Host "   curl YOUR_FUNCTION_URL/" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Not logged in: firebase login" -ForegroundColor Gray
    Write-Host "   2. No project selected: firebase use --add" -ForegroundColor Gray
    Write-Host "   3. Billing not enabled: Enable Blaze plan in Firebase Console" -ForegroundColor Gray
    Write-Host ""
}
