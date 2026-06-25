/**
 * Validation Utilities
 * Form validation and data validation helpers
 */

import CONFIG from '@/config/config';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

class Validator {
  private static instance: Validator;

  private constructor() {}

  static getInstance(): Validator {
    if (!Validator.instance) {
      Validator.instance = new Validator();
    }
    return Validator.instance;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    return CONFIG.validation.emailPattern.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationResult {
    const errors: Record<string, string> = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < CONFIG.validation.passwordMinLength) {
      errors.password = `Password must be at least ${CONFIG.validation.passwordMinLength} characters`;
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): boolean {
    return CONFIG.validation.phonePattern.test(phone.replace(/\D/g, ''));
  }

  /**
   * Validate full name
   */
  validateFullName(name: string): ValidationResult {
    const errors: Record<string, string> = {};

    if (!name || name.trim().length === 0) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (name.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    } else if (name.trim().length > 100) {
      errors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
      errors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate login form
   */
  validateLoginForm(email: string, password: string): ValidationResult {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate registration form
   */
  validateRegistrationForm(
    email: string,
    password: string,
    confirmPassword: string,
    fullName: string,
    phone: string
  ): ValidationResult {
    const errors: Record<string, string> = {};

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.password || 'Invalid password';
    }

    // Confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    const nameValidation = this.validateFullName(fullName);
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.errors.fullName || 'Invalid full name';
    }

    // Phone validation
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!this.validatePhone(phone)) {
      errors.phone = 'Invalid phone number format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate appointment booking form
   */
  validateAppointmentForm(
    doctorId: string,
    date: string,
    time: string,
    reason: string
  ): ValidationResult {
    const errors: Record<string, string> = {};

    if (!doctorId) {
      errors.doctorId = 'Please select a doctor';
    }

    if (!date) {
      errors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Please select a future date';
      }
    }

    if (!time) {
      errors.time = 'Please select a time';
    }

    if (!reason || reason.trim().length === 0) {
      errors.reason = 'Please provide a reason for the appointment';
    } else if (reason.trim().length < 5) {
      errors.reason = 'Reason must be at least 5 characters';
    } else if (reason.trim().length > 500) {
      errors.reason = 'Reason must not exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate medical record form
   */
  validateMedicalRecordForm(
    diagnosis: string,
    notes: string
  ): ValidationResult {
    const errors: Record<string, string> = {};

    if (!diagnosis || diagnosis.trim().length === 0) {
      errors.diagnosis = 'Diagnosis is required';
    } else if (diagnosis.trim().length < 3) {
      errors.diagnosis = 'Diagnosis must be at least 3 characters';
    }

    if (notes && notes.trim().length > 1000) {
      errors.notes = 'Notes must not exceed 1000 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate insurance form
   */
  validateInsuranceForm(
    provider: string,
    cardNumber: string,
    holder: string,
    validUntil: string
  ): ValidationResult {
    const errors: Record<string, string> = {};

    if (!provider || provider.trim().length === 0) {
      errors.provider = 'Insurance provider is required';
    }

    if (!cardNumber || cardNumber.trim().length === 0) {
      errors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\D/g, '').length < 10) {
      errors.cardNumber = 'Invalid card number format';
    }

    if (!holder || holder.trim().length === 0) {
      errors.holder = 'Holder name is required';
    }

    if (!validUntil) {
      errors.validUntil = 'Expiration date is required';
    } else {
      const expiryDate = new Date(validUntil);
      const today = new Date();
      if (expiryDate < today) {
        errors.validUntil = 'Insurance card has expired';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default Validator.getInstance();
