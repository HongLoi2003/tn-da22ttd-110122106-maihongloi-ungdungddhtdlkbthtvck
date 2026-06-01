import { where } from 'firebase/firestore';
import { createDocument, getDocumentsWithQuery, updateDocument } from './firebaseService';

export interface DoctorAppointment {
  id: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: string;
  patientGender?: string;
  patientAddress?: string;
  patientNote?: string;
  patientInsuranceCode?: string;
  doctorId: string;
  doctor: string;
  specialty: string;
  hospital: string;
  consultationType?: string;
  date: string;
  fullDate: string;
  time: string;
  duration: string;
  room: string;
  floor: string;
  image: string;
  fee: number;
  appointmentType: 'hospital' | 'online';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  appointmentDate: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  cancelReason?: string;
  rescheduleReason?: string;
}

export interface PatientInfo {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceNumber?: string;
  lastVisit?: string;
  totalVisits?: number;
}

export interface Patient {
  id: string;
  userId?: string; // User ID from appointments
  name: string;
  phone: string;
  email?: string;
  address?: string;
  age?: number;
  totalVisits: number;
  lastVisit?: string;
  medicalHistory?: Array<{
    date: string;
    diagnosis: string;
    symptoms?: string;
    treatment?: string;
  }>;
}

export interface Prescription {
  id?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DoctorChat {
  id?: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  message: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
  createdAt: string;
}

class DoctorServiceClass {
  /**
   * Get all appointments for a doctor
   * Query by doctorId from doctors collection
   * Also try to match by doctor name if doctorId doesn't match
   */
  async getDoctorAppointments(doctorId: string): Promise<DoctorAppointment[]> {
    try {
      console.log('🔍 [DoctorService] Getting appointments for doctorId:', doctorId);
      
      // Strategy 1: Query by exact doctorId match
      let appointments = await getDocumentsWithQuery('appointments', [
        where('doctorId', '==', doctorId)
      ]);
      
      console.log('✅ [DoctorService] Found', appointments.length, 'appointments with exact doctorId match');
      
      // Strategy 2: If no results, try to get all appointments and filter
      if (appointments.length === 0) {
        console.log('🔍 [DoctorService] No exact match, trying alternative strategies...');
        
        // Get all appointments
        const allAppointments = await getDocumentsWithQuery('appointments', []);
        console.log('📋 [DoctorService] Total appointments in database:', allAppointments.length);
        
        // Try to get doctor info from doctors collection
        try {
          const { getDocumentById } = await import('./firebaseService');
          const doctorInfo = await getDocumentById('doctors', doctorId);
          
          if (doctorInfo && doctorInfo.ten) {
            console.log('🔍 [DoctorService] Doctor name from doctors collection:', doctorInfo.ten);
            
            // Filter by doctor name (with and without "BS." prefix)
            appointments = allAppointments.filter((apt: any) => {
              const doctorMatch = 
                apt.doctor === doctorInfo.ten || 
                apt.doctor === `BS. ${doctorInfo.ten}` ||
                apt.doctor === `Bs. ${doctorInfo.ten}` ||
                apt.doctor?.toLowerCase() === doctorInfo.ten?.toLowerCase();
              
              if (doctorMatch) {
                console.log('✅ [DoctorService] Found match by name:', apt.doctor);
              }
              
              return doctorMatch;
            });
            
            console.log('✅ [DoctorService] Found', appointments.length, 'appointments by doctor name');
          }
        } catch (error) {
          console.error('❌ [DoctorService] Error getting doctor info:', error);
        }
        
        // Strategy 3: If still no results, try matching by doctorId in all appointments
        if (appointments.length === 0) {
          console.log('🔍 [DoctorService] Trying to match by any doctorId field...');
          appointments = allAppointments.filter((apt: any) => {
            // Check if doctorId matches (case insensitive)
            const idMatch = apt.doctorId?.toLowerCase() === doctorId?.toLowerCase();
            if (idMatch) {
              console.log('✅ [DoctorService] Found match by case-insensitive doctorId:', apt.doctorId);
            }
            return idMatch;
          });
          console.log('✅ [DoctorService] Found', appointments.length, 'appointments by case-insensitive match');
        }
      }
      
      if (appointments.length > 0) {
        console.log('📋 [DoctorService] Sample appointment:', {
          id: appointments[0].id,
          doctorId: appointments[0].doctorId,
          doctor: appointments[0].doctor,
          patientName: appointments[0].patientName,
          date: appointments[0].fullDate,
          time: appointments[0].time,
          status: appointments[0].status
        });
      } else {
        console.log('⚠️  [DoctorService] No appointments found for doctorId:', doctorId);
        console.log('💡 [DoctorService] Suggestions:');
        console.log('   1. Check if doctorInfo.doctorId is set correctly in user profile');
        console.log('   2. Verify appointments have correct doctorId field');
        console.log('   3. Use /debug-doctor-appointments to see all data');
      }
      
      // Sort by appointment date (newest first)
      return (appointments as DoctorAppointment[]).sort((a, b) => {
        return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
      });
    } catch (error) {
      console.error('❌ [DoctorService] Error getting doctor appointments:', error);
      throw error;
    }
  }

