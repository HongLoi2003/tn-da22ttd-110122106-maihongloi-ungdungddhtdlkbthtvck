const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapping bác sĩ với URL ảnh
const doctorImageUrls = {
  'nguyenvanam.png': 'https://i.pravatar.cc/200?img=12',
  'tranthilan.png': 'https://i.pravatar.cc/200?img=5',
  'leminhtam.png': 'https://i.pravatar.cc/200?img=33',
  'tranthimai.png': 'https://i.pravatar.cc/200?img=47',
  'lehoangnam.png': 'https://i.pravatar.cc/200?img=13',
  'phamthuha.png': 'https://i.pravatar.cc/200?img=48',
  'dominhtuan.png': 'https://i.pravatar.cc/200?img=15',
  'vuthilan.png': 'https://i.pravatar.cc/200?img=9',
  'hoangvanduc.png': 'https://i.pravatar.cc/200?img=68',
  'ngothihuong.png': 'https://i.pravatar.cc/200?img=23',
  'nguyenthihoa.png': 'https://i.pravatar.cc/200?img=44',
  'tranvankhoa.png': 'https://i.pravatar.cc/200?img=51',
  'phamminhquan.png': 'https://i.pravatar.cc/200?img=59',
  'lethihang.png': 'https://i.pravatar.cc/200?img=45',
  'nguyenvanhai.png': 'https://i.pravatar.cc/200?img=60',
  'dangthithao.jpg': 'https://i.pravatar.cc/200?img=32',
};

console.log('🔍 Tìm kiếm tất cả file có require ảnh bác sĩ...\n');

function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Tìm tất cả file .tsx và .ts
const allFiles = findAllFiles(path.join(__dirname, 'app'));

let fixedCount = 0;
const fixedFiles = [];

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;
    
    // Thay thế tất cả các require('@/assets/images/...') bằng URL
    Object.entries(doctorImageUrls).forEach(([fileName, url]) => {
      // Pattern 1: require('@/assets/images/filename.png')
      const patterns = [
        new RegExp(`require\\(['"]@\\/assets\\/images\\/${fileName.replace('.', '\\.')}['"]\\)`, 'g'),
        new RegExp(`require\\(['"]\\.\\.?\\/assets\\/images\\/${fileName.replace('.', '\\.')}['"]\\)`, 'g'),
        new RegExp(`require\\(['"]@\\/assets\\/images\\/${fileName.replace(/\.(png|jpg)$/, '')}['"]\\)`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, `{ uri: '${url}' }`);
          modified = true;
        }
      });
    });
    
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = path.relative(__dirname, filePath);
      console.log(`✅ ${relativePath}`);
      fixedFiles.push(relativePath);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý ${filePath}: ${error.message}`);
  }
});

console.log(`\n✅ Hoàn thành! Đã sửa ${fixedCount} file.`);

if (fixedFiles.length > 0) {
  console.log('\n📋 Danh sách file đã sửa:');
  fixedFiles.forEach(file => console.log(`  - ${file}`));
}
