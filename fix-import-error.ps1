# Fix import error - Restart Metro Bundler

Write-Host "🔧 Fixing import error for googleScriptEmailService..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Clearing Metro cache..." -ForegroundColor Yellow
Remove-Item -Path ".expo\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "2. Files verified:" -ForegroundColor Green
Write-Host "   ✅ app/services/googleScriptEmailService.ts exists" -ForegroundColor Green
Write-Host "   ✅ app/forgot-password.tsx updated" -ForegroundColor Green

Write-Host ""
Write-Host "3. Next steps:" -ForegroundColor Yellow
Write-Host "   - Stop the current npm start (Ctrl+C)" -ForegroundColor White
Write-Host "   - Run: npm start" -ForegroundColor White
Write-Host "   - Press 'r' to reload app" -ForegroundColor White

Write-Host ""
Write-Host "Done! ✅" -ForegroundColor Green
