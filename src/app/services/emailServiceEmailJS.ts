/**
 * Email Service - EmailJS Integration
 * Gửi email OTP sử dụng EmailJS
 */

// EmailJS Configuration
// Lấy từ: https://dashboard.emailjs.com/
const EMAILJS_SERVICE_ID = 'service_n1dxg9i'; // Từ Email Services
const EMAILJS_TEMPLATE_ID = 'template_3ftwuev'; // Từ Email Templates  
const EMAILJS_PUBLIC_KEY = '1ZHFXpU0bTIdxxn8p'; // Từ Account > General

/**
 * Gửi OTP email qua EmailJS
 */
export const sendOTPEmail = async (
  toEmail: string,
  otpCode: string
): Promise<boolean> => {
  try {
    console.log('📧 Sending OTP via EmailJS to:', toEmail);
    
    const templateParams = {
      to_email: toEmail,
      otp_code: otpCode,
      app_name: 'HeartCare',
      to_name: toEmail.split('@')[0] // Lấy tên từ email
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
  }
): Promise<boolean> => {
  try {
    console.log('📧 Sending appointment confirmation to:', toEmail);
    
    const templateParams = {
      to_email: toEmail,
      to_name: toEmail.split('@')[0],
      doctor_name: appointmentDetails.doctorName,
      appointment_date: appointmentDetails.date,
      appointment_time: appointmentDetails.time,
      specialty: appointmentDetails.specialty,
      app_name: 'HeartCare'
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: 'YOUR_APPOINTMENT_TEMPLATE_ID', // Tạo template riêng cho appointment
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Failed to send appointment email:', error);
    return false;
  }
};
