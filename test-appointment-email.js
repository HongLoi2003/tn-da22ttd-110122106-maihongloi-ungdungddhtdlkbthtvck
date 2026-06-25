/**
 * Script test gửi email xác nhận đặt lịch
 * 
 * Chạy: node test-appointment-email.js
 */

// Cấu hình EmailJS (lấy từ dashboard)
const EMAILJS_SERVICE_ID = 'service_n1dxg9i';
const EMAILJS_APPOINTMENT_TEMPLATE_ID = 'template_appointment'; // ← Thay bằng Template ID của bạn
const EMAILJS_PUBLIC_KEY = '1ZHFXpU0bTIdxxn8p';

// Thông tin test
const TEST_DATA = {
  to_email: 'your-email@example.com', // ← Thay bằng email của bạn
  to_name: 'Nguyễn Văn A',
  doctor_name: 'BS. Trần Thị Lan',
  specialty: 'Nội tim mạch',
  appointment_date: '25/12/2024',
  appointment_time: '09:00',
  hospital: 'Bệnh viện HeartCare Hà Nội',
  appointment_code: 'APT20241225-ABC123',
  checkin_code: 'CHK-XYZ789',
  app_name: 'HeartCare'
};

async function sendTestEmail() {
  try {
    console.log('\n📧 TESTING APPOINTMENT EMAIL\n');
    console.log('='.repeat(50));
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_APPOINTMENT_TEMPLATE_ID);
    console.log('Sending to:', TEST_DATA.to_email);
    console.log('='.repeat(50));
    console.log('\n⏳ Sending email...\n');

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_APPOINTMENT_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: TEST_DATA
      })
    });

    if (response.ok) {
      console.log('✅ SUCCESS! Email sent successfully!');
      console.log('\n📬 Check your inbox:', TEST_DATA.to_email);
      console.log('\nEmail details:');
      console.log('  • Doctor:', TEST_DATA.doctor_name);
      console.log('  • Date:', TEST_DATA.appointment_date);
      console.log('  • Time:', TEST_DATA.appointment_time);
      console.log('  • Code:', TEST_DATA.appointment_code);
      console.log('  • Check-in:', TEST_DATA.checkin_code);
      console.log('\n' + '='.repeat(50));
    } else {
      const errorText = await response.text();
      console.error('❌ FAILED! Error:', response.status);
      console.error('Details:', errorText);
      console.log('\n🔧 Troubleshooting:');
      console.log('  1. Check Template ID is correct');
      console.log('  2. Verify Service ID is active');
      console.log('  3. Make sure Public Key is correct');
      console.log('  4. Check template variables match');
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check internet connection');
    console.log('  2. Verify EmailJS credentials');
    console.log('  3. Make sure Node.js can make HTTP requests');
  }
}

// Kiểm tra cấu hình trước khi gửi
function checkConfig() {
  console.log('\n🔍 Checking configuration...\n');
  
  const issues = [];
  
  if (EMAILJS_APPOINTMENT_TEMPLATE_ID === 'template_appointment') {
    issues.push('⚠️  Template ID chưa được cập nhật (đang dùng placeholder)');
  }
  
  if (TEST_DATA.to_email === 'your-email@example.com') {
    issues.push('⚠️  Email nhận chưa được cập nhật');
  }
  
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
    issues.push('❌ Service ID hoặc Public Key bị thiếu');
  }
  
  if (issues.length > 0) {
    console.log('🚨 Configuration Issues:\n');
    issues.forEach(issue => console.log('  ' + issue));
    console.log('\n📝 Please update these values in the script before testing.\n');
    console.log('Steps:');
    console.log('  1. Create template on EmailJS dashboard');
    console.log('  2. Copy Template ID and paste to EMAILJS_APPOINTMENT_TEMPLATE_ID');
    console.log('  3. Update TEST_DATA.to_email to your real email');
    console.log('  4. Run script again: node test-appointment-email.js\n');
    return false;
  }
  
  console.log('✅ Configuration looks good!\n');
  return true;
}

// Main
if (checkConfig()) {
  sendTestEmail();
} else {
  process.exit(1);
}
