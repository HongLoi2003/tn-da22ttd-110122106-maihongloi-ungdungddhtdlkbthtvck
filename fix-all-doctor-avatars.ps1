# Script để sửa tất cả avatar bác sĩ trong tất cả file

Write-Host "🔧 Đang sửa avatar bác sĩ trong tất cả file..." -ForegroundColor Cyan

$replacements = @{
    "'nguyenvanam.png': require('@/assets/images/logo.png')" = "'nguyenvanam.png': require('@/assets/images/nguyenvanam.jpg')"
    "'tranthilan.png': require('@/assets/images/logo.png')" = "'tranthilan.png': require('@/assets/images/tranthilan.jpeg')"
    "'leminhtam.png': require('@/assets/images/logo.png')" = "'leminhtam.png': require('@/assets/images/leminhtam.jpeg')"
    "'tranthimai.png': require('@/assets/images/logo.png')" = "'tranthimai.png': require('@/assets/images/tranthimai.jpeg')"
    "'dominhtuan.png': require('@/assets/images/logo.png')" = "'dominhtuan.png': require('@/assets/images/dominhtuan.jpeg')"
    "'vuthilan.png': require('@/assets/images/logo.png')" = "'vuthilan.png': require('@/assets/images/vuthilan.png')"
    "'hoangvanduc.png': require('@/assets/images/logo.png')" = "'hoangvanduc.png': require('@/assets/images/hoangvanduc.png')"
    "'ngothihuong.png': require('@/assets/images/logo.png')" = "'ngothihuong.png': require('@/assets/images/ngothihuong.png')"
    "'nguyenthihoa.png': require('@/assets/images/logo.png')" = "'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.jpg')"
    "'tranvankhoa.png': require('@/assets/images/logo.png')" = "'tranvankhoa.png': require('@/assets/images/tranvankhoa.png')"
    "'phamminhquan.png': require('@/assets/images/logo.png')" = "'phamminhquan.png': require('@/assets/images/phamminhquan.png')"
    "'lethihang.png': require('@/assets/images/logo.png')" = "'lethihang.png': require('@/assets/images/lethihang.png')"
    "'nguyenvanhai.png': require('@/assets/images/logo.png')" = "'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png')"
}

# Danh sách file cần sửa
$files = @(
    "app/article-comments.tsx"
    "app/booking-confirmation.tsx"
    "app/booking-success.tsx"
    "app/debug-doctor-images.tsx"
    "app/debug-notification-avatar.tsx"
    "app/find-hospital.tsx"
    "app/doctor/edit-profile.tsx"
    "app/reviews.tsx"
    "app/test-doctor-avatar.tsx"
    "app/write-review.tsx"
)

$fixedCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  📝 Đang xử lý: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        foreach ($key in $replacements.Keys) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
        }
        
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -NoNewline
            Write-Host "     ✅ Đã sửa!" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "     ⏭️  Không cần sửa" -ForegroundColor Gray
        }
    } else {
        Write-Host "     ⚠️  File không tồn tại" -ForegroundColor Red
    }
}

Write-Host "`n✨ Hoàn tất! Đã sửa $fixedCount file." -ForegroundColor Green
Write-Host "🔄 Hãy reload app để thấy thay đổi (nhấn 'r' trong Expo)" -ForegroundColor Cyan
