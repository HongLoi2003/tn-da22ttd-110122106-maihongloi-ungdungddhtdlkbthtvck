# Script xoa anh bac si bi trung (giu .png, xoa .jpg/.jpeg)

Write-Host "=== XOA ANH BAC SI BI TRUNG ==="
Write-Host ""

$imagePath = "assets\images"
$doctorsToClean = @('dominhtuan', 'leminhtam', 'nguyenthihoa', 'nguyenvanam', 'tranthilan', 'tranthimai')

$totalDeleted = 0

foreach ($doctor in $doctorsToClean) {
    Write-Host "Kiem tra: $doctor"
    
    # Tim tat ca file cua bac si nay
    $files = Get-ChildItem "$imagePath\$doctor.*" -File -ErrorAction SilentlyContinue
    
    if ($files.Count -gt 1) {
        # Co nhieu hon 1 file (bi trung)
        foreach ($file in $files) {
            if ($file.Extension -eq '.jpg' -or $file.Extension -eq '.jpeg') {
                Write-Host "  X Xoa: $($file.Name) - $($file.Length) bytes"
                Remove-Item $file.FullName -Force
                $totalDeleted++
            } else {
                Write-Host "  OK Giu: $($file.Name) - $($file.Length) bytes"
            }
        }
    } else {
        Write-Host "  OK Khong co file trung"
    }
    Write-Host ""
}

Write-Host "=== KET QUA ==="
Write-Host "Da xoa: $totalDeleted file"
Write-Host ""

# Kiem tra lai
Write-Host "=== KIEM TRA LAI ==="
foreach ($doctor in $doctorsToClean) {
    $files = Get-ChildItem "$imagePath\$doctor.*" -File -ErrorAction SilentlyContinue
    if ($files.Count -gt 0) {
        Write-Host "$doctor : $($files.Name -join ', ')"
    }
}
