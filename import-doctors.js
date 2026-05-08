const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Khởi tạo Firebase Admin SDK
// Tải file serviceAccountKey.json từ Firebase Console
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importDoctors() {
  try {
    // Đọc file doctors.json
    const doctorsPath = path.join(__dirname, 'doctors.json');
    const doctorsData = JSON.parse(fs.readFileSync(doctorsPath, 'utf8'));

    console.log(`Bắt đầu import ${doctorsData.length} bác sĩ...`);

    // Thêm từng bác sĩ vào Firestore
    for (const doctor of doctorsData) {
      await db.collection('doctors').doc(doctor.id).set(doctor);
      console.log(`✓ Đã thêm: ${doctor.ten}`);
    }

    console.log('✓ Import thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi import:', error);
    process.exit(1);
  }
}

importDoctors();
