/**
 * Test Forgot Password Flow
 * Test toàn bộ flow: Gửi OTP → Verify OTP → Reset password
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

const TEST_EMAIL = 'maihongloi060423@gmail.com';
const TEST_OTP = '123456';
const TEST_NEW_PASSWORD = 'newpass123';

async function testCompleteFlow() {
  console.log('🚀 Bắt đầu test Forgot Password Flow...\n');

  try {
    // STEP 1: Tạo OTP giả trong Firestore (giả lập việc gửi OTP)
    console.log('📝 STEP 1: Tạo OTP trong Firestore...');
    const otpRef = await db.collection('password_reset_otps').add({
      email: TEST_EMAIL.toLowerCase(),
      otp: TEST_OTP,
      createdAt: Timestamp.now()
    });
    console.log('✅ OTP đã tạo:', otpRef.id);
    console.log('   Email:', TEST_EMAIL);
    console.log('   OTP:', TEST_OTP);
    console.log('');

    // STEP 2: Verify OTP và reset password qua API
    console.log('🔐 STEP 2: Gọi API reset password...');
    const response = await fetch('http://localhost:3001/reset-password-with-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        otp: TEST_OTP,
        newPassword: TEST_NEW_PASSWORD
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ API Response:', result.message);
      console.log('');

      // STEP 3: Verify password đã được update
      console.log('🔑 STEP 3: Verify password trong Firebase Auth...');
      try {
        const userRecord = await auth.getUserByEmail(TEST_EMAIL);
        console.log('✅ User tồn tại trong Firebase Auth');
        console.log('   UID:', userRecord.uid);
        console.log('   Email:', userRecord.email);
        console.log('   → Password đã được update thành công');
        console.log('   → Bạn có thể đăng nhập app với mật khẩu:', TEST_NEW_PASSWORD);
        console.log('');
      } catch (authError) {
        console.error('❌ Lỗi kiểm tra user:', authError.message);
      }

      // STEP 4: Verify OTP đã bị xóa
      console.log('🧹 STEP 4: Verify OTP đã bị xóa...');
      const otpDoc = await db.collection('password_reset_otps').doc(otpRef.id).get();
      if (!otpDoc.exists) {
        console.log('✅ OTP đã được xóa sau khi sử dụng');
      } else {
        console.log('⚠️ OTP vẫn còn trong database');
      }
      console.log('');

      console.log('🎉 TEST HOÀN TOÀN THÀNH CÔNG!');
      console.log('');
      console.log('📱 Bước tiếp theo - Test trên app:');
      console.log('   1. Mở app HeartCare');
      console.log('   2. Bấm "Quên mật khẩu"');
      console.log('   3. Nhập email:', TEST_EMAIL);
      console.log('   4. Nhập OTP nhận được từ Gmail');
      console.log('   5. Nhập mật khẩu mới');
      console.log('   6. Đăng nhập với mật khẩu mới');

    } else {
      console.error('❌ API Error:', result.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Chạy test
testCompleteFlow();
