# Script kiem tra tat ca file con dung logo thay vi avatar bac si

Write-Host "Tim kiem cac file con dung logo cho avatar bac si..." -ForegroundColor Cyan
Write-Host ""

$files = @(
    "app/(tabs)/index.tsx",
    "app/(tabs)/booking.tsx", 
    "app/(tabs)/appointments.tsx",
    "app/appointment-detail.tsx",
    "app/doctor-detail.tsx",
    "app/doctor-chat.tsx",
    "app/utils/doctorAvatars.ts",
    "app/utils/imageHelper.ts"
)

$foundIssues = $false

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Kiem tra: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        if ($content -match "nguyenvanam.png.*logo.png") {
            Write-Host "   FOUND logo instead of avatar!" -ForegroundColor Red
            $foundIssues = $true
        } elseif ($content -match "tranthilan.png.*logo.png") {
            Write-Host "   FOUND logo instead of avatar!" -ForegroundColor Red
            $foundIssues = $true
        } else {
            Write-Host "   OK - Using correct avatar" -ForegroundColor Green
        }
    }
}

Write-Host ""
if ($foundIssues) {
    Write-Host "FOUND files using logo instead of avatar!" -ForegroundColor Red
} else {
    Write-Host "ALL FILES ARE USING CORRECT AVATARS!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking images in assets/images:" -ForegroundColor Cyan
$doctorImages = @(
    "nguyenvanam.jpg",
    "tranthilan.jpeg", 
    "leminhtam.jpeg",
    "tranthimai.jpeg",
    "dominhtuan.jpeg",
    "vuthilan.jpg",
    "nguyenthihoa.jpg",
    "hoangvanduc.png",
    "ngothihuong.png",
    "tranvankhoa.png",
    "phamminhquan.png",
    "lethihang.png",
    "nguyenvanhai.png",
    "dangthithao.jpg",
    "hesuyen.png"
)

$missingImages = @()
foreach ($img in $doctorImages) {
    $path = "assets/images/$img"
    if (Test-Path $path) {
        $size = [math]::Round((Get-Item $path).Length / 1KB, 2)
        Write-Host "   OK $img - $size KB" -ForegroundColor Green
    } else {
        Write-Host "   MISSING $img" -ForegroundColor Red
        $missingImages += $img
    }
}

Write-Host ""
if ($missingImages.Count -eq 0) {
    Write-Host "COMPLETE! All 15 doctor images are ready!" -ForegroundColor Green
} else {
    Write-Host "Missing $($missingImages.Count) images:" -ForegroundColor Yellow
    $missingImages | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
}
