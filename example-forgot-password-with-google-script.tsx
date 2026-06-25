/**
 * Example: Cách tích hợp Google Apps Script vào forgot-password.tsx
 * 
 * Copy các phần code này vào file app/forgot-password.tsx
 */

// ==================== 1. IMPORT ====================
// Thêm import này vào đầu file (dòng 16, sau các import khác)
import { sendOTPEmailViaGoogleScript } from './services/googleScriptEmailService';

// ==================== 2. OPTION A: Chỉ dùng Google Apps Script ====================
// Thay thế trong hàm handleSendOTP (dòng 76-77):

// CŨ:
const emailSent = await sendOTPEmail(email, otpCode);

// MỚI:
const emailSent = await sendOTPEmailViaGoogleScript(email, otpCode);

// ==================== 3. OPTION B: Dùng cả 2 (Failover - Khuyến nghị) ====================
// Thay thế trong hàm handleSendOTP (dòng 76-77):

// Thử Google Apps Script trước
let emailSent = await sendOTPEmailViaGoogleScript(email, otpCode);

// Nếu thất bại, fallback sang EmailJS
if (!emailSent) {
  console.log('📧 Google Apps Script failed, trying EmailJS...');
  emailSent = await sendOTPEmail(email, otpCode);
}

// ==================== 4. OPTION C: EmailJS primary, Google Apps Script fallback ====================
// Nếu bạn muốn dùng EmailJS trước:

// Thử EmailJS trước
let emailSent = await sendOTPEmail(email, otpCode);

// Nếu thất bại, fallback sang Google Apps Script
if (!emailSent) {
  console.log('📧 EmailJS failed, trying Google Apps Script...');
  emailSent = await sendOTPEmailViaGoogleScript(email, otpCode);
}

// ==================== 5. CODE ĐẦY ĐỦ CỦA HÀM handleSendOTP (Option B - Failover) ====================

const handleSendOTP = async () => {
  if (!email) {
    Alert.alert('Lỗi', 'Vui lòng nhập email');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert('Lỗi', 'Email không hợp lệ');
    return;
  }

  if (!db) {
    Alert.alert('Lỗi', 'Firebase chưa được khởi tạo');
    return;
  }

  setLoading(true);
  try {
    // 1. Tạo OTP code (6 số)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Lưu OTP vào Firestore
    await addDoc(collection(db, 'password_reset_otps'), {
      email: email.toLowerCase(),
      otp: otpCode,
      createdAt: serverTimestamp(),
    });

    // 3. Gửi OTP qua Gmail (với failover)
    console.log('📧 Sending OTP via Google Apps Script...');
    let emailSent = await sendOTPEmailViaGoogleScript(email, otpCode);
    
    // Nếu Google Apps Script thất bại, thử EmailJS
    if (!emailSent) {
      console.log('📧 Google Apps Script failed, trying EmailJS...');
      emailSent = await sendOTPEmail(email, otpCode);
    }
    
    if (emailSent) {
      Alert.alert(
        'Thành công!',
        `Mã OTP đã được gửi đến:\n${email}\n\nVui lòng kiểm tra hộp thư (kể cả thư mục Spam).`,
        [{ text: 'OK' }]
      );
      setStep('otp');
      startCountdown();
    } else {
      Alert.alert('Lỗi', 'Không thể gửi email. Vui lòng thử lại.');
    }
  } catch (error: any) {
    console.error('❌ Error sending OTP:', error);
    Alert.alert('Lỗi', 'Không thể gửi OTP. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};

// ==================== 6. BONUS: Cập nhật alert message để hiển thị method ====================

if (emailSent) {
  const method = emailSent === 'google-script' ? 'Google Apps Script' : 'EmailJS';
  Alert.alert(
    'Thành công!',
    `Mã OTP đã được gửi đến:\n${email}\n\n📧 Method: ${method}\n\nVui lòng kiểm tra hộp thư (kể cả thư mục Spam).`,
    [{ text: 'OK' }]
  );
  setStep('otp');
  startCountdown();
}

// ==================== 7. HÀM GỬI APPOINTMENT EMAIL (Bonus) ====================
// Nếu bạn muốn dùng Google Apps Script cho appointment emails:

import { sendAppointmentEmailViaGoogleScript } from './services/googleScriptEmailService';

// Trong hàm gửi appointment email (file booking-confirmation.tsx):
const emailSent = await sendAppointmentEmailViaGoogleScript(
  userEmail,
  {
    doctorName: 'BS. Nguyễn Văn A',
    appointmentDate: '25/06/2024',
    appointmentTime: '09:00',
    specialty: 'Tim mạch',
    hospital: 'Bệnh viện HeartCare',
    patientName: 'Nguyễn Văn B',
    appointmentCode: 'APT001',
    checkInCode: '123456'
  }
);
