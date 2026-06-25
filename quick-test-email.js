/**
 * Quick Test EmailJS - Chạy file này để test nhanh
 * Node.js script
 */

const testEmailJS = async () => {
  const EMAILJS_SERVICE_ID = 'service_n1dxg9i';
  const EMAILJS_TEMPLATE_ID = 'template_3ftwuev';
  const EMAILJS_PUBLIC_KEY = '1ZHFXpU0bTIdxxn8p';

  // Thay email này bằng email của bạn (email THẬT mà bạn đang dùng)
  const TEST_EMAIL = 'maihongloi060423@gmail.com'; // Hoặc thử email khác
  const TEST_OTP = '123456';

  console.log('🚀 Bắt đầu test EmailJS...');
  console.log('📧 Gửi đến:', TEST_EMAIL);
  console.log('🔑 OTP:', TEST_OTP);

  try {
    const emailData = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: TEST_EMAIL,
        to_name: TEST_EMAIL.split('@')[0],
        passcode: TEST_OTP,  // Đổi từ otp_code → passcode
        time: '15 minutes',   // Thêm biến {{time}}
        app_name: 'HeartCare',
        reply_to: TEST_EMAIL
      }
    };

    console.log('📤 Payload:', JSON.stringify(emailData, null, 2));

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('✅ Thành công! Email đã được gửi');
      console.log('📬 Check email của bạn (bao gồm cả spam folder)');
    } else {
      const errorText = await response.text();
      console.error('❌ Lỗi:', errorText);
      
      // Giải thích lỗi thường gặp
      if (errorText.includes('not found')) {
        console.log('\n💡 Template hoặc Service ID không tồn tại');
        console.log('   → Check lại IDs trên dashboard');
      } else if (errorText.includes('Invalid')) {
        console.log('\n💡 Public Key không hợp lệ');
        console.log('   → Vào Account > General để lấy lại key');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
  }
};

// Chạy test
testEmailJS();
