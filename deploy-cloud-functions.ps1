# Deploy Cloud Functions for Reset Password
Write-Host "🚀 Deploying Cloud Functions..." -ForegroundColor Cyan

# Check if Firebase CLI is installed
$firebaseCLI = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCLI) {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "📋 Checking Firebase login status..." -ForegroundColor Cyan
firebase login:list

# Deploy functions
Write-Host ""
Write-Host "📦 Deploying resetPassword function..." -ForegroundColor Cyan
firebase deploy --only functions:resetPassword

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Cloud Function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Function deployed:" -ForegroundColor Cyan
    Write-Host "   - resetPassword (callable function)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 You can test it in your app now!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
