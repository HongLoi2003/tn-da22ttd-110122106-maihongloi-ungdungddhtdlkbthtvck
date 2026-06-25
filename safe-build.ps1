#!/usr/bin/env pwsh
# Script build an toàn - kiểm tra ảnh trước khi build

Write-Host "🚀 SAFE BUILD - KIỂM TRA ẢNH TRƯỚC KHI BUILD" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# Bước 1: Kiểm tra ảnh
Write-Host "`n📋 Bước 1: Kiểm tra ảnh..." -ForegroundColor Yellow
node check-images-before-build.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ PHÁT HIỆN VẤN ĐỀ VỚI ẢNH!" -ForegroundColor Red
    Write-Host "Chọn giải pháp:" -ForegroundColor Yellow
    Write-Host "  1. Tối ưu ảnh (nén, resize)" -ForegroundColor White
    Write-Host "  2. Chuyển sang dùng URL" -ForegroundColor White
    Write-Host "  3. Bỏ qua và build (không khuyến khích)" -ForegroundColor DarkGray
    
    $choice = Read-Host "`nNhập lựa chọn (1/2/3)"
    
    switch ($choice) {
        "1" {
            Write-Host "`n🖼️  Đang tối ưu ảnh..." -ForegroundColor Yellow
            npm install sharp --save-dev
            node optimize-images.js
            
            Write-Host "`n✅ Đã tối ưu! Kiểm tra lại..." -ForegroundColor Green
            node check-images-before-build.js
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "`n⚠️  Vẫn còn vấn đề. Thử giải pháp 2 (dùng URL)" -ForegroundColor Yellow
                exit 1
            }
        }
        "2" {
            Write-Host "`n🔄 Đang chuyển sang dùng URL..." -ForegroundColor Yellow
            node convert-images-to-urls.js
            
            Write-Host "`n✅ Đã chuyển đổi!" -ForegroundColor Green
        }
        "3" {
            Write-Host "`n⚠️  Tiếp tục build (có thể thất bại)..." -ForegroundColor Yellow
        }
        default {
            Write-Host "`n❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
            exit 1
        }
    }
}

# Bước 2: Clear cache
Write-Host "`n🧹 Bước 2: Clear cache..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✅ Đã clear cache" -ForegroundColor Green

# Bước 3: Build
Write-Host "`n🏗️  Bước 3: Bắt đầu build..." -ForegroundColor Yellow
Write-Host ("=" * 60) -ForegroundColor Gray

npx eas-cli build --platform android --profile preview --clear-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD THÀNH CÔNG!" -ForegroundColor Green
} else {
    Write-Host "`n❌ BUILD THẤT BẠI!" -ForegroundColor Red
    Write-Host "Kiểm tra log ở trên để biết chi tiết" -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
