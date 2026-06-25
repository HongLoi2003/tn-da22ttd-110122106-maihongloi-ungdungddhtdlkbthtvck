/**
 * Chuyển đổi tất cả require('@/assets/images/...') sang URL
 * Chạy: node convert-images-to-urls.js
 */

const fs = require('fs');
const path = require('path');

// Các file cần chuyển đổi
const filesToConvert = [
  'app/articles.tsx',
  'app/article-detail.tsx',
  'app/doctor-detail.tsx',
  'app/(tabs)/index.tsx',
  'app/find-hospital.tsx',
];

// Pattern cần thay thế
const patterns = [
  {
    // require('@/assets/images/xxx.png')
    from: /require\(['"]@\/assets\/images\/([^'"]+)['"]\)/g,
    to: (match, filename) => `{ uri: 'https://via.placeholder.com/400x200?text=${encodeURIComponent(filename)}' }`
  },
  {
    // doctorImages['xxx.png']
    from: /doctorImages\[['"]([^'"]+)['"]\]/g,
    to: (match, filename) => `{ uri: 'https://i.pravatar.cc/150?img=1' }`
  }
];

let totalChanges = 0;

filesToConvert.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Bỏ qua: ${filePath} (không tồn tại)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileChanges = 0;
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern.from);
    if (matches) {
      content = content.replace(pattern.from, pattern.to);
      fileChanges += matches.length;
    }
  });

  if (fileChanges > 0) {
    // Backup
    fs.writeFileSync(fullPath + '.backup', fs.readFileSync(fullPath));
    
    // Ghi file mới
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}: ${fileChanges} thay đổi`);
    totalChanges += fileChanges;
  } else {
    console.log(`ℹ️  ${filePath}: Không cần thay đổi`);
  }
});

console.log(`\n✅ Hoàn thành! Tổng: ${totalChanges} thay đổi`);
console.log(`💡 Backup được lưu với đuôi .backup`);
