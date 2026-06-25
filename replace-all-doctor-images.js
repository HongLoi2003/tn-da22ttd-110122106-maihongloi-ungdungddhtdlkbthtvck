// Script thay thế tất cả ảnh bác sĩ bằng logo.png
const fs = require('fs');
const path = require('path');

const doctorImages = [
  'tranthilan.png',
  'tranthimai.png',
  'leminhtam.png',
  'nguyenvanam.png',
  'dominhtuan.png',
  'vuthilan.png',
  'hoangvanduc.png',
  'ngothihuong.png',
  'nguyenthihoa.png',
  'tranvankhoa.png',
  'phamminhquan.png',
  'lethihang.png',
  'nguyenvanhai.png'
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  doctorImages.forEach(img => {
    const regex = new RegExp(`'${img}':\\s*require\\('@/assets/images/${img}'\\)`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `'${img}': require('@/assets/images/logo.png')`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  });
}

console.log('🔧 Replacing all doctor images with logo.png...\n');
walkDir('./app');
console.log('\n✅ Done! All doctor images now use logo.png');
console.log('📦 Run: npx eas-cli build --platform android --profile preview --clear-cache');
