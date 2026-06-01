Write-Host "=== Pre-Build Check ===" -ForegroundColor Cyan
Write-Host ""

$allChecks = $true

# Check 1: google-services.json
Write-Host "1. Checking google-services.json..." -ForegroundColor Yellow
if (Test-Path "android/app/google-services.json") {
    Write-Host "   ✓ google-services.json exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ google-services.json NOT found" -ForegroundColor Red
    if (Test-Path "android/app/google-services (1).json") {
        Write-Host "   → Copying from backup..." -ForegroundColor Yellow
        Copy-Item "android/app/google-services (1).json" "android/app/google-services.json"
        Write-Host "   ✓ Copied successfully" -ForegroundColor Green
    } else {
        Write-Host "   ✗ No backup found. Please add google-services.json" -ForegroundColor Red
        $allChecks = $false
    }
}
Write-Host ""

# Check 2: New Architecture disabled
Write-Host "2. Checking New Architecture..." -ForegroundColor Yellow
$gradleProps = Get-Content "android/gradle.properties" -Raw
if ($gradleProps -match "newArchEnabled=false") {
    Write-Host "   ✓ New Architecture is disabled" -ForegroundColor Green
} else {
    Write-Host "   ✗ New Architecture should be disabled" -ForegroundColor Red
    $allChecks = $false
}
Write-Host ""

# Check 3: NDK version
Write-Host "3. Checking NDK version..." -ForegroundColor Yellow
if ($gradleProps -match "#\s*android\.ndkVersion") {
    Write-Host "   ✓ NDK version is commented out" -ForegroundColor Green
} elseif ($gradleProps -notmatch "android\.ndkVersion") {
    Write-Host "   ✓ NDK version not specified (OK)" -ForegroundColor Green
} else {
    Write-Host "   ⚠ NDK version is specified (may cause issues)" -ForegroundColor Yellow
}
Write-Host ""

# Check 4: Google Services plugin
Write-Host "4. Checking Google Services plugin..." -ForegroundColor Yellow
$appBuildGradle = Get-Content "android/app/build.gradle" -Raw
if ($appBuildGradle -match "com\.google\.gms\.google-services") {
    Write-Host "   ✓ Google Services plugin is applied" -ForegroundColor Green
} else {
    Write-Host "   ✗ Google Services plugin NOT found" -ForegroundColor Red
    $allChecks = $false
}
Write-Host ""

# Check 5: node_modules
Write-Host "5. Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ node_modules NOT found. Running npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ npm install completed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ npm install failed" -ForegroundColor Red
        $allChecks = $false
    }
}
Write-Host ""

# Check 6: EAS CLI
Write-Host "6. Checking EAS CLI..." -ForegroundColor Yellow
$easVersion = eas --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ EAS CLI installed: $easVersion" -ForegroundColor Green
} else {
    Write-Host "   ✗ EAS CLI NOT found" -ForegroundColor Red
    Write-Host "   → Install with: npm install -g eas-cli" -ForegroundColor Yellow
    $allChecks = $false
}
Write-Host ""

# Check 7: app.json
Write-Host "7. Checking app.json..." -ForegroundColor Yellow
$appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
if ($appJson.expo.newArchEnabled -eq $false) {
    Write-Host "   ✓ newArchEnabled is false in app.json" -ForegroundColor Green
} else {
    Write-Host "   ✗ newArchEnabled should be false in app.json" -ForegroundColor Red
    $allChecks = $false
}
Write-Host ""

# Check 8: eas.json
Write-Host "8. Checking eas.json..." -ForegroundColor Yellow
if (Test-Path "eas.json") {
    Write-Host "   ✓ eas.json exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ eas.json NOT found" -ForegroundColor Red
    $allChecks = $false
}
Write-Host ""

# Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($allChecks) {
    Write-Host "✓ All checks passed! Ready to build." -ForegroundColor Green
    Write-Host ""
    Write-Host "Run one of these commands:" -ForegroundColor Cyan
    Write-Host "  eas build --platform android --profile preview" -ForegroundColor White
    Write-Host "  eas build --platform android --profile production" -ForegroundColor White
} else {
    Write-Host "✗ Some checks failed. Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "See HUONG_DAN_SUA_LOI_BUILD.md for more details." -ForegroundColor Yellow
}
Write-Host ""
