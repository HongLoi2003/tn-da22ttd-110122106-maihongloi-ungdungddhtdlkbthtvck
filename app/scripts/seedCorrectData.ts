import { db } from '@/app/config/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

/**
 * Seed correct format data to Firebase
 */
export const seedCorrectData = async () => {
  try {
    console.log('🌱 [SEED] Starting to seed correct format data...');

    // Seed doctors
    await seedDoctors();

    // Seed hospitals
    await seedHospitals();

    // Seed sample appointments
    await seedSampleAppointments();

    console.log('✅ [SEED] All data seeded successfully!');
  } catch (error) {
    console.error('❌ [SEED] Error seeding data:', error);
    throw error;
  }
};

/**
 * Seed doctors with correct format
 */
const seedDoctors = async () => {
  try {
    console.log('\n👨‍⚕️  [SEED] Seeding doctors...');

    const doctors = [
      {
        id: 'bs001',
        ten: 'BS. Nguyễn Văn An',
        chuyen_khoa: 'Tim mạch',
        so_dien_thoai: '0900000001',
        kinh_nghiem: 10,
        rating: 4.8,
        image: 'nguyenvanam.png',
        trang_thai: true,
      },
      {
        id: 'bs002',
        ten: 'BS. Trần Thị Lan',
        chuyen_khoa: 'Da liễu',
        so_dien_thoai: '0900000002',
        kinh_nghiem: 7,
        rating: 4.8,
        image: 'tranthilan.png',
        trang_thai: true,
      },
      {
        id: 'bs003',
        ten: 'BS. Lê Minh Tâm',
        chuyen_khoa: 'Sản phụ khoa',
        so_dien_thoai: '0900000003',
        kinh_nghiem: 5,
        rating: 4.8,
        image: 'leminhtam.png',
        trang_thai: true,
      },
      {
        id: 'bs004',
        ten: 'BS. Trần Thị Mai',
        chuyen_khoa: 'Hô hấp',
        so_dien_thoai: '0900000004',
        kinh_nghiem: 8,
        rating: 4.9,
        image: 'tranthimai.png',
        trang_thai: true,
      },
      {
        id: 'bs005',
        ten: 'BS. Lê Hoàng Nam',
        chuyen_khoa: 'Hô hấp',
        so_dien_thoai: '0900000005',
        kinh_nghiem: 9,
        rating: 4.9,
        image: 'lehoangnam.png',
        trang_thai: true,
      },
      {
        id: 'bs006',
        ten: 'BS. Phạm Thu Hà',
        chuyen_khoa: 'Tim mạch',
        so_dien_thoai: '0900000006',
        kinh_nghiem: 6,
        rating: 4.9,
        image: 'phamthuha.png',
        trang_thai: true,
      },
    ];

    const batch = writeBatch(db);
    doctors.forEach((doctor) => {
      const docRef = doc(db, 'doctors', doctor.id);
      batch.set(docRef, {
        ...doctor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    console.log(`✅ [SEED] Seeded ${doctors.length} doctors`);
  } catch (error) {
    console.error('❌ [SEED] Error seeding doctors:', error);
  }
};

/**
 * Seed hospitals with correct format
 */
const seedHospitals = async () => {
  try {
    console.log('\n🏥 [SEED] Seeding hospitals...');

    const hospitals = [
      {
        id: 'hosp001',
        name: 'Bệnh viện Trung ương',
        address: '1 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
        phone: '024 3743 0743',
        email: 'info@bvtw.vn',
        website: 'https://bvtw.vn',
        rating: 4.8,
        reviewCount: 1250,
        image: 'benviennhitrunguong.png',
        latitude: 21.0245,
        longitude: 105.8412,
        specialties: ['Tim mạch', 'Ngoại khoa', 'Nội khoa', 'Thần kinh'],
        services: ['Khám bệnh', 'Cấp cứu 24/7', 'Xét nghiệm', 'Chẩn đoán hình ảnh'],
        workingHours: '24/7',
        emergencyService: true,
        parkingAvailable: true,
        description: 'Bệnh viện hạng đặc biệt với đội ngũ bác sĩ giỏi',
        doctorIds: ['bs001', 'bs002', 'bs003'],
      },
      {
        id: 'hosp002',
        name: 'Bệnh viện Đại học Trà Vinh',
        address: '78 Giải Phóng, Đống Đa, Hà Nội',
        phone: '024 3869 3731',
        email: 'benhvien@bachmai.gov.vn',
        website: 'https://benhvienbachmai.vn',
        rating: 4.7,
        reviewCount: 2100,
        image: 'benhvienbachmai.png',
        latitude: 21.0031,
        longitude: 105.8438,
        specialties: ['Hô hấp', 'Tim mạch', 'Tiêu hóa', 'Thận - Tiết niệu'],
        services: ['Khám bệnh', 'Cấp cứu 24/7', 'Xét nghiệm', 'Nội soi'],
        workingHours: '24/7',
        emergencyService: true,
        parkingAvailable: true,
        description: 'Bệnh viện đa khoa hạng đặc biệt lớn nhất miền Bắc',
        doctorIds: ['bs004', 'bs005', 'bs006'],
      },
    ];

    const batch = writeBatch(db);
    hospitals.forEach((hospital) => {
      const docRef = doc(db, 'hospitals', hospital.id);
      batch.set(docRef, {
        ...hospital,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    console.log(`✅ [SEED] Seeded ${hospitals.length} hospitals`);
  } catch (error) {
    console.error('❌ [SEED] Error seeding hospitals:', error);
  }
};

/**
 * Seed sample appointments with correct format
 */
const seedSampleAppointments = async () => {
  try {
    console.log('\n📋 [SEED] Seeding sample appointments...');

    // Get current user UID (you need to pass this or use a test UID)
    const testUserId = 'test_user_001';

    const appointments = [
      {
        userId: testUserId,
        doctorId: 'bs001',
        doctor: 'BS. Nguyễn Văn An',
        specialty: 'Tim mạch',
        hospital: 'Bệnh viện Trung ương',
        date: 'T4',
        fullDate: '20/05/2026',
        time: '09:00',
        duration: '30 phút',
        room: 'Phòng 204',
        floor: 'Tầng 2',
        image: 'nguyenvanam.png',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0123456789',
        patientEmail: 'user@email.com',
        patientAddress: '123 Đường ABC, Hà Nội',
        status: 'confirmed',
        appointmentDate: new Date(2026, 4, 20, 9, 0).toISOString(),
      },
      {
        userId: testUserId,
        doctorId: 'bs004',
        doctor: 'BS. Trần Thị Mai',
        specialty: 'Hô hấp',
        hospital: 'Bệnh viện Đại học Trà Vinh',
        date: 'T5',
        fullDate: '21/05/2026',
        time: '14:30',
        duration: '30 phút',
        room: 'Phòng 305',
        floor: 'Tầng 3',
        image: 'tranthimai.png',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0123456789',
        patientEmail: 'user@email.com',
        patientAddress: '123 Đường ABC, Hà Nội',
        status: 'pending',
        appointmentDate: new Date(2026, 4, 21, 14, 30).toISOString(),
      },
    ];

    const batch = writeBatch(db);
    appointments.forEach((appointment, index) => {
      const docRef = doc(collection(db, 'appointments'));
      batch.set(docRef, {
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();
    console.log(`✅ [SEED] Seeded ${appointments.length} sample appointments`);
  } catch (error) {
    console.error('❌ [SEED] Error seeding appointments:', error);
  }
};

/**
 * Clear all data from a collection
 */
export const clearCollection = async (collectionName: string) => {
  try {
    console.log(`🗑️  [SEED] Clearing ${collectionName} collection...`);

    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    console.log(`✅ [SEED] Cleared ${snapshot.size} documents from ${collectionName}`);
  } catch (error) {
    console.error(`❌ [SEED] Error clearing ${collectionName}:`, error);
  }
};

/**
 * Reset all data and reseed with correct format
 */
export const resetAndReseedData = async () => {
  try {
    console.log('🔄 [SEED] Starting reset and reseed...\n');

    // Clear existing data
    await clearCollection('doctors');
    await clearCollection('hospitals');
    await clearCollection('appointments');

    // Seed new data
    await seedCorrectData();

    console.log('\n✅ [SEED] Reset and reseed completed!');
  } catch (error) {
    console.error('❌ [SEED] Error during reset and reseed:', error);
    throw error;
  }
};
