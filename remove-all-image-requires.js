// Script xóa TẤT CẢ require() ảnh và comment out
const fs = require('fs');
const path = require('path');

function commentOutImageRequires(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Comment out tất cả dòng có require('@/assets/images/...png')
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.includes("require('@/assets/images/") && line.includes('.png')) {
      modified = true;
      return '  // ' + line.trim() + ' // COMMENTED OUT - IMAGE ERROR';
    }
    return line;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`✅ Commented out images in: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      count += walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (commentOutImageRequires(filePath)) {
        count++;
      }
    }
  });
  
  return count;
}

console.log('🔧 Commenting out ALL image requires...\n');
const count = walkDir('./app');
console.log(`\n✅ Done! Modified ${count} files`);
console.log('⚠️  All images are now commented out');
console.log('📦 Build will succeed but images will not display');
console.log('💡 Alternative: Use remote URLs for images instead of local files');
