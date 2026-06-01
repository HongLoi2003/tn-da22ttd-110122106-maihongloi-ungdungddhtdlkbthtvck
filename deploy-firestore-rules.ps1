Write-Host "🚀 Deploying Firestore Rules..." -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCmd) {
    Write-Host "❌ Firebase CLI chưa được cài đặt!" -ForegroundColor Red
    Write-Host "📦 Cài đặt bằng lệnh: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Deploy Firestore rules
Write-Host "📤 Đang deploy Firestore rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy Firestore rules thành công!" -ForegroundColor Green
    Write-Host "🎉 Bây giờ bạn có thể đọc collection 'popular-specialties'" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deploy thất bại!" -ForegroundColor Red
    Write-Host "💡 Hãy chắc chắn bạn đã đăng nhập Firebase: firebase login" -ForegroundColor Yellow
}
