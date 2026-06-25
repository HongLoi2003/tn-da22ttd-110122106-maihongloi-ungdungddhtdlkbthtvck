# Test Google Apps Script Email Service
# Run: .\test-google-apps-script.ps1

Write-Host "🧪 Testing Google Apps Script OTP Email Service" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Thay đổi giá trị này
$WEB_APP_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE"
$TEST_EMAIL = "your-email@gmail.com"
$TEST_OTP = "123456"

if ($WEB_APP_URL -eq "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
    Write-Host "❌ Lỗi: Vui lòng cập nhật WEB_APP_URL trong file này" -ForegroundColor Red
    Write-Host ""
    Write-Host "Các bước:" -ForegroundColor Yellow
    Write-Host "1. Deploy Google Apps Script (xem GOOGLE-APPS-SCRIPT-SETUP.md)" -ForegroundColor Yellow
    Write-Host "2. Copy Web App URL" -ForegroundColor Yellow
    Write-Host "3. Paste vào biến WEB_APP_URL trong file này" -ForegroundColor Yellow
    Write-Host "4. Thay đổi TEST_EMAIL thành email của bạn" -ForegroundColor Yellow
    Write-Host "5. Chạy lại script này" -ForegroundColor Yellow
    exit 1
}

Write-Host "📧 Test Email: $TEST_EMAIL" -ForegroundColor Green
Write-Host "🔐 OTP Code: $TEST_OTP" -ForegroundColor Green
Write-Host "🌐 Web App URL: $WEB_APP_URL" -ForegroundColor Green
Write-Host ""

# Tạo JSON payload
$body = @{
    action = "send-otp"
    email = $TEST_EMAIL
    otpCode = $TEST_OTP
} | ConvertTo-Json

Write-Host "📤 Sending request..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $WEB_APP_URL `
                                   -Method Post `
                                   -Body $body `
                                   -ContentType "application/json" `
                                   -TimeoutSec 30

    Write-Host ""
    Write-Host "✅ Response received:" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json | Write-Host -ForegroundColor White
    
    if ($response.success) {
        Write-Host ""
        Write-Host "🎉 Email sent successfully!" -ForegroundColor Green
        Write-Host "📬 Check your inbox (and spam folder): $TEST_EMAIL" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Failed to send email" -ForegroundColor Red
        Write-Host "Message: $($response.message)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Kiểm tra Web App URL có đúng không?" -ForegroundColor White
    Write-Host "2. URL phải kết thúc bằng /exec" -ForegroundColor White
    Write-Host "3. Who has access = 'Anyone'?" -ForegroundColor White
    Write-Host "4. Đã authorize quyền gửi email chưa?" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Cyan
