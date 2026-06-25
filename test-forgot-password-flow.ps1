# Test Forgot Password Flow
# Kiểm tra toàn bộ luồng quên mật khẩu
# Chạy: .\test-forgot-password-flow.ps1

Write-Host "🔐 Testing Forgot Password Flow" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray
Write-Host ""

$testEmail = "test@example.com"  # Thay bằng email test của bạn
$allPassed = $true

# Test 1: Backend Server
Write-Host "📡 Test 1: Backend Server" -ForegroundColor Yellow
Write-Host "Checking if backend is running on http://localhost:3001..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5 -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.status -eq "OK") {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
        Write-Host "   Message: $($result.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Backend server returned unexpected response" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "❌ Backend server is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 To start backend:" -ForegroundColor Yellow
    Write-Host "   cd email-api" -ForegroundColor Cyan
    Write-Host "   npm start" -ForegroundColor Cyan
    $allPassed = $false
}

Write-Host ""

# Test 2: EmailJS Configuration
Write-Host "📧 Test 2: EmailJS Configuration" -ForegroundColor Yellow
Write-Host "Checking EmailJS config in app/services/emailService.ts..." -ForegroundColor Gray

$emailServicePath = "app/services/emailService.ts"
if (Test-Path $emailServicePath) {
    $content = Get-Content $emailServicePath -Raw
    
    $hasServiceId = $content -match "EMAILJS_SERVICE_ID\s*=\s*'service_\w+'"
    $hasTemplateId = $content -match "EMAILJS_TEMPLATE_ID\s*=\s*'template_\w+'"
    $hasPublicKey = $content -match "EMAILJS_PUBLIC_KEY\s*=\s*'\w+'"
    
    if ($hasServiceId -and $hasTemplateId -and $hasPublicKey) {
        Write-Host "✅ EmailJS configuration found" -ForegroundColor Green
        Write-Host "   Service ID: ✓" -ForegroundColor Gray
        Write-Host "   Template ID: ✓" -ForegroundColor Gray
        Write-Host "   Public Key: ✓" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  EmailJS configuration incomplete" -ForegroundColor Yellow
        if (-not $hasServiceId) { Write-Host "   Missing: Service ID" -ForegroundColor Gray }
        if (-not $hasTemplateId) { Write-Host "   Missing: Template ID" -ForegroundColor Gray }
        if (-not $hasPublicKey) { Write-Host "   Missing: Public Key" -ForegroundColor Gray }
    }
} else {
    Write-Host "❌ Email service file not found" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 3: Firestore Rules
Write-Host "🔥 Test 3: Firestore Rules" -ForegroundColor Yellow
Write-Host "Checking firestore.rules for password_reset_otps..." -ForegroundColor Gray

$rulesPath = "firestore.rules"
if (Test-Path $rulesPath) {
    $rules = Get-Content $rulesPath -Raw
    
    if ($rules -match "password_reset_otps") {
        Write-Host "✅ password_reset_otps rules found" -ForegroundColor Green
        
        if ($rules -match "allow create:\s*if\s*true") {
            Write-Host "   ✓ Create permission: if true" -ForegroundColor Gray
        }
        if ($rules -match "allow read:\s*if\s*true") {
            Write-Host "   ✓ Read permission: if true" -ForegroundColor Gray
        }
        if ($rules -match "allow update:\s*if\s*true") {
            Write-Host "   ✓ Update permission: if true" -ForegroundColor Gray
        }
        if ($rules -match "allow delete:\s*if\s*true") {
            Write-Host "   ✓ Delete permission: if true" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ password_reset_otps rules NOT found" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 To fix: Run deploy-firestore-rules-with-otp.ps1" -ForegroundColor Yellow
        $allPassed = $false
    }
} else {
    Write-Host "❌ firestore.rules file not found" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 4: serviceAccountKey.json
Write-Host "🔑 Test 4: Service Account Key" -ForegroundColor Yellow
Write-Host "Checking serviceAccountKey.json..." -ForegroundColor Gray

if (Test-Path "serviceAccountKey.json") {
    try {
        $serviceAccount = Get-Content "serviceAccountKey.json" | ConvertFrom-Json
        
        if ($serviceAccount.project_id) {
            Write-Host "✅ Service account key found" -ForegroundColor Green
            Write-Host "   Project ID: $($serviceAccount.project_id)" -ForegroundColor Gray
            Write-Host "   Client Email: $($serviceAccount.client_email)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Service account key format invalid" -ForegroundColor Yellow
            $allPassed = $false
        }
    } catch {
        Write-Host "❌ Cannot parse serviceAccountKey.json" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "❌ serviceAccountKey.json not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Download from:" -ForegroundColor Yellow
    Write-Host "   Firebase Console → Project Settings → Service Accounts" -ForegroundColor Cyan
    $allPassed = $false
}

Write-Host ""

# Test 5: Frontend Screen
Write-Host "📱 Test 5: Forgot Password Screen" -ForegroundColor Yellow
Write-Host "Checking app/forgot-password.tsx..." -ForegroundColor Gray

$forgotPasswordPath = "app/forgot-password.tsx"
if (Test-Path $forgotPasswordPath) {
    $content = Get-Content $forgotPasswordPath -Raw
    
    $hasEmailStep = $content -match "step === 'email'"
    $hasOtpStep = $content -match "step === 'otp'"
    $hasNewPasswordStep = $content -match "step === 'newPassword'"
    $hasSuccessStep = $content -match "step === 'success'"
    
    if ($hasEmailStep -and $hasOtpStep -and $hasNewPasswordStep -and $hasSuccessStep) {
        Write-Host "✅ All steps implemented" -ForegroundColor Green
        Write-Host "   ✓ Email step" -ForegroundColor Gray
        Write-Host "   ✓ OTP step" -ForegroundColor Gray
        Write-Host "   ✓ New Password step" -ForegroundColor Gray
        Write-Host "   ✓ Success step" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Some steps missing" -ForegroundColor Yellow
        $allPassed = $false
    }
} else {
    Write-Host "❌ Forgot password screen not found" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "================================" -ForegroundColor Gray

# Summary
if ($allPassed) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Forgot Password flow is ready to use!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Start backend: cd email-api && npm start" -ForegroundColor Gray
    Write-Host "   2. Start app: npx expo start --clear" -ForegroundColor Gray
    Write-Host "   3. Test the flow in the app" -ForegroundColor Gray
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above before using the forgot password feature." -ForegroundColor Gray
}

Write-Host ""
