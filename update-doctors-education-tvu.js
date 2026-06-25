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

// Dữ liệu học vấn mới - tất cả tốt nghiệp từ Đại học Trà Vinh
const doctorsEducation = [
  {
    id: "bs002",
    hoc_van: "Bác sĩ Chuyên khoa I Da liễu - Đại học Trà Vinh"
  },
  {
    id: "bs003",
    hoc_van: "Bác sĩ Chuyên khoa I Sản phụ khoa - Đại học Trà Vinh"
  },
  {
    id: "bs004",
    hoc_van: "Bác sĩ Chuyên khoa II Hô hấp - Đại học Trà Vinh"
  },
  {
    id: "bs005",
    hoc_van: "Bác sĩ Chuyên khoa II Hô hấp - Đại học Trà Vinh"
  },
  {
    id: "bs006",
    hoc_van: "Bác sĩ Chuyên khoa I Tim mạch - Đại học Trà Vinh"
  },
  {
    id: "bs007",
    hoc_van: "Bác sĩ Chuyên khoa II Da liễu - Đại học Trà Vinh"
  },
  {
    id: "bs008",
    hoc_van: "Bác sĩ Chuyên khoa I Thần kinh - Đại học Trà Vinh"
  },
  {
    id: "bs009",
    hoc_van: "Bác sĩ Chuyên khoa II Nhi - Đại học Trà Vinh"
  },
  {
    id: "bs010",
    hoc_van: "Bác sĩ Đa khoa - Đại học Trà Vinh"
  },
  {
    id: "bs011",
    hoc_van: "Bác sĩ Chuyên khoa II Tiêu hóa - Đại học Trà Vinh"
  },
  {
    id: "bs012",
    hoc_van: "Bác sĩ Chuyên khoa II Cơ xương khớp - Đại học Trà Vinh"
  },
  {
    id: "bs013",
    hoc_van: "Bác sĩ Chuyên khoa I Tai mũi họng - Đại học Trà Vinh"
  },
  {
    id: "bs014",
    hoc_van: "Bác sĩ Chuyên khoa II Nhãn khoa - Đại học Trà Vinh"
  },
  {
    id: "bs015",
    hoc_van: "Bác sĩ Răng hàm mặt - Đại học Trà Vinh"
  },
  {
    id: "bs016",
    hoc_van: "Bác sĩ Chuyên khoa II Nội tiết - Đại học Trà Vinh"
  }
];

async function updateDoctorsEducation() {
  console.log('🚀 Bắt đầu cập nhật học vấn cho tất cả bác sĩ...\n');

  let successCount = 0;
  let failCount = 0;

  for (const doctor of doctorsEducation) {
    try {
      console.log(`📝 Đang cập nhật học vấn cho bác sĩ ${doctor.id}...`);
      
      await db.collection('doctors').doc(doctor.id).update({
        hoc_van: doctor.hoc_van
      });
      
      console.log(`✅ Đã cập nhật: ${doctor.hoc_van}\n`);
      
      successCount++;
    } catch (error) {
      console.error(`❌ Lỗi khi cập nhật ${doctor.id}:`, error.message);
      failCount++;
    }
  }

  console.log('\n📊 KẾT QUẢ CẬP NHẬT:');
  console.log(`✅ Thành công: ${successCount}/${doctorsEducation.length}`);
  console.log(`❌ Thất bại: ${failCount}/${doctorsEducation.length}`);
  
  if (successCount === doctorsEducation.length) {
    console.log('\n🎉 ĐÃ CẬP NHẬT HỌC VẤN CHO TẤT CẢ BÁC SĨ!');
    console.log('📚 Tất cả bác sĩ giờ tốt nghiệp từ Đại học Trà Vinh');
  }
}

// Chạy script
updateDoctorsEducation()
  .then(() => {
    console.log('\n✨ Hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  });
