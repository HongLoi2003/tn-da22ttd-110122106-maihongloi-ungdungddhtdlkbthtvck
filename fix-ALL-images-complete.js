const fs = require('fs');
const path = require('path');

console.log('=== FIX ALL IMAGE REQUIRES IN APP FOLDER ===\n');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(path.join(__dirname, 'app'));
let fixedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if file has image requires
  if (content.includes("require('@/assets/images/") || content.includes('require("@/assets/images/')) {
    console.log(`📝 Fixing ${file}...`);
    
    // Replace all require('@/assets/images/...')
    const before = content;
    content = content.replace(
      /require\(['"]@\/assets\/images\/[^'"]+['"]\)/g,
      '{ uri: "https://via.placeholder.com/150" }'
    );
    
    if (content !== before) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    }
  }
});

console.log(`\n✅ Fixed ${fixedCount} files total!`);
console.log('Reload Expo: Press "r" in terminal or restart with Ctrl+C');
