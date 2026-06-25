# Script kiểm tra trạng thái build
Write-Host "Checking EAS build status..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Build ID: 4d2bcbe2-64d9-4f10-be5b-f159ef8fe9be" -ForegroundColor Yellow
Write-Host ""
Write-Host "Build URL:" -ForegroundColor Green
Write-Host "https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/4d2bcbe2-64d9-4f10-be5b-f159ef8fe9be" -ForegroundColor White
Write-Host ""
Write-Host "Running: npx eas build:view 4d2bcbe2-64d9-4f10-be5b-f159ef8fe9be" -ForegroundColor Cyan
Write-Host ""
npx eas build:view 4d2bcbe2-64d9-4f10-be5b-f159ef8fe9be
