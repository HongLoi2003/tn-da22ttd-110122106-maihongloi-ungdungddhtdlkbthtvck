// Script chuyển ảnh thành base64 và nhúng trực tiếp vào code
// KHÔNG CẦN Firebase Storage, KHÔNG CẦN upgrade plan
const fs = require('fs');
const path = require('path');

const imagesDir = './assets/images';
const outputFile = './app/config/imageData.ts';

function imageToBase64(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}

function generateImageData() {
  console.log('🔄 Converting images to base64...\n');
  
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));
  
  const imageData = {};
  
  imageFiles.forEach(file => {
    const filePath = path.join(imagesDir, file);
    try {
      imageData[file] = imageToBase64(filePath);
      console.log(`✅ Converted: ${file}`);
    } catch (error) {
      console.error(`❌ Error: ${file}`, error.message);
    }
  });
  
  // Generate TypeScript file
  const content = `// Auto-generated base64 image data
// Generated at: ${new Date().toISOString()}
// NO Firebase Storage needed!

export const imageData: { [key: string]: string } = ${JSON.stringify(imageData, null, 2)};

export function getImageData(imageName: string): string {
  return imageData[imageName] || imageData['logo.png'];
}
`;
  
  fs.writeFileSync(outputFile, content);
  
  console.log(`\n✅ Done! Converted ${Object.keys(imageData).length} images`);
  console.log(`📝 Saved to: ${outputFile}`);
  console.log('\n⚠️ WARNING: File will be LARGE (~${Math.round(JSON.stringify(imageData).length / 1024)}KB)');
  console.log('\n🎯 Next step: Run update script');
  console.log('   node update-code-for-base64.js');
}

generateImageData();
