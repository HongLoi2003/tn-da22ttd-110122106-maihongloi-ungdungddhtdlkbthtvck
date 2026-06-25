/**
 * Cập nhật imageHelper.ts để dùng Avatar API
 * Không cần tải ảnh, dùng URL trực tiếp
 * Chạy: node use-avatar-api.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'utils', 'imageHelper.ts');

// Đọc file hiện tại
let content = fs.readFileSync(filePath, 'utf8');

// Mapping avatar mới
const newDoctorImages = `// Map tất cả ảnh bác sĩ - DÙNG AVATAR API
const doctorImages: { [key: string]: any } = {
  // Avatar API - Không cần tải ảnh
  'nguyenvanam.png': { uri: 'https://i.pravatar.cc/150?img=12' },
  'tranthilan.png': { uri: 'https://i.pravatar.cc/150?img=5' },
  'leminhtam.png': { uri: 'https://i.pravatar.cc/150?img=13' },
  'tranthimai.png': { uri: 'https://i.pravatar.cc/150?img=9' },
  'dominhtuan.png': { uri: 'https://i.pravatar.cc/150?img=15' },
  'vuthilan.png': { uri: 'https://i.pravatar.cc/150?img=20' },
  'nguyenthihoa.png': { uri: 'https://i.pravatar.cc/150?img=25' },
  
  // Sử dụng URL từ Avatar API
  'hoangvanduc.png': { uri: 'https://i.pravatar.cc/150?img=68' },
  'ngothihuong.png': { uri: 'https://i.pravatar.cc/150?img=23' },
  'tranvankhoa.png': { uri: 'https://i.pravatar.cc/150?img=51' },
  'phamminhquan.png': { uri: 'https://i.pravatar.cc/150?img=59' },
  'lethihang.png': { uri: 'https://i.pravatar.cc/150?img=45' },
  'nguyenvanhai.png': { uri: 'https://i.pravatar.cc/150?img=60' },
  'dangthithao.jpg': { uri: 'https://i.pravatar.cc/150?img=32' },
  'hesuyen.png': { uri: 'https://i.pravatar.cc/150?img=30' },
};`;

// Tìm và thay thế phần doctorImages
const doctorImagesRegex = /\/\/ Map tất cả ảnh bác sĩ[^}]+\};/s;

if (doctorImagesRegex.test(content)) {
  content = content.replace(doctorImagesRegex, newDoctorImages);
  
  // Ghi lại file
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Đã cập nhật imageHelper.ts');
  console.log('✅ Bác sĩ giờ dùng Avatar API');
  console.log('\n💡 Ưu điểm:');
  console.log('   - Không cần tải ảnh');
  console.log('   - Không tốn dung lượng');
  console.log('   - Build nhanh hơn');
  console.log('\n🚀 Có thể build ngay:');
  console.log('   .\\build-now.ps1');
} else {
  console.error('❌ Không tìm thấy phần doctorImages trong file');
}
