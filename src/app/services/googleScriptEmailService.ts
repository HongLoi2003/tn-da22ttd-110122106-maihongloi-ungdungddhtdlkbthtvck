/**
 * Google Apps Script Email Service
 * Send emails via Google Apps Script deployed as Web App
 */

// Google Apps Script Web App URL - Deployed on June 23, 2026
const GOOGLE_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwgxWFP4ilDZkZ4Kyy8buMJx_vazmwi38XY4KDZ1YXaQBvt-Tbm_2sZDnmJ_AT5wHpsAQ/exec';

/**
 * Gửi OTP email qua Google Apps Script
 */
export const sendOTPEmailViaGoogleScript = async (
  toEmail: string,
  otpCode: string
): Promise<boolean> => {
  try {
    console.log('📧 Sending OTP via Google Apps Script to:', toEmail);
    
    const response = await fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send-otp',
        email: toEmail,
        otpCode: otpCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ OTP email sent successfully via Google Apps Script');
      return true;
    } else {
      console.error('❌ Google Apps Script Error:', result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send email via Google Apps Script:', error);
    return false;
  }
};

/**
 * Gửi email xác nhận đặt lịch qua Google Apps Script
 */
export const sendAppointmentEmailViaGoogleScript = async (
  toEmail: string,
  appointmentDetails: {
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    specialty: string;
    hospital?: string;
    patientName?: string;
    appointmentCode?: string;
    checkInCode?: string;
  }
): Promise<boolean> => {
  try {
    console.log('📧 Sending appointment email via Google Apps Script to:', toEmail);
    
    const response = await fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send-appointment',
        email: toEmail,
        ...appointmentDetails,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Appointment email sent successfully via Google Apps Script');
      return true;
    } else {
      console.error('❌ Google Apps Script Error:', result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send appointment email via Google Apps Script:', error);
    return false;
  }
};
