const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Khởi tạo Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    throw error;
  }
}

const db = admin.firestore();

async function updateDoctorImages() {
  try {
    console.log('🔧 Bắt đầu cập nhật image names trong Firebase...\n');

    // Đọc file doctors.json
    const doctorsData = JSON.parse(fs.readFileSync('doctors.json', 'utf8'));

    for (const doctor of doctorsData) {
      const { id, ten, image } = doctor;
      
      console.log(`📝 Cập nhật bác sĩ ${ten} (${id})...`);
      console.log(`   Image: ${image}`);

      // Cập nhật trong Firestore
      await db.collection('doctors').doc(id).update({
        image: image,
        hinh_anh: image, // Cập nhật cả 2 field
      });

      console.log(`✅ Đã cập nhật ${id}\n`);
    }

    console.log('\n✅ Hoàn thành cập nhật tất cả bác sĩ!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateDoctorImages();
