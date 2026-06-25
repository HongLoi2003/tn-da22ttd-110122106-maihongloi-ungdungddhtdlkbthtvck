import { db } from '@/config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Script để kiểm tra dữ liệu appointments trong Firebase
 * Chạy từ console: await checkAppointmentsData('user-uid-here')
 */
export async function checkAppointmentsData(userId: string) {
  try {
    console.log('🔍 Checking appointments for user:', userId);

    if (!db) {
      console.error('❌ Firestore not initialized');
      return;
    }

    // Query appointments
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    console.log('✅ Found', snapshot.docs.length, 'appointments');

    if (snapshot.docs.length === 0) {
      console.warn('⚠️ No appointments found for this user');
      return;
    }

    // Display each appointment
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📋 Appointment #${index + 1}:`);
      console.log('ID:', doc.id);
      console.log('Doctor:', data.doctor);
      console.log('Specialty:', data.specialty);
      console.log('Hospital:', data.hospital);
      console.log('Date (fullDate):', data.fullDate);
      console.log('Time:', data.time);
      console.log('appointmentDate:', data.appointmentDate);
      console.log('createdAt:', data.createdAt);
      console.log('Status:', data.status);
      console.log('Patient Name:', data.patientName);
      console.log('Patient Phone:', data.patientPhone);
      console.log('Patient Email:', data.patientEmail);

      // Date analysis
      console.log('\n📅 Date Analysis:');
      if (data.appointmentDate) {
        const aptDate = new Date(data.appointmentDate);
        const now = new Date();
        const isValid = !isNaN(aptDate.getTime());
        const isFuture = aptDate > now;
        const daysFromNow = Math.ceil((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        console.log('appointmentDate:', data.appointmentDate);
        console.log('Parsed Date:', aptDate.toISOString());
        console.log('Is Valid:', isValid ? '✅ Yes' : '❌ No');
        console.log('Is Future:', isFuture ? '✅ Yes' : '❌ No');
        console.log('Days from now:', daysFromNow);
      }

      // Status check
      console.log('\n✅ Status Check:');
      console.log('Status:', data.status);
      console.log('Will show in "Sắp tới" tab:', data.status === 'confirmed' && new Date(data.appointmentDate) > new Date() ? '✅ Yes' : '❌ No');
    });

    console.log('\n✅ Data check complete');
  } catch (error) {
    console.error('❌ Error checking appointments:', error);
  }
}

/**
 * Script để xóa tất cả appointments của user
 * Chạy từ console: await deleteAllAppointments('user-uid-here')
 */
export async function deleteAllAppointments(userId: string) {
  try {
    console.log('🗑️ Deleting all appointments for user:', userId);

    if (!db) {
      console.error('❌ Firestore not initialized');
      return;
    }

    const { deleteDoc } = await import('firebase/firestore');

    // Query appointments
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    console.log('Found', snapshot.docs.length, 'appointments to delete');

    // Delete each appointment
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      console.log('✅ Deleted:', doc.id);
    }

    console.log('✅ All appointments deleted');
  } catch (error) {
    console.error('❌ Error deleting appointments:', error);
  }
}

/**
 * Script để xem tất cả appointments (không filter by user)
 * Chạy từ console: await getAllAppointments()
 */
export async function getAllAppointments() {
  try {
    console.log('🔍 Fetching all appointments...');

    if (!db) {
      console.error('❌ Firestore not initialized');
      return;
    }

    const snapshot = await getDocs(collection(db, 'appointments'));

    console.log('✅ Found', snapshot.docs.length, 'total appointments');

    // Group by user
    const byUser: { [key: string]: any[] } = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;

      if (!byUser[userId]) {
        byUser[userId] = [];
      }

      byUser[userId].push({
        id: doc.id,
        ...data,
      });
    });

    // Display by user
    Object.entries(byUser).forEach(([userId, appointments]) => {
      console.log(`\n👤 User: ${userId}`);
      console.log(`   Appointments: ${appointments.length}`);
      appointments.forEach((apt, index) => {
        console.log(`   #${index + 1}: ${apt.doctor} - ${apt.fullDate} ${apt.time} (${apt.status})`);
      });
    });

    console.log('\n✅ All appointments displayed');
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
  }
}
