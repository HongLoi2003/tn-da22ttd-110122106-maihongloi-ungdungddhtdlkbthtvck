const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin với service account key
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Cho phép tất cả origins trong dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HeartCare Password Reset API',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /verify-otp
 * Verify OTP only (without resetting password)
 * 
 * Body: { email, otp }
 */
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  console.log('🔍 Verify OTP request for:', email);

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email và OTP là bắt buộc'
    });
  }

  try {
    // 1. Verify OTP từ Firestore
    const otpSnapshot = await admin.firestore()
      .collection('password_reset_otps')
      .where('email', '==', email.toLowerCase())
      .where('otp', '==', otp)
      .limit(1)
      .get();

    if (otpSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Mã OTP không hợp lệ'
      });
    }

    const otpDoc = otpSnapshot.docs[0];
    const otpData = otpDoc.data();

    // 2. Kiểm tra OTP đã hết hạn chưa (15 phút)
    const otpCreatedAt = otpData.createdAt.toDate();
    const now = new Date();
    const diffMinutes = (now - otpCreatedAt) / 1000 / 60;

    if (diffMinutes > 15) {
      // Xóa OTP đã hết hạn
      await otpDoc.ref.delete();
      return res.status(410).json({
        success: false,
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu OTP mới.'
      });
    }

    console.log('✅ OTP verified successfully for:', email);

    return res.json({
      success: true,
      message: 'Mã OTP hợp lệ'
    });
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);

    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại.'
    });
  }
});

/**
 * POST /reset-password-with-otp
 * Reset password after OTP verification
 * 
 * Body: { email, otp, newPassword }
 */
app.post('/reset-password-with-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  console.log('🔐 Reset password request for:', email);

  // Validate input
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP, và mật khẩu mới là bắt buộc'
    });
  }

  try {
    // 1. Verify OTP từ Firestore
    const otpSnapshot = await admin.firestore()
      .collection('password_reset_otps')
      .where('email', '==', email.toLowerCase())
      .where('otp', '==', otp)
      .limit(1)
      .get();

    if (otpSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'OTP không hợp lệ hoặc đã hết hạn'
      });
    }

    const otpDoc = otpSnapshot.docs[0];
    const otpData = otpDoc.data();

    // 2. Kiểm tra OTP đã hết hạn chưa (15 phút)
    const otpCreatedAt = otpData.createdAt.toDate();
    const now = new Date();
    const diffMinutes = (now - otpCreatedAt) / 1000 / 60;

    if (diffMinutes > 15) {
      // Xóa OTP đã hết hạn
      await otpDoc.ref.delete();
      return res.status(410).json({
        success: false,
        message: 'OTP đã hết hạn. Vui lòng yêu cầu OTP mới.'
      });
    }

    // 3. Tìm user trong Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email.toLowerCase());

    // 4. Update password trong Firebase Auth
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    console.log('✅ Password updated successfully for:', email);

    // 5. Xóa OTP đã sử dụng
    await otpDoc.ref.delete();

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('❌ Error resetting password:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'Email không tồn tại trong hệ thống'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại.'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Password Reset API ready`);
  console.log(`🌐 Accessible from network on port ${PORT}`);
  console.log(`💡 For phone connection, use your computer's IP address`);
});

module.exports = app;
