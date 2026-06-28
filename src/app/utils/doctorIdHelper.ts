/**
 * Doctor ID Helper Utility
 * 
 * Manages the two types of doctor IDs used in the system:
 * 1. Firebase Auth UID - Used for authentication and database queries
 * 2. Display Doctor ID - Used for display purposes (bs001, bs004, etc.)
 */

interface UserData {
  uid: string;
  doctorInfo?: {
    doctorId?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DoctorIds {
  /** Firebase Auth UID - Use for queries, authentication, and all database operations */
  firebaseAuthUid: string;
  
  /** Display Doctor ID (bs001, bs004, etc.) - Use only for UI display and legacy compatibility */
  displayDoctorId: string;
}

/**
 * Extract both Firebase Auth UID and Display Doctor ID from user data
 * 
 * @param userData - User data from AuthContext
 * @returns Object containing both IDs
 * 
 * @example
 * const { firebaseAuthUid, displayDoctorId } = getDoctorIds(userData);
 * 
 * // Use firebaseAuthUid for queries
 * await getDocumentsWithQuery('conversations', [
 *   where('doctorAuthUid', '==', firebaseAuthUid)
 * ]);
 * 
 * // Use displayDoctorId for UI display or notifications
 * console.log(`Doctor: ${displayDoctorId}`);
 */
export function getDoctorIds(userData: UserData | null | undefined): DoctorIds {
  if (!userData?.uid) {
    throw new Error('getDoctorIds: userData or userData.uid is missing');
  }

  const firebaseAuthUid = userData.uid;
  const displayDoctorId = (userData.doctorInfo as any)?.doctorId || userData.uid;

  return {
    firebaseAuthUid,
    displayDoctorId,
  };
}

/**
 * Get only the Firebase Auth UID (recommended for most operations)
 * 
 * @param userData - User data from AuthContext
 * @returns Firebase Auth UID
 */
export function getFirebaseAuthUid(userData: UserData | null | undefined): string {
  if (!userData?.uid) {
    throw new Error('getFirebaseAuthUid: userData or userData.uid is missing');
  }
  return userData.uid;
}

/**
 * Get only the Display Doctor ID (use sparingly, mainly for UI)
 * 
 * @param userData - User data from AuthContext
 * @returns Display Doctor ID (bs001, bs004, etc.) or falls back to Firebase Auth UID
 */
export function getDisplayDoctorId(userData: UserData | null | undefined): string {
  if (!userData?.uid) {
    throw new Error('getDisplayDoctorId: userData or userData.uid is missing');
  }
  return (userData.doctorInfo as any)?.doctorId || userData.uid;
}

/**
 * Check if user has a display doctor ID (bs001, bs004, etc.)
 * 
 * @param userData - User data from AuthContext
 * @returns true if user has a display doctor ID
 */
export function hasDisplayDoctorId(userData: UserData | null | undefined): boolean {
  return !!(userData?.doctorInfo as any)?.doctorId;
}
