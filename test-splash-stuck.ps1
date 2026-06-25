Write-Host "=== TEST SPLASH STUCK ISSUE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Khi app bị kẹt ở splash screen, hãy làm theo:" -ForegroundColor Yellow
Write-Host ""

Write-Host "CÁCH 1: Access Debug Screen" -ForegroundColor Green
Write-Host "  - Mở dev menu trên điện thoại (shake device)" -ForegroundColor White
Write-Host "  - Chọn 'Reload' hoặc nhấn R trong terminal" -ForegroundColor White
Write-Host "  - Nếu vẫn kẹt, truy cập: /debug-splash-stuck" -ForegroundColor White
Write-Host ""

Write-Host "CÁCH 2: Check Logs" -ForegroundColor Green
Write-Host "  Terminal sẽ hiển thị logs như:" -ForegroundColor White
Write-Host "    [AUTH] Auth state changed" -ForegroundColor Gray
Write-Host "    [AUTH] Current user: ..." -ForegroundColor Gray
Write-Host "    [AUTH] User data loaded" -ForegroundColor Gray
Write-Host "    [LAYOUT] Showing splash screen..." -ForegroundColor Gray
Write-Host ""

Write-Host "CÁCH 3: Clear Cache & Restart" -ForegroundColor Green
Write-Host "  Chạy lệnh:" -ForegroundColor White
Write-Host "    npx expo start --clear" -ForegroundColor Yellow
Write-Host ""

Write-Host "NGUYÊN NHÂN THƯỜNG GẶP:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Firebase Auth không kết nối được" -ForegroundColor Yellow
Write-Host "   - Check internet connection" -ForegroundColor White
Write-Host "   - Check firebaseConfig trong app/config/firebase.ts" -ForegroundColor White
Write-Host ""

Write-Host "2. Firestore query bị lỗi permission" -ForegroundColor Yellow
Write-Host "   - Check Firestore rules" -ForegroundColor White
Write-Host "   - User có thể login nhưng không đọc được data" -ForegroundColor White
Write-Host ""

Write-Host "3. AuthContext.loading không bao giờ = false" -ForegroundColor Yellow
Write-Host "   - Đã thêm timeout 10s để tự động stop" -ForegroundColor White
Write-Host "   - Nếu sau 10s vẫn kẹt → lỗi logic khác" -ForegroundColor White
Write-Host ""

Write-Host "4. User data không tồn tại trong Firestore" -ForegroundColor Yellow
Write-Host "   - User đăng nhập nhưng không có document trong users collection" -ForegroundColor White
Write-Host "   - App sẽ đợi userData mãi mãi" -ForegroundColor White
Write-Host ""

Write-Host "GIẢI PHÁP NHANH:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Reload app: Nhấn 'R' trong terminal" -ForegroundColor White
Write-Host "2. Clear cache: npx expo start --clear" -ForegroundColor White
Write-Host "3. Force logout: Vào /debug-splash-stuck → Force Logout" -ForegroundColor White
Write-Host "4. Xóa app và cài lại" -ForegroundColor White
Write-Host ""

Write-Host "KHI BUILD APK:" -ForegroundColor Cyan
Write-Host "Nếu APK bị kẹt splash, user không thể access debug screen" -ForegroundColor Yellow
Write-Host "→ Cần fix code trước khi build!" -ForegroundColor Red
Write-Host ""

Write-Host "Check logs trong code:" -ForegroundColor Yellow
Write-Host "  app/context/AuthContext.tsx - Dòng ~80-170" -ForegroundColor White
Write-Host "  app/_layout.tsx - Dòng ~30-45" -ForegroundColor White
Write-Host "  app/index.tsx - Dòng ~15-70" -ForegroundColor White
Write-Host ""

Write-Host "=== BẮT ĐẦU CHECK ===" -ForegroundColor Green
Write-Host ""

# Check if Metro bundler is running
$metroRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Metro*" -or $_.CommandLine -like "*expo*start*" }

if ($metroRunning) {
    Write-Host "✅ Metro bundler đang chạy" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nhấn 'R' trong terminal Metro để reload app" -ForegroundColor Yellow
} else {
    Write-Host "❌ Metro bundler chưa chạy" -ForegroundColor Red
    Write-Host ""
    Write-Host "Chạy lệnh: npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
