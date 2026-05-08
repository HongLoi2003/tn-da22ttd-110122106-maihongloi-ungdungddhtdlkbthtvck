const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Khởi tạo Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Hàm import dữ liệu từ file JSON
async function importCollection(collectionName, fileName) {
  try {
    const filePath = path.join(__dirname, fileName);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`\nBắt đầu import ${data.length} ${collectionName}...`);

    for (const item of data) {
      const docId = item.id;
      delete item.id; // Xóa id khỏi data vì sẽ dùng làm document ID
      
      await db.collection(collectionName).doc(docId).set(item);
      console.log(`✓ Đã thêm: ${item.ten || item.name || item.fullName || docId}`);
    }

    console.log(`✓ Import ${collectionName} thành công!`);
  } catch (error) {
    console.error(`Lỗi import ${collectionName}:`, error);
  }
}

// Hàm chính
async function importAllData() {
  try {
    console.log('=== BẮT ĐẦU IMPORT DỮ LIỆU VÀO FIREBASE ===\n');

    // Import từng collection
    await importCollection('doctors', 'doctors.json');
    await importCollection('hospitals', 'hospitals.json');
    await importCollection('users', 'users.json');
    await importCollection('appointments', 'appointments.json');
    await importCollection('conversations', 'conversations.json');
    await importCollection('messages', 'messages.json');
    await importCollection('medical-records', 'medical-records.json');
    await importCollection('prescriptions', 'prescriptions.json');

    console.log('\n=== HOÀN THÀNH IMPORT TẤT CẢ DỮ LIỆU ===');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

importAllData();
