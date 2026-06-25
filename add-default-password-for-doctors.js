/**
 * Script thêm password mặc định "123456" cho tất cả bác sĩ
 * 
 * CÁCH DÙNG:
 * node add-default-password-for-doctors.js
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Check if already initialized
if (getApps().length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();
const auth = getAuth();

const DEFAULT_PASSWORD = '123456';

async function addPasswordForDoctor(email, uid, fullName) {
  console.log(`\n📝 Processing: ${fullName} (${email})`);
  
  try {
    // 1. Tìm doctor trong Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`❌ Not found in Firestore`);
      return { success: false };
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    // 2. Cập nhật password trong Firestore
    await userDoc.ref.update({
      password: DEFAULT_PASSWORD,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ Password updated in Firestore`);
    
    // 3. Sync Firebase Auth password
    try {
      await auth.updateUser(uid, {
        password: DEFAULT_PASSWORD,
      });
      console.log(`✅ Firebase Auth password synced`);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log(`⚠️  Firebase Auth user not found, creating...`);
        
        // Tạo Firebase Auth account mới
        await auth.createUser({
          uid: uid, // Giữ nguyên UID
          email: email.toLowerCase(),
          password: DEFAULT_PASSWORD,
          displayName: fullName,
        });
        
        console.log(`✅ Firebase Auth account created`);
      } else {
        console.warn(`⚠️  Firebase Auth sync failed: ${authError.message}`);
      }
    }
    
    console.log(`📧 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    
    return { success: true };
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Adding default password for all doctors...\n');
  console.log(`🔑 Default password: ${DEFAULT_PASSWORD}\n`);
  
  // Danh sách bác sĩ từ kết quả debug
  const doctors = [
    { email: 'tranvankhoa@gmail.com', uid: 'qE9BAaA6dXhCVuARwSe6fcQ4Gp62', fullName: 'BS. Trần Văn Khoa' },
    { email: 'vuthilan@gmail.com', uid: 'Ng98CXXtK6ei0gerTd8SlML7AzN2', fullName: 'BS. Vũ Thị Lan' },
    { email: 'lehoangnam@gmail.com', uid: 'mY9kyqll66c8tkSlwPCq11am7DR2', fullName: 'BS. Lê Hoàng Nam' },
    { email: 'nguyenthihoa@gmail.com', uid: 'qddUK3XBZaar7yZ9dvu0FLDpesG2', fullName: 'BS. Nguyễn Thị Hoa' },
    { email: 'tranthimai@gmail.com', uid: 'NHbMROGpWOV4xxlXB8EhPi5nKZ82', fullName: 'BS. Trần Thị Mai' },
    { email: 'nguyenvanhai@gmail.com', uid: 'DAKjXXMthLQT0EV4hXZfLzgrrLA2', fullName: 'BS. Nguyễn Văn Hải' },
    { email: 'dominhtuan@gmail.com', uid: 'E1Nluyx4RzMsSLq7INK1YPZ13U82', fullName: 'BS. Đỗ Minh Tuấn' },
    { email: 'hoangvanduc@gmail.com', uid: '7OLFDPQWcwRiDMfTLP9yswV7pYG3', fullName: 'BS. Hoàng Văn Đức' },
    { email: 'tranthilan@gmail.com', uid: '8MEPZwHHq7fgJvSnbYgtoJlApDg2', fullName: 'BS. Trần Thị Lan' },
    { email: 'dangthithao@gmail.com', uid: 'RdllWOpf11Mhwz4NtsupNkDz2Vq2', fullName: 'BS. Đặng Thị Thảo' },
    { email: 'phamthuha@gmail.com', uid: 'be3Bm0Rr7hSsIyu0Ri6zgtfB8WK2', fullName: 'BS. Phạm Thu Hà' },
    { email: 'ngothihuong@gmail.com', uid: '2e2rJkQ7xUYlxMjqxK1i8c9rztl1', fullName: 'BS. Ngô Thị Hương' },
    { email: 'phamminhquan@gmail.com', uid: '1wroWrjwr1OjczM19LSRwSwvGI02', fullName: 'BS. Phạm Minh Quân' },
    { email: 'leminhtam@gmail.com', uid: 'zocOAhTF1BhQyXjRXhgMO25N73K2', fullName: 'BS. Lê Minh Tâm' },
    { email: 'lethihang@gmail.com', uid: 'rplTCJlrt7f6F4g6Yh4TzbQWlfI2', fullName: 'BS. Lê Thị Hằng' },
  ];
  
  const results = {
    success: 0,
    failed: 0,
  };
  
  for (const doctor of doctors) {
    const result = await addPasswordForDoctor(doctor.email, doctor.uid, doctor.fullName);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
    }
    
    // Delay giữa các requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY:');
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('='.repeat(70));
  console.log('\n📝 HƯỚNG DẪN CHO BÁC SĨ:');
  console.log(`1. Đăng nhập với:`);
  console.log(`   Email: <email-cua-bac-si>`);
  console.log(`   Password: ${DEFAULT_PASSWORD}`);
  console.log(`\n2. SAU KHI ĐĂNG NHẬP, NÊN ĐỔI PASSWORD NGAY:`);
  console.log(`   - Vào Profile/Settings`);
  console.log(`   - Chọn "Đổi mật khẩu"`);
  console.log(`   - Nhập password mới`);
  console.log(`\n3. HOẶC dùng "Quên mật khẩu" để tạo password mới qua OTP`);
  console.log('='.repeat(70));
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
