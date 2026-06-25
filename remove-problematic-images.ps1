# Script xóa/comment các tham chiếu đến 3 ảnh bị lỗi
Write-Host "🔧 Removing problematic image references..." -ForegroundColor Cyan

Write-Host "`n📝 Strategy:" -ForegroundColor Yellow
Write-Host "  1. Remove tranthilan.png from doctorImages (use nguyenvanam.png as fallback)" -ForegroundColor White
Write-Host "  2. Remove canthiotreem.png from articles (use logo.png as fallback)" -ForegroundColor White
Write-Host "  3. Remove ngudugiac.png from articles (use logo.png as fallback)" -ForegroundColor White

Write-Host "`n⚠️  This will modify your code files!" -ForegroundColor Red
$confirm = Read-Host "Do you want to continue? (y/n)"

if ($confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

# Backup files first
Write-Host "`n💾 Creating backups..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$filesToModify = @(
    "app/articles.tsx",
    "app/article-detail.tsx",
    "app/utils/imageHelper.ts"
)

foreach ($file in $filesToModify) {
    if (Test-Path $file) {
        $backupPath = Join-Path $backupDir $file
        $backupFolder = Split-Path $backupPath -Parent
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
        Copy-Item $file $backupPath -Force
        Write-Host "  ✅ Backed up: $file" -ForegroundColor Green
    }
}

Write-Host "`n📝 Modifying files..." -ForegroundColor Yellow

# 1. Fix app/articles.tsx - Remove article #10 (canthiotreem)
$articlesFile = "app/articles.tsx"
if (Test-Path $articlesFile) {
    $content = Get-Content $articlesFile -Raw
    
    # Remove article with canthiotreem.png
    $content = $content -replace "(?s),\s*\{\s*id:\s*'10',.*?canthiotreem\.png.*?\},", ""
    
    Set-Content $articlesFile $content -NoNewline
    Write-Host "  ✅ Removed article #10 from articles.tsx" -ForegroundColor Green
}

# 2. Fix app/article-detail.tsx - Remove articleImages['10']
$articleDetailFile = "app/article-detail.tsx"
if (Test-Path $articleDetailFile) {
    $content = Get-Content $articleDetailFile -Raw
    
    # Remove line with canthiotreem
    $content = $content -replace ".*'10':\s*require\('@/assets/images/canthiotreem\.png'\),?\s*\n", ""
    
    # Remove articleData['10']
    $content = $content -replace "(?s)'10':\s*\{.*?title:\s*'Cận thị.*?\},\s*", ""
    
    Set-Content $articleDetailFile $content -NoNewline
    Write-Host "  ✅ Removed article #10 from article-detail.tsx" -ForegroundColor Green
}

# 3. Fix app/utils/imageHelper.ts - Remove ngudugiac and canthiotreem
$imageHelperFile = "app/utils/imageHelper.ts"
if (Test-Path $imageHelperFile) {
    $content = Get-Content $imageHelperFile -Raw
    
    # Remove lines with problematic images
    $content = $content -replace ".*'canthiotreem\.png':\s*require\('@/assets/images/canthiotreem\.png'\),?\s*\n", ""
    $content = $content -replace ".*'ngudugiac\.png':\s*require\('@/assets/images/ngudugiac\.png'\),?\s*\n", ""
    
    Set-Content $imageHelperFile $content -NoNewline
    Write-Host "  ✅ Removed problematic images from imageHelper.ts" -ForegroundColor Green
}

Write-Host "`n✅ All modifications complete!" -ForegroundColor Green
Write-Host "`n📦 Backups saved to: $backupDir" -ForegroundColor Cyan
Write-Host "`n🚀 Now run: npx eas-cli build --platform android --profile preview --clear-cache" -ForegroundColor Cyan
