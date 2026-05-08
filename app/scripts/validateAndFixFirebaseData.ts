import { db } from '@/app/config/firebase';
import {
    collection,
    doc,
    getDocs,
    writeBatch
} from 'firebase/firestore';

/**
 * Validate and fix all Firebase data to ensure correct format
 */
export const validateAndFixFirebaseData = async () => {
  try {
    console.log('🔍 [VALIDATE] Starting Firebase data validation...');

    // Validate appointments
    await validateAppointments();

    // Validate doctors
    await validateDoctors();

    // Validate hospitals
    await validateHospitals();

    // Validate users
    await validateUsers();

    console.log('✅ [VALIDATE] All data validation completed!');
  } catch (error) {
    console.error('❌ [VALIDATE] Error during validation:', error);
    throw error;
  }
};

/**
 * Validate appointments collection
 */
const validateAppointments = async () => {
  try {
    console.log('\n📋 [VALIDATE] Checking appointments collection...');
    const appointmentsRef = collection(db, 'appointments');
    const snapshot = await getDocs(appointmentsRef);

    if (snapshot.empty) {
      console.log('⚠️  [VALIDATE] No appointments found');
      return;
    }

    console.log(`📊 [VALIDATE] Found ${snapshot.size} appointments`);

    const batch = writeBatch(db);
    let updateCount = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const issues: string[] = [];
      const fixes: Record<string, any> = {};

      // Check required fields
      const requiredFields = [
        'userId',
        'doctorId',
        'doctor',
        'specialty',
        'hospital',
        'date',
        'fullDate',
        'time',
        'status',
      ];

      requiredFields.forEach((field) => {
        if (!data[field]) {
          issues.push(`Missing field: ${field}`);
        }
      });

      // Validate date format (should be DD/MM/YYYY)
      if (data.fullDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(data.fullDate)) {
        issues.push(`Invalid fullDate format: ${data.fullDate}`);
      }

      // Validate time format (should be HH:MM)
      if (data.time && !/^\d{2}:\d{2}$/.test(data.time)) {
        issues.push(`Invalid time format: ${data.time}`);
      }

      // Validate status
      const validStatuses = ['confirmed', 'pending', 'completed', 'cancelled', 'rescheduled'];
      if (data.status && !validStatuses.includes(data.status)) {
        issues.push(`Invalid status: ${data.status}`);
        fixes.status = 'confirmed';
      }

      // Validate appointmentDate (should be ISO string)
      if (data.appointmentDate && typeof data.appointmentDate !== 'string') {
        issues.push(`Invalid appointmentDate format: ${typeof data.appointmentDate}`);
        // Try to fix it
        if (data.fullDate) {
          const parts = data.fullDate.split('/');
          const date = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0])
          );
          fixes.appointmentDate = date.toISOString();
        }
      }

      // Ensure duration exists
      if (!data.duration) {
        fixes.duration = '30 phút';
      }

      // Ensure room exists
      if (!data.room) {
        fixes.room = 'Phòng 204';
      }

      // Ensure floor exists
      if (!data.floor) {
        fixes.floor = 'Tầng 2';
      }

      // Ensure image exists
      if (!data.image) {
        fixes.image = 'nguyenvanam.png';
      }

      if (issues.length > 0) {
        console.log(`\n⚠️  [VALIDATE] Appointment ${docSnap.id}:`);
        issues.forEach((issue) => console.log(`   - ${issue}`));

        if (Object.keys(fixes).length > 0) {
          console.log(`   ✏️  Applying fixes:`, fixes);
          batch.update(doc(db, 'appointments', docSnap.id), fixes);
          updateCount++;
        }
      } else {
        console.log(`✅ [VALIDATE] Appointment ${docSnap.id} is valid`);
      }

      // Log the appointment data
      console.log(`   Data:`, {
        doctor: data.doctor,
        specialty: data.specialty,
        date: data.fullDate,
        time: data.time,
        status: data.status,
        hospital: data.hospital,
      });
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`\n✅ [VALIDATE] Updated ${updateCount} appointments`);
    }
  } catch (error) {
    console.error('❌ [VALIDATE] Error validating appointments:', error);
  }
};

/**
 * Validate doctors collection
 */
