/**
 * Script tạo hàng loạt tài khoản bác sĩ trong Firestore
 * 
 * CÁCH DÙNG:
 * 1. Cập nhật danh sách bác sĩ trong mảng DOCTORS_TO_CREATE
 * 2. Chạy: node create-doctor-accounts-batch.js
 * 3. Bác sĩ có thể dùng "Quên mật khẩu" để đặt password mới
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// ===== CẤU HÌNH: DANH SÁCH BÁC SĨ CẦN TẠO =====
const DOCTORS_TO_CREATE = [
  {
    email: 'bs.nguyenvana@hospital.com',
    fullName: 'BS. Nguyễn Văn A',
    phone: '0901234567',
    specialty: 'Nội khoa',
    licenseNumber: 'BS001',
    experience: 10,
    defaultPassword: 'Doctor@123' // Password tạm, bác sĩ sẽ đổi qua "Quên mật khẩu"
  },
  {
    email: 'bs.tranthib@hospital.com',
    fullName: 'BS. Trần Thị B',
    phone: '0907654321',
    specialty: 'Nhi khoa',
    licenseNumber: 'BS002',
    experience: 8,
    defaultPassword: 'Doctor@123'
  },
  // Thêm bác sĩ khác tại đây...
];

// ===== HÀM TẠO TÀI KHOẢN =====
async function createDoctorAccount(doctorData) {
  const { email, fullName, phone, specialty, licenseNumber, experience, defaultPassword } = doctorData;
  
  console.log(`\n📝 Creating account for: ${fullName} (${email})`);
  
  try {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingUsers = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();
    
    if (!existingUsers.empty) {
      console.log(`⚠️  Account already exists in Firestore`);
      return { success: false, reason: 'exists' };
    }
    
    // 2. Tạo Firebase Auth account
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        email: email.toLowerCase(),
        password: defaultPassword,
        displayName: fullName,
      });
      console.log(`✅ Firebase Auth account created with UID: ${firebaseUser.uid}`);
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        console.log(`⚠️  Firebase Auth account exists, getting existing user...`);
        firebaseUser = await auth.getUserByEmail(email.toLowerCase());
        
        // Update password
        await auth.updateUser(firebaseUser.uid, {
          password: defaultPassword,
        });
        console.log(`✅ Updated password for existing Firebase Auth account`);
      } else {
        throw authError;
      }
    }
    
    // 3. Tạo Firestore document
    const userData = {
      uid: firebaseUser.uid,
      email: email.toLowerCase(),
      password: defaultPassword, // Lưu password trong Firestore
      fullName: fullName,
      phone: phone,
      role: 'doctor',
      specialty: specialty,
      licenseNumber: licenseNumber,
      experience: experience,
      avatar: '',
      address: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await db.collection('users').add(userData);
    console.log(`✅ Firestore document created`);
    console.log(`📧 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   👉 Bác sĩ nên đổi password qua "Quên mật khẩu" sau khi đăng nhập lần đầu`);
    
    return { success: true, uid: firebaseUser.uid };
    
  } catch (error) {
    console.error(`❌ Error creating account:`, error.message);
    return { success: false, error: error.message };
  }
}

// ===== MAIN =====
async function main() {
  console.log('🚀 Starting batch doctor account creation...\n');
  console.log(`📊 Total doctors to create: ${DOCTORS_TO_CREATE.length}\n`);
  
  const results = {
    success: 0,
    failed: 0,
    exists: 0,
  };
  
  for (const doctorData of DOCTORS_TO_CREATE) {
    const result = await createDoctorAccount(doctorData);
    
    if (result.success) {
      results.success++;
    } else if (result.reason === 'exists') {
      results.exists++;
    } else {
      results.failed++;
    }
    
    // Delay giữa các requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log(`✅ Success: ${results.success}`);
  console.log(`⚠️  Already exists: ${results.exists}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('='.repeat(50));
  
  process.exit(0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
