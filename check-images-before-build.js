/**
 * Kiểm tra tất cả ảnh trước khi build
 * Chạy: node check-images-before-build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, 'assets', 'images');
const MAX_SIZE_MB = 1; // Cảnh báo nếu ảnh > 1MB
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

console.log('🔍 KIỂM TRA ẢNH TRƯỚC KHI BUILD\n');
console.log('='.repeat(60));

// 1. Tìm tất cả require('@/assets/images/...')
console.log('\n📋 Bước 1: Tìm tất cả tham chiếu ảnh trong code...\n');

let allReferences = new Set();
let hasErrors = false;

try {
  const grepResult = execSync(
    `grep -r "require.*@/assets/images" app --include="*.tsx" --include="*.ts" || echo ""`,
    { encoding: 'utf8', shell: 'bash' }
  );
  
  const matches = grepResult.matchAll(/require\(['"]@\/assets\/images\/([^'"]+)['"]\)/g);
  for (const match of matches) {
    allReferences.add(match[1]);
  }
  
  console.log(`   Tìm thấy ${allReferences.size} ảnh được tham chiếu`);
} catch (error) {
  console.log('   ⚠️  Không thể grep (có thể đang dùng Windows)');
}

// 2. Kiểm tra file tồn tại
console.log('\n📁 Bước 2: Kiểm tra file tồn tại...\n');

let missingFiles = [];
let largeFiles = [];

allReferences.forEach(filename => {
  const filePath = path.join(ASSETS_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    missingFiles.push(filename);
    console.log(`   ❌ THIẾU: ${filename}`);
    hasErrors = true;
  } else {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    if (stats.size > MAX_SIZE_BYTES) {
      largeFiles.push({ filename, sizeMB });
      console.log(`   ⚠️  QUÁ LỚN: ${filename} (${sizeMB} MB)`);
    } else {
      console.log(`   ✅ OK: ${filename} (${sizeMB} MB)`);
    }
  }
});

// 3. Tổng kết
console.log('\n' + '='.repeat(60));
console.log('📊 KẾT QUẢ KIỂM TRA\n');

if (missingFiles.length > 0) {
  console.log(`❌ ${missingFiles.length} file THIẾU:`);
  missingFiles.forEach(f => console.log(`   - ${f}`));
  console.log('\n💡 Giải pháp: Xóa tham chiếu hoặc thêm file vào assets/images/\n');
}

if (largeFiles.length > 0) {
  console.log(`⚠️  ${largeFiles.length} file QUÁ LỚN (>${MAX_SIZE_MB}MB):`);
  largeFiles.forEach(f => console.log(`   - ${f.filename} (${f.sizeMB} MB)`));
  console.log('\n💡 Giải pháp: Chạy "node optimize-images.js" hoặc dùng URL\n');
}

if (missingFiles.length === 0 && largeFiles.length === 0) {
  console.log('✅ TẤT CẢ ẢNH ĐỀU OK!\n');
  console.log('🚀 Có thể build ngay bây giờ!\n');
} else {
  console.log('⚠️  CÓ VẤN ĐỀ CẦN KHẮC PHỤC TRƯỚC KHI BUILD\n');
  hasErrors = true;
}

console.log('='.repeat(60));

process.exit(hasErrors ? 1 : 0);