const validateDoctors = async () => {
  try {
    console.log('\n👨‍⚕️  [VALIDATE] Checking doctors collection...');
    const doctorsRef = collection(db, 'doctors');
    const snapshot = await getDocs(doctorsRef);

    if (snapshot.empty) {
      console.log('⚠️  [VALIDATE] No doctors found');
      return;
    }

    console.log(`📊 [VALIDATE] Found ${snapshot.size} doctors`);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const issues: string[] = [];

      // Check required fields
      const requiredFields = ['id', 'ten', 'chuyen_khoa', 'kinh_nghiem', 'rating', 'image'];

      requiredFields.forEach((field) => {
        if (!data[field]) {
          issues.push(`Missing field: ${field}`);
        }
      });

      // Validate rating (should be 0-5)
      if (data.rating && (data.rating < 0 || data.rating > 5)) {
        issues.push(`Invalid rating: ${data.rating}`);
      }

      // Validate experience (should be positive number)
      if (data.kinh_nghiem && data.kinh_nghiem < 0) {
        issues.push(`Invalid experience: ${data.kinh_nghiem}`);
      }

      if (issues.length > 0) {
        console.log(`\n⚠️  [VALIDATE] Doctor ${docSnap.id}:`);
        issues.forEach((issue) => console.log(`   - ${issue}`));
      } else {
        console.log(`✅ [VALIDATE] Doctor ${data.ten} is valid`);
      }
    });
  } catch (error) {
    console.error('❌ [VALIDATE] Error validating doctors:', error);
  }
};

/**
 * Validate hospitals collection
 */
const validateHospitals = async () => {
  try {
    console.log('\n🏥 [VALIDATE] Checking hospitals collection...');
    const hospitalsRef = collection(db, 'hospitals');
    const snapshot = await getDocs(hospitalsRef);

    if (snapshot.empty) {
      console.log('⚠️  [VALIDATE] No hospitals found');
      return;
    }

    console.log(`📊 [VALIDATE] Found ${snapshot.size} hospitals`);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const issues: string[] = [];

      // Check required fields
      const requiredFields = ['id', 'name', 'address', 'phone', 'rating'];

      requiredFields.forEach((field) => {
        if (!data[field]) {
          issues.push(`Missing field: ${field}`);
        }
      });

      // Validate rating
      if (data.rating && (data.rating < 0 || data.rating > 5)) {
        issues.push(`Invalid rating: ${data.rating}`);
      }

      if (issues.length > 0) {
        console.log(`\n⚠️  [VALIDATE] Hospital ${docSnap.id}:`);
        issues.forEach((issue) => console.log(`   - ${issue}`));
      } else {
        console.log(`✅ [VALIDATE] Hospital ${data.name} is valid`);
      }
    });
  } catch (error) {
    console.error('❌ [VALIDATE] Error validating hospitals:', error);
  }
};

/**
 * Validate users collection
 */
const validateUsers = async () => {
  try {
    console.log('\n👤 [VALIDATE] Checking users collection...');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      console.log('⚠️  [VALIDATE] No users found');
      return;
    }

    console.log(`📊 [VALIDATE] Found ${snapshot.size} users`);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const issues: string[] = [];

      // Check required fields
      const requiredFields = ['email'];

      requiredFields.forEach((field) => {
        if (!data[field]) {
          issues.push(`Missing field: ${field}`);
        }
      });

      if (issues.length > 0) {
        console.log(`\n⚠️  [VALIDATE] User ${docSnap.id}:`);
        issues.forEach((issue) => console.log(`   - ${issue}`));
      } else {
        console.log(`✅ [VALIDATE] User ${data.email} is valid`);
      }
    });
  } catch (error) {
    console.error('❌ [VALIDATE] Error validating users:', error);
  }
};

/**
 * Get detailed report of all Firebase data
 */
export const getFirebaseDataReport = async () => {
  try {
    console.log('\n📊 [REPORT] Generating Firebase data report...\n');

    // Get appointments
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsSnapshot = await getDocs(appointmentsRef);
    console.log(`\n📋 APPOINTMENTS (${appointmentsSnapshot.size} total):`);
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n  ID: ${doc.id}`);
      console.log(`  Doctor: ${data.doctor}`);
      console.log(`  Specialty: ${data.specialty}`);
      console.log(`  Date: ${data.fullDate}`);
      console.log(`  Time: ${data.time}`);
      console.log(`  Hospital: ${data.hospital}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  User: ${data.userId}`);
    });

    // Get doctors
    const doctorsRef = collection(db, 'doctors');
    const doctorsSnapshot = await getDocs(doctorsRef);
    console.log(`\n\n👨‍⚕️  DOCTORS (${doctorsSnapshot.size} total):`);
    doctorsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n  ID: ${data.id}`);
      console.log(`  Name: ${data.ten}`);
      console.log(`  Specialty: ${data.chuyen_khoa}`);
      console.log(`  Experience: ${data.kinh_nghiem} years`);
      console.log(`  Rating: ${data.rating}`);
    });

    // Get hospitals
    const hospitalsRef = collection(db, 'hospitals');
    const hospitalsSnapshot = await getDocs(hospitalsRef);
    console.log(`\n\n🏥 HOSPITALS (${hospitalsSnapshot.size} total):`);
    hospitalsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n  ID: ${data.id}`);
      console.log(`  Name: ${data.name}`);
      console.log(`  Address: ${data.address}`);
      console.log(`  Rating: ${data.rating}`);
    });

    console.log('\n✅ [REPORT] Report completed!');
  } catch (error) {
    console.error('❌ [REPORT] Error generating report:', error);
  }
};
