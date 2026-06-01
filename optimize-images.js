/**
 * Script tối ưu hóa ảnh trong assets/images
 * Sử dụng sharp để nén và resize ảnh
 * 
 * Cài đặt: npm install sharp
 * Chạy: node optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'assets', 'images');
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 85;
const MAX_SIZE_KB = 500; // Target max size

// Danh sách ảnh cần tối ưu (>1MB)
const LARGE_IMAGES = [
  'hearderddau.png',
  'bacsi.png',
  'benhvien.png',
  'loi8.png',
  'ai.png',
  'bckgour.png'
];

async function optimizeImage(filename) {
  const inputPath = path.join(IMAGES_DIR, filename);
  const backupPath = path.join(IMAGES_DIR, `${filename}.backup`);
  
  try {
    // Kiểm tra file tồn tại
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  File không tồn tại: ${filename}`);
      return;
    }

    // Lấy thông tin file gốc
    const stats = fs.statSync(inputPath);
    const originalSizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`\n📸 Đang xử lý: ${filename}`);
    console.log(`   Kích thước gốc: ${originalSizeKB} KB`);

    // Backup file gốc
    fs.copyFileSync(inputPath, backupPath);
    console.log(`   ✅ Đã backup: ${filename}.backup`);

    // Đọc metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`   Kích thước ảnh: ${metadata.width}x${metadata.height}`);

    // Tính toán kích thước mới (giữ tỷ lệ)
    let newWidth = metadata.width;
    let newHeight = metadata.height;
    
    if (newWidth > MAX_WIDTH || newHeight > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / newWidth, MAX_HEIGHT / newHeight);
      newWidth = Math.round(newWidth * ratio);
      newHeight = Math.round(newHeight * ratio);
      console.log(`   📐 Resize xuống: ${newWidth}x${newHeight}`);
    }

    // Tối ưu hóa ảnh
    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({
        quality: QUALITY,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(inputPath + '.tmp');

    // Thay thế file gốc
    fs.renameSync(inputPath + '.tmp', inputPath);

    // Kiểm tra kích thước mới
    const newStats = fs.statSync(inputPath);
    const newSizeKB = (newStats.size / 1024).toFixed(2);
    const savedKB = (originalSizeKB - newSizeKB).toFixed(2);
    const savedPercent = ((savedKB / originalSizeKB) * 100).toFixed(1);

    console.log(`   ✅ Hoàn thành!`);
    console.log(`   Kích thước mới: ${newSizeKB} KB`);
    console.log(`   Tiết kiệm: ${savedKB} KB (${savedPercent}%)`);

    // Xóa backup nếu thành công và file mới nhỏ hơn
    if (parseFloat(newSizeKB) < parseFloat(originalSizeKB)) {
      fs.unlinkSync(backupPath);
      console.log(`   🗑️  Đã xóa backup`);
    } else {
      console.log(`   ⚠️  File mới không nhỏ hơn, khôi phục backup`);
      fs.copyFileSync(backupPath, inputPath);
      fs.unlinkSync(backupPath);
    }

  } catch (error) {
    console.error(`   ❌ Lỗi: ${error.message}`);
    
    // Khôi phục từ backup nếu có lỗi
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, inputPath);
      fs.unlinkSync(backupPath);
      console.log(`   ↩️  Đã khôi phục từ backup`);
    }
  }
}

async function main() {
  console.log('🖼️  BẮT ĐẦU TỐI ƯU HÓA ẢNH\n');
  console.log('=' .repeat(50));

  // Kiểm tra sharp đã cài chưa
  try {
    require.resolve('sharp');
  } catch (e) {
    console.error('❌ Chưa cài đặt sharp!');
    console.error('Chạy: npm install sharp');
    process.exit(1);
  }

  let totalSaved = 0;
  let processedCount = 0;

  for (const filename of LARGE_IMAGES) {
    const beforePath = path.join(IMAGES_DIR, filename);
    if (fs.existsSync(beforePath)) {
      const beforeSize = fs.statSync(beforePath).size;
      await optimizeImage(filename);
      
      if (fs.existsSync(beforePath)) {
        const afterSize = fs.statSync(beforePath).size;
        totalSaved += (beforeSize - afterSize);
        processedCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ HOÀN THÀNH!\n');
  console.log(`📊 Đã xử lý: ${processedCount}/${LARGE_IMAGES.length} ảnh`);
  console.log(`💾 Tổng tiết kiệm: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n💡 Lưu ý: Test app để đảm bảo chất lượng ảnh vẫn ổn!');
}

main().catch(console.error);
