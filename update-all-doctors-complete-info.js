const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Check if already initialized
if (getApps().length === 0) {
  const serviceAccount = require('./serviceAccountKey.json');
  
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// Dữ liệu đầy đủ cho tất cả bác sĩ
const doctorsCompleteInfo = [
  {
    id: "bs002",
    ten: "BS. Trần Thị Lan",
    chuyen_khoa: "Da liễu",
    so_dien_thoai: "0900000002",
    email: "tranthilan@bvtvu.edu.vn",
    kinh_nghiem: 7,
    rating: 4.8,
    image: "tranthilan.png",
    trang_thai: true,
    phi_kham: 300000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa I Da liễu - Đại học Y Dược TP.HCM"
  },
  {
    id: "bs003",
    ten: "BS. Lê Minh Tâm",
    chuyen_khoa: "Sản phụ khoa",
    so_dien_thoai: "0900000003",
    email: "leminhtam@bvtvu.edu.vn",
    kinh_nghiem: 5,
    rating: 4.8,
    image: "leminhtam.png",
    trang_thai: true,
    phi_kham: 400000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa I Sản phụ khoa - Đại học Y Dược Huế"
  },
  {
    id: "bs004",
    ten: "BS. Trần Thị Mai",
    chuyen_khoa: "Hô hấp",
    so_dien_thoai: "0900000004",
    email: "tranthimai@bvtvu.edu.vn",
    kinh_nghiem: 8,
    rating: 4.9,
    image: "tranthimai.png",
    trang_thai: true,
    phi_kham: 250000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Hô hấp - Đại học Y Hà Nội"
  },
  {
    id: "bs005",
    ten: "BS. Lê Hoàng Nam",
    chuyen_khoa: "Hô hấp",
    so_dien_thoai: "0900000005",
    email: "lehoangnam@bvtvu.edu.vn",
    kinh_nghiem: 9,
    rating: 4.9,
    image: "lehoangnam.png",
    trang_thai: true,
    phi_kham: 280000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Hô hấp - Đại học Y Dược TP.HCM"
  },
  {
    id: "bs006",
    ten: "BS. Phạm Thu Hà",
    chuyen_khoa: "Tim mạch",
    so_dien_thoai: "0900000006",
    email: "phamthuha@bvtvu.edu.vn",
    kinh_nghiem: 6,
    rating: 4.9,
    image: "phamthuha.png",
    trang_thai: true,
    phi_kham: 320000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa I Tim mạch - Đại học Y Hà Nội"
  },
  {
    id: "bs007",
    ten: "BS. Đỗ Minh Tuấn",
    chuyen_khoa: "Da liễu",
    so_dien_thoai: "0900000007",
    email: "dominhtuan@bvtvu.edu.vn",
    kinh_nghiem: 12,
    rating: 4.7,
    image: "dominhtuan.png",
    trang_thai: true,
    phi_kham: 350000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Da liễu - Đại học Y Dược TP.HCM"
  },
  {
    id: "bs008",
    ten: "BS. Vũ Thị Lan",
    chuyen_khoa: "Thần kinh",
    so_dien_thoai: "0900000008",
    email: "vuthilan@bvtvu.edu.vn",
    kinh_nghiem: 4,
    rating: 4.8,
    image: "vuthilan.png",
    trang_thai: true,
    phi_kham: 300000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa I Thần kinh - Đại học Y Dược Cần Thơ"
  },
  {
    id: "bs009",
    ten: "BS. Hoàng Văn Đức",
    chuyen_khoa: "Nhi khoa",
    so_dien_thoai: "0900000009",
    email: "hoangvanduc@bvtvu.edu.vn",
    kinh_nghiem: 11,
    rating: 4.9,
    image: "hoangvanduc.png",
    trang_thai: true,
    phi_kham: 280000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Nhi - Đại học Y Hà Nội"
  },
  {
    id: "bs010",
    ten: "BS. Ngô Thị Hương",
    chuyen_khoa: "Tim mạch",
    so_dien_thoai: "0900000010",
    email: "ngothihuong@bvtvu.edu.vn",
    kinh_nghiem: 3,
    rating: 4.8,
    image: "ngothihuong.png",
    trang_thai: true,
    phi_kham: 300000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Đa khoa - Đại học Y Dược TP.HCM"
  },
  {
    id: "bs011",
    ten: "BS. Nguyễn Thị Hoa",
    chuyen_khoa: "Tiêu hóa",
    so_dien_thoai: "0900000011",
    email: "nguyenthihoa@bvtvu.edu.vn",
    kinh_nghiem: 8,
    rating: 4.9,
    image: "nguyenthihoa.png",
    trang_thai: true,
    phi_kham: 300000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Tiêu hóa - Đại học Y Dược Huế"
  },
  {
    id: "bs012",
    ten: "BS. Trần Văn Khoa",
    chuyen_khoa: "Cơ xương khớp",
    so_dien_thoai: "0900000012",
    email: "tranvankhoa@bvtvu.edu.vn",
    kinh_nghiem: 10,
    rating: 4.8,
    image: "tranvankhoa.png",
    trang_thai: true,
    phi_kham: 320000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Cơ xương khớp - Đại học Y Hà Nội"
  },
  {
    id: "bs013",
    ten: "BS. Phạm Minh Quân",
    chuyen_khoa: "Tai mũi họng",
    so_dien_thoai: "0900000013",
    email: "phamminhquan@bvtvu.edu.vn",
    kinh_nghiem: 9,
    rating: 4.9,
    image: "phamminhquan.png",
    trang_thai: true,
    phi_kham: 250000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa I Tai mũi họng - Đại học Y Dược TP.HCM"
  },
  {
    id: "bs014",
    ten: "BS. Lê Thị Hằng",
    chuyen_khoa: "Mắt",
    so_dien_thoai: "0900000014",
    email: "lethihang@bvtvu.edu.vn",
    kinh_nghiem: 12,
    rating: 4.9,
    image: "lethihang.png",
    trang_thai: true,
    phi_kham: 280000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Nhãn khoa - Đại học Y Dược Cần Thơ"
  },
  {
    id: "bs015",
    ten: "BS. Nguyễn Văn Hải",
    chuyen_khoa: "Răng hàm mặt",
    so_dien_thoai: "0900000015",
    email: "nguyenvanhai@bvtvu.edu.vn",
    kinh_nghiem: 8,
    rating: 4.8,
    image: "nguyenvanhai.png",
    trang_thai: true,
    phi_kham: 350000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Răng hàm mặt - Đại học Y Dược TP.HCM"
  },
  {
    id: "bs016",
    ten: "BS. Đặng Thị Thảo",
    chuyen_khoa: "Nội tiết",
    so_dien_thoai: "0900000016",
    email: "dangthithao@bvtvu.edu.vn",
    kinh_nghiem: 11,
    rating: 4.9,
    image: "dangthithao.jpg",
    trang_thai: true,
    phi_kham: 300000,
    benh_vien: "Bệnh viện Trường Đại học Trà Vinh",
    hoc_van: "Bác sĩ Chuyên khoa II Nội tiết - Đại học Y Hà Nội"
  }
];

async function updateAllDoctorsInfo() {
  console.log('🚀 Bắt đầu cập nhật thông tin đầy đủ cho tất cả bác sĩ...\n');

  let successCount = 0;
  let failCount = 0;

  for (const doctor of doctorsCompleteInfo) {
    try {
      console.log(`📝 Đang cập nhật ${doctor.ten} (${doctor.id})...`);
      
      await db.collection('doctors').doc(doctor.id).set(doctor, { merge: true });
      
      console.log(`✅ Đã cập nhật thành công: ${doctor.ten}`);
      console.log(`   - Email: ${doctor.email}`);
      console.log(`   - Bệnh viện: ${doctor.benh_vien}`);
      console.log(`   - Học vấn: ${doctor.hoc_van}`);
      console.log(`   - Phí khám: ${doctor.phi_kham.toLocaleString('vi-VN')}đ\n`);
      
      successCount++;
    } catch (error) {
      console.error(`❌ Lỗi khi cập nhật ${doctor.ten}:`, error.message);
      failCount++;
    }
  }

  console.log('\n📊 KẾT QUẢ CẬP NHẬT:');
  console.log(`✅ Thành công: ${successCount}/${doctorsCompleteInfo.length}`);
  console.log(`❌ Thất bại: ${failCount}/${doctorsCompleteInfo.length}`);
  
  if (successCount === doctorsCompleteInfo.length) {
    console.log('\n🎉 ĐÃ CẬP NHẬT THÔNG TIN ĐẦY ĐỦ CHO TẤT CẢ BÁC SĨ!');
  }
}

// Chạy script
updateAllDoctorsInfo()
  .then(() => {
    console.log('\n✨ Hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  });
