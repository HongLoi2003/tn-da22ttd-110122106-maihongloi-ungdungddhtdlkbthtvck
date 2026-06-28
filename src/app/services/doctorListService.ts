import doctorsData from '../../doctors.json';

export interface doctor {
  id: string;
  ten: string;
  chuyen_khoa: string;
  so_dien_thoai: string;
  kinh_nghiem: number;
  rating: number;
  image: string;
  trang_thai: boolean;
  phi_kham: number;
}

class DoctorListService {
  private doctors: doctor[] = doctorsData as doctor[];

  getAllDoctors(): doctor[] {
    return this.doctors;
  }

  getdoctorsBySpecialty(specialty: string): doctor[] {
    return this.doctors.filter(doctor => doctor.chuyen_khoa === specialty);
  }

  getDoctorById(id: string): doctor | undefined {
    return this.doctors.find(doctor => doctor.id === id);
  }

  getDoctorsByRating(minRating: number): doctor[] {
    return this.doctors.filter(doctor => doctor.rating >= minRating);
  }
}

const doctorListService = new DoctorListService();
export default doctorListService;
