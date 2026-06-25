const fs = require('fs');
const path = require('path');

// Danh sách các file cần sửa
const filesToFix = [
  'app/write-review.tsx',
  'app/reviews.tsx',
  'app/find-hospital.tsx',
  'app/doctor-detail.tsx',
  'app/doctor-chat.tsx',
  'app/doctor/profile.tsx',
  'app/doctor/edit-profile.tsx',
  'app/doctor/dashboard.tsx',
  'app/booking-success.tsx',
  'app/booking-confirmation.tsx',
  'app/article-detail.tsx',
  'app/article-comments.tsx',
];

// Các dòng cần xóa
const linesToRemove = [
  "  'lehoangnam.png': { uri: 'https://i.pravatar.cc/200?img=13' },",
  "  'phamthuha.png': { uri: 'https://i.pravatar.cc/200?img=48' },",
];

// Dòng cần thêm (nếu chưa có)
const lineToAdd = "  'logo.png': require('@/assets/images/logo.png'),";

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File không tồn tại: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Xóa các dòng import ảnh không tồn tại
    linesToRemove.forEach(line => {
      if (content.includes(line)) {
        content = content.replace(line + '\n', '');
        modified = true;
      }
    });

    // Thêm logo.png nếu chưa có
    if (!content.includes("'logo.png'") && content.includes('const doctorImages')) {
      // Tìm vị trí cuối cùng của doctorImages object
      const regex = /const doctorImages[^{]*\{([^}]+)\}/s;
      const match = content.match(regex);
      
      if (match) {
        const oldBlock = match[0];
        const newBlock = oldBlock.replace(/\n\};/, `\n${lineToAdd}\n};`);
        content = content.replace(oldBlock, newBlock);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Đã sửa: ${filePath}`);
    } else {
      console.log(`ℹ️  Không cần sửa: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi sửa ${filePath}:`, error.message);
  }
});

console.log('\n✅ Hoàn thành!');
