# Deploy Firestore Rules to Firebase
Write-Host "🚀 Deploying Firestore Rules..." -ForegroundColor Cyan

# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI is not installed!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "📝 Checking Firebase login status..." -ForegroundColor Cyan
firebase login:list

# Deploy rules
Write-Host "`n🔥 Deploying Firestore rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Firestore rules deployed successfully!" -ForegroundColor Green
    Write-Host "`n📋 Rules now allow:" -ForegroundColor Cyan
    Write-Host "  ✓ Users can create AI conversations" -ForegroundColor White
    Write-Host "  ✓ Users can read their own conversations" -ForegroundColor White
    Write-Host "  ✓ Users can update their own conversations" -ForegroundColor White
    Write-Host "  ✓ Users can delete their own conversations" -ForegroundColor White
    Write-Host "  ✓ Users can create/delete AI messages" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to deploy Firestore rules!" -ForegroundColor Red
    Write-Host "Please check the error message above." -ForegroundColor Yellow
}
