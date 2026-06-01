import { getDocumentById } from './firebaseService';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DaySchedule {
  day: string;
  dayName: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

/**
 * Get available time slots for a doctor on a specific day
 */
export async function getDoctorAvailableTimeSlots(
  doctorId: string,
  dayOfWeek: string // 'monday', 'tuesday', etc.
): Promise<string[]> {
  try {
    console.log('🔍 [ScheduleService] Getting available times for doctor:', doctorId, 'day:', dayOfWeek);
    
    // Get doctor's work schedule from Firebase
    const doctorData = await getDocumentById('doctors', doctorId);
    
    if (!doctorData || !(doctorData as any).workSchedule) {
      console.log('⚠️  [ScheduleService] No work schedule found, returning default times');
      // Return default times if no schedule is set
      return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    }
    
    const workSchedule: DaySchedule[] = (doctorData as any).workSchedule;
    
    // Find the schedule for the requested day
    const daySchedule = workSchedule.find(d => d.day === dayOfWeek);
    
    if (!daySchedule) {
      console.log('⚠️  [ScheduleService] Day not found in schedule');
      return [];
    }
    
    // Check if doctor works on this day
    if (!daySchedule.enabled) {
      console.log('ℹ️  [ScheduleService] Doctor does not work on', dayOfWeek);
      return [];
    }
    
    // Get available time slots
    const availableTimes = daySchedule.timeSlots
      .filter(slot => slot.available)
      .map(slot => slot.time);
    
    console.log('✅ [ScheduleService] Available times:', availableTimes);
    
    return availableTimes;
  } catch (error) {
    console.error('❌ [ScheduleService] Error getting available times:', error);
    // Return default times on error
    return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }
}

/**
 * Convert date string (DD/MM/YYYY) to day of week
 */
export function getDayOfWeekFromDate(dateStr: string): string {
  try {
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      return 'monday';
    }
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    const date = new Date(year, month - 1, day);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[dayIndex];
  } catch (error) {
    console.error('Error converting date to day of week:', error);
    return 'monday';
  }
}

/**
 * Get all available dates and times for a doctor
 */
export async function getDoctorAvailability(doctorId: string): Promise<{
  dates: Array<{ day: string; date: string; fullDate: string; dayOfWeek: string }>;
  timesByDate: { [key: string]: string[] };
}> {
  try {
    console.log('🔍 [ScheduleService] Getting availability for doctor:', doctorId);
    
    // Get doctor data to check if they're available for booking
    const doctorData = await getDocumentById('doctors', doctorId);
    
    // Check if doctor has disabled booking
    if (doctorData && (doctorData as any).availableForBooking === false) {
      console.log('⚠️  [ScheduleService] Doctor has disabled booking');
      return { dates: [], timesByDate: {} };
    }
    
    // Generate next 7 days
    const dates = [];
    const timesByDate: { [key: string]: string[] } = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayIndex = date.getDay();
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayNamesEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      const fullDate = `${day}/${month}/${year}`;
      const dayOfWeek = dayNamesEn[dayIndex];
      
      // Get available times for this day
      const availableTimes = await getDoctorAvailableTimeSlots(doctorId, dayOfWeek);
      
      // Only add dates that have available times
      if (availableTimes.length > 0) {
        dates.push({
          day: dayNames[dayIndex],
          date: `${day}/${month}`,
          fullDate: fullDate,
          dayOfWeek: dayOfWeek
        });
        
        timesByDate[fullDate] = availableTimes;
      }
    }
    
    console.log('✅ [ScheduleService] Generated', dates.length, 'available dates');
    
    return { dates, timesByDate };
  } catch (error) {
    console.error('❌ [ScheduleService] Error getting availability:', error);
    // Return default availability on error
    const dates = [];
    const timesByDate: { [key: string]: string[] } = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayIndex = date.getDay();
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      const fullDate = `${day}/${month}/${year}`;
      
      dates.push({
        day: dayNames[dayIndex],
        date: `${day}/${month}`,
        fullDate: fullDate,
        dayOfWeek: ''
      });
      
      timesByDate[fullDate] = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    }
    
    return { dates, timesByDate };
  }
}
