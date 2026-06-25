const fs = require('fs');
const path = require('path');

console.log('🔍 Tìm tất cả file còn require ảnh...\n');

const doctorImageNames = [
  'nguyenvanam', 'tranthilan', 'leminhtam', 'tranthimai', 
  'lehoangnam', 'phamthuha', 'dominhtuan', 'vuthilan', 
  'hoangvanduc', 'ngothihuong', 'nguyenthihoa', 'tranvankhoa',
  'phamminhquan', 'lethihang', 'nguyenvanhai', 'dangthithao'
];

function searchInFile(filePath, content) {
  const found = [];
  
  // Tìm tất cả pattern require ảnh
  const patterns = [
    /require\(['"](\.\.\/)*assets\/images\/[^'"]+\.(png|jpg)['"]\)/g,
    /require\(['"]@\/assets\/images\/[^'"]+\.(png|jpg)['"]\)/g,
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Kiểm tra xem có phải ảnh bác sĩ không
        const isDoctorImage = doctorImageNames.some(name => match.includes(name));
        if (isDoctorImage) {
          found.push(match);
        }
      });
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
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip
      }
    });
  } catch (err) {
    // Skip
  }
  
  return fileList;
}

const allFiles = findAllFiles(path.join(__dirname, 'app'));
let foundIssues = false;
const issueFiles = [];

allFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = searchInFile(filePath, content);
    
    if (found.length > 0) {
      foundIssues = true;
      const relativePath = path.relative(__dirname, filePath);
      console.log(`❌ ${relativePath}`);
      found.forEach(match => console.log(`   ${match}`));
      console.log('');
      issueFiles.push(relativePath);
    }
  } catch (error) {
    // Skip
  }
});

if (!foundIssues) {
  console.log('✅ Không còn file nào require ảnh bác sĩ local!');
  console.log('\n🚀 Sẵn sàng build APK:');
  console.log('   npx eas-cli build --platform android --profile preview --clear-cache\n');
} else {
  console.log('⚠️  Cần sửa các file sau:');
  issueFiles.forEach(file => console.log(`   - ${file}`));
  console.log('\n💡 Hướng dẫn sửa:');
  console.log('   Thay require(...) bằng tên file string');
  console.log('   Ví dụ: require("../../assets/images/hoangvanduc.png")');
  console.log('         -> "hoangvanduc.png"\n');
}
