# Script xoa anh bai viet khong dung nua (da chuyen sang URL)
# Chay: .\delete-article-images.ps1

Write-Host "Xoa anh bai viet khong dung nua..." -ForegroundColor Cyan

$articleImages = @(
    "chedouonguoc.png",
    "stress.png", 
    "dauhieubenhtim.png",
    "yoga.png",
    "chamsocdamun.png",
    "chamsocrang.png",
    "chamsoctresosinh.png",
    "canthiotreem.png",
    "daukhopgoi.png",
    "ngudugiac.png",
    "thaikykhoemanh.png",
    "viemloetdaday.png",
    "viemxoangmantinh.png",
    "Phongnguatieuduong.png"
)

$assetsPath = "assets/images"
$deletedCount = 0
$notFoundCount = 0

foreach ($image in $articleImages) {
    $imagePath = Join-Path $assetsPath $image
    
    if (Test-Path $imagePath) {
        Remove-Item $imagePath -Force
        Write-Host "  Da xoa: $image" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "  Khong tim thay: $image" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "Ket qua:" -ForegroundColor Cyan
Write-Host "  - Da xoa: $deletedCount file" -ForegroundColor Green
Write-Host "  - Khong tim thay: $notFoundCount file" -ForegroundColor Yellow
Write-Host ""
Write-Host "Hoan tat! Cac anh bai viet da duoc xoa." -ForegroundColor Green
Write-Host "App gio dung URL tu Unsplash thay vi anh local." -ForegroundColor Cyan
