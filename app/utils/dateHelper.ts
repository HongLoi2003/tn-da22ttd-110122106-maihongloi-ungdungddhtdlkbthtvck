/**
 * Calculate age from date of birth
 * @param birthDate - Date of birth in string format (DD/MM/YYYY or YYYY-MM-DD)
 * @returns Age in years
 */
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  
  try {
    let dob: Date;
    
    // Hỗ trợ format DD/MM/YYYY
    if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        dob = new Date(year, month, day);
      } else {
        return 0;
      }
    }
    // Hỗ trợ format YYYY-MM-DD
    else if (birthDate.includes('-')) {
      dob = new Date(birthDate);
    }
    // Format khác
    else {
      dob = new Date(birthDate);
    }
    
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    // Nếu chưa đến sinh nhật trong năm nay thì trừ 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age > 0 ? age : 0;
  } catch (error) {
    console.error('❌ [DATE_HELPER] Error calculating age:', error);
    return 0;
  }
};

/**
 * Format date to DD/MM/YYYY
 */
export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
