/**
 * Email Service - EmailJS Integration
 * Gửi email OTP sử dụng EmailJS
 */

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_1w9x0im';
const EMAILJS_TEMPLATE_ID = 'template_3ftwuev';
const EMAILJS_PUBLIC_KEY = 'U4Puz7zANnYROajYB';

/**
 * Gửi OTP email qua EmailJS
 */
export const sendOTPEmail = async (
  toEmail: string,
  otpCode: string
): Promise<boolean> => {
  try {
    console.log('📧 Sending OTP via EmailJS to:', toEmail);
    console.log('📨 OTP Code:', otpCode);
    
    const templateParams = {
      to_email: toEmail,
      passcode: otpCode,  // Đổi từ otp_code → passcode
      time: '15 minutes',  // Thêm biến {{time}}
      app_name: 'HeartCare',
      to_name: toEmail.split('@')[0]
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    });

    if (response.ok) {
      console.log('✅ OTP email sent successfully via EmailJS');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ EmailJS API Error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send email via EmailJS:', error);
    return false;
  }
};

/**
 * Gửi email xác nhận đặt lịch
 */
export const sendAppointmentConfirmation = async (
  toEmail: string,
  appointmentDetails: {
    doctorName: string;
    date: string;
    time: string;
    specialty: string;
    hospital?: string;
    patientName?: string;
    appointmentCode?: string;
    checkInCode?: string;
  }
): Promise<boolean> => {
  try {
    console.log('📧 [APPOINTMENT EMAIL] Starting to send to:', toEmail);
    console.log('📧 [APPOINTMENT EMAIL] Service ID:', EMAILJS_SERVICE_ID);
    console.log('📧 [APPOINTMENT EMAIL] Template ID: template_s4yrvje');
    console.log('📧 [APPOINTMENT EMAIL] Public Key:', EMAILJS_PUBLIC_KEY);
    
    const templateParams = {
      to_email: toEmail,
      to_name: appointmentDetails.patientName || toEmail.split('@')[0],
      doctor_name: appointmentDetails.doctorName,
      appointment_date: appointmentDetails.date,
      appointment_time: appointmentDetails.time,
      specialty: appointmentDetails.specialty,
      hospital: appointmentDetails.hospital || 'Bệnh viện HeartCare',
      appointment_code: appointmentDetails.appointmentCode || 'N/A',
      checkin_code: appointmentDetails.checkInCode || 'N/A',
      app_name: 'HeartCare'
    };

    console.log('📧 [APPOINTMENT EMAIL] Template params:', JSON.stringify(templateParams, null, 2));

    const requestBody = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: 'template_s4yrvje',
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams
    };

    console.log('📧 [APPOINTMENT EMAIL] Sending request to EmailJS...');

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📧 [APPOINTMENT EMAIL] Response status:', response.status);

    if (response.ok) {
      console.log('✅ [APPOINTMENT EMAIL] Email sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ [APPOINTMENT EMAIL] EmailJS API Error:', errorText);
      console.error('❌ [APPOINTMENT EMAIL] Status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ [APPOINTMENT EMAIL] Exception:', error);
    return false;
  }
};
