import { createDocument } from '../services/firebaseService';
import appointmentsData from '../../appointments.json';
import commentsData from '../../comments.json';
import conversationsData from '../../conversations.json';
import doctorsData from '../../doctors.json';
import hospitalsData from '../../hospitals.json';
import medicalRecordsData from '../../medical-records.json';
import messagesData from '../../messages.json';
import notificationsData from '../../notifications.json';
import prescriptionsData from '../../prescriptions.json';
import usersData from '../../users.json';

// Dữ liệu chuyên khoa
const specialtiesData = [
  { id: 'tim_mach', name: 'Tim mạch', icon: 'heart', description: 'Chuyên khoa tim mạch' },
  { id: 'da_lieu', name: 'Da liễu', icon: 'water', description: 'Chuyên khoa da liễu' },
  { id: 'nhi_khoa', name: 'Nhi khoa', icon: 'happy', description: 'Chuyên khoa nhi khoa' },
  { id: 'san_phu_khoa', name: 'Sản phụ khoa', icon: 'woman', description: 'Chuyên khoa sản phụ khoa' },
  { id: 'than_kinh', name: 'Thần kinh', icon: 'brain', description: 'Chuyên khoa thần kinh' },
  { id: 'ho_hap', name: 'Hô hấp', icon: 'lung', description: 'Chuyên khoa hô hấp' },
  { id: 'tieu_hoa', name: 'Tiêu hóa', icon: 'nutrition', description: 'Chuyên khoa tiêu hóa' },
  { id: 'co_xuong_khop', name: 'Cơ xương khớp', icon: 'body', description: 'Chuyên khoa cơ xương khớp' },
];

// Dữ liệu chuyên khoa phổ biến
const popularSpecialtiesData = [
  { id: 'pop_1', name: 'Tim mạch', doctors: 12 },
  { id: 'pop_2', name: 'Hô hấp', doctors: 8 },
  { id: 'pop_3', name: 'Thần kinh', doctors: 10 },
  { id: 'pop_4', name: 'Da liễu', doctors: 6 },
];

// Dữ liệu triệu chứng thường gặp
const commonSymptomsData = [
  { id: 'sym_1', name: 'Đau đầu', icon: 'alert-circle', color: '#FF6B6B', description: 'Đau đầu, chóng mặt', specialty: 'Thần kinh' },
  { id: 'sym_2', name: 'Sốt cao', icon: 'thermometer', color: '#FFA500', description: 'Sốt cao trên 38°C', specialty: 'Nội tổng quát' },
  { id: 'sym_3', name: 'Ho khan', icon: 'cloud', color: '#4ECDC4', description: 'Ho khan, khó thở', specialty: 'Hô hấp' },
  { id: 'sym_4', name: 'Đau bụng', icon: 'alert', color: '#FFD93D', description: 'Đau bụng, buồn nôn', specialty: 'Tiêu hóa' },
  { id: 'sym_5', name: 'Đau ngực', icon: 'heart', color: '#FF1744', description: 'Đau ngực, khó thở', specialty: 'Tim mạch' },
  { id: 'sym_6', name: 'Đau khớp', icon: 'body', color: '#9C27B0', description: 'Đau khớp, sưng tấy', specialty: 'Cơ xương khớp' },
];

// Dữ liệu bảo hiểm
const insurancesData = [
  { id: 'ins_1', userId: 'user1', name: 'Bảo hiểm Sức khỏe Toàn diện', provider: 'Bảo Việt', status: 'active', expiryDate: '2025-12-31', coverage: '500 triệu' },
  { id: 'ins_2', userId: 'user1', name: 'Bảo hiểm Sức khỏe Cơ bản', provider: 'AIA', status: 'active', expiryDate: '2025-06-30', coverage: '300 triệu' },
];

// Dữ liệu quyền lợi bảo hiểm
const insuranceBenefitsData = [
  { id: 'ben_1', userId: 'user1', insuranceId: 'ins_1', name: 'Khám bệnh ngoại trú', coverage: '100%', limit: '50 triệu' },
  { id: 'ben_2', userId: 'user1', insuranceId: 'ins_1', name: 'Nằm viện', coverage: '100%', limit: '300 triệu' },
  { id: 'ben_3', userId: 'user1', insuranceId: 'ins_1', name: 'Phẫu thuật', coverage: '100%', limit: '200 triệu' },
];

// Dữ liệu yêu cầu bảo hiểm
const insuranceClaimsData = [
  { id: 'claim_1', userId: 'user1', insuranceId: 'ins_1', date: '2024-01-15', amount: 5000000, status: 'approved', description: 'Khám bệnh' },
  { id: 'claim_2', userId: 'user1', insuranceId: 'ins_1', date: '2024-02-20', amount: 15000000, status: 'pending', description: 'Nằm viện' },
];

