/**
 * Google Apps Script - Send OTP Email via Gmail
 * Deploy this as Web App to get API endpoint
 * 
 * HOW TO DEPLOY:
 * 1. Go to https://script.google.com/home/projects
 * 2. Click "New Project"
 * 3. Paste this code
 * 4. Click "Deploy" > "New deployment"
 * 5. Select "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Copy the Web App URL
 */

function doPost(e) {
  try {
    // Parse request body
    const requestBody = JSON.parse(e.postData.contents);
    const { email, otpCode, action } = requestBody;
    
    // Validate input
    if (!email || !otpCode) {
      return createResponse(false, 'Missing required fields: email, otpCode');
    }
    
    // Route to appropriate handler
    if (action === 'send-otp') {
      return sendOTPEmail(email, otpCode);
    } else if (action === 'send-appointment') {
      return sendAppointmentEmail(requestBody);
    }
    
    return createResponse(false, 'Invalid action');
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse(false, 'Server error: ' + error.toString());
  }
}

/**
 * Send OTP email
 */
function sendOTPEmail(email, otpCode) {
  try {
    const subject = '🔐 Mã OTP đặt lại mật khẩu - Health Care';
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .otp-box { background-color: #E0F7FA; border-left: 4px solid #00BCD4; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center; }
          .otp-code { font-size: 36px; font-weight: bold; color: #00BCD4; letter-spacing: 8px; margin: 12px 0; font-family: 'Courier New', monospace; }
          .warning { background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 16px; margin: 24px 0; border-radius: 8px; }
          .footer { background-color: #f8f9fa; padding: 24px 30px; text-align: center; color: #6c757d; font-size: 14px; }
          .btn { display: inline-block; background-color: #00BCD4; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
          p { line-height: 1.6; color: #333333; margin: 12px 0; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; color: #555555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Health Care</h1>
            <p style="color: #ffffff; margin: 8px 0 0 0;">Chăm sóc sức khỏe </p>
          </div>
          
          <div class="content">
            <h2 style="color: #00BCD4; margin-bottom: 16px;">Đặt lại mật khẩu</h2>
            
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Health Care của mình.</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #00838F; font-weight: 600;">Mã OTP của bạn là:</p>
              <div class="otp-code">${otpCode}</div>
              <p style="margin: 0; color: #00838F; font-size: 14px;">Mã này có hiệu lực trong <strong>15 phút</strong></p>
            </div>
            
            <div class="warning">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Lưu ý bảo mật:</strong></p>
              <ul style="margin: 8px 0 0 0;">
                <li>Không chia sẻ mã OTP này với bất kỳ ai</li>
                <li>Health Care không bao giờ yêu cầu mã OTP qua điện thoại</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              </ul>
            </div>
            
            <p>Trân trọng,<br><strong>Đội ngũ Health Care</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© 2026 Health Care - Hệ thống đặt lịch khám trực tuyến và tích hợp tư vấn chuyêm khoa</p>
            <p style="margin: 8px 0 0 0;">Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('✅ OTP email sent to: ' + email);
    return createResponse(true, 'OTP email sent successfully');
    
  } catch (error) {
    Logger.log('❌ Error sending OTP email: ' + error.toString());
    return createResponse(false, 'Failed to send email: ' + error.toString());
  }
}

/**
 * Send appointment confirmation email
 */
function sendAppointmentEmail(data) {
  try {
    const { email, doctorName, appointmentDate, appointmentTime, specialty, hospital, patientName, appointmentCode, checkInCode } = data;
    
    const subject = '✅ Xác nhận đặt lịch khám - Health Care';
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .info-box { background-color: #E0F7FA; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .info-row { display: flex; margin: 12px 0; }
          .info-label { font-weight: 600; color: #00838F; min-width: 150px; }
          .info-value { color: #333333; }
          .checkin-box { background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .checkin-code { font-size: 28px; font-weight: bold; color: #F57C00; letter-spacing: 4px; margin: 12px 0; }
          .footer { background-color: #f8f9fa; padding: 24px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #ffffff; margin: 0;">🏥 Health Care</h1>
            <p style="color: #ffffff; margin: 8px 0 0 0;">Xác nhận đặt lịch khám</p>
          </div>
          
          <div class="content">
            <h2 style="color: #00BCD4;">Kính chào ${patientName || 'Quý khách'},</h2>
            <p>Lịch khám của bạn đã được xác nhận thành công!</p>
            
            <div class="info-box">
              <h3 style="color: #00838F; margin-top: 0;">📋 Thông tin lịch khám</h3>
              <div class="info-row">
                <span class="info-label">Bác sĩ:</span>
                <span class="info-value">${doctorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Chuyên khoa:</span>
                <span class="info-value">${specialty}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngày khám:</span>
                <span class="info-value">${appointmentDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Giờ khám:</span>
                <span class="info-value">${appointmentTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Địa điểm:</span>
                <span class="info-value">${hospital || 'Bệnh viện Health Care'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mã đặt lịch:</span>
                <span class="info-value"><strong>${appointmentCode || 'N/A'}</strong></span>
              </div>
            </div>
            
            <div class="checkin-box">
              <p style="margin: 0; color: #856404; font-weight: 600;">🎫 Mã Check-in</p>
              <div class="checkin-code">${checkInCode || 'N/A'}</div>
              <p style="margin: 0; color: #856404; font-size: 14px;">Vui lòng xuất trình mã này khi đến khám</p>
            </div>
            
            <p><strong>📝 Lưu ý:</strong></p>
            <ul>
              <li>Vui lòng đến trước 15 phút để làm thủ tục</li>
              <li>Mang theo giấy tờ tùy thân và thẻ bảo hiểm (nếu có)</li>
              <li>Liên hệ hotline nếu cần đổi lịch</li>
            </ul>
            
            <p>Trân trọng,<br><strong>Đội ngũ Health Care</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© 2024 Health Care</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('✅ Appointment email sent to: ' + email);
    return createResponse(true, 'Appointment email sent successfully');
    
  } catch (error) {
    Logger.log('❌ Error sending appointment email: ' + error.toString());
    return createResponse(false, 'Failed to send email: ' + error.toString());
  }
}

/**
 * Create JSON response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - can be run from Script Editor
 */
function testSendOTP() {
  const testEmail = 'your-email@gmail.com'; // Replace with your email
  const testOTP = '123456';
  
  const result = sendOTPEmail(testEmail, testOTP);
  Logger.log(result.getContent());
}
