# Script thay thế 3 ảnh bị lỗi bằng ảnh khác
Write-Host "🔧 Replacing problematic images with fallback images..." -ForegroundColor Cyan

# Danh sách file cần thay thế
$filesToReplace = @(
    "app/articles.tsx",
    "app/article-detail.tsx",
    "app/utils/imageHelper.ts",
    "app/(tabs)/booking.tsx",
    "app/write-review.tsx",
    "app/utils/doctorAvatars.ts",
    "app/test-doctor-avatar.tsx",
    "app/reviews.tsx",
    "app/find-hospital.tsx",
    "app/doctor-detail.tsx",
    "app/doctor-chat.tsx",
    "app/doctor/profile.tsx",
    "app/doctor/edit-profile.tsx",
    "app/doctor/dashboard.tsx",
    "app/debug-notification-avatar.tsx",
    "app/debug-doctor-images.tsx",
    "app/booking-success.tsx",
    "app/booking-confirmation.tsx",
    "app/article-comments.tsx",
    "app/appointment-detail.tsx",
    "app/(tabs)/appointments.tsx"
)

Write-Host "`n📝 Replacing in files..." -ForegroundColor Yellow

foreach ($file in $filesToReplace) {
    if (Test-Path $file) {
        # Thay thế tranthilan.png -> nguyenvanam.png
        (Get-Content $file -Raw) -replace "tranthilan\.png", "nguyenvanam.png" | Set-Content $file -NoNewline
        
        # Thay thế canthiotreem.png -> logo.png  
        (Get-Content $file -Raw) -replace "canthiotreem\.png", "logo.png" | Set-Content $file -NoNewline
        
        # Thay thế ngudugiac.png -> logo.png
        (Get-Content $file -Raw) -replace "ngudugiac\.png", "logo.png" | Set-Content $file -NoNewline
        
        Write-Host "  ✅ Updated: $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ All files updated!" -ForegroundColor Green
Write-Host "`n📦 Now run: npx eas-cli build --platform android --profile preview --clear-cache" -ForegroundColor Cyan
