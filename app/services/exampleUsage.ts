// Ví dụ về cách sử dụng Firebase Service

import {
    createDocument,
    deleteDocument,
    getAllDocuments,
    getDocumentById,
    getDocumentsWithQuery,
    updateDocument,
} from '@/app/services/firebaseService';
import { where } from 'firebase/firestore';

// 1. Tạo bác sĩ mới
export const createDoctor = async (doctorData: {
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  experience: number;
}) => {
  return await createDocument('doctors', doctorData);
};

// 2. Lấy tất cả bác sĩ
export const getAllDoctors = async () => {
  return await getAllDocuments('doctors');
};

// 3. Lấy bác sĩ theo ID
export const getDoctorById = async (docId: string) => {
  return await getDocumentById('doctors', docId);
};

// 4. Tìm bác sĩ theo chuyên khoa
export const getDoctorsBySpecialty = async (specialty: string) => {
  return await getDocumentsWithQuery('doctors', [
    where('specialty', '==', specialty),
  ]);
};

// 5. Cập nhật thông tin bác sĩ
export const updateDoctorInfo = async (
  docId: string,
  updates: Record<string, any>
) => {
  return await updateDocument('doctors', docId, updates);
};

// 6. Xóa bác sĩ
export const deleteDoctor = async (docId: string) => {
  return await deleteDocument('doctors', docId);
};

// 7. Tạo bệnh viện mới
export const createHospital = async (hospitalData: {
  name: string;
  address: string;
  phone: string;
  rating: number;
}) => {
  return await createDocument('hospitals', hospitalData);
};

// 8. Tạo lịch hẹn
export const createAppointment = async (appointmentData: {
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
}) => {
  return await createDocument('appointments', appointmentData);
};

// 9. Lấy lịch hẹn của người dùng
export const getUserAppointments = async (userId: string) => {
  return await getDocumentsWithQuery('appointments', [
    where('userId', '==', userId),
  ]);
};

// 10. Tạo hồ sơ y tế
export const createMedicalRecord = async (recordData: {
  userId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  date: string;
}) => {
  return await createDocument('medicalRecords', recordData);
};
