/**
 * Upload ảnh lên Firebase Storage và lấy URL
 * Chạy: node upload-images-to-firebase.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Khởi tạo Firebase Admin (cần file service account)
// Download từ: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://your-project-id.appspot.com' // Thay bằng bucket của bạn
});

const bucket = admin.storage().bucket();

// Danh sách ảnh cần upload
const imagesToUpload = [
  'benhviendhtv.png',
  'hearderddau.png',
  'benhvien.png',
  'ai.png',
  'thaikykhoemanh.png',
  'chamsocrang.png',
  'bacsi.png',
  'bckgour.png',
  'dauhieubenhtim.png',
  'leminhtam.png',
  'nguyenthihoa.png',
  'chamsocdamun.png',
  'stress.png',
  'dominhtuan.png',
  'daukhopgoi.png',
  'chedouonguoc.png',
  'yoga.png',
  'viemxoangmantinh.png',
  'chamsoctresosinh.png'
];

async function uploadImage(filename) {
  const localPath = path.join(__dirname, 'assets', 'images', filename);
  
  if (!fs.existsSync(localPath)) {
    console.log(`⚠️  Bỏ qua: ${filename} (không tồn tại)`);
    return null;
  }

  try {
    const destination = `images/${filename}`;
    
    // Upload
    await bucket.upload(localPath, {
      destination: destination,
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000', // Cache 1 năm
      },
    });

    // Lấy public URL
    const file = bucket.file(destination);
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    console.log(`✅ ${filename}`);
    console.log(`   URL: ${publicUrl}`);
    
    return { filename, url: publicUrl };
  } catch (error) {
    console.error(`❌ Lỗi upload ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 BẮT ĐẦU UPLOAD ẢNH LÊN FIREBASE STORAGE\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const filename of imagesToUpload) {
    const result = await uploadImage(filename);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ HOÀN THÀNH!\n');
  console.log(`📊 Đã upload: ${results.length}/${imagesToUpload.length} ảnh\n`);
  
  // Tạo file mapping
  const mapping = {};
  results.forEach(({ filename, url }) => {
    mapping[filename] = url;
  });
  
  fs.writeFileSync(
    'firebase-image-urls.json',
    JSON.stringify(mapping, null, 2),
    'utf8'
  );
  
  console.log('💾 Đã lưu URL vào: firebase-image-urls.json');
  console.log('\n💡 Bước tiếp theo:');
  console.log('   1. Copy URL từ firebase-image-urls.json');
  console.log('   2. Thay thế URL Unsplash trong imageHelper.ts');
  console.log('   3. Build lại app\n');
}

main().catch(console.error);
