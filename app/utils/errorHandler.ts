/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  FIREBASE = 'FIREBASE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: any;
  timestamp: Date;
}

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle Firebase errors
   */
  handleFirebaseError(error: any): AppError {
    const code = error?.code || 'UNKNOWN';
    let message = 'An error occurred';

    console.log('🔍 [ERROR_HANDLER] Firebase error details:');
    console.log('   Code:', code);
    console.log('   Message:', error?.message);
    console.log('   Full error:', error);

    // Firebase Auth errors
    if (code.startsWith('auth/')) {
      const authErrors: Record<string, string> = {
        'auth/user-not-found': 'User not found. Please check your email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
        'auth/email-already-in-use': 'Email already in use. Please use another email.',
        'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many login attempts. Please try again later.',
      };
      message = authErrors[code] || error?.message || 'Authentication error occurred';
      console.log('   Mapped message:', message);
    }
    // Firestore errors
    else if (code.startsWith('firestore/')) {
      const firestoreErrors: Record<string, string> = {
        'firestore/permission-denied': 'You do not have permission to access this resource.',
        'firestore/not-found': 'Resource not found.',
        'firestore/already-exists': 'Resource already exists.',
        'firestore/failed-precondition': 'Operation failed. Please try again.',
      };
      message = firestoreErrors[code] || error?.message || 'Database error occurred';
    }

    return {
      type: ErrorType.FIREBASE,
      message,
      code,
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any): AppError {
    let message = 'Network error occurred';

    if (error?.message?.includes('timeout')) {
      message = 'Request timeout. Please check your connection.';
    } else if (error?.message?.includes('Network')) {
      message = 'Network connection failed. Please check your internet.';
    }

    return {
      type: ErrorType.NETWORK,
      message,
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(message: string, details?: any): AppError {
    return {
      type: ErrorType.VALIDATION,
      message,
      originalError: details,
      timestamp: new Date(),
    };
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(message: string, code?: string): AppError {
    return {
      type: ErrorType.AUTHENTICATION,
      message,
      code,
      timestamp: new Date(),
    };
  }

  /**
   * Generic error handler
   */
  handleError(error: any): AppError {
    if (error?.code?.startsWith('auth/') || error?.code?.startsWith('firestore/')) {
      return this.handleFirebaseError(error);
    }

    if (error?.message?.includes('Network') || error?.message?.includes('timeout')) {
      return this.handleNetworkError(error);
    }

    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || 'An unexpected error occurred',
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Log error for debugging
   */
  logError(error: AppError): void {
    const logMessage = `[${error.type}] ${error.message}`;
    console.error(logMessage, {
      code: error.code,
      timestamp: error.timestamp,
      originalError: error.originalError,
    });
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AppError): string {
    return error.message;
  }
}

export default ErrorHandler.getInstance();
