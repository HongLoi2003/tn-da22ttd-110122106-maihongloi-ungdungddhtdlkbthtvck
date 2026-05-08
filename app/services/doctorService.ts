import doctorsData from '@/doctors.json';

export interface Doctor {
  id: string;
  ten: string;
  chuyen_khoa: string;
  so_dien_thoai: string;
  kinh_nghiem: number;
  rating: number;
  image: string;
  trang_thai: boolean;
}

class DoctorService {
  private doctors: Doctor[] = doctorsData;

  /**
   * Lấy danh sách bác sĩ theo chuyên khoa
   */
  getDoctorsBySpecialty(specialty: string): Doctor[] {
    console.log('🔍 [DOCTOR_SERVICE] Getting doctors for specialty:', specialty);
    const filtered = this.doctors.filter(
      doctor => doctor.chuyen_khoa === specialty && doctor.trang_thai
    );
    console.log('✅ [DOCTOR_SERVICE] Found doctors:', filtered.length);
    return filtered.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Lấy bác sĩ theo ID
   */
  getDoctorById(id: string): Doctor | undefined {
    return this.doctors.find(doctor => doctor.id === id);
  }

  /**
   * Lấy tất cả bác sĩ
   */
  getAllDoctors(): Doctor[] {
    return this.doctors.filter(doctor => doctor.trang_thai);
  }

  /**
   * Tìm kiếm bác sĩ theo tên
   */
  searchDoctors(keyword: string): Doctor[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.doctors.filter(
      doctor =>
        doctor.ten.toLowerCase().includes(lowerKeyword) &&
        doctor.trang_thai
    );
  }
}

export default new DoctorService();
