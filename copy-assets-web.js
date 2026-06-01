/**
 * Script để copy assets sang public folder cho Expo Web
 * Chạy: node copy-assets-web.js
 */

const fs = require('fs');
const path = require('path');

// Tạo folder public/assets/images nếu chưa có
const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(publicDir, 'assets');
const imagesDir = path.join(assetsDir, 'images');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
  console.log('✅ Created public/');
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
  console.log('✅ Created public/assets/');
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
  console.log('✅ Created public/assets/images/');
}

// Copy tất cả ảnh từ assets/images sang public/assets/images
const sourceDir = path.join(__dirname, 'assets', 'images');

if (!fs.existsSync(sourceDir)) {
  console.error('❌ Source directory not found:', sourceDir);
  process.exit(1);
}

const files = fs.readdirSync(sourceDir);
let copiedCount = 0;

files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(imagesDir, file);
  
  // Chỉ copy files, không copy folders
  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, destPath);
    copiedCount++;
    console.log(`📋 Copied: ${file}`);
  }
});

console.log(`\n✅ Done! Copied ${copiedCount} images to public/assets/images/`);
console.log('🌐 Web images are ready!');
