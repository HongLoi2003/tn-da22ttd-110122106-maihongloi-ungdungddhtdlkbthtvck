/**
 * Firebase Cloud Function - Reset Password with OTP
 * Cập nhật password trong CẢ Firebase Auth và Firestore
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK (nếu chưa)
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * HTTP Cloud Function: Reset Password
 * POST /resetPasswordWithOTP
 * Body: { email, otp, newPassword }
 */
exports.resetPasswordWithOTP = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email, otp, newPassword' 
      });
      return;
    }

    console.log('🔐 Reset password request for:', email);

    // 1. Verify OTP from Firestore
    const otpSnapshot = await admin.firestore()
      .collection('password_reset_otps')
      .where('email', '==', email.toLowerCase())
      .where('otp', '==', otp)
      .get();

    if (otpSnapshot.empty) {
      console.log('❌ OTP not found or incorrect');
      res.status(400).json({ 
        success: false, 
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn' 
      });
      return;
    }

    // Check OTP expiration (15 minutes)
    const otpDoc = otpSnapshot.docs[0];
    const otpData = otpDoc.data();
    const createdAt = otpData.createdAt.toDate();
    const now = new Date();
    const diffMinutes = (now - createdAt) / (1000 * 60);

    if (diffMinutes > 15) {
      console.log('❌ OTP expired');
      // Delete expired OTP
      await otpDoc.ref.delete();
      res.status(400).json({ 
        success: false, 
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' 
      });
      return;
    }

    console.log('✅ OTP verified');

    // 2. Find user in Firestore
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .get();

    if (usersSnapshot.empty) {
      res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản với email này' 
      });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const uid = userData.uid;

    console.log('✅ User found:', uid);

    // 3. Update password in Firebase Auth (QUAN TRỌNG!)
    try {
      await admin.auth().updateUser(uid, {
        password: newPassword
      });
      console.log('✅ Firebase Auth password updated');
    } catch (authError) {
      console.error('❌ Error updating Firebase Auth password:', authError);
      res.status(500).json({ 
        success: false, 
        message: 'Không thể cập nhật password trong Firebase Auth: ' + authError.message 
      });
      return;
    }

    // 4. Update password in Firestore (để đồng bộ)
    await userDoc.ref.update({
      password: newPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Firestore password updated');

    // 5. Delete used OTP
    await otpDoc.ref.delete();
    console.log('✅ OTP deleted');

    // Success!
    res.status(200).json({ 
      success: true, 
      message: 'Password đã được đổi thành công. Bạn có thể đăng nhập với password mới.' 
    });

  } catch (error) {
    console.error('❌ Error in resetPasswordWithOTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + error.message 
    });
  }
});

/**
 * HTTP Cloud Function: Verify OTP Only
 * POST /verifyOTP
 * Body: { email, otp }
 */
exports.verifyOTP = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email, otp' 
      });
      return;
    }

    // Verify OTP
    const otpSnapshot = await admin.firestore()
      .collection('password_reset_otps')
      .where('email', '==', email.toLowerCase())
      .where('otp', '==', otp)
      .get();

    if (otpSnapshot.empty) {
      res.status(400).json({ 
        success: false, 
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn' 
      });
      return;
    }

    // Check expiration
    const otpData = otpSnapshot.docs[0].data();
    const createdAt = otpData.createdAt.toDate();
    const diffMinutes = (new Date() - createdAt) / (1000 * 60);

    if (diffMinutes > 15) {
      await otpSnapshot.docs[0].ref.delete();
      res.status(400).json({ 
        success: false, 
        message: 'Mã OTP đã hết hạn' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Mã OTP hợp lệ' 
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + error.message 
    });
  }
});
