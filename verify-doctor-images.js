const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra tất cả ảnh bác sĩ đã được thay thế...\n');

const doctorImageNames = [
  'nguyenvanam', 'tranthilan', 'leminhtam', 'tranthimai', 
  'phamthuha', 'dominhtuan', 'vuthilan', 'hoangvanduc',
  'ngothihuong', 'nguyenthihoa', 'tranvankhoa', 'phamminhquan',
  'lethihang', 'nguyenvanhai', 'dangthithao', 'lehoangnam'
];

function searchInFile(filePath, content) {
  const found = [];
  doctorImageNames.forEach(name => {
    const pattern = new RegExp(`require\\(['"]@\\/assets\\/images\\/${name}`, 'gi');
    if (pattern.test(content)) {
      found.push(name);
    }
  });
  return found;
}

function findAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules') {
            findAllFiles(filePath, fileList);
          }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip files that can't be read
      }
    });
  } catch (err) {
    // Skip directories that can't be read
  }
  
  return fileList;
}

const allFiles = findAllFiles(__dirname);
let foundIssues = false;

allFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = searchInFile(filePath, content);
    
    if (found.length > 0) {
      foundIssues = true;
      const relativePath = path.relative(__dirname, filePath);
      console.log(`❌ ${relativePath}`);
      console.log(`   Còn require: ${found.join(', ')}\n`);
    }
  } catch (error) {
    // Skip files that can't be read
  }
});

if (!foundIssues) {
  console.log('✅ Tất cả ảnh bác sĩ đã được thay thế bằng URL!');
  console.log('\n📋 Danh sách URL được sử dụng:');
  console.log('  - https://i.pravatar.cc/200?img=12  (nguyenvanam.png)');
  console.log('  - https://i.pravatar.cc/200?img=5   (tranthilan.png)');
  console.log('  - https://i.pravatar.cc/200?img=33  (leminhtam.png)');
  console.log('  - https://i.pravatar.cc/200?img=47  (tranthimai.png)');
  console.log('  - https://i.pravatar.cc/200?img=13  (lehoangnam.png)');
  console.log('  - https://i.pravatar.cc/200?img=48  (phamthuha.png)');
  console.log('  - https://i.pravatar.cc/200?img=15  (dominhtuan.png)');
  console.log('  - https://i.pravatar.cc/200?img=9   (vuthilan.png)');
  console.log('  - https://i.pravatar.cc/200?img=68  (hoangvanduc.png)');
  console.log('  - https://i.pravatar.cc/200?img=23  (ngothihuong.png)');
  console.log('  - https://i.pravatar.cc/200?img=44  (nguyenthihoa.png)');
  console.log('  - https://i.pravatar.cc/200?img=51  (tranvankhoa.png)');
  console.log('  - https://i.pravatar.cc/200?img=59  (phamminhquan.png)');
  console.log('  - https://i.pravatar.cc/200?img=45  (lethihang.png)');
  console.log('  - https://i.pravatar.cc/200?img=60  (nguyenvanhai.png)');
  console.log('  - https://i.pravatar.cc/200?img=32  (dangthithao.jpg)');
} else {
  console.log('⚠️  Vẫn còn file cần sửa!');
}
