/**
 * Test Helpers
 * Utilities for testing and development
 */

import validator from '@/app/utils/validation';

/**
 * Test validation functions
 */
export const testValidation = () => {
  console.log('🧪 Testing Validation Functions...\n');

  // Test email validation
  console.log('📧 Email Validation:');
  console.log('  Valid: test@example.com -', validator.validateEmail('test@example.com'));
  console.log('  Invalid: invalid.email -', validator.validateEmail('invalid.email'));

  // Test password validation
  console.log('\n🔐 Password Validation:');
  const weakPassword = validator.validatePassword('weak');
  console.log('  Weak password:', weakPassword);
  const strongPassword = validator.validatePassword('StrongPass123');
  console.log('  Strong password:', strongPassword);

  // Test phone validation
  console.log('\n📱 Phone Validation:');
  console.log('  Valid: 0912345678 -', validator.validatePhone('0912345678'));
  console.log('  Invalid: 123 -', validator.validatePhone('123'));

  // Test full name validation
  console.log('\n👤 Full Name Validation:');
  const validName = validator.validateFullName('John Doe');
  console.log('  Valid name:', validName);
  const invalidName = validator.validateFullName('J');
  console.log('  Invalid name:', invalidName);

  // Test login form validation
  console.log('\n🔑 Login Form Validation:');
  const loginValidation = validator.validateLoginForm('test@example.com', 'password123');
  console.log('  Valid login:', loginValidation);

  // Test registration form validation
  console.log('\n📝 Registration Form Validation:');
  const regValidation = validator.validateRegistrationForm(
    'test@example.com',
    'StrongPass123',
    'StrongPass123',
    'John Doe',
    '0912345678'
  );
  console.log('  Valid registration:', regValidation);

  console.log('\n✅ Validation tests completed!\n');
};

/**
 * Test error handler
 */
export const testErrorHandler = () => {
  console.log('🧪 Testing Error Handler...\n');

  import('@/app/utils/errorHandler').then(({ default: errorHandler }) => {
    // Test Firebase auth error
    console.log('🔥 Firebase Auth Error:');
    const authError = errorHandler.handleFirebaseError({
      code: 'auth/user-not-found',
      message: 'User not found',
    });
    console.log('  Error:', authError);

    // Test network error
    console.log('\n🌐 Network Error:');
    const networkError = errorHandler.handleNetworkError({
      message: 'Network request timeout',
    });
    console.log('  Error:', networkError);

    // Test validation error
    console.log('\n⚠️ Validation Error:');
    const validationError = errorHandler.handleValidationError('Invalid email format');
    console.log('  Error:', validationError);

    console.log('\n✅ Error handler tests completed!\n');
  });
};

/**
 * Generate mock data for testing
 */
export const generateMockData = () => {
  return {
    user: {
      id: 'user_001',
      email: 'test@example.com',
      fullName: 'John Doe',
      phone: '0912345678',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Main St',
      bloodType: 'O+',
      height: 180,
      weight: 75,
    },
    doctor: {
      id: 'bs001',
      ten: 'BS. Nguyễn Văn A',
      chuyen_khoa: 'Tim mạch',
      so_dien_thoai: '0900000001',
      kinh_nghiem: 10,
      rating: 4.8,
      image: 'doctor.png',
      trang_thai: true,
    },
    appointment: {
      id: 'apt_001',
      userId: 'user_001',
      doctorId: 'bs001',
      doctor: 'BS. Nguyễn Văn A',
      specialty: 'Tim mạch',
      hospital: 'Bệnh viện A',
      appointmentDate: new Date(),
      date: 'T2',
      fullDate: '20/01/2025',
      time: '09:00',
      duration: '30 phút',
      room: 'Phòng 204',
      floor: 'Tầng 2',
      status: 'confirmed',
      bookingType: 'offline',
      reason: 'Khám tổng quát',
      patientName: 'John Doe',
      patientPhone: '0912345678',
    },
  };
};

/**
 * Performance testing utility
 */
export const measurePerformance = async (
  name: string,
  fn: () => Promise<any>
): Promise<any> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};