// Hàm seed dữ liệu
export const seedFirebaseData = async () => {
  try {
    console.log('Bắt đầu seed dữ liệu...');

    // Thêm bác sĩ
    console.log('Thêm dữ liệu bác sĩ...');
    for (const doctor of doctorsData) {
      await createDocument('doctors', doctor);
    }
    console.log('✓ Đã thêm bác sĩ');

    // Thêm bệnh viện
    console.log('Thêm dữ liệu bệnh viện...');
    for (const hospital of hospitalsData) {
      await createDocument('hospitals', hospital);
    }
    console.log('✓ Đã thêm bệnh viện');

    // Thêm người dùng
    console.log('Thêm dữ liệu người dùng...');
    for (const user of usersData) {
      await createDocument('users', user);
    }
    console.log('✓ Đã thêm người dùng');

    // Thêm lịch khám
    console.log('Thêm dữ liệu lịch khám...');
    for (const appointment of appointmentsData) {
      await createDocument('appointments', appointment);
    }
    console.log('✓ Đã thêm lịch khám');

    // Thêm cuộc hội thoại
    console.log('Thêm dữ liệu cuộc hội thoại...');
    for (const conversation of conversationsData) {
      await createDocument('conversations', conversation);
    }
    console.log('✓ Đã thêm cuộc hội thoại');

    // Thêm tin nhắn
    console.log('Thêm dữ liệu tin nhắn...');
    for (const message of messagesData) {
      await createDocument('messages', message);
    }
    console.log('✓ Đã thêm tin nhắn');

    // Thêm hồ sơ bệnh án
    console.log('Thêm dữ liệu hồ sơ bệnh án...');
    for (const record of medicalRecordsData) {
      await createDocument('medical-records', record);
    }
    console.log('✓ Đã thêm hồ sơ bệnh án');

    // Thêm đơn thuốc
    console.log('Thêm dữ liệu đơn thuốc...');
    for (const prescription of prescriptionsData) {
      await createDocument('prescriptions', prescription);
    }
    console.log('✓ Đã thêm đơn thuốc');

    // Thêm chuyên khoa
    console.log('Thêm dữ liệu chuyên khoa...');
    for (const specialty of specialtiesData) {
      await createDocument('specialties', specialty);
    }
    console.log('✓ Đã thêm chuyên khoa');

    // Thêm chuyên khoa phổ biến
    console.log('Thêm dữ liệu chuyên khoa phổ biến...');
    for (const specialty of popularSpecialtiesData) {
      await createDocument('popular-specialties', specialty);
    }
    console.log('✓ Đã thêm chuyên khoa phổ biến');

    // Thêm triệu chứng thường gặp
    console.log('Thêm dữ liệu triệu chứng thường gặp...');
    for (const symptom of commonSymptomsData) {
      await createDocument('common-symptoms', symptom);
    }
    console.log('✓ Đã thêm triệu chứng thường gặp');

    // Thêm bảo hiểm
    console.log('Thêm dữ liệu bảo hiểm...');
    for (const insurance of insurancesData) {
      await createDocument('insurances', insurance);
    }
    console.log('✓ Đã thêm bảo hiểm');

    // Thêm quyền lợi bảo hiểm
    console.log('Thêm dữ liệu quyền lợi bảo hiểm...');
    for (const benefit of insuranceBenefitsData) {
      await createDocument('insurance-benefits', benefit);
    }
    console.log('✓ Đã thêm quyền lợi bảo hiểm');

    // Thêm yêu cầu bảo hiểm
    console.log('Thêm dữ liệu yêu cầu bảo hiểm...');
    for (const claim of insuranceClaimsData) {
      await createDocument('insurance-claims', claim);
    }
    console.log('✓ Đã thêm yêu cầu bảo hiểm');

    // Thêm thông báo
    console.log('Thêm dữ liệu thông báo...');
    for (const notification of notificationsData) {
      await createDocument('notifications', notification);
    }
    console.log('✓ Đã thêm thông báo');

    // Thêm bình luận
    console.log('Thêm dữ liệu bình luận...');
    for (const comment of commentsData) {
      await createDocument('comments', comment);
    }
    console.log('✓ Đã thêm bình luận');

    console.log('✓ Seed dữ liệu thành công!');
    return true;
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Hàm import riêng lịch khám
export const importAppointments = async () => {
  try {
    console.log('🚀 Bắt đầu import lịch khám...');
    
    let count = 0;
    for (const appointment of appointmentsData) {
      await createDocument('appointments', appointment);
      count++;
    }
    
    console.log(`✅ Import thành công ${count} lịch khám!`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Lỗi khi import lịch khám:', error);
    throw error;
  }
};

// Hàm import riêng thông báo
export const importNotifications = async () => {
  try {
    console.log('🚀 Bắt đầu import thông báo...');
    
    let count = 0;
    for (const notification of notificationsData) {
      await createDocument('notifications', notification);
      count++;
    }
    
    console.log(`✅ Import thành công ${count} thông báo!`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Lỗi khi import thông báo:', error);
    throw error;
  }
};

// Hàm import riêng bình luận
export const importComments = async () => {
  try {
    console.log('🚀 Bắt đầu import bình luận...');
    
    let count = 0;
    for (const comment of commentsData) {
      await createDocument('comments', comment);
      count++;
    }
    
    console.log(`✅ Import thành công ${count} bình luận!`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Lỗi khi import bình luận:', error);
    throw error;
  }
};
