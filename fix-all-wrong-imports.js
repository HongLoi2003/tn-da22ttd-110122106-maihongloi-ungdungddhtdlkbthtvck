const fs = require('fs');
const path = require('path');

console.log('=== FIX ALL WRONG @/app/... IMPORTS ===\n');

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
  
  // Check if file has wrong imports
  if (content.includes("'@/app/") || content.includes('"@/app/')) {
    console.log(`📝 Fixing ${file}...`);
    
    const before = content;
    
    // Replace @/app/config with @/config
    content = content.replace(/@\/app\/config/g, '@/config');
    
    // Replace @/app/services with @/services
    content = content.replace(/@\/app\/services/g, '@/services');
    
    // Replace @/app/utils with @/utils
    content = content.replace(/@\/app\/utils/g, '@/utils');
    
    // Replace @/app/components with @/components
    content = content.replace(/@\/app\/components/g, '@/components');
    
    // Replace @/app/context with @/context
    content = content.replace(/@\/app\/context/g, '@/context');
    
    // Replace any other @/app/ with @/
    content = content.replace(/@\/app\//g, '@/');
    
    if (content !== before) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    }
  }
});

console.log(`\n✅ Fixed ${fixedCount} files with wrong imports!`);
console.log('Reload Expo: Press "r" in terminal');
