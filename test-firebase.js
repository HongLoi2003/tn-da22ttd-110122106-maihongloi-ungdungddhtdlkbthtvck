// Script để test kết nối Firebase từ Node.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔍 Kiểm tra cấu hình Firebase...\n');

// Check config
const configKeys = Object.keys(firebaseConfig);
let missingKeys = [];

configKeys.forEach(key => {
  const value = firebaseConfig[key];
  if (!value || value.trim() === '') {
    console.log(`❌ ${key}: THIẾU`);
    missingKeys.push(key);
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  }
});

if (missingKeys.length > 0) {
  console.log('\n❌ Thiếu các biến môi trường:', missingKeys.join(', '));
  console.log('Vui lòng kiểm tra file .env.local');
  process.exit(1);
}

console.log('\n✅ Tất cả biến môi trường đã được cấu hình\n');

// Initialize Firebase
console.log('🔥 Đang khởi tạo Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log('✅ Firebase đã được khởi tạo\n');

// Test Firestore connection
async function testFirestore() {
  console.log('📊 Đang kiểm tra kết nối Firestore...');
  
  try {
    // Try to read users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(5));
    const snapshot = await getDocs(q);
    
    console.log(`✅ Kết nối Firestore thành công!`);
    console.log(`📄 Tìm thấy ${snapshot.size} users trong database`);
    
    if (snapshot.size > 0) {
      console.log('\n👥 Danh sách users:');
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.email || 'N/A'} (${data.role || 'no role'}) - UID: ${data.uid || doc.id}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối Firestore:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'permission-denied' || error.message.includes('permission')) {
      console.log('\n⚠️ LỖI PHÂN QUYỀN!');
      console.log('Cần cập nhật Firestore Rules:');
      console.log('1. Mở Firebase Console');
      console.log('2. Vào Firestore Database > Rules');
      console.log('3. Cập nhật rules cho phép đọc collection users');
    }
    
    return false;
  }
}

// Test Authentication
async function testAuth() {
  console.log('\n🔐 Đang kiểm tra Firebase Authentication...');
  
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('✅ Đã đăng nhập:', currentUser.email);
    console.log('UID:', currentUser.uid);
  } else {
    console.log('ℹ️ Chưa đăng nhập (Auth hoạt động bình thường)');
  }
  
  return true;
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('           KIỂM TRA KẾT NỐI FIREBASE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const authOk = await testAuth();
  const firestoreOk = await testFirestore();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    KẾT QUẢ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Firebase Auth:      ${authOk ? '✅ OK' : '❌ LỖI'}`);
  console.log(`Firestore:          ${firestoreOk ? '✅ OK' : '❌ LỖI'}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (authOk && firestoreOk) {
    console.log('🎉 Tất cả kiểm tra đều THÀNH CÔNG!');
    console.log('Firebase đã sẵn sàng sử dụng.\n');
  } else {
    console.log('⚠️ Có lỗi xảy ra. Vui lòng kiểm tra lại cấu hình.\n');
  }
  
  process.exit(firestoreOk ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n❌ Lỗi không mong đợi:', error);
  process.exit(1);
});
