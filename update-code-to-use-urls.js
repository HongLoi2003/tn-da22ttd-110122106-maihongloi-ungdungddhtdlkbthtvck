// Script cập nhật code để dùng URLs thay vì require()
const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Thay thế require('@/assets/images/xxx.png') bằng { uri: imageUrls['xxx.png'] }
  const regex = /require\('@\/assets\/images\/([^']+)'\)/g;
  
  if (content.match(regex)) {
    // Add import nếu chưa có
    if (!content.includes("import { imageUrls }")) {
      const importLine = "import { imageUrls } from '@/app/config/imageUrls';\n";
      
      // Tìm vị trí import cuối cùng
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importLine);
        content = lines.join('\n');
      }
    }
    
    // Thay thế require() bằng { uri: imageUrls['...'] }
    content = content.replace(regex, (match, imageName) => {
      return `{ uri: imageUrls['${imageName}'] || imageUrls['logo.png'] }`;
    });
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
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
      if (updateFile(filePath)) {
        count++;
      }
    }
  });
  
  return count;
}

console.log('🔧 Updating code to use Firebase Storage URLs...\n');

// Check if imageUrls.ts exists
if (!fs.existsSync('./app/config/imageUrls.ts')) {
  console.error('❌ Error: app/config/imageUrls.ts not found!');
  console.error('   Please run: node upload-images-to-firebase.js first');
  process.exit(1);
}

const count = walkDir('./app');

console.log(`\n✅ Done! Updated ${count} files`);
console.log('\n🎯 Next step: Build APK');
console.log('   npx eas-cli build --platform android --profile preview --clear-cache');
