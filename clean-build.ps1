Write-Host "Cleaning Android build..." -ForegroundColor Green

# Clean Gradle cache
Set-Location android
if (Test-Path "gradlew.bat") {
    .\gradlew.bat clean
}
Set-Location ..

# Remove build folders
if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build"
}
if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
}
if (Test-Path "android\.gradle") {
    Remove-Item -Recurse -Force "android\.gradle"
}

# Remove node_modules and reinstall
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Clean completed!" -ForegroundColor Green
Write-Host "Now you can run: eas build --platform android --profile production" -ForegroundColor Cyan
