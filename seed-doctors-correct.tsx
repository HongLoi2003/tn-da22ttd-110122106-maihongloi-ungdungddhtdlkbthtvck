import { doc, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './app/config/firebase';

/**
 * Seed lại dữ liệu bác sĩ với encoding UTF-8 đúng
 */

const correctDoctors = [
  {
    id: 'bs001',
    ten: 'Nguyễn Văn An',
    chuyen_khoa: 'Tim mạch',
    rating: 4.9,
    kinh_nghiem: 10,
    image: 'nguyenvanam.png',
    hinh_anh: 'nguyenvanam.png',
  },
  {
    id: 'bs002',
    ten: 'Trần Thị Lan',
    chuyen_khoa: 'Sản phụ khoa',
    rating: 4.8,
    kinh_nghiem: 7,
    image: 'tranthilan.png',
    hinh_anh: 'tranthilan.png',
  },
  {
    id: 'bs003',
    ten: 'Lê Minh Tâm',
    chuyen_khoa: 'Nhi khoa',
    rating: 4.9,
    kinh_nghiem: 5,
    image: 'leminhtam.png',
    hinh_anh: 'leminhtam.png',
  },
  {
    id: 'bs004',
    ten: 'Trần Thị Mai',
    chuyen_khoa: 'Da liễu',
    rating: 4.7,
    kinh_nghiem: 8,
    image: 'tranthimai.png',
    hinh_anh: 'tranthimai.png',
  },
  {
    id: 'bs005',
    ten: 'Đỗ Minh Tuấn',
    chuyen_khoa: 'Mắt',
    rating: 4.8,
    kinh_nghiem: 9,
    image: 'dominhtuan.png',
    hinh_anh: 'dominhtuan.png',
  },
  {
    id: 'bs006',
    ten: 'Vũ Thị Lan',
    chuyen_khoa: 'Răng hàm mặt',
    rating: 4.9,
    kinh_nghiem: 6,
    image: 'vuthilan.png',
    hinh_anh: 'vuthilan.png',
  },
  {
    id: 'bs007',
    ten: 'Nguyễn Thị Hoa',
    chuyen_khoa: 'Cơ xương khớp',
    rating: 4.7,
    kinh_nghiem: 11,
    image: 'nguyenthihoa.png',
    hinh_anh: 'nguyenthihoa.png',
  },
  {
    id: 'bs008',
    ten: 'Hoàng Văn Đức',
    chuyen_khoa: 'Hô hấp',
    rating: 4.8,
    kinh_nghiem: 10,
    image: 'hoangvanduc.png',
    hinh_anh: 'hoangvanduc.png',
  },
  {
    id: 'bs009',
    ten: 'Ngô Thị Hương',
    chuyen_khoa: 'Nội tiết',
    rating: 4.9,
    kinh_nghiem: 8,
    image: 'ngothihuong.png',
    hinh_anh: 'ngothihuong.png',
  },
  {
    id: 'bs010',
    ten: 'Trần Văn Khoa',
    chuyen_khoa: 'Tai mũi họng',
    rating: 4.7,
    kinh_nghiem: 7,
    image: 'tranvankhoa.png',
    hinh_anh: 'tranvankhoa.png',
  },
  {
    id: 'bs011',
    ten: 'Phạm Minh Quân',
    chuyen_khoa: 'Thần kinh',
    rating: 4.8,
    kinh_nghiem: 12,
    image: 'phamminhquan.png',
    hinh_anh: 'phamminhquan.png',
  },
  {
    id: 'bs012',
    ten: 'Lê Thị Hằng',
    chuyen_khoa: 'Tiêu hóa',
    rating: 4.9,
    kinh_nghiem: 9,
    image: 'lethihang.png',
    hinh_anh: 'lethihang.png',
  },
];

async function seedCorrectDoctors() {
  console.log('🌱 Bắt đầu seed dữ liệu bác sĩ với encoding đúng...');
  
  try {
    let count = 0;
    
    for (const doctor of correctDoctors) {
      const docRef = doc(getFirestoreDb(), 'doctors', doctor.id);
      await setDoc(docRef, doctor, { merge: true });
      count++;
      console.log(`✅ Đã cập nhật: ${doctor.id} - ${doctor.ten}`);
    }
    
    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${count} bác sĩ với encoding đúng.`);
    
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  }
}

// Chạy script
seedCorrectDoctors();