  /**
   * Get appointments by status
   */
  async getAppointmentsByStatus(doctorId: string, status: string): Promise<DoctorAppointment[]> {
    try {
      const appointments = await getDocumentsWithQuery('appointments', [
        where('doctorId', '==', doctorId),
        where('status', '==', status)
      ]);
      
      return (appointments as DoctorAppointment[]).sort((a, b) => {
        return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
      });
    } catch (error) {
      console.error('Error getting appointments by status:', error);
      throw error;
    }
  }

  /**
   * Get today's appointments (actually gets all upcoming appointments)
   */
  async getTodayAppointments(doctorId: string): Promise<DoctorAppointment[]> {
    try {
      console.log('🔍 [getTodayAppointments] Getting appointments for doctorId:', doctorId);
      
      // Lấy tất cả lịch hẹn của bác sĩ
      const allAppointments = await this.getDoctorAppointments(doctorId);
      
      console.log('📋 [getTodayAppointments] Total appointments:', allAppointments.length);
      
      // Lọc chỉ lấy lịch pending và confirmed
      const upcomingAppointments = allAppointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed'
      );
      
      console.log('📋 [getTodayAppointments] Upcoming appointments:', upcomingAppointments.length);
      
      // Log sample appointments before reverse
      if (upcomingAppointments.length > 0) {
        console.log('📋 [getTodayAppointments] Sample appointments before reverse:');
        upcomingAppointments.slice(0, 3).forEach(apt => {
          console.log(`  - ${apt.patientName}: ${apt.fullDate} ${apt.time}`);
        });
      }
      
      // Đảo ngược mảng để lịch mới nhất lên đầu
      const reversedAppointments = [...upcomingAppointments].reverse();
      
      // Log sample appointments after reverse
      if (reversedAppointments.length > 0) {
        console.log('📋 [getTodayAppointments] Appointments after reverse:');
        reversedAppointments.slice(0, 5).forEach((apt, index) => {
          console.log(`  ${index + 1}. ${apt.patientName}: ${apt.fullDate} ${apt.time}`);
        });
      }
      
      return reversedAppointments;
    } catch (error) {
      console.error('❌ [getTodayAppointments] Error:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string, 
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled',
    reason?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'cancelled' && reason) {
        updateData.cancelReason = reason;
      }

      if (status === 'rescheduled' && reason) {
        updateData.rescheduleReason = reason;
      }

      await updateDocument('appointments', appointmentId, updateData);
    } catch (error: any) {
      // Xử lý lỗi permission-denied một cách graceful
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.log('Update appointment status requires Firestore permissions - silently handling');
      } else {
        console.error('Error updating appointment status:', error);
      }
      throw error;
    }
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ): Promise<void> {
    try {
      // Parse new date to create ISO string
      const dateParts = newDate.split('/');
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]);
      const appointmentDateObj = new Date(year, month - 1, day);

      await updateDocument('appointments', appointmentId, {
        fullDate: newDate,
        time: newTime,
        appointmentDate: appointmentDateObj.toISOString(),
        status: 'rescheduled',
        rescheduleReason: reason || 'Rescheduled by doctor',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Get patient information
   */
  async getPatientInfo(patientId: string): Promise<PatientInfo | null> {
    try {
      const patients = await getDocumentsWithQuery('users', [
        where('uid', '==', patientId)
      ]);
      
      if (patients.length > 0) {
        return patients[0] as PatientInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting patient info:', error);
      throw error;
    }
  }

  /**
   * Get all patients for a doctor
   */
  async getDoctorPatients(doctorId: string): Promise<Patient[]> {
    try {
      // Get all appointments for this doctor
      const appointments = await this.getDoctorAppointments(doctorId);

      // Get unique patient IDs
      const patientIds = [...new Set(appointments.map((apt: any) => apt.userId))];

      // Get patient info for each ID
      const patients: Patient[] = [];
      for (const patientId of patientIds) {
        const patientInfo = await this.getPatientInfo(patientId);
        if (patientInfo) {
          // Calculate total visits
          const patientAppointments = appointments.filter((apt: any) => apt.userId === patientId);
          
          // Get last visit date
          const completedAppointments = patientAppointments
            .filter((apt: any) => apt.status === 'completed')
            .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

          const patient: Patient = {
            id: patientInfo.uid,
            userId: patientId, // Add userId for avatar lookup
            name: patientInfo.fullName,
            phone: patientInfo.phone,
            email: patientInfo.email,
            address: patientInfo.address,
            age: patientInfo.dateOfBirth ? this.calculateAge(patientInfo.dateOfBirth) : undefined,
            totalVisits: patientAppointments.length,
            lastVisit: completedAppointments.length > 0 ? completedAppointments[0].fullDate : undefined,
            medicalHistory: []
          };

          patients.push(patient);
        }
      }

      return patients.sort((a, b) => b.totalVisits - a.totalVisits);
    } catch (error) {
      console.error('Error getting doctor patients:', error);
      throw error;
    }
  }

  /**
   * Get patient detail
   */
  async getPatientDetail(patientId: string): Promise<Patient | null> {
    try {
      const patientInfo = await this.getPatientInfo(patientId);
      if (!patientInfo) return null;

      // Get patient appointments
      const appointments = await getDocumentsWithQuery('appointments', [
        where('userId', '==', patientId)
      ]);

      const completedAppointments = (appointments as DoctorAppointment[])
        .filter(apt => apt.status === 'completed')
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

      const patient: Patient = {
        id: patientInfo.uid,
        name: patientInfo.fullName,
        phone: patientInfo.phone,
        email: patientInfo.email,
        address: patientInfo.address,
        age: patientInfo.dateOfBirth ? this.calculateAge(patientInfo.dateOfBirth) : undefined,
        totalVisits: appointments.length,
        lastVisit: completedAppointments.length > 0 ? completedAppointments[0].fullDate : undefined,
        medicalHistory: completedAppointments.slice(0, 10).map(apt => ({
          date: apt.fullDate,
          diagnosis: apt.specialty,
          symptoms: apt.notes || 'Không có ghi chú',
          treatment: 'Đã khám và điều trị'
        }))
      };

      return patient;
    } catch (error) {
      console.error('Error getting patient detail:', error);
      throw error;
    }
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Create prescription
   */
  async createPrescription(prescription: Prescription): Promise<string> {
    try {
      const prescriptionData = {
        ...prescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await createDocument('prescriptions', prescriptionData);
      return result.id;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  /**
   * Get prescriptions for a patient
   */
  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const prescriptions = await getDocumentsWithQuery('prescriptions', [
        where('patientId', '==', patientId)
      ]);

      return (prescriptions as Prescription[]).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error getting patient prescriptions:', error);
      throw error;
    }
  }

  /**
   * Get doctor chats
   */
  async getDoctorChats(doctorId: string): Promise<DoctorChat[]> {
    try {
      const chats = await getDocumentsWithQuery('doctor_chats', [
        where('doctorId', '==', doctorId),
        where('status', '==', 'active')
      ]);

      return (chats as DoctorChat[]).sort((a, b) => {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
    } catch (error) {
      console.error('Error getting doctor chats:', error);
      throw error;
    }
  }

  /**
   * Get chat messages
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const messages = await getDocumentsWithQuery('chat_messages', [
        where('chatId', '==', chatId)
      ]);

      return (messages as ChatMessage[]).sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  /**
   * Send chat message
   */
  async sendChatMessage(message: ChatMessage): Promise<string> {
    try {
      const messageData = {
        ...message,
        createdAt: new Date().toISOString()
      };

      const result = await createDocument('chat_messages', messageData);

      // Update chat last message
      const chats = await getDocumentsWithQuery('doctor_chats', [
        where('id', '==', message.chatId)
      ]);

      if (chats.length > 0) {
        await updateDocument('doctor_chats', chats[0].id, {
          lastMessage: message.message,
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      return result.id;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, doctorId: string): Promise<void> {
    try {
      const messages = await getDocumentsWithQuery('chat_messages', [
        where('chatId', '==', chatId),
        where('senderType', '==', 'patient'),
        where('read', '==', false)
      ]);

      for (const message of messages) {
        await updateDocument('chat_messages', message.id, {
          read: true
        });
      }

      // Reset unread count in chat
      const chats = await getDocumentsWithQuery('doctor_chats', [
        where('id', '==', chatId)
      ]);

      if (chats.length > 0) {
        await updateDocument('doctor_chats', chats[0].id, {
          unreadCount: 0
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(doctorId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
  }> {
    try {
      const appointments = await this.getDoctorAppointments(doctorId);
      const todayAppointments = await this.getTodayAppointments(doctorId);

      return {
        total: appointments.length,
        pending: appointments.filter(apt => apt.status === 'pending').length,
        confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
        completed: appointments.filter(apt => apt.status === 'completed').length,
        cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
        today: todayAppointments.length
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      throw error;
    }
  }
}

const doctorServiceInstance = new DoctorServiceClass();
export default doctorServiceInstance;
