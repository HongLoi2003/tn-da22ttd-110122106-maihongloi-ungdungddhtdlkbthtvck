# Script xóa các ảnh trùng lặp
Write-Host "=== XOA ANH TRUNG LAP ===" -ForegroundColor Cyan
Write-Host ""

# Danh sách các file cần xóa (giữ .png, xóa .jpg/.jpeg)
$filesToDelete = @(
    "assets/images/nguyenthihoa.jpg",
    "assets/images/leminhtam.jpeg",
    "assets/images/nguyenvanam.jpg",
    "assets/images/tranthilan.jpeg",
    "assets/images/tranthimai.jpeg",
    "assets/images/dominhtuan.jpeg"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== HOAN TAT ===" -ForegroundColor Cyan
Write-Host "Da xoa 6 file anh trung lap" -ForegroundColor Green
Write-Host ""
Write-Host "Giu lai cac file .png:" -ForegroundColor Yellow
Write-Host "  - nguyenthihoa.png" -ForegroundColor White
Write-Host "  - leminhtam.png" -ForegroundColor White
Write-Host "  - nguyenvanam.png" -ForegroundColor White
Write-Host "  - tranthilan.png" -ForegroundColor White
Write-Host "  - tranthimai.png" -ForegroundColor White
Write-Host "  - dominhtuan.png" -ForegroundColor White
