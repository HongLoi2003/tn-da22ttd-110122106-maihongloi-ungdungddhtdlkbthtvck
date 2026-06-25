const fs = require('fs');
const path = require('path');

// Danh sách ảnh bác sĩ cần xóa
const doctorImages = [
  'nguyenvanam.png',
  'tranthilan.png',
  'leminhtam.png',
  'tranthimai.png',
  'lehoangnam.jpg',
  'phamthuha.png',
  'dominhtuan.png',
  'vuthilan.png',
  'hoangvanduc.png',
  'ngothihuong.png',
  'nguyenthihoa.png',
  'tranvankhoa.png',
  'phamminhquan.png',
  'lethihang.png',
  'nguyenvanhai.png',
  'dangthithao.jpg',
];

console.log('🗑️  Đang xóa ảnh bác sĩ local...\n');

const assetsPath = path.join(__dirname, 'assets', 'images');
let deletedCount = 0;

doctorImages.forEach(imageName => {
  const imagePath = path.join(assetsPath, imageName);
  
  if (fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      console.log(`✅ Đã xóa: ${imageName}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ Lỗi xóa ${imageName}: ${error.message}`);
    }
  } else {
    console.log(`⚠️  Không tìm thấy: ${imageName}`);
  }
});

console.log(`\n✅ Hoàn thành! Đã xóa ${deletedCount} ảnh bác sĩ.`);
console.log('\n💡 Lý do xóa:');
console.log('   - Code đã dùng URL thay vì ảnh local');
console.log('   - Các ảnh này gây lỗi compile khi build APK');
console.log('   - Build APK giờ sẽ nhẹ hơn và thành công\n');
